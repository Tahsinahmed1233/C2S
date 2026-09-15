<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'stats';

switch ($action) {
    case 'stats':
        // --- Summary metrics from inspections table (current month) ---
        $summaryResult = $conn->query(
            "SELECT
                COUNT(*) as total_inspected,
                COALESCE(SUM(defects_found), 0) as total_rejected,
                ROUND(AVG(pass_rate), 1) as overall_pass_rate
             FROM inspections
             WHERE MONTH(inspection_date) = MONTH(CURDATE())
               AND YEAR(inspection_date) = YEAR(CURDATE())"
        );
        $summary = $summaryResult->fetch_assoc();

        // Average resolve time: avg hours between inspection_date and safety resolution (approximate using inspections)
        $resolveResult = $conn->query(
            "SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR, i.created_at, IFNULL(NOW(), i.created_at))), 0) as avg_hours
             FROM inspections i WHERE i.status = 'Accepted' LIMIT 1"
        );
        $resolveRow = $resolveResult ? $resolveResult->fetch_assoc() : [];

        // --- Defect breakdown by category (last 30 days) ---
        $defectResult = $conn->query(
            "SELECT id.defect_category as category, SUM(id.defect_count) as total
             FROM inspection_defects id
             JOIN inspections i ON id.inspection_id = i.id
             WHERE i.inspection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
             GROUP BY id.defect_category
             ORDER BY total DESC"
        );
        $defectRows = [];
        $defectTotal = 0;

        if ($defectResult) {
            while ($row = $defectResult->fetch_assoc()) {
                $defectRows[] = $row;
                $defectTotal += (int)$row['total'];
            }
        }

        // Convert to percentage
        $defectBreakdown = [];
        foreach ($defectRows as $row) {
            $defectBreakdown[] = [
                'category'   => $row['category'],
                'percentage' => $defectTotal > 0
                    ? round(($row['total'] / $defectTotal) * 100, 1)
                    : 0,
            ];
        }

        // --- Pass/Fail trends by month (last 6 months) ---
        $trendResult = $conn->query(
            "SELECT
                DATE_FORMAT(inspection_date, '%b') as month,
                ROUND(AVG(pass_rate), 1) as pass_rate,
                ROUND(100 - AVG(pass_rate), 1) as fail_rate
             FROM inspections
             WHERE inspection_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY YEAR(inspection_date), MONTH(inspection_date)
             ORDER BY YEAR(inspection_date) ASC, MONTH(inspection_date) ASC"
        );
        $passFailTrends = [];
        if ($trendResult) {
            while ($row = $trendResult->fetch_assoc()) {
                $passFailTrends[] = [
                    'month' => $row['month'],
                    'pass'  => (float)$row['pass_rate'],
                    'fail'  => (float)$row['fail_rate'],
                ];
            }
        }

        sendJsonResponse([
            'success' => true,
            'data' => [
                'summary' => [
                    'avg_resolve_time_hours'  => (int)($resolveRow['avg_hours'] ?? 0),
                    'overall_pass_rate'       => (float)($summary['overall_pass_rate'] ?? 0),
                    'total_inspected_month'   => (int)($summary['total_inspected'] ?? 0),
                    'total_rejected_month'    => (int)($summary['total_rejected'] ?? 0),
                ],
                'defect_breakdown' => $defectBreakdown,
                'pass_fail_trends' => $passFailTrends,
            ]
        ]);
        break;

    case 'inspections':
        $query = "SELECT i.*, p.product_name, pl.line_name, w.full_name as inspector_name
                  FROM inspections i
                  LEFT JOIN products p ON i.product_id = p.id
                  LEFT JOIN production_lines pl ON i.line_id = pl.id
                  LEFT JOIN workers w ON i.inspector_id = w.id
                  ORDER BY i.inspection_date DESC LIMIT 50";
        $result = $conn->query($query);
        $inspections = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $inspections[] = $row;
            }
        }

        sendJsonResponse([
            'success' => true,
            'data'    => $inspections
        ]);
        break;

    case 'create_inspection':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['product_id']) || empty($input['batch_number'])) {
            sendJsonResponse(['success' => false, 'message' => 'product_id and batch_number are required'], 400);
        }

        $batch   = $input['batch_number'];
        $prodId  = (int)$input['product_id'];
        $lineId  = (int)($input['line_id'] ?? 1);
        $inspId  = (int)($input['inspector_id'] ?? 1);
        $sample  = (int)($input['sample_size'] ?? 200);
        $defects = (int)($input['defects_found'] ?? 0);
        $status  = $defects > ($sample * 0.03) ? 'Rejected' : 'Accepted';
        $passRate = round((($sample - $defects) / $sample) * 100, 2);
        $date    = date('Y-m-d');
        $notes   = $input['notes'] ?? '';

        $stmt = $conn->prepare(
            "INSERT INTO inspections (batch_number, product_id, line_id, inspector_id, inspection_date, sample_size, defects_found, pass_rate, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("siiisiddss", $batch, $prodId, $lineId, $inspId, $date, $sample, $defects, $passRate, $status, $notes);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Inspection logged', 'inspection_id' => $stmt->insert_id, 'status' => $status]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to save inspection: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

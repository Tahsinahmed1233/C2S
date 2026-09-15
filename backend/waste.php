<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'stats';

switch ($action) {
    case 'stats':
        $query = "SELECT wr.*, pl.line_name 
                  FROM waste_records wr 
                  LEFT JOIN production_lines pl ON wr.line_id = pl.id 
                  ORDER BY wr.date DESC LIMIT 50";
        $result = $conn->query($query);
        $records = [];
        $totalKg = 0;
        $totalCost = 0;

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $records[] = $row;
                $totalKg += (float)$row['quantity_kg'];
                $totalCost += (float)$row['cost_usd'];
            }
        }

        // Summary metrics
        sendJsonResponse([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_waste_kg' => round($totalKg, 2),
                    'total_cost_usd' => round($totalCost, 2),
                    'recycling_rate_pct' => 68.4,
                    'fabric_utilization_pct' => 89.2
                ],
                'records' => $records
            ]
        ]);
        break;

    case 'add_waste':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['quantity_kg']) || empty($input['waste_type'])) {
            sendJsonResponse(['success' => false, 'message' => 'quantity_kg and waste_type are required'], 400);
        }

        $lineId = (int)($input['line_id'] ?? 1);
        $wasteType = $input['waste_type'];
        $qty = (float)$input['quantity_kg'];
        $cost = (float)($input['cost_usd'] ?? ($qty * 4.0)); // Default $4/kg scrap value
        $date = $input['date'] ?? date('Y-m-d');
        $reason = $input['reason'] ?? 'Edge trim scrap';

        $stmt = $conn->prepare("INSERT INTO waste_records (line_id, waste_type, quantity_kg, cost_usd, date, reason) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isddss", $lineId, $wasteType, $qty, $cost, $date, $reason);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Waste log created', 'waste_id' => $stmt->insert_id]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to record waste: ' . $conn->error], 500);
        }
        break;

    case 'apply_pattern':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['pattern_code'])) {
            sendJsonResponse(['success' => false, 'message' => 'pattern_code is required'], 400);
        }

        $code = $input['pattern_code'];
        $fabric = $input['fabric_type'] ?? 'Denim 12oz';
        $yield = (float)($input['nesting_yield_projected'] ?? 94.5);
        $reduction = (float)($input['estimated_waste_reduction_kg'] ?? 35.0);
        $date = date('Y-m-d');

        $stmt = $conn->prepare("INSERT INTO pattern_optimizations (pattern_code, fabric_type, nesting_yield_projected, estimated_waste_reduction_kg, status, applied_date) 
                                VALUES (?, ?, ?, ?, 'active_on_line', ?)");
        $stmt->bind_param("ssdds", $code, $fabric, $yield, $reduction, $date);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'New nesting pattern applied successfully', 'pattern_id' => $stmt->insert_id]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to apply pattern: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

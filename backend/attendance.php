<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $date = $_GET['date'] ?? date('Y-m-d');
        $shift = $_GET['shift'] ?? 'all';

        $query = "SELECT a.*, w.full_name, w.employee_id, w.department, pl.line_name 
                  FROM attendance a
                  JOIN workers w ON a.worker_id = w.id
                  LEFT JOIN production_lines pl ON w.current_line_id = pl.id
                  WHERE a.date = ?";

        $params = [$date];
        $types = "s";

        if ($shift !== 'all') {
            $query .= " AND a.shift = ?";
            $params[] = $shift;
            $types .= "s";
        }

        $query .= " ORDER BY a.check_in ASC";

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $records = [];

        $presentCount = 0;
        $absentCount = 0;
        $lateCount = 0;

        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
            if ($row['status'] === 'present') $presentCount++;
            elseif ($row['status'] === 'absent') $absentCount++;
            elseif ($row['status'] === 'late') $lateCount++;
        }

        $totalMarked = count($records);
        $rate = $totalMarked > 0 ? round(($presentCount / $totalMarked) * 100, 1) : 95.0;

        sendJsonResponse([
            'success' => true,
            'data' => [
                'summary' => [
                    'date' => $date,
                    'shift' => $shift,
                    'total_marked' => $totalMarked,
                    'present' => $presentCount,
                    'absent' => $absentCount,
                    'late' => $lateCount,
                    'attendance_rate' => $rate
                ],
                'records' => $records
            ]
        ]);
        break;

    case 'availability':
        $lineId = isset($_GET['line_id']) ? (int)$_GET['line_id'] : null;

        $linesQuery = "SELECT pl.id, pl.line_name, pl.capacity, pl.current_workers,
                       COUNT(a.id) as active_present
                       FROM production_lines pl
                       LEFT JOIN workers w ON w.current_line_id = pl.id
                       LEFT JOIN attendance a ON a.worker_id = w.id AND a.date = CURDATE() AND a.status = 'present'
                       GROUP BY pl.id";

        $linesResult = $conn->query($linesQuery);
        $matrix = [];

        if ($linesResult) {
            while ($row = $linesResult->fetch_assoc()) {
                $cap = (int)$row['capacity'];
                $pres = (int)$row['active_present'];
                $matrix[] = [
                    'line_id' => $row['id'],
                    'line_name' => $row['line_name'],
                    'capacity' => $cap,
                    'present_workers' => $pres,
                    'shortage' => max(0, $cap - $pres),
                    'coverage_pct' => $cap > 0 ? round(($pres / $cap) * 100, 1) : 100,
                    'status' => $pres >= $cap ? 'Full Coverage' : ($pres >= $cap * 0.8 ? 'Adequate' : 'Critical Shortage')
                ];
            }
        }

        sendJsonResponse([
            'success' => true,
            'data' => $matrix
        ]);
        break;

    case 'mark':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['worker_id'])) {
            sendJsonResponse(['success' => false, 'message' => 'worker_id is required'], 400);
        }

        $workerId = (int)$input['worker_id'];
        $date = $input['date'] ?? date('Y-m-d');
        $shift = $input['shift'] ?? 'morning';
        $status = $input['status'] ?? 'present';
        $checkIn = $input['check_in'] ?? date('H:i:s');
        $checkOut = $input['check_out'] ?? null;

        $stmt = $conn->prepare("INSERT INTO attendance (worker_id, date, shift, status, check_in, check_out) 
                                VALUES (?, ?, ?, ?, ?, ?) 
                                ON DUPLICATE KEY UPDATE status = VALUES(status), check_out = VALUES(check_out)");
        $stmt->bind_param("isssss", $workerId, $date, $shift, $status, $checkIn, $checkOut);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Attendance logged']);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to log attendance: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

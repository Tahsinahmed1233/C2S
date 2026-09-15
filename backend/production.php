<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'lines';

switch ($action) {
    case 'lines':
        $query = "SELECT pl.*, w.full_name as supervisor_name,
                  (SELECT COUNT(*) FROM workers w2 WHERE w2.current_line_id = pl.id) as actual_workers
                  FROM production_lines pl
                  LEFT JOIN workers w ON pl.supervisor_id = w.id
                  ORDER BY pl.id ASC";

        $result = $conn->query($query);
        $lines = [];

        while ($row = $result->fetch_assoc()) {
            $lines[] = $row;
        }

        sendJsonResponse([
            'success' => true,
            'data' => $lines
        ]);
        break;

    case 'create_line':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['line_name']) || empty($input['line_type'])) {
            sendJsonResponse(['success' => false, 'message' => 'line_name and line_type are required'], 400);
        }

        $lineName = $input['line_name'];
        $lineType = $input['line_type'];
        $capacity = (int)($input['capacity'] ?? 50);
        $supervisorId = !empty($input['supervisor_id']) ? (int)$input['supervisor_id'] : null;
        $status = $input['status'] ?? 'active';

        $stmt = $conn->prepare("INSERT INTO production_lines (line_name, line_type, capacity, supervisor_id, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssiis", $lineName, $lineType, $capacity, $supervisorId, $status);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Production line created', 'line_id' => $stmt->insert_id]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to create line: ' . $conn->error], 500);
        }
        break;

    case 'stats':
        $totalLinesQuery = "SELECT 
            COUNT(*) as total_lines,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_lines,
            SUM(capacity) as total_capacity,
            SUM(current_workers) as total_operators
            FROM production_lines";
        $stats = $conn->query($totalLinesQuery)->fetch_assoc();

        sendJsonResponse([
            'success' => true,
            'data' => $stats
        ]);
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

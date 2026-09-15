<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'queue';

switch ($action) {
    case 'queue':
        $query = "SELECT js.*, o.order_number, o.client_name, p.product_name, p.product_code, pl.line_name
                  FROM job_sequences js
                  JOIN orders o ON js.order_id = o.id
                  JOIN products p ON js.product_id = p.id
                  JOIN production_lines pl ON js.line_id = pl.id
                  ORDER BY js.sequence_order ASC, js.due_date ASC";
        $result = $conn->query($query);
        $queue = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $queue[] = $row;
            }
        }

        sendJsonResponse([
            'success' => true,
            'data'    => $queue
        ]);
        break;

    case 'add_job':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['quantity'])) {
            sendJsonResponse(['success' => false, 'message' => 'quantity is required'], 400);
        }

        $orderId   = (int)($input['order_id'] ?? 1);
        $prodId    = (int)($input['product_id'] ?? 1);
        $lineId    = (int)($input['line_id'] ?? 1);
        $qty       = (int)$input['quantity'];
        $priority  = $input['priority'] ?? 'Medium';
        $startDate = $input['start_date'] ?? date('Y-m-d');
        $dueDate   = $input['due_date'] ?? date('Y-m-d', strtotime('+7 days'));

        $stmt = $conn->prepare(
            "INSERT INTO job_sequences (order_id, product_id, line_id, quantity, priority, start_date, due_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'queued')"
        );
        $stmt->bind_param("iiiisss", $orderId, $prodId, $lineId, $qty, $priority, $startDate, $dueDate);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Job scheduled into sequence', 'job_id' => $stmt->insert_id]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to schedule job: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

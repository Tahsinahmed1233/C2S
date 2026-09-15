<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $query = "SELECT m.*, pl.line_name,
                  (SELECT COUNT(*) FROM work_orders wo WHERE wo.machine_id = m.id AND wo.status != 'completed') as active_work_orders
                  FROM machines m
                  LEFT JOIN production_lines pl ON m.line_id = pl.id
                  ORDER BY m.health_index ASC, m.id ASC";
        $result = $conn->query($query);
        $machines = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $machines[] = $row;
            }
        }

        // Compute summary from actual DB results
        $total       = count($machines);
        $operational = 0;
        $maintenance = 0;
        $broken      = 0;
        $healthSum   = 0;

        foreach ($machines as $m) {
            if ($m['status'] === 'operational') $operational++;
            elseif ($m['status'] === 'maintenance') $maintenance++;
            elseif ($m['status'] === 'broken') $broken++;
            $healthSum += (int)$m['health_index'];
        }

        $avgHealth = $total > 0 ? round($healthSum / $total, 1) : 0;

        sendJsonResponse([
            'success' => true,
            'data' => [
                'summary' => [
                    'total_machines'      => $total,
                    'operational'         => $operational,
                    'in_maintenance'      => $maintenance,
                    'broken'              => $broken,
                    'overall_fleet_health' => $avgHealth,
                ],
                'machines' => $machines
            ]
        ]);
        break;

    case 'create_work_order':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['machine_id']) || empty($input['description'])) {
            sendJsonResponse(['success' => false, 'message' => 'machine_id and description are required'], 400);
        }

        $code      = 'WO-' . date('Ymd') . '-' . rand(100, 999);
        $machineId = (int)$input['machine_id'];
        $type      = $input['maintenance_type'] ?? 'Preventive';
        $desc      = $input['description'];
        $cost      = (float)($input['cost'] ?? 100.0);
        $techId    = !empty($input['technician_id']) ? (int)$input['technician_id'] : null;
        $schedDate = $input['scheduled_date'] ?? date('Y-m-d', strtotime('+3 days'));

        $stmt = $conn->prepare(
            "INSERT INTO work_orders (order_code, machine_id, maintenance_type, description, cost, technician_id, scheduled_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')"
        );
        $stmt->bind_param("sissdis", $code, $machineId, $type, $desc, $cost, $techId, $schedDate);

        if ($stmt->execute()) {
            // Update machine status if emergency breakdown
            if ($type === 'Emergency Breakdown') {
                $upd = $conn->prepare("UPDATE machines SET status = 'maintenance' WHERE id = ?");
                $upd->bind_param("i", $machineId);
                $upd->execute();
            }
            sendJsonResponse(['success' => true, 'message' => 'Work order generated', 'order_code' => $code]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to create work order: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

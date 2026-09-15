<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = ($page - 1) * $limit;
        $department = $_GET['department'] ?? '';
        $search = $_GET['search'] ?? '';

        $query = "SELECT w.*, u.email, pl.line_name 
                  FROM workers w 
                  LEFT JOIN users u ON w.user_id = u.id 
                  LEFT JOIN production_lines pl ON w.current_line_id = pl.id 
                  WHERE 1=1";

        $params = [];
        $types = "";

        if (!empty($department)) {
            $query .= " AND w.department = ?";
            $params[] = $department;
            $types .= "s";
        }

        if (!empty($search)) {
            $query .= " AND (w.full_name LIKE ? OR w.employee_id LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= "ss";
        }

        $query .= " ORDER BY w.id DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= "ii";

        $stmt = $conn->prepare($query);
        if ($params) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $workers = [];

        while ($row = $result->fetch_assoc()) {
            $workers[] = $row;
        }

        // Count total
        $countQuery = "SELECT COUNT(*) as total FROM workers WHERE 1=1";
        if (!empty($department)) {
            $countQuery .= " AND department = '" . $conn->real_escape_string($department) . "'";
        }
        $countResult = $conn->query($countQuery);
        $total = $countResult ? (int)$countResult->fetch_assoc()['total'] : count($workers);

        sendJsonResponse([
            'success' => true,
            'data' => $workers,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        break;

    case 'assign_training':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['worker_id']) || empty($input['training_module'])) {
            sendJsonResponse(['success' => false, 'message' => 'worker_id and training_module are required'], 400);
        }

        $workerId = (int)$input['worker_id'];
        $module = $input['training_module'];
        $supervisorId = (int)($input['supervisor_id'] ?? 1);
        $startDate = $input['start_date'] ?? date('Y-m-d');
        $targetDate = $input['target_completion_date'] ?? date('Y-m-d', strtotime('+14 days'));
        $notes = $input['notes'] ?? '';

        $stmt = $conn->prepare("INSERT INTO training_assignments (worker_id, training_module, supervisor_id, start_date, target_completion_date, notes) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isisss", $workerId, $module, $supervisorId, $startDate, $targetDate, $notes);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Training assigned successfully', 'training_id' => $stmt->insert_id]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to assign training: ' . $conn->error], 500);
        }
        break;

    case 'award_recognition':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['worker_id']) || empty($input['title'])) {
            sendJsonResponse(['success' => false, 'message' => 'worker_id and title are required'], 400);
        }

        $workerId = (int)$input['worker_id'];
        $rewardType = $input['reward_type'] ?? 'bonus';
        $title = $input['title'];
        $description = $input['description'] ?? '';
        $bonusAmount = (float)($input['bonus_amount'] ?? 0.0);
        $awardedBy = (int)($input['awarded_by'] ?? 1);
        $date = date('Y-m-d');

        $stmt = $conn->prepare("INSERT INTO worker_rewards (worker_id, reward_type, title, description, bonus_amount, awarded_date, awarded_by) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssdsi", $workerId, $rewardType, $title, $description, $bonusAmount, $date, $awardedBy);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Reward conferred successfully', 'reward_id' => $stmt->insert_id]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to award reward: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

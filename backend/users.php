<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'add':
        addUser($conn);
        break;
    case 'list':
        getUsers($conn);
        break;
    case 'update':
        updateUser($conn);
        break;
    case 'delete':
        deleteUser($conn);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function addUser($conn)
{
    $data = json_decode(file_get_contents('php://input'), true);

    $full_name = $data['full_name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'worker';
    $phone = $data['phone'] ?? '';
    $employee_id = $data['employee_id'] ?? '';

    // Validate required fields
    if (empty($full_name) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Full name, email, and password are required']);
        return;
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        $stmt->close();
        return;
    }
    $stmt->close();

    // Insert new user (using only fields that exist in the database)
    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $full_name, $email, $password, $role);

    if ($stmt->execute()) {
        $user_id = $conn->insert_id;

        // If employee_id is provided, create a worker record
        if (!empty($employee_id)) {
            $worker_stmt = $conn->prepare("INSERT INTO workers (user_id, employee_id, full_name, status) VALUES (?, ?, ?, 'active')");
            $worker_stmt->bind_param("iss", $user_id, $employee_id, $full_name);
            $worker_stmt->execute();
            $worker_stmt->close();
        }

        echo json_encode([
            'success' => true,
            'message' => 'User added successfully',
            'user_id' => $user_id
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add user: ' . $conn->error]);
    }

    $stmt->close();
}

function getUsers($conn)
{
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;

    $search = isset($_GET['search']) ? $conn->real_escape_string($_GET['search']) : '';
    $role_filter = isset($_GET['role']) ? $conn->real_escape_string($_GET['role']) : '';

    $where = 'WHERE 1=1';
    if ($search) {
        $where .= " AND (u.full_name LIKE '%$search%' OR u.email LIKE '%$search%')";
    }
    if ($role_filter) {
        $where .= " AND u.role = '$role_filter'";
    }

    // Get total count
    $count_query = "SELECT COUNT(*) as total FROM users u $where";
    $result = $conn->query($count_query);
    $total = $result->fetch_assoc()['total'];

    // Get users with worker information
    $query = "SELECT u.id, u.full_name, u.email, u.role, u.created_at, w.employee_id, w.status as worker_status 
              FROM users u 
              LEFT JOIN workers w ON u.id = w.user_id 
              $where ORDER BY u.created_at DESC LIMIT $limit OFFSET $offset";
    $result = $conn->query($query);

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $users,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

function updateUser($conn)
{
    $data = json_decode(file_get_contents('php://input'), true);

    $id = $data['id'] ?? 0;
    $full_name = $data['full_name'] ?? '';
    $email = $data['email'] ?? '';
    $role = $data['role'] ?? 'worker';
    $phone = $data['phone'] ?? '';
    $employee_id = $data['employee_id'] ?? '';
    $status = $data['status'] ?? 'active';

    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        $stmt->close();
        return;
    }
    $stmt->close();

    // Check if email already exists for another user
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->bind_param("si", $email, $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        $stmt->close();
        return;
    }
    $stmt->close();

    // Update user (only columns that exist on the users table)
    $stmt = $conn->prepare("UPDATE users SET full_name = ?, email = ?, role = ?, phone = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $full_name, $email, $role, $phone, $id);

    if ($stmt->execute()) {
        // If employee_id or status provided, update the linked worker record too
        if (!empty($employee_id) || !empty($status)) {
            $workerFields = [];
            $workerTypes  = '';
            $workerParams = [];

            if (!empty($employee_id)) {
                $workerFields[] = 'employee_id = ?';
                $workerTypes   .= 's';
                $workerParams[] = $employee_id;
            }
            if (!empty($status)) {
                $workerFields[] = 'status = ?';
                $workerTypes   .= 's';
                $workerParams[] = $status;
            }

            if (!empty($workerFields)) {
                $workerTypes   .= 'i';
                $workerParams[] = $id;
                $wStmt = $conn->prepare(
                    "UPDATE workers SET " . implode(', ', $workerFields) . " WHERE user_id = ?"
                );
                $wStmt->bind_param($workerTypes, ...$workerParams);
                $wStmt->execute();
                $wStmt->close();
            }
        }
        echo json_encode(['success' => true, 'message' => 'User updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update user: ' . $conn->error]);
    }

    $stmt->close();
}

function deleteUser($conn)
{
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;

    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        $stmt->close();
        return;
    }
    $stmt->close();

    // Delete user
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete user: ' . $conn->error]);
    }

    $stmt->close();
}

$conn->close();

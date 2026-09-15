<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'channels';

switch ($action) {
    case 'channels':
        // Return all chat channels with last message preview
        $query = "SELECT cc.*,
                  (SELECT cm.message FROM chat_messages cm WHERE cm.channel_id = cc.id ORDER BY cm.created_at DESC LIMIT 1) as last_message,
                  (SELECT DATE_FORMAT(cm2.created_at, '%H:%i') FROM chat_messages cm2 WHERE cm2.channel_id = cc.id ORDER BY cm2.created_at DESC LIMIT 1) as last_message_time,
                  (SELECT COUNT(*) FROM chat_messages cm3 WHERE cm3.channel_id = cc.id) as message_count
                  FROM chat_channels cc
                  ORDER BY cc.id ASC";
        $result = $conn->query($query);
        $channels = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $channels[] = [
                    'id'           => $row['id'],
                    'name'         => '# ' . $row['name'],
                    'description'  => $row['description'],
                    'is_private'   => (bool)$row['is_private'],
                    'unread'       => 0, // unread tracking requires per-user read state
                    'last_message' => $row['last_message'] ?? '',
                    'time'         => $row['last_message_time'] ?? '',
                ];
            }
        }

        sendJsonResponse([
            'success' => true,
            'data'    => $channels
        ]);
        break;

    case 'messages':
        $channelId = isset($_GET['channel_id']) ? (int)$_GET['channel_id'] : 0;
        $limit     = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

        if ($channelId <= 0) {
            sendJsonResponse(['success' => false, 'message' => 'channel_id is required'], 400);
        }

        $query = "SELECT cm.id, cm.message, cm.attachment_url, cm.created_at,
                         u.id as sender_user_id, u.full_name as sender_name, u.role as sender_role,
                         LEFT(u.full_name, 1) as avatar
                  FROM chat_messages cm
                  JOIN users u ON cm.sender_user_id = u.id
                  WHERE cm.channel_id = ?
                  ORDER BY cm.created_at ASC
                  LIMIT ?";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $channelId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $messages = [];

        // Get logged-in user from session to flag is_self
        session_start();
        $currentUserId = $_SESSION['user_id'] ?? 0;

        while ($row = $result->fetch_assoc()) {
            $messages[] = [
                'id'          => $row['id'],
                'sender_name' => $row['sender_name'] . ' (' . ucfirst(str_replace('_', ' ', $row['sender_role'])) . ')',
                'avatar'      => strtoupper($row['avatar']),
                'is_self'     => (int)$row['sender_user_id'] === (int)$currentUserId,
                'time'        => date('H:i', strtotime($row['created_at'])),
                'text'        => $row['message'],
                'attachment'  => $row['attachment_url'],
            ];
        }

        sendJsonResponse([
            'success' => true,
            'data'    => $messages
        ]);
        break;

    case 'send':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['message'])) {
            sendJsonResponse(['success' => false, 'message' => 'message is required'], 400);
        }

        session_start();
        $currentUserId = $_SESSION['user_id'] ?? null;
        if (!$currentUserId) {
            sendJsonResponse(['success' => false, 'message' => 'Not authenticated'], 401);
        }

        $channelId = (int)($input['channel_id'] ?? 1);
        $msg       = trim($input['message']);
        $attach    = $input['attachment_url'] ?? null;

        $stmt = $conn->prepare(
            "INSERT INTO chat_messages (channel_id, sender_user_id, message, attachment_url)
             VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("iiss", $channelId, $currentUserId, $msg, $attach);

        if ($stmt->execute()) {
            // Get sender info for response
            $userResult = $conn->query("SELECT full_name, role FROM users WHERE id = $currentUserId");
            $user = $userResult ? $userResult->fetch_assoc() : ['full_name' => 'User', 'role' => 'worker'];

            sendJsonResponse([
                'success' => true,
                'message' => 'Message sent',
                'data' => [
                    'id'          => $stmt->insert_id,
                    'sender_name' => $user['full_name'] . ' (' . ucfirst($user['role']) . ')',
                    'avatar'      => strtoupper(substr($user['full_name'], 0, 1)),
                    'is_self'     => true,
                    'time'        => date('H:i'),
                    'text'        => $msg,
                ]
            ]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to send message: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'stats':
        getDashboardStats($conn);
        break;
    case 'workers':
        getWorkerStats($conn);
        break;
    case 'production':
        getProductionStats($conn);
        break;
    case 'defects':
        getDefectStats($conn);
        break;
    default:
        sendJsonResponse(['error' => 'Invalid action'], 400);
        break;
}

function getDashboardStats($conn)
{
    $stats = [];

    // Total active workers
    $result = $conn->query("SELECT COUNT(*) as total FROM workers WHERE status = 'active'");
    $stats['total_workers'] = (int)($result->fetch_assoc()['total'] ?? 0);

    // Workers on shift today (present attendance)
    $result = $conn->query("SELECT COUNT(*) as total FROM attendance WHERE date = CURDATE() AND status = 'present'");
    $stats['current_on_shift'] = (int)($result->fetch_assoc()['total'] ?? 0);

    // Today's planned production: sum of quantities in running job_sequences
    $result = $conn->query("SELECT COALESCE(SUM(quantity), 0) as total FROM job_sequences WHERE status = 'running'");
    $stats['today_production'] = (int)($result->fetch_assoc()['total'] ?? 0);

    // Line efficiency: average of (current_workers / capacity * 100) across active lines
    $result = $conn->query(
        "SELECT ROUND(AVG(CASE WHEN capacity > 0 THEN (current_workers / capacity) * 100 ELSE 0 END), 1) as efficiency
         FROM production_lines WHERE status = 'active'"
    );
    $row = $result->fetch_assoc();
    $stats['line_efficiency'] = (float)($row['efficiency'] ?? 0);

    // Defect rate: average (100 - pass_rate) across all inspections this month
    $result = $conn->query(
        "SELECT ROUND(AVG(100 - pass_rate), 2) as defect_rate
         FROM inspections
         WHERE MONTH(inspection_date) = MONTH(CURDATE()) AND YEAR(inspection_date) = YEAR(CURDATE())"
    );
    $row = $result->fetch_assoc();
    $stats['defect_rate'] = (float)($row['defect_rate'] ?? 0);

    // Total active/in-production orders
    $result = $conn->query("SELECT COUNT(*) as total FROM orders WHERE status != 'cancelled'");
    $stats['total_orders'] = (int)($result->fetch_assoc()['total'] ?? 0);

    // Total inventory value
    $result = $conn->query("SELECT COALESCE(SUM(buying_price * quantity), 0) as total FROM products");
    $stats['total_cost'] = (float)($result->fetch_assoc()['total'] ?? 0);

    sendJsonResponse(['success' => true, 'data' => $stats]);
}

function getWorkerStats($conn)
{
    // Top workers by rewards earned this month
    $query = "SELECT w.full_name, w.employee_id, w.department,
                     COUNT(wr.id) as reward_count,
                     COALESCE(SUM(wr.bonus_amount), 0) as total_bonus
              FROM workers w
              LEFT JOIN worker_rewards wr ON wr.worker_id = w.id
                AND MONTH(wr.awarded_date) = MONTH(CURDATE())
                AND YEAR(wr.awarded_date) = YEAR(CURDATE())
              WHERE w.status = 'active'
              GROUP BY w.id
              ORDER BY reward_count DESC, total_bonus DESC
              LIMIT 10";

    $result = $conn->query($query);
    $workers = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $workers[] = $row;
        }
    }

    sendJsonResponse(['success' => true, 'data' => $workers]);
}

function getProductionStats($conn)
{
    // Line-wise worker coverage and status
    $query = "SELECT pl.id, pl.line_name, pl.line_type, pl.status,
                     pl.capacity, pl.current_workers, pl.target_output_per_hour,
                     COUNT(js.id) as active_jobs
              FROM production_lines pl
              LEFT JOIN job_sequences js ON js.line_id = pl.id AND js.status = 'running'
              GROUP BY pl.id
              ORDER BY pl.id ASC";

    $result = $conn->query($query);
    $lines = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $lines[] = $row;
        }
    }

    sendJsonResponse(['success' => true, 'data' => $lines]);
}

function getDefectStats($conn)
{
    // Defect category distribution from inspection_defects (last 30 days)
    $query = "SELECT id.defect_category as defect_type, SUM(id.defect_count) as count
              FROM inspection_defects id
              JOIN inspections i ON id.inspection_id = i.id
              WHERE i.inspection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
              GROUP BY id.defect_category
              ORDER BY count DESC";

    $result = $conn->query($query);
    $defects = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $defects[] = $row;
        }
    }

    sendJsonResponse(['success' => true, 'data' => $defects]);
}

$conn->close();

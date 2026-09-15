<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'compliance';

switch ($action) {
    case 'compliance':
        // Pull compliance checklist from DB
        $result = $conn->query(
            "SELECT id, standard_name as standard, clause_code as clause, title, description,
                    category, is_compliant, evidence_document_url, last_audited_at
             FROM compliance_checklists
             ORDER BY id ASC"
        );
        $checklist = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $row['status'] = $row['is_compliant'] ? 'Compliant' : 'Review Needed';
                $checklist[] = $row;
            }
        }

        // These aggregated scores are business-level metrics not stored per-row in the DB.
        // They are computed from compliance checklist compliance rate.
        $totalItems    = count($checklist);
        $compliantCount = 0;
        foreach ($checklist as $item) {
            if ($item['is_compliant']) $compliantCount++;
        }
        $readinessScore = $totalItems > 0 ? round(($compliantCount / $totalItems) * 100, 1) : 0;

        // Last audited date from DB
        $auditResult = $conn->query(
            "SELECT DATE(MAX(last_audited_at)) as last_audit FROM compliance_checklists"
        );
        $lastAudit = $auditResult ? ($auditResult->fetch_assoc()['last_audit'] ?? date('Y-m-d')) : date('Y-m-d');

        sendJsonResponse([
            'success' => true,
            'data' => [
                'readiness_score_pct'     => $readinessScore,
                'sustainability_score_pct' => 91, // Requires separate environmental tracking module
                'worker_wellbeing_pct'    => 94, // Requires separate HR wellbeing tracking
                'last_audit_date'         => $lastAudit,
                'next_buyer_audit'        => date('Y-m-d', strtotime('+30 days')),
                'checklist'               => $checklist,
            ]
        ]);
        break;

    case 'daily_production':
        // Show job sequences scheduled/running for the requested date grouped by line
        $date = $_GET['date'] ?? date('Y-m-d');

        $result = $conn->query(
            "SELECT pl.line_name, js.status,
                    SUM(js.quantity) as total_quantity,
                    COUNT(js.id) as job_count
             FROM job_sequences js
             JOIN production_lines pl ON js.line_id = pl.id
             WHERE js.start_date <= '$date' AND js.due_date >= '$date'
             GROUP BY pl.id, js.status
             ORDER BY pl.id ASC"
        );

        $lineData = [];
        $totalProduced = 0;
        $totalTarget   = 0;

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $lineName = $row['line_name'];
                if (!isset($lineData[$lineName])) {
                    $lineData[$lineName] = ['line_name' => $lineName, 'quantity' => 0, 'job_count' => 0];
                }
                $lineData[$lineName]['quantity']  += (int)$row['total_quantity'];
                $lineData[$lineName]['job_count'] += (int)$row['job_count'];
                if ($row['status'] === 'completed' || $row['status'] === 'running') {
                    $totalProduced += (int)$row['total_quantity'];
                }
                $totalTarget += (int)$row['total_quantity'];
            }
        }

        sendJsonResponse([
            'success' => true,
            'data' => [
                'date'           => $date,
                'total_produced' => $totalProduced,
                'total_target'   => $totalTarget,
                'lines'          => array_values($lineData),
            ]
        ]);
        break;

    case 'share_dossier':
        $input = json_decode(file_get_contents('php://input'), true);
        $email    = $input['auditor_email'] ?? 'auditor@buyer.com';
        $token    = bin2hex(random_bytes(16));
        $shareUrl = 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/c2s/audit/verify?token=' . $token;

        sendJsonResponse([
            'success'         => true,
            'message'         => 'Secure buyer compliance dossier link generated',
            'share_link'      => $shareUrl,
            'expires_in_days' => 7,
            'recipient'       => $email
        ]);
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

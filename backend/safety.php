<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        $query = "SELECT sr.*, w.full_name as reported_by_name,
                  (SELECT sres.resolution_notes_bn FROM safety_resolutions sres WHERE sres.safety_report_id = sr.id LIMIT 1) as resolution_notes
                  FROM safety_reports sr
                  LEFT JOIN workers w ON sr.reported_by = w.id
                  ORDER BY sr.incident_date DESC, sr.id DESC";
        $result = $conn->query($query);
        $reports = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $reports[] = $row;
            }
        }

        $unresolved = 0;
        $pending    = 0;
        $resolved   = 0;

        foreach ($reports as $r) {
            if ($r['status'] === 'Unresolved')  $unresolved++;
            elseif ($r['status'] === 'Pending') $pending++;
            elseif ($r['status'] === 'Resolved') $resolved++;
        }

        sendJsonResponse([
            'success' => true,
            'data' => [
                'summary' => [
                    'unresolved' => $unresolved,
                    'pending'    => $pending,
                    'resolved'   => $resolved,
                    'total'      => count($reports)
                ],
                'reports' => $reports
            ]
        ]);
        break;

    case 'submit':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['title']) || empty($input['description_bn'])) {
            sendJsonResponse(['success' => false, 'message' => 'title and description_bn are required'], 400);
        }

        $code    = 'SAF-' . date('Ymd') . '-' . rand(100, 999);
        $title   = $input['title'];
        $cat     = $input['category'] ?? 'Public Safety';
        $sev     = $input['severity'] ?? 'Major';
        $loc     = $input['location'] ?? 'Factory Floor';
        $descBn  = $input['description_bn'];
        $descEn  = $input['description_en'] ?? '';
        $repBy   = (int)($input['reported_by'] ?? 1);
        $date    = date('Y-m-d');

        $stmt = $conn->prepare(
            "INSERT INTO safety_reports (report_code, title, category, severity, location, description_bn, description_en, reported_by, incident_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')"
        );
        $stmt->bind_param("sssssssis", $code, $title, $cat, $sev, $loc, $descBn, $descEn, $repBy, $date);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Safety report filed successfully', 'report_id' => $stmt->insert_id, 'report_code' => $code]);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to save report: ' . $conn->error], 500);
        }
        break;

    case 'resolve':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['report_id'])) {
            sendJsonResponse(['success' => false, 'message' => 'report_id is required'], 400);
        }

        $reportId   = (int)$input['report_id'];
        $notesBn    = $input['resolution_notes_bn'] ?? 'সমস্যাটি পরিদর্শন করে প্রয়োজনীয় প্রতিকারমূলক ব্যবস্থা নেওয়া হয়েছে।';
        $notesEn    = $input['resolution_notes_en'] ?? 'Hazard inspected and mitigated with permanent preventive repair.';
        $resolvedBy = (int)($input['resolved_by'] ?? 1);

        $upd = $conn->prepare("UPDATE safety_reports SET status = 'Resolved' WHERE id = ?");
        $upd->bind_param("i", $reportId);
        $upd->execute();

        $stmt = $conn->prepare(
            "INSERT INTO safety_resolutions (safety_report_id, resolution_notes_bn, resolution_notes_en, resolved_by)
             VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("issi", $reportId, $notesBn, $notesEn, $resolvedBy);

        if ($stmt->execute()) {
            sendJsonResponse(['success' => true, 'message' => 'Safety report resolved and recorded in audit ledger']);
        } else {
            sendJsonResponse(['success' => false, 'message' => 'Failed to resolve report: ' . $conn->error], 500);
        }
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

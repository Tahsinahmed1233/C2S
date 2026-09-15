<?php
require_once 'config.php';

$conn = getDBConnection();
$action = $_GET['action'] ?? 'insights';

switch ($action) {
    case 'insights':
    case 'predictions':
        $horizonDays = isset($_GET['horizon_days']) ? (int)$_GET['horizon_days'] : 7;

        $predictions = [
            'forecast_horizon_days' => $horizonDays,
            'predicted_output_units' => 28400,
            'capacity_utilization_pct' => 88.7,
            'on_time_delivery_probability' => 96.2,
            'risk_alerts' => [
                [
                    'id' => 'ALT-01',
                    'type' => 'Defect Risk Escalation',
                    'severity' => 'Critical',
                    'line' => 'Line-3',
                    'message' => 'Increasing stitch skipping detected on Line-3. Machine needle wear trend indicates potential 4.2% defect spike in next 48 hours.',
                    'action_label' => 'Investigate Line 3'
                ],
                [
                    'id' => 'ALT-02',
                    'type' => 'Bottleneck Detected',
                    'severity' => 'Warning',
                    'line' => 'Line-C (Finishing)',
                    'message' => 'Finishing station pace is 22% slower than Sewing output. Rebalancing 4 operators from Line-E Packaging to Line-C recommended.',
                    'action_label' => 'Rebalance Shift'
                ],
                [
                    'id' => 'ALT-03',
                    'type' => 'Raw Material Stock Warning',
                    'severity' => 'Info',
                    'line' => 'Cutting Dept',
                    'message' => '100% Combed Cotton yarn buffer will drop below reorder threshold in 4 days at current run rate.',
                    'action_label' => 'Generate PO'
                ]
            ],
            'daily_simulated_capacity' => [
                ['day' => 'Mon', 'actual' => 4100, 'predicted' => 4050, 'target' => 4000],
                ['day' => 'Tue', 'actual' => 3950, 'predicted' => 4100, 'target' => 4000],
                ['day' => 'Wed', 'actual' => 4200, 'predicted' => 4150, 'target' => 4000],
                ['day' => 'Thu', 'actual' => 4050, 'predicted' => 4200, 'target' => 4000],
                ['day' => 'Fri', 'actual' => 3800, 'predicted' => 3900, 'target' => 4000],
                ['day' => 'Sat', 'actual' => 4300, 'predicted' => 4250, 'target' => 4000],
                ['day' => 'Sun', 'actual' => 0, 'predicted' => 0, 'target' => 0]
            ],
            'suggested_reallocations' => [
                ['worker_id' => 4, 'name' => 'Juhitha', 'current_line' => 'Line-E', 'recommended_line' => 'Line-C', 'reason' => 'High dexterity rating; clears finishing bottleneck'],
                ['worker_id' => 8, 'name' => 'Kabir', 'current_line' => 'Line-F', 'recommended_line' => 'Line-A', 'reason' => 'Overcome sewing shortage on high-priority H&M order']
            ]
        ];

        sendJsonResponse([
            'success' => true,
            'data' => $predictions
        ]);
        break;

    default:
        sendJsonResponse(['success' => false, 'message' => 'Invalid action'], 400);
}

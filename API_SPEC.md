# C2S System API Specification (API_SPEC.md)

**Version:** 1.0.0  
**Base URL:** `/backend` (or `http://localhost:8000/backend`)  
**Format:** RESTful JSON  
**Authentication:** Bearer Token / Session Header (`Authorization: Bearer <token>` or Cookie-based session)

---

## 1. Global Standards & Response Contract

All endpoints adhere to a strict standard envelope response structure:

### 1.1 Success Response Envelope

```json
{
  "success": true,
  "status_code": 200,
  "message": "Operation completed successfully",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  },
  "timestamp": "2026-09-13T18:00:00Z"
}
```

### 1.2 Error Response Envelope

```json
{
  "success": false,
  "status_code": 400,
  "error_code": "INVALID_INPUT",
  "message": "Validation failed on submitted fields",
  "errors": {
    "product_code": "Product code already exists in catalog"
  },
  "timestamp": "2026-09-13T18:00:00Z"
}
```

---

## 2. Authentication & User Access Contracts

### 2.1 User Login

- **Endpoint:** `POST /backend/auth.php?action=login`
- **Request Body:**
  ```json
  {
    "email": "admin@c2s.com",
    "password": "admin123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "email": "admin@c2s.com",
        "full_name": "System Administrator",
        "role": "admin"
      },
      "token": "jwt_session_token_xyz"
    }
  }
  ```

### 2.2 User Logout

- **Endpoint:** `POST /backend/auth.php?action=logout`
- **Response `200 OK`:** `{"success": true, "message": "Logged out"}`

### 2.3 Check Auth Status

- **Endpoint:** `GET /backend/auth.php?action=check`
- **Response `200 OK`:** Returns current logged in user profile.

---

## 3. Dashboard Endpoints

### 3.1 Dashboard Overall KPIs

- **Endpoint:** `GET /backend/dashboard.php?action=stats`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "total_workers": 142,
      "today_production": 3840,
      "line_efficiency": 89.4,
      "defect_rate": 1.45,
      "total_orders": 128,
      "total_cost": 42500.0,
      "compliance_score": "Good",
      "sustainability_score": "Good",
      "wellbeing_score": "Good"
    }
  }
  ```

### 3.2 Performance Charts Data

- **Endpoint:** `GET /backend/dashboard.php?action=charts`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "top_workers": [
        { "name": "Taskin", "score": 95, "badge": "PROMOTED" },
        { "name": "Riya Akter", "score": 92, "badge": "BONUS AWARDED" }
      ],
      "line_contributions": [
        { "line": "Line-A", "output": 1200, "efficiency": 91 },
        { "line": "Line-B", "output": 1150, "efficiency": 88 }
      ],
      "defect_distribution": [
        { "type": "stitching", "count": 14, "percentage": 35 },
        { "type": "fabric", "count": 10, "percentage": 25 }
      ]
    }
  }
  ```

---

## 4. Worker Management, Performance & Rewards Contracts

### 4.1 List Workers & Performance

- **Endpoint:** `GET /backend/workers.php?action=list&page=1&limit=10&department=Sewing`
- **Response `200 OK`:** List of workers with performance metrics, assigned line, attendance rate, and reward status.

### 4.2 Assign Training to Worker

- **Endpoint:** `POST /backend/workers.php?action=assign_training`
- **Request Body:**
  ```json
  {
    "worker_id": 12,
    "training_module": "Overlock Stitching Precision & Safety",
    "supervisor_id": 3,
    "start_date": "2026-09-20",
    "target_completion_date": "2026-10-05",
    "notes": "Improve stitch alignment on Line 3"
  }
  ```

### 4.3 Award Recognition / Bonus

- **Endpoint:** `POST /backend/workers.php?action=award_recognition`
- **Request Body:**
  ```json
  {
    "worker_id": 1,
    "award_type": "promotion",
    "bonus_amount": 5000.0,
    "remarks": "Exceeded production target by 15% with zero defects"
  }
  ```

---

## 5. Attendance & Availability Contracts

### 5.1 Attendance Summary & Ledger

- **Endpoint:** `GET /backend/attendance.php?action=list&date=2026-09-13&shift=morning`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "summary": { "present": 138, "absent": 4, "late": 2, "rate": 95.8 },
      "records": [
        {
          "worker_id": 1,
          "name": "Taskin Amir",
          "line": "Line-A",
          "check_in": "08:02:00",
          "status": "present"
        }
      ]
    }
  }
  ```

### 5.2 Check Line Availability Matrix

- **Endpoint:** `GET /backend/attendance.php?action=availability&line_id=1`
- **Response `200 OK`:** Matrix of available operators, skill coverage, and missing headcount per production line.

---

## 6. Production Line Management Contracts

### 6.1 List Production Lines

- **Endpoint:** `GET /backend/production.php?action=lines`
- **Response `200 OK`:** List of lines, active product, planned capacity, hourly output, supervisors, and status.

### 6.2 Create Production Line

- **Endpoint:** `POST /backend/production.php?action=create_line`
- **Request Body:**
  ```json
  {
    "line_name": "Line-G",
    "line_type": "Sewing",
    "capacity": 50,
    "supervisor_id": 5,
    "target_units_per_hour": 120
  }
  ```

---

## 7. Waste Tracking & Pattern Optimization Contracts

### 7.1 Waste Analytics & Records

- **Endpoint:** `GET /backend/waste.php?action=stats`
- **Response `200 OK`:** Returns total waste (kg), cost loss ($), recycling breakdown, and historical logs.

### 7.2 Log New Waste

- **Endpoint:** `POST /backend/waste.php?action=add_waste`
- **Request Body:**
  ```json
  {
    "line_id": 2,
    "waste_type": "Fabric Scraps",
    "material": "Denim 12oz",
    "quantity_kg": 18.5,
    "cost_usd": 74.0,
    "date": "2026-09-13",
    "reason": "Cutting edge margin misalignment"
  }
  ```

### 7.3 Apply New Pattern (CAD Yield Optimization)

- **Endpoint:** `POST /backend/waste.php?action=apply_pattern`
- **Request Body:**
  ```json
  {
    "pattern_code": "PAT-DENIM-09",
    "fabric_type": "Denim 12oz",
    "yield_projected_percent": 94.2,
    "estimated_waste_reduction_kg": 42.0,
    "applicable_lines": [1, 2]
  }
  ```

---

## 8. Quality Control & Inspection Contracts

### 8.1 Inspection Dashboard & Metrics

- **Endpoint:** `GET /backend/quality.php?action=stats`
- **Response `200 OK`:** Pass/Fail percentage, average resolution duration, defect Pareto chart.

### 8.2 Start New Inspection

- **Endpoint:** `POST /backend/quality.php?action=create_inspection`
- **Request Body:**
  ```json
  {
    "product_id": 3,
    "batch_number": "BATCH-2026-091",
    "line_id": 1,
    "sample_size": 200,
    "defects_found": 3,
    "defect_categories": { "stitching": 2, "dirtying": 1 },
    "status": "Accepted",
    "inspector_id": 4
  }
  ```

### 8.3 Inspection History & Details

- **Endpoint:** `GET /backend/quality.php?action=history&page=1`
- **Endpoint:** `GET /backend/quality.php?action=details&inspection_id=5`

---

## 9. Worker Safety & Bangla Incident Reporting Contracts

### 9.1 Safety Summary & Reports

- **Endpoint:** `GET /backend/safety.php?action=list&status=all`
- **Response `200 OK`:** Counts of unresolved and pending safety reports, plus list of reports with Bengali/English descriptions.

### 9.2 Submit Safety Incident (Worker Accessible)

- **Endpoint:** `POST /backend/safety.php?action=submit`
- **Request Body:**
  ```json
  {
    "title": "ঝুঁকিপূর্ণ সিঁড়ি (Slippery or broken steps near Line 2)",
    "description_bn": "লাইন ২ এর কাছে সিড়ির হাতল ভাঙা এবং পিচ্ছিল অবস্থা, দ্রুত মেরামত দরকার।",
    "description_en": "Broken stair handrail and slippery surface near Line 2.",
    "severity": "Critical",
    "category": "Facility Safety",
    "location": "Line 2 - East Staircase",
    "reported_by": 14
  }
  ```

### 9.3 Resolve Safety Incident

- **Endpoint:** `POST /backend/safety.php?action=resolve`
- **Request Body:**
  ```json
  {
    "report_id": 3,
    "resolution_notes_bn": "সিঁড়ির হাতল মেরামত করা হয়েছে এবং অ্যান্টি-স্লিপ ম্যাট স্থাপন করা হয়েছে।",
    "resolution_notes_en": "Handrail welded securely and anti-slip mat installed.",
    "resolved_by": 1
  }
  ```

---

## 10. Job Sequencing & Order Scheduling Contracts

### 10.1 Active Sequence Queue

- **Endpoint:** `GET /backend/jobs.php?action=queue`
- **Response `200 OK`:** Ranked queue of production orders based on due dates, line capabilities, and setup changeover times.

### 10.2 Add Production Job

- **Endpoint:** `POST /backend/jobs.php?action=add_job`
- **Request Body:**
  ```json
  {
    "order_id": 104,
    "product_id": 2,
    "quantity": 1500,
    "target_line_id": 3,
    "start_date": "2026-09-15",
    "due_date": "2026-09-22",
    "priority": "High"
  }
  ```

---

## 11. Machine Maintenance & Work Orders Contracts

### 11.1 Machine Fleet Status

- **Endpoint:** `GET /backend/machines.php?action=list`
- **Response `200 OK`:** Fleet health, operational machines count, machines requiring immediate maintenance.

### 11.2 Create Maintenance Work Order

- **Endpoint:** `POST /backend/machines.php?action=create_work_order`
- **Request Body:**
  ```json
  {
    "machine_id": 8,
    "work_type": "Preventive",
    "description": "Oil pump replacement and needle calibration",
    "technician_id": 6,
    "scheduled_date": "2026-09-18",
    "estimated_cost": 150.0
  }
  ```

---

## 12. AI Insights & Production Simulation Contracts

### 12.1 Predictive Capacity & Bottlenecks

- **Endpoint:** `GET /backend/ai.php?action=predictions&horizon_days=7`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "projected_output": 26500,
      "capacity_utilization_pct": 88.5,
      "predicted_bottleneck_lines": ["Line-3", "Line-F"],
      "recommended_worker_reallocations": [
        { "from_line": "Line-E", "to_line": "Line-A", "worker_count": 4 }
      ],
      "defect_risk_escalation_warning": "Line-3 showing needle heat buildup pattern"
    }
  }
  ```

---

## 13. Reports, Compliance & Buyer Audit Contracts

### 13.1 Compliance Checklist

- **Endpoint:** `GET /backend/reports.php?action=compliance_checklist`
- **Endpoint:** `POST /backend/reports.php?action=update_checklist`

### 13.2 Generate & Share Audit Dossier

- **Endpoint:** `POST /backend/reports.php?action=generate_audit_dossier`
- **Request Body:**
  ```json
  {
    "auditor_email": "auditor@buyer-compliance.com",
    "scope": ["Labor Law 2006", "Building & Fire Safety", "Fair Wage Records"],
    "expiry_days": 7
  }
  ```

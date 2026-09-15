# C2S Design System Specification (DESIGN_SYSTEM.md)

**Version:** 1.0.0  
**Project:** C2S - Smart Garments Management & Production Optimization System  
**Design Audit Date:** September 2026

---

## 1. Executive Summary & Design Audit Findings

An exhaustive audit of the 15 Figma modules and existing CSS implementations (`App.css`, `Dashboard.css`, `Inventory.css`, `LoginPage.css`, `QualityControl.css`, `Settings.css`, `WorkerReporting.css`) revealed significant design drift and inconsistencies across color values, typography hierarchies, margin/padding spacings, and component geometry.

### 1.1 Color Inconsistencies Audited

- **Yellow / Warning / Accent Drifts:**
  - Screen elements used varying shades of gold/yellow: `#ffc107` (Bootstrap yellow), `#e6a800`, `#d97706` (Amber 600), `#f59e0b` (Amber 500), and `#ffeaa7`.
- **Status Green (Success / On-Track):**
  - Found `#28a745`, `#10b981`, `#059669`, `#4caf50`, and `#2ecc71` used interchangeably across quality control and inventory cards.
- **Status Red (Defect / Danger / Critical):**
  - Discovered `#dc3545`, `#ef4444`, `#e74c3c`, and `#b91c1c` causing inconsistent visual urgency in safety reporting and quality control.
- **Backgrounds & Card Surfaces:**
  - Background shades fluctuated between `#f4f6f9`, `#f8f9fa`, `#f5f6f8`, `#f0f2f5`, `#fafafa`, and pure `#ffffff`.
- **Neutral Text Hierarchy:**
  - Body text used `#333333`, `#2c3e50`, `#1f2937`, `#4a5568`, and `#666666`, breaking typographic cohesion.

### 1.2 Typography Inconsistencies Audited

- **Font Families:**
  - Inconsistent fallbacks: `Roboto, sans-serif` vs `Inter, system-ui` vs `Segoe UI`.
- **Heading Scales:**
  - H1 headings ranged from `20px` to `32px` across different pages.
  - Subheaders and section titles fluctuated between `14px`, `15px`, `16px`, and `18px`.
  - Font weights for card metrics mixed `600`, `700`, `800`, and `bold`.

### 1.3 Margins, Padding & Spacing Inconsistencies Audited

- **Arbitrary Spacing:**
  - Hardcoded values like `15px`, `18px`, `22px`, `25px`, `30px`, and `35px` violated standard 4px/8px spatial grids.
- **Card Padding Discrepancies:**
  - Metric cards in `Dashboard` used `20px`, in `Inventory` used `24px`, in `WorkerReporting` used `16px`, and modals varied between `15px` and `30px`.

### 1.4 Component Shapes & Elevation Inconsistencies Audited

- **Border Radii:**
  - Buttons had `4px`, `6px`, `8px`, and `25px` (pill shapes).
  - Inputs had `4px`, `6px`, and `8px`.
  - Content cards had `6px`, `8px`, `12px`, and `16px`.
- **Shadows & Elevation:**
  - Disparate shadow depths: `0 2px 4px rgba(0,0,0,0.05)` vs `0 4px 6px rgba(0,0,0,0.1)` vs `0 10px 15px rgba(0,0,0,0.1)`.

---

## 2. Standardized Design System Tokens

To eliminate visual drift, enforce brand identity (Garment Manufacturing Precision), and support high accessibility (Bangla & English non-technical factory operators), the following design tokens are standardized.

### 2.1 Color Tokens

```css
:root {
  /* Brand Primary & Accents */
  --color-primary-900: #0f172a;
  --color-primary-800: #1e293b;
  --color-primary-700: #334155;
  --color-primary-600: #475569;
  --color-primary-500: #2563eb; /* Primary Interactive Blue */
  --color-primary-hover: #1d4ed8;

  /* C2S Garment Accent (Gold / Amber) */
  --color-accent-600: #d97706;
  --color-accent-500: #f59e0b; /* Primary Accent Gold */
  --color-accent-400: #fbbf24;
  --color-accent-100: #fef3c7;
  --color-accent-50: #fffbeb;

  /* Functional Status Colors */
  --color-success-700: #047857;
  --color-success-600: #059669;
  --color-success-500: #10b981;
  --color-success-100: #d1fae5;
  --color-success-50: #ecfdf5;

  --color-warning-700: #b45309;
  --color-warning-600: #d97706;
  --color-warning-500: #f59e0b;
  --color-warning-100: #fef3c7;
  --color-warning-50: #fffbeb;

  --color-danger-700: #b91c1c;
  --color-danger-600: #dc2626;
  --color-danger-500: #ef4444;
  --color-danger-100: #fee2e2;
  --color-danger-50: #fef2f2;

  --color-info-700: #1d4ed8;
  --color-info-600: #2563eb;
  --color-info-500: #3b82f6;
  --color-info-100: #dbeafe;
  --color-info-50: #eff6ff;

  /* Neutrals & Surfaces */
  --color-neutral-900: #0f172a; /* Main text */
  --color-neutral-800: #1e293b;
  --color-neutral-700: #334155;
  --color-neutral-600: #475569; /* Secondary text */
  --color-neutral-500: #64748b; /* Muted text / icons */
  --color-neutral-400: #94a3b8; /* Placeholders */
  --color-neutral-300: #cbd5e1; /* Borders */
  --color-neutral-200: #e2e8f0; /* Subtle borders / dividers */
  --color-neutral-100: #f1f5f9; /* Table headers / inactive tabs */
  --color-neutral-50: #f8fafc; /* Page Background */
  --color-surface: #ffffff; /* Card / Modal Surface */

  /* Sidebar Specific (Dark Charcoal Manufacturing Theme) */
  --color-sidebar-bg: #1e293b;
  --color-sidebar-hover: #334155;
  --color-sidebar-active: #2563eb;
  --color-sidebar-text: #e2e8f0;
  --color-sidebar-text-muted: #94a3b8;
}
```

### 2.2 Typography Scale (Base: 16px, Inter & Roboto)

```css
:root {
  --font-family-base:
    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif;
  --font-family-heading:
    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes */
  --font-size-xs: 0.75rem; /* 12px - Badges, captions */
  --font-size-sm: 0.875rem; /* 14px - Table content, button labels */
  --font-size-base: 1rem; /* 16px - Body text, standard inputs */
  --font-size-lg: 1.125rem; /* 18px - Card sub-headers */
  --font-size-xl: 1.25rem; /* 20px - Section headers */
  --font-size-2xl: 1.5rem; /* 24px - Metric numbers, page sub-headers */
  --font-size-3xl: 1.875rem; /* 30px - Primary Page titles */
  --font-size-4xl: 2.25rem; /* 36px - Hero metric highlights */

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;
}
```

### 2.3 Spacing System (8pt / 4pt Grid)

```css
:root {
  --spacing-3xs: 0.125rem; /* 2px */
  --spacing-2xs: 0.25rem; /* 4px */
  --spacing-xs: 0.5rem; /* 8px */
  --spacing-sm: 0.75rem; /* 12px */
  --spacing-md: 1rem; /* 16px - Standard internal card padding */
  --spacing-lg: 1.5rem; /* 24px - Major section gaps */
  --spacing-xl: 2rem; /* 32px - Page level layout margins */
  --spacing-2xl: 3rem; /* 48px */
}
```

### 2.4 Geometry, Radii & Elevations

```css
:root {
  /* Border Radii */
  --radius-xs: 0.25rem; /* 4px - Tags, tiny chips */
  --radius-sm: 0.375rem; /* 6px - Form controls, sub-buttons */
  --radius-md: 0.5rem; /* 8px - Default Buttons, standard cards */
  --radius-lg: 0.75rem; /* 12px - Modal containers, metric cards */
  --radius-xl: 1rem; /* 16px - Large feature panels */
  --radius-pill: 9999px; /* Pill buttons, avatar badges */

  /* Box Shadows (Subtle, clean, elevation hierarchy) */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm:
    0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md:
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg:
    0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl:
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Standardized Component Patterns

### 3.1 Standard Buttons

- **Primary Action (`.btn-primary`):** Background `var(--color-primary-500)`, text `#ffffff`, radius `var(--radius-md)`, padding `0.625rem 1.25rem`, shadow `var(--shadow-sm)`. Hover: `var(--color-primary-hover)`.
- **Secondary Action (`.btn-secondary`):** Background `var(--color-surface)`, border `1px solid var(--color-neutral-300)`, text `var(--color-neutral-700)`.
- **Accent Action (`.btn-accent`):** Background `var(--color-accent-500)`, text `#0f172a`, font-weight `600`.
- **Danger Action (`.btn-danger`):** Background `var(--color-danger-500)`, text `#ffffff`.
- **Sizes:**
  - Small (`.btn-sm`): height `32px`, font-size `var(--font-size-xs)`, padding `0.25rem 0.75rem`.
  - Normal (`.btn-md`): height `40px`, font-size `var(--font-size-sm)`, padding `0.5rem 1rem`.
  - Large (`.btn-lg`): height `48px`, font-size `var(--font-size-base)`, padding `0.75rem 1.5rem`.

### 3.2 Form Inputs & Controls

- **Input (`.form-input`, `.form-select`, `.form-textarea`):**
  - Height: `40px` (inputs/selects)
  - Border: `1px solid var(--color-neutral-300)`
  - Radius: `var(--radius-md)`
  - Background: `var(--color-surface)`
  - Padding: `0.5rem 0.75rem`
  - Focus state: `border-color: var(--color-primary-500)`, outline `3px solid rgba(37, 99, 235, 0.15)`
  - Error state: `border-color: var(--color-danger-500)`, outline `3px solid rgba(239, 68, 68, 0.15)`
- **Label (`.form-label`):** Font size `var(--font-size-sm)`, font-weight `var(--font-weight-medium)`, color `var(--color-neutral-700)`, margin-bottom `4px`.

### 3.3 Cards & Metric Tiles

- **Metric Tile (`.stat-card`):**
  - Background: `var(--color-surface)`
  - Border: `1px solid var(--color-neutral-200)`
  - Radius: `var(--radius-lg)`
  - Padding: `var(--spacing-md)`
  - Top header row with title and standardized icon badge (36x36px with rounded radius).
  - Prominent numerical value (`var(--font-size-2xl)`, font-weight `700`).
  - Subtitle indicator with trend badge (`+5% vs target`).

### 3.4 Status & Severity Badges

- **Tag / Badge (`.badge`):**
  - Padding: `0.25rem 0.625rem`
  - Radius: `var(--radius-pill)`
  - Font-size: `var(--font-size-xs)`
  - Font-weight: `var(--font-weight-semibold)`
  - Variants:
    - `.badge-success`: Bg `var(--color-success-50)`, text `var(--color-success-700)`, border `1px solid var(--color-success-100)`
    - `.badge-warning`: Bg `var(--color-warning-50)`, text `var(--color-warning-700)`, border `1px solid var(--color-warning-100)`
    - `.badge-danger`: Bg `var(--color-danger-50)`, text `var(--color-danger-700)`, border `1px solid var(--color-danger-100)`
    - `.badge-info`: Bg `var(--color-info-50)`, text `var(--color-info-700)`, border `1px solid var(--color-info-100)`

### 3.5 Modal Dialogs

- **Overlay (`.modal-overlay`):** Background `rgba(15, 23, 42, 0.6)`, backdrop filter `blur(4px)`, z-index `1000`.
- **Dialog Box (`.modal-dialog`):** Background `var(--color-surface)`, radius `var(--radius-xl)`, shadow `var(--shadow-xl)`, max-width `540px` (standard) or `780px` (large/multi-column), padding `var(--spacing-lg)`.
- **Header:** Sticky header with title `var(--font-size-xl)` and standardized close icon button.
- **Footer:** Action row with right-aligned Cancel (`.btn-secondary`) and Confirm (`.btn-primary`).

---

## 4. Master Screen-by-Screen UI & Dynamic Data Inventory

| Screen ID / Route                          | Title                             | Form Inputs & Controls                                                                           | Dynamic Data Displayed                                                                         | Action Buttons & Modals                                                                                                  |
| :----------------------------------------- | :-------------------------------- | :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **SCR-01** (`/dashboard`)                  | Admin Dashboard                   | Shift filter, global date selector, search input                                                 | Total Workers (live), Today's Output, Line Efficiency (%), Defect Rate (%), Orders, Cost KPI   | "Investigate Line 3", "View All Rewards", Worker Cards, Shift Indicators                                                 |
| **SCR-02** (`/rewards`)                    | Worker Recognition & Rewards      | Department filter, month selector, reward category                                               | Top performers leaderboard, achievement badges, bonus amounts, performance ratings             | "Award Bonus", "Promote Worker", "Export Recognition Ledger"                                                             |
| **SCR-03** (`/settings`)                   | Admin Settings                    | General config, user inputs, roles, shifts, notification toggles                                 | User list, factory configuration, role permissions, backup timestamps                          | "Add User", "Update Factory Info", "Save Permissions", "Trigger Backup"                                                  |
| **SCR-04** (`/attendance`)                 | Attendance & Shifts               | Date range picker, shift filter (Morning/Evening/Night), search                                  | Total Present, Absent, Late, Attendance Rate (%), Daily logs                                   | "Check Availability" (pops SCR-05), "Mark Attendance", "Export Ledger"                                                   |
| **SCR-05** (`/attendance/availability`)    | View Availability Modal           | Line filter, skill type selector                                                                 | Line availability matrix, available vs assigned worker counts, shift coverage                  | "Assign Line", "Auto-Balance Shifts", "Close"                                                                            |
| **SCR-06** (`/performance`)                | Worker Performance                | Worker search, department selector, rating tier (Grade A-D)                                      | Efficiency scores, quality ratings, output/hour, bottleneck alerts                             | "Assign Training" (pops SCR-07), "Generate Appraisal", "View Detailed History"                                           |
| **SCR-07** (`/performance/training`)       | Assign Training Modal             | Training module dropdown, supervisor selector, target date, notes                                | Worker skill gap score, previous certifications, recommended curriculum                        | "Confirm Assignment", "Cancel", "Notify Supervisor"                                                                      |
| **SCR-08** (`/production`)                 | Production Line                   | Active line toggle, product assignment selector                                                  | Hourly line pace, actual vs target pcs, line bottlenecks, active supervisors                   | "Create Production Line" (pops SCR-09), "Stop Line", "Reallocate Workers"                                                |
| **SCR-09** (`/production/create`)          | Create Production Line Modal      | Line name, line type (Sewing/Cutting/Finishing), initial capacity, supervisor ID                 | Available machinery list, supervisor dropdown, capacity limits                                 | "Save Production Line", "Cancel"                                                                                         |
| **SCR-10** (`/waste`)                      | Waste Tracking                    | Date filter, material type (Cotton, Denim, Silk, Polyester)                                      | Total waste (kg), cost loss ($), recycling rate (%), waste by line                             | "Export Data" (pops SCR-11), "New Waste" (pops SCR-12), "Apply New Pattern" (pops SCR-13)                                |
| **SCR-11** (`/waste/export`)               | Export Report3 Modal              | Date range, file format (CSV, PDF, Excel), include cost analysis checkbox                        | File size estimate, records count                                                              | "Download Report", "Cancel"                                                                                              |
| **SCR-12** (`/waste/new`)                  | Export New Waste Modal            | Line ID, waste category, quantity (kg), cost estimate, reason notes                              | Unit cost multipliers, line attribution                                                        | "Submit Waste Log", "Cancel"                                                                                             |
| **SCR-13** (`/waste/pattern`)              | Apply New Pattern Modal           | Pattern code, nesting optimization score, fabric type, cut efficiency target                     | Fabric yield projection (%), reduction in scrap (kg)                                           | "Apply Pattern to Line", "Simulate Yield"                                                                                |
| **SCR-14** (`/chats`)                      | Internal Chats                    | Search channels, message input textarea, file attachment                                         | Active channels (#management, #line-supervisors, #qc-alerts), direct messages, timestamps      | "Send Message", "Create Channel", "Upload Document"                                                                      |
| **SCR-15** (`/quality-control`)            | Quality Control                   | Date selector, inspection filter                                                                 | Pass/Fail rate (%), Avg time to resolve, defect breakdown chart, recent inspections            | "View Details" (pops SCR-16), "Start New Inspection" (pops SCR-17), "View All Inspection" (pops SCR-18)                  |
| **SCR-16** (`/quality-control/inspect`)    | View Inspect Modal                | Read-only inspection details, defect checklist                                                   | Item code, batch number, defect type, sample size, acceptance threshold                        | "Mark Re-inspected", "Close"                                                                                             |
| **SCR-17** (`/quality-control/start`)      | Start New Inspect Modal           | Product selector, batch no, sample size, defect counts by category                               | Calculated pass/fail status, severity score                                                    | "Submit Inspection", "Cancel"                                                                                            |
| **SCR-18** (`/quality-control/history`)    | QC History View                   | Search by batch, status filter (Accepted/Rejected)                                               | Comprehensive inspection ledger with batch history and inspector ID                            | "Filter", "Export QC Log"                                                                                                |
| **SCR-19** (`/safety`)                     | Worker Safety Reporting           | Search reports, severity filter (Critical/Major/Minor)                                           | Unresolved reports counter, pending reports, recent incident cards                             | "View Details" (pops SCR-20), "Resolve" (pops SCR-21), "View All Reports" (pops SCR-22), "Resolve History" (pops SCR-23) |
| **SCR-20** (`/safety/details`)             | Safety Report Details Modal       | Read-only details, image attachments, Bangla audio/text description                              | Incident location, reported by, machine involved, submission timestamp                         | "Assign Inspector", "Close"                                                                                              |
| **SCR-21** (`/safety/resolve`)             | Resolve Safety Incident Modal     | Resolution notes (Bangla/English), action taken, resolved by supervisor                          | Status toggle, incident severity confirmation                                                  | "Mark as Resolved", "Cancel"                                                                                             |
| **SCR-22** (`/safety/history`)             | Safety History View               | Filter by date, severity, status                                                                 | Historical incident cards, resolution duration, repeat offender line alerts                    | "Export Incident Log", "Back to Main"                                                                                    |
| **SCR-23** (`/safety/resolve-history`)     | Resolve History View              | Filter by resolving officer                                                                      | Chronological ledger of resolved incidents and verification status                             | "Audit Verify", "Print Summary"                                                                                          |
| **SCR-24** (`/job-sequencing`)             | Job Sequencing                    | Priority filter, deadline filter                                                                 | Active jobs queue, machine allocation, bottleneck warning, completion progress                 | "Add Job" (pops SCR-25), "Optimize Schedule (AI)", "Reorder Queue"                                                       |
| **SCR-25** (`/job-sequencing/add`)         | Add Job Modal                     | Order ID, product code, quantity, target line, start date, due date, priority                    | Target line capacity check, estimated duration                                                 | "Schedule Job", "Cancel"                                                                                                 |
| **SCR-26** (`/inventory`)                  | Inventory Management              | Search keyword, category filter, pagination                                                      | Total Products, Total Stock, Low Stock count, Out of Stock, Inventory Value                    | "Add Product" (pops SCR-27), "Edit", "Delete", "Export"                                                                  |
| **SCR-27** (`/inventory/add`)              | Add Product Modal                 | Product name, product code, category, buying price, selling price, quantity, threshold, supplier | Auto-calculated profit margin, stock status flag                                               | "Save Product", "Cancel"                                                                                                 |
| **SCR-28** (`/machines`)                   | Machine Maintenance               | Line filter, status filter (Operational, Maintenance, Broken)                                    | Total machines, health index, upcoming maintenance dates, downtime cost                        | "New Work Order" (pops SCR-29), "Export Report" (pops SCR-30), "Mark Fixed"                                              |
| **SCR-29** (`/machines/work-order`)        | New Work Order Modal              | Machine ID, maintenance type (Preventive, Corrective), technician ID, scheduled date             | Machine history, parts needed                                                                  | "Create Work Order", "Cancel"                                                                                            |
| **SCR-30** (`/machines/export`)            | Export Machine Report Modal       | Date range, line selector, format                                                                | Maintenance logs count, total cost incurred                                                    | "Download Report", "Cancel"                                                                                              |
| **SCR-31** (`/ai-insights`)                | AI Insights & Predictions         | Forecast horizon slider, target line selector                                                    | Demand forecast chart, capacity prediction, defect risk heatmaps, suggested worker allocations | "Simulate Production", "Apply AI Recommendations"                                                                        |
| **SCR-32** (`/reports`)                    | Reports & Compliance              | Audit compliance checklist, report category tabs                                                 | Compliance readiness score (%), sustainability score, worker wellbeing score                   | Quick links to SCR-33 through SCR-42                                                                                     |
| **SCR-33** (`/reports/checklist`)          | Manage Checklist Modal            | Standard clause checkboxes (RMG Safety, Labor Law 2006, ILO standards)                           | Compliance completion percentage, missing documents counter                                    | "Save Checklist", "Generate Audit Dossier"                                                                               |
| **SCR-34** (`/reports/compliance-details`) | View Compliance Details           | Clause filter                                                                                    | Detailed audit evidence list, inspector findings                                               | "Add Evidence", "Export"                                                                                                 |
| **SCR-35** (`/reports/daily-production`)   | Daily Production Ledger           | Date filter, line filter                                                                         | Hourly output table, worker efficiency per line                                                | "Export Excel", "Print"                                                                                                  |
| **SCR-36** (`/reports/qc-summary`)         | QC Summary Report                 | Month selector, defect filter                                                                    | Defect trends, Pareto chart of defects, supplier quality index                                 | "Download PDF", "Share"                                                                                                  |
| **SCR-37** (`/reports/waste-report`)       | Waste Report                      | Date range, line selector                                                                        | Fabric waste ledger, recycling diversion rates                                                 | "Export CSV"                                                                                                             |
| **SCR-38** (`/reports/supply-audit`)       | Supply Audit Report               | Supplier filter                                                                                  | Raw material stock receipt audit, fabric yield validation                                      | "Export Report"                                                                                                          |
| **SCR-39** (`/reports/attendance-ledger`)  | Attendance Ledger                 | Worker ID filter, month selector                                                                 | Overtime hours, late days, incentive calculations                                              | "Export Payroll Ledger"                                                                                                  |
| **SCR-40** (`/reports/share`)              | Share Report Modal                | Recipient email, role permission (Auditor, Buyer, Owner), expiry date                            | Generated secure share link, access logs                                                       | "Send Share Link", "Copy Link"                                                                                           |
| **SCR-41** (`/reports/export`)             | Export Comprehensive Report Modal | Report type checkboxes (Production, QC, Safety, Financial), date range                           | Report size estimate                                                                           | "Export All", "Cancel"                                                                                                   |
| **SCR-42** (`/reports/reassessment`)       | View Reassessment Modal           | Remediation task list, verification checkboxes                                                   | Auditor remarks, compliance deficit remediation                                                | "Sign-off Reassessment", "Close"                                                                                         |

---

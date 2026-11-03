# TRUVAER Aerospace – Admin & ERP Section Documentation

This document specifies the architecture, permissions, governance models, and workflows implemented within the **Admin, ERP, and PMS Systems** (`src/erp/`).

---

## 1. Role-Based Access Hierarchy (RBAC)

The system supports strict tiered access control from L0 to L8:

| Level | Role Designation | Operational Clearance |
| :--- | :--- | :--- |
| **L0** | Guest / Unverified Aviator | Read-only access to directory, public news, and market tickers. |
| **L1** | Junior Desk Officer | Basic ticket triage, incoming customer inquiries. |
| **L2** | Verification Officer | Compliance checks, document audit, incorporation review. |
| **L3** | Senior Verification Officer | Multi-region corporate onboarding, AML vetting. |
| **L4** | Operations Lead | PMS task reviews, SLA monitoring. |
| **L5** | Department Manager | **Listing creation, Category proposal review, Location registrations.** |
| **L6** | Regional General Manager | Multi-zone financial ledger audits, regional cash-flow inspection. |
| **L7** | Corporate Director | Global multi-region management, cross-border clearance. |
| **L8** | Super Administrator / Founder | Full sovereign platform access, global overrides, hard-lock enforcement. |

---

## 2. Listing & Business Creation Authority

### 🔒 Strict Creation Lockdown
- **Business Users**: Forbidden from creating new business profiles, proposing categories, or adding new business locations.
- **Permitted Roles**: Only accounts with `ADMIN`, `SUPER_ADMIN`, or `MANAGER` (or `level >= 1` assigned officers) are granted the `+ Create`, `+ Category`, and `Business Location` options in ServiceScout.
- **Enforcement Points**:
  1. **UI Controls**: `canCreateListing` prop in `ServiceScoutSearchEngine.tsx`.
  2. **Portal Orchestration**: `isAdminOrManager` calculation in `MarketingPortal.tsx`.
  3. **Mutation Guards**: Validation inside `handleCreateListingSubmit` and location registration modal `onSubmit`.

---

## 3. Project Management System (PMS Desk)

- **File**: `src/erp/AdminPMSDesk.tsx`
- **SLA Countdown & Timers**: Dynamic countdown calculation against priority SLAs (Critical: 4h, High: 12h, Medium: 24h, Low: 48h).
- **Strict Next-Level Escalation**:
  - Reassignment dropdowns strictly filter eligible officers to **current officer level + 1** (e.g., L1 → L2, L2 → L3).
  - Skips and lateral transfers are rejected by backend guard `db.reassignAdminTaskToNextLevel()`.
- **Audit Trails**: Every assignment, status transition, and comment is appended to the immutable task history.

---

## 4. Approved Taxonomy & Category Desk

- **File**: `src/erp/ApprovedTaxonomyDesk.tsx`
- **Central Catalog**: Provides search, edit, delete, and add interfaces for platform Categories and Subcategories.
- **'Other' Review Pipeline**: Evaluates bespoke taxonomy requested by businesses and promotes them to the official marketplace taxonomy once authenticated.

---

## 5. Content Moderation & Strike Desk

- **Escalation Ladder**:
  - 1st Confirmed Infraction: 7-Day suspension from posting/publishing.
  - 2nd Confirmed Infraction: 14-Day suspension.
  - 3rd Confirmed Infraction: 30-Day suspension.
- **Hard-Lock**: Suspends corporate access across directory search, lead generation, and RFQ issuance.

---

## 6. Central Admin C-Panel: Master Module Assignment Matrix

- **File**: `src/erp/AdminRBACControlPanel.tsx` (`panelView === 'matrix'`)
- **Full In-Depth Architecture Guide**: See [`docs/MASTER_MODULE_MATRIX_GUIDE.md`](./MASTER_MODULE_MATRIX_GUIDE.md) for full documentation, tables, and workflows.

### 🧩 6.1 What is a "Platform Module"?
- An independent, bounded domain service or desk within the TruvAer Aerospace software suite (e.g. `user_dashboard`, `fin_treasury`, `hr_main`, `crm_admissions`, `erp_organisation`, `sec_rbac`).
- Each module encapsulates distinct business logic, data structures, views, and action privileges (Create, Read, Update, Delete) for a specific operational or commercial capability.

### 👤 6.2 What is a "Responsible Account Holder"?
- Every platform module displays its designated **Responsible Account Holder / Operational Governance Lead** (e.g., `Capt. Sameer Khurana (VP Operations L7)` for Fleet Ops, `Sunil Mathur (Finance Head L6)` for Finance & Treasury, `Priya Deshmukh (Head of People L6)` for HRMS, `B Aditya Narayana (Chairman & Super Admin L8)` for Security & RBAC).
- **Aviation Governance Purpose**: In compliance-heavy aerospace environments (DGCA / ICAO / FAA), data and operational privileges cannot be anonymous system toggles. Every domain has a designated C-suite or VP executive legally and operationally accountable for data integrity, compliance sign-offs, and escalation approvals.

### 🔄 6.3 Where Do Settings Get Reflected?
When an administrator clicks `ALLOTTED` or `DISABLED` in the Matrix, changes immediately reflect across:
1. **Navigation Menus & Sidebar**: Unallotted modules are dynamically hidden from user header menus and sidebars.
2. **Access Gateways & Route Guards**: Direct URL navigation to unallotted modules triggers the 403 Security Clearance Gate.
3. **User Dashboard**: Home dashboard widgets and quick-launch tiles only render for allotted modules.
4. **Role Templates & Automatic Inheritance**: Newly onboarded staff and role profiles automatically inherit these default module lists.
5. **Live Simulation Gateway**: Administrators can navigate to the **User Module Allotted View** tab and click **"⚡ Test Interface As This User"** to immediately preview and verify the portal as experienced by any user of that role.
6. **SIEM Audit Ledger**: Cryptographically logged in the immutable administrative activity stream (`mockDatabase.logAdminActivity`).

---

## 7. User Module Allotted Desk (39 Modules) & Live Session Testing

- **File**: `src/erp/UserModuleAllottedView.tsx` (`panelView === 'module_image'`)
- **Executive Dark Palette**:
  - Restyled from legacy white ERPNext design into TruvAer Executive Slate (`bg-slate-900`, `border-slate-800`).
- **Live User Session Testing**:
  - Features the **"⚡ Test Interface As This User"** button (`onSwitchActiveUser`).
  - Allows administrators to instantly switch session context to any regular user account and verify that only their allotted modules appear in their portal sidebar and dashboard.
- **Named Account Holders**:
  - All 39 ERP/workspace modules display assigned governance leads (`MODULE_ACCOUNT_HOLDERS`).
- **Quick Preset Allocations**:
  - Includes 1-click presets: `All 39 Modules`, `Operations Core (24)`, `Aviator Standard Baseline (13)`, and `Deselect All`.

---

## 8. Role Permissions Manager (Rule-Based Matrix)

- **File**: `src/erp/RolePermissionsManagerView.tsx` (`panelView === 'permission_page'`)
- **Executive Theme Alignment**:
  - Styled with slate dark theme, removing outdated stark white styles to unify with the TruvAer executive palette.
- **Permission Rule Governance**:
  - Displays designated Rule Leads (`PERMISSION_RULE_LEADS`) across DocTypes (User, Digital Wallet, CRM Deal, Flight Briefing, etc.).

---

## 9. Custom User Types & Roles Registry & 1-Click Profile Templates

- **File**: `src/erp/AdminRBACControlPanel.tsx` (`panelView === 'roles'`)
- **1-Click Profile Templates**:
  - When creating or editing a user type/role (e.g. Manager), a single dropdown selection immediately auto-populates all necessary fields:
    - **Operational Reason**: Business justification and operational scope.
    - **Reporting To**: Designated superior and level (e.g. `Capt. Sameer Khurana (VP Operations L7)`).
    - **Level & Designation**: Hierarchy rank (L0 to L8) and formal title.
    - **Assigned Department**: Division (Operations, Customer Care, Finance, HR, Directorate).
    - **Territorial Zone / Airspace**: Regional jurisdiction (e.g. `APAC - Asia Pacific`, `GLOBAL`).
    - **Responsible Account Holder**: Named owner (e.g. `Aditya Vikram Verma`).
    - **Pre-Allotted Modules**: Full pre-checked list of allowed modules with individual checkboxes to customize.
- **CRUD Operations**:
  - Full **Add**, **Edit**, and **Delete** actions. Core system roles are protected from accidental deletion.

---

## 10. Deduplication & Persistence Safeguards

- **Deduplication**:
  - The redundant `Individual User Module Clearance Overrides` (`user_modules`) sub-tab was evaluated and confirmed to duplicate `User Module Allotted` (`module_image`). The duplicate tab and its redundant view block were safely removed.
- **No-Reset Persistence**:
  - Fixed database constructor filters in `src/data/mockDatabase.ts` that were resetting custom roles and user module overrides on page reload. All custom user types and module allotments now persist reliably across sessions.


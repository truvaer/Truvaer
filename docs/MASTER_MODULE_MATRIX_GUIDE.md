# Master Module Assignment Matrix – Architecture & Governance Guide

This document explains the concepts, design rationale, and system-wide impact of the **Master Module Assignment Matrix** located in the **TruvAer Security & Access Control Panel (RBAC)** (`src/erp/AdminRBACControlPanel.tsx`).

---

## 1. Executive Summary

In enterprise aviation and corporate aerospace operations, security and role governance cannot rely on vague or opaque access flags. The TruvAer platform operates on a **Zero-Trust, Tiered Role-Based Access Control (RBAC)** architecture ranging from **Level 0 (Aviator / Standard User)** to **Level 8 (Chairman & Super Administrator)**.

The **Master Module Assignment Matrix** is the central command console where platform administrators define which functional domains are available to each role and hierarchy level.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Master Module Assignment Matrix                      │
│                                                                        │
│   Platform Module & Lead              Role Columns (L0 to L8)          │
│   ┌───────────────────────────┐       ┌───────┬───────┬───────┬──────┐ │
│   │ Module Name & Description │  ──>  │ L0    │ L3    │ L5    │ L8   │ │
│   │ Lead: Account Holder      │       │ Std   │ Fin   │ Ops   │ MD   │ │
│   └───────────────────────────┘       └───────┴───────┴───────┴──────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Propagates & Enforces
                                    ▼
  ┌─────────────────────────┬─────────────────────────┬─────────────────┐
  │ 1. Navigation Menus     │ 2. Security Gateways    │ 3. User Dash    │
  │ Visible tabs & sidebars │ 403 blocks & URL checks │ Active widgets  │
  └─────────────────────────┴─────────────────────────┴─────────────────┘
```

---

## 2. What is a "Platform Module"?

### Definition
A **Platform Module** is an independent, bounded domain service within the TruvAer Aerospace software suite. Each module represents a distinct operational capability with its own business logic, database tables, view components, and CRUD (Create, Read, Update, Delete) permissions.

### Platform Modules Inventory
TruvAer currently organizes its capabilities into the following key domains:

| Category | Module ID | Module Display Name | Scope & Purpose |
| :--- | :--- | :--- | :--- |
| **Aviator & Identity** | `user_dashboard` | Aviator Dashboard | Personal flight desk, notifications, assigned projects overview. |
| | `user_assigned_projects`| Assigned Projects | Departmental tasks, PMS assignments, milestones, and deliverables. |
| | `user_profile_settings` | Profile & Identity | Credentials, contact info, 2FA settings, verified bank details. |
| **Communications** | `comm_chat` | Enterprise Comms & Chat | Encrypted instant messaging between aviators, operators, and support. |
| | `comm_alerts` | Flight Notices & NOTAMs | Live corridor alerts, weather notices, operational warnings. |
| | `comm_broadcast` | Airspace Broadcast Desk | Company-wide and multi-zone mass notification broadcasting. |
| **Directorate & Ops** | `erp_organisation` | Airspace & Fleet Ops | Aircraft registry, fleet status, base hubs, and corridor monitoring. |
| | `erp_sis` | Flight Intelligence System | Sector traffic monitoring, tail utilization, and route telemetry. |
| | `erp_inventory` | Aircraft Parts Inventory | AOG parts stock, rotables, airframe spares, warehouse logistics. |
| | `erp_dynamic_forms` | Dynamic Flight Forms | Bespoke inspection forms, checklist builders, electronic flight bags. |
| | `erp_taxonomy` | Aviation Taxonomy Desk | Verified aircraft categories, airport listings, and service types. |
| | `erp_login_stats` | Access Telemetry & SIEM | Session heartbeats, multi-zone login locations, threat logs. |
| **Finance & Treasury** | `fin_billing_management`| Billing & Invoicing | Automated charter billing, tax receipts, client payment portals. |
| | `fin_treasury` | Aviation Treasury Desk | Multi-currency escrow balancing, ledger reserves, cash flow. |
| | `fin_store` | Procurement & Parts Store | Commercial purchases, ground support equipment orders. |
| | `fin_expenses` | Operating Disbursements | Fuel disbursement, ramp fees, catering, handling invoices. |
| | `fin_canteen` | Airside Catering & Mess | Crew meal allowance accounting, flight provisioning. |
| | `fin_intelligence` | Financial Forecasting | Yield analytics, charter profit margins, route profitability. |
| **CRM & Commercial** | `crm_admissions` | Charter Admissions & Leads | Customer quote requests, corporate charter deals, pipeline stages. |
| | `crm_plus` | Key Accounts Desk | VIP high-net-worth accounts, government delegation contracts. |
| **HRMS & Crew** | `hr_main` | Crew & Staff Roster | Pilot duty hours, rest intervals, licenses, BCAS clearance. |
| | `hr_staff_wall` | Corporate Directory | Verified staff directory, department hierarchy, org chart. |
| | `hr_payroll` | Aviation Payroll & Per Diem| Monthly compensation, flight duty incentive disbursements. |
| | `hr_pms` | Performance & Escalation | KPI scoring, SLA breaches, departmental mobility evaluation. |
| **Security & System** | `sec_rbac` | Security & RBAC Matrix | Tiered role configuration, module allotments, access policies. |
| | `sys_settings` | Global System Settings | Platform maintenance toggles, timezone, default currencies. |
| | `sys_user_management` | Platform User Accounts | Super Admin user CRUD, credential revocation, role reassignment. |
| | `sys_audit_logs` | Immutable Audit Ledger | Cryptographically signed administrative action logs. |
| | `sec_pwd_reset` | Password Recovery Gate | Secure self-service credential reset and biometric verification. |
| | `sec_privacy_policy` | Privacy Policy Desk | Regulatory compliance notices (GDPR, DPDP, FAA recordkeeping). |
| | `sec_user_agreement` | Terms of Carriage | Legal charter contracts, passenger terms, disclaimer releases. |
| | `sec_accessibility` | Accessibility Standards | WCAG 2.1 AA screen reader, keyboard navigation compliance. |
| | `sec_community_guidelines`| Aviator Conduct Code | Airfield etiquette, communication guidelines, dispute protocol. |

---

## 3. What is a "Responsible Account Holder"?

### Definition
In standard consumer software, permissions are often anonymous system checkboxes. However, in regulated aviation (complying with **DGCA**, **FAA**, **EASA**, and **ICAO Annex 6/9** requirements), every high-consequence operational sector requires a **designated, human individual** who is personally and legally accountable for that domain.

The **Responsible Account Holder** is the executive, functional head, or director assigned to own a specific Platform Module.

### Why Every Module Displays an Account Holder
1. **Audit & Regulatory Compliance**: When aviation authorities or safety auditors inspect who approved a flight dispatch route, authorized an AOG parts release, or disbursed treasury funds, they trace back directly to the Responsible Account Holder.
2. **Clearance Escalation Conduit**: If an associate or field officer requests elevated temporary access to a module, the request is routed specifically to that module's Responsible Account Holder for formal sign-off.
3. **Data Integrity & Governance**: The Account Holder ensures the taxonomy, financial entries, and business rules within their module remain accurate and aligned with company standard operating procedures (SOP).

### Official Module Account Holder Registry

| Module | Responsible Account Holder | Designation & Hierarchy Rank | Corporate Email |
| :--- | :--- | :--- | :--- |
| **Security & RBAC (`sec_rbac`)** | **B Aditya Narayana** | Chairman & Super Admin (L8) | `aditya.narayana@truvaer.aero` |
| **System Settings (`sys_settings`)** | **B Aditya Narayana** | Chairman & Super Admin (L8) | `aditya.narayana@truvaer.aero` |
| **User Management (`sys_user_management`)** | **B Aditya Narayana** | Chairman & Super Admin (L8) | `aditya.narayana@truvaer.aero` |
| **Audit Logs (`sys_audit_logs`)** | **B Aditya Narayana** | Chairman & Super Admin (L8) | `aditya.narayana@truvaer.aero` |
| **Fleet & Airspace Ops (`erp_organisation`)**| **Capt. Sameer Khurana** | VP Operations & Executive Directorate (L7) | `sameer.khurana@truvaer.aero` |
| **Taxonomy & Locations (`erp_taxonomy`)** | **Capt. Sameer Khurana** | VP Operations & Executive Directorate (L7) | `sameer.khurana@truvaer.aero` |
| **Finance & Billing (`fin_billing_management`)**| **Sunil Mathur** | Head of Finance & Corporate Treasury (L6) | `sunil.mathur@truvaer.aero` |
| **Operating Expenses (`fin_expenses`)** | **Sunil Mathur** | Head of Finance & Corporate Treasury (L6) | `sunil.mathur@truvaer.aero` |
| **Financial Intelligence (`fin_intelligence`)** | **Sunil Mathur** | Head of Finance & Corporate Treasury (L6) | `sunil.mathur@truvaer.aero` |
| **Aviation Treasury (`fin_treasury`)** | **Manish Agarwal** | Treasury Officer (L4) | `manish.agarwal@truvaer.aero` |
| **Stores & Catering (`fin_store`, `fin_canteen`)**| **Sunita Rao** | Procurement & Stores Lead (L5) | `sunita.rao@truvaer.aero` |
| **Parts Inventory (`erp_inventory`)** | **Sunita Rao** | Procurement & Stores Lead (L5) | `sunita.rao@truvaer.aero` |
| **HRMS, Crew & Payroll (`hr_main`, `hr_payroll`)**| **Priya Deshmukh** | Head of People & Crew Affairs (L6) | `priya.deshmukh@truvaer.aero` |
| **PMS & Performance (`hr_pms`)** | **Priya Deshmukh** | Head of People & Crew Affairs (L6) | `priya.deshmukh@truvaer.aero` |
| **Admissions & CRM (`crm_admissions`, `crm_plus`)**| **Divya Nair** | Customer Care & Sales Lead (L4) | `divya.nair@truvaer.aero` |
| **Airspace Operations (`erp_sis`, `erp_dynamic_forms`)**| **Aditya Vikram Verma**| Operations Manager (L5) | `aditya.verma@truvaer.aero` |
| **Corporate Comms & Alerts (`comm_chat`, `comm_alerts`)**| **Sarah Jenkins** | Corporate Comms Lead (L4) | `sarah.jenkins@truvaer.aero` |
| **Legal & Policies (`sec_privacy_policy`, `sec_user_agreement`)**| **Kavita Menon** | Legal & Compliance Lead (L5) | `kavita.menon@truvaer.aero` |

---

## 4. Where and How Settings Get Reflected Across the Platform

When an administrator toggles a module between `ALLOTTED` and `DISABLED` for a role in the Master Matrix, the system executes an atomic transaction via `db.updateRoleModuleAccess(roleKey, allowedModules)`. 

The changes immediately propagate and reflect in **six distinct platform subsystems**:

```
                       [ Master Matrix Allotment Toggle ]
                                      │
                        db.updateRoleModuleAccess()
                                      │
         ┌────────────────────────────┼───────────────────────────┐
         │                            │                           │
         ▼                            ▼                           ▼
 1. Navigation Menus         2. Access Gateways          3. User Dashboards
    • Sidebar links hidden      • Direct URL block          • Action widgets hidden
    • Nav tabs filtered         • 403 Access Denied         • Quick-launch updated
         │                            │                           │
         ▼                            ▼                           ▼
 4. Role Profiles            5. Live Simulation          6. SIEM Audit Ledger
    • New users inherit         • "Test Interface"          • Signed admin log
    • Templates updated           real-time view              recorded in history
```

### 1. Top Navigation Bar & Sidebar Drawer
* **Mechanism**: Navigation menus render using an `allowed_modules` filter hook.
* **Result**: If `fin_treasury` is revoked from `MANAGER`, the **Treasury** icon, submenu, and links instantly disappear from the portal header and drawer for all managers. They only see modules explicitly allotted to their role.

### 2. Route & Deep-Link Access Gateways
* **Mechanism**: Every module route checks `currentUser.allowed_modules.includes(targetModuleId)`.
* **Result**: If an unauthorized user attempts to bookmark or type the direct URL for a restricted module (such as the RBAC Control Panel or Payroll), the routing gateway intercepts the request and renders a **"403 Security Access Gate / Clearance Required"** screen, informing the user that their role does not have authorization.

### 3. User Dashboard & Action Hub
* **Mechanism**: The home dashboard displays dynamic action cards and KPI summary widgets tied to specific module keys.
* **Result**: The user's dashboard only loads cards for modules they are cleared to use. For instance, Standard Aviators only see flight bookings, personal documents, and alerts; they never see inventory, payroll, or audit widgets.

### 4. Custom Role Profiles & Automatic Inheritance
* **Mechanism**: The `defaultAllowedModules` array of the target role in `customUserTypes` is synchronized.
* **Result**: Any new staff member or user assigned to this role in the future automatically inherits this updated baseline of permissions without requiring manual per-user configuration.

### 5. Live User Simulation Gateway (`User Module Allotted View`)
* **Mechanism**: Located in the adjacent **User Module Allotted View** tab (`panelView === 'module_image'`).
* **Result**: Administrators can view any specific employee or aviator, see their allotted badges, and click **"⚡ Test Interface As This User"**. This switches the active session context in real time, allowing administrators to immediately verify with their own eyes that the navigation, dashboard, and pages match the matrix rules.

### 6. SIEM Administrative Audit Stream
* **Mechanism**: Every toggle automatically triggers `db.logAdminActivity()` with category `'SECURITY_AUDIT'`.
* **Result**: An immutable audit entry records the timestamp, actor name (e.g. `B Aditya Narayana (L8 Super Admin)`), the affected role, and the total count of granted modules. This ensures tamper-evident traceability for compliance inspections.

---

## 5. Security Guardrails Built into the Matrix

1. **Super Admin Universal Access Lock**:
   - The `SUPER_ADMIN` role (Chairman & Managing Director L8) is permanently hard-coded to have universal full access across all 24 modules. It displays a locked purple badge (`FULL ACCESS (L8)`) and cannot be disabled.
2. **Standard User Least-Privilege Safeguard**:
   - High-privilege management modules (`sys_settings`, `sys_user_management`, `sys_audit_logs`, `fin_billing_management`, `sec_rbac`) are hard-locked as `RESTRICTED` for the `STANDARD_USER` role. This prevents accidental granting of sovereign administrative or financial power to baseline aviators.

---

## 6. Summary Cheat Sheet

| Question | Short Answer |
| :--- | :--- |
| **What is a Platform Module?** | A specific software capability/desk (e.g., Treasury, Crew Roster, Parts Inventory, CRM) with its own views and data. |
| **What is a Responsible Account Holder?** | The C-Suite/VP executive legally and operationally accountable for that module under aviation standards. |
| **Where do settings reflect?** | Navigation menus, sidebar links, route security gates, user home dashboard widgets, role templates, and live user session previews. |
| **How can I verify my changes?** | Go to the **User Module Allotted View** tab and click **"⚡ Test Interface As This User"** to test the live user experience instantly. |

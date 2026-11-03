# TRUVAER Aerospace – Project Changes History & Revision Log

This document records all functional, architectural, and security updates implemented across TRUVAER Aerospace. It serves as the single source of truth for ongoing evolution and future engineering handoffs.

---

## 📌 Change Log Index
- **[v2.9.0 – 2026-10-24] Canonical 4-User Inventory Simplification (Standard User, Business User, Admin, Super Admin)**
- **[v2.8.0 – 2026-10-24] Operations Department Role & Data Cleansing & Master Matrix Guide**
- **[v2.7.0 – 2026-10-24] C-Panel Security & RBAC Simplification, 1-Click Profile Templates, Live Testing & Account Holder Governance**
- **[v2.6.0 – 2026-10-07] Business Listing Interface 3-Section Redesign & Zero-Gap Optimization**
- **[v2.5.0 – 2026-10-07] Complete Listing Card Redesign Matching Specification Image**
- **[v2.4.0 – 2026-10-07] Business Listing Interface Streamlining & Admin/Manager RBAC Hardening**
- **[v2.3.0 – 2026-10-07] ServiceScout Business Profile Cleanliness & Navigation Refinement**
- **[v2.2.0 – 2026-10-07] Full Domain Modularization & Architecture Documentation**
- **[v2.1.0 – 2026-10-06] Taxonomy Approval Desk, Re-publish Credits & Strike System**
- **[v2.0.0 – 2026-10-06] Cloud Run Dynamic Port Fix & Production Server Hardening**

---

## [v2.9.0] – 2026-10-24
### 👥 Canonical 4-User Inventory Simplification
- **User Database Pruned to Strictly 1 User of Each Role**:
  1. **Standard User**: `user@truvaer.com` (`@user` / `usr_standard_user`, Standard User)
  2. **Business User**: `corporate@truvaer.com` (`@corporate_user` / `biz_corporate_user`, Truvaer Corporate Aviation Ltd)
  3. **Admin**: `admin@truvaer.com` (`@admin` / `usr_admin` / `admin_operations`, Operations Administrator L7)
  4. **Super Admin**: `sup_admin@truvaer.com` (`@super_admin` / `usr_super_admin` / `admin_super_admin`, B Aditya Narayana L8)
- **Purge of Legacy & Duplicate Users**:
  - Removed extra regular user records: `usr_johnson_chase` and duplicate regular profile `usr_corporate_user`.
  - Removed extra administrative personnel: Sunita Rao (`admin_finance_head`), Vikram Sengupta (`admin_sales_officer`), Priya Deshmukh (`admin_priya_l5`), Rahul Varma (`admin_staff_rahul`), and Ananya Sen (`admin_staff_ananya`).
  - Added strict constructor cache sanitization in `MockDatabase` to immediately purge any stale user records cached in browser `localStorage`.
- **UI & Preset Alignment**:
  - Aligned 1-Click Demo Profiles in `AuthGateway.tsx` to the 4 canonical user profiles.
  - Aligned User Module Allotted Master Console default to the canonical Standard User.
  - Account Switcher dropdown in `Navbar.tsx` now cleanly presents the 4 retained users with zero duplicates.

---

## [v2.8.0] – 2026-10-24
### 🧹 Operations Department Role & Data Cleansing
- **Complete Elimination of DISPATCHER Role & Designation**:
  - Removed `DISPATCHER` custom role, template, and references from the Operations department.
  - Replaced `tpl_dispatcher` template with `Operations & Fleet Coordinator (Level 4)` in Role Profile Templates.
  - Updated staff member designations and qualifications in HRMS (`Commercial Operations & Logistics Specialist`, `Certified Operations Lead`).
  - Updated mock data and database cache sanitizer to purge legacy `DISPATCHER` entries from local storage automatically.
  - Replaced outdated job listing and type unions with `Flight Operations Coordinator`.
- **Master Module Assignment Matrix Architectural Guide**:
  - Authored comprehensive guide in `docs/MASTER_MODULE_MATRIX_GUIDE.md` detailing the concepts of Platform Modules, Responsible Account Holders, and the 6 runtime reflection points (Navigation, Access Gates, User Dashboards, Role Templates, Live Simulation, and SIEM Audit Logs).
  - Cross-linked guide into `docs/ADMIN_SECTION.md` and `docs/MODULES_ARCHITECTURE.md`.

---

## [v2.7.0] – 2026-10-24
### 🛡️ C-Panel Security & RBAC Simplification, 1-Click Profile Templates & Account Holder Governance
- **Simplified Master Module Assignment Matrix**:
  - Replaced confusing, multi-tier stacked dropdowns and clearance gating drawer with a clean, fast search bar and category selector.
  - Rendered designated **Account Holder & Operational Governance Leads** on every module row for clear accountability at scale.
  - Implemented direct checkbox / button allotments per role and level (`ALLOTTED` / `DISABLED` toggles) with Super Admin universal access and Standard User least-privilege lockouts.
- **1-Click Role Profile Templates in User Types & Roles Registry**:
  - Added 1-Click Profile Template selector dropdown auto-populating Operational Reason, Reporting To, Hierarchy Level (0-8), Designation Title, Department, Airspace Zone, Responsible Account Holder, and Pre-Checked Modules.
  - Supports 6 pre-configured templates (Operations Manager L5, Customer Care to L7 Escalation, Executive Director L7, Operations Coordinator L4, Treasury Officer L3, Standard Aviator L0).
  - Provided full Add, Edit, and Delete options with system role safeguards.
- **Live User Session Testing Gateway**:
  - Added "⚡ Test Interface As This User" button with instant session switching (`onSwitchActiveUser`) in `UserModuleAllottedView.tsx` to verify module allotment in live UI.
- **Executive Dark Theme in Role Permissions Manager**:
  - Upgraded `RolePermissionsManagerView.tsx` to match TruvAer executive slate dark styling and added designated Permission Rule Leads.
- **Deduplication & Persistence Bug Fix**:
  - Safely removed redundant "Individual User Module Clearance Overrides" sub-tab and duplicate view block.
  - Eliminated the database reload filter bug in `mockDatabase.ts`, ensuring custom roles and user module overrides never reset to default.

---

## [v2.6.0] – 2026-10-07
### 🚀 Complete Business Listing Interface Redesign & Space Optimization
- **Eliminated Wasted Gaps & Space Across All 3 Sections**: Removed horizontal and vertical spacing anomalies across directory listing cards.
- **Removed Entire $ Estimated Budget Column**:
  - Fully eliminated the bloated `$ Estimated Budget: ₹1,500,000 / Sector` and `Rate: ₹3,50,000 / Block Hour` container that caused vast horizontal voids.
- **Relocated Rating & Actions Under VIDEO / PHOTO MEDIA (RIGHT)**:
  - Moved `Rating: Destination Profile & Reviews` with live star rating and review count directly beneath the hero media container.
  - Positioned `Issue Quotation`, `Direct Service Offer`, and `Unlock Direct (10 Cr)` in a unified quick-action relay under the rating.
- **Eliminated Left-Side Gap After Chat**:
  - Removed awkward blank gaps after the `Chat` button on the left section.
  - Positioned `Chat` directly above `Issue Quotation` and `Send Direct Offer` in a unified action stack.
- **Admin/Manager Self-Creation Lockdown Maintained**:
  - `+ Create`, `+ Category`, and `Business Location` options strictly restricted to `ADMIN`, `SUPER_ADMIN`, and `MANAGER` accounts. Business users cannot self-add new businesses.
- **Real Dynamic Aerospace Data**:
  - Removed placeholder university mock copy and restored full dynamic mapping from real directory entries (`item.name`, `item.services`, `item.facilities`, `item.amenities`, `item.phone`, `item.email`, etc.).
- **Automated Domain Documentation**:
  - Updated `docs/CHANGES_HISTORY.md`, `docs/MARKETING_SECTION.md`, `docs/BUSINESS_SECTION.md`, `docs/ADMIN_SECTION.md`, and `src/marketing/README.md`.

---

## [v2.5.0] – 2026-10-07
### 🖼️ Complete Business Listing Card Interface Transformation
- **Dual-Card Side-by-Side Architectural Layout**: Redesigned the business listing view into two complementary containers matching the provided specification image:
  1. **Main Business Card (Left)**:
     - **Navy Blue Info Panel (`#1c365d`)**:
       - Circular white logo badge in top-left with fallback icon.
       - Interactive favorite heart toggle button in top-right.
       - Large bold organization title with city location pin line.
       - Distinctive white rounded rectangular badge pills (`"University of Excellence"`, `"Top 100 worldwide"`, `"TRUEAER: ID"`).
       - Triple metadata divider rows:
         - Row 1: ThumbsUp (Category) and Users (Scale/Community count).
         - Row 2: GraduationCap (Active service capabilities count).
         - Row 3: Moon / Pricing rate info with Info circle tooltip.
     - **Hero Media Column**:
       - Full-bleed facility/campus/aircraft hero photograph.
       - Top-right `Advertising ⓘ` dark pill badge.
       - Facility tour playback trigger.
  2. **Dedicated Contact & Action Card (Right)**:
     - Prominent phone contact line (`Phone` icon + number).
     - Organization email line (`Mail` icon + email).
     - Full physical address with `MapPin` icon.
     - **Exact 5 Action Button Stack**:
       1. `[💬 Chat]`: White pill button with grey border and dark text.
       2. `[📄 Issue Quotation]`: Solid blue button (`#4872e6`).
       3. `[✈ Send Direct Offer]`: Solid blue button (`#4872e6`).
       4. `[🔒 Direct Service Offer]`: Solid blue button with lock icon (`#4872e6`).
       5. `[🔒 Unlock Direct (10 Cr)]`: Solid emerald green button (`#48bb78`) with unlock status state.

---

## [v2.4.0] – 2026-10-07
### 🎨 Business Listing Layout Streamlining
- **Removed $ Estimated Budget & Rate Section**: Removed the entire middle-column `$ Estimated Budget: ₹1,500,000 / Sector` and `Rate: ₹3,50,000 / Block Hour` container, eliminating excess vertical gaps and height bloat.
- **Relocated Rating & Engagement Actions**: Moved the `Rating`, `Destination Profile & Reviews`, `Issue Quotation`, `Direct Service Offer`, and `Unlock Direct` buttons from the bottom of the middle column to directly beneath the **VIDEO / PHOTO MEDIA (RIGHT)** column.
- **Unified Left Action Button Stack**: Removed the awkward blank gap after the `Chat` button on the left column. Positioned `Chat` directly above `Issue Quotation` and `Send Direct Offer` in a unified, full-width vertical action stack.

### 🔐 Administrative & Managerial Security Governance
- **Self-Creation Lockdown for Business Users**: Removed the `+ Create`, `+ Category`, and `Business Location` options for business accounts. Business users can no longer self-publish new business organizations or locations.
- **Strict Role Enforcement**: Creating new listings, submitting categories, or registering business locations is restricted exclusively to `ADMIN`, `SUPER_ADMIN`, and `MANAGER` roles.
- **Server/Client Validation**: Protected submission handlers (`handleCreateListingSubmit` and location modal `onSubmit`) with strict `isAdminOrManager` gatekeeping.

### 📚 Systematic Documentation Structure
- Created dedicated documentation files per domain:
  - `docs/ADMIN_SECTION.md`
  - `docs/MARKETING_SECTION.md`
  - `docs/BUSINESS_SECTION.md`
  - `docs/CHANGES_HISTORY.md`
  - Domain-specific READMEs in `src/erp/README.md`, `src/marketing/README.md`, and `src/business/README.md`.

---

## [v2.3.0] – 2026-10-07
### 🧼 ServiceScout Business Interface Cleanliness
- **Removed Account Profile Button in Business UI**: Omitted the `Account Profile` quick button in ServiceScout when logged in as a business user (`currentBusiness` or `isVerifiedBusinessUser`).
- **Clean Focus**: Corporate account identity and credentials remain managed via the top navigation bar, preventing UI duplication in directory search.

---

## [v2.2.0] – 2026-10-07
### 🏛️ Complete Domain Modularization
- Sorted the entire codebase under `src/` into isolated domain directories:
  - `src/marketing/`: Growth, ServiceScout, RFQs, LinkedIn feed.
  - `src/news/`: Editorial media, news articles, tickers.
  - `src/erp/`: PMS Desk, RBAC console, CPanel, CRM platform.
  - `src/business/`: Merchant onboarding, corporate wallets, verification.
  - `src/auth/`: Identity, 2FA/MPIN, OTP, password recovery.
  - `src/shared/`: Navbar, location autocomplete, payment modals.
- Provided backward-compatible barrels in `src/components/` to preserve legacy imports.
- Published `MODULES_ARCHITECTURE.md` establishing team ownership and CODEOWNERS contracts.

---

## [v2.1.0] – 2026-10-06
### 🏷️ Taxonomy Governance & Content Moderation
- **Approved Taxonomy Desk**: Centralized review desk for Categories and Subcategories with full CRUD capabilities for administrators.
- **'Other' Taxonomy Proposals**: Permitted business users to submit novel category/subcategory proposals under "Other" pending administrative verification.
- **Post Publisher Permissions**: Enforced that only the user/business who published a story or listing has edit and delete rights.
- **Re-publish Attribution**: Replaced generic sharing with formal "Re-publish", guaranteeing original creator credit retention.
- **Progressive Moderation Escalation**: Implemented automated publishing bans upon verified reports:
  - 1st Strike: 7-Day suspension
  - 2nd Strike: 14-Day suspension
  - 3rd Strike: 30-Day suspension

---

## [v2.0.0] – 2026-10-06
### 🚢 Deployment & Infrastructure Resilience
- **Dynamic Port Binding**: Resolved Cloud Run `DEPLOYMENT_ROLLOUT` failures by creating `server.js` with dynamic `process.env.PORT || 3000` listening on `0.0.0.0`.
- **Health Probes**: Implemented `/_healthz` endpoint for cloud container readiness checks.
- **Strict Hierarchy Escalation in PMS**: Configured `AdminPMSDesk.tsx` to strictly restrict task reassignment to the immediate next officer level (e.g., L1 → L2, L2 → L3).

# TRUVAER Aerospace – Modular Domain Architecture Guide

This document is the official architectural handbook for engineering teams, domain leads, security reviewers, and developers working on the TRUVAER Aerospace web platform.

---

## 1. Executive Overview & Domain-Driven Structure

To enable multiple engineering teams to work concurrently without merge conflicts, code entanglements, or accidental permission leaks, the application is organized into **isolated domain modules** under `src/`. Each folder represents a bounded domain context with its own components, utilities, and a clean public API (`index.ts`).

```
src/
├── marketing/      # Domain 1: Marketing, Marketplace & ServiceScout Directory
├── news/           # Domain 2: Aviation Media, News & Industry Feeds
├── erp/            # Domain 3: ERP Platform, PMS Desk, RBAC & CRM Portal
├── business/       # Domain 4: Business Accounts, Registration & Verification
├── auth/           # Domain 5: Identity, User Accounts, 2FA & Security
├── shared/         # Cross-Cutting: Global Navigation, Locations & Shared Modals
├── data/           # Core Data Stores, Taxonomy & Location Corridors
├── utils/          # Privacy, Masking & Formatting Helpers
├── db/             # Persistence Engines & SQL Schemas
├── firebase/       # Firebase Cloud Integration Config
├── types.ts        # Unified TypeScript Interfaces & Domain Models
└── App.tsx         # Orchestration & Top-Level Tab Switcher
```

---

## 2. Domain Modules & Team Ownership Breakdown

### 🎯 2.1 Marketing Module (`src/marketing/`)
* **Team Ownership**: Growth, Marketplace & Directory Engineering Team
* **CODEOWNERS Path**: `@truvaer/growth-team src/marketing/`
* **Primary Scope**:
  - **ServiceScout Directory**: Multi-faceted aerospace provider search engine and filters sidebar.
  - **Available Details Display**: Live capability panels (Category, Sub-Category, Services, Country, Airport Hubs).
  - **Taxonomy Administration**: AddCategorySubCategoryModal, approved taxonomy inspection, and pending approval submissions.
  - **Social Feed & Media**: Aviation provider story feeds (`LinkedInMarketingFeed.tsx`), branding/video management modals.
  - **Re-publish & Moderation**: Re-publish attribution workflows, report modal with suspension strikes.
  - **Quotations & RFQ**: Direct service quotation modals and instant RFQ dispatch.
* **Key Files**:
  | File | Responsibility |
  | --- | --- |
  | `MarketingPortal.tsx` | Main portal view, responsive 2-column layout & listings renderer |
  | `ServiceScoutSearchEngine.tsx` | 5-point multi-filter engine with live detail cards below |
  | `ServiceScoutFilterSidebar.tsx` | Fixed left-column filter sidebar with category & geography accordions |
  | `LinkedInMarketingFeed.tsx` | Interactive aviation community & provider story stream |
  | `AddCategorySubCategoryModal.tsx`| Taxonomy creation modal with 'Other' category proposal flow |
  | `AddServicesToListingModal.tsx` | Service catalog expansion modal for business providers |
  | `DirectQuotationModal.tsx` | Direct RFQ & quotation submission modal |
  | `DirectServiceOfferModal.tsx` | Business provider outreach & pitch modal |
  | `StoresPortal.tsx` | Aviation parts & merchandise portal |
  | `index.ts` | Clean public barrel export for the Marketing domain |

---

### 📰 2.2 News Module (`src/news/`)
* **Team Ownership**: Editorial & Aviation Media Team
* **CODEOWNERS Path**: `@truvaer/editorial-team src/news/`
* **Primary Scope**:
  - Aviation news journalism, editorial categories (Commercial, Military, Space, General Aviation, Business Jets).
  - Live market tickers & responsive media ad slots.
* **Key Files**:
  | File | Responsibility |
  | --- | --- |
  | `NewsPortal.tsx` | Industry news articles, bookmarking, and category filters |
  | `index.ts` | Clean public barrel export for the News domain |

---

### 💼 2.3 ERP & CRM Module (`src/erp/`)
* **Team Ownership**: Enterprise Operations, RBAC & Administrator Desk Team
* **CODEOWNERS Path**: `@truvaer/erp-team src/erp/`
* **Primary Scope**:
  - **Project Management System (PMS Desk)**: SLA timers, officer hierarchy, audit trails, and strict level reassignment.
  - **Role-Based Access Control (RBAC)**: Admin permissions matrix, level elevations (L1 to L8), and approval pipelines.
  - **Approved Taxonomy Desk**: Dedicated review queue for Category and Subcategory additions, approving 'Other' proposals, and deleting obsolete taxonomies.
  - **Verification Desks**: Compliance document inspection, corporate registration vetting, and hard-lock enforcement.
  - **Content Moderation & Strikes Desk**: Report tracking, user suspension enforcement (7, 14, 30 days), and post deletion.
  - **CRM Portal & Sales Ledger**: Lead pipeline tracking, customer inquiries, and regional cash-flow analytics.
* **Key Files**:
  | File | Responsibility |
  | --- | --- |
  | `AdminERPPlatform.tsx` | Enterprise back-office navigation hub and sub-system dashboard |
  | `AdminPMSDesk.tsx` | Task management, SLA escalations, and strict next-level reassignment |
  | `AdminCPanel.tsx` | Unified administrator control panel and platform settings |
  | `AdminRBACControlPanel.tsx` | Role elevation approvals, department assignments, and permissions |
  | `AdminVerificationDesk.tsx` | Verification audit queues for corporate incorporation and tax IDs |
  | `AdminServicesApprovalDesk.tsx` | Moderation queue for business services and listings |
  | `ApprovedTaxonomyDesk.tsx` | Central catalog for reviewing, editing, and deleting approved taxonomies |
  | `ApprovedTaxonomyModal.tsx` | Quick taxonomy inspector modal |
  | `CRMPortal.tsx` | Lead tracking, inquiries, and customer communication pipelines |
  | `SalesDashboard.tsx` | Financial reporting and transaction summaries |
  | `RegionalCashFlowAnalytics.tsx`| Geographic revenue breakdown and cash-flow metrics |
  | `index.ts` | Clean public barrel export for the ERP domain |

---

### 🏢 2.4 Business Module (`src/business/`)
* **Team Ownership**: Business Onboarding & Merchant Operations Team
* **CODEOWNERS Path**: `@truvaer/business-ops src/business/`
* **Primary Scope**:
  - Corporate registration with PAN/TAN/SWIFT validation.
  - Multi-location onboarding (City, State, Country autocomplete).
  - Corporate wallet balance, billing credit management, and verification modal displays.
* **Key Files**:
  | File | Responsibility |
  | --- | --- |
  | `BusinessRegisterForm.tsx` | Multi-step corporate onboarding with location auto-suggestions |
  | `BusinessLogin.tsx` | Dedicated corporate portal authentication with 2FA/MPIN |
  | `BusinessVerificationModal.tsx` | Verification state inspector (PENDING, VERIFIED, REJECTED, HARD-LOCKED) |
  | `BusinessCorporateWalletModal.tsx` | Corporate wallet balance, credit recharge, and billing history |
  | `index.ts` | Clean public barrel export for the Business domain |

---

### 🔐 2.5 Auth & Identity Module (`src/auth/`)
* **Team Ownership**: Identity & Platform Security Team
* **CODEOWNERS Path**: `@truvaer/security-team src/auth/`
* **Primary Scope**:
  - Unified authentication gateway with role routing (Regular User vs Business User vs Admin).
  - 2FA/MPIN security modals, OTP verification flows, and self-service password reset.
  - User profile management, password updates, and session termination.
* **Key Files**:
  | File | Responsibility |
  | --- | --- |
  | `AuthGateway.tsx` | Tabbed login and registration gateway |
  | `UserLogin.tsx` | Individual / Pilot authentication form |
  | `RegularRegisterForm.tsx` | Individual user registration form |
  | `OtpVerificationView.tsx` | 6-digit OTP verification view with resend throttle |
  | `TwoFactorMpinModal.tsx` | 4-digit security PIN verification modal |
  | `PasswordResetModal.tsx` | Secure password reset flow |
  | `UserProfileModal.tsx` | End-user profile editor and security settings |
  | `ProfileMenuInterfaceModal.tsx` | Top-nav quick profile drawer and role switch options |
  | `index.ts` | Clean public barrel export for the Auth domain |

---

### 🌐 2.6 Shared Module (`src/shared/`)
* **Team Ownership**: Core Platform & Foundation Team
* **CODEOWNERS Path**: `@truvaer/platform-core src/shared/`
* **Primary Scope**:
  - Global navigation bar (`Navbar.tsx`) with role switchers, theme toggles, and notification counters.
  - **Location Autocomplete Engine** (`LocationAutocomplete.tsx`): 3+ character auto-suggestions with ICAO/IATA hub data.
  - Global payment gateways (`WalletRazorpayModal.tsx`) and real-time communication hub (`CommunicationHubModal.tsx`).
* **Key Files**:
  | File | Responsibility |
  | --- | --- |
  | `Navbar.tsx` | Global top navigation, active role badge, wallet trigger & search |
  | `LocationAutocomplete.tsx` | 3+ character auto-suggest dropdown with state and country linkage |
  | `WalletRazorpayModal.tsx` | Credit top-up gateway with Razorpay simulated workflow |
  | `CommunicationHubModal.tsx` | Direct messaging and communications center |
  | `ApiInspectorModal.tsx` | Live production telemetry and network audit inspector |
  | `FirebaseStatusModal.tsx` | Firebase connection and cloud sync telemetry |
  | `index.ts` | Clean public barrel export for the Shared domain |

---

## 3. Team Access, Repository Permissions & CODEOWNERS Model

To enforce domain isolation in git repositories (GitHub / GitLab / Bitbucket), teams should use folder-level CODEOWNERS rules:

```ini
# Core Platform maintains top-level files
*                               @truvaer/platform-core
/src/App.tsx                    @truvaer/platform-core
/src/types.ts                   @truvaer/platform-core

# Domain-specific access restrictions
/src/marketing/                 @truvaer/growth-team
/src/news/                      @truvaer/editorial-team
/src/erp/                       @truvaer/erp-team
/src/business/                  @truvaer/business-ops
/src/auth/                      @truvaer/security-team
/src/shared/                    @truvaer/platform-core
/src/data/                      @truvaer/platform-core
/src/utils/                     @truvaer/security-team
```

### 🛡️ Dependency Boundary Rules
1. **Public API Contract**: Each domain MUST expose its public components and hooks via its `index.ts` barrel file. Other domains and `App.tsx` must import exclusively from that barrel, never from internal deep paths.
2. **No Circular Domain Imports**: Domains must not import internal components from peer domains (e.g., `src/marketing` must not import private components from `src/erp`). Shared cross-cutting components belong in `src/shared/`.
3. **Types Centralization**: Universal domain models reside in `src/types.ts`. Module-specific transient view types should remain inside the corresponding module.

---

## 4. Strict Security & Access Control Policies

### 🔒 4.1 Business Profile Isolation Policy
1. **Ownership Constraint**: A business user account can **only modify the business profile and service listings created by their account**.
2. **Prohibited Actions**: A business user cannot view edit buttons, edit media, or alter listings created by any other company.
3. **Multi-Business Support**: If a single user account registers multiple businesses, they have exclusive edit rights over all profiles they created, but none from others.
4. **Administrative Override**: Only users with the `ADMIN` or `SUPER_ADMIN` role have permission to edit or verify all listings globally.
5. **Enforcement**: Applied at both the UI presentation layer (`canEditListing`) and the mutation handlers (`handleSaveMediaAndBranding`).

### ⚡ 4.2 Task Bar Reassignment Progression Policy
1. **Next-Level Only**: In `AdminPMSDesk.tsx`, when reassigning a task, the dropdown strictly filters candidates to the **immediate next level** from the current officer's level (e.g., L1 → L2, L2 → L3).
2. **Backend Guard**: `db.reassignAdminTaskToNextLevel(taskId, targetAdminId)` rejects any reassignment that does not escalate strictly up the hierarchy chain.

### 📍 4.3 Location Intelligence (3+ Characters Rule)
1. Typing **3 or more characters** queries `COMPREHENSIVE_LOCATIONS` across cities, states, and countries.
2. Standardized format: `[City], [State/Province], [Country]` (e.g. `Hyderabad, TS, India` or `Hyderabad, Sindh province, Pakistan`).
3. Selecting a location populates the primary hub, ICAO/IATA code, and links the listing to geographic filter corridors (APAC, EMEA, NA, LATAM).

### 🏷️ 4.4 Taxonomy Lifecycle (Approved vs. 'Other' Business Additions)
1. **Approved Taxonomy Catalog**: Visible to all users in the taxonomy explorer. Categories and Subcategories can be added, updated, or deleted by Administrators.
2. **Business User 'Other' Submission**: Business users can submit novel category/subcategory proposals under 'Other'. These enter a pending approval state and are only surfaced platform-wide upon Admin review.
3. **Admin Taxonomy Desk**: Located in `src/erp/ApprovedTaxonomyDesk.tsx`, offering full CRUD actions for platform taxonomy.

### 🚩 4.5 Post Moderation, Re-publish & Escalation Strikes
1. **Publisher Rights**: Post publishers have exclusive rights to Edit or Delete their own posts.
2. **Re-publish Attribution**: The generic "Share" option is replaced with "Re-publish", preserving original creator credits and preventing credit hijacking.
3. **Escalation Strike System**: Users reporting inappropriate content send alerts directly to the Admin Moderation Desk. Repeat offenders incur automated temporary publishing bans:
   - **1st Violation**: 7-Day Publishing Suspension
   - **2nd Violation**: 14-Day Publishing Suspension
   - **3rd Violation**: 30-Day Publishing Suspension

---

## 5. Development Workflow & Best Practices

### 📦 5.1 Importing Within and Across Modules
- **Within the same module**: Use relative imports (e.g., in `marketing/MarketingPortal.tsx`, import `./LinkedInMarketingFeed`).
- **Across modules**: Import from the module's public entry point or folder (e.g., `import { LocationAutocomplete } from '../shared/LocationAutocomplete';`).
- **In `App.tsx`**: Import directly from the module barrel:
  ```typescript
  import { MarketingPortal } from './marketing';
  import { AdminCPanel, CRMPortal } from './erp';
  import { BusinessVerificationModal } from './business';
  import { AuthGateway } from './auth';
  import { Navbar, LocationAutocomplete } from './shared';
  ```

### 🛠️ 5.2 Local Development Commands
```bash
# Start local development server on port 3000
npm run dev

# Check TypeScript types without emitting
npm run lint

# Compile production bundle
npm run build

# Run production server
npm run start
```

### 🚢 5.3 Cloud Run Production Server
The production deployment uses `server.js` with Express:
- Dynamically respects the Cloud Run injected `$PORT` (default 3000).
- Exposes `/_healthz` for health and readiness probes.
- Serves static assets from `dist/` with full SPA HTML5 history fallback.

---

## 6. Section Documentation & Continuous Changes History

For detailed domain-specific engineering guides, consult the dedicated section documents:

| Documentation File | Domain / Scope | Key Contents |
| :--- | :--- | :--- |
| **[`docs/ADMIN_SECTION.md`](./docs/ADMIN_SECTION.md)** | Admin & ERP Console | RBAC levels (L0-L8), PMS Desk strict reassignment, Approved Taxonomy Desk, Moderation & strike ban ladder (7/14/30 days). |
| **[`docs/MARKETING_SECTION.md`](./docs/MARKETING_SECTION.md)** | Marketplace & Directory | ServiceScout layout, 3-column listing card architecture (Left action stack with Chat, Middle details, Right media & RFQs). |
| **[`docs/BUSINESS_SECTION.md`](./docs/BUSINESS_SECTION.md)** | Business Accounts | Account boundaries, profile isolation, listing creation lockdown (Admin & Manager only), corporate digital wallet. |
| **[`docs/CHANGES_HISTORY.md`](./docs/CHANGES_HISTORY.md)** | Continuous Revision Log | Chronological changelog recording all architectural, UI, and security updates across versions. |

Each domain directory also maintains its own local guide:
- `src/marketing/README.md`
- `src/erp/README.md`
- `src/business/README.md`

---

## 7. Role & Module Access Governance Architecture

### 7.1 Master Module Assignment Matrix
- Configured in `src/erp/AdminRBACControlPanel.tsx`.
- **Comprehensive Guide**: See [`docs/MASTER_MODULE_MATRIX_GUIDE.md`](./MASTER_MODULE_MATRIX_GUIDE.md) for full architecture, platform module inventories, responsible account holders, and runtime reflection points.
- Maps all core platform modules to named governance Account Holders for operational scalability.
- Streamlined search and category filtering eliminates cognitive overload while allowing direct allotment toggling per role and rank.

### 7.2 1-Click Role Profile Templates
- Pre-packaged templates auto-populate Operational Reason, Reporting Line, Rank (L0-L8), Department, Airspace Zone, Responsible Account Holder, and Pre-Checked Modules.
- Eliminates manual error and provides instant standardization across regional hubs and executive escalations.

### 7.3 Multi-Role Session Testing Gateway
- Located in `src/erp/UserModuleAllottedView.tsx`.
- Connects through `App.tsx` via `onSwitchActiveUser`, enabling instant live preview of any allotted user persona.




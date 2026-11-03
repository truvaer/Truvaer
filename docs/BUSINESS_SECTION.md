# TRUVAER Aerospace – Business & Merchant Section Documentation

This document describes the operational rules, restrictions, permissions, and onboarding flows within the **Business Domain** (`src/business/`).

---

## 1. Business User Operational Boundaries

### 🚫 Creation Restrictions
- **Self-Creation Prohibited**: Business accounts cannot create new businesses or directory listings independently. All new businesses must be registered and authenticated by **Admins or Managers**.
- **No Self-Taxonomy Creation**: Business users cannot add categories or new business locations directly from the ServiceScout directory. These administrative tools are restricted to Admin and Manager roles.
- **No Account Profile Clutter**: Inside ServiceScout, the "Account Profile" button is hidden for business users to maintain a focused search and RFQ workspace.

### 🔒 Profile Edit Isolation Policy
- **Account Ownership Principle**: A business account has permission to edit **only the profile, media, and listings created by that specific account**.
- **Cross-Account Lock**: A business user cannot view edit buttons, edit media, or alter listings belonging to other organizations.
- **Multi-Business Support**: If a single user account created multiple businesses, they have exclusive edit rights over all profiles they created, but none from others.
- **Admin Sovereign Access**: Global editing across all listings is restricted to `ADMIN` and `SUPER_ADMIN`.

---

## 2. Business Onboarding & Verification

- **File**: `src/business/BusinessRegisterForm.tsx`
- **Location Intelligence**: Requires 3+ characters to auto-suggest global aviation locations (e.g., `Hyderabad, TS, India`).
- **Compliance Vetting**: Validates PAN/TAN/SWIFT and corporate incorporation records.
- **Verification States**:
  - `PENDING`: Initial state upon registration, awaiting Admin desk verification.
  - `VERIFIED`: Granted verified provider badge and service capabilities.
  - `REJECTED`: Fails compliance inspection.
  - `HARD_LOCKED`: Administrative suspension prohibiting all directory engagements.

---

## 3. Corporate Digital Wallet

- **File**: `src/business/BusinessCorporateWalletModal.tsx`
- **Credits Allocation**: Tracks corporate credits used for lead unlocks (10 Cr per direct contact relay), RFQ dispatches, and featured search placement.
- **Billing History**: Accessible directly from the top navigation wallet trigger.

# TRUVAER Aerospace – Marketing & Marketplace Section Documentation

This document describes the user interface architecture, listing card layout specifications, and directory systems within the **Marketing Domain** (`src/marketing/`).

---

## 1. ServiceScout Marketplace Directory Overview

The **ServiceScout Marketplace** connects aircraft operators, MRO facilities, FBO terminals, charter providers, and aviation academies worldwide with corporate aviation procurers and pilots.

Key Components:
- **`MarketingPortal.tsx`**: Central orchestrator for the directory view, filter drawer, and listings layout.
- **`ServiceScoutSearchEngine.tsx`**: Top multi-filter search engine with live active filter badges.
- **`ServiceScoutFilterSidebar.tsx`**: Left accordion filter navigation (Category, Sub-Category, Services, Countries, Cities).
- **`LinkedInMarketingFeed.tsx`**: Social aviation story stream with publisher attribution and re-publishing.

---

## 2. Business Listing Card 3-Section Architecture

Each directory entry in ServiceScout is rendered as a clean, dense, gap-free **3-Section Responsive Layout** without wasteful vertical white or dark spaces:

```
┌───────────────────────────────────────┬─────────────────────────────────────────────────┬───────────────────────────────────────┐
│ SECTION 1: BUSINESS IDENTITY & ACTIONS│ SECTION 2: SERVICES & INFRASTRUCTURE            │ SECTION 3: VIDEO / PHOTO MEDIA (RIGHT)│
│                                       │                                                 │                                       │
│ [Logo] Organization Name [Heart]      │ 💼 Services & Operational Capabilities:         │ ┌───────────────────────────────────┐ │
│ 📍 City, Country                      │ • Capability 1   • Capability 2                 │ │   [Hero Photo or Video Preview]   │ │
│ [Category] [SubCategory] [TRUEAER ID] │ • Capability 3   • Capability 4                 │ │   [Advertising ⓘ]  [▶ Play Tour]  │ │
│                                       │                                                 │ └───────────────────────────────────┘ │
│ ────────── Contact Relay ───────────  │ 🏢 Infrastructure & Facilities:                 │                                       │
│ 📞 Phone (Masked until unlocked)      │ • Helipad   • VIP Lounge   • Fueling Bay        │ ⭐ 4.9 ★ (24 Reviews) [Top Rated]     │
│ ✉️ Email (Masked until unlocked)      │                                                 │                                       │
│ 📍 Full Physical Address              │ 🛡️ Amenities & Standards:                       │ [👁 Rating: Destination Profile &     │
│                                       │ • 24/7 Security • Crew Rest • Direct Customs    │     Reviews Button]                   │
│ ───── Unified Action Stack (NO GAPs) ─│                                                 │                                       │
│ [💬 Chat]                             │ ℹ️ Operational Specifications:                  │ ──────── Quick Action Relay ───────── │
│ [📄 Issue Quotation]                  │ • Est. Year • Registration / Authorization No.  │ [📄 Issue Quotation]                  │
│ [✈ Send Direct Offer]                 │ • Aviation Verification: Verified Enterprise    │ [🔒 Direct Service Offer]             │
│                                       │ • [Edit Media & Listing] (If Owner/Admin)       │ [🔒 Unlock Direct (10 Cr)]            │
└───────────────────────────────────────┴─────────────────────────────────────────────────┴───────────────────────────────────────┘
```

### 📐 Section-by-Section Details

#### Section 1: Business Identity & Contact Relay
- **Corporate Identity**: Logo with fallback avatar, verified enterprise status badge, interactive favorite heart toggle, bold organization title, and city/country coordinates.
- **Taxonomy Tags**: Clean badge pills for Category, Sub-Category, and unique TRUEAER ID.
- **Protected Contact Relay**: Masked phone (`+91 99999XXXXX`) and blurred corporate email until unlocked with credits; full physical address.
- **Left Action Stack (No Gaps)**: `Chat` button positioned directly above `Issue Quotation` and `Send Direct Offer` in a unified, tight vertical stack.

#### Section 2: Services, Facilities & Operational Capabilities
- **No Budget Column**: The bloated `$ Estimated Budget` and `Rate / Block Hour` column is removed completely, eliminating all horizontal gaps.
- **Services Badges**: Rich dynamic pills for all offered aviation services and capabilities with sparkle icons.
- **Infrastructure & Facilities**: Dedicated tags for hangars, helipads, runways, and lounges.
- **Compliance & Standards**: Security vetting, 24/7 customs clearance, and terminal standards.
- **Operational Specs**: Establishment year, registration number, and verified status.

#### Section 3: VIDEO / PHOTO MEDIA (RIGHT) with Rating & Quick Action Relay
- **Hero Photo & Video Player**: High-resolution facility/fleet media with top-right `Advertising ⓘ` badge and video tour playback.
- **Rating: Destination Profile & Reviews**: Placed directly under the media container, displaying live star rating, review counts, and the interactive `Rating: Destination Profile & Reviews` button that launches the complete destination profile and customer reviews modal.
- **Quick Action Relay**:
  1. `[📄 Issue Quotation]`: Opens the instant RFQ quotation modal.
  2. `[🔒 Direct Service Offer]`: Opens the direct service proposal modal.
  3. `[🔒 Unlock Direct (10 Cr)]`: Unlocks masked phone/email coordinates using corporate credits, with instant toggle to unlocked state.

---

## 3. Administrative Governance & Self-Creation Lockdown

- **Restricted Creation Actions**: The `+ Create`, `+ Category`, and `Business Location` options in `ServiceScoutSearchEngine.tsx` are strictly restricted to `ADMIN`, `SUPER_ADMIN`, and `MANAGER` accounts. Business users cannot self-add new businesses.
- **Profile Edit Isolation**: Business accounts have permission to edit only the listings and profiles created by their account. Admin accounts retain sovereign cross-organization editing.
- **Clean Business Interface**: The quick "Account Profile" button is suppressed in the Business user interface inside ServiceScout to keep the directory clutter-free.

---

## 3. Social Aviation Feed & Re-publish Workflows

- **Re-publish Attribution**: The generic "Share" action is replaced with "Re-publish", preserving original creator credits and preventing credit hijacking.
- **Publisher Edit/Delete Rights**: Only the authenticated user or business account that published a post can edit its content or delete it.
- **Reporting Workflow**: Questionable posts can be reported directly to the Admin Moderation Desk, triggering strike reviews (7/14/30-day bans).

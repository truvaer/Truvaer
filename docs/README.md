# Truvaer.com – Commercial Aviation Marketplace & Enterprise Sale Portal

A high-performance, full-featured commercial aviation marketplace, directory, and enterprise sales platform built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Quickstart (Immediate Download & Launch)

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20+ recommended)
- **npm**: v9.0.0 or later (or `pnpm` / `bun` / `yarn`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### 3. Production Build & Launch
To verify or run the optimized production bundle locally:
```bash
# Build the production bundle
npm run build

# Launch the production preview server on port 3000
npm run preview
```

---

## 🔑 Pre-Configured Test Credentials

For fast review and walkthroughs, the application includes pre-seeded profiles accessible via the top navigation switcher:

### 1. Super Administrator (Senior Management & ERP)
- **Email**: `admin@truvaer.com` or `aditya@yarifly.com`
- **Role**: L8 Global Platform Administrator / Founder
- **Access**: Full Admin CPanel, Hard-lock Verification, Ledger, Module Permissions, Global Settings.

### 2. Business Operator (Aviation Enterprise)
- **Email**: `compliance@aeroglobal.in` or `ops@aerolux.com`
- **Role**: Verified Aviation Business / Charter Operator
- **Access**: Business Dashboard, Services Listing, Corporate Wallet, Lead Inquiries, Invoices & Sales Ledger.

### 3. Aviator / Pilot (Regular User)
- **Email**: `pilot@truvaer.aero`
- **Role**: Verified Cadet / Commercial Pilot
- **Access**: Directory Search, Service Booking, Digital Wallet, Direct Chat & Reviews.

---

## 🏛️ Domain-Driven Modular Codebase Architecture

The codebase has been refactored into domain-separated modules under `src/` so different teams can independently build, test, and maintain their specific systems without cross-domain entanglements:

- **`src/marketing/`**: Marketplace, ServiceScout multi-filter search engine, live details display, and LinkedIn social story feeds.
- **`src/news/`**: Aerospace editorial journalism, live market tickers, and sector updates.
- **`src/erp/`**: Administrative desks, PMS task board (strict next-level reassignment), RBAC permissions matrix, and CRM portal.
- **`src/business/`**: Corporate registrations, multi-location onboarding (3+ character auto-suggestions), and verification audits.
- **`src/auth/`**: Authentication gateway, 2FA/MPIN, OTP validation, and account profile controls.
- **`src/shared/`**: Global navbar, location autocomplete engine, payment gateways, and communication modals.

👉 **For the complete architecture, team ownership breakdown, and developer guides, consult [MODULES_ARCHITECTURE.md](./MODULES_ARCHITECTURE.md).**

---

## 📦 Key Functional Modules

1. **Marketplace & Global Directory:**
   - Real-time search across flight academies, private jet charters, aircraft dealers, avionics labs, and MROs.
   - Standardized single-line Category and Subcategory tags.
   - Multi-country and regional territory filters (India, US, UAE, Europe, Singapore).

2. **Enterprise Sale Portal:**
   - **Interactive Visual Sales Funnel:** 6-stage funnel with step conversion rates, deal volumes, and clickable stage filters.
   - **1-Click Quick Status Actions:** Progress leads from `New` to `Contacted`, `Qualified`, `Proposal`, `Negotiation`, or `Won` directly from the row.
   - **Comprehensive Sales Ledger:** Direct `Action ▼` button on each transaction for instant payments, tax receipts, and record editing.
   - **Export Tools:** Instant export to Excel/CSV, clipboard copy, and print-ready PDF invoices.
   - **Automated 5% Platform Commission Sheet:** Triggered on deal completion and logged for treasury audit.

3. **Digital Wallets & Razorpay Gateway:**
   - Corporate and user digital wallets for contact unlocks, promotions, and instant deal settlements.
   - Clean top-nav placement adjacent to user profile.

4. **Multi-Department Admin ERP Console:**
   - L0 to L8 role-based access control (RBAC).
   - Real-time audit logs, TAN/PAN hard-lock verification, and territory management.

---

## 🌐 Production Deployment Options

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```
*Build Command:* `npm run build`  
*Output Directory:* `dist`

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```
*Build Command:* `npm run build`  
*Publish Directory:* `dist`

### Deploy with Docker
Create a standard `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🛠 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server on port 3000 |
| `npm run build` | Compiles optimized production bundle into `dist/` |
| `npm run preview` | Serves the `dist/` production build locally |
| `npm run start` | Alias for `npm run preview` for hosting providers |
| `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) |
| `npm run clean` | Deletes previous `dist/` build artifacts |

---

## 📄 License
Proprietary & Confidential – Truvaer / YariFly.

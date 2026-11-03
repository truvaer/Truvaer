export interface AppPlatformModule {
  id: string;
  name: string;
  category: 'ERP' | 'FINANCE' | 'CRM' | 'HR' | 'COMMUNICATION' | 'PMS' | 'COMPLIANCE' | 'SYSTEM';
  categoryLabel: string;
  description: string;
  isStandardAllowed?: boolean; // Allowed on Standard User baseline
}

export const MASTER_APP_MODULES: AppPlatformModule[] = [
  // --- Standard User Baseline Enabled (Core daily tasks) ---
  {
    id: 'user_dashboard',
    name: 'Personal Aviator Dashboard',
    category: 'ERP',
    categoryLabel: 'Workspace',
    description: 'Personal flight overview, active reservations, wallet balance & daily aviation feed',
    isStandardAllowed: true,
  },
  {
    id: 'user_assigned_projects',
    name: 'Assigned Projects & Tasks',
    category: 'PMS',
    categoryLabel: 'Project Management',
    description: 'My assigned flight checklists, ground service tasks, and task completion updates',
    isStandardAllowed: true,
  },
  {
    id: 'user_profile_settings',
    name: 'Profile & Identity Settings',
    category: 'COMPLIANCE',
    categoryLabel: 'Security',
    description: 'Manage personal profile, secure avatar / profile picture, contact details & MPIN',
    isStandardAllowed: true,
  },
  {
    id: 'comm_chat',
    name: 'Direct Aviator Chat & Support',
    category: 'COMMUNICATION',
    categoryLabel: 'Communication',
    description: 'Direct messaging with charter operators, FBO reps and ground support',
    isStandardAllowed: true,
  },
  {
    id: 'comm_alerts',
    name: 'Notice Board & Flight Alerts',
    category: 'COMMUNICATION',
    categoryLabel: 'Communication',
    description: 'System notices, flight schedule broadcasts, and urgent aerodrome bulletins',
    isStandardAllowed: true,
  },
  {
    id: 'erp_organisation',
    name: 'Organisation Directory',
    category: 'ERP',
    categoryLabel: 'ERP',
    description: 'Fleet enterprise entity structure, base airports, and registrations view',
    isStandardAllowed: true,
  },
  {
    id: 'sec_pwd_reset',
    name: '3-Layer Password Vault',
    category: 'COMPLIANCE',
    categoryLabel: 'Security',
    description: 'Triple verification credentials reset (Password, OTP, MPIN)',
    isStandardAllowed: true,
  },
  {
    id: 'sec_privacy_policy',
    name: 'Global Privacy Policy & Data Vault',
    category: 'COMPLIANCE',
    categoryLabel: 'Security',
    description: 'GDPR, CCPA, and DPDP 2023 flight manifest protection and data subject rights',
    isStandardAllowed: true,
  },
  {
    id: 'sec_user_agreement',
    name: 'User Agreement & Charter Terms',
    category: 'COMPLIANCE',
    categoryLabel: 'Security',
    description: 'Official marketplace terms, 80% payout reserve rules, and flight escrow policies',
    isStandardAllowed: true,
  },
  {
    id: 'sec_accessibility',
    name: 'Accessibility Statement',
    category: 'COMPLIANCE',
    categoryLabel: 'Security',
    description: 'WCAG 2.1 AA conformity, screen reader landmarks, and contrast accommodations',
    isStandardAllowed: true,
  },
  {
    id: 'sec_community_guidelines',
    name: 'Community Guidelines & Safety Ethics',
    category: 'COMPLIANCE',
    categoryLabel: 'Security',
    description: 'Zero tolerance for fraud, pilot safety whistleblower gateway, and operator ethics',
    isStandardAllowed: true,
  },

  // --- STRICTLY DISABLED FOR STANDARD USER (System Settings, User Management, Audit Logs, Billing, etc.) ---
  {
    id: 'sys_settings',
    name: 'System Settings & Server Config',
    category: 'SYSTEM',
    categoryLabel: 'System Administration',
    description: 'Core platform environment, global pricing constants, webhook credentials & maintenance mode',
    isStandardAllowed: false, // Strict least-privilege: DISABLED for Standard User
  },
  {
    id: 'sys_user_management',
    name: 'User Management & Role Governance',
    category: 'SYSTEM',
    categoryLabel: 'System Administration',
    description: 'Create, edit, suspend, and delete user accounts, assign custom roles and manage clearance',
    isStandardAllowed: false, // Strict least-privilege: DISABLED for Standard User
  },
  {
    id: 'sys_audit_logs',
    name: 'Audit Logs & SIEM Security Trails',
    category: 'SYSTEM',
    categoryLabel: 'System Administration',
    description: 'Full immutable compliance audit trail of all operator actions, logins, and API transactions',
    isStandardAllowed: false, // Strict least-privilege: DISABLED for Standard User
  },
  {
    id: 'fin_billing_management',
    name: 'Platform Billing & Escrow Treasury',
    category: 'FINANCE',
    categoryLabel: 'Finance',
    description: 'Corporate billing engine, payout batches, 80% escrow releases, and banking integrations',
    isStandardAllowed: false, // Strict least-privilege: DISABLED for Standard User
  },
  {
    id: 'fin_treasury',
    name: 'Finance & Treasury Ledgers',
    category: 'FINANCE',
    categoryLabel: 'Finance',
    description: 'Digital ledger, Razorpay & PayPal treasury flows, currency conversion settlement',
    isStandardAllowed: false,
  },
  {
    id: 'fin_store',
    name: 'Stores & Hangar Spares Billing',
    category: 'FINANCE',
    categoryLabel: 'Finance',
    description: 'Spares procurement invoices, rotable repair statements, and supplier debit balances',
    isStandardAllowed: false,
  },
  {
    id: 'fin_expenses',
    name: 'Expense Management & OpEx',
    category: 'FINANCE',
    categoryLabel: 'Finance',
    description: 'Crew per diem, jet fuel invoices, ramp handling disbursement, and landing fee claims',
    isStandardAllowed: false,
  },
  {
    id: 'fin_canteen',
    name: 'Crew Catering & Flight Galley',
    category: 'FINANCE',
    categoryLabel: 'Finance',
    description: 'In-flight catering reconciliation, crew meal allowances, and commissary inventory accounts',
    isStandardAllowed: false,
  },
  {
    id: 'fin_intelligence',
    name: 'Financial BI & Margin Analytics',
    category: 'FINANCE',
    categoryLabel: 'Finance',
    description: 'Route profitability forecasting, charter yield per block-hour, and OpEx vs Gross revenue',
    isStandardAllowed: false,
  },
  {
    id: 'crm_admissions',
    name: 'Commercial Sales & Leads Desk',
    category: 'CRM',
    categoryLabel: 'CRM',
    description: 'VIP charter inquiries, aircraft brokerage leads, and charter passenger intake',
    isStandardAllowed: false,
  },
  {
    id: 'crm_plus',
    name: 'Enterprise CRM+ Pipeline',
    category: 'CRM',
    categoryLabel: 'CRM',
    description: 'Opportunity scoring, 5-stage contract pipelines, customer 360 dossiers & SLA tracker',
    isStandardAllowed: false,
  },
  {
    id: 'hr_main',
    name: 'HR & Personnel Management',
    category: 'HR',
    categoryLabel: 'Human Resources',
    description: 'Operations specialists, marketing leads, finance analysts, and support staff directory & allocations',
    isStandardAllowed: false,
  },
  {
    id: 'hr_staff_wall',
    name: 'Operations & Corporate Staff Wall',
    category: 'HR',
    categoryLabel: 'Human Resources',
    description: 'Internal operations noticeboard, leadership announcements, and corporate recognitions',
    isStandardAllowed: false,
  },
  {
    id: 'hr_payroll',
    name: 'Corporate Payroll & Allowances',
    category: 'HR',
    categoryLabel: 'Human Resources',
    description: 'Base salary, project performance incentives, per diems, and direct bank transfers',
    isStandardAllowed: false,
  },
  {
    id: 'hr_pms',
    name: 'Team Performance Appraisals',
    category: 'PMS',
    categoryLabel: 'Project Management',
    description: 'KPI milestones, client deliverable assessments, recurrent training evaluations, and performance records',
    isStandardAllowed: false,
  },
  {
    id: 'erp_sis',
    name: 'SIS / Corporate Training & Academy',
    category: 'ERP',
    categoryLabel: 'ERP',
    description: 'Student Information System, professional cohorts, training hours log, and certification blocks',
    isStandardAllowed: false,
  },
  {
    id: 'erp_inventory',
    name: 'Inventory & Parts Warehouse',
    category: 'ERP',
    categoryLabel: 'ERP',
    description: 'AOG spare components, avionics line inventory, and tooling reserves',
    isStandardAllowed: false,
  },
  {
    id: 'erp_dynamic_forms',
    name: 'Dynamic Forms & Compliance Builder',
    category: 'ERP',
    categoryLabel: 'ERP',
    description: 'Quotation builder, charter questionnaires, and regulatory declarations',
    isStandardAllowed: false,
  },
  {
    id: 'erp_taxonomy',
    name: 'Approved Taxonomy & Categories Desk',
    category: 'ERP',
    categoryLabel: 'ERP',
    description: 'Aviation classifications, charter sectors, MRO services, and master category approval',
    isStandardAllowed: false,
  },
  {
    id: 'erp_login_stats',
    name: 'Operator Login Audits & Geolocation',
    category: 'ERP',
    categoryLabel: 'ERP',
    description: 'Active sessions, multi-factor authentication logs, IP geo-fences, and device fingerprints',
    isStandardAllowed: false,
  },
  {
    id: 'comm_broadcast',
    name: 'Airway Broadcast Dispatch Desk',
    category: 'COMMUNICATION',
    categoryLabel: 'Communication',
    description: 'Dispatch targeted sovereign push notices and circulars filtered by Zone & Category',
    isStandardAllowed: false,
  },
  {
    id: 'sec_rbac',
    name: 'Granular RBAC Control Panel',
    category: 'COMPLIANCE',
    categoryLabel: 'Security',
    description: 'Level 0 to Level 8 role governance, module clearance, and territory limits',
    isStandardAllowed: false,
  },
  {
    id: 'sec_api',
    name: 'API Contract Inspector & Developer Suite',
    category: 'COMPLIANCE',
    categoryLabel: 'Security',
    description: 'Inspect schema contracts, Argon2id encryption payloads, and JSON logs',
    isStandardAllowed: false,
  },
];

// Standard User Baseline: Complete Module Access DISABLED by default
export const STANDARD_USER_BASELINE_MODULES: string[] = [];

// System restricted modules that Standard User must NEVER access
export const STANDARD_USER_RESTRICTED_MODULES: string[] = [
  'sys_settings',
  'sys_user_management',
  'sys_audit_logs',
  'fin_billing_management',
  'sec_rbac',
  'sec_api',
];

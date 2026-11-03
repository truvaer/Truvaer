import React, { useState } from 'react';
import {
  Layers,
  BarChart3,
  Megaphone,
  TrendingUp,
  Coins,
  Users,
  Store,
  FileText,
  CreditCard,
  Crown,
  Key,
  ShieldCheck,
  Sliders,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  FolderPlus,
  Activity,
} from 'lucide-react';

interface ModuleOptionItem {
  id: string;
  name: string;
  description: string;
  badge?: string;
  actionKey: string;
}

interface AdminModuleCard {
  id: string;
  tabKey: string;
  title: string;
  category: 'FINANCE' | 'OPERATIONS' | 'COMMERCIAL' | 'GOVERNANCE' | 'SECURITY';
  icon: React.ReactNode;
  summary: string;
  statusBadge: string;
  statusColor: string;
  options: ModuleOptionItem[];
}

interface AdminModuleDirectoryProps {
  onSelectModuleTab: (tabKey: string, subTab?: string) => void;
  onOpenSpecificAction?: (actionKey: string) => void;
}

export const AdminModuleDirectory: React.FC<AdminModuleDirectoryProps> = ({
  onSelectModuleTab,
  onOpenSpecificAction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const modules: AdminModuleCard[] = [
    {
      id: 'mod_cashflow',
      tabKey: 'dashboard',
      title: 'Executive Dashboard & Regional Cash Flow',
      category: 'FINANCE',
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
      summary: 'Regional sales flow, expenditure, turnover and where focus is needed across APAC, ANZ, EMEA, NA, CIS, LATAM.',
      statusBadge: 'Real-Time Active',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      options: [
        {
          id: 'opt_apac_cashflow',
          name: 'APAC & ANZ Regional Flow Analysis',
          description: 'Side-by-side inflow vs OpEx comparisons with margin metrics',
          actionKey: 'view_regional_cashflow',
        },
        {
          id: 'opt_waterfall',
          name: 'Cash Flow Waterfall Flow Chart',
          description: 'Step-by-step liquidity journey from gross sales to net retained balance',
          actionKey: 'view_waterfall',
        },
        {
          id: 'opt_decision_matrix',
          name: 'Regional Focus Decision Matrix',
          description: 'Identifies high priority zones, margin expansion & capital allocation',
          badge: 'High Focus',
          actionKey: 'view_focus_matrix',
        },
        {
          id: 'opt_sim_scenario',
          name: 'OpEx / Sales Surge Scenario Simulator',
          description: 'Model required cost cuts and revenue expansion on treasury yield',
          actionKey: 'view_simulator',
        },
      ],
    },
    {
      id: 'mod_services_approval',
      tabKey: 'services_approval',
      title: 'Services & Categories Approval Desk',
      category: 'GOVERNANCE',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      summary: 'Central administrative governance for business user service categories, sub-categories, and listing offerings.',
      statusBadge: 'Dual Review Queue',
      statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      options: [
        {
          id: 'opt_cat_approval',
          name: 'Category & Sub-Category Approval Queue',
          description: 'Audit & approve categories and sub-categories proposed by business users',
          badge: 'Urgent Audit',
          actionKey: 'open_cat_queue',
        },
        {
          id: 'opt_services_approval',
          name: 'Custom Service Offering Requests',
          description: 'Review one or more services submitted by organisations for their listing',
          actionKey: 'open_services_queue',
        },
        {
          id: 'opt_master_cat',
          name: 'Direct Add Master Category (Admin Only)',
          description: 'Directly establish new platform categories across global directory',
          actionKey: 'direct_add_cat',
        },
        {
          id: 'opt_master_srv',
          name: 'Direct Add Master Service (Admin Only)',
          description: 'Directly add new standard services to category catalogs',
          actionKey: 'direct_add_srv',
        },
      ],
    },
    {
      id: 'mod_broadcast',
      tabKey: 'broadcast',
      title: 'Airway Broadcast & Geographic Targeting',
      category: 'COMMERCIAL',
      icon: <Megaphone className="w-5 h-5 text-sky-400" />,
      summary: 'Dispatch targeted sovereign push notices and official circulars filtered by Category, Country, and Aviation Zone.',
      statusBadge: 'Global Airspace',
      statusColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      options: [
        {
          id: 'opt_compose_broadcast',
          name: 'Launch Broadcast Composer',
          description: 'Create new circular with target zone, category, and recipient filters',
          actionKey: 'compose_broadcast',
        },
        {
          id: 'opt_zone_targeting',
          name: 'Zone Filter (APAC, ANZ, CIS, EMEA, LATAM, NA)',
          description: 'Restrict dispatch strictly to verified operators within selected flight regions',
          actionKey: 'zone_filter',
        },
        {
          id: 'opt_delivery_logs',
          name: 'Delivery Analytics & Read Audits',
          description: 'Real-time recipient engagement telemetry across app and corporate mail',
          actionKey: 'broadcast_logs',
        },
      ],
    },
    {
      id: 'mod_crm',
      tabKey: 'crm',
      title: 'Commercial Sales & CRM Portal',
      category: 'COMMERCIAL',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      summary: 'Closed-loop deal tracking, charter inquiries, quotation generation, and automated commission reconciliation.',
      statusBadge: 'Active Pipeline',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      options: [
        {
          id: 'opt_lead_kanban',
          name: 'Commercial Lead Kanban Board',
          description: 'Track deals from initial charter inquiry through quotation to closed-won',
          actionKey: 'crm_kanban',
        },
        {
          id: 'opt_quote_builder',
          name: 'Direct Quotation & Pitch Builder',
          description: 'Issue official bespoke service proposals with aircraft specs and pricing',
          actionKey: 'crm_quote',
        },
        {
          id: 'opt_client_chat',
          name: 'Direct Aviator Chat Inquiries',
          description: 'Encrypted communication gateway between business operators and charter clients',
          actionKey: 'crm_chat',
        },
      ],
    },
    {
      id: 'mod_commissions',
      tabKey: 'commissions',
      title: 'Finance Commission Desk & Settlements',
      category: 'FINANCE',
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      summary: 'Restricted to Finance & Senior Management: real-time ledger of committed vs released deal commissions.',
      statusBadge: 'Finance Clearance',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      options: [
        {
          id: 'opt_settlement_ledger',
          name: 'Daily Settlement Ledger & UTR Audits',
          description: 'Verify bank IFSC/SWIFT releases and electronic payout reference codes',
          actionKey: 'finance_settlements',
        },
        {
          id: 'opt_comm_payout',
          name: 'Authorize Broker Commission Payouts',
          description: 'Release verified commissions directly to recipient business wallets or bank',
          actionKey: 'finance_payouts',
        },
        {
          id: 'opt_tax_compliance',
          name: 'TDS & Aviation Tax Withholding',
          description: 'Track regulatory compliance deductions across Indian & international deals',
          actionKey: 'finance_tax',
        },
      ],
    },
    {
      id: 'mod_stores',
      tabKey: 'stores',
      title: 'Stores & Hangar Spares Hub',
      category: 'OPERATIONS',
      icon: <Store className="w-5 h-5 text-purple-400" />,
      summary: 'Spares inventory, rotable parts condition certification, AOG expedited handling and procurement logs.',
      statusBadge: 'Part-145 Certified',
      statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      options: [
        {
          id: 'opt_inventory_grid',
          name: 'Spares Stock & Reorder Points',
          description: 'Turbine parts, avionics boxes and GSE equipment catalog',
          actionKey: 'stores_inventory',
        },
        {
          id: 'opt_aog_dispatch',
          name: 'AOG Expedited Dispatch Desk',
          description: 'Priority courier and airside gate pass authorization for grounded airframes',
          badge: 'Emergency',
          actionKey: 'stores_aog',
        },
        {
          id: 'opt_vendor_verification',
          name: 'FAA Form 8130 / EASA Form 1 Verification',
          description: 'Audit airworthiness documentation before inventory ingestion',
          actionKey: 'stores_certs',
        },
      ],
    },
    {
      id: 'mod_accounts',
      tabKey: 'accounts',
      title: 'Accounts Master & KYC Verification',
      category: 'GOVERNANCE',
      icon: <Users className="w-5 h-5 text-slate-300" />,
      summary: 'Central directory of business profiles, registered aviators, certificate audits, and PII masking status.',
      statusBadge: 'KYC Gatekeeper',
      statusColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      options: [
        {
          id: 'opt_biz_kyc',
          name: 'Corporate Verification & Incorporation Inspection',
          description: 'Audit PAN, TAN, registration certs and domain verification status',
          actionKey: 'accounts_kyc',
        },
        {
          id: 'opt_pii_governance',
          name: 'PII Redaction & Phone Masking Controls',
          description: 'Configure automated masking of phone numbers and emails on directory feeds',
          actionKey: 'accounts_pii',
        },
        {
          id: 'opt_account_status',
          name: 'Account Lock / Freeze / Suspend',
          description: 'Exercise compliance enforcement on non-compliant service listings',
          actionKey: 'accounts_status',
        },
      ],
    },
    {
      id: 'mod_publications',
      tabKey: 'publications',
      title: 'Publication Desk & Marketplace Controls',
      category: 'GOVERNANCE',
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      summary: 'Manage listing visibility: Published, Restricted, In-Review, or Suspended, backed by departmental clearance.',
      statusBadge: 'Operations Guard',
      statusColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      options: [
        {
          id: 'opt_pub_queue',
          name: 'Pending Listing Publications',
          description: 'Examine new service listings submitted by registered businesses',
          actionKey: 'pub_pending',
        },
        {
          id: 'opt_pub_restrict',
          name: 'Restrict Non-Compliant Directory Entries',
          description: 'Temporarily delist providers with missing safety certificates',
          actionKey: 'pub_restrict',
        },
        {
          id: 'opt_pub_edit',
          name: 'Direct Listing Modification',
          description: 'Authorized Finance & Ops staff can update contacts, logos and photos',
          actionKey: 'pub_edit',
        },
      ],
    },
    {
      id: 'mod_debits',
      tabKey: 'debit_approvals',
      title: '2-Stage Wallet Debit Pipeline',
      category: 'FINANCE',
      icon: <CreditCard className="w-5 h-5 text-amber-400" />,
      summary: 'Dual authorization workflow for debiting corporate credit reserves: Admin Stage 1 + Super Admin Stage 2.',
      statusBadge: 'Dual Sign-Off',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      options: [
        {
          id: 'opt_stage1_review',
          name: 'Stage 1 Operational Audit',
          description: 'Initial review of reason, amount, and business contract validity',
          actionKey: 'debits_stage1',
        },
        {
          id: 'opt_stage2_auth',
          name: 'Stage 2 Sovereign Super-Admin Authorization',
          description: 'Final authorization required before funds or credits are deducted',
          actionKey: 'debits_stage2',
        },
        {
          id: 'opt_initiate_debit',
          name: 'Initiate New Debit Request',
          description: 'Create formalized debit ticket with attached justification',
          actionKey: 'debits_new',
        },
      ],
    },
    {
      id: 'mod_human_resource',
      tabKey: 'human_resource',
      title: 'Human Resource (HR & HRMS System)',
      category: 'OPERATIONS',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      summary: 'Unified Human Resource and HRMS system: employee master directory, operations team shift scheduling, leave workflows, automated payroll, and operational compliance.',
      statusBadge: 'HR + HRMS Unified',
      statusColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      options: [
        {
          id: 'opt_hr_directory',
          name: 'Employee Master Directory & Org Dossiers',
          description: 'Manage staff records, L0–L8 ranks, designations, and department structures',
          actionKey: 'hr_directory',
        },
        {
          id: 'opt_hr_fdtl',
          name: 'Operations Team Workload & SLA Project Hours',
          description: 'Monitor project deliverable hours, support coverage, and team capacity for sales, marketing, support & finance',
          badge: 'SLA Governance',
          actionKey: 'hr_fdtl',
        },
        {
          id: 'opt_hr_leaves',
          name: 'Leave Management & Dual Approval Queue',
          description: '2-Stage time-off sanctions: Reporting Manager L1 + Central HRMS L2 sign-off',
          actionKey: 'hr_leaves',
        },
        {
          id: 'opt_hr_payroll',
          name: 'Automated Payroll, Performance Incentives & Payslips',
          description: 'Retainers, per diems, performance incentive calculations, and bank UTR slip exports',
          actionKey: 'hr_payroll',
        },
        {
          id: 'opt_hr_onboarding',
          name: 'Onboarding & Compliance Credentials Vault',
          description: 'Corporate background checks, operational compliance certificates, and security credentials validity',
          actionKey: 'hr_onboarding',
        },
      ],
    },
    {
      id: 'mod_hierarchy',
      tabKey: 'hierarchy',
      title: 'Department Hierarchy (L0–L8) & Ranks',
      category: 'SECURITY',
      icon: <Crown className="w-5 h-5 text-yellow-400" />,
      summary: 'Configure personnel departmental ranks from L0 Trainee to L8 Executive Chairman with multi-region clearance.',
      statusBadge: 'L0–L8 Ranks',
      statusColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      options: [
        {
          id: 'opt_rank_assignment',
          name: 'Department Personnel Rank Assignment',
          description: 'Promote or assign personnel to Sales, Ops, Finance, HR or Senior Management',
          actionKey: 'hier_ranks',
        },
        {
          id: 'opt_multi_region_l5',
          name: 'Delegated L5+ Multi-Region Clearance Gate',
          description: 'Enforce rule: Multiple aviation regions authorized with delegated L5+ Operations Manager sign-off',
          badge: 'Security Gate',
          actionKey: 'hier_multi_region',
        },
        {
          id: 'opt_two_level_promo',
          name: '2-Level Promotion Sign-off Gateway',
          description: 'Requires dual managers to validate rank elevations across departments',
          actionKey: 'hier_promotions',
        },
      ],
    },
    {
      id: 'mod_rbac_governance',
      tabKey: 'rbac',
      title: 'Role & Module Access Governance (RBAC)',
      category: 'GOVERNANCE',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      summary: 'Central access control: 39-module assignment matrix with CRUD checkboxes, Permission Page redesign, Delegated L5+ Regional Authority, and Dynamic Allocation System (DAS).',
      statusBadge: 'Strict L7/L8 Gate',
      statusColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      options: [
        {
          id: 'opt_role_permissions_page',
          name: 'Role Permissions Manager (Permission Page)',
          description: 'Granular 12-capability permissions matrix with Doctype, Role, Level, and Only-If-Creator filters',
          badge: 'Permission Page',
          actionKey: 'rbac_permission_page',
        },
        {
          id: 'opt_user_module_allotted',
          name: 'User Module Allotted (39 Modules Grid)',
          description: '39-module allotment layout with profile selector, quick select/unselect, and Johnson Chase profile',
          badge: 'Module Image (39)',
          actionKey: 'rbac_module_image',
        },
        {
          id: 'opt_master_assignment_matrix',
          name: 'Master Module Assignment Matrix',
          description: 'Dual-tier grid with category, level-tier, clearance status, and interactive CRUD checkboxes',
          actionKey: 'rbac_matrix',
        },
        {
          id: 'opt_user_types_roles',
          name: 'User Types & Roles Management (6 Ranks)',
          description: 'Super Admin, Executive Director L7, Operations Manager L5, Operations Lead L4, Field Specialist L2, Standard User L0',
          actionKey: 'rbac_roles',
        },
        {
          id: 'opt_user_overrides',
          name: 'User-Specific Module Overrides',
          description: 'Custom per-user access grants and baseline overrides with least-privilege security safeguards',
          actionKey: 'rbac_user_modules',
        },
        {
          id: 'opt_regional_gate',
          name: 'Regional Authority (Delegated L5+ Gate)',
          description: 'Multi-zone operational delegation requiring prior L7/L8 clearance before module data sharing',
          badge: 'L7/L8 Sign-Off',
          actionKey: 'rbac_regional_governance',
        },
        {
          id: 'opt_das_system',
          name: 'Dynamic Allocation System (DAS)',
          description: 'Leadership departmental matrix allocation and staff mobility reallocations with audit logging',
          actionKey: 'rbac_das',
        },
      ],
    },
    {
      id: 'mod_audit',
      tabKey: 'logs',
      title: 'Audit & SIEM Security Logs',
      category: 'SECURITY',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      summary: 'Immutable 7-year audit logs of administrative actions, role escalations, PII unlocks, and API transactions.',
      statusBadge: '7-Year Retained',
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      options: [
        {
          id: 'opt_admin_activity',
          name: 'Live Admin Activity Stream',
          description: 'Chronological timeline of all operator approvals, rejections and debits',
          actionKey: 'logs_activity',
        },
        {
          id: 'opt_api_telemetry',
          name: 'REST API & Webhook Telemetry',
          description: 'Inspect status codes, response payloads, and latency stats',
          actionKey: 'logs_api',
        },
        {
          id: 'opt_siem_export',
          name: 'Export Compliance Audit Trail',
          description: 'Download signed audit package for external aviation authority inspection',
          actionKey: 'logs_export',
        },
      ],
    },
  ];

  const filteredModules = modules.filter((m) => {
    if (selectedCategory !== 'ALL' && m.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchSummary = m.summary.toLowerCase().includes(q);
      const matchOptions = m.options.some(
        (o) => o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q)
      );
      return matchTitle || matchSummary || matchOptions;
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Top Banner (Matching Image 2 requirements) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Admin Platform Operations Directory &amp; Module Options
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Image 2 Specification
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Options visibly structured for each and every enterprise module with direct operational action triggers
              </p>
            </div>
          </div>
        </div>

        {/* Filter by Category & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Tabs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center space-x-1 text-xs">
            {['ALL', 'FINANCE', 'OPERATIONS', 'COMMERCIAL', 'GOVERNANCE', 'SECURITY'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search module options..."
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Grid of Modules with their options visibly displayed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod) => (
          <div
            key={mod.id}
            className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Module Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {mod.icon}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${mod.statusColor}`}
                >
                  {mod.statusBadge}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                {mod.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                {mod.summary}
              </p>

              {/* Visibly Rendered Sub-Options for this Module (Image 2) */}
              <div className="space-y-2 border-t border-slate-850 pt-3">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider block">
                  Available Module Functions ({mod.options.length}):
                </span>

                <div className="space-y-1.5">
                  {mod.options.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (opt.actionKey.startsWith('rbac_')) {
                          const subTab = opt.actionKey.replace('rbac_', '');
                          onSelectModuleTab('rbac', subTab);
                        } else if (opt.actionKey === 'hier_promotions') {
                          onSelectModuleTab('promotion_approvals');
                        } else {
                          onSelectModuleTab(mod.tabKey);
                        }
                        if (onOpenSpecificAction) onOpenSpecificAction(opt.actionKey);
                      }}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850/90 transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-200">{opt.name}</span>
                          {opt.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                          {opt.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 ml-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Module Primary Button */}
            <div className="mt-4 pt-3 border-t border-slate-850">
              <button
                type="button"
                onClick={() => onSelectModuleTab(mod.tabKey)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <span>Launch {mod.title.split('&')[0].trim()}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

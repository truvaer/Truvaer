import React, { useState, useMemo } from 'react';
import {
  Crown,
  TrendingUp,
  FileText,
  DollarSign,
  ShieldCheck,
  Users,
  Compass,
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Calculator,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  CreditCard,
  Sliders,
  Database,
  BarChart3,
  ExternalLink,
  ChevronRight,
  FolderTree,
  Lock,
  Globe,
  Bell,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { RegularUser, BusinessProfile, CRMLead, CRMQuotation, CommissionRecord, CRMSupportTicket } from '../types';

interface SuperAdminDashboardViewProps {
  currentUser: RegularUser | null;
  onNavigateTab: (tab: 'marketing' | 'crm_portal' | 'admin_desk', subTab?: string) => void;
  onOpenWallet: () => void;
  onOpenCommunications: () => void;
  onOpenCustomerCare: () => void;
  onOpenUserProfile: () => void;
  onOpenCategoryManager?: () => void;
  onRefreshData?: () => void;
}

type DepartmentTab = 'ALL' | 'SALES' | 'MARKETING' | 'SUPPORT' | 'FINANCE' | 'GOVERNANCE' | 'MODULES';

export const SuperAdminDashboardView: React.FC<SuperAdminDashboardViewProps> = ({
  currentUser,
  onNavigateTab,
  onOpenWallet,
  onOpenCommunications,
  onOpenCustomerCare,
  onOpenUserProfile,
  onOpenCategoryManager,
  onRefreshData,
}) => {
  const [activeDepartment, setActiveDepartment] = useState<DepartmentTab>('ALL');
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState('ALL');

  // Aggregated Platform Data
  const allBusinesses = db.getBusinesses();
  const allLeads: CRMLead[] = db.getCRMLeads();
  const allQuotations: CRMQuotation[] = db.getCRMQuotations();
  const allCommissions: CommissionRecord[] = db.getCommissions();
  const allTickets: CRMSupportTicket[] = db.getCRMSupportTickets ? db.getCRMSupportTickets() : [];
  const allRegularUsers = db.getRegularUsers();
  const adminActivities = db.getAdminActivities ? db.getAdminActivities().slice(0, 8) : [];

  // Financial aggregates
  const totalPipelineValue = allLeads.reduce((acc: number, l: CRMLead) => acc + (l.budget || 0), 0);
  const totalCommissionExpected = allCommissions.reduce((acc: number, c: CommissionRecord) => acc + (c.commission_amount || 0), 0);
  const totalNetOperatorBalance = allCommissions.reduce(
    (acc: number, c: CommissionRecord) => acc + (c.net_remaining_balance !== undefined ? c.net_remaining_balance : c.sale_amount - c.commission_amount),
    0
  );
  const totalWalletCredits = allBusinesses.reduce((acc: number, b) => acc + (b.corporate_wallet?.credit_balance || 0), 0);

  // Business verification status counts
  const verifiedBizCount = allBusinesses.filter((b) => b.verification_status === 'VERIFIED').length;
  const pendingBizCount = allBusinesses.filter((b) => b.verification_status === 'HARD_LOCKED' || b.verification_status === 'IN_REVIEW').length;

  // Support tickets breakdown
  const openTickets = allTickets.filter((t: CRMSupportTicket) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const criticalTickets = allTickets.filter((t: CRMSupportTicket) => t.priority === 'URGENT' || t.priority === 'HIGH');

  // Master 53 Modules for Super Admin
  const superAdminModules = useMemo(() => {
    return [
      { id: 'cpanel_categories', name: 'Categories & Subcategories Manager', category: 'GOVERNANCE', desc: 'Add, edit, suspend, and remove taxonomy', icon: FolderTree, action: () => { if (onOpenCategoryManager) onOpenCategoryManager(); else onNavigateTab('admin_desk', 'categories'); } },
      { id: 'cpanel_rbac', name: 'RBAC Permission Matrix (L0–L8)', category: 'GOVERNANCE', desc: 'Manage access levels, roles, and delegations', icon: ShieldCheck, action: () => onNavigateTab('admin_desk', 'users') },
      { id: 'cpanel_verification', name: 'Enterprise TAN/PAN Hard-Lock Audit', category: 'GOVERNANCE', desc: 'Verify aircraft operators and MRO companies', icon: Building2, action: () => onNavigateTab('admin_desk', 'businesses') },
      { id: 'crm_pipeline', name: 'Global Commercial Deal Pipeline', category: 'SALES', desc: 'Track private jet charters and sales', icon: TrendingUp, action: () => onNavigateTab('crm_portal', 'pipeline') },
      { id: 'crm_quotations', name: 'Quotation Audit & Invoicing', category: 'SALES', desc: 'Audit generated flight quotes and proformas', icon: FileText, action: () => onNavigateTab('crm_portal', 'quotations') },
      { id: 'commissions_ledger', name: 'Platform Commission Ledger', category: 'FINANCE', desc: 'Track % entry, net balances, and admin sync', icon: Calculator, action: () => onNavigateTab('crm_portal', 'commissions') },
      { id: 'treasury_wallets', name: 'Corporate Credit Wallet Reserves', category: 'FINANCE', desc: 'Issue credit allocations and manage escrow', icon: CreditCard, action: onOpenWallet },
      { id: 'daily_payouts', name: 'Razorpay & Bank Settlement Clearance', category: 'FINANCE', desc: 'Approve vendor and operator bank payouts', icon: DollarSign, action: () => onNavigateTab('admin_desk', 'payouts') },
      { id: 'servicescout_dir', name: 'ServiceScout Verified Directory', category: 'MARKETING', desc: 'Fleet showcase, search filters, and SEO tags', icon: Compass, action: () => onNavigateTab('marketing', 'directory') },
      { id: 'stories_feed', name: 'Aviation Community Stories & Feed', category: 'MARKETING', desc: 'Manage posts, announcements, and articles', icon: Globe, action: () => onNavigateTab('marketing', 'linkedin_feed') },
      { id: 'customer_care_desk', name: 'VIP Concierge & Aviator Care Desk', category: 'SUPPORT', desc: '24/7 SLA triage, phone callbacks, live tickets', icon: Headphones, action: onOpenCustomerCare },
      { id: 'encrypted_comms', name: 'Direct Operator Messaging & Alerts', category: 'SUPPORT', desc: 'Encrypted client inquiries and notifications', icon: Bell, action: onOpenCommunications },
      { id: 'flight_ops', name: 'Flight Operations & Dispatch', category: 'OPERATIONS', desc: 'Flight plans, slots, NOTAMs, and ATC filing', icon: Zap, action: () => onNavigateTab('admin_desk', 'flight_ops') },
      { id: 'fleet_mro', name: 'Fleet CAMO & MRO Rotables Inventory', category: 'OPERATIONS', desc: 'Track aircraft components, AOG alerts, and logbooks', icon: Layers, action: () => onNavigateTab('crm_portal', 'inventory') },
      { id: 'crew_training', name: 'Crew Roster & DGCA Simulator LMS', category: 'OPERATIONS', desc: 'Type-rating currency, medicals, and SIS profiles', icon: Users, action: () => onNavigateTab('admin_desk', 'crew') },
      { id: 'system_killswitch', name: 'Emergency Platform Killswitch Control', category: 'GOVERNANCE', desc: 'Immediate global or modular service freeze', icon: AlertTriangle, action: () => onNavigateTab('admin_desk', 'killswitches') },
    ];
  }, [onNavigateTab, onOpenCategoryManager, onOpenWallet, onOpenCustomerCare, onOpenCommunications]);

  const filteredModules = useMemo(() => {
    return superAdminModules.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
        m.desc.toLowerCase().includes(moduleSearch.toLowerCase());
      const matchesCategory =
        moduleCategoryFilter === 'ALL' || m.category === moduleCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [superAdminModules, moduleSearch, moduleCategoryFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. SUPER ADMIN EXECUTIVE COMMAND BANNER                                   */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-amber-950/30 border border-amber-500/30 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-xl shrink-0">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight font-mono">
                  Super Admin Executive Cockpit
                </h1>
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  L8 SOVEREIGN CLEARANCE
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ALL 53 MODULES ACTIVE</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Executive Commander: <span className="text-white font-bold">{currentUser?.first_name || 'B Aditya'} {currentUser?.last_name || 'Narayana'}</span> • Complete 360° oversight of Sales, Marketing, Support, Finance &amp; Governance
              </p>
            </div>
          </div>

          {/* Quick Sovereign Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onOpenCategoryManager) onOpenCategoryManager();
                else onNavigateTab('admin_desk', 'categories');
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
            >
              <FolderTree className="w-4 h-4" />
              <span>cPanel Categories</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('admin_desk')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 shadow-md flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Operations Desk</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('crm_portal', 'commissions')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>Commission Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE 360° KPI METRICS (SALES, MARKETING, SUPPORT, FINANCE)        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Sales Pipeline */}
        <div
          onClick={() => setActiveDepartment('SALES')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Gross Pipeline</span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono mt-2">
            ₹{(totalPipelineValue / 10000000).toFixed(2)} <span className="text-xs font-sans text-slate-400">Cr</span>
          </div>
          <div className="text-[11px] text-sky-400 mt-1">{allLeads.length} Total Platform Deals</div>
        </div>

        {/* Expected Commissions */}
        <div
          onClick={() => setActiveDepartment('FINANCE')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Platform Commissions</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calculator className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-400 font-mono mt-2">
            ₹{(totalCommissionExpected / 100000).toFixed(1)} <span className="text-xs font-sans text-slate-400">L</span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1">{allCommissions.length} Logged Entries</div>
        </div>

        {/* Operator Net Balances */}
        <div
          onClick={() => setActiveDepartment('FINANCE')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Net Operator Due</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-2">
            ₹{(totalNetOperatorBalance / 100000).toFixed(1)} <span className="text-xs font-sans text-slate-400">L</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Pending Settlement</div>
        </div>

        {/* Verified Businesses */}
        <div
          onClick={() => setActiveDepartment('GOVERNANCE')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Enterprises</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono mt-2">{allBusinesses.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-bold">{verifiedBizCount} Verified</span>
            {pendingBizCount > 0 && <span className="text-amber-400 font-bold ml-1.5">({pendingBizCount} In Review)</span>}
          </div>
        </div>

        {/* 24/7 Support Desk */}
        <div
          onClick={() => setActiveDepartment('SUPPORT')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">VIP Care Desk</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Headphones className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-white font-mono mt-2">{openTickets.length}</div>
          <div className="text-[11px] text-purple-300 mt-1">
            {criticalTickets.length > 0 ? `${criticalTickets.length} High Priority` : 'All SLAs nominal'}
          </div>
        </div>

        {/* Total Wallet Circulation */}
        <div
          onClick={onOpenWallet}
          className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Wallet Reserves</span>
            <div className="w-7 h-7 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black text-teal-300 font-mono mt-2">
            {totalWalletCredits.toLocaleString()}
          </div>
          <div className="text-[11px] text-teal-400/80 mt-1">Total Active Credits</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DEPARTMENT FILTER NAVIGATION BAR                                       */}
      {/* ========================================================================= */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { key: 'ALL', label: '360° Overview' },
          { key: 'SALES', label: 'Commercial Sales' },
          { key: 'MARKETING', label: 'Marketing & Directory' },
          { key: 'SUPPORT', label: 'VIP Care & Support' },
          { key: 'FINANCE', label: 'Finance & Treasury' },
          { key: 'GOVERNANCE', label: 'Governance & cPanel' },
          { key: 'MODULES', label: 'All 53 Modules' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveDepartment(tab.key as DepartmentTab)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeDepartment === tab.key
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. DEPARTMENT SPECIFIC OR 360° PANORAMA CONTENT                           */}
      {/* ========================================================================= */}

      {/* SALES DEPARTMENT VIEW */}
      {(activeDepartment === 'ALL' || activeDepartment === 'SALES') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Commercial Aviation Sales &amp; Deals Pipeline
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('crm_portal')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>Launch Commercial Sale Portal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400">Total Active Inbound Inquiries</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{allLeads.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1">
                {allLeads.filter((l: CRMLead) => l.status === 'WON').length} Won Deals Closed
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400">Quotations Generated</div>
              <div className="text-2xl font-black text-indigo-300 font-mono mt-1">{allQuotations.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {allQuotations.filter((q) => q.status === 'ACCEPTED').length} Proformas Signed
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400">Average Deal Size</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                ₹{((totalPipelineValue / (allLeads.length || 1)) / 100000).toFixed(1)} L
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Executive charters &amp; cargo</div>
            </div>
          </div>
        </div>
      )}

      {/* MARKETING DEPARTMENT VIEW */}
      {(activeDepartment === 'ALL' || activeDepartment === 'MARKETING') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Marketing, Directory &amp; Community Reach
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('marketing')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>Open Public Directory &amp; Feed</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-slate-400">ServiceScout Directory Profiles</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{allBusinesses.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1">Public verified listings enabled</div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-slate-400">Verified Aviation Aviator Network</div>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1">{allRegularUsers.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Pilots, executives, engineers</div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-slate-400">SEO Meta &amp; Schema Status</div>
              <div className="text-base font-bold text-emerald-400 mt-2 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Optimized (JSON-LD &amp; OpenGraph)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Truvaer.com Aviation Index</div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT & VIP CARE VIEW */}
      {(activeDepartment === 'ALL' || activeDepartment === 'SUPPORT') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                24/7 VIP Concierge &amp; Aviator Care Assistance
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenCustomerCare}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>Open Care Desk</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400">Active Support Tickets</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{openTickets.length}</div>
              <div className="text-[11px] text-emerald-400 mt-1">0 Overdue SLA breaches</div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400">VIP Operator Callbacks</div>
              <div className="text-2xl font-black text-purple-300 font-mono mt-1">100%</div>
              <div className="text-[11px] text-slate-400 mt-1">Within 15 minutes response SLA</div>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="text-xs text-slate-400">Direct Encrypted Messages</div>
              <div className="text-2xl font-black text-sky-400 font-mono mt-1">Active</div>
              <div className="text-[11px] text-slate-400 mt-1">E2E client-to-operator secure chat</div>
            </div>
          </div>
        </div>
      )}

      {/* FINANCE & COMMISSION LEDGER VIEW */}
      {(activeDepartment === 'ALL' || activeDepartment === 'FINANCE') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Platform Commission Accounting &amp; Net Settlements
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('crm_portal', 'commissions')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>Open Detailed Ledger</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Deal / Title</th>
                  <th className="py-2.5 px-3">Sale Amount</th>
                  <th className="py-2.5 px-3">Commission %</th>
                  <th className="py-2.5 px-3">Platform Share</th>
                  <th className="py-2.5 px-3">Operator Net Due</th>
                  <th className="py-2.5 px-3">Accounting Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {allCommissions.slice(0, 5).map((comm) => (
                  <tr key={comm.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{comm.deal_title}</div>
                      <div className="text-[10px] text-slate-400">Ref: {comm.id}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      ₹{comm.sale_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sky-400">
                      {comm.commission_rate_pct}%
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400">
                      ₹{comm.commission_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      ₹{(comm.net_remaining_balance !== undefined ? comm.net_remaining_balance : comm.sale_amount - comm.commission_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {comm.admin_accounting_status || 'SHARED_SYNCED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GOVERNANCE & CPANEL VIEW */}
      {(activeDepartment === 'ALL' || activeDepartment === 'GOVERNANCE') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                cPanel Categories Hierarchy &amp; Platform Governance
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onOpenCategoryManager) onOpenCategoryManager();
                else onNavigateTab('admin_desk', 'categories');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>Manage Categories (Add, Edit, Suspend, Delete)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div
              onClick={() => {
                if (onOpenCategoryManager) onOpenCategoryManager();
                else onNavigateTab('admin_desk', 'categories');
              }}
              className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="font-bold text-white flex items-center space-x-1.5">
                <FolderTree className="w-4 h-4 text-amber-400" />
                <span>Categories &amp; Subcategories</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Aviation taxonomy, suspension &amp; live directory sync
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('admin_desk', 'users')}
              className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-sky-500/60 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="font-bold text-white flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>RBAC Clearance Matrix</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                L0 Aviator to L8 Sovereign Chairman authority
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('admin_desk', 'businesses')}
              className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-indigo-500/60 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="font-bold text-white flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Verification Queue</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {pendingBizCount} business verification reviews pending
              </div>
            </div>

            <div
              onClick={() => onNavigateTab('admin_desk', 'killswitches')}
              className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-rose-500/60 rounded-2xl cursor-pointer transition-colors"
            >
              <div className="font-bold text-white flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Emergency Killswitches</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Instant modular freeze without database impact
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ALL 53 MODULES QUICK LAUNCHER GRID                                      */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Executive Enabled Modules Catalog</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instant launcher for all enterprise divisions enabled for Sovereign &amp; Executive Admin
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                placeholder="Search modules..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 w-48"
              />
            </div>

            <select
              value={moduleCategoryFilter}
              onChange={(e) => setModuleCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
            >
              <option value="ALL">All Categories</option>
              <option value="GOVERNANCE">Governance</option>
              <option value="SALES">Sales</option>
              <option value="FINANCE">Finance</option>
              <option value="MARKETING">Marketing</option>
              <option value="SUPPORT">Support</option>
              <option value="OPERATIONS">Operations</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={mod.action}
                className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 rounded-2xl transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                      {mod.category}
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs mt-2.5 group-hover:text-amber-300 transition-colors">
                    {mod.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {mod.desc}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-amber-400 font-semibold">
                  <span>Launch Module</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

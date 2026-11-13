import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  FileText,
  DollarSign,
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
  Building2,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  MessageSquare,
  Bell,
  Box,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { RegularUser, BusinessProfile, CRMLead, CRMQuotation, CommissionRecord, CRMSupportTicket } from '../types';

interface AdminDashboardViewProps {
  currentUser: RegularUser | null;
  onNavigateTab: (tab: 'marketing' | 'crm_portal' | 'admin_desk', subTab?: string) => void;
  onOpenWallet: () => void;
  onOpenCommunications: () => void;
  onOpenCustomerCare: () => void;
  onOpenUserProfile: () => void;
  onRefreshData?: () => void;
}

type AdminDepartmentTab = 'ALL' | 'SALES' | 'MARKETING' | 'SUPPORT' | 'FINANCE' | 'OPERATIONS';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onNavigateTab,
  onOpenWallet,
  onOpenCommunications,
  onOpenCustomerCare,
  onOpenUserProfile,
  onRefreshData,
}) => {
  const [activeDepartment, setActiveDepartment] = useState<AdminDepartmentTab>('ALL');
  const [moduleSearch, setModuleSearch] = useState('');

  // Admin Data Pull
  const allBusinesses = db.getBusinesses();
  const allLeads: CRMLead[] = db.getCRMLeads();
  const allQuotations: CRMQuotation[] = db.getCRMQuotations();
  const allCommissions: CommissionRecord[] = db.getCommissions();
  const allTickets: CRMSupportTicket[] = db.getCRMSupportTickets ? db.getCRMSupportTickets() : [];
  const allInventory = db.getStoreInventory ? db.getStoreInventory() : [];

  // Metrics
  const pendingBiz = allBusinesses.filter((b) => b.verification_status === 'HARD_LOCKED' || b.verification_status === 'IN_REVIEW');
  const pendingCommissions = allCommissions.filter((c) => c.status === 'COMMITTED' || c.admin_accounting_status === 'SHARED_WITH_ADMIN');
  const openTickets = allTickets.filter((t: CRMSupportTicket) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const totalCommissionVal = allCommissions.reduce((acc, c) => acc + (c.commission_amount || 0), 0);

  // Enabled Admin Modules
  const adminModules = useMemo(() => {
    return [
      { id: 'admin_biz_verify', name: 'Organization Verification Queue', category: 'OPERATIONS', desc: 'Audit TAN, PAN, and hard-locked aviation operators', icon: Building2, action: () => onNavigateTab('admin_desk', 'businesses') },
      { id: 'admin_quotations', name: 'Sales Quotations & Invoicing', category: 'SALES', desc: 'Review, approve, and track client quotations', icon: FileText, action: () => onNavigateTab('crm_portal', 'quotations') },
      { id: 'admin_commissions', name: 'Commission % Audit Desk', category: 'FINANCE', desc: 'Audit logged commission percentages & net balances', icon: Calculator, action: () => onNavigateTab('crm_portal', 'commissions') },
      { id: 'admin_leads', name: 'Commercial Leads & Pipeline', category: 'SALES', desc: 'Supervise charter inquiries and follow-ups', icon: TrendingUp, action: () => onNavigateTab('crm_portal', 'pipeline') },
      { id: 'admin_care_desk', name: '24/7 VIP Customer Care Desk', category: 'SUPPORT', desc: 'Manage inbound support inquiries and escalations', icon: Headphones, action: onOpenCustomerCare },
      { id: 'admin_comms', name: 'Encrypted Communications Hub', category: 'SUPPORT', desc: 'Platform notifications, emails, and direct alerts', icon: Bell, action: onOpenCommunications },
      { id: 'admin_servicescout', name: 'ServiceScout Fleet Directory', category: 'MARKETING', desc: 'Verified operator listings & search indices', icon: Compass, action: () => onNavigateTab('marketing', 'directory') },
      { id: 'admin_inventory', name: 'Rotables & Parts Inventory', category: 'OPERATIONS', desc: 'Track avionics, components, and AOG items', icon: Box, action: () => onNavigateTab('crm_portal', 'inventory') },
    ];
  }, [onNavigateTab, onOpenCustomerCare, onOpenCommunications]);

  const filteredModules = useMemo(() => {
    return adminModules.filter((m) =>
      m.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      m.desc.toLowerCase().includes(moduleSearch.toLowerCase())
    );
  }, [adminModules, moduleSearch]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. ADMIN WELCOME & AUDIT BANNER                                           */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-sky-950/40 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 shadow-xl shrink-0">
            <ShieldCheck className="w-7 h-7 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-white tracking-tight font-mono">
                Operations &amp; Admin Command
              </h1>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                PLATFORM ADMIN DESK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Admin: <span className="text-white font-bold">{currentUser?.first_name || 'Admin'} {currentUser?.last_name || 'User'}</span> ({currentUser?.email}) • Supervise daily aviation sales, support SLAs &amp; finance
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('admin_desk', 'businesses')}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span>Verify Businesses ({pendingBiz.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('crm_portal', 'commissions')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Calculator className="w-4 h-4" />
            <span>Commission Desk</span>
          </button>

          <button
            type="button"
            onClick={onOpenCustomerCare}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Headphones className="w-4 h-4" />
            <span>Care Queue ({openTickets.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADMIN OPERATIONAL KPI CARDS                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Verification Queue */}
        <div
          onClick={() => onNavigateTab('admin_desk', 'businesses')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Pending Verifications</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">{pendingBiz.length}</div>
          <div className="text-[11px] text-amber-400 mt-1">Awaiting TAN/PAN hard-lock review</div>
        </div>

        {/* Sales Pipeline Under Supervision */}
        <div
          onClick={() => onNavigateTab('crm_portal')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Active Deals</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">{allLeads.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">{allQuotations.length} Active client quotes</div>
        </div>

        {/* Commission Accounting Queue */}
        <div
          onClick={() => onNavigateTab('crm_portal', 'commissions')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Commissions Logged</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            ₹{(totalCommissionVal / 100000).toFixed(1)} <span className="text-xs font-sans text-slate-400">L</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">{allCommissions.length} Transactions logged</div>
        </div>

        {/* Customer Care SLAs */}
        <div
          onClick={onOpenCustomerCare}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Active Care Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono mt-2">{openTickets.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">100% On-time resolution rate</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ENABLED ADMIN MODULES QUICK TILES                                      */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Enabled Admin Modules</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Operations permissions active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={mod.action}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-xs group-hover:text-sky-300 transition-colors">
                      {mod.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {mod.desc}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. OPERATIONAL QUEUES PANELS (VERIFICATION, SALES & CARE)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Verification Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Organization Verification Reviews
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('admin_desk', 'businesses')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {allBusinesses.slice(0, 4).map((b) => (
              <div
                key={b.business_id}
                onClick={() => onNavigateTab('admin_desk', 'businesses')}
                className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs"
              >
                <div className="truncate">
                  <div className="font-bold text-white truncate">{b.organization_name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {b.category} • {b.city || 'Aviation Hub'}
                  </div>
                </div>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                    b.verification_status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {b.verification_status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Care SLAs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Headphones className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Active VIP Care Inquiries
              </h4>
            </div>
            <button
              type="button"
              onClick={onOpenCustomerCare}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>Open Desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {openTickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <span>All customer care tickets are resolved. No pending SLA queues.</span>
              </div>
            ) : (
              openTickets.slice(0, 4).map((t: CRMSupportTicket) => (
                <div
                  key={t.id}
                  onClick={onOpenCustomerCare}
                  className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs"
                >
                  <div className="truncate">
                    <div className="font-bold text-white truncate">{t.subject}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Client: {t.client_name || 'VIP Aviator'} • {t.category}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                      t.priority === 'URGENT'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    }`}
                  >
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

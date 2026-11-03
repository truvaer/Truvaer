import React, { useState } from 'react';
import {
  TrendingUp,
  FileText,
  DollarSign,
  MessageSquare,
  Bell,
  CreditCard,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Compass,
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  ExternalLink,
  Target,
  Users,
  Building2,
  Receipt,
  Plus,
  Eye,
  Zap,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { BusinessProfile, RegularUser, CRMLead, CRMQuotation, CommissionRecord } from '../types';
import { LeadManagementLineChart } from './LeadManagementLineChart';
import { CommissionPercentageEntryModal } from '../erp/CommissionPercentageEntryModal';

interface BusinessDashboardViewProps {
  currentBusiness: BusinessProfile;
  currentUser: RegularUser | null;
  onNavigateTab: (tab: 'marketing' | 'crm_portal' | 'admin_desk', subTab?: string) => void;
  onOpenWallet: () => void;
  onOpenCommunications: () => void;
  onOpenCustomerCare: () => void;
  onOpenUserProfile: () => void;
  onRefreshData?: () => void;
  onOpenFlashNewsDesk?: () => void;
}

export const BusinessDashboardView: React.FC<BusinessDashboardViewProps> = ({
  currentBusiness,
  currentUser,
  onNavigateTab,
  onOpenWallet,
  onOpenCommunications,
  onOpenCustomerCare,
  onOpenUserProfile,
  onRefreshData,
  onOpenFlashNewsDesk,
}) => {
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  // Business Data
  const bizId = currentBusiness.business_id;
  const leads: CRMLead[] = db.getCRMLeads(bizId);
  const quotations: CRMQuotation[] = db.getCRMQuotations(bizId);
  const commissions: CommissionRecord[] = db.getCommissions(bizId);
  const corporateWalletBalance = currentBusiness.corporate_wallet?.credit_balance ?? 5000;
  const isVerified = currentBusiness.verification_status === 'VERIFIED';

  // Computed Financials
  const totalCommissionLogged = commissions.reduce((acc, c) => acc + (c.commission_amount || 0), 0);
  const totalNetBalance = commissions.reduce(
    (acc, c) => acc + (c.net_remaining_balance !== undefined ? c.net_remaining_balance : c.sale_amount - c.commission_amount),
    0
  );

  // Lead status counts
  const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;
  const negotiationCount = leads.filter((l) => l.status === 'NEGOTIATION' || l.status === 'CONTACTED').length;
  const wonCount = leads.filter((l) => l.status === 'WON').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. BUSINESS WELCOME & VERIFICATION STATUS BANNER                          */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 overflow-hidden shadow-lg shrink-0">
            {currentBusiness.logoUrl ? (
              <img src={currentBusiness.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-7 h-7 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight">
                {currentBusiness.organization_name}
              </h2>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isVerified
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isVerified ? 'VERIFIED ENTERPRISE' : 'IN REVIEW'}
              </span>
              {currentBusiness.truvaer_id && (
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  ID: {currentBusiness.truvaer_id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentBusiness.category} • {currentBusiness.subCategory || 'Commercial Aviation Operator'} • Corporate Hub
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCommissionModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-amber-500/50 text-amber-300 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
            title="View Platform Commission Breakdown & Net Proceeds (Read-Only)"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>View Commission Details</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('crm_portal')}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Open Sales Portal</span>
          </button>

          {/* Flash News Publish Option for Business / Corporate account holder */}
          {currentBusiness.can_publish_flashnews !== false && (
            <button
              type="button"
              onClick={() => {
                if (onOpenFlashNewsDesk) {
                  onOpenFlashNewsDesk();
                } else {
                  onNavigateTab('marketing');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
              title="Compose, verify credits, and publish Flash News broadcast"
            >
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Publish Flash News</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenWallet}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-300 font-bold text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>{corporateWalletBalance.toLocaleString()} Credits</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CORE PERFORMANCE METRICS TILES                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sales Pipeline */}
        <div
          onClick={() => onNavigateTab('crm_portal')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Active Inbound Leads</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-2">{leads.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1.5">
            <span className="text-emerald-400 font-bold">{newLeadsCount} New</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">{negotiationCount} Active</span>
          </div>
        </div>

        {/* Quotations */}
        <div
          onClick={() => onNavigateTab('crm_portal')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Client Quotations</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono mt-2">{quotations.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {quotations.filter((q) => q.status === 'ACCEPTED').length} Accepted Contracts
          </div>
        </div>

        {/* Expected Commissions */}
        <div
          onClick={() => onNavigateTab('crm_portal')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Commission Logged</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-2">
            ₹{(totalCommissionLogged / 100000).toFixed(1)} <span className="text-xs font-sans text-slate-400">L</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {commissions.length} active deal entries
          </div>
        </div>

        {/* Net Remaining Balance */}
        <div
          onClick={() => onNavigateTab('crm_portal')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-3xl transition-all shadow-md cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Net Proceeds Due</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            ₹{(totalNetBalance / 100000).toFixed(1)} <span className="text-xs font-sans text-slate-400">L</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            Operator Net Balance
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CORE REQUIREMENT: LEAD MANAGEMENT IN LINE GRAPH FORMAT (7, 14, 30 DAYS) */}
      {/* ========================================================================= */}
      <LeadManagementLineChart
        leads={leads}
        businessName={currentBusiness.organization_name}
      />

      {/* ========================================================================= */}
      {/* 4. ENABLED MODULES EASY-ACCESS LAUNCHER TILES                             */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Your Enabled Business Modules</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Pre-configured strictly to your corporate aviation permissions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Module 1: Quotations */}
          <div
            onClick={() => onNavigateTab('crm_portal')}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-xs group-hover:text-sky-300 transition-colors">
                  Client Quotations
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Generate, track &amp; issue flight quotes
                </div>
              </div>
            </div>
          </div>

          {/* Module 2: Client Follow-up & Leads */}
          <div
            onClick={() => onNavigateTab('crm_portal')}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-xs group-hover:text-blue-300 transition-colors">
                  Client Follow-up
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Manage leads, calls &amp; negotiations
                </div>
              </div>
            </div>
          </div>

          {/* Module 3: Commission Percentage Transparency (View Only) */}
          <div
            onClick={() => setShowCommissionModal(true)}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
                    Commission Ledger
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    VIEW ONLY
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Inspect transparent auto-calculations &amp; net balances
                </div>
              </div>
            </div>
          </div>

          {/* Module 4: Corporate Credit Wallet */}
          <div
            onClick={onOpenWallet}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
                  Corporate Wallet
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {corporateWalletBalance.toLocaleString()} Cr balance &amp; payouts
                </div>
              </div>
            </div>
          </div>

          {/* Module 5: Direct Chat & Support */}
          <div
            onClick={onOpenCommunications}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-xs group-hover:text-indigo-300 transition-colors">
                  Live Direct Chat
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Encrypted client &amp; operator messaging
                </div>
              </div>
            </div>
          </div>

          {/* Module 6: Notifications & Inquiries */}
          <div
            onClick={onOpenCommunications}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
                  Alerts &amp; Inquiries
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Real-time charter bookings &amp; dispatches
                </div>
              </div>
            </div>
          </div>

          {/* Module 7: VIP Concierge Customer Care */}
          <div
            onClick={onOpenCustomerCare}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">
                  VIP Concierge Care
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Dedicated 24/7 aviation resolution desk
                </div>
              </div>
            </div>
          </div>

          {/* Module 8: Corporate Profile & Security */}
          <div
            onClick={onOpenUserProfile}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-teal-500/60 rounded-2xl transition-all shadow-md cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-xs group-hover:text-teal-300 transition-colors">
                  Corporate Profile
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Fleet assets, base airports &amp; security
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. 360° DEPARTMENT VISIBILITY: SALES, MARKETING, SUPPORT & FINANCE       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales & Follow-up Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Recent Leads &amp; Quotations Queue
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('crm_portal')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>View All CRM</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {leads.slice(0, 4).map((ld) => (
              <div
                key={ld.id}
                onClick={() => onNavigateTab('crm_portal')}
                className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="truncate">
                  <div className="font-bold text-white text-xs truncate">{ld.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Client: {ld.client_name} • {ld.category}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    ₹{((ld.budget || 0) / 100000).toFixed(1)}L
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.2 rounded-full border ${
                      ld.status === 'WON'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : ld.status === 'NEGOTIATION'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {ld.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Visibility & Support Center */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Marketing Visibility &amp; Support Status
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('marketing')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer font-semibold"
            >
              <span>View Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* ServiceScout Listing Status */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center space-x-1.5">
                  <span>ServiceScout Verified Showcase</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Appearing in civil aviation charter directory &amp; searches
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {/* Direct Charter Inquiries */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Direct Client Messages &amp; Inquiries</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  End-to-end encrypted aviator inquiries awaiting answer
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenCommunications}
                className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Open Inbox
              </button>
            </div>

            {/* 24/7 Care & Support */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-white">24/7 VIP Concierge &amp; Care Assistance</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  B2B Priority queue for slot approvals &amp; handling
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenCustomerCare}
                className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Connect VIP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Percentage Transparency Modal (View Only for Business Users) */}
      <CommissionPercentageEntryModal
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        currentBusiness={currentBusiness}
        currentUser={currentUser}
        isViewOnly={true}
        onCommissionLogged={() => {
          if (onRefreshData) onRefreshData();
        }}
      />
    </div>
  );
};

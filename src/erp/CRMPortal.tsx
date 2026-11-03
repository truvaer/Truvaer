import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  FileText,
  Users,
  Target,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Send,
  Building2,
  Calendar,
  Globe,
  MapPin,
  Sparkles,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  Download,
  Trash2,
  Eye,
  Check,
  Percent,
  Receipt,
  Calculator,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { SalesDashboard } from './SalesDashboard';
import { DirectServiceOfferModal } from '../marketing/DirectServiceOfferModal';
import { ProfileViewsConversionChart } from './ProfileViewsConversionChart';
import { CommissionPercentageEntryModal } from './CommissionPercentageEntryModal';
import {
  CRMLead,
  CRMLeadStatus,
  CRMOpportunity,
  CRMOpportunityStage,
  CRMQuotation,
  CRMQuotationItem,
  CRMQuotationStatus,
  CRMSupportTicket,
  CommissionRecord,
  BusinessProfile,
  AdminUser,
  RegularUser,
} from '../types';
import { ArrowLeft } from 'lucide-react';

interface CRMPortalProps {
  currentBusiness?: BusinessProfile | null;
  currentUser?: RegularUser | null;
  activeAdminUser?: AdminUser | null;
  onOpenWallet?: () => void;
  onRefreshData?: () => void;
  onOpenUserProfile?: () => void;
  initialTab?: 'sales' | 'pipeline' | 'leads' | 'quotations' | 'commissions' | 'support';
  onReturnToDashboard?: () => void;
}

export const CRMPortal: React.FC<CRMPortalProps> = ({
  currentBusiness,
  currentUser,
  activeAdminUser,
  onOpenWallet,
  onRefreshData,
  onOpenUserProfile,
  initialTab,
  onReturnToDashboard,
}) => {
  // Navigation Tabs in CRM
  const [activeTab, setActiveTab] = useState<'sales' | 'pipeline' | 'leads' | 'quotations' | 'commissions' | 'support'>(
    initialTab || 'sales'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Business context selection (for admin to inspect any business, or defaults to logged-in business)
  const businesses = useMemo(() => db.getBusinesses(), []);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(
    currentBusiness?.business_id || (businesses.length > 0 ? businesses[0].business_id : '')
  );

  useEffect(() => {
    if (currentBusiness) {
      setSelectedBusinessId(currentBusiness.business_id);
    }
  }, [currentBusiness]);

  // Geographic Scoping Filters (Zonal, Country, Territory)
  const [selectedZone, setSelectedZone] = useState<string>('All Zones');
  const [selectedCountry, setSelectedCountry] = useState<string>('All Countries');
  const [selectedTerritory, setSelectedTerritory] = useState<string>('All Hubs');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>([]);
  const [quotations, setQuotations] = useState<CRMQuotation[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [tickets, setTickets] = useState<CRMSupportTicket[]>([]);

  // Modals
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showDirectOfferModal, setShowDirectOfferModal] = useState(false);
  const [preselectedCustomer, setPreselectedCustomer] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showAddOppModal, setShowAddOppModal] = useState(false);
  const [showCreateQuotModal, setShowCreateQuotModal] = useState(false);
  const [showCommissionEntryModal, setShowCommissionEntryModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState<CommissionRecord | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<CRMSupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isFinanceAdmin =
    activeAdminUser &&
    (activeAdminUser.department === 'Finance' ||
      activeAdminUser.department === 'Senior Management Team' ||
      activeAdminUser.role === 'SUPER_ADMIN');

  const canAdminEdit =
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.module_permissions?.CRM?.access === 'EDIT' ||
    activeAdminUser?.module_permissions?.CRM?.access === 'FULL';

  // Load CRM Data
  const loadCrmData = () => {
    const bizId = currentBusiness ? currentBusiness.business_id : selectedBusinessId || undefined;
    const leadsData = db.getCRMLeads(bizId, selectedZone, selectedCountry, selectedTerritory);
    const oppsData = db.getCRMOpportunities(bizId, selectedZone, selectedCountry, selectedTerritory);
    const quotsData = db.getCRMQuotations(bizId);
    const commsData = db.getCommissions(bizId);
    const ticketsData = db.getCRMSupportTickets(bizId);

    setLeads(leadsData);
    setOpportunities(oppsData);
    setQuotations(quotsData);
    setCommissions(commsData);
    setTickets(ticketsData);
  };

  useEffect(() => {
    loadCrmData();
  }, [selectedBusinessId, selectedZone, selectedCountry, selectedTerritory, currentBusiness]);

  // Flash alert
  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // -------------------------------------------------------------
  // OPPORTUNITIES & PIPELINE HANDLERS
  // -------------------------------------------------------------
  const handleMoveOppStage = (oppId: string, newStage: CRMOpportunityStage) => {
    const res = db.updateCRMOpportunity(oppId, { stage: newStage });
    loadCrmData();
    if (res.commissionGenerated) {
      showNotice(
        `🎉 Deal Closed Won! Automated Commission Sheet created for ₹${res.commissionGenerated.commission_amount.toLocaleString()} (5% platform fee).`,
        'success'
      );
    } else {
      showNotice(`Deal stage updated to ${newStage}.`, 'success');
    }
  };

  // -------------------------------------------------------------
  // QUOTATION ACCEPTANCE (TRIGGERS COMMISSION AUTOMATICALLY)
  // -------------------------------------------------------------
  const handleAcceptQuotation = (quotId: string) => {
    const res = db.updateCRMQuotationStatus(quotId, 'ACCEPTED');
    loadCrmData();
    if (res.commissionGenerated) {
      showNotice(
        `✅ Quotation Accepted! Automatically generated platform commission record for ₹${res.commissionGenerated.commission_amount.toLocaleString()} in Commission Sheet.`,
        'success'
      );
    } else {
      showNotice(`Quotation status updated to ACCEPTED.`, 'success');
    }
  };

  // -------------------------------------------------------------
  // RELEASE COMMISSION PAYMENT (FOR BUSINESS USER)
  // -------------------------------------------------------------
  const handleReleaseCommission = (
    commissionId: string,
    method: 'CORPORATE_WALLET' | 'BANK_TRANSFER' | 'RAZORPAY_GATEWAY',
    notes: string
  ) => {
    const res = db.releaseCommissionPayment(commissionId, method, notes);
    if (res.success) {
      showNotice(res.message, 'success');
      setShowReleaseModal(null);
      loadCrmData();
      if (onRefreshData) onRefreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // SETTLE COMMISSION (EXCLUSIVELY FOR FINANCE ADMIN)
  // -------------------------------------------------------------
  const handleSettleCommission = (commissionId: string) => {
    if (!activeAdminUser) {
      showNotice('Admin authentication required.', 'error');
      return;
    }
    const res = db.settleCommissionByFinance(commissionId, activeAdminUser.admin_id);
    if (res.success) {
      showNotice(res.message, 'success');
      loadCrmData();
      if (onRefreshData) onRefreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // TICKET REPLY
  // -------------------------------------------------------------
  const handleSendTicketReply = () => {
    if (!activeTicket || !ticketReplyText.trim()) return;
    const sender = currentBusiness ? currentBusiness.organization_name : activeAdminUser?.name || 'Support Desk';
    const role = currentBusiness ? 'CLIENT' : 'SUPPORT_REP';
    const updated = db.addTicketMessage(activeTicket.id, sender, role, ticketReplyText.trim());
    if (updated) {
      setActiveTicket({ ...updated });
      setTicketReplyText('');
      loadCrmData();
      showNotice('Message posted to support case thread.', 'success');
    }
  };

  // Pipeline Metrics Calculation
  const totalPipelineValue = opportunities.reduce((acc, o) => acc + (o.deal_value || 0), 0);
  const wonOpportunities = opportunities.filter((o) => o.stage === 'CLOSED_WON');
  const totalWonValue = wonOpportunities.reduce((acc, o) => acc + (o.deal_value || 0), 0);
  const totalCommissionsCommitted = commissions.reduce((acc, c) => acc + (c.commission_amount || 0), 0);
  const totalCommissionsSettled = commissions
    .filter((c) => c.status === 'SETTLED')
    .reduce((acc, c) => acc + (c.commission_amount || 0), 0);

  // Filter all datasets by search query (including company/organization name)
  const filteredOpps = useMemo(() => {
    if (!searchQuery.trim()) return opportunities;
    const q = searchQuery.toLowerCase().trim();
    return opportunities.filter(
      (o) =>
        o.business_name?.toLowerCase().includes(q) ||
        o.client_name?.toLowerCase().includes(q) ||
        o.deal_name?.toLowerCase().includes(q)
    );
  }, [opportunities, searchQuery]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase().trim();
    return leads.filter(
      (l) =>
        l.business_name?.toLowerCase().includes(q) ||
        l.client_name?.toLowerCase().includes(q) ||
        l.title?.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const filteredQuotations = useMemo(() => {
    if (!searchQuery.trim()) return quotations;
    const q = searchQuery.toLowerCase().trim();
    return quotations.filter(
      (qt) =>
        qt.business_name?.toLowerCase().includes(q) ||
        qt.client_name?.toLowerCase().includes(q) ||
        qt.quotation_number?.toLowerCase().includes(q)
    );
  }, [quotations, searchQuery]);

  const filteredCommissions = useMemo(() => {
    if (!searchQuery.trim()) return commissions;
    const q = searchQuery.toLowerCase().trim();
    return commissions.filter(
      (c) =>
        c.business_name?.toLowerCase().includes(q) ||
        c.client_name?.toLowerCase().includes(q) ||
        c.deal_title?.toLowerCase().includes(q)
    );
  }, [commissions, searchQuery]);

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase().trim();
    return tickets.filter(
      (t) =>
        t.business_name?.toLowerCase().includes(q) ||
        t.client_name?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  const activeBiz = businesses.find((b) => b.business_id === selectedBusinessId) || currentBusiness;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-sky-400" />
                <span>Enterprise Sale Portal</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/30">
                Full Lifecycle Sale &amp; Commission Sheet Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Complete aviation CRM suite: Lead &amp; Opportunity Management, Sales Funnel Pipeline, Quotation Preparations,
              Automated 5% Platform Commission Sheet Generation, and 24/7 Airside Support.
            </p>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            {onReturnToDashboard && (
              <button
                type="button"
                onClick={onReturnToDashboard}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-colors shrink-0"
                title="Return back to Dashboard Overview"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Return to Dashboard</span>
              </button>
            )}

            {/* Quick Business Selector (For Admin oversight) */}
            {!currentBusiness && (
              <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-700/80 p-2.5 rounded-2xl">
                <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Inspecting Business Account:
                  </div>
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-2"
                  >
                    <option value="" className="bg-slate-900 text-slate-200">
                      All Partner Organizations
                    </option>
                    {businesses.map((b) => (
                      <option key={b.business_id} value={b.business_id} className="bg-slate-900 text-slate-200">
                        {b.organization_name} ({b.country || 'IN'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Geographic Scoping Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-medium flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Territory Scope:</span>
          </span>

          {/* Zone Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] text-slate-400">Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent font-semibold text-white outline-none text-[11px] cursor-pointer"
            >
              <option value="All Zones" className="bg-slate-900">All Zones</option>
              <option value="West Zone" className="bg-slate-900">West Zone (BOM)</option>
              <option value="North Zone" className="bg-slate-900">North Zone (DEL)</option>
              <option value="South Zone" className="bg-slate-900">South Zone (BLR)</option>
              <option value="European Hub" className="bg-slate-900">European Hub (MUC/LHR)</option>
              <option value="Middle East Hub" className="bg-slate-900">Middle East Hub (DXB)</option>
              <option value="Americas" className="bg-slate-900">Americas (MIA)</option>
            </select>
          </div>

          {/* Country Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] text-slate-400">Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent font-semibold text-white outline-none text-[11px] cursor-pointer"
            >
              <option value="All Countries" className="bg-slate-900">All Countries</option>
              <option value="IN" className="bg-slate-900">India (IN)</option>
              <option value="AE" className="bg-slate-900">UAE (AE)</option>
              <option value="US" className="bg-slate-900">United States (US)</option>
              <option value="DE" className="bg-slate-900">Germany (DE)</option>
              <option value="GB" className="bg-slate-900">United Kingdom (GB)</option>
              <option value="SG" className="bg-slate-900">Singapore (SG)</option>
            </select>
          </div>

          {/* Territory Hub Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] text-slate-400">Hub:</span>
            <select
              value={selectedTerritory}
              onChange={(e) => setSelectedTerritory(e.target.value)}
              className="bg-transparent font-semibold text-white outline-none text-[11px] cursor-pointer"
            >
              <option value="All Hubs" className="bg-slate-900">All Airside Hubs</option>
              <option value="BOM (Mumbai)" className="bg-slate-900">BOM (Mumbai)</option>
              <option value="DEL (Delhi)" className="bg-slate-900">DEL (Delhi)</option>
              <option value="DXB (Dubai)" className="bg-slate-900">DXB (Dubai)</option>
              <option value="MUC (Munich)" className="bg-slate-900">MUC (Munich)</option>
              <option value="MIA (Miami)" className="bg-slate-900">MIA (Miami)</option>
            </select>
          </div>

          {/* Quick Company Name Search in Module */}
          <div className="flex items-center space-x-1.5 bg-slate-950/80 border border-slate-700/80 px-3 py-1.5 rounded-xl ml-auto">
            <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <input
              type="text"
              placeholder="Search Company Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-500 hover:text-white text-xs cursor-pointer ml-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Filtered: {filteredOpps.length} Deals • {filteredLeads.length} Leads • {filteredQuotations.length} Quotes • {filteredCommissions.length} Commissions
          </div>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-sky-400" />
            <span>Total Pipeline Value</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white mt-1">
            ₹{(totalPipelineValue / 100000).toFixed(1)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            Across {opportunities.length} active opportunities
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Won Deals Converted</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
            ₹{(totalWonValue / 100000).toFixed(1)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            {wonOpportunities.length} confirmed sales contracts
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Committed Commission (5%)</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400 mt-1">
            ₹{(totalCommissionsCommitted / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            Auto-calculated upon deal completion
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Settled in Treasury Ledger</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-purple-400 mt-1">
            ₹{(totalCommissionsSettled / 100000).toFixed(2)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            Verified by Finance &amp; Treasury Desk
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/70 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'sales'
              ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Sales Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'pipeline'
              ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Sales Pipeline &amp; Opportunities</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'leads'
              ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads Management ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'quotations'
              ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quotations &amp; Proposals ({quotations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'commissions'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Automatic Commission Sheet ({commissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === 'support'
              ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Client Support &amp; Disputes ({tickets.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 0. SALES DASHBOARD & TRANSACTION REGISTER (Row Actions & Reports) */}
      {/* ========================================================= */}
      {activeTab === 'sales' && (
        <SalesDashboard
          businessId={selectedBusinessId}
          selectedZone={selectedZone}
          selectedCountry={selectedCountry}
          selectedTerritory={selectedTerritory}
          currentUser={currentUser || null}
          currentBusiness={currentBusiness || null}
          currentAdmin={activeAdminUser || null}
          onRefreshData={loadCrmData}
        />
      )}

      {/* ========================================================= */}
      {/* 1. SALES PIPELINE & OPPORTUNITY MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Target className="w-4 h-4 text-sky-400" />
                <span>Opportunity Pipeline Funnel</span>
              </h3>
              <p className="text-xs text-slate-400">
                Move deals along stages. When a deal reaches <span className="text-emerald-400 font-semibold">Closed Won</span>,
                an automated 5% platform commission sheet is generated immediately.
              </p>
            </div>

            <button
              onClick={() => setShowAddOppModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Deal</span>
            </button>
          </div>

          {/* Kanban / Funnel Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(
              [
                { stage: 'PROSPECTING', label: '1. Prospecting', color: 'border-slate-700 bg-slate-900/50' },
                { stage: 'QUALIFICATION', label: '2. Qualification', color: 'border-blue-900/60 bg-blue-950/20' },
                { stage: 'PROPOSAL', label: '3. Proposal Sent', color: 'border-amber-900/60 bg-amber-950/20' },
                { stage: 'NEGOTIATION', label: '4. Negotiation', color: 'border-purple-900/60 bg-purple-950/20' },
                { stage: 'CLOSED_WON', label: '5. Closed Won (Auto-Comm)', color: 'border-emerald-800/80 bg-emerald-950/30' },
                { stage: 'CLOSED_LOST', label: '6. Closed Lost', color: 'border-rose-900/60 bg-rose-950/20' },
              ] as const
            ).map((col) => {
              const stageOpps = filteredOpps.filter((o) => o.stage === col.stage);
              const stageValue = stageOpps.reduce((acc, o) => acc + o.deal_value, 0);

              return (
                <div key={col.stage} className={`border rounded-2xl p-3 flex flex-col min-h-[380px] ${col.color}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-bold text-white">{col.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {stageOpps.length}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 mb-3">
                    ₹{(stageValue / 100000).toFixed(1)} L
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {stageOpps.length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic text-center py-6">No deals</div>
                    ) : (
                      stageOpps.map((opp) => (
                        <div
                          key={opp.id}
                          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-3 rounded-xl shadow transition-all text-xs"
                        >
                          <div className="font-bold text-white text-xs line-clamp-2">{opp.deal_name}</div>
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                            <span>{opp.client_name}</span>
                            <span className="text-sky-300 font-mono font-bold">
                              ₹{(opp.deal_value / 100000).toFixed(1)} L
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-2.5 h-2.5 text-amber-400" />
                              <span>{opp.territory}</span>
                            </span>
                            <span className="font-mono">{opp.probability}% Prob</span>
                          </div>

                          {/* Move Stage Selector */}
                          <div className="mt-2.5">
                            <label className="text-[9px] uppercase font-mono text-slate-400 block mb-1">
                              Advance Stage:
                            </label>
                            <select
                              value={opp.stage}
                              onChange={(e) => handleMoveOppStage(opp.id, e.target.value as CRMOpportunityStage)}
                              className="w-full bg-slate-950 border border-slate-700 text-[10px] rounded-lg px-2 py-1 text-slate-200 cursor-pointer font-medium"
                            >
                              <option value="PROSPECTING">Prospecting</option>
                              <option value="QUALIFICATION">Qualification</option>
                              <option value="PROPOSAL">Proposal</option>
                              <option value="NEGOTIATION">Negotiation</option>
                              <option value="CLOSED_WON">Closed Won (Auto Comm)</option>
                              <option value="CLOSED_LOST">Closed Lost</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. LEADS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Commercial Aviation Leads</span>
              </h3>
              <p className="text-xs text-slate-400">
                Inbound customer flight charter inquiries, aircraft MRO overhauls, and cadet pilot applications.
              </p>
            </div>

            <button
              onClick={() => setShowAddLeadModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Capture New Lead</span>
            </button>
          </div>

          {/* Profile Views & Lead Conversion Chart (B2) */}
          <ProfileViewsConversionChart
            businessName={currentBusiness?.organization_name}
            totalLeadsCount={leads.length}
          />

          {/* Leads Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Client &amp; Contact</th>
                    <th className="px-4 py-3 font-semibold">Inquiry Title / Category</th>
                    <th className="px-4 py-3 font-semibold">Territory</th>
                    <th className="px-4 py-3 font-semibold">Budget</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Assigned Agent</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs italic">
                        No leads found matching current company or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white text-xs">{lead.client_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{lead.client_email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{lead.client_phone}</div>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-white truncate">{lead.title}</div>
                        <div className="text-[10px] text-sky-400 font-mono">
                          {lead.category} • {lead.subCategory}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {lead.requirement_details}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{lead.territory}</div>
                        <div className="text-[10px] text-slate-400">{lead.zone}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-emerald-400">
                          ₹{(lead.budget / 100000).toFixed(1)} L
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{lead.source}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1.5">
                          <select
                            value={lead.status}
                            onChange={(e) => {
                              db.updateCRMLead(lead.id, { status: e.target.value as CRMLeadStatus });
                              loadCrmData();
                              showNotice(`Lead status updated to ${e.target.value}`, 'success');
                            }}
                            className="bg-slate-950 border border-slate-700 text-[11px] font-semibold rounded-lg px-2 py-1 text-slate-200 cursor-pointer"
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="QUALIFIED">QUALIFIED</option>
                            <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                            <option value="NEGOTIATION">NEGOTIATION</option>
                            <option value="WON">WON</option>
                            <option value="LOST">LOST</option>
                          </select>

                          {/* Quick-action button shortcuts */}
                          {lead.status === 'NEW' && (
                            <button
                              onClick={() => {
                                db.updateCRMLead(lead.id, { status: 'CONTACTED' });
                                loadCrmData();
                                showNotice(`Lead "${lead.title}" marked as CONTACTED`, 'success');
                              }}
                              className="px-2 py-0.5 bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white rounded text-[10px] font-bold border border-sky-500/40 cursor-pointer"
                              title="1-click mark Contacted"
                            >
                              Contacted
                            </button>
                          )}
                          {lead.status === 'CONTACTED' && (
                            <button
                              onClick={() => {
                                db.updateCRMLead(lead.id, { status: 'QUALIFIED' });
                                loadCrmData();
                                showNotice(`Lead "${lead.title}" marked as QUALIFIED`, 'success');
                              }}
                              className="px-2 py-0.5 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded text-[10px] font-bold border border-purple-500/40 cursor-pointer"
                              title="1-click mark Qualified"
                            >
                              Qualify
                            </button>
                          )}
                          {lead.status === 'NEGOTIATION' && (
                            <button
                              onClick={() => {
                                db.updateCRMLead(lead.id, { status: 'WON' });
                                loadCrmData();
                                showNotice(`Lead "${lead.title}" marked as WON!`, 'success');
                              }}
                              className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-[10px] font-bold border border-emerald-500/40 cursor-pointer"
                              title="1-click mark Won"
                            >
                              Won
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-slate-300 font-medium">{lead.assigned_to}</span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setPreselectedCustomer({
                                id: lead.id,
                                name: lead.client_name,
                                email: lead.client_email,
                              });
                              setShowDirectOfferModal(true);
                            }}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                            title="Directly pitch and send custom service offer to this customer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Offer Service</span>
                          </button>

                          <button
                            onClick={() => {
                              // Convert Lead to Deal in Pipeline
                              db.createCRMOpportunity({
                                lead_id: lead.id,
                                business_id: lead.business_id,
                                business_name: lead.business_name,
                                deal_name: `${lead.client_name} - ${lead.title}`,
                                client_name: lead.client_name,
                                deal_value: lead.budget,
                                stage: 'PROSPECTING',
                                assigned_to: lead.assigned_to,
                                zone: lead.zone,
                                country: lead.country,
                                territory: lead.territory,
                              });
                              db.updateCRMLead(lead.id, { status: 'QUALIFIED' });
                              loadCrmData();
                              showNotice(`Lead "${lead.title}" converted into Pipeline Deal!`, 'success');
                              setActiveTab('pipeline');
                            }}
                            className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Convert to Deal
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. QUOTATIONS & PROPOSALS */}
      {/* ========================================================= */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Executive Quotations &amp; Flight Cost Estimates</span>
              </h3>
              <p className="text-xs text-slate-400">
                Itemized flight charter and maintenance cost estimates. Accepting a quotation automatically triggers
                the platform's 5% partnership commission sheet.
              </p>
            </div>

            <button
              onClick={() => setShowCreateQuotModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Draft Quotation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuotations.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-500 italic">
                No quotations found matching current company or search query.
              </div>
            ) : (
              filteredQuotations.map((q) => (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                        {q.quotation_number}
                      </span>
                      <h4 className="text-sm font-black text-white mt-0.5">{q.service_title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Client: <span className="text-slate-200 font-semibold">{q.client_name}</span> ({q.client_email})
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        q.status === 'ACCEPTED' || q.status === 'INVOICED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : q.status === 'SENT'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          : q.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  {/* Line items preview */}
                  <div className="mt-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
                    <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                      Quotation Line Items:
                    </div>
                    {q.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate max-w-[280px]">
                          {item.description} (x{item.quantity})
                        </span>
                        <span className="font-mono text-white">₹{item.total.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-white">
                      <span>Grand Total (incl. {q.tax_percent}% tax):</span>
                      <span className="text-sky-400 font-mono text-sm">₹{q.grand_total.toLocaleString()}</span>
                    </div>
                  </div>

                  {q.notes && (
                    <div className="text-[11px] text-slate-400 italic mt-3 bg-slate-950/30 p-2.5 rounded-xl border border-slate-800/40">
                      Note: {q.notes}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Valid until: {q.valid_until} • {q.territory}
                  </div>

                  <div className="flex items-center space-x-2">
                    {q.status !== 'ACCEPTED' && q.status !== 'INVOICED' && (
                      <button
                        onClick={() => handleAcceptQuotation(q.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow cursor-pointer flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept &amp; Commit Sale</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. AUTOMATIC COMMISSION MODULE & PAYMENT RELEASE */}
      {/* ========================================================= */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/30 p-5 rounded-2xl shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    Commission Percentage Entry &amp; Accounting Ledger
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                    Transparent Auto-Calculation
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Log the expected commission percentage on any flight sale or charter contract. The system automatically calculates final commission values, determines remaining net balances to partner operators, and instantly shares the ledger with the Platform Admin team for accounting and transparency.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  id="crm-log-commission-entry-btn"
                  onClick={() => setShowCommissionEntryModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5 cursor-pointer transition-transform active:scale-95"
                >
                  {currentBusiness && !activeAdminUser ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>View Commission Structure (View Only)</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" />
                      <span>Log Commission % Entry</span>
                    </>
                  )}
                </button>

                {isFinanceAdmin && (
                  <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl text-xs text-amber-200 flex items-center space-x-2 shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Finance Clearance Desk</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Commission Sheet Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Deal / Sale Title</th>
                    <th className="px-4 py-3 font-semibold">Partner Business</th>
                    <th className="px-4 py-3 font-semibold">Gross Sale</th>
                    <th className="px-4 py-3 font-semibold">Comm %</th>
                    <th className="px-4 py-3 font-semibold">Calculated Commission</th>
                    <th className="px-4 py-3 font-semibold text-emerald-400">Net Balance (Operator)</th>
                    <th className="px-4 py-3 font-semibold">Admin Transparency</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-xs italic">
                        No commission records found matching current company or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredCommissions.map((comm) => {
                      const netBalance =
                        comm.net_remaining_balance !== undefined
                          ? comm.net_remaining_balance
                          : Math.max(0, comm.sale_amount - comm.commission_amount);

                      return (
                        <tr key={comm.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white text-xs">{comm.deal_title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Client: {comm.client_name} • Ref: {comm.id}
                            </div>
                            {comm.payment_reference && (
                              <div className="text-[10px] text-sky-400 font-mono">
                                Txn Ref: {comm.payment_reference}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-200">{comm.business_name}</div>
                            <div className="text-[10px] text-slate-400">{comm.territory}</div>
                          </td>

                          <td className="px-4 py-3 font-mono font-bold text-white">
                            ₹{comm.sale_amount.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 font-mono text-amber-300 font-bold">
                            {comm.commission_rate_pct}%
                          </td>

                          <td className="px-4 py-3 font-mono font-black text-amber-400 text-sm">
                            ₹{comm.commission_amount.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 font-mono font-black text-emerald-400 text-sm">
                            ₹{netBalance.toLocaleString()}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1 text-[10px] font-mono font-semibold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-500/30 w-fit">
                              <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
                              <span>Shared with Admin</span>
                            </div>
                            {comm.shared_with_admin_at && (
                              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                Synced: {new Date(comm.shared_with_admin_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                comm.status === 'SETTLED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : comm.status === 'RELEASED'
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {comm.status}
                            </span>
                            {comm.settled_by_admin && (
                              <div className="text-[9px] text-emerald-400 mt-1 line-clamp-1">
                                By {comm.settled_by_admin}
                              </div>
                            )}
                          </td>

                        <td className="px-4 py-3 text-right">
                          {comm.status === 'COMMITTED' && (
                            <button
                              onClick={() => setShowReleaseModal(comm)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1.5 ml-auto"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Release Payment</span>
                            </button>
                          )}

                          {comm.status === 'RELEASED' && isFinanceAdmin && (
                            <button
                              onClick={() => handleSettleCommission(comm.id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1.5 ml-auto"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Finance Settle</span>
                            </button>
                          )}

                          {comm.status === 'RELEASED' && !isFinanceAdmin && (
                            <span className="text-[11px] text-sky-400 italic">
                              Payment Released • Awaiting Finance Audit
                            </span>
                          )}

                          {comm.status === 'SETTLED' && (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SUPPORT & CUSTOMER TICKETS */}
      {/* ========================================================= */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>Airside Support Desk &amp; Concierge Inquiries</span>
              </h3>
              <p className="text-xs text-slate-400">
                VIP passenger requests, catering preferences, airport tarmac permits, and dispute resolution.
              </p>
            </div>

            <button
              onClick={() => setShowTicketModal(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Support Case</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Ticket List */}
            <div className="lg:col-span-1 space-y-2">
              {filteredTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-900 border border-slate-800 rounded-2xl">
                  No support cases found matching search criteria.
                </div>
              ) : (
                filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    activeTicket?.id === t.id
                      ? 'bg-slate-800/90 border-sky-500 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-sky-400 font-bold">{t.ticket_number}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        t.priority === 'URGENT' || t.priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{t.subject}</h4>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{t.client_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{t.status}</span>
                  </div>
                </div>
              )))}
            </div>

            {/* Ticket Detail & Chat Thread */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col min-h-[420px]">
              {activeTicket ? (
                <>
                  <div className="pb-3 border-b border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-sky-400 font-bold">
                        {activeTicket.ticket_number} • {activeTicket.category}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{activeTicket.subject}</h4>
                      <p className="text-xs text-slate-400">
                        Initiated by {activeTicket.client_name} ({activeTicket.client_email})
                      </p>
                    </div>

                    <select
                      value={activeTicket.status}
                      onChange={(e) => {
                        const updated = db.updateTicketStatus(activeTicket.id, e.target.value as any);
                        if (updated) setActiveTicket({ ...updated });
                        loadCrmData();
                        showNotice(`Ticket status updated to ${e.target.value}`, 'success');
                      }}
                      className="bg-slate-950 border border-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200 cursor-pointer"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[300px]">
                    {activeTicket.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl max-w-[85%] text-xs ${
                          m.sender_role === 'SUPPORT_REP'
                            ? 'ml-auto bg-sky-950/70 border border-sky-800 text-sky-100'
                            : 'mr-auto bg-slate-950 border border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400 mb-1">
                          <span className="font-bold text-slate-300">{m.sender_name}</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{m.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type response to client or concierge dispatch..."
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendTicketReply()}
                      className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={handleSendTicketReply}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="m-auto text-center text-slate-500 text-xs italic">
                  Select a support ticket from the left to view correspondence thread
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RELEASE COMMISSION PAYMENT */}
      {/* ========================================================= */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Release Platform Commission</h3>
              </div>
              <button
                onClick={() => setShowReleaseModal(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Deal Completed:</span>
                <span className="text-white font-bold">{showReleaseModal.deal_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sale Amount:</span>
                <span className="text-white font-mono">₹{showReleaseModal.sale_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Master Platform Rate:</span>
                <span className="text-white font-mono">{showReleaseModal.commission_rate_pct}%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                <span className="text-amber-400">Committed Commission Fee:</span>
                <span className="text-amber-400 text-base font-mono">
                  ₹{showReleaseModal.commission_amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Payment Release Method:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleReleaseCommission(showReleaseModal.id, 'CORPORATE_WALLET', 'Corporate Wallet Debit')}
                  className="p-3 rounded-xl border border-slate-700 bg-slate-950 hover:border-amber-500 text-center font-bold text-slate-200 hover:text-amber-400 transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  Corporate Wallet
                </button>
                <button
                  type="button"
                  onClick={() => handleReleaseCommission(showReleaseModal.id, 'BANK_TRANSFER', 'Bank Wire / RTGS')}
                  className="p-3 rounded-xl border border-slate-700 bg-slate-950 hover:border-amber-500 text-center font-bold text-slate-200 hover:text-amber-400 transition-all cursor-pointer"
                >
                  <Building2 className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                  Bank Transfer / RTGS
                </button>
                <button
                  type="button"
                  onClick={() => handleReleaseCommission(showReleaseModal.id, 'RAZORPAY_GATEWAY', 'Online Razorpay Gateway')}
                  className="p-3 rounded-xl border border-slate-700 bg-slate-950 hover:border-amber-500 text-center font-bold text-slate-200 hover:text-amber-400 transition-all cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  Razorpay Gateway
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Once released, an official payment transaction reference is dispatched to the Truvaer Finance Desk for
              final treasury ledger audit.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: COMMISSION PERCENTAGE ENTRY (ADMIN & SALES TEAM)   */}
      {/* ========================================================= */}
      <CommissionPercentageEntryModal
        isOpen={showCommissionEntryModal}
        onClose={() => setShowCommissionEntryModal(false)}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        activeAdminUser={activeAdminUser}
        isViewOnly={!!currentBusiness && !activeAdminUser}
        onCommissionLogged={() => {
          loadCrmData();
          showNotice('Commission logged and instantly shared with Platform Admin team for accounting and transparency!', 'success');
        }}
      />

      {/* ========================================================= */}
      {/* MODAL: CREATE LEAD (CATEGORY & SUBCATEGORY ON SAME LINE) */}
      {/* ========================================================= */}
      {showAddLeadModal && (
        <CreateLeadModal
          onClose={() => setShowAddLeadModal(false)}
          onSubmit={(lead) => {
            db.createCRMLead({
              ...lead,
              business_id: activeBiz?.business_id,
              business_name: activeBiz?.organization_name,
            });
            loadCrmData();
            setShowAddLeadModal(false);
            showNotice('New commercial lead captured successfully!', 'success');
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE OPPORTUNITY */}
      {/* ========================================================= */}
      {showAddOppModal && (
        <CreateOppModal
          onClose={() => setShowAddOppModal(false)}
          onSubmit={(opp) => {
            db.createCRMOpportunity({
              ...opp,
              business_id: activeBiz?.business_id,
              business_name: activeBiz?.organization_name,
            });
            loadCrmData();
            setShowAddOppModal(false);
            showNotice('New pipeline opportunity initialized!', 'success');
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: DRAFT QUOTATION */}
      {/* ========================================================= */}
      {showCreateQuotModal && (
        <CreateQuotationModal
          onClose={() => setShowCreateQuotModal(false)}
          onSubmit={(quot) => {
            db.createCRMQuotation({
              ...quot,
              business_id: activeBiz?.business_id,
              business_name: activeBiz?.organization_name,
            });
            loadCrmData();
            setShowCreateQuotModal(false);
            showNotice('Quotation draft generated successfully!', 'success');
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: RAISE TICKET */}
      {/* ========================================================= */}
      {showTicketModal && (
        <CreateTicketModal
          onClose={() => setShowTicketModal(false)}
          onSubmit={(tick) => {
            const newT = db.createCRMSupportTicket({
              ...tick,
              business_id: activeBiz?.business_id,
              business_name: activeBiz?.organization_name,
            });
            loadCrmData();
            setActiveTicket(newT);
            setShowTicketModal(false);
            showNotice('Support ticket created with tracking number!', 'success');
          }}
        />
      )}

      {/* Direct Service Offer Modal for Customers Inquiring for Services */}
      <DirectServiceOfferModal
        isOpen={showDirectOfferModal}
        onClose={() => {
          setShowDirectOfferModal(false);
          setPreselectedCustomer(null);
        }}
        currentBusiness={currentBusiness}
        currentUser={currentUser}
        activeAdminUser={activeAdminUser}
        preselectedCustomer={preselectedCustomer}
        onOfferSent={() => {
          loadCrmData();
          showNotice('Direct service offer dispatched to customer! Chat channel initiated.', 'success');
        }}
      />
    </div>
  );
};

// ===================================================================
// SUB-MODALS (CATEGORY & SUB-CATEGORY ON SAME LINE AS USER SPECIFIED)
// ===================================================================

const CreateLeadModal: React.FC<{
  onClose: () => void;
  onSubmit: (lead: Partial<CRMLead>) => void;
}> = ({ onClose, onSubmit }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Private Air Charter');
  const [subCategory, setSubCategory] = useState('VIP Corporate Jet Charter');
  const [budget, setBudget] = useState(2500000);
  const [territory, setTerritory] = useState('BOM (Mumbai)');
  const [zone, setZone] = useState('West Zone');
  const [country, setCountry] = useState('IN');
  const [details, setDetails] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>Capture New Aviation Lead</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Inquiry Title / Description:</label>
            <input
              type="text"
              placeholder="e.g. Challenger 650 Mumbai to London Charter Request"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>

          {/* CRITICAL: Category & Sub-Category on the SAME LINE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Private Air Charter">Private Air Charter</option>
                <option value="MRO & Avionics">MRO &amp; Avionics</option>
                <option value="Pilot Training & Academies">Pilot Training &amp; Academies</option>
                <option value="Air Ambulance & Medevac">Air Ambulance &amp; Medevac</option>
                <option value="Aviation Spares & Stores">Aviation Spares &amp; Stores</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Sub-Category:</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="VIP Corporate Jet Charter">VIP Corporate Jet Charter</option>
                <option value="Helicopter Charter & Heli-Tours">Helicopter Charter &amp; Heli-Tours</option>
                <option value="Engine & APU Shop Overhaul">Engine &amp; APU Shop Overhaul</option>
                <option value="Commercial Pilot License (CPL)">Commercial Pilot License (CPL)</option>
                <option value="Turbine Rotables & Spares">Turbine Rotables &amp; Spares</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Client Name:</label>
              <input
                type="text"
                placeholder="Lord / Capt / Director"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Client Email:</label>
              <input
                type="email"
                placeholder="client@aviator.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Budget (INR):</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Hub / Territory:</label>
              <select
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="BOM (Mumbai)">BOM (Mumbai)</option>
                <option value="DEL (Delhi)">DEL (Delhi)</option>
                <option value="DXB (Dubai)">DXB (Dubai)</option>
                <option value="MUC (Munich)">MUC (Munich)</option>
                <option value="MIA (Miami)">MIA (Miami)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Contact Phone:</label>
              <input
                type="text"
                placeholder="+91 98200 00000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Specific Operational Requirements:</label>
            <textarea
              rows={2}
              placeholder="Passenger count, VIP catering, runway requirements..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!title.trim() || !clientName.trim()) {
                alert('Please provide inquiry title and client name.');
                return;
              }
              onSubmit({
                title,
                category,
                subCategory,
                client_name: clientName,
                client_email: clientEmail || 'client@aviator.com',
                client_phone: clientPhone || '+91 98000 00000',
                budget,
                territory,
                zone,
                country,
                requirement_details: details,
              });
            }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold shadow cursor-pointer"
          >
            Save Lead
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateOppModal: React.FC<{
  onClose: () => void;
  onSubmit: (opp: Partial<CRMOpportunity>) => void;
}> = ({ onClose, onSubmit }) => {
  const [dealName, setDealName] = useState('');
  const [clientName, setClientName] = useState('');
  const [dealValue, setDealValue] = useState(3500000);
  const [probability, setProbability] = useState(60);
  const [stage, setStage] = useState<CRMOpportunityStage>('PROSPECTING');
  const [territory, setTerritory] = useState('BOM (Mumbai)');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white flex items-center space-x-2">
            <Target className="w-4 h-4 text-sky-400" />
            <span>Create Commercial Pipeline Deal</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Deal Name:</label>
            <input
              type="text"
              placeholder="e.g. Reliance 25-Hour Citation XLS Charter Package"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Client Name:</label>
              <input
                type="text"
                placeholder="Enterprise Client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Deal Value (INR):</label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Initial Stage:</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as CRMOpportunityStage)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="PROSPECTING">Prospecting</option>
                <option value="QUALIFICATION">Qualification</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CLOSED_WON">Closed Won</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Win Prob (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Airside Hub:</label>
              <select
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="BOM (Mumbai)">BOM (Mumbai)</option>
                <option value="DEL (Delhi)">DEL (Delhi)</option>
                <option value="DXB (Dubai)">DXB (Dubai)</option>
                <option value="MUC (Munich)">MUC (Munich)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!dealName.trim() || !clientName.trim()) {
                alert('Please provide deal name and client name.');
                return;
              }
              onSubmit({
                deal_name: dealName,
                client_name: clientName,
                deal_value: dealValue,
                probability,
                stage,
                territory,
              });
            }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold shadow cursor-pointer"
          >
            Add Deal
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateQuotationModal: React.FC<{
  onClose: () => void;
  onSubmit: (quot: Partial<CRMQuotation>) => void;
}> = ({ onClose, onSubmit }) => {
  const [serviceTitle, setServiceTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [item1Desc, setItem1Desc] = useState('Aircraft Flight Charter Hours');
  const [item1Price, setItem1Price] = useState(1500000);
  const [item2Desc, setItem2Desc] = useState('Airport Ramp Handling & Landing Slots');
  const [item2Price, setItem2Price] = useState(250000);
  const [taxPercent, setTaxPercent] = useState(5.0);
  const [notes, setNotes] = useState('All passenger departure lounge access and in-flight catering included.');

  const subtotal = item1Price + item2Price;
  const grandTotal = subtotal + Math.round(subtotal * (taxPercent / 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Generate Executive Aviation Quotation</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Service Title:</label>
            <input
              type="text"
              placeholder="e.g. Hawker 800XP Delhi-Bangalore Same Day Return"
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Client Name:</label>
              <input
                type="text"
                placeholder="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Client Email:</label>
              <input
                type="email"
                placeholder="client@domain.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Line items */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
              Itemized Quotation Lines:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={item1Desc}
                onChange={(e) => setItem1Desc(e.target.value)}
                className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
              />
              <input
                type="number"
                value={item1Price}
                onChange={(e) => setItem1Price(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={item2Desc}
                onChange={(e) => setItem2Desc(e.target.value)}
                className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
              />
              <input
                type="number"
                value={item2Price}
                onChange={(e) => setItem2Price(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
              <span>Subtotal: ₹{subtotal.toLocaleString()}</span>
              <span className="text-sky-400">Total (incl. {taxPercent}%): ₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Notes / Terms:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!serviceTitle.trim() || !clientName.trim()) {
                alert('Please provide service title and client name.');
                return;
              }
              onSubmit({
                service_title: serviceTitle,
                client_name: clientName,
                client_email: clientEmail || 'client@aviator.com',
                items: [
                  { id: '1', description: item1Desc, quantity: 1, unit_price: item1Price, total: item1Price },
                  { id: '2', description: item2Desc, quantity: 1, unit_price: item2Price, total: item2Price },
                ],
                tax_percent: taxPercent,
                notes,
              });
            }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold shadow cursor-pointer"
          >
            Save Quotation
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateTicketModal: React.FC<{
  onClose: () => void;
  onSubmit: (tick: Partial<CRMSupportTicket>) => void;
}> = ({ onClose, onSubmit }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Flight Catering & Logistics');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Raise Customer Support / Concierge Ticket</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Subject / Inquiry Title:</label>
            <input
              type="text"
              placeholder="e.g. VIP ground limousine dispatch coordination"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Flight Catering & Logistics">Flight Catering &amp; Logistics</option>
                <option value="Tarmac Clearance & Slots">Tarmac Clearance &amp; Slots</option>
                <option value="Aircraft Technical Inquiry">Aircraft Technical Inquiry</option>
                <option value="Billing & Commission Reconciliation">Billing &amp; Commission Reconciliation</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent (Immediate Flight Ops)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Client Contact Name:</label>
              <input
                type="text"
                placeholder="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Client Email:</label>
              <input
                type="email"
                placeholder="client@aviator.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Detailed Description:</label>
            <textarea
              rows={3}
              placeholder="Describe the case requirements or issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!subject.trim() || !clientName.trim()) {
                alert('Please provide subject and client name.');
                return;
              }
              onSubmit({
                subject,
                category,
                priority,
                client_name: clientName,
                client_email: clientEmail || 'client@aviator.com',
                messages: [
                  {
                    id: 'msg_initial',
                    sender_name: clientName,
                    sender_role: 'CLIENT',
                    text: message || subject,
                    timestamp: new Date().toISOString(),
                  },
                ],
              });
            }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold shadow cursor-pointer"
          >
            Submit Case
          </button>
        </div>
      </div>
    </div>
  );
};

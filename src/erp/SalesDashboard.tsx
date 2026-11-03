import React, { useState, useMemo, useEffect } from 'react';
import {
  CRMLead,
  CRMLeadStatus,
  CRMOpportunity,
  CRMOpportunityStage,
  BusinessProfile,
  AdminUser,
  RegularUser,
} from '../types';
import { db } from '../data/mockDatabase';
import { SalesDashboardList } from './SalesDashboardList';
import {
  TrendingUp,
  Target,
  Users,
  Filter,
  SlidersHorizontal,
  Plus,
  Search,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  Sparkles,
  RotateCcw,
  Receipt,
  Calendar,
  DollarSign,
  Check,
  X,
  ChevronDown,
  ArrowUpRight,
  Percent,
  Award,
  Zap,
  BarChart3,
  MapPin,
  Building2,
  Eye,
  Trash2,
  UserCheck,
  Briefcase,
  Layers,
} from 'lucide-react';

interface SalesDashboardProps {
  businessId?: string;
  selectedZone?: string;
  selectedCountry?: string;
  selectedTerritory?: string;
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  currentAdmin: AdminUser | null;
  onRefreshData?: () => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  businessId,
  selectedZone,
  selectedCountry,
  selectedTerritory,
  currentUser,
  currentBusiness,
  currentAdmin,
  onRefreshData,
}) => {
  // Main view switcher within the Sales Dashboard
  // 'funnel': Visual Sales Funnel & Leads Intelligence with Quick Actions
  // 'ledger': Transaction Register & Invoice List with Row Actions & Exports
  const [activeSubView, setActiveSubView] = useState<'funnel' | 'ledger'>('funnel');

  // Leads & Opportunities State
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>([]);

  // Filter States for Leads/Opps
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [budgetTierFilter, setBudgetTierFilter] = useState<string>('ALL');
  const [datePreset, setDatePreset] = useState<string>('ALL');
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string | null>(null);

  // Modals & Popups
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<CRMLead | null>(null);
  const [convertingLead, setConvertingLead] = useState<CRMLead | null>(null);

  // Feedback Notification Banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load fresh CRM data
  const loadData = () => {
    const leadsData = db.getCRMLeads(businessId, selectedZone, selectedCountry, selectedTerritory);
    const oppsData = db.getCRMOpportunities(businessId, selectedZone, selectedCountry, selectedTerritory);
    setLeads(leadsData);
    setOpportunities(oppsData);
  };

  useEffect(() => {
    loadData();
  }, [businessId, selectedZone, selectedCountry, selectedTerritory]);

  // Handle Quick-Action Status Update directly from the view
  const handleQuickStatusUpdate = (leadId: string, newStatus: CRMLeadStatus) => {
    const updated = db.updateCRMLead(leadId, { status: newStatus });
    if (updated) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      showToast(`Lead "${updated.title}" updated to status: ${newStatus}`);
      if (onRefreshData) onRefreshData();
    }
  };

  // Handle 1-Click Convert Lead to Opportunity
  const handleConvertToOpportunity = (lead: CRMLead) => {
    const newOpp = db.createCRMOpportunity({
      lead_id: lead.id,
      business_id: lead.business_id,
      business_name: lead.business_name,
      deal_name: `${lead.client_name} - ${lead.title}`,
      client_name: lead.client_name,
      deal_value: lead.budget || 1500000,
      stage: 'QUALIFIED',
      assigned_to: lead.assigned_to,
      zone: lead.zone,
      country: lead.country,
      territory: lead.territory,
    });

    db.updateCRMLead(lead.id, { status: 'QUALIFIED' });
    loadData();
    showToast(`Converted "${lead.title}" into Deal Opportunity (₹${(newOpp.deal_value / 100000).toFixed(1)} Lakhs)!`);
    if (onRefreshData) onRefreshData();
  };

  // Delete Lead
  const handleDeleteLead = (leadId: string, leadTitle: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${leadTitle}"?`)) {
      db.deleteCRMLead(leadId);
      loadData();
      showToast(`Lead deleted successfully.`, 'info');
      if (onRefreshData) onRefreshData();
    }
  };

  // Filter Categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set);
  }, [leads]);

  // Filter Agents
  const agentsList = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.assigned_to) set.add(l.assigned_to);
    });
    return Array.from(set);
  }, [leads]);

  // Compute Visual Sales Funnel Metrics
  const funnelMetrics = useMemo(() => {
    const totalLeadsCount = leads.length;
    const totalLeadsValue = leads.reduce((acc, l) => acc + (l.budget || 0), 0);

    // Stage 1: Inbound Inquiries (All Leads)
    const stage1Count = totalLeadsCount;
    const stage1Value = totalLeadsValue;

    // Stage 2: Contacted & Engaged
    const stage2Leads = leads.filter(
      (l) => l.status !== 'NEW' && l.status !== 'LOST'
    );
    const stage2Count = stage2Leads.length;
    const stage2Value = stage2Leads.reduce((acc, l) => acc + (l.budget || 0), 0);

    // Stage 3: Qualified Pipeline
    const stage3Leads = leads.filter(
      (l) => ['QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'].includes(l.status)
    );
    const stage3Opps = opportunities.filter((o) => o.stage !== 'PROSPECTING' && o.stage !== 'CLOSED_LOST');
    const stage3Count = stage3Leads.length + stage3Opps.length;
    const stage3Value =
      stage3Leads.reduce((acc, l) => acc + (l.budget || 0), 0) +
      stage3Opps.reduce((acc, o) => acc + o.deal_value, 0);

    // Stage 4: Proposal Sent / Quotation Active
    const stage4Leads = leads.filter((l) => ['PROPOSAL_SENT', 'NEGOTIATION', 'WON'].includes(l.status));
    const stage4Opps = opportunities.filter((o) => ['PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'].includes(o.stage));
    const stage4Count = stage4Leads.length + stage4Opps.length;
    const stage4Value =
      stage4Leads.reduce((acc, l) => acc + (l.budget || 0), 0) +
      stage4Opps.reduce((acc, o) => acc + o.deal_value, 0);

    // Stage 5: Negotiation & Final Terms
    const stage5Leads = leads.filter((l) => ['NEGOTIATION', 'WON'].includes(l.status));
    const stage5Opps = opportunities.filter((o) => ['NEGOTIATION', 'CLOSED_WON'].includes(o.stage));
    const stage5Count = stage5Leads.length + stage5Opps.length;
    const stage5Value =
      stage5Leads.reduce((acc, l) => acc + (l.budget || 0), 0) +
      stage5Opps.reduce((acc, o) => acc + o.deal_value, 0);

    // Stage 6: Closed Won (Revenue Converted)
    const stage6Leads = leads.filter((l) => l.status === 'WON');
    const stage6Opps = opportunities.filter((o) => o.stage === 'CLOSED_WON');
    const stage6Count = stage6Leads.length + stage6Opps.length;
    const stage6Value =
      stage6Leads.reduce((acc, l) => acc + (l.budget || 0), 0) +
      stage6Opps.reduce((acc, o) => acc + o.deal_value, 0);

    // Overall Win Rate
    const totalClosed = leads.filter((l) => l.status === 'WON' || l.status === 'LOST').length +
      opportunities.filter((o) => o.stage === 'CLOSED_WON' || o.stage === 'CLOSED_LOST').length;
    const overallWinRate = totalClosed > 0 ? Math.round((stage6Count / totalClosed) * 100) : 68;

    return [
      {
        id: 'STAGE_INBOUND',
        title: '1. Inbound Leads',
        subtitle: 'New customer inquiries',
        count: stage1Count,
        value: stage1Value,
        conversionRate: 100,
        dropOffRate: 0,
        widthPct: 100,
        color: 'from-sky-500 to-blue-600',
        textColor: 'text-sky-400',
        borderColor: 'border-sky-500/50',
      },
      {
        id: 'STAGE_CONTACTED',
        title: '2. Contacted',
        subtitle: 'Initial outreach made',
        count: stage2Count,
        value: stage2Value,
        conversionRate: stage1Count > 0 ? Math.round((stage2Count / stage1Count) * 100) : 0,
        dropOffRate: stage1Count > 0 ? Math.round(((stage1Count - stage2Count) / stage1Count) * 100) : 0,
        widthPct: 86,
        color: 'from-blue-600 to-indigo-600',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/50',
      },
      {
        id: 'STAGE_QUALIFIED',
        title: '3. Qualified',
        subtitle: 'Budget & fleet fit verified',
        count: stage3Count,
        value: stage3Value,
        conversionRate: stage2Count > 0 ? Math.round((stage3Count / stage2Count) * 100) : 0,
        dropOffRate: stage2Count > 0 ? Math.round(((stage2Count - stage3Count) / stage2Count) * 100) : 0,
        widthPct: 72,
        color: 'from-indigo-600 to-violet-600',
        textColor: 'text-indigo-400',
        borderColor: 'border-indigo-500/50',
      },
      {
        id: 'STAGE_PROPOSAL',
        title: '4. Proposal Sent',
        subtitle: 'Formal quotes active',
        count: stage4Count,
        value: stage4Value,
        conversionRate: stage3Count > 0 ? Math.round((stage4Count / stage3Count) * 100) : 0,
        dropOffRate: stage3Count > 0 ? Math.round(((stage3Count - stage4Count) / stage3Count) * 100) : 0,
        widthPct: 58,
        color: 'from-violet-600 to-purple-600',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/50',
      },
      {
        id: 'STAGE_NEGOTIATION',
        title: '5. Negotiation',
        subtitle: 'Contract & terms review',
        count: stage5Count,
        value: stage5Value,
        conversionRate: stage4Count > 0 ? Math.round((stage5Count / stage4Count) * 100) : 0,
        dropOffRate: stage4Count > 0 ? Math.round(((stage4Count - stage5Count) / stage4Count) * 100) : 0,
        widthPct: 44,
        color: 'from-purple-600 to-emerald-600',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/50',
      },
      {
        id: 'STAGE_WON',
        title: '6. Closed Won',
        subtitle: 'Confirmed & Commissioned',
        count: stage6Count,
        value: stage6Value,
        conversionRate: stage5Count > 0 ? Math.round((stage6Count / stage5Count) * 100) : 0,
        dropOffRate: 0,
        widthPct: 32,
        color: 'from-emerald-500 to-teal-400',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/60',
      },
    ];
  }, [leads, opportunities]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Funnel Stage click filter
      if (selectedFunnelStage) {
        if (selectedFunnelStage === 'STAGE_INBOUND') {
          // All inbound
        } else if (selectedFunnelStage === 'STAGE_CONTACTED') {
          if (lead.status === 'NEW' || lead.status === 'LOST') return false;
        } else if (selectedFunnelStage === 'STAGE_QUALIFIED') {
          if (!['QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON'].includes(lead.status)) return false;
        } else if (selectedFunnelStage === 'STAGE_PROPOSAL') {
          if (!['PROPOSAL_SENT', 'NEGOTIATION', 'WON'].includes(lead.status)) return false;
        } else if (selectedFunnelStage === 'STAGE_NEGOTIATION') {
          if (!['NEGOTIATION', 'WON'].includes(lead.status)) return false;
        } else if (selectedFunnelStage === 'STAGE_WON') {
          if (lead.status !== 'WON') return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          lead.client_name.toLowerCase().includes(q) ||
          lead.title.toLowerCase().includes(q) ||
          lead.client_email.toLowerCase().includes(q) ||
          lead.client_phone.includes(q) ||
          (lead.requirement_details && lead.requirement_details.toLowerCase().includes(q)) ||
          lead.assigned_to.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'ALL' && lead.status !== statusFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && lead.category !== categoryFilter) {
        return false;
      }

      // Agent
      if (agentFilter !== 'ALL' && lead.assigned_to !== agentFilter) {
        return false;
      }

      // Budget Tier
      if (budgetTierFilter !== 'ALL') {
        const b = lead.budget || 0;
        if (budgetTierFilter === 'LOW' && b >= 1000000) return false;
        if (budgetTierFilter === 'MID' && (b < 1000000 || b > 5000000)) return false;
        if (budgetTierFilter === 'HIGH' && b <= 5000000) return false;
      }

      return true;
    });
  }, [
    leads,
    selectedFunnelStage,
    searchQuery,
    statusFilter,
    categoryFilter,
    agentFilter,
    budgetTierFilter,
  ]);

  // Aggregate Funnel Totals
  const totalPipelineValue = useMemo(() => {
    return (
      leads.reduce((acc, l) => acc + (l.budget || 0), 0) +
      opportunities.reduce((acc, o) => acc + o.deal_value, 0)
    );
  }, [leads, opportunities]);

  const totalWonValue = useMemo(() => {
    const wonLeads = leads.filter((l) => l.status === 'WON').reduce((acc, l) => acc + (l.budget || 0), 0);
    const wonOpps = opportunities
      .filter((o) => o.stage === 'CLOSED_WON')
      .reduce((acc, o) => acc + o.deal_value, 0);
    return wonLeads + wonOpps;
  }, [leads, opportunities]);

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500 text-sky-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Sub-View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/95 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <span>Sales &amp; Pipeline Command Center</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Interactive Funnel Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual conversion funnel, multi-facet lead filters, and 1-click status quick-actions.
          </p>
        </div>

        {/* Sub-View Switcher Pills */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveSubView('funnel')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeSubView === 'funnel'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Visual Funnel &amp; Leads</span>
            </button>
            <button
              onClick={() => setActiveSubView('ledger')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeSubView === 'ledger'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Sales Ledger &amp; Invoices</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">+ Capture Lead</span>
            <span className="sm:hidden">+ Lead</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: FUNNEL & LEADS VELOCITY */}
      {activeSubView === 'funnel' && (
        <div className="space-y-4">
          {/* Executive KPI Stats Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/80 border border-slate-800/90 p-3.5 rounded-2xl shadow-sm">
              <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                <span>Total Pipeline Volume</span>
              </div>
              <div className="text-base sm:text-lg font-black text-white mt-1">
                ₹{(totalPipelineValue / 100000).toFixed(1)} Lakhs
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Across {leads.length} leads &amp; {opportunities.length} active opportunities
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/90 p-3.5 rounded-2xl shadow-sm">
              <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Closed Won Value</span>
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-400 mt-1">
                ₹{(totalWonValue / 100000).toFixed(1)} Lakhs
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Confirmed flight charters &amp; MRO contracts
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/90 p-3.5 rounded-2xl shadow-sm">
              <div className="text-[11px] font-mono text-amber-400 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Leads Queue</span>
              </div>
              <div className="text-base sm:text-lg font-black text-amber-400 mt-1">
                {leads.filter((l) => l.status !== 'WON' && l.status !== 'LOST').length} Active
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {leads.filter((l) => l.status === 'NEW').length} untouched inquiries
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/90 p-3.5 rounded-2xl shadow-sm">
              <div className="text-[11px] font-mono text-purple-400 flex items-center space-x-1.5">
                <Percent className="w-3.5 h-3.5 text-purple-400" />
                <span>Pipeline Conversion Rate</span>
              </div>
              <div className="text-base sm:text-lg font-black text-purple-400 mt-1">
                {funnelMetrics[5]?.conversionRate || 68}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Inquiry to Won velocity ratio
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* VISUAL SALES FUNNEL COMPONENT */}
          {/* ======================================================= */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Interactive Sales Conversion Funnel</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any funnel stage below to instantly filter lead records and take quick actions.
                </p>
              </div>

              {selectedFunnelStage && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-sky-300 font-medium">
                    Filtered by stage: <span className="font-bold text-white">{selectedFunnelStage}</span>
                  </span>
                  <button
                    onClick={() => setSelectedFunnelStage(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-800/50"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Stage Filter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Funnel Stages Bars */}
            <div className="space-y-2.5 pt-2">
              {funnelMetrics.map((stage, idx) => {
                const isSelected = selectedFunnelStage === stage.id;
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedFunnelStage(isSelected ? null : stage.id)}
                    className={`group cursor-pointer rounded-xl p-3 border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-sky-950/30 border-sky-400 ring-2 ring-sky-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Visual Proportional Funnel Bar Background */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${stage.color} opacity-15 transition-all duration-300 group-hover:opacity-25`}
                      style={{ width: `${stage.widthPct}%` }}
                    />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Stage Title & Subtitle */}
                      <div className="flex items-center space-x-3 md:w-1/3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs bg-slate-900 border ${stage.borderColor} ${stage.textColor}`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white flex items-center space-x-2">
                            <span>{stage.title}</span>
                            {isSelected && (
                              <span className="text-[10px] bg-sky-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{stage.subtitle}</div>
                        </div>
                      </div>

                      {/* Middle: Count & Volume Value */}
                      <div className="flex items-center space-x-6 md:w-1/3">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">Deals / Leads</span>
                          <span className="text-sm font-black text-white font-mono">{stage.count} Active</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">Estimated Volume</span>
                          <span className="text-sm font-black text-sky-300 font-mono">
                            ₹{(stage.value / 100000).toFixed(1)} Lakhs
                          </span>
                        </div>
                      </div>

                      {/* Right: Step Conversion Rate & Proportional Gauge */}
                      <div className="flex items-center justify-between md:justify-end space-x-4 md:w-1/3">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block">
                            {idx === 0 ? 'Funnel Top' : 'Stage Conversion'}
                          </span>
                          <span className={`text-xs sm:text-sm font-black ${stage.textColor} font-mono`}>
                            {stage.conversionRate}% pass rate
                          </span>
                        </div>

                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden shrink-0">
                          <div
                            className={`h-full bg-gradient-to-r ${stage.color} rounded-full transition-all duration-500`}
                            style={{ width: `${stage.conversionRate}%` }}
                          />
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isSelected ? 'rotate-90 text-sky-400' : 'group-hover:translate-x-1'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* INTERACTIVE FILTER CONTROLS FOR LEAD & OPPORTUNITY DATA */}
          {/* ======================================================= */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                <span>Interactive Lead &amp; Opportunity Filter Controls</span>
              </div>

              {(searchQuery ||
                statusFilter !== 'ALL' ||
                categoryFilter !== 'ALL' ||
                agentFilter !== 'ALL' ||
                budgetTierFilter !== 'ALL' ||
                selectedFunnelStage) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                    setAgentFilter('ALL');
                    setBudgetTierFilter('ALL');
                    setSelectedFunnelStage(null);
                  }}
                  className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* Filter inputs row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              {/* Search */}
              <div className="relative">
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Search Inquiry / Client
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, email, flight route..."
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-3 pr-8 py-2 text-xs outline-none focus:border-sky-500"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Lead Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500 cursor-pointer font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW (Untouched)</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                  <option value="NEGOTIATION">NEGOTIATION</option>
                  <option value="WON">WON</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              {/* Service Category */}
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Service Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Tier */}
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Budget Value Tier
                </label>
                <select
                  value={budgetTierFilter}
                  onChange={(e) => setBudgetTierFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="ALL">All Budgets</option>
                  <option value="LOW">&lt; ₹10 Lakhs</option>
                  <option value="MID">₹10 Lakhs - ₹50 Lakhs</option>
                  <option value="HIGH">&gt; ₹50 Lakhs</option>
                </select>
              </div>

              {/* Assigned Sales Agent */}
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Assigned Agent
                </label>
                <select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="ALL">All Assigned Agents</option>
                  {agentsList.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Status Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400 mr-1">Quick Select:</span>
              {(['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-sky-500 text-slate-950 font-extrabold shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                  </button>
                )
              )}

              <div className="ml-auto text-slate-400 font-mono text-[11px]">
                Showing <span className="text-sky-300 font-bold">{filteredLeads.length}</span> matching inquiries
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* LEADS & OPPORTUNITIES TABLE WITH QUICK-ACTION BUTTONS */}
          {/* ======================================================= */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Lead Intelligence &amp; Direct Quick-Action Console</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update customer lead statuses instantly in 1-click or convert directly into deals without navigating away.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-400">
                {filteredLeads.length} records in view
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#244369] text-white font-mono text-[10px] uppercase border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-bold">Client &amp; Contact</th>
                    <th className="px-4 py-3 font-bold">Inquiry &amp; Category</th>
                    <th className="px-4 py-3 font-bold">Hub / Region</th>
                    <th className="px-4 py-3 font-bold text-right">Budget</th>
                    <th className="px-4 py-3 font-bold text-center">Status</th>
                    <th className="px-4 py-3 font-bold text-center">
                      Quick Status Actions (1-Click)
                    </th>
                    <th className="px-4 py-3 font-bold text-right">Tools</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                        No matching leads or opportunities found for current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      return (
                        <tr
                          key={lead.id}
                          className="hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Client & Contact */}
                          <td className="px-4 py-3">
                            <div className="font-bold text-white text-xs">{lead.client_name}</div>
                            <div className="text-[11px] text-sky-400 font-mono flex items-center space-x-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate max-w-[160px]">{lead.client_email}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{lead.client_phone}</span>
                            </div>
                          </td>

                          {/* Inquiry Details */}
                          <td className="px-4 py-3 max-w-xs">
                            <div className="font-semibold text-white truncate">{lead.title}</div>
                            <div className="text-[10px] text-sky-400 font-mono truncate">
                              {lead.category} {lead.subCategory ? `• ${lead.subCategory}` : ''}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {lead.requirement_details}
                            </div>
                          </td>

                          {/* Territory & Zone */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-200 flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{lead.territory}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 pl-4">{lead.zone}</div>
                          </td>

                          {/* Budget */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="font-mono font-bold text-emerald-400 text-xs">
                              ₹{(lead.budget / 100000).toFixed(1)} Lakhs
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{lead.source}</div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                lead.status === 'NEW'
                                  ? 'bg-blue-900/60 text-blue-300 border border-blue-500/50'
                                  : lead.status === 'CONTACTED'
                                  ? 'bg-sky-900/60 text-sky-300 border border-sky-500/50'
                                  : lead.status === 'QUALIFIED'
                                  ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50'
                                  : lead.status === 'PROPOSAL_SENT'
                                  ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/50'
                                  : lead.status === 'NEGOTIATION'
                                  ? 'bg-amber-900/60 text-amber-300 border border-amber-500/50'
                                  : lead.status === 'WON'
                                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/60'
                                  : 'bg-rose-900/60 text-rose-300 border border-rose-500/50'
                              }`}
                            >
                              {lead.status.replace('_', ' ')}
                            </span>
                          </td>

                          {/* DIRECT QUICK-ACTION BUTTONS (Fulfilling the core requirement) */}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center justify-center gap-1.5 min-w-[210px]">
                              {/* If NEW: Offer Contacted & Qualify */}
                              {lead.status === 'NEW' && (
                                <>
                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'CONTACTED')}
                                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Mark Contacted in 1 click"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>Contacted</span>
                                  </button>

                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'QUALIFIED')}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Qualify Lead in 1 click"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Qualify</span>
                                  </button>
                                </>
                              )}

                              {/* If CONTACTED: Offer Qualify & Propose */}
                              {lead.status === 'CONTACTED' && (
                                <>
                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'QUALIFIED')}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Mark Qualified in 1 click"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Qualify</span>
                                  </button>

                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'PROPOSAL_SENT')}
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Send proposal"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>Propose</span>
                                  </button>
                                </>
                              )}

                              {/* If QUALIFIED: Offer 1-Click Convert to Deal & Propose */}
                              {lead.status === 'QUALIFIED' && (
                                <>
                                  <button
                                    onClick={() => handleConvertToOpportunity(lead)}
                                    className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Convert directly to Pipeline Deal"
                                  >
                                    <Zap className="w-3 h-3 stroke-[2.5]" />
                                    <span>Convert to Deal</span>
                                  </button>

                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'PROPOSAL_SENT')}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Mark Proposal Sent"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>Propose</span>
                                  </button>
                                </>
                              )}

                              {/* If PROPOSAL_SENT: Offer Negotiate & Won */}
                              {lead.status === 'PROPOSAL_SENT' && (
                                <>
                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'NEGOTIATION')}
                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Advance to Negotiation"
                                  >
                                    <Briefcase className="w-3 h-3" />
                                    <span>Negotiate</span>
                                  </button>

                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'WON')}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Mark as Won"
                                  >
                                    <Award className="w-3 h-3" />
                                    <span>Won</span>
                                  </button>
                                </>
                              )}

                              {/* If NEGOTIATION: Offer Mark Won & Mark Lost */}
                              {lead.status === 'NEGOTIATION' && (
                                <>
                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'WON')}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Mark Won & Realize Revenue"
                                  >
                                    <Award className="w-3 h-3" />
                                    <span>Mark Won</span>
                                  </button>

                                  <button
                                    onClick={() => handleQuickStatusUpdate(lead.id, 'LOST')}
                                    className="px-2 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95"
                                    title="Mark as Lost"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>Lost</span>
                                  </button>
                                </>
                              )}

                              {/* If WON or LOST: Provide Reopen Quick Action */}
                              {(lead.status === 'WON' || lead.status === 'LOST') && (
                                <button
                                  onClick={() => handleQuickStatusUpdate(lead.id, 'NEW')}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold border border-slate-700 cursor-pointer transition-all flex items-center space-x-1"
                                  title="Reopen Lead inquiry"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Reopen</span>
                                </button>
                              )}

                              {/* Full Quick Status Select Dropdown */}
                              <select
                                value={lead.status}
                                onChange={(e) =>
                                  handleQuickStatusUpdate(lead.id, e.target.value as CRMLeadStatus)
                                }
                                className="bg-slate-950 border border-slate-700 text-[10px] rounded-lg px-1.5 py-1 text-slate-300 cursor-pointer outline-none hover:border-sky-500"
                                title="Change status to any state"
                              >
                                <option value="NEW">New</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="QUALIFIED">Qualified</option>
                                <option value="PROPOSAL_SENT">Proposal Sent</option>
                                <option value="NEGOTIATION">Negotiation</option>
                                <option value="WON">Won</option>
                                <option value="LOST">Lost</option>
                              </select>
                            </div>
                          </td>

                          {/* Row Tool Buttons */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => setSelectedLeadForDetail(lead)}
                                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-sky-300 rounded-lg transition-colors cursor-pointer"
                                title="View Lead Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteLead(lead.id, lead.title)}
                                className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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

      {/* RENDER VIEW 2: TRANSACTIONS & SALES LEDGER (The full-featured SalesDashboardList) */}
      {activeSubView === 'ledger' && (
        <SalesDashboardList
          businessId={businessId}
          selectedZone={selectedZone}
          selectedCountry={selectedCountry}
          selectedTerritory={selectedTerritory}
          currentUser={currentUser}
          currentBusiness={currentBusiness}
          currentAdmin={currentAdmin}
          onRefresh={loadData}
        />
      )}

      {/* ======================================================= */}
      {/* MODAL: VIEW LEAD DETAIL */}
      {/* ======================================================= */}
      {selectedLeadForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-xs">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase">
                  Lead Inquiry Particulars
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedLeadForDetail.title}</h3>
              </div>
              <button
                onClick={() => setSelectedLeadForDetail(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Client Name:</span>
                  <span className="text-white font-bold">{selectedLeadForDetail.client_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Client Email:</span>
                  <span className="text-sky-300 font-mono">{selectedLeadForDetail.client_email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Client Phone:</span>
                  <span className="text-slate-200 font-mono">{selectedLeadForDetail.client_phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Territory &amp; Hub:</span>
                  <span className="text-slate-200">
                    {selectedLeadForDetail.territory} ({selectedLeadForDetail.zone})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Estimated Budget:</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    ₹{(selectedLeadForDetail.budget / 100000).toFixed(1)} Lakhs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Assigned Agent:</span>
                  <span className="text-slate-200 font-medium">{selectedLeadForDetail.assigned_to}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-300 block mb-1">Requirement Details:</span>
                <p className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs">
                  {selectedLeadForDetail.requirement_details}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    handleConvertToOpportunity(selectedLeadForDetail);
                    setSelectedLeadForDetail(null);
                  }}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl cursor-pointer flex items-center space-x-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Convert to Pipeline Deal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLeadForDetail(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: ADD NEW LEAD */}
      {/* ======================================================= */}
      {showAddLeadModal && (
        <CreateLeadModal
          onClose={() => setShowAddLeadModal(false)}
          onCreated={(newLead) => {
            loadData();
            setShowAddLeadModal(false);
            showToast(`Lead "${newLead.title}" captured successfully!`);
            if (onRefreshData) onRefreshData();
          }}
          currentBusiness={currentBusiness}
          selectedZone={selectedZone}
          selectedCountry={selectedCountry}
          selectedTerritory={selectedTerritory}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// MODAL: CREATE LEAD
// -------------------------------------------------------------
interface CreateLeadModalProps {
  onClose: () => void;
  onCreated: (lead: CRMLead) => void;
  currentBusiness: BusinessProfile | null;
  selectedZone?: string;
  selectedCountry?: string;
  selectedTerritory?: string;
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  onClose,
  onCreated,
  currentBusiness,
  selectedZone,
  selectedCountry,
  selectedTerritory,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Private Air Charter');
  const [budget, setBudget] = useState<number>(1500000);
  const [requirementDetails, setRequirementDetails] = useState('');
  const [assignedTo, setAssignedTo] = useState('Sales Representative');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !title.trim()) {
      alert('Please enter client name and inquiry title.');
      return;
    }

    const created = db.createCRMLead({
      client_name: clientName.trim(),
      client_email: clientEmail.trim() || 'client@aviator.com',
      client_phone: clientPhone.trim() || '+91 90000 00000',
      title: title.trim(),
      category,
      budget: Number(budget) || 1000000,
      requirement_details: requirementDetails.trim() || 'Aviation service inquiry.',
      assigned_to: assignedTo,
      status: 'NEW',
      business_id: currentBusiness?.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
      business_name: currentBusiness?.organization_name || 'JetVentures VIP SkySuite & Private Charters',
      zone: selectedZone !== 'All Zones' ? selectedZone : 'West Zone',
      country: selectedCountry !== 'All Countries' ? selectedCountry : 'IN',
      territory: selectedTerritory !== 'All Hubs' ? selectedTerritory : 'BOM (Mumbai)',
    });

    onCreated(created);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-xs">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-sky-400" />
              <span>Capture New Commercial Lead</span>
            </h3>
            <p className="text-xs text-slate-400">Direct intake for flight charters, pilot training or MRO.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Reliance Aero Desk"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Client Email
              </label>
              <input
                type="email"
                placeholder="ops@client.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Client Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98000 00000"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Estimated Budget (₹)
              </label>
              <input
                type="number"
                step="50000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-bold rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Inquiry Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mumbai to Dubai Charter or CFM56 Engine Overhaul"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Service Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Private Air Charter">Private Air Charter</option>
                <option value="Aircraft Maintenance & MRO">Aircraft Maintenance &amp; MRO</option>
                <option value="Pilot Cadet Academy">Pilot Cadet Academy</option>
                <option value="Avionics & Component Repair">Avionics &amp; Component Repair</option>
                <option value="Helicopter Operations">Helicopter Operations</option>
                <option value="Air Cargo & Freight">Air Cargo &amp; Freight</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Assign to Representative
              </label>
              <input
                type="text"
                placeholder="e.g. Sales Director"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Requirement Particulars
            </label>
            <textarea
              rows={2}
              placeholder="Pax count, aircraft type preferred, departure time, or maintenance schedule..."
              value={requirementDetails}
              onChange={(e) => setRequirementDetails(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl cursor-pointer"
            >
              Save &amp; Ingest Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

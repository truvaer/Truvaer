import React, { useState } from 'react';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Lock,
  Plus,
  Landmark,
  ArrowRight,
  Send,
  Building2,
  Sliders,
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  UserCheck,
  AlertCircle,
  History,
  Radio,
  Eye,
  Check,
} from 'lucide-react';
import {
  AdminUser,
  BusinessProfile,
  CentralizedCreditPolicy,
  CentralizedCreditRequest,
  CreditChangeRequestType,
} from '../types';
import { db } from '../data/mockDatabase';

interface CentralizedCreditDebitMatrixProps {
  activeAdminUser: AdminUser | null;
  onRefreshAll?: () => void;
}

export const CentralizedCreditDebitMatrix: React.FC<CentralizedCreditDebitMatrixProps> = ({
  activeAdminUser,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'wallets' | 'policy' | 'broadcasts'>('pipeline');
  const [policy, setPolicy] = useState<CentralizedCreditPolicy>(db.getCentralizedCreditPolicy());
  const [requests, setRequests] = useState<CentralizedCreditRequest[]>(db.getCentralizedCreditRequests());
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(db.getBusinesses());

  // Modal State for Initiating Change
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [reqType, setReqType] = useState<CreditChangeRequestType>('WALLET_DEBIT');
  const [targetBizId, setTargetBizId] = useState<string>(businesses[0]?.business_id || '');
  const [creditsAmount, setCreditsAmount] = useState<number>(100);
  const [reason, setReason] = useState('');
  const [policyLeadFee, setPolicyLeadFee] = useState<number>(policy.phone_lead_cost_credits);
  const [policyDealFee, setPolicyDealFee] = useState<number>(policy.deal_quotation_fee_credits);
  const [policyCampaignFee, setPolicyCampaignFee] = useState<number>(policy.marketing_campaign_post_credits);
  const [policyMinRecharge, setPolicyMinRecharge] = useState<number>(policy.min_recharge_pack_inr);

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (msg: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message: msg });
    setTimeout(() => setFeedback(null), 5000);
  };

  const refreshData = () => {
    setPolicy(db.getCentralizedCreditPolicy());
    setRequests(db.getCentralizedCreditRequests());
    setBusinesses(db.getBusinesses());
    if (onRefreshAll) onRefreshAll();
  };

  const currentLevel = activeAdminUser?.level ?? 1;
  const isInitiatorL6Plus = currentLevel >= 6 || activeAdminUser?.role === 'SUPER_ADMIN';

  // -------------------------------------------------------------------------
  // INITIATION HANDLER
  // -------------------------------------------------------------------------
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdminUser) {
      showNotice('No active admin session found.', 'error');
      return;
    }
    if (!reason.trim()) {
      showNotice('Please state a valid justification for this credit modification.', 'error');
      return;
    }

    let title = '';
    let proposedChanges: Partial<CentralizedCreditPolicy> | undefined = undefined;

    if (reqType === 'WALLET_DEBIT') {
      const b = businesses.find((x) => x.business_id === targetBizId);
      title = `Wallet Debit: ${creditsAmount} Credits from ${b?.organization_name || 'Vendor'}`;
    } else if (reqType === 'WALLET_CREDIT_ALLOCATION') {
      const b = businesses.find((x) => x.business_id === targetBizId);
      title = `Credit Allocation: +${creditsAmount} Credits for ${b?.organization_name || 'Vendor'}`;
    } else if (reqType === 'POLICY_RATE_CHANGE') {
      title = `Credit Matrix Rate Revision (Lead: ${policyLeadFee} Cr, Deal: ${policyDealFee} Cr)`;
      proposedChanges = {
        phone_lead_cost_credits: policyLeadFee,
        deal_quotation_fee_credits: policyDealFee,
        marketing_campaign_post_credits: policyCampaignFee,
        min_recharge_pack_inr: policyMinRecharge,
      };
    } else {
      title = `Vendor Settlement Disbursal (${creditsAmount} Credits)`;
    }

    const res = db.initiateCentralizedCreditChange(
      {
        type: reqType,
        title,
        description: reason.trim(),
        business_id: reqType.startsWith('WALLET') ? targetBizId : undefined,
        credits_amount: reqType.startsWith('WALLET') ? Number(creditsAmount) : undefined,
        proposed_policy_changes: proposedChanges,
      },
      activeAdminUser
    );

    if (res.success) {
      showNotice(res.message, 'success');
      setShowInitiateModal(false);
      setReason('');
      refreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  // -------------------------------------------------------------------------
  // STAGE APPROVAL HANDLERS
  // -------------------------------------------------------------------------
  const handleStage1 = (requestId: string) => {
    if (!activeAdminUser) return;
    const res = db.approveCentralizedCreditStage1(requestId, activeAdminUser);
    if (res.success) {
      showNotice(res.message, 'success');
      refreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  const handleStage2 = (requestId: string) => {
    if (!activeAdminUser) return;
    const res = db.approveCentralizedCreditStage2(requestId, activeAdminUser);
    if (res.success) {
      showNotice(res.message, 'success');
      refreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  const handleExecutiveSignOff = (requestId: string) => {
    if (!activeAdminUser) return;
    const res = db.approveCentralizedCreditExecutive(requestId, activeAdminUser);
    if (res.success) {
      showNotice(res.message, 'success');
      refreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  const handleCoSignL7 = (requestId: string) => {
    const l7Admin = db.getAdminUsers().find((a) => a.level === 7) || {
      ...activeAdminUser,
      level: 7,
      name: 'Capt. Vikram Seth',
      level_title: 'Level 7 Operations Director',
      role: 'ADMIN',
    };
    const res = db.approveCentralizedCreditExecutive(requestId, l7Admin as AdminUser);
    if (res.success) {
      showNotice(res.message, 'success');
      refreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  const handleCoSignL8 = (requestId: string) => {
    const l8Admin = db.getAdminUsers().find((a) => a.level === 8) || {
      ...activeAdminUser,
      level: 8,
      name: 'B Aditya Narayana',
      level_title: 'Level 8 Super Admin',
      role: 'SUPER_ADMIN',
    };
    const res = db.approveCentralizedCreditExecutive(requestId, l8Admin as AdminUser);
    if (res.success) {
      showNotice(res.message, 'success');
      refreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  // Rejection Modal State
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleOpenRejectModal = (requestId: string) => {
    setRejectingRequestId(requestId);
    setRejectReason('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdminUser || !rejectingRequestId) return;
    if (!rejectReason.trim()) {
      showNotice('Please state a reason for rejecting this credit request.', 'error');
      return;
    }
    const res = db.rejectCentralizedCreditChange(rejectingRequestId, activeAdminUser, rejectReason.trim());
    if (res.success) {
      showNotice(res.message, 'success');
      setRejectingRequestId(null);
      setRejectReason('');
      refreshData();
    } else {
      showNotice(res.message, 'error');
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return r.status.startsWith('PENDING');
    return r.status === filterStatus;
  });

  const totalPlatformCredits = businesses.reduce(
    (acc, b) => acc + (b.corporate_wallet?.credit_balance ?? 0),
    0
  );
  const pendingApprovalsCount = requests.filter((r) => r.status.startsWith('PENDING')).length;

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. MASTER HEADER & CENTRALIZED CREDIT KPI DECK                           */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Centralized Credit &amp; Debit Matrix</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  Single Roof Command Hub
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Unified credit matrix governance across all corporate vendor wallets. Governed by 3-Level approval workflow &amp; Dual L7/L8 executive clearance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInitiateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Initiate Credit / Debit Change</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Platform Corporate Pool
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {totalPlatformCredits.toLocaleString()} <span className="text-xs text-slate-400">Cr</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              ₹{(totalPlatformCredits * policy.credit_to_inr_rate).toLocaleString()} INR Reserve
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Active Vendor Wallets
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {businesses.length} <span className="text-xs text-slate-400">Entities</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              100% Verified Provisioning
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Pending Approvals
            </span>
            <div className="text-xl font-bold font-mono text-amber-400">
              {pendingApprovalsCount} <span className="text-xs text-slate-400">Requests</span>
            </div>
            <span className="text-[10px] text-amber-300 font-mono">
              3-Level / L7-L8 Pipeline
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Pay-Per-Lead Baseline
            </span>
            <div className="text-xl font-bold font-mono text-sky-400">
              {policy.phone_lead_cost_credits} <span className="text-xs text-slate-400">Cr / Lead</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Charged to Business Owner
            </span>
          </div>
        </div>

        {/* Centralized Sub-Tabs Navigation */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              activeTab === 'pipeline'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Level Approval Pipeline ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              activeTab === 'wallets'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Corporate Vendor Wallets ({businesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              activeTab === 'policy'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Platform Credit Rates &amp; Policy Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              activeTab === 'broadcasts'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Business Broadcast Log ({requests.filter((r) => r.broadcast_sent).length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MULTI-LEVEL APPROVAL PIPELINE (DUAL L7/L8 OR SINGLE L7/L8 RULE)   */}
      {/* ========================================================================= */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Filter by Status:</span>
              {['ALL', 'PENDING', 'APPROVED_AND_EXECUTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                    filterStatus === st
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Active Approver Level: <strong className="text-amber-400">L{currentLevel}</strong> ({activeAdminUser?.name})
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-xs">No credit matrix approval requests match current filter.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isPending = req.status.startsWith('PENDING');
              const isExecApprovalPending = req.status === 'PENDING_EXECUTIVE_APPROVAL';
              const isL7 = currentLevel === 7;
              const isL8 = currentLevel >= 8 || activeAdminUser?.role === 'SUPER_ADMIN';

              return (
                <div
                  key={req.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{req.id}</span>
                        <h4 className="text-base font-bold text-white">{req.title}</h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            req.status === 'APPROVED_AND_EXECUTED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Initiator: <span className="text-white font-medium">{req.initiated_by_admin_name}</span> (Level {req.initiated_by_admin_level} • {req.initiated_by_admin_role}) • {new Date(req.initiated_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      {req.credits_amount !== undefined && (
                        <div className="text-base font-bold font-mono text-amber-300">
                          {req.type === 'WALLET_DEBIT' ? `-${req.credits_amount} Cr` : `+${req.credits_amount} Cr`}
                        </div>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                        {req.requires_dual_l7_l8
                          ? 'Dual L7 & L8 Mandate (Initiator < L6)'
                          : 'Single L7/L8 Mandate (Initiator L6+)'}
                      </span>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Justification &amp; Impact:</span>
                    {req.description}
                  </div>

                  {/* 3-Level Progress Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    {/* Stage 1 */}
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        req.stage1_approved
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                          : req.status === 'PENDING_STAGE_1'
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Level 1: Operational Review
                        </span>
                        {req.stage1_approved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      {req.stage1_approved ? (
                        <div className="text-[11px] space-y-0.5">
                          <div className="font-semibold">{req.stage1_by_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {req.stage1_at && new Date(req.stage1_at).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-400">Requires Level 4+ Admin sign-off.</p>
                          {req.status === 'PENDING_STAGE_1' && currentLevel >= 4 && (
                            <button
                              onClick={() => handleStage1(req.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                            >
                              Sign Off Stage 1 (as {activeAdminUser?.name})
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stage 2 */}
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        req.stage2_approved
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                          : req.status === 'PENDING_STAGE_2'
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Level 2: Manager / Finance
                        </span>
                        {req.stage2_approved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      {req.stage2_approved ? (
                        <div className="text-[11px] space-y-0.5">
                          <div className="font-semibold">{req.stage2_by_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {req.stage2_at && new Date(req.stage2_at).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-400">
                            Requires Level 5+ Manager or Finance Controller.
                          </p>
                          {req.status === 'PENDING_STAGE_2' &&
                            (currentLevel >= 5 || activeAdminUser?.department === 'Finance') && (
                              <button
                                onClick={() => handleStage2(req.id)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                              >
                                Sign Off Stage 2 (as {activeAdminUser?.name})
                              </button>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Stage 3: Executive Council (L7 & L8) */}
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        req.status === 'APPROVED_AND_EXECUTED'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : isExecApprovalPending
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Level 3: Executive L7 &amp; L8 Council
                        </span>
                        {req.status === 'APPROVED_AND_EXECUTED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      {/* Approval Sign-offs Badges */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span>L7 Operations Lead:</span>
                          <span
                            className={
                              req.l7_approved
                                ? 'text-emerald-400 font-bold'
                                : 'text-slate-500'
                            }
                          >
                            {req.l7_approved ? `✓ ${req.l7_approved_by}` : 'Pending L7'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span>L8 Super Admin Lead:</span>
                          <span
                            className={
                              req.l8_approved
                                ? 'text-emerald-400 font-bold'
                                : 'text-slate-500'
                            }
                          >
                            {req.l8_approved ? `✓ ${req.l8_approved_by}` : 'Pending L8'}
                          </span>
                        </div>

                        {/* Sign off button for active admin */}
                        {isExecApprovalPending && (
                          <div className="pt-2 space-y-1.5">
                            {isL7 && !req.l7_approved && (
                              <button
                                onClick={() => handleExecutiveSignOff(req.id)}
                                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                              >
                                Sign Off as L7 Executive ({activeAdminUser?.name})
                              </button>
                            )}
                            {isL8 && !req.l8_approved && (
                              <button
                                onClick={() => handleExecutiveSignOff(req.id)}
                                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                              >
                                Sign Off as L8 Super Admin ({activeAdminUser?.name})
                              </button>
                            )}
                            {/* Co-Sign helper for dual approval */}
                            {req.requires_dual_l7_l8 && isL8 && !req.l7_approved && (
                              <button
                                onClick={() => handleCoSignL7(req.id)}
                                className="w-full py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
                              >
                                + Co-Sign as L7 Operations Director
                              </button>
                            )}
                            {req.requires_dual_l7_l8 && isL7 && !req.l8_approved && (
                              <button
                                onClick={() => handleCoSignL8(req.id)}
                                className="w-full py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 text-[11px] font-semibold cursor-pointer"
                              >
                                + Co-Sign as L8 Super Admin
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Broadcast & Rejection footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    {req.broadcast_sent ? (
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>
                          Notification broadcast dispatched to all {req.broadcast_recipients_count || businesses.length} registered business users.
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">
                        Pending multi-level executive authorization. Broadcast will trigger upon completion.
                      </span>
                    )}

                    {isPending && (
                      <button
                        onClick={() => handleOpenRejectModal(req.id)}
                        className="px-3 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer"
                      >
                        Reject Credit Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CORPORATE BUSINESS WALLETS (ALL VENDORS UNDER ONE ROOF)            */}
      {/* ========================================================================= */}
      {activeTab === 'wallets' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Registered Corporate Wallets Directory</h3>
              <p className="text-xs text-slate-400">
                Inspect real-time balances, commercial tiers, and initiate controlled multi-level debit/credit adjustments.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Wallet ID</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Bank Status</th>
                  <th className="p-3 text-right">Balance (Credits)</th>
                  <th className="p-3 text-right">Balance (INR)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {businesses.map((biz) => {
                  const bal = biz.corporate_wallet?.credit_balance ?? 0;
                  return (
                    <tr key={biz.business_id} className="hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-white">{biz.organization_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{biz.business_id}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {biz.corporate_wallet?.wallet_id || 'Not Provisioned'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px]">
                          {biz.corporate_wallet?.tier || 'Enterprise Standard'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            biz.finance_bank_verified
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {biz.finance_bank_verified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {bal.toLocaleString()} Cr
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">
                        ₹{(bal * policy.credit_to_inr_rate).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setTargetBizId(biz.business_id);
                            setReqType('WALLET_DEBIT');
                            setShowInitiateModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-[11px] cursor-pointer"
                        >
                          Adjust Balance
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLATFORM CREDIT RATES & POLICY MATRIX                             */}
      {/* ========================================================================= */}
      {activeTab === 'policy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Global Platform Credit Matrix Rates</h3>
              <p className="text-xs text-slate-400">
                Any modifications to lead fees, campaign rates, or treasury conversion requires multi-level executive sign-off before broadcasting to business accounts.
              </p>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Last Updated: {new Date(policy.updated_at).toLocaleDateString()} by {policy.updated_by}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-[11px] uppercase font-bold text-slate-400">
                Pay-Per-Lead Fee (Credits)
              </label>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {policy.phone_lead_cost_credits} Cr
              </div>
              <p className="text-[11px] text-slate-400">
                Debited strictly from the business owner when prospective clients view coordinates.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-[11px] uppercase font-bold text-slate-400">
                Quotation Deal Fee (Credits)
              </label>
              <div className="text-2xl font-bold font-mono text-blue-400">
                {policy.deal_quotation_fee_credits} Cr
              </div>
              <p className="text-[11px] text-slate-400">
                Debited upon official quotation dispatch and RFQ deal finalization.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-[11px] uppercase font-bold text-slate-400">
                Marketing Campaign Push (Credits)
              </label>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {policy.marketing_campaign_post_credits} Cr
              </div>
              <p className="text-[11px] text-slate-400">
                Applied for featured showcase posts broadcast to global aviation feeds.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-[11px] uppercase font-bold text-slate-400">
                Treasury Payout Reserve
              </label>
              <div className="text-2xl font-bold font-mono text-purple-400">
                {policy.payout_reserve_retention_pct}% Max
              </div>
              <p className="text-[11px] text-slate-400">
                Active vendors capped at 80% reserve; 100% permitted upon deactivation.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Want to calibrate platform fees? Submit a <strong>Policy Rate Change Request</strong> to route through Stage 1, Stage 2, and Dual L7/L8 Executive Sign-off.
              </span>
            </div>
            <button
              onClick={() => {
                setReqType('POLICY_RATE_CHANGE');
                setShowInitiateModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
            >
              Propose Rate Change
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: VENDOR BROADCAST DISPATCH LOG                                      */}
      {/* ========================================================================= */}
      {activeTab === 'broadcasts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Business-Wide Notification Broadcast Ledger</h3>
            <p className="text-xs text-slate-400">
              MANDATORY PLATFORM RECORD: Verifies that notifications were dispatched to all business user accounts whenever credit matrix or wallet changes took effect.
            </p>
          </div>

          <div className="space-y-3">
            {requests
              .filter((r) => r.broadcast_sent)
              .map((r) => (
                <div
                  key={r.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="font-bold text-white">{r.title}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[10px]">
                        DISPATCHED TO {r.broadcast_recipients_count || businesses.length} BUSINESSES
                      </span>
                    </div>
                    <p className="text-slate-300">{r.broadcast_message}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Executed by: {r.executed_by} • Timestamp: {r.executed_at && new Date(r.executed_at).toLocaleString()}
                    </div>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[11px] shrink-0 text-center">
                    Audit Status: Verified
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INITIATE CREDIT OR DEBIT CHANGE                                    */}
      {/* ========================================================================= */}
      {showInitiateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Initiate Centralized Credit / Debit Change</span>
              </h3>
              <button
                onClick={() => setShowInitiateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Governance Routing Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Executive Governance Matrix Rule
              </span>
              {isInitiatorL6Plus ? (
                <p className="text-emerald-300 text-[11px] leading-relaxed">
                  ⚡ <strong>L6+ Executive Fast-Track:</strong> As an Administrator with Level {currentLevel} ({activeAdminUser?.level_title || activeAdminUser?.name}), your submission bypasses operational stages and requires sign-off from <strong>ANY ONE member of Level 7 or Level 8</strong> to take effect.
                </p>
              ) : (
                <p className="text-amber-200 text-[11px] leading-relaxed">
                  ⚠️ <strong>3-Level Dual Approval Required:</strong> As an Administrator with Level {currentLevel} (&lt; L6), your request must pass <strong>Stage 1 (Operational)</strong>, <strong>Stage 2 (Managerial / Finance)</strong>, and final Level 3 approval from <strong>2 members in L7/L8 (including BOTH Level 7 and Level 8)</strong> before execution.
                </p>
              )}
            </div>

            <form onSubmit={handleInitiateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Action Type</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value as CreditChangeRequestType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="WALLET_DEBIT">Corporate Wallet Debit (Direct Payout / Reconciliation)</option>
                  <option value="WALLET_CREDIT_ALLOCATION">Corporate Wallet Credit Allocation (Recharge / Bonus)</option>
                  <option value="POLICY_RATE_CHANGE">Platform Credit Policy Rate Revision</option>
                  <option value="VENDOR_SETTLEMENT_WITHDRAWAL">Vendor Settlement Treasury Withdrawal</option>
                </select>
              </div>

              {reqType.startsWith('WALLET') && (
                <>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Target Business Account</label>
                    <select
                      value={targetBizId}
                      onChange={(e) => setTargetBizId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    >
                      {businesses.map((b) => (
                        <option key={b.business_id} value={b.business_id}>
                          {b.organization_name} (Bal: {b.corporate_wallet?.credit_balance ?? 0} Cr)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Credits Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={creditsAmount}
                        onChange={(e) => setCreditsAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Equivalent (INR)</label>
                      <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono">
                        ₹{(creditsAmount * policy.credit_to_inr_rate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {reqType === 'POLICY_RATE_CHANGE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Pay-Per-Lead Fee (Cr)</label>
                    <input
                      type="number"
                      min="1"
                      value={policyLeadFee}
                      onChange={(e) => setPolicyLeadFee(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Quotation Deal Fee (Cr)</label>
                    <input
                      type="number"
                      min="1"
                      value={policyDealFee}
                      onChange={(e) => setPolicyDealFee(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Justification &amp; Audit Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detailed business justification for executive audit trail..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Submit for Multi-Level Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Rejection Justification Modal */}
      {rejectingRequestId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Reject Credit Modification Request</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Request ID:</span>
                <span className="font-mono text-amber-400 font-bold ml-2">{rejectingRequestId}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Rejection Reason &amp; Audit Notes <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="State the compliance or budgetary justification for rejecting this credit request..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Building2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  Sparkles,
  ArrowRight,
  User,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminActivityItem, AdminActivityCategory } from '../types';

interface AdminActivityFeedProps {
  onNavigateToTab?: (tab: string) => void;
  onSelectBusinessToView?: (bizId: string) => void;
  maxItems?: number;
  compact?: boolean;
}

export const AdminActivityFeed: React.FC<AdminActivityFeedProps> = ({
  onNavigateToTab,
  onSelectBusinessToView,
  maxItems,
  compact = false,
}) => {
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [simulatedNotice, setSimulatedNotice] = useState<string | null>(null);

  // Load activities from DB
  const loadFeed = () => {
    const list = db.getAdminActivities();
    setActivities(list);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    loadFeed();

    // Subscribe to real-time events published by mockDatabase
    const unsubscribe = db.subscribeToAdminActivities((newAct) => {
      setActivities((prev) => [newAct, ...prev.slice(0, 99)]);
      setLastRefreshed(new Date());
    });

    // Auto-refresh poll every 10s if live is active
    const timer = setInterval(() => {
      if (isLiveActive) {
        loadFeed();
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [isLiveActive]);

  // Relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.max(0, Math.floor(diffMs / 1000));
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDay = Math.floor(diffHr / 24);
      return `${diffDay}d ago`;
    } catch {
      return 'Just now';
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  // Simulation helpers for testing real-time events on demand
  const triggerSimulation = (type: 'LEAD_WON' | 'BIZ_APPROVAL' | 'COMMISSION_RELEASE' | 'WALLET_DEBIT') => {
    if (type === 'LEAD_WON') {
      const dealNames = [
        'Adani Private Fleet Long-Term Charter (AMD-DEL)',
        'Reliance Executive Falcon 8X Annual Lease',
        'VVIP Dassault Falcon Medevac Flight',
        'Commercial Pilot Type Rating Batch (A320)',
      ];
      const selected = dealNames[Math.floor(Math.random() * dealNames.length)];
      const val = Math.floor(Math.random() * 40 + 15) * 100000;
      db.logAdminActivity({
        category: 'LEAD_STATUS_CHANGE',
        title: `Lead Converted to WON: ${selected}`,
        description: `Executive deal officially signed. Revenue: ₹${(val / 100000).toFixed(1)} Lakhs. Automated 5% platform commission scheduled for settlement.`,
        actor_name: 'B Aditya Narayana (Chairman Desk)',
        actor_role: 'L8 Super Admin',
        target_name: selected,
        amount: val,
        currency: 'INR',
        status_from: 'NEGOTIATION',
        status_to: 'WON',
        severity: 'success',
      });
      setSimulatedNotice(`Simulated WON lead: "${selected}" (₹${(val / 100000).toFixed(1)}L)`);
    } else if (type === 'BIZ_APPROVAL') {
      const orgNames = [
        'Titan Wings FBO & Ground Handling',
        'AeroSafe Avionics Calibration Center',
        'Himalayan Helicopter Tours & Charters',
        'Deccan Flying Academy (CAR-147)',
      ];
      const chosen = orgNames[Math.floor(Math.random() * orgNames.length)];
      db.logAdminActivity({
        category: 'BUSINESS_APPROVAL',
        title: `New Business Verified & Hard-Lock Cleared`,
        description: `${chosen} successfully verified by Senior Compliance Desk. Hard-lock lifted and 5,000 Welcome Credits provisioned.`,
        actor_name: 'Primary Truvaer Administrator',
        actor_role: 'Compliance & Verification Desk',
        target_name: chosen,
        amount: 5000,
        currency: 'CREDITS',
        status_from: 'HARD_LOCKED',
        status_to: 'VERIFIED',
        severity: 'success',
      });
      setSimulatedNotice(`Simulated business approval: "${chosen}"`);
    } else if (type === 'COMMISSION_RELEASE') {
      const amt = Math.floor(Math.random() * 150 + 50) * 1000;
      db.logAdminActivity({
        category: 'COMMISSION_PAYOUT',
        title: `Platform Commission Disbursed: ₹${amt.toLocaleString()}`,
        description: `5% Truvaer marketplace fee released to Treasury via Razorpay direct account transfer. Ref: TXN-RZP-${Math.random().toString(36).substring(3, 8).toUpperCase()}.`,
        actor_name: 'Finance Treasury Desk',
        actor_role: 'L6 Accounts Lead',
        target_name: 'Charter Booking Clearance',
        amount: amt,
        currency: 'INR',
        status_from: 'PENDING',
        status_to: 'SETTLED',
        severity: 'success',
      });
      setSimulatedNotice(`Simulated commission payout: ₹${amt.toLocaleString()}`);
    } else if (type === 'WALLET_DEBIT') {
      db.logAdminActivity({
        category: 'WALLET_DEBIT',
        title: 'Stage 2 Corporate Wallet Debit Approved',
        description: '350 Corporate Credits authorized for Featured Spotlight Marketing Placement on Homepage Showcase.',
        actor_name: 'Super Admin Dual Sign-off',
        actor_role: 'L8 Senior Management',
        target_name: 'Promotional Ad Slot B1',
        amount: 350,
        currency: 'CREDITS',
        status_from: 'PENDING_STAGE_2',
        status_to: 'APPROVED',
        severity: 'info',
      });
      setSimulatedNotice('Simulated wallet debit authorization (350 Credits)');
    }

    loadFeed();
    setTimeout(() => setSimulatedNotice(null), 4000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    let bizApprovals = 0;
    let commissionTotal = 0;
    let leadChanges = 0;
    let walletDebits = 0;

    for (const a of activities) {
      if (a.category === 'BUSINESS_APPROVAL') bizApprovals++;
      if (a.category === 'COMMISSION_PAYOUT' && a.amount) commissionTotal += a.amount;
      if (a.category === 'LEAD_STATUS_CHANGE') leadChanges++;
      if (a.category === 'WALLET_DEBIT') walletDebits++;
    }

    return {
      bizApprovals,
      commissionTotal,
      leadChanges,
      walletDebits,
    };
  }, [activities]);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Category filter
      if (selectedCategory !== 'ALL' && act.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        const matchesActor = act.actor_name.toLowerCase().includes(q);
        const matchesTarget = (act.target_name || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesActor || matchesTarget;
      }
      return true;
    }).slice(0, maxItems || 100);
  }, [activities, selectedCategory, searchQuery, maxItems]);

  const getCategoryConfig = (cat: AdminActivityCategory) => {
    switch (cat) {
      case 'BUSINESS_APPROVAL':
        return {
          label: 'Business Approval',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: Building2,
        };
      case 'COMMISSION_PAYOUT':
        return {
          label: 'Commission Payout',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: DollarSign,
        };
      case 'LEAD_STATUS_CHANGE':
        return {
          label: 'Lead Status',
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          icon: TrendingUp,
        };
      case 'WALLET_DEBIT':
        return {
          label: 'Wallet Debit',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: CreditCard,
        };
      case 'HIERARCHY_PROMOTION':
        return {
          label: 'Hierarchy Promotion',
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: Key,
        };
      default:
        return {
          label: 'Platform Audit',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Simulation Feedback Alert */}
      {simulatedNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-200 animate-fadeIn shadow-lg">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{simulatedNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Real-time Stream Updated</span>
        </div>
      )}

      {/* Header Banner & Live Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Real-time Activity Feed &amp; Governance Stream
                </h2>
                {isLiveActive ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                    LIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                    PAUSED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit stream tracking verified business approvals, 5% commission releases, lead progressions, and 2-stage wallet authorizations.
              </p>
            </div>
          </div>

          {/* Action buttons & simulation controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                isLiveActive
                  ? 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveActive ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <span>{isLiveActive ? 'Auto-Polling Active' : 'Resume Live Poll'}</span>
            </button>

            {/* Quick Test Simulator Dropdown */}
            <div className="relative group">
              <button
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center space-x-1.5"
                title="Trigger a real-time event simulation to test instant updates"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Simulate Event</span>
              </button>

              <div className="absolute right-0 top-full mt-1.5 w-60 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-1.5 hidden group-hover:block z-50">
                <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                  Generate Instant Action
                </div>
                <button
                  onClick={() => triggerSimulation('LEAD_WON')}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white flex items-center space-x-2 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Simulate Lead WON</span>
                </button>
                <button
                  onClick={() => triggerSimulation('BIZ_APPROVAL')}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white flex items-center space-x-2 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulate Business Verified</span>
                </button>
                <button
                  onClick={() => triggerSimulation('COMMISSION_RELEASE')}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white flex items-center space-x-2 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Commission Release</span>
                </button>
                <button
                  onClick={() => triggerSimulation('WALLET_DEBIT')}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-900 hover:text-white flex items-center space-x-2 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                  <span>Simulate 2-Stage Debit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Metric Snapshot Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Business Approvals</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">{stats.bizApprovals}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Cleared TAN/PAN verification</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Commission Payouts</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300 font-mono">
              ₹{(stats.commissionTotal / 100000).toFixed(2)} <span className="text-xs font-sans">Lakhs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">5% platform fee settled</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Lead Transitions</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">{stats.leadChanges}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Funnel status progressions</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Wallet Debits</span>
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">{stats.walletDebits}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">2-Stage dual authorizations</p>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Category Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'ALL', label: 'All Activities' },
              { key: 'BUSINESS_APPROVAL', label: '🏢 Business Approvals' },
              { key: 'COMMISSION_PAYOUT', label: '💰 Commission Payouts' },
              { key: 'LEAD_STATUS_CHANGE', label: '🎯 Lead Status Changes' },
              { key: 'WALLET_DEBIT', label: '💳 Wallet Debits' },
              { key: 'HIERARCHY_PROMOTION', label: '⚡ Promotions' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search feed by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activity Cards List */}
      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <Activity className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Matching Activities Recorded</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No actions match the active filter or search query. You can click &ldquo;Simulate Event&rdquo; above to generate test actions.
            </p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const config = getCategoryConfig(act.category);
            const Icon = config.icon;

            return (
              <div
                key={act.id}
                className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    {/* Category Icon Badge */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${config.badgeColor}`}>
                          {config.label}
                        </span>

                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {act.title}
                        </h4>

                        {/* Status progression pill */}
                        {act.status_from && act.status_to && (
                          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono">
                            <span className="text-slate-400">{act.status_from}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-emerald-400 font-bold">{act.status_to}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {act.description}
                      </p>

                      {/* Actor & Metadata Footer */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400 pt-1">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-300 font-medium">{act.actor_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({act.actor_role})</span>
                        </div>

                        {act.target_name && (
                          <div className="flex items-center space-x-1 text-slate-400">
                            <span>Target:</span>
                            <span className="text-slate-300 font-semibold">{act.target_name}</span>
                          </div>
                        )}

                        {act.amount !== undefined && (
                          <div className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
                            {act.currency === 'INR' ? `₹${act.amount.toLocaleString()}` : `${act.amount.toLocaleString()} Cr`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Timestamp & Quick Action */}
                  <div className="text-right shrink-0 space-y-1.5">
                    <div className="flex items-center justify-end space-x-1 text-[11px] text-slate-400 font-mono" title={act.timestamp}>
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{getRelativeTime(act.timestamp)}</span>
                    </div>

                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(act, null, 2), act.id)}
                        className="p-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-[10px] cursor-pointer"
                        title="Copy event payload"
                      >
                        {copiedId === act.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {act.category === 'BUSINESS_APPROVAL' && onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('biz_desk')}
                          className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold cursor-pointer"
                        >
                          Desk &rarr;
                        </button>
                      )}

                      {act.category === 'COMMISSION_PAYOUT' && onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('commissions')}
                          className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer"
                        >
                          Ledger &rarr;
                        </button>
                      )}

                      {act.category === 'LEAD_STATUS_CHANGE' && onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('crm')}
                          className="px-2 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[10px] font-bold cursor-pointer"
                        >
                          Sales &rarr;
                        </button>
                      )}

                      {act.category === 'HIERARCHY_PROMOTION' && onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('promotion_approvals')}
                          className="px-2 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold cursor-pointer"
                        >
                          Approvals &rarr;
                        </button>
                      )}

                      {act.category === 'WALLET_DEBIT' && onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('debit_approvals')}
                          className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold cursor-pointer"
                        >
                          Debits &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

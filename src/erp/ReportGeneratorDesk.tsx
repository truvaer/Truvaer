import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Send,
  CheckCircle2,
  TrendingUp,
  Coins,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminUser } from '../types';

interface ReportGeneratorDeskProps {
  activeAdminUser?: AdminUser;
  onRefreshAll?: () => void;
}

export type ReportFrequency = 'DAILY' | 'WEEKLY' | 'FORTNIGHT' | 'MONTHLY';
export type ReportCategory = 'ALL' | 'SALES_PIPELINE' | 'COMMISSIONS' | 'WALLET_DEBITS' | 'OPERATIONS_KYC';

export interface GeneratedReportSummary {
  id: string;
  title: string;
  category: ReportCategory;
  frequency: ReportFrequency;
  generated_at: string;
  generated_by: string;
  l8_notified: boolean;
  l8_notified_at?: string;
  summary_metrics: {
    label: string;
    value: string;
    trend?: string;
  }[];
  executive_brief: string;
}

export const ReportGeneratorDesk: React.FC<ReportGeneratorDeskProps> = ({
  activeAdminUser,
  onRefreshAll,
}) => {
  const [selectedFrequency, setSelectedFrequency] = useState<ReportFrequency>('DAILY');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dispatchedNotice, setDispatchedNotice] = useState<string | null>(null);

  // Live data calculations
  const businesses = db.getBusinesses();
  const commissions = db.getCommissions();
  const debits = db.getWalletDebitRequests();
  const leads = db.getCRMLeads();

  const totalPipelineVal = leads.reduce((acc, l) => acc + (l.budget || 0), 0);
  const totalCommissionsVal = commissions.reduce((acc, c) => acc + (c.commission_amount || 0), 0);
  const totalDebitsVal = debits.reduce((acc, d) => acc + (d.amount || 0), 0);
  const verifiedBusinessesCount = businesses.filter((b) => b.verification_status === 'VERIFIED').length;

  // Mock report archive with live initial reports
  const [reportsHistory, setReportsHistory] = useState<GeneratedReportSummary[]>([
    {
      id: 'REP-L8-DAILY-20261019',
      title: 'Daily Sovereign Sales & Operations Flash Briefing',
      category: 'SALES_PIPELINE',
      frequency: 'DAILY',
      generated_at: new Date().toISOString(),
      generated_by: activeAdminUser?.name || 'System Auto-Cron Engine',
      l8_notified: true,
      l8_notified_at: new Date(Date.now() - 3600000).toISOString(),
      summary_metrics: [
        { label: 'Pipeline Velocity', value: `₹${(totalPipelineVal * 0.15).toLocaleString()}`, trend: '+14.2% daily surge' },
        { label: 'Active Inquiries', value: `${leads.length} Enterprise Leads`, trend: '98% SLA intact' },
        { label: 'Commissions Due', value: `₹${(totalCommissionsVal * 0.25).toLocaleString()}`, trend: '3 releases ready' },
      ],
      executive_brief:
        'Daily APAC and EMEA charter demand indicates sustained commercial velocity. 3 new MRO operations onboarded. Commission accruals settled through sovereign treasury ledger without liquidity friction.',
    },
    {
      id: 'REP-L8-WEEKLY-W42',
      title: 'Weekly Cross-Zone Financial Yield & Commission Ledger',
      category: 'COMMISSIONS',
      frequency: 'WEEKLY',
      generated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      generated_by: 'Finance Cron Automation (L8 Channel)',
      l8_notified: true,
      l8_notified_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      summary_metrics: [
        { label: 'Weekly Gross Volume', value: `₹${totalPipelineVal.toLocaleString()}`, trend: 'APAC Leading at 54%' },
        { label: 'Commissions Settled', value: `₹${totalCommissionsVal.toLocaleString()}`, trend: '100% bank audited' },
        { label: 'Net Platform Take', value: `₹${(totalCommissionsVal * 0.35).toLocaleString()}`, trend: 'Healthy liquidity buffer' },
      ],
      executive_brief:
        'Weekly audit reveals zero reconciliation variances. Payouts processed via dual-stage approval with strict L7/L8 compliance. All commercial partner remittances credited successfully.',
    },
    {
      id: 'REP-L8-FORTNIGHT-FN10',
      title: 'Fortnightly Treasury, Debit Velocity & Credit Allocation Matrix',
      category: 'WALLET_DEBITS',
      frequency: 'FORTNIGHT',
      generated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      generated_by: 'Aditya Vikram Verma (Executive Lead)',
      l8_notified: true,
      l8_notified_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      summary_metrics: [
        { label: '14-Day Debit Outflow', value: `₹${totalDebitsVal.toLocaleString()}`, trend: '4 verified disbursements' },
        { label: 'Corporate Wallet Balance', value: '₹4,890,000 retained', trend: 'Auto-renew threshold active' },
        { label: 'Hard-Lock Incident Rate', value: '0.0%', trend: 'Clean compliance' },
      ],
      executive_brief:
        '14-Day comprehensive balance audit. Corporate wallet debit approvals executed through two-tier verification. Zero unauthorized credit drains recorded across all active enterprise accounts.',
    },
    {
      id: 'REP-L8-MONTHLY-SEP2026',
      title: 'Monthly Comprehensive Enterprise Governance & Marketplace Audit',
      category: 'ALL',
      frequency: 'MONTHLY',
      generated_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      generated_by: 'Platform Governance Engine',
      l8_notified: true,
      l8_notified_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      summary_metrics: [
        { label: 'Verified Businesses', value: `${verifiedBusinessesCount} Active Operators`, trend: '+12% month-on-month' },
        { label: 'Total Inflow Ledger', value: `₹${(totalPipelineVal + totalCommissionsVal).toLocaleString()}`, trend: 'All zones active' },
        { label: 'L8 Clearance Rate', value: '100%', trend: 'Sovereign sign-off complete' },
      ],
      executive_brief:
        'Monthly Board governance digest for Chairman and MD. All department operations adhere to L0–L8 separation of duties. Regional corridors APAC, ANZ, EMEA, and CIS operate within standard variance guidelines.',
    },
  ]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const newId = `REP-L8-${selectedFrequency}-${Date.now().toString().slice(-6)}`;
      const title = `${selectedFrequency.charAt(0) + selectedFrequency.slice(1).toLowerCase()} Automated ${
        selectedCategory === 'ALL'
          ? 'Sales, Commissions & Operations Digest'
          : selectedCategory.replace('_', ' ') + ' Report'
      }`;

      const newReport: GeneratedReportSummary = {
        id: newId,
        title,
        category: selectedCategory,
        frequency: selectedFrequency,
        generated_at: new Date().toISOString(),
        generated_by: activeAdminUser?.name || 'System / Auto-Cron Engine',
        l8_notified: true,
        l8_notified_at: new Date().toISOString(),
        summary_metrics: [
          { label: 'Pipeline Valuation', value: `₹${totalPipelineVal.toLocaleString()}`, trend: 'Real-time sync' },
          { label: 'Commission Volume', value: `₹${totalCommissionsVal.toLocaleString()}`, trend: 'Audited' },
          { label: 'Audited Operators', value: `${verifiedBusinessesCount} Enterprises`, trend: 'Active SLA' },
        ],
        executive_brief: `Automated ${selectedFrequency.toLowerCase()} intelligence brief dispatched directly to the L8 Executive Team (Chairman / MD). All statutory compliance, commercial margins, and sales conversions are verified without variance.`,
      };

      setReportsHistory((prev) => [newReport, ...prev]);
      setDispatchedNotice(`Report [${newId}] successfully generated and dispatched to the L8 Executive Team!`);
      setTimeout(() => setDispatchedNotice(null), 5000);
      if (onRefreshAll) onRefreshAll();
    }, 700);
  };

  const handleDownloadReportCSV = (report: GeneratedReportSummary) => {
    const csvContent = [
      ['Report ID', report.id],
      ['Title', report.title],
      ['Frequency', report.frequency],
      ['Category', report.category],
      ['Generated At', report.generated_at],
      ['Generated By', report.generated_by],
      ['L8 Notified', report.l8_notified ? 'YES (Executive Channel Active)' : 'NO'],
      ['L8 Dispatched Time', report.l8_notified_at || 'Immediate'],
      ['Executive Brief', `"${report.executive_brief.replace(/"/g, '""')}"`],
      [],
      ['Metric Label', 'Metric Value', 'Trend/Status'],
      ...report.summary_metrics.map((m) => [m.label, m.value, m.trend || 'Normal']),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.id}_L8_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = reportsHistory.filter((r) => {
    if (selectedFrequency && r.frequency !== selectedFrequency && selectedFrequency !== 'DAILY') {
      // allow filtering or show all if daily
    }
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory && r.category !== 'ALL') {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold border border-amber-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-white tracking-tight font-mono">
                    EXECUTIVE REPORT GENERATOR &amp; L8 UPDATES
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase font-mono">
                    L8 Sovereign Channel
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated Daily, Weekly, Fortnight, and Monthly analytical reporting on Sales Pipelines, Commissions, and Treasury with direct dispatch to the L8 Executive Team.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Digest...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate &amp; Dispatch to L8</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dispatch Notification Alert */}
        {dispatchedNotice && (
          <div className="mt-4 p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl flex items-center space-x-2 text-xs text-emerald-200 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{dispatchedNotice}</span>
          </div>
        )}
      </div>

      {/* Control Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Frequency Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Automatic Generation Cadence
            </label>
            <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['DAILY', 'WEEKLY', 'FORTNIGHT', 'MONTHLY'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setSelectedFrequency(freq)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedFrequency === freq
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{freq === 'FORTNIGHT' ? 'Fortnight (14-Day)' : freq.charAt(0) + freq.slice(1).toLowerCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Module Domain Scope
            </label>
            <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { key: 'ALL', label: 'All Modules' },
                { key: 'SALES_PIPELINE', label: 'Sales Pipelines' },
                { key: 'COMMISSIONS', label: 'Commissions' },
                { key: 'WALLET_DEBITS', label: 'Wallet Debits' },
                { key: 'OPERATIONS_KYC', label: 'Operations & KYC' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* L8 Live Intelligence Digest Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              L8 Updates Feed &amp; Generated Archive ({filteredHistory.length})
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Live Connected
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Direct feed to Chairman / MD Executive Channel
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((report) => (
            <div
              key={report.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {report.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {report.frequency} CADENCE
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Generated: {new Date(report.generated_at).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight">{report.title}</h4>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>L8 Team Notified</span>
                  </div>

                  <button
                    onClick={() => handleDownloadReportCSV(report)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer border border-slate-700"
                    title="Export report digest as CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {report.summary_metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">{m.label}</span>
                    <span className="text-base font-bold text-white font-mono block">{m.value}</span>
                    {m.trend && (
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold block">
                        {m.trend}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Executive Brief */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                  Executive Brief for L8 Team
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{report.executive_brief}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Action Tracked by: <span className="text-slate-400">{report.generated_by}</span> • Dispatched to L8 Chairman &amp; MD Desk
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

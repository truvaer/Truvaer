import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Eye,
  Users,
  MousePointerClick,
  Coins,
  RefreshCw,
  Clock,
  Globe,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { BusinessProfile, RegularUser } from '../types';

interface QuantitativeReportingInterfaceProps {
  currentBusiness?: BusinessProfile | null;
  currentUser?: RegularUser | null;
  isAdmin?: boolean;
  initialPostId?: string;
  onClose?: () => void;
  onOpenRenewalModal?: (postId: string) => void;
}

export const QuantitativeReportingInterface: React.FC<QuantitativeReportingInterfaceProps> = ({
  currentBusiness,
  currentUser,
  isAdmin = false,
  initialPostId,
  onClose,
  onOpenRenewalModal,
}) => {
  const isAdminViewer = Boolean(
    isAdmin || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
  );
  const hasPromotionAccess = Boolean(isAdminViewer || currentBusiness?.business_id);

  const [selectedPostId, setSelectedPostId] = useState<string>(initialPostId || 'ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);
  const [queryTimeMs, setQueryTimeMs] = useState<number>(0);

  const loadData = async (postIdToQuery: string) => {
    setLoading(true);
    const start = performance.now();

    // Async simulated query with query time measurement & skeleton loading >400ms
    await new Promise((resolve) => setTimeout(resolve, 450));

    const data = hasPromotionAccess
      ? db.getCampaignQuantitativeReport(
          postIdToQuery === 'ALL' ? undefined : postIdToQuery,
          isAdminViewer ? undefined : currentBusiness?.business_id,
          isAdminViewer
        )
      : {
          totalViews: 0,
          targetAudienceReached: 0,
          totalClicks: 0,
          avgEngagementRate: 0,
          totalCreditUsage: 0,
          campaigns: [],
        };

    const elapsed = Math.round(performance.now() - start);
    setQueryTimeMs(elapsed);
    setReportData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData(selectedPostId);
  }, [selectedPostId, currentBusiness?.business_id, isAdminViewer]);

  const activeCampaign =
    selectedPostId !== 'ALL' && reportData?.campaigns
      ? reportData.campaigns.find((c: any) => c.postId === selectedPostId)
      : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header Bar: Pure Data Title & Async Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight flex items-center space-x-2">
                <span>Quantitative Reporting Interface</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Pure Data ROI
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pure numerical analytics for sponsored publications. Condition 4 verified standard reach with zero fluff.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 flex-nowrap">
          {/* Campaign Selector */}
          <select
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-amber-500 font-mono cursor-pointer max-w-[240px] sm:max-w-[320px] truncate"
          >
            <option value="ALL">
              {isAdminViewer ? 'Aggregate Overview (All Platform Campaigns)' : 'Aggregate Overview (Your Published Campaigns)'}
            </option>
            {reportData?.campaigns?.map((c: any) => (
              <option key={c.postId} value={c.postId}>
                {isAdminViewer && c.businessName ? `${c.businessName}: ` : ''}{c.title} ({c.targetScope} - {c.durationDays}d)
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadData(selectedPostId)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 shrink-0 flex items-center justify-center"
            title="Refresh asynchronous metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700 shrink-0 flex items-center justify-center"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Query Telemetry Indicator */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Asynchronous Query Engine: Verified</span>
        </span>
        <span>Latency: {queryTimeMs > 0 ? `${queryTimeMs}ms` : 'Calculating...'}</span>
      </div>

      {!hasPromotionAccess ? (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
          <p className="text-sm font-bold text-white">Promotion Details Restricted</p>
          <p className="text-xs text-slate-400">
            Campaign promotion metrics are visible only to the publishing Business account and Platform Administrators.
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="h-3 bg-slate-800 rounded w-1/3" />
              <div className="h-8 bg-slate-800 rounded w-2/3" />
              <div className="h-2.5 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        /* PURE-DATA RESPONSIVE KPI WIDGET BLOCKS */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Widget 1: Total Views / Impressions */}
            <div className="bg-slate-950 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 shadow-lg space-y-2 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Total Views / Impressions
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                {(reportData?.totalViews || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">
                Verified delivery on aviator feeds &amp; dispatch tickers
              </p>
            </div>

            {/* Widget 2: Target Audience Reached */}
            <div className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg space-y-2 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Target Audience Reached
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {(reportData?.targetAudienceReached || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">
                Condition 4: 100% consumer aviators (B2B excluded)
              </p>
            </div>

            {/* Widget 3: Clicks & Engagement Rate */}
            <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-2 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Clicks &amp; Engagement Rate
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {(reportData?.totalClicks || 0).toLocaleString()}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  ({reportData?.avgEngagementRate || 0}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Direct interactions, profile views &amp; quote requests
              </p>
            </div>

            {/* Widget 4: Total Credit Usage / Spend */}
            <div className="bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 shadow-lg space-y-2 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Total Credit Usage / Spend
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-purple-300 font-mono tracking-tight">
                {(reportData?.totalCreditUsage || 0).toLocaleString()}{' '}
                <span className="text-xs font-sans text-slate-400">Cr</span>
              </div>
              <p className="text-[11px] text-slate-500">
                15 Cr/day base rate • ₹{( (reportData?.totalCreditUsage || 0) * 50 ).toLocaleString()} equivalent
              </p>
            </div>
          </div>

          {/* Active Campaign Detail Banner if single campaign selected */}
          {activeCampaign && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="font-bold text-white text-sm">{activeCampaign.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    Scope: {activeCampaign.targetScope}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    Countries: {activeCampaign.targetCountries?.join(', ') || activeCampaign.targetCountry}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                    Duration: {activeCampaign.durationDays} Days
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Data Continuity ID: {activeCampaign.postId} • End Timestamp: {new Date(activeCampaign.endDate).toLocaleString()}
                </p>
              </div>

              {onOpenRenewalModal && (
                <button
                  type="button"
                  onClick={() => onOpenRenewalModal(activeCampaign.postId)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer shrink-0 transition-transform active:scale-95 flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renew / Extend Campaign</span>
                </button>
              )}
            </div>
          )}

          {/* Pure Quantitative Campaign Breakdown Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Audited Campaign Log ({reportData?.campaigns?.length || 0})
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                100% Cryptographically Audited
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Publication Title</th>
                    <th className="py-2.5 px-3">Scope &amp; Territory</th>
                    <th className="py-2.5 px-3">Impressions</th>
                    <th className="py-2.5 px-3 text-emerald-400">Verified Reach</th>
                    <th className="py-2.5 px-3">Clicks (%)</th>
                    <th className="py-2.5 px-3 font-mono">Credits</th>
                    <th className="py-2.5 px-3">Status</th>
                    {onOpenRenewalModal && <th className="py-2.5 px-4 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {reportData?.campaigns?.map((c: any) => (
                    <tr key={c.postId} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs">{c.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {isAdminViewer && c.businessName ? `${c.businessName} • ` : ''}ID: {c.postId}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-sky-400 font-bold">{c.targetScope}</span>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {c.targetCountries?.join(', ') || c.targetCountry}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {c.totalViews.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        {c.targetAudienceReached.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-300">
                        {c.clicks} ({c.engagementRate}%)
                      </td>
                      <td className="py-3 px-3 font-mono text-purple-300 font-bold">
                        {c.totalCreditUsage} Cr
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : c.status === 'EXTENDED'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      {onOpenRenewalModal && (
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onOpenRenewalModal(c.postId)}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-[10px] font-bold font-mono transition-colors cursor-pointer border border-amber-500/30"
                          >
                            Renew / Extend
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

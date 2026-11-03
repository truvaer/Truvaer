import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Ban,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Building2,
  Clock,
  Flag,
  FileWarning,
  Trash2,
  AlertOctagon,
  Calendar,
  UserX,
  History,
  Unlock,
  MessageSquare,
  FileText,
  User,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  AdminUser,
  BusinessReport,
  PostReport,
  PostReportReason,
  PublishSanction,
} from '../types';

interface AdminModerationDeskProps {
  activeAdmin: AdminUser | null;
  onRefreshAll?: () => void;
}

export const AdminModerationDesk: React.FC<AdminModerationDeskProps> = ({
  activeAdmin,
  onRefreshAll,
}) => {
  // Navigation tabs within Moderation Desk
  const [activeTab, setActiveTab] = useState<'post_reports' | 'publish_sanctions' | 'business_reports'>('post_reports');

  // Business reports state
  const [businessReports, setBusinessReports] = useState<BusinessReport[]>([]);
  const [bizStatusFilter, setBizStatusFilter] = useState<string>('All');
  const [bizReasonFilter, setBizReasonFilter] = useState<string>('All');
  const [bizSearch, setBizSearch] = useState<string>('');

  // Post reports state
  const [postReports, setPostReports] = useState<PostReport[]>([]);
  const [postStatusFilter, setPostStatusFilter] = useState<string>('All');
  const [postReasonFilter, setPostReasonFilter] = useState<string>('All');
  const [postSearch, setPostSearch] = useState<string>('');

  // Sanctions registry state
  const [sanctions, setSanctions] = useState<PublishSanction[]>([]);
  const [sanctionSearch, setSanctionSearch] = useState<string>('');

  // Manual sanction modal
  const [manualSanctionAuthor, setManualSanctionAuthor] = useState<{ id: string; name: string } | null>(null);
  const [manualSanctionDays, setManualSanctionDays] = useState<7 | 14 | 30>(7);
  const [manualSanctionReason, setManualSanctionReason] = useState('Repeated irrelevant promotional content');

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAllModerationData = () => {
    setBusinessReports(db.getBusinessReports());
    setPostReports(db.getPostReports());
    setSanctions(db.getPublishSanctions());
  };

  useEffect(() => {
    loadAllModerationData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Action on Business Report
  const handleBusinessReportAction = (
    reportId: string,
    action: BusinessReport['action_taken'],
    actionTitle: string
  ) => {
    const adminId = activeAdmin?.admin_id || 'admin_super_01';
    const adminName = activeAdmin?.name || 'Super Administrator';
    const res = db.takeActionOnBusinessReport(reportId, action, adminId, adminName);
    if (res.success) {
      showToast(`${actionTitle} applied successfully.`, 'success');
      loadAllModerationData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Action on Post Report (Delete, Suspend, Terminate 7/14/30 Days, Dismiss)
  const handlePostReportAction = (
    reportId: string,
    action: PostReport['action_taken'],
    actionTitle: string
  ) => {
    const adminId = activeAdmin?.admin_id || 'admin_super_01';
    const adminName = activeAdmin?.name || 'Super Administrator';
    const res = db.takeActionOnPostReport(reportId, action, adminId, adminName);
    if (res.success) {
      showToast(`${actionTitle} applied successfully on publication.`, 'success');
      loadAllModerationData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Lift sanction early
  const handleLiftSanction = (authorId: string, authorName: string) => {
    const adminName = activeAdmin?.name || 'Super Administrator';
    const res = db.liftPublishSanction(authorId, adminName);
    if (res.success) {
      showToast(`Publishing privilege restored for ${authorName}.`, 'success');
      loadAllModerationData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Apply manual sanction
  const handleApplyManualSanction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSanctionAuthor) return;
    const adminName = activeAdmin?.name || 'Super Administrator';
    const res = db.applyManualPublishSanction(
      manualSanctionAuthor.id,
      manualSanctionAuthor.name,
      manualSanctionDays,
      manualSanctionReason,
      adminName
    );
    if (res.success) {
      showToast(res.message, 'success');
      setManualSanctionAuthor(null);
      loadAllModerationData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  // Filtered Post Reports
  const filteredPostReports = postReports.filter((r) => {
    if (postStatusFilter !== 'All' && r.status !== postStatusFilter) return false;
    if (postReasonFilter !== 'All' && r.reason !== postReasonFilter) return false;
    if (postSearch.trim()) {
      const q = postSearch.toLowerCase();
      return (
        r.report_number.toLowerCase().includes(q) ||
        r.author_name.toLowerCase().includes(q) ||
        (r.post_title && r.post_title.toLowerCase().includes(q)) ||
        r.post_snippet.toLowerCase().includes(q) ||
        r.reporter_name.toLowerCase().includes(q) ||
        r.reporter_email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Business Reports
  const filteredBusinessReports = businessReports.filter((r) => {
    if (bizStatusFilter !== 'All' && r.status !== bizStatusFilter) return false;
    if (bizReasonFilter !== 'All' && r.reason !== bizReasonFilter) return false;
    if (bizSearch.trim()) {
      const q = bizSearch.toLowerCase();
      return (
        r.report_number.toLowerCase().includes(q) ||
        r.listing_name.toLowerCase().includes(q) ||
        r.reporter_name.toLowerCase().includes(q) ||
        r.reporter_email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Sanctions
  const filteredSanctions = sanctions.filter((s) => {
    if (sanctionSearch.trim()) {
      const q = sanctionSearch.toLowerCase();
      return s.author_name.toLowerCase().includes(q) || s.author_id.toLowerCase().includes(q);
    }
    return true;
  });

  // KPI Calculations
  const pendingPostReportsCount = postReports.filter((r) => r.status === 'PENDING_REVIEW').length;
  const pendingBizReportsCount = businessReports.filter((r) => r.status === 'PENDING_REVIEW').length;
  const activeSanctionsCount = sanctions.filter((s) => s.is_suspended).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Trust, Safety &amp; Content Moderation Desk</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Admin &amp; Super Admin Oversight
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time audit console for reported posts, irrelevant spam complaints, publishing termination sanctions (7 / 14 / 30 days), and fraudulent business listing blocks.
          </p>
        </div>

        <button
          onClick={() => {
            loadAllModerationData();
            showToast('Moderation desk data refreshed.', 'success');
          }}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>Refresh All</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto space-x-2 pb-1">
        <button
          onClick={() => setActiveTab('post_reports')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'post_reports'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Flag className="w-4 h-4 text-rose-300" />
          <span>Post Content Reports &amp; Irrelevant Spam</span>
          {pendingPostReportsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-950 border border-rose-300/40 text-rose-200 font-mono">
              {pendingPostReportsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('publish_sanctions')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'publish_sanctions'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <UserX className="w-4 h-4 text-amber-300" />
          <span>Author Publishing Sanctions Registry</span>
          {activeSanctionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-950 border border-amber-300/40 text-amber-200 font-mono">
              {activeSanctionsCount} Active
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('business_reports')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'business_reports'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-300" />
          <span>Business Listings &amp; Entity Blocks</span>
          {pendingBizReportsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-950 border border-indigo-300/40 text-indigo-200 font-mono">
              {pendingBizReportsCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: POST CONTENT REPORTS & IRRELEVANT SPAM MODERATION                  */}
      {/* ========================================================================= */}
      {activeTab === 'post_reports' && (
        <div className="space-y-6">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Total Post Reports</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">{postReports.length}</div>
            </div>
            <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">Pending Audit</span>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{pendingPostReportsCount}</div>
            </div>
            <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Suspended Posts</span>
              <div className="text-2xl font-bold text-amber-300 font-mono mt-1">
                {postReports.filter((r) => r.status === 'SUSPENDED').length}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-rose-500 font-semibold">Deleted Posts</span>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                {postReports.filter((r) => r.status === 'DELETED').length}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Clean / Dismissed</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {postReports.filter((r) => r.status === 'DISMISSED').length}
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Status:</span>
                <select
                  value={postStatusFilter}
                  onChange={(e) => setPostStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-rose-500 cursor-pointer"
                >
                  <option value="All">All Statuses ({postReports.length})</option>
                  <option value="PENDING_REVIEW">Pending Audit ({pendingPostReportsCount})</option>
                  <option value="SUSPENDED">Suspended Posts</option>
                  <option value="DELETED">Deleted Posts</option>
                  <option value="DISMISSED">Dismissed / Clean</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Reason:</span>
                <select
                  value={postReasonFilter}
                  onChange={(e) => setPostReasonFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-rose-500 cursor-pointer"
                >
                  <option value="All">All Violation Reasons</option>
                  <option value="Irrelevant Content / Spam">Irrelevant Content / Spam</option>
                  <option value="Fake Company or Misleading Information">Fake Company or Misleading Information</option>
                  <option value="Fraudulent Pricing or Scam">Fraudulent Pricing or Scam</option>
                  <option value="Inappropriate / Offensive Content">Inappropriate / Offensive</option>
                  <option value="Intellectual Property Violation">Intellectual Property Violation</option>
                  <option value="Harassment / Unprofessional Behavior">Harassment</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search author, post title, report #..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs w-64 focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>

          {/* Post Reports Feed */}
          <div className="space-y-4">
            {filteredPostReports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400 space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Reported Posts Matching Criteria</h4>
                <p className="max-w-md mx-auto text-slate-500">
                  When aviators report inappropriate or irrelevant content from the publications feed, dockets will be queued here for immediate deletion, suspension, or author termination sanctions.
                </p>
              </div>
            ) : (
              filteredPostReports.map((rep) => {
                // Count reports per this author
                const authorReportsCount = postReports.filter((r) => r.author_id === rep.author_id).length;
                const authorSanctionStatus = db.isPublishSuspended(rep.author_id);

                return (
                  <div
                    key={rep.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-xl space-y-4"
                  >
                    {/* Docket Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          {rep.report_number}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs text-slate-400">Author:</span>
                          <strong className="text-sm text-white font-bold">{rep.author_name}</strong>
                        </div>

                        {/* Count of Reports Per User / Business Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
                            authorReportsCount > 1
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                          title={`Total reports filed against this author: ${authorReportsCount}`}
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>
                            {authorReportsCount} Report{authorReportsCount > 1 ? 's' : ''} on Author
                            {authorReportsCount > 1 ? ' (Repeated Irrelevant Content)' : ''}
                          </span>
                        </span>

                        {/* Active Sanction Status Badge */}
                        {authorSanctionStatus.isSuspended && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Publishing Terminated ({authorSanctionStatus.daysRemaining}d left)</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            rep.status === 'PENDING_REVIEW'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : rep.status === 'DELETED'
                              ? 'bg-rose-600/30 text-rose-200 border-rose-500/50'
                              : rep.status === 'SUSPENDED'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {rep.status === 'PENDING_REVIEW'
                            ? 'PENDING AUDIT'
                            : rep.status === 'DELETED'
                            ? 'POST DELETED'
                            : rep.status === 'SUSPENDED'
                            ? 'POST SUSPENDED'
                            : 'DISMISSED / CLEAN'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(rep.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Reported Content Body */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Left: Violation reason & Reporter Details */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400 font-semibold block text-[11px]">Violation Category:</span>
                          <div className="text-rose-300 font-bold mt-0.5 flex items-center space-x-1.5">
                            <FileWarning className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>{rep.reason}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 font-semibold block text-[11px]">Reporter:</span>
                          <div className="text-slate-200 mt-0.5 font-medium">
                            {rep.reporter_name} &bull; <span className="text-sky-300">{rep.reporter_email}</span>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                            Reporter Notes / Grievance:
                          </span>
                          <p className="text-slate-200 italic leading-relaxed">{rep.explanation}</p>
                        </div>
                      </div>

                      {/* Right: The Reported Post Snippet */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                            Target Post Content Snippet:
                          </span>
                          {rep.post_title && (
                            <h5 className="font-bold text-white text-sm mb-1">{rep.post_title}</h5>
                          )}
                          <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                            "{rep.post_snippet}"
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>Post ID: {rep.post_id}</span>
                          <span>Author ID: {rep.author_id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Record if action taken */}
                    {rep.reviewed_by && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span>Action taken by Admin: <strong className="text-slate-200">{rep.reviewed_by}</strong> ({rep.action_taken})</span>
                        <span className="font-mono text-slate-500">{rep.reviewed_at ? new Date(rep.reviewed_at).toLocaleString() : ''}</span>
                      </div>
                    )}

                    {/* Admin Action Bar (Requirement: Delete, Suspend, Terminate 7/14/30 Days, Dismiss) */}
                    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                          <span>Sanctions &amp; Content Moderation Actions:</span>
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {authorReportsCount > 1
                            ? `⚠️ Author has ${authorReportsCount} reports. Apply progressive publishing termination.`
                            : 'First violation report logged.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* 1. Delete Post */}
                        <button
                          type="button"
                          onClick={() => handlePostReportAction(rep.id, 'DELETED', 'Post Deleted')}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                          title="Delete this violating post permanently from the feed"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Delete Post</span>
                        </button>

                        {/* 2. Suspend Post */}
                        <button
                          type="button"
                          onClick={() => handlePostReportAction(rep.id, 'SUSPENDED', 'Post Suspended')}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                          title="Suspend post and hide it from all users"
                        >
                          <Ban className="w-3 h-3 text-amber-400" />
                          <span>Suspend Post</span>
                        </button>

                        {/* 3. Progressive Termination Options: 7 Days (1st offense), 14 Days (2nd offense), 30 Days (3rd offense) */}
                        <button
                          type="button"
                          onClick={() =>
                            handlePostReportAction(
                              rep.id,
                              'TERMINATE_PUBLISH_7_DAYS',
                              '7-Day Publishing Termination'
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-orange-600/30 hover:bg-orange-600/40 text-orange-200 border border-orange-500/40 text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                          title="Terminate author's publishing privileges for 7 days (1st progressive strike)"
                        >
                          <Clock className="w-3 h-3 text-orange-300" />
                          <span>Terminate Publish: 7 Days</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePostReportAction(
                              rep.id,
                              'TERMINATE_PUBLISH_14_DAYS',
                              '14-Day Publishing Termination'
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-orange-700/30 hover:bg-orange-700/40 text-orange-200 border border-orange-600/40 text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                          title="Terminate author's publishing privileges for 14 days (2nd progressive strike)"
                        >
                          <Clock className="w-3 h-3 text-orange-300" />
                          <span>Terminate: 14 Days</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePostReportAction(
                              rep.id,
                              'TERMINATE_PUBLISH_30_DAYS',
                              '30-Day Publishing Termination'
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 border border-rose-500/50 text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                          title="Terminate author's publishing privileges for 30 days (3rd progressive strike)"
                        >
                          <AlertOctagon className="w-3 h-3 text-rose-300" />
                          <span>Terminate: 30 Days</span>
                        </button>

                        {/* 4. Dismiss / Clean */}
                        <button
                          type="button"
                          onClick={() => handlePostReportAction(rep.id, 'DISMISSED', 'Report Dismissed')}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                          title="Dismiss report as compliant"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUTHOR PUBLISHING PRIVILEGES & PROGRESSIVE SANCTIONS REGISTRY      */}
      {/* ========================================================================= */}
      {activeTab === 'publish_sanctions' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <UserX className="w-4 h-4 text-amber-400" />
                <span>Publishing Privilege Sanctions Registry</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of businesses and users with suspended publishing permissions due to repeated irrelevant content. Progressive sanctions: 1st strike = 7 days, 2nd strike = 14 days, 3rd strike = 30 days.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search author or business ID..."
                value={sanctionSearch}
                onChange={(e) => setSanctionSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs w-64 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {filteredSanctions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Authors Currently Sanctioned</h4>
                <p className="max-w-md mx-auto text-slate-500">
                  When an administrator applies a 7-day, 14-day, or 30-day termination on an author from the Post Content Reports tab, their suspension docket will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase font-mono text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Author / Business</th>
                      <th className="py-3 px-4">Violations (Strikes)</th>
                      <th className="py-3 px-4">Sanction Status</th>
                      <th className="py-3 px-4">Suspended Until</th>
                      <th className="py-3 px-4">Last Sanction Tier</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredSanctions.map((s) => {
                      const status = db.isPublishSuspended(s.author_id);
                      return (
                        <tr key={s.author_id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-xs">{s.author_name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{s.author_id}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                              {s.violation_count} Strike{s.violation_count !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {status.isSuspended ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center space-x-1 w-fit">
                                <Clock className="w-3 h-3 text-rose-400" />
                                <span>Suspended ({status.daysRemaining} days left)</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center space-x-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Restored / Expired</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {s.suspended_until ? new Date(s.suspended_until).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                              {s.last_sanction || '7_DAYS'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {status.isSuspended ? (
                                <button
                                  type="button"
                                  onClick={() => handleLiftSanction(s.author_id, s.author_name)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Lift publishing suspension early"
                                >
                                  Lift Sanction
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setManualSanctionAuthor({ id: s.author_id, name: s.author_name })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                                  title="Apply new sanction"
                                >
                                  Re-Sanction
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUSINESS LISTING REPORTS & BLOCKED ENTITY AUDIT                    */}
      {/* ========================================================================= */}
      {activeTab === 'business_reports' && (
        <div className="space-y-6">
          {/* KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Total Business Reports</span>
              <div className="text-2xl font-bold text-white font-mono mt-1">{businessReports.length}</div>
            </div>
            <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">Pending Review</span>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                {businessReports.filter((r) => r.status === 'PENDING_REVIEW').length}
              </div>
            </div>
            <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Action Taken</span>
              <div className="text-2xl font-bold text-amber-300 font-mono mt-1">
                {businessReports.filter((r) => r.status === 'ACTION_TAKEN').length}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Dismissed / Clean</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {businessReports.filter((r) => r.status === 'DISMISSED').length}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-semibold">User Blocked</span>
              <div className="text-2xl font-bold text-purple-300 font-mono mt-1">
                {businessReports.filter((r) => r.is_blocked_by_user).length}
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Status:</span>
                <select
                  value={bizStatusFilter}
                  onChange={(e) => setBizStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="All">All Statuses ({businessReports.length})</option>
                  <option value="PENDING_REVIEW">Pending Audit ({businessReports.filter((r) => r.status === 'PENDING_REVIEW').length})</option>
                  <option value="ACTION_TAKEN">Action Taken ({businessReports.filter((r) => r.status === 'ACTION_TAKEN').length})</option>
                  <option value="DISMISSED">Dismissed / Clean ({businessReports.filter((r) => r.status === 'DISMISSED').length})</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Reason:</span>
                <select
                  value={bizReasonFilter}
                  onChange={(e) => setBizReasonFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="All">All Violation Reasons</option>
                  <option value="Fake Company / Unverified Business">Fake Company / Unverified Business</option>
                  <option value="Irrelevant / Misleading Content">Irrelevant / Misleading Content</option>
                  <option value="Fraudulent Pricing / Bait & Switch">Fraudulent Pricing</option>
                  <option value="Unresponsive / Invalid Contact Details">Invalid Contacts</option>
                  <option value="Other Suspicious Activity">Scam or Phishing Attempt</option>
                  <option value="Intellectual Property Violation">Intellectual Property Violation</option>
                  <option value="Harassment / Unprofessional Behavior">Harassment</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search business, report #, email..."
                value={bizSearch}
                onChange={(e) => setBizSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs w-64 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Business Reports Feed */}
          <div className="space-y-4">
            {filteredBusinessReports.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400 space-y-2">
                <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Business Reports Matching Selected Criteria</h4>
                <p className="max-w-md mx-auto text-slate-500">
                  When aviators report or block a business from the listing interface, the audit docket will appear here for manager or admin action.
                </p>
              </div>
            ) : (
              filteredBusinessReports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        {rep.report_number}
                      </span>
                      <h4 className="text-sm font-bold text-white">{rep.listing_name}</h4>
                      {rep.is_blocked_by_user && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
                          <Ban className="w-3 h-3 text-purple-400" />
                          <span>User Blocked Entity</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          rep.status === 'PENDING_REVIEW'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : rep.status === 'ACTION_TAKEN'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {rep.status === 'PENDING_REVIEW'
                          ? 'PENDING AUDIT'
                          : rep.status === 'ACTION_TAKEN'
                          ? `ACTION: ${rep.action_taken || 'APPLIED'}`
                          : 'DISMISSED / CLEAN'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(rep.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[11px]">Violation Category:</span>
                        <div className="text-indigo-300 font-bold mt-0.5 flex items-center space-x-1.5">
                          <FileWarning className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{rep.reason}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[11px]">Reporter Contact:</span>
                        <div className="text-slate-200 mt-0.5 font-medium">
                          {rep.reporter_name} &bull; <span className="text-sky-300">{rep.reporter_email}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[11px]">Target Business ID:</span>
                        <span className="font-mono text-slate-400 text-[10px]">{rep.business_id}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Report Explanation &amp; User Notes:
                      </span>
                      <p className="text-slate-200 leading-relaxed italic">{rep.explanation}</p>
                    </div>
                  </div>

                  {rep.reviewed_by && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span>Audit action taken by: <strong className="text-slate-200">{rep.reviewed_by}</strong></span>
                      <span className="font-mono text-slate-500">{rep.reviewed_at ? new Date(rep.reviewed_at).toLocaleString() : ''}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span>Administrative Listing Sanctions:</span>
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleBusinessReportAction(rep.id, 'WARNING_ISSUED', 'Formal Warning Issued')}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Issue formal policy warning to business"
                      >
                        Issue Warning
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBusinessReportAction(rep.id, '7_DAY_SUSPENSION', '7-Day Suspension Applied')}
                        className="px-2.5 py-1.5 rounded-xl bg-orange-600/30 hover:bg-orange-600/40 text-orange-200 border border-orange-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Suspend listing publication for 7 days"
                      >
                        7-Day Suspension
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBusinessReportAction(rep.id, '14_DAY_SUSPENSION', '14-Day Suspension Applied')}
                        className="px-2.5 py-1.5 rounded-xl bg-orange-700/30 hover:bg-orange-700/40 text-orange-200 border border-orange-600/40 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Suspend listing publication for 14 days"
                      >
                        14-Day Suspension
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBusinessReportAction(rep.id, '30_DAY_SUSPENSION', '30-Day Suspension Applied')}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Suspend listing publication for 30 days"
                      >
                        30-Day Suspension
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBusinessReportAction(rep.id, 'HARD_LOCKED', 'Permanent Hard Lock Applied')}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-colors cursor-pointer shadow-md"
                        title="Hard lock and restrict business completely"
                      >
                        Hard Lock / Restrict
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBusinessReportAction(rep.id, 'DISMISSED', 'Report Dismissed / Clean')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Dismiss report as invalid or clean"
                      >
                        Dismiss / Clean
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Manual Sanction Modal */}
      {manualSanctionAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <UserX className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Apply Publishing Termination</h3>
              </div>
              <button
                type="button"
                onClick={() => setManualSanctionAuthor(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <div>Target Author: <strong className="text-white">{manualSanctionAuthor.name}</strong></div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">Author ID: {manualSanctionAuthor.id}</div>
            </div>

            <form onSubmit={handleApplyManualSanction} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Termination Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualSanctionDays(7)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      manualSanctionDays === 7
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    7 Days (Strike 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualSanctionDays(14)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      manualSanctionDays === 14
                        ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    14 Days (Strike 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualSanctionDays(30)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      manualSanctionDays === 30
                        ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    30 Days (Strike 3)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Sanction Explanation / Justification</label>
                <textarea
                  value={manualSanctionReason}
                  onChange={(e) => setManualSanctionReason(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setManualSanctionAuthor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-md"
                >
                  Enforce {manualSanctionDays}-Day Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

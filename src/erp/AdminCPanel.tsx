import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  DollarSign,
  Users,
  Briefcase,
  Newspaper,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Save,
  ArrowRight,
  Eye,
  Lock,
  Search,
  Crown,
  Radio,
  FileText,
  Headphones,
  Download,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  PricingMatrixItem,
  RegularUser,
  AdminUser,
  BusinessProfile,
  JobListing,
  NewsArticle,
} from '../types';
import { AdminVerificationDesk } from './AdminVerificationDesk';
import { AdminERPPlatform } from './AdminERPPlatform';
import { AdminRBACControlPanel } from './AdminRBACControlPanel';
import { AdminBroadcastModal } from './AdminBroadcastModal';
import { AdminServicesApprovalDesk } from './AdminServicesApprovalDesk';
import { RegionalCashFlowAnalytics } from './RegionalCashFlowAnalytics';
import { AdminModuleDirectory } from './AdminModuleDirectory';
import { AdminPMSDesk } from './AdminPMSDesk';
import { HumanResourceHRMSModule } from './HumanResourceHRMSModule';
import { ReportGeneratorDesk } from './ReportGeneratorDesk';
import { AdminSupportActivityDesk } from './AdminSupportActivityDesk';
import { AdminModularLaunchpad } from './AdminModularLaunchpad';
import { CategoryHierarchyManager } from './CategoryHierarchyManager';
import { StoryCategoryManager } from './StoryCategoryManager';
import { RegionalAuthorityMappingDesk } from './RegionalAuthorityMappingDesk';
import { FlashNewsPublicationDesk } from './FlashNewsPublicationDesk';
import { EmployeeAccountLifecycleDesk } from './EmployeeAccountLifecycleDesk';
import { AdminApplicationResetDesk } from './AdminApplicationResetDesk';
import { CRMPortal } from './CRMPortal';
import { TrendingUp, Sliders, Layers, Tags, Zap, Globe, MapPin, UserX, Coins } from 'lucide-react';

interface AdminCPanelProps {
  onRefreshAll: () => void;
  onSelectBusinessToView: (biz: BusinessProfile) => void;
  onOpenProfileMenu?: () => void;
  initialTab?: string;
  onSwitchActiveUser?: (user: RegularUser) => void;
  onOpenApiInspector?: () => void;
  onOpenWallet?: () => void;
  onNavigateToModule?: (target: 'marketing') => void;
  currentUser?: RegularUser | null;
  activeAdminUser?: AdminUser | null;
  onMasterReset?: () => void;
}

export const AdminCPanel: React.FC<AdminCPanelProps> = ({
  onRefreshAll,
  onSelectBusinessToView,
  onOpenProfileMenu,
  initialTab,
  onSwitchActiveUser,
  onOpenApiInspector,
  onOpenWallet,
  onNavigateToModule,
  currentUser,
  activeAdminUser,
  onMasterReset,
}) => {
  const isSuperAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.email === 'aditya@yarifly.com' ||
    currentUser?.user_id === 'usr_super_admin' ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.level === 8;

  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    | 'erp'
    | 'pms'
    | 'cash_flow'
    | 'services_desk'
    | 'rbac'
    | 'human_resource'
    | 'biz_desk'
    | 'matrix'
    | 'flashnews'
    | 'commission_desk'
    | 'report_generator'
    | 'roles'
    | 'support_desk'
  >(
    initialTab === 'pms'
      ? 'pms'
      : initialTab === 'cash_flow'
      ? 'cash_flow'
      : initialTab === 'services_desk' || initialTab === 'services'
      ? 'services_desk'
      : initialTab === 'rbac' || initialTab === 'security'
      ? 'rbac'
      : initialTab === 'report_generator'
      ? 'report_generator'
      : initialTab === 'human_resource'
      ? 'human_resource'
      : initialTab === 'biz_desk' || initialTab === 'verification'
      ? 'biz_desk'
      : initialTab === 'matrix' || initialTab === 'pricing'
      ? 'matrix'
      : initialTab === 'flashnews' || initialTab === 'flash_news'
      ? 'flashnews'
      : initialTab === 'commission_desk' || initialTab === 'commissions'
      ? 'commission_desk'
      : initialTab === 'roles'
      ? 'roles'
      : initialTab === 'support_desk'
      ? 'support_desk'
      : 'erp'
  );

  const [erpSubTab, setErpSubTab] = useState<
    | 'overview'
    | 'report_generator'
    | 'lifecycle_governance'
    | 'content_desk'
    | 'services_approval'
    | 'launch_matrix'
    | 'roles'
    | 'flashnews_desk'
    | 'categories'
    | 'story_categories'
    | 'regional_mapping'
    | 'audit'
    | 'module_directory'
    | 'system_reset'
  >(
    initialTab === 'report_generator'
      ? 'report_generator'
      : initialTab === 'lifecycle_governance' || initialTab === 'safeguard' || initialTab === 'employee_lifecycle'
      ? 'lifecycle_governance'
      : initialTab === 'content_desk'
      ? 'content_desk'
      : initialTab === 'services_approval'
      ? 'services_approval'
      : initialTab === 'launch_matrix'
      ? 'launch_matrix'
      : initialTab === 'roles'
      ? 'roles'
      : initialTab === 'flashnews_desk' || initialTab === 'flashnews'
      ? 'flashnews_desk'
      : 'overview'
  );

  const [rbacSubTab, setRbacSubTab] = useState<'matrix' | 'permission_page' | 'module_image' | 'roles' | 'regional_governance' | 'das'>('matrix');

  useEffect(() => {
    if (initialTab === 'services_desk' || initialTab === 'services') {
      setActiveTab('services_desk');
    } else if (initialTab === 'flashnews' || initialTab === 'flash_news') {
      setActiveTab('flashnews');
    } else if (initialTab === 'commission_desk' || initialTab === 'commissions') {
      setActiveTab('commission_desk');
    } else if (initialTab === 'human_resource') {
      setActiveTab('human_resource');
    } else if (initialTab === 'pms') {
      setActiveTab('pms');
    } else if (initialTab === 'cash_flow') {
      setActiveTab('cash_flow');
    } else if (initialTab === 'rbac' || initialTab === 'security') {
      setActiveTab('rbac');
    } else if (initialTab === 'report_generator') {
      setActiveTab('report_generator');
    } else if (initialTab === 'biz_desk' || initialTab === 'verification') {
      setActiveTab('biz_desk');
    } else if (initialTab === 'matrix' || initialTab === 'pricing') {
      setActiveTab('matrix');
    } else if (initialTab === 'roles') {
      setActiveTab('roles');
    } else if (initialTab === 'support_desk') {
      setActiveTab('support_desk');
    } else if (initialTab === 'lifecycle_governance' || initialTab === 'safeguard' || initialTab === 'employee_lifecycle') {
      setActiveTab('erp');
      setErpSubTab('lifecycle_governance');
    } else if (
      initialTab === 'erp' ||
      initialTab === 'content_desk' ||
      initialTab === 'services_approval' ||
      initialTab === 'launch_matrix'
    ) {
      setActiveTab('erp');
      if (initialTab !== 'erp') {
        setErpSubTab(initialTab as any);
      }
    }
  }, [initialTab]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  // Pricing matrix state
  const [pricingItems, setPricingItems] = useState<PricingMatrixItem[]>(db.getPricingMatrix());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDebit, setEditDebit] = useState<number>(0);
  const [editMin, setEditMin] = useState<number>(0);

  // User role switching state
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>(db.getRegularUsers());
  const [roleChangeNotice, setRoleChangeNotice] = useState<string | null>(null);

  // Content queue state
  const [cpanelCompanySearch, setCpanelCompanySearch] = useState('');
  const [pendingJobs, setPendingJobs] = useState<JobListing[]>(
    db.getAllJobsAdmin().filter((j) => j.status === 'Pending Verification')
  );
  const [pendingNews, setPendingNews] = useState<NewsArticle[]>(
    db.getAllNewsAdmin().filter((n) => n.status === 'Pending Verification')
  );

  const handleEditItem = (item: PricingMatrixItem) => {
    setEditingItemId(item.id);
    setEditDebit(item.defaultDebitCredits);
    setEditMin(item.minimumThreshold);
  };

  const handleSaveItem = (id: string) => {
    const res = db.updatePricingItem(id, editDebit, editMin);
    alert(res.message);
    setPricingItems([...db.getPricingMatrix()]);
    setEditingItemId(null);
  };

  const handleSwitchRole = (userId: string, newRole: string) => {
    const res = db.switchUserRole(userId, newRole);
    setRoleChangeNotice(res.message);
    setRegularUsers([...db.getRegularUsers()]);
    setTimeout(() => setRoleChangeNotice(null), 4000);
    onRefreshAll();
  };

  const handleApproveJob = (jobId: string) => {
    const res = db.adminVerifyJob(jobId, 'approve');
    alert(res.message);
    setPendingJobs(db.getAllJobsAdmin().filter((j) => j.status === 'Pending Verification'));
    onRefreshAll();
  };

  const handleRejectJob = (jobId: string) => {
    const reason = prompt('Enter rejection reason for job posting:');
    if (!reason) return;
    const res = db.adminVerifyJob(jobId, 'reject', reason);
    alert(res.message);
    setPendingJobs(db.getAllJobsAdmin().filter((j) => j.status === 'Pending Verification'));
    onRefreshAll();
  };

  const handleApproveNews = (newsId: string, slot: 'Primary' | 'Secondary' | 'Tertiary' | 'None') => {
    const res = db.adminVerifyNews(newsId, 'approve', slot);
    alert(res.message);
    setPendingNews(db.getAllNewsAdmin().filter((n) => n.status === 'Pending Verification'));
    onRefreshAll();
  };

  const handleRejectNews = (newsId: string) => {
    const reason = prompt('Enter editorial rejection remark:');
    if (!reason) return;
    const res = db.adminVerifyNews(newsId, 'reject', 'None', reason);
    alert(res.message);
    setPendingNews(db.getAllNewsAdmin().filter((n) => n.status === 'Pending Verification'));
    onRefreshAll();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <span>Central Administration &amp; Operations Desk (C-Panel)</span>
            </span>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              Super Admin &amp; Manager Powers
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Yarifly Ecosystem Governance • Sovereign Pricing Matrix, Role Switching &amp; Compliance Gates
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Global Company Quick Search across all C-Panel modules */}
          <div className="relative w-full sm:w-80 lg:w-96">
            <div className="relative">
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cpanelCompanySearch}
                onChange={(e) => setCpanelCompanySearch(e.target.value)}
                placeholder="Search company name across all modules..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
              />
              {cpanelCompanySearch && (
                <button
                  type="button"
                  onClick={() => setCpanelCompanySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {cpanelCompanySearch.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto divide-y divide-slate-800">
                {db
                  .getBusinesses()
                  .filter(
                    (b) =>
                      b.organization_name.toLowerCase().includes(cpanelCompanySearch.toLowerCase()) ||
                      b.owner_name?.toLowerCase().includes(cpanelCompanySearch.toLowerCase()) ||
                      b.business_id.toLowerCase().includes(cpanelCompanySearch.toLowerCase())
                  )
                  .slice(0, 6)
                  .map((biz) => (
                    <div key={biz.business_id} className="p-2.5 hover:bg-slate-900 rounded-xl flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{biz.organization_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {biz.city}, {biz.state} • Comm: {biz.commission_rate_pct ?? 5}%
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('biz_desk');
                            setCpanelCompanySearch('');
                          }}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Verification
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBusinessToView(biz);
                            setCpanelCompanySearch('');
                          }}
                          className="px-2 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          View Portal
                        </button>
                      </div>
                    </div>
                  ))}
                {db
                  .getBusinesses()
                  .filter(
                    (b) =>
                      b.organization_name.toLowerCase().includes(cpanelCompanySearch.toLowerCase()) ||
                      b.owner_name?.toLowerCase().includes(cpanelCompanySearch.toLowerCase()) ||
                      b.business_id.toLowerCase().includes(cpanelCompanySearch.toLowerCase())
                  ).length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    No company matching &quot;{cpanelCompanySearch}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Navigation Tabs - Ops and ERP First */}
      {/* Navigation Tabs - Central Administration & Operations Desk (C-Panel) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        {/* 1. Ops & ERP */}
        <button
          id="cpanel-tab-erp"
          onClick={() => setActiveTab('erp')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'erp'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Ops &amp; ERP</span>
          {(pendingJobs.length + pendingNews.length) > 0 && (
            <span className="ml-1 bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {pendingJobs.length + pendingNews.length}
            </span>
          )}
        </button>

        {/* 2. Admin PMS */}
        <button
          id="cpanel-tab-pms"
          onClick={() => setActiveTab('pms')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'pms'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Admin PMS</span>
        </button>

        {/* 3. Cash Flow */}
        <button
          id="cpanel-tab-cash-flow"
          onClick={() => setActiveTab('cash_flow')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'cash_flow'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Cash Flow</span>
        </button>

        {/* 4. Services */}
        <button
          id="cpanel-tab-services"
          onClick={() => setActiveTab('services_desk')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'services_desk'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-cyan-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4 text-cyan-400" />
          <span>Services</span>
        </button>

        {/* 5. Security */}
        <button
          id="cpanel-tab-security"
          onClick={() => setActiveTab('rbac')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'rbac'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security</span>
        </button>

        {/* 6. HR+HRMS */}
        <button
          id="cpanel-tab-hrms"
          onClick={() => setActiveTab('human_resource')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'human_resource'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>HR+HRMS</span>
        </button>

        {/* 7. Verification */}
        <button
          id="cpanel-tab-verification"
          onClick={() => setActiveTab('biz_desk')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'biz_desk'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Verification</span>
        </button>

        {/* 8. Pricing */}
        <button
          id="cpanel-tab-pricing"
          onClick={() => setActiveTab('matrix')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'matrix'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Pricing</span>
        </button>

        {/* 9. Flash News Desk */}
        <button
          id="cpanel-tab-flashnews"
          onClick={() => setActiveTab('flashnews')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'flashnews'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Flash News Desk</span>
        </button>

        {/* 10. Finance Commission Desk */}
        <button
          id="cpanel-tab-commission-desk"
          onClick={() => setActiveTab('commission_desk')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeTab === 'commission_desk'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-emerald-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-400" />
          <span>Finance Commission Desk</span>
        </button>
      </div>

      {/* OPS AND ERP: Housed sub-options list */}
      {activeTab === 'erp' && (
        <div className="space-y-5">
          {/* Sub-Navigation Bar inside Ops & ERP */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Ops &amp; ERP:
            </span>

            {/* 1. ERP Platform Overview */}
            <button
              onClick={() => setErpSubTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                erpSubTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>ERP Platform Overview</span>
            </button>

            {/* 2. Report Generator */}
            <button
              id="cpanel-erp-subtab-report-gen"
              onClick={() => setErpSubTab('report_generator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                erpSubTab === 'report_generator'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report Generator</span>
            </button>

            {/* 3. Account Safeguard (Level 6 to 8 & HR Only) */}
            <button
              id="cpanel-erp-subtab-safeguard"
              onClick={() => setErpSubTab('lifecycle_governance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                erpSubTab === 'lifecycle_governance'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-500/20'
              }`}
              title="Employee Offboarding & Data Safeguard Lifecycle (Level 6-8 & HR Only)"
            >
              <UserX className="w-3.5 h-3.5 text-current" />
              <span>Account Safeguard</span>
            </button>

            {/* 4. Content Queue */}
            <button
              id="cpanel-erp-subtab-content-queue"
              onClick={() => setErpSubTab('content_desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                erpSubTab === 'content_desk'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Content Queue</span>
              {(pendingJobs.length + pendingNews.length) > 0 && (
                <span className="ml-1 bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {pendingJobs.length + pendingNews.length}
                </span>
              )}
            </button>

            {/* 5. Services */}
            <button
              id="cpanel-erp-subtab-services"
              onClick={() => setErpSubTab('services_approval')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                erpSubTab === 'services_approval'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-cyan-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>Services</span>
            </button>

            {/* 6. Modules Active Status */}
            <button
              id="cpanel-erp-subtab-launch-matrix"
              onClick={() => setErpSubTab('launch_matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                erpSubTab === 'launch_matrix'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Modules Active Status</span>
            </button>

            {/* 7. Role Switch */}
            <button
              id="cpanel-erp-subtab-roles"
              onClick={() => setErpSubTab('roles')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                erpSubTab === 'roles'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-indigo-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Role Switch</span>
            </button>

            {/* 8. Publication Desk */}
            <button
              id="cpanel-erp-subtab-flashnews-desk"
              onClick={() => setErpSubTab('flashnews_desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                erpSubTab === 'flashnews_desk'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Publication Desk</span>
            </button>
          </div>

          {/* Sub-Views: Categories, Story Categories, Regional Mapping, Lifecycle, Reset, etc. */}
          {erpSubTab === 'categories' && (
            <div className="space-y-4">
              <CategoryHierarchyManager
                activeAdminUser={activeAdminUser}
                onRefreshAll={onRefreshAll}
              />
            </div>
          )}

          {erpSubTab === 'story_categories' && (
            <div className="space-y-4">
              <StoryCategoryManager
                activeAdminUser={activeAdminUser}
                currentUser={currentUser}
                onRefreshAll={onRefreshAll}
              />
            </div>
          )}

          {erpSubTab === 'regional_mapping' && (
            <div className="space-y-4">
              <RegionalAuthorityMappingDesk
                activeAdminUser={activeAdminUser}
                currentUser={currentUser}
                onRefreshAll={onRefreshAll}
              />
            </div>
          )}

          {erpSubTab === 'lifecycle_governance' && (
            <div className="space-y-4">
              <EmployeeAccountLifecycleDesk
                activeAdminUser={activeAdminUser}
                currentUser={currentUser}
                onRefreshData={onRefreshAll}
              />
            </div>
          )}

          {erpSubTab === 'system_reset' && (
            <div className="space-y-4">
              <AdminApplicationResetDesk
                activeAdminUser={activeAdminUser}
                currentUser={currentUser}
                onResetComplete={() => {
                  onRefreshAll();
                  if (onMasterReset) onMasterReset();
                }}
              />
            </div>
          )}

          {/* ERP Sub-Views */}
          {erpSubTab === 'overview' && (
            <AdminERPPlatform
              onRefreshAll={onRefreshAll}
              onSelectBusinessToView={onSelectBusinessToView}
              onOpenProfileMenu={onOpenProfileMenu}
              onOpenApiInspector={onOpenApiInspector}
              onOpenWallet={onOpenWallet}
            />
          )}

          {erpSubTab === 'content_desk' && (
            <div className="space-y-6">
              {/* Pending Jobs Queue */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  <span>Pending Job Postings Queue ({pendingJobs.length})</span>
                </h3>

                {pendingJobs.length === 0 ? (
                  <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                    All business job submissions have been audited. No pending items.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingJobs.map((j) => (
                      <div
                        key={j.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white text-sm">{j.title}</div>
                          <div className="text-slate-400 mt-0.5">
                            Company: <span className="text-white">{j.company_name}</span> • Role: {j.role_type} • Location: {j.location}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{j.description}</div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleApproveJob(j.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve to MSN Grid</span>
                          </button>
                          <button
                            onClick={() => handleRejectJob(j.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending News Queue */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Newspaper className="w-5 h-5 text-indigo-400" />
                  <span>Pending News &amp; Blog Articles Queue ({pendingNews.length})</span>
                </h3>

                {pendingNews.length === 0 ? (
                  <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                    All business editorial articles have been audited. No pending items.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingNews.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white text-sm">{n.title}</div>
                          <div className="text-slate-400 mt-0.5">
                            Author: <span className="text-white">{n.author_org}</span> • Category: {n.category}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{n.content}</div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleApproveNews(n.id, 'Primary')}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                          >
                            Publish (Primary Slot)
                          </button>
                          <button
                            onClick={() => handleApproveNews(n.id, 'None')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]"
                          >
                            Publish Standard
                          </button>
                          <button
                            onClick={() => handleRejectNews(n.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {erpSubTab === 'audit' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">Sovereign Audit Trail &amp; SIEM Security Console</h3>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      7-Year Immutability
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cryptographically audited ledger of role elevations, wallet debits, PII reveals, and module access control.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const logsToExport = [
                      {
                        id: 'AUD-9901',
                        time: '2026-10-27 08:30:15 UTC',
                        category: 'SECURITY',
                        level: 'SECURITY_INFO',
                        actor: 'Chairman & Super Admin L8',
                        role: 'L8_SUPER_ADMIN',
                        event: 'Single-session integrity sweep verified. Concurrency guard active.',
                        ip: '10.0.12.4',
                        status: 'VERIFIED_OK',
                      },
                      {
                        id: 'AUD-9902',
                        time: '2026-10-26 14:15:00 UTC',
                        category: 'MODULE_GOVERNANCE',
                        level: 'RBAC_ELEVATION',
                        actor: 'Senior System Controller',
                        role: 'L8_SUPER_ADMIN',
                        event: 'Module Active Status audited: Launchpad & Crisis modules restricted to L8 Edit / L7 View.',
                        ip: '10.0.12.1',
                        status: 'VERIFIED_OK',
                      },
                      {
                        id: 'AUD-9903',
                        time: '2026-10-25 11:42:01 UTC',
                        category: 'FINANCIAL',
                        level: 'PAYMENT_GATEWAY',
                        actor: 'Razorpay Webhook Relay',
                        role: 'SERVICE_WORKER',
                        event: 'Razorpay Webhook signature HMAC-SHA256 validated for corporate wallet top-up.',
                        ip: '198.51.100.24',
                        status: 'VERIFIED_OK',
                      },
                    ];

                    const headers = ['Log ID', 'Timestamp (UTC)', 'Category', 'Severity Level', 'Actor User', 'Role Level', 'Action Details', 'IP / Device', 'Verification Status'];
                    const csvRows = [
                      headers.join(','),
                      ...logsToExport.map((r) =>
                        [
                          `"${r.id}"`,
                          `"${r.time}"`,
                          `"${r.category}"`,
                          `"${r.level}"`,
                          `"${r.actor}"`,
                          `"${r.role}"`,
                          `"${r.event.replace(/"/g, '""')}"`,
                          `"${r.ip}"`,
                          `"${r.status}"`,
                        ].join(',')
                      ),
                    ];

                    const csvContent = csvRows.join('\r\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `truvaer_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shrink-0"
                  title="Download full encrypted audit trail in standard CSV spreadsheet format"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Audit Trail (CSV)</span>
                </button>
              </div>

              {/* Severity & Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['ALL', 'SECURITY', 'COMPLIANCE', 'FINANCIAL', 'PRIVACY', 'IAM'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAuditFilter(cat)}
                    className={`px-3 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                      auditFilter === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Audit Events List */}
              <div className="space-y-2 text-xs font-mono">
                {[
                  {
                    id: 'AUD-9901',
                    time: '2026-10-27 08:30:15 UTC',
                    category: 'SECURITY',
                    level: 'SECURITY_INFO',
                    event: 'Single-session integrity sweep verified. Concurrency guard active.',
                  },
                  {
                    id: 'AUD-9902',
                    time: '2026-10-26 14:15:00 UTC',
                    category: 'COMPLIANCE',
                    level: 'RBAC_ELEVATION',
                    event: 'Module Active Status audited: Launchpad & Crisis modules restricted to L8 Edit / L7 View.',
                  },
                  {
                    id: 'AUD-9903',
                    time: '2026-10-25 11:42:01 UTC',
                    category: 'FINANCIAL',
                    level: 'SECURITY_INFO',
                    event: 'Razorpay Webhook signature HMAC-SHA256 validated for corporate wallet top-up.',
                  },
                  {
                    id: 'AUD-9904',
                    time: '2026-10-24 16:30:00 UTC',
                    category: 'COMPLIANCE',
                    level: 'COMPLIANCE_GATE',
                    event: 'Business Registration AeroGlobal Logistics placed in HARD_LOCKED awaiting TAN audit.',
                  },
                  {
                    id: 'AUD-9905',
                    time: '2026-10-23 09:12:33 UTC',
                    category: 'PRIVACY',
                    level: 'PII_MONITOR',
                    event: 'Live PII auto-masking intercepted unverified phone number in public dispatch.',
                  },
                  {
                    id: 'AUD-9906',
                    time: '2026-10-22 16:00:12 UTC',
                    category: 'IAM',
                    level: 'IAM_THROTTLE',
                    event: 'Dynamic Content Throttling Engine applied: 75% feed reduction on Alumni profile.',
                  },
                  {
                    id: 'AUD-9907',
                    time: '2026-10-21 11:00:00 UTC',
                    category: 'FINANCIAL',
                    level: 'AUDIT_APPROVAL',
                    event: 'JetVentures Global Operations approved. Corporate Wallet 5,000 credit grant minted.',
                  },
                ]
                  .filter((log) => auditFilter === 'ALL' || log.category === auditFilter)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-slate-500">{log.time}</span>
                        <span className="text-sky-400 font-bold">[{log.id}]</span>
                        <span className="text-amber-400 font-bold">[{log.level}]</span>
                        <span className="text-slate-200">{log.event}</span>
                      </div>
                      <span className="text-emerald-400 text-[10px] shrink-0 font-bold">VERIFIED_OK</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {erpSubTab === 'services_approval' && (
            <AdminServicesApprovalDesk
              onRefreshAll={onRefreshAll}
              onOpenBroadcastModal={() => setShowBroadcastModal(true)}
            />
          )}

          {erpSubTab === 'module_directory' && (
            <div className="space-y-4">
              <AdminModuleDirectory
                onSelectModuleTab={(tabKey, subTab) => {
                  if (tabKey === 'cash_flow') setActiveTab('cash_flow');
                  else if (tabKey === 'services_approval') {
                    setActiveTab('erp');
                    setErpSubTab('services_approval');
                  }
                  else if (tabKey === 'rbac') {
                    if (subTab) setRbacSubTab(subTab as any);
                    setActiveTab('rbac');
                  }
                  else if (tabKey === 'biz_desk') setActiveTab('biz_desk');
                  else if (tabKey === 'matrix') setActiveTab('matrix');
                  else if (tabKey === 'human_resource') setActiveTab('human_resource');
                  else {
                    setActiveTab('erp');
                    setErpSubTab('overview');
                  }
                }}
              />
            </div>
          )}

          {erpSubTab === 'launch_matrix' && (
            <AdminModularLaunchpad
              onRefreshAll={onRefreshAll}
              onNavigateToModule={onNavigateToModule}
              currentUser={currentUser}
              activeAdminUser={activeAdminUser}
            />
          )}

          {erpSubTab === 'report_generator' && (
            <div className="space-y-4">
              <ReportGeneratorDesk
                activeAdminUser={db.getAdminUsers().find((a) => a.role === 'SUPER_ADMIN') || db.getAdminUsers()[0]}
                onRefreshAll={onRefreshAll}
              />
            </div>
          )}

          {erpSubTab === 'roles' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Role Classification &amp; IAM Governance</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Managers have exclusive capability to promote Standard Users to Admin/Manager and demote Admins back to Standard tier.
                </p>
              </div>

              {roleChangeNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{roleChangeNotice}</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Current Classification</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Switch Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {regularUsers.map((u) => (
                      <tr key={u.user_id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-white">@{u.username}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : u.role === 'MANAGER'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {u.role || 'STANDARD_USER'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono text-emerald-400">{u.account_status}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <select
                              value={u.role || 'STANDARD_USER'}
                              onChange={(e) => handleSwitchRole(u.user_id, e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                            >
                              {db.getCustomUserTypes().map((ct) => (
                                <option key={ct.id} value={ct.key}>
                                  {ct.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {erpSubTab === 'flashnews_desk' && (
            <div className="space-y-4">
              <FlashNewsPublicationDesk
                currentUser={currentUser}
                activeAdminUser={activeAdminUser}
                onRefreshData={onRefreshAll}
              />
            </div>
          )}
        </div>
      )}

      {/* VIEW: SERVICES APPROVAL DESK */}
      {activeTab === 'services_desk' && (
        <AdminServicesApprovalDesk
          onRefreshAll={onRefreshAll}
          onOpenBroadcastModal={() => setShowBroadcastModal(true)}
        />
      )}

      {/* VIEW: FLASH NEWS PUBLICATION DESK */}
      {activeTab === 'flashnews' && (
        <div className="space-y-4">
          <FlashNewsPublicationDesk
            currentUser={currentUser}
            activeAdminUser={activeAdminUser}
            onRefreshData={onRefreshAll}
          />
        </div>
      )}

      {/* VIEW: FINANCE COMMISSION DESK */}
      {activeTab === 'commission_desk' && (
        <div className="space-y-4">
          <CRMPortal
            initialTab="commissions"
            currentUser={currentUser}
            activeAdminUser={activeAdminUser}
            onOpenWallet={onOpenWallet}
            onRefreshData={onRefreshAll}
          />
        </div>
      )}

      {/* VIEW 0.5: REGIONAL CASH FLOW ANALYTICS (APAC, ANZ & OTHERS - Image 3) */}
      {activeTab === 'cash_flow' && (
        <div className="space-y-4">
          <RegionalCashFlowAnalytics />
        </div>
      )}

      {/* VIEW 3: ADMIN PROJECT MANAGEMENT SYSTEM (PMS) */}
      {activeTab === 'pms' && (
        <div className="space-y-4">
          <AdminPMSDesk
            activeAdminUser={db.getAdminUsers().find((a) => a.role === 'SUPER_ADMIN') || db.getAdminUsers()[0]}
            onRefreshData={onRefreshAll}
          />
        </div>
      )}

      {/* VIEW 4: HUMAN RESOURCE (HR & HRMS SYSTEM) */}
      {activeTab === 'human_resource' && (
        <div className="space-y-4">
          <HumanResourceHRMSModule onRefreshAll={onRefreshAll} />
        </div>
      )}

      {/* VIEW 5: RBAC: ROLE-BASED ACCESS CONTROL & PORTAL SECURITY */}
      {activeTab === 'rbac' && (
        <AdminRBACControlPanel
          onPermissionsUpdated={onRefreshAll}
          initialSubTab={rbacSubTab}
          onSwitchActiveUser={onSwitchActiveUser}
        />
      )}

      {/* VIEW: EXECUTIVE REPORT GENERATOR & L8 UPDATES */}
      {activeTab === 'report_generator' && (
        <div className="space-y-4">
          <ReportGeneratorDesk
            activeAdminUser={db.getAdminUsers().find((a) => a.role === 'SUPER_ADMIN') || db.getAdminUsers()[0]}
            onRefreshAll={onRefreshAll}
          />
        </div>
      )}

      {/* VIEW 1: BUSINESS VERIFICATION DESK */}
      {activeTab === 'biz_desk' && (
        <AdminVerificationDesk
          onSelectBusinessToView={onSelectBusinessToView}
          onRefreshList={onRefreshAll}
        />
      )}

      {/* VIEW 2: CENTRALIZED PRICING MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Centralized Credit Debit Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure automatic credit deductions per marketing, job posting, and boutique lead action across all portals.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Portal Location</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Debit Value (Credits)</th>
                  <th className="py-3 px-4">Minimum Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {pricingItems.map((item) => {
                  const isEditing = editingItemId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">{item.portal}</td>
                      <td className="py-3 px-4 text-sky-400 font-mono">{item.actionType}</td>
                      <td className="py-3 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDebit}
                            onChange={(e) => setEditDebit(Number(e.target.value))}
                            className="w-20 bg-slate-950 border border-blue-500 rounded px-2 py-1 text-white"
                          />
                        ) : (
                          <span className="font-bold text-emerald-400">{item.defaultDebitCredits} Credits</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editMin}
                            onChange={(e) => setEditMin(Number(e.target.value))}
                            className="w-20 bg-slate-950 border border-blue-500 rounded px-2 py-1 text-white"
                          />
                        ) : (
                          <span>{item.minimumThreshold} Credits</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveItem(item.id)}
                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1 ml-auto"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditItem(item)}
                            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center space-x-1 ml-auto"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Matrix</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: USER ROLE SWITCHING */}
      {activeTab === 'roles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Role Classification & IAM Governance</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Managers have exclusive capability to promote Standard Users to Admin/Manager and demote Admins back to Standard tier.
            </p>
          </div>

          {roleChangeNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{roleChangeNotice}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Current Classification</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Switch Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                {regularUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-white">@{u.username}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : u.role === 'MANAGER'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {u.role || 'STANDARD_USER'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono text-emerald-400">{u.account_status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <select
                          value={u.role || 'STANDARD_USER'}
                          onChange={(e) => handleSwitchRole(u.user_id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {db.getCustomUserTypes().map((ct) => (
                            <option key={ct.id} value={ct.key}>
                              {ct.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: SUPPORT CARE DESK & ACTIVITY LOG (ADMIN END ONLY) */}
      {activeTab === 'support_desk' && (
        <div className="space-y-4">
          <AdminSupportActivityDesk onDataUpdated={onRefreshAll} />
        </div>
      )}

      {/* Admin Broadcast Modal */}
      <AdminBroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onBroadcastPublished={() => {
          onRefreshAll();
        }}
      />



      {/* Reset Notification Toast */}
      {resetSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{resetSuccessMessage}</span>
        </div>
      )}
    </div>
  );
};

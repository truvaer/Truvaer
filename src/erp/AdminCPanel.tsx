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
import { CreditTransparencyView } from './CreditTransparencyView';
import { QuantitativeReportingInterface } from '../marketing/QuantitativeReportingInterface';
import { TrendingUp, Sliders, Layers, Tags, Zap, Globe, MapPin, UserX, Coins, BarChart3, HelpCircle, UserPlus, Mail, KeyRound, Send } from 'lucide-react';
import { DispatchedWelcomeEmailModal, AdminPasswordSetupModal } from '../auth';
import { AdminWelcomeEmail, AdminLevel, AdminDepartment } from '../types';

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

  // Sector Categorization: Operations, HR, Finance, Publication, Reports, Security
  type MainSector = 'operations' | 'hr' | 'finance' | 'publication' | 'reports' | 'security';
  const [mainSector, setMainSection] = useState<MainSector>('operations');

  // Sub-tabs per sector
  const [opsSubTab, setOpsSubTab] = useState<
    | 'overview'
    | 'pms'
    | 'services'
    | 'regional_mapping'
    | 'categories'
    | 'story_categories'
    | 'system_reset'
    | 'content_queue'
    | 'directory'
  >('overview');

  const [hrSubTab, setHrSubTab] = useState<'hrms' | 'safeguard' | 'roles'>('hrms');
  const [finSubTab, setFinSubTab] = useState<
    'cash_flow' | 'crm_sales' | 'wallet' | 'pricing_matrix' | 'commission_desk' | 'credit_transparency'
  >('cash_flow');
  const [pubSubTab, setPubSubTab] = useState<'flashnews_desk' | 'content_desk'>('flashnews_desk');
  const [repSubTab, setRepSubTab] = useState<'executive_reports' | 'quant_analytics' | 'audit_logs'>('executive_reports');
  const [secSubTab, setSecSubTab] = useState<'rbac' | 'launch_matrix'>('rbac');

  const [rbacSubTab, setRbacSubTab] = useState<'matrix' | 'permission_page' | 'module_image' | 'roles' | 'regional_governance' | 'das'>('matrix');

  useEffect(() => {
    if (!initialTab) return;
    const t = initialTab.toLowerCase();
    if (t === 'pms') {
      setMainSection('operations');
      setOpsSubTab('pms');
    } else if (t === 'services' || t === 'services_desk' || t === 'biz_desk' || t === 'verification') {
      setMainSection('operations');
      setOpsSubTab('services');
    } else if (t === 'regional_mapping') {
      setMainSection('operations');
      setOpsSubTab('regional_mapping');
    } else if (t === 'categories') {
      setMainSection('operations');
      setOpsSubTab('categories');
    } else if (t === 'story_categories') {
      setMainSection('operations');
      setOpsSubTab('story_categories');
    } else if (t === 'system_reset') {
      setMainSection('operations');
      setOpsSubTab('system_reset');
    } else if (t === 'human_resource' || t === 'hrms') {
      setMainSection('hr');
      setHrSubTab('hrms');
    } else if (t === 'safeguard' || t === 'lifecycle_governance' || t === 'employee_lifecycle') {
      setMainSection('hr');
      setHrSubTab('safeguard');
    } else if (t === 'roles') {
      setMainSection('hr');
      setHrSubTab('roles');
    } else if (t === 'cash_flow') {
      setMainSection('finance');
      setFinSubTab('cash_flow');
    } else if (t === 'crm' || t === 'sales' || t === 'crm_sales') {
      setMainSection('finance');
      setFinSubTab('crm_sales');
    } else if (t === 'wallet') {
      setMainSection('finance');
      setFinSubTab('wallet');
    } else if (t === 'matrix' || t === 'pricing') {
      setMainSection('finance');
      setFinSubTab('pricing_matrix');
    } else if (t === 'commission_desk' || t === 'commissions') {
      setMainSection('finance');
      setFinSubTab('commission_desk');
    } else if (t === 'credit_transparency') {
      setMainSection('finance');
      setFinSubTab('credit_transparency');
    } else if (t === 'flashnews' || t === 'flash_news' || t === 'flashnews_desk') {
      setMainSection('publication');
      setPubSubTab('flashnews_desk');
    } else if (t === 'content_desk' || t === 'content_queue') {
      setMainSection('publication');
      setPubSubTab('content_desk');
    } else if (t === 'report_generator' || t === 'reports') {
      setMainSection('reports');
      setRepSubTab('executive_reports');
    } else if (t === 'quant_analytics' || t === 'quant_reports') {
      setMainSection('reports');
      setRepSubTab('quant_analytics');
    } else if (t === 'audit' || t === 'audit_logs') {
      setMainSection('reports');
      setRepSubTab('audit_logs');
    } else if (t === 'rbac' || t === 'security') {
      setMainSection('security');
      setSecSubTab('rbac');
    } else if (t === 'launch_matrix') {
      setMainSection('security');
      setSecSubTab('launch_matrix');
    }
  }, [initialTab]);

  // Actor clearance level calculation
  const actorLevel = activeAdminUser?.level ?? (isSuperAdmin ? 8 : 1);
  const canEditPricing = actorLevel >= 7 || isSuperAdmin;
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

  // Admin Onboarding & Welcome Email Dispatch States
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [newAdminLevel, setNewAdminLevel] = useState<AdminLevel>(7);
  const [newAdminDept, setNewAdminDept] = useState<AdminDepartment>('Operations');

  const [showDispatchedEmailModal, setShowDispatchedEmailModal] = useState(false);
  const [activeDispatchedEmail, setActiveDispatchedEmail] = useState<AdminWelcomeEmail | null>(null);

  const [showPasswordSetupModal, setShowPasswordSetupModal] = useState(false);
  const [passwordSetupEmail, setPasswordSetupEmail] = useState('');
  const [passwordSetupToken, setPasswordSetupToken] = useState('');

  const handleCreateAdminTeamAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (actorLevel < 7 && activeAdminUser?.role !== 'SUPER_ADMIN') {
      alert('403 Forbidden: Only Level 7 and Level 8 clearance officers have authorization to onboard administrative personnel.');
      return;
    }
    const res = db.createAdminTeamAccount(
      {
        name: newAdminName,
        email: newAdminEmail,
        role: newAdminRole,
        level: newAdminLevel,
        department: newAdminDept,
      },
      actorLevel,
      activeAdminUser?.name || 'Administrator'
    );
    if (res.success && res.emailRecord) {
      setShowOnboardModal(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setActiveDispatchedEmail(res.emailRecord);
      setShowDispatchedEmailModal(true);
      setRegularUsers([...db.getRegularUsers()]);
      onRefreshAll();
    } else {
      alert(res.message);
    }
  };

  const handleDispatchResetLink = (targetEmail: string) => {
    if (actorLevel < 7 && activeAdminUser?.role !== 'SUPER_ADMIN') {
      alert('403 Forbidden: Only Level 7 (L7) and Level 8 (L8) Super Administrators have clearance to dispatch administrative password reset links.');
      return;
    }
    const res = db.dispatchAdminPasswordResetLink(
      targetEmail,
      actorLevel,
      activeAdminUser?.role || 'ADMIN',
      activeAdminUser?.name || 'Administrator'
    );
    if (res.success && res.emailRecord) {
      setActiveDispatchedEmail(res.emailRecord);
      setShowDispatchedEmailModal(true);
      onRefreshAll();
    } else {
      alert(res.message);
    }
  };

  const handleEditItem = (item: PricingMatrixItem) => {
    if (!canEditPricing) {
      alert('403 Forbidden: Modifying credit pricing rules is restricted to Level 7 (L7) and Level 8 (L8) Super Admins.');
      return;
    }
    setEditingItemId(item.id);
    setEditDebit(item.defaultDebitCredits);
    setEditMin(item.minimumThreshold);
  };

  const handleSaveItem = (id: string) => {
    if (!canEditPricing) {
      alert('403 Forbidden: Modifying credit pricing rules is restricted to Level 7 (L7) and Level 8 (L8) Super Admins.');
      return;
    }
    const res = db.updatePricingItem(
      id,
      editDebit,
      editMin,
      activeAdminUser?.role || (isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'),
      actorLevel
    );
    alert(res.message);
    setPricingItems([...db.getPricingMatrix()]);
    setEditingItemId(null);
  };

  const handleSwitchRole = (userId: string, newRole: string) => {
    const res = db.switchUserRole(userId, newRole, actorLevel, activeAdminUser?.role);
    setRoleChangeNotice(res.message);
    setRegularUsers([...db.getRegularUsers()]);
    setTimeout(() => setRoleChangeNotice(null), 5000);
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
                            setMainSection('operations');
                            setOpsSubTab('services');
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

      {/* Master Sector Navigation (Operations, HR, Finance, Publication, Reports, Security) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-md">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
          C-Panel Sector:
        </span>

        {/* 1. OPERATIONS */}
        <button
          id="cpanel-sector-operations"
          onClick={() => setMainSection('operations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            mainSector === 'operations'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Operations</span>
          {(pendingJobs.length + pendingNews.length) > 0 && (
            <span className="ml-1 bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {pendingJobs.length + pendingNews.length}
            </span>
          )}
        </button>

        {/* 2. HR */}
        <button
          id="cpanel-sector-hr"
          onClick={() => setMainSection('hr')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            mainSector === 'hr'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>HR</span>
        </button>

        {/* 3. FINANCE */}
        <button
          id="cpanel-sector-finance"
          onClick={() => setMainSection('finance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            mainSector === 'finance'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Finance</span>
        </button>

        {/* 4. PUBLICATION */}
        <button
          id="cpanel-sector-publication"
          onClick={() => setMainSection('publication')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            mainSector === 'publication'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4 text-rose-400" />
          <span>Publication</span>
        </button>

        {/* 5. REPORTS */}
        <button
          id="cpanel-sector-reports"
          onClick={() => setMainSection('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            mainSector === 'reports'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-sky-400" />
          <span>Reports</span>
        </button>

        {/* 6. SECURITY */}
        <button
          id="cpanel-sector-security"
          onClick={() => setMainSection('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            mainSector === 'security'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security</span>
        </button>
      </div>

            {/* ========================================================================= */}
      {/* 1. SECTOR: OPERATIONS                                                     */}
      {/* ========================================================================= */}
      {mainSector === 'operations' && (
        <div className="space-y-5">
          {/* Operations Sub-Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Operations:
            </span>

            {/* ERP Platform Overview */}
            <button
              id="cpanel-ops-overview-btn"
              onClick={() => setOpsSubTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>ERP Platform Overview</span>
            </button>

            {/* Admin PMS */}
            <button
              id="cpanel-ops-pms-btn"
              onClick={() => setOpsSubTab('pms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'pms'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Admin PMS</span>
            </button>

            {/* Services & Verification */}
            <button
              id="cpanel-ops-services-btn"
              onClick={() => setOpsSubTab('services')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'services'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-cyan-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Services &amp; Verification</span>
            </button>

            {/* Regional & Country Mapping */}
            <button
              id="cpanel-ops-regional-mapping-btn"
              onClick={() => setOpsSubTab('regional_mapping')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'regional_mapping'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-emerald-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Regional &amp; Country Mapping</span>
            </button>

            {/* Categories & Subcategories */}
            <button
              id="cpanel-ops-categories-btn"
              onClick={() => setOpsSubTab('categories')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'categories'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-indigo-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tags className="w-3.5 h-3.5 text-indigo-400" />
              <span>Categories &amp; Subcategories</span>
            </button>

            {/* Story Categories */}
            <button
              id="cpanel-ops-story-categories-btn"
              onClick={() => setOpsSubTab('story_categories')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'story_categories'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-purple-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tags className="w-3.5 h-3.5 text-purple-400" />
              <span>Story Categories</span>
            </button>

            {/* Full Application Reset */}
            <button
              id="cpanel-ops-system-reset-btn"
              onClick={() => setOpsSubTab('system_reset')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'system_reset'
                  ? 'bg-rose-600 text-white font-black shadow'
                  : 'text-rose-400 hover:text-white hover:bg-rose-950/40 border border-rose-500/20'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Full Application Reset</span>
            </button>

            {/* Content Queue */}
            <button
              id="cpanel-ops-content-queue-btn"
              onClick={() => setOpsSubTab('content_queue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'content_queue'
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

            {/* Module Directory */}
            <button
              id="cpanel-ops-directory-btn"
              onClick={() => setOpsSubTab('directory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                opsSubTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ERP Modules Directory</span>
            </button>
          </div>

          {/* Operations Sub-Views */}
          {opsSubTab === 'overview' && (
            <AdminERPPlatform
              onRefreshAll={onRefreshAll}
              onSelectBusinessToView={onSelectBusinessToView}
              onOpenProfileMenu={onOpenProfileMenu}
              onOpenApiInspector={onOpenApiInspector}
              onOpenWallet={onOpenWallet}
            />
          )}

          {opsSubTab === 'pms' && (
            <div className="space-y-4">
              <AdminPMSDesk
                activeAdminUser={db.getAdminUsers().find((a) => a.role === 'SUPER_ADMIN') || db.getAdminUsers()[0]}
                onRefreshData={onRefreshAll}
              />
            </div>
          )}

          {opsSubTab === 'services' && (
            <div className="space-y-6">
              <AdminVerificationDesk
                onSelectBusinessToView={onSelectBusinessToView}
                onRefreshList={onRefreshAll}
              />
              <AdminServicesApprovalDesk
                onRefreshAll={onRefreshAll}
                onOpenBroadcastModal={() => setShowBroadcastModal(true)}
              />
            </div>
          )}

          {opsSubTab === 'regional_mapping' && (
            <div className="space-y-4">
              <RegionalAuthorityMappingDesk
                activeAdminUser={activeAdminUser}
                currentUser={currentUser}
                onRefreshAll={onRefreshAll}
              />
            </div>
          )}

          {opsSubTab === 'categories' && (
            <div className="space-y-4">
              <CategoryHierarchyManager
                activeAdminUser={activeAdminUser}
                onRefreshAll={onRefreshAll}
              />
            </div>
          )}

          {opsSubTab === 'story_categories' && (
            <div className="space-y-4">
              <StoryCategoryManager
                activeAdminUser={activeAdminUser}
                currentUser={currentUser}
                onRefreshAll={onRefreshAll}
              />
            </div>
          )}

          {opsSubTab === 'system_reset' && (
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

          {opsSubTab === 'content_queue' && (
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
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve to MSN Grid</span>
                          </button>
                          <button
                            onClick={() => handleRejectJob(j.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1 cursor-pointer"
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
                            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Approve Primary
                          </button>
                          <button
                            onClick={() => handleApproveNews(n.id, 'Secondary')}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Approve Secondary
                          </button>
                          <button
                            onClick={() => handleRejectNews(n.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
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

          {opsSubTab === 'directory' && (
            <div className="space-y-4">
              <AdminModuleDirectory
                onSelectModuleTab={(tabKey, subTab) => {
                  if (tabKey === 'cash_flow') {
                    setMainSection('finance');
                    setFinSubTab('cash_flow');
                  } else if (tabKey === 'services_approval') {
                    setMainSection('operations');
                    setOpsSubTab('services');
                  } else if (tabKey === 'rbac') {
                    setMainSection('security');
                    if (subTab) setRbacSubTab(subTab as any);
                    setSecSubTab('rbac');
                  } else if (tabKey === 'biz_desk') {
                    setMainSection('operations');
                    setOpsSubTab('services');
                  } else if (tabKey === 'matrix') {
                    setMainSection('finance');
                    setFinSubTab('pricing_matrix');
                  } else if (tabKey === 'human_resource') {
                    setMainSection('hr');
                    setHrSubTab('hrms');
                  } else {
                    setMainSection('operations');
                    setOpsSubTab('overview');
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECTOR: HR                                                             */}
      {/* ========================================================================= */}
      {mainSector === 'hr' && (
        <div className="space-y-5">
          {/* HR Sub-Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              HR &amp; People:
            </span>

            {/* HRMS System */}
            <button
              id="cpanel-hr-hrms-btn"
              onClick={() => setHrSubTab('hrms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                hrSubTab === 'hrms'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>HR &amp; HRMS System</span>
            </button>

            {/* Account Safeguard (Level 6 to 8 & HR Only) */}
            <button
              id="cpanel-hr-safeguard-btn"
              onClick={() => setHrSubTab('safeguard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                hrSubTab === 'safeguard'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-500/20'
              }`}
              title="Employee Offboarding & Data Safeguard Lifecycle (Level 6-8 & HR Only)"
            >
              <UserX className="w-3.5 h-3.5 text-current" />
              <span>Account Safeguard &amp; Offboarding (L6-L8 &amp; HR)</span>
            </button>

            {/* Role Switch & IAM Governance */}
            <button
              id="cpanel-hr-roles-btn"
              onClick={() => setHrSubTab('roles')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                hrSubTab === 'roles'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-indigo-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Role Switch &amp; IAM Governance</span>
            </button>
          </div>

          {/* HR Sub-Views */}
          {hrSubTab === 'hrms' && (
            <div className="space-y-4">
              <HumanResourceHRMSModule onRefreshAll={onRefreshAll} />
            </div>
          )}

          {hrSubTab === 'safeguard' && (
            <div className="space-y-4">
              <EmployeeAccountLifecycleDesk
                activeAdminUser={activeAdminUser}
                currentUser={currentUser}
                onRefreshData={onRefreshAll}
              />
            </div>
          )}

          {hrSubTab === 'roles' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">Role Classification &amp; IAM Governance</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Mandatory @yarifly.com / @truvaer.com
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Any Admin or Super Admin account must have a verified organizational email ending with <strong className="text-amber-300">@yarifly.com</strong> or <strong className="text-amber-300">@truvaer.com</strong>. Super Admin elevation requires Level 8 authorization.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center space-x-1.5 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Onboard Admin Personnel</span>
                  </button>
                </div>
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
                      <th className="py-3 px-4 text-center">Password Setup &amp; Activation Link</th>
                      <th className="py-3 px-4 text-right">Switch Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {regularUsers.map((u) => {
                      const email = (u.email || '').toLowerCase();
                      const isOrgEmail = email.endsWith('@yarifly.com') || email.endsWith('@truvaer.com');
                      const isAdminRole = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.role === 'MANAGER';
                      const canReset = actorLevel >= 7 || isSuperAdmin;
                      return (
                        <tr key={u.user_id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-semibold text-white">@{u.username}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            <span className={isOrgEmail ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                              {u.email}
                            </span>
                            {!isOrgEmail && (
                              <span className="ml-2 text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                                Non-Admin Domain
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                u.role === 'SUPER_ADMIN'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : u.role === 'ADMIN'
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
                          <td className="py-3 px-4 text-center">
                            {isAdminRole || isOrgEmail ? (
                              canReset ? (
                                <button
                                  type="button"
                                  onClick={() => handleDispatchResetLink(u.email)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold inline-flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                                  title="Dispatch tokenized password link to admin email (L7/L8 clearance)"
                                >
                                  <KeyRound className="w-3 h-3 text-amber-400" />
                                  <span>Send Password Link</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-500 border border-slate-750 text-[10px] font-mono inline-flex items-center space-x-1 cursor-not-allowed opacity-50"
                                  title="403 Forbidden: Only Level 7 (L7) and Level 8 (L8) have authorization to dispatch password links"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>L7/L8 Only (403)</span>
                                </button>
                              )
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono">Standard Member</span>
                            )}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onboard New Admin Modal */}
          {showOnboardModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
              <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Onboard Admin Team Member</h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Portal: admin.truvaer.com | Mandatory @yarifly.com or @truvaer.com
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOnboardModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAdminTeamAccount} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="e.g. Captain Rajesh Verma"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                      Corporate Administrative Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="rajesh.verma@yarifly.com or verma@truvaer.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                    />
                    <span className="text-[10px] text-amber-400/80 mt-1 block">
                      Strict domain requirement: must end with @yarifly.com or @truvaer.com
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                        Classification Role
                      </label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value as 'ADMIN' | 'SUPER_ADMIN')}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white focus:border-amber-500 outline-none"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN (L8)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                        Security Clearance
                      </label>
                      <select
                        value={newAdminLevel}
                        onChange={(e) => setNewAdminLevel(Number(e.target.value) as AdminLevel)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white focus:border-amber-500 outline-none"
                      >
                        <option value={7}>Level 7 (L7 Administrator)</option>
                        <option value={8}>Level 8 (L8 Super Admin)</option>
                        <option value={6}>Level 6 (L6 Senior Lead)</option>
                        <option value={5}>Level 5 (L5 Department Manager)</option>
                        <option value={4}>Level 4 (L4 Operations Officer)</option>
                        <option value={3}>Level 3 (L3 Executive)</option>
                        <option value={2}>Level 2 (L2 Associate)</option>
                        <option value={1}>Level 1 (L1 Trainee)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                      Department Assignment
                    </label>
                    <select
                      value={newAdminDept}
                      onChange={(e) => setNewAdminDept(e.target.value as AdminDepartment)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white focus:border-amber-500 outline-none"
                    >
                      <option value="Operations">Operations Command</option>
                      <option value="Finance">Finance &amp; Treasury</option>
                      <option value="Human Resources">Human Resources &amp; HRMS</option>
                      <option value="Security">Security &amp; IAM</option>
                      <option value="Verification">Verification Desk</option>
                      <option value="Executive Management">Executive Command (L8)</option>
                    </select>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setShowOnboardModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black uppercase tracking-wider shadow-md"
                    >
                      Create Account &amp; Send Welcome Email
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Dispatched Welcome / Password Reset Email Modal */}
          <DispatchedWelcomeEmailModal
            isOpen={showDispatchedEmailModal}
            onClose={() => setShowDispatchedEmailModal(false)}
            emailData={activeDispatchedEmail}
            onOpenPasswordSetup={(email, token) => {
              setPasswordSetupEmail(email);
              setPasswordSetupToken(token);
              setShowPasswordSetupModal(true);
            }}
          />

          {/* Admin Password Setup Modal */}
          <AdminPasswordSetupModal
            isOpen={showPasswordSetupModal}
            onClose={() => setShowPasswordSetupModal(false)}
            initialEmail={passwordSetupEmail}
            initialToken={passwordSetupToken}
            onSuccess={() => {
              onRefreshAll();
              setRegularUsers([...db.getRegularUsers()]);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTOR: FINANCE                                                        */}
      {/* ========================================================================= */}
      {mainSector === 'finance' && (
        <div className="space-y-5">
          {/* Finance Sub-Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Finance &amp; Treasury:
            </span>

            {/* Regional Cash Flow */}
            <button
              id="cpanel-fin-cashflow-btn"
              onClick={() => setFinSubTab('cash_flow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                finSubTab === 'cash_flow'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Regional Cash Flow</span>
            </button>

            {/* Sales CRM */}
            <button
              id="cpanel-fin-sales-btn"
              onClick={() => setFinSubTab('crm_sales')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                finSubTab === 'crm_sales'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Commercial Sales (CRM)</span>
            </button>

            {/* Centralized Pricing Matrix */}
            <button
              id="cpanel-fin-pricing-btn"
              onClick={() => setFinSubTab('pricing_matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                finSubTab === 'pricing_matrix'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Centralized Pricing Matrix</span>
            </button>

            {/* Commission Desk */}
            <button
              id="cpanel-fin-commissions-btn"
              onClick={() => setFinSubTab('commission_desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                finSubTab === 'commission_desk'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-emerald-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Commission Desk</span>
            </button>

            {/* Credit Transparency */}
            <button
              id="cpanel-fin-transparency-btn"
              onClick={() => setFinSubTab('credit_transparency')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                finSubTab === 'credit_transparency'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-sky-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              <span>Credit Transparency &amp; Ledger</span>
            </button>
          </div>

          {/* Finance Sub-Views */}
          {finSubTab === 'cash_flow' && (
            <div className="space-y-4">
              <RegionalCashFlowAnalytics />
            </div>
          )}

          {finSubTab === 'crm_sales' && (
            <div className="space-y-4">
              <CRMPortal
                initialTab="leads"
                currentUser={currentUser}
                activeAdminUser={activeAdminUser}
                onOpenWallet={onOpenWallet}
                onRefreshData={onRefreshAll}
              />
            </div>
          )}

          {finSubTab === 'pricing_matrix' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Centralized Credit Debit Matrix</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure automatic credit deductions per marketing, job posting, and boutique lead action across all portals.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                      canEditPricing
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {canEditPricing ? 'L7/L8 Edit Permitted' : 'Read Only (L7/L8 Required)'}
                  </span>
                </div>
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
                                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center space-x-1 ml-auto cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                            ) : (
                              <button
                                disabled={!canEditPricing}
                                onClick={() => handleEditItem(item)}
                                className={`px-3 py-1 rounded font-medium flex items-center space-x-1 ml-auto transition-colors ${
                                  canEditPricing
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer'
                                    : 'bg-slate-900 text-slate-600 border border-slate-800/60 cursor-not-allowed opacity-60'
                                }`}
                                title={
                                  canEditPricing
                                    ? 'Edit credit rate'
                                    : '403 Forbidden: Modifying credit pricing is restricted to L7 and L8 Super Admins.'
                                }
                              >
                                {!canEditPricing && <Lock className="w-3 h-3 text-slate-500" />}
                                {canEditPricing && <Edit2 className="w-3 h-3" />}
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

          {finSubTab === 'commission_desk' && (
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

          {finSubTab === 'credit_transparency' && (
            <CreditTransparencyView activeAdminUser={activeAdminUser} />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTOR: PUBLICATION                                                    */}
      {/* ========================================================================= */}
      {mainSector === 'publication' && (
        <div className="space-y-5">
          {/* Publication Sub-Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Publication:
            </span>

            {/* FlashNews & Blink Feed Desk */}
            <button
              id="cpanel-pub-flashnews-btn"
              onClick={() => setPubSubTab('flashnews_desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                pubSubTab === 'flashnews_desk'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>FlashNews &amp; Blink Feed Desk</span>
            </button>

            {/* Content Verification Queue */}
            <button
              id="cpanel-pub-content-btn"
              onClick={() => setPubSubTab('content_desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                pubSubTab === 'content_desk'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Content Verification Queue</span>
              {(pendingJobs.length + pendingNews.length) > 0 && (
                <span className="ml-1 bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {pendingJobs.length + pendingNews.length}
                </span>
              )}
            </button>
          </div>

          {/* Publication Sub-Views */}
          {pubSubTab === 'flashnews_desk' && (
            <div className="space-y-4">
              <FlashNewsPublicationDesk
                currentUser={currentUser}
                activeAdminUser={activeAdminUser}
                onRefreshData={onRefreshAll}
              />
            </div>
          )}

          {pubSubTab === 'content_desk' && (
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
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve to MSN Grid</span>
                          </button>
                          <button
                            onClick={() => handleRejectJob(j.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1 cursor-pointer"
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
                            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Approve Primary
                          </button>
                          <button
                            onClick={() => handleApproveNews(n.id, 'Secondary')}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Approve Secondary
                          </button>
                          <button
                            onClick={() => handleRejectNews(n.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SECTOR: REPORTS                                                        */}
      {/* ========================================================================= */}
      {mainSector === 'reports' && (
        <div className="space-y-5">
          {/* Reports Sub-Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Reports &amp; Analytics:
            </span>

            {/* Executive Report Generator */}
            <button
              id="cpanel-rep-exec-btn"
              onClick={() => setRepSubTab('executive_reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                repSubTab === 'executive_reports'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Report Generator</span>
            </button>

            {/* Quantitative Campaign Analytics */}
            <button
              id="cpanel-rep-quant-btn"
              onClick={() => setRepSubTab('quant_analytics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                repSubTab === 'quant_analytics'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-sky-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
              <span>Quantitative Campaign Analytics</span>
            </button>

            {/* Audit Logs */}
            <button
              id="cpanel-rep-audit-btn"
              onClick={() => setRepSubTab('audit_logs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                repSubTab === 'audit_logs'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sovereign Audit Logs (SIEM)</span>
            </button>
          </div>

          {/* Reports Sub-Views */}
          {repSubTab === 'executive_reports' && (
            <div className="space-y-4">
              <ReportGeneratorDesk
                activeAdminUser={db.getAdminUsers().find((a) => a.role === 'SUPER_ADMIN') || db.getAdminUsers()[0]}
                onRefreshAll={onRefreshAll}
              />
            </div>
          )}

          {repSubTab === 'quant_analytics' && (
            <QuantitativeReportingInterface
              currentBusiness={db.getBusinesses()[0]}
              currentUser={currentUser}
            />
          )}

          {repSubTab === 'audit_logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Sovereign Security Information &amp; Event Management (SIEM) Audit Trail</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immutable cryptographically-signed records of every administrative action, RBAC escalation, Razorpay payment webhook, and sensitive PII masking event.
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
                        actor: 'Super Admin Aditya',
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SECTOR: SECURITY                                                       */}
      {/* ========================================================================= */}
      {mainSector === 'security' && (
        <div className="space-y-5">
          {/* Security Sub-Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center space-x-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Security &amp; Governance:
            </span>

            {/* RBAC Permissions & Single-Session Guard */}
            <button
              id="cpanel-sec-rbac-btn"
              onClick={() => setSecSubTab('rbac')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                secSubTab === 'rbac'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>RBAC Permissions &amp; Single-Session Guard</span>
            </button>

            {/* Active Module Controls (Launchpad) */}
            <button
              id="cpanel-sec-launchpad-btn"
              onClick={() => setSecSubTab('launch_matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                secSubTab === 'launch_matrix'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Module Controls (Launchpad)</span>
            </button>
          </div>

          {/* Security Sub-Views */}
          {secSubTab === 'rbac' && (
            <AdminRBACControlPanel
              onPermissionsUpdated={onRefreshAll}
              initialSubTab={rbacSubTab}
              onSwitchActiveUser={onSwitchActiveUser}
            />
          )}

          {secSubTab === 'launch_matrix' && (
            <AdminModularLaunchpad
              onRefreshAll={onRefreshAll}
              onNavigateToModule={onNavigateToModule}
              currentUser={currentUser}
              activeAdminUser={activeAdminUser}
            />
          )}
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

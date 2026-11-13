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
  Plus,
  Trash2,
  X,
  CreditCard,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  PricingMatrixItem,
  RegularUser,
  AdminUser,
  BusinessProfile,
  JobListing,
  NewsArticle,
  RegionalCreditPricingRule,
} from '../types';
import { COUNTRIES } from '../marketing/MarketingPortal';
import { AVIATION_REGIONS } from '../marketing/LinkedInMarketingFeed';
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
import { CreditManagementSystemDesk } from './CreditManagementSystemDesk';
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
    'cash_flow' | 'crm_sales' | 'wallet' | 'pricing_matrix' | 'commission_desk' | 'credit_transparency' | 'credit_management'
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
    } else if (t === 'cms' || t === 'credit_management' || t === 'credit_system') {
      setMainSection('finance');
      setFinSubTab('credit_management');
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

  // Multi-Country & Regional Credit Pricing Engine State (Super Admin)
  const [pricingActiveView, setPricingActiveView] = useState<'REGIONAL_RULES' | 'PORTAL_ACTIONS'>('REGIONAL_RULES');
  const [regionalPricingList, setRegionalPricingList] = useState<RegionalCreditPricingRule[]>(() => db.getRegionalCreditPricing());
  const [globalDefaultRate, setGlobalDefaultRate] = useState<number>(() => db.getGlobalDefaultCreditRate());
  const [regionalSearchQuery, setRegionalSearchQuery] = useState('');
  const [regionalFilterType, setRegionalFilterType] = useState<'ALL' | 'COUNTRY' | 'REGION'>('ALL');

  // Modal states for Add/Edit rule
  const [showAddEditRuleModal, setShowAddEditRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [modalLocationType, setModalLocationType] = useState<'COUNTRY' | 'REGION'>('COUNTRY');
  const [modalLocationCode, setModalLocationCode] = useState('');
  const [modalLocationName, setModalLocationName] = useState('');
  const [modalCreditCost, setModalCreditCost] = useState<number>(15);
  const [modalNotes, setModalNotes] = useState('');
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // Global default rate edit modal
  const [showGlobalRateModal, setShowGlobalRateModal] = useState(false);
  const [tempGlobalRate, setTempGlobalRate] = useState<number>(15);
  const [pricingFeedbackMessage, setPricingFeedbackMessage] = useState<string | null>(null);

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

  const refreshRegionalPricing = () => {
    setRegionalPricingList(db.getRegionalCreditPricing());
    setGlobalDefaultRate(db.getGlobalDefaultCreditRate());
  };

  const handleOpenAddRule = () => {
    setEditingRuleId(null);
    setModalLocationType('COUNTRY');
    setModalLocationCode(COUNTRIES[0]?.code || 'US');
    setModalLocationName(COUNTRIES[0]?.name || 'United States');
    setModalCreditCost(15);
    setModalNotes('');
    setModalFeedback(null);
    setShowAddEditRuleModal(true);
  };

  const handleOpenEditRule = (rule: RegionalCreditPricingRule) => {
    setEditingRuleId(rule.id);
    setModalLocationType(rule.location_type === 'REGION' ? 'REGION' : 'COUNTRY');
    setModalLocationCode(rule.location_code);
    setModalLocationName(rule.location_name);
    setModalCreditCost(rule.credit_cost);
    setModalNotes(rule.notes || '');
    setModalFeedback(null);
    setShowAddEditRuleModal(true);
  };

  const handleSaveRegionalRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditPricing) {
      setModalFeedback('403 Forbidden: Only L7 and L8 Super Admins can configure credit pricing rules.');
      return;
    }
    if (!modalLocationCode || !modalLocationName || modalCreditCost < 1) {
      setModalFeedback('Please provide valid location code, location name, and a positive credit cost.');
      return;
    }

    const res = db.saveRegionalCreditPricingRule(
      {
        id: editingRuleId || undefined,
        location_code: modalLocationCode,
        location_name: modalLocationName,
        location_type: modalLocationType,
        credit_cost: modalCreditCost,
        notes: modalNotes,
      },
      activeAdminUser?.name || 'Super Administrator (L8)'
    );

    if (res.success) {
      refreshRegionalPricing();
      setShowAddEditRuleModal(false);
      setPricingFeedbackMessage(res.message);
      setTimeout(() => setPricingFeedbackMessage(null), 4000);
    } else {
      setModalFeedback(res.message);
    }
  };

  const handleDeleteRegionalRule = (rule: RegionalCreditPricingRule) => {
    if (!canEditPricing) {
      alert('403 Forbidden: Only L7 and L8 Super Admins can delete credit pricing rules.');
      return;
    }
    if (rule.location_type === 'GLOBAL_DEFAULT' || rule.is_default) {
      alert('The Global Default baseline rule cannot be deleted.');
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete the pricing rule for "${rule.location_name}" (${rule.location_code})? Locations under this rule will revert to the Global Default rate (${globalDefaultRate} Cr/day).`
      )
    ) {
      return;
    }

    const res = db.deleteRegionalCreditPricingRule(rule.id, activeAdminUser?.name || 'Super Administrator (L8)');
    if (res.success) {
      refreshRegionalPricing();
      setPricingFeedbackMessage(res.message);
      setTimeout(() => setPricingFeedbackMessage(null), 4000);
    } else {
      alert(res.message);
    }
  };

  const handleSaveGlobalDefaultRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditPricing) {
      alert('403 Forbidden: Only L7 and L8 Super Admins can adjust the Global Default baseline rate.');
      return;
    }
    if (tempGlobalRate < 1) {
      alert('Global default rate must be at least 1 credit.');
      return;
    }
    const res = db.setGlobalDefaultCreditRate(tempGlobalRate, activeAdminUser?.name || 'Super Administrator (L8)');
    if (res.success) {
      refreshRegionalPricing();
      setShowGlobalRateModal(false);
      setPricingFeedbackMessage(`Global Default baseline rate calibrated to ${res.rate} Credits/day.`);
      setTimeout(() => setPricingFeedbackMessage(null), 4000);
    }
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full max-w-full">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg sm:text-2xl font-black text-white flex items-center space-x-2 min-w-0">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
              <span className="break-words">Central Administration &amp; Operations Desk (C-Panel)</span>
            </span>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
              Super Admin &amp; Manager Powers
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Yarifly Ecosystem Governance • Sovereign Pricing Matrix, Role Switching &amp; Compliance Gates
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
          {/* Global Company Quick Search across all C-Panel modules */}
          <div className="relative w-full sm:w-72 lg:w-80 xl:w-96 max-w-full">
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

      {/* Master Sector Navigation (Ops, HR, Finance, Publication, Reports, Security) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2.5 rounded-2xl border border-slate-800 shadow-md max-w-full w-full">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
          C-Panel Sector:
        </span>

        {/* 1. OPERATIONS (RENAMED TO OPS PER SPECIFICATION) */}
        <button
          id="cpanel-sector-operations"
          onClick={() => setMainSection('operations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-normal break-words text-center ${
            mainSector === 'operations'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4 shrink-0" />
          <span>Ops</span>
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-normal break-words text-center ${
            mainSector === 'hr'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>HR</span>
        </button>

        {/* 3. FINANCE */}
        <button
          id="cpanel-sector-finance"
          onClick={() => setMainSection('finance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-normal break-words text-center ${
            mainSector === 'finance'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4 shrink-0" />
          <span>Finance</span>
        </button>

        {/* 4. PUBLICATION */}
        <button
          id="cpanel-sector-publication"
          onClick={() => setMainSection('publication')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-normal break-words text-center ${
            mainSector === 'publication'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Publication</span>
        </button>

        {/* 5. REPORTS */}
        <button
          id="cpanel-sector-reports"
          onClick={() => setMainSection('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-normal break-words text-center ${
            mainSector === 'reports'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0 text-sky-400" />
          <span>Reports</span>
        </button>

        {/* 6. SECURITY */}
        <button
          id="cpanel-sector-security"
          onClick={() => setMainSection('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-normal break-words text-center ${
            mainSector === 'security'
              ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Security</span>
        </button>
      </div>

            {/* ========================================================================= */}
      {/* 1. SECTOR: OPERATIONS                                                     */}
      {/* ========================================================================= */}
      {mainSector === 'operations' && (
        <div className="space-y-5">
          {/* Operations Sub-Navigation Bar (Responsive wrap within screen size, word-wrap enabled) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex flex-wrap items-center gap-2 max-w-full w-full">
            {/* 1. ERP Overview */}
            <button
              id="cpanel-ops-overview-btn"
              onClick={() => setOpsSubTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Crown className="w-3.5 h-3.5 shrink-0" />
              <span>ERP Overview</span>
            </button>

            {/* 2. ERP Module */}
            <button
              id="cpanel-ops-directory-btn"
              onClick={() => setOpsSubTab('directory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>ERP Module</span>
            </button>

            {/* 3. Admin PMS */}
            <button
              id="cpanel-ops-pms-btn"
              onClick={() => setOpsSubTab('pms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'pms'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span>Admin PMS</span>
            </button>

            {/* 4. Services & Verification */}
            <button
              id="cpanel-ops-services-btn"
              onClick={() => setOpsSubTab('services')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'services'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-cyan-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span>Services &amp; Verification</span>
            </button>

            {/* 5. Regional & Country Mapping */}
            <button
              id="cpanel-ops-regional-mapping-btn"
              onClick={() => setOpsSubTab('regional_mapping')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'regional_mapping'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-emerald-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Regional &amp; Country Mapping</span>
            </button>

            {/* 6. Categories & Subcategories */}
            <button
              id="cpanel-ops-categories-btn"
              onClick={() => setOpsSubTab('categories')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'categories'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-indigo-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tags className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span>Categories &amp; Subcategories</span>
            </button>

            {/* 7. Story Categories */}
            <button
              id="cpanel-ops-story-categories-btn"
              onClick={() => setOpsSubTab('story_categories')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'story_categories'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-purple-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tags className="w-3.5 h-3.5 shrink-0 text-purple-400" />
              <span>Story Categories</span>
            </button>

            {/* 8. Content Queue */}
            <button
              id="cpanel-ops-content-queue-btn"
              onClick={() => setOpsSubTab('content_queue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'content_queue'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Content Queue</span>
              {(pendingJobs.length + pendingNews.length) > 0 && (
                <span className="ml-1 bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {pendingJobs.length + pendingNews.length}
                </span>
              )}
            </button>

            {/* 9. Reset */}
            <button
              id="cpanel-ops-system-reset-btn"
              onClick={() => setOpsSubTab('system_reset')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                opsSubTab === 'system_reset'
                  ? 'bg-rose-600 text-white font-black shadow'
                  : 'text-rose-400 hover:text-white hover:bg-rose-950/40 border border-rose-500/20'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>Reset</span>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex flex-wrap items-center gap-2 max-w-full w-full">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              HR &amp; People:
            </span>

            {/* HRMS System */}
            <button
              id="cpanel-hr-hrms-btn"
              onClick={() => setHrSubTab('hrms')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                hrSubTab === 'hrms'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>HR &amp; HRMS System</span>
            </button>

            {/* Account Safeguard (Level 6 to 8 & HR Only) */}
            <button
              id="cpanel-hr-safeguard-btn"
              onClick={() => setHrSubTab('safeguard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                hrSubTab === 'safeguard'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-500/20'
              }`}
              title="Employee Offboarding & Data Safeguard Lifecycle (Level 6-8 & HR Only)"
            >
              <UserX className="w-3.5 h-3.5 shrink-0 text-current" />
              <span>Account Safeguard &amp; Offboarding (L6-L8 &amp; HR)</span>
            </button>

            {/* Role Switch & IAM Governance */}
            <button
              id="cpanel-hr-roles-btn"
              onClick={() => setHrSubTab('roles')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                hrSubTab === 'roles'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-indigo-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex flex-wrap items-center gap-2 max-w-full w-full">
            {/* Unified Credit Management System (CMS) */}
            <button
              id="cpanel-fin-cms-btn"
              onClick={() => setFinSubTab('credit_management')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                finSubTab === 'credit_management'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Credit Management System (CMS)</span>
            </button>

            {/* Regional Cash Flow */}
            <button
              id="cpanel-fin-cashflow-btn"
              onClick={() => setFinSubTab('cash_flow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                finSubTab === 'cash_flow'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 shrink-0" />
              <span>Regional Cash Flow</span>
            </button>

            {/* Sales CRM */}
            <button
              id="cpanel-fin-sales-btn"
              onClick={() => setFinSubTab('crm_sales')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                finSubTab === 'crm_sales'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Commercial Sales (CRM)</span>
            </button>

            {/* Centralized Pricing Matrix */}
            <button
              id="cpanel-fin-pricing-btn"
              onClick={() => setFinSubTab('pricing_matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                finSubTab === 'pricing_matrix'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Coins className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Centralized Pricing Matrix</span>
            </button>

            {/* Commission Desk */}
            <button
              id="cpanel-fin-commissions-btn"
              onClick={() => setFinSubTab('commission_desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                finSubTab === 'commission_desk'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-emerald-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Commission Desk</span>
            </button>

            {/* Credit Transparency */}
            <button
              id="cpanel-fin-transparency-btn"
              onClick={() => setFinSubTab('credit_transparency')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                finSubTab === 'credit_transparency'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-sky-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0 text-sky-400" />
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
            <div className="space-y-6">
              {/* Feedback Alert Toast */}
              {pricingFeedbackMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between shadow-xl animate-in fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-medium">{pricingFeedbackMessage}</span>
                  </div>
                  <button
                    onClick={() => setPricingFeedbackMessage(null)}
                    className="text-emerald-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Sub-toggle Header: Multi-Country/Regional vs Action Debit Matrix */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setPricingActiveView('REGIONAL_RULES')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                      pricingActiveView === 'REGIONAL_RULES'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Multi-Country &amp; Regional Pricing Matrix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPricingActiveView('PORTAL_ACTIONS')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                      pricingActiveView === 'PORTAL_ACTIONS'
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Portal Action Debit Rules</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                      canEditPricing
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {canEditPricing ? 'L7/L8 Super Admin Clearance Active' : 'Read Only (L7/L8 Clearance Required)'}
                  </span>
                </div>
              </div>

              {/* VIEW 1: MULTI-COUNTRY & REGIONAL PRICING ENGINE */}
              {pricingActiveView === 'REGIONAL_RULES' && (
                <div className="space-y-6">
                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* KPI 1: Global Default Baseline Rate */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold uppercase tracking-wider">Global Default Fallback Rate</span>
                        <Globe className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-black text-amber-400 font-mono">
                          {globalDefaultRate}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Credits / Location / Day</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Default baseline fee charged automatically when a user targets a country or territory lacking an admin override.
                      </p>
                      {canEditPricing && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTempGlobalRate(globalDefaultRate);
                              setShowGlobalRateModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Global Baseline Rate</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* KPI 2: Configured Locations Count */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold uppercase tracking-wider">Configured Pricing Rules</span>
                        <MapPin className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex items-baseline space-x-3">
                        <span className="text-3xl font-black text-white font-mono">
                          {regionalPricingList.filter((r) => r.location_type !== 'GLOBAL_DEFAULT').length}
                        </span>
                        <span className="text-xs text-emerald-400 font-semibold font-mono">
                          ({regionalPricingList.filter((r) => r.location_type === 'COUNTRY').length} Countries,{' '}
                          {regionalPricingList.filter((r) => r.location_type === 'REGION').length} Regional Corridors)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Custom tariffs calibrated for high-density sovereign airspaces, regional federations, and international corridors.
                      </p>
                    </div>

                    {/* KPI 3: Dynamic Calculation & Regional Override Logic */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold uppercase tracking-wider">Real-time Calculation Engine</span>
                        <ShieldCheck className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-1.5 text-emerald-300 font-mono text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Additive Sum: Multi-country selections add dynamically</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-amber-300 font-mono text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Regional Override: Broad corridor zeroes covered countries</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-sky-300 font-mono text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span>No Double-Charging: Concurrency guard enforces strict totals</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toolbar & Data Table Section */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center space-x-2">
                          <span>Sovereign &amp; Regional Credit Pricing Matrix</span>
                          <span className="text-xs font-mono font-normal text-slate-400">
                            ({regionalPricingList.length} Total Rules)
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Manage sovereign territory credit costs. When a user selects multiple countries or flight regions, rates calculate live before checkout.
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          disabled={!canEditPricing}
                          onClick={handleOpenAddRule}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                            canEditPricing
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Pricing Rule</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={regionalSearchQuery}
                          onChange={(e) => setRegionalSearchQuery(e.target.value)}
                          placeholder="Search location name, sovereign code (e.g. US, GB, APAC), or notes..."
                          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={regionalFilterType}
                          onChange={(e) => setRegionalFilterType(e.target.value as any)}
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                        >
                          <option value="ALL">All Types</option>
                          <option value="COUNTRY">Countries Only</option>
                          <option value="REGION">Regional Corridors Only</option>
                        </select>

                        <button
                          type="button"
                          onClick={refreshRegionalPricing}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Refresh pricing table"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Location Name &amp; Code</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Credit Cost (Per Day)</th>
                            <th className="py-3 px-4">Coverage &amp; Regional Overrides</th>
                            <th className="py-3 px-4">Last Updated</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 font-sans">
                          {regionalPricingList
                            .filter((item) => {
                              if (regionalFilterType !== 'ALL' && item.location_type !== regionalFilterType) {
                                return false;
                              }
                              if (regionalSearchQuery) {
                                const q = regionalSearchQuery.toLowerCase();
                                return (
                                  item.location_name.toLowerCase().includes(q) ||
                                  item.location_code.toLowerCase().includes(q) ||
                                  (item.notes && item.notes.toLowerCase().includes(q))
                                );
                              }
                              return true;
                            })
                            .map((rule) => {
                              const isDefault = rule.location_type === 'GLOBAL_DEFAULT' || rule.is_default;
                              return (
                                <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                                  {/* Location Name & Code */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                                          isDefault
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                            : rule.location_type === 'REGION'
                                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        }`}
                                      >
                                        {rule.location_code}
                                      </span>
                                      <span className="font-bold text-white text-xs">{rule.location_name}</span>
                                    </div>
                                    {rule.notes && (
                                      <p className="text-[10px] text-slate-400 mt-0.5 italic">{rule.notes}</p>
                                    )}
                                  </td>

                                  {/* Type */}
                                  <td className="py-3 px-4 font-mono">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isDefault
                                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                          : rule.location_type === 'REGION'
                                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                          : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                      }`}
                                    >
                                      {rule.location_type === 'GLOBAL_DEFAULT'
                                        ? 'GLOBAL DEFAULT'
                                        : rule.location_type}
                                    </span>
                                  </td>

                                  {/* Credit Cost */}
                                  <td className="py-3 px-4 font-mono">
                                    <div className="flex items-baseline space-x-1.5">
                                      <span className="text-base font-black text-amber-400">
                                        {rule.credit_cost}
                                      </span>
                                      <span className="text-[11px] text-slate-400">Credits/Day</span>
                                    </div>
                                  </td>

                                  {/* Coverage & Regional Overrides */}
                                  <td className="py-3 px-4 text-[11px] text-slate-300">
                                    {rule.countries_covered && rule.countries_covered.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        <span className="text-purple-300 font-semibold">Overrides:</span>
                                        {rule.countries_covered.map((c) => (
                                          <span
                                            key={c}
                                            className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300"
                                          >
                                            {c === '*' ? 'Global Airspace' : c}
                                          </span>
                                        ))}
                                      </div>
                                    ) : isDefault ? (
                                      <span className="text-slate-400 font-mono text-[10px]">
                                        Applies to any unconfigured sovereign nation
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-mono text-[10px]">
                                        Single sovereign airspace
                                      </span>
                                    )}
                                  </td>

                                  {/* Last Updated */}
                                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                    <div>{rule.updated_at ? new Date(rule.updated_at).toLocaleDateString() : 'Baseline'}</div>
                                    <div className="text-[10px] text-slate-400">{rule.updated_by || 'System Sovereign'}</div>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <button
                                        type="button"
                                        disabled={!canEditPricing}
                                        onClick={() => handleOpenEditRule(rule)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                                          canEditPricing
                                            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer border border-slate-700'
                                            : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                                        }`}
                                        title="Edit credit rate"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Edit</span>
                                      </button>

                                      {!isDefault && (
                                        <button
                                          type="button"
                                          disabled={!canEditPricing}
                                          onClick={() => handleDeleteRegionalRule(rule)}
                                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center transition-colors ${
                                            canEditPricing
                                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-pointer'
                                              : 'bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                                          }`}
                                          title="Delete pricing rule"
                                        >
                                          <Trash2 className="w-3 h-3" />
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
                  </div>
                </div>
              )}

              {/* VIEW 2: PORTAL ACTION DEBIT RULES (Centralized action table) */}
              {pricingActiveView === 'PORTAL_ACTIONS' && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Centralized Credit Debit Matrix</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Configure automatic credit deductions per marketing, job posting, and boutique lead action across all portals.
                      </p>
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

              {/* MODAL 1: ADD / EDIT REGIONAL PRICING RULE */}
              {showAddEditRuleModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
                          <Globe className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                            {editingRuleId ? 'Edit Location Pricing Rule' : 'Configure New Location Pricing Rule'}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Set custom credit tariffs per sovereign nation or flight region corridor.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddEditRuleModal(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {modalFeedback && (
                      <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{modalFeedback}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveRegionalRule} className="space-y-4">
                      {/* 1. Location Type Dropdown */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Location Type
                        </label>
                        <select
                          value={modalLocationType}
                          onChange={(e) => {
                            const val = e.target.value as 'COUNTRY' | 'REGION';
                            setModalLocationType(val);
                            if (val === 'COUNTRY') {
                              setModalLocationCode(COUNTRIES[0]?.code || 'US');
                              setModalLocationName(COUNTRIES[0]?.name || 'United States');
                            } else {
                              setModalLocationCode(AVIATION_REGIONS[0]?.code || 'APAC');
                              setModalLocationName(AVIATION_REGIONS[0]?.name || 'Asia-Pacific Corridor');
                            }
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500 font-semibold"
                        >
                          <option value="COUNTRY">Country (Single Sovereign Airspace)</option>
                          <option value="REGION">Region (Broad Flight Corridor)</option>
                        </select>
                      </div>

                      {/* 2. Location Search / Select */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Select {modalLocationType === 'COUNTRY' ? 'Country' : 'Region Corridor'}
                        </label>
                        {modalLocationType === 'COUNTRY' ? (
                          <select
                            value={modalLocationCode}
                            onChange={(e) => {
                              const found = COUNTRIES.find((c) => c.code === e.target.value);
                              setModalLocationCode(e.target.value);
                              if (found) setModalLocationName(found.name);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.name} ({c.code})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={modalLocationCode}
                            onChange={(e) => {
                              const found = AVIATION_REGIONS.find((r) => r.code === e.target.value);
                              setModalLocationCode(e.target.value);
                              if (found) setModalLocationName(found.name);
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                          >
                            {AVIATION_REGIONS.map((r) => (
                              <option key={r.code} value={r.code}>
                                {r.flag} {r.name} ({r.code})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Custom Location Code & Name override display */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-400">
                            Location Code
                          </label>
                          <input
                            type="text"
                            value={modalLocationCode}
                            onChange={(e) => setModalLocationCode(e.target.value.toUpperCase())}
                            className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono uppercase"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-400">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={modalLocationName}
                            onChange={(e) => setModalLocationName(e.target.value)}
                            className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                            required
                          />
                        </div>
                      </div>

                      {/* 3. Credit Amount Input (Unlimited — no upper cap) */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                          <span>Credit Cost (Daily Rate)</span>
                          <span className="text-[10px] text-amber-400 font-mono">Credits / day (Unlimited)</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={modalCreditCost}
                          onChange={(e) => setModalCreditCost(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-amber-400 outline-none focus:border-amber-500"
                          required
                        />
                        <p className="text-[10px] text-slate-400">
                          Unlimited custom credit rate — users selecting this location will be charged exactly this credit amount per day multiplied by duration.
                        </p>
                      </div>

                      {/* Notes / Description */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Administrative Notes
                        </label>
                        <input
                          type="text"
                          value={modalNotes}
                          onChange={(e) => setModalNotes(e.target.value)}
                          placeholder="e.g. High-density commercial charter corridor"
                          className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowAddEditRuleModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg cursor-pointer"
                        >
                          Save Pricing Rule
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL 2: EDIT GLOBAL DEFAULT BASELINE RATE */}
              {showGlobalRateModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
                          <Globe className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                            Calibrate Global Default Rate
                          </h3>
                          <p className="text-xs text-slate-400">
                            Fallback rate for all unconfigured sovereign territories.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowGlobalRateModal(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveGlobalDefaultRate} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                          <span>Global Default Fallback (Credits / Day)</span>
                          <span className="text-[10px] text-amber-400 font-mono">Unlimited</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={tempGlobalRate}
                          onChange={(e) => setTempGlobalRate(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-base font-mono font-black text-amber-400 outline-none focus:border-amber-500"
                          required
                        />
                        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                          Unlimited baseline configuration — any country selected by a user that does not have an admin-defined tariff rule will automatically charge this default rate.
                        </p>
                      </div>

                      <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowGlobalRateModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg cursor-pointer"
                        >
                          Apply Default Rate
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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

          {finSubTab === 'credit_management' && (
            <CreditManagementSystemDesk
              activeAdminUser={activeAdminUser}
              currentUser={currentUser}
              onRefreshAll={onRefreshAll}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTOR: PUBLICATION                                                    */}
      {/* ========================================================================= */}
      {mainSector === 'publication' && (
        <div className="space-y-5">
          {/* Publication Sub-Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex flex-wrap items-center gap-2 max-w-full w-full">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Publication:
            </span>

            {/* FlashNews & Blink Feed Desk */}
            <button
              id="cpanel-pub-flashnews-btn"
              onClick={() => setPubSubTab('flashnews_desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                pubSubTab === 'flashnews_desk'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>FlashNews &amp; Blink Feed Desk</span>
            </button>

            {/* Content Verification Queue */}
            <button
              id="cpanel-pub-content-btn"
              onClick={() => setPubSubTab('content_desk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                pubSubTab === 'content_desk'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 shrink-0" />
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex flex-wrap items-center gap-2 max-w-full w-full">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Reports &amp; Analytics:
            </span>

            {/* Executive Report Generator */}
            <button
              id="cpanel-rep-exec-btn"
              onClick={() => setRepSubTab('executive_reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                repSubTab === 'executive_reports'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Executive Report Generator</span>
            </button>

            {/* Quantitative Campaign Analytics */}
            <button
              id="cpanel-rep-quant-btn"
              onClick={() => setRepSubTab('quant_analytics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                repSubTab === 'quant_analytics'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-sky-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0 text-sky-400" />
              <span>Quantitative Campaign Analytics</span>
            </button>

            {/* Audit Logs */}
            <button
              id="cpanel-rep-audit-btn"
              onClick={() => setRepSubTab('audit_logs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                repSubTab === 'audit_logs'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
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
              isAdmin={true}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex flex-wrap items-center gap-2 max-w-full w-full">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 shrink-0">
              Security &amp; Governance:
            </span>

            {/* RBAC Permissions & Single-Session Guard */}
            <button
              id="cpanel-sec-rbac-btn"
              onClick={() => setSecSubTab('rbac')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                secSubTab === 'rbac'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>RBAC Permissions &amp; Single-Session Guard</span>
            </button>

            {/* Active Module Controls (Launchpad) */}
            <button
              id="cpanel-sec-launchpad-btn"
              onClick={() => setSecSubTab('launch_matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-normal break-words text-center ${
                secSubTab === 'launch_matrix'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
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

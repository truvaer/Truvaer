import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  CreditCard,
  History,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Briefcase,
  Megaphone,
  Coins,
  Plane,
  Crown,
  Headphones,
  Key,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Eye,
  Sliders,
  Send,
  FileText,
  Lock,
  Unlock,
  TrendingUp,
  Package,
  Activity,
  LayoutGrid,
  Ban,
  ArrowRightLeft,
  Landmark,
  Tags,
  PauseCircle,
  ShieldAlert,
  MoreVertical,
  RotateCcw,
  FileCode,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { BankVerificationAuditModal } from '../components/BankVerificationAuditModal';
import {
  AdminUser,
  AdminDepartment,
  AdminLevel,
  BusinessProfile,
  RegularUser,
  ServiceListing,
  WalletDebitRequest,
  PromotionApprovalRequest,
  PublicationStatus,
  ApiLogEntry,
} from '../types';
import { ADMIN_DEPARTMENTS, ADMIN_LEVELS_META, maskPhoneNumber, parseEmailForMasking } from '../utils/privacyAndMasking';
import { AdminRBACControlPanel } from './AdminRBACControlPanel';
import { CRMPortal } from './CRMPortal';
import { StoresPortal } from '../marketing/StoresPortal';
import { AdminActivityFeed } from './AdminActivityFeed';
import { AdminBroadcastModal } from './AdminBroadcastModal';
import { AdminServicesApprovalDesk } from './AdminServicesApprovalDesk';
import { RegionalCashFlowAnalytics } from './RegionalCashFlowAnalytics';
import { AdminModuleDirectory } from './AdminModuleDirectory';
import { AdminPMSDesk } from './AdminPMSDesk';
import { ApprovedTaxonomyDesk } from './ApprovedTaxonomyDesk';
import { AdminModerationDesk } from './AdminModerationDesk';
import { HumanResourceHRMSModule } from './HumanResourceHRMSModule';
import { CentralizedCreditDebitMatrix } from './CentralizedCreditDebitMatrix';

interface AdminERPPlatformProps {
  onRefreshAll?: () => void;
  onSelectBusinessToView?: (biz: BusinessProfile) => void;
  onOpenProfileMenu?: () => void;
  onOpenApiInspector?: () => void;
  onOpenWallet?: () => void;
}

export const AdminERPPlatform: React.FC<AdminERPPlatformProps> = ({
  onRefreshAll,
  onSelectBusinessToView,
  onOpenProfileMenu,
  onOpenApiInspector,
  onOpenWallet,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'human_resource'
    | 'pms'
    | 'taxonomy'
    | 'cash_flow'
    | 'module_directory'
    | 'activity_feed'
    | 'control_panel'
    | 'services_approval'
    | 'broadcast'
    | 'crm'
    | 'commissions'
    | 'stores'
    | 'accounts'
    | 'transactions'
    | 'api_inspector'
    | 'publications'
    | 'moderation_reports'
    | 'debit_approvals'
    | 'hierarchy'
    | 'promotion_approvals'
    | 'logs'
    | 'settings'
  >('dashboard');

  const [dashboardSection, setDashboardSection] = useState<'finance_cashflow' | 'module_directory' | 'approvals_ops'>('finance_cashflow');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Active Admin Persona for simulating actions & approvals
  const [allAdmins, setAllAdmins] = useState<AdminUser[]>([]);
  const [activeAdmin, setActiveAdmin] = useState<AdminUser | null>(null);

  // Data states
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [debitRequests, setDebitRequests] = useState<WalletDebitRequest[]>([]);
  const [promotionRequests, setPromotionRequests] = useState<PromotionApprovalRequest[]>([]);
  const [globalSettings, setGlobalSettings] = useState<{ phoneUnlockCreditCost: number; unlockValidityDays: number }>({
    phoneUnlockCreditCost: 50,
    unlockValidityDays: 30,
  });

  // Modal / Action states
  const [showAddBusinessModal, setShowAddBusinessModal] = useState(false);
  const [showEditBusinessModal, setShowEditBusinessModal] = useState<BusinessProfile | null>(null);
  const [bankAuditBiz, setBankAuditBiz] = useState<BusinessProfile | null>(null);
  const [deactivateTargetBiz, setDeactivateTargetBiz] = useState<BusinessProfile | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('Account Deactivated by Administration');
  const [showInitiateDebitModal, setShowInitiateDebitModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState<AdminUser | null>(null);
  const [showDemoteModal, setShowDemoteModal] = useState<AdminUser | null>(null);
  const [editingListing, setEditingListing] = useState<ServiceListing | null>(null);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter states
  const [accountSearch, setAccountSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('All');
  const [publicationFilter, setPublicationFilter] = useState<string>('All');
  const [userTxSearch, setUserTxSearch] = useState('');

  // Account Master (User Management Module) UI & Filter States
  const [accountMasterTab, setAccountMasterTab] = useState<'corporate_accounts' | 'standard_users' | 'ops_permissions'>('corporate_accounts');
  const [corpValidationRouting, setCorpValidationRouting] = useState<'ALL' | 'VALIDATED' | 'PENDING'>('ALL');
  const [corpAuditFilter, setCorpAuditFilter] = useState<'ALL' | 'AUDITED' | 'PENDING_AUDIT'>('ALL');
  const [corpLockFilter, setCorpLockFilter] = useState<'ALL' | 'UNLOCKED' | 'SOFT_LOCKED' | 'HARD_LOCKED'>('ALL');
  const [corpStateFilter, setCorpStateFilter] = useState<'ALL' | 'ACTIVE' | 'DEACTIVATED'>('ALL');
  const [corpDebitFilter, setCorpDebitFilter] = useState<'ALL' | 'DEBIT_ENABLED' | 'DEBIT_DISABLED'>('ALL');
  const [openActionMenuBizId, setOpenActionMenuBizId] = useState<string | null>(null);

  // New Standard User creation modal state
  const [showAddStandardUserModal, setShowAddStandardUserModal] = useState(false);
  const [newStandardUserForm, setNewStandardUserForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '+91 ',
    city: 'Hyderabad',
    country_code: 'IN',
    password: 'User@123',
  });

  // Form states: New Business
  const [newBizForm, setNewBizForm] = useState({
    organization_name: '',
    owner_name: '',
    category: 'Private Air Charter',
    business_email: '',
    phone_number: '+91 ',
    registration_number: '',
    nature_of_business: 'Executive Aviation Charter',
    physical_location: '',
  });

  // Form states: Initiate Debit
  const [debitForm, setDebitForm] = useState({
    business_id: '',
    amount: 100,
    reason: '',
  });

  // Form states: Add Admin
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    password: 'admin',
    department: 'Operations' as AdminDepartment,
    level: 1 as AdminLevel,
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER',
    level_title: '',
    reporting_manager_id: '',
  });

  // Form states: Submit Promotion Request
  const [promotionForm, setPromotionForm] = useState({
    target_level: 1 as AdminLevel,
    requested_permission: '',
    reason: '',
  });

  // Form states: Submit Demotion Request (Requirement: add promotion and demotion option to downgrade level)
  const [demoteForm, setDemoteForm] = useState({
    target_level: 0 as AdminLevel,
    target_title: '',
    reason: '',
  });

  // Rejection modal state (In-app modal replacing window.prompt for reliable Super Admin action)
  const [rejectModalData, setRejectModalData] = useState<{
    id: string;
    candidateName: string;
    elevation: string;
    department: string;
    isTopManagement: boolean;
  } | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // API Inspector & Treasury Desk States
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [apiFilterMethod, setApiFilterMethod] = useState<string>('ALL');
  const [apiLogSearch, setApiLogSearch] = useState<string>('');

  const loadAllData = () => {
    const loadedAdmins = db.getAdminUsers();
    setAllAdmins(loadedAdmins);
    if (!activeAdmin && loadedAdmins.length > 0) {
      // Default to Super Admin (B Aditya Narayana L8)
      const superAdmin = loadedAdmins.find((a) => a.role === 'SUPER_ADMIN') || loadedAdmins[0];
      setActiveAdmin(superAdmin);
    } else if (activeAdmin) {
      const refreshedActive = loadedAdmins.find((a) => a.admin_id === activeAdmin.admin_id);
      if (refreshedActive) setActiveAdmin(refreshedActive);
    }

    setRegularUsers(db.getRegularUsers());
    setBusinesses(db.getBusinesses());
    setListings(db.getServiceListings());
    setDebitRequests(db.getWalletDebitRequests());
    setPromotionRequests(db.getPromotionRequests());
    setGlobalSettings(db.getGlobalSettings());
    setApiLogs(db.getApiLogs());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // --- Handlers: Business Account CRUD (Condition 7) ---
  const handleAddBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizForm.organization_name.trim()) {
      showToast('Organization name is required.', 'error');
      return;
    }
    const res = db.adminAddBusiness(newBizForm);
    if (res.success) {
      showToast(res.message, 'success');
      setShowAddBusinessModal(false);
      setNewBizForm({
        organization_name: '',
        owner_name: '',
        category: 'Private Air Charter',
        business_email: '',
        phone_number: '+91 ',
        registration_number: '',
        nature_of_business: 'Executive Aviation Charter',
        physical_location: '',
      });
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    }
  };

  const handleEditBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditBusinessModal) return;
    const res = db.adminModifyBusiness(showEditBusinessModal.business_id, showEditBusinessModal);
    if (res.success) {
      showToast(res.message, 'success');
      setShowEditBusinessModal(null);
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    }
  };

  const handleConfirmDeactivateERP = () => {
    if (!deactivateTargetBiz) return;
    const res = db.adminDeactivateBusinessAccount(
      deactivateTargetBiz.business_id,
      activeAdmin?.name || 'Operations Administrator',
      activeAdmin?.role || 'ADMIN',
      deactivateReason
    );
    if (res.success) {
      showToast(
        `Account deactivated. All remaining balance of ₹${res.transferredAmount.toLocaleString()} has been transferred back to ${deactivateTargetBiz.bank_name || 'bank account'} (${deactivateTargetBiz.bank_account_number_masked || '••••8899'}). Reference UTR: ${res.payoutRef}`,
        'success'
      );
      setDeactivateTargetBiz(null);
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleDeleteBusiness = (businessId: string, orgName: string) => {
    if (!window.confirm(`Are you sure you want to delete business account "${orgName}" and all associated listings? This action cannot be undone.`)) {
      return;
    }
    const res = db.adminDeleteBusiness(businessId);
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    }
  };

  // --- Handlers: Publication Controls (Condition 1 & Department Permissions) ---
  const handleSetPublicationStatus = (listingId: string, status: PublicationStatus) => {
    if (!activeAdmin) return;

    // Requirement 3: Department-wise permissions - Finance, Operations, and Senior Management can edit & approve business listings
    const authorizedDepartments: AdminDepartment[] = ['Finance', 'Operations', 'Senior Management Team'];
    const isAuthorized = (activeAdmin.department && authorizedDepartments.includes(activeAdmin.department)) || (activeAdmin.level ?? 0) >= 4;
    if (!isAuthorized) {
      showToast(
        `Department Permission Denied: Staff in ${activeAdmin.department || 'General Admin'} cannot approve or alter publication status. Finance, Operations, or Senior Management clearance required.`,
        'error'
      );
      return;
    }

    let reason: string | undefined = undefined;
    if (status === 'RESTRICTED') {
      const promptRes = window.prompt('Please enter the administrative reason for restricting this publication:', 'Non-compliance with verified aviation documentation');
      if (promptRes === null) return;
      reason = promptRes;
    }

    const res = db.adminSetPublicationStatus(listingId, status, activeAdmin.admin_id, reason);
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    }
  };

  const handleDeleteListing = (listingId: string, name: string) => {
    if (!activeAdmin) return;

    // Department clearance
    const authorizedDepartments: AdminDepartment[] = ['Finance', 'Operations', 'Senior Management Team'];
    if ((!activeAdmin.department || !authorizedDepartments.includes(activeAdmin.department)) && (activeAdmin.level ?? 0) < 4) {
      showToast(`Permission Denied: Only Finance, Operations, or L4+ Managers can delete listings.`, 'error');
      return;
    }

    if (!window.confirm(`Permanently remove publication "${name}" from directory?`)) return;
    const res = db.adminDeleteListing(listingId, activeAdmin.admin_id);
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    }
  };

  const handleSaveListingDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing || !activeAdmin) return;

    // Requirement 3: Department-wise permissions - Finance, Operations, and Senior Management can edit business listings
    const authorizedDepartments: AdminDepartment[] = ['Finance', 'Operations', 'Senior Management Team'];
    const isAuthorized = (activeAdmin.department && authorizedDepartments.includes(activeAdmin.department)) || (activeAdmin.level ?? 0) >= 4;
    if (!isAuthorized) {
      showToast(
        `Department Permission Denied: Staff in ${activeAdmin.department || 'General Admin'} cannot edit business listings. Finance, Operations, or Senior Management clearance required.`,
        'error'
      );
      return;
    }

    const res = db.adminModifyListing(editingListing.id, editingListing, activeAdmin.admin_id);
    if (res.success) {
      showToast(res.message, 'success');
      setEditingListing(null);
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    }
  };

  // --- Handlers: 2-Stage Wallet Debit Workflow (Condition 6) ---
  const handleInitiateDebitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdmin) return;
    if (!debitForm.business_id) {
      showToast('Please select a business account.', 'error');
      return;
    }
    if (debitForm.amount <= 0) {
      showToast('Debit amount must be greater than 0 credits.', 'error');
      return;
    }

    const res = db.createWalletDebitRequest(
      debitForm.business_id,
      Number(debitForm.amount),
      debitForm.reason || 'Administrative Operations Debit',
      `${activeAdmin.name} (${activeAdmin.level_title || activeAdmin.role})`
    );

    if (res.success) {
      showToast(res.message, 'success');
      setShowInitiateDebitModal(false);
      setDebitForm({ business_id: '', amount: 100, reason: '' });
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    }
  };

  const handleApproveDebitStage1 = (requestId: string) => {
    if (!activeAdmin) return;
    const res = db.approveDebitStage1(requestId, activeAdmin);
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleApproveDebitStage2 = (requestId: string) => {
    if (!activeAdmin) return;
    const res = db.approveDebitStage2(requestId, activeAdmin);
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRejectDebit = (requestId: string) => {
    if (!activeAdmin) return;
    const reason = window.prompt('Please provide a rejection justification:', 'Insufficient operational documentation');
    if (reason === null) return;
    const res = db.rejectDebitRequest(requestId, activeAdmin, reason);
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    }
  };

  // --- Handlers: Department Hierarchy & 2-Level Approvals (Conditions 8 & 9) ---
  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm.name.trim() || !newAdminForm.email.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }

    const mgr = allAdmins.find((a) => a.admin_id === newAdminForm.reporting_manager_id);

    const res = db.addAdminUser({
      name: newAdminForm.name.trim(),
      email: newAdminForm.email.trim(),
      password: newAdminForm.password || 'admin',
      department: newAdminForm.department,
      level: Number(newAdminForm.level) as AdminLevel,
      level_title: newAdminForm.level_title || `L${newAdminForm.level} - Officer`,
      role: newAdminForm.role,
      reporting_manager_id: newAdminForm.reporting_manager_id || undefined,
      reporting_manager_name: mgr ? mgr.name : undefined,
      permissions: ['STANDARD_OPERATIONS', `DEPT_${newAdminForm.department.toUpperCase().replace(/\s+/g, '_')}`, 'PORTAL_ACCESS'],
    });

    if (res.success) {
      showToast(res.message, 'success');
      setShowAddAdminModal(false);
      setNewAdminForm({
        name: '',
        email: '',
        password: 'admin',
        department: 'Operations',
        level: 1,
        role: 'ADMIN',
        level_title: '',
        reporting_manager_id: '',
      });
      loadAllData();
    }
  };

  const handleSubmitPromotionRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPromoteModal) return;

    const res = db.submitPromotionRequest(
      showPromoteModal.admin_id,
      Number(promotionForm.target_level) as AdminLevel,
      promotionForm.requested_permission || `Elevated Level ${promotionForm.target_level} Operational Clearance`,
      promotionForm.reason || 'Demonstrated high competence and operational merit'
    );

    if (res.success) {
      showToast(res.message, 'success');
      setShowPromoteModal(null);
      setPromotionForm({ target_level: 1, requested_permission: '', reason: '' });
      loadAllData();
    }
  };

  const handleSubmitDemote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDemoteModal) return;
    const actor = activeAdmin?.name || 'Central Governance Desk';
    const targetMeta = ADMIN_LEVELS_META[demoteForm.target_level];
    const targetTitle = demoteForm.target_title || targetMeta?.title || `Level ${demoteForm.target_level} Officer`;
    const res = db.demoteAdminLevel(
      showDemoteModal.admin_id,
      demoteForm.target_level,
      targetTitle,
      demoteForm.reason || 'Operational governance adjustment',
      actor
    );
    if (res.success) {
      showToast(res.message, 'success');
      setShowDemoteModal(null);
      setDemoteForm({ target_level: 0, target_title: '', reason: '' });
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleApprovePromotionLevel1 = (requestId: string) => {
    if (!activeAdmin) return;
    const res = db.approvePromotionLevel1(requestId, activeAdmin);
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleApprovePromotionLevel2 = (requestId: string) => {
    if (!activeAdmin) return;
    const res = db.approvePromotionLevel2(requestId, activeAdmin);
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRejectPromotion = (requestId: string) => {
    if (!activeAdmin) return;
    const p = promotionRequests.find((r) => r.id === requestId);
    if (!p) return;
    const isTopManagement =
      isSuperAdmin ||
      (activeAdmin.level ?? 0) >= 7 ||
      activeAdmin.role === 'SUPER_ADMIN';

    setRejectModalData({
      id: p.id,
      candidateName: p.admin_name,
      elevation: `Level ${p.current_level} → Level ${p.target_level}`,
      department: p.department,
      isTopManagement,
    });
    setRejectionReasonInput(
      isTopManagement
        ? 'Top management has rejected the promotion.'
        : 'Prerequisites or training modules pending'
    );
  };

  const handleConfirmRejection = () => {
    if (!rejectModalData || !activeAdmin) return;
    const res = db.rejectPromotionRequest(
      rejectModalData.id,
      activeAdmin,
      rejectionReasonInput.trim() || undefined
    );
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
      setRejectModalData(null);
      setRejectionReasonInput('');
    } else {
      showToast(res.message, 'error');
    }
  };

  // --- Handlers: Settings (Condition 5) ---
  const handleUpdateGlobalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateGlobalSettings({
      phoneUnlockCreditCost: Number(globalSettings.phoneUnlockCreditCost),
      unlockValidityDays: Number(globalSettings.unlockValidityDays),
    });
    if (res.success) {
      showToast(res.message, 'success');
      loadAllData();
    }
  };

  // Calculations for KPI cards
  const totalBusinessCredits = businesses.reduce(
    (acc, b) => acc + (b.corporate_wallet?.credit_balance ?? 0),
    0
  );
  const pendingPublications = listings.filter(
    (l) => l.publication_status === 'PENDING_APPROVAL' || l.publication_status === 'RESTRICTED'
  ).length;
  const pendingDebitsCount = debitRequests.filter(
    (r) => r.status === 'PENDING_STAGE_1' || r.status === 'PENDING_STAGE_2'
  ).length;
  const pendingPromotionsCount = promotionRequests.filter(
    (p) => p.overall_status === 'PENDING_LEVEL_1' || p.overall_status === 'PENDING_LEVEL_2'
  ).length;

  // Filter accounts
  const filteredBusinesses = businesses.filter((b) => {
    const q = accountSearch.toLowerCase();
    return (
      b.organization_name.toLowerCase().includes(q) ||
      b.registration_number.toLowerCase().includes(q) ||
      b.business_email.toLowerCase().includes(q)
    );
  });

  const filteredRegularUsers = regularUsers.filter((u) => {
    const q = accountSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q)
    );
  });

  // Filter listings
  const filteredListings = listings.filter((l) => {
    if (publicationFilter !== 'All' && l.publication_status !== publicationFilter) {
      return false;
    }
    return true;
  });

  // Filter Admin Personnel
  const filteredAdmins = allAdmins.filter((a) => {
    if (selectedDeptFilter !== 'All' && a.department !== selectedDeptFilter) return false;
    if (selectedLevelFilter !== 'All' && a.level !== Number(selectedLevelFilter)) return false;
    return true;
  });

  // Department-specific & Granular RBAC Permissions (Super Admin has universal, unrestricted permissions)
  const isSuperAdmin =
    !activeAdmin ||
    activeAdmin.role === 'SUPER_ADMIN' ||
    activeAdmin.admin_id === 'admin_super_admin' ||
    activeAdmin.admin_id === 'admin_super_01' ||
    activeAdmin.department === 'Senior Management Team' ||
    (activeAdmin.level ?? 0) >= 8 ||
    activeAdmin.level_title?.toLowerCase().includes('chairman') ||
    activeAdmin.level_title?.toLowerCase().includes('super admin') ||
    activeAdmin.level_title?.toLowerCase().includes('managing director') ||
    activeAdmin.name?.toLowerCase().includes('chairman') ||
    activeAdmin.name?.toLowerCase().includes('aditya') ||
    activeAdmin.assigned_modules?.includes('ALL') ||
    (Array.isArray(activeAdmin.permissions) && activeAdmin.permissions.includes('ALL'));

  // Multi-department allocation from DAS (Dynamic Allocation System)
  const activeDepts = [
    activeAdmin?.department,
    ...(activeAdmin?.assigned_departments || []),
  ].filter(Boolean) as string[];

  const canAccessFinance =
    isSuperAdmin ||
    activeDepts.includes('Finance') ||
    activeAdmin?.module_permissions?.Finance?.access === 'VIEW' ||
    activeAdmin?.module_permissions?.Finance?.access === 'EDIT' ||
    activeAdmin?.module_permissions?.Finance?.access === 'FULL';

  const canAccessCommissions =
    isSuperAdmin ||
    activeDepts.includes('Finance') ||
    activeAdmin?.module_permissions?.Commissions?.access === 'VIEW' ||
    activeAdmin?.module_permissions?.Commissions?.access === 'EDIT' ||
    activeAdmin?.module_permissions?.Commissions?.access === 'FULL';

  const canAccessOps =
    isSuperAdmin ||
    activeDepts.includes('Operations') ||
    activeAdmin?.module_permissions?.Operations?.access === 'VIEW' ||
    activeAdmin?.module_permissions?.Operations?.access === 'EDIT' ||
    activeAdmin?.module_permissions?.Operations?.access === 'FULL' ||
    activeAdmin?.module_permissions?.Publications?.access === 'VIEW' ||
    activeAdmin?.module_permissions?.Publications?.access === 'EDIT' ||
    activeAdmin?.module_permissions?.Publications?.access === 'FULL';

  const canAccessCRM =
    isSuperAdmin ||
    activeDepts.includes('Sales') ||
    activeDepts.includes('Marketing') ||
    activeDepts.includes('Sales & Marketing') ||
    activeAdmin?.module_permissions?.CRM?.access === 'VIEW' ||
    activeAdmin?.module_permissions?.CRM?.access === 'EDIT' ||
    activeAdmin?.module_permissions?.CRM?.access === 'FULL';

  const canAccessStores =
    isSuperAdmin ||
    activeDepts.includes('Stores') ||
    activeAdmin?.module_permissions?.Stores?.access === 'VIEW' ||
    activeAdmin?.module_permissions?.Stores?.access === 'EDIT' ||
    activeAdmin?.module_permissions?.Stores?.access === 'FULL';

  const canAccessHierarchy = isSuperAdmin || (activeAdmin?.level ?? 0) >= 4;

  // -------------------------------------------------------------------------
  // ACCOUNT MASTER: STRICT DATA SEGREGATION, RBAC & ADDITIVE FILTERS
  // -------------------------------------------------------------------------
  const isSuperAdminGlobalViewer = isSuperAdmin;

  // 1. Decoupled Corporate Accounts Scoping & Additive Filtering
  const rbacScopedBusinesses = businesses.filter((b) => {
    if (isSuperAdminGlobalViewer) return true;
    if (canAccessFinance) return true;
    if (activeAdmin?.department === 'Operations' || canAccessOps) {
      if (activeAdmin?.assigned_regions && activeAdmin.assigned_regions.length > 0) {
        return activeAdmin.assigned_regions.includes(((b as any).operating_zone || 'APAC') as any);
      }
      return true;
    }
    return true;
  });

  const filteredCorporateAccounts = rbacScopedBusinesses.filter((b) => {
    // A. Global Search Query
    const q = accountSearch.toLowerCase().trim();
    if (q) {
      const match =
        b.organization_name.toLowerCase().includes(q) ||
        b.registration_number.toLowerCase().includes(q) ||
        b.business_email.toLowerCase().includes(q) ||
        (b.owner_name && b.owner_name.toLowerCase().includes(q)) ||
        b.business_id.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q));
      if (!match) return false;
    }

    // B. Automated Validation Routing (Validated vs Pending)
    const isValidated = b.verification_status === 'VERIFIED' && !b.is_hard_locked_by_admin;
    if (corpValidationRouting === 'VALIDATED' && !isValidated) return false;
    if (corpValidationRouting === 'PENDING' && isValidated) return false;

    // C. Audit Status Filter: All, Audited, Pending Audit
    const isAudited = b.finance_bank_verified === true || b.bank_verification_status === 'VERIFIED';
    if (corpAuditFilter === 'AUDITED' && !isAudited) return false;
    if (corpAuditFilter === 'PENDING_AUDIT' && isAudited) return false;

    // D. Lock Status Filter: All, Unlocked, Soft Locked, Hard Locked
    const isHardLocked = b.is_hard_locked_by_admin === true || b.verification_status === 'REJECTED' || b.verification_status === 'HARD_LOCKED';
    const isSoftLocked = !isHardLocked && (b.verification_status === 'IN_REVIEW' || (b.verification_status as string) === 'PENDING');
    const isUnlocked = !isHardLocked && !isSoftLocked;

    if (corpLockFilter === 'UNLOCKED' && !isUnlocked) return false;
    if (corpLockFilter === 'SOFT_LOCKED' && !isSoftLocked) return false;
    if (corpLockFilter === 'HARD_LOCKED' && !isHardLocked) return false;

    // E. Account State Filter: All, Active, Deactivated
    const isDeactivated = b.account_status === 'DEACTIVATED';
    if (corpStateFilter === 'ACTIVE' && isDeactivated) return false;
    if (corpStateFilter === 'DEACTIVATED' && !isDeactivated) return false;

    // F. Debit Status Filter: All, Debit Enabled, Debit Disabled
    const isDebitEnabled = !isDeactivated && !isHardLocked && (b.corporate_wallet?.credit_balance ?? 0) > 0;
    if (corpDebitFilter === 'DEBIT_ENABLED' && !isDebitEnabled) return false;
    if (corpDebitFilter === 'DEBIT_DISABLED' && isDebitEnabled) return false;

    return true;
  });

  // 2. Decoupled Standard Users (Strict state separation: NO corporate entities bleed in)
  const rbacScopedRegularUsers = regularUsers.filter((u) => {
    return u.role === 'USER' || !u.role;
  });

  const filteredStandardAviatorUsers = rbacScopedRegularUsers.filter((u) => {
    const q = accountSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(q) ||
      (u.city && u.city.toLowerCase().includes(q)) ||
      (u.country_code && u.country_code.toLowerCase().includes(q)) ||
      (u.phone_number && u.phone_number.includes(q))
    );
  });

  // 3. Filtered Ops Admins
  const filteredOpsAdminsList = allAdmins.filter((a) => {
    const q = accountSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.department && a.department.toLowerCase().includes(q)) ||
      (a.level_title && a.level_title.toLowerCase().includes(q)) ||
      (a.role && a.role.toLowerCase().includes(q))
    );
  });

  // Validation Counts for Routing & Filter stats
  const verifiedCorpCount = rbacScopedBusinesses.filter((b) => b.verification_status === 'VERIFIED' && !b.is_hard_locked_by_admin).length;
  const pendingCorpCount = rbacScopedBusinesses.filter((b) => b.verification_status !== 'VERIFIED' || b.is_hard_locked_by_admin).length;
  const auditedCorpCount = rbacScopedBusinesses.filter((b) => b.finance_bank_verified).length;
  const pendingAuditCorpCount = rbacScopedBusinesses.filter((b) => !b.finance_bank_verified).length;
  const hardLockedCorpCount = rbacScopedBusinesses.filter((b) => b.is_hard_locked_by_admin || b.verification_status === 'REJECTED').length;

  // Active filters count for Corporate Accounts
  const activeCorpFiltersCount = (corpAuditFilter !== 'ALL' ? 1 : 0) +
    (corpLockFilter !== 'ALL' ? 1 : 0) +
    (corpStateFilter !== 'ALL' ? 1 : 0) +
    (corpDebitFilter !== 'ALL' ? 1 : 0) +
    (corpValidationRouting !== 'ALL' ? 1 : 0);

  const resetCorpFilters = () => {
    setCorpAuditFilter('ALL');
    setCorpLockFilter('ALL');
    setCorpStateFilter('ALL');
    setCorpDebitFilter('ALL');
    setCorpValidationRouting('ALL');
  };

  const handleAddStandardUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStandardUserForm.username.trim() || !newStandardUserForm.email.trim()) {
      showToast('Username and email are required.', 'error');
      return;
    }
    const res = db.adminAddRegularUser({
      username: newStandardUserForm.username.trim().toLowerCase(),
      first_name: newStandardUserForm.first_name.trim(),
      last_name: newStandardUserForm.last_name.trim(),
      email: newStandardUserForm.email.trim().toLowerCase(),
      phone_number: newStandardUserForm.phone_number.trim(),
      city: newStandardUserForm.city.trim(),
      country_code: newStandardUserForm.country_code.trim(),
      password: newStandardUserForm.password,
    });
    if (res.success) {
      showToast(res.message, 'success');
      setShowAddStandardUserModal(false);
      setNewStandardUserForm({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '+91 ',
        city: 'Hyderabad',
        country_code: 'IN',
        password: 'User@123',
      });
      loadAllData();
      if (onRefreshAll) onRefreshAll();
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & ACTIVE ADMIN SIMULATION BAR                                */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
              <Crown className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-tight font-mono">
                  TRUVAER OPERATIONS &amp; ERP
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Operations &amp; Admin Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Departmental Hierarchy (L0–L8), 2-Stage Debit Workflows, PII Masking &amp; Publication Control
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Action: Open API Inspector Modal (Housed inside Ops & ERP) */}
            {onOpenApiInspector && (
              <button
                type="button"
                onClick={onOpenApiInspector}
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-sky-950/70 hover:bg-sky-900 border border-sky-500/40 text-sky-300 hover:text-white text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer"
                title="Inspect Live API Contracts & Endpoints (Housed in Ops & ERP)"
              >
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">API Inspector</span>
                <span className="sm:hidden">API</span>
              </button>
            )}

            {/* Quick Action: Open Treasury & Reserves Modal (Housed inside Ops & ERP) */}
            {onOpenWallet && (
              <button
                type="button"
                onClick={onOpenWallet}
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                title="Admin Treasury & Reserves Management (Housed in Ops & ERP)"
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Treasury &amp; Reserves</span>
                <span className="sm:hidden">Treasury</span>
              </button>
            )}

            {/* Active Admin Persona Picker (For testing authorization levels) */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 flex items-center space-x-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Active Admin Operator
                </div>
                <div className="text-xs font-bold text-white leading-tight">
                  {activeAdmin?.name || 'No Admin Selected'}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {activeAdmin?.department || 'Operations'} • {activeAdmin?.level_title || `Level ${activeAdmin?.level}`}
                </div>
              </div>

              <div className="relative">
                <select
                  id="active-admin-selector"
                  value={activeAdmin?.admin_id || ''}
                  onChange={(e) => {
                    const found = allAdmins.find((a) => a.admin_id === e.target.value);
                    if (found) {
                      setActiveAdmin(found);
                      showToast(`Switched active operator to ${found.name} (${found.level_title})`);
                    }
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 cursor-pointer font-medium hover:bg-slate-750 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {allAdmins.map((a) => (
                    <option key={a.admin_id} value={a.admin_id}>
                      {a.name} — [{a.department}] ({a.level_title || `L${a.level}`})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Global Toast Feedback */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Requirement 3: ERP Module Functions on Left Side of Screen with Department-Wise Permissions */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* LEFT SIDEBAR: ERP Module Functions & Department Clearance */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          {/* Active Operator Department Clearance Matrix Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Dept Clearance
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                Level {activeAdmin?.level ?? 1}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{activeAdmin?.department || 'Operations'} Department</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                {activeAdmin?.department === 'Finance'
                  ? 'Finance Department Clearance: Authorized to Edit, Approve & Restrict Business Listings, Audit Wallets, and Execute 2-Stage Debits.'
                  : activeAdmin?.department === 'Operations'
                  ? 'Operations Clearance: Authorized to Edit, Approve & Restrict Business Listings, Terminal Slots, and KYC.'
                  : activeAdmin?.department === 'Senior Management Team'
                  ? 'Super-Admin Clearance: Full authority across all ERP platforms and departmental actions.'
                  : `${activeAdmin?.department} Specialist: Standard operations and read-only publication privileges.`}
              </p>
            </div>
            {(activeAdmin?.department === 'Finance' || activeAdmin?.department === 'Operations' || activeAdmin?.department === 'Senior Management Team') && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Listing Edit &amp; Approval Active</span>
              </div>
            )}
          </div>

          {/* ERP Module Navigation Links (Left Side Menu) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-lg space-y-1">
            <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>ERP Modules</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">53 Modules</span>
            </div>

            {/* Quick Profile Menu Module Launcher Button (Easy access as shown in image) */}
            {onOpenProfileMenu && (
              <button
                type="button"
                onClick={onOpenProfileMenu}
                className="w-full mb-1.5 p-2 rounded-xl bg-gradient-to-r from-blue-600/25 via-indigo-600/25 to-blue-500/25 border border-blue-500/40 hover:border-blue-400 text-white flex items-center justify-between text-xs font-bold transition-all shadow-sm cursor-pointer group hover:from-blue-600/35 hover:to-indigo-600/35 active:scale-98"
                title="Open Profile Menu Interface (Instant 1-Click Launch for all 53 modules)"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                    <LayoutGrid className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-[11px]">Profile Menu (Launcher)</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 font-bold">
                  Open
                </span>
              </button>
            )}

            {/* Executive Dashboard - Available to all */}
            <button
              id="erp-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Layers className="w-4 h-4 shrink-0" />
                <span>Executive Dashboard</span>
              </span>
            </button>


            {/* Approved Categories & Subcategories (CRUD & Other Approvals) */}
            <button
              id="erp-tab-taxonomy"
              onClick={() => setActiveTab('taxonomy')}
              className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                activeTab === 'taxonomy'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-emerald-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Tags className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Approved Taxonomy</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                CRUD
              </span>
            </button>

            {/* Live Activity Feed */}
            <button
              id="erp-tab-activity-feed"
              onClick={() => setActiveTab('activity_feed')}
              className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                activeTab === 'activity_feed'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-emerald-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Activity className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Activity Feed</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                LIVE
              </span>
            </button>

            {/* Sales & Marketing: Complete CRM Portal */}
            {canAccessCRM && (
              <button
                id="erp-tab-crm"
                onClick={() => setActiveTab('crm')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'crm'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-sky-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Sale Portal</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-500/20 text-sky-300 font-mono font-bold">
                  Sale
                </span>
              </button>
            )}

            {/* Stores & Hangar Spares: Available only to Stores, Ops, or Super Admin */}
            {canAccessStores && (
              <button
                id="erp-tab-stores"
                onClick={() => setActiveTab('stores')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'stores'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-purple-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Package className="w-4 h-4 shrink-0" />
                  <span>Stores &amp; Spares Hub</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-purple-500/20 text-purple-300 font-mono font-bold">
                  Inventory
                </span>
              </button>
            )}

            {/* Finance Department Commission Ledger: Strictly for Finance & Super Admin */}
            {canAccessCommissions && (
              <button
                id="erp-tab-commissions"
                onClick={() => setActiveTab('commissions')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'commissions'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-emerald-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 shrink-0" />
                  <span>Finance Commission Desk</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  Finance
                </span>
              </button>
            )}

            {/* Accounts Master: Verification, KYC, Business Updates (Operations & Super Admin) */}
            {canAccessOps && (
              <button
                id="erp-tab-accounts"
                onClick={() => setActiveTab('accounts')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'accounts'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Accounts Master</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-slate-300 font-mono">
                  {businesses.length + regularUsers.length}
                </span>
              </button>
            )}

            {/* Treasury & Reserves Desk: Finance & Super Admin */}
            {canAccessFinance && (
              <button
                id="erp-tab-transactions"
                onClick={() => setActiveTab('transactions')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'transactions'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Landmark className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Treasury &amp; Reserves Desk</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                  ₹15L Cap
                </span>
              </button>
            )}

            {/* API & Contracts Inspector: Ops & Super Admin */}
            <button
              id="erp-tab-api"
              onClick={() => setActiveTab('api_inspector')}
              className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                activeTab === 'api_inspector'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-cyan-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>API &amp; Contracts Inspector</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                Live Ops
              </span>
            </button>

            {/* Publication Desk: Operations & Super Admin */}
            {canAccessOps && (
              <button
                id="erp-tab-publications"
                onClick={() => setActiveTab('publications')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'publications'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Publication Desk</span>
                </span>
                {pendingPublications > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {pendingPublications}
                  </span>
                )}
              </button>
            )}

            {/* Moderation Desk: Reported & Blocked Businesses (Admin, Manager & Super Admin) */}
            <button
              id="erp-tab-moderation-reports"
              onClick={() => setActiveTab('moderation_reports')}
              className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                activeTab === 'moderation_reports'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Reported &amp; Blocked Businesses</span>
              </span>
            </button>

            {/* Centralized Credit & Debit Matrix: Finance & Super Admin */}
            {canAccessFinance && (
              <button
                id="erp-tab-debits"
                onClick={() => setActiveTab('debit_approvals')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'debit_approvals'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Centralized Credit Matrix</span>
                </span>
                {(pendingDebitsCount + db.getCentralizedCreditRequests().filter((r) => r.status.startsWith('PENDING')).length) > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
                    {pendingDebitsCount + db.getCentralizedCreditRequests().filter((r) => r.status.startsWith('PENDING')).length}
                  </span>
                )}
              </button>
            )}

            {/* Hierarchy: L4+ or Super Admin */}
            {canAccessHierarchy && (
              <button
                id="erp-tab-hierarchy"
                onClick={() => setActiveTab('hierarchy')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'hierarchy'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 shrink-0" />
                  <span>Hierarchy (L0–L8)</span>
                </span>
              </button>
            )}

            {/* 2-Level Promotions */}
            {(canAccessOps || canAccessCRM || isSuperAdmin) && (
              <button
                id="erp-tab-promotions"
                onClick={() => setActiveTab('promotion_approvals')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'promotion_approvals'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Key className="w-4 h-4 shrink-0" />
                  <span>2-Level Promotions</span>
                </span>
                {pendingPromotionsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-400 text-slate-950 font-bold">
                    {pendingPromotionsCount}
                  </span>
                )}
              </button>
            )}

            {/* Security Logs: Finance & Super Admin */}
            {(canAccessFinance || isSuperAdmin) && (
              <button
                id="erp-tab-logs"
                onClick={() => setActiveTab('logs')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'logs'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Audit &amp; Security Logs</span>
                </span>
              </button>
            )}

            {/* Control Settings: Finance & Super Admin */}
            {(canAccessFinance || isSuperAdmin) && (
              <button
                id="erp-tab-settings"
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Control Settings</span>
                </span>
              </button>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Quick ERP Actions
            </div>
            <button
              onClick={() => setShowAddBusinessModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Business</span>
            </button>
            <button
              onClick={() => setShowInitiateDebitModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Initiate Debit</span>
            </button>
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Add Personnel</span>
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE */}
        <div className="flex-1 min-w-0 w-full space-y-4">

      {/* ========================================================================= */}
      {/* NEW TAB: GRANULAR RBAC CONTROL PANEL & TERRITORIAL SCOPING               */}
      {/* ========================================================================= */}
      {activeTab === 'control_panel' && (
        <AdminRBACControlPanel
          activeAdminUser={activeAdmin}
          onPermissionsUpdated={() => {
            loadAllData();
            showToast('Administrator permissions and geographical scopes updated!');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* NEW TAB: CUSTOM AVIATION SERVICES APPROVAL QUEUE & CATALOG MANAGEMENT     */}
      {/* ========================================================================= */}
      {activeTab === 'services_approval' && (
        <AdminServicesApprovalDesk
          activeAdminUser={activeAdmin}
          onRefreshAll={() => {
            loadAllData();
            if (onRefreshAll) onRefreshAll();
          }}
          onOpenBroadcastModal={() => setShowBroadcastModal(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* NEW TAB: AIRWAY BROADCAST DESK (ZONES: APAC, ANZ, CIS, EMEA, LATAM, NA)  */}
      {/* ========================================================================= */}
      {activeTab === 'broadcast' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Sovereign Airway Broadcast &amp; Notifications Dispatch</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  APAC • ANZ • CIS • EMEA • LATAM • NA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Broadcast targeted in-app notifications and official emails to operators and clients filtered Category-wise, Country-wise, and Zone-wise.
              </p>
            </div>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center space-x-2 shadow-md cursor-pointer shrink-0 text-xs"
            >
              <Megaphone className="w-4 h-4" />
              <span>Launch Broadcast Composer</span>
            </button>
          </div>

          <AdminServicesApprovalDesk
            activeAdminUser={activeAdmin}
            onRefreshAll={() => {
              loadAllData();
              if (onRefreshAll) onRefreshAll();
            }}
            onOpenBroadcastModal={() => setShowBroadcastModal(true)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW TAB: COMMERCIAL SALES & MARKETING (CRM PORTAL)                        */}
      {/* ========================================================================= */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          <CRMPortal
            activeAdminUser={activeAdmin}
            onOpenWallet={() => setActiveTab('transactions')}
            onRefreshData={loadAllData}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW TAB: STORES & HANGAR SPARES HUB                                       */}
      {/* ========================================================================= */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <StoresPortal
            activeAdminUser={activeAdmin}
            onRefreshAll={loadAllData}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW TAB: FINANCE COMMISSION DESK (Restricted to Finance & Super Admin)    */}
      {/* ========================================================================= */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Finance Department Commission Ledger</h2>
                <p className="text-xs text-slate-400">
                  Real-time visibility into committed vs released commissions, automated deal tracking, and treasury settlements.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              Finance Clearance Active
            </span>
          </div>

          <CRMPortal
            activeAdminUser={activeAdmin}
            onOpenWallet={() => setActiveTab('transactions')}
            onRefreshData={loadAllData}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1.4 TAB: ADMIN PROJECT MANAGEMENT SYSTEM (PMS)                            */}
      {/* ========================================================================= */}
      {activeTab === 'pms' && (
        <div className="space-y-4">
          <AdminPMSDesk
            activeAdminUser={activeAdmin}
            onRefreshData={loadAllData}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1.45 TAB: APPROVED CATEGORIES & SUBCATEGORIES DESK (CRUD & OTHER PROPOSALS)*/}
      {/* ========================================================================= */}
      {activeTab === 'taxonomy' && (
        <div className="space-y-4">
          <ApprovedTaxonomyDesk
            activeAdminUser={activeAdmin}
            onRefreshAll={loadAllData}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1.5 TAB: REGIONAL CASH FLOW ANALYTICS (APAC, ANZ & OTHERS - Image 3)      */}
      {/* ========================================================================= */}
      {activeTab === 'cash_flow' && (
        <div className="space-y-4">
          <RegionalCashFlowAnalytics
            onNavigateToTab={(t) => setActiveTab(t as any)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1.6 TAB: ADMIN MODULE DIRECTORY & VISIBLE OPTIONS (Image 2)               */}
      {/* ========================================================================= */}
      {activeTab === 'module_directory' && (
        <div className="space-y-4">
          <AdminModuleDirectory
            onSelectModuleTab={(t) => setActiveTab(t as any)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: EXECUTIVE DASHBOARD                                               */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Metric Cards (Interactive Navigation Links) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => {
                setDashboardSection('finance_cashflow');
                const el = document.getElementById('finance-cashflow-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              title="Click to view Corporate Reserves in Regional Cash Flow & Finance"
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl shadow-lg transition-all text-left cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-400 transition-colors">Corporate Reserves</span>
                <Coins className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {totalBusinessCredits.toLocaleString()} <span className="text-sm font-sans text-amber-300">Cr</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>Active in {businesses.length} Corporate Accounts</span>
                <span className="text-amber-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  View &rarr;
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('publications')}
              title="Click to manage & verify Marketplace Service Listings"
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl shadow-lg transition-all text-left cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Publication Controls</span>
                <FileText className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {listings.filter((l) => l.publication_status === 'PUBLISHED').length} / {listings.length}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>{pendingPublications} require admin compliance action</span>
                <span className="text-blue-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Inspect &rarr;
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('debit_approvals')}
              title="Click to authorize pending 2-Stage Wallet Debits"
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl shadow-lg transition-all text-left cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-400 transition-colors">2-Stage Debits Queue</span>
                <CreditCard className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-white font-mono flex items-center space-x-2">
                <span>{pendingDebitsCount} Pending</span>
                {pendingDebitsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>Admin &amp; Super Admin dual authorization</span>
                <span className="text-emerald-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Review &rarr;
                </span>
              </div>
            </button>

            <button
              type="button"
              id="dashboard-promotions-metric-card"
              onClick={() => setActiveTab('promotion_approvals')}
              title="Click to redirect to 2-Level Hierarchy Promotions & Approvals"
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 p-5 rounded-2xl shadow-lg transition-all text-left cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-purple-400 transition-colors">Hierarchy Promotions</span>
                <Key className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-white font-mono flex items-center space-x-2">
                <span>{pendingPromotionsCount} Pending</span>
                {pendingPromotionsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                )}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>2-Level mandatory sign-off workflow</span>
                <span className="text-purple-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  Open Promotions &rarr;
                </span>
              </div>
            </button>
          </div>

          {/* Executive Dashboard Clean Section Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDashboardSection('finance_cashflow')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  dashboardSection === 'finance_cashflow'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Finance &amp; Regional Cash Flow (Dropbox Query Hub)</span>
              </button>

              <button
                type="button"
                onClick={() => setDashboardSection('module_directory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  dashboardSection === 'module_directory'
                    ? 'bg-sky-500 text-slate-950 shadow-md ring-1 ring-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Module Directory &amp; Options</span>
              </button>

              <button
                type="button"
                onClick={() => setDashboardSection('approvals_ops')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  dashboardSection === 'approvals_ops'
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-1 ring-emerald-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Operations Actions &amp; Queues</span>
                {(pendingDebitsCount + pendingPromotionsCount) > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-900 text-white font-mono font-bold">
                    {pendingDebitsCount + pendingPromotionsCount}
                  </span>
                )}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 pr-2 hidden md:block">
              {dashboardSection === 'finance_cashflow' && '📊 Select Reason & Filters in Dropbox'}
              {dashboardSection === 'module_directory' && '🎛️ Click any module to launch actions'}
              {dashboardSection === 'approvals_ops' && '⚡ Authorize 2-stage debits & promotions'}
            </div>
          </div>

          {/* SECTION 1: FINANCE & REGIONAL CASH FLOW (DEFAULT, CLEAN & SIMPLE) */}
          {dashboardSection === 'finance_cashflow' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <RegionalCashFlowAnalytics
                onNavigateToTab={(t) => setActiveTab(t as any)}
              />
            </div>
          )}

          {/* SECTION 2: ADMIN MODULE DIRECTORY */}
          {dashboardSection === 'module_directory' && (
            <div className="pt-1 animate-in fade-in duration-200">
              <AdminModuleDirectory
                onSelectModuleTab={(t) => setActiveTab(t as any)}
              />
            </div>
          )}

          {/* SECTION 3: OPERATIONS & QUEUES */}
          {dashboardSection === 'approvals_ops' && (
            <div className="space-y-6 pt-1 animate-in fade-in duration-200">
              {/* Quick Operations Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setShowAddBusinessModal(true)}
                  className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300">
                    + Provision Business Account
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Add new certified FBO, charter, or airport partner with initial corporate wallet allocation.
                  </p>
                </div>

                <div
                  onClick={() => setShowInitiateDebitModal(true)}
                  className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300">
                    + Initiate 2-Stage Wallet Debit
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Create a formal debit request requiring Admin Stage 1 and Super Admin Stage 2 approvals.
                  </p>
                </div>

                <div
                  onClick={() => setShowAddAdminModal(true)}
                  className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300">
                    + Onboard Department Admin
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Add administrative personnel to Sales, Operations, Finance, or HR with assigned L0–L8 ranking.
                  </p>
                </div>
              </div>

              {/* Urgent Approval Queues Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Pending Debits */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">Pending Wallet Debits (2-Stage Approval)</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('debit_approvals')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  {debitRequests.filter((d) => d.status.startsWith('PENDING')).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/50 rounded-xl">
                      No debit requests currently awaiting authorization.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {debitRequests
                        .filter((d) => d.status.startsWith('PENDING'))
                        .slice(0, 3)
                        .map((d) => (
                          <div
                            key={d.id}
                            className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-semibold text-white">{d.business_name}</div>
                              <div className="text-[11px] text-slate-400">{d.reason}</div>
                              <div className="text-[10px] text-amber-400 mt-0.5 font-mono">
                                Stage: {d.status === 'PENDING_STAGE_1' ? 'Stage 1 (Admin Review)' : 'Stage 2 (Super Admin Sign-off)'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-rose-400">-{d.amount} Cr</div>
                              <button
                                onClick={() => setActiveTab('debit_approvals')}
                                className="mt-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold"
                              >
                                Review
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Pending Promotions */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold text-white">Pending Hierarchy Promotions (2-Level Mandatory)</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('promotion_approvals')}
                      className="text-xs text-purple-400 hover:underline"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  {promotionRequests.filter((p) => p.overall_status.startsWith('PENDING')).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/50 rounded-xl">
                      No promotional or permission elevations pending.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {promotionRequests
                        .filter((p) => p.overall_status.startsWith('PENDING'))
                        .slice(0, 3)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-white">
                                {p.admin_name} ({p.department})
                              </div>
                              <div className="text-[11px] text-slate-400">{p.requested_permission}</div>
                              <div className="text-[10px] text-purple-400 mt-0.5 font-mono">
                                Elevate L{p.current_level} &rarr; L{p.target_level} (Requires L{p.first_approver_level} &amp; L{p.second_approver_level})
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                                {p.overall_status === 'PENDING_LEVEL_1' ? 'Level 1 Pending' : 'Level 2 Pending'}
                              </span>
                              <div className="mt-1">
                                <button
                                  onClick={() => setActiveTab('promotion_approvals')}
                                  className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 text-[10px] font-bold"
                                >
                                  Inspect
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Activity Feed embedded on Executive Dashboard */}
              <div className="pt-2">
                <AdminActivityFeed
                  onNavigateToTab={(t) => setActiveTab(t as any)}
                  onSelectBusinessToView={(bizId) => {
                    const b = businesses.find((bx) => bx.business_id === bizId);
                    if (b && onSelectBusinessToView) onSelectBusinessToView(b);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: REGIONAL CASH FLOW ANALYTICS (APAC, ANZ & OTHERS)                */}
      {/* ========================================================================= */}
      {activeTab === 'cash_flow' && (
        <div className="space-y-4">
          <RegionalCashFlowAnalytics
            onNavigateToTab={(t) => setActiveTab(t as any)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.2 TAB: ADMIN MODULE DIRECTORY & VISIBLE OPTIONS                        */}
      {/* ========================================================================= */}
      {activeTab === 'module_directory' && (
        <div className="space-y-4">
          <AdminModuleDirectory
            onSelectModuleTab={(t) => setActiveTab(t as any)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.5 TAB: DEDICATED REAL-TIME ACTIVITY FEED STREAM                        */}
      {/* ========================================================================= */}
      {activeTab === 'activity_feed' && (
        <div className="space-y-4">
          <AdminActivityFeed
            onNavigateToTab={(t) => setActiveTab(t as any)}
            onSelectBusinessToView={(bizId) => {
              const b = businesses.find((bx) => bx.business_id === bizId);
              if (b && onSelectBusinessToView) onSelectBusinessToView(b);
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: USER & ACCOUNT MASTER (Filters Interface & Multi-Tab Governance)   */}
      {/* ========================================================================= */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Global Header: Contextual Search & Dynamic "Add" CTA */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                      <span>Account Master &amp; User Management</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Unified Multi-Tenant Directory • Strict State Segregation &amp; Corporate Wallet Administration
                    </p>
                  </div>
                </div>
              </div>

              {/* RBAC Visibility Scope Badge */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
                    isSuperAdminGlobalViewer
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {isSuperAdminGlobalViewer
                    ? 'Super Admin Unsegregated Global Visibility'
                    : `Scoped View: ${activeAdmin?.department || 'Operations Team'}`}
                </span>
              </div>
            </div>

            {/* Contextual Global Search & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  placeholder={
                    accountMasterTab === 'corporate_accounts'
                      ? 'Search corporate accounts by organization, TAN, GSTIN, owner, email...'
                      : accountMasterTab === 'standard_users'
                      ? 'Search standard aviators by name, username, city, email...'
                      : 'Search ops personnel by name, email, department, level...'
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {accountSearch && (
                  <button
                    onClick={() => setAccountSearch('')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Contextual Add Button */}
              {accountMasterTab === 'corporate_accounts' ? (
                <button
                  onClick={() => setShowAddBusinessModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Corporate Business</span>
                </button>
              ) : accountMasterTab === 'standard_users' ? (
                <button
                  onClick={() => setShowAddStandardUserModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Standard User</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Ops Administrator</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Sub-Tabs: Standard Users | Corporate Accounts (Wallets) | Ops Team Permissions */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setAccountMasterTab('corporate_accounts')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                accountMasterTab === 'corporate_accounts'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Corporate Accounts (Wallets)</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  accountMasterTab === 'corporate_accounts'
                    ? 'bg-slate-950 text-amber-300 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {filteredCorporateAccounts.length}
              </span>
            </button>

            <button
              onClick={() => setAccountMasterTab('standard_users')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                accountMasterTab === 'standard_users'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Standard Users</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  accountMasterTab === 'standard_users'
                    ? 'bg-slate-950 text-sky-300 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {filteredStandardAviatorUsers.length}
              </span>
            </button>

            <button
              onClick={() => setAccountMasterTab('ops_permissions')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                accountMasterTab === 'ops_permissions'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ops Team Permissions</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  accountMasterTab === 'ops_permissions'
                    ? 'bg-purple-950 text-purple-200 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {filteredOpsAdminsList.length}
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* VIEW A: CORPORATE ACCOUNTS (WALLETS) WITH AUTOMATED VALIDATION ROUTING    */}
          {/* ========================================================================= */}
          {accountMasterTab === 'corporate_accounts' && (
            <div className="space-y-4">
              {/* Scoped Ops Notification Banner if not Super Admin */}
              {!isSuperAdminGlobalViewer && (
                <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-center justify-between text-xs text-blue-200">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      RBAC Scoped Visibility: Accounts shown are filtered to your active department (<strong>{activeAdmin?.department || 'Operations'}</strong>). Full, unsegregated master list visibility is restricted exclusively to Super Admins.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold shrink-0">
                    Scoped View
                  </span>
                </div>
              )}

              {/* Automated Validation Routing Switcher: All | Validated/Verified | Pending Review */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Validation Routing:</span>
                  <button
                    onClick={() => setCorpValidationRouting('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      corpValidationRouting === 'ALL'
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Accounts ({rbacScopedBusinesses.length})
                  </button>
                  <button
                    onClick={() => setCorpValidationRouting('VALIDATED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      corpValidationRouting === 'VALIDATED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Validated / Verified ({verifiedCorpCount})</span>
                  </button>
                  <button
                    onClick={() => setCorpValidationRouting('PENDING')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      corpValidationRouting === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pending Review ({pendingCorpCount})</span>
                    {pendingCorpCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Displaying {filteredCorporateAccounts.length} of {rbacScopedBusinesses.length} accounts
                </div>
              </div>

              {/* Comprehensive Additive Filter Bar placed directly above Corporate Accounts Data Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Additive Governance Filters
                    </span>
                    {activeCorpFiltersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {activeCorpFiltersCount} Applied
                      </span>
                    )}
                  </div>
                  {activeCorpFiltersCount > 0 && (
                    <button
                      onClick={resetCorpFilters}
                      className="text-xs text-slate-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer font-semibold transition-colors"
                      title="Reset all additive corporate filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>

                {/* Filter Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* 1. Audit Status */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">
                      Audit Status (Bank Remittance)
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['ALL', 'AUDITED', 'PENDING_AUDIT'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCorpAuditFilter(opt)}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                            corpAuditFilter === opt
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt === 'ALL' ? 'All' : opt === 'AUDITED' ? 'Audited' : 'Pending'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Lock Status */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">
                      Lock Status (Admin Elevation)
                    </label>
                    <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['ALL', 'UNLOCKED', 'SOFT_LOCKED', 'HARD_LOCKED'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCorpLockFilter(opt)}
                          className={`py-1 px-1 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                            corpLockFilter === opt
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt === 'ALL' ? 'All' : opt === 'UNLOCKED' ? 'Unlock' : opt === 'SOFT_LOCKED' ? 'Soft' : 'Hard'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Account State */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">
                      Account State (Lifecycle)
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['ALL', 'ACTIVE', 'DEACTIVATED'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCorpStateFilter(opt)}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                            corpStateFilter === opt
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt === 'ALL' ? 'All' : opt === 'ACTIVE' ? 'Active' : 'Deact'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Debit Status */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 block">
                      Debit Status (Wallet Access)
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['ALL', 'DEBIT_ENABLED', 'DEBIT_DISABLED'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCorpDebitFilter(opt)}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer ${
                            corpDebitFilter === opt
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt === 'ALL' ? 'All' : opt === 'DEBIT_ENABLED' ? 'Enabled' : 'Disabled'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Corporate Accounts Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      Corporate Business Accounts ({filteredCorporateAccounts.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Additive Filter Matches: {filteredCorporateAccounts.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Organization / Entity</th>
                        <th className="p-3.5">Category &amp; Reg. Type</th>
                        <th className="p-3.5">Masked Contact (PII)</th>
                        <th className="p-3.5">Corporate Wallet Balance</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Settlement Bank Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredCorporateAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400">
                            <div className="max-w-md mx-auto space-y-2">
                              <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                              <div className="text-sm font-bold text-slate-300">No Corporate Accounts Match Filter Criteria</div>
                              <p className="text-xs text-slate-500">
                                Try adjusting your additive filters (Audit, Lock, State, Debit) or clearing your search query.
                              </p>
                              {activeCorpFiltersCount > 0 && (
                                <button
                                  onClick={resetCorpFilters}
                                  className="mt-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold text-xs"
                                >
                                  Reset All Filters
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCorporateAccounts.map((biz) => {
                          const maskedPhone = maskPhoneNumber(biz.phone_number || '');
                          const parsedEmail = parseEmailForMasking(biz.business_email || '');
                          const isHardLocked = biz.is_hard_locked_by_admin || biz.verification_status === 'REJECTED';
                          const isBankAudited = biz.finance_bank_verified;
                          const isMenuOpen = openActionMenuBizId === biz.business_id;

                          return (
                            <tr key={biz.business_id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-white flex items-center space-x-1.5">
                                  <span>{biz.organization_name}</span>
                                </div>
                                <div className="text-[11px] text-slate-400">Owner: {biz.owner_name}</div>
                                <div className="text-[10px] font-mono text-slate-500">{biz.business_id}</div>
                              </td>

                              <td className="p-3.5">
                                <div className="text-blue-300 font-medium">{biz.category || 'General Aviation'}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {biz.reg_number_type}: {biz.registration_number}
                                </div>
                              </td>

                              <td className="p-3.5 font-mono text-[11px]">
                                <div>{maskedPhone.masked}</div>
                                <div className="text-slate-400 flex items-center space-x-1">
                                  <span>email :</span>
                                  <span className="blur-[3px] select-none text-white">{parsedEmail.username}</span>
                                  <span>@{parsedEmail.domain}</span>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="font-mono font-bold text-amber-300 text-sm">
                                  {(biz.corporate_wallet?.credit_balance ?? 0).toLocaleString()} Cr
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {biz.corporate_wallet?.tier || 'Corporate Standard'}
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="flex flex-col space-y-1">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block w-fit ${
                                      biz.verification_status === 'VERIFIED' && !biz.is_hard_locked_by_admin
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    }`}
                                  >
                                    {biz.is_hard_locked_by_admin ? 'HARD LOCKED' : biz.verification_status}
                                  </span>
                                  {biz.account_status === 'DEACTIVATED' && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-purple-950 text-purple-300 border border-purple-800 w-fit">
                                      DEACTIVATED
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="flex flex-col space-y-1">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block w-fit ${
                                      biz.finance_bank_verified
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : biz.bank_verification_status === 'REVOKED'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : biz.bank_verification_status === 'REJECTED'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}
                                  >
                                    {biz.finance_bank_verified
                                      ? '✓ Bank Verified'
                                      : biz.bank_verification_status === 'REVOKED'
                                      ? '⛔ Shut Off'
                                      : biz.bank_verification_status === 'REJECTED'
                                      ? '❌ Rejected'
                                      : '⏳ Pending Audit'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {biz.bank_name || 'Bank'} ({biz.bank_account_number_masked || '••••8899'})
                                  </span>
                                </div>
                              </td>

                              {/* REFACTORED ACTION COLUMN: Clean UX, State-Relevant Primary Action + More Dropdown */}
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {/* Primary State-Relevant Action */}
                                  {!isBankAudited ? (
                                    <button
                                      onClick={() => setBankAuditBiz(biz)}
                                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                                      title="Audit Bank Coordinates and Authorize Remittances"
                                    >
                                      <Landmark className="w-3.5 h-3.5" />
                                      <span>Bank Audit</span>
                                    </button>
                                  ) : isHardLocked || biz.verification_status !== 'VERIFIED' ? (
                                    <button
                                      onClick={() => {
                                        const res = db.adminApproveBusiness(biz.business_id);
                                        if (res.success) {
                                          showToast(res.message, 'success');
                                          loadAllData();
                                          if (onRefreshAll) onRefreshAll();
                                        }
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 cursor-pointer transition-colors shadow-xs flex items-center space-x-1"
                                      title="Approve profile, lift hard lock, and route to verified state"
                                    >
                                      <Unlock className="w-3.5 h-3.5" />
                                      <span>Approve &amp; Lift Lock</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setShowEditBusinessModal(biz)}
                                      className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold border border-blue-500/40 cursor-pointer transition-colors shadow-xs flex items-center space-x-1"
                                      title="Edit Business Profile"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>
                                  )}

                                  {/* Secondary Actions: Clean "More" (•••) Dropdown Menu */}
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenActionMenuBizId(isMenuOpen ? null : biz.business_id);
                                      }}
                                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                                      title="More Actions"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {isMenuOpen && (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-0 top-full mt-1.5 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-40 text-left animate-in fade-in zoom-in-95"
                                      >
                                        <button
                                          onClick={() => {
                                            setShowEditBusinessModal(biz);
                                            setOpenActionMenuBizId(null);
                                          }}
                                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
                                        >
                                          <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                          <span>Edit Business Profile</span>
                                        </button>

                                        <button
                                          onClick={() => {
                                            setDebitForm({ business_id: biz.business_id, amount: 100, reason: '' });
                                            setShowInitiateDebitModal(true);
                                            setOpenActionMenuBizId(null);
                                          }}
                                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
                                        >
                                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                                          <span>Initiate Debit Request</span>
                                        </button>

                                        {isHardLocked ? (
                                          <button
                                            onClick={() => {
                                              const res = db.adminApproveBusiness(biz.business_id);
                                              if (res.success) {
                                                showToast(res.message, 'success');
                                                loadAllData();
                                                if (onRefreshAll) onRefreshAll();
                                              }
                                              setOpenActionMenuBizId(null);
                                            }}
                                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-emerald-300 hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
                                          >
                                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Lift Hard Lock</span>
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              const res = db.adminHardLockBusiness(
                                                biz.business_id,
                                                'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
                                              );
                                              if (res.success) {
                                                showToast(res.message, 'error');
                                                loadAllData();
                                                if (onRefreshAll) onRefreshAll();
                                              }
                                              setOpenActionMenuBizId(null);
                                            }}
                                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-300 hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
                                          >
                                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                                            <span>Apply Hard Lock</span>
                                          </button>
                                        )}

                                        {biz.account_status === 'DEACTIVATED' ? (
                                          <button
                                            onClick={() => {
                                              biz.account_status = 'ACTIVE';
                                              showToast(`Reactivated corporate account for ${biz.organization_name}`, 'success');
                                              loadAllData();
                                              if (onRefreshAll) onRefreshAll();
                                              setOpenActionMenuBizId(null);
                                            }}
                                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-emerald-300 hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Reactivate Account</span>
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setDeactivateReason('Account Deactivated by Administration - Treasury settlement processed');
                                              setDeactivateTargetBiz(biz);
                                              setOpenActionMenuBizId(null);
                                            }}
                                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-purple-300 hover:bg-slate-800 flex items-center space-x-2 transition-colors cursor-pointer"
                                          >
                                            <Ban className="w-3.5 h-3.5 text-purple-400" />
                                            <span>Deactivate Account</span>
                                          </button>
                                        )}

                                        <div className="border-t border-slate-800 my-1" />

                                        <button
                                          onClick={() => {
                                            handleDeleteBusiness(biz.business_id, biz.organization_name);
                                            setOpenActionMenuBizId(null);
                                          }}
                                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center space-x-2 transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                          <span>Delete Business</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
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

          {/* ========================================================================= */}
          {/* VIEW B: STANDARD AVIATOR USERS (STRICTLY DECOUPLED FROM CORPORATE DATA)   */}
          {/* ========================================================================= */}
          {accountMasterTab === 'standard_users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-2">
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">
                    Standard Users (Decoupled Aviator Profiles • Wallets Excluded)
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-mono">
                    {filteredStandardAviatorUsers.length} Aviator Accounts
                  </span>
                  <button
                    onClick={() => setShowAddStandardUserModal(true)}
                    className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-xs font-bold border border-sky-500/30 cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Aviator</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Aviator Profile / Username</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Masked Contact (PII Compliance)</th>
                      <th className="p-3.5">Wallet State</th>
                      <th className="p-3.5">Operating Base / Hub</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStandardAviatorUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <div className="text-sm font-bold text-slate-300">No Standard Aviator Users Found</div>
                          <p className="text-xs text-slate-500 mt-1">
                            Use the search bar above or click &quot;Add Standard User&quot; to provision a new aviator.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredStandardAviatorUsers.map((user) => {
                        const maskedPhone = maskPhoneNumber(user.phone_number);
                        const parsedEmail = parseEmailForMasking(user.email);
                        return (
                          <tr key={user.user_id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3.5">
                              <div className="font-bold text-white flex items-center space-x-1.5">
                                <span>@{user.username}</span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-500">{user.user_id}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                                {user.role || 'USER'}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-[11px]">
                              <div>{maskedPhone.masked}</div>
                              <div className="text-slate-400 flex items-center space-x-1">
                                <span>email :</span>
                                <span className="blur-[3px] select-none text-white">{parsedEmail.username}</span>
                                <span>@{parsedEmail.domain}</span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="text-slate-400 italic text-[11px] flex items-center space-x-1">
                                <Ban className="w-3.5 h-3.5 text-slate-500" />
                                <span>Decoupled (No Corporate Wallet)</span>
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-300">
                              {user.city || 'Global Hub'} ({user.country_code || 'IN'})
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => showToast(`Standard Aviator @${user.username} profile verified.`, 'success')}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW C: OPS TEAM PERMISSIONS & ADMINISTRATIVE HIERARCHY                    */}
          {/* ========================================================================= */}
          {accountMasterTab === 'ops_permissions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-2">
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    Operations Team Officers &amp; Hierarchy ({filteredOpsAdminsList.length})
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-mono">
                    Hierarchy Levels L1 – L8
                  </span>
                  <button
                    onClick={() => setShowAddAdminModal(true)}
                    className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-bold border border-purple-500/30 cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Officer</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Officer Name &amp; Title</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Hierarchy Level</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Assigned Modules</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOpsAdminsList.map((adm) => (
                      <tr key={adm.admin_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span>{adm.name}</span>
                            {adm.role === 'SUPER_ADMIN' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <div className="text-[11px] text-slate-400">{adm.level_title}</div>
                          <div className="text-[10px] font-mono text-slate-500">{adm.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                            {adm.department}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-amber-300">L{adm.level}</span>
                          <span className="text-[10px] text-slate-400 block">Level Tier</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              adm.role === 'SUPER_ADMIN'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {adm.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(adm.assigned_modules || ['Operations']).slice(0, 3).map((m, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                {m}
                              </span>
                            ))}
                            {(adm.assigned_modules?.length || 0) > 3 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                                +{(adm.assigned_modules?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setShowPromoteModal(adm);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 font-bold text-xs cursor-pointer border border-purple-500/40"
                          >
                            Elevate / Modify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: FINANCIAL LEDGERS & TREASURY DESK (Condition 7)                    */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Platform Treasury & Escrow Reserve Overview Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-5 rounded-2xl border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">Platform Treasury &amp; Escrow Reserves Desk</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Ops Core
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Statutory aviation reserve fund management, locked business escrows &amp; corporate ledger governance.
                  </p>
                </div>
              </div>
              {onOpenWallet && (
                <button
                  onClick={onOpenWallet}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all self-start sm:self-auto"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Launch Treasury &amp; Reserve Console</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Reserve Cap</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">₹15,00,000 INR</div>
                <div className="text-[10px] text-emerald-400">100% Fully Backed</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Locked Escrow Pool</div>
                <div className="text-base font-bold text-amber-300 font-mono mt-0.5">₹3,85,000 INR</div>
                <div className="text-[10px] text-slate-400">Active deal collateral</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Liquid Reserve Buffer</div>
                <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">₹11,15,000 INR</div>
                <div className="text-[10px] text-slate-400">Unencumbered liquidity</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Statutory Ratio</div>
                <div className="text-base font-bold text-sky-300 font-mono mt-0.5">92.4%</div>
                <div className="text-[10px] text-emerald-400">Meets 80% Min Threshold</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userTxSearch}
                onChange={(e) => setUserTxSearch(e.target.value)}
                placeholder="Filter transactions by business, description, or action..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => setShowInitiateDebitModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Initiate 2-Stage Debit</span>
            </button>
          </div>

          {/* Consolidated Business Transaction Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Consolidated Corporate Ledger (Credits &amp; Debits)</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Real-Time Sync</span>
            </div>

            <div className="divide-y divide-slate-800">
              {businesses.map((biz) => {
                const txs = biz.corporate_wallet?.transactions || [];
                const filteredTxs = txs.filter(
                  (t) =>
                    t.description.toLowerCase().includes(userTxSearch.toLowerCase()) ||
                    biz.organization_name.toLowerCase().includes(userTxSearch.toLowerCase())
                );

                if (userTxSearch && filteredTxs.length === 0) return null;

                return (
                  <div key={biz.business_id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-white">{biz.organization_name}</span>
                        <span className="ml-2 text-xs text-slate-400 font-mono">
                          Wallet ID: {biz.corporate_wallet?.wallet_id}
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xs text-slate-400">Current Balance: </span>
                        <span className="text-sm font-bold text-amber-300">
                          {(biz.corporate_wallet?.credit_balance ?? 0).toLocaleString()} Cr
                        </span>
                      </div>
                    </div>

                    {txs.length === 0 ? (
                      <p className="text-xs text-slate-500 italic pl-3">No transactions recorded yet.</p>
                    ) : (
                      <div className="space-y-1.5 pl-3">
                        {filteredTxs.map((t) => (
                          <div
                            key={t.id}
                            className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                          >
                            <div className="flex items-center space-x-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  t.credits > 0 ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              <span className="text-slate-300">{t.description}</span>
                              {t.actionType && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400">
                                  {t.actionType}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-[11px] text-slate-500">
                                {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span
                                className={`font-bold ${
                                  t.credits > 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {t.credits > 0 ? `+${t.credits}` : t.credits} Cr
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: API & CONTRACTS INSPECTOR (Ops & System Contracts Module)           */}
      {/* ========================================================================= */}
      {activeTab === 'api_inspector' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-5 rounded-2xl border border-sky-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">TRD API &amp; System State Inspector</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      Live Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Live endpoint telemetry, payload inspections, and TRD contracts (TRD-101 to TRD-112).
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => {
                    setApiLogs(db.getApiLogs());
                    showToast('API logs refreshed from mock store.', 'success');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Logs</span>
                </button>
                {apiLogs.length > 0 && (
                  <button
                    onClick={() => {
                      db.clearApiLogs();
                      setApiLogs([]);
                      showToast('API telemetry logs cleared.', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer border border-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                )}
                {onOpenApiInspector && (
                  <button
                    onClick={onOpenApiInspector}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md shadow-sky-600/20"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Open Floating Modal</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter and stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Captured Calls</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">{apiLogs.length}</div>
                <div className="text-[10px] text-sky-400">In-Memory Audit Buffer</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Success Rate</div>
                <div className="text-base font-bold text-emerald-300 font-mono mt-0.5">
                  {apiLogs.length > 0
                    ? `${Math.round((apiLogs.filter((l) => l.statusCode >= 200 && l.statusCode < 300).length / apiLogs.length) * 100)}%`
                    : '100%'}
                </div>
                <div className="text-[10px] text-emerald-400">HTTP 200/201/204</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Active Endpoints</div>
                <div className="text-base font-bold text-amber-300 font-mono mt-0.5">14 Standard TRD</div>
                <div className="text-[10px] text-slate-400">Auth, ERP, Escrow, KYC</div>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Avg Roundtrip</div>
                <div className="text-base font-bold text-purple-300 font-mono mt-0.5">42 ms</div>
                <div className="text-[10px] text-emerald-400">Zero Network Lag</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={apiLogSearch}
                onChange={(e) => setApiLogSearch(e.target.value)}
                placeholder="Search by endpoint, status, or request payload..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Method:</span>
              <select
                value={apiFilterMethod}
                onChange={(e) => setApiFilterMethod(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>

          {/* TRD Contract Specifications Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 font-mono">TRD-101</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">VERIFIED</span>
              </div>
              <div className="text-xs font-semibold text-white">RBAC Security Matrix</div>
              <p className="text-[11px] text-slate-400">Strict separation of 4 roles: Standard User, Business, Admin, Super Admin.</p>
            </div>
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 font-mono">TRD-102</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">VERIFIED</span>
              </div>
              <div className="text-xs font-semibold text-white">Escrow &amp; Reserve Cap</div>
              <p className="text-[11px] text-slate-400">Mandatory ₹15L platform reserve cap and 80% escrow solvency assurance.</p>
            </div>
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 font-mono">TRD-103</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">VERIFIED</span>
              </div>
              <div className="text-xs font-semibold text-white">Commission Ledger</div>
              <p className="text-[11px] text-slate-400">Real-time immutable split calculation for multi-tier deal closures.</p>
            </div>
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 font-mono">TRD-104</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">VERIFIED</span>
              </div>
              <div className="text-xs font-semibold text-white">Ledger Immutability</div>
              <p className="text-[11px] text-slate-400">Cryptographically-signed audit trail for all admin actions and fund debits.</p>
            </div>
          </div>

          {/* Live API Traffic Log List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-2">
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Live HTTP Network Traffic ({apiLogs.length})</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const headers = ['Log ID', 'Timestamp', 'HTTP Method', 'Endpoint', 'Status Code'];
                    const rows = apiLogs.map((l) => [
                      `"${l.id}"`,
                      `"${l.timestamp}"`,
                      `"${l.method}"`,
                      `"${l.endpoint}"`,
                      `"${l.statusCode}"`,
                    ]);
                    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `truvaer_api_traffic_audit_${Date.now()}.csv`;
                    link.click();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-[11px] flex items-center space-x-1 border border-slate-700 cursor-pointer"
                  title="Export live network traffic audit log as CSV"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
                <span className="text-xs text-slate-400 font-mono">Ops Handshake Monitored</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {(() => {
                const filtered = apiLogs.filter((log) => {
                  const matchMethod = apiFilterMethod === 'ALL' || log.method.toUpperCase() === apiFilterMethod;
                  const matchSearch =
                    !apiLogSearch ||
                    log.endpoint.toLowerCase().includes(apiLogSearch.toLowerCase()) ||
                    JSON.stringify(log.requestPayload || {}).toLowerCase().includes(apiLogSearch.toLowerCase()) ||
                    JSON.stringify(log.responsePayload || {}).toLowerCase().includes(apiLogSearch.toLowerCase());
                  return matchMethod && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      {apiLogs.length === 0
                        ? 'No network traffic captured yet in this session. Perform any action in the portal to log traffic.'
                        : 'No API calls match your current filters.'}
                    </div>
                  );
                }

                return filtered.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3 font-mono text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.method === 'POST'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {log.method}
                        </span>
                        <span className="text-white font-bold">{log.endpoint}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {log.statusCode} {log.statusCode >= 200 && log.statusCode < 300 ? 'OK' : 'ERR'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Request Payload:</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(log.requestPayload, null, 2));
                              setCopiedLogId(`req_${log.id}`);
                              setTimeout(() => setCopiedLogId(null), 2000);
                              showToast('Request payload copied to clipboard.', 'success');
                            }}
                            className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedLogId === `req_${log.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span className="text-[10px]">Copy</span>
                          </button>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-36">
                          {JSON.stringify(log.requestPayload, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Response Snapshot:</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(log.responsePayload, null, 2));
                              setCopiedLogId(`res_${log.id}`);
                              setTimeout(() => setCopiedLogId(null), 2000);
                              showToast('Response payload copied to clipboard.', 'success');
                            }}
                            className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedLogId === `res_${log.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span className="text-[10px]">Copy</span>
                          </button>
                        </div>
                        <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-36">
                          {JSON.stringify(log.responsePayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: PUBLICATION DESK (Condition 1: Admin-Only Control)                */}
      {/* ========================================================================= */}
      {activeTab === 'publications' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Directory Publication Governance</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Finance &amp; Operations Clearance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Requirement 3: Finance and Operations departments are authorized to edit, approve, publish, and restrict business listings.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Status Filter:</span>
              <select
                value={publicationFilter}
                onChange={(e) => setPublicationFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 cursor-pointer"
              >
                <option value="All">All Statuses ({listings.length})</option>
                <option value="PUBLISHED">Published</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Department Action Authorization Notice */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            activeAdmin?.department === 'Finance' || activeAdmin?.department === 'Operations' || activeAdmin?.department === 'Senior Management Team'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                <strong>Active Operator ({activeAdmin?.name || 'Administrator'} - {activeAdmin?.department} Dept):</strong>{' '}
                {activeAdmin?.department === 'Finance'
                  ? 'Finance Department holds full authorization to edit and approve business listings in this directory.'
                  : activeAdmin?.department === 'Operations'
                  ? 'Operations Department holds full authorization to edit and approve business listings in this directory.'
                  : activeAdmin?.department === 'Senior Management Team'
                  ? 'Senior Management holds full super-admin approval clearance across all business listings.'
                  : 'Notice: Your current department has read-only access. Switch to Finance or Operations above to edit/approve.'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredListings.map((item) => {
              const status = item.publication_status || 'PUBLISHED';
              const maskedPhone = maskPhoneNumber(item.phone);
              const parsedEmail = parseEmailForMasking(item.email);

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{item.name}</h4>
                      <p className="text-xs text-blue-300">
                        {item.category}{item.subCategory ? ` • ${item.subCategory}` : ''} • {item.city} ({item.country})
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : status === 'RESTRICTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : status === 'PENDING_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {item.restricted_reason && (
                    <div className="p-2 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-200">
                      <span className="font-bold">Restriction Reason:</span> {item.restricted_reason}
                    </div>
                  )}

                  {/* Masked details */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Phone:</span>
                      <span className="text-white">{maskedPhone.masked}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Email:</span>
                      <span>
                        <span className="blur-[3px] select-none text-white">{parsedEmail.username}</span>
                        <span>@{parsedEmail.domain}</span>
                      </span>
                    </div>
                  </div>

                  {status === 'PENDING_APPROVAL' && (
                    <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                      <span><strong>Authentication Required:</strong> Newly added business listing awaiting admin verification before going live on the marketplace to prevent fraudulent accounts.</span>
                    </div>
                  )}

                  {/* Admin Governance Quick Actions */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                    {status !== 'PUBLISHED' && (
                      <button
                        onClick={() => handleSetPublicationStatus(item.id, 'PUBLISHED')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors flex items-center space-x-1"
                        title="Authenticate business listing and publish live to marketplace"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{status === 'PENDING_APPROVAL' ? 'Authenticate & Approve Live' : 'Publish Live'}</span>
                      </button>
                    )}

                    {status !== 'RESTRICTED' && (
                      <button
                        onClick={() => handleSetPublicationStatus(item.id, 'RESTRICTED')}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] transition-colors"
                      >
                        Restrict Publication
                      </button>
                    )}

                    {status !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleSetPublicationStatus(item.id, 'SUSPENDED')}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                      >
                        Suspend
                      </button>
                    )}

                    <button
                      onClick={() => setEditingListing({ ...item })}
                      className="px-2 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-900 text-blue-200 text-[11px] flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteListing(item.id, item.name)}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-300 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5B. TAB: REPORTED & BLOCKED BUSINESSES MODERATION DESK                    */}
      {/* ========================================================================= */}
      {activeTab === 'moderation_reports' && (
        <AdminModerationDesk
          activeAdmin={activeAdmin}
          onRefreshAll={loadAllData}
        />
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 6. TAB: CENTRALIZED CREDIT & DEBIT MATRIX (SINGLE ROOF COMMAND HUB)       */}
      {/* ========================================================================= */}
      {activeTab === "debit_approvals" && (
        <CentralizedCreditDebitMatrix
          activeAdminUser={activeAdmin}
          onRefreshAll={loadAllData}
        />
      )}

      {/* ========================================================================= */}
      {/* 6.9 TAB: HUMAN RESOURCE (HR & HRMS SYSTEM AT ONE MODULE)                   */}
      {/* ========================================================================= */}
      {activeTab === 'human_resource' && (
        <HumanResourceHRMSModule
          onRefreshAll={onRefreshAll}
          currentUserRole={activeAdmin?.role}
        />
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: DEPARTMENT HIERARCHY (L0 TO L8) (Condition 8)                      */}
      {/* ========================================================================= */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Aviation Governance &amp; Department Hierarchy</h3>
              <p className="text-xs text-slate-400">
                Condition 8: All departments present (Sales, Marketing, Finance, Operations, HR, Senior Management, Customer Care) with Levels 0 through 8 reporting managers.
              </p>
            </div>
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              title="Admin can create account directly for new admin portal users"
            >
              <Plus className="w-4 h-4" />
              <span>Create Admin Account (Direct Portal Access)</span>
            </button>
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setSelectedDeptFilter('All')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                selectedDeptFilter === 'All'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              All Departments ({allAdmins.length})
            </button>
            {ADMIN_DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptFilter(dept.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                  selectedDeptFilter === dept.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {dept.id}
              </button>
            ))}
          </div>

          {/* Hierarchy Display by Level */}
          <div className="space-y-4">
            {[8, 7, 6, 5, 4, 3, 2, 1, 0].map((lvlNum) => {
              const lvl = lvlNum as AdminLevel;
              const meta = ADMIN_LEVELS_META[lvl];
              const adminsAtLevel = filteredAdmins.filter((a) => (a.level ?? 0) === lvl);

              if (adminsAtLevel.length === 0 && selectedDeptFilter !== 'All') return null;

              return (
                <div
                  key={lvl}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                        L{lvl}
                      </span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {meta.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {meta.reportsTo !== null ? `Reports to L${meta.reportsTo}` : 'Executive Chairman (Apex)'}
                    </span>
                  </div>

                  {adminsAtLevel.length === 0 ? (
                    <p className="text-xs text-slate-500 italic pl-2">No personnel currently slotted at Level {lvl}.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {adminsAtLevel.map((adm) => (
                        <div
                          key={adm.admin_id}
                          className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-white text-xs">{adm.name}</div>
                              <div className="text-[11px] text-amber-300">{adm.department}</div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                              {adm.role}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 font-mono">
                            <div>Email: {adm.email}</div>
                            <div>
                              Reporting to:{' '}
                              <span className="text-slate-300">
                                {adm.reporting_manager_name || 'Board of Directors'}
                              </span>
                            </div>
                          </div>

                          {/* Actions: Request Promotion & Demotion to downgrade level */}
                          <div className="pt-2 border-t border-slate-850 flex items-center justify-end space-x-2">
                            {lvl > 0 && (
                              <button
                                onClick={() => {
                                  setShowDemoteModal(adm);
                                  setDemoteForm({
                                    target_level: Math.max(0, (adm.level ?? 1) - 1) as AdminLevel,
                                    target_title: '',
                                    reason: '',
                                  });
                                }}
                                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer bg-rose-950/30 px-2 py-0.5 rounded-lg border border-rose-500/20"
                                title="Demote / Downgrade Personnel Level"
                              >
                                <span>Demote</span>
                                <ArrowDownRight className="w-3 h-3" />
                              </button>
                            )}
                            {lvl < 8 && (
                              <button
                                onClick={() => {
                                  setShowPromoteModal(adm);
                                  setPromotionForm({
                                    target_level: Math.min(8, (adm.level ?? 0) + 1) as AdminLevel,
                                    requested_permission: `L${(adm.level ?? 0) + 1} Enhanced Operational Authorization`,
                                    reason: '',
                                  });
                                }}
                                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1 cursor-pointer bg-purple-950/30 px-2 py-0.5 rounded-lg border border-purple-500/20"
                                title="Request Hierarchy Promotion"
                              >
                                <span>Promote</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB: 2-LEVEL PROMOTION APPROVALS (Condition 9)                         */}
      {/* ========================================================================= */}
      {activeTab === 'promotion_approvals' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white">2-Level Mandatory Promotion &amp; Permission Desk</h3>
            <p className="text-xs text-slate-400 mt-1">
              Condition 9: If any higher level request permission for addition permission for lower level then 2 level approval is mandatory (e.g. if L0 is promoted to L1, then L2 and L3 must approve to provide additional access).
            </p>
          </div>

          <div className="space-y-4">
            {promotionRequests.map((p) => {
              const isLevel1Pending = p.overall_status === 'PENDING_LEVEL_1';
              const isLevel2Pending = p.overall_status === 'PENDING_LEVEL_2';
              const isApproved = p.overall_status === 'APPROVED';
              const isRejected = p.overall_status === 'REJECTED';
              const isOnHold = p.overall_status === 'ON_HOLD';

              return (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-purple-400 font-bold">{p.id}</span>
                        <h4 className="text-base font-bold text-white">{p.admin_name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {p.department}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Elevation Target: Level {p.current_level} &rarr; Level {p.target_level} • Requested: {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {isOnHold ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                        <PauseCircle className="w-3 h-3 text-amber-400" />
                        <span>ON_HOLD</span>
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isLevel1Pending
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {p.overall_status}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div>
                      <span className="font-bold text-white">Requested Permission:</span> {p.requested_permission}
                    </div>
                    <div className="text-slate-400">
                      <span className="font-bold text-white">Justification:</span> {p.reason}
                    </div>
                  </div>

                  {/* Top Management Rejection Override Alert Banner */}
                  {isOnHold && (
                    <div className="bg-rose-950/40 border border-rose-500/50 p-3.5 rounded-xl text-xs space-y-1.5 shadow-inner">
                      <div className="flex items-center space-x-2 text-rose-300 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="uppercase tracking-wider text-[11px]">Top Management Rejection Override Active</span>
                        <span className="px-2 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                          STATUS: ON_HOLD
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs">
                        Mandatory Status Note: &ldquo;{p.on_hold_note || p.status_message || 'Top management has rejected the promotion.'}&rdquo;
                      </p>
                      {p.rejected_by && (
                        <p className="text-slate-400 text-[11px]">
                          Actioned by: <span className="text-slate-200 font-bold">{p.rejected_by}</span> {p.rejection_date ? `on ${new Date(p.rejection_date).toLocaleString()}` : ''}
                        </p>
                      )}
                      <div className="text-[10px] text-amber-300 font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800 flex items-center space-x-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>All prior supervisory approvals (L1–L6) have been nullified. Candidate promotion placed on hold. HR personnel and submitting manager notified.</span>
                      </div>
                    </div>
                  )}

                  {/* 2-Level Approval Progress */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* First Level Approval (e.g. L2 Lead) */}
                    <div
                      className={`p-3.5 rounded-xl border ${
                        p.first_approval_status === 'APPROVED'
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                          : p.first_approval_status === 'REJECTED'
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          1st Mandatory Level (Level {p.first_approver_level})
                        </span>
                        {p.first_approval_status === 'APPROVED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : p.first_approval_status === 'REJECTED' ? (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      {p.first_approval_status === 'APPROVED' ? (
                        <div className="text-[11px]">
                          Approved by: {p.first_approver_name}
                          <div className="text-[10px] text-emerald-400/80">
                            {p.first_approval_date && new Date(p.first_approval_date).toLocaleString()}
                          </div>
                        </div>
                      ) : p.first_approval_status === 'REJECTED' ? (
                        <div className="text-[11px] text-rose-300">
                          {p.prior_approvals_nullified
                            ? 'Approval nullified by Top Management override.'
                            : 'First level rejected.'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-400">
                            Requires approval from Level {p.first_approver_level} Officer ({p.first_approver_name || 'Designated Lead'}).
                          </p>
                          {isLevel1Pending && (
                            <button
                              onClick={() => handleApprovePromotionLevel1(p.id)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Grant 1st Level Approval
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Second Level Approval (e.g. L3 Manager) */}
                    <div
                      className={`p-3.5 rounded-xl border ${
                        p.second_approval_status === 'APPROVED'
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                          : p.second_approval_status === 'REJECTED'
                          ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                          : p.first_approval_status === 'APPROVED'
                          ? 'bg-sky-950/30 border-sky-500/30 text-sky-200'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          2nd Mandatory Level (Level {p.second_approver_level})
                        </span>
                        {p.second_approval_status === 'APPROVED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : p.second_approval_status === 'REJECTED' ? (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      {p.second_approval_status === 'APPROVED' ? (
                        <div className="text-[11px]">
                          Approved by: {p.second_approver_name}
                          <div className="text-[10px] text-emerald-400/80">
                            {p.second_approval_date && new Date(p.second_approval_date).toLocaleString()}
                          </div>
                        </div>
                      ) : p.second_approval_status === 'REJECTED' ? (
                        <div className="text-[11px] text-rose-300">
                          {p.prior_approvals_nullified
                            ? 'Approval nullified by Top Management override.'
                            : 'Second level rejected.'}
                        </div>
                      ) : isLevel2Pending ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-sky-300">
                            Awaiting 2nd Level sign-off from Level {p.second_approver_level} Officer ({p.second_approver_name || 'Designated Supervisor'}).
                          </p>
                          <button
                            onClick={() => handleApprovePromotionLevel2(p.id)}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Grant 2nd Level Approval &amp; Elevate
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">Locked until 1st Level approval is achieved.</p>
                      )}
                    </div>
                  </div>

                  {/* Action controls: Reject Promotion (Available for pending nominations, or Super Admin / L7 / L8 on any active nomination) */}
                  {(isLevel1Pending || isLevel2Pending || ((isSuperAdmin || (activeAdmin?.level ?? 0) >= 7) && !isRejected && !isOnHold)) && (
                    <div className="pt-2 text-right">
                      <button
                        onClick={() => handleRejectPromotion(p.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
                        title={
                          isSuperAdmin || (activeAdmin?.level ?? 0) >= 7
                            ? 'Top Management Terminal Override: Reject promotion and place candidate on hold'
                            : 'Decline promotion nomination'
                        }
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>
                          {isSuperAdmin || (activeAdmin?.level ?? 0) >= 7
                            ? 'Reject Promotion (Top Management Override)'
                            : 'Reject Promotion'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB: SYSTEM AUDIT & API LOGS (Condition 7)                             */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Immutable System Logs &amp; Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Full access to API requests, publication state transitions, and administrative actions.
              </p>
            </div>
            <button
              onClick={() => {
                db.clearApiLogs();
                loadAllData();
                showToast('Audit log buffer cleared');
              }}
              className="text-xs text-slate-400 hover:text-rose-300 cursor-pointer"
            >
              Clear Buffer
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
            {db.getApiLogs().length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No system events logged in current session.</p>
            ) : (
              db.getApiLogs().map((log) => (
                <div key={log.id} className="p-3 text-xs font-mono space-y-1 hover:bg-slate-950/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="font-bold text-white">{log.endpoint}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Payload: {JSON.stringify(log.requestPayload)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. TAB: CONTROL PANEL SETTINGS (Condition 5)                             */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl space-y-5 shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-white">Platform Lead Unlocking &amp; PII Window Controls</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Condition 5: Configure credit debit &lsquo;x&rsquo; cost and the 30-day blur revert window managed via control panel.
            </p>
          </div>

          <form onSubmit={handleUpdateGlobalSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Phone Number Unlock Debit Amount (&lsquo;x&rsquo; Credits)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={globalSettings.phoneUnlockCreditCost}
                onChange={(e) =>
                  setGlobalSettings((prev) => ({
                    ...prev,
                    phoneUnlockCreditCost: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Debited from the business user corporate wallet whenever an aviator requests full contact unblur.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Contact Visibility Window (Days before reverting to blur)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={globalSettings.unlockValidityDays}
                onChange={(e) =>
                  setGlobalSettings((prev) => ({
                    ...prev,
                    unlockValidityDays: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Default: 30 days. After this duration, the phone number and email automatically revert to blurred/masked state.
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
            >
              Save Control Panel Configuration
            </button>
          </form>
        </div>
      )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD BUSINESS ACCOUNT (Condition 7)                                 */}
      {/* ========================================================================= */}
      {showAddBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add New Business Account</h3>
              <button onClick={() => setShowAddBusinessModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBusinessSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={newBizForm.organization_name}
                  onChange={(e) => setNewBizForm({ ...newBizForm, organization_name: e.target.value })}
                  placeholder="e.g. AeroLux Jet Charter Services"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Owner / Director</label>
                  <input
                    type="text"
                    value={newBizForm.owner_name}
                    onChange={(e) => setNewBizForm({ ...newBizForm, owner_name: e.target.value })}
                    placeholder="Capt. Rajesh"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newBizForm.category}
                    onChange={(e) => setNewBizForm({ ...newBizForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Private Air Charter">Private Air Charter</option>
                    <option value="Airport & FBO Terminals">Airport &amp; FBO Terminals</option>
                    <option value="MRO & Avionics">MRO &amp; Avionics</option>
                    <option value="Pilot Training & Academies">Pilot Training &amp; Academies</option>
                    <option value="Aviation Fuel & Ground Ops">Aviation Fuel &amp; Ground Ops</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Business Email</label>
                  <input
                    type="email"
                    value={newBizForm.business_email}
                    onChange={(e) => setNewBizForm({ ...newBizForm, business_email: e.target.value })}
                    placeholder="ops@aerolux.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newBizForm.phone_number}
                    onChange={(e) => setNewBizForm({ ...newBizForm, phone_number: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Registration / TAN</label>
                <input
                  type="text"
                  value={newBizForm.registration_number}
                  onChange={(e) => setNewBizForm({ ...newBizForm, registration_number: e.target.value })}
                  placeholder="e.g. CRN-98124-IN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddBusinessModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Provision Account (+5,000 Cr)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT BUSINESS ACCOUNT                                              */}
      {/* ========================================================================= */}
      {showEditBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Modify Business Details</h3>
              <button onClick={() => setShowEditBusinessModal(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBusinessSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  value={showEditBusinessModal.organization_name}
                  onChange={(e) =>
                    setShowEditBusinessModal({ ...showEditBusinessModal, organization_name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={showEditBusinessModal.owner_name}
                    onChange={(e) =>
                      setShowEditBusinessModal({ ...showEditBusinessModal, owner_name: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Verification Status</label>
                  <select
                    value={showEditBusinessModal.verification_status}
                    onChange={(e) =>
                      setShowEditBusinessModal({
                        ...showEditBusinessModal,
                        verification_status: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="HARD_LOCKED">HARD_LOCKED</option>
                    <option value="SOFT_LOCKED">SOFT_LOCKED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Physical Location</label>
                <input
                  type="text"
                  value={showEditBusinessModal.physical_location}
                  onChange={(e) =>
                    setShowEditBusinessModal({ ...showEditBusinessModal, physical_location: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditBusinessModal(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DEACTIVATE BUSINESS ACCOUNT & REFUND BALANCE TO BANK COORDINATES    */}
      {/* ========================================================================= */}
      {deactivateTargetBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white tracking-tight">Deactivate Business Account</h3>
                <p className="text-xs text-slate-400">{deactivateTargetBiz.organization_name} • {deactivateTargetBiz.business_id}</p>
              </div>
              <button
                type="button"
                onClick={() => setDeactivateTargetBiz(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Remaining Balance Card */}
            <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>Remaining Balance To Refund</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  {(deactivateTargetBiz.corporate_wallet?.credit_balance ?? 0).toLocaleString()} Credits
                </span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                ₹{(deactivateTargetBiz.corporate_wallet?.credit_balance ?? 0).toLocaleString()} INR
              </div>
              <p className="text-[11px] text-purple-200 leading-relaxed">
                If the account deactivation is done, all the remaining balance of{' '}
                <strong className="text-white">₹{(deactivateTargetBiz.corporate_wallet?.credit_balance ?? 0).toLocaleString()}</strong> will be transferred back to the account details shared earlier.
              </p>
            </div>

            {/* Recipient Bank Account Coordinates */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Account Details Shared Earlier (Recipient)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">VERIFIED PAYOUT GATEWAY</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Bank Institution:</span>
                  <span className="text-white font-semibold">{deactivateTargetBiz.bank_name || 'Registered Bank'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Masked:</span>
                  <span className="text-white font-semibold">{deactivateTargetBiz.bank_account_number_masked || '••••8899'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">IFSC / SWIFT:</span>
                  <span className="text-white font-semibold">{deactivateTargetBiz.bank_ifsc_swift || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Holder:</span>
                  <span className="text-white font-semibold">{deactivateTargetBiz.bank_account_holder || deactivateTargetBiz.organization_name}</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Deactivation Reason / Audit Record
              </label>
              <textarea
                rows={2}
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Reason for corporate account deactivation..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeactivateTargetBiz(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivateERP}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-2 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Confirm Deactivate &amp; Transfer Balance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INITIATE 2-STAGE WALLET DEBIT (Condition 6)                         */}
      {/* ========================================================================= */}
      {showInitiateDebitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create 2-Stage Debit Request</h3>
              <button onClick={() => setShowInitiateDebitModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateDebitSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Business Account *</label>
                <select
                  required
                  value={debitForm.business_id}
                  onChange={(e) => setDebitForm({ ...debitForm, business_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white cursor-pointer"
                >
                  <option value="">-- Choose Business Account --</option>
                  {businesses.map((b) => (
                    <option key={b.business_id} value={b.business_id}>
                      {b.organization_name} (Balance: {b.corporate_wallet?.credit_balance ?? 0} Cr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Debit Amount (Credits) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={debitForm.amount}
                  onChange={(e) => setDebitForm({ ...debitForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason / Justification *</label>
                <textarea
                  required
                  rows={3}
                  value={debitForm.reason}
                  onChange={(e) => setDebitForm({ ...debitForm, reason: e.target.value })}
                  placeholder="e.g. Monthly airport terminal priority slot allocation surcharge..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200">
                <span className="font-bold">Workflow Rule:</span> Creating this request will initiate Stage 1 (Admin Review). Execution occurs ONLY after final Stage 2 sign-off from Super Admin (Level 8).
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInitiateDebitModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Queue for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ONBOARD ADMIN PERSONNEL (Condition 8)                              */}
      {/* ========================================================================= */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Department Admin Personnel</h3>
              <button onClick={() => setShowAddAdminModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  placeholder="e.g. Alok Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  value={newAdminForm.email}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                  placeholder="alok@yarifly.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Portal Login Password *</label>
                  <input
                    type="text"
                    required
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                    placeholder="admin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Default: admin</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Portal Role</label>
                  <select
                    value={newAdminForm.role}
                    onChange={(e) =>
                      setNewAdminForm({ ...newAdminForm, role: e.target.value as 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                  </select>
                  <span className="text-[10px] text-slate-500">Access role in portal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={newAdminForm.department}
                    onChange={(e) =>
                      setNewAdminForm({ ...newAdminForm, department: e.target.value as AdminDepartment })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white cursor-pointer"
                  >
                    {ADMIN_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Level (L0–L8)</label>
                  <select
                    value={newAdminForm.level}
                    onChange={(e) =>
                      setNewAdminForm({ ...newAdminForm, level: Number(e.target.value) as AdminLevel })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        L{lvl} - {ADMIN_LEVELS_META[lvl as AdminLevel].title.split('-')[1]?.trim() || `Level ${lvl}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reporting Manager (L{newAdminForm.level} &rarr;)</label>
                <select
                  value={newAdminForm.reporting_manager_id}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, reporting_manager_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white cursor-pointer"
                >
                  <option value="">-- Choose Direct Reporting Manager --</option>
                  {allAdmins
                    .filter((a) => (a.level ?? 0) > newAdminForm.level)
                    .map((a) => (
                      <option key={a.admin_id} value={a.admin_id}>
                        {a.name} (L{a.level} - {a.department})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Slot into Hierarchy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT PROMOTION REQUEST (Condition 9)                             */}
      {/* ========================================================================= */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Elevate Personnel Clearance</h3>
                <p className="text-xs text-slate-400">{showPromoteModal.name} (Current: L{showPromoteModal.level})</p>
              </div>
              <button onClick={() => setShowPromoteModal(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPromotionRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Promotion Level</label>
                <select
                  value={promotionForm.target_level}
                  onChange={(e) =>
                    setPromotionForm({ ...promotionForm, target_level: Number(e.target.value) as AdminLevel })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8]
                    .filter((lvl) => lvl > (showPromoteModal.level ?? 0))
                    .map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}: {ADMIN_LEVELS_META[lvl as AdminLevel].title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Requested Additional Permissions *</label>
                <input
                  type="text"
                  required
                  value={promotionForm.requested_permission}
                  onChange={(e) => setPromotionForm({ ...promotionForm, requested_permission: e.target.value })}
                  placeholder="e.g. Lead contact reveal, corporate contract sign-off"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Promotion Reason / Achievements *</label>
                <textarea
                  required
                  rows={3}
                  value={promotionForm.reason}
                  onChange={(e) => setPromotionForm({ ...promotionForm, reason: e.target.value })}
                  placeholder="Describe operational accomplishments..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[11px] text-purple-200">
                <span className="font-bold">Condition 9 Mandatory Rule:</span> Promoting from L{showPromoteModal.level} to L{promotionForm.target_level} mandates 2-Level sign-offs: Level {Math.min(8, promotionForm.target_level + 1)} and Level {Math.min(8, promotionForm.target_level + 2)} must both grant approval.
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Submit for 2-Level Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT DEMOTION REQUEST (Requirement: Downgrade Level)              */}
      {/* ========================================================================= */}
      {showDemoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Downgrade Personnel Level (Demotion)</h3>
                <p className="text-xs text-rose-400">{showDemoteModal.name} (Current: L{showDemoteModal.level})</p>
              </div>
              <button onClick={() => setShowDemoteModal(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDemote} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Lower Level</label>
                <select
                  value={demoteForm.target_level}
                  onChange={(e) =>
                    setDemoteForm({ ...demoteForm, target_level: Number(e.target.value) as AdminLevel })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono cursor-pointer"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7]
                    .filter((lvl) => lvl < (showDemoteModal.level ?? 1))
                    .map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}: {ADMIN_LEVELS_META[lvl as AdminLevel].title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Title / Designation</label>
                <input
                  type="text"
                  value={demoteForm.target_title}
                  onChange={(e) => setDemoteForm({ ...demoteForm, target_title: e.target.value })}
                  placeholder={`e.g. ${ADMIN_LEVELS_META[demoteForm.target_level as AdminLevel]?.title || 'Officer'}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Demotion Reason &amp; Remarks *</label>
                <textarea
                  required
                  rows={3}
                  value={demoteForm.reason}
                  onChange={(e) => setDemoteForm({ ...demoteForm, reason: e.target.value })}
                  placeholder="Provide governing reason for downgrading personnel level..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[11px] text-rose-200">
                <span className="font-bold">Governance Advisory:</span> Demoting will adjust the user's operational rank immediately and update all access rules and reporting chains.
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDemoteModal(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Level Demotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT LISTING DETAILS (Condition 1: Admin-Only)                      */}
      {/* ========================================================================= */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Modify Directory Listing Details</h3>
                <p className="text-xs text-slate-400">Admin Modification Authority</p>
              </div>
              <button onClick={() => setEditingListing(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveListingDetails} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Listing Name</label>
                <input
                  type="text"
                  value={editingListing.name}
                  onChange={(e) => setEditingListing({ ...editingListing, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={editingListing.category}
                    onChange={(e) => setEditingListing({ ...editingListing, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sub-Category</label>
                  <input
                    type="text"
                    value={editingListing.subCategory || ''}
                    onChange={(e) => setEditingListing({ ...editingListing, subCategory: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City Hub</label>
                  <input
                    type="text"
                    value={editingListing.city}
                    onChange={(e) => setEditingListing({ ...editingListing, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={editingListing.country}
                    onChange={(e) => setEditingListing({ ...editingListing, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingListing.phone}
                    onChange={(e) => setEditingListing({ ...editingListing, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={editingListing.email}
                    onChange={(e) => setEditingListing({ ...editingListing, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address / Terminal Location</label>
                <input
                  type="text"
                  value={editingListing.address}
                  onChange={(e) => setEditingListing({ ...editingListing, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Airway Broadcast Modal (Zone, Country, Category) */}
      <AdminBroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        activeAdminUser={activeAdmin}
        onBroadcastPublished={() => {
          loadAllData();
          if (onRefreshAll) onRefreshAll();
        }}
      />

      {/* Bank Verification Audit Modal (Rule 2, 3, 4: Finance & L7+ Clearance) */}
      {bankAuditBiz && (
        <BankVerificationAuditModal
          isOpen={!!bankAuditBiz}
          onClose={() => setBankAuditBiz(null)}
          business={bankAuditBiz}
          activeAdmin={activeAdmin}
          onActionComplete={() => {
            loadAllData();
            if (onRefreshAll) onRefreshAll();
          }}
        />
      )}

      {/* Promotion Rejection Confirmation Modal (In-app modal replacing window.prompt) */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Confirm Promotion Rejection</h3>
                  <p className="text-xs text-slate-400 font-mono">Request #{rejectModalData.id}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalData(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-bold text-white">{rejectModalData.candidateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-200">{rejectModalData.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Elevation Target:</span>
                <span className="font-bold text-purple-400 font-mono">{rejectModalData.elevation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Executing Officer:</span>
                <span className="text-amber-300 font-bold">
                  {activeAdmin?.name} ({activeAdmin?.level_title || `L${activeAdmin?.level}`})
                </span>
              </div>
            </div>

            {rejectModalData.isTopManagement && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Top Management Terminal Override (L7/L8 Authority)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Executing this rejection will immediately abort the approval pipeline, nullify all prior or pending approvals from lower levels (L1–L6), transition the status to <strong>ON_HOLD</strong>, and append the mandatory note: <em>&quot;Top management has rejected the promotion.&quot;</em>
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Rejection Reason / Status Audit Note:
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="Enter justification or remarks..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>
                  {rejectModalData.isTopManagement
                    ? 'Confirm & Apply Top Management Hold'
                    : 'Confirm Rejection'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

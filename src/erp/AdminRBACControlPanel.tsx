import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  Eye,
  Edit3,
  Trash2,
  Globe,
  MapPin,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  DollarSign,
  TrendingUp,
  Package,
  FileCheck,
  Plus,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Search,
  ShieldAlert,
  Sliders,
  FileText,
  UserCheck,
  User,
  Award,
  ArrowRightLeft,
  Briefcase,
  Activity,
  Clock,
  Filter,
  Send,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Info,
  HelpCircle,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  AdminUser,
  RegularUser,
  CustomUserType,
  ModulePermissionAccess,
  ModulePermissionConfig,
  TerritoryScope,
  AviationZone,
  AdminDepartment,
} from '../types';
import { ALL_ZONES, AVIATION_ZONES_MAP } from '../data/aviationGeographies';
import {
  MASTER_APP_MODULES,
  STANDARD_USER_BASELINE_MODULES,
  STANDARD_USER_RESTRICTED_MODULES,
  AppPlatformModule,
} from '../data/modulesMasterList';
import { RolePermissionsManagerView } from './RolePermissionsManagerView';
import { UserModuleAllottedView } from './UserModuleAllottedView';

// Account Holder & Lead Governance Mapping for all platform modules (Item 5)
export const APP_MODULE_ACCOUNT_LEADS: Record<string, { lead: string; role: string; email: string }> = {
  user_dashboard: { lead: 'Aditya Vikram Verma', role: 'Operations Manager L5', email: 'aditya.verma@truvaer.aero' },
  user_assigned_projects: { lead: 'Vikram Sengupta', role: 'Operations Lead L4', email: 'vikram.sengupta@truvaer.aero' },
  user_profile_settings: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8', email: 'aditya.narayana@truvaer.aero' },
  comm_chat: { lead: 'Sarah Jenkins', role: 'Corporate Comms Lead L4', email: 'sarah.jenkins@truvaer.aero' },
  comm_alerts: { lead: 'Sarah Jenkins', role: 'Corporate Comms Lead L4', email: 'sarah.jenkins@truvaer.aero' },
  erp_organisation: { lead: 'Capt. Sameer Khurana', role: 'VP Operations L7', email: 'sameer.khurana@truvaer.aero' },
  sec_pwd_reset: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8', email: 'aditya.narayana@truvaer.aero' },
  sec_privacy_policy: { lead: 'Kavita Menon', role: 'Legal & Compliance Lead L5', email: 'kavita.menon@truvaer.aero' },
  sec_user_agreement: { lead: 'Kavita Menon', role: 'Legal & Compliance Lead L5', email: 'kavita.menon@truvaer.aero' },
  sec_accessibility: { lead: 'Divya Nair', role: 'Customer Care Lead L4', email: 'divya.nair@truvaer.aero' },
  sec_community_guidelines: { lead: 'Capt. Sameer Khurana', role: 'VP Operations L7', email: 'sameer.khurana@truvaer.aero' },
  sys_settings: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8', email: 'aditya.narayana@truvaer.aero' },
  sys_user_management: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8', email: 'aditya.narayana@truvaer.aero' },
  sys_audit_logs: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8', email: 'aditya.narayana@truvaer.aero' },
  fin_billing_management: { lead: 'Sunil Mathur', role: 'Finance Head L6', email: 'sunil.mathur@truvaer.aero' },
  fin_treasury: { lead: 'Manish Agarwal', role: 'Treasury Officer L4', email: 'manish.agarwal@truvaer.aero' },
  fin_store: { lead: 'Sunita Rao', role: 'Procurement & Stores Lead L5', email: 'sunita.rao@truvaer.aero' },
  fin_expenses: { lead: 'Sunil Mathur', role: 'Finance Head L6', email: 'sunil.mathur@truvaer.aero' },
  fin_canteen: { lead: 'Sunita Rao', role: 'Procurement & Stores Lead L5', email: 'sunita.rao@truvaer.aero' },
  fin_intelligence: { lead: 'Sunil Mathur', role: 'Finance Head L6', email: 'sunil.mathur@truvaer.aero' },
  crm_admissions: { lead: 'Divya Nair', role: 'Customer Care & Sales Lead L4', email: 'divya.nair@truvaer.aero' },
  crm_plus: { lead: 'Divya Nair', role: 'Customer Care & Sales Lead L4', email: 'divya.nair@truvaer.aero' },
  hr_main: { lead: 'Priya Deshmukh', role: 'Head of People L6', email: 'priya.deshmukh@truvaer.aero' },
  hr_staff_wall: { lead: 'Priya Deshmukh', role: 'Head of People L6', email: 'priya.deshmukh@truvaer.aero' },
  hr_payroll: { lead: 'Priya Deshmukh', role: 'Head of People L6', email: 'priya.deshmukh@truvaer.aero' },
  hr_pms: { lead: 'Priya Deshmukh', role: 'Head of People L6', email: 'priya.deshmukh@truvaer.aero' },
  erp_sis: { lead: 'Aditya Vikram Verma', role: 'Operations Manager L5', email: 'aditya.verma@truvaer.aero' },
  erp_inventory: { lead: 'Sunita Rao', role: 'Procurement & Stores Lead L5', email: 'sunita.rao@truvaer.aero' },
  erp_dynamic_forms: { lead: 'Aditya Vikram Verma', role: 'Operations Manager L5', email: 'aditya.verma@truvaer.aero' },
  erp_taxonomy: { lead: 'Capt. Sameer Khurana', role: 'VP Operations L7', email: 'sameer.khurana@truvaer.aero' },
  erp_login_stats: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8', email: 'aditya.narayana@truvaer.aero' },
  comm_broadcast: { lead: 'Sarah Jenkins', role: 'Corporate Comms Lead L4', email: 'sarah.jenkins@truvaer.aero' },
  sec_rbac: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8', email: 'aditya.narayana@truvaer.aero' },
  sec_api: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8', email: 'aditya.narayana@truvaer.aero' },
};

// 1-Click Role Profile Templates (Auto-populate all fields including Reason, Reporting To, Zone, Level, Lead)
export interface RoleProfileTemplate {
  id: string;
  name: string;
  key: string;
  label: string;
  level: number;
  levelTitle: string;
  department: string;
  reportingTo: string;
  zone: string;
  accountHolder: string;
  operationalReason: string;
  colorBadge: string;
  description: string;
  defaultAllowedModules: string[];
}

export const ROLE_PROFILE_TEMPLATES: RoleProfileTemplate[] = [
  {
    id: 'tpl_manager',
    name: 'Operations Manager (Level 5)',
    key: 'MANAGER',
    label: 'Operations Manager',
    level: 5,
    levelTitle: 'Operations Manager (L5)',
    department: 'Operations',
    reportingTo: 'Capt. Sameer Khurana (VP Operations L7)',
    zone: 'APAC - Asia Pacific',
    accountHolder: 'Aditya Vikram Verma',
    operationalReason: 'Supervising regional flight corridors, team rosters, and day-to-day airside operations across assigned hubs.',
    colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Autonomous operational management of regional hubs, crew schedules, and flight coordination with L5 clearance.',
    defaultAllowedModules: [
      'user_dashboard',
      'user_assigned_projects',
      'user_profile_settings',
      'comm_chat',
      'comm_alerts',
      'erp_organisation',
      'sec_pwd_reset',
      'sec_privacy_policy',
      'sec_user_agreement',
      'crm_admissions',
      'hr_staff_wall',
      'erp_inventory',
      'erp_dynamic_forms',
      'comm_broadcast',
    ],
  },
  {
    id: 'tpl_customer_care_l7',
    name: 'Customer Care to L7 Escalation Lead (Level 4)',
    key: 'CUSTOMER_CARE_LEAD',
    label: 'Customer Care & L7 Escalation Lead',
    level: 4,
    levelTitle: 'Customer Care & L7 Escalation Lead (L4)',
    department: 'Customer Care',
    reportingTo: 'Capt. Sameer Khurana (VP Operations L7)',
    zone: 'GLOBAL - All Zones',
    accountHolder: 'Divya Nair',
    operationalReason: 'Direct customer dispute resolution and fast-track escalation authority to L7 Directorate for critical flight interventions.',
    colorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'High-priority passenger care lead with direct escalation conduit to L7 Executive Directors and full CRM/support access.',
    defaultAllowedModules: [
      'user_dashboard',
      'user_profile_settings',
      'comm_chat',
      'comm_alerts',
      'crm_admissions',
      'crm_plus',
      'sec_privacy_policy',
      'sec_user_agreement',
      'sec_accessibility',
      'sec_community_guidelines',
    ],
  },
  {
    id: 'tpl_director',
    name: 'Executive Director (Level 7)',
    key: 'EXECUTIVE_DIRECTOR',
    label: 'Executive Director',
    level: 7,
    levelTitle: 'Executive Director (L7)',
    department: 'Directorate',
    reportingTo: 'B Aditya Narayana (Chairman & Super Admin L8)',
    zone: 'GLOBAL - Sovereign Jurisdiction',
    accountHolder: 'Capt. Sameer Khurana',
    operationalReason: 'Executive Directorate governance over multi-region airspaces, budget allocations, safety sign-offs, and department mobility.',
    colorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'L7 Executive oversight across all operational divisions, regional authorizations, and clearance gateway sign-offs.',
    defaultAllowedModules: [
      'user_dashboard',
      'user_assigned_projects',
      'user_profile_settings',
      'comm_chat',
      'comm_alerts',
      'erp_organisation',
      'sec_pwd_reset',
      'sec_privacy_policy',
      'sec_user_agreement',
      'fin_billing_management',
      'fin_treasury',
      'fin_expenses',
      'fin_intelligence',
      'crm_admissions',
      'crm_plus',
      'hr_main',
      'hr_staff_wall',
      'hr_payroll',
      'hr_pms',
      'erp_sis',
      'erp_inventory',
      'erp_dynamic_forms',
      'erp_taxonomy',
      'erp_login_stats',
      'comm_broadcast',
      'sec_rbac',
    ],
  },
  {
    id: 'tpl_operations_coordinator',
    name: 'Operations & Fleet Coordinator (Level 4)',
    key: 'OPERATIONS_COORDINATOR',
    label: 'Operations & Fleet Coordinator',
    level: 4,
    levelTitle: 'Operations Coordinator (L4)',
    department: 'Operations',
    reportingTo: 'Aditya Vikram Verma (Operations Manager L5)',
    zone: 'APAC - Asia Pacific',
    accountHolder: 'Vikram Sengupta',
    operationalReason: 'Fleet turnaround scheduling, ramp logistics supervision, ground crew assignment, and fuel bay coordination.',
    colorBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Ramp and ground turnaround scheduling, slot coordination, and operations hub support.',
    defaultAllowedModules: [
      'user_dashboard',
      'user_assigned_projects',
      'user_profile_settings',
      'comm_chat',
      'comm_alerts',
      'erp_organisation',
      'sec_pwd_reset',
      'erp_inventory',
      'comm_broadcast',
    ],
  },
  {
    id: 'tpl_finance',
    name: 'Treasury & Finance Officer (Level 3)',
    key: 'FINANCE_OFFICER',
    label: 'Finance & Treasury Officer',
    level: 3,
    levelTitle: 'Treasury Officer (L3)',
    department: 'Finance',
    reportingTo: 'Sunil Mathur (Finance Head L6)',
    zone: 'APAC - Asia Pacific',
    accountHolder: 'Manish Agarwal',
    operationalReason: 'Charter escrow balancing, fuel invoice reconciliation, vendor disbursements, and daily ledger entries.',
    colorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Daily ledger reconciliation, payout batch preparations, and charter accounting audits.',
    defaultAllowedModules: [
      'user_dashboard',
      'user_profile_settings',
      'fin_treasury',
      'fin_store',
      'fin_expenses',
      'fin_canteen',
      'sec_pwd_reset',
      'sec_privacy_policy',
    ],
  },
  {
    id: 'tpl_standard',
    name: 'Standard User / Aviator Baseline (Level 0)',
    key: 'STANDARD_USER',
    label: 'Standard User (Aviator)',
    level: 0,
    levelTitle: 'Standard Aviator (L0)',
    department: 'Commercial',
    reportingTo: 'Customer Care & Operations Desk',
    zone: 'APAC - Asia Pacific',
    accountHolder: 'Standard User / Aviator Account Holder',
    operationalReason: 'Baseline aviator account for bookings, personal itineraries, notifications, and profile management.',
    colorBadge: 'bg-slate-700/40 text-slate-300 border-slate-600',
    description: 'Default baseline access tier for individual aviators and external marketplace users.',
    defaultAllowedModules: [
      'user_dashboard',
      'user_assigned_projects',
      'user_profile_settings',
      'comm_chat',
      'comm_alerts',
      'erp_organisation',
      'sec_pwd_reset',
      'sec_privacy_policy',
      'sec_user_agreement',
      'sec_accessibility',
      'sec_community_guidelines',
    ],
  },
];

export type RBACPanelView =
  | 'matrix'
  | 'permission_page'
  | 'module_image'
  | 'roles'
  | 'regional_governance'
  | 'das';

interface AdminRBACControlPanelProps {
  onPermissionsUpdated?: () => void;
  activeAdminUser?: AdminUser | null;
  initialSubTab?: RBACPanelView;
  onSwitchActiveUser?: (user: RegularUser) => void;
}

export const AdminRBACControlPanel: React.FC<AdminRBACControlPanelProps> = ({
  onPermissionsUpdated,
  activeAdminUser,
  initialSubTab,
  onSwitchActiveUser,
}) => {
  // Navigation sub-tab within the RBAC Control Panel
  const [panelView, setPanelView] = useState<RBACPanelView>(initialSubTab || 'matrix');

  useEffect(() => {
    if (initialSubTab) {
      setPanelView(initialSubTab);
    }
  }, [initialSubTab]);

  // Master lists
  const [customRoles, setCustomRoles] = useState<CustomUserType[]>(db.getCustomUserTypes());
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>(db.getRegularUsers());
  const [allAdmins, setAllAdmins] = useState<AdminUser[]>(db.getAdminUsers());

  // Search & Filter (Extended Filter Suite)
  const [moduleSearch, setModuleSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [levelTierFilter, setLevelTierFilter] = useState<'ALL' | 'EXECUTIVE' | 'MANAGEMENT' | 'OPERATIONS' | 'STANDARD'>('ALL');
  const [specificLevelFilter, setSpecificLevelFilter] = useState<string>('ALL');
  const [moduleStatusFilter, setModuleStatusFilter] = useState<'ALL' | 'ENABLED' | 'RESTRICTED' | 'PENDING_L7_L8'>('ALL');
  const [roleColumnFilter, setRoleColumnFilter] = useState<string>('ALL');
  const [capabilityFilter, setCapabilityFilter] = useState<'ALL' | 'create' | 'read' | 'update' | 'delete'>('ALL');
  const [governanceScopeFilter, setGovernanceScopeFilter] = useState<'ALL' | 'REGIONAL_GATED' | 'LEAST_PRIVILEGE' | 'UNIVERSAL'>('ALL');
  const [showApprovalDrawer, setShowApprovalDrawer] = useState(false);
  const [showMatrixGuide, setShowMatrixGuide] = useState(false);

  // Clearance approval queue for strict L7 / L8 gatekeeper workflow
  const [pendingClearanceApprovals, setPendingClearanceApprovals] = useState<{
    id: string;
    roleKey: string;
    roleLabel: string;
    moduleId: string;
    moduleName: string;
    actionType: 'ENABLE_MODULE' | 'ASSIGN_TASK' | 'ADD_ZONE' | 'ADD_RESPONSIBILITY';
    details: string;
    requestedBy: string;
    requestedByLevel: number;
    status: 'PENDING_L7_L8' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('truvaer_pending_clearance_approvals');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'REQ-CLR-0104',
        roleKey: 'MANAGER',
        roleLabel: 'Operations Manager (L5+)',
        moduleId: 'sec_pwd_reset',
        moduleName: 'Credential & Key Management',
        actionType: 'ENABLE_MODULE',
        details: 'Request to enable Credential & Key Management for L5 Operations Managers.',
        requestedBy: 'Aditya Vikram Verma (Operations Lead)',
        requestedByLevel: 5,
        status: 'PENDING_L7_L8',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'REQ-CLR-0105',
        roleKey: 'SERVICE_SPECIALIST',
        roleLabel: 'B2B Services & Platform Operations',
        moduleId: 'comm_broadcast',
        moduleName: 'Airway Broadcast Composer',
        actionType: 'ADD_ZONE',
        details: 'Addition of ANZ & EMEA zone broadcast dispatch capability for B2B Services Lead.',
        requestedBy: 'Sarah Jenkins (Growth Lead)',
        requestedByLevel: 3,
        status: 'PENDING_L7_L8',
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
    ];
  });

  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [assignTaskForm, setAssignTaskForm] = useState<{
    targetRoleKey: string;
    actionType: 'ENABLE_MODULE' | 'ASSIGN_TASK' | 'ADD_ZONE' | 'ADD_RESPONSIBILITY';
    targetModuleId: string;
    targetZone: AviationZone;
    taskTitle: string;
    responsibilityScope: string;
    justification: string;
  }>({
    targetRoleKey: 'MANAGER',
    actionType: 'ENABLE_MODULE',
    targetModuleId: 'crm_deal_tracking',
    targetZone: 'APAC',
    taskTitle: '',
    responsibilityScope: '',
    justification: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem('truvaer_pending_clearance_approvals', JSON.stringify(pendingClearanceApprovals));
    } catch {
      // ignore
    }
  }, [pendingClearanceApprovals]);

  // Selected User for User-level Override
  const [selectedUserId, setSelectedUserId] = useState<string>(regularUsers[0]?.user_id || '');
  const selectedUser = regularUsers.find((u) => u.user_id === selectedUserId) || regularUsers[0];

  // Selected Admin for Regional Governance
  const [selectedAdminId, setSelectedAdminId] = useState<string>(allAdmins[0]?.admin_id || '');
  const selectedAdmin = allAdmins.find((a) => a.admin_id === selectedAdminId) || allAdmins[0];

  // Regional Governance State for Selected Admin
  const [assignedRegions, setAssignedRegions] = useState<AviationZone[]>(
    selectedAdmin?.assigned_regions || ['APAC']
  );
  const [territoryScope, setTerritoryScope] = useState<TerritoryScope>(
    selectedAdmin?.territory_scope || { zone: 'All Zones', country: 'All Countries', territory: 'All Hubs' }
  );

  // Dynamic Allocation System (DAS) States
  const [selectedManagerId, setSelectedManagerId] = useState<string>(() => {
    const l5Plus = allAdmins.find((a) => (a.level ?? 0) >= 5);
    return l5Plus?.admin_id || allAdmins[0]?.admin_id || '';
  });
  const selectedManager = allAdmins.find((a) => a.admin_id === selectedManagerId) || allAdmins[0];

  const [managerDepts, setManagerDepts] = useState<AdminDepartment[]>(
    selectedManager?.assigned_departments || [selectedManager?.department || 'Operations']
  );
  const [managerZones, setManagerZones] = useState<AviationZone[]>(
    selectedManager?.assigned_regions || ['APAC']
  );

  // Sync DAS manager selection
  useEffect(() => {
    if (selectedManager) {
      setManagerDepts(selectedManager.assigned_departments || [selectedManager.department || 'Operations']);
      setManagerZones(selectedManager.assigned_regions || ['APAC']);
    }
  }, [selectedManagerId]);

  // DAS Staff Mobility (L1-L4)
  const l1to4Staff = allAdmins.filter((a) => (a.level ?? 0) <= 4);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return l1to4Staff[0]?.admin_id || '';
  });
  const selectedStaff = allAdmins.find((a) => a.admin_id === selectedStaffId) || l1to4Staff[0] || allAdmins[0];
  const [targetStaffDept, setTargetStaffDept] = useState<AdminDepartment>('Operations');
  const [mobilityReason, setMobilityReason] = useState<string>(
    'Performance-based mobility transfer: Operational capability reallocation.'
  );

  // Role CRUD Modal / Form state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({
    key: '',
    label: '',
    description: '',
    level: 5,
    levelTitle: 'Operations Manager (L5)',
    department: 'Operations',
    reportingTo: 'Capt. Sameer Khurana (VP Operations L7)',
    zone: 'APAC - Asia Pacific',
    accountHolder: 'Aditya Vikram Verma',
    operationalReason: 'Supervising regional flight corridors, team rosters, and day-to-day airside operations across assigned hubs.',
    defaultAllowedModules: [] as string[],
    colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  });

  // Granular Actions State per Role & Module: Record<roleKey_moduleId, { canCreate, canRead, canUpdate, canDelete }>
  const [granularActions, setGranularActions] = useState<
    Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>
  >(() => {
    try {
      const saved = localStorage.getItem('truvaer_rbac_granular_actions');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default baseline permissions
    const init: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }> = {};
    const roles = db.getCustomUserTypes();
    roles.forEach((r) => {
      MASTER_APP_MODULES.forEach((m) => {
        const isAllowed = r.defaultAllowedModules.includes(m.id);
        const isSuperOrAdmin = r.key === 'SUPER_ADMIN' || r.key === 'ADMIN';
        init[`${r.key}_${m.id}`] = {
          create: isSuperOrAdmin ? true : isAllowed && !m.id.startsWith('sec_'),
          read: isAllowed,
          update: isSuperOrAdmin ? true : isAllowed && (m.id.includes('profile') || m.id.includes('project')),
          delete: isSuperOrAdmin,
        };
      });
    });
    return init;
  });

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const refreshAll = () => {
    setCustomRoles(db.getCustomUserTypes());
    setRegularUsers(db.getRegularUsers());
    setAllAdmins(db.getAdminUsers());
    if (onPermissionsUpdated) onPermissionsUpdated();
  };

  const effectiveLevel = activeAdminUser?.level ?? 8;
  const isL7OrL8 = effectiveLevel >= 7;

  const handleApproveClearanceRequest = (requestId: string) => {
    if (!isL7OrL8) {
      showNotice('Access Denied: Only L7 Directors or L8 Executive Chairman can approve clearance requests.', 'error');
      return;
    }
    const req = pendingClearanceApprovals.find((r) => r.id === requestId);
    if (!req) return;

    setPendingClearanceApprovals((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'APPROVED' as const,
              approvedBy: activeAdminUser?.name || 'Executive Chairman (L8)',
              approvedAt: new Date().toISOString(),
            }
          : r
      )
    );

    const role = customRoles.find((r) => r.key === req.roleKey);
    if (role && !role.defaultAllowedModules.includes(req.moduleId)) {
      const updated = [...role.defaultAllowedModules, req.moduleId];
      db.updateRoleModuleAccess(req.roleKey, updated);
      refreshAll();
    }

    showNotice(`Clearance Approved: "${req.moduleName}" enabled for ${req.roleLabel} by ${activeAdminUser?.name || 'L8 Executive'}.`, 'success');
  };

  const handleRejectClearanceRequest = (requestId: string, reason?: string) => {
    if (!isL7OrL8) {
      showNotice('Access Denied: Only L7 Directors or L8 Executive Chairman can reject clearance requests.', 'error');
      return;
    }
    setPendingClearanceApprovals((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED' as const,
              rejectionReason: reason || 'Not approved by executive directorate per least privilege governance.',
            }
          : r
      )
    );
    showNotice('Clearance request rejected by L7/L8 management.', 'error');
  };

  // -------------------------------------------------------------
  // MASTER MATRIX ACTIONS: Enable/Disable Module for Role
  // -------------------------------------------------------------
  const handleToggleModuleForRole = (roleKey: string, moduleId: string) => {
    const role = customRoles.find((r) => r.key === roleKey);
    if (!role) return;

    // Strict Least Privilege Enforcement: Standard User cannot access restricted system modules
    if (roleKey === 'STANDARD_USER' && STANDARD_USER_RESTRICTED_MODULES.includes(moduleId)) {
      showNotice('Access Denied: Standard User is strictly forbidden from accessing System Settings, User Management, Audit Logs, and Billing.', 'error');
      return;
    }

    // Super Admin Policy: Universal, unrestricted full-access permissions across all modules
    if (roleKey === 'SUPER_ADMIN') {
      showNotice('Super Administrator (Chairman / MD) maintains universal, unrestricted full-access permissions across all modules by system policy.', 'success');
      return;
    }

    const currentModules = role.defaultAllowedModules || [];
    const isEnabled = currentModules.includes(moduleId);

    const updatedModules = isEnabled
      ? currentModules.filter((id) => id !== moduleId)
      : [...currentModules, moduleId];

    const res = db.updateRoleModuleAccess(roleKey, updatedModules);
    if (res.success) {
      // Also update granular read state
      setGranularActions((prev) => {
        const next = {
          ...prev,
          [`${roleKey}_${moduleId}`]: {
            create: !isEnabled && (roleKey === 'SUPER_ADMIN' || roleKey === 'ADMIN'),
            read: !isEnabled,
            update: !isEnabled && (roleKey === 'SUPER_ADMIN' || roleKey === 'ADMIN'),
            delete: !isEnabled && roleKey === 'SUPER_ADMIN',
          },
        };
        try {
          localStorage.setItem('truvaer_rbac_granular_actions', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      refreshAll();
      showNotice(
        !isEnabled
          ? `Module "${MASTER_APP_MODULES.find((m) => m.id === moduleId)?.name}" enabled for ${role.label}.`
          : `Module "${MASTER_APP_MODULES.find((m) => m.id === moduleId)?.name}" disabled for ${role.label}.`,
        'success'
      );
    } else {
      showNotice(res.message, 'error');
    }
  };

  // Toggle specific action (Create, Read, Update, Delete)
  const handleToggleGranularAction = (
    roleKey: string,
    moduleId: string,
    action: 'create' | 'read' | 'update' | 'delete'
  ) => {
    // If standard user attempting delete/create on restricted modules, reject
    if (roleKey === 'STANDARD_USER' && STANDARD_USER_RESTRICTED_MODULES.includes(moduleId)) {
      showNotice('Action Prohibited: Standard User least-privilege policy forbids modifying restricted system modules.', 'error');
      return;
    }

    const key = `${roleKey}_${moduleId}`;
    setGranularActions((prev) => {
      const current = prev[key] || { create: false, read: false, update: false, delete: false };
      const next = {
        ...prev,
        [key]: {
          ...current,
          [action]: !current[action],
        },
      };
      try {
        localStorage.setItem('truvaer_rbac_granular_actions', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // -------------------------------------------------------------
  // USER LEVEL OVERRIDE: Enable/Disable specific module for single user
  // -------------------------------------------------------------
  const handleToggleUserModule = (userId: string, moduleId: string) => {
    const user = regularUsers.find((u) => u.user_id === userId);
    if (!user) return;

    // Strict Least Privilege Check for Standard User
    if (user.role === 'STANDARD_USER' && STANDARD_USER_RESTRICTED_MODULES.includes(moduleId)) {
      showNotice('Access Denied: Standard User role cannot be granted System Settings, User Management, Audit Logs, or Billing.', 'error');
      return;
    }

    const currentModules = user.allowed_modules || (
      user.role === 'STANDARD_USER' ? STANDARD_USER_BASELINE_MODULES : []
    );

    const isEnabled = currentModules.includes(moduleId);
    const updated = isEnabled
      ? currentModules.filter((id) => id !== moduleId)
      : [...currentModules, moduleId];

    const res = db.updateUserModuleAccess(userId, updated);
    if (res.success) {
      refreshAll();
      showNotice(
        !isEnabled
          ? `Module granted directly to @${user.username}.`
          : `Module revoked directly from @${user.username}.`,
        'success'
      );
    } else {
      showNotice(res.message, 'error');
    }
  };

  // Reset user's module access back to their role's default baseline
  const handleResetUserToRoleDefault = (userId: string) => {
    const user = regularUsers.find((u) => u.user_id === userId);
    if (!user) return;

    let defaultMods = STANDARD_USER_BASELINE_MODULES;
    const roleDef = customRoles.find((r) => r.key === user.role);
    if (roleDef) {
      defaultMods = roleDef.defaultAllowedModules;
    }

    const res = db.updateUserModuleAccess(userId, defaultMods);
    if (res.success) {
      refreshAll();
      showNotice(`Reset @${user.username}'s modules back to ${roleDef?.label || 'Role'} baseline defaults.`, 'success');
    }
  };

  // -------------------------------------------------------------
  // ROLE MANAGEMENT CRUD (Create, Edit, Delete)
  // -------------------------------------------------------------
  const handleOpenCreateRole = () => {
    setEditingRoleId(null);
    const defaultTpl = ROLE_PROFILE_TEMPLATES[0];
    setRoleForm({
      key: defaultTpl.key,
      label: defaultTpl.label,
      description: defaultTpl.description,
      level: defaultTpl.level,
      levelTitle: defaultTpl.levelTitle,
      department: defaultTpl.department,
      reportingTo: defaultTpl.reportingTo,
      zone: defaultTpl.zone,
      accountHolder: defaultTpl.accountHolder,
      operationalReason: defaultTpl.operationalReason,
      defaultAllowedModules: [...defaultTpl.defaultAllowedModules],
      colorBadge: defaultTpl.colorBadge,
    });
    setShowRoleModal(true);
  };

  const handleOpenEditRole = (role: CustomUserType) => {
    setEditingRoleId(role.id);
    setRoleForm({
      key: role.key,
      label: role.label,
      description: role.description,
      level: role.level ?? 2,
      levelTitle: role.levelTitle || `Level ${role.level ?? 2}`,
      department: role.department || 'Operations',
      reportingTo: role.reportingTo || 'Capt. Sameer Khurana (VP Operations L7)',
      zone: role.zone || 'APAC - Asia Pacific',
      accountHolder: role.accountHolder || '',
      operationalReason: role.operationalReason || role.description,
      defaultAllowedModules: [...role.defaultAllowedModules],
      colorBadge: role.colorBadge || 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    });
    setShowRoleModal(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.label.trim()) {
      showNotice('Role display label is required.', 'error');
      return;
    }

    if (editingRoleId) {
      // Edit
      const res = db.updateCustomUserType(editingRoleId, {
        label: roleForm.label,
        description: roleForm.description,
        colorBadge: roleForm.colorBadge,
        defaultAllowedModules: roleForm.defaultAllowedModules,
        level: roleForm.level,
        levelTitle: roleForm.levelTitle,
        department: roleForm.department,
        reportingTo: roleForm.reportingTo,
        zone: roleForm.zone,
        operationalReason: roleForm.operationalReason,
        accountHolder: roleForm.accountHolder,
      });
      if (res.success) {
        setShowRoleModal(false);
        refreshAll();
        showNotice(res.message, 'success');
      } else {
        showNotice(res.message, 'error');
      }
    } else {
      // Create
      if (!roleForm.key.trim()) {
        showNotice('Role code/slug is required (e.g. MANAGER).', 'error');
        return;
      }
      const res = db.createCustomUserType({
        key: roleForm.key,
        label: roleForm.label,
        description: roleForm.description,
        defaultAllowedModules: roleForm.defaultAllowedModules,
        colorBadge: roleForm.colorBadge,
        level: roleForm.level,
        levelTitle: roleForm.levelTitle,
        department: roleForm.department,
        reportingTo: roleForm.reportingTo,
        zone: roleForm.zone,
        operationalReason: roleForm.operationalReason,
        accountHolder: roleForm.accountHolder,
      });
      if (res.success) {
        setShowRoleModal(false);
        refreshAll();
        showNotice(res.message, 'success');
      } else {
        showNotice(res.message, 'error');
      }
    }
  };

  const handleDeleteRole = (role: CustomUserType) => {
    if (role.isSystem) {
      showNotice(`System Role "${role.label}" is core infrastructure and cannot be deleted.`, 'error');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete custom role "${role.label}"? Any assigned users will be safely demoted back to Standard User.`
    );
    if (!confirmed) return;

    const res = db.deleteCustomUserType(role.id);
    if (res.success) {
      refreshAll();
      showNotice(res.message, 'success');
    } else {
      showNotice(res.message, 'error');
    }
  };

  // -------------------------------------------------------------
  // REGIONAL GOVERNANCE: Delegated from L7 to L5 (Manager & Above)
  // -------------------------------------------------------------
  const handleSaveRegionalGovernance = () => {
    if (!selectedAdmin) return;

    // Approver: activeAdminUser or fallback to highest manager/admin
    const approver =
      activeAdminUser ||
      db.getAdminUsers().find((a) => (a.level || 0) >= 5) ||
      db.getAdminUsers()[0];

    const regRes = db.updateUserRegionalAccess(selectedAdmin.admin_id, assignedRegions, approver);
    if (!regRes.success) {
      showNotice(regRes.message, 'error');
      return;
    }

    db.updateAdminPermissions(selectedAdmin.admin_id, selectedAdmin.module_permissions || {}, territoryScope);
    setAllAdmins(db.getAdminUsers());
    showNotice(`Delegated L5+ Regional Governance updated! Assigned Regions: [${assignedRegions.join(', ')}].`, 'success');
    if (onPermissionsUpdated) onPermissionsUpdated();
  };

  // -------------------------------------------------------------
  // DYNAMIC ALLOCATION SYSTEM (DAS): LEADERSHIP MATRIX & MOBILITY
  // -------------------------------------------------------------
  const handleSaveLeadershipAllocation = () => {
    if (!selectedManager) return;
    const author = activeAdminUser?.name || 'Super Administrator (Chairman & MD)';
    const res = db.updateManagerLeadershipAllocation(
      selectedManager.admin_id,
      managerDepts,
      managerZones,
      author
    );
    if (res.success) {
      showNotice(res.message, 'success');
      refreshAll();
    } else {
      showNotice(res.message, 'error');
    }
  };

  const handleExecuteStaffTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const author = activeAdminUser?.name || 'Super Administrator (Chairman & MD)';
    const res = db.transferStaffDepartment(
      selectedStaff.admin_id,
      targetStaffDept,
      mobilityReason.trim() || 'Performance-based mobility transfer',
      author
    );
    if (res.success) {
      showNotice(res.message, 'success');
      refreshAll();
    } else {
      showNotice(res.message, 'error');
    }
  };

  // Role Level Metadata helper for Level-wise filtering
  const getRoleLevelMeta = (roleKey: string) => {
    switch (roleKey) {
      case 'SUPER_ADMIN':
        return { level: 8, tier: 'EXECUTIVE', label: 'L8 - Apex Directorate' };
      case 'ADMIN':
        return { level: 7, tier: 'EXECUTIVE', label: 'L7 - Executive Director' };
      case 'MANAGER':
        return { level: 5, tier: 'MANAGEMENT', label: 'L5 - Operations Manager' };
      case 'OPERATIONS_COORDINATOR':
        return { level: 4, tier: 'OPERATIONS', label: 'L4 - Operations Coordinator' };
      case 'COMPLIANCE_OFFICER':
        return { level: 4, tier: 'OPERATIONS', label: 'L4 - Compliance Lead' };
      case 'FINANCE_OFFICER':
        return { level: 3, tier: 'OPERATIONS', label: 'L3 - Treasury Officer' };
      case 'SERVICE_SPECIALIST':
        return { level: 2, tier: 'FIELD', label: 'L2 - Services Specialist' };
      case 'STANDARD_USER':
        return { level: 0, tier: 'STANDARD', label: 'L0 - Standard User' };
      default:
        return { level: 2, tier: 'FIELD', label: 'L2 - Custom Role' };
    }
  };

  // Filtered role columns based on level-wise filters and role column selector
  const filteredCustomRoles = customRoles.filter((role) => {
    if (roleColumnFilter !== 'ALL' && role.key !== roleColumnFilter) return false;
    const meta = getRoleLevelMeta(role.key);
    if (levelTierFilter !== 'ALL') {
      if (levelTierFilter === 'EXECUTIVE' && meta.tier !== 'EXECUTIVE') return false;
      if (levelTierFilter === 'MANAGEMENT' && meta.tier !== 'MANAGEMENT') return false;
      if (levelTierFilter === 'OPERATIONS' && meta.tier !== 'OPERATIONS') return false;
      if (levelTierFilter === 'STANDARD' && meta.tier !== 'STANDARD') return false;
    }
    if (specificLevelFilter !== 'ALL') {
      if (specificLevelFilter === 'L8' && meta.level !== 8) return false;
      if (specificLevelFilter === 'L7' && meta.level !== 7) return false;
      if (specificLevelFilter === 'L5' && meta.level !== 5 && meta.level !== 6) return false;
      if (specificLevelFilter === 'L4' && meta.level !== 4 && meta.level !== 3) return false;
      if (specificLevelFilter === 'L2' && meta.level !== 2 && meta.level !== 1) return false;
      if (specificLevelFilter === 'L0' && meta.level !== 0) return false;
    }
    return true;
  });

  // Filtered module list for the matrix with simple search and category filter
  const filteredModules = MASTER_APP_MODULES.filter((m) => {
    if (selectedCategory !== 'ALL' && m.category !== selectedCategory) return false;
    if (moduleSearch.trim()) {
      const q = moduleSearch.toLowerCase().trim();
      const leadInfo = APP_MODULE_ACCOUNT_LEADS[m.id];
      const matches =
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.categoryLabel.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (leadInfo && (
          leadInfo.lead.toLowerCase().includes(q) ||
          leadInfo.role.toLowerCase().includes(q) ||
          leadInfo.email.toLowerCase().includes(q)
        ));
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation Sub-Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Central Admin Control Panel: Role &amp; Module Access Governance
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl">
              Strict least-privilege matrix: Standard User baseline enabled for core daily tasks; System Settings, User Management,
              Audit Logs &amp; Billing restricted. Manage custom user types, full CRUD toggles, and delegated L5+ regional authority.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCreateRole}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create User Type / Role</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
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

        {/* Canonical 4-Role Security Clarity Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-blue-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Standard User</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300">
                1 Active
              </span>
            </div>
            <div className="text-[11px] font-semibold text-white">@user (Aviator Member)</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Core search &amp; quotation discovery. Zero access to billing, corporate treasury, user administration, or audit logs.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Business User</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                1 Active
              </span>
            </div>
            <div className="text-[11px] font-semibold text-white">@corporate_user (B2B Org)</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dedicated B2B commercial portal, Corporate Credit Wallet, verified listings, and direct partner quotes.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Platform Admin</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                1 Active
              </span>
            </div>
            <div className="text-[11px] font-semibold text-white">@admin (L7 Director)</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Operations command, document verification &amp; KYC clearance, listings moderation, and CRM pipeline management.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300">
                1 Active
              </span>
            </div>
            <div className="text-[11px] font-semibold text-white">@super_admin (L8 Apex)</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Full sovereign governance, Treasury reserves &amp; escrow cap, commission splits, RBAC rules, and audit logs.
            </p>
          </div>
        </div>

        {/* Panel View Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setPanelView('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              panelView === 'matrix'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Master Module Assignment Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setPanelView('permission_page')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              panelView === 'permission_page'
                ? 'bg-blue-600 text-white shadow-md font-black'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Role Permissions Manager</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
              Permission Page
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPanelView('module_image')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              panelView === 'module_image'
                ? 'bg-emerald-600 text-white shadow-md font-black'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>User Module Allotted</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Module Image (39)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPanelView('roles')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              panelView === 'roles'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Types &amp; Roles Management (6)</span>
          </button>

          <button
            type="button"
            onClick={() => setPanelView('regional_governance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              panelView === 'regional_governance'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Regional Authority (Delegated L5+ Gate)</span>
          </button>

          <button
            type="button"
            onClick={() => setPanelView('das')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              panelView === 'das'
                ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400 font-black'
                : 'bg-slate-950/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Dynamic Allocation System (DAS)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MASTER ROLE-TO-MODULE ASSIGNMENT MATRIX WITH REDESIGNED CLEARANCE */}
      {/* ========================================================================= */}
      {panelView === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  <span>Master Module Assignment Matrix</span>
                </h3>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Role &amp; Module Access Governance
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Account Holder Assigned (Scale Ready)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Simple and clear role-to-module allocation grid. Directly select or revoke modules for each level and designation. Every platform module displays its designated Account Holder &amp; Operational Lead.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowMatrixGuide(!showMatrixGuide)}
                className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all border ${
                  showMatrixGuide
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Click to understand Platform Modules, Account Holders, and where settings reflect"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{showMatrixGuide ? 'Hide Matrix Guide' : '📘 Architecture Guide'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPanelView('roles')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all border border-slate-700"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom Roles &amp; Types ({customRoles.length})</span>
              </button>
            </div>
          </div>

          {/* Collapsible Architecture Guide Banner */}
          {showMatrixGuide && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>Master Module Assignment Matrix – Architecture &amp; Reflection Guide</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        DOC: docs/MASTER_MODULE_MATRIX_GUIDE.md
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Understand what Platform Modules and Responsible Account Holders mean, and exactly where changes reflect across the platform.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMatrixGuide(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Concept 1: Platform Module */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-amber-300 font-bold mb-1.5">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>1. What is a Platform Module?</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      An independent, bounded operational capability or desk (e.g., <strong>Aviation Treasury</strong>, <strong>HRMS Crew Roster</strong>, <strong>Parts Inventory</strong>, <strong>Admissions CRM</strong>, <strong>RBAC Control Panel</strong>).
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Each module contains its own dedicated databases, view components, workflows, and CRUD action permissions.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>24 Core System Modules</span>
                    <span className="text-amber-400 font-bold">Domain-Isolated</span>
                  </div>
                </div>

                {/* Concept 2: Responsible Account Holder */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-indigo-300 font-bold mb-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>2. Responsible Account Holder</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      The C-suite executive, director, or functional lead personally and legally accountable for that domain under aviation standards (<strong>ICAO / DGCA / FAA</strong>).
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Permissions cannot be anonymous. The Account Holder signs off on compliance audits, guarantees data integrity, and approves clearance elevations.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Executive Governance</span>
                    <span className="text-indigo-400 font-bold">Named Account Owner</span>
                  </div>
                </div>

                {/* Concept 3: Where Settings Reflect */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5 text-emerald-300 font-bold mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>3. Where Settings Get Reflected</span>
                    </div>
                    <ul className="text-[11px] text-slate-300 space-y-1.5">
                      <li className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span><strong>Navigation Menus:</strong> Unallotted tabs &amp; sidebar links are automatically hidden.</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span><strong>Access Gateways:</strong> Direct URL attempts trigger the 403 Clearance Gate.</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span><strong>User Dashboards:</strong> Action cards &amp; quick-launch tiles filter dynamically.</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span><strong>Live Testing:</strong> Switch to <em>"User Module Allotted View"</em> and click <strong>"⚡ Test Interface As This User"</strong> to experience live!</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Atomic State Sync</span>
                    <span className="text-emerald-400 font-bold">Instant Propagation</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simple Search & Category Filter Bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  placeholder="Search by module name, ID, or lead holder..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-60">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="SYSTEM">System &amp; Administration</option>
                  <option value="ERP">ERP &amp; Workspace</option>
                  <option value="FINANCE">Finance &amp; Treasury</option>
                  <option value="CRM">Sales &amp; CRM</option>
                  <option value="HR">Human Resources</option>
                  <option value="COMMUNICATION">Communications</option>
                  <option value="PMS">Project Management</option>
                  <option value="COMPLIANCE">Security &amp; Compliance</option>
                </select>
              </div>

              {(moduleSearch || selectedCategory !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setModuleSearch('');
                    setSelectedCategory('ALL');
                  }}
                  className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-mono flex items-center space-x-1 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-bold">
                {filteredModules.length} Modules Visible
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-bold">
                {customRoles.length} Roles Configured
              </span>
            </div>
          </div>

          {/* Matrix Grid Table with Responsible Account Holder and Direct Checkbox Selection per Role/Level */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/60 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3.5 font-bold min-w-[320px]">
                    Platform Module &amp; Responsible Account Holder
                  </th>
                  <th className="px-3 py-3.5 font-bold min-w-[130px]">Category</th>
                  {customRoles.map((role) => {
                    const meta = getRoleLevelMeta(role.key);
                    return (
                      <th key={role.id} className="px-4 py-3.5 font-bold text-center min-w-[170px]">
                        <div className="flex flex-col items-center">
                          <span className="text-white text-xs font-bold">{role.label}</span>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${role.colorBadge || 'bg-slate-800 text-slate-300'}`}>
                              {role.key}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-850 text-amber-400 border border-slate-700 font-bold">
                              L{role.level ?? meta.level}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {filteredModules.length === 0 ? (
                  <tr>
                    <td colSpan={2 + customRoles.length} className="px-4 py-12 text-center text-slate-500 italic">
                      No platform modules match "{moduleSearch}".
                    </td>
                  </tr>
                ) : (
                  filteredModules.map((mod) => {
                    const isRestrictedForStandard = STANDARD_USER_RESTRICTED_MODULES.includes(mod.id);
                    const leadInfo = APP_MODULE_ACCOUNT_LEADS[mod.id] || {
                      lead: 'B Aditya Narayana',
                      role: 'Chairman & Super Admin L8',
                      email: 'aditya.narayana@truvaer.aero',
                    };

                    return (
                      <tr key={mod.id} className="hover:bg-slate-900/60 transition-colors">
                        {/* Module info with Responsible Account Holder */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                            <span>{mod.name}</span>
                            {isRestrictedForStandard && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30" title="Restricted for Standard User baseline">
                                Restricted
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                            {mod.description}
                          </p>

                          {/* Account Holder Lead Name (Item 5) */}
                          <div className="mt-1.5 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                            <User className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Lead: <strong className="text-white">{leadInfo.lead}</strong></span>
                            <span className="text-slate-500">·</span>
                            <span className="text-amber-300/80">{leadInfo.role}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{leadInfo.email}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-3 py-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                            {mod.categoryLabel}
                          </span>
                        </td>

                        {/* Role Columns with Direct Checkbox Toggles per Level & Designation */}
                        {customRoles.map((role) => {
                          const isEnabled = role.defaultAllowedModules.includes(mod.id);
                          const isStandard = role.key === 'STANDARD_USER';
                          const isHardLockedForStandard = isStandard && isRestrictedForStandard;

                          return (
                            <td key={role.id} className="px-4 py-3 text-center">
                              {role.key === 'SUPER_ADMIN' ? (
                                <span
                                  className="inline-flex px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 items-center space-x-1"
                                  title="Super Admin maintains universal full-access permissions across all modules"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                                  <span>FULL ACCESS (L8)</span>
                                </span>
                              ) : isHardLockedForStandard ? (
                                <span
                                  className="inline-flex px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-900/60 text-slate-600 border border-slate-800 cursor-not-allowed"
                                  title="Locked by Least-Privilege Policy"
                                >
                                  RESTRICTED
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleModuleForRole(role.key, mod.id)}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                                    isEnabled
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                                  }`}
                                  title={isEnabled ? `Enabled for ${role.label}. Click to revoke.` : `Disabled for ${role.label}. Click to allot.`}
                                >
                                  {isEnabled ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span>ALLOTTED</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span>DISABLED</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Total Platform Modules</span>
              <div className="text-xl font-bold font-mono text-white">{MASTER_APP_MODULES.length}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Active Roles</span>
              <div className="text-xl font-bold font-mono text-amber-400">{customRoles.length}</div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Account Holders Mapped</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {Object.keys(APP_MODULE_ACCOUNT_LEADS).length} / {MASTER_APP_MODULES.length}
              </div>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Governance Mode</span>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-1 flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Enterprise Active</span>
              </div>
            </div>
          </div>
</div>
      )}

      {/* ASSIGN TASK / ADDITION / ZONE / RESPONSIBILITY MODAL */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>Assign Task, Addition, Zone or Responsibility</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Subject to mandatory L7 Director or L8 Chairman clearance before activation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignTaskModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const role = customRoles.find((r) => r.key === assignTaskForm.targetRoleKey);
                const mod = MASTER_APP_MODULES.find((m) => m.id === assignTaskForm.targetModuleId);
                const modName = mod?.name || assignTaskForm.targetModuleId;

                if (isL7OrL8) {
                  if (assignTaskForm.actionType === 'ENABLE_MODULE' && role && !role.defaultAllowedModules.includes(assignTaskForm.targetModuleId)) {
                    db.updateRoleModuleAccess(role.key, [...role.defaultAllowedModules, assignTaskForm.targetModuleId]);
                    refreshAll();
                  }
                  showNotice(`Sovereign L7/L8 Clearance: ${assignTaskForm.actionType} approved & executed immediately.`, 'success');
                  setShowAssignTaskModal(false);
                  return;
                }

                const newReq = {
                  id: `REQ-CLR-${Date.now().toString().slice(-4)}`,
                  roleKey: assignTaskForm.targetRoleKey,
                  roleLabel: role?.label || assignTaskForm.targetRoleKey,
                  moduleId: assignTaskForm.targetModuleId,
                  moduleName: modName,
                  actionType: assignTaskForm.actionType,
                  details: `${assignTaskForm.actionType}: ${assignTaskForm.taskTitle || modName} (Zone: ${assignTaskForm.targetZone}). ${assignTaskForm.justification}`,
                  requestedBy: activeAdminUser?.name || 'Operator',
                  requestedByLevel: effectiveLevel,
                  status: 'PENDING_L7_L8' as const,
                  createdAt: new Date().toISOString(),
                };

                setPendingClearanceApprovals((prev) => [newReq, ...prev]);
                setShowAssignTaskModal(false);
                setShowApprovalDrawer(true);
                showNotice('Clearance request routed to L7 (Director) and L8 (Executive Chairman) queue.', 'success');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Target Role / Level *
                </label>
                <select
                  value={assignTaskForm.targetRoleKey}
                  onChange={(e) => setAssignTaskForm({ ...assignTaskForm, targetRoleKey: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                >
                  {customRoles.map((r) => (
                    <option key={r.id} value={r.key}>
                      {r.label} ({r.key})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Action Type *
                  </label>
                  <select
                    value={assignTaskForm.actionType}
                    onChange={(e) => setAssignTaskForm({ ...assignTaskForm, actionType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  >
                    <option value="ENABLE_MODULE">Enable Platform Module</option>
                    <option value="ASSIGN_TASK">Assign Operational Task</option>
                    <option value="ADD_ZONE">Add Geographic Zone</option>
                    <option value="ADD_RESPONSIBILITY">Add Governance Responsibility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                    Associated Module *
                  </label>
                  <select
                    value={assignTaskForm.targetModuleId}
                    onChange={(e) => setAssignTaskForm({ ...assignTaskForm, targetModuleId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  >
                    {MASTER_APP_MODULES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Territorial Zone Assignment
                </label>
                <select
                  value={assignTaskForm.targetZone}
                  onChange={(e) => setAssignTaskForm({ ...assignTaskForm, targetZone: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                >
                  {ALL_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z} - {AVIATION_ZONES_MAP[z]?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Task / Responsibility Title &amp; Scope *
                </label>
                <input
                  type="text"
                  required
                  value={assignTaskForm.taskTitle}
                  onChange={(e) => setAssignTaskForm({ ...assignTaskForm, taskTitle: e.target.value })}
                  placeholder="e.g. Cross-Corridor Dispatch Authorization or Zone Lead"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Business Justification &amp; Operational Rationale *
                </label>
                <textarea
                  rows={3}
                  required
                  value={assignTaskForm.justification}
                  onChange={(e) => setAssignTaskForm({ ...assignTaskForm, justification: e.target.value })}
                  placeholder="State the justification for L7 Director or L8 Chairman executive review..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                >
                  {isL7OrL8 ? 'Approve & Enable Immediately (L7/L8)' : 'Submit to L7/L8 Clearance Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: ROLE PERMISSIONS MANAGER (Redesigned as shown in Permission Page.png) */}
      {/* ========================================================================= */}
      {panelView === 'permission_page' && (
        <div className="space-y-4">
          <RolePermissionsManagerView
            onNavigateToUserPermissions={() => setPanelView('module_image')}
            onNotice={(msg, type) => showNotice(msg, type || 'success')}
            isL7OrL8={isL7OrL8}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: USER MODULE ALLOTTED (Redesigned as shown in Module Image.png)        */}
      {/* ========================================================================= */}
      {panelView === 'module_image' && (
        <div className="space-y-4">
          <UserModuleAllottedView
            onNavigateToPermissions={() => setPanelView('permission_page')}
            onNotice={(msg, type) => showNotice(msg, type || 'success')}
            activeAdminUser={activeAdminUser}
            initialSelectedUserId={selectedUserId}
            onSwitchActiveUser={onSwitchActiveUser}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CUSTOM USER TYPES / ROLES CRUD                                    */}
      {/* ========================================================================= */}
      {panelView === 'roles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Custom User Types &amp; Roles Registry</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create, edit, and delete types of users. System roles (Standard, Business, Admin, Super Admin) maintain core architecture safeguards.
              </p>
            </div>

            <button
              onClick={handleOpenCreateRole}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User Type</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map((role) => (
              <div
                key={role.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{role.label}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-850 text-amber-400 border border-slate-700 font-bold">
                          L{role.level ?? 2}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className={`text-[9px] font-mono px-2 py-0.2 rounded-full border ${role.colorBadge || 'bg-slate-800 text-slate-300'}`}>
                          {role.key}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {role.levelTitle || `Level ${role.level ?? 2}`}
                        </span>
                      </div>
                    </div>

                    {role.isSystem ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        System Protected
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Custom Role
                      </span>
                    )}
                  </div>

                  {/* Responsible Account Holder (Item 5) */}
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-amber-400 shrink-0" />
                        <strong className="text-white">{role.accountHolder || 'Operational Lead'}</strong>
                      </span>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-500/30">
                        {role.department || 'Operations'}
                      </span>
                    </div>
                    {role.reportingTo && (
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        ↳ Reporting: <span className="text-slate-300">{role.reportingTo}</span>
                      </div>
                    )}
                    {role.zone && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        🌍 Jurisdiction: <span className="text-amber-300/90">{role.zone}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {role.operationalReason || role.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-emerald-400 font-bold">
                    {role.defaultAllowedModules.length} Modules Pre-Allotted
                  </span>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRole(role)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3 text-sky-400" />
                      <span>Edit</span>
                    </button>

                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(role)}
                        className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold cursor-pointer flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* VIEW 4: DELEGATED L5+ REGIONAL GOVERNANCE & MULTI-ZONE SIGN-OFF          */}
      {/* ========================================================================= */}
      {panelView === 'regional_governance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-sky-400" />
                <span>Delegated Multi-Zone Regional Authority (L5+ Manager Delegated)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authority for Multi-Zone regional access is delegated from L7 to L5 (Operations Manager and above) to decentralize decision-making.
              </p>
            </div>

            <button
              onClick={handleSaveRegionalGovernance}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Commit Regional Clearances</span>
            </button>
          </div>

          {/* Admin selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-white font-mono uppercase">
                Administrators &amp; Managers ({allAdmins.length})
              </span>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {allAdmins.map((admin) => (
                  <button
                    key={admin.admin_id}
                    onClick={() => {
                      setSelectedAdminId(admin.admin_id);
                      setAssignedRegions(admin.assigned_regions || ['APAC']);
                      setTerritoryScope(admin.territory_scope || { zone: 'All Zones', country: 'All Countries', territory: 'All Hubs' });
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      admin.admin_id === selectedAdmin?.admin_id
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{admin.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{admin.level_title || `Level ${admin.level || 0}`}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                      {(admin.assigned_regions || ['APAC']).length} Zones
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Regional Zone Checkboxes */}
            <div className="lg:col-span-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white font-mono uppercase">
                    Assigned Regional Airspaces: {selectedAdmin?.name}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Delegated L5+ Sign-off: Multiple zones can now be authorized directly by Operations Managers (L5) or above.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  L5+ Decentralized
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ALL_ZONES.map((zone) => {
                  const isAssigned = assignedRegions.includes(zone);
                  return (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => {
                        if (isAssigned) {
                          if (assignedRegions.length > 1) {
                            setAssignedRegions(assignedRegions.filter((z) => z !== zone));
                          } else {
                            showNotice('At least one region must remain assigned.', 'error');
                          }
                        } else {
                          setAssignedRegions([...assignedRegions, zone]);
                        }
                      }}
                      className={`p-3 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                        isAssigned
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-mono text-xs flex items-center justify-between">
                        <span>{zone}</span>
                        {isAssigned && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        {AVIATION_ZONES_MAP[zone]?.name.split('(')[0] || zone}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* L5+ Manager Sign-off Action */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Multi-region status: {assignedRegions.length > 1 ? (
                    <strong className="text-emerald-400">Multi-Zone Clearance Active (L5+ Delegated)</strong>
                  ) : (
                    <strong className="text-sky-400">Single Zone Clearance</strong>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleSaveRegionalGovernance}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow cursor-pointer text-xs"
                >
                  Save Region Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: DYNAMIC ALLOCATION SYSTEM (DAS): LEADERSHIP MATRIX & MOBILITY     */}
      {/* ========================================================================= */}
      {panelView === 'das' && (
        <div className="space-y-6">
          {/* DAS Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-white">Dynamic Allocation System (DAS)</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    L6 Admin Authority
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Performance-based mobility for standard staff (L1–L4) and unified Checkbox Matrix allocation for leadership roles (L5 Managers and above).
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs border-t border-slate-800">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="font-bold text-sky-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Leadership Multi-Assignment Matrix (L5+)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  L6 Admins instantly assign multiple departments (Sales, HR, Ops, Finance) and geographical zones to a single manager. Real-time state expansion dynamically renders all operational modules on the manager&apos;s sidebar. Multi-assignments are inherently blocked for lower-level tiers.
                </p>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1">
                <div className="font-bold text-purple-400 flex items-center space-x-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Performance-Based Staff Mobility (L1–L4)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Standard staff can be seamlessly transferred between departments using KPI triggers or manual overrides. Upon transfer, the backend immediately updates the user&apos;s primary <code>dept_id</code>, revokes legacy access, and automatically renders the new department&apos;s UI modules.
                </p>
              </div>
            </div>
          </div>

          {/* CARD 1: UNIFIED CHECKBOX MATRIX UI (L5 MANAGERS & ABOVE) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Leadership Unified Checkbox Matrix UI (L5 Managers &amp; Above)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assign multiple functional departments and sovereign geographical zones to leadership personnel.
                </p>
              </div>

              {/* Manager Selector */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs text-slate-400 font-mono">Select Manager:</span>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-400"
                >
                  {allAdmins.map((a) => (
                    <option key={a.admin_id} value={a.admin_id}>
                      {a.name} — {a.level_title || `Level ${a.level || 0}`} [{a.department}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inherent Access Control Block Check */}
            {(selectedManager.level ?? 1) < 5 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs">
                <div className="font-bold text-amber-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Inherent Security Policy Enforcement: Lower-Tier Single Department Constraint</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>{selectedManager.name}</strong> is designated at <strong>Level {selectedManager.level ?? 1} (Standard Staff)</strong>. The system inherently blocks multi-department and multi-zone assignments for lower-level tiers to maintain strict access control. Use the <em>Staff Mobility Desk</em> below to transfer this staff member to a new primary department.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Manager Profile Summary Bar */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-mono uppercase block">Active Leadership Profile</span>
                    <span className="font-bold text-white text-sm">{selectedManager.name}</span>
                    <span className="text-slate-400 text-xs ml-2">({selectedManager.email})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                      {selectedManager.level_title || `Level ${selectedManager.level} Executive`}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-500/30">
                      {managerDepts.length} Assigned Depts
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                      {managerZones.length} Assigned Zones
                    </span>
                  </div>
                </div>

                {/* 1. Departments Checkbox Matrix */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                      1. Departmental Allocations Matrix (Multi-Assignment)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Select all functional divisions under this manager&apos;s governance
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {(
                      [
                        { id: 'Sales', label: 'Sales & Commercial', desc: 'CRM, Client Inquiries, Leads, Deals' },
                        { id: 'Marketing', label: 'Marketing & Catalog', desc: 'Campaigns, Platform Listings, SEO' },
                        { id: 'Operations', label: 'Flight Operations', desc: 'Air Charters, Slots, Aircraft Moderation' },
                        { id: 'Finance', label: 'Treasury & Finance', desc: 'Centralized Credit Matrix, Bank Clearance' },
                        { id: 'Stores', label: 'Stores & Spares', desc: 'Aircraft Vault, Avionics, Parts Inventory' },
                        { id: 'HR', label: 'Human Resource', desc: 'HRMS, Promotions, Licenses, Passes' },
                        { id: 'Customer Care', label: 'Customer Care Desk', desc: 'VIP Support, Tickets, Escalation' },
                      ] as const
                    ).map((dept) => {
                      const isChecked = managerDepts.includes(dept.id as AdminDepartment);
                      return (
                        <label
                          key={dept.id}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isChecked
                              ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-xs">{dept.label}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setManagerDepts([...managerDepts, dept.id as AdminDepartment]);
                                } else {
                                  if (managerDepts.length === 1) {
                                    showNotice('Manager must remain allocated to at least 1 primary department.', 'error');
                                    return;
                                  }
                                  setManagerDepts(managerDepts.filter((d) => d !== dept.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer mt-0.5"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 line-clamp-1">{dept.desc}</p>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Geographical Zones Checkbox Matrix */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                      2. Geographical Operational Zones (Z1–Z6)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Metrics &amp; leads on manager&apos;s dashboard automatically filter to authorized zones
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {(
                      [
                        { id: 'APAC', name: 'Asia-Pacific', code: 'Z1' },
                        { id: 'EMEA', name: 'Europe, Mid East & Africa', code: 'Z2' },
                        { id: 'NA', name: 'North America', code: 'Z3' },
                        { id: 'LATAM', name: 'Latin America', code: 'Z4' },
                        { id: 'CIS', name: 'Commonwealth of Indep States', code: 'Z5' },
                        { id: 'ANZ', name: 'Australia & New Zealand', code: 'Z6' },
                      ] as const
                    ).map((z) => {
                      const isChecked = managerZones.includes(z.id as AviationZone);
                      return (
                        <label
                          key={z.id}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isChecked
                              ? 'bg-sky-500/15 border-sky-500/50 text-white shadow-md'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-mono text-sky-400 font-bold block">{z.code}</span>
                              <span className="font-bold text-xs">{z.id}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setManagerZones([...managerZones, z.id as AviationZone]);
                                } else {
                                  if (managerZones.length === 1) {
                                    showNotice('Manager must maintain coverage over at least 1 zone.', 'error');
                                    return;
                                  }
                                  setManagerZones(managerZones.filter((x) => x !== z.id));
                                }
                              }}
                              className="w-4 h-4 rounded text-sky-500 focus:ring-0 cursor-pointer mt-0.5"
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 mt-2 truncate">{z.name}</p>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time State Expansion Preview & Commit Action */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                      Real-time Dynamic Expansion Preview
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-400">Sidebar modules dynamically unlocked:</span>
                      {managerDepts.map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          {d} Module
                        </span>
                      ))}
                      <span className="text-slate-600 font-bold">•</span>
                      <span className="text-[11px] text-slate-400">Metrics filtered by:</span>
                      {managerZones.map((z) => (
                        <span key={z} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                          {z}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveLeadershipAllocation}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Allocation Matrix</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: PERFORMANCE-BASED STAFF MOBILITY DESK (L1–L4) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                <span>Performance-Based Staff Mobility Desk (Standard Staff L1–L4)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute performance-based mobility transfers. Updating primary <code>dept_id</code> automatically revokes legacy access and dynamically renders new department modules.
              </p>
            </div>

            <form onSubmit={handleExecuteStaffTransfer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Staff Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Select Staff Member (L1–L4):
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400"
                  >
                    {l1to4Staff.map((s) => (
                      <option key={s.admin_id} value={s.admin_id}>
                        {s.name} (Level {s.level ?? 1}) — [{s.department}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target Department (New Allocation):
                  </label>
                  <select
                    value={targetStaffDept}
                    onChange={(e) => setTargetStaffDept(e.target.value as AdminDepartment)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400"
                  >
                    {(['Sales', 'Marketing', 'Operations', 'Finance', 'Stores', 'HR', 'Customer Care'] as const).map((d) => (
                      <option key={d} value={d}>
                        {d} Division
                      </option>
                    ))}
                  </select>
                </div>

                {/* KPI Trigger / Status Display */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Performance KPI:</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {selectedStaff?.kpi_score ?? 88}/100 ({selectedStaff?.kpi_status || 'EXCELLENT'})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden my-1.5">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${selectedStaff?.kpi_score ?? 88}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Current Primary:</span>
                    <span className="font-bold text-white font-mono">{selectedStaff?.primary_dept_id || `dept_${(selectedStaff?.department || 'operations').toLowerCase()}`}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Mobility Transfer Justification / KPI Reason:
                </label>
                <input
                  type="text"
                  value={mobilityReason}
                  onChange={(e) => setMobilityReason(e.target.value)}
                  placeholder="E.g. Performance appraisal score exceeded 85; redeployed to Operations flight line..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Legacy access will be revoked immediately upon transfer execution.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Execute Mobility Transfer</span>
                </button>
              </div>
            </form>

            {/* Mobility Transfer Audit History Log */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                Mobility Transfer Audit Logs
              </span>

              {selectedStaff?.mobility_history && selectedStaff.mobility_history.length > 0 ? (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[10px]">
                      <tr>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">From Dept</th>
                        <th className="p-2.5">To Dept</th>
                        <th className="p-2.5">Reason / Trigger</th>
                        <th className="p-2.5">Triggered By</th>
                        <th className="p-2.5">KPI Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-sans">
                      {selectedStaff.mobility_history.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-950/50">
                          <td className="p-2.5 font-mono text-slate-400 text-[11px]">
                            {new Date(m.timestamp).toLocaleString()}
                          </td>
                          <td className="p-2.5 font-bold text-rose-300">{m.fromDept}</td>
                          <td className="p-2.5 font-bold text-emerald-300">{m.toDept}</td>
                          <td className="p-2.5 text-slate-300 text-xs">{m.reason}</td>
                          <td className="p-2.5 text-slate-400 font-mono text-[11px]">{m.triggeredBy}</td>
                          <td className="p-2.5 font-bold text-amber-300 font-mono">{m.kpiScoreAtTransfer ?? 88}/100</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-500 text-xs">
                  No prior mobility transfers recorded for {selectedStaff?.name || 'this personnel'}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL: CREATE / EDIT CUSTOM USER TYPE WITH 1-CLICK PROFILE TEMPLATES       */}
      {/* ========================================================================= */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>{editingRoleId ? 'Edit User Type / Role' : 'Create New User Type / Role'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick a 1-Click Profile Template to auto-populate Reason, Reporting To, Zone, Level, Lead &amp; Modules, or configure manually.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
              {/* 1-Click Profile Template Selector (Auto-fill everything) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-sky-500/10 border border-amber-500/30 space-y-1.5">
                <label className="block text-amber-300 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>⚡ 1-Click Profile Template (Select the profile &amp; its all done)</span>
                </label>
                <select
                  onChange={(e) => {
                    const tpl = ROLE_PROFILE_TEMPLATES.find((t) => t.id === e.target.value);
                    if (tpl) {
                      setRoleForm({
                        key: tpl.key,
                        label: tpl.label,
                        description: tpl.description,
                        level: tpl.level,
                        levelTitle: tpl.levelTitle,
                        department: tpl.department,
                        reportingTo: tpl.reportingTo,
                        zone: tpl.zone,
                        accountHolder: tpl.accountHolder,
                        operationalReason: tpl.operationalReason,
                        defaultAllowedModules: [...tpl.defaultAllowedModules],
                        colorBadge: tpl.colorBadge,
                      });
                      showNotice(`Applied template "${tpl.name}": auto-populated Level ${tpl.level}, Reporting To, Zone, and ${tpl.defaultAllowedModules.length} pre-checked modules.`, 'success');
                    }
                  }}
                  defaultValue=""
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="" disabled>-- Select a Preset Profile to Auto-Fill All Fields --</option>
                  {ROLE_PROFILE_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} — [{tpl.department} | Level {tpl.level} | {tpl.zone}]
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">
                  Selecting any preset instantly auto-populates Role Code, Display Name, Level, Lead, Department, Reporting Line, Jurisdiction &amp; Pre-Checked Modules.
                </span>
              </div>

              {/* Basic Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Role Code / Key (Slug)</label>
                  <input
                    type="text"
                    disabled={!!editingRoleId}
                    value={roleForm.key}
                    onChange={(e) => setRoleForm({ ...roleForm, key: e.target.value.toUpperCase() })}
                    placeholder="E.g. OPERATIONS_COORDINATOR"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase outline-none focus:border-amber-500 disabled:opacity-60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Role Display Name</label>
                  <input
                    type="text"
                    value={roleForm.label}
                    onChange={(e) => setRoleForm({ ...roleForm, label: e.target.value })}
                    placeholder="E.g. Operations Manager"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-bold"
                    required
                  />
                </div>
              </div>

              {/* Hierarchy, Level & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hierarchy Level (0 to 8)</label>
                  <select
                    value={roleForm.level}
                    onChange={(e) => setRoleForm({ ...roleForm, level: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={8}>Level 8 - Apex Directorate (Chairman / MD)</option>
                    <option value={7}>Level 7 - Executive Director</option>
                    <option value={6}>Level 6 - Functional Head</option>
                    <option value={5}>Level 5 - Operations Manager</option>
                    <option value={4}>Level 4 - Operational Lead / Coordinator</option>
                    <option value={3}>Level 3 - Specialist / Officer</option>
                    <option value={2}>Level 2 - Field Specialist</option>
                    <option value={1}>Level 1 - Associate</option>
                    <option value={0}>Level 0 - Standard User / Aviator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={roleForm.levelTitle}
                    onChange={(e) => setRoleForm({ ...roleForm, levelTitle: e.target.value })}
                    placeholder="E.g. Operations Manager (L5)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assigned Department</label>
                  <select
                    value={roleForm.department}
                    onChange={(e) => setRoleForm({ ...roleForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Customer Care">Customer Care</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales &amp; Marketing</option>
                    <option value="Stores">Stores &amp; Procurement</option>
                    <option value="HR">Human Resources</option>
                    <option value="Directorate">Senior Management Team / Directorate</option>
                    <option value="Commercial">Commercial Aviators</option>
                  </select>
                </div>
              </div>

              {/* Reporting To & Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Reporting To (Designation &amp; Supervisor)</label>
                  <input
                    type="text"
                    value={roleForm.reportingTo}
                    onChange={(e) => setRoleForm({ ...roleForm, reportingTo: e.target.value })}
                    placeholder="E.g. Capt. Sameer Khurana (VP Operations L7)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Territorial Zone / Airspace</label>
                  <input
                    type="text"
                    value={roleForm.zone}
                    onChange={(e) => setRoleForm({ ...roleForm, zone: e.target.value })}
                    placeholder="E.g. APAC - Asia Pacific or GLOBAL"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Responsible Account Holder */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Responsible User / Admin Account Holder Name (Item 5)</label>
                <input
                  type="text"
                  value={roleForm.accountHolder}
                  onChange={(e) => setRoleForm({ ...roleForm, accountHolder: e.target.value })}
                  placeholder="E.g. Aditya Vikram Verma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Operational Reason */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Operational Reason &amp; Authority Scope</label>
                <textarea
                  rows={2}
                  value={roleForm.operationalReason}
                  onChange={(e) => setRoleForm({ ...roleForm, operationalReason: e.target.value })}
                  placeholder="Why is this role provisioned? Scope of authority, escalation trigger..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Module selection checkboxes for this role/level */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold">
                    Pre-Allotted Modules ({roleForm.defaultAllowedModules.length} of {MASTER_APP_MODULES.length} selected)
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setRoleForm({ ...roleForm, defaultAllowedModules: MASTER_APP_MODULES.map((m) => m.id) })}
                      className="text-amber-400 hover:underline text-[10px]"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleForm({ ...roleForm, defaultAllowedModules: [] })}
                      className="text-slate-400 hover:underline text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto border border-slate-800 rounded-xl p-2.5 bg-slate-950 space-y-1.5">
                  {MASTER_APP_MODULES.map((m) => {
                    const isSelected = roleForm.defaultAllowedModules.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg text-xs cursor-pointer ${
                          isSelected ? 'bg-indigo-950/40 text-indigo-200' : 'text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleForm({
                                ...roleForm,
                                defaultAllowedModules: [...roleForm.defaultAllowedModules, m.id],
                              });
                            } else {
                              setRoleForm({
                                ...roleForm,
                                defaultAllowedModules: roleForm.defaultAllowedModules.filter((id) => id !== m.id),
                              });
                            }
                          }}
                          className="rounded text-indigo-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-semibold text-white">{m.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 ml-auto">({m.categoryLabel})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md cursor-pointer transition-all active:scale-95"
                >
                  {editingRoleId ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

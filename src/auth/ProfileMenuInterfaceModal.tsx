import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Building2,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Mail,
  Bell,
  ShieldCheck,
  CreditCard,
  Layers,
  GraduationCap,
  Truck,
  BarChart3,
  Award,
  BookOpen,
  Home,
  AlertCircle,
  Trophy,
  PhoneCall,
  UserCheck,
  Store,
  Receipt,
  Coffee,
  Sparkles,
  Send,
  Lock,
  Compass,
  FileCode,
  Radio,
  FileText,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
  Tags,
  Eye,
} from 'lucide-react';
import { RegularUser, BusinessProfile } from '../types';
import { PolicySlug } from '../legal/policyData';
import { db } from '../data/mockDatabase';

export interface ModuleLauncherItem {
  id: string;
  name: string;
  category: 'ERP' | 'FINANCE' | 'CRM' | 'HR' | 'COMMUNICATION' | 'PMS' | 'COMPLIANCE' | 'ADDONS';
  categoryLabel: string;
  icon: React.ReactNode;
  description: string;
  isAddon?: boolean;
  isLocked?: boolean;
  action: () => void;
}

interface ProfileMenuInterfaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  isAdmin: boolean;
  onNavigateToTab: (tab: 'marketing' | 'crm_portal' | 'admin_desk', subTab?: string) => void;
  onOpenWallet: () => void;
  onOpenCommunications: () => void;
  onOpenUserProfile: () => void;
  onOpenPasswordReset: () => void;
  onOpenTaxonomy?: () => void;
  onOpenApiInspector?: () => void;
  onOpenBroadcast?: () => void;
  onOpenPolicy?: (slug: PolicySlug) => void;
}

export const ProfileMenuInterfaceModal: React.FC<ProfileMenuInterfaceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentBusiness,
  isAdmin,
  onNavigateToTab,
  onOpenWallet,
  onOpenCommunications,
  onOpenUserProfile,
  onOpenPasswordReset,
  onOpenTaxonomy,
  onOpenApiInspector,
  onOpenBroadcast,
  onOpenPolicy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const userName = currentUser
    ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username
    : currentBusiness?.organization_name || 'Aviation Aviator';

  const isDeveloperOrAdmin =
    isAdmin ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'admin@truvaer.com';

  // Master List of 53 Modules across categories (ERP, Finance, CRM, HR, Communication, PMS, Compliance & Add-ons)
  const allModules: ModuleLauncherItem[] = [
    // --- ERP MODULES ---
    {
      id: 'erp_organisation',
      name: 'Organisation',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <Building2 className="w-5 h-5 text-emerald-400" />,
      description: 'Fleet enterprise entity structure, base airports, and registrations',
      action: () => {
        onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'erp_sis',
      name: 'SIS / Flight Training',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <GraduationCap className="w-5 h-5 text-sky-400" />,
      description: 'Student Information System, pilot cadets, flight hours, and simulators',
      action: () => {
        onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'erp_inventory',
      name: 'Inventory & Parts',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <Store className="w-5 h-5 text-amber-400" />,
      description: 'AOG spare components, avionics line inventory, and tooling reserves',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'stores');
        else onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'erp_dynamic_forms',
      name: 'Dynamic Forms',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      description: 'Quotation builder, charter questionnaires, and regulatory declarations',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'control_panel');
        else onOpenUserProfile();
        onClose();
      },
    },
    {
      id: 'erp_taxonomy',
      name: 'Approved Taxonomy & Categories',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <Tags className="w-5 h-5 text-emerald-400" />,
      description: 'Approved civil aviation category & subcategory catalog with edit, delete, add controls and Other proposals',
      action: () => {
        if (onOpenTaxonomy) onOpenTaxonomy();
        else if (isAdmin) onNavigateToTab('admin_desk', 'taxonomy');
        else onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'erp_learner_profile',
      name: 'Learner Profile',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <UserCheck className="w-5 h-5 text-teal-400" />,
      description: 'Cadet flight logbooks, medical clearances, and type ratings',
      action: () => {
        onOpenUserProfile();
        onClose();
      },
    },
    {
      id: 'erp_transport',
      name: 'Transport & GSE',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <Truck className="w-5 h-5 text-orange-400" />,
      description: 'Ground Support Equipment (GSE), tarmac shuttles, and fueling tankers',
      action: () => {
        onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'erp_login_stats',
      name: 'Login Statistics',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
      description: 'Platform access logs, 2FA MPIN sessions, and device telemetry',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'logs');
        else onOpenUserProfile();
        onClose();
      },
    },
    {
      id: 'erp_certificates',
      name: 'Certificates',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <Award className="w-5 h-5 text-purple-400" />,
      description: 'Air Operator Certificates (AOC), DGCA/FAA approvals, and ratings',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'services_approval');
        else onOpenUserProfile();
        onClose();
      },
    },
    {
      id: 'erp_library',
      name: 'Library & Manuals',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      description: 'Flight Operations Manuals (FOM), emergency checklists, and SOPs',
      action: () => {
        onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'erp_hostel',
      name: 'Hostel / Crew Base',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <Home className="w-5 h-5 text-rose-400" />,
      description: 'Flight crew layover lounges, pilot academies, and transit quarters',
      action: () => {
        onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'erp_concerns',
      name: 'Concerns & Dispatches',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
      description: 'Operations incident reports, maintenance holds, and flight delays',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'pms');
        else onOpenCommunications();
        onClose();
      },
    },
    {
      id: 'erp_achievements',
      name: 'Achievements',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      description: 'Fleet safety milestones, zero-incident records, and pilot awards',
      action: () => {
        onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'erp_appointments',
      name: 'Appointments & Logs',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <PhoneCall className="w-5 h-5 text-emerald-400" />,
      description: 'FBO client meetings, aircraft viewing schedules, and flight briefings',
      action: () => {
        onOpenCommunications();
        onClose();
      },
    },
    {
      id: 'erp_mentors',
      name: 'Mentors & Instructors',
      category: 'ERP',
      categoryLabel: 'ERP',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      description: 'Chief Flight Instructors (CFI), type rating examiners, and test pilots',
      action: () => {
        onNavigateToTab('marketing');
        onClose();
      },
    },

    // --- FINANCE MODULES ---
    {
      id: 'fin_treasury',
      name: 'Finance Treasury',
      category: 'FINANCE',
      categoryLabel: 'Finance',
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      description: 'Corporate reserves, settlement allocations, and multi-currency ledgers',
      action: () => {
        onOpenWallet();
        onClose();
      },
    },
    {
      id: 'fin_store',
      name: 'School Store / FBO',
      category: 'FINANCE',
      categoryLabel: 'Finance',
      icon: <Store className="w-5 h-5 text-amber-400" />,
      description: 'Pilot flight gear, headsets, aeronautical charts, and branded apparel',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'stores');
        else onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'fin_expenses',
      name: 'Expenses Management',
      category: 'FINANCE',
      categoryLabel: 'Finance',
      icon: <Receipt className="w-5 h-5 text-rose-400" />,
      description: 'Apron landing tariffs, overnight hangarage, and crew per diems',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'cash_flow');
        else onOpenWallet();
        onClose();
      },
    },
    {
      id: 'fin_canteen',
      name: 'Canteen & Fuel',
      category: 'FINANCE',
      categoryLabel: 'Finance',
      icon: <Coffee className="w-5 h-5 text-yellow-400" />,
      description: 'In-flight VIP catering, Jet-A1 fuel uplifts, and terminal dining',
      action: () => {
        onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'fin_intelligence',
      name: 'Finance Intelligence',
      category: 'FINANCE',
      categoryLabel: 'Finance',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      description: 'Regional cash flow analytics across APAC, ANZ, EMEA, NA, and CIS',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'cash_flow');
        else onOpenWallet();
        onClose();
      },
    },

    // --- CRM MODULES ---
    {
      id: 'crm_admissions',
      name: 'Admissions & Inquiries',
      category: 'CRM',
      categoryLabel: 'CRM',
      icon: <GraduationCap className="w-5 h-5 text-sky-400" />,
      description: 'Inbound flight training applications and client flight inquiries',
      action: () => {
        onNavigateToTab('crm_portal');
        onClose();
      },
    },
    {
      id: 'crm_plus',
      name: 'Admissions Plus CRM',
      category: 'CRM',
      categoryLabel: 'CRM',
      icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
      description: 'Commercial sales pipeline, leads, deal stages, and formal quotations',
      action: () => {
        onNavigateToTab('crm_portal');
        onClose();
      },
    },

    // --- HUMAN RESOURCE (HR & HRMS) MODULES ---
    {
      id: 'hr_main',
      name: 'Human Resource',
      category: 'HR',
      categoryLabel: 'Human Resource',
      icon: <Users className="w-5 h-5 text-purple-400" />,
      description: 'Unified HR & HRMS System: Operations employee records, shift scheduling, leave sanctions & automated payroll',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'human_resource');
        else onOpenUserProfile();
        onClose();
      },
    },
    {
      id: 'hr_staff_wall',
      name: 'Staff Wall & Comms',
      category: 'HR',
      categoryLabel: 'Human Resource',
      icon: <Building2 className="w-5 h-5 text-indigo-400" />,
      description: 'Internal announcements, safety commendations, and operations news',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'human_resource');
        else onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'hr_payroll',
      name: 'Payroll, Incentives & Payslips',
      category: 'HR',
      categoryLabel: 'Human Resource',
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      description: 'Operations bonuses, retainers, performance per diems, and bank UTR slips',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'human_resource');
        else onOpenWallet();
        onClose();
      },
    },
    {
      id: 'hr_pms',
      name: 'Project Management (PMS)',
      category: 'PMS',
      categoryLabel: 'PMS',
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
      description: 'Executive project milestones, personal task bar, and SLA escalation workflows',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'pms');
        else onNavigateToTab('marketing');
        onClose();
      },
    },

    // --- COMMUNICATION MODULES ---
    {
      id: 'comm_chat',
      name: 'Live Direct Chat',
      category: 'COMMUNICATION',
      categoryLabel: 'Communication',
      icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
      description: 'Encrypted direct chat with priority SLA indicator & Stop Sharing Details toggle',
      action: () => {
        onOpenCommunications();
        onClose();
      },
    },
    {
      id: 'comm_mail',
      name: 'Internal Mailing Hub',
      category: 'COMMUNICATION',
      categoryLabel: 'Communication',
      icon: <Mail className="w-5 h-5 text-sky-400" />,
      description: 'Closed-loop enterprise email with PII masking and classification tabs',
      action: () => {
        onOpenCommunications();
        onClose();
      },
    },
    {
      id: 'comm_alerts',
      name: 'Notifications & Alerts',
      category: 'COMMUNICATION',
      categoryLabel: 'Communication',
      icon: <Bell className="w-5 h-5 text-amber-400" />,
      description: 'Real-time booking confirmations, wallet debits, and dispatch notices',
      action: () => {
        onOpenCommunications();
        onClose();
      },
    },
    {
      id: 'comm_broadcast',
      name: 'Airway Broadcast',
      category: 'COMMUNICATION',
      categoryLabel: 'Communication',
      icon: <Radio className="w-5 h-5 text-rose-400" />,
      description: 'Regional airway bulletins by Category, Country, and Zone (APAC, ANZ, EMEA...)',
      action: () => {
        if (onOpenBroadcast) onOpenBroadcast();
        else onOpenCommunications();
        onClose();
      },
    },

    // --- COMPLIANCE & SECURITY MODULES ---
    {
      id: 'sec_pwd_reset',
      name: '3-Password Security Reset',
      category: 'COMPLIANCE',
      categoryLabel: 'Security',
      icon: <KeyRound className="w-5 h-5 text-amber-400" />,
      description: '3-Password historical security verification for authorized credential resets',
      action: () => {
        onOpenPasswordReset();
        onClose();
      },
    },
    {
      id: 'sec_rbac',
      name: 'RBAC Permission Matrix',
      category: 'COMPLIANCE',
      categoryLabel: 'Security',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      description: 'Level 0 to Level 8 role governance, module clearance, and territory limits',
      action: () => {
        if (isAdmin) onNavigateToTab('admin_desk', 'control_panel');
        else onOpenUserProfile();
        onClose();
      },
    },
    {
      id: 'sec_api',
      name: 'API Contract Inspector',
      category: 'COMPLIANCE',
      categoryLabel: 'Security',
      icon: <FileCode className="w-5 h-5 text-sky-400" />,
      description: 'Inspect schema contracts, Argon2id encryption payloads, and JSON logs',
      action: () => {
        if (onOpenApiInspector) onOpenApiInspector();
        else onNavigateToTab('marketing');
        onClose();
      },
    },
    {
      id: 'sec_privacy_policy',
      name: 'Global Privacy Policy & Data Vault',
      category: 'COMPLIANCE',
      categoryLabel: 'Security',
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      description: 'GDPR, CCPA, and DPDP 2023 flight manifest protection and data subject rights',
      action: () => {
        if (onOpenPolicy) onOpenPolicy('privacy-policy');
        onClose();
      },
    },
    {
      id: 'sec_user_agreement',
      name: 'User Agreement & Charter Terms',
      category: 'COMPLIANCE',
      categoryLabel: 'Security',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      description: 'Official marketplace terms, 80% payout reserve rules, and flight escrow policies',
      action: () => {
        if (onOpenPolicy) onOpenPolicy('user-agreement');
        onClose();
      },
    },
    {
      id: 'sec_accessibility',
      name: 'Accessibility Statement (WCAG 2.1)',
      category: 'COMPLIANCE',
      categoryLabel: 'Security',
      icon: <Eye className="w-5 h-5 text-sky-400" />,
      description: 'WCAG 2.1 AA conformity, screen reader landmarks, and contrast accommodations',
      action: () => {
        if (onOpenPolicy) onOpenPolicy('accessibility');
        onClose();
      },
    },
    {
      id: 'sec_community_guidelines',
      name: 'Community Guidelines & Safety Ethics',
      category: 'COMPLIANCE',
      categoryLabel: 'Security',
      icon: <Users className="w-5 h-5 text-teal-400" />,
      description: 'Zero tolerance for fraud, pilot safety whistleblower gateway, and operator ethics',
      action: () => {
        if (onOpenPolicy) onOpenPolicy('community-guidelines');
        onClose();
      },
    },
  ];

  // Category Filter and Search (Enforcing Standard User and Business User Role restrictions)
  const isBusiness = Boolean(currentBusiness || (currentUser && currentUser.role === 'BUSINESS_USER'));

  const filteredModules = useMemo(() => {
    return allModules.filter((m) => {
      // Code & API inspection strictly restricted to Development Account & Admin
      if (m.id === 'sec_api' && !isDeveloperOrAdmin) {
        return false;
      }

      // Business User strict module restriction: No HR, SIS, Flight Training, Inventory parts, Dynamic Forms, Approved Taxonomy, Learner profile, Transport & GSE, Certificates, etc.
      if (isBusiness && !isAdmin) {
        const allowedBusinessModuleIds = [
          'crm_quotations',
          'crm_client_followup',
          'crm_leads',
          'crm_proposals',
          'crm_commissions',
          'comm_chat',
          'comm_alerts',
          'user_profile_settings',
          'sec_pwd_reset',
          'sec_privacy_policy',
          'sec_user_agreement',
        ];
        if (!allowedBusinessModuleIds.includes(m.id)) {
          return false;
        }
      }

      // Standard User module restriction
      if (currentUser && !isAdmin && !isBusiness) {
        const isAllowed = db.isUserModuleAllowed(currentUser, m.id);
        if (!isAllowed) {
          return false;
        }
      }

      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.categoryLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allModules, selectedCategory, searchQuery, currentUser, isBusiness, isAdmin, isDeveloperOrAdmin]);

  // Accessible modules count for the active user
  const accessibleModules = useMemo(() => {
    return allModules.filter((m) => {
      if (m.id === 'sec_api' && !isDeveloperOrAdmin) return false;
      if (isBusiness && !isAdmin) {
        const allowedBusinessModuleIds = [
          'crm_quotations',
          'crm_client_followup',
          'crm_leads',
          'crm_proposals',
          'crm_commissions',
          'comm_chat',
          'comm_alerts',
          'user_profile_settings',
          'sec_pwd_reset',
          'sec_privacy_policy',
          'sec_user_agreement',
        ];
        return allowedBusinessModuleIds.includes(m.id);
      }
      if (currentUser && !isAdmin) {
        return db.isUserModuleAllowed(currentUser, m.id);
      }
      return true;
    });
  }, [allModules, currentUser, isBusiness, isAdmin, isDeveloperOrAdmin]);

  // Category counts for left sidebar (as shown in the user's reference image)
  const categoryCounts = {
    ERP: accessibleModules.filter((m) => m.category === 'ERP').length,
    FINANCE: accessibleModules.filter((m) => m.category === 'FINANCE').length,
    CRM: accessibleModules.filter((m) => m.category === 'CRM').length,
    HR: accessibleModules.filter((m) => m.category === 'HR').length,
    COMMUNICATION: accessibleModules.filter((m) => m.category === 'COMMUNICATION').length,
    PMS: accessibleModules.filter((m) => m.category === 'PMS').length,
    COMPLIANCE: accessibleModules.filter((m) => m.category === 'COMPLIANCE').length,
  };

  const totalActive = accessibleModules.length;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profile Menu Interface"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* ========================================================================= */}
        {/* TOP SEARCH BAR (matching the uploaded image: "Q Search 53 modules...")    */}
        {/* ========================================================================= */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search 53 modules — try "fee", "exam", "pms", "crm", "wallet", "chat", "audit"...'
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: 2-COLUMN LAYOUT (LEFT SIDEBAR CATEGORIES + RIGHT MODULES GRID) */}
        {/* ========================================================================= */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR: CATEGORIES WITH COUNT BADGES */}
          <div className="w-56 sm:w-64 border-r border-slate-800 bg-slate-950/50 p-3 sm:p-4 overflow-y-auto shrink-0 space-y-4">
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Standard Edition
              </div>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-blue-600/20 text-white font-bold border border-blue-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>All Modules</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{allModules.length}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('ERP')}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'ERP'
                      ? 'bg-emerald-600/20 text-white font-bold border border-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>ERP Operations</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{categoryCounts.ERP}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('FINANCE')}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'FINANCE'
                      ? 'bg-amber-600/20 text-white font-bold border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Finance &amp; Treasury</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{categoryCounts.FINANCE}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('CRM')}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'CRM'
                      ? 'bg-sky-600/20 text-white font-bold border border-sky-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>CRM &amp; Sales</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{categoryCounts.CRM}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('HR')}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'HR'
                      ? 'bg-purple-600/20 text-white font-bold border border-purple-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>Human Resource</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{categoryCounts.HR}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('COMMUNICATION')}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'COMMUNICATION'
                      ? 'bg-blue-600/20 text-white font-bold border border-blue-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Communication</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{categoryCounts.COMMUNICATION}</span>
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                Executive &amp; Governance
              </div>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('PMS')}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'PMS'
                      ? 'bg-amber-600/20 text-white font-bold border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Project Management (PMS)</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">{categoryCounts.PMS}</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('COMPLIANCE')}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedCategory === 'COMPLIANCE'
                      ? 'bg-emerald-600/20 text-white font-bold border border-emerald-500/40'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Security &amp; 3-Password</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{categoryCounts.COMPLIANCE}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 p-2">
              <span className="text-slate-500 block text-[10px]">Logged in as:</span>
              <strong className="text-white truncate block">{userName}</strong>
              <span className="text-[10px] font-mono text-sky-400">
                {isAdmin ? 'Platform Administrator' : currentBusiness ? 'Business User' : 'Standard User'}
              </span>
            </div>
          </div>

          {/* RIGHT AREA: GROUPED SECTIONS & CARDS GRID (as shown in image) */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Header of selected view */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {selectedCategory === 'ALL' ? 'All Active Modules' : `${selectedCategory} Module Cluster`}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {filteredModules.length} items
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Click any module for instant 1-click launch
              </span>
            </div>

            {/* Grid of Module Cards or No Permitted Modules Notice */}
            {filteredModules.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3 my-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Permitted Modules Available</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {currentUser && !isAdmin
                    ? 'Module access for standard user profiles is disabled by default. The Super Admin controls what modules need to be permitted and not from the Security Desk.'
                    : 'No modules matched your current filter or search criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
                {filteredModules.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 text-left transition-all group cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0 group-hover:border-blue-400/50 transition-colors">
                        {item.icon}
                      </div>
                      {item.isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h5 className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                        {item.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM STATUS BAR (matching the image: "Standard Edition • 49 of 53...")   */}
        {/* ========================================================================= */}
        <div className="shrink-0 p-3 sm:p-3.5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-300">
          <div className="flex items-center space-x-2.5">
            {/* Colored Progress Bar */}
            <div className="w-20 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="w-4/5 h-full bg-emerald-500" />
              <div className="w-1/5 h-full bg-rose-500" />
            </div>
            <span className="font-semibold text-[11px] sm:text-xs">
              Standard Edition • <span className="text-white font-bold">{totalActive} of 53 modules active</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={() => {
                onOpenPasswordReset();
                onClose();
              }}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>3-Password Reset</span>
            </button>
            <button
              onClick={() => {
                if (isAdmin) onNavigateToTab('admin_desk', 'pms');
                else onNavigateToTab('marketing');
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1 shadow-sm"
            >
              <span>Explore PMS &amp; Operations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

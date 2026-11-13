import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Navbar,
  AppTab,
  WalletRazorpayModal,
  CommunicationHubModal,
  ConnectWithCustomerCareModal,
  ApiInspectorModal,
  GlobalFooter,
  LegalPoliciesPortal,
  PolicySlug,
  POLICIES,
} from './shared';
import { MarketingPortal } from './marketing';
import { AuthGateway, OtpVerificationView, UserProfileModal, ProfileMenuInterfaceModal, PasswordResetModal, AdminExecutiveLoginView, AdminPasswordSetupModal } from './auth';
import { AdminCPanel, CRMPortal } from './erp';
import { CompleteUnifiedDashboard } from './dashboard';
import { BusinessCorporateWalletModal, BusinessVerificationModal } from './business';
import { SessionTimeoutWarningModal } from './components/SessionTimeoutWarningModal';
import { VersionUpdateNotifier } from './components/VersionUpdateNotifier';
import { useSessionManager } from './hooks/useSessionManager';
import { useAntiCopyProtection } from './hooks/useAntiCopyProtection';
import { X, ArrowLeft, ShieldCheck, Store, Lock, TrendingUp, FlaskConical, Zap, RotateCcw, CheckCircle2, Sparkles, UserCheck, ShieldAlert, AlertTriangle, CreditCard, Wallet, Globe } from 'lucide-react';

import { db } from './data/mockDatabase';
import { RegularUser, BusinessProfile, ApiLogEntry } from './types';
import { AggressiveTestingSuiteModal } from './shared/AggressiveTestingSuiteModal';
import { DynamicHelpCenterModal } from './shared/DynamicHelpCenterModal';

export default function App() {
  // Environment State: 'LIVE' vs 'TESTING'
  const [envMode, setEnvMode] = useState<'LIVE' | 'TESTING'>(() => db.getEnvMode());
  const [testEventToast, setTestEventToast] = useState<string | null>(null);
  const [copyBlockedNotice, setCopyBlockedNotice] = useState<string | null>(null);
  const copyNoticeTimerRef = useRef<number | null>(null);

  const handleCopyBlocked = useCallback((message: string) => {
    setCopyBlockedNotice(message);
    if (copyNoticeTimerRef.current) {
      window.clearTimeout(copyNoticeTimerRef.current);
    }
    copyNoticeTimerRef.current = window.setTimeout(() => {
      setCopyBlockedNotice(null);
    }, 2500);
  }, []);

  useAntiCopyProtection(handleCopyBlocked);

  // Primary portal fixed default: Always lands on Stories for you / Home page across all logins and sessions
  const [currentTab, setCurrentTab] = useState<AppTab>('marketing');
  const [marketingSubTab, setMarketingSubTab] = useState<'linkedin_feed' | 'directory'>('linkedin_feed');
  const [adminSubTab, setAdminSubTab] = useState<string | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<RegularUser | null>(() => {
    try {
      const savedType = sessionStorage.getItem('truvaer_active_session_type');
      const savedId = sessionStorage.getItem('truvaer_active_session_id');
      if (savedType === 'regular' && savedId) {
        const found = db.getRegularUsers().find((u) => u.user_id === savedId);
        if (found) return found;
      }
      if (savedType === 'business') {
        return null;
      }
    } catch {}
    // Start unauthenticated so user lands directly on the Home Login page (https://truvaer.com)
    return null;
  });

  const [currentBusiness, setCurrentBusiness] = useState<BusinessProfile | null>(() => {
    try {
      const savedType = sessionStorage.getItem('truvaer_active_session_type');
      const savedId = sessionStorage.getItem('truvaer_active_session_id');
      if (savedType === 'business' && savedId) {
        return db.getBusinesses().find((b) => b.business_id === savedId) || null;
      }
    } catch {}
    return null;
  });

  // Modals & Navigation In-Body Views
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingOtpUser, setPendingOtpUser] = useState<{ user: RegularUser; otp?: string } | null>(null);
  const [showApiInspector, setShowApiInspector] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [dashboardPortalMode, setDashboardPortalMode] = useState<'DASHBOARD' | 'OPERATIONS' | 'SALE' | 'COMMUNICATIONS' | 'CHAT' | 'WALLET'>('DASHBOARD');

  const handleOpenWalletInBody = useCallback(() => {
    // Open Wallet directly inside the website interface body without modal popup
    if (currentBusiness || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'MANAGER') {
      setDashboardPortalMode('WALLET');
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('wallet');
    }
  }, [currentBusiness, currentUser]);
  const [showCommunicationsModal, setShowCommunicationsModal] = useState(false);
  const [showCustomerCareModal, setShowCustomerCareModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showProfileMenuModal, setShowProfileMenuModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showBusinessVerificationModal, setShowBusinessVerificationModal] = useState(false);
  const [businessVerificationModalBiz, setBusinessVerificationModalBiz] = useState<BusinessProfile | null>(null);
  const [businessVerificationCustomMessage, setBusinessVerificationCustomMessage] = useState<string | undefined>(undefined);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [currentPolicySlug, setCurrentPolicySlug] = useState<PolicySlug>('about');
  const [showTestSuiteModal, setShowTestSuiteModal] = useState(false);

  // Dedicated Admin Subdomain Detection (admin.truvaer.com or /admin or #admin)
  const [isAdminSubdomain, setIsAdminSubdomain] = useState<boolean>(() => {
    try {
      const host = window.location.hostname.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      return (
        host === 'admin.truvaer.com' ||
        host.startsWith('admin.') ||
        path.startsWith('/admin') ||
        hash.startsWith('#/admin') ||
        hash === '#admin' ||
        search.get('portal') === 'admin'
      );
    } catch {
      return false;
    }
  });

  // Password Setup & Activation Token State (#/set-password)
  const [passwordSetupData, setPasswordSetupData] = useState<{
    isOpen: boolean;
    email: string;
    token: string;
  }>({
    isOpen: false,
    email: '',
    token: '',
  });

  // Single-Session Protocol Enforcement State (terminates concurrent sessions)
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(() => {
    try {
      const saved = sessionStorage.getItem('truvaer_client_session_token');
      if (saved) return saved;
    } catch {}
    return `sess_dev_${Date.now()}`;
  });
  const [sessionTerminationNotice, setSessionTerminationNotice] = useState<string | null>(null);

  // URL Hash Listener for direct legal policy & password setup routing
  useEffect(() => {
    const handleHashRouting = () => {
      const hashRaw = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      if (!hashRaw) return;

      // Handle tokenized password setup routing (e.g. #/set-password?token=ACT_...&email=...)
      if (window.location.hash.includes('set-password')) {
        const hash = window.location.hash;
        const queryPart = hash.includes('?') ? hash.split('?')[1] : window.location.search.replace(/^\?/, '');
        const params = new URLSearchParams(queryPart);
        const email = params.get('email') || '';
        const token = params.get('token') || '';
        setPasswordSetupData({
          isOpen: true,
          email,
          token,
        });
      }

      // Handle dedicated admin portal hash routing
      if (hashRaw === 'admin' || hashRaw.startsWith('admin/')) {
        setIsAdminSubdomain(true);
      }

      // Handle policy slugs
      const slug = hashRaw.split('#')[0].split('?')[0] as PolicySlug;
      if (POLICIES[slug]) {
        setCurrentPolicySlug(slug);
        setShowLegalModal(true);
      }
    };

    handleHashRouting();
    window.addEventListener('hashchange', handleHashRouting);
    window.addEventListener('popstate', handleHashRouting);
    return () => {
      window.removeEventListener('hashchange', handleHashRouting);
      window.removeEventListener('popstate', handleHashRouting);
    };
  }, []);

  // Theme state: Light / Dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('truvaer_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
    try {
      localStorage.setItem('truvaer_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync data lists from database
  const [allRegularUsers, setAllRegularUsers] = useState<RegularUser[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLogEntry[]>([]);

  const refreshData = () => {
    const users = db.getRegularUsers();
    const bizs = db.getBusinesses();
    setAllRegularUsers([...users]);
    setAllBusinesses([...bizs]);
    setApiLogs([...db.getApiLogs()]);

    // Keep currentUser / currentBusiness in sync with db
    if (currentUser) {
      const updatedU = users.find((u) => u.user_id === currentUser.user_id);
      if (updatedU) setCurrentUser(updatedU);
    }
    if (currentBusiness) {
      const updatedB = bizs.find((b) => b.business_id === currentBusiness.business_id);
      if (updatedB) setCurrentBusiness(updatedB);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Restore persisted active session on reload if still valid
  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem('truvaer_client_session_token');
      const savedType = sessionStorage.getItem('truvaer_active_session_type');
      const savedId = sessionStorage.getItem('truvaer_active_session_id');

      if (savedToken && savedType && savedId) {
        if (savedType === 'regular') {
          const user = db.getRegularUsers().find((u) => u.user_id === savedId);
          if (user) {
            if (!user.active_session_token) {
              user.active_session_token = savedToken;
            }
            setCurrentUser(user);
            setCurrentSessionToken(savedToken);
          }
        } else if (savedType === 'business') {
          const biz = db.getBusinesses().find((b) => b.business_id === savedId);
          if (biz) {
            setCurrentBusiness(biz);
            setCurrentSessionToken(savedToken);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = useCallback(() => {
    if (currentSessionToken) {
      db.terminateSession(currentSessionToken, 'USER_EXPLICIT_LOGOUT');
    }
    if (currentUser) {
      const u = db.getRegularUsers().find((usr) => usr.user_id === currentUser.user_id);
      if (u) {
        u.active_session_token = undefined;
        u.active_session_device = undefined;
        u.active_session_started_at = undefined;
      }
    }
    setCurrentUser(null);
    setCurrentBusiness(null);
    setPendingOtpUser(null);
    setCurrentSessionToken(null);
    try {
      sessionStorage.removeItem('truvaer_client_session_token');
      sessionStorage.removeItem('truvaer_active_session_type');
      sessionStorage.removeItem('truvaer_active_session_id');
      sessionStorage.removeItem('truvaer_active_session_payload');
    } catch {}
  }, [currentUser, currentSessionToken]);

  // Session Manager: Standard 30-60m Idle Timeout, Keep-Alive Pinging, 2-5m Warning Modal, & Cross-Tab Sync
  const sessionManager = useSessionManager({
    currentUser,
    currentBusiness,
    currentSessionToken,
    envMode,
    onLogout: handleLogout,
    onSessionNotice: (msg) => setSessionTerminationNotice(msg),
  });

  // Strict Single-Session Login Protocol: Enforced in TESTING MODE
  // Multiple session logins are explicitly enabled in LIVE MODE per user request
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (envMode === 'LIVE') return;

      if (e.key === 'truvaer_session_kill_signal' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          // Only terminate if an external session established a new token that explicitly displaced our current active session
          if (
            currentUser &&
            payload.userId === currentUser.user_id &&
            currentSessionToken &&
            payload.activeSession &&
            payload.activeSession !== currentSessionToken &&
            payload.terminatedSession === currentSessionToken
          ) {
            const userEmail = currentUser.email;
            setCurrentUser(null);
            setCurrentSessionToken(null);
            try {
              sessionStorage.removeItem('truvaer_client_session_token');
              sessionStorage.removeItem('truvaer_active_session_type');
              sessionStorage.removeItem('truvaer_active_session_id');
            } catch {}
            setSessionTerminationNotice(
              `⚠️ Strict Security Protocol Enforced (Testing Mode): Your account (${userEmail}) was logged in from another session. In Testing Mode, previous sessions are automatically terminated for single-session verification testing.`
            );
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser, currentSessionToken, envMode]);

  // Periodic session heartbeat: Ensures single session integrity across simulated & remote logins (ONLY in Testing Mode)
  useEffect(() => {
    if (!currentUser || !currentSessionToken || envMode === 'LIVE') return;
    const interval = setInterval(() => {
      const dbUser = db.getRegularUsers().find((u) => u.user_id === currentUser.user_id);
      // Only terminate if the database record actively has a conflicting concurrent session token
      if (dbUser && dbUser.active_session_token && dbUser.active_session_token !== currentSessionToken) {
        const email = currentUser.email;
        setCurrentUser(null);
        setCurrentSessionToken(null);
        try {
          sessionStorage.removeItem('truvaer_client_session_token');
          sessionStorage.removeItem('truvaer_active_session_type');
          sessionStorage.removeItem('truvaer_active_session_id');
        } catch {}
        setSessionTerminationNotice(
          `⚠️ Session Terminated: A concurrent login was established for ${email}. Per strict single-session security protocol in Testing Mode, previous sessions are terminated.`
        );
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser, currentSessionToken, envMode]);

  // Login & Registration Handlers
  const handleRegularLoginSuccess = (user: RegularUser) => {
    const sessionRes = db.initiateSingleSessionLogin(user.user_id, 'Web Application Portal');
    setCurrentSessionToken(sessionRes.sessionToken);
    try {
      sessionStorage.setItem('truvaer_client_session_token', sessionRes.sessionToken);
      sessionStorage.setItem('truvaer_active_session_type', 'regular');
      sessionStorage.setItem('truvaer_active_session_id', user.user_id);
    } catch {}

    setCurrentUser(user);
    setCurrentBusiness(null);
    setShowAuthModal(false);
    refreshData();
    // Strict Permanent Default: Always navigate to Stories for you (Home Page) upon login for all users
    setMarketingSubTab('linkedin_feed');
    setCurrentTab('marketing');
  };

  const handleBusinessLoginSuccess = (biz: BusinessProfile) => {
    const bizToken = `sess_biz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setCurrentSessionToken(bizToken);
    try {
      sessionStorage.setItem('truvaer_client_session_token', bizToken);
      sessionStorage.setItem('truvaer_active_session_type', 'business');
      sessionStorage.setItem('truvaer_active_session_id', biz.business_id);
    } catch {}

    setCurrentBusiness(biz);
    setCurrentUser(null);
    setShowAuthModal(false);
    refreshData();
    // Strict Permanent Default: Always navigate to Stories for you (Home Page) upon login
    setMarketingSubTab('linkedin_feed');
    setCurrentTab('marketing');
    if (biz.verification_status !== 'VERIFIED') {
      setBusinessVerificationModalBiz(biz);
      const isHardLocked = biz.is_hard_locked_by_admin || biz.verification_status === 'REJECTED';
      setBusinessVerificationCustomMessage(
        isHardLocked
          ? 'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
          : 'Your account is under verification with the Admin, your service options will be enabled once verified'
      );
      setShowBusinessVerificationModal(true);
    }
  };

  const handleOpenOtpForUser = (user: RegularUser, otp?: string) => {
    setPendingOtpUser({ user, otp });
    setShowAuthModal(true);
  };

  const handleOtpVerified = (user: RegularUser) => {
    const sessionRes = db.initiateSingleSessionLogin(user.user_id, 'Verified 2FA Terminal');
    setCurrentSessionToken(sessionRes.sessionToken);
    try {
      sessionStorage.setItem('truvaer_client_session_token', sessionRes.sessionToken);
      sessionStorage.setItem('truvaer_active_session_type', 'regular');
      sessionStorage.setItem('truvaer_active_session_id', user.user_id);
    } catch {}

    setCurrentUser(user);
    setCurrentBusiness(null);
    setPendingOtpUser(null);
    setShowAuthModal(false);
    refreshData();
    // Strict Permanent Default: Always navigate to Stories for you (Home Page) upon login for all users
    setMarketingSubTab('linkedin_feed');
    setCurrentTab('marketing');
  };

  const handleRegularRegisterSuccess = (user: RegularUser, otpInfo: { otp: string; expiresIn: number }) => {
    refreshData();
    handleOpenOtpForUser(user, otpInfo.otp);
  };

  const handleBusinessRegisterSuccess = (biz: BusinessProfile) => {
    refreshData();
    const bizToken = `sess_biz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setCurrentSessionToken(bizToken);
    try {
      sessionStorage.setItem('truvaer_client_session_token', bizToken);
      sessionStorage.setItem('truvaer_active_session_type', 'business');
      sessionStorage.setItem('truvaer_active_session_id', biz.business_id);
    } catch {}

    setCurrentBusiness(biz);
    setCurrentUser(null);
    setShowAuthModal(false);
    // Strict Permanent Default: Always navigate to Stories for you (Home Page) upon register
    setMarketingSubTab('linkedin_feed');
    setCurrentTab('marketing');
    setBusinessVerificationModalBiz(biz);
    setBusinessVerificationCustomMessage(
      'Your account is under verification with the Admin, your service options will be enabled once verified'
    );
    setShowBusinessVerificationModal(true);
  };

  const handleQuickSelectUser = (user: RegularUser) => {
    // Generate valid session token and sync directly onto user in database to prevent heartbeat / single-session conflicts
    const token = `sess_usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    user.active_session_token = token;
    user.active_session_device = 'Quick Switcher Console';
    user.active_session_started_at = new Date().toISOString();

    const dbUser = db.getRegularUsers().find((u) => u.user_id === user.user_id);
    if (dbUser) {
      dbUser.active_session_token = token;
      dbUser.active_session_device = 'Quick Switcher Console';
      dbUser.active_session_started_at = new Date().toISOString();
    }
    db.persist();

    setCurrentSessionToken(token);
    try {
      sessionStorage.setItem('truvaer_client_session_token', token);
      sessionStorage.setItem('truvaer_active_session_type', 'regular');
      sessionStorage.setItem('truvaer_active_session_id', user.user_id);
    } catch {}

    setCurrentBusiness(null);
    setCurrentUser({ ...user, active_session_token: token });
    // Strict Permanent Default: Always navigate to Stories for you (Home Page) upon switch
    setMarketingSubTab('linkedin_feed');
    setCurrentTab('marketing');
    refreshData();
  };

  const handleQuickSelectBusiness = (biz: BusinessProfile) => {
    const bizToken = `sess_biz_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setCurrentSessionToken(bizToken);
    try {
      sessionStorage.setItem('truvaer_client_session_token', bizToken);
      sessionStorage.setItem('truvaer_active_session_type', 'business');
      sessionStorage.setItem('truvaer_active_session_id', biz.business_id);
    } catch {}

    setCurrentUser(null);
    setCurrentBusiness(biz);
    // Strict Permanent Default: Always navigate to Stories for you (Home Page) upon switch
    setMarketingSubTab('linkedin_feed');
    setCurrentTab('marketing');
    refreshData();
  };

  // Standard user does not require dashboard: redirect to marketing if standard user ever enters dashboard
  useEffect(() => {
    if (currentTab === 'dashboard' && currentUser && currentUser.role === 'STANDARD_USER' && !currentBusiness) {
      setCurrentTab('marketing');
    }
  }, [currentTab, currentUser, currentBusiness]);

  // Enforce access restriction: Unverified business users cannot access CRM / Sale Portal
  useEffect(() => {
    if (currentBusiness && currentBusiness.verification_status !== 'VERIFIED' && currentTab === 'crm_portal') {
      setCurrentTab('marketing');
      setBusinessVerificationModalBiz(currentBusiness);
      const isHardLocked = currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED';
      setBusinessVerificationCustomMessage(
        isHardLocked
          ? 'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
          : 'Your account is under verification with the Admin, your service options will be enabled once verified'
      );
      setShowBusinessVerificationModal(true);
    }
  }, [currentBusiness, currentTab]);

  const handleToggleEnvMode = () => {
    const nextMode = envMode === 'TESTING' ? 'LIVE' : 'TESTING';
    setEnvMode(nextMode);
    db.setEnvMode(nextMode);
    if (nextMode === 'LIVE') {
      const res = db.activateLiveProductionMode();
      setTestEventToast(res.message);
    } else {
      const res = db.restoreDemoMode();
      setTestEventToast(res.message);
    }
    refreshData();
    setTimeout(() => setTestEventToast(null), 4000);
  };

  const handleResetDb = () => {
    const res = db.fullMasterSystemReset();
    refreshData();
    setCurrentUser(null);
    setCurrentBusiness(null);
    setCurrentTab('marketing');
    setMarketingSubTab('linkedin_feed');
    setTestEventToast(res.message);
    setTimeout(() => setTestEventToast(null), 5000);
  };

  const handleSimulateLiveEvent = () => {
    const events = [
      {
        category: 'COMMISSION_PAYOUT' as const,
        title: 'Platform Commission Payout Released',
        description: '5% Platform Fee ₹2,85,000 settled for Falcon 2000EX Charter contract (Flight BOM-DXB). Corporate wallet debited 5,700 credits.',
        actor_name: 'Finance Treasury Settlement Desk',
        actor_role: 'L6 Finance Treasury Officer',
        amount: 285000,
        currency: 'INR',
        severity: 'success' as const,
      },
      {
        category: 'BUSINESS_APPROVAL' as const,
        title: 'Enterprise Organization Verified',
        description: 'SkyHigh Flight Academy (IN-AA002) TAN/PAN hard-lock cleared and 5,000 corporate credits allocated.',
        actor_name: 'B Aditya Narayana',
        actor_role: 'Executive Chairman & Super Admin (L8)',
        amount: 5000,
        currency: 'CREDITS',
        severity: 'success' as const,
      },
      {
        category: 'LEAD_STATUS_CHANGE' as const,
        title: 'Commercial Charter Deal Won',
        description: 'Lead LD-8829 won: Gulfstream G650ER private charter deal closed for ₹1,45,00,000.',
        actor_name: 'Commercial Sales Desk',
        actor_role: 'L4 Sales Manager',
        amount: 14500000,
        currency: 'INR',
        severity: 'info' as const,
      },
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    db.logAdminActivity(randomEvent);
    setTestEventToast(`Simulated Live Action: ${randomEvent.title}`);
    refreshData();
    setTimeout(() => setTestEventToast(null), 4000);
  };

  const isAdmin =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'MANAGER';

  const activeAdminUser = isAdmin
    ? db.getAdminUsers().find((a) => a.email === currentUser?.email) || db.getAdminUsers()[0]
    : null;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans antialiased select-none">
      {/* View-Only Anti-Copy Notice Toast */}
      {copyBlockedNotice && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 border border-amber-500/60 text-amber-300 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold pointer-events-none">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{copyBlockedNotice}</span>
        </div>
      )}

      {/* Toast Notification for Simulated Actions */}
      {testEventToast && (
        <div className="fixed top-16 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{testEventToast}</span>
        </div>
      )}

      {/* Single Unified Header Bar: Aviation Marketplace & Mode Controller */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        onQuickSelectUser={handleQuickSelectUser}
        onQuickSelectBusiness={handleQuickSelectBusiness}
        onOpenApiInspector={() => setShowApiInspector(true)}
        onOpenWallet={handleOpenWalletInBody}
        onOpenCommunications={() => setShowCommunicationsModal(true)}
        onOpenCustomerCare={() => setShowCustomerCareModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenUserProfile={() => setShowUserProfileModal(true)}
        onOpenProfileMenu={() => setShowProfileMenuModal(true)}
        onResetDb={handleResetDb}
        allRegularUsers={allRegularUsers}
        allBusinesses={allBusinesses}
        envMode={envMode}
        onToggleEnvMode={handleToggleEnvMode}
        onSimulateLiveEvent={handleSimulateLiveEvent}
        onNavigateToStories={() => {
          setMarketingSubTab('linkedin_feed');
          setCurrentTab('marketing');
        }}
        onNavigateToServiceScout={() => {
          setMarketingSubTab('directory');
          setCurrentTab('marketing');
        }}
        onOpenTestSuite={isAdmin ? () => setShowTestSuiteModal(true) : undefined}
        marketingSubTab={marketingSubTab}
        isAdminSubdomain={isAdminSubdomain}
      />

      {/* Subdomain Simulation & Origin Indicator Bar (Enables testing between truvaer.com & admin.truvaer.com) */}
      <div className="w-full max-w-full bg-slate-100 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center space-x-2">
          {isAdminSubdomain ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/40 flex items-center space-x-1.5 shadow-sm">
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Admin &amp; Ops Console</span>
            </span>
          ) : (
            <>
              <span className="text-slate-600 dark:text-slate-400">Current URL Origin:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold border border-sky-500/40 flex items-center space-x-1.5 shadow-sm">
                <Globe className="w-3 h-3 text-sky-500" />
                <span>truvaer.com (Public Aviation Marketplace)</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              if (isAdminSubdomain) {
                setIsAdminSubdomain(false);
                setCurrentTab('marketing');
                if (window.location.hash.includes('admin')) window.location.hash = '';
              } else {
                setIsAdminSubdomain(true);
                if (isAdmin) setCurrentTab('admin_desk');
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer text-[10px]"
          >
            {isAdminSubdomain ? 'Switch View: truvaer.com' : 'Switch View: admin.truvaer.com'}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <main className="flex-1 w-full max-w-full min-w-0 px-4 sm:px-8 lg:px-12 py-3 sm:py-5 flex flex-col">
        {/* Dedicated Admin Portal (admin.truvaer.com): EXACT SAME AuthGateway interface with executive clearance rules */}
        {isAdminSubdomain && (!currentUser || !isAdmin) ? (
          <div className="flex-1 flex items-center w-full">
            <AuthGateway
              key="admin-auth"
              initialMode="login"
              initialUserType="regular"
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onRegularLoginSuccess={(user) => {
                handleRegularLoginSuccess(user);
                // Requirement 1: Home page is always the final destination upon login
                setMarketingSubTab('linkedin_feed');
                setCurrentTab('marketing');
              }}
              onBusinessLoginSuccess={handleBusinessLoginSuccess}
              onRegularRegisterSuccess={handleRegularRegisterSuccess}
              onBusinessRegisterSuccess={handleBusinessRegisterSuccess}
              onOpenOtp={(user) => handleOpenOtpForUser(user)}
              onOpenAdminDesk={() => {
                setIsAdminSubdomain(true);
                setCurrentTab('admin_desk');
              }}
              onOpenPolicy={(slug) => {
                setCurrentPolicySlug(slug as PolicySlug);
                setShowLegalModal(true);
              }}
              envMode={envMode}
              isAdminPortal={true}
              onNavigateToPublicPortal={() => {
                setIsAdminSubdomain(false);
                setCurrentTab('marketing');
                if (window.location.hash.includes('admin')) window.location.hash = '';
              }}
            />
          </div>
        ) : !currentUser && !currentBusiness ? (
          <div className="flex-1 flex items-center w-full">
            {pendingOtpUser ? (
              <div className="max-w-md mx-auto w-full">
                <OtpVerificationView
                  user={pendingOtpUser.user}
                  initialOtp={pendingOtpUser.otp}
                  onSuccessVerified={handleOtpVerified}
                  onCancel={() => setPendingOtpUser(null)}
                />
              </div>
            ) : (
              <AuthGateway
                key="public-auth"
                initialMode="login"
                initialUserType="regular"
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onRegularLoginSuccess={handleRegularLoginSuccess}
                onBusinessLoginSuccess={handleBusinessLoginSuccess}
                onRegularRegisterSuccess={handleRegularRegisterSuccess}
                onBusinessRegisterSuccess={handleBusinessRegisterSuccess}
                onOpenOtp={(user) => handleOpenOtpForUser(user)}
                onOpenAdminDesk={() => {
                  setIsAdminSubdomain(true);
                }}
                onOpenPolicy={(slug) => {
                  setCurrentPolicySlug(slug as PolicySlug);
                  setShowLegalModal(true);
                }}
                envMode={envMode}
                isAdminPortal={false}
              />
            )}
          </div>
        ) : (
          <>
            {/* Business Verification / Hard-Lock Notice Banner for Restricted Business Accounts */}
            {currentBusiness && currentBusiness.verification_status !== 'VERIFIED' && (
              <div
                className={`mb-4 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl ${
                  currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                    ? 'bg-rose-950/85 border-rose-500/70 text-rose-200'
                    : 'bg-amber-950/85 border-amber-500/70 text-amber-200'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black uppercase tracking-wider">
                        {currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                          ? 'Account Hard-Locked / Suspended by Admin'
                          : 'Account Under Verification with Admin'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/60 border border-current font-bold">
                        Operating in Standard User Mode
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 opacity-95">
                      {currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                        ? 'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
                        : 'Your account is under verification with the Admin, your service options will be enabled once verified.'}
                    </p>
                  </div>
                </div>

                <button
                  id="view-verification-status-banner-btn"
                  type="button"
                  onClick={() => {
                    setBusinessVerificationModalBiz(currentBusiness);
                    setBusinessVerificationCustomMessage(
                      currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                        ? 'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
                        : 'Your account is under verification with the Admin, your service options will be enabled once verified'
                    );
                    setShowBusinessVerificationModal(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 ${
                    currentBusiness.is_hard_locked_by_admin || currentBusiness.verification_status === 'REJECTED'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  View Details &amp; Options
                </button>
              </div>
            )}

            {/* UNIFIED COCKPIT DASHBOARD (Super Admin, Admin, Business User) */}
            {currentTab === 'dashboard' && (
              <div className="space-y-4">
                <CompleteUnifiedDashboard
                  currentUser={currentUser}
                  currentBusiness={currentBusiness}
                  initialPortalMode={dashboardPortalMode}
                  onNavigateTab={(tab, subTab) => {
                    if (tab === 'marketing') {
                      if (subTab === 'directory') setMarketingSubTab('directory');
                      else if (subTab === 'linkedin_feed') setMarketingSubTab('linkedin_feed');
                      setCurrentTab('marketing');
                    } else if (tab === 'admin_desk') {
                      setAdminSubTab(subTab);
                      setCurrentTab('admin_desk');
                    } else if (tab === 'wallet') {
                      handleOpenWalletInBody();
                    } else {
                      setCurrentTab(tab);
                    }
                  }}
                  onOpenWallet={handleOpenWalletInBody}
                  onOpenCommunications={() => setShowCommunicationsModal(true)}
                  onOpenCustomerCare={() => setShowCustomerCareModal(true)}
                  onOpenUserProfile={() => setShowUserProfileModal(true)}
                  onOpenProfileMenu={() => setShowProfileMenuModal(true)}
                  onOpenApiInspector={() => setShowApiInspector(true)}
                  onSwitchActiveUser={handleQuickSelectUser}
                  onSelectBusinessToView={(biz) => {
                    setCurrentBusiness(biz);
                    setCurrentTab('marketing');
                  }}
                  onOpenCategoryManager={() => {
                    setAdminSubTab('categories');
                    setCurrentTab('admin_desk');
                  }}
                  onRefreshData={refreshData}
                  activeAdminUser={activeAdminUser}
                />
              </div>
            )}

            {/* MARKETING PORTAL: Dedicated Primary Live View */}
            {currentTab === 'marketing' && (
              <div className="space-y-3">
                {!db.isModuleActive('mod_biz_listing') && (
                  <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center justify-between shadow-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-black uppercase tracking-wider block">
                          Business Listing Module Disabled by L8 Sovereign Administrator
                        </span>
                        <span className="text-[11px] text-rose-300">
                          Public directory searches, business profiles, and quoting actions are disabled across the platform. Stories for you remain accessible.
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 px-2.5 py-1 rounded-xl border border-rose-500/40 text-rose-300 shrink-0">
                      L8 Disable In Effect
                    </span>
                  </div>
                )}

                <MarketingPortal
                  key={`${envMode}-${marketingSubTab}`}
                  currentUser={currentUser}
                  currentBusiness={currentBusiness}
                  isAdmin={isAdmin}
                  activeAdminUser={activeAdminUser}
                  initialSubTab={marketingSubTab}
                  onOpenWallet={handleOpenWalletInBody}
                  onOpenAuth={() => setShowAuthModal(true)}
                  onOpenDirectChat={() => setShowCommunicationsModal(true)}
                  onOpenUserProfile={() => setShowUserProfileModal(true)}
                  onOpenProfileMenu={() => setShowProfileMenuModal(true)}
                />
              </div>
            )}

            {/* CRM & COMMERCIAL SALES PORTAL */}
            {currentTab === 'crm_portal' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Dashboard</span>
                  </button>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                    <span>Sale Portal</span>
                  </div>
                </div>

                <CRMPortal
                  key={envMode}
                  currentBusiness={currentBusiness}
                  currentUser={currentUser}
                  activeAdminUser={activeAdminUser}
                  onOpenWallet={handleOpenWalletInBody}
                  onRefreshData={refreshData}
                  onReturnToDashboard={() => setCurrentTab('dashboard')}
                />
              </div>
            )}

            {/* IN-BODY WALLET INTERFACE (When accessed directly or via navigation) */}
            {currentTab === 'wallet' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                  <button
                    onClick={() => {
                      if (currentBusiness || isAdmin) {
                        setCurrentTab('dashboard');
                      } else {
                        setCurrentTab('marketing');
                      }
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{currentBusiness || isAdmin ? 'Return to Dashboard' : 'Return to Home'}</span>
                  </button>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Corporate Credit Wallet &amp; Treasury (In-Body Console)</span>
                  </div>
                </div>

                {currentBusiness ? (
                  <BusinessCorporateWalletModal
                    isOpen={true}
                    isInline={true}
                    onClose={() => setCurrentTab('dashboard')}
                    business={currentBusiness}
                    onWalletUpdated={refreshData}
                  />
                ) : (
                  (currentUser || allRegularUsers[0]) && (
                    <WalletRazorpayModal
                      isOpen={true}
                      isInline={true}
                      onClose={() => setCurrentTab('marketing')}
                      user={currentUser || allRegularUsers[0]}
                      onWalletUpdated={refreshData}
                    />
                  )
                )}
              </div>
            )}

            {/* ADMIN OPERATIONS C-PANEL (Accessible strictly on admin.truvaer.com) */}
            {currentTab === 'admin_desk' && (
              !isAdminSubdomain ? (
                <div className="max-w-xl mx-auto my-12 bg-slate-900 border border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Administrative Portal Relocated</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All Super Admin and Admin C-Panel operations have been strictly separated and are hosted exclusively on <strong className="text-amber-300">admin.truvaer.com</strong>. No administrative tools are accessible on the public marketplace.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentTab('marketing')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition-colors"
                    >
                      Return to Marketplace
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdminSubdomain(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors shadow-md"
                    >
                      Access admin.truvaer.com
                    </button>
                  </div>
                </div>
              ) : isAdmin || (currentUser?.permitted_portals && currentUser.permitted_portals.includes('admin_desk')) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
                    <button
                      onClick={() => setCurrentTab('dashboard')}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Return to Dashboard</span>
                    </button>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Operations &amp; Compliance Audit Desk</span>
                    </div>
                  </div>

                  <AdminCPanel
                    onRefreshAll={refreshData}
                    initialTab={adminSubTab}
                    onSelectBusinessToView={(biz) => {
                      setCurrentBusiness(biz);
                      setCurrentTab('marketing');
                    }}
                    onOpenProfileMenu={() => setShowProfileMenuModal(true)}
                    onSwitchActiveUser={handleQuickSelectUser}
                    onOpenApiInspector={() => setShowApiInspector(true)}
                    onOpenWallet={handleOpenWalletInBody}
                    onNavigateToModule={(target) => setCurrentTab(target)}
                    currentUser={currentUser}
                    activeAdminUser={activeAdminUser}
                    onMasterReset={handleResetDb}
                  />
                </div>
              ) : (
                <div className="max-w-xl mx-auto my-12 bg-slate-900 border border-rose-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Access Restricted: Permitted Portals Only</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Administrative C-Panel and ERP functions are restricted to authorized platform personnel. Your profile permissions allow access only to designated member portals.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 max-w-md mx-auto">
                    <span className="font-semibold text-sky-300">Your Permitted Channels:</span>
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                      <button
                        onClick={() => setCurrentTab('marketing')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer"
                      >
                        Marketing Directory
                      </button>
                      <button
                        onClick={() => setCurrentTab('crm_portal')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold transition-colors cursor-pointer"
                      >
                        Commercial Sales Portal
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* AUTHENTICATION MODAL (Triggered seamlessly on demand without tearing down the portal) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl lg:max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] my-auto overflow-hidden animate-fade-in">
            <div className="absolute top-3.5 right-3.5 z-20">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setPendingOtpUser(null);
                }}
                className="p-2 rounded-xl bg-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shadow-md"
                title="Close authentication window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pendingOtpUser ? (
              <div className="p-6 max-w-md mx-auto my-auto overflow-y-auto">
                <OtpVerificationView
                  user={pendingOtpUser.user}
                  initialOtp={pendingOtpUser.otp}
                  onSuccessVerified={handleOtpVerified}
                  onCancel={() => setPendingOtpUser(null)}
                />
              </div>
            ) : (
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <AuthGateway
                  initialMode="login"
                  initialUserType="regular"
                  isModal={true}
                  theme={theme}
                  onToggleTheme={handleToggleTheme}
                  onRegularLoginSuccess={handleRegularLoginSuccess}
                  onBusinessLoginSuccess={handleBusinessLoginSuccess}
                  onRegularRegisterSuccess={handleRegularRegisterSuccess}
                  onBusinessRegisterSuccess={handleBusinessRegisterSuccess}
                  onOpenOtp={(user) => handleOpenOtpForUser(user)}
                  onOpenAdminDesk={() => {
                    setShowAuthModal(false);
                    setCurrentTab('marketing');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* REQUIREMENT 3: COMMUNICATIONS & ALERTS DESK (EMAILS, CHATS, NOTIFICATIONS) */}
      <CommunicationHubModal
        isOpen={showCommunicationsModal}
        onClose={() => setShowCommunicationsModal(false)}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        onDataUpdated={refreshData}
      />

      {/* CENTRAL CUSTOMER CARE, SELF-HELP & STAFF ACTIVITY DESK */}
      <ConnectWithCustomerCareModal
        isOpen={showCustomerCareModal}
        onClose={() => setShowCustomerCareModal(false)}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        isAdmin={isAdmin}
        activeAdminUser={activeAdminUser}
        onDataUpdated={refreshData}
        onNavigateToTab={(tab) => {
          setCurrentTab(tab);
          setShowCustomerCareModal(false);
        }}
        onOpenWallet={() => {
          setShowCustomerCareModal(false);
          handleOpenWalletInBody();
        }}
        onOpenUserProfile={() => {
          setShowCustomerCareModal(false);
          setShowUserProfileModal(true);
        }}
      />

      {/* TRD API INSPECTOR MODAL */}
      <ApiInspectorModal
        isOpen={showApiInspector}
        onClose={() => setShowApiInspector(false)}
        logs={apiLogs}
        onClearLogs={() => {
          db.clearApiLogs();
          refreshData();
        }}
      />

      {/* REQUIREMENT 5: USER & BUSINESS PROFILE MODAL */}
      {showUserProfileModal && (
        <UserProfileModal
          isOpen={showUserProfileModal}
          currentUser={currentUser}
          currentBusiness={currentBusiness}
          onClose={() => setShowUserProfileModal(false)}
          onProfileUpdated={refreshData}
          onLogout={handleLogout}
          onTestWarningModal={() => {
            setShowUserProfileModal(false);
            sessionManager.triggerWarningModalDemo();
          }}
          idleTimeoutMinutes={sessionManager.sessionSettings.idleTimeoutMinutes}
          warningMinutes={sessionManager.sessionSettings.warningMinutes}
        />
      )}

      {/* PROFILE MENU INTERFACE: Unified Equal Easy-Access Module Launcher (For Admin, Business & Regular User) */}
      <ProfileMenuInterfaceModal
        isOpen={showProfileMenuModal}
        onClose={() => setShowProfileMenuModal(false)}
        currentUser={currentUser}
        currentBusiness={currentBusiness}
        isAdmin={isAdmin}
        onNavigateToTab={(tab, subTab) => {
          setCurrentTab(tab);
          if (subTab) {
            setAdminSubTab(subTab);
          }
        }}
        onOpenWallet={() => {
          setShowProfileMenuModal(false);
          handleOpenWalletInBody();
        }}
        onOpenCommunications={() => setShowCommunicationsModal(true)}
        onOpenUserProfile={() => setShowUserProfileModal(true)}
        onOpenPasswordReset={() => setShowPasswordResetModal(true)}
        onOpenApiInspector={() => setShowApiInspector(true)}
        onOpenPolicy={(slug) => {
          setCurrentPolicySlug(slug);
          setShowLegalModal(true);
        }}
      />

      {/* 3-PASSWORD SECURITY VERIFICATION MODAL FOR PASSWORD RESET */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        initialIdentifier={
          currentUser?.email ||
          currentUser?.username ||
          currentBusiness?.business_email ||
          currentBusiness?.registration_number ||
          ''
        }
        onPasswordResetSuccess={() => {
          refreshData();
        }}
      />

      {/* REQUIREMENT: BUSINESS ACCOUNT VERIFICATION & HARD-LOCK MODAL */}
      <BusinessVerificationModal
        isOpen={showBusinessVerificationModal}
        onClose={() => setShowBusinessVerificationModal(false)}
        business={businessVerificationModalBiz || currentBusiness}
        customMessage={businessVerificationCustomMessage}
        isHardLockedByAdmin={businessVerificationModalBiz?.is_hard_locked_by_admin}
      />

      {/* GLOBAL ENTERPRISE AVIATION FOOTER */}
      <GlobalFooter
        onOpenPolicy={(slug) => {
          setCurrentPolicySlug(slug);
          setShowLegalModal(true);
        }}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        isAdmin={isAdmin}
        isLoggedIn={Boolean(currentUser || currentBusiness)}
      />

      {/* COMPREHENSIVE LEGAL & POLICIES PORTAL (Interactive & URL-Routed) */}
      <LegalPoliciesPortal
        isOpen={showLegalModal}
        onClose={() => {
          setShowLegalModal(false);
          if (window.location.hash.startsWith('#/')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
        initialPolicy={currentPolicySlug}
        onSelectPolicy={(slug) => setCurrentPolicySlug(slug)}
      />

      {/* ========================================================================= */}
      {/* ENTERPRISE SESSION TIMEOUT WARNING MODAL (2-5 MIN WARNING PROMPT)         */}
      {/* ========================================================================= */}
      <SessionTimeoutWarningModal
        isOpen={sessionManager.isWarningModalOpen}
        remainingSeconds={sessionManager.remainingSeconds}
        totalWarningSeconds={sessionManager.totalWarningSeconds}
        activeSession={sessionManager.activeSession}
        onStayLoggedIn={sessionManager.stayLoggedIn}
        onLogoutNow={handleLogout}
        isExtending={sessionManager.isExtending}
      />

      {/* STRICT SINGLE SESSION TERMINATION NOTIFICATION MODAL */}
      {sessionTerminationNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Single-Session Security Protocol</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {sessionTerminationNotice}
              </p>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-left text-[11px] text-slate-400 font-mono space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Protocol:</span>
                <span className="text-emerald-400 font-bold">Strict Single Session</span>
              </div>
              <div className="flex justify-between">
                <span>Policy:</span>
                <span className="text-rose-400">Previous Session Auto-Terminated</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-amber-400">Signed Out Securely</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSessionTerminationNotice(null);
                setShowAuthModal(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
            >
              Sign In to New Session
            </button>
          </div>
        </div>
      )}

      {/* Aggressive Automated Load & Governance Testing Suite Modal (Restricted exclusively to Admin, removed for Standard and Business users) */}
      {isAdmin && (
        <AggressiveTestingSuiteModal
          isOpen={showTestSuiteModal}
          onClose={() => setShowTestSuiteModal(false)}
          currentUser={currentUser}
          currentBusiness={currentBusiness}
          activeAdminUser={activeAdminUser}
          onRefreshData={() => {}}
        />
      )}

      {/* DYNAMIC HELP & DOCUMENTATION CENTER (RBAC Permission Filtered) */}
      <DynamicHelpCenterModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        currentUser={currentUser}
        activeAdminUser={activeAdminUser}
        onNavigateToTab={(tab, subTab) => {
          setCurrentTab(tab);
          if (tab === 'marketing') {
            if (subTab === 'directory') setMarketingSubTab('directory');
            else setMarketingSubTab('linkedin_feed');
          } else if (tab === 'admin_desk' && subTab) {
            setAdminSubTab(subTab);
          }
        }}
      />

      {/* ADMIN PASSWORD SETUP & ACTIVATION MODAL (Triggered by tokenized URL or L7/L8 reset) */}
      <AdminPasswordSetupModal
        isOpen={passwordSetupData.isOpen}
        initialEmail={passwordSetupData.email}
        initialToken={passwordSetupData.token}
        onClose={() => {
          setPasswordSetupData({ isOpen: false, email: '', token: '' });
          if (window.location.hash.includes('set-password')) {
            window.location.hash = '';
          }
        }}
        onSuccess={() => {
          refreshData();
          setIsAdminSubdomain(true);
        }}
      />

      {/* ZERO-DOWNTIME CI/CD CONTINUOUS UPDATE NOTIFIER */}
      <VersionUpdateNotifier />
    </div>
  );
}

import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Building2,
  Lock,
  FileCode,
  LogOut,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Store,
  Sparkles,
  Layers,
  Crown,
  UserCheck,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  TrendingUp,
  Compass,
  Globe,
  Users,
  Briefcase,
  FlaskConical,
  Zap,
  Sliders,
  LayoutGrid,
  Headphones,
  Newspaper,
  Home,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { RegularUser, BusinessProfile } from '../types';

export type AppTab = 'dashboard' | 'marketing' | 'crm_portal' | 'admin_desk' | 'wallet';

interface NavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
  onQuickSelectUser: (user: RegularUser) => void;
  onQuickSelectBusiness: (biz: BusinessProfile) => void;
  onOpenApiInspector: () => void;
  onOpenWallet: () => void;
  onOpenCommunications: () => void;
  onOpenCustomerCare?: () => void;
  onOpenHelp?: () => void;
  onOpenUserProfile?: () => void;
  onOpenProfileMenu?: () => void;
  onResetDb: () => void;
  allRegularUsers: RegularUser[];
  allBusinesses: BusinessProfile[];
  envMode: 'LIVE' | 'TESTING';
  onToggleEnvMode: () => void;
  onSimulateLiveEvent: () => void;
  onOpenVerificationModal?: () => void;
  onNavigateToStories?: () => void;
  onNavigateToServiceScout?: () => void;
  onOpenTestSuite?: () => void;
  marketingSubTab?: 'linkedin_feed' | 'directory';
  isAdminSubdomain?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  currentBusiness,
  theme,
  onToggleTheme,
  onLogout,
  onOpenAuth,
  onQuickSelectUser,
  onQuickSelectBusiness,
  onOpenApiInspector,
  onOpenWallet,
  onOpenCommunications,
  onOpenUserProfile,
  onOpenProfileMenu,
  onResetDb,
  allRegularUsers,
  allBusinesses,
  envMode,
  onToggleEnvMode,
  onSimulateLiveEvent,
  onOpenVerificationModal,
  onOpenCustomerCare,
  onOpenHelp,
  onNavigateToStories,
  onNavigateToServiceScout,
  onOpenTestSuite,
  marketingSubTab,
  isAdminSubdomain = false,
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const [showTestingTools, setShowTestingTools] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const pendingBizCount = allBusinesses.filter((b) => b.verification_status === 'HARD_LOCKED').length;
  const isAuthenticated = !!(currentUser || currentBusiness);

  const isAdmin =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'MANAGER';

  const isSuperAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.email === 'aditya@yarifly.com' ||
    currentUser?.user_id === 'usr_super_admin';

  const isBusinessUser = !!currentBusiness;
  const businessWalletBalance = currentBusiness?.corporate_wallet?.credit_balance ?? 0;

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-slate-900/98 backdrop-blur-md text-slate-100 border-b border-slate-800 shadow-lg">
      <div className="w-full max-w-full px-4 sm:px-8 lg:px-12">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between min-h-[3.75rem] py-1.5 gap-2 sm:gap-3">
          {/* ========================================================================= */}
          {/* LEFT: Brand Logo & Title + LIVE/TESTING Identifiable Environment Badge   */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
            {/* Logo: Always returns directly to Home Page */}
            <div
              className="flex items-center space-x-2 cursor-pointer group shrink-0"
              onClick={() => {
                if (onNavigateToStories) {
                  onNavigateToStories();
                } else {
                  setCurrentTab('marketing');
                }
              }}
              title="Truvaer.com - Aviation Community Home"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center p-0.5 !bg-white bg-white shadow-md border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="TruvAer Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/aistudio/logo_d963e315.jpeg';
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white font-mono">Truvaer</span>
                  <span className="text-xs text-blue-400 font-bold hidden sm:inline">.com</span>
                </div>
                <p className="text-[10px] text-slate-400 hidden xl:block leading-tight font-medium">
                  Aviation Community
                </p>
              </div>
            </div>

            {/* Requirement 1: Easily Identifiable LIVE vs TESTING Application Interface */}
            <div className="relative">
              <div
                className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold border shadow-inner transition-all ${
                  envMode === 'LIVE'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/20'
                    : 'bg-amber-950/80 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/20'
                }`}
              >
                {envMode === 'LIVE' ? (
                  <>
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="tracking-wide text-[10px] sm:text-[11px] font-mono font-bold whitespace-nowrap">
                      LIVE<span className="hidden xl:inline"> MODE</span>
                    </span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="tracking-wide text-[10px] sm:text-[11px] font-mono font-bold whitespace-nowrap">
                      TEST<span className="hidden xl:inline">ING MODE</span>
                    </span>
                  </>
                )}

                {/* Quick Toggle Button between LIVE and TESTING */}
                <button
                  type="button"
                  onClick={onToggleEnvMode}
                  className={`ml-0.5 sm:ml-1 text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded transition-all cursor-pointer whitespace-nowrap ${
                    envMode === 'LIVE'
                      ? 'bg-emerald-800/60 hover:bg-emerald-700 text-emerald-100 hover:text-white'
                      : 'bg-amber-800/60 hover:bg-amber-700 text-amber-100 hover:text-white'
                  }`}
                  title={envMode === 'LIVE' ? 'Switch to Testing Environment' : 'Switch to Live Environment'}
                >
                  {envMode === 'LIVE' ? 'Go Test' : 'Go Live'}
                </button>

                {/* If in testing mode, open testing drawer/dropdown */}
                {envMode === 'TESTING' && (
                  <button
                    type="button"
                    onClick={() => setShowTestingTools(!showTestingTools)}
                    className="ml-0.5 p-0.5 rounded hover:bg-amber-800/50 text-amber-300 transition-colors cursor-pointer"
                    title="Testing Simulation Tools"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Testing Tools Dropdown */}
              {envMode === 'TESTING' && showTestingTools && (
                <div className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-amber-500/40 rounded-2xl p-3 shadow-2xl z-50 text-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Testing Environment Tools</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTestingTools(false)}
                      className="text-slate-400 hover:text-white font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    Simulate real-time activity events, reset test databases, or toggle between test accounts.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSimulateLiveEvent();
                        setShowTestingTools(false);
                      }}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Simulate Real-time Action</span>
                    </button>

                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onResetDb();
                          setShowTestingTools(false);
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                        <span>Factory Reset Database (Super Admin)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER: Navigation Links (Visible inline on lg+ screens)                  */}
          {/* ========================================================================= */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center flex-wrap gap-1 xl:gap-2 min-w-0">
              {/* Home Page */}
              <button
                id="navbar-home-btn"
                type="button"
                onClick={() => {
                  if (onNavigateToStories) {
                    onNavigateToStories();
                  } else {
                    setCurrentTab('marketing');
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentTab === 'marketing' && marketingSubTab !== 'directory'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Truvaer Home - Aviation Community & Feed"
              >
                <Home className="w-3.5 h-3.5 text-blue-400" />
                <span>Home</span>
              </button>

              {/* ServiceScout Directory */}
              {(() => {
                const isBizActive = db.isModuleActive('mod_biz_listing');
                const isServiceScoutActive = currentTab === 'marketing' && marketingSubTab === 'directory';
                return (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isBizActive) {
                        alert('ServiceScout Directory is currently Disabled by L8 Sovereign Administrator. All business listing services are temporarily offline.');
                        return;
                      }
                      if (onNavigateToServiceScout) {
                        onNavigateToServiceScout();
                      } else {
                        setCurrentTab('marketing');
                      }
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      !isBizActive
                        ? 'text-slate-500 bg-slate-900/40 border border-slate-800 cursor-not-allowed opacity-75'
                        : isServiceScoutActive
                        ? 'bg-sky-600/25 text-sky-300 border border-sky-500/50 shadow-sm cursor-pointer'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                    }`}
                    title={isBizActive ? 'ServiceScout - Verified Business Directory & Fleet Search' : 'ServiceScout Directory Disabled by Administration'}
                  >
                    <Compass className={`w-3.5 h-3.5 ${isBizActive ? 'text-sky-400' : 'text-slate-600'}`} />
                    <span>ServiceScout</span>
                    {!isBizActive && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Disabled
                      </span>
                    )}
                  </button>
                );
              })()}

              {/* Centralized Connect with Customer Care */}
              {onOpenCustomerCare && (
                <button
                  id="navbar-connect-customer-care-btn"
                  type="button"
                  onClick={onOpenCustomerCare}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isBusinessUser
                      ? 'text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/30'
                      : 'text-blue-300 hover:text-white hover:bg-blue-950/40 border border-blue-500/30'
                  }`}
                  title={isBusinessUser ? 'VIP Concierge: Priority Live Chat & Phone Callback (B2B Queue)' : 'Customer Care: Live Chat & Support (Standard Tier)'}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>{isBusinessUser ? 'VIP Care' : 'Care'}</span>
                </button>
              )}

              {/* Dynamic Help Center - Anchored directly adjacent to Care on Home Page ONLY */}
              {currentTab === 'dashboard' && onOpenHelp && (
                <button
                  id="navbar-help-center-btn"
                  type="button"
                  onClick={onOpenHelp}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/30 shadow-xs"
                  title="Aviation Platform Help & Knowledge Center"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Help</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* RIGHT: Actions, Theme, Role Switches, Wallet & Auth Button                */}
          {/* ========================================================================= */}
          <div className="flex items-center flex-wrap justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Toggle (Light / Dark) */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform hover:rotate-45" />
                  <span className="hidden xl:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400 transition-transform" />
                  <span className="hidden xl:inline text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Aggressive Test Suite Button - Only visible/accessible to Admin / Super Admin on admin.truvaer.com */}
            {isAdminSubdomain && isAdmin && onOpenTestSuite && (
              <button
                id="aggressive-test-suite-btn"
                type="button"
                onClick={onOpenTestSuite}
                className="hidden sm:flex items-center space-x-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Open Aggressive Automated Load Test & Governance Verification Suite (Platform Admin Only)"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline font-mono">Test Suite</span>
              </button>
            )}
            {/* Quick Profile / Demo Account Switcher */}
            {!isBusinessUser && (envMode === 'TESTING' || (isAdminSubdomain && isAdmin)) && (
              <div className="relative">
              <button
                id="quick-demo-presets-btn"
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-sm"
                title="Switch active user or business profile"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="hidden xl:inline">Switch Account</span>
                <span className="hidden sm:inline xl:hidden">Account</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPresets && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-84 max-w-[calc(100vw-1.5rem)] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-2.5 z-50 text-xs text-slate-200 max-h-[85vh] overflow-y-auto"
                  onClick={() => setShowPresets(false)}
                >
                  {/* Category 1: Platform Administration & Command Governance (Exclusively on admin.truvaer.com) */}
                  {isAdminSubdomain && (
                    <>
                      <div className="px-2 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Admin &amp; Command Console</span>
                        <span className="text-[10px] text-amber-500 font-mono">Operations</span>
                      </div>
                      {allRegularUsers
                        .filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' || u.role === 'MANAGER')
                        .map((u) => (
                          <button
                            key={u.user_id}
                            type="button"
                            onClick={() => {
                              onQuickSelectUser(u);
                              setCurrentTab('dashboard');
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between group cursor-pointer transition-colors"
                          >
                            <div className="truncate pr-2">
                              <div className="font-semibold text-white group-hover:text-amber-400 flex items-center space-x-1.5">
                                <span>@{u.username}</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({[u.first_name, u.last_name].filter(Boolean).join(' ')})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              {u.role === 'SUPER_ADMIN' ? 'SUPER ADMIN (L8)' : 'ADMIN (L7)'}
                            </span>
                          </button>
                        ))}
                      <div className="border-t border-slate-800 my-1.5"></div>
                    </>
                  )}

                  {/* Category 2: Standard Users */}
                  <div className="px-2 py-1 text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Standard Users</span>
                    <span className="text-[10px] text-slate-500 font-mono">Members</span>
                  </div>
                  {allRegularUsers
                    .filter((u) => u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN' && u.role !== 'MANAGER')
                    .map((u) => (
                      <button
                        key={u.user_id}
                        type="button"
                        onClick={() => {
                          onQuickSelectUser(u);
                          setCurrentTab('marketing');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between group cursor-pointer transition-colors"
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-white group-hover:text-blue-400 flex items-center space-x-1.5">
                            <span>@{u.username}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({[u.first_name, u.last_name].filter(Boolean).join(' ') || 'Standard User'})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                          {u.role || 'STANDARD'}
                        </span>
                      </button>
                    ))}

                  <div className="border-t border-slate-800 my-1.5"></div>

                  {/* Category 3: Business Users */}
                  <div className="px-2 py-1 text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Business Users</span>
                    <span className="text-[10px] text-slate-500 font-mono">Corporate</span>
                  </div>
                  {allBusinesses.map((b) => (
                    <button
                      key={b.business_id}
                      type="button"
                      onClick={() => {
                        onQuickSelectBusiness(b);
                        setCurrentTab('dashboard');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between group cursor-pointer transition-colors"
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-white group-hover:text-indigo-400 truncate">
                          {b.organization_name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <span>{b.registration_number}</span>
                          {b.truvaer_id && (
                            <span className="font-mono text-[10px] text-amber-400 font-bold">({b.truvaer_id})</span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          b.verification_status === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : b.verification_status === 'HARD_LOCKED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {b.verification_status}
                      </span>
                    </button>
                  ))}

                  {isSuperAdmin && (
                    <>
                      <div className="border-t border-slate-800 my-1.5"></div>
                      <button
                        type="button"
                        onClick={onResetDb}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-950/40 text-rose-400 hover:text-rose-200 flex items-center space-x-2 cursor-pointer transition-colors text-[11px]"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                        <span>Factory Reset Database (Super Admin)</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Dashboard button - Moved to Operations position at Header for Admin & Business Users */}
            {isAuthenticated && (isAdmin || isBusinessUser) && (
              <button
                id="navbar-unified-dashboard-btn"
                type="button"
                onClick={() => setCurrentTab('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  currentTab === 'dashboard'
                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-amber-500/20 font-black'
                    : 'bg-slate-800 border-slate-700 text-amber-300 hover:text-white hover:bg-slate-750'
                }`}
                title="Unified Cockpit: Operations, Sales, Marketing, Support, Finance & Modules"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
                {isAdmin && pendingBizCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-400 text-slate-950">
                    {pendingBizCount}
                  </span>
                )}
              </button>
            )}

            {/* API Inspector toggle: Housed inside Ops & ERP only, never on home page */}
            {isAuthenticated && isAdmin && currentTab === 'admin_desk' && (
              <button
                id="api-inspector-toggle-btn"
                type="button"
                onClick={onOpenApiInspector}
                className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-sky-400 px-2 py-1.5 rounded-lg border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
                title="Inspect API contracts (Admin Only)"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">API</span>
              </button>
            )}

            {/* User Profile & Wallet cluster */}
            <div className="flex items-center space-x-2 pl-1.5 border-l border-slate-800">
              {/* Wallet Button: Removed for Business user from navbar/home page as requested; only displayed at Dashboard */}
              {isBusinessUser ? null : currentUser && currentUser.role === 'STANDARD_USER' ? (
                <div
                  className="hidden md:flex items-center space-x-1.5 bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-default"
                  title="Standard User Account"
                >
                  <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Standard User</span>
                </div>
              ) : (isAdmin && currentTab === 'admin_desk') ? (
                <button
                  id="global-wallet-btn"
                  type="button"
                  onClick={onOpenWallet}
                  className="flex items-center space-x-1.5 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-500/30 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title="Admin Treasury & Reserves"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Treasury</span>
                </button>
              ) : null}

              {/* User Profile Cluster (Sign in / Sign out removed from header part) */}
              {isAuthenticated ? (
                <button
                  id="navbar-user-profile-btn"
                  type="button"
                  onClick={onOpenUserProfile}
                  className="flex items-center space-x-2 text-left hover:bg-slate-800/80 p-1.5 rounded-xl transition-colors cursor-pointer group"
                  title="Open Account Profile & Settings (Sign out available inside)"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 group-hover:border-blue-400 transition-colors overflow-hidden">
                    {currentUser?.avatar_url ? (
                      <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : currentBusiness?.logoUrl ? (
                      <img src={currentBusiness.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : currentUser ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-semibold text-white group-hover:text-blue-300 leading-tight truncate max-w-[110px]">
                      {currentUser ? `@${currentUser.username}` : currentBusiness?.organization_name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {currentUser
                        ? isAdmin
                          ? 'Admin'
                          : 'Standard'
                        : currentBusiness?.verification_status === 'VERIFIED'
                        ? 'Biz Verified'
                        : 'Standard Mode'}
                    </div>
                  </div>
                </button>
              ) : null}

              {/* Responsive Mobile / Tablet Navigation Drawer Button */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setMobileNavOpen((prev) => !prev)}
                  className="lg:hidden p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  title="Navigation Menu"
                >
                  {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Expanded Navigation Bar */}
        {isAuthenticated && mobileNavOpen && (
          <div className="lg:hidden border-t border-slate-800 py-2.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                if (onNavigateToStories) onNavigateToStories();
                else setCurrentTab('marketing');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'marketing' && marketingSubTab !== 'directory'
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white bg-slate-800/70'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span>Home</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                if (!db.isModuleActive('mod_biz_listing')) return;
                if (onNavigateToServiceScout) onNavigateToServiceScout();
                else setCurrentTab('marketing');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'marketing' && marketingSubTab === 'directory'
                  ? 'bg-sky-600/25 text-sky-300 border border-sky-500/50'
                  : 'text-slate-300 hover:text-white bg-slate-800/70'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>ServiceScout</span>
            </button>

            {onOpenCustomerCare && (
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onOpenCustomerCare();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/70 text-blue-300 hover:text-white cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{isBusinessUser ? 'VIP Care' : 'Care'}</span>
              </button>
            )}

            {currentTab === 'dashboard' && onOpenHelp && (
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onOpenHelp();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/70 text-amber-300 hover:text-white cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Help</span>
              </button>
            )}

            {isAdminSubdomain && isAdmin && onOpenTestSuite && (
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  onOpenTestSuite();
                }}
                className="sm:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Suite</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

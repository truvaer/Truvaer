import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldCheck,
  Building2,
  TrendingUp,
  LayoutGrid,
  Eye,
  RefreshCw,
  Sparkles,
  User,
  Compass,
  Headphones,
  CheckCircle2,
  Bell,
  MessageSquare,
  ArrowLeft,
  Wallet,
} from 'lucide-react';
import { RegularUser, BusinessProfile } from '../types';
import { AdminDashboardView } from './AdminDashboardView';
import { BusinessDashboardView } from './BusinessDashboardView';
import { AdminCPanel } from '../erp/AdminCPanel';
import { CRMPortal } from '../erp/CRMPortal';
import { CommunicationHubModal } from '../shared/CommunicationHubModal';
import { ConnectWithCustomerCareModal } from '../shared/ConnectWithCustomerCareModal';
import { BusinessCorporateWalletModal } from '../business/BusinessCorporateWalletModal';
import { WalletRazorpayModal } from '../shared/WalletRazorpayModal';
import { db } from '../data/mockDatabase';
import { AdminUser } from '../types';
import { FlashNewsPublicationDesk } from '../erp/FlashNewsPublicationDesk';

export type CockpitPortalMode = 'DASHBOARD' | 'OPERATIONS' | 'SALE' | 'COMMUNICATIONS' | 'CHAT' | 'WALLET';

interface CompleteUnifiedDashboardProps {
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  onNavigateTab: (tab: 'marketing' | 'crm_portal' | 'admin_desk' | 'wallet', subTab?: string) => void;
  onOpenWallet: () => void;
  onOpenCommunications: () => void;
  onOpenCustomerCare: () => void;
  onOpenUserProfile: () => void;
  onOpenProfileMenu?: () => void;
  onOpenApiInspector?: () => void;
  onSwitchActiveUser?: (user: RegularUser) => void;
  onSelectBusinessToView?: (biz: BusinessProfile) => void;
  onOpenCategoryManager?: () => void;
  onRefreshData?: () => void;
  activeAdminUser?: AdminUser | null;
  initialPortalMode?: CockpitPortalMode;
}

export type DashboardRoleView = 'ADMIN' | 'BUSINESS_USER';

export const CompleteUnifiedDashboard: React.FC<CompleteUnifiedDashboardProps> = ({
  currentUser,
  currentBusiness,
  onNavigateTab,
  onOpenWallet,
  onOpenCommunications,
  onOpenCustomerCare,
  onOpenUserProfile,
  onOpenProfileMenu,
  onOpenApiInspector,
  onSwitchActiveUser,
  onSelectBusinessToView,
  onOpenCategoryManager,
  onRefreshData,
  activeAdminUser,
  initialPortalMode,
}) => {
  const isAdmin =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'MANAGER' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'admin@truvaer.com';

  const isBusinessUser = !!currentBusiness || currentUser?.role === 'BUSINESS_USER';

  const defaultRoleView: DashboardRoleView = isAdmin ? 'ADMIN' : 'BUSINESS_USER';

  // Toggle between Dashboard Overview, Operations, Sale, Communications, Chat & Wallet inside Dashboard body
  const [portalMode, setPortalMode] = useState<CockpitPortalMode>(initialPortalMode || 'DASHBOARD');

  useEffect(() => {
    if (initialPortalMode) {
      setPortalMode(initialPortalMode);
    }
  }, [initialPortalMode]);

  const [cpanelActiveTab, setCpanelActiveTab] = useState<string>('categories');
  const [showFlashDeskModal, setShowFlashDeskModal] = useState<boolean>(false);

  // Allow admins to preview other role dashboards easily
  const [activeRoleView, setActiveRoleView] = useState<DashboardRoleView>(defaultRoleView);

  // Fallback business profile if previewing as business user while logged in as admin
  const activeBusinessProfile: BusinessProfile =
    currentBusiness ||
    db.getBusinesses()[0] || {
      business_id: 'biz_truvaer_exec',
      organization_name: 'Truvaer Aviation Holdings',
      email: 'corp@truvaer.com',
      phone: '+91 98765 43210',
      category: 'Aircraft Charter & Fleet Management',
      subCategory: 'Heavy Private Jets',
      verification_status: 'VERIFIED',
      registered_at: new Date().toISOString(),
      country: 'India',
      city: 'Mumbai',
      corporate_wallet: {
        credit_balance: 15000,
        currency: 'INR',
        auto_renew: true,
        threshold_alert: 1000,
      },
    };

  const handleNavigateInternal = (tab: 'marketing' | 'crm_portal' | 'admin_desk', subTab?: string) => {
    if (tab === 'admin_desk') {
      if (subTab) {
        setCpanelActiveTab(subTab);
      }
      setPortalMode('OPERATIONS');
    } else if (tab === 'crm_portal') {
      setPortalMode('SALE');
    } else {
      onNavigateTab(tab, subTab);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* COCKPIT TOOLBAR: DASHBOARD, OPERATIONS, SALE, COMMUNICATION & CHAT        */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-lg">
        {/* Navigation & Action Cluster */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          {/* 1. Dashboard Overview Toggle */}
          <button
            id="dashboard-mode-toggle-btn"
            type="button"
            onClick={() => setPortalMode('DASHBOARD')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              portalMode === 'DASHBOARD'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          {/* 2. Operations & C-Panel Desk Toggle (Admins only) */}
          {isAdmin && (
            <button
              id="operations-mode-toggle-btn"
              type="button"
              onClick={() => setPortalMode('OPERATIONS')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                portalMode === 'OPERATIONS'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Operations &amp; C-Panel Desk</span>
            </button>
          )}

          {/* Clean divider */}
          <div className="h-5 w-px bg-slate-800 mx-1 shrink-0" />

          {/* Wallet Button (Repositioned Credit button changed to Wallet for Business accounts & Admins) */}
          {(currentBusiness || isAdmin || isBusinessUser) && (
            <button
              id="dashboard-wallet-btn"
              type="button"
              onClick={() => setPortalMode(portalMode === 'WALLET' ? 'DASHBOARD' : 'WALLET')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                portalMode === 'WALLET'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-emerald-400 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20'
              }`}
              title="Corporate Credit Wallet & Treasury (Opens in Body Below)"
            >
              <Wallet className="w-3.5 h-3.5 text-current" />
              <span>Wallet</span>
              {currentBusiness && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  portalMode === 'WALLET'
                    ? 'bg-slate-950 text-emerald-300 font-bold'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {currentBusiness.credit_wallet_balance ?? 0}
                </span>
              )}
            </button>
          )}

          {/* 3. Commercial Sale Portal Button (In-body toggle like Operations & C-Panel Desk) */}
          {(isAdmin || (isBusinessUser && currentBusiness?.verification_status === 'VERIFIED')) && (
            <button
              id="dashboard-sale-portal-btn"
              type="button"
              onClick={() => setPortalMode(portalMode === 'SALE' ? 'DASHBOARD' : 'SALE')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                portalMode === 'SALE'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                  : 'text-sky-400 hover:text-white hover:bg-sky-950/40 border border-sky-500/20'
              }`}
              title="Commercial Sale Portal: Pipeline, Leads, Quotations & Commissions (In-Body Desk)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-current" />
              <span>Sale</span>
            </button>
          )}

          {/* 4. Communication Button (In-Body Webpage) */}
          <button
            id="dashboard-comms-hub-btn"
            type="button"
            onClick={() => setPortalMode(portalMode === 'COMMUNICATIONS' ? 'DASHBOARD' : 'COMMUNICATIONS')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              portalMode === 'COMMUNICATIONS'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/20'
            }`}
            title="Communications Hub: Emails, Notifications & Announcements (Opens in Body Below)"
          >
            <div className="relative">
              <Bell className="w-3.5 h-3.5 text-current" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <span>Communication</span>
          </button>

          {/* 5. Chat Button (In-Body Webpage) */}
          <button
            id="dashboard-chat-hub-btn"
            type="button"
            onClick={() => setPortalMode(portalMode === 'CHAT' ? 'DASHBOARD' : 'CHAT')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              portalMode === 'CHAT'
                ? 'bg-blue-500 text-slate-950 shadow-md font-black'
                : 'text-blue-300 hover:text-white hover:bg-blue-950/40 border border-blue-500/20'
            }`}
            title="Encrypted Chat & Customer Care Desk (Opens in Body Below)"
          >
            <MessageSquare className="w-3.5 h-3.5 text-current" />
            <span>Chat</span>
          </button>
        </div>

        {/* Perspective switcher (only shown in DASHBOARD mode for previewing roles) */}
        {isAdmin && portalMode === 'DASHBOARD' && (
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-1">
              Role View:
            </span>
            <button
              type="button"
              onClick={() => setActiveRoleView('ADMIN')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                activeRoleView === 'ADMIN'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setActiveRoleView('BUSINESS_USER')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                activeRoleView === 'BUSINESS_USER'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Business
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW: INLINE WALLET, COMMUNICATIONS, CHAT, SALE, OPERATIONS OR DASHBOARDS */}
      {/* ========================================================================= */}
      {portalMode === 'WALLET' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <button
              onClick={() => setPortalMode('DASHBOARD')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1.5 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard Overview</span>
            </button>
            <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Corporate Credit Wallet &amp; Treasury (In-Body Console)</span>
            </div>
          </div>
          {currentBusiness ? (
            <BusinessCorporateWalletModal
              isOpen={true}
              isInline={true}
              onClose={() => setPortalMode('DASHBOARD')}
              business={currentBusiness || activeBusinessProfile}
              onWalletUpdated={() => {
                if (onRefreshData) onRefreshData();
              }}
            />
          ) : (
            (currentUser || db.getRegularUsers()[0]) && (
              <WalletRazorpayModal
                isOpen={true}
                isInline={true}
                onClose={() => setPortalMode('DASHBOARD')}
                user={currentUser || db.getRegularUsers()[0]}
                onWalletUpdated={() => {
                  if (onRefreshData) onRefreshData();
                }}
              />
            )
          )}
        </div>
      ) : portalMode === 'COMMUNICATIONS' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <button
              onClick={() => setPortalMode('DASHBOARD')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1.5 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard Overview</span>
            </button>
            <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Communications &amp; Alerts Desk (In-Body Console)</span>
            </div>
          </div>
          <CommunicationHubModal
            isOpen={true}
            isInline={true}
            onClose={() => setPortalMode('DASHBOARD')}
            currentUser={currentUser}
            currentBusiness={currentBusiness}
            onDataUpdated={onRefreshData}
          />
        </div>
      ) : portalMode === 'CHAT' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <button
              onClick={() => setPortalMode('DASHBOARD')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1.5 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard Overview</span>
            </button>
            <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Encrypted Chat &amp; Customer Care (In-Body Console)</span>
            </div>
          </div>
          <ConnectWithCustomerCareModal
            isOpen={true}
            isInline={true}
            onClose={() => setPortalMode('DASHBOARD')}
            currentUser={currentUser}
            currentBusiness={currentBusiness}
            isAdmin={isAdmin}
            activeAdminUser={activeAdminUser}
            onDataUpdated={onRefreshData}
            onNavigateToTab={(tab) => onNavigateTab(tab)}
            onOpenWallet={() => setPortalMode('WALLET')}
            onOpenUserProfile={onOpenUserProfile}
          />
        </div>
      ) : portalMode === 'SALE' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <button
              onClick={() => setPortalMode('DASHBOARD')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1.5 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard Overview</span>
            </button>
            <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Commercial Sale &amp; CRM Desk (In-Body Console)</span>
            </div>
          </div>
          <CRMPortal
            currentUser={currentUser}
            currentBusiness={currentBusiness}
            onOpenUserProfile={onOpenUserProfile}
          />
        </div>
      ) : portalMode === 'OPERATIONS' && isAdmin ? (
        <AdminCPanel
          onRefreshAll={onRefreshData || (() => {})}
          onSelectBusinessToView={onSelectBusinessToView || (() => {})}
          onOpenProfileMenu={onOpenProfileMenu}
          initialTab={cpanelActiveTab}
          onSwitchActiveUser={onSwitchActiveUser}
          onOpenApiInspector={onOpenApiInspector}
          onOpenWallet={() => setPortalMode('WALLET')}
          onNavigateToModule={(target) => onNavigateTab(target)}
          currentUser={currentUser}
          activeAdminUser={activeAdminUser}
        />
      ) : (
        <>
          {activeRoleView === 'ADMIN' && (
            <AdminDashboardView
              currentUser={currentUser}
              onNavigateTab={handleNavigateInternal}
              onOpenWallet={() => setPortalMode('WALLET')}
              onOpenCommunications={() => setPortalMode('COMMUNICATIONS')}
              onOpenCustomerCare={() => setPortalMode('CHAT')}
              onOpenUserProfile={onOpenUserProfile}
              onRefreshData={onRefreshData}
            />
          )}

          {activeRoleView === 'BUSINESS_USER' && (
            <BusinessDashboardView
              currentBusiness={activeBusinessProfile}
              currentUser={currentUser}
              onNavigateTab={handleNavigateInternal}
              onOpenWallet={() => setPortalMode('WALLET')}
              onOpenCommunications={() => setPortalMode('COMMUNICATIONS')}
              onOpenCustomerCare={() => setPortalMode('CHAT')}
              onOpenUserProfile={onOpenUserProfile}
              onRefreshData={onRefreshData}
              onOpenFlashNewsDesk={() => setShowFlashDeskModal(true)}
            />
          )}
        </>
      )}

      {/* FLASHNEWS PUBLICATION DESK MODAL */}
      {showFlashDeskModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl my-auto">
            <FlashNewsPublicationDesk
              currentUser={currentUser}
              currentBusiness={currentBusiness || activeBusinessProfile}
              activeAdminUser={activeAdminUser}
              onClose={() => setShowFlashDeskModal(false)}
              onRefreshData={onRefreshData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

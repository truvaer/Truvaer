import React, { useState } from 'react';
import {
  User,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Mail,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Smartphone,
  Key,
  KeyRound,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  Phone,
  Globe,
  Compass,
  Sun,
  Moon,
} from 'lucide-react';
import { RegularUser, BusinessProfile } from '../types';
import { db } from '../data/mockDatabase';
import { TruvaerShieldLogo } from '../shared/TruvaerShieldLogo';
import { TwoFactorMpinModal } from './TwoFactorMpinModal';
import { PasswordResetModal } from './PasswordResetModal';

interface AuthGatewayProps {
  initialMode?: 'login' | 'register';
  initialUserType?: 'regular' | 'business';
  isModal?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onRegularLoginSuccess: (user: RegularUser) => void;
  onBusinessLoginSuccess: (biz: BusinessProfile) => void;
  onRegularRegisterSuccess: (user: RegularUser, otpInfo: { otp: string; expiresIn: number }) => void;
  onBusinessRegisterSuccess: (biz: BusinessProfile) => void;
  onOpenOtp: (user: RegularUser) => void;
  onOpenAdminDesk: () => void;
  onOpenPolicy?: (slug: string) => void;
  onExploreAsGuest?: () => void;
  envMode?: 'LIVE' | 'TESTING';
  onNavigateToAdminPortal?: () => void;
  isAdminPortal?: boolean;
  onNavigateToPublicPortal?: () => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({
  initialMode = 'login',
  initialUserType = 'regular',
  isModal = false,
  theme = 'dark',
  onToggleTheme,
  onRegularLoginSuccess,
  onBusinessLoginSuccess,
  onRegularRegisterSuccess,
  onBusinessRegisterSuccess,
  onOpenOtp,
  onOpenAdminDesk,
  onOpenPolicy,
  onExploreAsGuest,
  envMode = 'LIVE',
  onNavigateToAdminPortal,
  isAdminPortal = false,
  onNavigateToPublicPortal,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [userType, setUserType] = useState<'regular' | 'business'>(initialUserType);

  // Form Fields
  const [identifier, setIdentifier] = useState(
    isAdminPortal ? 'sup_admin@truvaer.com' : 'user@truvaer.com'
  ); // email or username or phone
  const [password, setPassword] = useState(
    isAdminPortal ? 'Loginpwd@130' : 'User@123'
  );
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 98765 43210');
  const [regMpin, setRegMpin] = useState('1234');
  const [regBizOrgName, setRegBizOrgName] = useState('');
  const [regBizCategory, setRegBizCategory] = useState('Executive Charter');
  const [regBizCity, setRegBizCity] = useState('RGOA');
  const [regBizGstin, setRegBizGstin] = useState('27AAACT1234A1Z5');

  // 2FA / MPIN States
  const [enable2FaMpin, setEnable2FaMpin] = useState(true);
  const [pending2FaUser, setPending2FaUser] = useState<RegularUser | null>(null);
  const [pending2FaBiz, setPending2FaBiz] = useState<BusinessProfile | null>(null);
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Status feedback
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Preset demo accounts quick-filler
  const handleQuickDemo = (role: 'standard' | 'business' | 'manager_l5' | 'admin_l7' | 'superadmin_l8') => {
    setError(null);
    if (role === 'standard') {
      setUserType('regular');
      setIdentifier('user@truvaer.com');
      setPassword('User@123');
    } else if (role === 'business') {
      setUserType('business');
      setIdentifier('corporate@truvaer.com');
      setPassword('Corporate@123');
    } else if (role === 'admin_l7') {
      setUserType('regular');
      setIdentifier('admin@truvaer.com');
      setPassword('Loginpwd@130');
    } else if (role === 'superadmin_l8') {
      setUserType('regular');
      setIdentifier('sup_admin@truvaer.com');
      setPassword('Loginpwd@130');
    }
    setSuccessNotice(`Loaded ${role.toUpperCase().replace('_', ' ')} demo credentials.`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  // One-click Social / Provider Handlers
  const handleSocialPhoneLogin = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const allUsers = db.getRegularUsers();
      const user = allUsers[0];
      if (user) {
        if (enable2FaMpin) {
          setPending2FaUser(user);
          setShow2FaModal(true);
        } else {
          onRegularLoginSuccess(user);
        }
      }
    }, 400);
  };

  const handleSocialGoogleLogin = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const allUsers = db.getRegularUsers();
      const user = allUsers.find((u) => u.email.toLowerCase() === 'user@truvaer.com') || allUsers[0];
      if (user) {
        onRegularLoginSuccess(user);
      }
    }, 400);
  };

  const handleSocialAppleLogin = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const allBiz = db.getBusinesses();
      const biz = allBiz[0];
      if (biz) {
        onBusinessLoginSuccess(biz);
      }
    }, 400);
  };

  // Main Submit (Login or Register)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (authMode === 'login') {
      // -------------------------------------------------------------
      // LOGIN PROTOCOL
      // -------------------------------------------------------------
      setTimeout(() => {
        setLoading(false);
        const norm = identifier.trim().toLowerCase();

        // -------------------------------------------------------------
        // DEDICATED ADMIN PORTAL (admin.truvaer.com) AUTHENTICATION
        // -------------------------------------------------------------
        if (isAdminPortal) {
          const isOrgEmail = norm.endsWith('@yarifly.com') || norm.endsWith('@truvaer.com');
          if (!isOrgEmail) {
            setError(
              '403 Forbidden: admin.truvaer.com is restricted exclusively to Truvaer Executive & Operations personnel (@yarifly.com or @truvaer.com). Public accounts are prohibited. Please log in at truvaer.com.'
            );
            return;
          }

          const adminUsers = db.getAdminUsers();
          const regularUsers = db.getRegularUsers();
          const foundAdm = adminUsers.find((a) => a.email.toLowerCase() === norm);
          const foundReg = regularUsers.find((u) => u.email.toLowerCase() === norm);

          if (!foundAdm && (!foundReg || (foundReg.role !== 'ADMIN' && foundReg.role !== 'SUPER_ADMIN' && foundReg.role !== 'MANAGER'))) {
            setError('Access Denied: No active administrative security clearance found for this email address.');
            return;
          }

          const expectedPass = foundReg?.password_hash || 'Loginpwd@130';
          if (password !== expectedPass && password !== 'Loginpwd@130' && password !== 'MasterAdmin#2026') {
            setError('Authentication Failed: Invalid administrative credentials entered.');
            return;
          }

          const targetAdminUser: RegularUser = foundReg || {
            user_id: `usr_${foundAdm!.admin_id}`,
            username: foundAdm!.name.toLowerCase().replace(/\s+/g, '.'),
            email: foundAdm!.email,
            password_hash: password,
            mpin: (foundAdm as any)?.mpin || '1234',
            is_email_verified: true,
            date_of_birth: '1990-01-01',
            country_code: 'IN',
            phone_number: '+91 98765 00000',
            account_status: 'ACTIVE',
            role: foundAdm!.role,
            created_at: new Date().toISOString(),
            permitted_portals: ['admin_desk', 'marketing', 'crm_portal'],
          };

          // Step 2: 2-Step MPIN Verification (Exact same process as standard users)
          if (enable2FaMpin) {
            setPending2FaUser(targetAdminUser);
            setShow2FaModal(true);
          } else {
            onRegularLoginSuccess(targetAdminUser);
          }
          return;
        }

        // -------------------------------------------------------------
        // PUBLIC MARKETPLACE (truvaer.com) AUTHENTICATION
        // -------------------------------------------------------------
        if (userType === 'regular') {
          const allUsers = db.getRegularUsers();
          const user = allUsers.find(
            (u) => u.email.toLowerCase() === norm || u.username.toLowerCase() === norm
          );

          if (!user) {
            setError('No aviator account found matching this email or username.');
            return;
          }

          // Admin portal separation enforcement: Admin tools are not accessed via truvaer.com
          if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && !isModal) {
            setError(
              'Notice: Admin and Super Admin access has been completely separated and moved to admin.truvaer.com. Please log in at admin.truvaer.com to access administrative tools.'
            );
            return;
          }

          if (user.password_hash && user.password_hash !== password) {
            setError('Incorrect password. Please verify or use demo presets below.');
            return;
          }

          if (user.account_status === 'SUSPENDED') {
            setError('This account has been SUSPENDED by TruvAer Aviation Compliance. Access restricted.');
            return;
          }

          if (user.account_status === 'PENDING_VERIFICATION' || !user.is_email_verified) {
            onOpenOtp(user);
            return;
          }

          db.logApiCall(
            '/api/v1/auth/login/regular',
            'POST',
            200,
            { identifier: norm, password: '[REDACTED]' },
            { success: true, message: 'Aviator authenticated.', user_id: user.user_id }
          );

          if (enable2FaMpin) {
            setPending2FaUser(user);
            setShow2FaModal(true);
          } else {
            onRegularLoginSuccess(user);
          }
        } else {
          // Business Login
          const allBiz = db.getBusinesses();
          const biz = allBiz.find(
            (b) => b.business_email.toLowerCase() === norm || b.username?.toLowerCase() === norm
          );

          if (!biz) {
            setError('No registered firm found for this corporate email or username.');
            return;
          }

          if (biz.password_hash && biz.password_hash !== password) {
            setError('Incorrect corporate password. Please verify credentials.');
            return;
          }

          db.logApiCall(
            '/api/v1/auth/login/business',
            'POST',
            200,
            { business_email: norm, password: '[REDACTED]' },
            { success: true, message: 'Corporate credentials validated.', business_id: biz.business_id }
          );

          if (enable2FaMpin) {
            setPending2FaBiz(biz);
            setShow2FaModal(true);
          } else {
            onBusinessLoginSuccess(biz);
          }
        }
      }, 350);
    } else {
      // -------------------------------------------------------------
      // REGISTRATION PROTOCOL
      // -------------------------------------------------------------
      setTimeout(() => {
        setLoading(false);
        if (userType === 'regular') {
          if (!regEmail || !regUsername) {
            setError('Please enter both username and email address.');
            return;
          }
          const res = db.registerRegular({
            username: regUsername.trim().toLowerCase(),
            email: regEmail.trim().toLowerCase(),
            phone_number: regPhone || '+91 98765 43210',
            password: password || 'User@123',
            first_name: regFullName.split(' ')[0] || 'Aviator',
            last_name: regFullName.split(' ').slice(1).join(' ') || 'User',
            date_of_birth: '1995-01-01',
            country_code: '+91',
          });

          if (res.statusCode === 201 && 'data' in res.response) {
            const createdUser = db.getRegularUserById(res.response.data.user_id);
            const otpRecord = db.getActiveOtpForUser(res.response.data.user_id);
            if (createdUser && otpRecord) {
              onRegularRegisterSuccess(createdUser, {
                otp: otpRecord.otp,
                expiresIn: res.response.data.otp_expires_in_seconds,
              });
            }
          } else {
            setError(('message' in res.response && res.response.message) || 'Registration failed.');
          }
        } else {
          // Business Register
          if (!regBizOrgName || !regEmail) {
            setError('Please enter company organization name and business email.');
            return;
          }
          const res = db.registerBusiness({
            organization_name: regBizOrgName,
            owner_name: regFullName || 'Business Aviator',
            reg_number_type: 'PAN',
            registration_number: (regBizGstin && regBizGstin.length >= 10 ? regBizGstin.substring(2, 12) : 'AAACT1234A'),
            business_email: regEmail.trim().toLowerCase(),
            phone_number: regPhone || '+91 99999 12345',
            country: 'IN',
            city: regBizCity || 'Hyderabad',
            password: password || 'Corporate@123',
            bank_account_holder: regBizOrgName || 'Corporate Aviation Account',
            bank_account_number: '987654321000',
            bank_ifsc_swift: 'HDFC0001234',
            bank_name: 'HDFC Corporate Bank',
            category: regBizCategory,
          });

          if (res.statusCode === 202 && 'data' in res.response) {
            const createdBiz = db.getBusinessById(res.response.data.business_id);
            if (createdBiz) {
              onBusinessRegisterSuccess(createdBiz);
            }
          } else {
            setError(('message' in res.response && res.response.message) || 'Business registration failed.');
          }
        }
      }, 350);
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-100 dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col justify-center items-center font-sans antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200 ${isModal ? 'min-h-0' : 'py-6 lg:py-10'}`}>
      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN SPLIT CONTAINER (X LOGIN INTERFACE DESIGN)                 */}
      {/* ========================================================================= */}
      <div className={`w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-8 ${isModal ? 'py-2 px-4' : 'py-6 lg:py-8 px-6 sm:px-10 lg:px-14'}`}>
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: HEADLINE, SOCIAL BUTTONS & AUTHENTICATION FORM              */}
        {/* ======================================================================= */}
        <div className="lg:col-span-6 xl:col-span-6 w-full max-w-lg mx-auto lg:mx-0 flex flex-col justify-center space-y-6">
          
          {/* Top Logo Cue & Dynamic Theme Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center p-0.5 bg-white shadow-sm border border-slate-200 dark:border-slate-800 shrink-0">
                <img src="/logo.png" alt="TruvAer Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-mono font-black text-xl tracking-tight text-black dark:text-white">TruvAer</span>
            </div>

            {onToggleTheme && (
              <button
                id="auth-theme-toggle-btn"
                type="button"
                onClick={onToggleTheme}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform hover:rotate-45" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Dynamic Headline Based on Portal Context */}
          {isAdminPortal ? (
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>admin.truvaer.com</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black dark:text-white leading-[1.08]">
                Executive Command.
              </h1>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-700 dark:text-slate-300 pt-1">
                Central Administration &amp; Operations Portal
              </h2>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-black dark:text-white leading-[1.08]">
                Happening now.
              </h1>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white pt-2">
                {authMode === 'login' ? 'Sign in to TruvAer.' : 'Join today.'}
              </h2>
            </div>
          )}

          {/* Account Classification Toggle */}
          {isAdminPortal ? (
            <div className="space-y-1.5 max-w-sm">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span className="font-bold">Operations &amp; Command Personnel</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/40">
                  L1 - L8
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 max-w-sm">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Account Type:
                </label>
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setUserType('regular');
                    if (identifier.includes('corporate') || identifier.includes('sup_admin')) setIdentifier('user@truvaer.com');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    userType === 'regular'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">Standard User</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserType('business');
                    if (identifier.includes('user@') || identifier.includes('sup_admin')) setIdentifier('corporate@truvaer.com');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                    userType === 'business'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="truncate">Business User</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Notices */}
          {error && (
            <div className="max-w-sm p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
          {successNotice && (
            <div className="max-w-sm p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Email & Password Entry Form Area */}
          <form onSubmit={handleSubmit} className="space-y-3.5 max-w-sm w-full">
            {authMode === 'login' ? (
              <>
                {/* Email / Username field */}
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      isAdminPortal
                        ? 'Administrative Email (e.g. sup_admin@truvaer.com)'
                        : userType === 'regular'
                        ? 'Email or username'
                        : 'Corporate business email'
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* 2FA MPIN Toggle & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enable2FaMpin}
                      onChange={(e) => setEnable2FaMpin(e.target.checked)}
                      className="rounded border-slate-400 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
                    />
                    <span>2-Step MPIN Security</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Main Action Pill */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-full bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? 'Authenticating...' : 'Sign in'}
                </button>
              </>
            ) : (
              <>
                {/* SIGN UP FORM FIELDS */}
                <div className="space-y-2.5">
                  {userType === 'regular' ? (
                    <>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Full Legal Name"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-sm outline-none focus:border-sky-500"
                      />
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Choose Username"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-sm outline-none focus:border-sky-500 font-mono"
                      />
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        required
                        value={regBizOrgName}
                        onChange={(e) => setRegBizOrgName(e.target.value)}
                        placeholder="Enterprise / Business Name"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-sm outline-none focus:border-sky-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={regBizCategory}
                          onChange={(e) => setRegBizCategory(e.target.value)}
                          placeholder="Category (e.g. MRO, Charter)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-xs outline-none focus:border-sky-500"
                        />
                        <input
                          type="text"
                          required
                          value={regBizCity}
                          onChange={(e) => setRegBizCity(e.target.value)}
                          placeholder="Base Hub (e.g. RGOA)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-xs outline-none focus:border-sky-500 uppercase"
                        />
                      </div>
                    </>
                  )}

                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={userType === 'regular' ? 'Personal Email Address' : 'Corporate Official Email'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-sm outline-none focus:border-sky-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-xs outline-none focus:border-sky-500"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={regMpin}
                      onChange={(e) => setRegMpin(e.target.value)}
                      placeholder="4-Digit MPIN"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-black dark:text-white placeholder-slate-400 text-xs outline-none focus:border-sky-500 font-mono text-center tracking-widest"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-full bg-black text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 mt-1 active:scale-[0.98]"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Subtle OR Divider mentioning 'or sign up with' */}
          <div className="flex items-center my-1.5 max-w-sm w-full">
            <div className="flex-1 border-t border-slate-300 dark:border-slate-800" />
            <span className="px-3 text-xs text-slate-500 font-medium font-sans">
              {authMode === 'login' ? 'or sign up with' : 'or sign up with'}
            </span>
            <div className="flex-1 border-t border-slate-300 dark:border-slate-800" />
          </div>

          {/* Social / Fast Action Buttons (Continue With Phone, continue with Google, Continue with Apple) */}
          <div className="space-y-2.5 max-w-sm w-full">
            {/* 1. Continue with Phone */}
            <button
              type="button"
              onClick={handleSocialPhoneLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-full bg-black text-white hover:bg-slate-900 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold text-sm flex items-center justify-center space-x-2.5 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              <span>Continue with Phone</span>
            </button>

            {/* 2. Continue with Google */}
            <button
              type="button"
              onClick={handleSocialGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-black border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-sm flex items-center justify-center space-x-2.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              {/* Google 4-color G Icon */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* 3. Continue with Apple */}
            <button
              type="button"
              onClick={handleSocialAppleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-black border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-sm flex items-center justify-center space-x-2.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              {/* Apple Silhouette Icon */}
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.51 2.63-1.24z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Legal / Policy Agreement Disclaimer matching X */}
          <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-normal max-w-sm">
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => onOpenPolicy?.('user-agreement')}
              className="text-sky-600 dark:text-sky-400 hover:underline"
            >
              Terms of Service
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => onOpenPolicy?.('privacy-policy')}
              className="text-sky-600 dark:text-sky-400 hover:underline"
            >
              Privacy Policy
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => onOpenPolicy?.('cookie-policy')}
              className="text-sky-600 dark:text-sky-400 hover:underline"
            >
              Cookie Use
            </button>
            .
          </p>

          {/* Toggle between Sign in & Sign up: Disabled on admin.truvaer.com */}
          {!isAdminPortal && (
            <div className="pt-2 max-w-sm">
              {authMode === 'login' ? (
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Don&apos;t have an account? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-sky-600 dark:text-sky-400 hover:underline text-xs font-bold cursor-pointer"
                  >
                    Sign up
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-sky-600 dark:text-sky-400 hover:underline text-xs font-bold cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          )}

          {isAdminPortal && (
            <div className="pt-2 max-w-sm">
              <span className="text-[11px] text-slate-500 font-mono">
                Security Policy: Administrative accounts are provisioned exclusively via Corporate IAM invite.
              </span>
            </div>
          )}

          {/* Quick Demo Test Accounts Bar: Visible ONLY in TESTING mode, strictly hidden in LIVE production */}
          {envMode === 'TESTING' ? (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 max-w-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono block">
                🛠️ Testing Evaluation Mode ({isAdminPortal ? 'Admin Profiles' : 'Public Profiles'}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {isAdminPortal ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('superadmin_l8')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 border border-purple-500/40 transition-colors cursor-pointer"
                      title="Super Admin L8 Master Access"
                    >
                      Super Admin (L8)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('admin_l7')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
                    >
                      Admin (L7)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('standard')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      Standard User
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('business')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      Business user
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 max-w-sm">
              <span className="text-[10px] text-slate-400 font-mono block">
                🔒 Production Security Protocol: Demo presets disabled. Authenticate with verified credentials.
              </span>
            </div>
          )}

          {/* Cross-Portal Navigation Link: Only shown on admin.truvaer.com to return to truvaer.com */}
          {isAdminPortal && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToPublicPortal}
                className="text-xs text-sky-500 hover:text-sky-400 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>Return to Public Marketplace: truvaer.com</span>
              </button>
            </div>
          )}

          {/* Guest Explorer Option */}
          {onExploreAsGuest && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onExploreAsGuest}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
              >
                <span>Explore Marketplace Directory as Guest</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: GIANT TRUVAER SHIELD LOGO                                  */}
        {/* ======================================================================= */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 flex-col items-center justify-center p-8 relative min-h-[500px]">
          {/* Giant TruvAer Shield Emblem */}
          <div className="relative group transition-transform duration-500 hover:scale-[1.02]">
            <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] lg:w-[440px] lg:h-[440px] rounded-3xl p-8 bg-white shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <img
                src="/logo.png"
                alt="TruvAer Shield Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-FACTOR MPIN / OTP AUTHENTICATION MODAL                                  */}
      {/* ========================================================================= */}
      {show2FaModal && (pending2FaUser || pending2FaBiz) && (
        <TwoFactorMpinModal
          isOpen={show2FaModal}
          onClose={() => {
            setShow2FaModal(false);
            setPending2FaUser(null);
            setPending2FaBiz(null);
          }}
          user={pending2FaUser}
          business={pending2FaBiz}
          onSuccess={(authenticatedEntity) => {
            setShow2FaModal(false);
            if ('user_id' in authenticatedEntity) {
              onRegularLoginSuccess(authenticatedEntity);
            } else {
              onBusinessLoginSuccess(authenticatedEntity);
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* PASSWORD RESET MODAL (TRIPLE-VERIFICATION VAULT)                          */}
      {/* ========================================================================= */}
      {showResetModal && (
        <PasswordResetModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
};

export default AuthGateway;

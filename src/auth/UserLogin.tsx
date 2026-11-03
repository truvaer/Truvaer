import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Mail, AlertCircle, CheckCircle2, Eye, EyeOff, Key, Smartphone, KeyRound } from 'lucide-react';
import { RegularUser } from '../types';
import { db } from '../data/mockDatabase';
import { TwoFactorMpinModal } from './TwoFactorMpinModal';
import { PasswordResetModal } from './PasswordResetModal';

interface UserLoginProps {
  onSuccessLogin: (user: RegularUser) => void;
  onNavigateRegister: () => void;
  onOpenOtp: (user: RegularUser) => void;
  hideDemoPresets?: boolean;
  compact?: boolean;
}

export const UserLogin: React.FC<UserLoginProps> = ({
  onSuccessLogin,
  onNavigateRegister,
  onOpenOtp,
  hideDemoPresets = false,
  compact = false,
}) => {
  const [identifier, setIdentifier] = useState('user@truvaer.com'); // email or username
  const [password, setPassword] = useState('User@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enable2FaMpin, setEnable2FaMpin] = useState(true);
  const [pending2FaUser, setPending2FaUser] = useState<RegularUser | null>(null);
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const allUsers = db.getRegularUsers();
      const norm = identifier.trim().toLowerCase();
      const user = allUsers.find(
        (u) => u.email.toLowerCase() === norm || u.username.toLowerCase() === norm
      );

      if (!user) {
        setError('No account found matching this email or username.');
        return;
      }

      if (user.password_hash && user.password_hash !== password) {
        setError('Invalid password. Please verify your credentials (or use demo presets).');
        return;
      }

      if (user.account_status === 'SUSPENDED') {
        setError('This account has been SUSPENDED by Truvaer Compliance. Access restricted.');
        return;
      }

      if (user.account_status === 'PENDING_VERIFICATION' || !user.is_email_verified) {
        // According to TRD: Must complete email OTP verification
        onOpenOtp(user);
        return;
      }

      // Log success
      db.logApiCall(
        '/api/v1/auth/login/regular',
        'POST',
        200,
        { identifier: norm, password: '[REDACTED]' },
        { success: true, message: 'Regular user authenticated.', user_id: user.user_id, status: user.account_status }
      );

      if (enable2FaMpin) {
        setPending2FaUser(user);
        setShow2FaModal(true);
      } else {
        onSuccessLogin(user);
      }
    }, 400);
  };

  const handleFastMpinTrigger = () => {
    const allUsers = db.getRegularUsers();
    const norm = identifier.trim().toLowerCase();
    const user = allUsers.find(
      (u) => u.email.toLowerCase() === norm || u.username.toLowerCase() === norm
    ) || allUsers[0];
    if (user) {
      setPending2FaUser(user);
      setShow2FaModal(true);
    }
  };

  const handleFillDemo = (type: 'super_admin' | 'admin' | 'user') => {
    if (type === 'super_admin') {
      setIdentifier('sup_admin@truvaer.com');
      setPassword('Loginpwd@130');
    } else if (type === 'admin') {
      setIdentifier('admin@truvaer.com');
      setPassword('Loginpwd@130');
    } else {
      setIdentifier('user@truvaer.com');
      setPassword('User@123');
    }
  };

  return (
    <div className={compact ? "space-y-3.5" : "bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl"}>
      <div className="flex items-center space-x-2.5 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Standard User Login</h2>
          <p className="text-[11px] text-slate-400">Standard User Profile Authentication</p>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email or Username
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              id="user-login-identifier-input"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. aviation_pro99 or user@domain.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer flex items-center space-x-1"
            >
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>Forgot password?</span>
            </button>
          </div>
          <div
            className="relative"
            onMouseLeave={() => {
              if (showPassword) setShowPassword(false);
            }}
          >
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              id="user-login-password-input"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
            />
            <button
              type="button"
              id="user-login-toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer transition-colors p-0.5"
              title={showPassword ? 'Password visible (moves away to auto-hide)' : 'Click to view password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1 text-slate-400">
              <Key className="w-3 h-3 text-blue-400" />
              <span>Default User Password: <code className="text-amber-300 font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded">User@123</code></span>
            </span>
            {showPassword && (
              <span className="text-amber-400 font-medium text-[10px] animate-pulse">Auto-hides on cursor leave</span>
            )}
          </div>
        </div>

        {/* 2-Step Authentication & MPIN Enforcement Switch (Image 1) */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">2-Step Authentication &amp; MPIN (Image 1)</span>
              <span className="text-[10px] text-slate-400">Prompt 4-digit PIN / OTP token after password</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enable2FaMpin}
              onChange={(e) => setEnable2FaMpin(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            id="user-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFastMpinTrigger}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>Fast Login with MPIN</span>
          </button>
        </div>
      </form>

      {/* Demo helper shortcuts */}
      {!hideDemoPresets && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Fast Demo Presets:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemo('super_admin')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-slate-300 border border-amber-500/40 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-[10px] text-amber-300">sup_admin@truvaer.com</div>
              <div className="text-[9px] text-amber-400/80">Super Admin • Loginpwd@130</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-[10px] text-sky-300">admin@truvaer.com</div>
              <div className="text-[9px] text-slate-400">Admin • Loginpwd@130</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('user')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-[10px] text-emerald-400">user@truvaer.com</div>
              <div className="text-[9px] text-slate-400">Standard User • User@123</div>
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          Don't have a Truvaer aviator profile?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-blue-400 hover:text-blue-300 font-semibold underline ml-1 cursor-pointer"
          >
            Register Regular User
          </button>
        </p>
      </div>

      {/* Two-Factor MPIN Modal (Image 1) */}
      <TwoFactorMpinModal
        isOpen={show2FaModal}
        onClose={() => setShow2FaModal(false)}
        user={pending2FaUser}
        onSuccess={(authUser) => {
          setShow2FaModal(false);
          onSuccessLogin(authUser as RegularUser);
        }}
      />

      {/* 3-Password Security Verification Modal for Password Reset */}
      <PasswordResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        initialIdentifier={identifier}
        onPasswordResetSuccess={(newPwd, targetId) => {
          setPassword(newPwd);
          if (targetId) setIdentifier(targetId);
          setError(null);
        }}
      />
    </div>
  );
};

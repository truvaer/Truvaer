import React, { useState } from 'react';
import { Building2, Lock, ArrowRight, ShieldAlert, Mail, AlertCircle, CheckCircle2, Eye, EyeOff, Key, ShieldCheck, Smartphone, KeyRound } from 'lucide-react';
import { BusinessProfile } from '../types';
import { db } from '../data/mockDatabase';
import { TwoFactorMpinModal } from '../auth/TwoFactorMpinModal';
import { PasswordResetModal } from '../auth/PasswordResetModal';

interface BusinessLoginProps {
  onSuccessLogin: (business: BusinessProfile) => void;
  onNavigateRegister: () => void;
  hideDemoPresets?: boolean;
  compact?: boolean;
}

export const BusinessLogin: React.FC<BusinessLoginProps> = ({
  onSuccessLogin,
  onNavigateRegister,
  hideDemoPresets = false,
  compact = false,
}) => {
  const [businessEmail, setBusinessEmail] = useState('corporate@truvaer.com');
  const [password, setPassword] = useState('Corporate@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enable2FaMpin, setEnable2FaMpin] = useState(true);
  const [pending2FaBiz, setPending2FaBiz] = useState<BusinessProfile | null>(null);
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const allBusinesses = db.getBusinesses();
      const norm = businessEmail.trim().toLowerCase();
      const biz = allBusinesses.find(
        (b) => b.business_email.toLowerCase() === norm || b.username?.toLowerCase() === norm
      );

      if (!biz) {
        setError('No registered business found for this corporate email or username.');
        return;
      }

      if (biz.password_hash && biz.password_hash !== password) {
        setError('Invalid corporate password. Please verify credentials.');
        return;
      }

      // Log success
      db.logApiCall(
        '/api/v1/auth/login/business',
        'POST',
        200,
        { business_email: norm, password: '[REDACTED]' },
        { success: true, message: 'Business credentials validated.', business_id: biz.business_id, verification_status: biz.verification_status }
      );

      if (enable2FaMpin) {
        setPending2FaBiz(biz);
        setShow2FaModal(true);
      } else {
        onSuccessLogin(biz);
      }
    }, 400);
  };

  const handleFastMpinTrigger = () => {
    const allBusinesses = db.getBusinesses();
    const norm = businessEmail.trim().toLowerCase();
    const biz =
      allBusinesses.find((b) => b.business_email.toLowerCase() === norm || b.username?.toLowerCase() === norm) ||
      allBusinesses[0];
    if (biz) {
      setPending2FaBiz(biz);
      setShow2FaModal(true);
    }
  };

  const handleFillDemo = () => {
    setBusinessEmail('corporate@truvaer.com');
    setPassword('Corporate@123');
  };

  return (
    <div className={compact ? "space-y-3.5" : "bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl"}>
      <div className="flex items-center space-x-2.5 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Business User Login</h2>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              2FA/MPIN SECURE
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Enterprise &amp; Organization Gatekeeper Authentication</p>
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
            Official Corporate Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              id="biz-login-email-input"
              type="email"
              required
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="e.g. corporate@domain.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Corporate Password
            </label>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer flex items-center space-x-1"
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
              id="biz-login-password-input"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
            />
            <button
              type="button"
              id="biz-login-toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer transition-colors p-0.5"
              title={showPassword ? 'Password visible (moves away to auto-hide)' : 'Click to view password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1 text-slate-400">
              <Key className="w-3 h-3 text-indigo-400" />
              <span>Default Business Password: <code className="text-amber-300 font-mono font-bold bg-slate-800 px-1.5 py-0.5 rounded">Corporate@123</code></span>
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
              <span className="text-[10px] text-slate-400">Require 4-digit PIN / OTP token after password</span>
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
            id="biz-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Sign In Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Direct MPIN Fast Unlock Button */}
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

      {/* Demo presets */}
      {!hideDemoPresets && (
        <div className="mt-4 pt-3.5 border-t border-slate-800/80">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Fast Demo Presets:
          </div>
          <div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-xs text-indigo-400">corporate@truvaer.com</div>
              <div className="text-[10px] text-slate-400">User name: corporate_user • Password: Corporate@123</div>
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-400">
          Registering a new organization or airline partner?{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1 cursor-pointer"
          >
            Register Business Entity
          </button>
        </p>
      </div>

      {/* Two-Factor MPIN Modal (Image 1) */}
      <TwoFactorMpinModal
        isOpen={show2FaModal}
        onClose={() => setShow2FaModal(false)}
        business={pending2FaBiz}
        onSuccess={(authBiz) => {
          setShow2FaModal(false);
          onSuccessLogin(authBiz as BusinessProfile);
        }}
      />

      {/* 3-Password Security Verification Modal for Password Reset */}
      <PasswordResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        initialIdentifier={businessEmail}
        onPasswordResetSuccess={(newPwd, targetId) => {
          setPassword(newPwd);
          if (targetId) setBusinessEmail(targetId);
          setError(null);
        }}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Mail,
  ShieldCheck,
  Clock,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Copy,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { RegularUser } from '../types';
import { db } from '../data/mockDatabase';

interface OtpVerificationViewProps {
  user: RegularUser;
  initialOtp?: string;
  onSuccessVerified: (updatedUser: RegularUser) => void;
  onCancel: () => void;
}

export const OtpVerificationView: React.FC<OtpVerificationViewProps> = ({
  user,
  initialOtp,
  onSuccessVerified,
  onCancel,
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes (900 seconds)
  const [currentOtp, setCurrentOtp] = useState<string>(initialOtp || '');
  const [resendCount, setResendCount] = useState<number>(0);

  // Sync OTP from DB if not provided
  useEffect(() => {
    if (!currentOtp) {
      const activeRecord = db.getActiveOtpForUser(user.user_id);
      if (activeRecord) {
        setCurrentOtp(activeRecord.otp);
        setResendCount(activeRecord.resend_count);
        const remaining = Math.max(0, Math.floor((activeRecord.expires_at - Date.now()) / 1000));
        setTimeLeft(remaining);
      }
    }
  }, [user.user_id, currentOtp]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (!sanitized) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Single digit or paste
    if (sanitized.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = sanitized;
      setDigits(newDigits);
      if (index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        nextInput?.focus();
      }
    } else if (sanitized.length === 6) {
      // Pasted full 6-digit OTP
      setDigits(sanitized.split(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleAutoFill = () => {
    if (currentOtp && currentOtp.length === 6) {
      setDigits(currentOtp.split(''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = digits.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP verification code.');
      return;
    }

    setError(null);
    setResendMsg(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = db.verifyEmailOtp(user.user_id, enteredOtp);

      if (res.statusCode === 200 && res.response.data) {
        const updated = db.getRegularUserById(user.user_id);
        if (updated) {
          onSuccessVerified(updated);
        }
      } else {
        setError(res.response.message || 'OTP verification failed.');
      }
    }, 450);
  };

  const handleResend = () => {
    setError(null);
    setResendMsg(null);
    const res = db.resendOtp(user.user_id);

    if (res.success && res.otp) {
      setCurrentOtp(res.otp);
      setTimeLeft(900);
      setResendCount((prev) => prev + 1);
      setResendMsg(res.message);
      setDigits(['', '', '', '', '', '']);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/10">
          <Mail className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Verify Your Email Address</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          We sent a secure 6-digit verification code to{' '}
          <span className="text-blue-400 font-semibold">{user.email}</span>.
        </p>
      </div>

      {/* Simulated Email Dispatch Card */}
      <div className="mb-6 p-4 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-700">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-300">Simulated Mail Gateway</span>
          </div>
          <span className="font-mono">TTL: 15 Mins</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Security Code for @{user.username}:</div>
            <div className="text-xl font-mono font-bold text-white tracking-widest mt-0.5">
              {currentOtp || 'Generating...'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Auto-Fill Code</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{resendMsg}</span>
        </div>
      )}

      {/* 6-Digit Input Grid */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2 sm:space-x-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            />
          ))}
        </div>

        {/* Timer & Rate Limiter indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Expires in:</span>
            <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-rose-400' : 'text-slate-200'}`}>
              {formatTimer(timeLeft)}
            </span>
          </div>
          <div className="text-[11px] font-mono">
            Rate Limit: <span className="text-slate-200">{3 - resendCount}/3</span> resends left/hr
          </div>
        </div>

        <div className="space-y-2">
          <button
            id="otp-verify-submit-btn"
            type="submit"
            disabled={loading || timeLeft === 0}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Validating Handshake (POST /api/v1/auth/verify-email)...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Email & Activate Account</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCount >= 3}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resend Verification Code</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-300 font-medium cursor-pointer"
            >
              Cancel & Switch Account
            </button>
          </div>
        </div>
      </form>

      {/* Auto-provisioning note */}
      <div className="mt-6 pt-5 border-t border-slate-800 text-center">
        <div className="inline-flex items-center space-x-2 text-xs text-slate-400 bg-slate-850 px-3 py-1.5 rounded-full border border-slate-750">
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auto-provisions Truvaer Digital Wallet upon verification</span>
        </div>
      </div>
    </div>
  );
};

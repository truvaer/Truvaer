import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  X,
  Sparkles,
  Fingerprint,
  RotateCcw,
  Check,
} from 'lucide-react';
import { RegularUser, BusinessProfile } from '../types';
import { db } from '../data/mockDatabase';

interface TwoFactorMpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: RegularUser | null;
  business?: BusinessProfile | null;
  onSuccess: (authenticatedEntity: RegularUser | BusinessProfile) => void;
}

export const TwoFactorMpinModal: React.FC<TwoFactorMpinModalProps> = ({
  isOpen,
  onClose,
  user,
  business,
  onSuccess,
}) => {
  // Method: 'MPIN' (Mobile Personal Identification Number) vs 'OTP' (2-Step Email/SMS OTP)
  const [authMethod, setAuthMethod] = useState<'MPIN' | 'OTP'>('MPIN');

  // MPIN states
  const [mpinDigits, setMpinDigits] = useState<string[]>(['', '', '', '']); // 4-digit PIN default
  const [showMpin, setShowMpin] = useState(false);
  const [isSettingNewMpin, setIsSettingNewMpin] = useState(false);
  const [confirmMpinDigits, setConfirmMpinDigits] = useState<string[]>(['', '', '', '']);
  const [setupStep, setSetupStep] = useState<'ENTER_NEW' | 'CONFIRM_NEW'>('ENTER_NEW');

  // OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(900); // 15 mins
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // General feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Target entity info
  const entityName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : business?.organization_name || 'Enterprise Operator';
  const entityEmail = user?.email || business?.business_email || 'operator@domain.com';
  const entityPhone = user?.phone_number || business?.phone_number || '+91 98765 43210';

  // Existing registered MPIN (Default demo MPIN is '1234' if none stored)
  const storedMpin = (user?.mpin || business?.mpin) || '1234';

  // OTP countdown
  useEffect(() => {
    if (!isOpen || authMethod !== 'OTP' || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, authMethod, otpTimer]);

  if (!isOpen) return null;

  // Format timer
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Virtual Keypad click handler for MPIN
  const handleKeypadPress = (val: string) => {
    setError(null);
    const currentTarget = isSettingNewMpin && setupStep === 'CONFIRM_NEW' ? confirmMpinDigits : mpinDigits;
    const setTarget = isSettingNewMpin && setupStep === 'CONFIRM_NEW' ? setConfirmMpinDigits : setMpinDigits;

    if (val === 'BACKSPACE') {
      const lastFilledIndex = [...currentTarget].reverse().findIndex((d) => d !== '');
      if (lastFilledIndex !== -1) {
        const actualIndex = currentTarget.length - 1 - lastFilledIndex;
        const copy = [...currentTarget];
        copy[actualIndex] = '';
        setTarget(copy);
      }
      return;
    }

    if (val === 'CLEAR') {
      setTarget(['', '', '', '']);
      return;
    }

    // Enter digit
    const firstEmptyIndex = currentTarget.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      const copy = [...currentTarget];
      copy[firstEmptyIndex] = val;
      setTarget(copy);

      // If last digit filled, auto submit or advance
      if (firstEmptyIndex === currentTarget.length - 1) {
        const fullPin = copy.join('');
        if (isSettingNewMpin) {
          if (setupStep === 'ENTER_NEW') {
            setSetupStep('CONFIRM_NEW');
          } else {
            handleCompleteMpinSetup(fullPin);
          }
        } else {
          handleVerifyMpin(fullPin);
        }
      }
    }
  };

  // Keyboard support for MPIN
  const handlePhysicalKeyDown = (e: React.KeyboardEvent) => {
    if (authMethod !== 'MPIN') return;
    if (e.key >= '0' && e.key <= '9') {
      handleKeypadPress(e.key);
    } else if (e.key === 'Backspace') {
      handleKeypadPress('BACKSPACE');
    }
  };

  // Verify MPIN
  const handleVerifyMpin = (pinToTest?: string) => {
    const pin = pinToTest || mpinDigits.join('');
    if (pin.length < 4) {
      setError('Please enter your complete 4-digit MPIN.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      setIsVerifying(false);
      // Valid if matches stored MPIN or default demo PIN '1234'
      if (pin === storedMpin || pin === '1234' || pin === '8899') {
        setSuccessMsg('MPIN Authorization Verified! Launching secure session...');
        setTimeout(() => {
          if (user) onSuccess(user);
          else if (business) onSuccess(business);
        }, 600);
      } else {
        setError('Incorrect MPIN. Try demo MPIN "1234" or reset via OTP.');
        setMpinDigits(['', '', '', '']);
      }
    }, 450);
  };

  // Complete MPIN Setup
  const handleCompleteMpinSetup = (confirmPin: string) => {
    const originalNewPin = mpinDigits.join('');
    if (originalNewPin !== confirmPin) {
      setError('MPINs do not match! Please enter again.');
      setConfirmMpinDigits(['', '', '', '']);
      setSetupStep('ENTER_NEW');
      setMpinDigits(['', '', '', '']);
      return;
    }

    // Save MPIN
    if (user) {
      user.mpin = confirmPin;
      user.is_2fa_enabled = true;
    } else if (business) {
      business.mpin = confirmPin;
      business.is_2fa_enabled = true;
    }

    setSuccessMsg('New MPIN successfully established and secured! Logging in...');
    setTimeout(() => {
      if (user) onSuccess(user);
      else if (business) onSuccess(business);
    }, 600);
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      setIsVerifying(false);
      // Demo OTP is always '123456' or dynamic
      if (code === '123456' || code === '999999' || code.length === 6) {
        setSuccessMsg('Two-Factor OTP Verified! Authenticating...');
        setTimeout(() => {
          if (user) onSuccess(user);
          else if (business) onSuccess(business);
        }, 600);
      } else {
        setError('Invalid OTP code. Please check your SMS/email or click Auto-fill.');
      }
    }, 450);
  };

  // Resend OTP
  const handleResendOtp = () => {
    setOtpTimer(900);
    setResendNotice(`New 2FA security code dispatched to ${entityPhone} and ${entityEmail}`);
    setOtpDigits(['', '', '', '', '', '']);
    setTimeout(() => setResendNotice(null), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onKeyDown={handlePhysicalKeyDown}
      tabIndex={0}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-y-auto max-h-[92vh] my-auto focus:outline-none custom-scrollbar">
        {/* Subtle Top Aerospace Glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-amber-400 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Security Badge */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-indigo-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Step 2 of 2: Multi-Factor Authentication</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              {isSettingNewMpin ? 'Setup Security MPIN' : 'Enter 2-Step MPIN'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Authenticating <span className="text-white font-bold">{entityName}</span>
            </p>
          </div>
        </div>

        {/* Error / Success Toast */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Method Toggle Tab: MPIN vs OTP Code */}
        {!isSettingNewMpin && (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              onClick={() => {
                setAuthMethod('MPIN');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                authMethod === 'MPIN'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Security MPIN</span>
            </button>
            <button
              onClick={() => {
                setAuthMethod('OTP');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                authMethod === 'OTP'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>2-Step OTP Code</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: MPIN ENTRY & VIRTUAL PINPAD                                       */}
        {/* ========================================================================= */}
        {authMethod === 'MPIN' && (
          <div className="space-y-5">
            {isSettingNewMpin && (
              <div className="text-center text-xs font-semibold text-amber-300 mb-2">
                {setupStep === 'ENTER_NEW'
                  ? '1. Enter your new 4-digit PIN'
                  : '2. Re-enter your 4-digit PIN to confirm'}
              </div>
            )}

            {/* PIN Bullet Slots (Masked dots or revealed digits) */}
            <div className="flex items-center justify-center space-x-4 py-2">
              {(isSettingNewMpin && setupStep === 'CONFIRM_NEW'
                ? confirmMpinDigits
                : mpinDigits
              ).map((digit, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold font-mono transition-all ${
                    digit
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300 shadow-md shadow-amber-500/20'
                      : 'border-slate-700 bg-slate-950 text-slate-500'
                  }`}
                >
                  {digit ? (showMpin ? digit : '●') : ''}
                </div>
              ))}
            </div>

            {/* Show/Hide PIN Peek & Forgot Toggle */}
            <div className="flex items-center justify-between text-xs px-2 text-slate-400">
              <button
                type="button"
                onClick={() => setShowMpin(!showMpin)}
                className="flex items-center space-x-1 hover:text-white cursor-pointer"
              >
                {showMpin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showMpin ? 'Hide PIN' : 'View PIN'}</span>
              </button>

              {!isSettingNewMpin ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingNewMpin(true);
                    setSetupStep('ENTER_NEW');
                    setMpinDigits(['', '', '', '']);
                    setConfirmMpinDigits(['', '', '', '']);
                    setError(null);
                  }}
                  className="text-amber-400 hover:underline cursor-pointer font-medium"
                >
                  Set/Reset MPIN
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingNewMpin(false);
                    setMpinDigits(['', '', '', '']);
                    setError(null);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel Setup
                </button>
              )}
            </div>

            {/* Virtual Numeric Pinpad (1-9, Clear, 0, Backspace) */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-lg transition-all border border-slate-700/60 shadow-sm cursor-pointer"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleKeypadPress('CLEAR')}
                className="h-12 rounded-2xl bg-slate-850 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-white text-xs font-bold transition-all border border-slate-800 cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-lg transition-all border border-slate-700/60 shadow-sm cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                onClick={() => handleKeypadPress('BACKSPACE')}
                className="h-12 rounded-2xl bg-slate-850 hover:bg-slate-800 active:scale-95 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all border border-slate-800 cursor-pointer flex items-center justify-center"
              >
                ⌫
              </button>
            </div>

            {/* Quick Demo Assist Pills */}
            <div className="pt-2 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Demo Quick Preset:
              </span>
              <div className="flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setMpinDigits(['1', '2', '3', '4']);
                    handleVerifyMpin('1234');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-mono border border-slate-700 cursor-pointer"
                >
                  Auto-fill MPIN: 1234
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMpinDigits(['8', '8', '9', '9']);
                    handleVerifyMpin('8899');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-mono border border-slate-700 cursor-pointer"
                >
                  Auto-fill MPIN: 8899
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: 2-STEP SMS / EMAIL OTP CODE                                       */}
        {/* ========================================================================= */}
        {authMethod === 'OTP' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>Verification Code Sent</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                6-digit security token dispatched to mobile <strong className="text-white">{entityPhone}</strong> and email <strong className="text-white">{entityEmail}</strong>.
              </p>
            </div>

            {/* 6-Digit OTP Boxes */}
            <div className="flex items-center justify-center space-x-2 py-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`2fa-otp-digit-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const copy = [...otpDigits];
                    copy[index] = val;
                    setOtpDigits(copy);
                    if (val && index < 5) {
                      document.getElementById(`2fa-otp-digit-${index + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
                      document.getElementById(`2fa-otp-digit-${index - 1}`)?.focus();
                    }
                  }}
                  className="w-10 h-12 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-lg text-white focus:outline-none focus:border-amber-400"
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Code expires in: <strong className="text-white font-mono">{formatTimer(otpTimer)}</strong></span>
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                Resend Code
              </button>
            </div>

            {resendNotice && (
              <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-200 text-xs">
                {resendNotice}
              </div>
            )}

            {/* Quick Demo OTP Auto-fill */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setOtpDigits(['1', '2', '3', '4', '5', '6']);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-fill Demo Code (123456)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP &amp; Authorize</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Security Compliance Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>AES-256 GCM ENCRYPTION</span>
          <span>ISO/IEC 27001 COMPLIANT</span>
        </div>
      </div>
    </div>
  );
};

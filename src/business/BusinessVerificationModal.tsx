import React from 'react';
import { ShieldAlert, Clock, AlertTriangle, CheckCircle2, Mail, ExternalLink, X, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile | null;
  customMessage?: string;
  isHardLockedByAdmin?: boolean;
}

export const BusinessVerificationModal: React.FC<BusinessVerificationModalProps> = ({
  isOpen,
  onClose,
  business,
  customMessage,
  isHardLockedByAdmin = false,
}) => {
  if (!isOpen) return null;

  const isHardLocked =
    isHardLockedByAdmin ||
    business?.is_hard_locked_by_admin === true ||
    business?.verification_status === 'REJECTED';

  const defaultMessage = isHardLocked
    ? 'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
    : 'Your account is under verification with the Admin, your service options will be enabled once verified.';

  const displayMessage = customMessage || defaultMessage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Close message"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Icon & Badge */}
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              isHardLocked
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}
          >
            {isHardLocked ? <Lock className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isHardLocked
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isHardLocked ? 'Hard-Locked / Suspended' : 'Verification Under Review'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Standard Mode Active</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
              {isHardLocked ? 'Account Suspended by Admin' : 'Account Under Verification'}
            </h3>
          </div>
        </div>

        {/* Highlighted Message Card */}
        <div
          className={`p-4 rounded-2xl border ${
            isHardLocked
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${isHardLocked ? 'text-rose-400' : 'text-amber-400'}`}
            />
            <div className="space-y-1">
              <p className="text-sm font-bold leading-snug">{displayMessage}</p>
            </div>
          </div>
        </div>

        {/* Explanatory Details */}
        <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="font-bold text-white flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Operating in Standard User Mode</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Until the platform administrator reviews your enterprise documentation and uses the{' '}
            <strong className="text-emerald-400">Approve &amp; Lift Hard Lock</strong> option, you can browse all
            aviation community updates, read articles, inspect public directories, and connect via chat as a standard
            member.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>
                <strong>Corporate Account:</strong> {business?.organization_name || 'Truvaer Corporate Aviation Ltd'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>
                <strong>Official Email:</strong> {business?.business_email || 'corporate@truvaer.com'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>
                <strong>Service Options:</strong> Will unlock automatically upon Admin hard-lock release.
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">Support: admin@truvaer.com</span>
          <button
            id="acknowledge-standard-mode-btn"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Continue as Standard User</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

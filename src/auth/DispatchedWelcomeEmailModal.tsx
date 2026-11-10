import React, { useState } from 'react';
import { X, Mail, Check, Copy, ExternalLink, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { AdminWelcomeEmail } from '../types';

interface DispatchedWelcomeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailData: AdminWelcomeEmail | null;
  onOpenPasswordSetup?: (email: string, token: string) => void;
}

export const DispatchedWelcomeEmailModal: React.FC<DispatchedWelcomeEmailModalProps> = ({
  isOpen,
  onClose,
  emailData,
  onOpenPasswordSetup,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !emailData) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(emailData.password_setup_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-750 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 flex items-center space-x-1">
                <Send className="w-3 h-3" />
                <span>Notification Email Dispatched</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(emailData.dispatched_at).toLocaleTimeString()}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              {emailData.purpose === 'NEW_ACCOUNT_WELCOME'
                ? 'Admin Account Welcome & Activation Email'
                : 'Admin Password Reset Dispatch'}
            </h3>
          </div>
        </div>

        {/* Email Client Mock Frame */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner text-xs text-slate-300">
          {/* Email Headers */}
          <div className="bg-slate-900/90 border-b border-slate-800 p-3 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span><strong>From:</strong> Truvaer Security Command &lt;noreply@admin.truvaer.com&gt;</span>
              <span className="text-[10px] text-amber-400">Official Executive Communication</span>
            </div>
            <div className="text-slate-200">
              <strong>To:</strong> {emailData.recipient_name} &lt;{emailData.recipient_email}&gt;
            </div>
            <div className="text-amber-300">
              <strong>Subject:</strong>{' '}
              {emailData.purpose === 'NEW_ACCOUNT_WELCOME'
                ? 'Welcome to Truvaer Executive & Operations Command - Account Activation'
                : 'Security Alert: Master Password Reset Authorization'}
            </div>
          </div>

          {/* Email Body */}
          <div className="p-5 space-y-4 font-sans leading-relaxed text-slate-200">
            <p>Dear {emailData.recipient_name},</p>
            <p>
              Your administrative credentials and operational clearance have been provisioned on the{' '}
              <strong className="text-amber-400">Truvaer Executive Command &amp; C-Panel Portal</strong> ({emailData.clearance_level}).
            </p>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Portal URL:</span>
                <span className="text-amber-400 font-bold">{emailData.portal_url}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">User Name / Login:</span>
                <span className="text-white font-bold">{emailData.username}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Clearance Level:</span>
                <span className="text-sky-300 font-bold">{emailData.clearance_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Issuer:</span>
                <span className="text-slate-300">{emailData.dispatched_by}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              To complete your account initialization or update your password, use the tokenized activation link below:
            </p>

            {/* Password Link Box */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-400 font-bold">Password Setup Link:</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] flex items-center space-x-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="text-[10px] font-mono text-slate-300 break-all select-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                {emailData.password_setup_link}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Notification
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenPasswordSetup) {
                onOpenPasswordSetup(emailData.recipient_email, emailData.activation_token);
              }
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center space-x-1.5"
          >
            <span>Open Password Setup Interface</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

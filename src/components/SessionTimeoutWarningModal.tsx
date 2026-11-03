import React, { useEffect, useState } from 'react';
import {
  Clock,
  ShieldAlert,
  Sparkles,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Activity,
  Layers,
} from 'lucide-react';
import { ActiveUserSession } from '../types';

interface SessionTimeoutWarningModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  totalWarningSeconds: number;
  activeSession: ActiveUserSession | null;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
  isExtending?: boolean;
}

export const SessionTimeoutWarningModal: React.FC<SessionTimeoutWarningModalProps> = ({
  isOpen,
  remainingSeconds,
  totalWarningSeconds,
  activeSession,
  onStayLoggedIn,
  onLogoutNow,
  isExtending = false,
}) => {
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSuccessFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(Math.max(0, remainingSeconds) / 60);
  const seconds = Math.max(0, remainingSeconds) % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = Math.max(
    0,
    Math.min(100, (remainingSeconds / (totalWarningSeconds || 180)) * 100)
  );

  const handleExtend = () => {
    setSuccessFeedback('Session renewed successfully. Idle timer reset to 45 minutes.');
    setTimeout(() => {
      onStayLoggedIn();
    }, 450);
  };

  const isUrgent = remainingSeconds <= 60;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/50 overflow-hidden text-slate-100 flex flex-col">
        {/* Top Glowing Status Bar */}
        <div className="h-1.5 w-full bg-slate-800 relative overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              isUrgent ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start space-x-4 border-b border-slate-800/80">
          <div
            className={`p-3 rounded-2xl flex-shrink-0 border ${
              isUrgent
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}
          >
            <Clock className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Security & Inactivity Guard
              </span>
              <span className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Multi-Tab Synced</span>
              </span>
            </div>
            <h2 id="session-timeout-title" className="text-xl font-bold text-white mt-1">
              Your Session Is About To Expire
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              To protect your account and preserve unsaved data on forms and portals, your session will automatically log out if no activity is detected.
            </p>
          </div>
        </div>

        {/* Main Countdown & Info Box */}
        <div className="p-6 space-y-5">
          {successFeedback ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center space-x-3 text-sm animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-white">Session Extended</p>
                <p className="text-xs text-emerald-300/80">{successFeedback}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Countdown Digital Display */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                  isUrgent
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Automatic Logout Countdown
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click <span className="text-amber-300 font-semibold">Stay Logged In</span> to keep your session active.
                  </p>
                </div>
                <div
                  className={`text-3xl font-mono font-black tracking-widest px-4 py-2 rounded-lg border shadow-inner ${
                    isUrgent
                      ? 'bg-rose-900/40 border-rose-500/50 text-rose-300 animate-pulse'
                      : 'bg-slate-900 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {formattedTime}
                </div>
              </div>

              {/* Data Safety Notice */}
              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-200 flex items-start space-x-3 text-xs">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Form & Workflow Protection Active</p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Any open data entries, draft quotations, or service listings will remain safe when you extend your session.
                  </p>
                </div>
              </div>

              {/* Session Context Drawer */}
              {activeSession && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Logged In Account:</span>
                    <span className="font-semibold text-white">{activeSession.displayName} ({activeSession.email})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Standard Idle Timeout:</span>
                    <span className="font-mono text-amber-300 font-semibold">{activeSession.idleTimeoutMinutes || 45} Minutes</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Active Device:</span>
                    <span className="text-slate-300 truncate max-w-[240px]">{activeSession.deviceInfo}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-2 bg-slate-900/90 border-t border-slate-800/80 flex flex-col-reverse sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onLogoutNow}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Log Out Now</span>
          </button>

          <button
            type="button"
            onClick={handleExtend}
            disabled={isExtending}
            className="w-full sm:flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isExtending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Extending Session...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-slate-950" />
                <span>Stay Logged In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sliders,
  Database,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminUser, RegularUser } from '../types';

interface AdminApplicationResetDeskProps {
  activeAdminUser?: AdminUser | null;
  currentUser?: RegularUser | null;
  onRefreshAll?: () => void;
  onMasterReset?: () => void;
  onResetComplete?: () => void;
}

export type ResetMode = 'SETTINGS_ONLY' | 'FULL_WITHOUT_DATA' | 'FULL_WITH_DATA';

export const AdminApplicationResetDesk: React.FC<AdminApplicationResetDeskProps> = ({
  activeAdminUser,
  currentUser,
  onRefreshAll,
  onMasterReset,
  onResetComplete,
}) => {
  const isSuperAdmin = Boolean(
    activeAdminUser?.level === 8 ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com'
  );

  const [selectedMode, setSelectedMode] = useState<ResetMode>('SETTINGS_ONLY');
  const [confirmInput, setConfirmInput] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requiredConfirmationText =
    selectedMode === 'SETTINGS_ONLY'
      ? 'SETTINGS RESET'
      : selectedMode === 'FULL_WITHOUT_DATA'
      ? 'FULL RESET CLEAN'
      : 'FULL RESET SEED';

  const isConfirmed = confirmInput.trim().toUpperCase() === requiredConfirmationText;

  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || inProgress) return;

    if (!isSuperAdmin) {
      alert('Access Denied: Application reset is strictly restricted to Level 8 Sovereign Users and Super Admins.');
      return;
    }

    setInProgress(true);

    setTimeout(() => {
      let resultMsg = '';

      if (selectedMode === 'SETTINGS_ONLY') {
        const res = db.resetSettingsOnly();
        resultMsg = res.message;
      } else if (selectedMode === 'FULL_WITHOUT_DATA') {
        const res = db.fullResetWithoutData();
        resultMsg = res.message;
      } else {
        if (onMasterReset) {
          onMasterReset();
          resultMsg = 'Factory demo re-initialization completed. All databases re-seeded.';
        } else {
          const res = db.fullMasterSystemReset();
          resultMsg = res.message;
        }
      }

      if (onRefreshAll) onRefreshAll();
      if (onResetComplete) onResetComplete();

      setInProgress(false);
      setConfirmInput('');
      setSuccessMessage(resultMsg);
      setTimeout(() => setSuccessMessage(null), 6000);
    }, 700);
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-white">Super Admin Clearance Required</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
          The <strong>Full Application Reset Console</strong> is strictly restricted to Level 8 Sovereign Users (B Aditya Narayana / Super Admin). Other administrative tiers cannot trigger database or settings resets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">Full Application Reset Console</h2>
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                  L8 Sovereign Clearance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Execute controlled platform reinitializations: Settings reset only, Clean Slate full reset without data, or Factory reinitialization with demo seed data.
              </p>
            </div>
          </div>
        </div>

        <div className="text-right text-xs font-mono text-slate-400">
          Signatory: <strong className="text-white">B Aditya Narayana</strong>
        </div>
      </div>

      {/* Reset Options Cards Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* OPTION 1: Settings reset only */}
        <div
          onClick={() => {
            setSelectedMode('SETTINGS_ONLY');
            setConfirmInput('');
          }}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 relative ${
            selectedMode === 'SETTINGS_ONLY'
              ? 'bg-gradient-to-b from-blue-950/60 to-slate-900 border-blue-500 ring-2 ring-blue-500/30 shadow-xl'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              SAFE &bull; PRESERVES DATA
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">1. Settings Reset Only</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Restores system parameters, centralized credit pricing matrix, taxonomy, and module states back to factory baseline.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5 font-mono text-slate-300">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>User accounts preserved</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Business listings &amp; CRM intact</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Stories &amp; regional mappings kept</span>
            </div>
          </div>
        </div>

        {/* OPTION 2: Full Reset - Without Data */}
        <div
          onClick={() => {
            setSelectedMode('FULL_WITHOUT_DATA');
            setConfirmInput('');
          }}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 relative ${
            selectedMode === 'FULL_WITHOUT_DATA'
              ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-500 ring-2 ring-amber-500/30 shadow-xl'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              CLEAN SLATE PRODUCTION
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">2. Full Reset (Without Data)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Resets configurations and purges all test businesses, mock leads, sample jobs, and dummy data for clean enterprise onboarding.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5 font-mono text-slate-300">
            <div className="flex items-center space-x-1.5 text-amber-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Purges all mock businesses</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Purges dummy leads &amp; jobs</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Root Super Admin retained</span>
            </div>
          </div>
        </div>

        {/* OPTION 3: Full Reset - With Data */}
        <div
          onClick={() => {
            setSelectedMode('FULL_WITH_DATA');
            setConfirmInput('');
          }}
          className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 relative ${
            selectedMode === 'FULL_WITH_DATA'
              ? 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500 ring-2 ring-rose-500/30 shadow-xl'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              FACTORY DEMO SEED
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">3. Full Reset (With Data)</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Full application factory restore. Purges all caches and re-seeds complete aviation ecosystem (39 countries, 8 story categories, businesses).
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5 font-mono text-slate-300">
            <div className="flex items-center space-x-1.5 text-rose-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Wipes browser storage</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Re-seeds 39 country mappings</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Re-seeds all aviation businesses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Execution Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Selected Reset Mode:{' '}
              <span className="text-amber-400 font-mono">
                {selectedMode === 'SETTINGS_ONLY'
                  ? 'Settings Reset Only'
                  : selectedMode === 'FULL_WITHOUT_DATA'
                  ? 'Full Reset (Without Data - Clean Slate)'
                  : 'Full Reset (With Seed Data - Factory Demo)'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To prevent accidental execution, enter the confirmation pass-phrase below and click Execute.
            </p>
          </div>
        </div>

        <form onSubmit={handleExecuteReset} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Type <span className="font-mono text-rose-400 font-black">{requiredConfirmationText}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={`Type ${requiredConfirmationText} exactly`}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-sm font-mono text-white placeholder-slate-600 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!isConfirmed || inProgress}
            className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs font-black transition-all shadow-lg cursor-pointer flex items-center space-x-2"
          >
            <RotateCcw className={`w-4 h-4 ${inProgress ? 'animate-spin' : ''}`} />
            <span>{inProgress ? 'Executing Platform Reset...' : `Execute ${requiredConfirmationText}`}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

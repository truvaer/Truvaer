import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Power,
  RotateCcw,
  Sparkles,
  Briefcase,
  Building2,
  Newspaper,
  Plane,
  Hotel,
  Car,
  Bus,
  Crown,
  Eye,
  Layers,
  ArrowRight,
  BadgeAlert,
  Zap,
  Info,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  PlatformModuleControl,
  ModuleOperationalStatus,
  RegularUser,
  AdminUser,
} from '../types';

interface AdminModularLaunchpadProps {
  onRefreshAll?: () => void;
  onNavigateToModule?: (target: 'marketing') => void;
  currentUser?: RegularUser | null;
  activeAdminUser?: AdminUser | null;
}

export const AdminModularLaunchpad: React.FC<AdminModularLaunchpadProps> = ({
  onRefreshAll,
  onNavigateToModule,
  currentUser,
  activeAdminUser,
}) => {
  const [moduleControls, setModuleControls] = useState<PlatformModuleControl[]>(() =>
    db.getPlatformModuleControls()
  );
  const [isGlobalCrisis, setIsGlobalCrisis] = useState<boolean>(() =>
    db.getGlobalCrisisMode()
  );
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'warn' | 'error';
    text: string;
  } | null>(null);

  // Filter or search state
  const [selectedStageTab, setSelectedStageTab] = useState<'all' | 'stage_1' | 'staged_roadmap'>(
    'all'
  );

  // Administrative Clearance Determination:
  // L8: Executive Chairman & Super Admin (Level 8) -> FULL EDIT & ENABLE / DISABLE POWER
  // L7: Operations Director & Administrator (Level 7) -> VIEW & MONITOR ONLY
  const naturalLevel =
    activeAdminUser?.level ??
    (currentUser?.role === 'SUPER_ADMIN' ? 8 : currentUser?.role === 'ADMIN' ? 7 : 7);

  // Simulation switcher to easily demonstrate L7 (View Only) vs L8 (Edit Control)
  const [simulatedLevel, setSimulatedLevel] = useState<number>(naturalLevel);

  useEffect(() => {
    setSimulatedLevel(naturalLevel);
  }, [naturalLevel]);

  const effectiveLevel = simulatedLevel;
  const isL8 = effectiveLevel >= 8;
  const isL7 = effectiveLevel === 7;

  const reloadData = () => {
    setModuleControls([...db.getPlatformModuleControls()]);
    setIsGlobalCrisis(db.getGlobalCrisisMode());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const triggerNotice = (text: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // 1. L8 Sovereign Master Enable / Disable Toggle
  const handleToggleModuleActiveByL8 = (moduleId: string, currentStatus: ModuleOperationalStatus) => {
    if (!isL8) {
      triggerNotice(
        'Access Restricted: L7 clearance is View & Monitor only. Only L8 (Super Administrator) can Enable or Disable modules.',
        'error'
      );
      return;
    }

    const targetActive = currentStatus !== 'ACTIVE';
    const adminName = activeAdminUser?.name || currentUser?.username || 'Super Administrator (L8)';
    const res = db.setModuleActiveByL8(moduleId, targetActive, effectiveLevel, adminName);

    if (res.success) {
      reloadData();
      if (onRefreshAll) onRefreshAll();
      triggerNotice(res.message, targetActive ? 'success' : 'warn');
    } else {
      triggerNotice(res.message, 'error');
    }
  };

  // 2. Toggle Global Crisis Mode (L8 Only)
  const handleToggleGlobalCrisis = () => {
    if (!isL8) {
      triggerNotice(
        'Access Restricted: Only L8 Sovereign Administrator has authority to toggle Emergency Crisis Mode.',
        'error'
      );
      return;
    }

    const newState = !isGlobalCrisis;
    const adminName = activeAdminUser?.name || 'Super Administrator (L8)';
    const res = db.toggleGlobalCrisisMode(newState, 'Administrative Crisis Switch', adminName);
    setIsGlobalCrisis(res.isGlobalCrisis);
    reloadData();
    if (onRefreshAll) onRefreshAll();
    triggerNotice(
      newState
        ? 'EMERGENCY CRISIS MODE ACTIVATED: All public mutations throttled, read-only protective safeguards applied.'
        : 'Emergency Crisis Mode Deactivated. Standard operational parameters restored.',
      newState ? 'warn' : 'success'
    );
  };

  // 3. Operational State Selector (L8 Only)
  const handleStatusChange = (
    moduleId: string,
    newStatus: ModuleOperationalStatus
  ) => {
    if (!isL8) {
      triggerNotice(
        'Access Restricted: L7 administrators have View & Monitor permissions only.',
        'error'
      );
      return;
    }

    const adminName = activeAdminUser?.name || 'Super Administrator (L8)';
    const res = db.updateModuleOperationalStatus(moduleId, newStatus, adminName);
    reloadData();
    if (onRefreshAll) onRefreshAll();
    triggerNotice(res.message, 'success');
  };

  // 4. Role Permission Access Toggle (L8 Only)
  const handleToggleRole = (
    moduleId: string,
    role: 'STANDARD_USER' | 'BUSINESS_USER' | 'ADMIN' | 'SUPER_ADMIN'
  ) => {
    if (!isL8) {
      triggerNotice(
        'Access Restricted: Role access configuration is strictly reserved for L8 Sovereign clearance.',
        'error'
      );
      return;
    }

    const adminName = activeAdminUser?.name || 'Super Administrator (L8)';
    const res = db.toggleModuleRoleAccess(moduleId, role, undefined, adminName);
    reloadData();
    if (onRefreshAll) onRefreshAll();
    triggerNotice(res.message, 'success');
  };

  // 5. Circuit Breaker Toggle (L8 Only)
  const handleToggleBreaker = (moduleId: string) => {
    if (!isL8) {
      triggerNotice(
        'Access Restricted: Circuit Breaker isolation is reserved for L8 Sovereign clearance.',
        'error'
      );
      return;
    }

    const adminName = activeAdminUser?.name || 'Super Administrator (L8)';
    const res = db.toggleModuleCircuitBreaker(moduleId, 'Manual circuit trip', adminName);
    reloadData();
    if (onRefreshAll) onRefreshAll();
    triggerNotice(
      res.tripped
        ? `Circuit breaker tripped for ${moduleId}. Module forced into protective isolation.`
        : `Circuit breaker reset for ${moduleId}. Operational status restored.`,
      res.tripped ? 'warn' : 'success'
    );
  };

  // Quick Crisis Actions
  const handleTripAllBreakers = () => {
    if (!isL8) {
      triggerNotice('L7 clearance cannot trip breakers. Requires L8.', 'error');
      return;
    }
    if (
      !window.confirm(
        'Warning: Trip all public circuit breakers? This will immediately pause write traffic across all modules.'
      )
    ) {
      return;
    }
    moduleControls.forEach((m) => {
      if (!m.circuitBreakerTripped) {
        db.toggleModuleCircuitBreaker(m.id);
      }
    });
    reloadData();
    if (onRefreshAll) onRefreshAll();
    triggerNotice('All module circuit breakers have been tripped.', 'warn');
  };

  const handleResetAllToNormal = () => {
    if (!isL8) {
      triggerNotice('L7 clearance cannot restore baseline. Requires L8.', 'error');
      return;
    }
    if (isGlobalCrisis) {
      db.toggleGlobalCrisisMode(false);
    }
    moduleControls.forEach((m) => {
      if (m.circuitBreakerTripped) {
        db.toggleModuleCircuitBreaker(m.id);
      }
      if (m.stage === 'STAGE_1_LAUNCH') {
        db.updateModuleOperationalStatus(m.id, 'ACTIVE');
      }
    });
    reloadData();
    if (onRefreshAll) onRefreshAll();
    triggerNotice('Platform restored to baseline healthy status.', 'success');
  };

  // Categorize
  const stage1Modules = moduleControls.filter((m) => m.stage === 'STAGE_1_LAUNCH');
  const stagedModules = moduleControls.filter((m) => m.stage !== 'STAGE_1_LAUNCH');

  const getModuleIcon = (id: string, category?: string) => {
    if (id.includes('biz') || category === 'CORE_MARKETPLACE') {
      return <Building2 className="w-5 h-5 text-sky-400" />;
    }
    if (id.includes('news') || category === 'MEDIA_COMMUNITY') {
      return <Newspaper className="w-5 h-5 text-amber-400" />;
    }
    if (id.includes('jobs') || category === 'CAREER') {
      return <Briefcase className="w-5 h-5 text-emerald-400" />;
    }
    if (id.includes('charter') || category === 'FLIGHT_CHARTERS') {
      return <Plane className="w-5 h-5 text-indigo-400" />;
    }
    if (id.includes('hotel')) {
      return <Hotel className="w-5 h-5 text-rose-400" />;
    }
    if (id.includes('cab')) {
      return <Car className="w-5 h-5 text-cyan-400" />;
    }
    if (id.includes('bus')) {
      return <Bus className="w-5 h-5 text-purple-400" />;
    }
    return <Crown className="w-5 h-5 text-amber-400" />;
  };

  const getStatusBadge = (status: ModuleOperationalStatus, isTripped: boolean) => {
    if (isTripped || status === 'MAINTENANCE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          DISABLED / MAINTENANCE
        </span>
      );
    }
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          ACTIVE FOR EVERYONE
        </span>
      );
    }
    if (status === 'READ_ONLY') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Lock className="w-3 h-3 mr-1" />
          READ ONLY (SAFE MODE)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
        <Eye className="w-3 h-3 mr-1" />
        STAGED PREVIEW
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border shadow-xl flex items-center justify-between transition-all ${
            actionNotice.type === 'warn'
              ? 'bg-amber-950/90 border-amber-500/60 text-amber-200'
              : actionNotice.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            {actionNotice.type === 'warn' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : actionNotice.type === 'error' ? (
              <Lock className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold">{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs font-bold opacity-75 hover:opacity-100 px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header: Module Active Status & Dual-Clearance Governance (L7 View vs L8 Total Control) */}
      <div
        className={`rounded-3xl p-6 border shadow-2xl transition-all ${
          isGlobalCrisis
            ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/40'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-2xl border ${
                  isGlobalCrisis
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {isGlobalCrisis ? <AlertTriangle className="w-7 h-7" /> : <Layers className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Module Active Status
                  </h2>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isL8
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}
                  >
                    {isL8 ? '👑 L8 SOVEREIGN EDIT AUTHORITY' : '👁️ L7 VIEW & MONITOR CLEARANCE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl mt-1">
                  Controlled by L7 (View &amp; Monitor) and L8 (Full Sovereign Edit Authority to Enable or Disable). When Enabled, a module becomes live for everyone. When Disabled, everything related to that module is completely disabled across the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Authority Level Tester & Crisis Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Quick Authority Mode Switcher (L7 vs L8) */}
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSimulatedLevel(7);
                  triggerNotice('Switched active view to L7 (Operations Director - View & Monitor Only).', 'warn');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  effectiveLevel === 7
                    ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Simulate L7 Operations Director (View Only)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>L7 View Only</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulatedLevel(8);
                  triggerNotice('Switched active view to L8 (Super Admin - Total Sovereign Edit Control).', 'success');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  effectiveLevel === 8
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Simulate L8 Super Administrator (Total Edit Control)"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>L8 Sovereign Edit</span>
              </button>
            </div>

            {/* Master Crisis Toggle Switch (Actionable by L8, Read-Only for L7) */}
            <button
              onClick={handleToggleGlobalCrisis}
              disabled={!isL8}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shadow-lg ${
                !isL8
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70'
                  : isGlobalCrisis
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 cursor-pointer'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-1 ring-rose-400/50 cursor-pointer'
              }`}
              title={isL8 ? 'Toggle Global Crisis Lockdown' : 'L7 View Only • Requires L8 clearance to toggle crisis mode'}
            >
              <Power className="w-4 h-4" />
              <span>{isGlobalCrisis ? 'RESTORE NORMAL OPS' : 'ACTIVATE CRISIS MODE'}</span>
              {!isL8 && <Lock className="w-3 h-3 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* L7 View Banner vs L8 Edit Notice */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            {isL8 ? (
              <Crown className="w-4 h-4 text-emerald-400" />
            ) : (
              <Eye className="w-4 h-4 text-sky-400" />
            )}
            <span className="font-semibold">
              {isL8
                ? 'L8 Authority Active: You have sovereign permission to Enable or Disable any module. Changes propagate instantly to all users.'
                : 'L7 Clearance Active: You have monitoring and view access. Toggle controls are locked and require L8 authorization.'}
            </span>
          </div>

          {isL8 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTripAllBreakers}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Trip All Breakers
              </button>
              <button
                onClick={handleResetAllToNormal}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
              >
                Restore Baseline
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stage Navigation & Filter */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedStageTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStageTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Modules ({moduleControls.length})
          </button>
          <button
            onClick={() => setSelectedStageTab('stage_1')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStageTab === 'stage_1'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Stage 1 Launch Modules ({stage1Modules.length})
          </button>
          <button
            onClick={() => setSelectedStageTab('staged_roadmap')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStageTab === 'staged_roadmap'
                ? 'bg-sky-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Staged Roadmap Modules ({stagedModules.length})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time L7/L8 RBAC Enforced</span>
        </div>
      </div>

      {/* SECTION 1: STAGE 1 LAUNCH MODULES */}
      {(selectedStageTab === 'all' || selectedStageTab === 'stage_1') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Stage 1 Core Modules: Business Listing (Live), News &amp; Jobs</span>
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              L7 Monitors • L8 Controls Enable/Disable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stage1Modules.map((module) => {
              const isActive = module.status === 'ACTIVE' && !module.circuitBreakerTripped;
              const isTripped = module.circuitBreakerTripped;

              return (
                <div
                  key={module.id}
                  className={`rounded-3xl p-5 border flex flex-col justify-between transition-all shadow-xl ${
                    !isActive
                      ? 'bg-rose-950/20 border-rose-500/50 ring-1 ring-rose-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Bar: Icon, Name & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700">
                          {getModuleIcon(module.id, module.category)}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white leading-tight">
                            {module.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {module.id}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(module.status, isTripped)}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                      {module.description}
                    </p>

                    {/* Master L8 Enable / Disable Action Button */}
                    <div className="pt-2 border-t border-slate-800 space-y-2.5">
                      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-black text-slate-200 block">
                            Platform Status:
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              isActive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isActive
                              ? 'Enabled For Everyone'
                              : 'Disabled Platform-wide'}
                          </span>
                        </div>

                        {/* Master Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleModuleActiveByL8(module.id, module.status)}
                          disabled={!isL8}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                            !isL8
                              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                              : isActive
                              ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-md'
                          }`}
                          title={
                            isL8
                              ? isActive
                                ? 'Disable everything related to this module'
                                : 'Enable this module for everyone'
                              : 'L7 View Only • Requires L8 to change'
                          }
                        >
                          {!isL8 ? (
                            <>
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>L7 View Only</span>
                            </>
                          ) : isActive ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Disable Module</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Enable for Everyone</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Operational State Controller (L8 only) */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold text-[11px]">Operational State:</span>
                        <select
                          value={module.status}
                          disabled={!isL8}
                          onChange={(e) =>
                            handleStatusChange(
                              module.id,
                              e.target.value as ModuleOperationalStatus
                            )
                          }
                          className={`bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-200 focus:outline-none ${
                            !isL8 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE (Full Live)</option>
                          <option value="READ_ONLY">READ_ONLY (Safe)</option>
                          <option value="MAINTENANCE">MAINTENANCE (Offline)</option>
                          <option value="STAGED_PREVIEW">STAGED_PREVIEW</option>
                        </select>
                      </div>

                      {/* Per-Role Access Indicators */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-400">
                            Role Permissions:
                          </span>
                          {!isL8 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              (L8 edit only)
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {(
                            [
                              { role: 'STANDARD_USER', label: 'Standard' },
                              { role: 'BUSINESS_USER', label: 'Business' },
                              { role: 'ADMIN', label: 'Admin' },
                              { role: 'SUPER_ADMIN', label: 'Super Admin' },
                            ] as const
                          ).map(({ role, label }) => {
                            const isAllowed = module.allowedRoles?.[role] ?? false;
                            return (
                              <button
                                key={role}
                                disabled={!isL8}
                                onClick={() => handleToggleRole(module.id, role)}
                                className={`px-2 py-1 rounded-lg border flex items-center justify-between transition-colors ${
                                  !isL8 ? 'cursor-default opacity-80' : 'cursor-pointer'
                                } ${
                                  isAllowed
                                    ? 'bg-slate-800 border-emerald-500/40 text-emerald-300 font-bold'
                                    : 'bg-slate-950 border-slate-800 text-slate-500'
                                }`}
                              >
                                <span>{label}</span>
                                {isAllowed ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Lock className="w-3 h-3 text-slate-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-3">
                    <button
                      disabled={!isL8}
                      onClick={() => handleToggleBreaker(module.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
                        !isL8
                          ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                          : isTripped
                          ? 'bg-rose-500 hover:bg-rose-400 text-white border-rose-400 cursor-pointer'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 cursor-pointer'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isTripped ? 'Breaker Tripped' : 'Arm Breaker'}</span>
                    </button>

                    {module.id === 'mod_biz_listing' ? (
                      onNavigateToModule && (
                        <button
                          onClick={() => onNavigateToModule('marketing')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Open Live Directory</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() =>
                          triggerNotice(
                            `${module.name} is staged under Module Active Status control for future rollout. Kept unexposed on public website.`,
                            'warn'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 cursor-pointer"
                      >
                        <span>Future Staged</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: STAGED ROADMAP EXPANSION MODULES (Stage 2 & 3) */}
      {(selectedStageTab === 'all' || selectedStageTab === 'staged_roadmap') && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <span>Stage 2 &amp; 3: Staged Expansion Modules (Airlines, Hotels, Cabs, Buses)</span>
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              L7 Monitors • L8 Sovereign Controls
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stagedModules.map((module) => {
              const isActive = module.status === 'ACTIVE' && !module.circuitBreakerTripped;
              const isTripped = module.circuitBreakerTripped;

              return (
                <div
                  key={module.id}
                  className="rounded-3xl p-5 border bg-slate-900/60 border-slate-800 flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700">
                          {getModuleIcon(module.id, module.category)}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">{module.name}</h3>
                          <span className="text-[10px] text-sky-400 font-mono font-bold">
                            {module.stage.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(module.status, isTripped)}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                      {module.description}
                    </p>

                    {/* L8 Enable / Disable Switch */}
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block text-[11px]">
                          Active State:
                        </span>
                        <span
                          className={`font-black text-[10px] ${
                            isActive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isActive ? 'Live for Everyone' : 'Disabled Platform-wide'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleModuleActiveByL8(module.id, module.status)}
                        disabled={!isL8}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                          !isL8
                            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            : isActive
                            ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                        }`}
                        title={isL8 ? 'Toggle module status' : 'L7 View Only'}
                      >
                        {!isL8 ? (
                          <>
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>L7 View Only</span>
                          </>
                        ) : isActive ? (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Disable Module</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Enable for Everyone</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Staged Readiness Checklist */}
                    <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold text-[11px]">Integration Stage:</span>
                        <span className="text-amber-300 font-bold text-[11px]">
                          {module.stage === 'STAGE_2_CHARTERS'
                            ? 'Flight Dispatch API'
                            : 'Vendor Protocol Testing'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{
                            width:
                              module.stage === 'STAGE_2_CHARTERS'
                                ? '75%'
                                : module.id === 'mod_hotels_stays'
                                ? '55%'
                                : module.id === 'mod_cabs_fleet'
                                ? '45%'
                                : '30%',
                          }}
                        />
                      </div>
                    </div>

                    {/* Status & Preview Switch */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400 font-semibold">Rollout Gate:</span>
                      <select
                        value={module.status}
                        disabled={!isL8}
                        onChange={(e) =>
                          handleStatusChange(
                            module.id,
                            e.target.value as ModuleOperationalStatus
                          )
                        }
                        className={`bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-200 focus:outline-none ${
                          !isL8 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <option value="STAGED_PREVIEW">STAGED PREVIEW (Admin only)</option>
                        <option value="READ_ONLY">READ ONLY (Beta)</option>
                        <option value="ACTIVE">PROMOTE TO ACTIVE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-500 font-mono text-[10px]">
                      Protected by Zero-Trust Proxy
                    </span>
                    <button
                      disabled={!isL8}
                      onClick={() => handleToggleBreaker(module.id)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                        !isL8
                          ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                          : isTripped
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 cursor-pointer'
                          : 'bg-slate-800 text-slate-300 border-slate-700 cursor-pointer'
                      }`}
                    >
                      {isTripped ? 'Locked' : 'Safe Breaker'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: FOUNDATIONAL SECURITY & GOVERNANCE MEASURES */}
      <div className="rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <h3 className="text-base sm:text-lg font-black text-white">
            Beginning-Stage Security &amp; Access Controls (L7 View • L8 Edit Standard)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-sky-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>L7 vs L8 Separation</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              L7 Operations Directors have real-time view and monitoring clearance only. Full module activation and deactivation is strictly restricted to L8.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cascading Disable Effect</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              When an L8 Admin disables a module, all associated forms, listings, APIs, and navigation options are deactivated across the entire platform.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Global Circuit Breakers</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Independent breakers isolate faulty or attacked microservices without disrupting running operations in active modules.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-purple-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Immutable Ledger Logging</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Every activation, status transition, and role modification by L8 is permanently audited with cryptographic actor stamps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

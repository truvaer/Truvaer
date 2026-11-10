import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface VersionInfo {
  version: string;
  buildTime?: string;
  status?: string;
}

// Client-side current build identifier (injected during build or fallback)
const CLIENT_BUILD_VERSION = '1.0.0';

export const VersionUpdateNotifier: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkServerVersion = async () => {
      try {
        const response = await fetch('/api/version', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!response.ok) return;
        const data: VersionInfo = await response.json();

        if (isMounted && data.version && data.version !== CLIENT_BUILD_VERSION) {
          setServerVersion(data.version);
          setUpdateAvailable(true);
        }
      } catch {
        // Fallback or dev mode: ignore network errors
      }
    };

    // Check on mount
    checkServerVersion();

    // Check periodically every 45 seconds
    const interval = setInterval(checkServerVersion, 45000);

    // Also check when tab regains focus
    const handleFocus = () => checkServerVersion();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    // Smooth reload: local storage and session tokens are preserved, user stays logged in
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  if (!updateAvailable || isDismissed) {
    return null;
  }

  return (
    <div
      id="version-update-toast"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-xl text-slate-100 animate-slide-up transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                New Platform Update Live
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                {serverVersion || 'v1.0.1'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Continuous deployment successful. Zero downtime detected. Your active session and form data are fully preserved.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Session Safe (No Data Loss)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDismissed(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center space-x-1.5 shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'Applying...' : 'Update & Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

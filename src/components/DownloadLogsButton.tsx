import React, { useState } from 'react';
import { Download, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../types';
import { recordFilterLogService, ModuleActionLog } from '../services/recordFilterLogService';

interface DownloadLogsButtonProps {
  activeAdminUser?: AdminUser | null;
  logs: ModuleActionLog[];
  moduleNameLabel?: string;
  className?: string;
  buttonLabel?: string;
}

export const DownloadLogsButton: React.FC<DownloadLogsButtonProps> = ({
  activeAdminUser,
  logs,
  moduleNameLabel = 'Module_Logs',
  className = '',
  buttonLabel = 'Download Logs',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const viewerLevel = activeAdminUser?.level ?? (activeAdminUser?.role === 'SUPER_ADMIN' ? 8 : 1);
  const isL7OrL8 = viewerLevel >= 7 || activeAdminUser?.role === 'SUPER_ADMIN';

  const handleDownload = () => {
    if (!isL7OrL8) {
      setDownloadNotice('Permission Denied: Download Logs (CSV) is strictly permitted for L7 (Director) and L8 (Chairman/MD) only.');
      setTimeout(() => setDownloadNotice(null), 4500);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = recordFilterLogService.exportLogsToCSV(activeAdminUser, logs, moduleNameLabel);
      setIsLoading(false);
      setDownloadNotice(res.message);
      setTimeout(() => setDownloadNotice(null), 4000);
    }, 600);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={isLoading}
        onClick={handleDownload}
        title={
          isL7OrL8
            ? `Download active filtered logs as CSV (L${viewerLevel} Sovereign Export)`
            : 'Download Logs restricted strictly to L7 (Director) and L8 (Executive Chairman)'
        }
        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
          isL7OrL8
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95'
            : 'bg-slate-800 text-slate-500 border border-slate-700/60 hover:text-slate-400'
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
        ) : isL7OrL8 ? (
          <Download className="w-3.5 h-3.5 text-slate-950" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-amber-500/70" />
        )}
        <span>{isLoading ? 'Generating Stream...' : buttonLabel}</span>
        {isL7OrL8 && (
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-950/20 text-slate-950 font-black">
            L7/L8
          </span>
        )}
      </button>

      {downloadNotice && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-[11px] text-slate-200 space-y-1 animate-in fade-in">
          <div className="flex items-center space-x-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Audit Export Notification</span>
          </div>
          <p className="text-slate-300 text-[10px] leading-tight">{downloadNotice}</p>
        </div>
      )}
    </div>
  );
};

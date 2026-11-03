import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Database,
  Globe,
  Share2,
  Server,
  Zap,
  Check,
  X,
  Lock,
  Code,
  Users,
} from 'lucide-react';
import {
  testConnection,
  currentFirebaseProjectId,
  currentFirestoreDatabaseId,
  PUBLIC_LIVE_URL,
  DEV_APP_URL,
  DEV_ADMIN_EMAIL,
} from '../firebase/config';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState('Testing Firestore connection...');
  const [copiedPublicUrl, setCopiedPublicUrl] = useState(false);
  const [copiedDevUrl, setCopiedDevUrl] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  const runCheck = async () => {
    setStatus('checking');
    setStatusMessage('Pinging Firestore Enterprise endpoint...');
    const start = performance.now();
    try {
      const res = await testConnection();
      const end = performance.now();
      setPingLatency(Math.round(end - start));
      if (res.success) {
        setStatus('connected');
        setStatusMessage(res.message);
      } else {
        setStatus('error');
        setStatusMessage(res.message);
      }
    } catch (e) {
      setStatus('error');
      setStatusMessage(e instanceof Error ? e.message : 'Connection test failed');
    }
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'public' | 'dev' | 'project') => {
    navigator.clipboard.writeText(text);
    if (type === 'public') {
      setCopiedPublicUrl(true);
      setTimeout(() => setCopiedPublicUrl(false), 2500);
    } else if (type === 'dev') {
      setCopiedDevUrl(true);
      setTimeout(() => setCopiedDevUrl(false), 2500);
    } else {
      setCopiedProjectId(true);
      setTimeout(() => setCopiedProjectId(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Truvaer Aviation Platform',
          text: 'Explore Truvaer: Live civil aviation marketplace, charter fleet directory, and aerospace network.',
          url: PUBLIC_LIVE_URL,
        });
      } catch {
        copyToClipboard(PUBLIC_LIVE_URL, 'public');
      }
    } else {
      copyToClipboard(PUBLIC_LIVE_URL, 'public');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header with Firebase Brand Styling */}
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-slate-900 border-b border-amber-500/20 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-wide">Firebase Live Cloud Hub</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE WEBSITE MODULE
                </span>
              </div>
              <p className="text-xs text-slate-400">Database &amp; Realtime Persistence Active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Status banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start space-x-3 transition-colors ${
              status === 'connected'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : status === 'checking'
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}
          >
            {status === 'connected' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : status === 'checking' ? (
              <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">
                  {status === 'connected'
                    ? 'Firestore Connected & Ready for All Users'
                    : status === 'checking'
                    ? 'Checking Connection...'
                    : 'Connection Notice'}
                </p>
                {pingLatency !== null && status === 'connected' && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
                    {pingLatency}ms
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90 mt-0.5">{statusMessage}</p>
            </div>
            <button
              onClick={runCheck}
              disabled={status === 'checking'}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Re-test Connection"
            >
              <RefreshCw className={`w-4 h-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* PRIMARY: UNIVERSAL PUBLIC URL (Accessible to ALL Users)                   */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-blue-950/50 via-slate-900 to-indigo-950/40 border-2 border-blue-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Public Live Website URL</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      UNIVERSAL ACCESS
                    </span>
                  </h4>
                  <p className="text-[11px] text-blue-200/80">
                    Accessible to all users worldwide without requiring developer login.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={PUBLIC_LIVE_URL}
                className="flex-1 bg-slate-950 border border-blue-500/30 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 select-all focus:outline-none"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(PUBLIC_LIVE_URL, 'public')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95"
                >
                  {copiedPublicUrl ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPublicUrl ? 'Copied Public URL!' : 'Copy Public URL'}</span>
                </button>
                <a
                  href={PUBLIC_LIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                  title="Open Public URL in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Anyone opening this link sees the full aviation marketplace, verified flight directories, dynamic category taxonomy, quotation builder, and customer authentication.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* ACCESS SECURITY POLICY: CODE & ADMIN PRIVILEGES ISOLATION                 */}
          {/* ========================================================================= */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Security &amp; Code Governance Policy
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-sky-400 font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Public &amp; Client Access</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Universal read &amp; interaction. Browse verified aircraft fleets, search categories, book quotes, and register private user profiles.
                </p>
                <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                  ✓ Clean live website view (no dev controls)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Dev &amp; Admin Account Access Only</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Code contracts, API inspector, database sync, and ERP approval desks are strictly restricted to:
                </p>
                <div className="text-[10px] font-mono text-amber-300 font-bold truncate">
                  {DEV_ADMIN_EMAIL} &amp; Admin Accounts
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECONDARY: DEVELOPMENT INSTANCE (Restricted Access)                       */}
          {/* ========================================================================= */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                <Code className="w-3.5 h-3.5 text-amber-400" />
                <span>Development Workspace Instance URL (Dev / Admin Only)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Dev Mode</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={DEV_APP_URL}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-400 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(DEV_APP_URL, 'dev')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                {copiedDevUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDevUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Firebase Infrastructure Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Project ID</span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs text-amber-200">
                <span className="truncate">{currentFirebaseProjectId}</span>
                <button
                  onClick={() => copyToClipboard(currentFirebaseProjectId, 'project')}
                  className="text-slate-400 hover:text-white p-1"
                  title="Copy Project ID"
                >
                  {copiedProjectId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cloud Region</span>
              </div>
              <p className="font-mono text-xs text-cyan-200">asia-south1 (Mumbai)</p>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Database Instance</span>
              </div>
              <p className="font-mono text-xs text-indigo-200 truncate" title={currentFirestoreDatabaseId}>
                {currentFirestoreDatabaseId}
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Security Rules</span>
              </div>
              <p className="font-mono text-xs text-emerald-300">Default-Deny + ABAC Deployed</p>
            </div>
          </div>

          {/* Authorized Testing Accounts */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Authorized Testing Accounts (4 Only)</span>
              <span className="text-[10px] text-amber-400 font-mono">Firebase Hidden for User &amp; Biz</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/20">
                <p className="font-bold text-amber-300">Super Admin (L8)</p>
                <p className="font-mono text-[10px] text-white">super_admin</p>
                <p className="font-mono text-[10px] text-amber-400">Loginpwd@130</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-sky-500/20">
                <p className="font-bold text-sky-300">Admin (L7)</p>
                <p className="font-mono text-[10px] text-white">admin</p>
                <p className="font-mono text-[10px] text-sky-400">Loginpwd@130</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/20">
                <p className="font-bold text-emerald-300">Standard User</p>
                <p className="font-mono text-[10px] text-white">user</p>
                <p className="font-mono text-[10px] text-emerald-400">User@123</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-indigo-500/20">
                <p className="font-bold text-indigo-300">Business User</p>
                <p className="font-mono text-[10px] text-white">corporate_user</p>
                <p className="font-mono text-[10px] text-indigo-400">Corporate@123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <a
            href={`https://console.firebase.google.com/project/${currentFirebaseProjectId}/firestore`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1"
          >
            <span>Open Firebase Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

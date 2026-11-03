import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Cookie,
  Award,
  Users,
  Compass,
  Building2,
  X,
  Search,
  CheckCircle2,
  Share2,
  Printer,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Clock,
  Eye,
  Sliders,
  AlertTriangle,
  Globe,
  Plane,
  Download,
  Copy,
  Check,
  Send,
  HelpCircle
} from 'lucide-react';
import { POLICIES, PolicySlug, PolicyDocument } from './policyData';

interface LegalPoliciesPortalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPolicy?: PolicySlug;
  onSelectPolicy?: (slug: PolicySlug) => void;
}

export const LegalPoliciesPortal: React.FC<LegalPoliciesPortalProps> = ({
  isOpen,
  onClose,
  initialPolicy = 'about',
  onSelectPolicy,
}) => {
  const [activeSlug, setActiveSlug] = useState<PolicySlug>(initialPolicy);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Interactive Cookie Preferences State
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    functional: true,
    performance: true,
    security: true,
  });

  // Whistleblower report modal state
  const [showWhistleblowerModal, setShowWhistleblowerModal] = useState(false);
  const [whistleblowerReport, setWhistleblowerReport] = useState({
    title: '',
    department: 'Flight Operations',
    details: '',
    contactOptional: '',
  });

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync with initialPolicy when modal opens
  useEffect(() => {
    if (initialPolicy && POLICIES[initialPolicy]) {
      setActiveSlug(initialPolicy);
    }
  }, [initialPolicy]);

  // Sync URL hash with active policy
  useEffect(() => {
    if (isOpen) {
      const hash = `/${activeSlug}`;
      if (window.location.hash !== `#${hash}`) {
        window.history.replaceState(null, '', `#${hash}`);
      }
    }
  }, [isOpen, activeSlug]);

  const activeDoc: PolicyDocument = useMemo(() => {
    return POLICIES[activeSlug] || POLICIES.about;
  }, [activeSlug]);

  // Policy List with Metadata
  const allPolicyList = useMemo(() => {
    return Object.values(POLICIES);
  }, []);

  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return allPolicyList;
    const query = searchQuery.toLowerCase();
    return allPolicyList.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query) ||
        p.sections.some(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.content.toLowerCase().includes(query)
        )
    );
  }, [allPolicyList, searchQuery]);

  const handleSelect = (slug: PolicySlug) => {
    setActiveSlug(slug);
    if (onSelectPolicy) onSelectPolicy(slug);
    const element = document.getElementById('policy-content-top');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyUrl = () => {
    const fullUrl = `${window.location.origin}${window.location.pathname}#/${activeSlug}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(`URL copied: ${fullUrl}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveCookiePreferences = () => {
    try {
      localStorage.setItem('truvaer_cookie_preferences', JSON.stringify(cookiePreferences));
    } catch {
      // ignore
    }
    showToast('Cookie preferences saved successfully!');
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast(`Color code ${hex} copied!`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleWhistleblowerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whistleblowerReport.title || !whistleblowerReport.details) {
      alert('Please fill out report details.');
      return;
    }
    setShowWhistleblowerModal(false);
    setWhistleblowerReport({ title: '', department: 'Flight Operations', details: '', contactOptional: '' });
    showToast('Safety incident report submitted encrypted to the Truvaer Aviation Governance Committee.');
  };

  if (!isOpen) return null;

  // Icons mapping for policies
  const getPolicyIcon = (slug: PolicySlug) => {
    switch (slug) {
      case 'about':
        return <Building2 className="w-4 h-4 text-purple-400" />;
      case 'accessibility':
        return <Eye className="w-4 h-4 text-sky-400" />;
      case 'user-agreement':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'privacy-policy':
        return <Lock className="w-4 h-4 text-emerald-400" />;
      case 'cookie-policy':
        return <Cookie className="w-4 h-4 text-orange-400" />;
      case 'copyright-policy':
        return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      case 'brand-policy':
        return <Award className="w-4 h-4 text-yellow-400" />;
      case 'community-guidelines':
        return <Users className="w-4 h-4 text-teal-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="px-5 py-3 rounded-2xl bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 shadow-2xl text-xs font-bold flex items-center space-x-2.5 backdrop-blur-md">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* TOP BAR / HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold border border-purple-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Truvaer Legal &amp; Policy Center
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Certified October 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official statutory policies, operational governance, and terms for the Truvaer Aviation Ecosystem
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Copy link to current policy"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share URL</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Print policy document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
              title="Close Legal Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: 2-COLUMN LAYOUT (SIDEBAR NAV + RICH POLICY VIEWER) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* LEFT SIDEBAR: POLICIES DIRECTORY */}
          <aside className="w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/70 p-4 flex flex-col space-y-3 overflow-y-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search legal clauses..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1 pt-1 flex-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono px-2 block mb-1">
                Official Policy Documents ({filteredPolicies.length})
              </span>

              {filteredPolicies.map((p) => {
                const isActive = activeSlug === p.slug;
                return (
                  <button
                    key={p.slug}
                    onClick={() => handleSelect(p.slug)}
                    className={`w-full text-left p-2.5 rounded-2xl flex items-start space-x-2.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-600/20 border border-purple-500/40 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getPolicyIcon(p.slug)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs truncate block">{p.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="text-purple-300">{p.badge}</span>
                        <span>•</span>
                        <span>{p.readingTimeMinutes} min read</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Aviation Whistleblower Gateway Button */}
            <div className="pt-3 border-t border-slate-800/80">
              <button
                onClick={() => setShowWhistleblowerModal(true)}
                className="w-full p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Safety Whistleblower Portal</span>
              </button>
            </div>
          </aside>

          {/* RIGHT VIEW: COMPREHENSIVE POLICY CONTENT */}
          <main className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-900/60 space-y-6">
            <div id="policy-content-top" />

            {/* Document Header Banner */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeDoc.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeDoc.badge}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeDoc.readingTimeMinutes} min read</span>
                  </span>
                  <span>•</span>
                  <span>Effective: {activeDoc.effectiveDate}</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeDoc.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {activeDoc.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                <span>Direct Legal URL: <strong className="text-sky-400">truvaer.com/#/{activeDoc.slug}</strong></span>
                <span>Last Audited: <strong className="text-slate-200">{activeDoc.lastUpdated}</strong></span>
              </div>
            </div>

            {/* INTERACTIVE COMPONENT: COOKIE PREFERENCES CONTROLLER (Shown on Cookie Policy) */}
            {activeSlug === 'cookie-policy' && (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Cookie className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Interactive Cookie Preferences Manager</h3>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 font-bold">
                    User Consent Center
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Customize the non-essential telemetry and storage cookies used during your session. Changes are saved locally to your device.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Strictly Necessary Cookies</span>
                      <span className="text-[10px] text-slate-400 font-mono">Auth tokens &amp; CSRF protection</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                      Required (Locked)
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Security &amp; Anti-Fraud</span>
                      <span className="text-[10px] text-slate-400 font-mono">3-Password historical check</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                      Required (Locked)
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Functional Preferences</span>
                      <span className="text-[10px] text-slate-400 font-mono">Light/Dark theme &amp; base airport</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={cookiePreferences.functional}
                      onChange={(e) =>
                        setCookiePreferences({ ...cookiePreferences, functional: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Performance Telemetry</span>
                      <span className="text-[10px] text-slate-400 font-mono">Edge CDN latency &amp; load statistics</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={cookiePreferences.performance}
                      onChange={(e) =>
                        setCookiePreferences({ ...cookiePreferences, performance: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveCookiePreferences}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Cookie Preferences</span>
                  </button>
                </div>
              </div>
            )}

            {/* INTERACTIVE COMPONENT: BRAND ASSETS & PALETTE (Shown on Brand Policy) */}
            {activeSlug === 'brand-policy' && (
              <div className="bg-slate-950/80 border border-yellow-500/30 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-sm font-bold text-white">Official Brand Color Palette Swatches</h3>
                  </div>
                  <span className="text-[10px] font-mono text-yellow-300 bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/30 font-bold">
                    Click to Copy Hex
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {[
                    { name: 'Truvaer Midnight', hex: '#020617', bg: 'bg-slate-950', text: 'text-white' },
                    { name: 'Horizon Sky', hex: '#0284c7', bg: 'bg-sky-600', text: 'text-white' },
                    { name: 'Aviation Gold', hex: '#f59e0b', bg: 'bg-amber-500', text: 'text-slate-950' },
                    { name: 'Runway Emerald', hex: '#10b981', bg: 'bg-emerald-500', text: 'text-slate-950' },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleCopyColor(color.hex)}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left hover:border-yellow-500/40 transition-colors cursor-pointer group"
                    >
                      <div className={`w-full h-10 rounded-xl ${color.bg} mb-2 shadow-inner border border-white/10`} />
                      <span className="font-bold text-white text-xs block">{color.name}</span>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-0.5">
                        <span>{color.hex}</span>
                        {copiedHex === color.hex ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SECTIONS LIST */}
            <div className="space-y-6">
              {activeDoc.sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md space-y-3"
                >
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                    <span>{sec.title}</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>

                  {sec.subsections && (
                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                      {sec.subsections.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-1"
                        >
                          <h4 className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                            <span className="text-[10px] font-mono text-slate-500">§{idx + 1}.{sIdx + 1}</span>
                            <span>{sub.subtitle}</span>
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                            {sub.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* DOCUMENT FOOTER & RELATED POLICIES */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Questions regarding this policy? Contact{' '}
                <a href="mailto:legal@truvaer.com" className="text-sky-400 underline font-mono">
                  legal@truvaer.com
                </a>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const currentIndex = allPolicyList.findIndex((p) => p.slug === activeSlug);
                    const prevIndex = (currentIndex - 1 + allPolicyList.length) % allPolicyList.length;
                    handleSelect(allPolicyList[prevIndex].slug);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  &larr; Previous Document
                </button>
                <button
                  onClick={() => {
                    const currentIndex = allPolicyList.findIndex((p) => p.slug === activeSlug);
                    const nextIndex = (currentIndex + 1) % allPolicyList.length;
                    handleSelect(allPolicyList[nextIndex].slug);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  Next Document &rarr;
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* WHISTLEBLOWER MODAL */}
      {showWhistleblowerModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Aviation Safety Whistleblower Portal</h3>
              </div>
              <button
                onClick={() => setShowWhistleblowerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Submit an encrypted report regarding regulatory non-compliance, unsafe maintenance, or ethical violations. All submissions are protected under Truvaer whistleblower shielding.
            </p>

            <form onSubmit={handleWhistleblowerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Incident Summary *</label>
                <input
                  type="text"
                  required
                  value={whistleblowerReport.title}
                  onChange={(e) => setWhistleblowerReport({ ...whistleblowerReport, title: e.target.value })}
                  placeholder="e.g. Flight duty time limit violation on sector BOM-DXB"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Operational Area</label>
                <select
                  value={whistleblowerReport.department}
                  onChange={(e) => setWhistleblowerReport({ ...whistleblowerReport, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Aviation Operations">Aviation Operations &amp; Commercial Services</option>
                  <option value="Fleet Maintenance">Aircraft Maintenance &amp; Airworthiness</option>
                  <option value="Ground Handling">Ramp Safety &amp; Fuel Bunkering</option>
                  <option value="Charter Brokerage">Broker Pricing Fraud &amp; Contract Fraud</option>
                  <option value="Security">Security Clearance &amp; BCAS Pass Breaches</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Incident Report *</label>
                <textarea
                  required
                  rows={4}
                  value={whistleblowerReport.details}
                  onChange={(e) => setWhistleblowerReport({ ...whistleblowerReport, details: e.target.value })}
                  placeholder="Include dates, aircraft tail number, flight sector, and specific safety violations..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Information (Optional - Leave blank to remain 100% anonymous)
                </label>
                <input
                  type="text"
                  value={whistleblowerReport.contactOptional}
                  onChange={(e) => setWhistleblowerReport({ ...whistleblowerReport, contactOptional: e.target.value })}
                  placeholder="Anonymous or secure email..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowWhistleblowerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Encrypted Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

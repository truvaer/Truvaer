import React, { useEffect, useState } from 'react';
import {
  Plane,
  Building2,
  FileText,
  Eye,
  ChevronRight,
  Layers,
  X,
  ShieldCheck,
} from 'lucide-react';
import { PolicySlug } from '../legal/policyData';

interface GlobalFooterProps {
  onOpenPolicy: (slug: PolicySlug) => void;
  onNavigateTab?: (tab: 'marketing' | 'crm_portal' | 'admin_desk') => void;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  onOpenPolicy,
  onNavigateTab,
  isAdmin = false,
}) => {
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);

  useEffect(() => {
    if (!showDirectoryModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDirectoryModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showDirectoryModal]);

  const handlePolicyClick = (slug: PolicySlug) => {
    setShowDirectoryModal(false);
    onOpenPolicy(slug);
  };

  const handleNavigateClick = (tab: 'marketing' | 'crm_portal' | 'admin_desk') => {
    setShowDirectoryModal(false);
    onNavigateTab?.(tab);
  };

  return (
    <>
      <footer className="border-t border-slate-200 dark:border-slate-800/90 bg-white dark:bg-gradient-to-b dark:from-slate-950/80 dark:via-slate-900 dark:to-slate-950 text-slate-600 dark:text-slate-300 px-4 sm:px-8 lg:px-12 py-3.5 mt-auto w-full">
        <div className="w-full max-w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">TruvAer</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-600 dark:text-slate-300">© 2026. All rights reserved.</span>
            <span className="hidden md:inline text-slate-400 dark:text-slate-600">|</span>
            <span className="hidden md:inline text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Global Aviation Operations &amp; Marketplace Infrastructure
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDirectoryModal(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Layers className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>Company, Legal &amp; Aviation Solutions</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </footer>

      {/* MAPPED PLATFORM DIRECTORY MODAL: Company & About, Legal & Contracts, Trust & Accessibility, Aviation Solutions */}
      {showDirectoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowDirectoryModal(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xl p-5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-sky-500" />
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    TruvAer Governance, Legal &amp; Aviation Solutions
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Corporate policies, compliance governance, accessibility commitments, and platform modules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectoryModal(false)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close directory"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4-Column Mapped Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 text-xs">
              {/* Column 1: Company & About */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5 text-purple-600 dark:text-purple-400">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Company &amp; About</span>
                </h5>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>
                    <a
                      href="#/about"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('about');
                      }}
                      className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>About TruvAer</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/brand-policy"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('brand-policy');
                      }}
                      className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>Brand Policy &amp; Media Kit</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/about#standards"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('about');
                      }}
                      className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>Aviation Safety Standards</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/about#sustainability"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('about');
                      }}
                      className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>Sustainable Aviation (SAF)</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/about#leadership"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('about');
                      }}
                      className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>Leadership &amp; Governance</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 2: Legal & Contracts */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Legal &amp; Contracts</span>
                </h5>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>
                    <a
                      href="#/user-agreement"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('user-agreement');
                      }}
                      className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">User Agreement (Terms)</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/privacy-policy"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('privacy-policy');
                      }}
                      className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Privacy Policy (GDPR/DPDP)</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/cookie-policy"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('cookie-policy');
                      }}
                      className="hover:text-orange-600 dark:hover:text-orange-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>Cookie Policy &amp; Consent</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/copyright-policy"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('copyright-policy');
                      }}
                      className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>Copyright &amp; DMCA Policy</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/user-agreement#payout-rules"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('user-agreement');
                      }}
                      className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>Treasury Reserve &amp; 80% Payout</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Trust & Accessibility */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5 text-sky-600 dark:text-sky-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Trust &amp; Accessibility</span>
                </h5>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>
                    <a
                      href="#/accessibility"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('accessibility');
                      }}
                      className="hover:text-sky-600 dark:hover:text-sky-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Accessibility Statement</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/community-guidelines"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('community-guidelines');
                      }}
                      className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Community Guidelines</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/community-guidelines#whistleblower"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('community-guidelines');
                      }}
                      className="hover:text-amber-600 dark:hover:text-teal-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-amber-600 dark:text-amber-300 font-semibold"
                    >
                      <ChevronRight className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                      <span>Whistleblower Gateway</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#/accessibility#feedback-escalation"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePolicyClick('accessibility');
                      }}
                      className="hover:text-sky-600 dark:hover:text-sky-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                      <span>Accessibility Coordinator</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 4: Aviation Solutions */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                  <Plane className="w-3.5 h-3.5" />
                  <span>Aviation Solutions</span>
                </h5>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  {onNavigateTab && (
                    <>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavigateClick('marketing')}
                          className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-left"
                        >
                          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                          <span>Marketplace Directory</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => handleNavigateClick('crm_portal')}
                          className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-left"
                        >
                          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
                          <span>Commercial Sales CRM</span>
                        </button>
                      </li>
                    </>
                  )}
                  {isAdmin && onNavigateTab && (
                    <li>
                      <button
                        type="button"
                        onClick={() => handleNavigateClick('admin_desk')}
                        className="hover:text-amber-600 dark:hover:text-amber-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-amber-600 dark:text-amber-300 font-semibold text-left"
                      >
                        <ChevronRight className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                        <span>Admin Operations ERP &amp; Human Resource (HRMS)</span>
                      </button>
                    </li>
                  )}
                  <li className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                    <span className="text-[11px] text-slate-500 font-mono block">
                      Encrypted Aviation Channels:
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      AES-256 KMS • TLS 1.3 Strict
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>TruvAer • © 2026. All rights reserved.</span>
              <button
                type="button"
                onClick={() => setShowDirectoryModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

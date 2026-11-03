import React from 'react';
import {
  Plane,
  Building2,
  FileText,
  Eye,
  ChevronRight
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
  isLoggedIn = false,
}) => {
  return (
    <footer className={`border-t border-slate-800/90 bg-gradient-to-b from-slate-950/80 via-slate-900 to-slate-950 text-slate-300 px-4 sm:px-6 lg:px-8 ${isLoggedIn ? 'py-3 mt-2' : 'py-6 sm:py-8 mt-4 sm:mt-6'}`}>
      <div className="max-w-7xl mx-auto">
        {/* COMPREHENSIVE POLICY & AVIATION LINK COLUMNS: Hidden once user is logged in */}
        {!isLoggedIn && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs pb-6">
          {/* Column 1: Company & Heritage */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5 text-purple-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>Company &amp; About</span>
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#/about"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('about');
                  }}
                  className="hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>About TruvAer</span>
                </a>
              </li>
              <li>
                <a
                  href="#/brand-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('brand-policy');
                  }}
                  className="hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Brand Policy &amp; Media Kit</span>
                </a>
              </li>
              <li>
                <a
                  href="#/about#standards"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('about');
                  }}
                  className="hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Aviation Safety Standards</span>
                </a>
              </li>
              <li>
                <a
                  href="#/about#sustainability"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('about');
                  }}
                  className="hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Sustainable Aviation (SAF)</span>
                </a>
              </li>
              <li>
                <a
                  href="#/about#leadership"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('about');
                  }}
                  className="hover:text-purple-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Leadership &amp; Governance</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal & Governance */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5 text-amber-400">
              <FileText className="w-3.5 h-3.5" />
              <span>Legal &amp; Contracts</span>
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#/user-agreement"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('user-agreement');
                  }}
                  className="hover:text-amber-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="font-semibold text-slate-200">User Agreement (Terms)</span>
                </a>
              </li>
              <li>
                <a
                  href="#/privacy-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('privacy-policy');
                  }}
                  className="hover:text-emerald-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="font-semibold text-slate-200">Privacy Policy (GDPR/DPDP)</span>
                </a>
              </li>
              <li>
                <a
                  href="#/cookie-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('cookie-policy');
                  }}
                  className="hover:text-orange-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Cookie Policy &amp; Consent</span>
                </a>
              </li>
              <li>
                <a
                  href="#/copyright-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('copyright-policy');
                  }}
                  className="hover:text-indigo-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Copyright &amp; DMCA Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="#/user-agreement#payout-rules"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('user-agreement');
                  }}
                  className="hover:text-amber-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Treasury Reserve &amp; 80% Payout</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Inclusivity */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5 text-sky-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Trust &amp; Accessibility</span>
            </h5>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#/accessibility"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('accessibility');
                  }}
                  className="hover:text-sky-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="font-semibold text-slate-200">Accessibility Statement</span>
                </a>
              </li>
              <li>
                <a
                  href="#/community-guidelines"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('community-guidelines');
                  }}
                  className="hover:text-teal-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span className="font-semibold text-slate-200">Community Guidelines</span>
                </a>
              </li>
              <li>
                <a
                  href="#/community-guidelines#whistleblower"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('community-guidelines');
                  }}
                  className="hover:text-teal-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-amber-300 font-semibold"
                >
                  <ChevronRight className="w-3 h-3 text-amber-400" />
                  <span>Whistleblower Gateway</span>
                </a>
              </li>
              <li>
                <a
                  href="#/accessibility#feedback-escalation"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPolicy('accessibility');
                  }}
                  className="hover:text-sky-300 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Accessibility Coordinator</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Marketplace Solutions */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center space-x-1.5 text-emerald-400">
              <Plane className="w-3.5 h-3.5" />
              <span>Aviation Solutions</span>
            </h5>
            <ul className="space-y-2 text-slate-400">
              {onNavigateTab && (
                <>
                  <li>
                    <button
                      onClick={() => onNavigateTab('marketing')}
                      className="hover:text-emerald-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-left"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>Marketplace Directory</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onNavigateTab('crm_portal')}
                      className="hover:text-emerald-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-left"
                    >
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>Commercial Sales CRM</span>
                    </button>
                  </li>
                </>
              )}
              {isAdmin && onNavigateTab && (
                <li>
                  <button
                    onClick={() => onNavigateTab('admin_desk')}
                    className="hover:text-amber-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-amber-300 font-semibold text-left"
                  >
                    <ChevronRight className="w-3 h-3 text-amber-400" />
                    <span>Admin Operations ERP &amp; Human Resource (HRMS)</span>
                  </button>
                </li>
              )}
              <li className="pt-1">
                <span className="text-[11px] text-slate-500 font-mono block">
                  Encrypted Aviation Channels:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  AES-256 KMS • TLS 1.3 Strict
                </span>
              </li>
            </ul>
          </div>
        </div>
        )}

        {/* FOOTER BOTTOM BAR: COPYRIGHT */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 ${isLoggedIn ? 'pt-0' : 'border-t border-slate-800/80 pt-4'}`}>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-tight">TruvAer</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">© 2026. All rights reserved.</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Global Aviation Operations &amp; Marketplace Infrastructure
          </div>
        </div>
      </div>
    </footer>
  );
};

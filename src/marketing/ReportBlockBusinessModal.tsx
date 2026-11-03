import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Ban,
  CheckCircle2,
  Building2,
  Send,
  Flag,
  FileWarning,
  EyeOff,
  Info,
} from 'lucide-react';
import { ServiceListing, RegularUser, BusinessReport, BusinessReportReason } from '../types';
import { db } from '../data/mockDatabase';

interface ReportBlockBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetListing: ServiceListing | null;
  currentUser?: RegularUser | null;
  onReportSubmitted?: (report: BusinessReport) => void;
  onBusinessBlocked?: (businessId: string) => void;
}

interface ReasonOption {
  value: BusinessReportReason;
  title: string;
  description: string;
  icon: string;
}

const REPORT_REASONS: ReasonOption[] = [
  {
    value: 'Fake Company / Unverified Business',
    title: 'Fake Company / Unverified Business',
    description: 'Fraudulent corporate entity, dummy registration, or impersonating another operator.',
    icon: '🏢',
  },
  {
    value: 'Irrelevant / Misleading Content',
    title: 'Irrelevant / Misleading Content',
    description: 'Irrelevant services listed, false fleet photos, inaccurate amenities or specifications.',
    icon: '🚫',
  },
  {
    value: 'Fraudulent Pricing / Bait & Switch',
    title: 'Fraudulent Pricing / Bait & Switch',
    description: 'Hidden mandatory surcharges, quote mismatches, or deceptive pricing models.',
    icon: '💰',
  },
  {
    value: 'Unresponsive / Invalid Contact Details',
    title: 'Unresponsive / Invalid Contact Details',
    description: 'Disconnected phone lines, invalid emails, or physical address does not exist.',
    icon: '📵',
  },
  {
    value: 'Other Suspicious Activity',
    title: 'Scam or Phishing Attempt',
    description: 'Solicitation of off-platform unauthorized payments, fake bank accounts, or suspicious links.',
    icon: '⚠️',
  },
  {
    value: 'Intellectual Property Violation',
    title: 'Intellectual Property Violation',
    description: 'Unauthorized use of third-party aviation AOCs, operator logos, or copyrighted media.',
    icon: '⚖️',
  },
  {
    value: 'Harassment / Unprofessional Behavior',
    title: 'Harassment / Unprofessional Behavior',
    description: 'Coercive messages, abusive communication in inquiries, or persistent spam.',
    icon: '🗣️',
  },
];

export const ReportBlockBusinessModal: React.FC<ReportBlockBusinessModalProps> = ({
  isOpen,
  onClose,
  targetListing,
  currentUser,
  onReportSubmitted,
  onBusinessBlocked,
}) => {
  if (!isOpen || !targetListing) return null;

  const [selectedReason, setSelectedReason] = useState<BusinessReportReason>(
    'Fake Company / Unverified Business'
  );
  const [explanation, setExplanation] = useState('');
  const [shouldBlockBusiness, setShouldBlockBusiness] = useState(true);

  // Reporter info
  const [reporterName, setReporterName] = useState(
    (currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : (currentUser as any)?.name) || currentUser?.username || 'Verified User'
  );
  const [reporterEmail, setReporterEmail] = useState(
    currentUser?.email || 'user@truvaer.com'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<BusinessReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!explanation.trim()) {
      setErrorMessage('Please provide a brief explanation or evidence for your report.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = db.submitBusinessReport({
        listing_id: targetListing.id,
        listing_name: (targetListing as any).business_name || targetListing.name,
        business_id: targetListing.business_id,
        reporter_user_id: currentUser?.user_id,
        reporter_email: reporterEmail.trim(),
        reporter_name: reporterName.trim(),
        reason: selectedReason,
        explanation: explanation.trim(),
        is_blocked_by_user: shouldBlockBusiness,
      });

      if (res.success && res.report) {
        setSubmittedReport(res.report);

        // Save local blocked state for current user
        if (shouldBlockBusiness) {
          try {
            const blockedRaw = localStorage.getItem('truvaer_user_blocked_businesses');
            const blockedList: string[] = blockedRaw ? JSON.parse(blockedRaw) : [];
            if (!blockedList.includes(targetListing.business_id)) {
              blockedList.push(targetListing.business_id);
              localStorage.setItem('truvaer_user_blocked_businesses', JSON.stringify(blockedList));
            }
          } catch {
            // ignore
          }

          if (onBusinessBlocked) {
            onBusinessBlocked(targetListing.business_id);
          }
        }

        if (onReportSubmitted) {
          onReportSubmitted(res.report);
        }
      } else {
        setErrorMessage(res.message || 'Failed to file report. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  Integrity &amp; Trust Oversight
                </span>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Admin / Super Admin Review</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Report &amp; Block: {(targetListing as any).business_name || targetListing.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Flag this organization for immediate review by Admin, Manager, and Super Admin desks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {submittedReport ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {submittedReport.report_number}
              </span>
              <h3 className="text-xl font-bold text-white">Report Lodged with Governance Desks</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Report <strong className="text-white">{submittedReport.report_number}</strong> for{' '}
                <span className="text-rose-300 font-semibold">{(targetListing as any).business_name || targetListing.name}</span> has been
                forwarded directly to the <strong>Admin, Manager, and Super Admin Portal</strong>.
              </p>
            </div>

            {shouldBlockBusiness && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center justify-center space-x-2">
                <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Business Blocked:</strong> This business has been blocked for your profile. Their direct communications and updates are muted.
                </span>
              </div>
            )}

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left text-xs text-slate-400 space-y-2">
              <div className="font-bold text-white flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>What happens next?</span>
              </div>
              <p>
                Our compliance managers inspect the business audit log, registration authenticity, and pricing history.
                Available administrator actions include issuing warnings, 7/14/30-day listing suspensions, or permanent restriction.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done &amp; Return to Listings
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. SELECT REASON */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                <FileWarning className="w-3.5 h-3.5" />
                <span>Select Violation Reason (Required)</span>
              </label>

              <div className="space-y-1.5">
                {REPORT_REASONS.map((opt, idx) => {
                  const isSelected = selectedReason === opt.value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedReason(opt.value)}
                      className={`w-full p-3 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-500/60 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-lg shrink-0 mt-0.5">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-bold ${
                            isSelected ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                          {opt.description}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-rose-400 bg-rose-500'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. EXPLANATION / DETAILS */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <span>Explanation &amp; Evidence</span>
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                required
                rows={3}
                placeholder="Describe why you are reporting this business (e.g., requested payment to private bank account, fake jet registration, unverified claims, or bait & switch)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* 3. BLOCK BUSINESS CHECKBOX */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldBlockBusiness}
                  onChange={(e) => setShouldBlockBusiness(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-sm border-slate-700 bg-slate-900 text-rose-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Ban className="w-3.5 h-3.5 text-rose-400" />
                    <span>Block this organization for my account</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Hides direct messages, offers, and posts from {(targetListing as any).business_name || targetListing.name} on your dashboard.
                  </p>
                </div>
              </label>
            </div>

            {/* Reporter Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Reporter Name:
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Reporter Email:
                </label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5 text-white" />
                <span>{isSubmitting ? 'Submitting Report...' : 'Submit Report to Admin Portal'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

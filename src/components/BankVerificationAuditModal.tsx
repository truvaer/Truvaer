import React, { useState } from 'react';
import {
  X,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Lock,
  PowerOff,
  RotateCcw,
  Clock,
  Building2,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { BusinessProfile, AdminUser } from '../types';
import { db } from '../data/mockDatabase';
import { BankDocumentPreviewModal } from './BankDocumentPreviewModal';

interface BankVerificationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile;
  activeAdmin: AdminUser | null;
  onActionComplete: () => void;
}

export const BankVerificationAuditModal: React.FC<BankVerificationAuditModalProps> = ({
  isOpen,
  onClose,
  business,
  activeAdmin,
  onActionComplete,
}) => {
  const [docPreviewType, setDocPreviewType] = useState<'CANCELLED_CHEQUE' | 'BANK_STATEMENT' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('Cancelled Cheque & Bank Account Statement cross-audited. Verified for treasury remittances.');
  const [shutOffReason, setShutOffReason] = useState('Administrative shut-off for verification re-audit and compliance review.');
  const [rejectRemarks, setRejectRemarks] = useState('Beneficiary name does not match legal corporate registration document.');
  const [activeActionTab, setActiveActionTab] = useState<'DETAILS' | 'SHUT_OFF' | 'REJECT'>('DETAILS');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Rule: Check is the only finance team is permitted if that's the case make sure that admin with above L7 have access to check the bank details.
  const hasBankAccess = db.canAdminAccessBankDetails(activeAdmin);

  const handleApprove = () => {
    if (!activeAdmin) {
      setErrorMsg('No active admin session found.');
      return;
    }
    const res = db.verifyBusinessBankAccount(business.business_id, activeAdmin, approvalNotes);
    if (res.success) {
      setSuccessMsg(res.message);
      onActionComplete();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleShutOff = () => {
    if (!activeAdmin) {
      setErrorMsg('No active admin session found.');
      return;
    }
    const res = db.shutOffBusinessBankVerification(business.business_id, activeAdmin, shutOffReason);
    if (res.success) {
      setSuccessMsg(res.message);
      onActionComplete();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleReject = () => {
    if (!activeAdmin) {
      setErrorMsg('No active admin session found.');
      return;
    }
    const res = db.rejectBusinessBankVerification(business.business_id, activeAdmin, rejectRemarks);
    if (res.success) {
      setSuccessMsg(res.message);
      onActionComplete();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } else {
      setErrorMsg(res.message);
    }
  };

  const isVerified = business.finance_bank_verified === true;
  const status = business.bank_verification_status || (isVerified ? 'VERIFIED' : 'PENDING_VERIFICATION');

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Bank Settlement Verification Desk</span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                      isVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : status === 'REVOKED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isVerified ? '✓ Verified' : status === 'REVOKED' ? '⛔ Shut Off / Revoked' : status === 'REJECTED' ? '❌ Rejected' : '⏳ Pending Review'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Entity: <span className="text-white font-semibold">{business.organization_name}</span> • ID: <span className="font-mono text-slate-300">{business.business_id}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Notices */}
          {successMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Permission Gating Notice (Rule 2) */}
            {!hasBankAccess ? (
              <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-100">Restricted Access (Finance / L7+ Required)</h4>
                  <p className="text-xs text-rose-300/80 mt-1 max-w-md mx-auto leading-relaxed">
                    Access to check beneficiary bank accounts, inspect verification documents (cancelled cheque / statement), and approve or shut off payment remittances is permitted strictly to the <strong>Finance Department</strong> and <strong>Administrators above Level 7 (L7/L8)</strong>.
                  </p>
                </div>
                <div className="inline-block bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
                  Your Current Role: <span className="text-amber-400 font-semibold">{activeAdmin?.name || 'Guest'}</span> [{activeAdmin?.department || 'Operations'}] • {activeAdmin?.level_title || `Level ${activeAdmin?.level ?? 0}`}
                </div>
                <div className="pt-2 text-[11px] text-slate-500">
                  To test bank verification approval, switch to an authorized operator like <strong>Sunita Rao (Finance L6)</strong>, <strong>Operations Administrator (L7)</strong>, or <strong>Super Admin (L8)</strong>.
                </div>
              </div>
            ) : (
              <>
                {/* Authorization Pass Banner */}
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Authorized Access: <strong className="text-white">{activeAdmin?.name}</strong> ({activeAdmin?.department} • {activeAdmin?.level_title || `Level ${activeAdmin?.level}`})
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-mono font-bold">
                    CLEARANCE GRANTED
                  </span>
                </div>

                {/* Account Ownership & Non-Tampering Notice (Rule 3) */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bank Coordinates Governance &amp; Security</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Remittance Lock Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Bank details can only be changed, uploaded, or modified by the account who registered them (<span className="text-slate-200 font-medium">{business.bank_uploaded_by_user_name || business.owner_name}</span>). Administrators cannot tamper with banking coordinates directly. All remittances are disbursed strictly to this verified account.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Bank Name</span>
                      <span className="text-white font-bold truncate block">{business.bank_name || 'HDFC Commercial Bank'}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Beneficiary Name</span>
                      <span className="text-slate-200 font-bold truncate block">{business.bank_account_holder || business.organization_name}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Account Number</span>
                      <span className="text-amber-300 font-bold block">{business.bank_account_number_masked || '••••8899'}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">IFSC / SWIFT</span>
                      <span className="text-slate-300 font-bold block">{business.bank_ifsc_swift || 'HDFC0001234'}</span>
                    </div>
                  </div>
                </div>

                {/* Document Verification Section (Rule 4: Cancelled Cheque & Bank Account Statement) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Verification Documents Audit (Mandatory Proof)</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">2 Documents Required</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Document 1: Cancelled Cheque */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Landmark className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Cancelled Cheque</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                              {business.cancelled_cheque_filename || 'Cancelled_Cheque_Proof.pdf'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                          ATTACHED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Cross-check payee title, account number, MICR code, and bank branch coordinates.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDocPreviewType('CANCELLED_CHEQUE')}
                        className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Cancelled Cheque</span>
                      </button>
                    </div>

                    {/* Document 2: Bank Account Statement */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Bank Account Statement</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                              {business.bank_statement_filename || 'Bank_Statement_Q3.pdf'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                          ATTACHED
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Verify commercial corporate name, active transactions, bank seal, and branch code.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDocPreviewType('BANK_STATEMENT')}
                        className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Bank Statement</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit Action Panel: Approve / Shut Off / Reject */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-white flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Executive Decision Controls</span>
                    </span>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => setActiveActionTab('DETAILS')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          activeActionTab === 'DETAILS'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Approve Bank
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActionTab('SHUT_OFF')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          activeActionTab === 'SHUT_OFF'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                        title="Shut off or revoke bank verification"
                      >
                        Shut Off / Revoke
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveActionTab('REJECT')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          activeActionTab === 'REJECT'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {activeActionTab === 'DETAILS' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Approval &amp; Audit Log Remarks
                        </label>
                        <input
                          type="text"
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="e.g. Cancelled Cheque & Bank Statement verified. Clearance approved."
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        By clicking approve, you certify that you have inspected the cancelled cheque and statement proof. This unlocks automated payout settlements strictly to this account.
                      </p>
                      <button
                        type="button"
                        onClick={handleApprove}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve &amp; Authorize Bank Remittances</span>
                      </button>
                    </div>
                  )}

                  {activeActionTab === 'SHUT_OFF' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1">
                        <div className="font-bold flex items-center space-x-1.5">
                          <PowerOff className="w-3.5 h-3.5 text-amber-400" />
                          <span>Shut Off Bank Verification ("Toggle Off")</span>
                        </div>
                        <p className="text-[11px] text-amber-300/80">
                          This immediately halts and freezes further payout remittances to this account. Used for compliance audits, suspicious change alerts, or account deactivation.
                        </p>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Reason for Shutting Off Verification
                        </label>
                        <input
                          type="text"
                          value={shutOffReason}
                          onChange={(e) => setShutOffReason(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="Reason for shut off..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleShutOff}
                        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
                      >
                        <PowerOff className="w-4 h-4" />
                        <span>Execute Administrative Shut-Off (Freeze Remittances)</span>
                      </button>
                    </div>
                  )}

                  {activeActionTab === 'REJECT' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Rejection Reason (Dispatched to Account Owner)
                        </label>
                        <input
                          type="text"
                          value={rejectRemarks}
                          onChange={(e) => setRejectRemarks(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="Reason for rejecting bank documents..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleReject}
                        className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Bank Details &amp; Request Resubmission</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Audit History Timeline */}
                {business.bank_verification_history && business.bank_verification_history.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Bank Audit &amp; Verification History
                    </h5>
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 max-h-36 overflow-y-auto">
                      {business.bank_verification_history.map((entry, idx) => (
                        <div key={idx} className="flex items-start justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                          <div>
                            <span className={`font-mono font-bold mr-2 ${
                              entry.action === 'VERIFIED' ? 'text-emerald-400' :
                              entry.action === 'REVOKED' ? 'text-amber-400' :
                              entry.action === 'REJECTED' ? 'text-rose-400' : 'text-blue-400'
                            }`}>
                              [{entry.action}]
                            </span>
                            <span className="text-white font-medium">{entry.actor_name}</span> ({entry.actor_role})
                            {entry.notes && <div className="text-[10px] text-slate-500 mt-0.5">{entry.notes}</div>}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Payments are remitted strictly to verified bank accounts.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Document Preview Drawer/Modal */}
      {docPreviewType && (
        <BankDocumentPreviewModal
          isOpen={!!docPreviewType}
          onClose={() => setDocPreviewType(null)}
          documentType={docPreviewType}
          business={business}
        />
      )}
    </>
  );
};

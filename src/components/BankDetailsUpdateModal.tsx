import React, { useState } from 'react';
import {
  X,
  Landmark,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  FileText,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { db } from '../data/mockDatabase';

interface BankDetailsUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile;
  onSuccess: (updatedBiz: BusinessProfile) => void;
}

export const BankDetailsUpdateModal: React.FC<BankDetailsUpdateModalProps> = ({
  isOpen,
  onClose,
  business,
  onSuccess,
}) => {
  const [bankName, setBankName] = useState(business.bank_name || 'HDFC Commercial Bank Ltd');
  const [bankHolder, setBankHolder] = useState(business.bank_account_holder || business.organization_name);
  const [accountNumber, setAccountNumber] = useState(business.bank_account_number || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(business.bank_account_number || '');
  const [ifscSwift, setIfscSwift] = useState(business.bank_ifsc_swift || 'HDFC0001234');

  // Document attachments
  const [cancelledChequeFile, setCancelledChequeFile] = useState<{
    name: string;
    size: number;
    url: string;
  }>({
    name: business.cancelled_cheque_filename || `${business.organization_name.replace(/\s+/g, '_')}_Cancelled_Cheque.pdf`,
    size: business.cancelled_cheque_filesize || 1450200,
    url: business.cancelled_cheque_doc_url || 'https://compliance.truvaer.com/docs/cancelled_cheque.pdf',
  });

  const [bankStatementFile, setBankStatementFile] = useState<{
    name: string;
    size: number;
    url: string;
  }>({
    name: business.bank_statement_filename || `${business.organization_name.replace(/\s+/g, '_')}_Bank_Statement_Q3.pdf`,
    size: business.bank_statement_filesize || 2890400,
    url: business.bank_statement_doc_url || 'https://compliance.truvaer.com/docs/bank_statement_q3.pdf',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChequeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCancelledChequeFile({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      });
      setFieldErrors((prev) => ({ ...prev, cheque: '' }));
    }
  };

  const handleStatementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBankStatementFile({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      });
      setFieldErrors((prev) => ({ ...prev, statement: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!bankName.trim() || bankName.trim().length < 2) {
      errs.bankName = 'Bank name is required.';
    }
    if (!bankHolder.trim() || bankHolder.trim().length < 2) {
      errs.bankHolder = 'Beneficiary account holder name is required.';
    }
    const cleanAcc = accountNumber.trim().replace(/\s+/g, '');
    if (!cleanAcc || cleanAcc.length < 8) {
      errs.accountNumber = 'Account number must be at least 8 digits.';
    }
    if (cleanAcc !== confirmAccountNumber.trim().replace(/\s+/g, '')) {
      errs.confirmAccountNumber = 'Account numbers do not match. Please verify.';
    }
    const cleanIfsc = ifscSwift.trim().toUpperCase();
    if (!cleanIfsc || cleanIfsc.length < 5) {
      errs.ifscSwift = 'Valid IFSC or SWIFT code is required.';
    }
    if (!cancelledChequeFile.name) {
      errs.cheque = 'Cancelled Cheque document is mandatory for bank verification.';
    }
    if (!bankStatementFile.name) {
      errs.statement = 'Bank Account Statement is mandatory for bank verification.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    const res = db.updateBusinessBankDetails(
      business.business_id,
      business.business_id,
      business.organization_name,
      {
        bank_name: bankName.trim(),
        bank_account_holder: bankHolder.trim(),
        bank_account_number: cleanAcc,
        bank_ifsc_swift: cleanIfsc,
        cancelled_cheque_filename: cancelledChequeFile.name,
        cancelled_cheque_filesize: cancelledChequeFile.size,
        cancelled_cheque_doc_url: cancelledChequeFile.url,
        bank_statement_filename: bankStatementFile.name,
        bank_statement_filesize: bankStatementFile.size,
        bank_statement_doc_url: bankStatementFile.url,
      }
    );

    setIsSubmitting(false);

    if (res.success && res.business) {
      setFeedbackSuccess(res.message);
      onSuccess(res.business);
      setTimeout(() => {
        setFeedbackSuccess(null);
        onClose();
      }, 2000);
    } else {
      setFieldErrors({ submit: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Update Registered Bank Coordinates</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Owner Portal
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Authorized Account: <span className="text-white font-medium">{business.organization_name}</span>
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

        {/* Feedback Success */}
        {feedbackSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Important Security Notice (Rule 3 & 4) */}
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mandatory Finance / L7 Verification Notice</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Updating your bank details resets verification status. To prevent unauthorized diversion of corporate funds, further payouts and settlements are held until the <strong>Finance Department or L7/L8 Administration</strong> audits and approves your uploaded <strong>Cancelled Cheque</strong> and <strong>Bank Statement</strong>.
            </p>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Commercial Bank Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Commercial Bank Ltd"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  fieldErrors.bankName ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {fieldErrors.bankName && <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.bankName}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Beneficiary / Account Holder <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                placeholder="Must match incorporation title"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  fieldErrors.bankHolder ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {fieldErrors.bankHolder && <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.bankHolder}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Account Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter full account number"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  fieldErrors.accountNumber ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {fieldErrors.accountNumber && (
                <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.accountNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Confirm Account Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                placeholder="Re-enter account number"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  fieldErrors.confirmAccountNumber ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {fieldErrors.confirmAccountNumber && (
                <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.confirmAccountNumber}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                IFSC / SWIFT / BIC Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={ifscSwift}
                onChange={(e) => setIfscSwift(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0001234 or CHASUS33XXX"
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                  fieldErrors.ifscSwift ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {fieldErrors.ifscSwift && <p className="text-[10px] text-rose-400 mt-1">{fieldErrors.ifscSwift}</p>}
            </div>
          </div>

          {/* Mandatory Proof Documents Upload (Rule 4) */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Mandatory Proof Documents (Cancelled Cheque &amp; Statement)</span>
            </h4>

            {/* Document 1: Cancelled Cheque */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">1. Cancelled Cheque Document</div>
                  <div className="text-[10px] text-slate-400">
                    Showing entity title, account number, and bank MICR band.
                  </div>
                </div>
                {cancelledChequeFile.name && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    ✓ Selected
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer flex items-center space-x-1.5 transition-colors">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Choose Cheque File</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleChequeUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                  {cancelledChequeFile.name} ({(cancelledChequeFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              {fieldErrors.cheque && <p className="text-[10px] text-rose-400">{fieldErrors.cheque}</p>}
            </div>

            {/* Document 2: Bank Statement */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">2. Bank Account Statement</div>
                  <div className="text-[10px] text-slate-400">
                    Latest 3 months corporate statement with bank branch seal.
                  </div>
                </div>
                {bankStatementFile.name && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    ✓ Selected
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer flex items-center space-x-1.5 transition-colors">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Choose Statement File</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleStatementUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                  {bankStatementFile.name} ({(bankStatementFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              {fieldErrors.statement && <p className="text-[10px] text-rose-400">{fieldErrors.statement}</p>}
            </div>
          </div>

          {fieldErrors.submit && (
            <p className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
              {fieldErrors.submit}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit for Finance / L7 Verification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

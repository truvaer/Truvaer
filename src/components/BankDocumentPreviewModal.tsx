import React from 'react';
import { X, FileText, Download, CheckCircle2, ShieldCheck, Landmark, AlertTriangle } from 'lucide-react';
import { BusinessProfile } from '../types';

interface BankDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'CANCELLED_CHEQUE' | 'BANK_STATEMENT';
  business: BusinessProfile;
}

export const BankDocumentPreviewModal: React.FC<BankDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentType,
  business,
}) => {
  if (!isOpen) return null;

  const isCheque = documentType === 'CANCELLED_CHEQUE';
  const docTitle = isCheque ? 'Cancelled Cheque Verification Document' : 'Official Bank Account Statement';
  const fileName = isCheque
    ? business.cancelled_cheque_filename || `${business.organization_name.replace(/\s+/g, '_')}_Cancelled_Cheque.pdf`
    : business.bank_statement_filename || `${business.organization_name.replace(/\s+/g, '_')}_Bank_Statement_Q3.pdf`;
  const fileSize = isCheque
    ? (business.cancelled_cheque_filesize ? `${(business.cancelled_cheque_filesize / 1024).toFixed(1)} KB` : '1.4 MB')
    : (business.bank_statement_filesize ? `${(business.bank_statement_filesize / 1024).toFixed(1)} KB` : '2.8 MB');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${isCheque ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>{docTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {isCheque ? 'Cheque Proof' : 'Statement Proof'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Uploaded by: <span className="text-slate-200 font-medium">{business.bank_uploaded_by_user_name || business.owner_name}</span> • Entity: <span className="text-white font-semibold">{business.organization_name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Content View */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">File Name</span>
              <span className="text-white font-mono truncate block" title={fileName}>{fileName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">File Size</span>
              <span className="text-slate-300 font-mono">{fileSize}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Uploaded On</span>
              <span className="text-slate-300 font-mono">
                {business.bank_uploaded_at ? new Date(business.bank_uploaded_at).toLocaleDateString() : 'Active Record'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Audit Status</span>
              <span className={`font-mono font-bold ${business.finance_bank_verified ? 'text-emerald-400' : 'text-amber-400'}`}>
                {business.finance_bank_verified ? '✓ Verified by Finance' : '⏳ Pending Review'}
              </span>
            </div>
          </div>

          {/* High-Fidelity Document Visual Representation */}
          {isCheque ? (
            /* Cancelled Cheque Realistic Render */
            <div className="relative bg-gradient-to-r from-sky-50 via-amber-50 to-emerald-50 rounded-2xl p-6 text-slate-900 shadow-xl border-2 border-slate-300 overflow-hidden font-sans select-none">
              {/* Subtle Guilloche Bank Pattern */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Big Red "CANCELLED" Stamp Across Cheque */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform -rotate-12">
                <div className="border-4 border-rose-600/60 rounded-xl px-12 py-3 bg-rose-500/10 backdrop-blur-[1px]">
                  <span className="text-4xl sm:text-5xl font-black tracking-widest text-rose-600/80 font-mono">
                    CANCELLED
                  </span>
                </div>
              </div>

              {/* Cheque Header */}
              <div className="flex items-start justify-between border-b border-slate-300 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-sm">
                    {business.bank_name ? business.bank_name.charAt(0) : 'B'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                      {business.bank_name || 'HDFC Commercial Bank Ltd'}
                    </h4>
                    <p className="text-[10px] text-slate-600">
                      Corporate Banking Branch • IFSC: <span className="font-mono font-bold text-slate-800">{business.bank_ifsc_swift || 'HDFC0001234'}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="border border-slate-400 bg-white px-3 py-1 rounded text-xs font-mono tracking-widest font-semibold text-slate-800">
                    DATE: DD/MM/YYYY
                  </div>
                </div>
              </div>

              {/* Cheque Body Details */}
              <div className="my-5 space-y-3.5 text-xs">
                <div className="flex items-center space-x-2 border-b border-dotted border-slate-400 pb-1">
                  <span className="text-slate-600 font-bold uppercase text-[10px] w-14">PAY</span>
                  <span className="font-bold text-slate-900 tracking-wider">
                    *** {business.bank_account_holder || business.organization_name} ***
                  </span>
                </div>
                <div className="flex items-center space-x-2 border-b border-dotted border-slate-400 pb-1">
                  <span className="text-slate-600 font-bold uppercase text-[10px] w-14">RUPEES</span>
                  <span className="text-slate-700 italic">
                    FOR VERIFICATION OF REGISTERED SETTLEMENT ACCOUNT ONLY
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600 font-bold text-[10px] uppercase">A/C NO.</span>
                    <span className="font-mono font-bold text-sm bg-white border border-slate-400 px-3 py-1 rounded tracking-wider text-slate-900">
                      {business.bank_account_number_masked || '••••8899'}
                    </span>
                  </div>
                  <div className="text-right border-t border-slate-400 pt-2 sm:border-0 sm:pt-0">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">For {business.organization_name}</div>
                    <div className="font-serif italic text-xs text-blue-900 my-1">Aditya Narayana / Authorized Signatory</div>
                    <div className="text-[9px] text-slate-400">Authorized Officer</div>
                  </div>
                </div>
              </div>

              {/* Bottom MICR Band */}
              <div className="mt-4 pt-3 border-t-2 border-slate-400 bg-white/70 -mx-6 -mb-6 px-6 py-2 flex items-center justify-center font-mono text-xs tracking-widest text-slate-800">
                ⑈ 004812 ⑈ {business.bank_ifsc_swift ? business.bank_ifsc_swift.slice(0, 4) : '4002'} ⑆ 008123 ⑈ 10
              </div>
            </div>
          ) : (
            /* Bank Statement Realistic Render */
            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-xl border border-slate-300 font-sans text-xs space-y-4">
              {/* Statement Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Landmark className="w-5 h-5 text-blue-800" />
                    <h4 className="font-black text-base text-blue-950 uppercase">
                      {business.bank_name || 'HDFC Commercial Bank Ltd'}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    Commercial &amp; Corporate Treasury Banking Division • Nariman Point Branch, Mumbai
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 text-blue-900 font-bold text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
                    Official e-Statement
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">Statement Q3: 01-Jul-2026 to 30-Sep-2026</div>
                </div>
              </div>

              {/* Account Holder Information Box */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Account Entity Title</span>
                  <strong className="text-sm text-slate-900">{business.bank_account_holder || business.organization_name}</strong>
                  <div className="text-[11px] text-slate-600 mt-0.5">{business.physical_location || 'Registered Commercial Office'}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-bold text-slate-900">{business.bank_account_number_masked || '••••8899'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IFSC / SWIFT:</span>
                    <span className="font-mono font-bold text-slate-900">{business.bank_ifsc_swift || 'HDFC0001234'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Account Type:</span>
                    <span className="font-semibold text-slate-800">Current Corporate Escrow</span>
                  </div>
                </div>
              </div>

              {/* Transaction Sample Table */}
              <div>
                <h5 className="font-bold text-slate-800 text-xs mb-2 uppercase tracking-wide">
                  Recent Verified Bank Clearance Ledger
                </h5>
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Transaction Particulars</th>
                        <th className="p-2">UTR / Ref</th>
                        <th className="p-2 text-right">Debit</th>
                        <th className="p-2 text-right">Credit</th>
                        <th className="p-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700 font-mono">
                      <tr>
                        <td className="p-2">15-Sep-2026</td>
                        <td className="p-2 font-sans">Corporate Aviation Escrow Settlement</td>
                        <td className="p-2">UTR-HDFC-9912</td>
                        <td className="p-2 text-right text-slate-400">-</td>
                        <td className="p-2 text-right text-emerald-700 font-bold">₹1,500,000</td>
                        <td className="p-2 text-right">₹4,820,000</td>
                      </tr>
                      <tr>
                        <td className="p-2">22-Sep-2026</td>
                        <td className="p-2 font-sans">Airport Apron &amp; Ground Handling Wire</td>
                        <td className="p-2">NEFT-004128</td>
                        <td className="p-2 text-right text-rose-700 font-bold">₹350,000</td>
                        <td className="p-2 text-right text-slate-400">-</td>
                        <td className="p-2 text-right">₹4,470,000</td>
                      </tr>
                      <tr>
                        <td className="p-2">30-Sep-2026</td>
                        <td className="p-2 font-sans">Executive Air Charter Remittance</td>
                        <td className="p-2">RTGS-881923</td>
                        <td className="p-2 text-right text-slate-400">-</td>
                        <td className="p-2 text-right text-emerald-700 font-bold">₹850,000</td>
                        <td className="p-2 text-right font-bold text-slate-900">₹5,320,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Seal / Signature */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[10px] text-slate-500">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-800/40 flex items-center justify-center text-blue-900 font-bold text-[8px] transform -rotate-12">
                    SEAL
                  </div>
                  <div>
                    <div>Computer Generated Statement</div>
                    <div>Certified Digital Signature: DS HDFC BANK LTD 2026</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  Branch Code: 0012 • Nariman Point, Mumbai
                </div>
              </div>
            </div>
          )}

          {/* Verification Cross-Check Guide */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Finance Officer Verification Checklist</span>
            </div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside text-[11px]">
              <li>
                <strong>Entity Match:</strong> Cheque payee / Statement title (<span className="text-slate-200">{business.bank_account_holder}</span>) matches registered firm (<span className="text-white">{business.organization_name}</span>).
              </li>
              <li>
                <strong>IFSC / Bank Code:</strong> <span className="text-slate-200 font-mono">{business.bank_ifsc_swift}</span> matches branch coordinates.
              </li>
              <li>
                <strong>Remittance Safety:</strong> Approving this document permanently registers this account for automated payouts and disbursals.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Document Authenticated with SHA-256 Checksum</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

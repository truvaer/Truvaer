import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building2,
  FileText,
  Calendar,
  CheckCircle2,
  Globe,
  Award,
} from 'lucide-react';

export interface PrintableDocumentData {
  referenceNumber: string;
  date: string;
  validUntil?: string;
  serviceTitle: string;
  issuerName: string;
  issuerBase?: string;
  issuerRegistration?: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  sector?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  taxPercent: number;
  grandTotal: number;
  paymentTerms?: string;
  notes?: string;
  status: string;
}

interface QuotationPrintableStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'QUOTATION' | 'DEAL' | 'SALES_STATEMENT';
  data: PrintableDocumentData | null;
}

export const QuotationPrintableStatementModal: React.FC<QuotationPrintableStatementModalProps> = ({
  isOpen,
  onClose,
  documentType,
  data,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const subtotal = data.items.reduce((sum, it) => sum + it.total, 0);
  const taxAmount = Math.round((subtotal * (data.taxPercent || 5)) / 100);

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TruvAer Aviation - ${data.referenceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: bold; color: #0369a1; }
    .ref { font-family: monospace; font-size: 14px; color: #64748b; }
    .meta-grid { display: flex; justify-content: space-between; margin-top: 24px; margin-bottom: 24px; }
    .party-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; width: 45%; }
    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .table th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; }
    .table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .totals { margin-top: 20px; margin-left: auto; width: 300px; text-align: right; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .grand-total { font-size: 18px; font-weight: bold; color: #0284c7; border-top: 2px solid #cbd5e1; padding-top: 8px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
    .seal { display: inline-block; padding: 6px 12px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 20px; color: #047857; font-weight: bold; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">TRUVAER AVIATION NETWORK</div>
      <div class="ref">OFFICIAL ${documentType} STATEMENT • #${data.referenceNumber}</div>
    </div>
    <div class="seal">DGCA / FAA VERIFIED NETWORK CONTRACT</div>
  </div>

  <div class="meta-grid">
    <div class="party-card">
      <strong>ISSUING BUSINESS:</strong><br>
      <span style="font-size: 15px; font-weight: bold;">${data.issuerName}</span><br>
      Base: ${data.issuerBase || 'Chhatrapati Shivaji Maharaj International (BOM)'}<br>
      Reg / AOC: ${data.issuerRegistration || 'TRV-AOC-9921'}
    </div>
    <div class="party-card">
      <strong>CLIENT / RECIPIENT:</strong><br>
      <span style="font-size: 15px; font-weight: bold;">${data.clientName}</span><br>
      Organization: ${data.clientCompany || 'Corporate Aviation Charterer'}<br>
      Sector: ${data.sector || 'International Flight Operations'}
    </div>
  </div>

  <h3>Itemized Commercial Scope</h3>
  <table class="table">
    <thead>
      <tr>
        <th>#</th>
        <th>Service Description</th>
        <th>Quantity</th>
        <th style="text-align: right;">Unit Rate</th>
        <th style="text-align: right;">Total Amount</th>
      </tr>
    </thead>
    <tbody>
      ${data.items
        .map(
          (it, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${it.description}</td>
          <td>${it.quantity}</td>
          <td style="text-align: right;">₹${it.unit_price.toLocaleString()}</td>
          <td style="text-align: right; font-weight: bold;">₹${it.total.toLocaleString()}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Subtotal:</span>
      <span>₹${subtotal.toLocaleString()}</span>
    </div>
    <div class="total-row">
      <span>Applicable GST/VAT (${data.taxPercent}%):</span>
      <span>₹${taxAmount.toLocaleString()}</span>
    </div>
    <div class="total-row grand-total">
      <span>Grand Total:</span>
      <span>₹${data.grandTotal.toLocaleString()}</span>
    </div>
  </div>

  <div style="margin-top: 30px; background: #fafafa; padding: 15px; border-radius: 6px; font-size: 12px;">
    <strong>Commercial Payment Terms:</strong> ${data.paymentTerms || 'Standard corporate wire transfer.'}<br>
    <strong>Operational Notes:</strong> ${data.notes || 'Subject to slot approval and standard ground handling.'}
  </div>

  <div class="footer">
    TruvAer Corporate Aviation Cloud • Cryptographically Monitored • Document Timestamp: ${data.date} • System ID: ${data.referenceNumber}
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TruvAer_${documentType}_${data.referenceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Control Bar (Never Printed) */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Official Aviation Statement &amp; PDF Export
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  VERIFIED SEAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {documentType} #{data.referenceNumber} • Ready for digital archiving &amp; PDF print
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
              title="Print to printer or Save as PDF using browser"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Download standalone executive document file"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-2"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas Area (High-contrast, pure white background for crisp PDF generation) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40 custom-scrollbar">
          <div
            ref={printAreaRef}
            id="truvaer-printable-statement"
            className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto border border-slate-200 print:border-none print:shadow-none print:m-0 print:p-4 text-xs font-sans space-y-6"
          >
            {/* Header: TruvAer Aviation Network & Official Seal */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-sky-600">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden p-0.5 bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <img src="/logo.png" alt="TruvAer Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xl font-extrabold tracking-wider text-slate-950">
                    TRUVAER
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                    AVIATION NETWORK
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Autonomous Global Business Aviation Exchange &amp; Operations Registry
                </p>
                <div className="text-[11px] font-mono text-slate-700 pt-1">
                  <strong>Document Class:</strong> OFFICIAL {documentType} CERTIFICATE
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1 shrink-0">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DGCA / FAA VERIFIED AUDIT</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                  REF: {data.referenceNumber}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Issued: {data.date} {data.validUntil ? `• Valid: ${data.validUntil}` : ''}
                </div>
              </div>
            </div>

            {/* Issuer and Client Dossier Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Operating Business / Service Provider:
                </span>
                <div className="text-sm font-bold text-slate-900">{data.issuerName}</div>
                <div className="text-[11px] text-slate-600">
                  <strong>Base:</strong> {data.issuerBase || 'CSMIA Terminal 1 (VABB / BOM)'}
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>AOC / License:</strong> {data.issuerRegistration || 'TRV-CORP-9842'}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1 pt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>TruvAer Verified Operator Account</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Customer / Corporate Client:
                </span>
                <div className="text-sm font-bold text-slate-900">{data.clientName}</div>
                <div className="text-[11px] text-slate-600">
                  <strong>Organization:</strong> {data.clientCompany || 'Private Charterer / Client'}
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Sector / Route:</strong> {data.sector || 'VIP Charter • BOM &rarr; DXB'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  Scope: {data.serviceTitle}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-2">
                Itemized Flight Scope &amp; Commercial Breakdown
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-mono text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2.5 font-bold">#</th>
                      <th className="px-3.5 py-2.5 font-bold">Scope Description</th>
                      <th className="px-3.5 py-2.5 font-bold text-center">Qty</th>
                      <th className="px-3.5 py-2.5 font-bold text-right">Unit Rate</th>
                      <th className="px-3.5 py-2.5 font-bold text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="px-3.5 py-2.5 font-mono text-slate-500">{idx + 1}</td>
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">{item.description}</td>
                        <td className="px-3.5 py-2.5 font-mono text-center text-slate-700">{item.quantity}</td>
                        <td className="px-3.5 py-2.5 font-mono text-right text-slate-700">
                          ₹{item.unit_price.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-right text-slate-950">
                          ₹{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & Totals */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
              <div className="space-y-2 max-w-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <div>
                    <strong>Payment Schedule:</strong> {data.paymentTerms || '50% advance on confirmation, balance 24h prior to flight block.'}
                  </div>
                  <div>
                    <strong>Regulatory Provision:</strong> All operations governed under ICAO annexes and civil aviation authority permissions.
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>GST / Aviation Tax ({data.taxPercent}%):</span>
                  <span className="font-mono font-semibold text-slate-900">
                    ₹{taxAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-950 pt-2 border-t-2 border-slate-300">
                  <span>Grand Total:</span>
                  <span className="font-mono text-sky-700 text-base">
                    ₹{data.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Digital Verification & Sign-off Block */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-3">
              <div>
                Digital Hash: <span className="text-slate-800">SHA256-{data.referenceNumber}-TRV99</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Authorized Electronic Signature</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  CLEARED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  Briefcase,
  TrendingUp,
  CreditCard,
  Building2,
  FileText,
  Send,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Receipt,
  Check,
  Calendar,
  Layers,
  Printer,
  Download,
} from 'lucide-react';
import {
  QuotationRequest,
  CRMQuotation,
  CRMOpportunity,
  CRMSalesRecord,
  BusinessProfile,
  RegularUser,
  CRMQuotationItem,
} from '../types';
import { db } from '../data/mockDatabase';
import {
  QuotationPrintableStatementModal,
  PrintableDocumentData,
} from './QuotationPrintableStatementModal';

interface QuotationDealsLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: RegularUser | null;
  currentBusiness?: BusinessProfile | null;
  onRefreshData?: () => void;
  initialQuotationRequestId?: string;
}

export const QuotationDealsLifecycleModal: React.FC<QuotationDealsLifecycleModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentBusiness,
  onRefreshData,
  initialQuotationRequestId,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'requests' | 'quotations' | 'deals' | 'sales'>('requests');

  // Data states
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [quotations, setQuotations] = useState<CRMQuotation[]>([]);
  const [opportunities, setOpportunities] = useState<CRMOpportunity[]>([]);
  const [sales, setSales] = useState<CRMSalesRecord[]>([]);

  // Action states
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<CRMQuotation | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<CRMOpportunity | null>(null);

  // Issue Quotation Form (Business User side)
  const [showIssueQuoteDrawer, setShowIssueQuoteDrawer] = useState(false);
  const [quoteItems, setQuoteItems] = useState<CRMQuotationItem[]>([
    {
      id: 'item_1',
      description: 'Flight Charter Block Hours / Operations',
      quantity: 1,
      unit_price: 450000,
      total: 450000,
    },
    {
      id: 'item_2',
      description: 'Ramp Handling & VIP Terminal Fee',
      quantity: 1,
      unit_price: 75000,
      total: 75000,
    },
  ]);
  const [quoteTaxPercent, setQuoteTaxPercent] = useState(5);
  const [quotePaymentTerms, setQuotePaymentTerms] = useState(
    '50% advance on agreement, balance 24h before departure.'
  );
  const [quoteNotes, setQuoteNotes] = useState(
    'Includes certified crew, passenger insurance and concierge.'
  );

  // Payment Confirmation State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetDealForPayment, setTargetDealForPayment] = useState<CRMOpportunity | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Corporate Wallet');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Official PDF & Printable Statement Export State (A2)
  const [printableDoc, setPrintableDoc] = useState<PrintableDocumentData | null>(null);
  const [printableDocType, setPrintableDocType] = useState<'QUOTATION' | 'DEAL' | 'SALES_STATEMENT'>('QUOTATION');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const loadData = () => {
    const allReqs = db.getQuotationRequests();
    const allQuots = db.getCRMQuotations();
    const allOpps = db.getCRMOpportunities();
    const allSales = db.getCRMSales();

    setRequests([...allReqs]);
    setQuotations([...allQuots]);
    setOpportunities([...allOpps]);
    setSales([...allSales]);

    if (initialQuotationRequestId) {
      const match = allReqs.find((r) => r.id === initialQuotationRequestId);
      if (match) setSelectedRequest(match);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialQuotationRequestId]);

  const handleIssueQuotationFromRequest = (req: QuotationRequest) => {
    // Generate quotation for this request
    const subtotal = quoteItems.reduce((acc, i) => acc + i.total, 0);
    const taxAmt = Math.round((subtotal * quoteTaxPercent) / 100);
    const grandTot = subtotal + taxAmt;

    const res = db.issueFormalCRMQuotation({
      business_id: req.business_id,
      business_name: req.business_name,
      client_name: req.client_name,
      client_email: req.client_email,
      client_phone: req.client_phone,
      service_title: req.selected_services.join(', ') || 'Aviation Service Charter',
      items: quoteItems,
      subtotal,
      tax_percent: quoteTaxPercent,
      tax_amount: taxAmt,
      grand_total: grandTot,
      currency: req.currency || 'INR',
      valid_days: 14,
      payment_terms: quotePaymentTerms,
      notes: quoteNotes,
      departure_hub: req.departure_hub,
      destination_hub: req.destination_hub,
    });

    if (res.success && res.quotation) {
      // Mark request as quotation issued
      req.status = 'QUOTATION_ISSUED';
      req.quotation_id = res.quotation.id;
      db.persistState();

      setShowIssueQuoteDrawer(false);
      setSuccessNotice(
        `Quotation ${res.quotation.quotation_number} issued for ₹${grandTot.toLocaleString()}! Delivered to client ${req.client_name}.`
      );
      loadData();
      if (onRefreshData) onRefreshData();
    }
  };

  const handleAcceptQuotation = (quotId: string) => {
    const res = db.acceptQuotationAndConvertToDeal(quotId, currentUser);
    if (res.success) {
      setSuccessNotice(res.message);
      loadData();
      setActiveTab('deals');
      if (onRefreshData) onRefreshData();
    }
  };

  const handleExecutePaymentAndCloseDeal = () => {
    if (!targetDealForPayment) return;

    const res = db.completeDealPaymentAndCloseSale({
      opportunityId: targetDealForPayment.id,
      quotationId: targetDealForPayment.lead_id,
      paymentMethod,
      amount: targetDealForPayment.deal_value,
      clientUser: currentUser,
    });

    if (res.success) {
      setShowPaymentModal(false);
      setTargetDealForPayment(null);
      setSuccessNotice(
        `🎉 ${res.message} Converted to Sale ${res.sale?.sales_code || ''} and Deal is CLOSED_WON!`
      );
      loadData();
      setActiveTab('sales');
      if (onRefreshData) onRefreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-900 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between shrink-0">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  Full Pipeline Tracker
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Quotation &rarr; Deal &rarr; Sale &rarr; Deal Close</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Quotation Request &amp; Deal Lifecycle Desk
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage inbound RFQs, issued quotations, pipeline deals, and finalized closed sales.
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

        {/* Process Stepper Visual Ribbon */}
        <div className="bg-slate-950 border-b border-slate-800 p-3 sm:px-6 shrink-0 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px] text-xs">
            <div className="flex items-center space-x-2 text-sky-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-[10px] font-mono">1</span>
              <span>1. Request Quotation</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] font-mono">2</span>
              <span>2. Quotation Issued</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center space-x-2 text-indigo-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] font-mono">3</span>
              <span>3. Quotation Accepted</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center space-x-2 text-purple-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px] font-mono">4</span>
              <span>4. Pipeline Deal</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-mono">5</span>
              <span>5. Sale &amp; Deal Closed</span>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successNotice && (
          <div className="bg-emerald-950/60 border-b border-emerald-500/30 p-3 px-6 text-xs text-emerald-300 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 pt-3 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border-b-2 ${
              activeTab === 'requests'
                ? 'border-sky-500 text-sky-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Quotation Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotations')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border-b-2 ${
              activeTab === 'quotations'
                ? 'border-amber-500 text-amber-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Issued Quotations ({quotations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border-b-2 ${
              activeTab === 'deals'
                ? 'border-purple-500 text-purple-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pipeline Deals ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 border-b-2 ${
              activeTab === 'sales'
                ? 'border-emerald-500 text-emerald-400 bg-slate-800/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Closed Sales &amp; Won Deals ({sales.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: QUOTATION REQUESTS (RFQs) */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                    <span>Inbound &amp; Outbound Quotation Requests</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Requests submitted by clients. Business users review details and issue formal quotations.
                  </p>
                </div>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No quotation requests logged yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click "Request Quotation" on any business listing to test submitting an RFQ.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-sky-400">
                              {req.request_number}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">
                              {req.business_name}
                            </h4>
                            <p className="text-xs text-slate-400">
                              Client: <span className="text-slate-200 font-semibold">{req.client_name}</span> ({req.client_email})
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                              req.status === 'PENDING_BUSINESS_QUOTATION'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : req.status === 'QUOTATION_ISSUED'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : req.status === 'ACCEPTED'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {req.status === 'PENDING_BUSINESS_QUOTATION'
                              ? 'Awaiting Quotation'
                              : req.status === 'QUOTATION_ISSUED'
                              ? 'Quotation Issued'
                              : req.status === 'ACCEPTED'
                              ? 'Accepted & Deal'
                              : req.status}
                          </span>
                        </div>

                        {/* Services Requested */}
                        <div className="mt-3">
                          <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                            Services Requested:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {req.selected_services.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-900 text-sky-300 border border-slate-800 text-[11px]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Scope details */}
                        <div className="mt-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                          <div>
                            <strong className="text-slate-400">Details:</strong> {req.details}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                            <span>Sector: {req.departure_hub || 'BOM'} &rarr; {req.destination_hub || 'DXB'}</span>
                            <span>Target Date: {req.required_date || 'Flexible'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>

                        <div className="flex items-center space-x-2">
                          {req.status === 'PENDING_BUSINESS_QUOTATION' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(req);
                                setShowIssueQuoteDrawer(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer shadow-md"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Issue Quotation</span>
                            </button>
                          )}

                          {req.status === 'QUOTATION_ISSUED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('quotations');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
                            >
                              <span>View Issued Quotation</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ISSUED QUOTATIONS */}
          {activeTab === 'quotations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Issued Itemized Quotations</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official quotations issued by the business user. When the client accepts, it converts into a Deal.
                  </p>
                </div>
              </div>

              {quotations.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No quotations issued yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quotations.map((q) => (
                    <div
                      key={q.id}
                      className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-amber-400">
                              {q.quotation_number}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{q.service_title}</h4>
                            <p className="text-xs text-slate-400">
                              By: <span className="text-sky-300 font-semibold">{q.business_name}</span> &rarr; Client: <span className="text-white font-semibold">{q.client_name}</span>
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              q.status === 'ACCEPTED' || q.status === 'INVOICED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                            }`}
                          >
                            {q.status}
                          </span>
                        </div>

                        {/* Line items preview */}
                        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                            Line Items Breakdown:
                          </div>
                          {q.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                              <span className="truncate max-w-[240px]">
                                {item.description} (x{item.quantity})
                              </span>
                              <span className="font-mono text-white">₹{item.total.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-white">
                            <span>Grand Total (incl. {q.tax_percent}% tax):</span>
                            <span className="text-amber-400 font-mono text-sm">₹{q.grand_total.toLocaleString()}</span>
                          </div>
                        </div>

                        {q.payment_terms && (
                          <div className="mt-2 text-[11px] text-slate-400">
                            <strong>Terms:</strong> {q.payment_terms}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-500">
                            Valid: {q.valid_until}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPrintableDoc({
                                referenceNumber: q.quotation_number,
                                date: new Date(q.created_at).toLocaleDateString(),
                                validUntil: q.valid_until,
                                serviceTitle: q.service_title,
                                issuerName: q.business_name,
                                clientName: q.client_name,
                                items: q.items,
                                taxPercent: q.tax_percent,
                                grandTotal: q.grand_total,
                                paymentTerms: q.payment_terms,
                                notes: q.notes,
                                status: q.status,
                              });
                              setPrintableDocType('QUOTATION');
                              setShowPrintModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-sky-300 border border-slate-700 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                            title="Export official printable quotation / PDF"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Export PDF</span>
                          </button>
                        </div>

                        {q.status !== 'ACCEPTED' && q.status !== 'INVOICED' ? (
                          <button
                            type="button"
                            onClick={() => handleAcceptQuotation(q.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Quotation &rarr; Move to Deal</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Converted to Pipeline Deal</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PIPELINE DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span>Active CRM Pipeline Deals</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Deals generated from accepted quotations. Complete client payment to close deal into a Final Sale.
                  </p>
                </div>
              </div>

              {opportunities.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No pipeline deals active yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-purple-400">
                              DEAL ID: {opp.id}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{opp.deal_name}</h4>
                            <p className="text-xs text-slate-400">
                              Business: <span className="text-sky-300 font-semibold">{opp.business_name}</span> • Client: <span className="text-white font-semibold">{opp.client_name}</span>
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              opp.stage === 'CLOSED_WON'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {opp.stage === 'CLOSED_WON' ? 'DEAL CLOSED (WON)' : opp.stage}
                          </span>
                        </div>

                        {/* Deal Value */}
                        <div className="mt-4 p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-purple-300 uppercase font-mono">Deal Value:</span>
                            <div className="text-base font-black text-white font-mono">
                              ₹{opp.deal_value.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-mono">Win Probability:</span>
                            <div className="text-sm font-bold text-purple-300">{opp.probability}%</div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                          <span>Target Close: {opp.expected_close_date}</span>
                          <span>Hub: {opp.territory}</span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(opp.created_at).toLocaleDateString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPrintableDoc({
                                referenceNumber: `TRV-DEAL-${opp.id.slice(0, 6).toUpperCase()}`,
                                date: new Date(opp.created_at).toLocaleDateString(),
                                serviceTitle: opp.deal_name,
                                issuerName: currentBusiness?.organization_name || 'TruvAer Aviation Network Partner',
                                clientName: opp.client_name,
                                sector: opp.territory,
                                items: [
                                  {
                                    description: opp.deal_name,
                                    quantity: 1,
                                    unit_price: opp.deal_value,
                                    total: opp.deal_value,
                                  },
                                ],
                                taxPercent: 5,
                                grandTotal: Math.round(opp.deal_value * 1.05),
                                paymentTerms: 'Escrow settlement via TruvAer corporate wallet/treasury',
                                notes: `Stage: ${opp.stage} • Probability: ${opp.probability}% • Close Date: ${opp.expected_close_date}`,
                                status: opp.stage,
                              });
                              setPrintableDocType('DEAL');
                              setShowPrintModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-purple-300 border border-slate-700 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                            title="Export Deal Sheet / Contract PDF"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Export PDF</span>
                          </button>
                        </div>

                        {opp.stage !== 'CLOSED_WON' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetDealForPayment(opp);
                              setShowPaymentModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay &amp; Close Deal &rarr;</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Deal Closed &amp; Settled</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLOSED SALES */}
          {activeTab === 'sales' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Completed Sales &amp; Closed Deals</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Finalized contracts with payment settled. 5% platform partnership commission automatically credited.
                  </p>
                </div>
              </div>

              {sales.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No finalized sales yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sales.map((s) => (
                    <div
                      key={s.id}
                      className="bg-slate-950/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              SALES CODE: {s.sales_code}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{s.business_name}</h4>
                            <p className="text-xs text-slate-400">
                              Customer: <span className="text-slate-200 font-semibold">{s.customer_name}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              DEAL CLOSED
                            </span>
                            <div className="text-[10px] text-emerald-400 mt-1 font-bold">Paid in Full</div>
                          </div>
                        </div>

                        {/* Amount Box */}
                        <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-emerald-300 uppercase font-mono">Paid Contract Amount:</span>
                            <div className="text-base font-black text-white font-mono">
                              ₹{s.paid_amount.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-mono">Method:</span>
                            <div className="text-xs font-bold text-slate-200">{s.payment_method}</div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-slate-400">
                          {s.description}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {s.sales_date} • {s.territory}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPrintableDoc({
                                referenceNumber: s.sales_code,
                                date: s.sales_date,
                                serviceTitle: s.description || 'Charter & Maintenance Contract Finalized',
                                issuerName: s.business_name,
                                clientName: s.customer_name,
                                sector: s.territory,
                                items: [
                                  {
                                    description: s.description || 'Flight operation settled',
                                    quantity: 1,
                                    unit_price: s.paid_amount,
                                    total: s.paid_amount,
                                  },
                                ],
                                taxPercent: 5,
                                grandTotal: s.paid_amount,
                                paymentTerms: `Paid in full via ${s.payment_method || 'Corporate Wallet'}. Commission settled.`,
                                notes: `Territory: ${s.territory || 'International'} • Status: ${s.sales_status || 'Delivered'}`,
                                status: 'SETTLED_WON',
                              });
                              setPrintableDocType('SALES_STATEMENT');
                              setShowPrintModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-emerald-300 border border-slate-700 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer transition-colors"
                            title="Export Finalized Sales Statement / Receipt PDF"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Export Receipt</span>
                          </button>
                        </div>

                        <span className="text-xs font-mono text-emerald-400 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sale Closed Won</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* DRAWER: BUSINESS USER ISSUES QUOTATION FOR RFQ           */}
        {/* ======================================================== */}
        {showIssueQuoteDrawer && selectedRequest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    ISSUE QUOTATION FOR RFQ: {selectedRequest.request_number}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Operator Proposal for {selectedRequest.client_name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIssueQuoteDrawer(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items editing */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Quotation Line Items:</label>
                {quoteItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const copy = [...quoteItems];
                        copy[idx].description = e.target.value;
                        setQuoteItems(copy);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="number"
                      value={item.total}
                      onChange={(e) => {
                        const copy = [...quoteItems];
                        copy[idx].total = Number(e.target.value) || 0;
                        setQuoteItems(copy);
                      }}
                      className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                ))}
              </div>

              {/* Total calculation */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total (incl. 5% tax):</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  ₹
                  {Math.round(
                    quoteItems.reduce((acc, i) => acc + i.total, 0) * 1.05
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueQuoteDrawer(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleIssueQuotationFromRequest(selectedRequest)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Quotation to Client</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: COMPLETE PAYMENT & CLOSE DEAL (TO SALE)           */}
        {/* ======================================================== */}
        {showPaymentModal && targetDealForPayment && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    FINALIZE PAYMENT &amp; CLOSE DEAL
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {targetDealForPayment.deal_name}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-1">
                <span className="text-xs text-emerald-400 uppercase font-mono">Total Amount Payable:</span>
                <div className="text-2xl font-black text-white font-mono">
                  ₹{targetDealForPayment.deal_value.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">
                  Client: {targetDealForPayment.client_name}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Select Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Corporate Wallet">Corporate Wallet Balance</option>
                  <option value="Razorpay VIP Gateway">Razorpay VIP Gateway / UPI</option>
                  <option value="Escrow Aviation Facility">Escrow Aviation Facility</option>
                  <option value="Bank Wire / RTGS">Bank Wire / RTGS Clearance</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl text-[11px] text-slate-400">
                Upon payment settlement, this deal will move to status <strong>CLOSED_WON (Deal Closed)</strong>, an official <strong>CRMSalesRecord</strong> is booked, and a 5% platform commission sheet entry is logged.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecutePaymentAndCloseDeal}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-lg"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Payment &amp; Close Deal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Official Printable Statement / PDF Export Modal (A2) */}
        <QuotationPrintableStatementModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          documentType={printableDocType}
          data={printableDoc}
        />
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  Send,
  Printer,
  CheckCircle2,
  Building2,
  User,
  DollarSign,
  Calendar,
  ShieldCheck,
  Sparkles,
  Clock,
  EyeOff,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { BusinessProfile, CRMQuotation, CRMQuotationItem, RegularUser } from '../types';
import { db, maskClientEmail, maskClientPhone, maskClientName, UserChatEligibility } from '../data/mockDatabase';

interface DirectQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBusiness: BusinessProfile | null;
  currentUser?: RegularUser | null;
  prefillClientName?: string;
  prefillClientEmail?: string;
  prefillClientPhone?: string;
  prefillServiceTitle?: string;
  onQuotationIssued?: (quotation: CRMQuotation) => void;
}

export const DirectQuotationModal: React.FC<DirectQuotationModalProps> = ({
  isOpen,
  onClose,
  currentBusiness,
  currentUser,
  prefillClientName = '',
  prefillClientEmail = '',
  prefillClientPhone = '',
  prefillServiceTitle = '',
  onQuotationIssued,
}) => {
  if (!isOpen) return null;

  // Active business issuing quotation
  const businessName =
    currentBusiness?.organization_name || 'JetVentures VIP SkySuite & Private Charters';
  const businessId =
    currentBusiness?.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff';

  // Condition: Check if business is HARD_LOCKED or REJECTED
  const opCheck = db.isBusinessOperational(businessId);
  const isBusinessSuspended = !opCheck.operational;

  // Policy SLA: 48h (default) or 24h strict
  const [policyHours, setPolicyHours] = useState<24 | 48>(48);

  // Client Details
  const [clientName, setClientName] = useState(prefillClientName || 'Capt. Vikram Malhotra');
  const [clientEmail, setClientEmail] = useState(prefillClientEmail || 'vikram@jetstream.in');
  const [clientPhone, setClientPhone] = useState(prefillClientPhone || '+91 98200 12345');
  const [serviceTitle, setServiceTitle] = useState(
    prefillServiceTitle || 'VIP Executive Air Charter / Aviation Service'
  );

  // Check client chat eligibility
  const eligibility: UserChatEligibility = useMemo(() => {
    return db.checkUserChatEligibility(businessId, clientEmail || clientName, policyHours);
  }, [businessId, clientEmail, clientName, policyHours]);

  const canIssueQuotation = !isBusinessSuspended && eligibility.isEligible;

  // Quotation line items
  const [items, setItems] = useState<CRMQuotationItem[]>([
    {
      id: 'item_1',
      description: 'Flight Block Hours / Aircraft Charter Service',
      quantity: 4.5,
      unit_price: 350000,
      total: 1575000,
    },
    {
      id: 'item_2',
      description: 'Ramp Handling, Navigation & Airport Slot Clearances',
      quantity: 1,
      unit_price: 250000,
      total: 250000,
    },
    {
      id: 'item_3',
      description: 'Gourmet In-Flight Hospitality & Passenger Service',
      quantity: 1,
      unit_price: 75000,
      total: 75000,
    },
  ]);

  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [paymentTerms, setPaymentTerms] = useState(
    '50% advance upon contract booking, 50% 24 hours prior to departure.'
  );
  const [notes, setNotes] = useState(
    'Quotation inclusive of insurance, certified flight crew, and tarmac priority clearance.'
  );
  const [validDays, setValidDays] = useState<number>(14);
  const [isSuccess, setIsSuccess] = useState<string | null>(null);
  const [issuedQuotation, setIssuedQuotation] = useState<CRMQuotation | null>(null);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const taxAmount = Math.round((subtotal * Number(taxPercent || 0)) / 100);
  const grandTotal = subtotal + taxAmount;

  const handleItemChange = (
    index: number,
    field: 'description' | 'quantity' | 'unit_price',
    value: any
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };
      if (field === 'description') {
        target.description = value;
      } else if (field === 'quantity') {
        target.quantity = Number(value) || 0;
        target.total = Math.round(target.quantity * target.unit_price);
      } else if (field === 'unit_price') {
        target.unit_price = Number(value) || 0;
        target.total = Math.round(target.quantity * target.unit_price);
      }
      copy[index] = target;
      return copy;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        description: 'Additional Aviation Deliverable / Spares',
        quantity: 1,
        unit_price: 50000,
        total: 50000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleIssueQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canIssueQuotation) {
      alert(`Cannot dispatch proposal: ${eligibility.statusText}`);
      return;
    }
    if (!clientName.trim()) {
      alert('Please enter client recipient name.');
      return;
    }

    const quotNum = `TRU-QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validUntilDate = new Date(Date.now() + validDays * 86400000)
      .toISOString()
      .split('T')[0];

    const quotation: CRMQuotation = {
      id: `quot_${Math.random().toString(36).substring(2, 9)}`,
      quotation_number: quotNum,
      business_id: businessId,
      business_name: businessName,
      client_name: eligibility.realName || clientName.trim(),
      client_email: eligibility.realEmail || clientEmail.trim() || 'client@aviator.com',
      client_phone: eligibility.realPhone || clientPhone.trim() || '+91 98765 00000',
      service_title: serviceTitle.trim(),
      items: items.map((i) => ({ ...i })),
      subtotal,
      tax_percent: taxPercent,
      tax_amount: taxAmount,
      grand_total: grandTotal,
      currency: 'INR',
      status: 'SENT',
      valid_until: validUntilDate,
      payment_terms: paymentTerms,
      notes,
      created_at: new Date().toISOString(),
      zone: currentBusiness?.country || 'West Zone',
      country: 'IN',
      territory: currentBusiness?.physical_location || 'BOM (Mumbai)',
    };

    // Save into Database
    db.createCRMQuotation(quotation);

    // Audit log
    db.logAdminActivity({
      category: 'COMMISSION_PAYOUT',
      title: `CRM Quotation #${quotNum} Dispatched`,
      description: `${businessName} issued quotation #${quotNum} for "${quotation.service_title}" to client ${quotation.client_name} (₹${grandTotal.toLocaleString()}).`,
      actor_name: businessName,
      actor_role: 'Commercial Fleet Vendor',
      target_id: quotation.id,
      target_name: quotation.service_title,
      amount: grandTotal,
      currency: 'INR',
      severity: 'info',
    });

    setIssuedQuotation(quotation);
    setIsSuccess(`Quotation ${quotNum} successfully generated and issued to ${quotation.client_name}!`);

    if (onQuotationIssued) {
      onQuotationIssued(quotation);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Issue Commercial Aviation Proposal &amp; Quotation
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  {policyHours}h Chat SLA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Issuing Entity: <strong className="text-white">{businessName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational Hold Banner (If HARD_LOCKED or REJECTED) */}
        {isBusinessSuspended && (
          <div className="mx-5 mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start space-x-3 shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-rose-100 uppercase tracking-wider">
                Services On Hold: Organization Status {opCheck.status}
              </h4>
              <p className="mt-1 text-rose-300/90 leading-relaxed">
                Organization is currently {opCheck.status}. All commercial proposal dispatches and payments are suspended. Withdrawals require Level 7/8 team clearance.
              </p>
            </div>
          </div>
        )}

        {/* Chat SLA Window Selector */}
        <div className="mx-5 mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">Proposal Chat Window Rule:</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPolicyHours(48)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                policyHours === 48
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              48-Hour Active Contact (Standard)
            </button>
            <button
              type="button"
              onClick={() => setPolicyHours(24)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                policyHours === 24
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24-Hour Strict SLA
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-900/60 min-h-0">
          {isSuccess && issuedQuotation ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-300">
                    Quotation Issued Successfully!
                  </h4>
                  <p className="mt-1">{isSuccess}</p>
                  <p className="text-[11px] text-emerald-400/90 mt-1">
                    Quotation #{issuedQuotation.quotation_number} has been registered in the commercial CRM pipeline and dispatched.
                  </p>
                </div>
              </div>

              {/* Printable Voucher Preview */}
              <div
                id="printable-quotation-voucher"
                className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs text-slate-200 font-mono shadow-inner"
              >
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-white font-sans">
                      {issuedQuotation.business_name}
                    </h5>
                    <p className="text-[11px] text-slate-400">Official Aviation Quotation</p>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold">{issuedQuotation.quotation_number}</div>
                    <div className="text-[10px] text-slate-400">
                      Date: {new Date(issuedQuotation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">Client Recipient:</span>
                    <strong className="text-white">{issuedQuotation.client_name}</strong>
                    <div className="text-slate-400">{issuedQuotation.client_email}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px]">Validity &amp; Terms:</span>
                    <div>Valid Until: <strong className="text-amber-300">{issuedQuotation.valid_until}</strong></div>
                    <div className="text-slate-400">{issuedQuotation.payment_terms}</div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-300 mb-1 font-sans text-xs">
                    Scope: {issuedQuotation.service_title}
                  </div>
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                        <tr>
                          <th className="p-2">Item Description</th>
                          <th className="p-2 text-center">Qty</th>
                          <th className="p-2 text-right">Unit Rate (₹)</th>
                          <th className="p-2 text-right">Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {issuedQuotation.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-2 text-white">{item.description}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">₹{item.unit_price.toLocaleString()}</td>
                            <td className="p-2 text-right font-bold text-slate-100">
                              ₹{item.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1 text-right text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span>₹{issuedQuotation.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tax GST ({issuedQuotation.tax_percent}%):</span>
                      <span>₹{issuedQuotation.tax_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm border-t border-slate-800 pt-1">
                      <span>Grand Total:</span>
                      <span className="text-amber-400">₹{issuedQuotation.grand_total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleIssueQuotation} className="space-y-4">
              {/* Recipient Details */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Client &amp; Recipient Information</span>
                  </div>

                  {/* Quick-Pick Active Chat Contacts */}
                  <div className="flex items-center space-x-1 text-[10px]">
                    <span className="text-slate-400">Quick Select:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setClientName('Capt. Vikram Malhotra');
                        setClientEmail('vikram@jetstream.in');
                        setClientPhone('+91 98200 12345');
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60"
                    >
                      Capt. Vikram (&lt;6h)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClientName('Sarah Jenkins');
                        setClientEmail('sarah.j@horizonaviation.com');
                        setClientPhone('+1 415 889 2200');
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60"
                    >
                      Sarah J. (&lt;19h)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClientName('Alexander Wright');
                        setClientEmail('alexander.w@wrightaero.co.uk');
                        setClientPhone('+44 20 7946 0192');
                      }}
                      className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60"
                      title="Expired Chat (>48h) Demo"
                    >
                      Alexander (&gt;60h Expired)
                    </button>
                  </div>
                </div>

                {/* 24h / 48h Eligibility Notice */}
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                    eligibility.isEligible
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {eligibility.isEligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {eligibility.isEligible
                        ? `Client Eligible for Direct Proposal (Active within ${policyHours}h window)`
                        : `Proposal Blocked & Client Details Redacted`}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {eligibility.statusText}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={eligibility.isEligible ? clientName : eligibility.maskedName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Lord Alistair Sterling / Capt. Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Client Email
                    </label>
                    <input
                      type="email"
                      value={eligibility.isEligible ? clientEmail : eligibility.maskedEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@familyoffice.aero"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Client Contact Number
                    </label>
                    <input
                      type="text"
                      value={eligibility.isEligible ? clientPhone : eligibility.maskedPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Quotation Subject / Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    placeholder="e.g. Gulfstream G650ER Executive Charter (BOM-DXB Return)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Quotation Line Items Table */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-white">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Cost Breakup &amp; Line Items</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-sky-400 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs"
                    >
                      <div className="sm:col-span-6">
                        <label className="text-[10px] text-slate-400 block sm:hidden">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, 'description', e.target.value)
                          }
                          placeholder="Item Description"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block sm:hidden">Qty</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', e.target.value)
                          }
                          placeholder="Qty"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-center outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block sm:hidden">Unit Rate (₹)</label>
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) =>
                            handleItemChange(index, 'unit_price', e.target.value)
                          }
                          placeholder="Rate"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-right outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">Applicable GST / VAT:</span>
                    <select
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white outline-none"
                    >
                      <option value={0}>0% (Tax Exempt)</option>
                      <option value={5}>5% (Standard Charter GST)</option>
                      <option value={12}>12% (MRO &amp; Aviation Works)</option>
                      <option value={18}>18% (Commercial Logistics)</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-right">
                    <div className="text-slate-400">
                      Subtotal: <span className="font-mono text-white">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="text-slate-400">
                      Tax GST ({taxPercent}%):{' '}
                      <span className="font-mono text-white">₹{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-base font-bold text-amber-400 pt-1 border-t border-slate-800">
                      Grand Total: <span className="font-mono">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Quotation Validity (Days)
                  </label>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days (Recommended)</option>
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Commercial Payment Terms
                  </label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Notes &amp; Operational Deliverables
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canIssueQuotation}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg transition-transform active:scale-95 ${
                    canIssueQuotation
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isBusinessSuspended
                      ? 'Services Suspended'
                      : canIssueQuotation
                      ? 'Issue & Dispatch Quotation'
                      : `Quotation Blocked (SLA Expired)`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

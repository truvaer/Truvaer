import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  Users,
  Sparkles,
  ArrowRight,
  Calculator,
  Percent,
  Lock,
  Eye,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminUser, BusinessProfile, RegularUser } from '../types';

interface CommissionPercentageEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: RegularUser | null;
  currentBusiness?: BusinessProfile | null;
  activeAdminUser?: AdminUser | null;
  isViewOnly?: boolean;
  onCommissionLogged?: () => void;
}

export const CommissionPercentageEntryModal: React.FC<CommissionPercentageEntryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentBusiness,
  activeAdminUser,
  isViewOnly = false,
  onCommissionLogged,
}) => {
  // If user is a business user without admin credentials, force view-only mode
  const effectiveViewOnly = isViewOnly || (Boolean(currentBusiness) && !Boolean(activeAdminUser));
  const isAdmin =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'MANAGER' ||
    Boolean(activeAdminUser);

  const loggedByRole = isAdmin ? 'Platform Administrator (L7/L8)' : 'Commercial Sales Team';
  const loggedByName =
    activeAdminUser?.name ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') ||
    currentUser?.username ||
    currentBusiness?.owner_name ||
    'Sales Officer';

  // Available businesses for dropdown
  const allBusinesses = db.getBusinesses();
  // Available quotations or leads to pick from
  const allLeads = db.getCRMLeads();
  const allQuotations = db.getCRMQuotations();

  // Form State
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [dealTitle, setDealTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [businessId, setBusinessId] = useState(
    currentBusiness?.business_id || allBusinesses[0]?.business_id || ''
  );
  const [saleAmount, setSaleAmount] = useState<number>(2500000);
  const [commissionRatePct, setCommissionRatePct] = useState<number>(5.0);
  const [dueDate, setDueDate] = useState<string>(() => {
    return new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // When a lead is selected from dropdown, prefill deal title, client, business, and amount
  useEffect(() => {
    if (!selectedLeadId) return;
    const lead = allLeads.find((l) => l.id === selectedLeadId);
    if (lead) {
      setDealTitle(lead.title);
      setClientName(lead.client_name);
      setBusinessId(lead.business_id);
      if (lead.budget && lead.budget > 0) {
        setSaleAmount(lead.budget);
      }
    }
  }, [selectedLeadId, allLeads]);

  // LIVE AUTOMATIC CALCULATION:
  // Final commission value = (saleAmount * commissionRatePct) / 100
  // Net remaining balance = saleAmount - final commission value
  const grossSale = Number(saleAmount) || 0;
  const commRate = Number(commissionRatePct) || 0;
  const calculatedCommissionValue = Math.round((grossSale * commRate) / 100);
  const determinedNetRemainingBalance = Math.max(0, grossSale - calculatedCommissionValue);

  const selectedBusiness = allBusinesses.find((b) => b.business_id === businessId);
  const businessName = selectedBusiness?.organization_name || currentBusiness?.organization_name || 'Aviation Partner';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a valid Sale / Deal title.' });
      return;
    }
    if (!clientName.trim()) {
      setFeedback({ type: 'error', message: 'Client name is required.' });
      return;
    }
    if (grossSale <= 0) {
      setFeedback({ type: 'error', message: 'Sale amount must be greater than zero.' });
      return;
    }
    if (commRate <= 0 || commRate > 50) {
      setFeedback({ type: 'error', message: 'Commission rate percentage must be between 0.1% and 50%.' });
      return;
    }

    setIsSubmitting(true);
    const res = db.logCommissionPercentageEntry({
      dealTitle: dealTitle.trim(),
      clientName: clientName.trim(),
      businessId,
      businessName,
      saleAmount: grossSale,
      commissionRatePct: commRate,
      currency,
      dueDate,
      notes: notes.trim() || undefined,
      loggedBy: loggedByName,
      loggedByRole,
    });

    setIsSubmitting(false);
    if (res.success) {
      setFeedback({
        type: 'success',
        message: res.message,
      });
      if (onCommissionLogged) onCommissionLogged();
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/40 p-5 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              {effectiveViewOnly ? <Eye className="w-5 h-5 text-sky-400" /> : <Calculator className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  {effectiveViewOnly ? 'Commission Structure & Details (View Only)' : 'Commission Percentage Entry Module'}
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    effectiveViewOnly
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {effectiveViewOnly ? 'VIEW ONLY • IMMUTABLE' : 'Instant Platform Transparency'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {effectiveViewOnly
                  ? 'Audit Ledger View: Commission rates and auto-calculated operator settlements are fixed by platform terms and cannot be modified.'
                  : `Logged by ${loggedByName} (${loggedByRole}). Auto-calculates commission & net proceeds, sharing instantly with Platform Admin accounting.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={effectiveViewOnly ? (e) => { e.preventDefault(); onClose(); } : handleSubmit} className="p-5 sm:p-6 space-y-5">
          {effectiveViewOnly && (
            <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 text-xs text-sky-200 flex items-start space-x-2.5 shadow-lg">
              <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">2-Factor Authentication &amp; Governance Lock:</strong>
                Commission basis and percentage rates are strictly view-only for Business Users to prevent unauthorized rate alterations. Even in Platform Administration, any revision to commission schedules requires 2-Step Authentication (2FA) verification.
              </div>
            </div>
          )}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border shadow-lg ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/70 text-emerald-200'
                  : 'bg-rose-950/90 border-rose-500/70 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* Quick Preload from Active Leads / Quotes */}
          {!effectiveViewOnly && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Quick Pre-Fill From Existing Deal / Closed Won Lead
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose from existing sales pipeline (or enter details manually below) --</option>
                {allLeads.map((ld) => (
                  <option key={ld.id} value={ld.id}>
                    {ld.title} • {ld.client_name} (₹{((ld.budget || 0) / 100000).toFixed(1)} Lakhs)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deal / Sale Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Sale / Charter Title {effectiveViewOnly ? '' : '*'}
              </label>
              <input
                type="text"
                value={dealTitle}
                disabled={effectiveViewOnly}
                onChange={(e) => setDealTitle(e.target.value)}
                placeholder="e.g. Falcon 2000EX Charter Flight BOM-DXB"
                className={`w-full border rounded-xl px-3 py-2 text-xs ${
                  effectiveViewOnly
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300 cursor-not-allowed'
                    : 'bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-amber-500'
                }`}
                required
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Client / Charterer Name {effectiveViewOnly ? '' : '*'}
              </label>
              <input
                type="text"
                value={clientName}
                disabled={effectiveViewOnly}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Lord Alistair Sterling / London Trust"
                className={`w-full border rounded-xl px-3 py-2 text-xs ${
                  effectiveViewOnly
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300 cursor-not-allowed'
                    : 'bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-amber-500'
                }`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Partner Business */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Aviation Partner / Operator {effectiveViewOnly ? '' : '*'}
              </label>
              {effectiveViewOnly ? (
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold cursor-not-allowed">
                  {businessName}
                </div>
              ) : (
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  {allBusinesses.map((b) => (
                    <option key={b.business_id} value={b.business_id}>
                      {b.organization_name} ({b.registration_number})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Gross Sale Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Gross Sale / Contract Value (₹) {effectiveViewOnly ? '' : '*'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={saleAmount}
                  disabled={effectiveViewOnly}
                  onChange={(e) => setSaleAmount(Number(e.target.value))}
                  className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold ${
                    effectiveViewOnly
                      ? 'bg-slate-900/60 border-slate-800 text-slate-200 cursor-not-allowed'
                      : 'bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-amber-500'
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Expected Commission Percentage Entry */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <Percent className="w-4 h-4" />
                <span>
                  {effectiveViewOnly ? 'Established Platform Commission Rate (%)' : 'Expected Commission Percentage (%) *'}
                </span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Rate: <strong className="text-amber-400">{commRate}%</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={commissionRatePct}
                  disabled={effectiveViewOnly}
                  onChange={(e) => setCommissionRatePct(Number(e.target.value))}
                  className={`w-full border rounded-xl px-3 py-2 text-sm font-mono font-black ${
                    effectiveViewOnly
                      ? 'bg-slate-900/60 border-slate-800 text-amber-300 cursor-not-allowed'
                      : 'bg-slate-900 border-amber-500/50 text-white focus:outline-none focus:ring-1 focus:ring-amber-500'
                  }`}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">%</span>
              </div>

              {/* Quick Select Presets - Hidden in View Only */}
              {!effectiveViewOnly && (
                <div className="flex items-center space-x-1.5 shrink-0">
                  {[5, 7.5, 10, 12, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCommissionRatePct(pct)}
                      className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer border ${
                        commRate === pct
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE DUAL CALCULATION CARDS: Final Commission Value & Net Remaining Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              {/* Calculated Commission Value */}
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-amber-300">
                  <span>Final Calculated Commission</span>
                  <span className="font-bold">{commRate}% Platform Fee</span>
                </div>
                <div className="text-lg font-black text-amber-400 font-mono mt-1">
                  ₹{calculatedCommissionValue.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Automated commission value to be logged
                </div>
              </div>

              {/* Determined Net Remaining Balance */}
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                  <span>Net Remaining Balance</span>
                  <span className="font-bold">Gross - Commission</span>
                </div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                  ₹{determinedNetRemainingBalance.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Net payout / settlement balance to operator
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Settlement Due Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Settlement Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                disabled={effectiveViewOnly}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-xs ${
                  effectiveViewOnly
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300 cursor-not-allowed'
                    : 'bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-amber-500'
                }`}
              />
            </div>

            {/* Contract Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Accounting Notes &amp; Charter Ref
              </label>
              <input
                type="text"
                value={notes}
                disabled={effectiveViewOnly}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Escrow verified, fast-track settlement on flight departure"
                className={`w-full border rounded-xl px-3 py-2 text-xs ${
                  effectiveViewOnly
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300 cursor-not-allowed'
                    : 'bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Transparency Disclaimer Notice */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-start space-x-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="text-white">Audit &amp; Compliance Transparency: </strong>
              {effectiveViewOnly
                ? 'All logged commission entries and auto-computed operator balances are cryptographically recorded in the platform ledger. Modification permissions are restricted to platform super-administrators with 2FA.'
                : 'Upon submitting, this entry will calculate the final commission value and net balance, immediately recording it in the platform accounting ledger and notifying the Platform Admin Team.'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            {effectiveViewOnly ? (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-2 cursor-pointer transition-colors"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Close Details</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-450 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl cursor-pointer transition-transform active:scale-95 flex items-center space-x-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Log Commission &amp; Sync with Admin</span>
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

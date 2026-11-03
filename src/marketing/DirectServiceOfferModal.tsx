import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  Sparkles,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Briefcase,
  Layers,
  MessageSquare,
  Lock,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { db, UserChatEligibility } from '../data/mockDatabase';
import { BusinessProfile, RegularUser, AdminUser, ServiceListing, DirectServiceOffer } from '../types';

interface DirectServiceOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBusiness?: BusinessProfile | null;
  currentUser?: RegularUser | null;
  activeAdminUser?: AdminUser | null;
  targetListing?: ServiceListing | null;
  preselectedCustomer?: { id: string; name: string; email: string } | null;
  onOfferSent?: () => void;
}

export const DirectServiceOfferModal: React.FC<DirectServiceOfferModalProps> = ({
  isOpen,
  onClose,
  currentBusiness,
  currentUser,
  activeAdminUser,
  targetListing,
  preselectedCustomer,
  onOfferSent,
}) => {
  const isBusiness = !!currentBusiness;
  const isAdmin =
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'MANAGER' ||
    !!activeAdminUser;

  // Active business operational check (Condition: HARD_LOCKED or REJECTED disables all services)
  const businessId = currentBusiness?.business_id || targetListing?.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff';
  const opCheck = currentBusiness
    ? db.isBusinessOperational(currentBusiness.business_id)
    : { operational: true, status: 'VERIFIED' as const };
  const isBusinessSuspended = !opCheck.operational;

  // Policy Window Toggle: 48h (default) or 24h strict SLA
  const [policyHours, setPolicyHours] = useState<24 | 48>(48);
  const [customerTabFilter, setCustomerTabFilter] = useState<'ALL' | 'ELIGIBLE' | 'EXPIRED'>('ALL');

  // Potential customers looking for services (from leads, inquiries, and registered users)
  const prospectiveCustomers = useMemo(() => {
    const list: Array<{ id: string; name: string; email: string; requirement?: string }> = [];
    const seen = new Set<string>();

    if (preselectedCustomer) {
      list.push(preselectedCustomer);
      seen.add(preselectedCustomer.id);
      seen.add(preselectedCustomer.email);
    }

    // Inquiries from CRM Leads
    const leads = db.getCRMLeads();
    leads.forEach((l) => {
      if (!seen.has(l.client_email)) {
        seen.add(l.client_email);
        list.push({
          id: l.id,
          name: l.client_name,
          email: l.client_email,
          requirement: l.requirement_details || l.title,
        });
      }
    });

    // Registered regular clients
    const regularUsers = db.getRegularUsers();
    regularUsers.forEach((u) => {
      if (!seen.has(u.email) && u.role === 'STANDARD_USER') {
        seen.add(u.email);
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || `@${u.username}`;
        list.push({
          id: u.user_id,
          name: fullName,
          email: u.email,
          requirement: 'Registered Aviator seeking charter & flight services',
        });
      }
    });

    return list;
  }, [preselectedCustomer]);

  // Compute 24h / 48h Chat Eligibility for each prospective customer
  const customerEligibilityMap = useMemo(() => {
    const map = new Map<string, UserChatEligibility>();
    prospectiveCustomers.forEach((c) => {
      const el = db.checkUserChatEligibility(businessId, c.id || c.email, policyHours);
      map.set(c.id, el);
    });
    return map;
  }, [prospectiveCustomers, businessId, policyHours]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    if (customerTabFilter === 'ELIGIBLE') {
      return prospectiveCustomers.filter((c) => customerEligibilityMap.get(c.id)?.isEligible);
    }
    if (customerTabFilter === 'EXPIRED') {
      return prospectiveCustomers.filter((c) => !customerEligibilityMap.get(c.id)?.isEligible);
    }
    return prospectiveCustomers;
  }, [prospectiveCustomers, customerEligibilityMap, customerTabFilter]);

  // Available services offered by the business or listing
  const availableServices = useMemo(() => {
    if (targetListing && targetListing.services && targetListing.services.length > 0) {
      return targetListing.services;
    }
    const listings = db.getServiceListings();
    if (currentBusiness) {
      const bizListings = listings.filter((s) => s.business_id === currentBusiness.business_id);
      const sSet = new Set<string>();
      bizListings.forEach((bl) => bl.services?.forEach((srv) => sSet.add(srv)));
      if (sSet.size > 0) return Array.from(sSet);
    }
    // Fallback platform services
    return [
      'VIP Executive Charter',
      'Empty Leg Flight Booking',
      'Helicopter Helipad Transfers',
      'Airside Ramp Ground Handling',
      'Aircraft Fueling Bay',
      'Commercial Pilot License (CPL)',
      'CFM56 Heavy Engine Overhaul',
      '5-Star Aviator Hotel Suites',
    ];
  }, [targetListing, currentBusiness]);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    if (preselectedCustomer) return preselectedCustomer.id;
    // Prefer an eligible customer if available
    const firstEligible = prospectiveCustomers.find((c) => {
      const el = db.checkUserChatEligibility(businessId, c.id || c.email, 48);
      return el.isEligible;
    });
    return firstEligible?.id || prospectiveCustomers[0]?.id || '';
  });

  const [selectedService, setSelectedService] = useState<string>(availableServices[0] || 'VIP Executive Charter');
  const [offeredPrice, setOfferedPrice] = useState<string>('₹12,50,000 / Sector');
  const [currency, setCurrency] = useState<string>('INR');
  const [timeline, setTimeline] = useState<string>('Within 24 Hours');
  const [pitchMessage, setPitchMessage] = useState<string>(
    'We are delighted to offer our verified aviation service tailored specifically for your flight and operational schedule. Premium ground handling, crew dispatch, and direct ramp access included.'
  );

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const currentCustomer =
    prospectiveCustomers.find((c) => c.id === selectedCustomerId) || prospectiveCustomers[0];

  const currentEligibility = currentCustomer
    ? customerEligibilityMap.get(currentCustomer.id) ||
      db.checkUserChatEligibility(businessId, currentCustomer.id || currentCustomer.email, policyHours)
    : null;

  const canSendProposal = !isBusinessSuspended && (isAdmin || (currentEligibility && currentEligibility.isEligible));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) {
      setFeedback({ type: 'error', message: 'Please select a customer to send this service proposal.' });
      return;
    }
    if (isBusinessSuspended) {
      setFeedback({
        type: 'error',
        message: `ORGANIZATION SUSPENDED: Business verification status is ${opCheck.status}. All commercial proposal dispatches are put on hold.`,
      });
      return;
    }
    if (!canSendProposal && !isAdmin) {
      setFeedback({
        type: 'error',
        message: `COMPLIANCE VIOLATION: Proposal cannot be sent. ${currentEligibility?.statusText || 'Chat window expired.'}`,
      });
      return;
    }
    if (!selectedService.trim()) {
      setFeedback({ type: 'error', message: 'Please select or specify a service.' });
      return;
    }

    setSubmitting(true);

    const senderRole = isBusiness ? 'BUSINESS_USER' : 'ADMIN';
    const bizId = currentBusiness?.business_id || targetListing?.business_id || 'admin_platform';
    const bizName = currentBusiness?.organization_name || targetListing?.name || 'Truvaer Aviation Operations';
    const senderName =
      currentBusiness?.owner_name || currentUser?.first_name || activeAdminUser?.name || 'Commercial Fleet Director';

    const res = db.sendDirectServiceOffer({
      business_id: bizId,
      business_name: bizName,
      sender_name: senderName,
      sender_role: senderRole,
      customer_id: currentCustomer.id,
      customer_name: currentEligibility?.realName || currentCustomer.name,
      customer_email: currentEligibility?.realEmail || currentCustomer.email,
      service_name: selectedService,
      category: targetListing?.category || currentBusiness?.nature_of_business || 'Private Air Charter',
      pitch_message: pitchMessage.trim(),
      offered_price: offeredPrice.trim(),
      currency,
      timeline,
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      if (onOfferSent) onOfferSent();
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1800);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto font-sans"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/15 border border-[#60A5FA]/30 flex items-center justify-center text-[#60A5FA] shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#F0F9FF] flex items-center space-x-2">
                <span>Send Direct Service Proposal</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#C8B8D8]/20 text-[#C8B8D8] border border-[#C8B8D8]/40">
                  {policyHours}h SLA Rule
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Condition: Business users can send proposals ONLY for ACTIVE users who reached the business on chat within {policyHours} hours.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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
                All Services &amp; Proposals On Hold: Status {opCheck.status}
              </h4>
              <p className="mt-1 text-rose-300/90 leading-relaxed">
                Your organization registration is currently on <span className="font-mono font-bold">{opCheck.status}</span>. Per platform compliance policy, all commercial services, public proposals, and wallet withdrawals are temporarily frozen. Contact Yarifly Platform Administration.
              </p>
            </div>
          </div>
        )}

        {/* SLA Policy Window Toggle & Explanatory Banner */}
        <div className="mx-5 mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">Proposal Contact Policy Window:</span>
            <span className="text-slate-400 font-mono">Chat SLA:</span>
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
              48-Hour Active Rule (Standard)
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

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs flex-1 overflow-y-auto min-h-0">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Customer Selection with 48h Eligibility Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-bold flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Select Target Customer (Inquiring Aviator) *</span>
              </label>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCustomerTabFilter('ALL')}
                  className={`px-2 py-0.5 rounded-md font-mono ${
                    customerTabFilter === 'ALL'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({prospectiveCustomers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerTabFilter('ELIGIBLE')}
                  className={`px-2 py-0.5 rounded-md font-mono ${
                    customerTabFilter === 'ELIGIBLE'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-emerald-400 hover:text-white'
                  }`}
                >
                  Active &lt;{policyHours}h
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerTabFilter('EXPIRED')}
                  className={`px-2 py-0.5 rounded-md font-mono ${
                    customerTabFilter === 'EXPIRED'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-800 text-rose-400 hover:text-white'
                  }`}
                >
                  Expired / Locked
                </button>
              </div>
            </div>

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium cursor-pointer"
            >
              {filteredCustomers.map((c) => {
                const el = customerEligibilityMap.get(c.id);
                const isEligible = el?.isEligible;
                const statusTag = isEligible
                  ? `🟢 [ACTIVE CHAT - ${Math.floor(el?.remainingHours || 0)}h left]`
                  : el?.hasChatted
                  ? `🔴 [EXPIRED >${policyHours}h - LOCKED]`
                  : `🔒 [NO CHAT - LOCKED]`;

                return (
                  <option key={c.id} value={c.id}>
                    {statusTag} {isEligible ? c.name : el?.maskedName || 'Protected Client'} — {c.requirement || 'Service inquiry'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Customer Eligibility & PII Protection Status Card */}
          {currentEligibility && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                currentEligibility.isEligible
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-inherit">
                <div className="flex items-center space-x-2">
                  {currentEligibility.isEligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {currentEligibility.isEligible
                      ? `Proposal Transmission Allowed (Within ${policyHours}h SLA)`
                      : `Proposal Transmission Blocked & Client Details Sealed`}
                  </span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/40 border border-inherit">
                  {currentEligibility.isEligible
                    ? `${Math.floor(currentEligibility.remainingHours)}h ${currentEligibility.remainingMinutes}m remaining`
                    : `Window Expired`}
                </span>
              </div>

              {/* Status explanation */}
              <p className="text-[11px] leading-relaxed text-slate-300">
                {currentEligibility.statusText}
              </p>

              {/* Client Details Display (Fully revealed if active <48h, Redacted/Masked if expired >48h) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Client Identity:</div>
                  <div className="font-bold text-white">
                    {currentEligibility.isEligible ? currentEligibility.realName : currentEligibility.maskedName}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Client Email:</div>
                  <div className="font-bold text-sky-300">
                    {currentEligibility.isEligible ? currentEligibility.realEmail : currentEligibility.maskedEmail}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Direct Phone:</div>
                  <div className="font-bold text-slate-300">
                    {currentEligibility.isEligible ? currentEligibility.realPhone : currentEligibility.maskedPhone}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Latest Chat Inquiry:</div>
                  <div className="truncate text-slate-300" title={currentEligibility.lastChatMessage || 'No chat record'}>
                    {currentEligibility.lastChatMessage ? `"${currentEligibility.lastChatMessage}"` : 'None'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Select Service Offered */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Service Offered *</span>
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold cursor-pointer"
            >
              {availableServices.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offered Rate / Price *</span>
              </label>
              <input
                type="text"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                placeholder="e.g. ₹12,50,000 / Sector"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Availability / Timeline</span>
              </label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. Immediate / Within 24 Hours"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Pitch Message */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Proposal Message &amp; Scope Overview</span>
            </label>
            <textarea
              rows={3}
              value={pitchMessage}
              onChange={(e) => setPitchMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="State what deliverables, catering, crew credentials, and slot clearances are included..."
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Anti-Circumvention Rule: Proposals restricted strictly to active chat clients &lt;{policyHours}h</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs cursor-pointer"
            >
              Cancel &amp; Exit
            </button>

            <button
              type="button"
              disabled={!canSendProposal || submitting}
              onClick={handleSubmit}
              className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition-all ${
                canSendProposal && !submitting
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white cursor-pointer active:scale-95 shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitting
                  ? 'Transmitting...'
                  : isBusinessSuspended
                  ? 'Services On Hold (Suspended)'
                  : canSendProposal
                  ? 'Send Service Proposal'
                  : `Proposal Blocked (SLA Expired)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

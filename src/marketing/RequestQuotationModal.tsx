import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  Calendar,
  DollarSign,
  Send,
  Plus,
  ShieldCheck,
  Plane,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ServiceListing, RegularUser, QuotationRequest } from '../types';
import { db } from '../data/mockDatabase';

interface RequestQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetListing: ServiceListing | null;
  currentUser?: RegularUser | null;
  onRequestSubmitted?: (req: QuotationRequest) => void;
  onOpenLifecycleModal?: () => void;
}

export const RequestQuotationModal: React.FC<RequestQuotationModalProps> = ({
  isOpen,
  onClose,
  targetListing,
  currentUser,
  onRequestSubmitted,
  onOpenLifecycleModal,
}) => {
  if (!isOpen || !targetListing) return null;

  // Initial available services from listing or defaults
  const availableServices =
    targetListing.services && targetListing.services.length > 0
      ? targetListing.services
      : [
          'VIP Executive Air Charter',
          'Airport Ramp & Ground Handling',
          'Aviation Maintenance & Line Checks',
          'In-Flight Gourmet Catering',
          'Helicopter Tarmac Transfer',
          'Aircraft Hangar Storage',
        ];

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [customServicesList, setCustomServicesList] = useState<string[]>([]);

  // Request Details Form State
  const [details, setDetails] = useState('');
  const [targetBudget, setTargetBudget] = useState<string>('');
  const [currency, setCurrency] = useState('INR');
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [departureHub, setDepartureHub] = useState(targetListing.city || 'BOM (Mumbai)');
  const [destinationHub, setDestinationHub] = useState('DXB (Dubai)');
  const [capacityScope, setCapacityScope] = useState('Super Mid-Size (8-10 Passengers)');

  // Client Details
  const [clientName, setClientName] = useState(
    (currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : (currentUser as any)?.name) || currentUser?.username || 'Capt. Vikram Malhotra'
  );
  const [clientEmail, setClientEmail] = useState(
    currentUser?.email || 'vikram@jetstream.in'
  );
  const [clientPhone, setClientPhone] = useState(
    currentUser?.phone_number || '+91 98200 12345'
  );
  const [clientCompany, setClientCompany] = useState(
    (currentUser as any)?.company || (currentUser as any)?.company_name || 'Aviation Procurement Group'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<QuotationRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize with the first service selected by default
  useEffect(() => {
    if (availableServices.length > 0 && selectedServices.length === 0) {
      setSelectedServices([availableServices[0]]);
    }
  }, [targetListing]);

  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      setSelectedServices(selectedServices.filter((s) => s !== srv));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleAddCustomService = () => {
    const trimmed = customServiceInput.trim();
    if (!trimmed) return;
    if (!customServicesList.includes(trimmed)) {
      setCustomServicesList([...customServicesList, trimmed]);
      if (!selectedServices.includes(trimmed)) {
        setSelectedServices([...selectedServices, trimmed]);
      }
    }
    setCustomServiceInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedServices.length === 0 && !details.trim()) {
      setErrorMessage('Please select at least one service or describe your requirement.');
      return;
    }

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMessage('Please fill in your name, email and phone number so the business can reach you.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = db.submitQuotationRequest({
        business_id: targetListing.business_id,
        business_name: (targetListing as any).business_name || targetListing.name,
        listing_id: targetListing.id,
        client_id: currentUser?.user_id,
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim(),
        client_company: clientCompany.trim(),
        selected_services: selectedServices.length > 0 ? selectedServices : ['Aviation Charter / Custom Service'],
        required_date: requiredDate,
        departure_hub: departureHub,
        destination_hub: destinationHub,
        capacity_scope: capacityScope,
        details: details.trim() || 'Custom aviation quotation request as per selected services.',
        target_budget: targetBudget ? Number(targetBudget) : undefined,
        currency,
      });

      if (res.success && res.request) {
        setSubmittedRequest(res.request);
        if (onRequestSubmitted) {
          onRequestSubmitted(res.request);
        }
      } else {
        setErrorMessage(res.message || 'Failed to submit quotation request. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-900 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 shrink-0 mt-0.5">
              <FileSpreadsheet className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  Request Quotation Protocol
                </span>
                <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Direct to Business Owner</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Request Quotation: {(targetListing as any).business_name || targetListing.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your required services and specify details. This request will be routed directly to the business user holding this account.
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
        {submittedRequest ? (
          <div className="p-6 sm:p-8 space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {submittedRequest.request_number}
              </span>
              <h3 className="text-xl font-bold text-white">Quotation Request Successfully Delivered!</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                Your RFQ has been delivered directly to the business user for{' '}
                <span className="text-sky-300 font-bold">{(targetListing as any).business_name || targetListing.name}</span>.
              </p>
            </div>

            {/* Lifecycle Stages Explainer */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 text-left space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Next Lifecycle Steps:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-200">
                  <div className="font-bold text-[11px] text-sky-400">1. Request Sent</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">Delivered to Business User</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                  <div className="font-bold text-[11px] text-amber-400">2. Issue Quote</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Business issues formal price</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                  <div className="font-bold text-[11px] text-indigo-400">3. Convert to Deal</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">User accepts &rarr; Pipeline Deal</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                  <div className="font-bold text-[11px] text-emerald-400">4. Payment &amp; Close</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Payment done &rarr; Deal Closed</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onOpenLifecycleModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLifecycleModal();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-lg"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Open Quotation &amp; Deals Tracker</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. SELECT REQUIRED SERVICES */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1. Select Required Services</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {selectedServices.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableServices.concat(customServicesList).map((srv, idx) => {
                  const isChecked = selectedServices.includes(srv);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleService(srv)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-sky-500/15 border-sky-500/60 text-white shadow-xs'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{srv}</span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-sky-500 text-slate-950 font-bold'
                            : 'border border-slate-600'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Service Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customServiceInput}
                  onChange={(e) => setCustomServiceInput(e.target.value)}
                  placeholder="+ Add another custom required service..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomService();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomService}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. REQUEST DETAILS & SCOPE */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>2. Request Details &amp; Operational Scope</span>
              </label>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Scope Requirements / Passenger &amp; Mission Details:
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="e.g. VIP executive flight for 6 delegates. Require private ramp lounge, VIP catering, and 2 hours tarmac standby in Dubai."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Departure Hub / Airport:
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={departureHub}
                      onChange={(e) => setDepartureHub(e.target.value)}
                      placeholder="e.g. BOM (Mumbai)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Destination Hub / Airport:
                  </label>
                  <div className="relative">
                    <Plane className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={destinationHub}
                      onChange={(e) => setDestinationHub(e.target.value)}
                      placeholder="e.g. DXB (Dubai)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Target Execution Date:
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Estimated / Target Budget (Optional):
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-sky-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="AED">AED</option>
                    </select>
                    <input
                      type="number"
                      value={targetBudget}
                      onChange={(e) => setTargetBudget(e.target.value)}
                      placeholder="e.g. 1500000"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Aircraft / Capacity Scope:
                </label>
                <select
                  value={capacityScope}
                  onChange={(e) => setCapacityScope(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                >
                  <option value="Super Mid-Size (8-10 Passengers)">Super Mid-Size (8-10 Passengers)</option>
                  <option value="Heavy Ultra Long Range (12-16 Passengers)">Heavy Ultra Long Range (12-16 Passengers)</option>
                  <option value="Light Jet (4-6 Passengers)">Light Jet (4-6 Passengers)</option>
                  <option value="Helicopter VIP Transfer (4-6 Passengers)">Helicopter VIP Transfer (4-6 Passengers)</option>
                  <option value="Cargo & Medical Air Ambulance">Cargo &amp; Medical Air Ambulance</option>
                  <option value="MRO & Technical Aircraft Maintenance">MRO &amp; Technical Aircraft Maintenance</option>
                </select>
              </div>
            </div>

            {/* 3. REQUESTER / CLIENT CONTACT INFO */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>3. Requester Contact Information</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Full Name:</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Email Address:</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Phone Number:</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Company / Organization:</label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="e.g. Jetstream VIP Aviation"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-[11px] text-sky-200 flex items-start space-x-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                Once submitted, this quotation request goes to the <strong>Business User</strong> holding this business.
                They will issue a formal quotation. If accepted, the quotation moves to a <strong>Deal</strong>, and upon payment,
                to <strong>Sale / Deal Closed</strong>.
              </span>
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
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>{isSubmitting ? 'Submitting Request...' : 'Submit Quotation Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

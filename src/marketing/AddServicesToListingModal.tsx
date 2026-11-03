import React, { useState } from 'react';
import {
  Layers,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Send,
  Building2,
  Trash2,
  Info,
  Lock,
  Sparkles,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { ServiceListing, RegularUser, BusinessProfile, AdminUser } from '../types';

interface AddServicesToListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ServiceListing | null;
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  isAdmin: boolean;
  activeAdminUser?: AdminUser | null;
  onSuccess: () => void;
}

export const AddServicesToListingModal: React.FC<AddServicesToListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
  currentBusiness,
  isAdmin,
  activeAdminUser,
  onSuccess,
}) => {
  // Check authorization: ONLY Admin and Business User can add services
  const isBusinessUser = !!currentBusiness || (currentUser?.role === 'BUSINESS_USER');
  const isAuthorized = isAdmin || isBusinessUser;

  // Selected catalog services (multi-selection)
  const [selectedCatalogServices, setSelectedCatalogServices] = useState<string[]>([]);

  // Additional custom services (one or more items)
  const [customServices, setCustomServices] = useState<Array<{ name: string; desc: string }>>([
    { name: '', desc: '' },
  ]);

  const [adminDirectPublish, setAdminDirectPublish] = useState<boolean>(isAdmin);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const availableCatalogServices = db.getAvailableServicesForCategory(listing.category).filter(
    (s) => !listing.services?.includes(s) && !listing.pending_services?.includes(s)
  );

  const handleToggleCatalogService = (srv: string) => {
    setSelectedCatalogServices((prev) =>
      prev.includes(srv) ? prev.filter((item) => item !== srv) : [...prev, srv]
    );
  };

  const handleAddCustomLine = () => {
    setCustomServices((prev) => [...prev, { name: '', desc: '' }]);
  };

  const handleRemoveCustomLine = (index: number) => {
    setCustomServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCustomLineChange = (index: number, field: 'name' | 'desc', val: string) => {
    setCustomServices((prev) => {
      const copy = [...prev];
      copy[index][field] = val;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Collect valid custom services
    const validCustoms = customServices.filter((c) => c.name.trim().length >= 2);
    const totalToAddCount = selectedCatalogServices.length + validCustoms.length;

    if (totalToAddCount === 0) {
      setError('Please select at least one catalog service or specify a custom service name.');
      return;
    }

    setSubmitting(true);

    const allServiceNames = [
      ...selectedCatalogServices,
      ...validCustoms.map((c) => c.name.trim()),
    ];

    const actorName = isAdmin
      ? activeAdminUser?.name || 'Administrator'
      : currentBusiness?.organization_name || currentUser?.first_name || 'Business Operator';

    // Execution path: Admin direct add vs Business user pending approval
    if (isAdmin && adminDirectPublish) {
      // Direct addition by Admin
      allServiceNames.forEach((srv) => {
        db.addServiceToListing(listing.id, srv);
      });

      setSubmitting(false);
      setFeedback(`Successfully added ${allServiceNames.length} service(s) directly to "${listing.name}"!`);
      setTimeout(() => {
        onSuccess();
        onClose();
        setFeedback(null);
      }, 1200);
    } else {
      // Business User or Admin requesting approval flow
      // 1. Add all services to pending_services on the listing
      if (!listing.pending_services) listing.pending_services = [];
      allServiceNames.forEach((srv) => {
        if (!listing.pending_services?.includes(srv) && !listing.services?.includes(srv)) {
          listing.pending_services?.push(srv);
        }
      });

      // 2. Submit approval request for each service
      allServiceNames.forEach((srv) => {
        const customObj = validCustoms.find((c) => c.name.trim() === srv);
        const description = customObj?.desc || `Offered by ${listing.name} under ${listing.category}.`;

        db.requestCustomService({
          business_id: listing.business_id,
          business_name: listing.name,
          listing_id: listing.id,
          service_name: srv,
          category: listing.category,
          description: description,
          requested_by: actorName,
        });
      });

      setSubmitting(false);
      setFeedback(
        `${allServiceNames.length} service(s) submitted for Admin approval! Once verified by Central Administration, they will appear live on your business listing.`
      );

      setTimeout(() => {
        onSuccess();
        onClose();
        setFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-amber-400 to-indigo-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-start justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Service Offering Assignment
                </span>
                <span className="text-xs text-slate-400">
                  Category: <strong className="text-white">{listing.category}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Add Services to {listing.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Authorization Check */}
          {!isAuthorized ? (
            <div className="p-6 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-center space-y-3">
              <Lock className="w-10 h-10 text-rose-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Access Denied: Standard Users Cannot Add Services</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                As per enterprise directory policy, only authenticated <strong>Business Users</strong> (organisation owners) and <strong>Platform Administrators</strong> are authorized to add or modify services attached to business listings.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Policy Banner */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white block">Multi-Service Addition Protocol:</span>
                  <span>
                    Select one or more services from the verified catalog, or specify custom service offerings. 
                    {isAdmin ? (
                      <strong className="text-white"> Administrators can directly publish services or queue them for audit.</strong>
                    ) : (
                      <strong className="text-white"> Services submitted by business users require Administrator approval before going live on the listing.</strong>
                    )}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {feedback && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* 1. Catalog Services (Select Multiple) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <span>1. Select Verified Platform Services (Multi-Select)</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      ({selectedCatalogServices.length} selected)
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Category: {listing.category}
                  </span>
                </div>

                {availableCatalogServices.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    All standard catalog services for this category are already added or pending.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                    {availableCatalogServices.map((srv) => {
                      const isChecked = selectedCatalogServices.includes(srv);
                      return (
                        <div
                          key={srv}
                          onClick={() => handleToggleCatalogService(srv)}
                          className={`p-2.5 rounded-xl border text-xs flex items-center space-x-2.5 transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div
                            className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="leading-snug">{srv}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Custom Services Addition (If organisation offers specialized services) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    2. Add Custom Specialized Service(s) Not In List
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCustomLine}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Service</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {customServices.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                          Custom Service Line #{idx + 1}
                        </span>
                        {customServices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomLine(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                            title="Remove line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleCustomLineChange(idx, 'name', e.target.value)}
                        placeholder="Service Title (e.g. VIP Medevac Air Ambulance 24/7 or B777 Engine Wash)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />

                      <input
                        type="text"
                        value={item.desc}
                        onChange={(e) => handleCustomLineChange(idx, 'desc', e.target.value)}
                        placeholder="Operational details, DGCA/FAA certification, turnaround time (optional)"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Direct Publish Option */}
              {isAdmin && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-white block">Administrator Authority:</span>
                    <span className="text-[11px] text-slate-400">
                      Publish directly to live listing without sending to review queue.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminDirectPublish}
                      onChange={(e) => setAdminDirectPublish(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {submitting
                      ? 'Processing...'
                      : isAdmin && adminDirectPublish
                      ? 'Direct Add Services to Listing'
                      : 'Submit Services for Admin Approval'}
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

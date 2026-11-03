import React, { useState } from 'react';
import {
  FolderPlus,
  Layers,
  Sparkles,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { BusinessProfile } from '../types';

interface AddCategorySubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile | null;
  listingId?: string;
  onSuccess: (category: string, subCategory: string) => void;
}

export const AddCategorySubCategoryModal: React.FC<AddCategorySubCategoryModalProps> = ({
  isOpen,
  onClose,
  business,
  listingId,
  onSuccess,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCat = categoryName.trim();
    const cleanSub = subCategoryName.trim();

    if (!cleanCat || cleanCat.length < 2) {
      setError('Please enter a valid Category name (at least 2 characters).');
      return;
    }

    if (!cleanSub || cleanSub.length < 2) {
      setError('Please enter a valid Sub-Category name (at least 2 characters).');
      return;
    }

    setSubmitting(true);

    const bizId = business?.business_id || 'biz_custom';
    const bizName = business?.organization_name || 'Aviation Operator';
    const requestedBy = business?.owner_name || 'Business User';

    const res = db.requestCustomCategory({
      business_id: bizId,
      business_name: bizName,
      category_name: cleanCat,
      sub_category_name: cleanSub,
      description: description.trim() || `Proposed by business user for ${bizName}`,
      requested_by: requestedBy,
    });

    setSubmitting(false);

    if (res.success) {
      setSuccessNotice(
        `Category "${cleanCat} > ${cleanSub}" successfully submitted for Administrator approval! Once approved, it will be added to your live listing.`
      );
      setTimeout(() => {
        onSuccess(cleanCat, cleanSub);
        onClose();
        setSuccessNotice(null);
        setCategoryName('');
        setSubCategoryName('');
        setDescription('');
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Gradient */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Business User Service Categorization</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Add Category &amp; Sub-Category
            </h3>
            <p className="text-xs text-slate-400">
              Propose new industry categorization for the specialized aviation services your organisation offers
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Service Category Name *
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Electric Aviation &amp; eVTOL or Drone Logistics"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Sub-Category Name *
            </label>
            <input
              type="text"
              required
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              placeholder="e.g. Urban Air Mobility Vertiports or Battery Hot-Swap"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description &amp; Operational Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the technical scope, regulatory approvals (DGCA, FAA, EASA), aircraft types, or facilities associated with this service category..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Administrative Approval Policy:</strong> Categories submitted by business users are forwarded to the Central Admin Desk. Upon verification, the new category and sub-category are added to your listing and made available across the platform catalog.
            </span>
          </div>

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
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit for Admin Approval'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

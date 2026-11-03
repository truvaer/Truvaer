import React from 'react';
import { X, Tags } from 'lucide-react';
import { ApprovedTaxonomyDesk } from './ApprovedTaxonomyDesk';
import { AdminUser, BusinessProfile } from '../types';

interface ApprovedTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAdminUser?: AdminUser | null;
  currentBusiness?: BusinessProfile | null;
  onRefreshAll?: () => void;
}

export const ApprovedTaxonomyModal: React.FC<ApprovedTaxonomyModalProps> = ({
  isOpen,
  onClose,
  activeAdminUser,
  currentBusiness,
  onRefreshAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Approved Categories &amp; Subcategories
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  Live Master Catalog
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official aviation taxonomy — Add, Edit, Delete, or request &quot;Other&quot; with Admin approval
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <ApprovedTaxonomyDesk
            activeAdminUser={activeAdminUser}
            currentBusiness={currentBusiness}
            onRefreshAll={onRefreshAll}
            onClose={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Tags,
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  RotateCcw,
  ShieldCheck,
  Building2,
  Clock,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Save,
  X,
  AlertTriangle,
  Sparkles,
  Info,
  Check,
  Filter,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminUser, BusinessProfile, CustomCategoryRequest } from '../types';

interface ApprovedTaxonomyDeskProps {
  activeAdminUser?: AdminUser | null;
  currentBusiness?: BusinessProfile | null;
  onRefreshAll?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const ApprovedTaxonomyDesk: React.FC<ApprovedTaxonomyDeskProps> = ({
  activeAdminUser,
  currentBusiness,
  onRefreshAll,
  onClose,
  isModal = false,
}) => {
  const isAdmin = !!activeAdminUser || (typeof window !== 'undefined' && localStorage.getItem('truvaer_active_admin_session') !== null);
  const isBusiness = !!currentBusiness;

  const [activeTab, setActiveTab] = useState<'APPROVED' | 'PENDING_APPROVALS'>('APPROVED');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Category Add / Edit State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatInitialSub, setNewCatInitialSub] = useState('');

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCatNameValue, setEditCatNameValue] = useState('');

  // Subcategory Add / Edit State
  const [addingSubForCat, setAddingSubForCat] = useState<string | null>(null);
  const [newSubNameValue, setNewSubNameValue] = useState('');

  const [editingSub, setEditingSub] = useState<{ category: string; sub: string } | null>(null);
  const [editSubNameValue, setEditSubNameValue] = useState('');

  // Business "Other" Request State
  const [showBusinessRequestModal, setShowBusinessRequestModal] = useState(false);
  const [bizReqCategory, setBizReqCategory] = useState('');
  const [bizReqSubCategory, setBizReqSubCategory] = useState('');
  const [bizReqDescription, setBizReqDescription] = useState('');

  // Data reload trigger
  const [version, setVersion] = useState(0);

  const taxonomy = useMemo(() => {
    return db.getAviationTaxonomy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const categoryRequests = useMemo(() => {
    return db.getCustomCategoryRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const pendingRequestsCount = categoryRequests.filter((r) => r.status === 'PENDING_APPROVAL').length;

  const adminName = activeAdminUser?.name || 'Platform Administrator';

  const reloadData = () => {
    setVersion((v) => v + 1);
    if (onRefreshAll) onRefreshAll();
  };

  // Toggle category expansion
  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: prev[cat] === undefined ? false : !prev[cat],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    Object.keys(taxonomy).forEach((cat) => {
      all[cat] = true;
    });
    setExpandedCategories(all);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Filtered categories
  const categoryKeys = useMemo(() => {
    const keys = Object.keys(taxonomy).filter((c) => c !== 'All');
    if (!searchQuery.trim()) return keys;
    const q = searchQuery.toLowerCase().trim();
    return keys.filter((cat) => {
      if (cat.toLowerCase().includes(q)) return true;
      const subs = taxonomy[cat] || [];
      return subs.some((s) => s.toLowerCase().includes(q));
    });
  }, [taxonomy, searchQuery]);

  // Total metrics
  const totalCategories = Object.keys(taxonomy).filter((c) => c !== 'All').length;
  const totalSubcategories = useMemo(() => {
    let count = 0;
    Object.entries(taxonomy).forEach(([k, subs]) => {
      if (k !== 'All') {
        count += subs.filter((s) => s !== 'All Subcategories').length;
      }
    });
    return count;
  }, [taxonomy]);

  // Handlers: Add Category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setFeedback({ type: 'error', message: 'Category name is required.' });
      return;
    }
    const sub = newCatInitialSub.trim() || 'General Operations';
    const res = db.addPlatformMasterCategory(newCatName.trim(), sub, adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setNewCatName('');
      setNewCatInitialSub('');
      setShowAddCategoryModal(false);
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handlers: Edit Category
  const handleSaveEditCategory = (oldCat: string) => {
    if (!editCatNameValue.trim() || editCatNameValue.trim() === oldCat) {
      setEditingCategory(null);
      return;
    }
    const res = db.editPlatformCategory(oldCat, editCatNameValue.trim(), adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setEditingCategory(null);
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handlers: Delete Category
  const handleDeleteCategory = (cat: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete category "${cat}" and all of its subcategories? This will remove it from the active platform taxonomy.`
    );
    if (!confirmed) return;

    const res = db.deletePlatformCategory(cat, adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handlers: Add Subcategory
  const handleAddSubcategorySubmit = (category: string) => {
    if (!newSubNameValue.trim()) return;
    const res = db.addPlatformSubCategory(category, newSubNameValue.trim(), adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setNewSubNameValue('');
      setAddingSubForCat(null);
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handlers: Edit Subcategory
  const handleSaveEditSubcategory = (category: string, oldSub: string) => {
    if (!editSubNameValue.trim() || editSubNameValue.trim() === oldSub) {
      setEditingSub(null);
      return;
    }
    const res = db.editPlatformSubCategory(category, oldSub, editSubNameValue.trim(), adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setEditingSub(null);
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handlers: Delete Subcategory
  const handleDeleteSubcategory = (category: string, sub: string) => {
    const confirmed = window.confirm(`Remove sub-category "${sub}" from "${category}"?`);
    if (!confirmed) return;
    const res = db.deletePlatformSubCategory(category, sub, adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handlers: Reset to default
  const handleResetToDefault = () => {
    const confirmed = window.confirm(
      'Reset platform civil aviation taxonomy to factory default categories and subcategories?'
    );
    if (!confirmed) return;
    const res = db.resetToDefaultTaxonomy(adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handlers: Business User Propose Category (Other Option)
  const handleBusinessRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBusiness) {
      setFeedback({
        type: 'error',
        message: 'The "+ Other" custom category option is reserved strictly for verified business operators.',
      });
      return;
    }
    if (!bizReqCategory.trim() || !bizReqSubCategory.trim()) {
      setFeedback({ type: 'error', message: 'Both Category name and Sub-Category title are required.' });
      return;
    }

    const bizId = currentBusiness?.business_id || 'biz_custom';
    const bizName = currentBusiness?.organization_name || 'Business Partner';
    const requestedBy = currentBusiness?.owner_name || 'Business User';

    const res = db.requestCustomCategory({
      business_id: bizId,
      business_name: bizName,
      category_name: bizReqCategory.trim(),
      sub_category_name: bizReqSubCategory.trim(),
      description: bizReqDescription.trim() || `Proposed by ${bizName}`,
      requested_by: requestedBy,
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Custom Category proposal submitted! Status is PENDING ADMIN APPROVAL. An Administrator will review it before publication.`,
      });
      setBizReqCategory('');
      setBizReqSubCategory('');
      setBizReqDescription('');
      setShowBusinessRequestModal(false);
      reloadData();
      setTimeout(() => setFeedback(null), 6000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Handlers: Admin Approve / Reject Custom Requests
  const handleApproveRequest = (req: CustomCategoryRequest) => {
    const adminId = activeAdminUser?.admin_id || 'admin_primary';
    const res = db.approveCustomCategory(req.id, adminId, adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleRejectRequest = (req: CustomCategoryRequest) => {
    const reason = window.prompt(
      `Enter reason for declining custom proposal "${req.category_name} > ${req.sub_category_name}":`,
      'Does not conform to standard civil aviation taxonomy or requires DGCA / FAA accreditation.'
    );
    if (!reason) return;
    const adminId = activeAdminUser?.admin_id || 'admin_primary';
    const res = db.rejectCustomCategory(req.id, adminId, adminName, reason);
    if (res.success) {
      setFeedback({ type: 'info', message: res.message });
      reloadData();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className={`space-y-6 ${isModal ? 'p-1' : ''}`}>
      {/* Top Banner / Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Approved Categories &amp; Subcategories Directory
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Civil Aviation Taxonomy
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Manage master categories, sub-classifications, and business custom requests requiring admin approval.
                </p>
              </div>
            </div>
          </div>

          {/* Action cluster */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Business "+ Other" Request button */}
            {isBusiness && (
              <button
                type="button"
                onClick={() => setShowBusinessRequestModal(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
                title="Business User Option: Propose a custom category/subcategory for Admin approval"
              >
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>+ Other (Propose Custom)</span>
              </button>
            )}

            {/* Admin Add Category */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}

            {/* Admin Reset defaults */}
            {isAdmin && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1"
                title="Restore default civil aviation taxonomy"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            )}

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : feedback.type === 'error'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : feedback.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Executive Taxonomy Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Approved Categories
            </span>
            <div className="text-lg font-bold text-white font-mono">{totalCategories}</div>
            <span className="text-[10px] text-emerald-400">Active across platform</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Approved Subcategories
            </span>
            <div className="text-lg font-bold text-sky-400 font-mono">{totalSubcategories}</div>
            <span className="text-[10px] text-slate-400">Classified civil sectors</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Pending Admin Approvals
            </span>
            <div className="text-lg font-bold text-amber-400 font-mono">{pendingRequestsCount}</div>
            <span className="text-[10px] text-amber-300">Business &quot;Other&quot; requests</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Authority Gate
            </span>
            <div className="text-sm font-bold text-emerald-300 truncate">
              {isAdmin ? 'Admin Sovereign CRUD' : isBusiness ? 'Business Operator Propose' : 'Read-Only Directory'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {isAdmin ? 'Full Edit/Delete/Add' : isBusiness ? 'Submit for Admin Review' : 'Verified Directory'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('APPROVED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'APPROVED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Approved List ({categoryKeys.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PENDING_APPROVALS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'PENDING_APPROVALS'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Business Proposals (Other)</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search & Collapse Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or subcategory..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {activeTab === 'APPROVED' && (
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={expandAll}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: APPROVED CATEGORIES & SUBCATEGORIES LIST WITH FULL CRUD CONTROLS  */}
      {/* ========================================================================= */}
      {activeTab === 'APPROVED' && (
        <div className="space-y-3">
          {categoryKeys.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
              <Tags className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
              <p className="font-semibold text-slate-300">No categories found matching &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            categoryKeys.map((cat) => {
              const subs = (taxonomy[cat] || []).filter((s) => s !== 'All Subcategories');
              const isExpanded = expandedCategories[cat] !== false; // Default expanded
              const isEditingThisCat = editingCategory === cat;

              return (
                <div
                  key={cat}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-slate-700/80"
                >
                  {/* Category Header Bar */}
                  <div className="p-3.5 sm:p-4 bg-slate-950/70 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </button>

                      {isEditingThisCat ? (
                        <div className="flex items-center space-x-2 flex-1 max-w-md">
                          <input
                            type="text"
                            value={editCatNameValue}
                            onChange={(e) => setEditCatNameValue(e.target.value)}
                            className="w-full px-2.5 py-1 bg-slate-800 border border-blue-500 rounded-lg text-xs font-bold text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(cat)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer"
                            title="Save Rename"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 truncate">
                          <span
                            onClick={() => toggleCategory(cat)}
                            className="text-sm font-bold text-white hover:text-blue-300 cursor-pointer truncate"
                          >
                            {cat}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 shrink-0">
                            {subs.length} subcategories
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Admin Category CRUD Actions */}
                    <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0">
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingSubForCat(cat);
                              setNewSubNameValue('');
                              if (!isExpanded) toggleCategory(cat);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                            title="Add a new subcategory under this category"
                          >
                            <Plus className="w-3 h-3 text-blue-400" />
                            <span>Add Subcategory</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditCatNameValue(cat);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                            title="Rename Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Category Content: Subcategories Grid / Rows */}
                  {isExpanded && (
                    <div className="p-3.5 sm:p-4 bg-slate-900/60 space-y-3">
                      {/* Inline Subcategory Adder for this category */}
                      {isAdmin && addingSubForCat === cat && (
                        <div className="p-3 bg-blue-950/30 border border-blue-500/40 rounded-xl space-y-2 mb-3 animate-in fade-in duration-150">
                          <div className="text-[11px] font-bold text-blue-300 flex items-center justify-between">
                            <span>Add New Approved Subcategory under &quot;{cat}&quot;</span>
                            <button
                              onClick={() => setAddingSubForCat(null)}
                              className="text-slate-400 hover:text-white text-xs"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={newSubNameValue}
                              onChange={(e) => setNewSubNameValue(e.target.value)}
                              placeholder="e.g. Avionics Calibration, Cadet Simulators, Ground Handling..."
                              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleAddSubcategorySubmit(cat)}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Add Subcategory
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingSubForCat(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Subcategories List */}
                      {subs.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          No subcategories listed yet under this category.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {subs.map((sub) => {
                            const isEditingThisSub =
                              editingSub?.category === cat && editingSub?.sub === sub;

                            return (
                              <div
                                key={sub}
                                className="p-2.5 bg-slate-950/70 border border-slate-800/90 rounded-xl flex items-center justify-between gap-2 group hover:border-slate-700 transition-colors"
                              >
                                {isEditingThisSub ? (
                                  <div className="flex items-center space-x-1.5 w-full">
                                    <input
                                      type="text"
                                      value={editSubNameValue}
                                      onChange={(e) => setEditSubNameValue(e.target.value)}
                                      className="flex-1 px-2 py-0.5 bg-slate-800 border border-blue-500 rounded text-xs text-white focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditSubcategory(cat, sub)}
                                      className="p-1 rounded bg-emerald-600 text-white text-xs"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSub(null)}
                                      className="p-1 rounded bg-slate-800 text-slate-400 text-xs"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center space-x-2 truncate">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                      <span className="text-xs text-slate-200 font-medium truncate" title={sub}>
                                        {sub}
                                      </span>
                                    </div>

                                    {isAdmin && (
                                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingSub({ category: cat, sub });
                                            setEditSubNameValue(sub);
                                          }}
                                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                                          title="Rename Subcategory"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSubcategory(cat, sub)}
                                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors cursor-pointer"
                                          title="Remove Subcategory"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: PENDING BUSINESS "OTHER" PROPOSALS (ADMIN APPROVAL DESK)           */}
      {/* ========================================================================= */}
      {activeTab === 'PENDING_APPROVALS' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Business Custom &quot;Other&quot; Requests Queue</span>
              <span className="text-slate-400">
                (Allowed only for business users to propose; requires Admin approval before being added to approved catalog)
              </span>
            </div>
            {isBusiness && (
              <button
                type="button"
                onClick={() => setShowBusinessRequestModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
              >
                + Propose Custom Category
              </button>
            )}
          </div>

          {categoryRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
              <p className="font-semibold text-slate-300">No custom category proposals in queue.</p>
              <p className="text-[11px] text-slate-500">
                When business operators select &quot;+ Other&quot; and propose new categories, they will appear here for administrator verification.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    req.status === 'PENDING_APPROVAL'
                      ? 'bg-slate-900 border-amber-500/40 shadow-md'
                      : req.status === 'APPROVED'
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {req.category_name}
                        </span>
                        <span className="text-slate-400 text-xs">›</span>
                        <span className="text-xs font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                          {req.sub_category_name}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            req.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : req.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {req.description}
                      </p>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                        <span className="flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{req.business_name}</span>
                        </span>
                        <span>•</span>
                        <span>Proposed: {new Date(req.requested_at).toLocaleDateString()}</span>
                        {req.reviewed_by && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300">Reviewed by {req.reviewed_by}</span>
                          </>
                        )}
                      </div>

                      {req.rejection_reason && (
                        <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40 mt-1.5">
                          <strong>Decline Reason:</strong> {req.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    {isAdmin && req.status === 'PENDING_APPROVAL' && (
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApproveRequest(req)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve &amp; Publish</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectRequest(req)}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADMIN CREATE NEW PLATFORM MASTER CATEGORY                         */}
      {/* ========================================================================= */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Add Approved Category</h3>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Category Title
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Supersonic Business Aviation"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                  Initial Approved Sub-Category
                </label>
                <input
                  type="text"
                  value={newCatInitialSub}
                  onChange={(e) => setNewCatInitialSub(e.target.value)}
                  placeholder="e.g. Transatlantic Mach 1.5 Charter"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  You can add more subcategories under this category at any time after creation.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Create &amp; Publish Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BUSINESS USER PROPOSE CUSTOM "OTHER" CATEGORY/SUBCATEGORY         */}
      {/* ========================================================================= */}
      {showBusinessRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Propose Custom Category &amp; Subcategory</h3>
                  <span className="text-[10px] text-amber-300 font-mono">
                    Business Operator Option • Requires Admin Approval
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowBusinessRequestModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Civil Aviation Compliance Policy:</strong> Custom categories requested by businesses undergo administrator review to prevent spam and duplicate taxonomies. Once approved, it becomes live for all marketplace operators.
              </div>
            </div>

            <form onSubmit={handleBusinessRequestSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Proposed Category Title
                </label>
                <input
                  type="text"
                  required
                  value={bizReqCategory}
                  onChange={(e) => setBizReqCategory(e.target.value)}
                  placeholder="e.g. eVTOL Air Mobility / Sustainable Aviation Fuel (SAF)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Proposed Sub-Category Title
                </label>
                <input
                  type="text"
                  required
                  value={bizReqSubCategory}
                  onChange={(e) => setBizReqSubCategory(e.target.value)}
                  placeholder="e.g. Vertiport Terminal Infrastructure"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1">
                  Operational Description &amp; Rationale
                </label>
                <textarea
                  rows={3}
                  required
                  value={bizReqDescription}
                  onChange={(e) => setBizReqDescription(e.target.value)}
                  placeholder="Explain why this aviation sector is needed for your operations and fleet offerings..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBusinessRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer shadow-md"
                >
                  Submit for Administrator Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

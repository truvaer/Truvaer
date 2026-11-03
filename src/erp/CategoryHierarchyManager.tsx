import React, { useState, useMemo } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Save,
  X,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  Filter,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminUser } from '../types';

interface CategoryHierarchyManagerProps {
  activeAdminUser?: AdminUser | null;
  onRefreshAll?: () => void;
}

export const CategoryHierarchyManager: React.FC<CategoryHierarchyManagerProps> = ({
  activeAdminUser,
  onRefreshAll,
}) => {
  const isSuperAdmin = activeAdminUser?.role === 'SUPER_ADMIN' || !activeAdminUser;
  const adminName = activeAdminUser?.name || 'Super Administrator (L8)';

  const [version, setVersion] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modal / Form States
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatInitialSub, setNewCatInitialSub] = useState('');

  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [targetCatForNewSub, setTargetCatForNewSub] = useState('');
  const [newSubName, setNewSubName] = useState('');

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const [editingSubcategory, setEditingSubcategory] = useState<{ category: string; sub: string } | null>(null);
  const [editSubName, setEditSubName] = useState('');

  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    type: 'CATEGORY' | 'SUBCATEGORY';
    category: string;
    subCategory?: string;
  } | null>(null);

  // Load live taxonomy and suspension lists from db
  const taxonomy = useMemo(() => {
    return db.getAviationTaxonomy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const suspendedCategories = useMemo(() => {
    return db.getSuspendedCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const suspendedSubCategories = useMemo(() => {
    return db.getSuspendedSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const reloadData = () => {
    setVersion((v) => v + 1);
    if (onRefreshAll) onRefreshAll();
  };

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Reliable Category Expand/Collapse Management
  const isCatExpanded = (cat: string) => {
    return expandedCats[cat] !== false;
  };

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const current = prev[cat] !== false;
      return {
        ...prev,
        [cat]: !current,
      };
    });
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    Object.keys(taxonomy).forEach((c) => {
      all[c] = true;
    });
    setExpandedCats(all);
  };

  const collapseAll = () => {
    const none: Record<string, boolean> = {};
    Object.keys(taxonomy).forEach((c) => {
      none[c] = false;
    });
    setExpandedCats(none);
  };

  // Categories list (excluding "All")
  const rawCategories = useMemo(() => {
    return Object.keys(taxonomy).filter((c) => c !== 'All');
  }, [taxonomy]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return rawCategories.filter((cat) => {
      const isSuspended = suspendedCategories.includes(cat);
      if (filterStatus === 'ACTIVE' && isSuspended) return false;
      if (filterStatus === 'SUSPENDED' && !isSuspended) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      if (cat.toLowerCase().includes(q)) return true;
      const subs = taxonomy[cat] || [];
      return subs.some((s) => s.toLowerCase().includes(q));
    });
  }, [rawCategories, suspendedCategories, filterStatus, searchQuery, taxonomy]);

  // Metrics
  const totalCategoriesCount = rawCategories.length;
  const totalSubcategoriesCount = useMemo(() => {
    let count = 0;
    rawCategories.forEach((cat) => {
      const subs = (taxonomy[cat] || []).filter((s) => s !== 'All Subcategories');
      count += subs.length;
    });
    return count;
  }, [rawCategories, taxonomy]);

  const totalSuspendedCats = suspendedCategories.filter((c) => rawCategories.includes(c)).length;

  // Handlers: Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('error', 'Category name cannot be empty.');
      return;
    }
    const initialSub = newCatInitialSub.trim() || 'General Operations';
    const res = db.addPlatformMasterCategory(newCatName.trim(), initialSub, adminName);
    if (res.success) {
      showToast('success', res.message);
      setNewCatName('');
      setNewCatInitialSub('');
      setShowAddCatModal(false);
      reloadData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handlers: Add Sub Category
  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCatForNewSub || !newSubName.trim()) {
      showToast('error', 'Target Category and Subcategory name are required.');
      return;
    }
    const res = db.addPlatformSubCategory(targetCatForNewSub, newSubName.trim(), adminName);
    if (res.success) {
      showToast('success', res.message);
      setNewSubName('');
      setShowAddSubModal(false);
      reloadData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handlers: Edit Category
  const handleSaveEditCategory = (oldCat: string) => {
    if (!editCategoryName.trim() || editCategoryName.trim() === oldCat) {
      setEditingCategory(null);
      return;
    }
    const res = db.editPlatformCategory(oldCat, editCategoryName.trim(), adminName);
    if (res.success) {
      showToast('success', res.message);
      setEditingCategory(null);
      reloadData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handlers: Edit Subcategory
  const handleSaveEditSubcategory = (cat: string, oldSub: string) => {
    if (!editSubName.trim() || editSubName.trim() === oldSub) {
      setEditingSubcategory(null);
      return;
    }
    const res = db.editPlatformSubCategory(cat, oldSub, editSubName.trim(), adminName);
    if (res.success) {
      showToast('success', res.message);
      setEditingSubcategory(null);
      reloadData();
    } else {
      showToast('error', res.message);
    }
  };

  // Handlers: Suspend / Unsuspend Category
  const handleToggleSuspendCategory = (cat: string) => {
    const isCurrentlySuspended = suspendedCategories.includes(cat);
    if (isCurrentlySuspended) {
      const res = db.unsuspendPlatformCategory(cat, adminName);
      showToast('success', res.message);
    } else {
      const res = db.suspendPlatformCategory(cat, adminName);
      showToast('info', res.message);
    }
    reloadData();
  };

  // Handlers: Suspend / Unsuspend Subcategory
  const handleToggleSuspendSubcategory = (cat: string, sub: string) => {
    const isSubSusp = Boolean(suspendedSubCategories[cat] && suspendedSubCategories[cat].includes(sub));
    if (isSubSusp) {
      const res = db.unsuspendPlatformSubCategory(cat, sub, adminName);
      showToast('success', res.message);
    } else {
      const res = db.suspendPlatformSubCategory(cat, sub, adminName);
      showToast('info', res.message);
    }
    reloadData();
  };

  // Handlers: Remove / Delete Action Trigger
  const handleConfirmExecuteDelete = () => {
    if (!confirmDeleteModal) return;

    if (confirmDeleteModal.type === 'CATEGORY') {
      const res = db.deletePlatformCategory(confirmDeleteModal.category, adminName);
      if (res.success) {
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } else if (confirmDeleteModal.type === 'SUBCATEGORY' && confirmDeleteModal.subCategory) {
      const res = db.deletePlatformSubCategory(confirmDeleteModal.category, confirmDeleteModal.subCategory, adminName);
      if (res.success) {
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    }
    setConfirmDeleteModal(null);
    reloadData();
  };

  // Handlers: Restore Standard Taxonomy Defaults
  const handleResetDefaults = () => {
    const confirmed = window.confirm(
      'Are you sure you want to restore the civil aviation taxonomy to standard platform factory defaults?'
    );
    if (!confirmed) return;
    const res = db.resetToDefaultTaxonomy(adminName);
    showToast('info', res.message);
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toastMessage.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-amber-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <XCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner & Super Admin Operational Authority */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white uppercase tracking-wider font-mono">
                  Categories &amp; Sub Categories Interface
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Super Admin cPanel Governance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized civil aviation taxonomy management. Super Admin has sovereign controls to Add, Edit, Remove, Suspend, and permanently Delete categories &amp; subcategories.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls for Super Admin */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddCatModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetCatForNewSub(rawCategories[0] || '');
              setShowAddSubModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sky-300 font-bold text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-sky-400" />
            <span>Add Subcategory</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            title="Reset platform civil aviation categories to system defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Categories</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">{totalCategoriesCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Tags className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Subcategories</div>
            <div className="text-xl font-black text-sky-400 font-mono mt-0.5">{totalSubcategoriesCount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Active Categories</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
              {totalCategoriesCount - totalSuspendedCats}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Suspended Items</div>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{totalSuspendedCats}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Lock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories or subcategories..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalCategoriesCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterStatus === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('SUSPENDED')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterStatus === 'SUSPENDED' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suspended ({totalSuspendedCats})
            </button>
          </div>

          {/* Expand / Collapse All */}
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium cursor-pointer"
            title="Expand All"
          >
            Expand
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium cursor-pointer"
            title="Collapse All"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Main Categories & Subcategories Tree List */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs italic">
            No categories match your search or filter criteria.
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isCatSuspended = suspendedCategories.includes(cat);
            const subs = (taxonomy[cat] || []).filter((s) => s !== 'All Subcategories');
            const isExpanded = isCatExpanded(cat);

            return (
              <div
                key={cat}
                className={`border rounded-2xl overflow-hidden transition-all shadow-md ${
                  isCatSuspended
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Category Header Row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCat(cat);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer shrink-0 transition-transform"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {editingCategory === cat ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="bg-slate-950 border border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white font-bold flex-1"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(cat)}
                            className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            title="Save Category Name"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => toggleCat(cat)}
                          className="flex items-center space-x-2.5 flex-wrap cursor-pointer select-none"
                        >
                          <span className="font-black text-white text-sm tracking-tight hover:text-amber-300 transition-colors">
                            {cat}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isCatSuspended
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {isCatSuspended ? 'SUSPENDED' : 'ACTIVE'}
                          </span>

                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                            {subs.length} Subcategories
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Super Admin Actions for this Category */}
                  <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                    {/* Add Subcategory under this Cat */}
                    <button
                      type="button"
                      onClick={() => {
                        setTargetCatForNewSub(cat);
                        setShowAddSubModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 cursor-pointer transition-colors"
                      title={`Add Subcategory to "${cat}"`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Category */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setEditCategoryName(cat);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
                      title="Edit Category Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Suspend / Unsuspend Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSuspendCategory(cat)}
                      className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                        isCatSuspended
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-500/40'
                      }`}
                      title={isCatSuspended ? 'Unsuspend Category' : 'Suspend Category'}
                    >
                      {isCatSuspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span className="text-[10px] hidden sm:inline">{isCatSuspended ? 'Unsuspend' : 'Suspend'}</span>
                    </button>

                    {/* Remove / Delete Option */}
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDeleteModal({
                          type: 'CATEGORY',
                          category: cat,
                        })
                      }
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 cursor-pointer transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-950/60 p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                      <span>Subcategories ({subs.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetCatForNewSub(cat);
                          setShowAddSubModal(true);
                        }}
                        className="text-sky-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer font-bold"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Subcategory</span>
                      </button>
                    </div>

                    {subs.length === 0 ? (
                      <div className="text-slate-500 text-xs italic py-2">
                        No subcategories under this category. Click "+ Add Subcategory" to add one.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {subs.map((sub) => {
                          const isSubSusp = Boolean(
                            suspendedSubCategories[cat] && suspendedSubCategories[cat].includes(sub)
                          );
                          const isEditingThisSub =
                            editingSubcategory?.category === cat && editingSubcategory?.sub === sub;

                          return (
                            <div
                              key={sub}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                                isSubSusp
                                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                {isEditingThisSub ? (
                                  <div className="flex items-center space-x-1.5">
                                    <input
                                      type="text"
                                      value={editSubName}
                                      onChange={(e) => setEditSubName(e.target.value)}
                                      className="bg-slate-950 border border-amber-500 rounded-lg px-2 py-0.5 text-xs text-white w-full"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditSubcategory(cat, sub)}
                                      className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                                    >
                                      <Save className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingSubcategory(null)}
                                      className="p-1 rounded bg-slate-800 text-slate-400 cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-medium truncate">{sub}</span>
                                    {isSubSusp && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        SUSPENDED
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Subcategory Controls */}
                              <div className="flex items-center space-x-1 shrink-0">
                                {/* Edit Sub */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSubcategory({ category: cat, sub });
                                    setEditSubName(sub);
                                  }}
                                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                                  title="Edit Subcategory"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>

                                {/* Suspend Sub */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleSuspendSubcategory(cat, sub)}
                                  className={`p-1 rounded cursor-pointer ${
                                    isSubSusp
                                      ? 'text-amber-400 hover:text-amber-300'
                                      : 'text-slate-400 hover:text-amber-300'
                                  }`}
                                  title={isSubSusp ? 'Unsuspend Subcategory' : 'Suspend Subcategory'}
                                >
                                  {isSubSusp ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                </button>

                                {/* Remove / Delete Sub */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmDeleteModal({
                                      type: 'SUBCATEGORY',
                                      category: cat,
                                      subCategory: sub,
                                    })
                                  }
                                  className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 cursor-pointer"
                                  title="Remove Subcategory"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
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

      {/* ========================================================================= */}
      {/* MODAL 1: ADD CATEGORY                                                    */}
      {/* ========================================================================= */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Add New Platform Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Category Title *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. VIP Helicopter Charter & Vertiports"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Initial Subcategory (Optional)
                </label>
                <input
                  type="text"
                  value={newCatInitialSub}
                  onChange={(e) => setNewCatInitialSub(e.target.value)}
                  placeholder="e.g. Twin-Engine VIP Helicopter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Defaults to &quot;General Operations&quot; if left empty.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD SUB-CATEGORY                                                */}
      {/* ========================================================================= */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-sky-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Add Subcategory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSubModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubCategory} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Target Category *
                </label>
                <select
                  value={targetCatForNewSub}
                  onChange={(e) => setTargetCatForNewSub(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                >
                  {rawCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Subcategory Title *
                </label>
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. CFM56 Turbine Blade Overhaul"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                >
                  Add Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM DELETE MODAL                                            */}
      {/* ========================================================================= */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white">
                {confirmDeleteModal.type === 'CATEGORY' ? 'Delete Category?' : 'Remove Subcategory?'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmDeleteModal.type === 'CATEGORY'
                  ? `Are you sure you want to permanently delete category "${confirmDeleteModal.category}" and all of its associated subcategories?`
                  : `Are you sure you want to remove subcategory "${confirmDeleteModal.subCategory}" from "${confirmDeleteModal.category}"?`}
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-[11px] text-slate-400 space-y-1 font-mono">
              <div>
                <span className="text-slate-500">Target: </span>
                <span className="text-white font-bold">
                  {confirmDeleteModal.subCategory
                    ? `${confirmDeleteModal.category} > ${confirmDeleteModal.subCategory}`
                    : confirmDeleteModal.category}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Action: </span>
                <span className="text-rose-400 font-bold">Permanent Deletion / Removal</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExecuteDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

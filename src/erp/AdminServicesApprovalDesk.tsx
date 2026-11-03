import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Building2,
  User,
  ShieldCheck,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Radio,
  FileCheck,
  Sparkles,
  X,
  FolderPlus,
  Tags,
  Check,
  Edit3,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Lock,
  Unlock,
  ShieldAlert,
  Save,
  RotateCcw,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { CustomServiceRequest, CustomCategoryRequest, AdminUser } from '../types';

interface AdminServicesApprovalDeskProps {
  activeAdminUser?: AdminUser | null;
  onRefreshAll?: () => void;
  onOpenBroadcastModal?: () => void;
}

export const AdminServicesApprovalDesk: React.FC<AdminServicesApprovalDeskProps> = ({
  activeAdminUser,
  onRefreshAll,
  onOpenBroadcastModal,
}) => {
  // Main Desk Tab: 'CATEGORIES' (Category & Sub-Category Governance) vs 'SERVICES' (Direct Custom Services)
  const [activeDeskTab, setActiveDeskTab] = useState<'CATEGORIES' | 'SERVICES'>('CATEGORIES');

  // Categories & Sub-Categories State
  const [categoryRequests, setCategoryRequests] = useState<CustomCategoryRequest[]>(() =>
    db.getCustomCategoryRequests()
  );

  // Services State
  const [serviceRequests, setServiceRequests] = useState<CustomServiceRequest[]>(() =>
    db.getCustomServiceRequests()
  );

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal 1: Admin Add Master Category & Sub-Category (Admin Only)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');

  // Modal 2: Admin Add Sub-Category under Existing Category (Admin Only)
  const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
  const [targetCategoryForSub, setTargetCategoryForSub] = useState('Private Air Charter');
  const [additionalSubCategoryName, setAdditionalSubCategoryName] = useState('');

  // Modal 3: Admin Add Master Service (Admin Only)
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [newMasterCategory, setNewMasterCategory] = useState<string>('Private Air Charter');
  const [newMasterServiceName, setNewMasterServiceName] = useState<string>('');

  const reload = () => {
    setCategoryRequests(db.getCustomCategoryRequests());
    setServiceRequests(db.getCustomServiceRequests());
    if (onRefreshAll) onRefreshAll();
  };

  // Dynamic Category Modification & Inline Action States
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editSubCategory, setEditSubCategory] = useState<string>('');
  const [customSubInput, setCustomSubInput] = useState<string>('');
  const [moreOptionsReqId, setMoreOptionsReqId] = useState<string | null>(null);

  // Authority check: Admin Only Authority
  const isAdmin =
    !activeAdminUser ||
    activeAdminUser.role === 'ADMIN' ||
    activeAdminUser.role === 'SUPER_ADMIN' ||
    (activeAdminUser.level ?? 0) >= 5;

  const approvedCategories = db.getApprovedCategories();
  const approvedSubCategories = editCategory ? db.getApprovedSubCategories(editCategory) : [];

  const handleStartEdit = (req: CustomCategoryRequest) => {
    setEditingReqId(req.id);
    setEditCategory(req.category_name);
    setEditSubCategory(req.sub_category_name);
    setCustomSubInput('');
    setMoreOptionsReqId(null);
  };

  const handleCancelEdit = () => {
    setEditingReqId(null);
    setEditCategory('');
    setEditSubCategory('');
    setCustomSubInput('');
  };

  const handleSaveEdit = (req: CustomCategoryRequest) => {
    const finalSub = editSubCategory === '__custom__' ? customSubInput.trim() : editSubCategory.trim();
    if (!editCategory.trim() || !finalSub) {
      setFeedback({ type: 'error', message: 'Category and Sub-Category must both be selected/specified.' });
      return;
    }
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.adminUpdateCategoryRequest(
      req.id,
      { category_name: editCategory.trim(), sub_category_name: finalSub },
      adminName
    );
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setEditingReqId(null);
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleToggleSuspend = (req: CustomCategoryRequest) => {
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.adminToggleCategorySuspend(req.id, adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setMoreOptionsReqId(null);
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleSetLock = (req: CustomCategoryRequest, lockStatus: 'NONE' | 'SOFT_LOCKED' | 'HARD_LOCKED') => {
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.adminSetCategoryLock(req.id, lockStatus, adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setMoreOptionsReqId(null);
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // --- Category Handlers ---
  const handleApproveCategory = (req: CustomCategoryRequest) => {
    const adminId = activeAdminUser?.admin_id || 'admin_primary';
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.approveCustomCategory(req.id, adminId, adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleRejectCategory = (req: CustomCategoryRequest) => {
    const reason = window.prompt(
      `Enter reason for declining proposed category "${req.category_name} > ${req.sub_category_name}":`,
      'Does not conform to standard civil aviation taxonomy or requires DGCA / FAA accreditation.'
    );
    if (!reason) return;

    const adminId = activeAdminUser?.admin_id || 'admin_primary';
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.rejectCustomCategory(req.id, adminId, adminName, reason);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCreateMasterCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newSubCategoryName.trim()) {
      setFeedback({ type: 'error', message: 'Category Name and initial Sub-Category Name are both required.' });
      return;
    }
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.addPlatformMasterCategory(newCategoryName.trim(), newSubCategoryName.trim(), adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setNewCategoryName('');
      setNewSubCategoryName('');
      setShowAddCategoryModal(false);
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCreateSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!additionalSubCategoryName.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a valid Sub-Category title.' });
      return;
    }
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.addPlatformSubCategory(targetCategoryForSub, additionalSubCategoryName.trim(), adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setAdditionalSubCategoryName('');
      setShowAddSubCategoryModal(false);
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // --- Service Handlers ---
  const handleApproveService = (req: CustomServiceRequest) => {
    const adminId = activeAdminUser?.admin_id || 'admin_primary';
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.approveCustomService(req.id, adminId, adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleRejectService = (req: CustomServiceRequest) => {
    const reason = window.prompt(
      `Enter reason for declining custom service "${req.service_name}":`,
      'Requires Part-145 or DGCA regulatory documentation before addition to platform catalog.'
    );
    if (!reason) return;

    const adminId = activeAdminUser?.admin_id || 'admin_primary';
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.rejectCustomService(req.id, adminId, adminName, reason);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCreateMasterService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterServiceName.trim()) {
      setFeedback({ type: 'error', message: 'Please provide a valid service name.' });
      return;
    }
    const adminName = activeAdminUser?.name || 'Administrator';
    const res = db.addPlatformMasterService(newMasterCategory, newMasterServiceName.trim(), adminName);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setNewMasterServiceName('');
      setShowAddMasterModal(false);
      reload();
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Live platform categories for dropdowns
  const liveTaxonomy = db.getAviationTaxonomy();
  const liveCategories = Object.keys(liveTaxonomy).filter((c) => c !== 'All');

  // Filtered requests based on active tab
  const filteredCategoryReqs = categoryRequests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.category_name.toLowerCase().includes(q) ||
        r.sub_category_name.toLowerCase().includes(q) ||
        r.business_name.toLowerCase().includes(q) ||
        r.requested_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredServiceReqs = serviceRequests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.service_name.toLowerCase().includes(q) ||
        r.business_name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.requested_by.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCategoriesCount = categoryRequests.filter((r) => r.status === 'PENDING_APPROVAL').length;
  const pendingServicesCount = serviceRequests.filter((r) => r.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Banner & Action Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  Non-Listing Information &amp; Aviation Catalog Desk
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin Only Authority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and approve non-listing requests (&quot;Other&quot; Categories &amp; Sub-Categories proposed by registered business accounts), or sovereignly create new Categories &amp; Services to expand the platform catalog.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Admin Only Option: Add Platform Category & Sub-Category */}
          <button
            id="admin-add-category-btn"
            onClick={() => setShowAddCategoryModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center space-x-1.5 shadow-md cursor-pointer text-xs"
            title="Admin Option: Add new Category & Sub-Category directly to the portal catalog"
          >
            <FolderPlus className="w-4 h-4 text-slate-950" />
            <span>+ Add Category &amp; Sub-Category</span>
          </button>

          {/* Admin Only Option: Add Sub-Category under Existing */}
          <button
            id="admin-add-subcategory-btn"
            onClick={() => setShowAddSubCategoryModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer text-xs"
            title="Admin Option: Add a Sub-Category under an existing category"
          >
            <Tags className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Add Sub-Category</span>
          </button>

          {/* Admin Add Master Service */}
          <button
            id="admin-add-service-btn"
            onClick={() => setShowAddMasterModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer text-xs"
            title="Admin Option: Add a Master Service offering to the platform"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Add Master Service</span>
          </button>

          {onOpenBroadcastModal && (
            <button
              onClick={onOpenBroadcastModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center space-x-1.5 shadow-md cursor-pointer text-xs"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast (Zone/Country)</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border transition-all ${
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
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Primary Sub-Tab Switcher: Category Approvals vs Direct Services Approvals */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveDeskTab('CATEGORIES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeDeskTab === 'CATEGORIES'
                ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Category &amp; Sub-Category Requests</span>
            {pendingCategoriesCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeDeskTab === 'CATEGORIES' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500 text-slate-950'
              }`}>
                {pendingCategoriesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveDeskTab('SERVICES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeDeskTab === 'SERVICES'
                ? 'bg-sky-500 text-slate-950 shadow-md ring-1 ring-sky-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Custom Service Offerings</span>
            {pendingServicesCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                activeDeskTab === 'SERVICES' ? 'bg-slate-950 text-sky-300' : 'bg-sky-500 text-slate-950'
              }`}>
                {pendingServicesCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          {activeDeskTab === 'CATEGORIES'
            ? `${categoryRequests.length} Total Category Requests Recorded`
            : `${serviceRequests.length} Total Custom Service Requests Recorded`}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((st) => {
            const currentList = activeDeskTab === 'CATEGORIES' ? categoryRequests : serviceRequests;
            const count = st === 'ALL' ? currentList.length : currentList.filter((r) => r.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer text-xs ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL'
                  ? `All (${count})`
                  : st === 'PENDING_APPROVAL'
                  ? `Pending (${count})`
                  : st === 'APPROVED'
                  ? `Approved (${count})`
                  : `Rejected (${count})`}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeDeskTab === 'CATEGORIES'
                ? 'Search category, sub-category, business...'
                : 'Search service, operator, category...'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: CATEGORIES & SUB-CATEGORIES APPROVAL QUEUE                        */}
      {/* ========================================================================= */}
      {activeDeskTab === 'CATEGORIES' && (
        <div className="space-y-3">
          {filteredCategoryReqs.length === 0 ? (
            <div className="p-10 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <FolderPlus className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-50" />
              <p className="text-xs">No category &amp; sub-category requests match the selected filter.</p>
              <div className="mt-3">
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all inline-flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Master Category &amp; Sub-Category</span>
                </button>
              </div>
            </div>
          ) : (
            filteredCategoryReqs.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-slate-700 transition-colors shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    {editingReqId === req.id ? (
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-amber-500/50 space-y-2">
                        <div className="text-[11px] font-bold text-amber-400 font-mono flex items-center space-x-1">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Admin Category &amp; Sub-Category Override</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">Category:</span>
                            <select
                              value={editCategory}
                              onChange={(e) => {
                                setEditCategory(e.target.value);
                                const subCats = db.getApprovedSubCategories(e.target.value);
                                setEditSubCategory(subCats[0] || '__custom__');
                              }}
                              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-amber-400 font-sans"
                            >
                              {approvedCategories.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <span className="text-slate-500 font-bold">→</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">Sub-Category:</span>
                            <select
                              value={editSubCategory}
                              onChange={(e) => setEditSubCategory(e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-amber-400 font-sans"
                            >
                              {approvedSubCategories.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                              <option value="__custom__">+ Custom Sub-Category...</option>
                            </select>
                          </div>
                          {editSubCategory === '__custom__' && (
                            <input
                              type="text"
                              value={customSubInput}
                              onChange={(e) => setCustomSubInput(e.target.value)}
                              placeholder="Enter sub-category title"
                              className="bg-slate-900 border border-amber-500/50 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-amber-400 font-sans"
                            />
                          )}
                          <div className="flex items-center space-x-1 ml-auto">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(req)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow cursor-pointer"
                              title="Save and commit category change"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                              title="Cancel editing"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{req.category_name}</span>
                        <span className="text-slate-500">→</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {req.sub_category_name}
                        </span>
                        {req.original_category_name && req.original_category_name !== req.category_name && (
                          <span className="text-[10px] text-slate-500 font-mono italic">
                            (Overridden from: {req.original_category_name} → {req.original_sub_category_name})
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 pt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-semibold text-slate-300">{req.business_name}</span>
                      <span>•</span>
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Requested by {req.requested_by}</span>
                    </div>
                  </div>

                  {/* UI INJECTION: Inline Action Buttons immediately to the left of status badge */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {isAdmin && (
                      <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(req)}
                          className="px-2 py-1 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                          title="Edit: Modify Category & Sub-Category details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        {/* Suspend Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(req)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                            req.is_suspended || req.status === 'SUSPENDED'
                              ? 'text-rose-300 bg-rose-950/50 border border-rose-500/40'
                              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                          }`}
                          title={
                            req.is_suspended || req.status === 'SUSPENDED'
                              ? 'Unsuspend: Re-activate request'
                              : 'Suspend: Temporarily halt request'
                          }
                        >
                          {req.is_suspended || req.status === 'SUSPENDED' ? (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="hidden sm:inline">Resume</span>
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">Suspend</span>
                            </>
                          )}
                        </button>

                        {/* Soft Lock Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSetLock(req, req.lock_status === 'SOFT_LOCKED' ? 'NONE' : 'SOFT_LOCKED')
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                            req.lock_status === 'SOFT_LOCKED'
                              ? 'text-amber-300 bg-amber-950/50 border border-amber-500/40'
                              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                          }`}
                          title={
                            req.lock_status === 'SOFT_LOCKED'
                              ? 'Release Soft Lock'
                              : 'Soft Lock: Read-only to user, active internally'
                          }
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Soft Lock</span>
                        </button>

                        {/* Hard Lock Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSetLock(req, req.lock_status === 'HARD_LOCKED' ? 'NONE' : 'HARD_LOCKED')
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                            req.lock_status === 'HARD_LOCKED'
                              ? 'text-rose-300 bg-rose-950/60 border border-rose-500/50'
                              : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800'
                          }`}
                          title={
                            req.lock_status === 'HARD_LOCKED'
                              ? 'Release Hard Lock'
                              : 'Hard Lock: Completely freeze record from non-admin interaction'
                          }
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          <span className="hidden sm:inline">Hard Lock</span>
                        </button>
                      </div>
                    )}

                    {/* Lock & Suspension Badges */}
                    {req.status === 'SUSPENDED' || req.is_suspended ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
                        <PauseCircle className="w-3 h-3 text-rose-400" />
                        <span>SUSPENDED</span>
                      </span>
                    ) : null}

                    {req.lock_status === 'SOFT_LOCKED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>SOFT LOCKED</span>
                      </span>
                    ) : req.lock_status === 'HARD_LOCKED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
                        <ShieldAlert className="w-2.5 h-2.5" />
                        <span>HARD LOCKED</span>
                      </span>
                    ) : null}

                    {/* Primary Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : req.status === 'SUSPENDED'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {req.status === 'PENDING_APPROVAL' ? 'PENDING ADMIN APPROVAL' : req.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                    Proposed Scope &amp; Business Justification:
                  </span>
                  {req.description}
                </div>

                {req.status === 'REJECTED' && req.rejection_reason && (
                  <div className="p-2.5 bg-rose-950/40 rounded-xl border border-rose-500/30 text-rose-200 text-[11px]">
                    <strong>Decline Reason:</strong> {req.rejection_reason}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="text-slate-500 font-mono">
                    Submitted: {new Date(req.requested_at).toLocaleString()}
                    {req.reviewed_by && (
                      <span> • Reviewed by: {req.reviewed_by}</span>
                    )}
                  </div>

                  {req.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRejectCategory(req)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-bold transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleApproveCategory(req)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer shadow-md flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve &amp; Add to Portal</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: DIRECT CUSTOM SERVICES APPROVAL QUEUE                             */}
      {/* ========================================================================= */}
      {activeDeskTab === 'SERVICES' && (
        <div className="space-y-3">
          {filteredServiceReqs.length === 0 ? (
            <div className="p-10 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800">
              <Layers className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-50" />
              <p className="text-xs">No service addition requests match the selected filter.</p>
              <div className="mt-3">
                <button
                  onClick={() => setShowAddMasterModal(true)}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all inline-flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Master Platform Service</span>
                </button>
              </div>
            </div>
          ) : (
            filteredServiceReqs.map((req) => (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-slate-700 transition-colors shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{req.service_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {req.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-semibold text-slate-300">{req.business_name}</span>
                      <span>•</span>
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Requested by {req.requested_by}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {req.status === 'PENDING_APPROVAL' ? 'PENDING APPROVAL' : req.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                    Operator Description &amp; Technical Scope:
                  </span>
                  {req.description}
                </div>

                {req.status === 'REJECTED' && req.rejection_reason && (
                  <div className="p-2.5 bg-rose-950/40 rounded-xl border border-rose-500/30 text-rose-200 text-[11px]">
                    <strong>Decline Reason:</strong> {req.rejection_reason}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="text-slate-500 font-mono">
                    Requested on: {new Date(req.requested_at).toLocaleString()}
                    {req.reviewed_by && (
                      <span> • Reviewed by: {req.reviewed_by}</span>
                    )}
                  </div>

                  {req.status === 'PENDING_APPROVAL' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRejectService(req)}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-bold transition-colors cursor-pointer flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApproveService(req)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer shadow-md flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve &amp; Add to Portal</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Admin Add Master Category & Sub-Category (Admin Only)            */}
      {/* ========================================================================= */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Master Category &amp; Sub-Category</h3>
                  <p className="text-xs text-amber-400/90 font-mono">Option Reserved Solely for Platform Administrators</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMasterCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Category Title * (e.g. Pilot Training &amp; Flight Academies)
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Pilot Training &amp; Academies or Drone Aeronautical Labs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Initial Sub-Category Specialization * (e.g. Commercial Pilot License - CPL)
                </label>
                <input
                  type="text"
                  required
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                  placeholder="e.g. Commercial Pilot License (CPL) Ground &amp; Flight Training"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-2 text-[11px] text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Once published by Admin, this new Category &amp; Sub-Category becomes permanently active across the entire portal, including the business onboarding forms, listing filters, and CRM pipeline.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Publish Category to Portal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Admin Add Sub-Category under Existing Category (Admin Only)      */}
      {/* ========================================================================= */}
      {showAddSubCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Tags className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Sub-Category under Existing Category</h3>
                  <p className="text-xs text-slate-400">Admin Sovereign Sub-Category Expansion</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSubCategoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Category *</label>
                <select
                  value={targetCategoryForSub}
                  onChange={(e) => setTargetCategoryForSub(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold cursor-pointer"
                >
                  {liveCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Sub-Category Title *</label>
                <input
                  type="text"
                  required
                  value={additionalSubCategoryName}
                  onChange={(e) => setAdditionalSubCategoryName(e.target.value)}
                  placeholder="e.g. Type Rating (A320 / B737) or Night Flying Endorsement"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddSubCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Tags className="w-4 h-4" />
                  <span>Add Sub-Category to Portal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Admin Add Master Platform Service                                */}
      {/* ========================================================================= */}
      {showAddMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add Master Aviation Service</h3>
                  <p className="text-xs text-slate-400">Admin Sovereign Master Service Addition</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMasterModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMasterService} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Aviation Category *</label>
                <select
                  value={newMasterCategory}
                  onChange={(e) => setNewMasterCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold cursor-pointer"
                >
                  {liveCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">New Service Title *</label>
                <input
                  type="text"
                  required
                  value={newMasterServiceName}
                  onChange={(e) => setNewMasterServiceName(e.target.value)}
                  placeholder="e.g. VIP Helicopter Helipad Shuttles or AOG Rapid Engine Boroscope"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 font-semibold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddMasterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Service to Platform</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

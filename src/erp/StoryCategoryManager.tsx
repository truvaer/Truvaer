import React, { useState, useMemo } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  Sparkles,
  X,
  FileText,
  Copy,
  Layers,
  ArrowRight,
  TrendingUp,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { StoryCategory, AdminUser, RegularUser } from '../types';

interface StoryCategoryManagerProps {
  activeAdminUser?: AdminUser | null;
  currentUser?: RegularUser | null;
  onRefreshAll?: () => void;
}

const BADGE_COLOR_OPTIONS = [
  { label: 'Aero Blue', value: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { label: 'Emerald Jet', value: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { label: 'Amber Apron', value: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { label: 'Purple VIP', value: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { label: 'Cyan Cargo', value: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { label: 'Indigo Fleet', value: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { label: 'Sky Avionics', value: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  { label: 'Rose Directive', value: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
];

export const StoryCategoryManager: React.FC<StoryCategoryManagerProps> = ({
  activeAdminUser,
  currentUser,
  onRefreshAll,
}) => {
  // L8 users and Super Admin only have Edit access
  const isL8OrSuperAdmin = Boolean(
    activeAdminUser?.level === 8 ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com'
  );

  const [categories, setCategories] = useState<StoryCategory[]>(() => db.getStoryCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoryCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [description, setDescription] = useState('');
  const [colorBadge, setColorBadge] = useState(BADGE_COLOR_OPTIONS[0].value);
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const reloadData = () => {
    setCategories(db.getStoryCategories());
    if (onRefreshAll) onRefreshAll();
  };

  // Auto-generate slug when name changes (unless user explicitly customized slug)
  const handleNameChange = (name: string) => {
    setCategoryName(name);
    if (!isCustomSlug) {
      const generated = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setSlug('');
    setIsCustomSlug(false);
    setDescription('');
    setColorBadge(BADGE_COLOR_OPTIONS[0].value);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: StoryCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setSlug(cat.slug);
    setIsCustomSlug(true);
    setDescription(cat.description || '');
    setColorBadge(cat.colorBadge || BADGE_COLOR_OPTIONS[0].value);
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Story category editing and creation is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    if (!categoryName.trim()) {
      alert('Please enter a valid category name.');
      return;
    }

    const finalSlug = (slug.trim() || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) || 'story-category';

    const res = db.saveStoryCategory({
      id: editingCategory?.id,
      name: categoryName.trim(),
      slug: finalSlug,
      description: description.trim(),
      colorBadge,
      status,
    });

    reloadData();
    setIsModalOpen(false);
    showToast(res.message);
  };

  const handleDeleteCategory = (cat: StoryCategory) => {
    if (!isL8OrSuperAdmin) {
      alert('Access Denied: Story category deletion is strictly restricted to Level 8 Sovereign Users and Super Admins only.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete story category "${cat.name}"?`)) {
      return;
    }
    const res = db.deleteStoryCategory(cat.id);
    reloadData();
    showToast(res.message);
  };

  const handleCopySlug = (s: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(s);
      showToast(`Copied slug "#${s}" to clipboard.`);
    }
  };

  // Filtered List
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || cat.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const totalStories = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.story_count || 0), 0);
  }, [categories]);

  const topCategory = useMemo(() => {
    if (categories.length === 0) return null;
    return [...categories].sort((a, b) => (b.story_count || 0) - (a.story_count || 0))[0];
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* L8 / Super Admin Access Level Banner */}
      {!isL8OrSuperAdmin && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-center space-x-3 text-amber-200 text-xs shadow-md">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold text-amber-300">Read-Only Mode:</strong> Story Category editing, creation, and deletion are restricted strictly to Level 8 Sovereign Users and Super Admin only. Other users and lower administrative tiers have read-only access.
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">Story Category Management</h2>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                  Feed &amp; Articles Taxonomy
                </span>
                {isL8OrSuperAdmin ? (
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    L8 / Super Admin Edit Access
                  </span>
                ) : (
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-700 flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Read-Only</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Define official categories, slugs, and targeted hashtags for aviation marketing posts, bulletins, and fleet stories.
              </p>
            </div>
          </div>
        </div>

        {isL8OrSuperAdmin ? (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all self-start lg:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Story Category</span>
          </button>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 font-bold text-xs flex items-center space-x-2 shrink-0">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>L8 / Super Admin Edit Only</span>
          </div>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Categories</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{categories.length}</div>
          <div className="text-[10px] text-slate-500">Configured across feed filters</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active in Feed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {categories.filter((c) => c.status === 'ACTIVE').length}
          </div>
          <div className="text-[10px] text-slate-500">Currently available for creators</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Tagged Stories</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{totalStories}</div>
          <div className="text-[10px] text-slate-500">Total posts &amp; articles published</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Top Category</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-base font-bold text-white truncate">
            {topCategory?.name || 'N/A'}
          </div>
          <div className="text-[10px] text-purple-300 font-mono">
            {topCategory ? `${topCategory.story_count} stories tagged` : 'No stories yet'}
          </div>
        </div>
      </div>

      {/* Data Table Container with Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category name, slug, or keywords..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase hidden sm:inline">Status:</span>
            {(['ALL', 'ACTIVE', 'ARCHIVED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">URL Slug</th>
                <th className="py-3 px-4 text-center">Story Count</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Tags className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">No story categories match your filter.</p>
                    <p className="text-[11px] text-slate-600 mt-1">Try adjusting the search query or create a new category.</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{cat.id}</td>

                    {/* Name & Badge Preview */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${cat.colorBadge || 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                          {cat.name}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 max-w-sm">
                          {cat.description}
                        </p>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <span className="text-slate-500 font-semibold">/category/</span>
                        <span className="text-amber-300 font-bold">{cat.slug}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySlug(cat.slug)}
                          className="p-1 text-slate-500 hover:text-amber-400 rounded transition-colors cursor-pointer"
                          title="Copy slug link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Story Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-800 text-sky-300 border border-slate-700">
                        {cat.story_count || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          cat.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {cat.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isL8OrSuperAdmin ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700 flex items-center space-x-1">
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                            <span>Read-Only</span>
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Tags className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingCategory ? 'Edit Story Category' : 'Create New Story Category'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Category Name, auto-generated URL slug, and visual badge theme
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Flight Simulator Type Ratings"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-colors"
                  required
                />
              </div>

              {/* Slug (Auto-generated with manual override) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Slug (Auto-generated URL identifier)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isCustomSlug ? 'Manual Edit Enabled' : 'Auto-Syncing with Name'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsCustomSlug(true);
                      }}
                      placeholder="flight-simulator-type-ratings"
                      className="w-full pl-6 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs font-mono text-amber-300 placeholder-slate-600 outline-none transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSlug(false);
                      const generated = categoryName
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                      setSlug(generated);
                    }}
                    className="px-2.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                    title="Reset to auto-generated slug"
                  >
                    Reset Auto
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Summary of topics, aircraft classes, or certifications falling under this category..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-colors resize-none"
                />
              </div>

              {/* Badge Theme Color Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Badge Theme Palette</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BADGE_COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setColorBadge(opt.value)}
                      className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${opt.value} ${
                        colorBadge === opt.value
                          ? 'ring-2 ring-white/80 shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Radio */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-300">Publication Status</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="catStatus"
                      checked={status === 'ACTIVE'}
                      onChange={() => setStatus('ACTIVE')}
                      className="accent-amber-500"
                    />
                    <span>Active (Available for stories &amp; feed filter)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="radio"
                      name="catStatus"
                      checked={status === 'ARCHIVED'}
                      onChange={() => setStatus('ARCHIVED')}
                      className="accent-amber-500"
                    />
                    <span>Archived (Hidden from new posts)</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

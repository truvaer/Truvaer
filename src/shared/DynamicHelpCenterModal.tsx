import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Compass,
  CheckCircle2,
  MapPin,
  ListOrdered,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { RegularUser, AdminUser, HelpArticle, AppTab } from '../types';

interface DynamicHelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegularUser | null;
  activeAdminUser?: AdminUser | null;
  onNavigateToTab?: (tab: AppTab, subTab?: string) => void;
}

export const DynamicHelpCenterModal: React.FC<DynamicHelpCenterModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeAdminUser,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Fetch RBAC permission-filtered articles
  const articles: HelpArticle[] = useMemo(() => {
    return db.getHelpDirectory(currentUser, activeAdminUser);
  }, [currentUser, activeAdminUser]);

  // Filter based on search query and category
  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return articles.filter((art) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        art.category.toUpperCase() === selectedCategory.toUpperCase();

      if (!matchesCategory) return false;

      if (!q) return true;

      const titleMatch = art.title.toLowerCase().includes(q);
      const summaryMatch = art.summary.toLowerCase().includes(q);
      const contentMatch = art.content.toLowerCase().includes(q);
      const keywordMatch = art.keywords?.some((k) => k.toLowerCase().includes(q));
      const moduleMatch = art.moduleId.toLowerCase().includes(q);

      return titleMatch || summaryMatch || contentMatch || keywordMatch || moduleMatch;
    });
  }, [articles, searchQuery, selectedCategory]);

  const activeArticle = useMemo(() => {
    if (!selectedArticleId) {
      return filteredArticles[0] || articles[0] || null;
    }
    return articles.find((a) => a.id === selectedArticleId) || filteredArticles[0] || null;
  }, [selectedArticleId, filteredArticles, articles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  Help &amp; Knowledge Center
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                  RBAC Filtered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Documentation, workflow manuals, and operational guides tailored to your active role and clearance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Help Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Categories */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles by topic, keywords, module ID (e.g. 'campaign', 'wallet', 'mod_marketing')..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-mono">
            {['ALL', 'OPERATIONS', 'HR', 'FINANCE', 'PUBLICATION', 'REPORTS'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Left Index + Right Article Reader */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Article List / Index (5 cols) */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 bg-slate-950/30">
            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                No documentation found matching &quot;{searchQuery}&quot;. Try adjusting your keywords.
              </div>
            ) : (
              filteredArticles.map((art) => {
                const isSelected = activeArticle?.id === art.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-amber-500/20">
                        {art.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {art.moduleId}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white leading-snug line-clamp-1">
                      {art.title}
                    </div>
                    {art.navigationRoute && (
                      <div className="text-[10px] text-amber-400/90 font-mono truncate mt-0.5 flex items-center space-x-1">
                        <Compass className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{art.navigationRoute}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {art.summary}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Article Reader (7 cols) */}
          <div className="md:col-span-7 overflow-y-auto p-5 space-y-5 bg-slate-900/40">
            {activeArticle ? (
              <div className="space-y-4">
                {/* Article Header */}
                <div className="space-y-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {activeArticle.category}
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      Module: {activeArticle.moduleId}
                    </span>
                    {activeArticle.requiredRoleLevels && (
                      <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Level {Math.min(...activeArticle.requiredRoleLevels)}+ Clearance
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white leading-snug">
                    {activeArticle.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {activeArticle.summary}
                  </p>
                </div>

                {/* Click-by-Click Navigation Route */}
                {activeArticle.navigationRoute && (
                  <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl flex items-center space-x-3 shadow-md">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>Exact Navigation Route:</span>
                      </div>
                      <div className="font-mono text-xs text-white font-bold tracking-tight mt-0.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 inline-block">
                        {activeArticle.navigationRoute}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step-by-Step Procedure Checklist */}
                {activeArticle.steps && activeArticle.steps.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      <ListOrdered className="w-4 h-4 text-emerald-400" />
                      <span>Step-by-Step Instructions:</span>
                    </div>
                    <div className="space-y-2">
                      {activeArticle.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start space-x-3 hover:border-slate-700 transition-colors shadow-sm"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5 shadow-sm">
                            {idx + 1}
                          </span>
                          <div className="text-xs text-slate-200 leading-relaxed font-sans min-w-0">
                            {st}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Detailed Body */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Technical Specifications &amp; Rules:
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed space-y-3 whitespace-pre-line bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                    {activeArticle.content}
                  </div>
                </div>

                {/* Keywords Tagging */}
                {activeArticle.keywords && activeArticle.keywords.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">
                      Indexed Search Keywords:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeArticle.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Jump to Module CTA */}
                {activeArticle.routeAction && (
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Direct Application Shortcut
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onNavigateToTab && activeArticle.routeAction?.tab) {
                          onNavigateToTab(
                            activeArticle.routeAction.tab as AppTab,
                            activeArticle.routeAction.subTab
                          );
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <span>{activeArticle.routeAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 italic">
                Select an article from the list to view instructions.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 px-5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>
              All help entries are verified by Truvaer Sovereign Governance and auto-synced with active platform release flags.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

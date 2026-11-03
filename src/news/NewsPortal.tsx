import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Clock,
  ThumbsUp,
  Share2,
  Filter,
  Search,
  Plus,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Flame,
  Globe,
  Radio,
  X,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { NewsArticle, RegularUser, BusinessProfile } from '../types';
import { LiveMarketTicker } from '../marketing/LiveMarketTicker';
import { GoogleAdSlot } from '../marketing/GoogleAdSlot';

interface NewsPortalProps {
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  onOpenComms?: () => void;
}

export const NewsPortal: React.FC<NewsPortalProps> = ({
  currentUser,
  currentBusiness,
  onOpenComms,
}) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Submit article form
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitSubtitle, setSubmitSubtitle] = useState('');
  const [submitCategory, setSubmitCategory] = useState<'Aviation' | 'Travel' | 'Career' | 'Technology' | 'Community'>('Aviation');
  const [submitContent, setSubmitContent] = useState('');
  const [submitImageUrl, setSubmitImageUrl] = useState('');
  const [submitNotice, setSubmitNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadNews = () => {
    const liveNews = db.getNews();
    setArticles([...liveNews]);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const filteredArticles = articles.filter((a) => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.author_org.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const featuredPrimary = articles.find((a) => a.pinned_slot === 'Primary') || articles[0];
  const otherArticles = filteredArticles.filter((a) => a.id !== featuredPrimary?.id);

  // Requirement: Remove Latency information for Standard Users
  const isStandardUser = !currentBusiness && (currentUser ? (currentUser.role === 'STANDARD_USER' || !currentUser.role) : true);

  const handleSubmitArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTitle.trim() || !submitContent.trim()) {
      setSubmitNotice({ type: 'error', text: 'Title and article content are required.' });
      return;
    }

    const authorOrg = currentBusiness
      ? currentBusiness.organization_name
      : currentUser
      ? `@${currentUser.username} (${[currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || 'Aviator'})`
      : 'Truvaer Contributor';

    const authorId = currentUser?.user_id || currentBusiness?.business_id || 'contributor_guest';

    const res = db.submitNewsArticle(authorOrg, authorId, {
      title: submitTitle.trim(),
      subtitle: submitSubtitle.trim() || 'Aviation industry bulletin from Truvaer member',
      category: submitCategory,
      content: submitContent.trim(),
      image_url:
        submitImageUrl.trim() ||
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    });

    if (res.success) {
      setSubmitNotice({
        type: 'success',
        text: 'Article submitted successfully for editorial and compliance verification.',
      });
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitTitle('');
        setSubmitSubtitle('');
        setSubmitContent('');
        setSubmitImageUrl('');
        setSubmitNotice(null);
        loadNews();
      }, 2000);
    } else {
      setSubmitNotice({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Requirement 2: Live feed should come when the news portal gets live not at marketing portal */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900/80">
        <LiveMarketTicker
          onOpenComms={onOpenComms}
          activeListingsCount={articles.length}
          isStandardUser={isStandardUser}
        />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400">
            <Radio className="w-4 h-4 animate-pulse text-rose-500" />
            <span className="font-bold uppercase tracking-widest">LIVE AVIATION NEWS DESK</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Global Dispatch &amp; Market Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Aviation World News &amp; Airspace Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time industry bulletins, sustainable aviation fuel reports, pilot briefings, and verified carrier announcements.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Industry News</span>
          </button>
        </div>
      </div>

      {/* Requirement 7: Google Ads responsive placement inside news stream */}
      <GoogleAdSlot adSlotId="news-portal-top-banner" />

      {/* Category Navigation & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Aviation', 'Travel', 'Career', 'Technology', 'Community'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news, topics, author..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Featured Primary Story Hero */}
      {featuredPrimary && selectedCategory === 'All' && !searchQuery && (
        <div
          onClick={() => setSelectedArticle(featuredPrimary)}
          className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 group cursor-pointer shadow-2xl transition-transform hover:-translate-y-0.5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px]">
            <div className="lg:col-span-7 relative h-64 lg:h-auto overflow-hidden">
              <img
                src={featuredPrimary.image_url}
                alt={featuredPrimary.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent lg:hidden" />
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Breaking Headline</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                  {featuredPrimary.category}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-slate-900/90">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                  <span>By {featuredPrimary.author_org}</span>
                  <span>•</span>
                  <span>{new Date(featuredPrimary.published_at).toLocaleDateString()}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {featuredPrimary.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                  {featuredPrimary.subtitle}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 mt-4">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1 text-slate-300 font-mono">
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                    <span>{featuredPrimary.likes_count} upvotes</span>
                  </span>
                </div>
                <span className="text-blue-400 font-bold group-hover:underline flex items-center space-x-1">
                  <span>Read Full Article</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {otherArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-slate-700 shadow-lg transition-all hover:-translate-y-1"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={art.image_url}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                  {art.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                  <span>{art.author_org}</span>
                  <span>•</span>
                  <span>{new Date(art.published_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">{art.subtitle}</p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1 font-mono text-[11px]">
                <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                <span>{art.likes_count}</span>
              </span>
              <span className="text-blue-400 font-semibold text-[11px] group-hover:underline">
                Read Dispatch →
              </span>
            </div>
          </div>
        ))}
      </div>

      {otherArticles.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
          No news articles found matching the filter or search query.
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="relative h-64 shrink-0 overflow-hidden">
              <img
                src={selectedArticle.image_url}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase">
                  {selectedArticle.category}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-200 text-xs font-mono">
                  {new Date(selectedArticle.published_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {selectedArticle.title}
                </h2>
                <div className="text-xs text-slate-400 mt-1">Published by: {selectedArticle.author_org}</div>
              </div>

              <div className="text-sm text-slate-300 font-medium italic border-l-2 border-blue-500 pl-3">
                {selectedArticle.subtitle}
              </div>

              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
                {selectedArticle.content}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <ThumbsUp className="w-4 h-4 text-blue-400" />
                  <span>{selectedArticle.likes_count} Aviators appreciated this dispatch</span>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit News Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center space-x-2.5">
                <Newspaper className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Submit Aviation Article</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitNotice && (
              <div
                className={`mx-5 mt-4 p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                  submitNotice.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                }`}
              >
                {submitNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{submitNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitArticle} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                  Headline / Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={submitTitle}
                  onChange={(e) => setSubmitTitle(e.target.value)}
                  placeholder="e.g. New Gulfstream G700 Fleet Deployed at Dubai DWC Terminal"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                  Subheading / Short Summary
                </label>
                <input
                  type="text"
                  value={submitSubtitle}
                  onChange={(e) => setSubmitSubtitle(e.target.value)}
                  placeholder="Brief 1-2 sentence overview of the dispatch"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Category
                  </label>
                  <select
                    value={submitCategory}
                    onChange={(e) => setSubmitCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Aviation">Aviation</option>
                    <option value="Travel">Travel</option>
                    <option value="Career">Career</option>
                    <option value="Technology">Technology</option>
                    <option value="Community">Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                    Hero Image URL
                  </label>
                  <input
                    type="url"
                    value={submitImageUrl}
                    onChange={(e) => setSubmitImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
                  Article Content *
                </label>
                <textarea
                  required
                  rows={5}
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  placeholder="Enter full dispatch text, operational context, and details..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

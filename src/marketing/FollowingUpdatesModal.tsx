import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellRing,
  Building2,
  Users,
  Send,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  Sparkles,
  CheckCircle2,
  Image,
  Tag,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { BusinessPost, BusinessProfile, RegularUser, ServiceListing } from '../types';
import { db } from '../data/mockDatabase';

interface FollowingUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: RegularUser | null;
  currentBusiness?: BusinessProfile | null;
  onNavigateToListing?: (businessId: string) => void;
  onRefreshData?: () => void;
}

export const FollowingUpdatesModal: React.FC<FollowingUpdatesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentBusiness,
  onNavigateToListing,
  onRefreshData,
}) => {
  if (!isOpen) return null;

  const userId = currentUser?.user_id || 'user_standard_demo';

  // Following list
  const [followedBizIds, setFollowedBizIds] = useState<string[]>([]);
  const [allPosts, setAllPosts] = useState<BusinessPost[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);

  // Post creation state (for business accounts or demo posting)
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMediaUrl, setNewPostMediaUrl] = useState('');
  const [newPostTags, setNewPostTags] = useState('AviationUpdate, ExecutiveCharter');
  const [isPosting, setIsPosting] = useState(false);
  const [postNotice, setPostNotice] = useState<string | null>(null);

  const loadData = () => {
    const followed = db.getFollowedBusinessIds(userId);
    setFollowedBizIds([...followed]);

    const posts = db.getBusinessPosts();
    setAllPosts([...posts]);

    const bizs = db.getBusinesses();
    setBusinesses([...bizs]);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleUnfollow = (bizId: string) => {
    db.unfollowBusiness(userId, bizId);
    loadData();
    if (onRefreshData) onRefreshData();
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPosting(true);

    const bizId = currentBusiness?.business_id || 'biz_01';
    const bizName = currentBusiness?.organization_name || 'JetVentures VIP SkySuite';

    try {
      const tagsArray = newPostTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const created = db.createBusinessPost({
        business_id: bizId,
        business_name: bizName,
        business_verified: currentBusiness?.verification_status === 'VERIFIED',
        business_category: (currentBusiness as any)?.category || (currentBusiness as any)?.business_category || 'Private Air Charter',
        business_city: currentBusiness?.physical_location || 'Dubai',
        business_country: currentBusiness?.country || 'AE',
        post_type: 'POST',
        title: newPostTitle.trim() || `${bizName} Fleet & Service Announcement`,
        content: newPostContent.trim(),
        media_url:
          newPostMediaUrl.trim() ||
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
        media_type: 'image',
        tags: tagsArray,
        is_marketed: false,
      });

      // Dispatch real-time notifications to all following users of this business!
      const followersCount = db.getBusinessFollowersCount(bizId);
      db.notifyFollowersOfNewPost(bizId, bizName, created.title || 'New Announcement');

      setPostNotice(
        `Update published! Instant notifications dispatched to ${followersCount} following client accounts.`
      );
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostMediaUrl('');
      setShowPostComposer(false);
      loadData();
      if (onRefreshData) onRefreshData();
    } finally {
      setIsPosting(false);
    }
  };

  // Filter posts to show posts from followed businesses (or all if user follows 0, with a note)
  const followedPosts = allPosts.filter(
    (p) => followedBizIds.includes(p.business_id) || p.is_marketed
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-slate-900 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between shrink-0">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-400 shrink-0 mt-0.5">
              <BellRing className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  Follower Updates Feed
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Real-Time Organization Broadcasts</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Following Updates &amp; Fleet Announcements
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Whenever an organization you follow posts new updates, empty-leg slots, or fleet notices, they appear here.
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

        {/* Followed Organizations Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-3 sm:px-6 shrink-0 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center space-x-2 text-xs">
            <Users className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-slate-300 font-medium">You are following:</span>
            <span className="font-bold text-white font-mono bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
              {followedBizIds.length} Organizations
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPostComposer(!showPostComposer)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Update (Business)</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {postNotice && (
          <div className="bg-emerald-950/60 border-b border-emerald-500/30 p-3 px-6 text-xs text-emerald-300 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{postNotice}</span>
            </div>
            <button onClick={() => setPostNotice(null)} className="text-emerald-400 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Post Composer (When opened) */}
        {showPostComposer && (
          <div className="bg-slate-950/90 border-b border-slate-800 p-5 shrink-0 animate-fade-in">
            <form onSubmit={handleCreatePost} className="space-y-3 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish New Update to Followers</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Author: {currentBusiness?.organization_name || 'Verified Aviation Operator'}
                </span>
              </div>

              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Announcement Title (e.g., New Bombardier Global 7500 inducted at Mumbai)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                required
                rows={3}
                placeholder="Write your announcement, empty-leg flight deal, or service upgrade for your followers..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="url"
                  value={newPostMediaUrl}
                  onChange={(e) => setNewPostMediaUrl(e.target.value)}
                  placeholder="Photo/Media URL (Optional)"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                />
                <input
                  type="text"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="Tags (comma-separated, e.g. Dubai, VIPCharter)"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPostComposer(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPosting ? 'Broadcasting...' : 'Publish to Followers'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts Stream */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {followedPosts.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <Bell className="w-10 h-10 text-slate-600 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-white">No Followed Updates Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Click the <strong>Follow</strong> button on any business listing in the marketplace to receive their latest flight notices and fleet updates here!
                </p>
              </div>
            </div>
          ) : (
            followedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white hover:text-sky-400 cursor-pointer">
                          {post.business_name}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Following
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{post.business_category}</span>
                        <span>•</span>
                        <span>{post.business_city}, {post.business_country}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {followedBizIds.includes(post.business_id) && (
                    <button
                      type="button"
                      onClick={() => handleUnfollow(post.business_id)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
                      title="Unfollow organization"
                    >
                      Unfollow
                    </button>
                  )}
                </div>

                {/* Content */}
                <div>
                  {post.title && (
                    <h3 className="text-base font-bold text-white mb-1.5">{post.title}</h3>
                  )}
                  <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Image Media */}
                {post.media_url && (
                  <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-80">
                    <img
                      src={post.media_url}
                      alt=""
                      className="w-full h-full object-cover max-h-80 hover:scale-101 transition-transform"
                    />
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactions footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes?.length || 24} Likes</span>
                    </button>
                    <button className="flex items-center space-x-1.5 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments?.length || 5} Comments</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    Delivered via Truvaer Following Network
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

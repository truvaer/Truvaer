import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  User,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Send,
  Heart,
  MessageSquare,
  Share2,
  Sparkles,
  MapPin,
  Globe,
  Sliders,
  Calendar,
  Compass,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Megaphone,
  Filter,
  Check,
  Search,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  ExternalLink,
  DollarSign,
  X,
  Edit3,
  Trash2,
  RotateCcw,
  Flag,
  Ban,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  BusinessPost,
  BusinessPostType,
  PostMarketingCampaign,
  RegularUser,
  BusinessProfile,
  PostReportReason,
  AdminUser,
} from '../types';
import { COUNTRIES, CATEGORIES } from './MarketingPortal';
import { FlashNewsBlinkFeed } from '../components/FlashNewsBlinkFeed';
import { FlashNewsPublicationDesk } from '../erp/FlashNewsPublicationDesk';

interface LinkedInMarketingFeedProps {
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  isAdmin: boolean;
  activeAdminUser?: AdminUser | null;
  onOpenWallet: () => void;
  onOpenDirectChat?: (recipientEmail: string, initialSubject: string) => void;
  onOpenUserProfile?: () => void;
  onSwitchToDirectory?: () => void;
  onOpenPublicationDesk?: () => void;
  externalOpenFlashDeskTrigger?: number;
  externalOpenComposerTrigger?: number;
}

export const LinkedInMarketingFeed: React.FC<LinkedInMarketingFeedProps> = ({
  currentUser,
  currentBusiness,
  isAdmin,
  activeAdminUser,
  onOpenWallet,
  onOpenDirectChat,
  onOpenUserProfile,
  onSwitchToDirectory,
  onOpenPublicationDesk,
  externalOpenFlashDeskTrigger,
  externalOpenComposerTrigger,
}) => {
  // Flashnews Publication Desk Modal State
  const [showFlashDeskModal, setShowFlashDeskModal] = useState(false);

  useEffect(() => {
    if (externalOpenFlashDeskTrigger && externalOpenFlashDeskTrigger > 0) {
      setShowFlashDeskModal(true);
    }
  }, [externalOpenFlashDeskTrigger]);

  // Posts state
  const [posts, setPosts] = useState<BusinessPost[]>([]);
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'marketed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Story Categories managed via Admin C-Panel Story Category Management Desk
  const dynamicStoryCategories = useMemo(() => {
    const list = db.getStoryCategories().filter((c) => c.status === 'ACTIVE');
    if (list.length > 0) {
      return list.map((c) => c.name);
    }
    return CATEGORIES.filter((c) => c !== 'All');
  }, []);

  // Followed businesses list for current user
  const currentUserId = currentUser?.user_id || currentBusiness?.business_id || 'guest';
  const [followedBizIds, setFollowedBizIds] = useState<string[]>(() => {
    return db.getFollowedBusinessIds(currentUserId);
  });

  // Modal for Post/Article Creation (Business Users Only)
  const [showComposerModal, setShowComposerModal] = useState(false);

  useEffect(() => {
    if (externalOpenComposerTrigger && externalOpenComposerTrigger > 0) {
      setPostType('POST');
      setShowComposerModal(true);
    }
  }, [externalOpenComposerTrigger]);

  const [postType, setPostType] = useState<BusinessPostType>('POST');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedPostCategory, setSelectedPostCategory] = useState(
    currentBusiness?.category || 'Pilot Training & Academies'
  );
  const [tagsInput, setTagsInput] = useState('Aviation, FleetOps, PilotTraining');

  // Marketing Campaign Sponsored Boost Options
  const [isMarketed, setIsMarketed] = useState(false);
  const [campaignRadiusKm, setCampaignRadiusKm] = useState<number>(100);
  const [campaignCountry, setCampaignCountry] = useState<string>(currentBusiness?.country || 'IN');
  const [campaignDurationDays, setCampaignDurationDays] = useState<number>(7);
  const [campaignCategory, setCampaignCategory] = useState<string>(
    currentBusiness?.category || 'Pilot Training & Academies'
  );

  // Active Comment Thread state
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Post Edit Modal State (For Author / Admin)
  const [editingPost, setEditingPost] = useState<BusinessPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [editTags, setEditTags] = useState('');

  // Post Report Modal State
  const [reportingPost, setReportingPost] = useState<BusinessPost | null>(null);
  const [reportReason, setReportReason] = useState<PostReportReason>('Irrelevant Content / Spam');
  const [reportExplanation, setReportExplanation] = useState('');

  // Delete Post Confirmation State
  const [postToDelete, setPostToDelete] = useState<BusinessPost | null>(null);

  // Re-publish Confirmation Modal State
  const [republishingPost, setRepublishingPost] = useState<BusinessPost | null>(null);

  // Check publishing suspension
  const publishCheck = db.isPublishSuspended(
    currentBusiness?.business_id || currentUser?.user_id || currentUserId
  );

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load and subscribe to posts from DB
  const refreshPosts = () => {
    const p = db.getBusinessPosts();
    setPosts(p);
    setFollowedBizIds(db.getFollowedBusinessIds(currentUserId));
  };

  useEffect(() => {
    refreshPosts();
    const unsub = db.subscribeToBusinessPosts((updated) => {
      setPosts(updated);
    });
    return () => unsub();
  }, [currentUserId]);

  // Handle Edit Post
  const handleStartEditPost = (post: BusinessPost) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content);
    setEditMediaUrl(post.media_url || '');
    setEditTags(post.tags?.join(', ') || '');
  };

  const handleSaveEditPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const tagsArr = editTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const res = db.editBusinessPost(
      editingPost.id,
      {
        title: editTitle.trim() || undefined,
        content: editContent.trim(),
        media_url: editMediaUrl.trim() || undefined,
        tags: tagsArr,
      },
      currentUserId,
      isAdmin
    );

    if (res.success) {
      showToast('Publication updated successfully.');
      setEditingPost(null);
      refreshPosts();
    } else {
      showToast(res.message);
    }
  };

  // Handle Delete Post Confirmation
  const confirmDeletePost = () => {
    if (!postToDelete) return;
    const res = db.deleteBusinessPost(postToDelete.id, currentUserId, isAdmin);
    if (res.success) {
      showToast('Publication deleted successfully.');
      setPostToDelete(null);
      refreshPosts();
    } else {
      showToast(res.message);
    }
  };

  // Handle Re-publish Post (Full credit attributed, zero credit loss)
  const handleRepublish = (post: BusinessPost) => {
    if (publishCheck.isSuspended) {
      showToast(
        `Publishing privileges terminated by Admin: Your account is suspended from publishing for ${publishCheck.daysRemaining} days due to repeated policy violations.`
      );
      return;
    }

    const authorName =
      currentBusiness?.organization_name ||
      (currentUser
        ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.username
        : 'Aviation Aviator');

    const res = db.republishBusinessPost(post.id, currentUserId, authorName, currentBusiness);
    if (res.success) {
      showToast(res.message);
      setRepublishingPost(null);
      refreshPosts();
    } else {
      showToast(res.message);
    }
  };

  // Handle Submit Post Report (Direct to Admin / Manager / Super Admin desk)
  const handleSubmitPostReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPost) return;

    const reporterName =
      currentBusiness?.organization_name ||
      (currentUser
        ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.username
        : 'Anonymous Aviator');
    const reporterEmail = currentBusiness?.business_email || currentUser?.email || 'aviator@truvaer.com';

    const res = db.submitPostReport({
      post_id: reportingPost.id,
      reporter_id: currentUserId,
      reporter_name: reporterName,
      reporter_email: reporterEmail,
      reason: reportReason,
      explanation: reportExplanation.trim() || 'Report filed regarding non-compliant or irrelevant content.',
    });

    if (res.success) {
      showToast(res.message);
      setReportingPost(null);
      setReportExplanation('');
      refreshPosts();
    } else {
      showToast(res.message);
    }
  };

  // Handle Follow / Unfollow Business
  const handleToggleFollow = (bizId: string) => {
    if (!currentUserId || currentUserId === 'guest') {
      showToast('Please sign in to follow business pages.');
      return;
    }

    const isFollowing = db.isFollowingBusiness(currentUserId, bizId);
    if (isFollowing) {
      db.unfollowBusiness(currentUserId, bizId);
      setFollowedBizIds((prev) => prev.filter((id) => id !== bizId));
      showToast('Unfollowed business page.');
    } else {
      db.followBusiness(currentUserId, bizId);
      setFollowedBizIds((prev) => [...prev, bizId]);
      showToast('Following business page! Updates will now appear in your feed.');
    }
  };

  // Handle Like Post
  const handleLikePost = (postId: string) => {
    const updated = db.likeBusinessPost(postId, currentUserId);
    if (updated) {
      refreshPosts();
    }
  };

  // Handle Add Comment
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    const authorName = currentUser
      ? currentUser.first_name
        ? `${currentUser.first_name} ${currentUser.last_name || ''}`
        : `@${currentUser.username}`
      : currentBusiness
      ? currentBusiness.organization_name
      : 'Anonymous Aviator';

    const authorRole = currentUser ? 'Aviator Member' : 'Enterprise Representative';

    db.commentBusinessPost(postId, {
      user_id: currentUserId,
      user_name: authorName,
      user_role: authorRole,
      text: commentInput.trim(),
    });

    setCommentInput('');
    refreshPosts();
    showToast('Comment published.');
  };

  // Handle Post Publishing (Restricted to Business Users Only)
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();

    if (publishCheck.isSuspended) {
      showToast(
        `Publishing terminated by Admin: Your account is suspended from publishing for ${publishCheck.daysRemaining} more days due to repeated policy violations.`
      );
      return;
    }

    if (!currentBusiness && !isAdmin) {
      showToast('Publishing privilege restricted to verified businesses and platform administrators.');
      return;
    }

    if (!content.trim()) {
      showToast('Please enter post content.');
      return;
    }

    if (postType === 'ARTICLE' && !title.trim()) {
      showToast('Please provide a title for your article.');
      return;
    }

    let marketingCampaign: PostMarketingCampaign | undefined = undefined;
    if (isMarketed && currentBusiness) {
      // Calculate credits cost
      const creditsCost = campaignDurationDays * 15;
      marketingCampaign = {
        radius_km: campaignRadiusKm,
        country: campaignCountry,
        duration_days: campaignDurationDays,
        category: campaignCategory,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + campaignDurationDays * 86400000).toISOString(),
        target_audience: 'STANDARD_USERS_ONLY', // Strict ecosystem condition: Only standard users, never B2B
        credits_invested: creditsCost,
        impressions: 1,
        clicks: 0,
      };
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const authorBusinessId = currentBusiness?.business_id || 'truvaer_exec_ops';
    const authorOrgName = currentBusiness?.organization_name || (activeAdminUser?.name ? `${activeAdminUser.name} (Truvaer Admin)` : 'TruvAer Operations Directorate');
    const authorLogo = currentBusiness?.photos?.[0] || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80';
    const authorVerified = true;
    const authorCategory = currentBusiness?.category || selectedPostCategory || 'General Aviation';
    const authorCountry = currentBusiness?.country || 'IN';
    const authorCity = currentBusiness?.physical_location || 'Aerodrome Station';

    db.createBusinessPost({
      business_id: authorBusinessId,
      business_name: authorOrgName,
      business_logo: authorLogo,
      business_verified: authorVerified,
      business_category: authorCategory,
      business_country: authorCountry,
      business_city: authorCity,
      post_type: postType,
      title: title.trim() || undefined,
      content: content.trim(),
      media_url: mediaUrl.trim() || undefined,
      media_type: 'image',
      tags: tagsArray,
      is_marketed: isMarketed && !!currentBusiness,
      marketing_campaign: marketingCampaign,
    });

    // Reset Form
    setTitle('');
    setContent('');
    setMediaUrl('');
    setIsMarketed(false);
    setShowComposerModal(false);
    refreshPosts();
    showToast(
      isMarketed
        ? 'Sponsored marketing post published and targeted to standard aviators!'
        : 'Post published successfully to your page followers!'
    );
  };

  // -------------------------------------------------------------
  // VISIBILITY FILTERING RULES (Conditions from User Request)
  // -------------------------------------------------------------
  // Rule 1: Allow business users only to publish posts/articles. (Enforced in UI)
  // Rule 2: Organic updates must be visible ONLY to following users.
  // Rule 3: If business markets it, provide options: Range (Kms), Country, Time duration, Category section.
  // Rule 4: Marketing must ONLY publish to standard users, NOT to business-to-business users!
  const visiblePosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. If author is current business, author always sees its own post
      if (currentBusiness && post.business_id === currentBusiness.business_id) {
        return true;
      }

      // 2. Marketed Post check:
      if (post.is_marketed) {
        // "Make sure the marketing only publish to standard users not to business to business users."
        if (currentBusiness) {
          // If viewer is a Business User, HIDE marketed posts!
          return false;
        }

        // If viewer is a Standard/Regular User, apply campaign targeting matching:
        if (post.marketing_campaign) {
          const camp = post.marketing_campaign;

          // Country match
          if (camp.country !== 'All') {
            const userCountry = currentUser?.country_code || 'IN';
            if (camp.country.toUpperCase() !== userCountry.toUpperCase()) {
              // Not targeted to user's country
              // Allow if worldwide
            }
          }

          // Category match
          if (categoryFilter !== 'All' && camp.category !== categoryFilter) {
            return false;
          }
        }
        return true;
      }

      // 3. Organic Post check:
      // "Making an condition the updates should be visible only to following users"
      const isFollowing = followedBizIds.includes(post.business_id);
      if (!isFollowing) {
        return false;
      }

      // Category filter check if user applied one
      if (categoryFilter !== 'All' && post.business_category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [posts, followedBizIds, currentBusiness, currentUser, categoryFilter]);

  // Feed Tab Filtered Posts
  const filteredFeedPosts = useMemo(() => {
    let list = visiblePosts;

    if (feedFilter === 'following') {
      list = list.filter((p) => followedBizIds.includes(p.business_id));
    } else if (feedFilter === 'marketed') {
      list = list.filter((p) => p.is_marketed);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.business_name.toLowerCase().includes(q) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [visiblePosts, feedFilter, followedBizIds, searchQuery]);

  // Recommended Businesses to Follow (Right Sidebar)
  const allBusinesses = db.getBusinesses();
  const recommendedBusinesses = useMemo(() => {
    return allBusinesses
      .filter((b) => b.business_id !== currentBusiness?.business_id)
      .slice(0, 5);
  }, [allBusinesses, currentBusiness]);

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3-Column LinkedIn Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Profile Overview & Network Shortcuts (4 cols)                */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* User / Business Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {/* Header Cover Banner */}
            <div className="h-20 bg-gradient-to-r from-blue-900 via-sky-800 to-indigo-900 relative">
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Profile Avatar & Info */}
            <div className="p-4 pt-0 relative text-center">
              <div className="w-16 h-16 rounded-2xl border-4 border-slate-900 mx-auto -mt-8 overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg">
                {currentBusiness ? (
                  currentBusiness.photos?.[0] ? (
                    <img
                      src={currentBusiness.photos[0]}
                      alt="Business Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-indigo-400" />
                  )
                ) : (
                  <User className="w-7 h-7 text-blue-400" />
                )}
              </div>

              <div className="mt-2.5">
                <div className="font-bold text-sm text-white flex items-center justify-center space-x-1">
                  <span>
                    {currentBusiness
                      ? currentBusiness.organization_name
                      : currentUser?.first_name
                      ? `${currentUser.first_name} ${currentUser.last_name || ''}`
                      : currentUser?.username || 'Aviator User'}
                  </span>
                  {currentBusiness?.verification_status === 'VERIFIED' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  )}
                </div>

                <div className="text-[11px] text-slate-400 mt-0.5">
                  {currentBusiness
                    ? currentBusiness.category || 'Aviation Enterprise Page'
                    : currentUser?.role === 'SUPER_ADMIN'
                    ? 'Super Admin & Platform Controller'
                    : 'Licensed Aviator & Industry Professional'}
                </div>
              </div>

              {/* Stats Divider */}
              <div className="border-t border-slate-800 my-3.5" />

              <div className="space-y-2 text-left text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Pages you follow</span>
                  <span className="font-bold text-blue-400">{followedBizIds.length}</span>
                </div>

                {currentBusiness && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Followers of your page</span>
                    <span className="font-bold text-indigo-400">
                      {db.getBusinessFollowersCount(currentBusiness.business_id)}
                    </span>
                  </div>
                )}

                {!currentBusiness && currentUser && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Digital Credits</span>
                    <button
                      type="button"
                      onClick={onOpenWallet}
                      className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{currentUser?.wallet?.balance ?? 0} Cr</span>
                      <Plus className="w-3 h-3 text-emerald-400" />
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 my-3.5" />

              <button
                type="button"
                onClick={onOpenUserProfile}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                View Full Profile
              </button>
            </div>
          </div>

          {/* Quick Filter Navigation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Feed Channels
            </div>

            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => setFeedFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-xl font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  feedFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>All Updates</span>
                </div>
                <span className="text-[10px] opacity-80">{visiblePosts.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedFilter('following')}
                className={`w-full text-left px-3 py-2 rounded-xl font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  feedFilter === 'following'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Following Pages Only</span>
                </div>
                <span className="text-[10px] opacity-80">{followedBizIds.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedFilter('marketed')}
                className={`w-full text-left px-3 py-2 rounded-xl font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  feedFilter === 'marketed'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sponsored Campaigns</span>
                </div>
                <span className="text-[10px] opacity-80">
                  {visiblePosts.filter((p) => p.is_marketed).length}
                </span>
              </button>
            </div>
          </div>

          {/* Targeted Marketing Rule Banner */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Ecosystem Compliance Rule</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong>Condition 4 Enforced:</strong> Organic updates are visible solely to users following the business page. Sponsored marketing campaigns are delivered strictly to standard consumer aviators and excluded from B2B competitor business accounts.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER COLUMN: Stories for you Feed & Post Composer (6 cols)              */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* Post Creation Box (LinkedIn Top Composer) - Enabled for Business Pages and Admins */}
          {(publishCheck.isSuspended || currentBusiness || isAdmin) && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
              {publishCheck.isSuspended ? (
                /* Publishing Privileges Terminated Banner */
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-rose-300 font-bold">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>Publishing Privileges Terminated by Admin Oversight</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Your publishing ability is currently suspended for <strong>{publishCheck.daysRemaining} days</strong> (Violation Strike {publishCheck.violationCount}) due to repeated policy violations or irrelevant content reports.
                  </p>
                  <div className="text-[10px] text-rose-400 font-mono">
                    Sanction active until: {publishCheck.suspendedUntil ? new Date(publishCheck.suspendedUntil).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ) : (
                /* Business User & Admin Composer: Allowed to author posts & articles */
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 shrink-0">
                      {isAdmin && !currentBusiness ? <ShieldCheck className="w-5 h-5 text-amber-400" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPostType('POST');
                        setShowComposerModal(true);
                      }}
                      className="flex-1 text-left px-4 py-3 rounded-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xs font-medium cursor-pointer transition-colors"
                    >
                      {isAdmin && !currentBusiness
                        ? 'Start an official publication, executive bulletin, or share aviation updates...'
                        : 'Start a post, share aviation update, or boost a flight offer...'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setPostType('POST');
                        setShowComposerModal(true);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      <span>Photo / Media</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPostType('ARTICLE');
                        setShowComposerModal(true);
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 cursor-pointer transition-colors"
                    >
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Write Article</span>
                    </button>

                    {currentBusiness ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMarketed(true);
                          setShowComposerModal(true);
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 cursor-pointer transition-colors"
                      >
                        <Megaphone className="w-4 h-4 text-blue-400" />
                        <span>Targeted Boost</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-amber-400/80 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Executive Admin Author</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search & Category Filter Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feed by business, title, or hashtag..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-52 py-2 px-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              {dynamicStoryCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Feed Posts List */}
          {filteredFeedPosts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Updates in Your Current Feed</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Organic posts are visible strictly to following users. Follow recommended business pages on the right to populate your feed!
              </p>
              <button
                type="button"
                onClick={onSwitchToDirectory}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors inline-block"
              >
                Explore ServiceScout Directory
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedPosts.map((post) => {
                const isFollowing = followedBizIds.includes(post.business_id);
                const isLiked = post.likes?.includes(currentUserId);
                const isAuthor = Boolean(
                  (currentBusiness && (
                    post.business_id === currentBusiness.business_id ||
                    post.business_name?.toLowerCase() === currentBusiness.organization_name?.toLowerCase() ||
                    post.author_name?.toLowerCase() === currentBusiness.organization_name?.toLowerCase() ||
                    post.business_id === currentBusiness.business_email
                  )) ||
                  (currentUser && (
                    post.business_id === currentUser.user_id ||
                    post.business_id === currentUser.email ||
                    post.author_name?.toLowerCase() === currentUser.username?.toLowerCase() ||
                    post.author_name?.toLowerCase() === `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim().toLowerCase()
                  ))
                );
                const canManage = Boolean(
                  isAuthor ||
                  isAdmin ||
                  currentUser?.role === 'SUPER_ADMIN' ||
                  currentUser?.role === 'ADMIN' ||
                  Boolean(activeAdminUser)
                );

                return (
                  <article
                    key={post.id}
                    className="bg-slate-900 border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-4 transition-all hover:border-slate-700"
                  >
                    {/* Header: Business Info + Management (Edit, Delete) or Follow Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 min-w-0">
                        <img
                          src={
                            post.business_logo ||
                            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={post.business_name}
                          className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-bold text-sm text-white hover:text-blue-400 cursor-pointer">
                              {post.business_name}
                            </span>
                            {post.business_verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <span>{post.business_category}</span>
                            <span>•</span>
                            <span>
                              {post.business_city}, {post.business_country}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(post.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <span>•</span>
                            <Globe className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Header Actions: Edit & Delete for author/admin, or Follow for other aviators */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {canManage && (
                          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleStartEditPost(post)}
                              className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-sky-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Edit post"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPostToDelete(post)}
                              className="px-2 py-1 rounded-lg hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Delete post"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        )}

                        {!isAuthor && (
                          <button
                            type="button"
                            onClick={() => handleToggleFollow(post.business_id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                              isFollowing
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Re-published attribution banner (Requirement: Credit attribution, zero credit deduction) */}
                    {post.republished_from && (
                      <div className="px-3.5 py-2 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-center space-x-2 text-xs text-indigo-300">
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>
                          Re-published with full credit attributed to{' '}
                          <strong className="text-white">{post.republished_from.original_author_name}</strong>{' '}
                          ({new Date(post.republished_from.republished_at).toLocaleDateString()})
                        </span>
                      </div>
                    )}

                    {/* Sponsored Campaign Badge (Condition 4) */}
                    {post.is_marketed && post.marketing_campaign && (
                      <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300">
                        <div className="flex items-center space-x-2">
                          <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            <strong>Promoted Campaign:</strong> Targeted within{' '}
                            {post.marketing_campaign.radius_km > 0
                              ? `${post.marketing_campaign.radius_km} Kms`
                              : 'Worldwide'}{' '}
                            in {post.marketing_campaign.country} for {post.marketing_campaign.category}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 font-bold uppercase tracking-wider">
                          Standard Users Only
                        </span>
                      </div>
                    )}

                    {/* Post Title & Content */}
                    <div className="space-y-2">
                      {post.title && (
                        <h3 className="font-bold text-base text-white hover:text-blue-300 transition-colors">
                          {post.title}
                        </h3>
                      )}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Media Container */}
                    {post.media_url && (
                      <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-slate-950">
                        <img
                          src={post.media_url}
                          alt="Post Media"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Social Counters */}
                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                      <div className="flex items-center space-x-1">
                        <span className="text-blue-400 font-bold">👍</span>
                        <span>{post.reactions?.like || post.likes?.length || 0} reactions</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span>{post.comments?.length || 0} comments</span>
                        <span>•</span>
                        <span>{post.shares_count || 0} shares</span>
                      </div>
                    </div>

                    {/* Action Bar: Like, Comment, Re-publish, Inquire, Report */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 pt-1 border-t border-slate-800/80 text-xs">
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id)}
                        className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 font-semibold transition-colors cursor-pointer ${
                          isLiked
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>Like</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                        }
                        className="py-2 rounded-xl flex items-center justify-center space-x-1.5 font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Comment</span>
                      </button>

                      {/* Re-publish Button: Replaces Share so credits are preserved and full credit attributed */}
                      <button
                        type="button"
                        onClick={() => handleRepublish(post)}
                        className="py-2 rounded-xl flex items-center justify-center space-x-1.5 font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        title="Re-publish this update with full attribution to original organization"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Re-publish</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenDirectChat) {
                            onOpenDirectChat(
                              `contact@${post.business_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                              `Inquiry regarding ${post.title || 'Published Offer'}`
                            );
                          } else {
                            showToast('Direct communication channel opened.');
                          }
                        }}
                        className="py-2 rounded-xl flex items-center justify-center space-x-1.5 font-semibold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Inquire</span>
                      </button>

                      {/* Report Post Option: Escalates directly to Admin desk */}
                      <button
                        type="button"
                        onClick={() => {
                          setReportingPost(post);
                          setReportReason('Irrelevant Content / Spam');
                          setReportExplanation('');
                        }}
                        className="py-2 rounded-xl flex items-center justify-center space-x-1.5 font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Report post for policy violations"
                      >
                        <Flag className="w-4 h-4" />
                        <span>Report</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {activeCommentPostId === post.id && (
                      <div className="pt-3 border-t border-slate-800 space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            placeholder="Add a professional reply or question..."
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            Reply
                          </button>
                        </div>

                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2.5 pt-1">
                            {post.comments.map((comm) => (
                              <div
                                key={comm.id}
                                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white">{comm.user_name}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(comm.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400">{comm.user_role}</div>
                                <p className="text-slate-300 pt-0.5">{comm.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Recommended Businesses & Aviation Trends (3 cols)          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-5">
          {/* FLASHNEWS 5-SECOND LIVE BLINK FEED TICKER (Max 160 Words) - Repositioned to Right Column */}
          <FlashNewsBlinkFeed
            currentUser={currentUser}
            currentBusiness={currentBusiness}
            isAdmin={isAdmin}
            activeAdminUser={activeAdminUser}
            onOpenPublicationDesk={() => setShowFlashDeskModal(true)}
          />

          {/* Recommended Businesses to Follow */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Recommended Pages to Follow</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>

            <div className="space-y-3">
              {recommendedBusinesses.map((biz) => {
                const isFollowing = followedBizIds.includes(biz.business_id);

                return (
                  <div
                    key={biz.business_id}
                    className="flex items-start justify-between space-x-2.5 pb-3 border-b border-slate-800/60 last:border-none last:pb-0"
                  >
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-300 shrink-0 mt-0.5 overflow-hidden">
                        {biz.photos?.[0] ? (
                          <img src={biz.photos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate hover:text-blue-300 cursor-pointer">
                          {biz.organization_name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {biz.category || 'Aviation Operator'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {db.getBusinessFollowersCount(biz.business_id)} followers
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFollow(biz.business_id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                        isFollowing
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-blue-600/15 border border-blue-500/40 text-blue-300 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Aviation News & Industry Intelligence */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Aviation Market News</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="space-y-0.5 cursor-pointer group">
                <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                  Commercial Cadet Pilot Induction 2026
                </div>
                <div className="text-[10px] text-slate-500">4h ago • 3,210 readers</div>
              </div>

              <div className="space-y-0.5 cursor-pointer group">
                <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                  Gulfstream G650ER Long-Range Charters Up 42%
                </div>
                <div className="text-[10px] text-slate-500">1d ago • 1,890 readers</div>
              </div>

              <div className="space-y-0.5 cursor-pointer group">
                <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                  Part-145 Quick-Turn Turbine Overhaul Capacity
                </div>
                <div className="text-[10px] text-slate-500">2d ago • 950 readers</div>
              </div>
            </div>
          </div>

          {/* Corporate Ad / Promotion Spotlight */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/30 border border-blue-500/20 text-xs space-y-2">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              Marketing Campaign Engine
            </div>
            <div className="font-bold text-white">Promote to Aviators</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Business accounts can launch high-converting targeted marketing blasts filtered by kilometer radius, target country, duration, and aviation taxonomy category.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Post & Article Composer (Available for Business Pages and Admins)   */}
      {/* ========================================================================= */}
      {showComposerModal && (currentBusiness || isAdmin) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                {currentBusiness ? (
                  <Building2 className="w-5 h-5 text-indigo-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <h3 className="text-base font-bold text-white">Create Official Publication</h3>
                  <div className="text-xs text-slate-400">
                    Publishing as{' '}
                    <strong className="text-indigo-300">
                      {currentBusiness?.organization_name ||
                        (activeAdminUser?.name
                          ? `${activeAdminUser.name} (Truvaer Admin)`
                          : 'TruvAer Operations Directorate')}
                    </strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowComposerModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4">
              {/* Post Type Selector */}
              <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPostType('POST')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    postType === 'POST'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Quick Post
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('ARTICLE')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    postType === 'ARTICLE'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  In-Depth Article
                </button>
              </div>

              {/* Title (Mandatory for Article, optional for Post) */}
              {(postType === 'ARTICLE' || title) && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    {postType === 'ARTICLE' ? 'Article Headline (Required)' : 'Post Headline (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Autumn 2026 Commercial Pilot License (CPL) Batch Enrollment"
                    className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Content Textarea */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Publication Content
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details of your fleet, training syllabus, MRO capacity, or spare availability..."
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Media URL Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Photo / Banner Media URL
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full py-2 px-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Taxonomy Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={selectedPostCategory}
                    onChange={(e) => setSelectedPostCategory(e.target.value)}
                    className="w-full py-2 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {dynamicStoryCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Hashtags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Aviation, PilotTraining, MRO"
                    className="w-full py-2 px-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ================================================================= */}
              {/* REQUIREMENT 4: MARKETING CAMPAIGN CONTROLS                        */}
              {/* Range (Kms), Country, Duration, Category & Target Standard Users  */}
              {/* ================================================================= */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-white">
                      Market This Post (Sponsored Campaign Boost)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMarketed}
                      onChange={(e) => setIsMarketed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {isMarketed && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fadeIn">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        <strong>Target Audience:</strong> Condition 4 enforced. This campaign will only publish to <strong>standard aviator users</strong> and will never be served to B2B competitor accounts.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 1. Range in Kms */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Target Range Radius (Kms)
                        </label>
                        <select
                          value={campaignRadiusKm}
                          onChange={(e) => setCampaignRadiusKm(Number(e.target.value))}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          <option value={25}>25 Kms (Local Aerodrome Hub)</option>
                          <option value={50}>50 Kms (Metro Sector)</option>
                          <option value={100}>100 Kms (Regional Reach)</option>
                          <option value={250}>250 Kms (Statewide Corridor)</option>
                          <option value={500}>500 Kms (Interstate Flight Zone)</option>
                          <option value={-1}>Worldwide / Global Radius</option>
                        </select>
                      </div>

                      {/* 2. Target Country */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Target Country
                        </label>
                        <select
                          value={campaignCountry}
                          onChange={(e) => setCampaignCountry(e.target.value)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3. Time Duration */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Campaign Duration
                        </label>
                        <select
                          value={campaignDurationDays}
                          onChange={(e) => setCampaignDurationDays(Number(e.target.value))}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          <option value={3}>3 Days (Flash Blast)</option>
                          <option value={7}>7 Days (Weekly Push)</option>
                          <option value={14}>14 Days (Standard Campaign)</option>
                          <option value={30}>30 Days (Full Month Sponsor)</option>
                        </select>
                      </div>

                      {/* 4. Specific Category Section */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-300">
                          Specific Category Section
                        </label>
                        <select
                          value={campaignCategory}
                          onChange={(e) => setCampaignCategory(e.target.value)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                        >
                          {dynamicStoryCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Estimated Corporate Wallet Investment:</span>
                      <span className="font-bold text-amber-400">
                        {campaignDurationDays * 15} Credits
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {isMarketed ? 'Boost & Publish Campaign' : 'Publish to Followers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* EDIT POST MODAL (Author / Admin Only)                                      */}
      {/* ========================================================================= */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Edit Publication</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Title / Headline (Optional)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Publication headline..."
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Content</label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                  placeholder="Update your publication text..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Photo / Media URL</label>
                <input
                  type="url"
                  value={editMediaUrl}
                  onChange={(e) => setEditMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="Aviation, PilotTraining, MRO"
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer shadow-md shadow-sky-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE POST CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Delete Publication</h3>
              </div>
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this publication? This action will remove it from all followers' feeds and cannot be undone.
            </p>

            {postToDelete.title && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white truncate">
                "{postToDelete.title}"
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePost}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-rose-600/30"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REPORT POST MODAL (Direct to Admin / Manager / Super Admin)                */}
      {/* ========================================================================= */}
      {reportingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Flag className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Report Publication to Admin</h3>
              </div>
              <button
                type="button"
                onClick={() => setReportingPost(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Target Author: {reportingPost.business_name}</div>
              <div className="truncate text-[11px] italic">"{reportingPost.title || reportingPost.content.substring(0, 90)}..."</div>
            </div>

            <form onSubmit={handleSubmitPostReport} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Violation Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as PostReportReason)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Irrelevant Content / Spam">Irrelevant Content / Spam</option>
                  <option value="Fake Company or Misleading Information">Fake Company or Misleading Information</option>
                  <option value="Inappropriate / Offensive Content">Inappropriate / Offensive Content</option>
                  <option value="Fraudulent Pricing or Scam">Fraudulent Pricing or Scam</option>
                  <option value="Intellectual Property Violation">Intellectual Property Violation</option>
                  <option value="Harassment / Unprofessional Behavior">Harassment / Unprofessional Behavior</option>
                  <option value="Other Policy Violation">Other Policy Violation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-300">Explanation &amp; Evidence Details</label>
                <textarea
                  rows={3}
                  value={reportExplanation}
                  onChange={(e) => setReportExplanation(e.target.value)}
                  placeholder="Provide context on why this content is irrelevant or non-compliant..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1 leading-relaxed">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Admin Strike &amp; Suspension Policy:</span>
                </div>
                <p>
                  Reports feed directly to Admin, Manager, and Super Admin desks. If repeated violations from one publisher are noticed, admin will terminate their publishing option: <strong>1st strike: 7 days</strong>, <strong>2nd strike: 14 days</strong>, <strong>3rd strike: 30 days</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportingPost(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow-md shadow-rose-600/30 flex items-center space-x-1.5"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Submit to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLASHNEWS PUBLICATION DESK MODAL: Add, Remove, Archive, & Super Admin Limit Calibration */}
      {showFlashDeskModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl my-auto">
            <FlashNewsPublicationDesk
              currentUser={currentUser}
              currentBusiness={currentBusiness}
              activeAdminUser={activeAdminUser}
              onClose={() => setShowFlashDeskModal(false)}
              onRefreshData={refreshPosts}
            />
          </div>
        </div>
      )}
    </div>
  );
};

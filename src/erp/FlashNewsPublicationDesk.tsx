import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Flame,
  Clock,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  Trash2,
  Archive,
  RotateCcw,
  Plus,
  Send,
  Eye,
  Settings,
  Sliders,
  FileText,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Wallet,
  XCircle,
  Search,
  Building2,
  UserCheck,
  Download,
  Mail,
  FileSpreadsheet,
  Filter,
  CalendarDays,
  Check,
  Edit3,
  X,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  FlashNewsItem,
  FlashNewsConfig,
  FlashNewsCategory,
  FlashNewsPricingMatrix,
  FlashNewsAutoMailBackupConfig,
  RegularUser,
  BusinessProfile,
  AdminUser,
} from '../types';
import { countWords, defaultFlashNewsPricingMatrix } from '../data/flashNewsSeeds';

interface FlashNewsPublicationDeskProps {
  currentUser?: RegularUser | null;
  currentBusiness?: BusinessProfile | null;
  activeAdminUser?: AdminUser | null;
  onClose?: () => void;
  onRefreshData?: () => void;
}

export const FlashNewsPublicationDesk: React.FC<FlashNewsPublicationDeskProps> = ({
  currentUser,
  currentBusiness,
  activeAdminUser,
  onClose,
  onRefreshData,
}) => {
  const isSuperAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'sup_admin@truvaer.com' ||
    currentUser?.email?.toLowerCase() === 'admin@truvaer.com';

  const isL7OrL8 =
    isSuperAdmin ||
    (activeAdminUser &&
      ((activeAdminUser.level ?? 0) >= 7 ||
        activeAdminUser.role === 'SUPER_ADMIN' ||
        activeAdminUser.level_title?.includes('L7') ||
        activeAdminUser.level_title?.includes('L8')));

  const isBusiness = !!currentBusiness && !isL7OrL8 && activeAdminUser?.role !== 'ADMIN';

  const businessWalletBalance = Math.max(
    currentBusiness?.corporate_wallet?.credit_balance ?? 0,
    currentBusiness?.credit_wallet_balance ?? 0
  );

  const publisherName =
    activeAdminUser?.name ||
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') ||
    currentUser?.username ||
    'Publication Desk Officer';

  const publisherRole = isSuperAdmin
    ? 'Super Administrator (L8)'
    : activeAdminUser?.level_title || activeAdminUser?.role || (isBusiness ? 'Business Organization' : 'Operations Lead');

  // Config State
  const [config, setConfig] = useState<FlashNewsConfig>(() => db.getFlashNewsConfig());
  const [targetLimit, setTargetLimit] = useState<number>(config.max_active_limit || 10);
  const [creditCostInput, setCreditCostInput] = useState<number>(config.business_publish_credit_cost || 50);
  const [configFeedback, setConfigFeedback] = useState<string | null>(null);

  // Data lists
  const [activeItems, setActiveItems] = useState<FlashNewsItem[]>(() => db.getFlashNews());
  const [allItems, setAllItems] = useState<FlashNewsItem[]>(() => db.getAllFlashNews());
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(() => db.getBusinesses());
  const [bizSearch, setBizSearch] = useState('');
  const [viewTab, setViewTab] = useState<
    'publish' | 'verification_queue' | 'active_queue' | 'pricing_matrix' | 'business_permissions' | 'archived' | 'capacity_settings'
  >('publish');

  // Queue toggle filter: Active, Inactive, Rejected (Task 3)
  const [queueFilter, setQueueFilter] = useState<'ACTIVE' | 'INACTIVE' | 'REJECTED'>('ACTIVE');

  // Traffic Rates CRUD State exclusively for L7/L8 (Task 5)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatKey, setNewCatKey] = useState('');
  const [newCatRate, setNewCatRate] = useState<number>(30);
  const [catActionFeedback, setCatActionFeedback] = useState<string | null>(null);

  // New FlashNews Form State: 200 Words Limit
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<FlashNewsCategory>('BREAKING');
  const [priority, setPriority] = useState<'URGENT' | 'HIGH' | 'NORMAL'>('HIGH');
  const [blinkIntervalSec, setBlinkIntervalSec] = useState<number>(5);
  const [slotPosition, setSlotPosition] = useState<'STANDARD' | 'TOP_PRIORITY' | 'STICKY'>('STANDARD');
  const [showcaseLimit, setShowcaseLimit] = useState<number>(0);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Business User Checkout Popup Modal State
  const [showBusinessCheckoutModal, setShowBusinessCheckoutModal] = useState(false);

  // History & Retention State (30-day rolling for Admin/L7/L8, Date range picker for Super Admin)
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');

  // Pricing Matrix Calibration State
  const [pricingMatrix, setPricingMatrix] = useState<FlashNewsPricingMatrix>(
    () => config.pricing_matrix || defaultFlashNewsPricingMatrix
  );

  // Auto-Mail System State
  const [showAutoMailModal, setShowAutoMailModal] = useState(false);
  const [autoMailConfig, setAutoMailConfig] = useState<FlashNewsAutoMailBackupConfig>(
    () => config.auto_mail_backup || {
      enabled: true,
      frequency: 'WEEKLY',
      recipient_emails: ['sup_admin@truvaer.com', 'compliance@truvaer.com'],
      backup_count: 8,
    }
  );
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [backupDispatchFeedback, setBackupDispatchFeedback] = useState<string | null>(null);

  // Business User Access Restriction Guard: Restrict Business users exclusively to Flash News Desk & Queue
  useEffect(() => {
    if (isBusiness && viewTab !== 'publish' && viewTab !== 'active_queue') {
      setViewTab('publish');
    }
  }, [isBusiness, viewTab]);

  // Queue Filtering & Data Isolation (Task 3)
  const queueCounts = useMemo(() => {
    let list = allItems;
    if (isBusiness && currentBusiness) {
      list = list.filter(
        (item) =>
          item.published_by_id === currentBusiness.business_id ||
          item.published_by_org?.toLowerCase() === currentBusiness.organization_name.toLowerCase() ||
          item.published_by_name?.toLowerCase() === currentBusiness.organization_name.toLowerCase()
      );
    }
    return {
      active: list.filter((i) => i.status === 'ACTIVE').length,
      inactive: list.filter(
        (i) => i.status === 'ARCHIVED' || i.status === 'PENDING_LEVEL_1' || i.status === 'PENDING_LEVEL_2'
      ).length,
      rejected: list.filter((i) => i.status === 'REJECTED').length,
    };
  }, [allItems, isBusiness, currentBusiness]);

  const queueItemsForViewer = useMemo(() => {
    let list = allItems;
    if (isBusiness && currentBusiness) {
      list = list.filter(
        (item) =>
          item.published_by_id === currentBusiness.business_id ||
          item.published_by_org?.toLowerCase() === currentBusiness.organization_name.toLowerCase() ||
          item.published_by_name?.toLowerCase() === currentBusiness.organization_name.toLowerCase()
      );
    }
    if (queueFilter === 'ACTIVE') {
      return list.filter((i) => i.status === 'ACTIVE');
    } else if (queueFilter === 'INACTIVE') {
      return list.filter(
        (i) => i.status === 'ARCHIVED' || i.status === 'PENDING_LEVEL_1' || i.status === 'PENDING_LEVEL_2'
      );
    } else {
      return list.filter((i) => i.status === 'REJECTED');
    }
  }, [allItems, isBusiness, currentBusiness, queueFilter]);

  // Edit FlashNews Modal State
  const [editingFlashItem, setEditingFlashItem] = useState<FlashNewsItem | null>(null);
  const [editHeadline, setEditHeadline] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<FlashNewsCategory>('BREAKING');
  const [editPriority, setEditPriority] = useState<'URGENT' | 'HIGH' | 'NORMAL'>('HIGH');
  const [editBlinkInterval, setEditBlinkInterval] = useState<number>(5);
  const [editSlotPosition, setEditSlotPosition] = useState<'STANDARD' | 'TOP_PRIORITY' | 'STICKY'>('STANDARD');
  const [editShowcaseLimit, setEditShowcaseLimit] = useState<number>(0);
  const [editFlashFeedback, setEditFlashFeedback] = useState<string | null>(null);

  // Edit Business Organisation Settings Modal State
  const [editingBusiness, setEditingBusiness] = useState<BusinessProfile | null>(null);
  const [editBizCanPublish, setEditBizCanPublish] = useState<boolean>(true);
  const [editBizCustomRate, setEditBizCustomRate] = useState<number>(50);
  const [editBizDailyLimit, setEditBizDailyLimit] = useState<number>(10);
  const [editBizDisplayName, setEditBizDisplayName] = useState<string>('');
  const [editBizFeedback, setEditBizFeedback] = useState<string | null>(null);

  // Word count: Updated to 200 words max as required
  const wordCount = useMemo(() => countWords(content), [content]);
  const isOverWordLimit = wordCount > 200;
  const wordsRemaining = 200 - wordCount;

  // Edit Word count
  const editWordCount = useMemo(() => countWords(editContent), [editContent]);
  const isEditOverWordLimit = editWordCount > 200;

  // Permission helper to check if current user or business can edit an item
  const canEditFlashItem = (item: FlashNewsItem): boolean => {
    if (isSuperAdmin || activeAdminUser || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') {
      return true;
    }
    if (currentBusiness) {
      if (item.published_by_id === currentBusiness.business_id) return true;
      if (item.published_by_org?.toLowerCase() === currentBusiness.organization_name.toLowerCase()) return true;
      if (item.published_by_name?.toLowerCase() === currentBusiness.organization_name.toLowerCase()) return true;
    }
    if (currentUser) {
      if (item.published_by_id === currentUser.user_id) return true;
      if (item.published_by_name?.toLowerCase() === currentUser.username.toLowerCase()) return true;
    }
    return false;
  };

  const handleStartEditFlash = (item: FlashNewsItem) => {
    setEditingFlashItem(item);
    setEditHeadline(item.headline || '');
    setEditContent(item.content || '');
    setEditCategory(item.category || 'BREAKING');
    setEditPriority(item.priority || 'HIGH');
    setEditBlinkInterval(item.blink_interval_sec || 5);
    setEditSlotPosition(item.slot_position || 'STANDARD');
    setEditShowcaseLimit(item.showcase_limit || 0);
    setEditFlashFeedback(null);
  };

  const handleSaveFlashEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlashItem) return;

    if (isEditOverWordLimit) {
      setEditFlashFeedback(`Content exceeds maximum 200 words (currently ${editWordCount} words).`);
      return;
    }

    const res = db.updateFlashNews(
      editingFlashItem.id,
      {
        headline: editHeadline,
        content: editContent,
        category: editCategory,
        priority: editPriority,
        blink_interval_sec: editBlinkInterval,
        slot_position: editSlotPosition,
        showcase_limit: editShowcaseLimit,
      },
      currentBusiness?.organization_name || publisherName
    );

    if (res.success) {
      setFormFeedback({ type: 'success', message: res.message });
      setEditingFlashItem(null);
      refreshData();
      setTimeout(() => setFormFeedback(null), 4000);
    } else {
      setEditFlashFeedback(res.message);
    }
  };

  const handleStartEditBusiness = (biz: BusinessProfile) => {
    setEditingBusiness(biz);
    setEditBizCanPublish(biz.can_publish_flashnews !== false);
    setEditBizCustomRate((biz as any).custom_flashnews_debit_rate || config.business_publish_credit_cost || 50);
    setEditBizDailyLimit((biz as any).daily_flashnews_publish_limit || 10);
    setEditBizDisplayName((biz as any).flashnews_display_name || biz.organization_name);
    setEditBizFeedback(null);
  };

  const handleSaveBusinessEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    const res = db.updateBusinessFlashNewsCustomSettings(
      editingBusiness.business_id,
      {
        can_publish_flashnews: editBizCanPublish,
        custom_debit_rate: editBizCustomRate,
        daily_publish_limit: editBizDailyLimit,
        custom_organization_display_name: editBizDisplayName,
      },
      publisherName
    );

    if (res.success) {
      setFormFeedback({ type: 'success', message: res.message });
      setEditingBusiness(null);
      refreshData();
      setTimeout(() => setFormFeedback(null), 4000);
    } else {
      setEditBizFeedback(res.message);
    }
  };

  // Real-time credit calculation based on Timing, Slot Position, Showcase Times, and Category
  const calculatedCreditCost = useMemo(() => {
    return db.calculateFlashNewsCreditCost({
      blinkIntervalSec,
      slotPosition,
      showcaseLimit,
      category,
    });
  }, [blinkIntervalSec, slotPosition, showcaseLimit, category, config.pricing_matrix]);

  const refreshData = () => {
    setActiveItems(db.getFlashNews());
    setAllItems(db.getAllFlashNews());
    const freshConfig = db.getFlashNewsConfig();
    setConfig(freshConfig);
    if (freshConfig.pricing_matrix) setPricingMatrix(freshConfig.pricing_matrix);
    if (freshConfig.auto_mail_backup) setAutoMailConfig(freshConfig.auto_mail_backup);
    setBusinesses(db.getBusinesses());
    if (onRefreshData) onRefreshData();
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Handle FlashNews Publication with timing, position, and showcase limits
  const handlePublish = (e?: React.FormEvent, bypassCheckoutModal: boolean = false) => {
    if (e) e.preventDefault();

    if (!content.trim()) {
      setFormFeedback({ type: 'error', message: 'Flashnews content cannot be empty.' });
      return;
    }

    if (isOverWordLimit) {
      setFormFeedback({
        type: 'error',
        message: `Word limit violation: Current content has ${wordCount} words. Maximum allowed is 200 words.`,
      });
      return;
    }

    // Requirement: FlashNews Publish credit debit notification popup for business users
    if (isBusiness && !bypassCheckoutModal) {
      setShowBusinessCheckoutModal(true);
      return;
    }

    const res = db.publishFlashNews({
      headline: headline.trim() || undefined,
      content: content.trim(),
      category,
      priority,
      authorId: currentBusiness?.business_id || currentUser?.user_id || activeAdminUser?.admin_id || 'admin_super_admin',
      authorName: currentBusiness?.organization_name || publisherName,
      authorRole: isBusiness ? 'Business Organization' : publisherRole,
      publisherType: isBusiness ? 'BUSINESS' : isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
      publisherOrg: currentBusiness?.organization_name || (isSuperAdmin ? 'Truvaer Executive Command' : 'TruvAer Operations Directorate'),
      publisherId: currentBusiness?.business_id || currentUser?.user_id || activeAdminUser?.admin_id || 'admin_super_admin',
      blink_interval_sec: blinkIntervalSec,
      slot_position: slotPosition,
      showcase_limit: showcaseLimit,
      customCreditCost: isBusiness ? calculatedCreditCost : 0,
      adminLevel: activeAdminUser?.level || (isSuperAdmin ? 8 : 1),
    } as any);

    if (res.success) {
      setHeadline('');
      setContent('');
      setShowBusinessCheckoutModal(false);
      setFormFeedback({ type: 'success', message: res.message });
      refreshData();
      setTimeout(() => setFormFeedback(null), 5000);
    } else {
      setShowBusinessCheckoutModal(false);
      setFormFeedback({ type: 'error', message: res.message });
    }
  };

  // 2-Step Verification: Approve Level 1 (Editorial Review)
  const handleApproveLevel1 = (id: string) => {
    const res = db.approveFlashNewsLevel1(id, publisherName, publisherRole);
    if (res.success) {
      setFormFeedback({ type: 'success', message: res.message });
      refreshData();
      setTimeout(() => setFormFeedback(null), 4000);
    } else {
      setFormFeedback({ type: 'error', message: res.message });
    }
  };

  // 2-Step Verification: Approve Level 2 (Sovereign L8 Clearance & Deploy Live)
  const handleApproveLevel2 = (id: string) => {
    const res = db.approveFlashNewsLevel2(id, publisherName, publisherRole);
    if (res.success) {
      setFormFeedback({ type: 'success', message: res.message });
      refreshData();
      setTimeout(() => setFormFeedback(null), 4000);
    } else {
      setFormFeedback({ type: 'error', message: res.message });
    }
  };

  // Rejection with reason and refund
  const handleReject = (id: string) => {
    const reason = prompt('Please enter the compliance rejection reason:') || 'Editorial policy or airworthiness guideline violation.';
    const res = db.rejectFlashNews(id, reason, publisherName);
    if (res.success) {
      setFormFeedback({ type: 'success', message: res.message });
      refreshData();
      setTimeout(() => setFormFeedback(null), 4000);
    } else {
      setFormFeedback({ type: 'error', message: res.message });
    }
  };

  // Update Credit Debit Cost
  const handleUpdateCreditCost = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateFlashNewsCreditCost(Number(creditCostInput), publisherName);
    if (res.success) {
      setConfigFeedback(`Success: ${res.message}`);
      refreshData();
      setTimeout(() => setConfigFeedback(null), 4000);
    } else {
      setConfigFeedback(`Error: ${res.message}`);
    }
  };

  // Toggle Business FlashNews Publishing Permission
  const handleToggleBusinessPermission = (businessId: string, currentStatus?: boolean) => {
    const nextStatus = !currentStatus;
    const res = db.toggleBusinessFlashNewsPermission(businessId, nextStatus, publisherName);
    if (res.success) {
      setFormFeedback({ type: 'success', message: res.message });
      refreshData();
      setTimeout(() => setFormFeedback(null), 3000);
    } else {
      setFormFeedback({ type: 'error', message: res.message });
    }
  };

  // Super Admin: Update Active Queue Capacity (Minimum 10)
  const handleUpdateCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setConfigFeedback('Permission Denied: Only Super Admin can edit the active publishing limit.');
      return;
    }

    if (targetLimit < 10) {
      setConfigFeedback('Capacity must be configured for a minimum of 10 flashnews.');
      return;
    }

    const res = db.updateFlashNewsConfig(targetLimit, {
      role: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
      name: publisherName,
      email: currentUser?.email || 'sup_admin@truvaer.com',
    }, creditCostInput);

    if (res.success) {
      setConfigFeedback(`Success: ${res.message}`);
      refreshData();
      setTimeout(() => setConfigFeedback(null), 4500);
    } else {
      setConfigFeedback(`Error: ${res.message}`);
    }
  };

  // Super Admin: Export FlashNews data to Excel-compatible CSV with UTF-8 BOM
  const handleExportToExcel = (itemsToExport: FlashNewsItem[]) => {
    const headers = [
      'ID',
      'Headline',
      'Content',
      'Category',
      'Priority',
      'Word Count',
      'Blink Interval (Sec)',
      'Slot Position',
      'Showcase Limit',
      'Impressions',
      'Publisher Name',
      'Publisher Role',
      'Publisher Org',
      'Credits Debited',
      'Status',
      'Level 1 Approver',
      'Level 2 Approver',
      'Published Date',
    ];

    const rows = itemsToExport.map((i) => [
      i.id,
      `"${(i.headline || '').replace(/"/g, '""')}"`,
      `"${(i.content || '').replace(/"/g, '""')}"`,
      i.category,
      i.priority,
      i.word_count,
      i.blink_interval_sec || 5,
      i.slot_position || 'STANDARD',
      i.showcase_limit || 'Unlimited',
      i.impressions_count || 0,
      `"${(i.published_by_name || '').replace(/"/g, '""')}"`,
      `"${(i.published_by_role || '').replace(/"/g, '""')}"`,
      `"${(i.published_by_org || '').replace(/"/g, '""')}"`,
      i.credits_debited || 0,
      i.status,
      i.level_1_approved_by || 'N/A',
      i.level_2_approved_by || 'N/A',
      new Date(i.published_at).toISOString(),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Truvaer_FlashNews_Vault_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Credit Pricing Matrix
  const handleSavePricingMatrix = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateFlashNewsPricingMatrix(pricingMatrix, publisherName);
    if (res.success) {
      setConfigFeedback(`Success: ${res.message}`);
      refreshData();
      setTimeout(() => setConfigFeedback(null), 4000);
    } else {
      setConfigFeedback(`Error: ${res.message}`);
    }
  };

  // Save Automated Email Backup Config
  const handleSaveAutoMailConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateFlashNewsAutoMailConfig(autoMailConfig, publisherName);
    if (res.success) {
      setBackupDispatchFeedback('Automated email backup settings saved successfully.');
      refreshData();
      setTimeout(() => setBackupDispatchFeedback(null), 4000);
    }
  };

  // Dispatch Instant Backup Email Trigger
  const handleInstantBackupDispatch = () => {
    const res = db.dispatchFlashNewsBackupNow(publisherName);
    if (res.success) {
      setBackupDispatchFeedback(res.message);
      refreshData();
      setTimeout(() => setBackupDispatchFeedback(null), 5000);
    }
  };

  const handleAddRecipientEmail = () => {
    const email = newRecipientInput.trim();
    if (!email || !email.includes('@')) return;
    if (autoMailConfig.recipient_emails.includes(email)) return;
    const updated = {
      ...autoMailConfig,
      recipient_emails: [...autoMailConfig.recipient_emails, email],
    };
    setAutoMailConfig(updated);
    db.updateFlashNewsAutoMailConfig(updated, publisherName);
    setNewRecipientInput('');
  };

  const handleRemoveRecipientEmail = (email: string) => {
    const updated = {
      ...autoMailConfig,
      recipient_emails: autoMailConfig.recipient_emails.filter((e) => e !== email),
    };
    setAutoMailConfig(updated);
    db.updateFlashNewsAutoMailConfig(updated, publisherName);
  };

  // Role-Based Retention Filtering for History:
  // Admin, L7, L8: Rolling 30-day view only (older items auto-purged from view)
  // Super Admin: Full history + custom date range picker
  const filteredHistoryItems = useMemo(() => {
    return db.getFlashNewsHistory({
      isSuperAdmin,
      role: isSuperAdmin ? 'SUPER_ADMIN' : activeAdminUser?.role,
      startDate: historyStartDate || undefined,
      endDate: historyEndDate || undefined,
    }).filter((i) => i.status === 'ARCHIVED');
  }, [allItems, isSuperAdmin, activeAdminUser?.role, historyStartDate, historyEndDate]);

  const pendingLevel1 = allItems.filter((i) => i.status === 'PENDING_LEVEL_1');
  const pendingLevel2 = allItems.filter((i) => i.status === 'PENDING_LEVEL_2');
  const totalPending = pendingLevel1.length + pendingLevel2.length;
  const archivedItems = allItems.filter((i) => i.status === 'ARCHIVED');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Radio className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Flashnews &amp; Live Blink Feed Publication Desk
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  5s Blink Feed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Publish high-impact broadcast notices into the home page Flash News live feed. Max 200 words per entry.
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Status Pill & Business Wallet Indicator */}
        <div className="flex items-center space-x-3 shrink-0">
          {!isBusiness ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Active Queue Capacity</div>
              <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                <span>{activeItems.length} / {config.max_active_limit} Published</span>
                {activeItems.length >= config.max_active_limit && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30">
                    FIFO Active
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Corporate Wallet Balance</div>
              <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>{businessWalletBalance.toLocaleString()} Credits</span>
              </div>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              Close Desk
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs: Business Users restricted exclusively to FlashNews Desk and Queue */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setViewTab('publish')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            viewTab === 'publish'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>FlashNews Desk</span>
        </button>

        {!isBusiness && (
          <button
            type="button"
            onClick={() => setViewTab('verification_queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
              viewTab === 'verification_queue'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-amber-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2-Step Verification Queue</span>
            {totalPending > 0 && (
              <span className="ml-1 bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {totalPending}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setViewTab('active_queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            viewTab === 'active_queue'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-amber-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Queue ({queueCounts.active + queueCounts.inactive + queueCounts.rejected})</span>
        </button>

        {!isBusiness && (
          <>
            <button
              type="button"
              onClick={() => setViewTab('pricing_matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                viewTab === 'pricing_matrix'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Credit Matrix &amp; Pricing</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('business_permissions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                viewTab === 'business_permissions'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Business Access</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('archived')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                viewTab === 'archived'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>FIFO Archived History ({filteredHistoryItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('capacity_settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                viewTab === 'capacity_settings'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Super Admin Queue Capacity</span>
              {isSuperAdmin ? (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Editable
                </span>
              ) : (
                <Lock className="w-3 h-3 text-slate-500" />
              )}
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: FLASHNEWS DESK (200 Words Max, Dynamic Credit Checkout)           */}
      {/* ========================================================================= */}
      {viewTab === 'publish' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              {/* Header: Renamed to FlashNews Desk, word limit badge at top removed */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>FlashNews Desk</span>
                </h3>
                <div className="flex items-center space-x-2">
                  {currentBusiness && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEditBusiness(currentBusiness)}
                        className="text-xs font-bold bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 px-2.5 py-1 rounded-full flex items-center space-x-1 transition-all cursor-pointer"
                        title="Edit organization publishing parameters"
                      >
                        <Edit3 className="w-3 h-3 text-sky-400" />
                        <span>Edit Org Privileges</span>
                      </button>
                      <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center space-x-1">
                        <Wallet className="w-3 h-3" />
                        <span>Rate: {calculatedCreditCost} Credits</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Organization Publishing Status Banner for Business Accounts */}
              {currentBusiness && (
                <div
                  className={`p-3 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    currentBusiness.can_publish_flashnews !== false
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {currentBusiness.can_publish_flashnews !== false ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>
                      <strong>{currentBusiness.organization_name}:</strong>{' '}
                      {currentBusiness.can_publish_flashnews !== false
                        ? 'Publishing permission is ACTIVE. You have authorized clearance to compose, publish, and edit news broadcasts.'
                        : 'Publishing permission is currently DISABLED by Platform Administration.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartEditBusiness(currentBusiness)}
                    className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-400 text-white font-bold text-[11px] flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-3 h-3 text-sky-400" />
                    <span>Edit Org Settings</span>
                  </button>
                </div>
              )}

              {formFeedback && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center space-x-2.5 font-medium border ${
                    formFeedback.type === 'success'
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {formFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{formFeedback.message}</span>
                </div>
              )}

              {/* FIFO Rolling Queue Notice */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-white">Automatic Rolling FIFO Rule: </strong>
                  The active feed holds a minimum of 10 items (currently configured to <strong>{config.max_active_limit} items</strong>). When you publish this new flashnews, if the queue is at capacity, the oldest active item will automatically be rotated out into the archive.
                </div>
              </div>

              <form onSubmit={handlePublish} className="space-y-4">
                {/* Headline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Flashnews Headline / Topic
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. DGCA Airspace Low-Visibility Operational Advisory"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Category</span>
                      {currentBusiness && pricingMatrix && (
                        <span className="text-[10px] text-amber-400 font-mono">
                          +{pricingMatrix.category_rates[category] ?? 20} Cr
                        </span>
                      )}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FlashNewsCategory)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                    >
                      {Object.entries((pricingMatrix.category_rates as Record<string, number>) || {}).map(
                        ([catKey, rate]) => (
                          <option key={catKey} value={catKey}>
                            {catKey.replace(/_/g, ' ')} (+{rate} Cr)
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="URGENT">🔴 Urgent (High Impact Blink)</option>
                      <option value="HIGH">🟡 High Priority</option>
                      <option value="NORMAL">🔵 Standard Priority</option>
                    </select>
                  </div>
                </div>

                {/* Timing Option, Slot Position, and Showcase Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  {/* Timing Option */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Blink Timing</span>
                      </span>
                      {currentBusiness && pricingMatrix && (
                        <span className="text-[10px] text-amber-300 font-mono">
                          +{pricingMatrix.timing_rates[blinkIntervalSec] ?? 15} Cr
                        </span>
                      )}
                    </label>
                    <select
                      value={blinkIntervalSec}
                      onChange={(e) => setBlinkIntervalSec(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-750 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value={5}>5 Seconds (Standard Blink)</option>
                      <option value={10}>10 Seconds (Extended Blink)</option>
                      <option value={15}>15 Seconds (Long Reading)</option>
                      <option value={30}>30 Seconds (Static Alert)</option>
                    </select>
                  </div>

                  {/* Slot Position */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Slot Position</span>
                      </span>
                      {currentBusiness && pricingMatrix && (
                        <span className="text-[10px] text-sky-300 font-mono">
                          +{pricingMatrix.position_rates[slotPosition] ?? 10} Cr
                        </span>
                      )}
                    </label>
                    <select
                      value={slotPosition}
                      onChange={(e) => setSlotPosition(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="STANDARD">Standard Position (FIFO)</option>
                      <option value="STICKY">Sticky (Permanent Highlight)</option>
                      <option value="TOP_PRIORITY">Top Priority (#1 Queue)</option>
                    </select>
                  </div>

                  {/* Showcase Times / Limit */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Showcase Times</span>
                      </span>
                      {currentBusiness && pricingMatrix && (
                        <span className="text-[10px] text-emerald-300 font-mono">
                          +{pricingMatrix.showcase_rates[showcaseLimit] ?? 75} Cr
                        </span>
                      )}
                    </label>
                    <select
                      value={showcaseLimit}
                      onChange={(e) => setShowcaseLimit(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value={0}>Continuous / Unlimited</option>
                      <option value={10}>10 Times (Quick Pulse)</option>
                      <option value={25}>25 Times (Campaign)</option>
                      <option value={50}>50 Times (Extensive)</option>
                      <option value={100}>100 Times (Maximum Burst)</option>
                    </select>
                  </div>
                </div>

                {/* 2-Step Verification & Credit Notice */}
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>2-Step Verification Policy:</strong> All broadcast flashnews (Super Admin, Admin, and Business Users) undergo a 2-level authorization pipeline (Level 1 Editorial &rarr; Level 2 Sovereign L8 Clearance) before deploying to the live blinking feed.
                    {currentBusiness && (
                      <span className="block mt-1 text-emerald-300 font-mono font-bold">
                        Corporate Wallet Debit: {calculatedCreditCost} credits will be debited upon Level 1 submission (credited to Truvaer Platform Treasury).
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area with strict live 200-word counter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Flashnews Content Text (Max 200 Words) *
                    </label>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isOverWordLimit
                          ? 'text-rose-400 font-black'
                          : wordsRemaining <= 25
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {wordsRemaining >= 0 ? `${wordsRemaining} words remaining` : `${Math.abs(wordsRemaining)} words over limit`}
                    </span>
                  </div>

                  <textarea
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the complete flashnews text here. This will rotate on the live feed ticker every 5 seconds..."
                    className={`w-full bg-slate-950 border rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none leading-relaxed transition-colors ${
                      isOverWordLimit
                        ? 'border-rose-500 focus:border-rose-400 ring-1 ring-rose-500/40'
                        : 'border-slate-800 focus:border-amber-500'
                    }`}
                    required
                  />

                  {isOverWordLimit && (
                    <p className="mt-1.5 text-xs text-rose-400 font-semibold flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>
                        Strict Restriction: Flashnews cannot exceed 200 words. Please trim {Math.abs(wordsRemaining)} words to proceed with publication.
                      </span>
                    </p>
                  )}
                </div>

                {/* Publisher Signature Footer */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Submitting as: <strong className="text-white">{currentBusiness?.organization_name || publisherName}</strong> ({currentBusiness ? 'Business User' : publisherRole})
                  </div>

                  <button
                    type="submit"
                    disabled={isOverWordLimit || !content.trim()}
                    className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 transition-all cursor-pointer ${
                      isOverWordLimit || !content.trim()
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-95'
                    }`}
                  >
                    {isL7OrL8 ? (
                      <>
                        <Flame className="w-4 h-4 text-slate-950" />
                        <span>Publish Live (L7/L8 Sovereign Clearance)</span>
                      </>
                    ) : isBusiness ? (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit for 2-Level Verification ({calculatedCreditCost} Cr)</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit for 2-Level Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Col: Live 5-Second Blink Feed Preview */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-xs font-black text-amber-300 font-mono uppercase">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Live Feed Card Preview</span>
              </div>
              <p className="text-[11px] text-slate-400">
                This preview updates in real time to show how your text will display on the home page:
              </p>

              {/* Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 shadow-inner space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-rose-300 uppercase">
                      Flash News
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      {category.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {wordCount} / 200 words
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white">
                  {headline.trim() || 'Headline will appear here'}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                  {content.trim() || `Your 200-word flashnews text will rotate here on a ${blinkIntervalSec}-second interval time frame...`}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Slot: {slotPosition}</span>
                  <span>{blinkIntervalSec}s Auto-Blink {showcaseLimit > 0 ? `(${showcaseLimit}x)` : ''}</span>
                </div>
              </div>
            </div>

            {/* Quick Super Admin Capacity Note */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white font-mono uppercase">Queue Capacity</span>
                {isSuperAdmin ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Super Admin Access
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>L8 Protected</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Capacity is configured to <strong>{config.max_active_limit} items</strong>. When an 11th item is published, the 1st oldest item is automatically retired. Only Super Admin can modify this limit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: 2-STEP VERIFICATION & 2-LEVEL APPROVAL QUEUE                        */}
      {/* Level 1: Editorial Review -> Level 2: Sovereign L8 Super Admin Clearance   */}
      {/* ========================================================================= */}
      {viewTab === 'verification_queue' && (
        <div className="space-y-6">
          {/* Queue Status Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-400">Total In Verification</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-white mt-1">{totalPending} Items</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Undergoing 2-level compliance review</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-amber-400">Step 1: Editorial Pending</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <div className="text-xl font-black text-amber-300 mt-1">{pendingLevel1.length} Items</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Manager / Admin Review</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-rose-400">Step 2: L8 Clearance</span>
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              </div>
              <div className="text-xl font-black text-rose-300 mt-1">{pendingLevel2.length} Items</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Super Admin Clearance</div>
            </div>
          </div>

          {/* SECTION 1: Step 1 (Level 1 Editorial & Compliance Clearance) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                    1
                  </span>
                  <span>Step 1: Level 1 Editorial &amp; Compliance Clearance ({pendingLevel1.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  First approval tier: Validates headline, 160-word integrity, priority, slot timing, and author identity.
                </p>
              </div>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                Approver: Operations Desk / L5+
              </span>
            </div>

            {pendingLevel1.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-slate-800/60">
                All submitted broadcast notices have completed Level 1 editorial review.
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingLevel1.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-3 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {item.priority}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ⏱️ {item.blink_interval_sec || 5}s timing • 📌 {item.slot_position || 'STANDARD'} • 🎯 {item.showcase_limit ? `${item.showcase_limit}x` : 'Continuous'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Submitted: {new Date(item.created_at || item.published_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{item.headline}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        {item.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                        <span>
                          Author: <strong className="text-white">{item.published_by_name}</strong> ({item.published_by_role})
                        </span>
                        {item.published_by_type === 'BUSINESS' && (
                          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Corporate Debit: {item.credits_debited || 50} Credits (To Truvaer Treasury)
                          </span>
                        )}
                        {item.published_by_type !== 'BUSINESS' && (
                          <span className="text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            Platform Admin Broadcast (Credits to Truvaer)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {canEditFlashItem(item) && (
                          <button
                            type="button"
                            onClick={() => handleStartEditFlash(item)}
                            className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                            title="Edit this news draft"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleApproveLevel1(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Level 1 (Advance)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject &amp; Refund</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: Step 2 (Level 2 Sovereign L8 Super Admin Clearance) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
                    2
                  </span>
                  <span>Step 2: Level 2 Super Admin Sovereign Clearance ({pendingLevel2.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Second approval tier: Final sovereign clearance that activates the flashnews into the live home page feed.
                </p>
              </div>
              <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20 font-bold">
                Clearance: Super Admin (L8 Sovereign)
              </span>
            </div>

            {pendingLevel2.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-slate-800/60">
                No items currently awaiting Level 2 Sovereign clearance.
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingLevel2.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 hover:border-rose-500/60 space-y-3 transition-colors shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.priority}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          ✓ Level 1 Cleared: {item.level_1_approved_by} ({item.level_1_approved_role})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Passed Level 1: {item.level_1_approved_at ? new Date(item.level_1_approved_at).toLocaleTimeString() : 'Recent'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{item.headline}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                        {item.content}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-[11px] text-slate-400 font-mono">
                        Author: <strong className="text-white">{item.published_by_name}</strong> • Timing: <strong>{item.blink_interval_sec || 5}s</strong> • Slot: <strong>{item.slot_position || 'STANDARD'}</strong>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {canEditFlashItem(item) && (
                          <button
                            type="button"
                            onClick={() => handleStartEditFlash(item)}
                            className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                            title="Edit this news draft"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleApproveLevel2(item.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Authorize Level 2 (Deploy Live)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject &amp; Refund</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: BROADCAST QUEUE (Dynamic Filter: Active, Inactive, Rejected)      */}
      {/* ========================================================================= */}
      {viewTab === 'active_queue' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-black text-white">
                  Broadcast Queue ({queueItemsForViewer.length} {queueFilter.toLowerCase()} items)
                </h3>
                {isBusiness && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    My Organization Posts Only
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBusiness
                  ? `Isolated feed displaying only Flash News initiated by ${currentBusiness?.organization_name}.`
                  : 'Manage and review live, inactive, and rejected broadcasts across the aviation network.'}
              </p>
            </div>

            {/* Toggle Filters: Active, Inactive, Rejected (Task 3) */}
            <div className="flex items-center space-x-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setQueueFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  queueFilter === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active ({queueCounts.active})</span>
              </button>

              <button
                type="button"
                onClick={() => setQueueFilter('INACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  queueFilter === 'INACTIVE'
                    ? 'bg-amber-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Inactive ({queueCounts.inactive})</span>
              </button>

              <button
                type="button"
                onClick={() => setQueueFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  queueFilter === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rejected ({queueCounts.rejected})</span>
              </button>
            </div>
          </div>

          {queueItemsForViewer.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-slate-800/60 space-y-2">
              <Radio className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
              <p>
                No {queueFilter.toLowerCase()} Flash News found
                {isBusiness ? ` for ${currentBusiness?.organization_name}.` : '.'}
              </p>
              {isBusiness && (
                <button
                  type="button"
                  onClick={() => setViewTab('publish')}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                >
                  Create Flash News
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-3 font-semibold">Status</th>
                    <th className="px-3.5 py-3 font-semibold">Headline &amp; Content</th>
                    <th className="px-3.5 py-3 font-semibold">Category &amp; Timing</th>
                    <th className="px-3.5 py-3 font-semibold">Words</th>
                    <th className="px-3.5 py-3 font-semibold">Credits</th>
                    <th className="px-3.5 py-3 font-semibold">Published</th>
                    <th className="px-3.5 py-3 font-semibold">Publisher</th>
                    <th className="px-3.5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queueItemsForViewer.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        {item.status === 'ACTIVE' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Live Active</span>
                          </span>
                        )}
                        {item.status === 'PENDING_LEVEL_1' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Step 1 Review</span>
                          </span>
                        )}
                        {item.status === 'PENDING_LEVEL_2' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center space-x-1 w-fit">
                            <ShieldCheck className="w-3 h-3 text-orange-400" />
                            <span>Step 2 Signoff</span>
                          </span>
                        )}
                        {item.status === 'ARCHIVED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1 w-fit">
                            <Archive className="w-3 h-3 text-slate-400" />
                            <span>Archived</span>
                          </span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1 w-fit">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      <td className="px-3.5 py-3 max-w-sm">
                        <div className="font-bold text-white text-xs">{item.headline}</div>
                        <div className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                          {item.content}
                        </div>
                        {item.status === 'REJECTED' && (
                          <div className="mt-1.5 p-2 rounded-xl bg-rose-950/80 border border-rose-500/30 text-[10px] text-rose-200 space-y-0.5">
                            <div>
                              <strong>Reason:</strong> {item.rejection_reason || 'Compliance guideline policy'}
                            </div>
                            <div className="text-emerald-300 font-mono">
                              ✓ Auto-Refunded: {item.credits_debited || 0} Credits credited back to wallet
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-slate-950 text-sky-300 border-sky-500/30 uppercase block w-fit">
                            {item.category.replace(/_/g, ' ')}
                          </span>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.blink_interval_sec || 5}s • {item.slot_position || 'STANDARD'}
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-3 font-mono text-slate-400 whitespace-nowrap">
                        <span className="text-white font-bold">{item.word_count}</span> / 200
                      </td>

                      <td className="px-3.5 py-3 font-mono text-amber-400 font-bold whitespace-nowrap">
                        {item.credits_debited ? `${item.credits_debited} Cr` : '0 Cr'}
                      </td>

                      <td className="px-3.5 py-3 text-[10px] font-mono text-slate-400 whitespace-nowrap">
                        <div>{new Date(item.published_at).toLocaleDateString()}</div>
                        <div className="text-slate-500">{new Date(item.published_at).toLocaleTimeString()}</div>
                      </td>

                      <td className="px-3.5 py-3 text-[11px] text-slate-300 whitespace-nowrap">
                        <div className="font-semibold">{item.published_by_name}</div>
                        <div className="text-[9px] text-slate-500 font-mono">{item.published_by_org || item.published_by_role}</div>
                      </td>

                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {canEditFlashItem(item) && (
                            <button
                              type="button"
                              onClick={() => handleStartEditFlash(item)}
                              className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                              title="Edit this flashnews broadcast"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                          )}

                          {!isBusiness && item.status === 'ACTIVE' && (
                            <button
                              type="button"
                              onClick={() => {
                                db.archiveFlashNews(item.id);
                                refreshData();
                              }}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                              title="Move to archive"
                            >
                              <Archive className="w-3 h-3" />
                              <span>Archive</span>
                            </button>
                          )}

                          {!isBusiness && item.status === 'ARCHIVED' && (
                            <button
                              type="button"
                              onClick={() => {
                                db.unarchiveFlashNews(item.id);
                                refreshData();
                              }}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                              title="Restore to active live feed"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          )}

                          {!isBusiness && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Permanently delete this flashnews item?')) {
                                  db.deleteFlashNews(item.id);
                                  refreshData();
                                }
                              }}
                              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: CREDIT PRICING MATRIX & C-PANEL CALIBRATION (Admin & Super Admin)   */}
      {/* ========================================================================= */}
      {viewTab === 'pricing_matrix' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Wallet className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    Dynamic FlashNews Credit Pricing Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define credit debit cost for business publications based on Timing, Slot Position, Showcase Frequency, and Category.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isSuperAdmin ? 'Super Admin (L8) Sovereign Control' : 'Admin Operations Control'}
                </span>
              </div>
            </div>

            {configFeedback && (
              <div className="p-3.5 rounded-2xl text-xs font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-200">
                {configFeedback}
              </div>
            )}

            <form onSubmit={handleSavePricingMatrix} className="space-y-6">
              {/* Row 1: Base Platform Cost */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Base Platform Fee</div>
                  <div className="text-[11px] text-slate-400">Baseline cost charged before parameter additions.</div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={pricingMatrix.base_cost ?? 20}
                    onChange={(e) => setPricingMatrix({ ...pricingMatrix, base_cost: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-24 bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold outline-none text-right"
                  />
                  <span className="text-xs font-mono text-slate-400">Credits</span>
                </div>
              </div>

              {/* Grid 2x2 for Parameter Rates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Blink Timing Rates */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 font-mono uppercase pb-2 border-b border-slate-800">
                    <Clock className="w-4 h-4" />
                    <span>Timing Rates (Seconds)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { sec: 5, label: '5s Standard Blink' },
                      { sec: 10, label: '10s Extended Blink' },
                      { sec: 15, label: '15s Long Reading' },
                      { sec: 30, label: '30s Static Alert' },
                    ].map(({ sec, label }) => (
                      <div key={sec} className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{label}</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="0"
                            value={pricingMatrix.timing_rates?.[sec] ?? 15}
                            onChange={(e) =>
                              setPricingMatrix({
                                ...pricingMatrix,
                                timing_rates: {
                                  ...pricingMatrix.timing_rates,
                                  [sec]: Math.max(0, parseInt(e.target.value) || 0),
                                },
                              })
                            }
                            className="w-20 bg-slate-900 border border-slate-750 focus:border-amber-400 rounded-lg px-2 py-1 text-xs text-white font-mono text-right"
                          />
                          <span className="text-[11px] text-slate-500 font-mono">Cr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Slot Position Rates */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 font-mono uppercase pb-2 border-b border-slate-800">
                    <Layers className="w-4 h-4" />
                    <span>Slot Position Rates</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { pos: 'STANDARD', label: 'Standard FIFO Position' },
                      { pos: 'STICKY', label: 'Sticky Highlight' },
                      { pos: 'TOP_PRIORITY', label: 'Top Priority (#1 Queue)' },
                    ].map(({ pos, label }) => (
                      <div key={pos} className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{label}</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="0"
                            value={(pricingMatrix.position_rates as Record<string, number>)?.[pos] ?? 10}
                            onChange={(e) =>
                              setPricingMatrix({
                                ...pricingMatrix,
                                position_rates: {
                                  ...pricingMatrix.position_rates,
                                  [pos]: Math.max(0, parseInt(e.target.value) || 0),
                                },
                              })
                            }
                            className="w-20 bg-slate-900 border border-slate-750 focus:border-sky-400 rounded-lg px-2 py-1 text-xs text-white font-mono text-right"
                          />
                          <span className="text-[11px] text-slate-500 font-mono">Cr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Showcase Frequency Rates */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 font-mono uppercase pb-2 border-b border-slate-800">
                    <Eye className="w-4 h-4" />
                    <span>Showcase Times (Per Day)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {[
                      { limit: 0, label: 'Continuous / Unlimited' },
                      { limit: 10, label: '10 Times / Day' },
                      { limit: 25, label: '25 Times / Day' },
                      { limit: 50, label: '50 Times / Day' },
                      { limit: 100, label: '100 Times / Day' },
                    ].map(({ limit, label }) => (
                      <div key={limit} className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{label}</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="0"
                            value={pricingMatrix.showcase_rates?.[limit] ?? 30}
                            onChange={(e) =>
                              setPricingMatrix({
                                ...pricingMatrix,
                                showcase_rates: {
                                  ...pricingMatrix.showcase_rates,
                                  [limit]: Math.max(0, parseInt(e.target.value) || 0),
                                },
                              })
                            }
                            className="w-20 bg-slate-900 border border-slate-750 focus:border-emerald-400 rounded-lg px-2 py-1 text-xs text-white font-mono text-right"
                          />
                          <span className="text-[11px] text-slate-500 font-mono">Cr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Category Rates CRUD (Exclusively for L7 & L8 Users - Task 5) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 font-mono uppercase">
                      <Sparkles className="w-4 h-4" />
                      <span>Category Tariff Rates</span>
                    </div>

                    {isL7OrL8 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setNewCatKey('');
                          setNewCatRate(30);
                          setCatActionFeedback(null);
                          setShowAddCategoryModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                        title="Add New Category Traffic Rate (L7/L8 Exclusive)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Rate</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>L7/L8 Clearance Required</span>
                      </span>
                    )}
                  </div>

                  {catActionFeedback && (
                    <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/30 text-xs text-purple-200">
                      {catActionFeedback}
                    </div>
                  )}

                  <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
                    {Object.entries((pricingMatrix.category_rates as Record<string, number>) || {}).map(
                      ([catKey, rate]) => {
                        const displayLabel = catKey.replace(/_/g, ' ');
                        return (
                          <div
                            key={catKey}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-750 transition-colors"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                              <div className="truncate">
                                <span className="text-white font-bold">{displayLabel}</span>
                                <span className="text-[10px] text-slate-500 font-mono ml-1.5 uppercase">
                                  ({catKey})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              {isL7OrL8 ? (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <input
                                      type="number"
                                      min="0"
                                      value={rate}
                                      onChange={(e) => {
                                        const nextRate = Math.max(0, parseInt(e.target.value) || 0);
                                        const updated = {
                                          ...pricingMatrix,
                                          category_rates: {
                                            ...pricingMatrix.category_rates,
                                            [catKey]: nextRate,
                                          },
                                        };
                                        setPricingMatrix(updated);
                                        db.updateCategoryTrafficRate(catKey, nextRate, publisherName);
                                      }}
                                      className="w-16 bg-slate-950 border border-slate-750 focus:border-purple-400 rounded-lg px-2 py-1 text-xs text-white font-mono text-right"
                                      title="Edit Category Traffic Rate (L7/L8 Exclusive)"
                                    />
                                    <span className="text-[11px] text-slate-500 font-mono">Cr</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Delete category traffic rate for "${displayLabel}" (${catKey})?`
                                        )
                                      ) {
                                        const res = db.deleteCategoryTrafficRate(catKey, publisherName);
                                        if (res.success) {
                                          setCatActionFeedback(res.message);
                                          refreshData();
                                          setTimeout(() => setCatActionFeedback(null), 3000);
                                        } else {
                                          setCatActionFeedback(res.message);
                                        }
                                      }
                                    }}
                                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Category Rate (L7/L8 Exclusive)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center space-x-1 text-slate-400 font-mono">
                                  <span className="font-bold text-white">{rate}</span>
                                  <span className="text-[11px] text-slate-500">Cr</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-mono">
                  All debited credits flow directly to Truvaer Platform Treasury with verified publication records.
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-transform active:scale-95 flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Pricing Matrix</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW: BUSINESS PERMISSIONS & C-PANEL CREDIT DEBIT SETTINGS                 */}
      {/* ========================================================================= */}
      {viewTab === 'business_permissions' && (
        <div className="space-y-6">
          {/* Header Card with Credit Cost Setting & Treasury */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Credit Cost Setting */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                      C-Panel Flashnews Credit Debit Rate Configuration
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure baseline credit cost debited from business accounts per flashnews broadcast.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Current Base: {config.business_publish_credit_cost || 50} Credits
                </span>
              </div>

              <form onSubmit={handleUpdateCreditCost} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Baseline Credits Debited per Flashnews Broadcast
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={creditCostInput}
                      onChange={(e) => setCreditCostInput(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-36 bg-slate-900 border border-emerald-500/50 rounded-xl px-3.5 py-2 text-white font-mono font-bold text-sm outline-none focus:border-emerald-400"
                      required
                    />
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow cursor-pointer transition-colors"
                    >
                      Update Debit Cost
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    When a business user publishes flashnews, this credit fee is debited from their corporate wallet with attribution: <code className="text-emerald-300">"Credits to Truvaer - Published by [Business Org]"</code>. If platform admin publishes, it is accounted as official platform notices.
                  </p>
                </div>
              </form>
            </div>

            {/* Right Col: Truvaer Treasury Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs uppercase font-bold">
                <Building2 className="w-4 h-4" />
                <span>Truvaer Platform Treasury</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Total Flashnews Credits Collected</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {(allItems.filter((i) => i.credits_debited).reduce((acc, i) => acc + (i.credits_debited || 0), 0) + 250).toLocaleString()} Credits
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Direct ledger credit to Truvaer Platform Treasury on business user broadcasts.
                </div>
              </div>
            </div>
          </div>

          {/* Business Permissions Table: Bounded scrolling to prevent page shift */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <span>Business User Flashnews Broadcast Privileges ({businesses.length} Enterprises)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorize or restrict which verified business accounts have permission to compose and submit broadcast flashnews.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bizSearch}
                  onChange={(e) => setBizSearch(e.target.value)}
                  placeholder="Filter businesses by name..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[48vh] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Business Organization</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Verification</th>
                    <th className="px-4 py-3 font-semibold">Wallet Balance</th>
                    <th className="px-4 py-3 font-semibold">Publishing Status</th>
                    <th className="px-4 py-3 font-semibold text-right">C-Panel Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {businesses
                    .filter((b) =>
                      !bizSearch.trim() ||
                      b.organization_name.toLowerCase().includes(bizSearch.toLowerCase()) ||
                      b.category?.toLowerCase().includes(bizSearch.toLowerCase())
                    )
                    .map((biz) => {
                      const isAllowed = biz.can_publish_flashnews !== false;
                      return (
                        <tr key={biz.business_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-white">
                            <div className="font-bold">{biz.organization_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{biz.physical_location || 'Aerodrome Station'}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
                              {biz.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                biz.verification_status === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {biz.verification_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                            {biz.credit_wallet_balance ?? 0} Credits
                          </td>
                          <td className="px-4 py-3">
                            {isAllowed ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Can Publish Flashnews</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center space-x-1 w-fit">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                <span>Publishing Disabled</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditBusiness(biz)}
                                className="px-2.5 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
                                title="Edit organisation flashnews privileges and parameters"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Org</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleBusinessPermission(biz.business_id, biz.can_publish_flashnews)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                                  isAllowed
                                    ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                                }`}
                              >
                                {isAllowed ? (
                                  <>
                                    <ToggleRight className="w-3.5 h-3.5" />
                                    <span>Disable</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-3.5 h-3.5" />
                                    <span>Enable</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ARCHIVED FLASHNEWS HISTORY (30-Day Retention, Super Admin Date     */}
      {/* Picker, Excel Export, & Auto-Mail System)                                 */}
      {/* ========================================================================= */}
      {viewTab === 'archived' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Archive className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">
                  FIFO Archived Flashnews ({filteredHistoryItems.length} Records)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isSuperAdmin
                  ? 'Super Admin Historical Access: View rolling records, filter by custom historical dates, or export data to Excel.'
                  : 'Role-Based Retention Policy: Admin, L7, and L8 accounts retain rolling 30-day history view. Data older than 30 days is auto-purged.'}
              </p>
            </div>

            {/* Super Admin Action Controls: Export Excel & Auto-Mail System */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleExportToExcel(filteredHistoryItems)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Download complete FlashNews history as Excel CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Export to Excel</span>
              </button>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAutoMailModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Configure automated scheduled email backup"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Auto-Mail System</span>
                </button>
              )}
            </div>
          </div>

          {/* Retention Notice & Super Admin Custom Date Picker */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-300">
                  {isSuperAdmin
                    ? 'Super Admin clearance active: Select dates below to pull records from any historical point.'
                    : 'Active 30-Day Rolling Data Retention Gate: Only records from past 30 days are visible.'}
                </span>
              </div>

              {/* Super Admin Historical Date Picker */}
              {isSuperAdmin && (
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                    <span>From:</span>
                    <input
                      type="date"
                      value={historyStartDate}
                      onChange={(e) => setHistoryStartDate(e.target.value)}
                      className="bg-slate-900 border border-slate-750 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <span>To:</span>
                    <input
                      type="date"
                      value={historyEndDate}
                      onChange={(e) => setHistoryEndDate(e.target.value)}
                      className="bg-slate-900 border border-slate-750 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
                    />
                  </div>

                  {(historyStartDate || historyEndDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryStartDate('');
                        setHistoryEndDate('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Clear Range
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {backupDispatchFeedback && (
            <div className="p-3.5 rounded-2xl text-xs font-semibold bg-blue-950/70 border border-blue-500/40 text-blue-200">
              {backupDispatchFeedback}
            </div>
          )}

          {/* Strict CSS overflow on history list to prevent page-level scroll leak */}
          {filteredHistoryItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-slate-800">
              No archived flashnews records found matching current retention criteria.
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {filteredHistoryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-750 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 text-slate-300 border border-slate-800 uppercase font-bold">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.word_count} / 200 words
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        Published: {new Date(item.published_at).toLocaleDateString()} ({new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{item.headline}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{item.content}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Publisher: {item.published_by_name} ({item.published_by_role}) • Slot: {item.slot_position || 'STANDARD'} • Impressions: {item.impressions_count || 0}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {canEditFlashItem(item) && (
                      <button
                        type="button"
                        onClick={() => handleStartEditFlash(item)}
                        className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Edit flashnews details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        db.unarchiveFlashNews(item.id);
                        refreshData();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Restore to active 5-second live blink queue"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to Live Feed</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Permanently delete this flashnews item?')) {
                          db.deleteFlashNews(item.id);
                          refreshData();
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: SUPER ADMIN QUEUE CAPACITY CALIBRATION (Exclusive L8 Access)       */}
      {/* ========================================================================= */}
      {viewTab === 'capacity_settings' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Super Admin Flashnews Capacity Calibration
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure how many active flashnews can be published in the live 5-second blink rotation (Minimum: 10 items).
              </p>
            </div>

            {isSuperAdmin ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                Super Admin Authorized (L8)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Read-Only Policy Lock</span>
              </span>
            )}
          </div>

          {configFeedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold border ${
                configFeedback.startsWith('Success')
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
              }`}
            >
              {configFeedback}
            </div>
          )}

          {!isSuperAdmin ? (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-300">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Super Admin Exclusive Configuration Policy</span>
              </div>
              <p className="leading-relaxed">
                Per strict system policy: Only <strong>Super Admin (Executive Chairman L8)</strong> has authority to modify the number of active Flashnews / Breaking news permitted in the live feed.
              </p>
              <div className="pt-2 font-mono text-[11px] text-slate-300">
                Current Configured Capacity: <strong>{config.max_active_limit} items</strong> (Rotation: {config.blink_interval_seconds}s)
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateCapacity} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Maximum Active Flashnews in Live Queue (Min: 10)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={targetLimit}
                    onChange={(e) => setTargetLimit(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-32 bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm outline-none"
                    required
                  />
                  <span className="text-xs text-slate-400">
                    Flashnews slots (Default: 10, Minimum: 10)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When this limit is reached (e.g. {targetLimit} items), publishing an additional flashnews will automatically archive the oldest 1st item to maintain the exact rolling FIFO capacity.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[10px] text-slate-500 font-mono">
                  Last updated by {config.updated_by} at {new Date(config.updated_at).toLocaleDateString()}
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-transform active:scale-95 flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Capacity Limit</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BUSINESS USER FLASHNEWS CREDIT CHECKOUT AUTHORIZATION POPUP        */}
      {/* ========================================================================= */}
      {showBusinessCheckoutModal && currentBusiness && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Submit for 2-Level Verification</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Debiting from: {currentBusiness.organization_name}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBusinessCheckoutModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Prominent Credit Debit Announcement */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
              <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                Exact Credit Amount to be Debited
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                {calculatedCreditCost} Credits
              </div>
              <div className="text-[11px] text-slate-300">
                Debited from {currentBusiness.organization_name} upon verification submission
              </div>
            </div>

            {/* Itemized Calculation Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="text-[11px] font-mono text-amber-400 font-bold uppercase pb-1 border-b border-slate-850">
                Itemized Cost Breakdown
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Base Platform Charge:</span>
                <span className="font-mono font-bold text-white">+{pricingMatrix.base_cost ?? 20} Cr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Category ({category}):</span>
                <span className="font-mono font-bold text-white">+{pricingMatrix.category_rates[category] ?? 20} Cr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Blink Timing ({blinkIntervalSec}s):</span>
                <span className="font-mono font-bold text-white">+{pricingMatrix.timing_rates[blinkIntervalSec] ?? 15} Cr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Slot Position ({slotPosition}):</span>
                <span className="font-mono font-bold text-white">+{pricingMatrix.position_rates[slotPosition] ?? 10} Cr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Showcase Frequency ({showcaseLimit > 0 ? `${showcaseLimit}x/day` : 'Unlimited'}):</span>
                <span className="font-mono font-bold text-white">+{pricingMatrix.showcase_rates[showcaseLimit] ?? 75} Cr</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                <span className="text-white">Total Credits Debited:</span>
                <span className="text-amber-400 font-mono text-base">{calculatedCreditCost} Credits</span>
              </div>
            </div>

            {/* Wallet Balance Verification */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Current Corporate Wallet:</span>
                <span className="font-bold text-white">{businessWalletBalance.toLocaleString()} Credits</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Balance After Broadcast:</span>
                <span className={`font-bold ${(businessWalletBalance - calculatedCreditCost) < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(businessWalletBalance - calculatedCreditCost).toLocaleString()} Credits
                </span>
              </div>
            </div>

            {/* Workflow Explanations */}
            {businessWalletBalance < calculatedCreditCost ? (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Insufficient balance. Please recharge your corporate wallet to publish this broadcast.</span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                <div>
                  <strong className="text-amber-400">OK Action:</strong> Route submission to the Admin 2-step verification queue. Once approved by Admin, your news will flash live on the feed.
                </div>
                <div>
                  <strong className="text-rose-400">Reject Action:</strong> If the Admin rejects the post, the debited {calculatedCreditCost} credits will be automatically refunded back to your account immediately.
                </div>
              </div>
            )}

            {/* OK and Cancel Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBusinessCheckoutModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={businessWalletBalance < calculatedCreditCost}
                onClick={() => handlePublish(undefined, true)}
                className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center space-x-2 cursor-pointer shadow-lg transition-transform active:scale-95 ${
                  businessWalletBalance < calculatedCreditCost
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>OK (Debit {calculatedCreditCost} Credits &amp; Submit)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CATEGORY TRAFFIC RATE (Exclusively for L7 & L8 Users - Task 5) */}
      {/* ========================================================================= */}
      {showAddCategoryModal && isL7OrL8 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    Add Category Traffic Rate
                  </h3>
                  <div className="text-[11px] text-purple-300 font-mono">
                    L7 &amp; L8 Sovereign Executive Exclusive
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCatKey.trim()) return;
                const res = db.addCategoryTrafficRate(newCatKey, Number(newCatRate), publisherName);
                if (res.success) {
                  setCatActionFeedback(res.message);
                  setShowAddCategoryModal(false);
                  refreshData();
                  setTimeout(() => setCatActionFeedback(null), 4000);
                } else {
                  setCatActionFeedback(res.message);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Category Name / Key *
                </label>
                <input
                  type="text"
                  value={newCatKey}
                  onChange={(e) => setNewCatKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  placeholder="e.g. VIP_AIR_AMBULANCE"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono uppercase outline-none"
                  required
                />
                <span className="text-[10px] text-slate-500">Auto-formatted in uppercase with underscores</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Tariff Credit Cost *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={newCatRate}
                    onChange={(e) => setNewCatRate(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                    required
                  />
                  <span className="text-xs text-purple-400 font-mono font-bold">Credits</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category Rate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUPER ADMIN AUTO-MAIL BACKUP SYSTEM CONFIGURATION                  */}
      {/* ========================================================================= */}
      {showAutoMailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Super Admin Automated Email Backup System</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Preserve historical FlashNews records in Excel (.csv) format
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAutoMailModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAutoMailConfig} className="space-y-4">
              {/* Frequency Selector */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Automated Backup Frequency
                </label>
                <select
                  value={autoMailConfig.frequency}
                  onChange={(e) => setAutoMailConfig({ ...autoMailConfig, frequency: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-750 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="DAILY">Daily Automated Dispatch (Every 24 Hours)</option>
                  <option value="WEEKLY">Weekly Automated Archive Snapshot (Every Monday)</option>
                  <option value="MONTHLY">Monthly Sovereign Regulatory Archive (1st of Month)</option>
                </select>
              </div>

              {/* Recipient Emails */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recipient Email Addresses (Preservation Records)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={newRecipientInput}
                    onChange={(e) => setNewRecipientInput(e.target.value)}
                    placeholder="e.g. compliance@truvaer.com"
                    className="flex-1 bg-slate-900 border border-slate-750 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddRecipientEmail}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {autoMailConfig.recipient_emails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 text-xs font-mono"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipientEmail(email)}
                        className="text-slate-500 hover:text-rose-400 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Instant Backup Trigger Button */}
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-blue-200">Send Immediate Test Dispatch</div>
                  <div className="text-[10px] text-blue-300/80">Generate Excel snapshot and dispatch right now to all recipients.</div>
                </div>
                <button
                  type="button"
                  onClick={handleInstantBackupDispatch}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Now</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="text-[10px] font-mono text-slate-500">
                  Total snapshots preserved: {autoMailConfig.backup_count || 0}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAutoMailModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Save Auto-Mail Policy
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT FLASHNEWS BROADCAST ITEM (Author Org & Admins)                */}
      {/* ========================================================================= */}
      {editingFlashItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    Edit FlashNews Broadcast
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update content, category, timing, or priority for "{editingFlashItem.headline}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFlashItem(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editFlashFeedback && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{editFlashFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveFlashEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Flashnews Headline
                </label>
                <input
                  type="text"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as FlashNewsCategory)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="BREAKING">🚨 Breaking News</option>
                    <option value="WEATHER_NOTAM">⛈️ Weather &amp; NOTAM</option>
                    <option value="CHARTER_DISPATCH">✈️ Charter &amp; Fleet Dispatch</option>
                    <option value="OPERATIONS">⚙️ Flight Operations</option>
                    <option value="AVIATION_ALERT">⚠️ Aviation Alert</option>
                    <option value="SECURITY">🛡️ Security &amp; Airworthiness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="URGENT">🔴 Urgent</option>
                    <option value="HIGH">🟡 High Priority</option>
                    <option value="NORMAL">🔵 Standard Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-amber-400 mb-1">Timing</label>
                  <select
                    value={editBlinkInterval}
                    onChange={(e) => setEditBlinkInterval(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 focus:border-amber-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value={5}>5 Seconds</option>
                    <option value={10}>10 Seconds</option>
                    <option value={15}>15 Seconds</option>
                    <option value={30}>30 Seconds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-sky-400 mb-1">Slot Position</label>
                  <select
                    value={editSlotPosition}
                    onChange={(e) => setEditSlotPosition(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-750 focus:border-sky-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value="STANDARD">Standard FIFO</option>
                    <option value="STICKY">Sticky Highlight</option>
                    <option value="TOP_PRIORITY">Top Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-emerald-400 mb-1">Showcase Frequency</label>
                  <select
                    value={editShowcaseLimit}
                    onChange={(e) => setEditShowcaseLimit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value={0}>Unlimited</option>
                    <option value={10}>10x / day</option>
                    <option value={25}>25x / day</option>
                    <option value={50}>50x / day</option>
                    <option value={100}>100x / day</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Broadcast Text Content
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      isEditOverWordLimit ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {editWordCount} / 200 words max
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none resize-none leading-relaxed ${
                    isEditOverWordLimit
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-slate-800 focus:border-amber-500'
                  }`}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-500 font-mono">
                  Publisher: {editingFlashItem.published_by_name} ({editingFlashItem.published_by_org || 'Truvaer'})
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingFlashItem(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditOverWordLimit}
                    className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md ${
                      isEditOverWordLimit
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Save FlashNews Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT BUSINESS ORGANISATION PRIVILEGES & PARAMETERS                  */}
      {/* ========================================================================= */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    Edit Organisation Privileges
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingBusiness.organization_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBusiness(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editBizFeedback && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-xs text-rose-200 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{editBizFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveBusinessEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Attribution Display Name
                </label>
                <input
                  type="text"
                  value={editBizDisplayName}
                  onChange={(e) => setEditBizDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  required
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Can Publish FlashNews</div>
                  <div className="text-[11px] text-slate-400">
                    Authorize this organization to compose and submit live broadcasts
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditBizCanPublish(!editBizCanPublish)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    editBizCanPublish
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {editBizCanPublish ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Authorized</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Disabled</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Custom Debit Fee (Cr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editBizCustomRate}
                    onChange={(e) => setEditBizCustomRate(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Base surcharge per broadcast</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Daily Broadcast Quota
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editBizDailyLimit}
                    onChange={(e) => setEditBizDailyLimit(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Max broadcasts / day</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                Wallet Balance: <strong className="text-emerald-400">{editingBusiness.credit_wallet_balance ?? 0} Credits</strong> • Status: <strong className="text-white">{editingBusiness.verification_status}</strong>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Organization Privileges</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


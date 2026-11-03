import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Headphones,
  MessageSquare,
  Mail,
  Phone,
  ShieldCheck,
  Send,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Zap,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  Calendar,
  Lock,
  ChevronRight,
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  LifeBuoy,
  ExternalLink,
  ChevronDown,
  UserCheck,
  AlertTriangle,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Globe,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  RegularUser,
  BusinessProfile,
  CustomerCareTicket,
  CustomerCareChannel,
  CustomerCareQueue,
  CustomerCareContextPayload,
  CustomerCareResponseItem,
  SupportTicketZone,
  AdminUser,
} from '../types';

interface ConnectWithCustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  isAdmin?: boolean;
  activeAdminUser?: AdminUser | null;
  initialMode?: ModalViewMode;
  onDataUpdated?: () => void;
  onOpenPasswordResetGate?: () => void;
  onNavigateToTab?: (tab: 'marketing' | 'crm_portal' | 'admin_desk') => void;
  onOpenWallet?: () => void;
  onOpenUserProfile?: () => void;
  isInline?: boolean;
}

type ModalViewMode = 'SELF_HELP' | 'CUSTOMER_CARE' | 'REP_DESK';

// Contact masking utility strictly enforcing:
// "making sure any phone number or email apart from emails ending with truvaer.com only"
export const maskPII = (val?: string): string => {
  if (!val) return '—';
  const trimmed = val.trim();

  // If email ending with truvaer.com -> permitted to view as verified staff
  if (trimmed.toLowerCase().endsWith('@truvaer.com') || trimmed.toLowerCase().endsWith('.truvaer.com')) {
    return trimmed;
  }

  // If general email -> mask name and domain partially
  if (trimmed.includes('@')) {
    const [user, domain] = trimmed.split('@');
    const maskedUser = user.length <= 2 ? `${user[0] || '•'}•••` : `${user.slice(0, 2)}••••`;
    return `${maskedUser}@${domain}`;
  }

  // If phone number -> mask middle digits
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length >= 7) {
    const prefix = trimmed.slice(0, 3);
    const suffix = trimmed.slice(-4);
    return `${prefix} ••• ••• ${suffix}`;
  }

  return '••••••••';
};

// Knowledge Base Data for Self-Help Directory
interface SelfHelpArticle {
  id: string;
  category: 'account' | 'charter' | 'wallet' | 'ops' | 'rbac' | 'privacy';
  categoryLabel: string;
  title: string;
  summary: string;
  steps: string[];
  actionLabel?: string;
  actionTab?: 'marketing' | 'crm_portal' | 'admin_desk';
  actionType?: 'wallet' | 'profile' | 'rbac' | 'directory';
}

const SELF_HELP_ARTICLES: SelfHelpArticle[] = [
  {
    id: 'sh_1',
    category: 'account',
    categoryLabel: 'Account & Verification',
    title: 'How to verify your Aviator profile or B2B Charter operator status',
    summary: 'Ensure compliance with DGCA / FAA guidelines, unlock encrypted direct inquiries, and access verified fleet listings.',
    steps: [
      'Navigate to your User Profile via the top right navigation avatar.',
      'Upload valid regulatory credentials (Air Operator Certificate, Pilot License, or Government ID).',
      'Set your 4-digit biometric MPIN for multi-device session verification.',
      'Once verified, your profile displays the verified Aviator or FBO shield across all marketplace queries.',
    ],
    actionLabel: 'Open Profile Settings',
    actionType: 'profile',
  },
  {
    id: 'sh_2',
    category: 'charter',
    categoryLabel: 'Charter & Aircraft Bookings',
    title: 'How to browse aircraft listings, empty legs & request charter quotations',
    summary: 'Access verified light jets, midsize aircraft, and heavy business jets across worldwide airports.',
    steps: [
      'Open the ServiceScout Aviation Directory from the top header navigation.',
      'Filter by Aircraft Category (Turboprop, Super Midsize, Ultra Long Range) or ICAO departure hub.',
      'Review verified hourly wet lease rates, passenger capacity, and baggage payload.',
      'Click "Request Quotation" or "Direct Chat" to engage the aircraft operator directly.',
    ],
    actionLabel: 'Explore Aircraft Directory',
    actionType: 'directory',
    actionTab: 'marketing',
  },
  {
    id: 'sh_3',
    category: 'wallet',
    categoryLabel: 'Corporate Wallet & Billing',
    title: 'Managing Corporate Escrow Wallet, UPI top-ups & automated alerts',
    summary: 'Keep your balance above threshold limits to ensure uninterrupted lead reveals and flight quoting.',
    steps: [
      'Click the Corporate Wallet button on the navbar to inspect current balance.',
      'Select Instant Top-up via Razorpay, UPI, or corporate wire transfer.',
      'Configure Low Balance Threshold Alerts (dispatched to corporate email when balance drops below 50 credits).',
      'Download automated 24-hour and weekly GST-compliant transaction statements.',
    ],
    actionLabel: 'Open Corporate Wallet',
    actionType: 'wallet',
  },
  {
    id: 'sh_4',
    category: 'rbac',
    categoryLabel: 'Role & Module Access Governance',
    title: 'Understanding Regional Delegated L5+ Gates & L7/L8 Director Clearance',
    summary: 'Master Module Assignment Matrix allows granular CRUD control across all 39 enterprise modules.',
    steps: [
      'Module permissions are controlled by the Master Module Assignment Matrix in Admin CPanel.',
      'Regional modules assigned to L5/L6 personnel enter a mandatory "Pending L7/L8 Clearance" state.',
      'Clearance must be granted by an L7 (Director) or L8 (Chairman/MD) before data sharing is unlocked.',
      'Granular CRUD checkboxes (Create, Read, Update, Delete) can be individually toggled per role.',
    ],
    actionLabel: 'Open Governance Matrix',
    actionType: 'rbac',
    actionTab: 'admin_desk',
  },
  {
    id: 'sh_5',
    category: 'ops',
    categoryLabel: 'Flight Ops & CAMO Support',
    title: 'Aviation CAMO, Part-145 maintenance clearance & ground handling',
    summary: 'Coordinating airport slot clearances, GPU hookup, aircraft airworthiness, and fuel uplifts.',
    steps: [
      'Submit CAMO work orders via the Commercial Sales / Operations portal.',
      'Verify EASA Form 1 / FAA 8130-3 airworthiness release certificates for all installed spares.',
      'Request airport ramp access badges and FBO VIP passenger lounge clearances in advance.',
      'For emergency AOG (Aircraft On Ground) support, initiate an urgent Live Support ticket.',
    ],
    actionLabel: 'Commercial Sales & Operations',
    actionTab: 'crm_portal',
  },
  {
    id: 'sh_6',
    category: 'privacy',
    categoryLabel: 'Anti-Circumvention & Privacy',
    title: 'Data Protection Policy: Customer phone/email masking & verified @truvaer.com staff',
    summary: 'Strict anti-circumvention rules protect buyer-seller confidentiality and eliminate platform bypass.',
    steps: [
      'Customer phone numbers and external personal emails are automatically masked and encrypted.',
      'Direct contact reveals require verified escrow credits or formal operator authorization.',
      'Only authorized TruvAer operational personnel with official @truvaer.com addresses can act as care agents.',
      'Any attempt by third-party reps to use external personal emails (e.g. gmail.com) is strictly blocked by our security gate.',
    ],
  },
];

export const ConnectWithCustomerCareModal: React.FC<ConnectWithCustomerCareModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentBusiness,
  isAdmin,
  activeAdminUser,
  initialMode,
  onDataUpdated,
  onOpenPasswordResetGate,
  onNavigateToTab,
  onOpenWallet,
  onOpenUserProfile,
  isInline,
}) => {
  const isBusiness = !!currentBusiness;
  const userType = isBusiness ? 'BUSINESS' : 'STANDARD';

  // Only Admin users can access the Representative Desk (Activity Log)
  const canAccessRepDesk = Boolean(isAdmin || activeAdminUser);

  // Overall View Mode: Default to Self-Help (Rep Desk restricted to admin end)
  const [modalMode, setModalMode] = useState<ModalViewMode>(
    canAccessRepDesk && initialMode ? initialMode : 'SELF_HELP'
  );

  useEffect(() => {
    if (!canAccessRepDesk && modalMode === 'REP_DESK') {
      setModalMode('SELF_HELP');
    }
  }, [canAccessRepDesk, modalMode]);

  // Standard Ticket Protocol Zone: APAC, EMEA, NA, LATAM, ANZ
  const [selectedZone, setSelectedZone] = useState<SupportTicketZone>('APAC');

  // Self-Help Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('sh_1');

  // Customer Support Channel State
  const [activeChannel, setActiveChannel] = useState<CustomerCareChannel>('LIVE_CHAT');

  // Representative Desk (Activity Log / Queue) States (Admin only)
  const [repLoggedIn, setRepLoggedIn] = useState(true);
  const [repName, setRepName] = useState(activeAdminUser?.name || 'Sarah Jenkins');
  const [repEmail, setRepEmail] = useState(activeAdminUser?.email || 'sarah.jenkins@truvaer.com');
  const [repAuthError, setRepAuthError] = useState<string | null>(null);

  // Tickets List & Filter
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [ticketChannelFilter, setTicketChannelFilter] = useState<'ALL' | CustomerCareChannel>('ALL');
  const [ticketZoneFilter, setTicketZoneFilter] = useState<'ALL' | SupportTicketZone>('ALL');
  const [allTickets, setAllTickets] = useState<CustomerCareTicket[]>([]);
  const [selectedTicketForResponse, setSelectedTicketForResponse] = useState<CustomerCareTicket | null>(null);

  // Representative Response Form States
  const [repResponseText, setRepResponseText] = useState('');
  const [repResponseStatus, setRepResponseStatus] = useState<'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');
  const [repSubmitError, setRepSubmitError] = useState<string | null>(null);
  const [repSubmitSuccess, setRepSubmitSuccess] = useState<string | null>(null);

  // Automatic Context Metadata
  const appVersion = 'v2.4.1 (TruvAer Live Build)';
  const recentAction = 'Browsing ServiceScout Aviation Directory & Operations';
  const businessRole = currentBusiness?.verification_status === 'VERIFIED' ? 'VERIFIED_FBO_PARTNER' : 'CORPORATE_AIR_CHARTER_OPERATOR';
  const subscriptionTier = currentBusiness?.corporate_wallet?.tier || 'Enterprise Platinum';

  const contextPayload: CustomerCareContextPayload = isBusiness
    ? {
        userType: 'BUSINESS',
        businessId: currentBusiness?.business_id || 'biz_corp_01',
        role: businessRole,
        subscription_tier: subscriptionTier,
      }
    : {
        userType: 'STANDARD',
        userId: currentUser?.user_id || 'usr_std_01',
        app_version: appVersion,
        recent_action: recentAction,
      };

  const queue: CustomerCareQueue = isBusiness ? 'B2B_PRIORITY_QUEUE' : 'STANDARD_TIER_QUEUE';
  const queueLabel = isBusiness ? 'B2B Priority Support Queue' : 'Standard Tier Support';

  // Live Chat state
  const assignedAgentName = isBusiness
    ? 'Capt. Rajesh Nair (VIP Flight Ops Concierge)'
    : 'Sarah Jenkins (Customer Care Desk L1)';

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string; staffEmail?: string }>>([
    {
      sender: 'agent',
      text: isBusiness
        ? `Welcome to TruvAer VIP Concierge. I am ${assignedAgentName}. How can our flight operations team assist your fleet today?`
        : `Welcome to TruvAer Aviator Support. I am ${assignedAgentName}. How can I assist you with your account, flight services, or directory exploration?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      staffEmail: isBusiness ? 'fleet.ops@truvaer.com' : 'care@truvaer.com',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Email Ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'STANDARD' | 'HIGH' | 'URGENT'>('STANDARD');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketResult, setTicketResult] = useState<CustomerCareTicket | null>(null);

  // Phone Callback state
  const [callbackPhone, setCallbackPhone] = useState(
    currentBusiness?.phone_number || currentUser?.phone_number || '+91 98200 45678'
  );
  const [callbackTimeSlot, setCallbackTimeSlot] = useState('Immediate (Under 15 Minutes)');
  const [callbackNotes, setCallbackNotes] = useState('Consultation regarding aircraft charter quotation.');
  const [callbackSuccess, setCallbackSuccess] = useState<string | null>(null);

  // Refresh Tickets
  const refreshTickets = () => {
    const list = db.getCustomerCareTickets();
    setAllTickets([...list]);
    if (selectedTicketForResponse) {
      const refreshed = list.find((t) => t.ticket_id === selectedTicketForResponse.ticket_id);
      if (refreshed) setSelectedTicketForResponse(refreshed);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshTickets();
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAgentTyping]);

  if (!isOpen) return null;

  // Filtered Self-Help Articles
  const filteredArticles = SELF_HELP_ARTICLES.filter((art) => {
    if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSummary = art.summary.toLowerCase().includes(q);
      const matchSteps = art.steps.some((s) => s.toLowerCase().includes(q));
      return matchTitle || matchSummary || matchSteps;
    }
    return true;
  });

  // Filtered Tickets for Representative Activity Log
  const filteredTickets = allTickets.filter((ticket) => {
    if (ticketStatusFilter !== 'ALL' && ticket.status !== ticketStatusFilter) return false;
    if (ticketChannelFilter !== 'ALL' && ticket.channel !== ticketChannelFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      const matchId = ticket.ticket_id.toLowerCase().includes(q);
      const matchSubj = ticket.subject.toLowerCase().includes(q);
      const matchMsg = ticket.message.toLowerCase().includes(q);
      const matchCust = (ticket.customer_name || '').toLowerCase().includes(q);
      return matchId || matchSubj || matchMsg || matchCust;
    }
    return true;
  });

  // Self-Help In-App Navigation Handler
  const handleArticleAction = (article: SelfHelpArticle) => {
    onClose();
    if (article.actionType === 'wallet' && onOpenWallet) {
      onOpenWallet();
    } else if (article.actionType === 'profile' && onOpenUserProfile) {
      onOpenUserProfile();
    } else if (article.actionTab && onNavigateToTab) {
      onNavigateToTab(article.actionTab);
    }
  };

  // Customer Chat Send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: nowTime }]);
    setInputMessage('');
    setIsAgentTyping(true);

    const res = db.submitCustomerCareRequest({
      channel: 'LIVE_CHAT',
      zone: selectedZone,
      subject: `Live Chat: ${userText.substring(0, 35)}...`,
      message: userText,
      context: contextPayload,
      customer_name: isBusiness
        ? currentBusiness?.organization_name
        : [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.username,
      customer_email: isBusiness ? currentBusiness?.business_email : currentUser?.email,
      customer_phone: isBusiness ? currentBusiness?.phone_number : currentUser?.phone_number,
    });

    refreshTickets();
    if (onDataUpdated) onDataUpdated();

    setTimeout(() => {
      setIsAgentTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text:
            res.agentReply ||
            `Thank you for contacting TruvAer Aviator Support. Standard ticket #${res.ticket.ticket_id} has been logged in our queue. Our verified flight operations staff will respond shortly.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          staffEmail: isBusiness ? 'fleet.ops@truvaer.com' : 'care@truvaer.com',
        },
      ]);
      refreshTickets();
    }, 1100);
  };

  // Submit Email Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmittingTicket(true);
    setTimeout(() => {
      const res = db.submitCustomerCareRequest({
        channel: 'EMAIL_SUPPORT',
        zone: selectedZone,
        subject: ticketSubject.trim(),
        message: ticketMessage.trim(),
        context: contextPayload,
        customer_name: isBusiness
          ? currentBusiness?.organization_name
          : [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.username,
        customer_email: isBusiness ? currentBusiness?.business_email : currentUser?.email,
        customer_phone: isBusiness ? currentBusiness?.phone_number : currentUser?.phone_number,
      });

      setIsSubmittingTicket(false);
      setTicketResult(res.ticket);
      refreshTickets();
      if (onDataUpdated) onDataUpdated();
    }, 500);
  };

  // Submit Callback
  const handleSubmitCallback = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTicket(true);
    setTimeout(() => {
      const res = db.submitCustomerCareRequest({
        channel: 'PHONE_CALLBACK',
        zone: selectedZone,
        subject: `Priority Phone Callback Request: ${callbackPhone}`,
        message: callbackNotes,
        context: contextPayload,
        callback_phone: callbackPhone,
        callback_time_slot: callbackTimeSlot,
        customer_name: isBusiness
          ? currentBusiness?.organization_name
          : [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.username,
        customer_email: isBusiness ? currentBusiness?.business_email : currentUser?.email,
        customer_phone: callbackPhone,
      });

      setIsSubmittingTicket(false);
      setCallbackSuccess(
        `Priority callback booked! Our Flight Ops desk will call ${maskPII(
          callbackPhone
        )} during slot: ${callbackTimeSlot}. Standard Ticket #${res.ticket.ticket_id}.`
      );
      refreshTickets();
      if (onDataUpdated) onDataUpdated();
    }, 500);
  };

  // Representative Login Validation (Strict @truvaer.com)
  const handleRepLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRepAuthError(null);
    const trimmed = repEmail.trim().toLowerCase();

    // STRICT DOMAIN ENFORCEMENT
    if (!trimmed.endsWith('@truvaer.com') && !trimmed.endsWith('.truvaer.com')) {
      setRepAuthError(
        'Access Denied: Only verified TruvAer personnel with official @truvaer.com email addresses are authorized to log in and respond to customer care inquiries. Domains like gmail.com or yahoo.com are strictly prohibited.'
      );
      return;
    }

    if (!repName.trim()) {
      setRepAuthError('Please enter representative agent name.');
      return;
    }

    setRepLoggedIn(true);
    setRepAuthError(null);
  };

  // Representative Fast Switch Presets
  const handleSelectRepPreset = (name: string, email: string) => {
    setRepName(name);
    setRepEmail(email);
    setRepAuthError(null);
    setRepLoggedIn(true);
  };

  // Representative Response Submission
  const handleRepSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    setRepSubmitError(null);
    setRepSubmitSuccess(null);

    if (!selectedTicketForResponse) return;
    if (!repResponseText.trim()) {
      setRepSubmitError('Please enter a response message.');
      return;
    }

    // STRICT DOMAIN ENFORCEMENT
    const trimmed = repEmail.trim().toLowerCase();
    if (!trimmed.endsWith('@truvaer.com') && !trimmed.endsWith('.truvaer.com')) {
      setRepSubmitError('Security Policy Violation: Agent email must end with @truvaer.com.');
      return;
    }

    const res = db.respondToCustomerCareTicket({
      ticketId: selectedTicketForResponse.ticket_id,
      message: repResponseText.trim(),
      agentEmail: trimmed,
      agentName: repName.trim(),
      newStatus: repResponseStatus,
    });

    if (res.success && res.ticket) {
      setRepSubmitSuccess(`Response sent successfully from verified address ${trimmed}!`);
      setRepResponseText('');
      setSelectedTicketForResponse(res.ticket);
      refreshTickets();
      if (onDataUpdated) onDataUpdated();
    } else {
      setRepSubmitError(res.message || 'Failed to submit response.');
    }
  };

  const openTicketsCount = allTickets.filter((t) => t.status === 'OPEN').length;

  const cardContent = (
    <div className={`relative w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col ${isInline ? 'min-h-[640px]' : 'max-w-4xl my-auto max-h-[94vh]'} animate-in fade-in duration-200`}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH PRIMARY TABS (Self-Help, Reach Care, Rep Desk)         */}
      {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Customer Care &amp; Aviator Support Hub
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {isBusiness ? 'BUSINESS USER' : 'STANDARD USER'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Self-Help Knowledge Base &bull; Live Customer Support &bull; Authorized Staff Activity Desk
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer"
              title="Close Support Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MODE SELECTOR BAR (Self-Help | Customer Care | Representative Desk)     */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between overflow-x-auto shrink-0">
          <div className="flex items-center space-x-2 text-xs font-semibold py-2.5">
            {/* Mode 1: Self-Help */}
            <button
              type="button"
              onClick={() => setModalMode('SELF_HELP')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                modalMode === 'SELF_HELP'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Self-Help &amp; Knowledge Base</span>
            </button>

            {/* Mode 2: Reach Care (Customer Live View) */}
            <button
              type="button"
              onClick={() => setModalMode('CUSTOMER_CARE')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                modalMode === 'CUSTOMER_CARE'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reach Customer Care</span>
            </button>

            {/* Mode 3: Customer Care Representative Desk (Activity Log Interface) - ADMIN END ONLY */}
            {canAccessRepDesk && (
              <button
                type="button"
                onClick={() => setModalMode('REP_DESK')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  modalMode === 'REP_DESK'
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                <span>Representative Desk (Activity Log)</span>
                {openTicketsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                    {openTicketsCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {canAccessRepDesk && (
            <div className="hidden md:flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Admin Staff Portal: @truvaer.com only</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. MODE CONTENT VIEWPORT                                                  */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs">
          {/* ===================================================================== */}
          {/* VIEW A: SELF-HELP KNOWLEDGE BASE & SOLUTIONS DIRECTORY                */}
          {/* ===================================================================== */}
          {modalMode === 'SELF_HELP' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Search Bar & Category Filter */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Self-Help: e.g. charter quote, wallet top-up, L7/L8 clearance, KYC verification..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-[11px]">
                  {[
                    { id: 'all', label: 'All Topics' },
                    { id: 'account', label: 'Account & Verification' },
                    { id: 'charter', label: 'Charter & Aircraft' },
                    { id: 'wallet', label: 'Corporate Wallet' },
                    { id: 'rbac', label: 'RBAC & L7/L8 Clearance' },
                    { id: 'ops', label: 'Flight Ops & CAMO' },
                    { id: 'privacy', label: 'Data Protection & PII' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Self-Help Guides List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-slate-400 font-semibold px-1">
                  <span>Available Self-Help Guides ({filteredArticles.length})</span>
                  <span className="text-[11px] text-slate-500">Click any card to expand step-by-step walkthrough</span>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
                    <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="font-semibold text-white">No matching self-help guides found</p>
                    <p className="text-[11px]">
                      Try adjusting your search terms or connect directly with our Customer Care desk.
                    </p>
                    <button
                      type="button"
                      onClick={() => setModalMode('CUSTOMER_CARE')}
                      className="mt-2 px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition-all cursor-pointer"
                    >
                      Connect with Customer Care
                    </button>
                  </div>
                ) : (
                  filteredArticles.map((article) => {
                    const isExpanded = expandedArticleId === article.id;
                    return (
                      <div
                        key={article.id}
                        className={`rounded-2xl border transition-all ${
                          isExpanded
                            ? 'bg-slate-950/90 border-sky-500/40 shadow-lg shadow-sky-500/5'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                          className="w-full p-4 flex items-start justify-between text-left gap-3 cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-semibold">
                                {article.categoryLabel}
                              </span>
                              <h4 className="font-bold text-white text-sm hover:text-sky-300 transition-colors">
                                {article.title}
                              </h4>
                            </div>
                            <p className="text-slate-400 text-xs">{article.summary}</p>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${
                              isExpanded ? 'rotate-180 text-sky-400' : ''
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-4">
                            <div className="space-y-2 pt-2">
                              <span className="text-[10px] uppercase font-mono font-bold text-sky-400">
                                Step-by-Step Instructions:
                              </span>
                              <ol className="space-y-2 pl-4 list-decimal text-slate-300">
                                {article.steps.map((st, i) => (
                                  <li key={i} className="pl-1 leading-relaxed">
                                    {st}
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Direct In-App Navigation Shortcut Button */}
                            {article.actionLabel && (
                              <div className="pt-2 flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                                <span className="text-[11px] text-slate-400">
                                  Quick Shortcut: Jump directly to the relevant workspace
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleArticleAction(article)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500 hover:text-slate-950 font-bold transition-all cursor-pointer"
                                >
                                  <span>{article.actionLabel}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Still Need Live Assistance Callout */}
              <div className="p-4 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white text-xs sm:text-sm">Still have questions or need human assistance?</h4>
                  <p className="text-[11px] text-slate-400">
                    Connect directly with our 24/7 aviation dispatch specialists or book a priority phone callback.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalMode('CUSTOMER_CARE')}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center space-x-1.5 cursor-pointer shrink-0 transition-all shadow-md shadow-sky-500/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reach Customer Care Now</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW B: CUSTOMER LIVE SUPPORT (CHAT / EMAIL / PHONE CALLBACK)         */}
          {/* ===================================================================== */}
          {modalMode === 'CUSTOMER_CARE' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Channel Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveChannel('LIVE_CHAT')}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 font-semibold transition-all cursor-pointer ${
                    activeChannel === 'LIVE_CHAT'
                      ? 'bg-sky-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Live Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('EMAIL_SUPPORT')}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 font-semibold transition-all cursor-pointer ${
                    activeChannel === 'EMAIL_SUPPORT'
                      ? 'bg-sky-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChannel('PHONE_CALLBACK')}
                  className={`py-2 px-3 rounded-xl flex items-center justify-center space-x-2 font-semibold transition-all cursor-pointer ${
                    activeChannel === 'PHONE_CALLBACK'
                      ? 'bg-sky-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Phone Callback</span>
                </button>
              </div>

              {/* Data Protection & Anti-Circumvention Banner */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-[11px] text-amber-200">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Privacy Shield: All customer phone numbers and external emails are protected. Rep communications are restricted to <strong>@truvaer.com</strong> staff only.
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold">{queueLabel}</span>
              </div>

              {/* 1. LIVE CHAT STREAM */}
              {activeChannel === 'LIVE_CHAT' && (
                <div className="space-y-3">
                  <div className="h-64 sm:h-72 overflow-y-auto space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-sky-600 text-white rounded-br-none shadow-md'
                              : 'bg-slate-850 text-slate-200 border border-slate-750 rounded-bl-none shadow'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1 text-[10px] font-mono">
                            <span className="font-bold">
                              {msg.sender === 'user' ? 'You' : assignedAgentName}
                            </span>
                            {msg.staffEmail && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {msg.staffEmail}
                              </span>
                            )}
                            <span className="text-slate-400">{msg.time}</span>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {isAgentTyping && (
                      <div className="flex items-center space-x-2 text-slate-400 text-xs italic pl-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                        <span>{assignedAgentName} is reviewing flight ops inquiry...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input Box */}
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message to Aviator Customer Care..."
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              )}

              {/* 2. EMAIL SUPPORT TICKET */}
              {activeChannel === 'EMAIL_SUPPORT' && (
                <div className="space-y-4">
                  {ticketResult ? (
                    <div className="p-6 bg-slate-950/80 border border-emerald-500/40 rounded-2xl space-y-3 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <h4 className="font-bold text-white text-base">Support Ticket Created #{ticketResult.ticket_id}</h4>
                      <p className="text-slate-300 text-xs">
                        Subject: <strong>{ticketResult.subject}</strong>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Dispatched to {queueLabel}. An authorized representative (@truvaer.com) will review this inquiry.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTicketResult(null);
                          setTicketSubject('');
                          setTicketMessage('');
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl font-semibold cursor-pointer"
                      >
                        Submit Another Ticket
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Inquiry Subject / Topic
                        </label>
                        <input
                          type="text"
                          required
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="e.g. Escrow payout clarification, CAMO airworthiness query, or Regional module gate"
                          className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Priority Tier</label>
                          <select
                            value={ticketPriority}
                            onChange={(e) => setTicketPriority(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none"
                          >
                            <option value="STANDARD">Standard (Under 2 Hours)</option>
                            <option value="HIGH">High Priority (Under 45 Minutes)</option>
                            <option value="URGENT">Urgent AOG / Flight Delay (Immediate)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Registered Contact</label>
                          <input
                            type="text"
                            readOnly
                            value={maskPII(currentUser?.email || currentBusiness?.business_email || 'client@example.com')}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono text-xs cursor-not-allowed"
                            title="Protected contact according to anti-circumvention policy"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Detailed Description of Inquiry
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          placeholder="Provide all flight numbers, aircraft registration codes, or transaction IDs..."
                          className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingTicket || !ticketSubject.trim() || !ticketMessage.trim()}
                        className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingTicket ? 'Dispatched to Desk...' : 'Submit Support Ticket'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* 3. PHONE CALLBACK */}
              {activeChannel === 'PHONE_CALLBACK' && (
                <div className="space-y-4">
                  {callbackSuccess ? (
                    <div className="p-6 bg-slate-950/80 border border-emerald-500/40 rounded-2xl space-y-3 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                      <h4 className="font-bold text-white text-base">Priority Callback Scheduled</h4>
                      <p className="text-slate-300 text-xs">{callbackSuccess}</p>
                      <button
                        type="button"
                        onClick={() => setCallbackSuccess(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl font-semibold cursor-pointer"
                      >
                        Schedule Another Request
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitCallback} className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Contact Phone Number
                          </label>
                          <input
                            type="text"
                            required
                            value={callbackPhone}
                            onChange={(e) => setCallbackPhone(e.target.value)}
                            placeholder="+91 98200 45678"
                            className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Preferred Callback Slot
                          </label>
                          <select
                            value={callbackTimeSlot}
                            onChange={(e) => setCallbackTimeSlot(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none"
                          >
                            <option value="Immediate (Under 15 Minutes)">Immediate (Under 15 Minutes)</option>
                            <option value="Within 1 Hour">Within 1 Hour</option>
                            <option value="Today Afternoon (14:00 - 17:00 UTC)">Today Afternoon (14:00 - 17:00 UTC)</option>
                            <option value="Tomorrow Morning (09:00 - 12:00 UTC)">Tomorrow Morning (09:00 - 12:00 UTC)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Consultation Subject
                        </label>
                        <textarea
                          rows={3}
                          value={callbackNotes}
                          onChange={(e) => setCallbackNotes(e.target.value)}
                          placeholder="Brief operational context for the calling flight ops manager..."
                          className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingTicket || !callbackPhone.trim()}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-2"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{isSubmittingTicket ? 'Scheduling...' : 'Confirm Priority Phone Callback'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW C: CUSTOMER CARE REPRESENTATIVE DESK (ACTIVITY LOG INTERFACE)    */}
          {/* ===================================================================== */}
          {modalMode === 'REP_DESK' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Representative Authentication Bar / Login Gate */}
              {!repLoggedIn ? (
                <div className="p-5 bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-900 border border-purple-500/30 rounded-2xl space-y-4">
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Customer Care Representative Authentication</h4>
                      <p className="text-[11px] text-slate-400">
                        Authorized personnel must log in with an official <strong>@truvaer.com</strong> account to review inquiries and send live responses.
                      </p>
                    </div>
                  </div>

                  {repAuthError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{repAuthError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRepLogin} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Representative Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={repName}
                          onChange={(e) => setRepName(e.target.value)}
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Official Corporate Email <span className="text-purple-400">(*@truvaer.com only)</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={repEmail}
                          onChange={(e) => setRepEmail(e.target.value)}
                          placeholder="agent@truvaer.com"
                          className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <span>Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => handleSelectRepPreset('Sarah Jenkins', 'sarah.jenkins@truvaer.com')}
                          className="px-2 py-1 rounded bg-slate-800 text-purple-300 hover:text-white cursor-pointer"
                        >
                          Sarah Jenkins (L1)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectRepPreset('Capt. Rajesh Nair', 'rajesh.nair@truvaer.com')}
                          className="px-2 py-1 rounded bg-slate-800 text-purple-300 hover:text-white cursor-pointer"
                        >
                          Capt. Rajesh (VIP Concierge)
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center space-x-1.5 cursor-pointer transition-all shadow-md shadow-purple-600/30"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Log In as Representative</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 border border-purple-500/40 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs">{repName}</span>
                        <span className="px-2 py-0.2 rounded-full font-mono text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {repEmail}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Authenticated Customer Care Representative &bull; Authorized to respond to inquiries
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRepLoggedIn(false)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Switch Agent</span>
                  </button>
                </div>
              )}

              {/* Activity Log Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Search Activity Log: Ticket #, customer name, subject..."
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  {/* Status Filter */}
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-750 text-white rounded-xl px-2.5 py-1.5 outline-none font-medium"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="OPEN">Open Only</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>

                  {/* Channel Filter */}
                  <select
                    value={ticketChannelFilter}
                    onChange={(e) => setTicketChannelFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-750 text-white rounded-xl px-2.5 py-1.5 outline-none font-medium"
                  >
                    <option value="ALL">All Channels</option>
                    <option value="LIVE_CHAT">Live Chat</option>
                    <option value="EMAIL_SUPPORT">Email Ticket</option>
                    <option value="PHONE_CALLBACK">Phone Callback</option>
                  </select>

                  <button
                    type="button"
                    onClick={refreshTickets}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer"
                    title="Refresh Inquiries"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Activity Log Table (List-Wise Interface) */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                        <th className="py-2.5 px-3">Ticket / Chat ID</th>
                        <th className="py-2.5 px-3">Customer / Organization</th>
                        <th className="py-2.5 px-3">Contact (Masked PII)</th>
                        <th className="py-2.5 px-3">Subject &amp; Latest Message</th>
                        <th className="py-2.5 px-3">Channel / Priority</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-xs">
                      {filteredTickets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            No customer care inquiries match the selected criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTickets.map((t) => {
                          const isSelected = selectedTicketForResponse?.ticket_id === t.ticket_id;
                          return (
                            <tr
                              key={t.ticket_id}
                              className={`transition-colors hover:bg-slate-900/50 ${
                                isSelected ? 'bg-purple-950/30' : ''
                              }`}
                            >
                              {/* Ticket ID */}
                              <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                                {t.ticket_id}
                              </td>

                              {/* Customer */}
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-white">
                                  {t.customer_name || 'Anonymous Aviator'}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {t.context.userType === 'BUSINESS' ? 'B2B Partner' : 'Standard User'}
                                </span>
                              </td>

                              {/* Contact Details strictly masked: only @truvaer.com permitted unmasked */}
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                                <div title="Protected customer contact details">
                                  {maskPII(t.customer_email || t.customer_phone || t.callback_phone)}
                                </div>
                              </td>

                              {/* Subject */}
                              <td className="py-2.5 px-3 max-w-xs truncate">
                                <div className="font-medium text-slate-200 truncate">{t.subject}</div>
                                <p className="text-[11px] text-slate-400 truncate">{t.message}</p>
                              </td>

                              {/* Channel / Priority */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                    {t.channel}
                                  </span>
                                  <span
                                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                      t.priority === 'URGENT'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                        : t.priority === 'HIGH'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                        : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                    {t.priority}
                                  </span>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                                    t.status === 'OPEN'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : t.status === 'IN_PROGRESS'
                                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </td>

                              {/* Action */}
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setSelectedTicketForResponse(t)}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white'
                                  }`}
                                >
                                  View &amp; Respond
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ================================================================= */}
              {/* CONVERSATION THREAD & REPRESENTATIVE RESPONSE FORM                */}
              {/* ================================================================= */}
              {selectedTicketForResponse && (
                <div className="p-4 sm:p-5 bg-slate-950/90 border border-purple-500/40 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">
                          Responding to #{selectedTicketForResponse.ticket_id}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {selectedTicketForResponse.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Customer: <strong>{selectedTicketForResponse.customer_name || 'Anonymous'}</strong> &bull; Protected Contact: {maskPII(selectedTicketForResponse.customer_email || selectedTicketForResponse.customer_phone)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTicketForResponse(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Customer Inbound Message */}
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                      Customer Inbound Message:
                    </span>
                    <p className="text-slate-200 leading-relaxed text-xs">
                      {selectedTicketForResponse.message}
                    </p>
                  </div>

                  {/* Previous Responses Stream */}
                  {selectedTicketForResponse.responses && selectedTicketForResponse.responses.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                        Previous Conversation &amp; Staff Replies:
                      </span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedTicketForResponse.responses.map((r) => (
                          <div key={r.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-purple-300">{r.senderName}</span>
                                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                                  {r.senderEmail}
                                </span>
                              </div>
                              <span className="text-slate-500">{new Date(r.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-slate-300 text-xs">{r.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Response Editor Form */}
                  <form onSubmit={handleRepSubmitResponse} className="space-y-3 pt-2">
                    {repSubmitError && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{repSubmitError}</span>
                      </div>
                    )}

                    {repSubmitSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{repSubmitSuccess}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Type Official Response to Customer:
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={repResponseText}
                        onChange={(e) => setRepResponseText(e.target.value)}
                        placeholder={`Compose response from verified address ${repEmail}...`}
                        className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-400">Update Status:</span>
                        <select
                          value={repResponseStatus}
                          onChange={(e) => setRepResponseStatus(e.target.value as any)}
                          className="bg-slate-900 border border-slate-750 text-white rounded-xl px-2.5 py-1 text-xs outline-none font-medium"
                        >
                          <option value="IN_PROGRESS">Keep In Progress</option>
                          <option value="RESOLVED">Mark as Resolved</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={!repResponseText.trim() || !repLoggedIn}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all shadow-md shadow-purple-600/30"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Response as {repName} ({repEmail})</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. FOOTER STATUS BAR                                                      */}
        {/* ========================================================================= */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 shrink-0 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Operational Integrity: Anti-Circumvention Active &bull; Verified Staff @truvaer.com</span>
          </div>

          <div className="flex items-center space-x-3 text-[10px] font-mono">
            <span>TruvAer SLA: Under 15m (B2B) / Under 2h (Std)</span>
            <span>Build: {appVersion}</span>
          </div>
        </div>
      </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      {cardContent}
    </div>
  );
};

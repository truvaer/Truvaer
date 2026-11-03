import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  MessageSquare,
  Bell,
  Send,
  ShieldCheck,
  CheckCheck,
  Check,
  Inbox,
  Filter,
  Search,
  Plus,
  ArrowRight,
  User,
  Building2,
  AlertCircle,
  FileText,
  CreditCard,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { RegularUser, BusinessProfile, InternalMail, LiveChatMessage, UserNotification, ServiceListing } from '../types';
import { db } from '../data/mockDatabase';

const MaskedPIIText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const parts = text.split(/(\[BLURRED_[^\]]+\]|\[🔒[^\]]+\]|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b|(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?[\d]{3,4}[-.\s]?[\d]{3,4})/g);

  return (
    <span>
      {parts.map((part, idx) => {
        if (!part) return null;
        const isRedactedToken = part.includes('BLURRED_') || part.includes('🔒') || part.includes('PROTECTED');
        const isEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(part) && !part.endsWith('@truvaer.com');
        const digitsOnly = part.replace(/\D/g, '');
        const isPhone = digitsOnly.length >= 7 && digitsOnly.length <= 15;

        if (isRedactedToken || isEmail || isPhone) {
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 text-[11px] font-mono select-none"
              title="Protected Contact: Anti-Circumvention Rule (Details Hidden/Blurred)"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400 inline shrink-0" />
              <span className="filter blur-[3px] hover:blur-none transition-all duration-300 cursor-pointer">
                {isEmail ? '•••••@•••••.com' : isPhone ? '+•• ••••• •••••' : '••••••••••••'}
              </span>
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
};

interface CommunicationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  onDataUpdated?: () => void;
  isInline?: boolean;
}

export const CommunicationHubModal: React.FC<CommunicationHubModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentBusiness,
  onDataUpdated,
  isInline,
}) => {
  const [activeTab, setActiveTab] = useState<'emails' | 'chats' | 'notifications'>('chats');

  // Active identity
  const userEmail = currentUser?.email || currentBusiness?.business_email || '';
  const userId = currentUser?.user_id || currentBusiness?.business_id || '';
  const userName = currentUser
    ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || `@${currentUser.username}`
    : currentBusiness?.organization_name || 'Aviator User';
  const isBusiness = !!currentBusiness;

  // State: Emails
  const [emails, setEmails] = useState<InternalMail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<InternalMail | null>(null);
  const [emailTab, setEmailTab] = useState<'inbox' | 'compose'>('inbox');
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeCategory, setComposeCategory] = useState<'Primary' | 'Sales' | 'Communication' | 'Updates' | 'Complaints'>('Communication');
  const [composeBody, setComposeBody] = useState('');
  const [composeStatus, setComposeStatus] = useState<string | null>(null);

  // State: Chats
  const [chats, setChats] = useState<LiveChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatListingId, setNewChatListingId] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [newChatSending, setNewChatSending] = useState(false);
  const [isConfidentialMode, setIsConfidentialMode] = useState<boolean>(false);

  useEffect(() => {
    if (selectedConversationId) {
      setIsConfidentialMode(db.getChatSharingMode(selectedConversationId));
    }
  }, [selectedConversationId]);

  // State: Notifications
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'CHAT' | 'EMAIL' | 'WALLET' | 'SYSTEM'>('ALL');

  const reloadData = () => {
    if (!userId && !userEmail) return;
    const allMails = db.getInternalMails(userEmail);
    setEmails(allMails);

    const userChats = db.getLiveChats(userId).concat(db.getLiveChats(userEmail));
    // Remove duplicates
    const uniqueChatsMap = new Map<string, LiveChatMessage>();
    userChats.forEach((c) => uniqueChatsMap.set(c.id, c));
    const uniqueChats = Array.from(uniqueChatsMap.values());
    setChats(uniqueChats);

    if (uniqueChats.length > 0 && !selectedConversationId) {
      setSelectedConversationId(uniqueChats[0].conversation_id || null);
    }

    const notifs = db.getNotifications(userId).concat(db.getNotifications(userEmail));
    const uniqueNotifsMap = new Map<string, UserNotification>();
    notifs.forEach((n) => uniqueNotifsMap.set(n.id, n));
    setNotifications(Array.from(uniqueNotifsMap.values()));
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen, userId, userEmail]);

  if (!isOpen) return null;

  // Group chats by conversation
  const conversationsMap = new Map<string, LiveChatMessage[]>();
  chats.forEach((c) => {
    const convId = c.conversation_id || 'general';
    if (!conversationsMap.has(convId)) {
      conversationsMap.set(convId, []);
    }
    conversationsMap.get(convId)!.push(c);
  });

  const activeConversationMessages = selectedConversationId
    ? conversationsMap.get(selectedConversationId) || []
    : [];

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeBody.trim()) {
      alert('Recipient and message body are required.');
      return;
    }

    const res = db.sendInternalMail(
      userEmail,
      composeTo.trim(),
      composeSubject.trim() || 'Direct Truvaer Domain Communication',
      composeBody.trim(),
      composeCategory
    );

    setComposeStatus(res.message);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    reloadData();
    if (onDataUpdated) onDataUpdated();

    setTimeout(() => {
      setComposeStatus(null);
      setEmailTab('inbox');
    }, 1800);
  };

  const handleSendChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyText.trim()) return;

    setChatSending(true);

    // Determine target recipient ID
    let targetRecipientId = 'general';
    let targetConvId = selectedConversationId || 'conv_direct';

    if (activeConversationMessages.length > 0) {
      const lastMsg = activeConversationMessages[activeConversationMessages.length - 1];
      targetRecipientId = lastMsg.sender_id === userId ? lastMsg.recipient_id : lastMsg.sender_id;
    }

    const res = db.sendLiveChatMessage(
      userId,
      userName,
      targetRecipientId,
      chatReplyText.trim(),
      targetConvId
    );

    setChatSending(false);
    setChatReplyText('');
    reloadData();
    if (onDataUpdated) onDataUpdated();
  };

  const handleStartNewDirectChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatListingId) {
      alert('Please select an aviation service listing.');
      return;
    }
    if (!newChatMessage.trim()) {
      alert('Please enter your direct message.');
      return;
    }
    setNewChatSending(true);
    const listing = db.getServiceListings().find((s) => s.id === newChatListingId);
    if (!listing) {
      setNewChatSending(false);
      return;
    }

    const res = db.startDirectChatWithDebit(
      listing.id,
      userId,
      userName,
      userEmail,
      newChatMessage.trim()
    );

    setNewChatSending(false);
    if (res.success) {
      reloadData();
      setSelectedConversationId(`conv_${listing.id}`);
      setShowNewChatModal(false);
      setNewChatMessage('');
      setNewChatListingId('');
      if (onDataUpdated) onDataUpdated();
    } else {
      alert(res.message);
    }
  };

  const handleMarkAllNotifsRead = () => {
    db.markAllNotificationsRead(userId);
    reloadData();
    if (onDataUpdated) onDataUpdated();
  };

  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;
  const unreadChatsCount = chats.filter((c) => !c.is_read && c.recipient_id === userId).length;

  const cardContent = (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl w-full shadow-2xl overflow-hidden flex flex-col ${isInline ? 'min-h-[640px]' : 'max-w-4xl h-[90vh]'}`}>
      {/* Modal Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">Communications &amp; Alerts Desk</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                  {isBusiness ? 'Corporate Fleet Hub' : 'Aviator Client Hub'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected as <strong className="text-slate-200">{userName}</strong> ({userEmail || 'Active Session'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Requirement 3: Emails, Chats, Notifications) */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 pt-3 shrink-0">
          <button
            onClick={() => setActiveTab('chats')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 cursor-pointer transition-colors ${
              activeTab === 'chats'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
            {unreadChatsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-mono">
                {unreadChatsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 cursor-pointer transition-colors ${
              activeTab === 'emails'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Internal Emails</span>
            <span className="text-slate-500 font-mono text-[11px]">({emails.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 cursor-pointer transition-colors ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] font-mono">
                {unreadNotifsCount} new
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* ========================================================================= */}
          {/* 1. CHATS TAB                                                              */}
          {/* ========================================================================= */}
          {activeTab === 'chats' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left sidebar: Conversations list */}
              <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Direct Dialogues
                  </span>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                    title="Initiate direct chat with an aviation service provider"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Start Chat</span>
                  </button>
                </div>

                {/* Requirement 1: If the business user receives any direct message then the chat option should automatically enabled */}
                {isBusiness && chats.length > 0 && (
                  <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-start space-x-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1 shrink-0" />
                    <div className="leading-snug">
                      <span className="font-bold text-emerald-200">Live Chat Active:</span> Client direct inquiries received. Real-time chat automatically enabled for your fleet.
                    </div>
                  </div>
                )}

                {Array.from(conversationsMap.keys()).length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-slate-400">No active chat threads yet.</p>
                    <p className="text-[11px] mt-1 text-slate-500">
                      Click <strong className="text-blue-400">&quot;Start Chat&quot;</strong> above or &quot;Chat&quot; on any service listing to begin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {Array.from(conversationsMap.entries()).map(([convId, msgs]) => {
                      const isSelected = selectedConversationId === convId;
                      const latest = msgs[msgs.length - 1];
                      return (
                        <button
                          key={convId}
                          onClick={() => setSelectedConversationId(convId)}
                          className={`w-full p-2.5 rounded-xl text-left transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500/50 text-white'
                              : 'bg-slate-900 border-slate-800/80 hover:bg-slate-850 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold truncate max-w-[140px]">
                              {latest.sender_name || 'Aviation Member'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {latest.message}
                          </div>
                          <div className="flex items-center space-x-1.5 mt-1 flex-wrap">
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              <span>⚡ Priority SLA</span>
                            </span>
                            {latest.pii_redacted && (
                              <div className="flex items-center space-x-1 text-[9px] text-emerald-400">
                                <ShieldCheck className="w-3 h-3" />
                                <span>PII Protected</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right area: Active conversation messages */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {activeConversationMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mb-2 text-slate-700" />
                    <p className="text-xs">Select or initiate a direct chat to view encrypted messages.</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center space-x-1.5 font-bold text-white">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Direct Aviation Session</span>
                          <span className="font-mono text-slate-500 text-[10px]">({selectedConversationId})</span>
                        </div>

                        {/* Priority SLA Active Indicator Highlighted on Live Chat Sessions */}
                        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[10px] font-bold shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>⚡ Priority SLA Active (Guaranteed 5-Min Response)</span>
                        </div>
                      </div>

                      {/* Direct "Stop Sharing Details" Toggle in the Chat Header */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isConfidentialMode;
                            setIsConfidentialMode(next);
                            if (selectedConversationId) {
                              db.setChatSharingMode(selectedConversationId, next);
                            }
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border shadow-sm ${
                            isConfidentialMode
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
                          }`}
                          title="Toggle confidential anonymized mode to prevent personal contact and phone number sharing"
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 ${isConfidentialMode ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span>{isConfidentialMode ? 'Confidential Mode: Contact Hidden' : 'Stop Sharing Details'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Active Confidential Mode Banner Alert */}
                    {isConfidentialMode && (
                      <div className="p-2.5 px-4 bg-amber-950/60 border-b border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            <strong>Confidential Anonymized Mode:</strong> Personal contact &amp; phone numbers are withheld from this provider.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsConfidentialMode(false);
                            if (selectedConversationId) {
                              db.setChatSharingMode(selectedConversationId, false);
                            }
                          }}
                          className="text-[11px] underline hover:text-white cursor-pointer ml-2 shrink-0 font-semibold"
                        >
                          Resume Sharing Details
                        </button>
                      </div>
                    )}

                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {activeConversationMessages.map((msg) => {
                        const isSelf = msg.sender_id === userId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                              {msg.sender_name} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div
                              className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                                isSelf
                                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                                  : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700'
                              }`}
                            >
                              <div className="leading-relaxed whitespace-pre-wrap">
                                <MaskedPIIText text={msg.message} />
                              </div>
                              {msg.pii_redacted && (
                                <div className="text-[10px] opacity-75 flex items-center space-x-1 pt-1 border-t border-white/20">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Automated lead protection applied</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSendChatReply} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center space-x-2">
                      <input
                        type="text"
                        value={chatReplyText}
                        onChange={(e) => setChatReplyText(e.target.value)}
                        placeholder="Type direct message securely within platform..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={chatSending || !chatReplyText.trim()}
                        className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 cursor-pointer"
                        title="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Start New Direct Chat Modal Overlay */}
              {showNewChatModal && (
                <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        <h4 className="text-sm font-bold text-white">Start New Chat</h4>
                      </div>
                      <button
                        onClick={() => setShowNewChatModal(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleStartNewDirectChat} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Select Aviation Provider / Service Listing
                        </label>
                        <select
                          value={newChatListingId}
                          onChange={(e) => setNewChatListingId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="">-- Choose Verified Aviation Provider --</option>
                          {db
                            .getServiceListings()
                            .filter((s) => s.publication_status === 'PUBLISHED')
                            .map((listing) => (
                              <option key={listing.id} value={listing.id}>
                                {listing.name} • {listing.category} ({listing.city || 'Global'})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Initial Direct Inquiry Message
                        </label>
                        <textarea
                          rows={4}
                          value={newChatMessage}
                          onChange={(e) => setNewChatMessage(e.target.value)}
                          placeholder="Hello, I would like to inquire regarding aircraft charter availability, rates, and schedule..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300 flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Closed-loop privacy: direct corporate provider wallet will be debited per platform policy.</span>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowNewChatModal(false)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={newChatSending || !newChatListingId || !newChatMessage.trim()}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{newChatSending ? 'Starting...' : 'Initiate Chat'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. EMAILS TAB                                                             */}
          {/* ========================================================================= */}
          {activeTab === 'emails' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Emails Navigation Sidebar */}
              <div className="w-full md:w-64 border-r border-slate-800 bg-slate-950/40 p-3 flex flex-col space-y-2 shrink-0">
                <button
                  onClick={() => {
                    setEmailTab('compose');
                    setSelectedEmail(null);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Compose Mail</span>
                </button>

                <button
                  onClick={() => {
                    setEmailTab('inbox');
                    setSelectedEmail(null);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-left font-semibold text-xs flex items-center justify-between cursor-pointer ${
                    emailTab === 'inbox' && !selectedEmail
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Inbox className="w-4 h-4" />
                    <span>Domain Inbox</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">({emails.length})</span>
                </button>

                <div className="pt-2 border-t border-slate-800 flex-1 overflow-y-auto space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                    Inbox Messages
                  </span>
                  {emails.length === 0 ? (
                    <div className="text-[11px] text-slate-500 p-2">No domain emails.</div>
                  ) : (
                    emails.map((mail) => (
                      <button
                        key={mail.id}
                        onClick={() => {
                          setEmailTab('inbox');
                          setSelectedEmail(mail);
                        }}
                        className={`w-full p-2 rounded-xl text-left transition-colors cursor-pointer border ${
                          selectedEmail?.id === mail.id
                            ? 'bg-blue-600/15 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800/80 hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-xs truncate">{mail.subject}</div>
                        <div className="text-[10px] text-slate-400 truncate">From: {mail.from}</div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                          {new Date(mail.timestamp).toLocaleDateString()}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Email Content / Compose View */}
              <div className="flex-1 p-5 overflow-y-auto bg-slate-900/50">
                {emailTab === 'compose' ? (
                  <form onSubmit={handleSendEmail} className="space-y-4 max-w-xl">
                    <h4 className="text-sm font-bold text-white">Compose Truvaer Domain Message</h4>

                    {composeStatus && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                        {composeStatus}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          To (Official Admin Portal Desk) *
                        </label>
                        <span className="text-[10px] text-amber-400 font-mono">Central Governance Routing</span>
                      </div>
                      <input
                        type="email"
                        required
                        readOnly={!currentUser?.role || currentUser.role === 'STANDARD_USER'}
                        value={currentUser?.role && currentUser.role !== 'STANDARD_USER' ? composeTo : 'admin@truvaer.com'}
                        onChange={(e) => setComposeTo(e.target.value)}
                        placeholder="admin@truvaer.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Official Policy: Email inquiries from businesses and users route directly to the Central Admin Desk.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                        <input
                          type="text"
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          placeholder="Charter quote inquiry / Operational memo"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                        <select
                          value={composeCategory}
                          onChange={(e) => setComposeCategory(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                        >
                          <option value="Communication">Communication</option>
                          <option value="Primary">Primary</option>
                          <option value="Sales">Sales</option>
                          <option value="Updates">Updates</option>
                          <option value="Complaints">Complaints</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body *</label>
                      <textarea
                        rows={6}
                        required
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        placeholder="Type confidential aviation message..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Truvaer domain filters PII automatically to safeguard communications.</span>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Domain Mail</span>
                    </button>
                  </form>
                ) : selectedEmail ? (
                  <div className="space-y-4">
                    <div className="border-b border-slate-800 pb-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-base font-bold text-white">{selectedEmail.subject}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {selectedEmail.category}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400 space-y-0.5 font-mono">
                        <div>From: <span className="text-slate-200">{selectedEmail.from}</span></div>
                        <div>To: <span className="text-slate-200">{selectedEmail.to}</span></div>
                        <div>Date: <span className="text-slate-200">{new Date(selectedEmail.timestamp).toLocaleString()}</span></div>
                      </div>
                      {selectedEmail.piiRedacted && (
                        <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>PII Protection applied: sensitive personal phone/email was shielded.</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      <MaskedPIIText text={selectedEmail.body} />
                    </div>

                    <button
                      onClick={() => {
                        setComposeTo(selectedEmail.from);
                        setComposeSubject(`Re: ${selectedEmail.subject}`);
                        setEmailTab('compose');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply to {selectedEmail.from}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center text-xs">
                    <Mail className="w-12 h-12 text-slate-700 mb-2" />
                    <p>Select an email from the left sidebar to read or click &quot;Compose Mail&quot;.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. NOTIFICATIONS TAB                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                {/* Filter buttons */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {(['ALL', 'CHAT', 'EMAIL', 'WALLET', 'SYSTEM'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setNotifFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                        notifFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleMarkAllNotifsRead}
                  className="text-xs text-blue-400 hover:underline cursor-pointer font-semibold"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-2">
                {notifications
                  .filter((n) => notifFilter === 'ALL' || n.type === notifFilter)
                  .length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No notifications in this category.
                  </div>
                ) : (
                  notifications
                    .filter((n) => notifFilter === 'ALL' || n.type === notifFilter)
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 rounded-2xl border flex items-start justify-between space-x-3 transition-colors ${
                          notif.is_read
                            ? 'bg-slate-950 border-slate-800/80 text-slate-400'
                            : 'bg-slate-900 border-blue-500/40 text-white shadow-sm'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              notif.type === 'CHAT'
                                ? 'bg-blue-500/20 text-blue-400'
                                : notif.type === 'WALLET'
                                ? 'bg-amber-500/20 text-amber-400'
                                : notif.type === 'EMAIL'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {notif.type === 'CHAT' ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : notif.type === 'WALLET' ? (
                              <CreditCard className="w-4 h-4" />
                            ) : notif.type === 'EMAIL' ? (
                              <Mail className="w-4 h-4" />
                            ) : (
                              <Bell className="w-4 h-4" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-xs text-white">{notif.title}</div>
                            <div className="text-xs text-slate-300">{notif.message}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {new Date(notif.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {!notif.is_read && (
                          <button
                            onClick={() => {
                              db.markNotificationRead(notif.id);
                              reloadData();
                              if (onDataUpdated) onDataUpdated();
                            }}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer shrink-0"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (isInline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      {cardContent}
    </div>
  );
};

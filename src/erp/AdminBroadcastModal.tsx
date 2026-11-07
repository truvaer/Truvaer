import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  Radio,
  Mail,
  Bell,
  Globe,
  MapPin,
  Layers,
  Users,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  History,
  AlertCircle,
  Building2,
  User,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AviationZone, BroadcastNotification, AdminUser } from '../types';
import {
  ALL_ZONES,
  AVIATION_ZONES_MAP,
  getCountriesForZone,
  PLATFORM_CATEGORIES,
} from '../data/aviationGeographies';

interface AdminBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAdminUser?: AdminUser | null;
  onBroadcastPublished?: () => void;
}

export const AdminBroadcastModal: React.FC<AdminBroadcastModalProps> = ({
  isOpen,
  onClose,
  activeAdminUser,
  onBroadcastPublished,
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [zone, setZone] = useState<AviationZone | 'All'>('All');
  const [country, setCountry] = useState<string>('All');
  const [targetRecipientType, setTargetRecipientType] = useState<'ALL' | 'BUSINESS_ONLY' | 'REGULAR_ONLY'>('ALL');
  const [actionType, setActionType] = useState<'BOTH_NOTIFICATION_AND_EMAIL' | 'NOTIFICATION_ONLY' | 'EMAIL_ONLY'>(
    'BOTH_NOTIFICATION_AND_EMAIL'
  );

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Available countries based on selected zone
  const availableCountries = useMemo(() => {
    return ['All', ...getCountriesForZone(zone)];
  }, [zone]);

  // Handle Zone change: reset country to 'All'
  const handleZoneChange = (newZone: AviationZone | 'All') => {
    setZone(newZone);
    setCountry('All');
  };

  // Broadcast History
  const [historyList, setHistoryList] = useState<BroadcastNotification[]>(() => db.getBroadcastNotifications());

  const reloadHistory = () => {
    setHistoryList(db.getBroadcastNotifications());
  };

  // Estimate audience count
  const estimatedAudience = useMemo(() => {
    let count = 0;
    const businesses = db.getBusinesses();
    const users = db.getRegularUsers();
    const listings = db.getServiceListings();

    const matchesGeo = (cName?: string) => {
      const c = (cName || 'India').trim();
      if (country !== 'All' && c.toLowerCase() !== country.toLowerCase()) return false;
      if (zone !== 'All') {
        const zCountries = getCountriesForZone(zone);
        if (!zCountries.some((item) => item.toLowerCase() === c.toLowerCase())) return false;
      }
      return true;
    };

    if (targetRecipientType === 'ALL' || targetRecipientType === 'BUSINESS_ONLY') {
      businesses.forEach((b) => {
        const bizListing = listings.find((s) => s.business_id === b.business_id);
        const matchesCategory =
          category === 'All' ||
          b.nature_of_business?.toLowerCase().includes(category.toLowerCase()) ||
          bizListing?.category?.toLowerCase().includes(category.toLowerCase());
        const bCountry = b.physical_location || bizListing?.country || 'India';
        if (matchesCategory && matchesGeo(bCountry)) count++;
      });
    }

    if (targetRecipientType === 'ALL' || targetRecipientType === 'REGULAR_ONLY') {
      users.forEach((u) => {
        if (matchesGeo(u.country_code || 'India')) count++;
      });
    }

    return Math.max(count, 1);
  }, [category, zone, country, targetRecipientType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', message: 'Please provide both title and announcement details.' });
      return;
    }

    setSubmitting(true);
    const adminId = activeAdminUser?.admin_id || 'admin_primary';
    const adminName = activeAdminUser?.name || 'Central Administration Desk';

    const res = db.publishBroadcastNotification({
      title: title.trim(),
      message: message.trim(),
      category,
      zone,
      country,
      target_recipient_type: targetRecipientType,
      action_type: actionType,
      adminId,
      adminName,
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTitle('');
      setMessage('');
      reloadHistory();
      if (onBroadcastPublished) onBroadcastPublished();
      setTimeout(() => {
        setFeedback(null);
        setActiveTab('history');
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
                <span>Aviation Broadcast &amp; Targeted Dispatch</span>
              </h3>
              <p className="text-xs text-slate-400">
                Publish notifications and send formal emails Category-wise, Zone-wise (APAC, ANZ, CIS, EMEA, LATAM, NA) and Country-wise.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab('compose')}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === 'compose'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Targeted Broadcast</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              reloadHistory();
            }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Dispatched History ({historyList.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border ${
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
              <span>{feedback.message}</span>
            </div>
          )}

          {activeTab === 'compose' ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Audience Targeting Matrix */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Geographic &amp; Sector Targeting Scope
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Est. Audience: ~{estimatedAudience} Recipients
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      <span>Category-Wise Target</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium cursor-pointer"
                    >
                      {PLATFORM_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Zone Filter */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      <span>Zone-Wise Target</span>
                    </label>
                    <select
                      value={zone}
                      onChange={(e) => handleZoneChange(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold font-mono cursor-pointer"
                    >
                      <option value="All">All Global Zones (Worldwide)</option>
                      {ALL_ZONES.map((z) => (
                        <option key={z} value={z}>
                          {z} — {AVIATION_ZONES_MAP[z].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Country Filter (Dynamic based on selected Zone) */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Country-Wise Target</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium cursor-pointer"
                    >
                      {availableCountries.map((c) => (
                        <option key={c} value={c}>
                          {c === 'All' ? (zone === 'All' ? 'All Countries Worldwide' : `All Countries in ${zone}`) : c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  {/* Recipient Audience Filter */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>Target Recipient Group</span>
                    </label>
                    <select
                      value={targetRecipientType}
                      onChange={(e) => setTargetRecipientType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium cursor-pointer"
                    >
                      <option value="ALL">All Registered Operators &amp; Aviator Clients</option>
                      <option value="BUSINESS_ONLY">Aviation Business Operators Only (Charter, MRO, Academies)</option>
                      <option value="REGULAR_ONLY">Private Clients &amp; Individual Aviators Only</option>
                    </select>
                  </div>

                  {/* Dispatch Mode */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Action / Delivery Channel</span>
                    </label>
                    <select
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium cursor-pointer"
                    >
                      <option value="BOTH_NOTIFICATION_AND_EMAIL">
                        Publish In-App Notification + Send Domain Email
                      </option>
                      <option value="NOTIFICATION_ONLY">Publish In-App Notification Only</option>
                      <option value="EMAIL_ONLY">Send Domain Email Dispatch Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Broadcast Content */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Broadcast Subject / Headline *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. APAC & EMEA Summer Jet Charter Subvention Scheme"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Announcement Message &amp; Dispatch Body *</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type official broadcast details. This message will be delivered to user inboxes and broadcast notification banners..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Delivery Advisory */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-2 text-[11px] text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Official Broadcast Policy: Dispatch will route from <strong>admin@truvaer.com</strong> to all verified accounts matching Zone: <strong>{zone}</strong>, Country: <strong>{country}</strong>, and Category: <strong>{category}</strong>.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Publishing Broadcast...' : 'Publish & Dispatch Broadcast'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Previous Broadcast Log ({historyList.length})
              </h4>
              {historyList.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Radio className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-50" />
                  <p className="text-xs">No prior broadcasts recorded.</p>
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="font-bold text-white text-xs sm:text-sm">{item.title}</div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                          {item.zone} ({item.country})
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Delivered to: {item.delivered_count} recipients ({item.target_recipient_type})</span>
                      <span>{new Date(item.published_at).toLocaleString()} • Dispatched by {item.sender_admin_name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

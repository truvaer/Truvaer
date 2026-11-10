import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Star,
  Users,
  Calendar,
  FileText,
  ExternalLink,
  X,
  MessageSquare,
  FileCheck,
  Award,
  Send,
  Lock,
} from 'lucide-react';
import { BusinessProfile } from '../types';
import { db } from '../data/mockDatabase';

export interface BusinessProfileDetailModalProps {
  business: BusinessProfile;
  isOpen?: boolean;
  onClose: () => void;
  currentUserId?: string;
  onRequestQuote?: (biz: BusinessProfile) => void;
  onOpenCare?: () => void;
  isAdmin?: boolean;
  onFollowToggle?: (bizId: string) => void;
  isFollowing?: boolean;
}

export const BusinessProfileDetailModal: React.FC<BusinessProfileDetailModalProps> = ({
  business,
  isOpen = true,
  onClose,
  currentUserId,
  onRequestQuote,
  onOpenCare,
  isAdmin,
  onFollowToggle,
  isFollowing: propIsFollowing,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'compliance'>('overview');
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    if (propIsFollowing !== undefined) return propIsFollowing;
    return currentUserId ? db.isFollowingBusiness(currentUserId, business.business_id) : false;
  });
  const [followersCount, setFollowersCount] = useState<number>(() => {
    return db.getBusinessFollowersCount(business.business_id);
  });
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleFollow = () => {
    if (!currentUserId || currentUserId === 'guest') {
      setFeedbackToast('Please sign in to follow this aviation enterprise.');
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }

    if (isFollowing) {
      db.unfollowBusiness(currentUserId, business.business_id);
      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
      setFeedbackToast(`Unfollowed ${business.organization_name}.`);
    } else {
      db.followBusiness(currentUserId, business.business_id);
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      setFeedbackToast(`Now following ${business.organization_name}! Updates will appear in your feed.`);
    }
    if (onFollowToggle) {
      onFollowToggle(business.business_id);
    }
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const isVerified = business.verification_status === 'VERIFIED';
  const isHardLocked = business.is_hard_locked_by_admin || business.verification_status === 'REJECTED';
  const bannerImg = business.photos?.[0] || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[92vh]">
        {/* Cover Banner Header */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0 bg-slate-950">
          <img
            src={bannerImg}
            alt={business.organization_name}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 shadow-lg"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Verification / Security Badge on Banner */}
          <div className="absolute top-3.5 left-3.5 flex items-center space-x-2">
            {isVerified ? (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5 shadow backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Aviation Operator</span>
              </span>
            ) : isHardLocked ? (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1.5 shadow backdrop-blur-md">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Compliance Restricted</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 shadow backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Verification In Review</span>
              </span>
            )}
          </div>

          {/* Org Logo & Name on Banner bottom */}
          <div className="absolute bottom-3 left-4 sm:left-6 flex items-end space-x-3.5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-2 border-slate-700 shadow-xl overflow-hidden flex items-center justify-center text-indigo-400 font-bold shrink-0">
              {business.photos?.[0] ? (
                <img src={business.photos[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8" />
              )}
            </div>
            <div className="min-w-0 pb-1">
              <h2 className="text-lg sm:text-xl font-black text-white truncate drop-shadow-sm">
                {business.organization_name}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-slate-300 flex-wrap gap-y-1">
                <span className="font-semibold text-blue-400">{business.category || 'General Aviation'}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{business.city || business.physical_location || 'Aviation Hub'}, {business.country}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar: Follow, Request Quotation, Care */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <strong className="text-white">{followersCount.toLocaleString()}</strong>
              <span>followers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-white font-bold">4.9 / 5.0</span>
              <span className="text-[10px] text-slate-500 font-sans">(Aviation Trust Rating)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleFollow}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center space-x-1.5 ${
                isFollowing
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isFollowing ? 'Following ✓' : '+ Follow Page'}</span>
            </button>

            {onRequestQuote && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestQuote(business);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Quotation</span>
              </button>
            )}
          </div>
        </div>

        {feedbackToast && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 px-4 sm:px-6 pt-3 border-b border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-500 text-white font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview &amp; About
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'services'
                ? 'border-blue-500 text-white font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Aviation Fleet &amp; Services
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compliance')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'compliance'
                ? 'border-blue-500 text-white font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Compliance &amp; Verification
          </button>
        </div>

        {/* Modal Body / Tabs Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                  Corporate Description
                </h4>
                <p className="text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
                  {business.business_description ||
                    `${business.organization_name} is an authorized premier aviation service enterprise registered on Truvaer. Providing high-standard civil aviation solutions, fleet operations, charter logistics, and technical aeronautical support.`}
                </p>
              </div>

              {/* Quick Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Executive Representative:</span>
                  <div className="font-bold text-white text-sm">{business.owner_name}</div>
                  <div className="text-[11px] text-slate-400">Chief Executive / Managing Director</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Primary Station / Airfield:</span>
                  <div className="font-bold text-white text-sm">
                    {business.city || business.physical_location || 'Aerodrome Hub'}
                  </div>
                  <div className="text-[11px] text-slate-400">Country: {business.country}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Corporate Email:</span>
                  <div className="font-semibold text-sky-400">{business.business_email}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Encrypted Official Communication</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400">Direct Telephone:</span>
                  <div className="font-semibold text-emerald-400">{business.phone_number || '+91 98765 00000'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">24/7 Operations Desk Hotline</div>
                </div>
              </div>

              {business.website_url && (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 font-mono text-xs">{business.website_url}</span>
                  </div>
                  <a
                    href={business.website_url.startsWith('http') ? business.website_url : `https://${business.website_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Aviation Specializations &amp; Capabilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Executive Flight Logistics & VIP Handling',
                  'AOG Expedited Maintenance & Part Logistics',
                  'FAA & EASA Part-145 Certified Ground Operations',
                  'Crew Transit & Flight Dispatch Coordination',
                  'Civil Airspace Permits & Slot Coordination',
                  'Charter Booking & Dynamic Fleet Deployment',
                ].map((srv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center space-x-2.5 text-xs text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono uppercase text-[11px]">Tax &amp; Identity Registration:</span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-amber-300 font-bold">
                    {business.reg_number_type}: {business.registration_number}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Truvaer Corporate UUID:</span>
                  <span className="font-mono text-slate-300">{business.business_id}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Verification Status:</span>
                  <span className="font-bold text-emerald-400 uppercase">{business.verification_status}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Security Clearance Tier:</span>
                  <span className="font-bold text-sky-400 font-mono">Level 5 Civil Operator Certified</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Truvaer Aviation Network ID: {business.business_id.slice(0, 8)}...
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

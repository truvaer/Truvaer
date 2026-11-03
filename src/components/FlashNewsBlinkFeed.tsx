import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Sparkles,
  Maximize2,
  X,
  ExternalLink,
  Edit3,
  FileText,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { FlashNewsItem, RegularUser, BusinessProfile, AdminUser } from '../types';

interface FlashNewsBlinkFeedProps {
  currentUser?: RegularUser | null;
  currentBusiness?: BusinessProfile | null;
  isAdmin?: boolean;
  activeAdminUser?: AdminUser | null;
  onOpenPublicationDesk?: () => void;
}

export const FlashNewsBlinkFeed: React.FC<FlashNewsBlinkFeedProps> = ({
  currentUser,
  currentBusiness,
  isAdmin,
  activeAdminUser,
  onOpenPublicationDesk,
}) => {
  const [flashList, setFlashList] = useState<FlashNewsItem[]>(() => db.getFlashNews());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<FlashNewsItem | null>(null);

  const isSuperAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'sup_admin@truvaer.com' ||
    currentUser?.email?.toLowerCase() === 'admin@truvaer.com';

  const isBusinessAllowed = !!currentBusiness && currentBusiness.can_publish_flashnews !== false;
  const canPublish = isAdmin || isSuperAdmin || isBusinessAllowed;

  // Refresh flashnews items periodically or when modal actions occur
  const refreshFlashList = () => {
    const list = db.getFlashNews();
    setFlashList(list);
    if (currentIndex >= list.length) {
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    refreshFlashList();
    const interval = setInterval(refreshFlashList, 10000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic Blink Timer Engine (Custom per-item duration: 5s, 10s, 15s, 30s)
  const currentItem = flashList[currentIndex] || flashList[0];
  const itemIntervalSec = currentItem?.blink_interval_sec || 5;
  const BLINK_INTERVAL_MS = itemIntervalSec * 1000;
  const TICK_INTERVAL_MS = 100;

  useEffect(() => {
    if (currentItem?.id) {
      db.recordFlashNewsImpression(currentItem.id);
    }
  }, [currentItem?.id]);

  useEffect(() => {
    if (flashList.length <= 1 || isPaused) {
      setProgress(0);
      return;
    }

    const stepPct = (TICK_INTERVAL_MS / BLINK_INTERVAL_MS) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((cur) => (cur + 1) % flashList.length);
          return 0;
        }
        return prev + stepPct;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [flashList.length, isPaused, currentIndex, BLINK_INTERVAL_MS]);

  const handleNext = () => {
    if (flashList.length === 0) return;
    setCurrentIndex((cur) => (cur + 1) % flashList.length);
    setProgress(0);
  };

  const handlePrev = () => {
    if (flashList.length === 0) return;
    setCurrentIndex((cur) => (cur - 1 + flashList.length) % flashList.length);
    setProgress(0);
  };

  if (flashList.length === 0) {
    return null;
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'BREAKING':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'WEATHER_NOTAM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'CHARTER_DISPATCH':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'OPERATIONS':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SECURITY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* ========================================================================= */}
      {/* 5-SECOND BLINK FEED TICKER CONTAINER                                      */}
      {/* ========================================================================= */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 shadow-2xl p-3.5 sm:p-4 group transition-all"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header Controls Row: Streamlined and corner-aligned */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center space-x-2 min-w-0">
            {/* Blinking Live Broadcast Indicator Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 shadow-inner shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 font-mono">
                Flash News
              </span>
            </div>

            {/* Category Tag */}
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase truncate shrink-0 ${getCategoryColor(
                currentItem.category
              )}`}
            >
              {currentItem.category.replace('_', ' ')}
            </span>

            {/* Queue Counter: e.g. 1/10 */}
            <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
              {currentIndex + 1}/{flashList.length}
            </span>
          </div>

          {/* Far Right Corner Action Cluster: Publication Desk (Icon Only) & Navigation Arrows */}
          <div className="flex items-center space-x-1 shrink-0 ml-auto">
            {/* Admin Publication Desk Button (Icon Only as requested) */}
            {canPublish && onOpenPublicationDesk && (
              <button
                type="button"
                onClick={onOpenPublicationDesk}
                className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                title="Flashnews Publication Desk"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            {/* Navigation Arrows at the Corner */}
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Previous Flashnews"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Next Flashnews"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Blink Content Body (Smooth Key-based Animation on 5s Interval) */}
        <div
          key={currentItem.id}
          className="pt-2.5 transition-all duration-300 animate-in fade-in zoom-in-95 cursor-pointer"
          onClick={() => setSelectedItemForDetail(currentItem)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-black text-white hover:text-amber-300 transition-colors flex items-center space-x-2">
                <span className="text-amber-400 font-mono text-[11px] shrink-0">▶</span>
                <span className="truncate">{currentItem.headline}</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-3">
                {currentItem.content}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-end text-right text-[10px] font-mono text-slate-400">
              <span className="text-slate-400 text-[10px]">{new Date(currentItem.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="text-amber-400/80 hover:text-amber-300 text-[10px] font-bold mt-1 inline-flex items-center space-x-0.5">
                <span>Expand</span>
                <Maximize2 className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FULL DETAIL VIEW FOR CURRENT FLASHNEWS                           */}
      {/* ========================================================================= */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${getCategoryColor(selectedItemForDetail.category)}`}>
                  {selectedItemForDetail.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full border border-slate-800">
                  {selectedItemForDetail.word_count} / 200 words
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-black text-white leading-snug">
                {selectedItemForDetail.headline}
              </h3>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedItemForDetail.content}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Airspace Broadcast</span>
                </div>
                <div className="text-right">
                  <span>{new Date(selectedItemForDetail.published_at).toLocaleDateString()}</span>
                  <span className="block text-slate-500 text-[10px]">{new Date(selectedItemForDetail.published_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

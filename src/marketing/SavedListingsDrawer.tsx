import React, { useState } from 'react';
import {
  X,
  Heart,
  Building2,
  MapPin,
  Star,
  MessageSquare,
  FileSpreadsheet,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { ServiceListing } from '../types';

interface SavedListingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedItemIds: string[];
  allListings: ServiceListing[];
  onToggleFavorite: (id: string) => void;
  onClearAll: () => void;
  onSelectListing: (listing: ServiceListing) => void;
  onDirectChat: (listing: ServiceListing) => void;
  onRequestQuotation: (listing: ServiceListing) => void;
}

export const SavedListingsDrawer: React.FC<SavedListingsDrawerProps> = ({
  isOpen,
  onClose,
  savedItemIds,
  allListings,
  onToggleFavorite,
  onClearAll,
  onSelectListing,
  onDirectChat,
  onRequestQuotation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const savedListings = allListings.filter((item) => savedItemIds.includes(item.id));

  const filteredListings = savedListings.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.subCategory && item.subCategory.toLowerCase().includes(term)) ||
      (item.city && item.city.toLowerCase().includes(term)) ||
      (item.country && item.country.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-[999] flex justify-end animate-fade-in">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl z-10">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Saved Aviation Listings</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[11px] font-bold">
                  {savedListings.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Bookmarked operators &amp; service partners</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Saved Listings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-header / Search & Clear Actions */}
        {savedListings.length > 0 && (
          <div className="p-3 bg-slate-900/90 border-b border-slate-800/80 space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search saved partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500/60"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[11px] text-slate-400">
                {filteredListings.length} of {savedListings.length} shown
              </span>
              {!showClearConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-400">Remove all {savedListings.length}?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                    }}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Yes, remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drawer Body List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {savedListings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center">
                <Heart className="w-8 h-8 text-slate-600 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h4 className="text-sm font-bold text-white">No Saved Listings Yet</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bookmark charter operators, Part-145 MRO facilities, and flight schools by tapping the heart icon on any ServiceScout card.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Explore Marketplace Listings
              </button>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No saved listings match &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            filteredListings.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 group shadow-md"
              >
                {/* Header row: Logo, Name, Location & Remove */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.logoUrl ? (
                        <img
                          src={item.logoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      ) : (
                        <Building2 className="w-5 h-5 text-sky-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4
                          onClick={() => {
                            onSelectListing(item);
                            onClose();
                          }}
                          className="text-xs font-bold text-white hover:text-sky-400 cursor-pointer transition-colors line-clamp-1"
                        >
                          {item.name}
                        </h4>
                        {item.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="truncate">
                          {item.city}, {item.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer shrink-0"
                    title="Remove from saved"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </button>
                </div>

                {/* Category & Rating */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/60">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 text-sky-300 font-medium border border-slate-800">
                    {item.category}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-400 font-bold font-mono">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{item.rating || '4.9'}</span>
                    <span className="text-slate-500 font-normal">({item.reviews_count || 12})</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onDirectChat(item);
                      onClose();
                    }}
                    className="py-1.5 px-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-[11px] flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onRequestQuotation(item);
                      onClose();
                    }}
                    className="py-1.5 px-2 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-semibold text-[11px] flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>RFQ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectListing(item);
                      onClose();
                    }}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                  >
                    <span>Profile</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {savedListings.length > 0 && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>{savedListings.length} total saved</span>
            <button
              type="button"
              onClick={onClose}
              className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
            >
              Back to ServiceScout &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

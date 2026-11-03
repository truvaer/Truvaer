import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Image as ImageIcon } from 'lucide-react';

interface LightboxImageSliderProps {
  photos: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const LightboxImageSlider: React.FC<LightboxImageSliderProps> = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
  subtitle,
}) => {
  // Safe bounds initialization
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (!photos || photos.length === 0) return 0;
    return Math.max(0, Math.min(initialIndex, photos.length - 1));
  });

  const [isZoomed, setIsZoomed] = useState(false);
  const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync index when photos change or modal opens
  useEffect(() => {
    if (photos && photos.length > 0) {
      setCurrentIndex((prev) => Math.max(0, Math.min(prev, photos.length - 1)));
    }
  }, [photos]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, Math.max(0, photos.length - 1))));
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex, photos.length]);

  // Bound-protected slide navigation
  const handlePrev = () => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    if (photos.length <= 1) return;
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length]);

  // Stabilized Event Delegation for Thumbnails:
  // Clicks are captured on the parent container via data-thumbnail-index
  // so no thumbnail click events are lost even during fast re-renders
  const handleThumbnailClickDelegation = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-thumbnail-index]');
    if (target) {
      const idxAttr = target.getAttribute('data-thumbnail-index');
      if (idxAttr !== null) {
        const targetIdx = parseInt(idxAttr, 10);
        if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < photos.length) {
          setCurrentIndex(targetIdx);
        }
      }
    }
  };

  if (!isOpen || !photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-sm sm:text-base flex items-center space-x-1.5">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>{title || 'Verified Aviation Imagery Gallery'}</span>
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom toggle */}
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isZoomed ? 'Fit to Screen' : 'Zoom In'}
          >
            {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden select-none">
        {/* Previous Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-2xl bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Previous (ArrowLeft)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Current Image */}
        <div
          className={`transition-all duration-300 flex items-center justify-center max-w-full max-h-full ${
            isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentPhoto}
            alt={`Image ${currentIndex + 1} of ${photos.length}`}
            className="max-h-[68vh] sm:max-h-[72vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl border border-slate-800"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Next Button */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-2xl bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Next (ArrowRight)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Stabilized Thumbnail Bar using Event Delegation */}
      <div className="w-full max-w-5xl mx-auto pt-2">
        <div
          ref={thumbnailsContainerRef}
          onClick={handleThumbnailClickDelegation}
          className="flex items-center justify-center space-x-2 overflow-x-auto py-2 px-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl max-w-full"
        >
          {photos.map((photoUrl, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={`thumb-${idx}`}
                data-thumbnail-index={idx}
                className={`relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                  isActive
                    ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/20 opacity-100 ring-2 ring-amber-400/40'
                    : 'border-slate-700 opacity-50 hover:opacity-90 hover:border-slate-500'
                }`}
              >
                <img
                  src={photoUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold bg-slate-950/80 text-white px-1 rounded pointer-events-none">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

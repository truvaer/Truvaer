import React, { useState } from 'react';
import { ExternalLink, Sparkles, Info } from 'lucide-react';

interface GoogleAdSlotProps {
  adSlotId?: string;
  adFormat?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export const GoogleAdSlot: React.FC<GoogleAdSlotProps> = ({
  adSlotId = 'google-ads-truvaer-responsive',
  adFormat = 'horizontal',
  className = '',
}) => {
  const [adDismissed, setAdDismissed] = useState(false);

  if (adDismissed) return null;

  return (
    <div
      id={`ad-container-${adSlotId}`}
      className={`relative w-full rounded-2xl border border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 p-3 shadow-md overflow-hidden transition-all ${className}`}
    >
      {/* Top Header Tag */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2 pb-1.5 border-b border-slate-800">
        <div className="flex items-center space-x-1.5">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
            Ad
          </span>
          <span className="font-semibold text-slate-300">Google Ads • Aviation Network</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline text-slate-500">Sponsored Placement</span>
          <button
            onClick={() => setAdDismissed(true)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Hide this ad preview"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Standard Google AdSense script placeholder block */}
      <div className="adsbygoogle-wrapper min-h-[90px] flex flex-col md:flex-row items-center justify-between gap-4 py-1 px-2">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white hover:text-blue-300 transition-colors cursor-pointer flex items-center space-x-1">
                <span>Executive Jet Charters &amp; Sustainable Aviation Fuel (SAF)</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Save up to 35% on empty leg private flights across North America, Europe &amp; Asia-Pacific. Instant booking available.
            </p>
            <div className="flex items-center space-x-3 text-[11px] font-mono text-emerald-400 mt-1">
              <span>www.global-aviationservices.aero</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Verified Partner</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center space-x-2 w-full md:w-auto justify-end">
          <a
            href="https://www.google.com/adsense/start/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Official Google Ads Tag placeholder for live production monetization */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-truvaer-live"
        data-ad-slot={adSlotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

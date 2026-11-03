import React, { useState, useEffect } from 'react';
import {
  Radio,
  Activity,
  Plane,
  ShieldCheck,
  Zap,
  Globe2,
  Users,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface TickerItem {
  id: string;
  type: 'FLIGHT' | 'VERIFIED' | 'HUB' | 'INQUIRY' | 'SETTLEMENT';
  city: string;
  code: string;
  message: string;
  timestamp: string;
  accent: string;
}

const LIVE_EVENTS: TickerItem[] = [
  {
    id: 'evt-1',
    type: 'FLIGHT',
    city: 'Singapore',
    code: 'WSSS',
    message: 'Jet Aviation FBO VIP apron slot confirmed for Gulfstream G650ER arrival.',
    timestamp: 'Just now',
    accent: 'text-blue-400',
  },
  {
    id: 'evt-2',
    type: 'VERIFIED',
    city: 'Dubai',
    code: 'OMDB',
    message: 'ExecuJet Middle East renewed ICAO / IS-BAH Stage 3 credentials & Truvaer ID.',
    timestamp: '1m ago',
    accent: 'text-emerald-400',
  },
  {
    id: 'evt-3',
    type: 'HUB',
    city: 'London',
    code: 'EGLF',
    message: 'TAG Farnborough Airport executive lounge & fast-track ramp operational 24/7.',
    timestamp: '2m ago',
    accent: 'text-sky-400',
  },
  {
    id: 'evt-4',
    type: 'INQUIRY',
    city: 'New York',
    code: 'KTEB',
    message: 'Teterboro Jet Center received corporate charter inquiry with instant direct chat.',
    timestamp: '3m ago',
    accent: 'text-indigo-400',
  },
  {
    id: 'evt-5',
    type: 'SETTLEMENT',
    city: 'Global Edge',
    code: 'APAC-US',
    message: 'Razorpay UPI & PayPal Corporate Credit Auto-Renew active across 85 countries.',
    timestamp: '4m ago',
    accent: 'text-amber-400',
  },
];

interface LiveMarketTickerProps {
  onOpenComms?: () => void;
  activeListingsCount: number;
  isStandardUser?: boolean;
}

export const LiveMarketTicker: React.FC<LiveMarketTickerProps> = ({
  onOpenComms,
  activeListingsCount,
  isStandardUser = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [onlineAviators, setOnlineAviators] = useState(86);
  const [latency, setLatency] = useState(22);

  // Auto-cycle ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Subtle real-time heartbeat for live atmosphere
  useEffect(() => {
    const jitter = setInterval(() => {
      setOnlineAviators((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(78, Math.min(104, prev + delta));
      });
      setLatency((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(16, Math.min(32, prev + delta));
      });
    }, 8000);
    return () => clearInterval(jitter);
  }, []);

  const currentEvent = LIVE_EVENTS[currentIndex];

  return (
    <div
      id="live-market-ticker"
      className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3 text-xs overflow-hidden"
    >
      {/* Left: Live Status Tag & Broadcast */}
      <div className="flex items-center space-x-3 w-full md:w-auto overflow-hidden">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[11px] shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wider">LIVE FEED</span>
        </div>

        {/* Ticker Item */}
        <div className="flex items-center space-x-2 truncate transition-all duration-300">
          <span className="font-mono text-[11px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
            {currentEvent.code}
          </span>
          <span className={`font-semibold text-xs ${currentEvent.accent} truncate`}>
            {currentEvent.city}:
          </span>
          <span className="text-slate-300 truncate text-[11.5px]">
            {currentEvent.message}
          </span>
          <span className="text-[10px] text-slate-500 font-mono shrink-0 hidden sm:inline">
            ({currentEvent.timestamp})
          </span>
        </div>
      </div>

      {/* Right: Real-time Telemetry Stats */}
      <div className="flex items-center justify-between w-full md:w-auto space-x-4 shrink-0 text-[11px] font-mono border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
        <div className="flex items-center space-x-1 text-slate-400">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold text-white">{onlineAviators}</span>
          <span className="hidden sm:inline">Aviators Active</span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400">
          <Plane className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-bold text-white">{activeListingsCount}</span>
          <span className="hidden sm:inline">Verified Listings</span>
        </div>

        {!isStandardUser && (
          <div className="flex items-center space-x-1 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{latency}ms</span>
            <span className="hidden sm:inline">Latency</span>
          </div>
        )}

        {onOpenComms && (
          <button
            onClick={onOpenComms}
            className="flex items-center space-x-1 text-sky-400 hover:text-white transition-colors cursor-pointer ml-2"
          >
            <span>Live Desks</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

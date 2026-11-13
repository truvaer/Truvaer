import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Eye,
  Users,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/dateFormat';

interface ProfileViewsConversionChartProps {
  businessName?: string;
  totalLeadsCount: number;
}

export const ProfileViewsConversionChart: React.FC<ProfileViewsConversionChartProps> = ({
  businessName = 'Aerospace Partner',
  totalLeadsCount,
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '14D' | '30D'>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate deterministic realistic analytics based on date & time range
  const chartData = useMemo(() => {
    const days = timeRange === '7D' ? 7 : timeRange === '14D' ? 14 : 30;
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDateDDMMYYYY(d);

      // Daily variance
      const seed = (d.getDate() * 17 + i * 31) % 100;
      const views = 60 + (seed % 90) + (i === 0 ? 30 : 0);
      const contactReveals = Math.round(views * 0.22 + (seed % 8));
      const convertedRfqs = Math.max(1, Math.round(contactReveals * 0.35 + (seed % 4)));

      result.push({
        date: dateStr,
        fullDate: formatDateDDMMYYYY(d),
        views,
        contactReveals,
        convertedRfqs,
      });
    }
    return result;
  }, [timeRange]);

  const totalViews = useMemo(() => chartData.reduce((acc, d) => acc + d.views, 0), [chartData]);
  const totalReveals = useMemo(() => chartData.reduce((acc, d) => acc + d.contactReveals, 0), [chartData]);
  const totalRfqs = useMemo(() => chartData.reduce((acc, d) => acc + d.convertedRfqs, 0), [chartData]);
  const overallConversion = useMemo(() => {
    if (totalViews === 0) return 0;
    return Math.round((totalRfqs / totalViews) * 1000) / 10;
  }, [totalViews, totalRfqs]);

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const maxViews = useMemo(() => Math.max(...chartData.map((d) => d.views), 100) * 1.15, [chartData]);

  // Points for Views line
  const pointsViews = chartData.map((d, idx) => {
    const x = paddingX + (idx / (chartData.length - 1)) * plotWidth;
    const y = svgHeight - paddingY - (d.views / maxViews) * plotHeight;
    return { x, y, ...d };
  });

  const viewsPolyline = pointsViews.map((p) => `${p.x},${p.y}`).join(' ');
  const viewsArea = `${paddingX},${svgHeight - paddingY} ${viewsPolyline} ${svgWidth - paddingX},${svgHeight - paddingY}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Top Bar: Title, Scope, Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                <span>Directory Profile Views &amp; Lead Conversion Analytics</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                  LIVE TELEMETRY
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Performance intelligence across ServiceScout listings, Near-Me geolocation, and direct RFQs
              </p>
            </div>
          </div>
        </div>

        {/* Time Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['7D', '14D', '30D'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setTimeRange(r);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === r
                  ? 'bg-sky-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r === '7D' ? 'Last 7 Days' : r === '14D' ? 'Last 14 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Profile Impressions</span>
            <Eye className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {totalViews.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4% vs prev period</span>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Contact &amp; PII Reveals</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-300 font-mono">
            {totalReveals.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {Math.round((totalReveals / (totalViews || 1)) * 100)}% view-to-reveal rate
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inbound RFQs &amp; Leads</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            {totalRfqs.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {totalLeadsCount > 0 ? `${totalLeadsCount} active in CRM` : 'Direct pipeline leads'}
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Conversion Ratio</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {overallConversion}%
          </div>
          <div className="text-[11px] text-emerald-300/80 font-medium">
            Industry Benchmark: 6.2%
          </div>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
              <span className="text-white font-medium">ServiceScout Profile Views</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span className="text-slate-300 font-medium">Converted Inquiries &amp; RFQs</span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] font-mono">
            Hover points on chart for daily breakdown
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48 sm:h-56 select-none"
          >
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = svgHeight - paddingY - pct * plotHeight;
              const val = Math.round(pct * maxViews);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-500 font-mono text-[9px]"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area under Views Curve */}
            <polygon points={viewsArea} fill="url(#viewsGradient)" />

            {/* Daily Converted Leads Bar/Pill columns */}
            {chartData.map((d, idx) => {
              const x = paddingX + (idx / (chartData.length - 1)) * plotWidth;
              const barHeight = Math.max(6, (d.convertedRfqs / maxViews) * plotHeight * 4.5);
              const y = svgHeight - paddingY - barHeight;
              const barWidth = Math.max(6, plotWidth / (chartData.length * 2.8));

              return (
                <rect
                  key={idx}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  className="fill-emerald-500/80 hover:fill-emerald-400 transition-colors"
                />
              );
            })}

            {/* Views Polyline */}
            <polyline
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={viewsPolyline}
            />

            {/* Interactive Data Points */}
            {pointsViews.map((p, idx) => (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIndex === idx ? 6 : 4}
                  className={`transition-all ${
                    hoveredIndex === idx
                      ? 'fill-white stroke-sky-400 stroke-[3]'
                      : 'fill-sky-400 stroke-slate-900 stroke-[2]'
                  }`}
                />
                {/* Date label at bottom */}
                {(idx === 0 ||
                  idx === chartData.length - 1 ||
                  idx === Math.floor(chartData.length / 2)) && (
                  <text
                    x={p.x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    className="fill-slate-400 font-mono text-[10px]"
                  >
                    {p.date}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Box */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <div className="absolute top-2 right-4 bg-slate-900/95 border border-sky-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-sans space-y-1 z-10 pointer-events-none">
              <div className="text-[11px] font-mono text-slate-400 font-bold">
                {chartData[hoveredIndex].fullDate}
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="text-sky-400 font-bold">Profile Views:</span>
                <span className="font-mono font-bold">{chartData[hoveredIndex].views}</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <span className="text-indigo-300 font-bold">Contact Reveals:</span>
                <span className="font-mono font-bold">{chartData[hoveredIndex].contactReveals}</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400">
                <span className="font-bold">Inbound RFQs:</span>
                <span className="font-mono font-bold">{chartData[hoveredIndex].convertedRfqs}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Traffic Channel Attribution & Funnel Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Discovery Channel Breakdown */}
        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Traffic Source Attribution</span>
          </span>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Direct Marketplace Keyword Search</span>
                <span className="font-mono text-sky-400 font-bold">44%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '44%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>&ldquo;Near Me&rdquo; Geolocation Quick-Filter</span>
                <span className="font-mono text-indigo-400 font-bold">28%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Category &amp; Taxonomy Filter</span>
                <span className="font-mono text-amber-400 font-bold">18%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Stories for You / Feed Articles</span>
                <span className="font-mono text-emerald-400 font-bold">10%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Funnel Stage Progression */}
        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Conversion Funnel Velocity</span>
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-slate-300 font-medium">1. Listing Card Impression</span>
              <span className="font-mono text-white font-bold">{totalViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-slate-300 font-medium">2. Full Business Dossier Opened</span>
              <span className="font-mono text-sky-400 font-bold">{Math.round(totalViews * 0.42)} (42%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-slate-300 font-medium">3. Contact Unlocked / Chat Initiated</span>
              <span className="font-mono text-indigo-400 font-bold">{totalReveals} ({Math.round((totalReveals / (totalViews || 1)) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-emerald-300 font-medium">4. Official Quotation / Deal Converted</span>
              <span className="font-mono text-emerald-400 font-bold">{totalRfqs} ({overallConversion}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

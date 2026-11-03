import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Filter,
  Sparkles,
  Globe,
  Sliders,
  ChevronRight,
  Info,
  ArrowRight,
  Coins,
  RefreshCw,
  Search,
  Building2,
  Calendar,
  Check,
  PieChart,
  Tag,
  Briefcase,
  HelpCircle,
  Activity,
} from 'lucide-react';
import {
  AviationZone,
  RegionalFinancialMetric,
  RegionalFocusPriority,
  RegionalLedgerTransaction,
  TransactionReasonCategory,
} from '../types';
import {
  REGIONAL_FINANCIAL_METRICS,
  GLOBAL_CONSOLIDATED_METRIC,
  REGIONAL_LEDGER_TRANSACTIONS,
} from '../data/mockRegionalFinancialData';

interface RegionalCashFlowAnalyticsProps {
  onNavigateToTab?: (tab: string) => void;
}

type CurrencyType = 'USD' | 'INR' | 'EUR' | 'AED' | 'CREDITS';

const CURRENCY_RATES: Record<CurrencyType, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1, label: 'US Dollars ($)' },
  INR: { symbol: '₹', rate: 86.5, label: 'Indian Rupee (₹)' },
  EUR: { symbol: '€', rate: 0.92, label: 'Euro (€)' },
  AED: { symbol: 'AED ', rate: 3.67, label: 'UAE Dirham (AED)' },
  CREDITS: { symbol: 'Cr ', rate: 10, label: 'Truvaer Credits' },
};

// Analysis Reason / Purpose Dropdown options (Dropbox 1)
export type AnalysisReasonType =
  | 'ALL_OVERVIEW'
  | 'REGIONAL_FLOW'
  | 'SALES_FLOW'
  | 'EXPENDITURES'
  | 'DEPARTMENT_FOCUS'
  | 'LEDGER_AUDIT';

export const REASON_OPTIONS: Array<{
  id: AnalysisReasonType;
  label: string;
  icon: string;
  badge: string;
  description: string;
}> = [
  {
    id: 'ALL_OVERVIEW',
    label: 'Overview & Cash Flow Waterfall',
    icon: '📊',
    badge: 'Executive Summary',
    description: 'Unified gross income, operational expenses, and net retained cash flow movement',
  },
  {
    id: 'REGIONAL_FLOW',
    label: 'Regional Cash Flow (APAC vs ANZ vs LATAM)',
    icon: '🌍',
    badge: 'Comparative',
    description: 'Cross-regional comparative chart with loss-to-profit chromatic gradient',
  },
  {
    id: 'SALES_FLOW',
    label: 'Sales Inflow & Revenue Channels (Income)',
    icon: '📈',
    badge: 'Income Only',
    description: 'Unified sapphire blue income breakdown: charters, MRO maintenance, academies, spares',
  },
  {
    id: 'EXPENDITURES',
    label: 'Operational Expenditures & Cost Allocation',
    icon: '📉',
    badge: 'Expenses',
    description: 'Analysis of fuel bunkering, apron tariffs, hangar leases, and broker commissions',
  },
  {
    id: 'DEPARTMENT_FOCUS',
    label: 'Department Strategic Focus & Capital Allocation',
    icon: '🎯',
    badge: 'Action Matrix',
    description: 'Identifies where finance and admin department focus and funding must be deployed',
  },
  {
    id: 'LEDGER_AUDIT',
    label: 'Operational Ledger Journal (Filtered by Reason)',
    icon: '📑',
    badge: 'Live Journal',
    description: 'Searchable line-item accounting journal filtered by transaction reason and zone',
  },
];

export const REGION_OPTIONS: Array<{ code: AviationZone | 'GLOBAL'; label: string; flag: string }> = [
  { code: 'GLOBAL', label: 'All Regions (Global Consolidated)', flag: '🌐' },
  { code: 'APAC', label: 'APAC (Asia-Pacific: India, Singapore, Japan, UAE)', flag: '🌏' },
  { code: 'ANZ', label: 'ANZ (Australasia: Australia, New Zealand, Fiji)', flag: '🦘' },
  { code: 'EMEA', label: 'EMEA (Europe, Middle East, Africa)', flag: '🌍' },
  { code: 'NA', label: 'NA (North America: USA, Canada)', flag: '🗽' },
  { code: 'CIS', label: 'CIS (Eurasia & Central Asia)', flag: '🏔️' },
  { code: 'LATAM', label: 'LATAM (Latin America & Caribbean)', flag: '🌴' },
];

export const CATEGORY_OPTIONS: Array<{ id: TransactionReasonCategory; label: string }> = [
  { id: 'ALL', label: 'All Activity & Expense Reasons' },
  { id: 'CHARTER_SALES', label: 'Charter Sales & Passenger Inflow (Income)' },
  { id: 'FUEL_RAMP_OPEX', label: 'Jet A-1 Fuel & Airport Apron Tariffs' },
  { id: 'MRO_OVERHAUL', label: 'Part-145 MRO & Avionics Overhaul' },
  { id: 'COMMISSION_PAYOUT', label: 'Corporate Commissions & Broker Disbursements' },
  { id: 'REGULATORY_COMPLIANCE', label: 'Regulatory Compliance & DGCA/FAA Oversight' },
  { id: 'WALLET_DEBIT', label: '2-Stage Corporate Wallet Debits' },
  { id: 'ACADEMY_TUITION', label: 'Flight Academy Cadet Tuition (Income)' },
  { id: 'AIRSIDE_LEASE', label: 'Airside Hangar & Tie-Down Leases' },
];

/**
 * Fiscal Period Options as strictly specified by user:
 * "Under the fiscal period Option should be given as 1,3, Half year, 1 year and 3 year."
 */
export const PERIOD_OPTIONS = [
  { id: '1', label: '1 (1 Month)', display: '1', description: '1 Month Operational Window', multiplier: 1 / 12 },
  { id: '3', label: '3 (3 Months / Quarter)', display: '3', description: 'Quarterly Operating Cycle (3 Months)', multiplier: 3 / 12 },
  { id: 'Half year', label: 'Half year (6 Months)', display: 'Half year', description: 'Semiannual Fiscal Half (6 Months)', multiplier: 6 / 12 },
  { id: '1 year', label: '1 year (12 Months)', display: '1 year', description: 'Full Annual Fiscal Year (12 Months)', multiplier: 1.0 },
  { id: '3 year', label: '3 year (36 Months)', display: '3 year', description: 'Multi-Year 3-Year Capital Cycle', multiplier: 3.0 },
];

const ZONES_ORDER: AviationZone[] = ['APAC', 'ANZ', 'EMEA', 'NA', 'CIS', 'LATAM'];

/**
 * Dynamic Chromatic Interpolation:
 * "where income should be one color loses should be in red and slowly as it turns towards the profits it should slowly change the color to green"
 *
 * Income is unified in signature Sapphire Blue (#0284C7 / #38BDF8 / bg-sky-500 / text-sky-400).
 * Losses (<0%) are Red (#EF4444 / text-red-500 / bg-red-500/20).
 * As margin turns positive (0% - 5%), it shifts to Orange (#F97316).
 * As it grows (5% - 15%), it shifts to Amber / Gold (#F59E0B).
 * As it scales (15% - 22%), it shifts to Lime / Yellow-Green (#84CC16).
 * As it scales (22% - 30%), it shifts to Vibrant Green (#22C55E).
 * Peak profit (>30%), it shifts to Deep Emerald Green (#10B981).
 */
export function getProfitLossColorStyle(marginPercent: number) {
  if (marginPercent < 0) {
    // Loss: Intense Red
    return {
      hex: '#ef4444',
      name: 'Loss (Red)',
      text: 'text-red-400',
      textMuted: 'text-red-300',
      bg: 'bg-red-500/15',
      border: 'border-red-500/40',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      gradient: 'from-red-600 to-rose-500',
      barGradient: 'from-red-600 via-rose-500 to-red-400',
      label: 'Operating Deficit (Net Loss)',
      status: 'LOSS',
      spectrumPos: Math.max(4, Math.min(20, 20 + marginPercent * 1.5)), // 0-20% on spectrum
    };
  } else if (marginPercent <= 5) {
    // Turning from Loss into Profit: Orange (Breakeven threshold)
    return {
      hex: '#f97316',
      name: 'Turning Profitable (Orange)',
      text: 'text-orange-400',
      textMuted: 'text-orange-300',
      bg: 'bg-orange-500/15',
      border: 'border-orange-500/40',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      gradient: 'from-orange-600 to-amber-500',
      barGradient: 'from-red-500 via-orange-500 to-amber-400',
      label: 'Turning Profitable / Slim Margin',
      status: 'TURNING',
      spectrumPos: 28, // ~28% on spectrum
    };
  } else if (marginPercent <= 14) {
    // Low Margin: Warm Amber / Gold
    return {
      hex: '#f59e0b',
      name: 'Low Profit (Amber)',
      text: 'text-amber-400',
      textMuted: 'text-amber-300',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/40',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      gradient: 'from-amber-600 to-yellow-500',
      barGradient: 'from-orange-500 via-amber-500 to-yellow-400',
      label: 'Modest Profit Margin',
      status: 'MODEST_PROFIT',
      spectrumPos: 46, // ~46% on spectrum
    };
  } else if (marginPercent <= 22) {
    // Moderate Profit: Lime / Yellow-Green
    return {
      hex: '#84cc16',
      name: 'Moderate Profit (Lime)',
      text: 'text-lime-400',
      textMuted: 'text-lime-300',
      bg: 'bg-lime-500/15',
      border: 'border-lime-500/40',
      badge: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
      gradient: 'from-lime-600 to-green-500',
      barGradient: 'from-amber-500 via-lime-500 to-green-400',
      label: 'Healthy Operating Profit',
      status: 'HEALTHY_PROFIT',
      spectrumPos: 65, // ~65% on spectrum
    };
  } else if (marginPercent <= 30) {
    // Strong Profit: Vibrant Green
    return {
      hex: '#22c55e',
      name: 'Strong Profit (Green)',
      text: 'text-green-400',
      textMuted: 'text-green-300',
      bg: 'bg-green-500/15',
      border: 'border-green-500/40',
      badge: 'bg-green-500/20 text-green-300 border-green-500/30',
      gradient: 'from-green-600 to-emerald-500',
      barGradient: 'from-lime-500 via-green-500 to-emerald-400',
      label: 'Strong Profit Margin',
      status: 'STRONG_PROFIT',
      spectrumPos: 82, // ~82% on spectrum
    };
  } else {
    // Peak Profit Engine: Lush Emerald Green
    return {
      hex: '#10b981',
      name: 'Peak Profit (Emerald Green)',
      text: 'text-emerald-400',
      textMuted: 'text-emerald-300',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      gradient: 'from-emerald-600 to-teal-400',
      barGradient: 'from-green-500 via-emerald-500 to-teal-300',
      label: 'Peak Profit Engine',
      status: 'PEAK_PROFIT',
      spectrumPos: 96, // ~96% on spectrum
    };
  }
}

export const RegionalCashFlowAnalytics: React.FC<RegionalCashFlowAnalyticsProps> = ({
  onNavigateToTab,
}) => {
  // --- Dropbox Filter States (Requested by User) ---
  const [selectedReason, setSelectedReason] = useState<AnalysisReasonType>('ALL_OVERVIEW');
  const [selectedRegion, setSelectedRegion] = useState<AviationZone | 'GLOBAL'>('GLOBAL');
  const [selectedCategory, setSelectedCategory] = useState<TransactionReasonCategory>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1 year');
  const [currency, setCurrency] = useState<CurrencyType>('USD');

  // Search filter for ledger entries
  const [searchLedger, setSearchLedger] = useState<string>('');

  // Applied state feedback
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Active Metric Object based on Region
  const activeMetric: RegionalFinancialMetric = useMemo(() => {
    if (selectedRegion === 'GLOBAL') {
      return GLOBAL_CONSOLIDATED_METRIC;
    }
    return REGIONAL_FINANCIAL_METRICS[selectedRegion];
  }, [selectedRegion]);

  // Multiplier for fiscal period: 1, 3, Half year, 1 year, 3 year
  const activePeriodObj = useMemo(() => {
    return PERIOD_OPTIONS.find((p) => p.id === selectedPeriod) || PERIOD_OPTIONS[3];
  }, [selectedPeriod]);

  const periodMultiplier = activePeriodObj.multiplier;

  // Scaled Active Metric based on Fiscal Period
  const scaledMetric = useMemo(() => {
    return {
      ...activeMetric,
      turnover: activeMetric.turnover * periodMultiplier,
      salesFlow: activeMetric.salesFlow * periodMultiplier,
      expenditure: activeMetric.expenditure * periodMultiplier,
      netCashFlow: activeMetric.netCashFlow * periodMultiplier,
    };
  }, [activeMetric, periodMultiplier]);

  const scaledCashFlowStages = useMemo(() => {
    return activeMetric.cashFlowStages.map((stage) => ({
      ...stage,
      amount: stage.amount * periodMultiplier,
    }));
  }, [activeMetric.cashFlowStages, periodMultiplier]);

  // Format currency helper
  const formatMoney = (val: number): string => {
    const rate = CURRENCY_RATES[currency].rate;
    const sym = CURRENCY_RATES[currency].symbol;
    const converted = val * rate;

    const isNegative = converted < 0;
    const absVal = Math.abs(converted);
    const prefix = isNegative ? '-' : '';

    if (absVal >= 1_000_000) {
      return `${prefix}${sym}${(absVal / 1_000_000).toFixed(2)}M`;
    }
    if (absVal >= 1_000) {
      return `${prefix}${sym}${(absVal / 1_000).toFixed(0)}K`;
    }
    return `${prefix}${sym}${absVal.toFixed(0)}`;
  };

  // Color style object for active metric net outcome
  const activeProfitColor = useMemo(() => {
    return getProfitLossColorStyle(activeMetric.profitMargin);
  }, [activeMetric.profitMargin]);

  // Filtered Ledger Transactions based on Dropbox filters & search query
  const filteredTransactions = useMemo(() => {
    return REGIONAL_LEDGER_TRANSACTIONS.filter((txn) => {
      // Region filter
      if (selectedRegion !== 'GLOBAL' && txn.zone !== selectedRegion) {
        return false;
      }
      // Reason category filter
      if (selectedCategory !== 'ALL' && txn.reasonCategory !== selectedCategory) {
        return false;
      }
      // High-level reason filter mapping
      if (selectedReason === 'SALES_FLOW' && txn.amount < 0) {
        return false;
      }
      if (selectedReason === 'EXPENDITURES' && txn.amount > 0) {
        return false;
      }
      // Search query filter
      if (searchLedger.trim() !== '') {
        const q = searchLedger.toLowerCase();
        const matchesText = txn.reasonText.toLowerCase().includes(q);
        const matchesOp = txn.operatorName?.toLowerCase().includes(q) || false;
        const matchesRef = txn.referenceDoc?.toLowerCase().includes(q) || false;
        const matchesDept = txn.department.toLowerCase().includes(q);
        if (!matchesText && !matchesOp && !matchesRef && !matchesDept) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRegion, selectedCategory, selectedReason, searchLedger]);

  // Maximum bar value for graphs scaled by period
  const maxBarValue = useMemo(() => {
    return Math.max(
      ...ZONES_ORDER.map((z) =>
        Math.max(
          REGIONAL_FINANCIAL_METRICS[z].salesFlow * periodMultiplier,
          REGIONAL_FINANCIAL_METRICS[z].expenditure * periodMultiplier
        )
      ),
      1
    );
  }, [periodMultiplier]);

  const handleResetFilters = () => {
    setSelectedReason('ALL_OVERVIEW');
    setSelectedRegion('GLOBAL');
    setSelectedCategory('ALL');
    setSelectedPeriod('1 year');
    setSearchLedger('');
  };

  const handleExportData = () => {
    setExportNotice(
      `Financial report exported: [Reason: ${selectedReason}] [Period: ${selectedPeriod}] [Region: ${selectedRegion}] (${filteredTransactions.length} items). Download initiated.`
    );
    setTimeout(() => setExportNotice(null), 4000);
  };

  const getPriorityBadge = (priority: RegionalFocusPriority) => {
    switch (priority) {
      case 'GROWTH_DRIVER':
        return {
          label: 'Primary Growth Driver',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'PROFIT_ENGINE':
        return {
          label: 'High-Yield Profit Engine',
          bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        };
      case 'COST_OPTIMIZE':
        return {
          label: 'OpEx Optimization Focus',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'CAPITAL_INTENSIVE':
        return {
          label: 'Capital Expansion Required',
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      case 'CRITICAL_ATTENTION':
        return {
          label: 'Deficit / Needs Immediate Attention',
          bg: 'bg-red-500/20 text-red-300 border-red-500/40',
        };
      default:
        return {
          label: 'Steady Performer',
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & ACCESSIBILITY CONTROLS                                     */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-sky-400" />
              <span>Financial &amp; Regional Cash Flow Hub</span>
            </span>
            <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
              Clean Query Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Select an analysis reason and fiscal period below to immediately filter financial data, OpEx allocations, regional margins, and operational ledgers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Currency Dropdown Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 shadow-inner">
            <span className="text-[11px] text-slate-400 mr-2 font-semibold">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyType)}
              className="bg-transparent text-amber-300 font-bold text-xs outline-none cursor-pointer"
            >
              {Object.entries(CURRENCY_RATES).map(([code, c]) => (
                <option key={code} value={code} className="bg-slate-900 text-white">
                  {code} ({c.symbol.trim()})
                </option>
              ))}
            </select>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportData}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700 shadow-sm"
            title="Export filtered records to CSV & PDF"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. THE DROPBOX FILTER CONTROLS BAR (Requested by User)                     */}
      {/* "make it more simple and easy like providing an dropbox where we can       */}
      {/* select like reason and get all the data by applying the required filters"  */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Dropbox Query Filter &amp; View Selector
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {(selectedReason !== 'ALL_OVERVIEW' ||
              selectedRegion !== 'GLOBAL' ||
              selectedCategory !== 'ALL' ||
              selectedPeriod !== '1 year' ||
              searchLedger) && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1 cursor-pointer transition-colors px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Clean Dropboxes in a Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* DROPBOX 1: Select Reason / Analysis Purpose */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center space-x-1.5">
              <span>🎯</span>
              <span>1. Select Reason / View</span>
            </label>
            <div className="relative">
              <select
                id="dropbox-select-reason"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value as AnalysisReasonType)}
                className="w-full bg-slate-950 border border-sky-500/60 hover:border-sky-400 rounded-xl px-3 py-2.5 text-sky-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer transition-all shadow-inner"
              >
                {REASON_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white font-normal py-1">
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {REASON_OPTIONS.find((r) => r.id === selectedReason)?.description}
            </p>
          </div>

          {/* DROPBOX 2: Fiscal Period Dropdown (Strictly as requested) */}
          {/* "Under the fiscal period Option should be given as 1,3, Half year, 1 year and 3 year." */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center space-x-1.5">
              <span>📅</span>
              <span>2. Fiscal Period</span>
            </label>
            <div className="relative">
              <select
                id="dropbox-select-period"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-xl px-3 py-2.5 text-amber-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all shadow-inner"
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white font-medium py-1">
                    {p.id} &mdash; {p.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {activePeriodObj.description}
            </p>
          </div>

          {/* DROPBOX 3: Region / Territory Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center space-x-1.5">
              <span>🌐</span>
              <span>3. Region / Territory</span>
            </label>
            <div className="relative">
              <select
                id="dropbox-select-region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as AviationZone | 'GLOBAL')}
                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all shadow-inner"
              >
                {REGION_OPTIONS.map((rg) => (
                  <option key={rg.code} value={rg.code} className="bg-slate-900 text-white py-1">
                    {rg.flag} {rg.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Target territory: <strong className="text-slate-200">{activeMetric.zoneName.split('(')[0].trim()}</strong>
            </p>
          </div>

          {/* DROPBOX 4: Activity / Cost Reason Filter */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center space-x-1.5">
              <span>🏷️</span>
              <span>4. Activity / Cost Reason</span>
            </label>
            <div className="relative">
              <select
                id="dropbox-select-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TransactionReasonCategory)}
                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-500 rounded-xl px-3 py-2.5 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer transition-all shadow-inner"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white py-1">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Filters line-item ledger records
            </p>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-300">Active Query Filter:</span>
            <span className="px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30">
              Reason: {REASON_OPTIONS.find((r) => r.id === selectedReason)?.label.split('(')[0].trim()}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
              Period: {selectedPeriod}
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30">
              Region: {selectedRegion}
            </span>
            {selectedCategory !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-medium border border-purple-500/30">
                Reason: {CATEGORY_OPTIONS.find((c) => c.id === selectedCategory)?.label}
              </span>
            )}
          </div>

          <div className="font-mono text-emerald-400 font-bold flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{filteredTransactions.length} Ledger Records Matched</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 CHROMATIC COLOR SPECTRUM GUIDE (Requirement 3)                       */}
      {/* "Change the color combination between the income and expenses             */}
      {/* where income should be one color loses should be in red and slowly as it  */}
      {/* turns towards the profits it should slowly change the color to green"     */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white">Color Architecture &amp; Yield Spectrum:</span>
            <span className="text-slate-400">Income is Sapphire Blue; Net Yield transitions Red &rarr; Green</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block shadow-sm" />
              <span className="text-sky-300 font-bold">Income (Unified Blue)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block shadow-sm" />
              <span className="text-rose-300 font-bold">Expenses (Rose Outflow)</span>
            </div>
          </div>
        </div>

        {/* Visual Spectrum Bar with Current Pointer */}
        <div className="space-y-1.5">
          <div className="relative w-full h-3 rounded-full bg-slate-950 p-0.5 border border-slate-800 overflow-hidden shadow-inner">
            {/* The Continuous Chromatic Gradient: Red -> Orange -> Amber -> Lime -> Green */}
            <div className="w-full h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 via-amber-400 via-lime-400 via-green-500 to-emerald-400" />
          </div>

          {/* Spectrum Markers & Labels */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
            <span className="text-red-400 font-bold flex items-center space-x-1">
              <span>●</span>
              <span>Loss (&lt;0%)</span>
            </span>
            <span className="text-orange-400 font-semibold flex items-center space-x-1">
              <span>●</span>
              <span>Breakeven (0-5%)</span>
            </span>
            <span className="text-amber-400 font-semibold flex items-center space-x-1">
              <span>●</span>
              <span>Modest (5-14%)</span>
            </span>
            <span className="text-lime-400 font-semibold flex items-center space-x-1">
              <span>●</span>
              <span>Healthy (15-22%)</span>
            </span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span>●</span>
              <span>High Profit (25%+)</span>
            </span>
          </div>
        </div>

        {/* Current Zone Yield Indicator Badge */}
        <div className="pt-1 flex flex-wrap items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Current Query Territory Yield:</span>
            <strong className="text-white font-bold">{activeMetric.zoneName.split('(')[0].trim()}</strong>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${activeProfitColor.badge}`}>
              Margin: {activeMetric.profitMargin > 0 ? '+' : ''}{activeMetric.profitMargin}% &bull; {activeProfitColor.label}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            {activeMetric.profitMargin < 0 ? (
              <span className="text-red-400 font-semibold">Deficit phase &mdash; cost containment in progress</span>
            ) : activeMetric.profitMargin <= 5 ? (
              <span className="text-orange-400 font-semibold">Near breakeven &mdash; shifting into profitability</span>
            ) : (
              <span className="text-emerald-400 font-semibold">Generating liquid surplus reserves</span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC METRIC KPI CARDS (Consolidated based on selected filters)       */}
      {/* Income is signature Sapphire Blue, Net Cash Flow transitions Red -> Green  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Gross Turnover (Income) */}
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-sky-400" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">Gross Turnover (Income)</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatMoney(scaledMetric.turnover)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Period: {selectedPeriod}</span>
            <span className="text-sky-400 font-semibold font-mono">+{activeMetric.growthRate}% YoY</span>
          </div>
        </div>

        {/* Metric 2: Sales Inflow (Income - Signature Sapphire Blue) */}
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-sky-500" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">Sales Inflow (Income)</span>
            <ArrowUpRight className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {formatMoney(scaledMetric.salesFlow)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Charter, MRO &amp; Academy</span>
            <span className="text-sky-400 font-semibold">Active Inflow</span>
          </div>
        </div>

        {/* Metric 3: Total Expenditure (Expenses - Dark Coral / Rose) */}
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">Expenditure (Expenses)</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">
            {formatMoney(scaledMetric.expenditure)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Fuel, Apron, MRO &amp; Payouts</span>
            <span className="text-rose-400 font-semibold font-mono">
              {((scaledMetric.expenditure / (scaledMetric.salesFlow || 1)) * 100).toFixed(0)}% of Sales
            </span>
          </div>
        </div>

        {/* Metric 4: Net Cash Flow (Dynamic Color: Red for Loss -> Green for Profit) */}
        <div className={`bg-slate-900 border p-4 sm:p-5 rounded-2xl shadow-lg relative overflow-hidden group ${activeProfitColor.border}`}>
          <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${activeProfitColor.gradient}`} />
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeProfitColor.text}`}>
              {scaledMetric.netCashFlow < 0 ? 'Net Deficit (Loss)' : 'Net Retained Profit'}
            </span>
            <Coins className={`w-4 h-4 ${activeProfitColor.text}`} />
          </div>
          <div className={`text-2xl font-black font-mono ${activeProfitColor.text}`}>
            {scaledMetric.netCashFlow > 0 ? '+' : ''}
            {formatMoney(scaledMetric.netCashFlow)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Margin Yield:</span>
            <span className={`font-bold font-mono px-1.5 py-0.2 rounded text-[10px] ${activeProfitColor.badge}`}>
              {activeMetric.profitMargin > 0 ? '+' : ''}{activeMetric.profitMargin}%
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DYNAMIC TARGETED DATA DISPLAY (Strictly driven by Reason Dropbox)       */}
      {/* Prevents visual overload by displaying only what the user selected.        */}
      {/* ========================================================================= */}

      {/* VIEW 1: OVERVIEW & CASH FLOW WATERFALL */}
      {selectedReason === 'ALL_OVERVIEW' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>🌊</span>
                <span>Cash Flow Waterfall Movement ({activeMetric.zoneName.split('(')[0].trim()})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Fund movement from Gross Income through operational expenditure stages to final net yield.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border self-start sm:self-auto ${activeProfitColor.badge}`}>
              Net Yield: {scaledMetric.netCashFlow > 0 ? '+' : ''}{formatMoney(scaledMetric.netCashFlow)} ({activeMetric.profitMargin}%)
            </span>
          </div>

          {/* Clean Waterfall Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
            {scaledCashFlowStages.map((stage, sIdx) => {
              const isInflow = stage.type === 'inflow';
              const isNet = stage.type === 'net';

              return (
                <div
                  key={sIdx}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    isNet
                      ? `bg-slate-950 ${activeProfitColor.border} shadow-lg ring-1 ${activeProfitColor.bg}`
                      : isInflow
                      ? 'bg-gradient-to-br from-sky-500/10 via-slate-900 to-slate-950 border-sky-500/40'
                      : 'bg-gradient-to-br from-rose-500/10 via-slate-900 to-slate-950 border-rose-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-mono text-slate-400">Step 0{sIdx + 1}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          isNet
                            ? activeProfitColor.badge
                            : isInflow
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {stage.type === 'inflow' ? 'Income' : stage.type === 'net' ? 'Net Outcome' : 'Expense'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug mb-1">{stage.stage}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-800/80">
                    <div
                      className={`text-base font-black font-mono ${
                        isNet
                          ? activeProfitColor.text
                          : isInflow
                          ? 'text-sky-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {stage.amount > 0 ? '+' : ''}
                      {formatMoney(stage.amount)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strategic Executive Takeaway */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Executive Treasury Guidance for {selectedRegion} (Period: {selectedPeriod}):</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{activeMetric.strategicRecommendation}</p>
          </div>
        </div>
      )}

      {/* VIEW 2: REGIONAL COMPARATIVE GRAPH (APAC vs ANZ vs LATAM vs others) */}
      {(selectedReason === 'REGIONAL_FLOW' || selectedReason === 'ALL_OVERVIEW') && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>📊</span>
                <span>Regional Comparison: Income vs. Expenses &amp; Yield Spectrum</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Notice how losses (e.g. LATAM) are displayed in red, and slowly change into green as margin turns profitable (CIS &rarr; EMEA &rarr; NA &rarr; APAC &rarr; ANZ).
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-3 text-xs font-medium bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-400 inline-block" />
                <span className="text-sky-300 font-bold">Income</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                <span className="text-rose-300 font-bold">Expenses</span>
              </div>
            </div>
          </div>

          {/* Comparative Columns Graph */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-2">
            {ZONES_ORDER.map((z) => {
              const m = REGIONAL_FINANCIAL_METRICS[z];
              const isSelected = selectedRegion === z;
              const scaledSales = m.salesFlow * periodMultiplier;
              const scaledExp = m.expenditure * periodMultiplier;
              const scaledNet = m.netCashFlow * periodMultiplier;
              const salesHeight = Math.max(22, Math.round((scaledSales / maxBarValue) * 140));
              const expHeight = Math.max(22, Math.round((scaledExp / maxBarValue) * 140));

              // Zone color according to Red -> Green spectrum
              const zoneColor = getProfitLossColorStyle(m.profitMargin);

              return (
                <div
                  key={z}
                  onClick={() => setSelectedRegion(z)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-850 border-sky-400 shadow-lg ring-2 ring-sky-400/40'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Bars Container */}
                  <div className="h-44 flex items-end justify-center space-x-3 pb-2 border-b border-slate-800/80">
                    {/* Income Bar (Signature Sapphire Blue) */}
                    <div className="w-6 flex flex-col items-center justify-end h-full">
                      <span className="text-[9px] font-mono text-sky-400 font-bold mb-1">
                        {formatMoney(scaledSales)}
                      </span>
                      <div
                        style={{ height: `${salesHeight}px` }}
                        className="w-full bg-gradient-to-t from-blue-700 via-sky-600 to-sky-400 rounded-t-md shadow-sm"
                        title={`Income: ${formatMoney(scaledSales)}`}
                      />
                    </div>

                    {/* Expense Bar (Rose Outflow) */}
                    <div className="w-6 flex flex-col items-center justify-end h-full">
                      <span className="text-[9px] font-mono text-rose-400 font-bold mb-1">
                        {formatMoney(scaledExp)}
                      </span>
                      <div
                        style={{ height: `${expHeight}px` }}
                        className="w-full bg-gradient-to-t from-rose-700 via-rose-600 to-rose-400 rounded-t-md shadow-sm"
                        title={`Expenses: ${formatMoney(scaledExp)}`}
                      />
                    </div>
                  </div>

                  {/* Zone Label & Margin */}
                  <div className="pt-2 text-center space-y-1">
                    <div className="font-bold text-white text-xs flex items-center justify-center space-x-1">
                      <span>{m.flag}</span>
                      <span>{z}</span>
                    </div>

                    {/* Net outcome rendered in its interpolated Red -> Green color */}
                    <div className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${zoneColor.badge}`}>
                      Net: {scaledNet > 0 ? '+' : ''}{formatMoney(scaledNet)}
                    </div>
                    <div className={`text-[9px] font-semibold ${zoneColor.text}`}>
                      {m.profitMargin > 0 ? '+' : ''}{m.profitMargin}% &bull; {zoneColor.status === 'LOSS' ? 'Loss' : 'Profit'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: SALES FLOW & REVENUE CHANNELS (Income - Signature Sapphire Blue) */}
      {selectedReason === 'SALES_FLOW' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>📈</span>
                <span className="text-sky-300">Sales Inflow &amp; Revenue Channels (Income Unified)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All income streams rendered in signature Sapphire Blue for {activeMetric.zoneName.split('(')[0].trim()}.
              </p>
            </div>
            <div className="text-sky-400 font-mono font-bold text-sm bg-sky-500/10 px-3 py-1.5 rounded-xl border border-sky-500/30">
              Total Income: {formatMoney(scaledMetric.salesFlow)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {Object.entries(activeMetric.salesBreakdown).map(([channel, amount]) => {
              const scaledAmount = amount * periodMultiplier;
              const pct = ((scaledAmount / (scaledMetric.salesFlow || 1)) * 100).toFixed(1);
              const channelNames: Record<string, string> = {
                charterSales: 'Executive Air Charter & VIP Flights',
                mroMaintenance: 'Part-145 Maintenance & Avionics',
                flightAcademies: 'Pilot Training & Cadet Academies',
                sparesRotables: 'Aircraft Spares & Rotables Supply',
                fboGroundHandling: 'FBO Ground & Apron Services',
              };

              return (
                <div key={channel} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{channelNames[channel] || channel}</span>
                    <span className="font-mono text-sky-400 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-sky-400 rounded-full"
                    />
                  </div>
                  <div className="text-sm font-bold font-mono text-white">
                    {formatMoney(scaledAmount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: EXPENDITURES & COST ALLOCATION (Expenses - Rose Outflow) */}
      {selectedReason === 'EXPENDITURES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>📉</span>
                <span className="text-rose-300">Operational Expenditures &amp; Cost Drivers (Expenses)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of operating costs across Jet A-1 fuel, leasing, certifications, and broker commissions.
              </p>
            </div>
            <div className="text-rose-400 font-mono font-bold text-sm bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30">
              Total Expenses: {formatMoney(scaledMetric.expenditure)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {Object.entries(activeMetric.expenditureBreakdown).map(([category, amount]) => {
              const scaledAmount = amount * periodMultiplier;
              const pct = ((scaledAmount / (scaledMetric.expenditure || 1)) * 100).toFixed(1);
              const catNames: Record<string, string> = {
                hangarFuel: 'Jet A-1 Fuel Procurement & Bunkering',
                airsideLeasing: 'Airside Hangar & Apron Tie-Down Leases',
                part145Certifications: 'Part-145 Tooling & Regulatory Audits',
                commissionsPayouts: 'Broker Commissions & Partner Settlements',
                platformLogistics: 'Platform Cloud Ops & Data Infrastructure',
              };

              return (
                <div key={category} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{catNames[category] || category}</span>
                    <span className="font-mono text-rose-400 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-full"
                    />
                  </div>
                  <div className="text-sm font-bold font-mono text-white">
                    {formatMoney(scaledAmount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 5: DEPARTMENT STRATEGIC FOCUS */}
      {selectedReason === 'DEPARTMENT_FOCUS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>🎯</span>
                <span>Department Strategic Focus Matrix: Capital Allocation &amp; Priorities</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Helps the finance and admin departments identify exactly where capital, auditing, and operational focus must be applied.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Department Decision Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {ZONES_ORDER.map((z) => {
              const m = REGIONAL_FINANCIAL_METRICS[z];
              const badge = getPriorityBadge(m.focusPriority);
              const zoneColor = getProfitLossColorStyle(m.profitMargin);

              return (
                <div
                  key={z}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm flex items-center space-x-1.5">
                        <span>{m.flag}</span>
                        <span>{m.zoneName.split('(')[0].trim()}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono">
                      <span className="text-slate-400">Margin Status:</span>
                      <span className={`font-bold text-xs ${zoneColor.text}`}>
                        {m.profitMargin > 0 ? '+' : ''}{m.profitMargin}% ({zoneColor.name.split('(')[0].trim()})
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {m.strategicRecommendation}
                    </p>
                  </div>

                  {/* Immediate Action Items */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Required Action Steps:
                    </span>
                    <ul className="space-y-1">
                      {m.actionItems.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 6: SEARCHABLE FILTERED LEDGER TRANSACTIONS */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-sky-400" />
              <span>Operational Ledger Journal: Filtered by Reason &amp; Region</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live line-item records matching your dropdown filters ({filteredTransactions.length} items found).
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Search Input for Transactions */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reason, partner, doc..."
                value={searchLedger}
                onChange={(e) => setSearchLedger(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* The Clean Filtered Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Txn ID / Date</th>
                <th className="py-3 px-3">Region</th>
                <th className="py-3 px-4">Transaction Reason &amp; Purpose</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-4 text-right">Amount (Income vs Expense)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic text-xs">
                    No ledger records match the selected Reason &amp; Region filters. Try selecting &ldquo;All Reasons&rdquo; or &ldquo;Global&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isInflow = txn.amount > 0;

                  return (
                    <tr key={txn.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400">
                        <div className="text-white font-bold">{txn.id}</div>
                        <div className="text-[10px] text-slate-500">{txn.date}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {txn.zone}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{txn.reasonText}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>Operator: <strong className="text-slate-300">{txn.operatorName || 'Verified Aviator'}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-sky-300/80">{txn.referenceDoc}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {txn.department}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        {/* Income is signature Sapphire Blue (text-sky-400), Expenses in Rose (text-rose-400) */}
                        <span className={isInflow ? 'text-sky-400' : 'text-rose-400'}>
                          {isInflow ? '+' : ''}
                          {formatMoney(txn.amount)}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            txn.status === 'SETTLED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : txn.status === 'AUDITED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : txn.status === 'VERIFIED'
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

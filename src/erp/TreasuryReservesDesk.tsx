import React, { useState } from 'react';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  DollarSign,
  Building,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminUser, RegularUser } from '../types';

interface TreasuryReservesDeskProps {
  currentUser?: RegularUser | null;
  activeAdminUser?: AdminUser | null;
  onRefreshData?: () => void;
  onReturnToDashboard?: () => void;
}

interface TreasuryLedgerEntry {
  id: string;
  timestamp: string;
  type: 'ESCROW_LOCK' | 'ESCROW_RELEASE' | 'DISBURSAL' | 'TOPUP' | 'FEE_SWEEP' | 'REFUND';
  amount: number;
  entityName: string;
  referenceId: string;
  status: 'COMPLETED' | 'HELD_IN_ESCROW' | 'PROCESSING';
  notes: string;
}

export const TreasuryReservesDesk: React.FC<TreasuryReservesDeskProps> = ({
  currentUser,
  activeAdminUser,
  onRefreshData,
  onReturnToDashboard,
}) => {
  const isSuperAdmin = Boolean(
    currentUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    activeAdminUser?.email?.toLowerCase() === 'aditya@yarifly.com'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Treasury State
  const [reserveCap, setReserveCap] = useState(1500000);
  const [lockedEscrow, setLockedEscrow] = useState(385000);
  const [liquidBuffer, setLiquidBuffer] = useState(1115000);
  const [dailyDisbursalLimit, setDailyDisbursalLimit] = useState(250000);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState<number>(50000);
  const [adjustAction, setAdjustAction] = useState<'INJECT_LIQUIDITY' | 'EXPAND_CAP' | 'SETTLE_ESCROW'>('INJECT_LIQUIDITY');

  // Ledger entries
  const [ledgerEntries, setLedgerEntries] = useState<TreasuryLedgerEntry[]>([
    {
      id: 'TRX-9481',
      timestamp: 'Just now (Live)',
      type: 'ESCROW_LOCK',
      amount: 45000,
      entityName: 'JetSet Fleet Operations Ltd.',
      referenceId: 'ESC-44021',
      status: 'HELD_IN_ESCROW',
      notes: 'Charter booking #BK-8821 collateral lock (safe custody)',
    },
    {
      id: 'TRX-9480',
      timestamp: '2 hours ago',
      type: 'DISBURSAL',
      amount: 120000,
      entityName: 'AeroCrest MRO Hangars',
      referenceId: 'DISB-9901',
      status: 'COMPLETED',
      notes: 'Scheduled milestone release for inspected turbine overhaul',
    },
    {
      id: 'TRX-9479',
      timestamp: '5 hours ago',
      type: 'TOPUP',
      amount: 250000,
      entityName: 'Corporate Treasury Sweep (HDFC Axis Vault)',
      referenceId: 'SWP-0012',
      status: 'COMPLETED',
      notes: 'Automated statutory liquidity buffer replenishment',
    },
    {
      id: 'TRX-9478',
      timestamp: 'Yesterday at 18:20',
      type: 'FEE_SWEEP',
      amount: 14500,
      entityName: 'Yarifly Protocol Clearing Engine',
      referenceId: 'FEE-3310',
      status: 'COMPLETED',
      notes: 'Platform facilitation & DGCA compliance stamp fees',
    },
    {
      id: 'TRX-9477',
      timestamp: 'Yesterday at 14:05',
      type: 'ESCROW_RELEASE',
      amount: 88000,
      entityName: 'Skyline Avionics Corp',
      referenceId: 'REL-7712',
      status: 'COMPLETED',
      notes: 'Dual biometric signature clearance completed',
    },
    {
      id: 'TRX-9476',
      timestamp: '03 Nov 2026',
      type: 'REFUND',
      amount: 32000,
      entityName: 'Horizon Wings Aviation',
      referenceId: 'RFD-1092',
      status: 'COMPLETED',
      notes: 'Customer cancellation within 2-hour fee-free grace window',
    },
  ]);

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustAmount <= 0) return;

    if (adjustAction === 'INJECT_LIQUIDITY') {
      setLiquidBuffer((prev) => prev + adjustAmount);
      setReserveCap((prev) => prev + adjustAmount);
      setLedgerEntries((prev) => [
        {
          id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: 'Just now',
          type: 'TOPUP',
          amount: adjustAmount,
          entityName: 'Central Reserve Vault',
          referenceId: `INJ-${Date.now().toString().slice(-4)}`,
          status: 'COMPLETED',
          notes: 'Direct capital injection to statutory liquid reserve buffer',
        },
        ...prev,
      ]);
      setSuccessToast(`Successfully injected ₹${adjustAmount.toLocaleString('en-IN')} into Liquid Reserve Buffer.`);
    } else if (adjustAction === 'EXPAND_CAP') {
      setReserveCap((prev) => prev + adjustAmount);
      setSuccessToast(`Statutory Reserve Ceiling expanded by ₹${adjustAmount.toLocaleString('en-IN')}.`);
    } else if (adjustAction === 'SETTLE_ESCROW') {
      if (adjustAmount > lockedEscrow) {
        alert('Settlement amount exceeds currently locked escrow pool!');
        return;
      }
      setLockedEscrow((prev) => Math.max(0, prev - adjustAmount));
      setLiquidBuffer((prev) => prev + adjustAmount);
      setLedgerEntries((prev) => [
        {
          id: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: 'Just now',
          type: 'ESCROW_RELEASE',
          amount: adjustAmount,
          entityName: 'Vendor Settlement Pool',
          referenceId: `REL-${Date.now().toString().slice(-4)}`,
          status: 'COMPLETED',
          notes: 'Manual administrative release of audited escrow funds to liquidity pool',
        },
        ...prev,
      ]);
      setSuccessToast(`Successfully released ₹${adjustAmount.toLocaleString('en-IN')} from Escrow into liquid pool.`);
    }

    setShowAdjustModal(false);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Timestamp', 'Type', 'Amount (INR)', 'Entity / Counterparty', 'Reference ID', 'Status', 'Audit Notes'];
    const rows = filteredEntries.map((e) => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.type}"`,
      `"${e.amount}"`,
      `"${e.entityName}"`,
      `"${e.referenceId}"`,
      `"${e.status}"`,
      `"${e.notes.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `truvaer_treasury_reserves_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredEntries = ledgerEntries.filter((entry) => {
    const matchesSearch =
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || entry.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                <Landmark className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Treasury &amp; Reserves Management Desk
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Statutory 100% Backed</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Central Aviation Escrow Custody, Corporate Liquidity Safeguards, RBI Compliant Merchant Settlement Vaults, and Live Ledger Governance.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
            {isSuperAdmin ? (
              <button
                type="button"
                onClick={() => setShowAdjustModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Adjust Reserves &amp; Liquidity</span>
              </button>
            ) : (
              <div
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs font-semibold flex items-center space-x-1.5"
                title="Reserve adjustments strictly restricted to Sovereign Super Admin"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Adjustments: Super Admin Only</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Download verified Treasury ledger as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          {/* Card 1: Total Reserve Cap */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="uppercase font-mono text-[10px] font-bold tracking-wider">Total Reserve Cap</span>
              <Building className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              ₹{reserveCap.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Statutory Clearance</span>
            </div>
          </div>

          {/* Card 2: Locked Escrow Pool */}
          <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="uppercase font-mono text-[10px] font-bold tracking-wider">Locked Escrow Pool</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
              ₹{lockedEscrow.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Active deal collateral &amp; bookings
            </div>
          </div>

          {/* Card 3: Liquid Reserve Buffer */}
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="uppercase font-mono text-[10px] font-bold tracking-wider">Liquid Buffer</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              ₹{liquidBuffer.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
              <span>Unencumbered solvency</span>
            </div>
          </div>

          {/* Card 4: Daily Disbursal Vault */}
          <div className="bg-slate-950/70 border border-sky-500/30 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="uppercase font-mono text-[10px] font-bold tracking-wider">Daily Payout Limit</span>
              <CreditCard className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-300 font-mono mt-1">
              ₹{dailyDisbursalLimit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-sky-400 mt-1">
              RTGS / IMPS auto-settlement tier
            </div>
          </div>
        </div>
      </div>

      {/* Ledger & Transaction Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Real-Time Escrow &amp; Treasury Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audited transaction receipts with immutable SHA256 reference hashes
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tx ID, Entity..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-amber-500 outline-none w-48 sm:w-60"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="ESCROW_LOCK">Escrow Lock</option>
              <option value="ESCROW_RELEASE">Escrow Release</option>
              <option value="DISBURSAL">Disbursal</option>
              <option value="TOPUP">Top-up / Injection</option>
              <option value="FEE_SWEEP">Fee Sweep</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tx ID &amp; Ref</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Entity / Counterparty</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Audit Note</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No transactions matching your query criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      <div>{row.id}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{row.referenceId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                          row.type === 'ESCROW_LOCK'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : row.type === 'ESCROW_RELEASE'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : row.type === 'DISBURSAL'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : row.type === 'TOPUP'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : row.type === 'REFUND'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {row.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {row.entityName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      <span className={row.type === 'TOPUP' ? 'text-emerald-400' : row.type === 'REFUND' ? 'text-rose-400' : 'text-white'}>
                        {row.type === 'TOPUP' ? '+' : '-'}₹{row.amount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : row.status === 'HELD_IN_ESCROW'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-sky-500/10 text-sky-300'
                        }`}
                      >
                        {row.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-amber-400" />
                        )}
                        <span>{row.status.replace(/_/g, ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                      {row.notes}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-[11px] font-mono">
                      {row.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal - Restricted Strictly to Super Admin */}
      {isSuperAdmin && showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Adjust Treasury &amp; Reserves</h4>
                  <p className="text-[11px] text-slate-400 font-mono">Aviation Escrow &amp; Liquidity Vault</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase font-mono text-[10px]">
                  Adjustment Operation
                </label>
                <select
                  value={adjustAction}
                  onChange={(e) => setAdjustAction(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="INJECT_LIQUIDITY">Inject Capital to Liquid Buffer</option>
                  <option value="EXPAND_CAP">Expand Statutory Reserve Cap Ceiling</option>
                  <option value="SETTLE_ESCROW">Release Audited Escrow into Liquidity</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase font-mono text-[10px]">
                  Amount (INR ₹)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Statutory Compliance Policy:</span>
                </div>
                <p className="text-slate-300">
                  All adjustments are registered on the immutable corporate audit trail and require dual biometric sovereign signing when exceeding ₹5,00,000 INR.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors cursor-pointer shadow-md"
                >
                  Authorize Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

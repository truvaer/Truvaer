import React, { useMemo } from 'react';
import {
  Calculator,
  ShieldCheck,
  Lock,
  Layers,
  Coins,
  CheckCircle2,
  FileText,
  TrendingUp,
  Info,
  Sliders,
  DollarSign,
  Globe,
  Radio,
  Eye,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminUser } from '../types';

interface CreditTransparencyViewProps {
  activeAdminUser?: AdminUser | null;
}

export const CreditTransparencyView: React.FC<CreditTransparencyViewProps> = ({
  activeAdminUser,
}) => {
  const formulas = useMemo(() => db.getCreditCalculationFormulas(), []);
  const pricingItems = useMemo(() => db.getPricingMatrix(), []);

  const actorLevel = activeAdminUser?.level ?? 1;
  const isSuperAdmin = activeAdminUser?.role === 'SUPER_ADMIN' || actorLevel >= 8;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">
              Credit Transparency &amp; Ledger Logic Dashboard
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Read-Only Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical debit formulas, scope multipliers, and double-entry ledger calculation rules verified across all portals.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Actor Level: <strong className="text-white">L{actorLevel}</strong> ({activeAdminUser?.role || 'ADMIN'})</span>
        </div>
      </div>

      {/* Formula Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Widget 1: Campaign Pricing Formula */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
              <MegaphoneIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Campaign Formula</span>
            </span>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
              Condition 4
            </span>
          </div>
          <div className="text-xs font-mono text-amber-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            {formulas.campaign_rules.formula}
          </div>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Base Rate per Day:</span>
              <strong className="text-white font-mono">{formulas.campaign_rules.base_rate_per_day} Credits</strong>
            </div>
            <div className="flex justify-between">
              <span>Audience Gate:</span>
              <span className="text-amber-400 font-bold">Standard Aviators Only</span>
            </div>
            <div className="flex justify-between">
              <span>Duration Bounds:</span>
              <span className="text-slate-300 font-mono">1 to 30 Days</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Scope Multipliers */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scope Multipliers</span>
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
              Target Reach
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            {Object.entries(formulas.campaign_rules.scope_multipliers).map(([scope, mult]) => (
              <div key={scope} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                <span className="text-slate-300 font-medium">{scope}</span>
                <span className="font-mono font-bold text-emerald-400">{mult}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Lead Gen & Flash News Rules */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Lead Rules</span>
            </span>
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
              Boutique &amp; RFQ
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Phone Contact Unlock:</span>
              <strong className="text-white font-mono">{formulas.lead_generation_rules.phone_unlock_fee} Credits</strong>
            </div>
            <div className="flex justify-between">
              <span>Unlock Validity:</span>
              <strong className="text-emerald-400 font-mono">{formulas.lead_generation_rules.validity_days} Days Free Re-view</strong>
            </div>
            <div className="flex justify-between">
              <span>RFQ Quotation Fee:</span>
              <strong className="text-white font-mono">{formulas.lead_generation_rules.rfq_quotation_fee} Credits</strong>
            </div>
            <div className="flex justify-between">
              <span>Flash News Base Fee:</span>
              <strong className="text-white font-mono">{formulas.flash_news_rules.base_fee} Credits</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Security & Audit Guarantee */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">Cryptographic Ledger Double-Entry Guarantee</div>
            <div className="text-[11px] text-slate-400">
              {formulas.ledger_verification} • Every credit transaction is immutably logged with timestamp, balance before, balance after, and actor IP.
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
          ✓ Verified Real-Time
        </span>
      </div>

      {/* Live Matrix Pricing Overview Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-2">
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Active Pricing Matrix Entries ({pricingItems.length} Mappings)</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Portal Location</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Debit Value</th>
                <th className="py-2.5 px-3">Threshold</th>
                <th className="py-2.5 px-3">Calculation Rule</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {pricingItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-white">{item.portal}</td>
                  <td className="py-2.5 px-3 text-sky-400 font-mono">{item.actionType}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                    {item.defaultDebitCredits} Credits
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {item.minimumThreshold} Credits
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400 font-mono">
                    {item.actionType.includes('Campaign')
                      ? 'Duration * Scope Multiplier'
                      : item.actionType.includes('Phone')
                      ? 'Fixed 10 Cr / 30-Day Window'
                      : 'Fixed Transaction Debit'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper icon
function MegaphoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

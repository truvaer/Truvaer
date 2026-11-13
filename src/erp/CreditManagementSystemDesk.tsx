import React, { useState, useMemo } from 'react';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  Building2,
  FileText,
  UserCheck,
  Send,
  AlertCircle,
  BarChart3,
  Layers,
  ChevronRight,
  ExternalLink,
  Ban,
  Activity,
  History,
  Info,
  Calendar,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AdminUser,
  RegularUser,
  CMSCreditAccount,
  CMSAllocationRequest,
  CMSAuditEntry,
  CMSLedgerEntry,
  CMSAgingRecord,
  CMSPromiseToPay,
  BureauRatingTier,
  CreditRiskCategory,
  DunningStage,
} from '../types';

interface CreditManagementSystemDeskProps {
  activeAdminUser?: AdminUser | null;
  currentUser?: RegularUser | null;
  onRefreshAll?: () => void;
}

// Initial baseline mock data for Credit Accounts
const INITIAL_ACCOUNTS: CMSCreditAccount[] = [
  {
    id: 'cms_acc_001',
    business_id: 'biz_corporate_user',
    entity_name: 'Private Air Charter Corp',
    category: 'Private Air Charter',
    department: 'Executive Charters',
    credit_limit: 25000,
    temporary_extension: 5000,
    extension_valid_until: '2026-12-31',
    current_balance: 18450,
    payment_score: 94,
    bureau_rating: 'AAA',
    risk_category: 'LOW_RISK',
    is_frozen: false,
    billing_sync_status: 'SYNCED',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-11-01T14:20:00Z',
  },
  {
    id: 'cms_acc_002',
    business_id: 'biz_aero_mro',
    entity_name: 'AeroTurbine Tech & MRO',
    category: 'MRO & Heavy Maintenance',
    department: 'MRO & Engineering',
    credit_limit: 45000,
    temporary_extension: 0,
    current_balance: 38200,
    payment_score: 82,
    bureau_rating: 'A',
    risk_category: 'MODERATE',
    is_frozen: false,
    billing_sync_status: 'SYNCED',
    created_at: '2026-02-10T11:30:00Z',
    updated_at: '2026-11-05T10:15:00Z',
  },
  {
    id: 'cms_acc_003',
    business_id: 'biz_skywings_cadet',
    entity_name: 'SkyWings Aviation Academy',
    category: 'Pilot Training & Academies',
    department: 'Pilot Academy',
    credit_limit: 15000,
    temporary_extension: 2000,
    extension_valid_until: '2026-11-30',
    current_balance: 13900,
    payment_score: 68,
    bureau_rating: 'BB',
    risk_category: 'ELEVATED',
    is_frozen: false,
    billing_sync_status: 'PENDING',
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-11-08T16:45:00Z',
  },
  {
    id: 'cms_acc_004',
    business_id: 'biz_global_cargo',
    entity_name: 'Atlas Cargo Express Line',
    category: 'Air Cargo & Freight Forwarding',
    department: 'Air Cargo',
    credit_limit: 60000,
    temporary_extension: 10000,
    extension_valid_until: '2026-12-15',
    current_balance: 54100,
    payment_score: 55,
    bureau_rating: 'B',
    risk_category: 'HIGH_EXPOSURE',
    is_frozen: false,
    billing_sync_status: 'SYNCED',
    created_at: '2026-01-20T13:10:00Z',
    updated_at: '2026-11-10T12:00:00Z',
  },
  {
    id: 'cms_acc_005',
    business_id: 'biz_horizon_heli',
    entity_name: 'Horizon Heli-Services Intl',
    category: 'Helicopter Charter & Offshore',
    department: 'Executive Charters',
    credit_limit: 20000,
    temporary_extension: 0,
    current_balance: 19800,
    payment_score: 42,
    bureau_rating: 'DEFAULT_WARNING',
    risk_category: 'CRITICAL',
    is_frozen: true,
    freeze_reason: 'Delinquent balance > 90 days. Overdue threshold breached without payment schedule.',
    billing_sync_status: 'DISPUTED' as any,
    created_at: '2026-02-14T10:00:00Z',
    updated_at: '2026-11-11T18:30:00Z',
  },
];

// Initial baseline mock data for Allocation Requests
const INITIAL_REQUESTS: CMSAllocationRequest[] = [
  {
    id: 'req_001',
    account_id: 'cms_acc_002',
    entity_name: 'AeroTurbine Tech & MRO',
    requested_by: 'MRO Finance Desk',
    current_limit: 45000,
    requested_limit: 55000,
    extension_days: 30,
    justification: 'Expanded CFM56 turbine quick-turn line requires higher inventory credit buffer.',
    status: 'PENDING',
    created_at: '2026-11-11T11:20:00Z',
  },
  {
    id: 'req_002',
    account_id: 'cms_acc_001',
    entity_name: 'Private Air Charter Corp',
    requested_by: 'Treasury Officer',
    current_limit: 25000,
    requested_limit: 30000,
    extension_days: 14,
    justification: 'Peak holiday corporate flight surge on Dubai - London corridor.',
    status: 'APPROVED',
    reviewed_by: 'B Aditya Narayana (L8)',
    reviewed_at: '2026-11-10T15:00:00Z',
    created_at: '2026-11-09T09:15:00Z',
  },
];

// Initial baseline mock data for Aging Records
const INITIAL_AGING: CMSAgingRecord[] = [
  {
    id: 'age_001',
    account_id: 'cms_acc_001',
    entity_name: 'Private Air Charter Corp',
    department: 'Executive Charters',
    bucket_0_30: 15450,
    bucket_31_60: 3000,
    bucket_61_90: 0,
    bucket_90_plus: 0,
    total_overdue: 3000,
    dunning_stage: 'STAGE_1_REMINDER',
    last_dunning_sent: '2026-11-05',
    has_active_promise: false,
  },
  {
    id: 'age_002',
    account_id: 'cms_acc_002',
    entity_name: 'AeroTurbine Tech & MRO',
    department: 'MRO & Engineering',
    bucket_0_30: 32000,
    bucket_31_60: 6200,
    bucket_61_90: 0,
    bucket_90_plus: 0,
    total_overdue: 6200,
    dunning_stage: 'STAGE_1_REMINDER',
    last_dunning_sent: '2026-11-07',
    has_active_promise: true,
  },
  {
    id: 'age_003',
    account_id: 'cms_acc_003',
    entity_name: 'SkyWings Aviation Academy',
    department: 'Pilot Academy',
    bucket_0_30: 8900,
    bucket_31_60: 3000,
    bucket_61_90: 2000,
    bucket_90_plus: 0,
    total_overdue: 5000,
    dunning_stage: 'STAGE_2_URGENT',
    last_dunning_sent: '2026-11-09',
    has_active_promise: false,
  },
  {
    id: 'age_004',
    account_id: 'cms_acc_004',
    entity_name: 'Atlas Cargo Express Line',
    department: 'Air Cargo',
    bucket_0_30: 42100,
    bucket_31_60: 8000,
    bucket_61_90: 4000,
    bucket_90_plus: 0,
    total_overdue: 12000,
    dunning_stage: 'STAGE_2_URGENT',
    last_dunning_sent: '2026-11-10',
    has_active_promise: false,
  },
  {
    id: 'age_005',
    account_id: 'cms_acc_005',
    entity_name: 'Horizon Heli-Services Intl',
    department: 'Executive Charters',
    bucket_0_30: 5000,
    bucket_31_60: 4000,
    bucket_61_90: 5400,
    bucket_90_plus: 5400,
    total_overdue: 14800,
    dunning_stage: 'STAGE_3_FINAL_LEGAL',
    last_dunning_sent: '2026-11-11',
    has_active_promise: false,
  },
];

// Initial baseline mock data for Ledger Entries
const INITIAL_LEDGER: CMSLedgerEntry[] = [
  {
    id: 'led_001',
    date: '2026-11-12 09:30:00',
    reference_id: 'INV-2026-9041',
    account_id: 'cms_acc_001',
    entity_name: 'Private Air Charter Corp',
    entry_type: 'INVOICE',
    amount: 4500,
    running_balance: 18450,
    notes: 'Sponsored Global Flight Corridor Promotion 30 Days',
    settlement_status: 'CLEARED',
  },
  {
    id: 'led_002',
    date: '2026-11-11 16:15:00',
    reference_id: 'PMT-2026-4412',
    account_id: 'cms_acc_002',
    entity_name: 'AeroTurbine Tech & MRO',
    entry_type: 'PAYMENT',
    amount: -12000,
    running_balance: 38200,
    notes: 'Wire settlement via HDFC Escrow account',
    settlement_status: 'CLEARED',
  },
  {
    id: 'led_003',
    date: '2026-11-10 14:00:00',
    reference_id: 'MEMO-2026-008',
    account_id: 'cms_acc_003',
    entity_name: 'SkyWings Aviation Academy',
    entry_type: 'CREDIT_MEMO',
    amount: -1500,
    running_balance: 13900,
    notes: 'Administrative fee concession approved by Treasury Controller',
    settlement_status: 'CLEARED',
  },
  {
    id: 'led_004',
    date: '2026-11-08 11:10:00',
    reference_id: 'DISC-2026-019',
    account_id: 'cms_acc_004',
    entity_name: 'Atlas Cargo Express Line',
    entry_type: 'DISCOUNT',
    amount: -2500,
    running_balance: 54100,
    notes: 'Enterprise high-volume loyalty incentive discount',
    settlement_status: 'CLEARED',
  },
];

// Initial baseline mock data for Audit Entries
const INITIAL_AUDIT: CMSAuditEntry[] = [
  {
    id: 'aud_cms_001',
    timestamp: '2026-11-11 18:30:12 UTC',
    account_id: 'cms_acc_005',
    entity_name: 'Horizon Heli-Services Intl',
    action_type: 'ACCOUNT_FROZEN',
    previous_value: 'ACTIVE (UNFROZEN)',
    new_value: 'HARD FROZEN',
    actor_name: 'B Aditya Narayana',
    actor_role: 'Super Admin (Level 8)',
    reason: 'Critical 90+ days aging threshold breach. Account frozen to prevent further exposure.',
  },
  {
    id: 'aud_cms_002',
    timestamp: '2026-11-10 15:00:04 UTC',
    account_id: 'cms_acc_001',
    entity_name: 'Private Air Charter Corp',
    action_type: 'EXTENSION_GRANTED',
    previous_value: '0 Cr Extension',
    new_value: '+5,000 Cr (14 Days)',
    actor_name: 'B Aditya Narayana',
    actor_role: 'Super Admin (Level 8)',
    reason: 'Peak flight corridor demand; corporate client has flawless 94 payment score.',
  },
  {
    id: 'aud_cms_003',
    timestamp: '2026-11-09 11:24:45 UTC',
    account_id: 'cms_acc_003',
    entity_name: 'SkyWings Aviation Academy',
    action_type: 'DUNNING_NOTICE_DISPATCHED',
    previous_value: 'STAGE_1_REMINDER',
    new_value: 'STAGE_2_URGENT',
    actor_name: 'Credit Risk Controller',
    actor_role: 'Finance Officer (Level 6)',
    reason: 'Past-due balance in 61-90 day bucket. Automated Level 2 warning dispatched.',
  },
];

// Initial baseline mock data for Promises to Pay
const INITIAL_PROMISES: CMSPromiseToPay[] = [
  {
    id: 'ptp_001',
    account_id: 'cms_acc_002',
    entity_name: 'AeroTurbine Tech & MRO',
    promise_date: '2026-11-20',
    promised_amount: 15000,
    logged_by: 'Senior Credit Officer',
    logged_at: '2026-11-10 14:30',
    notes: 'CFO confirmed disbursement following client milestone release.',
    status: 'PENDING',
  },
];

export const CreditManagementSystemDesk: React.FC<CreditManagementSystemDeskProps> = ({
  activeAdminUser,
  currentUser,
  onRefreshAll,
}) => {
  // Navigation Tabs for the 6 Pillars of CMS
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'allocation' | 'risk' | 'ledger' | 'collections' | 'audit'
  >('dashboard');

  // Core Data Stores
  const [accounts, setAccounts] = useState<CMSCreditAccount[]>(INITIAL_ACCOUNTS);
  const [requests, setRequests] = useState<CMSAllocationRequest[]>(INITIAL_REQUESTS);
  const [agingRecords, setAgingRecords] = useState<CMSAgingRecord[]>(INITIAL_AGING);
  const [ledgerEntries, setLedgerEntries] = useState<CMSLedgerEntry[]>(INITIAL_LEDGER);
  const [auditEntries, setAuditEntries] = useState<CMSAuditEntry[]>(INITIAL_AUDIT);
  const [promises, setPromises] = useState<CMSPromiseToPay[]>(INITIAL_PROMISES);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // User Clearance Determination
  const actorLevel = activeAdminUser?.level || (activeAdminUser?.role === 'SUPER_ADMIN' ? 8 : 6);
  const actorName = activeAdminUser?.name || 'Administrator';
  const actorRoleTitle = activeAdminUser?.level_title || (actorLevel >= 8 ? 'Super Admin (Level 8)' : 'Credit Manager (Level 6)');
  const isElevatedAuthority = actorLevel >= 7;

  // --- MODAL 1: Adjust Credit Limit & Temporary Extension ---
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<CMSCreditAccount | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState<number>(25000);
  const [grantExtension, setGrantExtension] = useState<boolean>(false);
  const [extensionAmount, setExtensionAmount] = useState<number>(2000);
  const [extensionDays, setExtensionDays] = useState<number>(14);
  const [editReason, setEditReason] = useState<string>('');

  const handleOpenEditModal = (acc: CMSCreditAccount) => {
    setSelectedAccountForEdit(acc);
    setNewCreditLimit(acc.credit_limit);
    setGrantExtension(acc.temporary_extension > 0);
    setExtensionAmount(acc.temporary_extension > 0 ? acc.temporary_extension : 2000);
    setExtensionDays(14);
    setEditReason('');
  };

  const handleSaveCreditAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForEdit) return;

    if (!editReason.trim()) {
      showToast('Mandatory audit justification is required to modify credit allocation.', 'error');
      return;
    }

    const prevLimit = selectedAccountForEdit.credit_limit;
    const prevExt = selectedAccountForEdit.temporary_extension;
    const finalExt = grantExtension ? extensionAmount : 0;

    // Check high value elevation (> 5,000 increase)
    const limitDelta = newCreditLimit - prevLimit;
    if (limitDelta > 5000 && !isElevatedAuthority) {
      // Route to approval workflow
      const newReq: CMSAllocationRequest = {
        id: `req_${Date.now()}`,
        account_id: selectedAccountForEdit.id,
        entity_name: selectedAccountForEdit.entity_name,
        requested_by: `${actorName} (${actorRoleTitle})`,
        current_limit: prevLimit,
        requested_limit: newCreditLimit,
        extension_days: grantExtension ? extensionDays : undefined,
        justification: editReason,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      };
      setRequests((prev) => [newReq, ...prev]);
      showToast('Limit increase > 5,000 Cr submitted to Sovereign Super Admin approval queue.', 'info');
      setSelectedAccountForEdit(null);
      return;
    }

    // Apply directly
    const validUntilDate = grantExtension
      ? new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === selectedAccountForEdit.id) {
          return {
            ...acc,
            credit_limit: newCreditLimit,
            temporary_extension: finalExt,
            extension_valid_until: validUntilDate,
            updated_at: new Date().toISOString(),
          };
        }
        return acc;
      })
    );

    // Record Tamper-Proof Audit Log
    const newAudit: CMSAuditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toUTCString(),
      account_id: selectedAccountForEdit.id,
      entity_name: selectedAccountForEdit.entity_name,
      action_type: 'CREDIT_LIMIT_ADJUSTED',
      previous_value: `Limit: ${prevLimit.toLocaleString()} Cr | Ext: ${prevExt.toLocaleString()} Cr`,
      new_value: `Limit: ${newCreditLimit.toLocaleString()} Cr | Ext: ${finalExt.toLocaleString()} Cr`,
      actor_name: actorName,
      actor_role: actorRoleTitle,
      reason: editReason,
    };
    setAuditEntries((prev) => [newAudit, ...prev]);

    showToast(`Successfully adjusted credit line for ${selectedAccountForEdit.entity_name}!`, 'success');
    setSelectedAccountForEdit(null);
  };

  // --- MODAL 2: Account Freeze / Thaw Action ---
  const handleToggleFreeze = (acc: CMSCreditAccount) => {
    const nextState = !acc.is_frozen;
    const defaultReason = nextState
      ? 'Manual administrative freeze triggered: credit exposure containment.'
      : 'Account thawed: credit compliance validated by administration.';

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === acc.id) {
          return {
            ...a,
            is_frozen: nextState,
            freeze_reason: nextState ? defaultReason : undefined,
            updated_at: new Date().toISOString(),
          };
        }
        return a;
      })
    );

    // Log to Audit Trail
    const auditEntry: CMSAuditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toUTCString(),
      account_id: acc.id,
      entity_name: acc.entity_name,
      action_type: nextState ? 'ACCOUNT_FROZEN' : 'ACCOUNT_UNFROZEN',
      previous_value: acc.is_frozen ? 'FROZEN' : 'ACTIVE',
      new_value: nextState ? 'HARD FROZEN' : 'ACTIVE',
      actor_name: actorName,
      actor_role: actorRoleTitle,
      reason: defaultReason,
    };
    setAuditEntries((prev) => [auditEntry, ...prev]);

    showToast(
      nextState
        ? `Account for ${acc.entity_name} has been HARD FROZEN.`
        : `Account for ${acc.entity_name} has been UNFROZEN.`,
      nextState ? 'error' : 'success'
    );
  };

  // --- MODAL 3: Issue Credit Memo / Write-off in Ledger ---
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerAccountId, setLedgerAccountId] = useState(accounts[0]?.id || '');
  const [ledgerEntryType, setLedgerEntryType] = useState<'CREDIT_MEMO' | 'DISCOUNT' | 'WRITE_OFF'>('CREDIT_MEMO');
  const [ledgerAmount, setLedgerAmount] = useState<number>(1000);
  const [ledgerRef, setLedgerRef] = useState<string>('MEMO-2026-');
  const [ledgerNotes, setLedgerNotes] = useState<string>('');

  const handleCreateLedgerAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAcc = accounts.find((a) => a.id === ledgerAccountId);
    if (!targetAcc) return;

    if (!ledgerNotes.trim()) {
      showToast('Mandatory accounting justification is required.', 'error');
      return;
    }

    if (ledgerEntryType === 'WRITE_OFF' && !isElevatedAuthority) {
      showToast('403 Forbidden: Bad debt write-offs require Level 7 or 8 Super Admin clearance.', 'error');
      return;
    }

    const currentBal = targetAcc.current_balance;
    const newBal = Math.max(0, currentBal - ledgerAmount);

    // Update account balance
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === ledgerAccountId) {
          return {
            ...a,
            current_balance: newBal,
            updated_at: new Date().toISOString(),
          };
        }
        return a;
      })
    );

    // Add entry to Ledger
    const newLedger: CMSLedgerEntry = {
      id: `led_${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      reference_id: ledgerRef || `ADJ-${Date.now().toString().slice(-4)}`,
      account_id: targetAcc.id,
      entity_name: targetAcc.entity_name,
      entry_type: ledgerEntryType,
      amount: -ledgerAmount,
      running_balance: newBal,
      notes: ledgerNotes,
      settlement_status: 'CLEARED',
    };
    setLedgerEntries((prev) => [newLedger, ...prev]);

    // Record in Audit Trail
    const newAudit: CMSAuditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toUTCString(),
      account_id: targetAcc.id,
      entity_name: targetAcc.entity_name,
      action_type:
        ledgerEntryType === 'CREDIT_MEMO'
          ? 'CREDIT_MEMO_ISSUED'
          : ledgerEntryType === 'DISCOUNT'
          ? 'PROMO_DISCOUNT_APPLIED'
          : 'BAD_DEBT_WRITE_OFF',
      previous_value: `Balance: ${currentBal.toLocaleString()} Cr`,
      new_value: `Balance: ${newBal.toLocaleString()} Cr (Adjustment: -${ledgerAmount.toLocaleString()} Cr)`,
      actor_name: actorName,
      actor_role: actorRoleTitle,
      reason: ledgerNotes,
    };
    setAuditEntries((prev) => [newAudit, ...prev]);

    showToast(`Accounting adjustment ${ledgerEntryType} recorded for ${targetAcc.entity_name}!`, 'success');
    setShowLedgerModal(false);
    setLedgerNotes('');
  };

  // --- MODAL 4: Dunning Action & Promise to Pay ---
  const [showDunningModal, setShowDunningModal] = useState<CMSAgingRecord | null>(null);
  const [promiseDate, setPromiseDate] = useState('');
  const [promiseAmount, setPromiseAmount] = useState(0);
  const [promiseNotes, setPromiseNotes] = useState('');

  const handleSendDunningNotice = (record: CMSAgingRecord, stage: DunningStage) => {
    setAgingRecords((prev) =>
      prev.map((r) => {
        if (r.id === record.id) {
          return {
            ...r,
            dunning_stage: stage,
            last_dunning_sent: new Date().toISOString().split('T')[0],
          };
        }
        return r;
      })
    );

    const audit: CMSAuditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toUTCString(),
      account_id: record.account_id,
      entity_name: record.entity_name,
      action_type: 'DUNNING_NOTICE_DISPATCHED',
      previous_value: record.dunning_stage,
      new_value: stage,
      actor_name: actorName,
      actor_role: actorRoleTitle,
      reason: `Automated recovery escalation notice dispatched for ${record.total_overdue.toLocaleString()} Cr overdue.`,
    };
    setAuditEntries((prev) => [audit, ...prev]);

    showToast(`Dunning Notice (${stage.replace(/_/g, ' ')}) dispatched to ${record.entity_name}!`, 'info');
  };

  const handleLogPromiseToPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDunningModal) return;

    if (!promiseDate || promiseAmount <= 0) {
      showToast('Please specify a valid promise date and commitment amount.', 'error');
      return;
    }

    const newPromise: CMSPromiseToPay = {
      id: `ptp_${Date.now()}`,
      account_id: showDunningModal.account_id,
      entity_name: showDunningModal.entity_name,
      promise_date: promiseDate,
      promised_amount: promiseAmount,
      logged_by: actorName,
      logged_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: promiseNotes,
      status: 'PENDING',
    };
    setPromises((prev) => [newPromise, ...prev]);

    setAgingRecords((prev) =>
      prev.map((r) => {
        if (r.id === showDunningModal.id) {
          return { ...r, has_active_promise: true };
        }
        return r;
      })
    );

    const audit: CMSAuditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toUTCString(),
      account_id: showDunningModal.account_id,
      entity_name: showDunningModal.entity_name,
      action_type: 'PROMISE_TO_PAY_LOGGED',
      previous_value: 'No Promise',
      new_value: `Promised ${promiseAmount.toLocaleString()} Cr by ${promiseDate}`,
      actor_name: actorName,
      actor_role: actorRoleTitle,
      reason: promiseNotes || 'Customer commitment logged by collection agent.',
    };
    setAuditEntries((prev) => [audit, ...prev]);

    showToast(`Promise-to-pay commitment registered for ${showDunningModal.entity_name}!`, 'success');
    setShowDunningModal(null);
    setPromiseNotes('');
  };

  // Re-evaluate Risk Algorithm
  const handleRecalculateRisk = (acc: CMSCreditAccount) => {
    // Dynamic scoring formula
    const totalLine = acc.credit_limit + acc.temporary_extension;
    const utilPct = totalLine > 0 ? (acc.current_balance / totalLine) * 100 : 0;
    
    let newScore = acc.payment_score;
    if (utilPct > 90) newScore = Math.max(30, newScore - 12);
    else if (utilPct < 50) newScore = Math.min(99, newScore + 5);

    let newRating: BureauRatingTier = 'BBB';
    let newCategory: CreditRiskCategory = 'MODERATE';

    if (newScore >= 90) {
      newRating = 'AAA';
      newCategory = 'LOW_RISK';
    } else if (newScore >= 80) {
      newRating = 'A';
      newCategory = 'LOW_RISK';
    } else if (newScore >= 70) {
      newRating = 'BBB';
      newCategory = 'MODERATE';
    } else if (newScore >= 55) {
      newRating = 'BB';
      newCategory = 'ELEVATED';
    } else if (newScore >= 40) {
      newRating = 'B';
      newCategory = 'HIGH_EXPOSURE';
    } else {
      newRating = 'DEFAULT_WARNING';
      newCategory = 'CRITICAL';
    }

    setAccounts((prev) =>
      prev.map((a) => (a.id === acc.id ? { ...a, payment_score: newScore, bureau_rating: newRating, risk_category: newCategory } : a))
    );

    showToast(`Re-evaluated credit risk for ${acc.entity_name}: Score ${newScore} | Grade ${newRating}`, 'info');
  };

  // Approve / Reject Allocation Workflow Request
  const handleProcessRequest = (req: CMSAllocationRequest, action: 'APPROVE' | 'REJECT') => {
    if (!isElevatedAuthority) {
      showToast('403 Forbidden: Level 7 or 8 Super Admin authorization required to process credit workflows.', 'error');
      return;
    }

    if (action === 'APPROVE') {
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.id === req.account_id) {
            return {
              ...a,
              credit_limit: req.requested_limit,
              updated_at: new Date().toISOString(),
            };
          }
          return a;
        })
      );
    }

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === req.id) {
          return {
            ...r,
            status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            reviewed_by: `${actorName} (${actorRoleTitle})`,
            reviewed_at: new Date().toISOString(),
          };
        }
        return r;
      })
    );

    const audit: CMSAuditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toUTCString(),
      account_id: req.account_id,
      entity_name: req.entity_name,
      action_type: 'CREDIT_LIMIT_ADJUSTED',
      previous_value: `Limit: ${req.current_limit.toLocaleString()} Cr`,
      new_value: action === 'APPROVE' ? `Approved Limit: ${req.requested_limit.toLocaleString()} Cr` : 'Request Rejected',
      actor_name: actorName,
      actor_role: actorRoleTitle,
      reason: `Workflow request ${req.id} ${action === 'APPROVE' ? 'authorized' : 'denied'} by Sovereign Super Admin.`,
    };
    setAuditEntries((prev) => [audit, ...prev]);

    showToast(`Credit allocation request ${action === 'APPROVE' ? 'approved' : 'rejected'}.`, 'success');
  };

  // Global Aggregate Calculations
  const stats = useMemo(() => {
    let totalLimit = 0;
    let totalExtension = 0;
    let totalUsed = 0;
    let frozenCount = 0;

    accounts.forEach((acc) => {
      totalLimit += acc.credit_limit;
      totalExtension += acc.temporary_extension;
      totalUsed += acc.current_balance;
      if (acc.is_frozen) frozenCount += 1;
    });

    const totalCapacity = totalLimit + totalExtension;
    const utilizationRate = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;
    const totalHeadroom = totalCapacity - totalUsed;

    let totalOverdue = 0;
    agingRecords.forEach((a) => {
      totalOverdue += a.total_overdue;
    });

    return {
      totalLimit,
      totalExtension,
      totalCapacity,
      totalUsed,
      utilizationRate,
      totalHeadroom,
      frozenCount,
      totalOverdue,
      totalAccounts: accounts.length,
    };
  }, [accounts, agingRecords]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        acc.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.business_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = deptFilter === 'ALL' || acc.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [accounts, searchQuery, deptFilter]);

  // Export CSV Helper
  const handleExportAuditCSV = () => {
    const headers = ['Audit ID', 'Timestamp (UTC)', 'Entity Name', 'Action Type', 'Previous Value', 'New Value', 'Authorized Actor', 'Actor Role', 'Justification Reason'];
    const rows = auditEntries.map((a) => [
      `"${a.id}"`,
      `"${a.timestamp}"`,
      `"${a.entity_name}"`,
      `"${a.action_type}"`,
      `"${a.previous_value}"`,
      `"${a.new_value}"`,
      `"${a.actor_name}"`,
      `"${a.actor_role}"`,
      `"${a.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cms_tamper_proof_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tamper-proof CMS Audit Trail exported successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* CMS Header & Authority Clearance Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-blue-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Unified Credit Management System (CMS)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Real-Time Enterprise Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Centralized credit exposure control, risk scoring, ledger synchronization, aging recovery, and tamper-proof governance.
                </p>
              </div>
            </div>
          </div>

          {/* Actor Clearance Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-slate-400 text-[10px] block leading-none">Logged Clearance</span>
                <span className="font-bold text-slate-200 text-xs">
                  {actorName} • <span className={isElevatedAuthority ? 'text-amber-400' : 'text-blue-400'}>{actorRoleTitle}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportAuditCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-slate-700"
              title="Export Tamper-Proof Audit Log (CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Audit</span>
            </button>
          </div>
        </div>

        {/* 6 Core Pillars Navigation Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-800 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1. Central Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('allocation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'allocation'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>2. Credit Allocation</span>
            {requests.filter((r) => r.status === 'PENDING').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                {requests.filter((r) => r.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'risk'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>3. Risk Assessment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'ledger'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. A/R &amp; Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collections')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'collections'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>5. Collections &amp; Aging</span>
            {stats.totalOverdue > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                Overdue
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>6. Admin &amp; Audit Trail</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PILLAR 1: CENTRAL DASHBOARD                                               */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total Global Exposure */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Total Credit Exposure</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {stats.totalCapacity.toLocaleString()} <span className="text-xs font-sans text-amber-400">Cr</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Base: {stats.totalLimit.toLocaleString()} Cr</span>
                <span className="text-emerald-400 font-mono">+{stats.totalExtension.toLocaleString()} Cr Ext</span>
              </div>
            </div>

            {/* Metric 2: Utilization Rate */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Global Utilization</span>
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black font-mono text-blue-400">
                {stats.utilizationRate.toFixed(1)}%
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, stats.utilizationRate)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400">
                {stats.totalUsed.toLocaleString()} Cr used of {stats.totalCapacity.toLocaleString()} Cr
              </div>
            </div>

            {/* Metric 3: Headroom Liquidity Reserve */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Available Headroom</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {stats.totalHeadroom.toLocaleString()} <span className="text-xs font-sans text-emerald-300">Cr</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Unutilized liquid reserve ready for corporate dispatch
              </div>
            </div>

            {/* Metric 4: At-Risk & Frozen */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Overdue Exposure</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black font-mono text-rose-400">
                {stats.totalOverdue.toLocaleString()} <span className="text-xs font-sans text-rose-300">Cr</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>{stats.frozenCount} Accounts Frozen</span>
                <span className="text-rose-400 font-bold">Action Required</span>
              </div>
            </div>
          </div>

          {/* Quick Action Control Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time Operational Overrides
                </div>
                <div className="text-[11px] text-slate-400">
                  Instant triggers for global credit exposure, threshold alerts, and accounting adjustments.
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Dispatched automated global exposure threshold notification to Treasury Directorate.', 'info');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all cursor-pointer border border-slate-700 flex items-center space-x-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Trigger Threshold Alert</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLedgerModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Accounting Memo</span>
              </button>
            </div>
          </div>

          {/* Departmental Credit Distribution Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Departmental Exposure Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { name: 'Executive Charters', count: 2, total: 50000, used: 38250 },
                { name: 'MRO & Engineering', count: 1, total: 45000, used: 38200 },
                { name: 'Pilot Academy', count: 1, total: 17000, used: 13900 },
                { name: 'Air Cargo', count: 1, total: 70000, used: 54100 },
              ].map((dept) => {
                const util = (dept.used / dept.total) * 100;
                return (
                  <div key={dept.name} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{dept.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{dept.count} Client(s)</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-amber-300">
                      {dept.total.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">Cr Line</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${util}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>{dept.used.toLocaleString()} Cr Used</span>
                      <span>{util.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 2: CREDIT ALLOCATION (EASY EDITING)                                */}
      {/* ========================================================================= */}
      {activeTab === 'allocation' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Pending Approval Workflow Queue */}
          {requests.filter((r) => r.status === 'PENDING').length > 0 && (
            <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Pending Credit Allocation Approval Queue ({requests.filter((r) => r.status === 'PENDING').length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      High-value credit limit adjustments (&gt; 5,000 Cr) awaiting Sovereign Super Admin authorization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {requests
                  .filter((r) => r.status === 'PENDING')
                  .map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{req.entity_name}</span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Requested by {req.requested_by}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          Current Limit: <strong className="text-slate-200">{req.current_limit.toLocaleString()} Cr</strong> → Proposed:{' '}
                          <strong className="text-amber-400">{req.requested_limit.toLocaleString()} Cr</strong> (+{(req.requested_limit - req.current_limit).toLocaleString()} Cr)
                        </div>
                        <div className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                          "{req.justification}"
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleProcessRequest(req, 'APPROVE')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Adjustment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProcessRequest(req, 'REJECT')}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Allocation Table & Easy Editing */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span>Corporate Credit Limits &amp; Temporary Extensions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct real-time editor for adjusting baseline credit facilities, temporary buffer grants, and account freeze statuses.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search client entity..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Executive Charters">Executive Charters</option>
                  <option value="MRO & Engineering">MRO &amp; Engineering</option>
                  <option value="Pilot Academy">Pilot Academy</option>
                  <option value="Air Cargo">Air Cargo</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Client Entity</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Baseline Credit Limit</th>
                    <th className="py-3 px-4">Temporary Extension</th>
                    <th className="py-3 px-4">Current Used</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {filteredAccounts.map((acc) => {
                    const totalCap = acc.credit_limit + acc.temporary_extension;
                    const utilPct = totalCap > 0 ? (acc.current_balance / totalCap) * 100 : 0;
                    return (
                      <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{acc.entity_name}</div>
                          <div className="text-[11px] text-slate-400">{acc.category}</div>
                          <div className="text-[10px] font-mono text-slate-500">{acc.business_id}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800">
                            {acc.department}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          {acc.credit_limit.toLocaleString()} Cr
                        </td>

                        <td className="py-3 px-4 font-mono text-xs">
                          {acc.temporary_extension > 0 ? (
                            <div>
                              <span className="text-emerald-400 font-bold">
                                +{acc.temporary_extension.toLocaleString()} Cr
                              </span>
                              <div className="text-[10px] text-slate-500">
                                Valid until {acc.extension_valid_until ? formatDateDDMMYYYY(acc.extension_valid_until) : 'End of Cycle'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="text-slate-200 font-bold">{acc.current_balance.toLocaleString()} Cr</div>
                          <div className="text-[10px] text-slate-400">{utilPct.toFixed(0)}% utilized</div>
                        </td>

                        <td className="py-3 px-4">
                          {acc.is_frozen ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              HARD FROZEN
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ACTIVE
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(acc)}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold border border-blue-500/30 flex items-center space-x-1 transition-colors cursor-pointer"
                              title="Adjust Credit Limit and Grant Extensions"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Adjust</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleFreeze(acc)}
                              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                acc.is_frozen
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                              }`}
                              title={acc.is_frozen ? 'Thaw / Unfreeze Account' : 'Freeze Credit Account'}
                            >
                              {acc.is_frozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 3: RISK ASSESSMENT                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'risk' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Risk Scoring Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tier AAA / AA Grade</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {accounts.filter((a) => a.bureau_rating === 'AAA' || a.bureau_rating === 'AA').length}
              </div>
              <div className="text-[11px] text-slate-500">Prime creditworthiness, lowest default probability</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tier A / BBB Grade</div>
              <div className="text-2xl font-black font-mono text-blue-400">
                {accounts.filter((a) => a.bureau_rating === 'A' || a.bureau_rating === 'BBB').length}
              </div>
              <div className="text-[11px] text-slate-500">Standard commercial aviation performance</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tier BB / B Grade</div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {accounts.filter((a) => a.bureau_rating === 'BB' || a.bureau_rating === 'B').length}
              </div>
              <div className="text-[11px] text-slate-500">Elevated exposure, requires active monitoring</div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Default Warning</div>
              <div className="text-2xl font-black font-mono text-rose-400">
                {accounts.filter((a) => a.bureau_rating === 'DEFAULT_WARNING').length}
              </div>
              <div className="text-[11px] text-slate-500">Severe credit delinquency or hard freeze active</div>
            </div>
          </div>

          {/* Client Creditworthiness & Bureau Integration Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Internal Payment History &amp; External Bureau Risk Ratings</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Blended credit rating combining internal on-time settlement telemetry with simulated Dun &amp; Bradstreet / Equifax Commercial Aviation bureau ratings.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Corporate Entity</th>
                    <th className="py-3 px-4">Payment Score (0-100)</th>
                    <th className="py-3 px-4">Bureau Commercial Grade</th>
                    <th className="py-3 px-4">Risk Classification</th>
                    <th className="py-3 px-4">Current Utilization</th>
                    <th className="py-3 px-4 text-right">Risk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {accounts.map((acc) => {
                    const totalCap = acc.credit_limit + acc.temporary_extension;
                    const utilPct = totalCap > 0 ? (acc.current_balance / totalCap) * 100 : 0;
                    return (
                      <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{acc.entity_name}</div>
                          <div className="text-[11px] text-slate-400">{acc.category}</div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-black text-sm ${
                                acc.payment_score >= 80
                                  ? 'text-emerald-400'
                                  : acc.payment_score >= 60
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {acc.payment_score}/100
                            </span>
                            <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  acc.payment_score >= 80
                                    ? 'bg-emerald-500'
                                    : acc.payment_score >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${acc.payment_score}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs ${
                              acc.bureau_rating === 'AAA' || acc.bureau_rating === 'AA'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : acc.bureau_rating === 'A' || acc.bureau_rating === 'BBB'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : acc.bureau_rating === 'BB' || acc.bureau_rating === 'B'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {acc.bureau_rating}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                              acc.risk_category === 'LOW_RISK'
                                ? 'bg-emerald-950 text-emerald-300'
                                : acc.risk_category === 'MODERATE'
                                ? 'bg-blue-950 text-blue-300'
                                : acc.risk_category === 'ELEVATED'
                                ? 'bg-amber-950 text-amber-300'
                                : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {acc.risk_category.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div>{acc.current_balance.toLocaleString()} Cr</div>
                          <div className="text-[10px] text-slate-400">{utilPct.toFixed(0)}% of limit</div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRecalculateRisk(acc)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center space-x-1 ml-auto cursor-pointer border border-slate-700"
                            title="Recalculate dynamic risk rating"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Re-Evaluate</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 4: A/R & LEDGER                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Ledger Action Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>Synchronized A/R Billing &amp; Credit Ledger</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time transaction synchronization with automated debit/credit balancing, credit memos, promotional discounts, and bad debt write-offs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowLedgerModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Manual Adjustment</span>
            </button>
          </div>

          {/* Ledger Entries Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4">Corporate Entity</th>
                    <th className="py-3 px-4">Entry Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Running Balance</th>
                    <th className="py-3 px-4">Accounting Notes</th>
                    <th className="py-3 px-4 text-right">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {ledgerEntries.map((led) => (
                    <tr key={led.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {led.date}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {led.reference_id}
                      </td>

                      <td className="py-3 px-4 font-bold text-white">
                        {led.entity_name}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            led.entry_type === 'PAYMENT'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : led.entry_type === 'CREDIT_MEMO'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : led.entry_type === 'DISCOUNT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : led.entry_type === 'WRITE_OFF'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {led.entry_type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={led.amount > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {led.amount > 0 ? `+${led.amount.toLocaleString()}` : led.amount.toLocaleString()} Cr
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-200">
                        {led.running_balance.toLocaleString()} Cr
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate">
                        {led.notes}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {led.settlement_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 5: COLLECTIONS & DUNNING WORKFLOWS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'collections' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Aging Buckets Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">0 - 30 Days (Current)</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {agingRecords.reduce((acc, r) => acc + r.bucket_0_30, 0).toLocaleString()} <span className="text-xs font-sans">Cr</span>
              </div>
              <div className="text-[11px] text-slate-500">Normal billing billing cycle, healthy receivables</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">31 - 60 Days (Stage 1)</div>
              <div className="text-2xl font-black font-mono text-blue-400">
                {agingRecords.reduce((acc, r) => acc + r.bucket_31_60, 0).toLocaleString()} <span className="text-xs font-sans">Cr</span>
              </div>
              <div className="text-[11px] text-slate-500">Gentle automated email reminder stage</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">61 - 90 Days (Stage 2)</div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {agingRecords.reduce((acc, r) => acc + r.bucket_61_90, 0).toLocaleString()} <span className="text-xs font-sans">Cr</span>
              </div>
              <div className="text-[11px] text-slate-500">Urgent warning notice &amp; impending lock</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">90+ Days (Critical)</div>
              <div className="text-2xl font-black font-mono text-rose-400">
                {agingRecords.reduce((acc, r) => acc + r.bucket_90_plus, 0).toLocaleString()} <span className="text-xs font-sans">Cr</span>
              </div>
              <div className="text-[11px] text-slate-500">Pre-legal recovery &amp; automatic account freeze</div>
            </div>
          </div>

          {/* Aging Records Table with Dunning Workflows */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-rose-400" />
                  <span>Automated Aging Reports &amp; Dunning Reminders</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-stage dunning escalation engine with promise-to-pay commitment logger.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Corporate Entity</th>
                    <th className="py-3 px-4">0-30 Days</th>
                    <th className="py-3 px-4">31-60 Days</th>
                    <th className="py-3 px-4">61-90 Days</th>
                    <th className="py-3 px-4">90+ Days</th>
                    <th className="py-3 px-4">Total Overdue</th>
                    <th className="py-3 px-4">Dunning Stage</th>
                    <th className="py-3 px-4 text-right">Recovery Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {agingRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        <div>{r.entity_name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{r.department}</div>
                        {r.has_active_promise && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            ✓ Promise Logged
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">
                        {r.bucket_0_30.toLocaleString()} Cr
                      </td>

                      <td className="py-3 px-4 font-mono text-blue-300">
                        {r.bucket_31_60.toLocaleString()} Cr
                      </td>

                      <td className="py-3 px-4 font-mono text-amber-300">
                        {r.bucket_61_90.toLocaleString()} Cr
                      </td>

                      <td className="py-3 px-4 font-mono text-rose-400 font-bold">
                        {r.bucket_90_plus.toLocaleString()} Cr
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-rose-300">
                        {r.total_overdue.toLocaleString()} Cr
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            r.dunning_stage === 'STAGE_1_REMINDER'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : r.dunning_stage === 'STAGE_2_URGENT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : r.dunning_stage === 'STAGE_3_FINAL_LEGAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {r.dunning_stage.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const nextStage: DunningStage =
                                r.dunning_stage === 'STAGE_1_REMINDER'
                                  ? 'STAGE_2_URGENT'
                                  : r.dunning_stage === 'STAGE_2_URGENT'
                                  ? 'STAGE_3_FINAL_LEGAL'
                                  : 'STAGE_3_FINAL_LEGAL';
                              handleSendDunningNotice(r, nextStage);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-colors cursor-pointer border border-slate-700 flex items-center space-x-1"
                            title="Dispatch Dunning Escalation Notice"
                          >
                            <Send className="w-3 h-3" />
                            <span>Escalate</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowDunningModal(r);
                              setPromiseAmount(r.total_overdue);
                              const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                              setPromiseDate(futureDate);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer border border-emerald-500/30 flex items-center space-x-1"
                            title="Log Promise to Pay Commitment"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Log Promise</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Promises-to-Pay Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Active Promises-to-Pay Ledger ({promises.length})</span>
            </h3>

            {promises.length === 0 ? (
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                No active promises-to-pay currently on file.
              </div>
            ) : (
              <div className="space-y-2">
                {promises.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{p.entity_name}</div>
                      <div className="text-slate-400 text-[11px]">
                        Committed Amount: <strong className="text-emerald-400 font-mono">{p.promised_amount.toLocaleString()} Cr</strong> by{' '}
                        <strong className="text-amber-300">{p.promise_date}</strong> • Logged by {p.logged_by}
                      </div>
                      {p.notes && <div className="text-[10px] text-slate-500 italic mt-0.5">"{p.notes}"</div>}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 6: ADMIN & TAMPER-PROOF AUDIT TRAIL                                */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Audit Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Tamper-Proof Credit Audit Trail (Immutable Log)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every manual credit adjustment, extension grant, freeze override, and write-off is cryptographically tracked with actor name, clearance level, and mandatory rationale.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportAuditCSV}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg flex items-center space-x-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Audit Report</span>
            </button>
          </div>

          {/* Audit Entries Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Audit ID</th>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Client Entity</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Previous Value → New Value</th>
                    <th className="py-3 px-4">Authorized Actor</th>
                    <th className="py-3 px-4">Mandatory Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {auditEntries.map((aud) => (
                    <tr key={aud.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 font-bold">
                        {aud.id}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {aud.timestamp}
                      </td>

                      <td className="py-3 px-4 font-bold text-white">
                        {aud.entity_name}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            aud.action_type.includes('FROZEN')
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : aud.action_type.includes('EXTENSION')
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : aud.action_type.includes('MEMO') || aud.action_type.includes('DISCOUNT')
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {aud.action_type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-slate-500 line-through mr-1">{aud.previous_value}</span>
                        <span className="text-emerald-300 font-bold">→ {aud.new_value}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{aud.actor_name}</div>
                        <div className="text-[10px] text-amber-400 font-mono">{aud.actor_role}</div>
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-300 max-w-sm">
                        {aud.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADJUST CREDIT ALLOCATION & EXTENSION                             */}
      {/* ========================================================================= */}
      {selectedAccountForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Adjust Corporate Credit Facility</h3>
                  <p className="text-xs text-slate-400">{selectedAccountForEdit.entity_name} ({selectedAccountForEdit.business_id})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccountForEdit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreditAllocation} className="space-y-4 text-xs">
              {/* Baseline Credit Limit */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Baseline Credit Limit (Credits)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={newCreditLimit}
                  onChange={(e) => setNewCreditLimit(Math.max(1000, parseInt(e.target.value, 10) || 1000))}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-amber-300 outline-none focus:border-amber-500 text-sm"
                  required
                />
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewCreditLimit((prev) => prev + 5000)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 font-mono font-bold cursor-pointer"
                  >
                    +5,000 Cr
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCreditLimit((prev) => prev + 10000)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 font-mono font-bold cursor-pointer"
                  >
                    +10,000 Cr
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCreditLimit((prev) => Math.max(1000, prev - 5000))}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono font-bold cursor-pointer"
                  >
                    -5,000 Cr
                  </button>
                </div>
              </div>

              {/* Temporary Extension Buffer */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200">Grant Temporary Credit Extension</div>
                    <div className="text-[11px] text-slate-400">Short-term credit buffer for high seasonal operations</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={grantExtension}
                    onChange={(e) => setGrantExtension(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                {grantExtension && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Extension Amount
                      </label>
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={extensionAmount}
                        onChange={(e) => setExtensionAmount(Math.max(500, parseInt(e.target.value, 10) || 500))}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Validity Duration
                      </label>
                      <select
                        value={extensionDays}
                        onChange={(e) => setExtensionDays(parseInt(e.target.value, 10))}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      >
                        <option value={7}>7 Days (Sprint)</option>
                        <option value={14}>14 Days (Standard)</option>
                        <option value={30}>30 Days (Monthly Cycle)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Mandatory Justification */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Mandatory Audit Rationale / Justification <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Approved seasonal charter surge following financial audit review..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAccountForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg cursor-pointer"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANUAL ACCOUNTING MEMO (A/R LEDGER)                              */}
      {/* ========================================================================= */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Accounting Ledger Memo</h3>
                  <p className="text-xs text-slate-400">Issue credit concessions, promotional adjustments, or write-offs.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLedgerModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLedgerAdjustment} className="space-y-3 text-xs">
              {/* Select Target Account */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Select Corporate Client
                </label>
                <select
                  value={ledgerAccountId}
                  onChange={(e) => setLedgerAccountId(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.entity_name} (Current: {a.current_balance.toLocaleString()} Cr)
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustment Type */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Adjustment Classification
                </label>
                <select
                  value={ledgerEntryType}
                  onChange={(e) => setLedgerEntryType(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="CREDIT_MEMO">Credit Memo (Billing Concession / Service Credit)</option>
                  <option value="DISCOUNT">Commercial Promotional Discount</option>
                  <option value="WRITE_OFF">Bad Debt Write-Off (Requires Super Admin Clearance)</option>
                </select>
              </div>

              {/* Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Credit Adjustment Amount
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={ledgerAmount}
                    onChange={(e) => setLedgerAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-emerald-400"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Reference ID / Invoice #
                  </label>
                  <input
                    type="text"
                    value={ledgerRef}
                    onChange={(e) => setLedgerRef(e.target.value)}
                    placeholder="MEMO-2026-009"
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white"
                  />
                </div>
              </div>

              {/* Accounting Notes */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Accounting Rationale &amp; Documentation Notes <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={ledgerNotes}
                  onChange={(e) => setLedgerNotes(e.target.value)}
                  placeholder="Service outage adjustment / Executive promotion signed by Treasury Controller..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  required
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: LOG PROMISE-TO-PAY (COLLECTIONS)                                 */}
      {/* ========================================================================= */}
      {showDunningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Log Promise-to-Pay Commitment</h3>
                  <p className="text-xs text-slate-400">{showDunningModal.entity_name} • Overdue: {showDunningModal.total_overdue.toLocaleString()} Cr</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDunningModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogPromiseToPay} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Promise Date
                  </label>
                  <input
                    type="date"
                    value={promiseDate}
                    onChange={(e) => setPromiseDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Promised Amount (Credits)
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={promiseAmount}
                    onChange={(e) => setPromiseAmount(Math.max(100, parseInt(e.target.value, 10) || 100))}
                    className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-emerald-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Collector Agent Notes &amp; Follow-up Terms
                </label>
                <textarea
                  rows={2}
                  value={promiseNotes}
                  onChange={(e) => setPromiseNotes(e.target.value)}
                  placeholder="Spoke with Finance Director. Agreed to partial wire transfer before scheduled flight..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDunningModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg cursor-pointer"
                >
                  Log Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-5 border ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500'
              : toastMessage.type === 'info'
              ? 'bg-blue-950/90 text-blue-200 border-blue-500'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-500'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

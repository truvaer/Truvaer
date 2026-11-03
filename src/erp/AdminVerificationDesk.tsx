import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Mail,
  FileText,
  Building2,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Lock,
  Edit3,
  Ban,
  ArrowRightLeft,
  Wallet,
  CreditCard,
  X,
  Eye,
  PowerOff,
  Landmark,
  Calculator,
  Percent,
  DollarSign,
  Save,
} from 'lucide-react';
import { BusinessProfile, AdminUser } from '../types';
import { db } from '../data/mockDatabase';
import { BankDocumentPreviewModal } from '../components/BankDocumentPreviewModal';

interface AdminVerificationDeskProps {
  onSelectBusinessToView: (biz: BusinessProfile) => void;
  onRefreshList: () => void;
  currentAdminRole?: 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | string;
  currentAdminName?: string;
  currentAdminUser?: AdminUser | null;
}

export const AdminVerificationDesk: React.FC<AdminVerificationDeskProps> = ({
  onSelectBusinessToView,
  onRefreshList,
  currentAdminRole = 'SUPER_ADMIN',
  currentAdminName = 'Operations Administrator',
  currentAdminUser,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'HARD_LOCKED' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED' | 'BANK_PENDING'>('HARD_LOCKED');
  const [selectedBiz, setSelectedBiz] = useState<BusinessProfile | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [docPreviewType, setDocPreviewType] = useState<'CANCELLED_CHEQUE' | 'BANK_STATEMENT' | null>(null);
  const [showShutOffModal, setShowShutOffModal] = useState(false);
  const [shutOffReasonInput, setShutOffReasonInput] = useState('Administrative shut-off for verification re-audit');
  const [rejectionCode, setRejectionCode] = useState('DOC_MISMATCH');
  const [rejectionRemarks, setRejectionRemarks] = useState(
    'Bank account holder name does not match the legal corporate entity registered on the TAN/PAN document.'
  );
  const [challengeNotice, setChallengeNotice] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Commission Percentage (%) Entry & Live Auto-Calculation State
  const [commissionRateInput, setCommissionRateInput] = useState<number>(5);
  const [sampleDealValue, setSampleDealValue] = useState<number>(1000000);

  useEffect(() => {
    if (selectedBiz) {
      setCommissionRateInput(selectedBiz.commission_rate_pct ?? 5);
    }
  }, [selectedBiz?.business_id]);

  // Live auto-calculation based on entered percentage
  const calculatedCommissionAmount = ((sampleDealValue || 0) * (commissionRateInput || 0)) / 100;
  const calculatedOperatorNetAmount = (sampleDealValue || 0) - calculatedCommissionAmount;

  // Edit Business state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<BusinessProfile>>({});

  // Deactivate Business state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('Account Deactivated by Administration');
  const [deactivationSuccessData, setDeactivationSuccessData] = useState<{
    transferredAmount: number;
    payoutRef: string;
    bankName: string;
    accountMasked: string;
    ifsc: string;
  } | null>(null);

  // Permission check: Admin, Super Admin, and Manager accounts only
  const isAuthorizedRole =
    currentAdminRole === 'ADMIN' ||
    currentAdminRole === 'SUPER_ADMIN' ||
    currentAdminRole === 'MANAGER';

  const [searchCompany, setSearchCompany] = useState('');
  const allBusinesses = db.adminGetVerifications(filter);
  const businesses = allBusinesses.filter((b) => {
    if (!searchCompany.trim()) return true;
    const q = searchCompany.toLowerCase();
    return (
      b.organization_name.toLowerCase().includes(q) ||
      b.owner_name?.toLowerCase().includes(q) ||
      b.business_id.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.registration_number?.toLowerCase().includes(q)
    );
  });

  const handleApprove = (biz: BusinessProfile) => {
    // Save agreed custom commission percentage before or during approval
    db.updateBusinessCommissionRate(biz.business_id, commissionRateInput, currentAdminName);
    const res = db.adminApproveBusiness(biz.business_id);
    if (res.success && res.business) {
      setActionSuccess(res.message);
      setSelectedBiz({ ...res.business, commission_rate_pct: commissionRateInput });
      onRefreshList();
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleSaveCommissionRate = () => {
    if (!selectedBiz) return;
    const res = db.updateBusinessCommissionRate(selectedBiz.business_id, commissionRateInput, currentAdminName);
    if (res.success && res.business) {
      setSelectedBiz(res.business);
      setActionSuccess(res.message);
      onRefreshList();
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleHardLock = (biz: BusinessProfile) => {
    const res = db.adminHardLockBusiness(
      biz.business_id,
      'Your account has been hardLocked / Suspended by admin. Please contact to the admin for further details.'
    );
    if (res.success && res.business) {
      setActionSuccess(res.message);
      setSelectedBiz(res.business);
      onRefreshList();
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleOpenEdit = (biz: BusinessProfile) => {
    setSelectedBiz(biz);
    setEditFormData({
      organization_name: biz.organization_name,
      owner_name: biz.owner_name,
      phone_number: biz.phone_number,
      business_email: biz.business_email,
      physical_location: biz.physical_location,
      category: biz.category,
      subCategory: biz.subCategory,
      city: biz.city,
      country: biz.country,
      bank_name: biz.bank_name,
      bank_account_holder: biz.bank_account_holder,
      bank_account_number_masked: biz.bank_account_number_masked,
      bank_ifsc_swift: biz.bank_ifsc_swift,
      registration_number: biz.registration_number,
      reg_number_type: biz.reg_number_type,
      verification_status: biz.verification_status,
      account_status: biz.account_status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBiz) return;
    const res = db.adminModifyBusiness(selectedBiz.business_id, editFormData);
    if (res.success && res.business) {
      setShowEditModal(false);
      setSelectedBiz(res.business);
      setActionSuccess(res.message);
      onRefreshList();
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleOpenDeactivate = (biz: BusinessProfile) => {
    setSelectedBiz(biz);
    setDeactivationReason('Account Deactivated by Administration - Treasury settlement processed');
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = () => {
    if (!selectedBiz) return;
    const res = db.adminDeactivateBusinessAccount(
      selectedBiz.business_id,
      currentAdminName,
      currentAdminRole,
      deactivationReason
    );
    if (res.success && res.business) {
      setShowDeactivateModal(false);
      setDeactivationSuccessData({
        transferredAmount: res.transferredAmount,
        payoutRef: res.payoutRef,
        bankName: selectedBiz.bank_name || 'Registered Bank',
        accountMasked: selectedBiz.bank_account_number_masked || '••••8899',
        ifsc: selectedBiz.bank_ifsc_swift || 'N/A',
      });
      setSelectedBiz(res.business);
      setActionSuccess(
        `Account deactivated. All remaining balance of ₹${res.transferredAmount.toLocaleString()} has been transferred back to ${selectedBiz.bank_name || 'Registered Bank'} (${selectedBiz.bank_account_number_masked || '••••8899'}). Reference UTR: ${res.payoutRef}`
      );
      onRefreshList();
    }
  };

  const handleOpenReject = (biz: BusinessProfile) => {
    setSelectedBiz(biz);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!selectedBiz) return;
    const res = db.adminRejectBusiness(selectedBiz.business_id, rejectionCode, rejectionRemarks);
    if (res.success && res.business) {
      setShowRejectModal(false);
      setActionSuccess(res.message);
      setSelectedBiz(res.business);
      onRefreshList();
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleSendDomainChallenge = (biz: BusinessProfile) => {
    const res = db.adminSendDomainChallenge(biz.business_id);
    setChallengeNotice(res.message);
    onRefreshList();
    setTimeout(() => setChallengeNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Operations Verification Desk</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono border border-slate-700">
                GET /api/v1/admin/verifications
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              TRD Section 3.2 Step 3: Legal Document Audit against Govt Registries & Domain Email Authentication
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
          {(['ALL', 'HARD_LOCKED', 'VERIFIED', 'REJECTED', 'BANK_PENDING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter === st
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {st === 'BANK_PENDING' ? '🏦 Bank Verification Pending' : st}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {challengeNotice && (
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center space-x-2">
          <Mail className="w-4 h-4 shrink-0 text-sky-400" />
          <span>{challengeNotice}</span>
        </div>
      )}

      {/* Main Grid: Queue on Left, Inspection Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Queue (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Profiles Queue ({businesses.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Filter: {filter}</span>
          </div>

          {/* Quick Company Name Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search company name, owner, or UUID..."
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
            {searchCompany && (
              <button
                type="button"
                onClick={() => setSearchCompany('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {businesses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No organizations found matching the "{filter}" status filter.
              </div>
            ) : (
              businesses.map((b) => {
                const isSelected = selectedBiz?.business_id === b.business_id;
                return (
                  <div
                    key={b.business_id}
                    onClick={() => setSelectedBiz(b)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-850 hover:bg-slate-800/80 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white truncate">{b.organization_name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{b.business_email}</p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                          b.verification_status === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : b.verification_status === 'HARD_LOCKED'
                            ? 'bg-rose-500/20 text-rose-300'
                            : b.verification_status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {b.verification_status}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-750 pt-2">
                      <span className="font-mono">{b.reg_number_type}: {b.registration_number}</span>
                      <span>Country: {b.country}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed Verification Audit Desk (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          {selectedBiz ? (
            <div className="space-y-6">
              {/* Header & Status */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white">{selectedBiz.organization_name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        selectedBiz.verification_status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : selectedBiz.verification_status === 'HARD_LOCKED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {selectedBiz.verification_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    UUID: {selectedBiz.business_id}
                  </p>
                </div>

                <button
                  onClick={() => onSelectBusinessToView(selectedBiz)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                >
                  <span>View as Business</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Operations Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Operations Compliance Checklist:
                </h4>

                {/* Audit Item A: Legal Document Check */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white">
                        Check A: Legal Document Audit against Govt Registries
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Govt Registry Match
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mt-2 bg-slate-900/60 p-3 rounded-lg font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Submitted Reg Type:</span>
                      {selectedBiz.reg_number_type}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Identifier:</span>
                      {selectedBiz.registration_number}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Owner Legal Name:</span>
                      {selectedBiz.owner_name}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">File Attachment:</span>
                      {selectedBiz.inc_cert_file_name} ({(selectedBiz.inc_cert_file_size / 1024).toFixed(1)} KB)
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href={selectedBiz.inc_cert_doc_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono flex items-center space-x-1"
                    >
                      <span>Preview S3 KMS Encrypted Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Audit Item B: Domain Email Authentication Check */}
                <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold text-white">
                        Check B: Domain Email Authentication Check
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        selectedBiz.domain_verified
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {selectedBiz.domain_verified ? 'Domain Verified' : 'Challenge Awaiting'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Official Registered Domain: <span className="font-mono text-white">{selectedBiz.business_email}</span>
                  </p>
                  <button
                    onClick={() => handleSendDomainChallenge(selectedBiz)}
                    className="mt-1 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Domain Authentication Challenge Email</span>
                  </button>
                </div>

                {/* Audit Item C: Bank Coordinates & Verification */}
                {(() => {
                  const effectiveAdmin: AdminUser = currentAdminUser || {
                    admin_id: 'adm_current',
                    name: currentAdminName,
                    email: 'admin@truvaer.com',
                    role: (currentAdminRole as any) || 'ADMIN',
                    assigned_modules: ['ALL'],
                    department: currentAdminRole === 'SUPER_ADMIN' ? 'Senior Management Team' : 'Operations',
                    level: currentAdminRole === 'SUPER_ADMIN' ? 8 : 7,
                    level_title: currentAdminRole === 'SUPER_ADMIN' ? 'L8 - Executive Chairman & Super Admin' : 'L7 - Operations Director',
                  };
                  const hasBankAccess = db.canAdminAccessBankDetails(effectiveAdmin);

                  if (!hasBankAccess) {
                    return (
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Lock className="w-4 h-4 text-rose-400" />
                            <span className="text-xs font-bold text-white">Check C: Payout Banking Coordinates</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            RESTRICTED ACCESS
                          </span>
                        </div>
                        <p className="text-xs text-rose-300/90 bg-rose-950/40 p-3 rounded-lg border border-rose-900/50">
                          🔒 <strong>Permission Denied:</strong> Access to check beneficiary bank accounts, inspect verification documents (cancelled cheque / bank statement), and approve remittances is restricted strictly to the <strong>Finance Department</strong> and <strong>Administrators above Level 7 (L7/L8)</strong>.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg font-mono">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Beneficiary Title:</span>
                            <span>{selectedBiz.organization_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Bank Institution:</span>
                            <span>{selectedBiz.bank_name || 'Commercial Bank'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Account Number:</span>
                            <span className="text-slate-500 tracking-widest">•••••••••••• (Hidden)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">IFSC / SWIFT:</span>
                            <span className="text-slate-500 tracking-widest">•••••••• (Hidden)</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const isBankVerified = selectedBiz.finance_bank_verified === true;
                  const bankStatus = selectedBiz.bank_verification_status || (isBankVerified ? 'VERIFIED' : 'PENDING_VERIFICATION');

                  return (
                    <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Landmark className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white">Check C: Payout Banking Coordinates &amp; Verification</span>
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                            isBankVerified
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : bankStatus === 'REVOKED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : bankStatus === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isBankVerified ? '✓ Bank Verified (Remittances Unlocked)' : bankStatus === 'REVOKED' ? '⛔ Shut Off / Revoked' : bankStatus === 'REJECTED' ? '❌ Rejected' : '⏳ Pending Finance Verification'}
                        </span>
                      </div>

                      {/* Bank Coordinates Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg font-mono">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Account Holder:</span>
                          <strong className="text-white">{selectedBiz.bank_account_holder}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Account Masked:</span>
                          <strong className="text-amber-300">{selectedBiz.bank_account_number_masked}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">IFSC / SWIFT:</span>
                          <strong className="text-slate-200">{selectedBiz.bank_ifsc_swift}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Bank Institution:</span>
                          <strong className="text-white">{selectedBiz.bank_name}</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Uploaded by: <span className="text-white font-medium">{selectedBiz.bank_uploaded_by_user_name || selectedBiz.owner_name}</span> • <span className="text-slate-400 font-mono">{selectedBiz.bank_uploaded_at ? new Date(selectedBiz.bank_uploaded_at).toLocaleDateString() : 'Initial Registration'}</span>
                      </div>

                      {/* Verification Documents: Cancelled Cheque & Bank Statement */}
                      <div className="pt-2 border-t border-slate-750 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                            Attached Verification Proof (Audit Mandatory)
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">2 Documents</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDocPreviewType('CANCELLED_CHEQUE')}
                            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
                              <div className="truncate">
                                <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                                  Cancelled Cheque
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                                  {selectedBiz.cancelled_cheque_filename || 'Cancelled_Cheque.pdf'}
                                </div>
                              </div>
                            </div>
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 ml-1" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDocPreviewType('BANK_STATEMENT')}
                            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center justify-between group transition-colors cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div className="truncate">
                                <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                  Bank Statement
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                                  {selectedBiz.bank_statement_filename || 'Bank_Statement.pdf'}
                                </div>
                              </div>
                            </div>
                            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0 ml-1" />
                          </button>
                        </div>
                      </div>

                      {/* Bank Decision Action Buttons */}
                      <div className="pt-2 border-t border-slate-750 flex flex-wrap items-center gap-2">
                        {!isBankVerified ? (
                          <button
                            type="button"
                            onClick={() => {
                              const res = db.verifyBusinessBankAccount(selectedBiz.business_id, effectiveAdmin);
                              if (res.success && res.business) {
                                setSelectedBiz(res.business);
                                setActionSuccess(res.message);
                                onRefreshList();
                                setTimeout(() => setActionSuccess(null), 4000);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve &amp; Verify Bank Details</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const res = db.shutOffBusinessBankVerification(
                                selectedBiz.business_id,
                                effectiveAdmin,
                                'Administrative shut-off: verification suspended for compliance review'
                              );
                              if (res.success && res.business) {
                                setSelectedBiz(res.business);
                                setActionSuccess(res.message);
                                onRefreshList();
                                setTimeout(() => setActionSuccess(null), 4000);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-600/30 cursor-pointer"
                            title="Shut off bank verification to freeze payouts"
                          >
                            <PowerOff className="w-3.5 h-3.5" />
                            <span>Shut Off Bank Verification ("Toggle Off")</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const res = db.rejectBusinessBankVerification(
                              selectedBiz.business_id,
                              effectiveAdmin,
                              'Document mismatch or illegible cheque/statement. Re-upload required.'
                            );
                            if (res.success && res.business) {
                              setSelectedBiz(res.business);
                              setActionSuccess(res.message);
                              onRefreshList();
                              setTimeout(() => setActionSuccess(null), 4000);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject Bank Coordinates</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
                {/* Audit Item D: Agreed Commission Percentage (%) Entry & Live Auto-Calculation */}
                <div className="p-4 rounded-xl bg-slate-850 border border-amber-500/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-750">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Check D: Agreed Platform Commission Percentage (%) &amp; Auto-Calculation
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Percentage differs from one organization to another. Enters rate and calculates platform &amp; operator share live.
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                      Agreed Rate: {selectedBiz.commission_rate_pct ?? commissionRateInput}%
                    </span>
                  </div>

                  {/* Percentage Input and Sample Deal Calculator Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Left: Input commission percentage */}
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-300">
                          Agreed Commission Percentage (%)
                        </label>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {commissionRateInput}%
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={commissionRateInput}
                          onChange={(e) => setCommissionRateInput(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                          placeholder="e.g. 5.0"
                          className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 pl-8"
                        />
                        <Percent className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Presets:</span>
                        <div className="flex items-center space-x-1">
                          {[3, 5, 7.5, 10, 12].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setCommissionRateInput(pct)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                                commissionRateInput === pct
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveCommissionRate}
                        className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save &amp; Lock Commission Rate ({commissionRateInput}%)</span>
                      </button>
                    </div>

                    {/* Right: Live Automatic Calculation Box */}
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">
                          Live Auto-Calculated Value Preview
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Auto-Calculates
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="text-slate-400 text-[10px]">Reference Contract Value:</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400">₹</span>
                            <input
                              type="number"
                              step="50000"
                              value={sampleDealValue}
                              onChange={(e) => setSampleDealValue(parseFloat(e.target.value) || 0)}
                              className="w-24 bg-transparent text-right text-xs font-bold text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-amber-950/20 p-2 rounded-lg border border-amber-500/30">
                          <span className="text-amber-300 text-[10px]">
                            Platform Commission ({commissionRateInput}%):
                          </span>
                          <span className="text-amber-400 font-bold">
                            ₹{calculatedCommissionAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/30">
                          <span className="text-emerald-300 text-[10px]">
                            Operator Net Proceeds ({(100 - commissionRateInput).toFixed(1)}%):
                          </span>
                          <span className="text-emerald-400 font-bold">
                            ₹{calculatedOperatorNetAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit / Hard-Lock Suspend / Deactivate Account / Approve / Reject */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                {/* 1. Edit (Button) - Aside to Hard-Lock (For Admin, Super Admin, and Manager accounts only) */}
                {isAuthorizedRole && (
                  <button
                    id="admin-edit-biz-btn"
                    type="button"
                    onClick={() => handleOpenEdit(selectedBiz)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    title="Edit Business Profile & Bank Coordinates"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}

                {/* 2. Hard-Lock / Suspend Business */}
                {selectedBiz.verification_status === 'VERIFIED' ? (
                  <button
                    id="admin-hard-lock-btn"
                    type="button"
                    onClick={() => handleHardLock(selectedBiz)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Hard-Lock / Suspend Business</span>
                  </button>
                ) : (
                  <>
                    <button
                      id="admin-reject-btn"
                      type="button"
                      onClick={() => handleOpenReject(selectedBiz)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Profile & Request Fix</span>
                    </button>

                    <button
                      id="admin-approve-btn"
                      type="button"
                      onClick={() => handleApprove(selectedBiz)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Lift Hard-Lock</span>
                    </button>
                  </>
                )}

                {/* 3. Deactivate Account (Button) - Aside to Hard-Lock (For Admin, Super Admin, and Manager accounts only) */}
                {isAuthorizedRole && (
                  selectedBiz.account_status === 'DEACTIVATED' ? (
                    <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center space-x-2">
                      <Ban className="w-4 h-4 text-rose-400" />
                      <span>Account Deactivated (Balance Refunded)</span>
                    </div>
                  ) : (
                    <button
                      id="admin-deactivate-biz-btn"
                      type="button"
                      onClick={() => handleOpenDeactivate(selectedBiz)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                      title="Deactivate account and transfer all remaining balance back to bank account"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Deactivate Account</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Select an organization from the queue</p>
              <p className="text-xs text-slate-500 mt-1">
                Audit uploaded certificates, run domain authentication, and update gatekeeper verification status.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT BUSINESS MODAL (Admin, Super Admin, and Manager accounts only)       */}
      {/* ========================================================================= */}
      {showEditModal && selectedBiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Business Details</h3>
                  <p className="text-xs text-slate-400">{selectedBiz.organization_name} ({selectedBiz.business_id})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.organization_name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, organization_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Authorized Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.owner_name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, owner_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Business Email *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.business_email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, business_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Registered Phone *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone_number || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={editFormData.category || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sub-Category</label>
                  <input
                    type="text"
                    value={editFormData.subCategory || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, subCategory: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City / Aviation Hub</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    value={editFormData.country || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Bank Coordinates (Locked for Admin Editing per Rule 3) */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center space-x-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Registered Banking Coordinates (Modification Restricted)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium font-mono">
                    Owner Upload Only
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Modification is permitted strictly by the account owner who uploaded it (<span className="text-white font-mono">{selectedBiz?.owner_name} / {selectedBiz?.business_email}</span>). Updates require mandatory Cancelled Cheque &amp; Bank Statement resubmission.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Bank Name:</span>
                    <span className="text-white font-semibold truncate block">{selectedBiz?.bank_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Beneficiary:</span>
                    <span className="text-white font-semibold truncate block">{selectedBiz?.bank_account_holder || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Account Masked:</span>
                    <span className="text-amber-300">{selectedBiz?.bank_account_number_masked || '••••8899'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">IFSC / SWIFT:</span>
                    <span className="text-slate-300">{selectedBiz?.bank_ifsc_swift || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Status and Physical Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Verification Status</label>
                  <select
                    value={editFormData.verification_status || 'HARD_LOCKED'}
                    onChange={(e) => setEditFormData({ ...editFormData, verification_status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="HARD_LOCKED">HARD_LOCKED</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tax ID / Registration</label>
                  <input
                    type="text"
                    value={editFormData.registration_number || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, registration_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Save Business Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEACTIVATE BUSINESS ACCOUNT MODAL (Transfers balance to bank coordinates) */}
      {/* ========================================================================= */}
      {showDeactivateModal && selectedBiz && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-white tracking-tight">Deactivate Business Account</h3>
                <p className="text-xs text-slate-400">{selectedBiz.organization_name} • {selectedBiz.business_id}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Remaining Balance Card */}
            <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span>Remaining Balance To Refund</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  {(selectedBiz.corporate_wallet?.credit_balance ?? 0).toLocaleString()} Credits
                </span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                ₹{(selectedBiz.corporate_wallet?.credit_balance ?? 0).toLocaleString()} INR
              </div>
              <p className="text-[11px] text-purple-200 leading-relaxed">
                If the account deactivation is done, all the remaining balance of{' '}
                <strong className="text-white">₹{(selectedBiz.corporate_wallet?.credit_balance ?? 0).toLocaleString()}</strong> will be transferred back to the account details shared earlier.
              </p>
            </div>

            {/* Bank Coordinates Shared Earlier */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Account Details Shared Earlier (Recipient)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">VERIFIED PAYOUT GATEWAY</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Bank Institution:</span>
                  <span className="text-white font-semibold">{selectedBiz.bank_name || 'Registered Bank'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Masked:</span>
                  <span className="text-white font-semibold">{selectedBiz.bank_account_number_masked || '••••8899'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">IFSC / SWIFT:</span>
                  <span className="text-white font-semibold">{selectedBiz.bank_ifsc_swift || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Account Holder:</span>
                  <span className="text-white font-semibold">{selectedBiz.bank_account_holder || selectedBiz.organization_name}</span>
                </div>
              </div>
            </div>

            {/* Deactivation Reason / Audit Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Deactivation Reason / Audit Record
              </label>
              <textarea
                rows={2}
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Reason for corporate account deactivation..."
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center space-x-2 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Confirm Deactivate &amp; Transfer Balance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEACTIVATION BALANCE TRANSFER SUCCESS CONFIRMATION MODAL                  */}
      {/* ========================================================================= */}
      {deactivationSuccessData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">Account Deactivated &amp; Balance Refunded</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All remaining balance of <strong className="text-emerald-400 font-mono">₹{deactivationSuccessData.transferredAmount.toLocaleString()}</strong> has been successfully transferred back to the shared bank details:
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-left space-y-1 text-slate-300">
              <div>Bank: <span className="text-white">{deactivationSuccessData.bankName}</span></div>
              <div>Account: <span className="text-white">{deactivationSuccessData.accountMasked}</span></div>
              <div>IFSC: <span className="text-white">{deactivationSuccessData.ifsc}</span></div>
              <div>Bank Reference UTR: <span className="text-emerald-400 font-bold">{deactivationSuccessData.payoutRef}</span></div>
            </div>
            <button
              type="button"
              onClick={() => setDeactivationSuccessData(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedBiz && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reject Business Profile</h3>
                <p className="text-xs text-slate-400">{selectedBiz.organization_name}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Rejection Reason Code (TRD Section 4 Process B)
              </label>
              <select
                value={rejectionCode}
                onChange={(e) => setRejectionCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              >
                <option value="DOC_MISMATCH">DOC_MISMATCH (Tax Document does not match org name)</option>
                <option value="INVALID_TAX_ID">INVALID_TAX_ID (PAN/TAN failed registry checksum)</option>
                <option value="DOMAIN_UNREACHABLE">DOMAIN_UNREACHABLE (Corporate email domain ping failed)</option>
                <option value="SUSPICIOUS_BANK_DETAILS">SUSPICIOUS_BANK_DETAILS (Bank holder discrepancy)</option>
                <option value="BLURRY_DOCUMENT">BLURRY_DOCUMENT (Illegible certificate attachment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Compliance Review Remarks (Sent to user via Email)
              </label>
              <textarea
                rows={3}
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Confirm Rejection & Dispatch Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Verification Document Preview Modal */}
      {docPreviewType && selectedBiz && (
        <BankDocumentPreviewModal
          isOpen={!!docPreviewType}
          onClose={() => setDocPreviewType(null)}
          documentType={docPreviewType}
          business={selectedBiz}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  QrCode,
  Sliders,
  History,
  Lock,
  Globe,
  ArrowDownRight,
  Clock,
  FileCheck,
  Edit3,
  Eye,
  FileText,
  PowerOff,
  Landmark,
  Mail,
  Bell,
  Send,
  Check,
} from 'lucide-react';
import {
  BusinessProfile,
  WalletDebitRequest,
  TransactionReportFrequency,
  TransactionReportSubscription,
  DispatchedTransactionReport,
} from '../types';
import { db } from '../data/mockDatabase';
import { BankDetailsUpdateModal } from '../components/BankDetailsUpdateModal';
import { BankDocumentPreviewModal } from '../components/BankDocumentPreviewModal';

interface BusinessCorporateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessProfile;
  onWalletUpdated: () => void;
  isInline?: boolean;
}

const BUSINESS_RENEW_PACKS = [
  {
    id: 'pack_boost',
    title: 'Essential Communications Pack',
    credits: 500,
    priceInr: 5000,
    priceUsd: 65,
    tag: 'Starter',
  },
  {
    id: 'pack_growth',
    title: 'High-Volume Flight Desk Pack',
    credits: 2000,
    priceInr: 18000,
    priceUsd: 220,
    bonusCredits: 200,
    tag: 'Most Popular (+10% Bonus)',
  },
  {
    id: 'pack_enterprise',
    title: 'Enterprise Airline Fleet Pack',
    credits: 5000,
    priceInr: 40000,
    priceUsd: 490,
    bonusCredits: 1000,
    tag: 'Maximum Value (+20% Bonus)',
  },
];

export const BusinessCorporateWalletModal: React.FC<BusinessCorporateWalletModalProps> = ({
  isOpen,
  onClose,
  business,
  onWalletUpdated,
  isInline = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    'renew' | 'payout_request' | 'debit_status' | 'threshold_alerts' | 'transaction_reports' | 'autorenew' | 'history'
  >('renew');

  const [selectedGateway, setSelectedGateway] = useState<'RAZORPAY' | 'PAYPAL'>('RAZORPAY');
  const [selectedPack, setSelectedPack] = useState(BUSINESS_RENEW_PACKS[1]);
  const [customCredits, setCustomCredits] = useState<number>(1000);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [paymentSubMethod, setPaymentSubMethod] = useState<'CARD' | 'UPI_QR' | 'NETBANKING' | 'PAYPAL_WALLET'>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // Payout / Debit Request State (Requirement: Business user request for debit, finance releases, debit status shown to business user only)
  const [payoutAmount, setPayoutAmount] = useState<number>(150000);
  const [payoutReason, setPayoutReason] = useState<string>(
    'Monthly Air Charter Operations Disbursal & Fleet Fuel Clearance'
  );
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState<string | null>(null);
  const [creditLimitModal, setCreditLimitModal] = useState<{
    title: string;
    message: string;
    type: 'no_credits' | 'exceeds_balance' | 'capped_80';
    autoFixAmount?: number;
  } | null>(null);

  const [showBankUpdateModal, setShowBankUpdateModal] = useState(false);
  const [bankPreviewDocType, setBankPreviewDocType] = useState<'CANCELLED_CHEQUE' | 'BANK_STATEMENT' | null>(null);

  // Auto-renew settings state
  const existingAr = business.corporate_wallet?.auto_renew_settings || {
    enabled: true,
    thresholdCredits: 100,
    renewCredits: 500,
    paymentGateway: 'RAZORPAY' as 'RAZORPAY' | 'PAYPAL',
  };
  const [arEnabled, setArEnabled] = useState(existingAr.enabled);
  const [arThreshold, setArThreshold] = useState(existingAr.thresholdCredits);
  const [arRenewCredits, setArRenewCredits] = useState(existingAr.renewCredits);
  const [arGateway, setArGateway] = useState<'RAZORPAY' | 'PAYPAL'>(existingAr.paymentGateway);
  const [arSaveSuccess, setArSaveSuccess] = useState(false);

  // Custom User Low-Credit Threshold Alert State (Requirement: Option to set min credit limit e.g. 1000, automated mail to registered address + portal alert)
  const initialAlertSettings = db.getBusinessLowCreditAlertSettings(business.business_id);
  const [thresholdLimit, setThresholdLimit] = useState<number>(initialAlertSettings.thresholdCredits || 1000);
  const [thresholdEnabled, setThresholdEnabled] = useState<boolean>(initialAlertSettings.enabled);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(initialAlertSettings.notifyEmail);
  const [notifyWebPortal, setNotifyWebPortal] = useState<boolean>(initialAlertSettings.notifyWebPortal);
  const [customAlertEmail, setCustomAlertEmail] = useState<string>(
    initialAlertSettings.customEmailAddress || business.business_email || ''
  );
  const [thresholdNotice, setThresholdNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dispatchedAlerts, setDispatchedAlerts] = useState(db.getDispatchedThresholdAlerts(business.business_id));
  const [previewAlert, setPreviewAlert] = useState<any | null>(null);

  // Automated Transaction Reports Email Delivery State (Requirement: 24 hours, Weekly, Monthly email statements)
  const initialSub = db.getTransactionReportSubscription(business.business_id);
  const [reportSubEnabled, setReportSubEnabled] = useState(initialSub.enabled);
  const [reportFrequency, setReportFrequency] = useState<TransactionReportFrequency>(initialSub.frequency || '24_HOURS');
  const [reportEmail, setReportEmail] = useState(initialSub.recipient_email || business.business_email || '');
  const [includeCredits, setIncludeCredits] = useState(initialSub.include_credits ?? true);
  const [includeDebits, setIncludeDebits] = useState(initialSub.include_debits ?? true);
  const [reportNotice, setReportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dispatchedReports, setDispatchedReports] = useState(db.getDispatchedTransactionReports(business.business_id));
  const [previewingReport, setPreviewingReport] = useState<DispatchedTransactionReport | null>(null);
  const [isSendingInstantReport, setIsSendingInstantReport] = useState(false);

  const handleSaveReportSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateTransactionReportSubscription(business.business_id, {
      enabled: reportSubEnabled,
      frequency: reportFrequency,
      recipient_email: reportEmail.trim() || business.business_email,
      include_credits: includeCredits,
      include_debits: includeDebits,
    });
    setReportNotice({ type: res.success ? 'success' : 'error', message: res.message });
    setTimeout(() => setReportNotice(null), 5000);
  };

  const handleSendInstantReport = (freq?: TransactionReportFrequency) => {
    setIsSendingInstantReport(true);
    setTimeout(() => {
      const res = db.generateAndSendTransactionReport(business.business_id, freq || reportFrequency);
      setIsSendingInstantReport(false);
      setReportNotice({ type: res.success ? 'success' : 'error', message: res.message });
      setDispatchedReports(db.getDispatchedTransactionReports(business.business_id));
      setPreviewingReport(res.report);
      setTimeout(() => setReportNotice(null), 6000);
    }, 400);
  };

  const handleSaveThresholdSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateBusinessLowCreditAlertSettings(business.business_id, {
      enabled: thresholdEnabled,
      thresholdCredits: Number(thresholdLimit) || 1000,
      notifyEmail,
      notifyWebPortal,
      customEmailAddress: customAlertEmail.trim() || business.business_email,
    });
    if (res.success) {
      setThresholdNotice({ type: 'success', message: res.message });
      setDispatchedAlerts(db.getDispatchedThresholdAlerts(business.business_id));
      onWalletUpdated();
      setTimeout(() => setThresholdNotice(null), 5000);
    } else {
      setThresholdNotice({ type: 'error', message: res.message });
    }
  };

  const handleSendTestAlert = () => {
    const res = db.checkAndTriggerLowCreditThresholdAlert(business.business_id, true);
    if (res.triggered) {
      setThresholdNotice({
        type: 'success',
        message: `Alert dispatched to registered email (${customAlertEmail || business.business_email}) and Webportal in-app notifications!`,
      });
      setDispatchedAlerts(db.getDispatchedThresholdAlerts(business.business_id));
      onWalletUpdated();
      setTimeout(() => setThresholdNotice(null), 6000);
    } else {
      setThresholdNotice({ type: 'error', message: res.message });
    }
  };

  if (!isOpen) return null;

  const currentBalance = business.corporate_wallet?.credit_balance ?? 0;
  const transactions = business.corporate_wallet?.transactions || [];

  const isSuspendedOrDeactivated =
    business.verification_status === 'HARD_LOCKED' ||
    business.verification_status === 'REJECTED' ||
    business.is_hard_locked_by_admin === true ||
    business.account_status === 'DEACTIVATED' ||
    business.account_status === 'SUSPENDED';

  const maxWithdrawable = isSuspendedOrDeactivated ? currentBalance : Math.floor(currentBalance * 0.8);

  // Business debits (shown strictly to this business user only)
  const myDebitRequests = db
    .getWalletDebitRequests()
    .filter((r) => r.business_id === business.business_id);

  const creditsToAdd = isCustom ? Number(customCredits) || 100 : selectedPack.credits + (selectedPack.bonusCredits || 0);
  const amountToPay = isCustom
    ? selectedGateway === 'PAYPAL'
      ? Math.round(Number(customCredits) * 0.1)
      : Number(customCredits) * 9
    : selectedGateway === 'PAYPAL'
    ? selectedPack.priceUsd
    : selectedPack.priceInr;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentSuccess(null);

    setTimeout(() => {
      let methodLabel = 'Corporate Credit Card';
      if (selectedGateway === 'PAYPAL') {
        methodLabel = 'PayPal Express Verified Checkout';
      } else {
        if (paymentSubMethod === 'UPI_QR') methodLabel = 'UPI Dynamic Dynamic QR';
        else if (paymentSubMethod === 'NETBANKING') methodLabel = 'Corporate NetBanking';
        else methodLabel = 'Visa/Mastercard Tokenized Card';
      }

      const res = db.topUpBusinessWallet(
        business.business_id,
        selectedGateway,
        isCustom ? 'Custom Enterprise Credits Top-Up' : selectedPack.title,
        amountToPay,
        creditsToAdd,
        methodLabel
      );

      setIsProcessing(false);
      if (res.success) {
        setPaymentSuccess(res.message);
        onWalletUpdated();
      }
    }, 1200);
  };

  const handleSaveAutoRenew = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateBusinessAutoRenew(
      business.business_id,
      arEnabled,
      Number(arThreshold),
      Number(arRenewCredits),
      arGateway
    );

    if (res.success) {
      setArSaveSuccess(true);
      onWalletUpdated();
      setTimeout(() => setArSaveSuccess(false), 3000);
    }
  };

  const handleSubmitDebitPayout = (e: React.FormEvent) => {
    e.preventDefault();

    // 0. Check if registered bank is verified
    if (!business.finance_bank_verified) {
      setCreditLimitModal({
        title: 'Bank Verification Required',
        message: 'Payout remittances are held until your registered bank coordinates, Cancelled Cheque, and Bank Statement are audited and approved by the Finance Department or L7/L8 Administration. Please click "Update Bank Coordinates & Upload Proof" below to submit your verification documents.',
        type: 'no_credits',
      });
      return;
    }

    // 1. Check if balance is 0 or less
    if (currentBalance <= 0) {
      setCreditLimitModal({
        title: 'No Credits Available',
        message: 'Your corporate wallet balance is 0 Credits. No credits are available for payout or bank withdrawal.',
        type: 'no_credits',
      });
      return;
    }

    if (payoutAmount <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }

    // 2. Check if requested amount is beyond available balance
    if (payoutAmount > currentBalance) {
      setCreditLimitModal({
        title: 'No Credits Available',
        message: `No credits are available. Requested payout of ₹${payoutAmount.toLocaleString()} exceeds your total available balance of ${currentBalance.toLocaleString()} Credits. Please request an amount within your available credits.`,
        type: 'exceeds_balance',
        autoFixAmount: maxWithdrawable,
      });
      return;
    }

    // 3. Cap at 80% unless account is suspended or deactivated
    if (payoutAmount > maxWithdrawable && !isSuspendedOrDeactivated) {
      setCreditLimitModal({
        title: 'Withdrawal Capped at 80% Maximum',
        message: `Credit withdrawals for active accounts are capped at an 80% maximum reserve limit (${maxWithdrawable.toLocaleString()} Credits). Full amount (100%) can only be withdrawn if the account is suspended or deactivated, permitted by the finance department.`,
        type: 'capped_80',
        autoFixAmount: maxWithdrawable,
      });
      return;
    }

    setPayoutSubmitting(true);
    const res = db.requestBusinessDebitPayout(
      business.business_id,
      Number(payoutAmount),
      payoutReason
    );
    setPayoutSubmitting(false);

    if (res.success) {
      setPayoutSuccessMessage(res.message);
      onWalletUpdated();
      setTimeout(() => {
        setPayoutSuccessMessage(null);
        setActiveTab('debit_status');
      }, 2000);
    } else {
      setCreditLimitModal({
        title: 'Payout Request Blocked',
        message: res.message,
        type: res.message.includes('80%') ? 'capped_80' : 'exceeds_balance',
        autoFixAmount: maxWithdrawable,
      });
    }
  };

  const cardContent = (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl w-full shadow-2xl overflow-hidden flex flex-col ${isInline ? 'min-h-[640px]' : 'max-w-3xl max-h-[92vh]'}`}>
      {/* Modal Top Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">Corporate Finance &amp; Credit Desk</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  {business.organization_name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Self-service credits, Bank settlement verifications, Payout releases, and day-to-day transactions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Condition: HARD_LOCKED or REJECTED disables all services including withdrawal apart from Admin L7/L8 */}
        {(business.verification_status === 'HARD_LOCKED' || business.verification_status === 'REJECTED') && (
          <div className="mx-5 mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start space-x-3 shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-rose-100 uppercase tracking-wider">
                All Services &amp; Withdrawals On Hold: Status {business.verification_status}
              </h4>
              <p className="mt-1 text-rose-300/90 leading-relaxed">
                Your organization status is currently set to <span className="font-mono font-bold">{business.verification_status}</span>. Per platform compliance rules, all commercial services and self-service withdrawals are frozen. Strictly only the Level 7 (Managing Director) or Level 8 (Super Admin) executive team has authorization to process any payment or withdrawal disbursal.
              </p>
            </div>
          </div>
        )}

        {/* Current Balance & Bank Summary Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/20 p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-0.5">
              Available Corporate Balance
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {currentBalance.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-amber-400">Credits</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Direct chat debit rate: <span className="font-mono text-slate-300 font-bold">15 credits</span> per client inquiry initiation
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1 min-w-[240px]">
            <div className="flex items-center justify-between space-x-3">
              <span className="text-slate-400">Bank Verification:</span>
              <span
                className={`font-bold font-mono text-[11px] flex items-center space-x-1 ${
                  business.finance_bank_verified ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {business.finance_bank_verified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>In Review</span>
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-3 text-slate-300">
              <span className="text-slate-400">Beneficiary Bank:</span>
              <span className="font-semibold truncate max-w-[140px] text-right">
                {business.bank_name || 'HDFC Bank'} ({business.bank_account_number_masked || '••••8899'})
              </span>
            </div>
          </div>
        </div>

        {/* Low Credit Warning Banner (Triggered when balance is less than user configured threshold) */}
        {thresholdEnabled && currentBalance < thresholdLimit && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-start sm:items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-amber-100">Low Credit Balance Notice:</span>{' '}
                <span>
                  Your available balance ({currentBalance.toLocaleString()} Cr) is less than your configured threshold limit of {thresholdLimit.toLocaleString()} Cr. Automated email dispatched to registered address ({customAlertEmail || business.business_email}).
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('renew')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md"
            >
              Recharge Now
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('renew')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'renew'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Renew Credits (Razorpay / PayPal)</span>
          </button>

          <button
            onClick={() => setActiveTab('payout_request')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'payout_request'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Request Payout / Debit</span>
          </button>

          <button
            onClick={() => setActiveTab('debit_status')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'debit_status'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Payout &amp; Debit Status ({myDebitRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('threshold_alerts')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'threshold_alerts'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Threshold Email Alerts</span>
            {thresholdEnabled && currentBalance < thresholdLimit && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('transaction_reports')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'transaction_reports'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Transaction Mail (24h/Weekly/Monthly)</span>
          </button>

          <button
            onClick={() => setActiveTab('autorenew')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'autorenew'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Auto-Renew Threshold</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction Ledger</span>
          </button>
        </div>

        {/* Modal Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: RENEW CREDITS */}
          {activeTab === 'renew' && (
            <div className="space-y-6">
              {paymentSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{paymentSuccess}</span>
                </div>
              )}

              {/* Gateway Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1. Select Payment Processor
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('RAZORPAY')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      selectedGateway === 'RAZORPAY'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">Razorpay Secure India</div>
                      <div className="text-[11px] text-slate-400">Cards, UPI Auto-pay, NetBanking (INR ₹)</div>
                    </div>
                    {selectedGateway === 'RAZORPAY' && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('PAYPAL')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      selectedGateway === 'PAYPAL'
                        ? 'bg-sky-600/15 border-sky-500 text-white shadow-lg shadow-sky-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-white">PayPal International</div>
                      <div className="text-[11px] text-slate-400">Global Credit Cards &amp; PayPal Wallet (USD $)</div>
                    </div>
                    {selectedGateway === 'PAYPAL' && <CheckCircle2 className="w-5 h-5 text-sky-400" />}
                  </button>
                </div>
              </div>

              {/* Package Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  2. Select Credit Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUSINESS_RENEW_PACKS.map((pack) => {
                    const isSelected = !isCustom && selectedPack.id === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => {
                          setSelectedPack(pack);
                          setIsCustom(false);
                        }}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-750'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                              {pack.tag}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                          </div>
                          <div className="font-bold text-xs text-white mt-2">{pack.title}</div>
                          <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                            {pack.credits.toLocaleString()} Cr
                          </div>
                          {pack.bonusCredits && (
                            <div className="text-[10px] text-emerald-400 font-semibold">
                              +{pack.bonusCredits} Bonus Credits
                            </div>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono font-bold text-sm text-white">
                          {selectedGateway === 'PAYPAL' ? `$${pack.priceUsd}` : `₹${pack.priceInr.toLocaleString()}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Summary & Submit */}
              <form onSubmit={handleProcessPayment} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Total Purchase:</div>
                  <div className="text-xl font-bold font-mono text-white">
                    {creditsToAdd.toLocaleString()} Credits •{' '}
                    <span className="text-amber-400">
                      {selectedGateway === 'PAYPAL' ? `$${amountToPay}` : `₹${amountToPay.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant credit activation into corporate ledger</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-transform active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Contacting Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay Now via {selectedGateway}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: REQUEST PAYOUT / DEBIT (Requirement: Finance department release gate) */}
          {activeTab === 'payout_request' && (
            <form onSubmit={handleSubmitDebitPayout} className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs flex items-start space-x-3">
                <Landmark className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <h4 className="font-bold text-sm text-white">Finance Payment Settlement Request</h4>
                  <p className="mt-1 text-slate-300">
                    Submit a debit/payout request for your earned charter and aviation revenues. Per platform governance, all debit settlements are reviewed and released <strong>exclusively by the Finance &amp; Accounts Department</strong>.
                  </p>
                </div>
              </div>

              {payoutSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{payoutSuccessMessage}</span>
                </div>
              )}

              {/* Registered Bank Verification Notice */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Registered Settlement Bank Account</span>
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono w-fit flex items-center space-x-1 ${
                      business.finance_bank_verified
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : business.bank_verification_status === 'REVOKED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : business.bank_verification_status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {business.finance_bank_verified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>✓ Verified by Finance Desk (Remittances Active)</span>
                      </>
                    ) : business.bank_verification_status === 'REVOKED' ? (
                      <>
                        <PowerOff className="w-3 h-3 text-rose-400" />
                        <span>⛔ Verification Shut Off / Revoked</span>
                      </>
                    ) : business.bank_verification_status === 'REJECTED' ? (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        <span>❌ Verification Rejected (Re-upload Proof)</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>⏳ Pending Finance &amp; L7 Verification</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Bank Name</span>
                    <strong className="text-white">{business.bank_name || 'HDFC Bank Ltd'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Beneficiary Name</span>
                    <span className="text-slate-200">{business.bank_account_holder || business.organization_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Account Number</span>
                    <span className="font-mono text-amber-300">{business.bank_account_number_masked || '••••8899'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">IFSC / Swift</span>
                    <span className="font-mono text-slate-300">{business.bank_ifsc_swift || 'HDFC0001234'}</span>
                  </div>
                </div>

                {/* Attached Documents and Update Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Uploaded Proof:</span>
                    <button
                      type="button"
                      onClick={() => setBankPreviewDocType('CANCELLED_CHEQUE')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-[11px] font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Inspect Uploaded Cancelled Cheque"
                    >
                      <Landmark className="w-3 h-3 text-amber-400" />
                      <span>Cancelled Cheque</span>
                      <Eye className="w-3 h-3 text-slate-400 ml-1" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankPreviewDocType('BANK_STATEMENT')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white text-[11px] font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Inspect Uploaded Bank Statement"
                    >
                      <FileText className="w-3 h-3 text-emerald-400" />
                      <span>Bank Statement</span>
                      <Eye className="w-3 h-3 text-slate-400 ml-1" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBankUpdateModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Update Coordinates &amp; Upload Proof</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  Note: Payout funds will be transferred strictly to this verified registered bank account. Bank details modification is permitted strictly from the account owner who uploaded it.
                </p>
              </div>

              {/* Requirement Note: 80% Max Cap for Active Accounts & 100% for Suspended / Deactivated Accounts */}
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Platform Treasury Reserve &amp; Payout Policy</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSuspendedOrDeactivated
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isSuspendedOrDeactivated ? '100% Full Withdrawal Permitted' : '80% Max Reserve Cap Enforced'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Withdrawal Reserve Policy:</strong> Credit withdrawals for active accounts are capped at an{' '}
                  <strong>80% maximum</strong> reserve limit (max ₹{maxWithdrawable.toLocaleString()} / {maxWithdrawable} Cr).{' '}
                  <span className="text-amber-200 underline">
                    Full amount (100%) can be withdrawn only if the account is suspended or deactivated
                  </span>
                  , permitted by the finance department.
                </p>

                {/* Explicit Requirement Note Banner */}
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Note:</strong> Full amount can be withdrawn only if the account is suspended or Deactivated.
                  </span>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400">
                    Max Permitted Payout ({isSuspendedOrDeactivated ? '100%' : '80%'}):{' '}
                    <strong className="text-white font-mono">₹{maxWithdrawable.toLocaleString()}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(maxWithdrawable)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-[11px] cursor-pointer transition-colors"
                  >
                    {isSuspendedOrDeactivated ? 'Withdraw Full 100%' : 'Auto-Fill 80% Max'} (₹{maxWithdrawable.toLocaleString()})
                  </button>
                </div>
              </div>

              {/* Amount and Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Requested Payout Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value) || 0)}
                    placeholder="e.g. 150000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Settlement Purpose / Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutReason}
                    onChange={(e) => setPayoutReason(e.target.value)}
                    placeholder="e.g. VIP Charter Flight settlement"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  payoutSubmitting ||
                  business.verification_status === 'HARD_LOCKED' ||
                  business.verification_status === 'REJECTED'
                }
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  business.verification_status === 'HARD_LOCKED' ||
                  business.verification_status === 'REJECTED'
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95'
                }`}
              >
                {business.verification_status === 'HARD_LOCKED' ||
                business.verification_status === 'REJECTED' ? (
                  <>
                    <Lock className="w-4 h-4 text-rose-400" />
                    <span>Withdrawals Put On Hold (Only L7/L8 Admin Can Process)</span>
                  </>
                ) : payoutSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting to Finance...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Submit Payout Request to Finance</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: DEBIT & PAYOUT STATUS (Requirement: debit status should be shown to the business users only) */}
          {activeTab === 'debit_status' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    My Payout &amp; Debit Settlements Ledger
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Confidential settlement records visible exclusively to your authorized business profile.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('payout_request')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer"
                >
                  + New Payout Request
                </button>
              </div>

              {myDebitRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <Landmark className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                  <p className="font-semibold text-slate-400">No debit requests logged yet.</p>
                  <p className="text-[11px] mt-1 text-slate-500">
                    Click &quot;Request Payout / Debit&quot; above to initiate a disbursement to your verified bank account.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myDebitRequests.map((req) => {
                    const isReleased = req.status === 'RELEASED_BY_FINANCE';
                    const isRejected = req.status === 'REJECTED';
                    const isPending = !isReleased && !isRejected;

                    return (
                      <div
                        key={req.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md hover:border-slate-750 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-amber-400 text-xs font-bold">{req.id}</span>
                              <span className="text-white text-xs font-bold">{req.reason}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Requested: {new Date(req.created_at).toLocaleString()}
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-bold font-mono text-white">
                              ₹{req.amount.toLocaleString()}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                                isReleased
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isRejected
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {isReleased
                                ? '✓ RELEASED TO BANK'
                                : isRejected
                                ? 'REJECTED BY ACCOUNTS'
                                : 'IN REVIEW BY FINANCE'}
                            </span>
                          </div>
                        </div>

                        {/* Status Details */}
                        {isReleased ? (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
                            <div className="flex items-center space-x-2 font-bold text-emerald-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Disbursal Approved &amp; Dispatched by Finance Desk</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                              <div>
                                <span className="text-emerald-400/80 block text-[9px] uppercase">Bank Route:</span>
                                <strong>{req.bank_name || 'HDFC Bank'} ({req.bank_account_number_masked || '••••8899'})</strong>
                              </div>
                              <div>
                                <span className="text-emerald-400/80 block text-[9px] uppercase">UTR Reference:</span>
                                <span className="font-mono text-white">{req.payout_utr_reference}</span>
                              </div>
                              <div>
                                <span className="text-emerald-400/80 block text-[9px] uppercase">Released By:</span>
                                <span>{req.finance_released_by}</span>
                              </div>
                            </div>
                          </div>
                        ) : isRejected ? (
                          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
                            <strong className="block text-rose-300">Rejection Justification:</strong>
                            <p className="mt-0.5">{req.rejection_reason || 'Bank documentation mismatch or clarification required.'}</p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                              <span>Awaiting Finance Department verification &amp; release</span>
                            </div>
                            <span className="text-[10px] text-amber-400/90 font-mono">
                              Bank: {req.bank_name} ({req.bank_account_number_masked})
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUTO-RENEW CONFIGURATION */}
          {activeTab === 'autorenew' && (
            <form onSubmit={handleSaveAutoRenew} className="space-y-4">
              {arSaveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Auto-renew configuration saved successfully!</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Enable Switch */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">Automated Fleet Top-Up</div>
                    <div className="text-[11px] text-slate-400">
                      Prevent chat inquiries from stalling when credit balance drops
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArEnabled(!arEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      arEnabled ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                        arEnabled ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Threshold */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Trigger Threshold (Credits)
                  </label>
                  <p className="text-xs text-slate-400">
                    When balance falls to or below this amount, auto-renew activates automatically.
                  </p>
                  <div className="flex items-center space-x-3 pt-1">
                    <input
                      type="number"
                      min="15"
                      max="10000"
                      step="15"
                      value={arThreshold}
                      onChange={(e) => setArThreshold(parseInt(e.target.value) || 15)}
                      className="w-36 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                    />
                    <span className="text-xs text-amber-400 font-semibold font-mono">Credits minimum limit</span>
                  </div>
                </div>

                {/* Top-Up Amount */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Auto-Renew Top-Up Amount (Credits)
                  </label>
                  <p className="text-xs text-slate-400">
                    Number of credits to automatically purchase upon hitting the threshold.
                  </p>
                  <div className="flex items-center space-x-3 pt-1">
                    <input
                      type="number"
                      min="100"
                      max="20000"
                      step="100"
                      value={arRenewCredits}
                      onChange={(e) => setArRenewCredits(parseInt(e.target.value) || 100)}
                      className="w-36 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                    />
                    <span className="text-xs text-slate-300 font-mono">Credits added per reload</span>
                  </div>
                </div>

                {/* Preferred Gateway */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Preferred Auto-Debit Gateway
                  </label>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setArGateway('RAZORPAY')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer ${
                        arGateway === 'RAZORPAY'
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Razorpay (INR ₹)</span>
                      {arGateway === 'RAZORPAY' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setArGateway('PAYPAL')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer ${
                        arGateway === 'PAYPAL'
                          ? 'bg-sky-600/20 border-sky-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>PayPal (USD $)</span>
                      {arGateway === 'PAYPAL' && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Save Auto-Renew Configuration
              </button>
            </form>
          )}

          {/* TAB 4.5: THRESHOLD EMAIL & WEBPORTAL ALERTS */}
          {activeTab === 'threshold_alerts' && (
            <div className="space-y-6">
              {thresholdNotice && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-center space-x-2.5 ${
                    thresholdNotice.type === 'success'
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {thresholdNotice.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{thresholdNotice.message}</span>
                </div>
              )}

              {/* Section 1: Configuration Form */}
              <form
                onSubmit={handleSaveThresholdSettings}
                className="space-y-5 bg-slate-950/80 p-5 rounded-3xl border border-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Custom Low-Credit Threshold &amp; Automated Email Settings</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Set your minimum credit threshold (e.g. 1000 Credits). When your balance falls below this limit, an automated notice is sent to your registered email and as an in-app follow-up on the Webportal.
                    </p>
                  </div>

                  {/* Master Active Switch */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs text-slate-400 font-semibold">
                      {thresholdEnabled ? 'Alerts Active' : 'Alerts Disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setThresholdEnabled(!thresholdEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        thresholdEnabled ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                          thresholdEnabled ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Threshold Limit Option */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Custom Minimum Credit Limit Threshold (Credits) <span className="text-rose-400">*</span>
                  </label>
                  <p className="text-xs text-slate-400">
                    Configure the exact minimum balance that triggers notifications. For example, 1000 Credits.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <input
                      type="number"
                      min="10"
                      max="100000"
                      step="10"
                      required
                      value={thresholdLimit}
                      onChange={(e) => setThresholdLimit(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-40 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-mono text-amber-400 font-semibold">Credits minimum limit</span>

                    {/* Quick Presets */}
                    <div className="flex items-center space-x-1.5 ml-auto">
                      <span className="text-[11px] text-slate-500">Presets:</span>
                      {[500, 1000, 2000, 5000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setThresholdLimit(preset)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            thresholdLimit === preset
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {preset} Cr
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Registered Email Destination */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Registered Business Email Address Destination
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified Registered Email
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Automated email notifications are dispatched directly to your official registered business address.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                    <div className="flex-1 relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={customAlertEmail}
                        onChange={(e) => setCustomAlertEmail(e.target.value)}
                        placeholder="e.g. corporate@truvaer.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomAlertEmail(business.business_email || 'corporate@truvaer.com')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Reset to Registered Email
                    </button>
                  </div>
                </div>

                {/* Notification Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-white block">Registered Email Dispatch</span>
                      <span className="text-slate-400 text-[11px] block">
                        Dispatches formal email mentioning threshold, current balance, and recharge steps.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyWebPortal}
                      onChange={(e) => setNotifyWebPortal(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-white block">Webportal In-App Alert</span>
                      <span className="text-slate-400 text-[11px] block">
                        Triggers immediate follow-up notification on the Webportal notification center.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleSendTestAlert}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Alert to Registered Mail</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Threshold Settings</span>
                  </button>
                </div>
              </form>

              {/* Section 2: Dispatched Threshold Alerts Ledger (Registered Mail Outbox) */}
              <div className="space-y-3 bg-slate-950/80 p-5 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span>Registered Email Alerts &amp; Portal Notification Log</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Audit history of low-credit notifications dispatched to your registered address and webportal.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {dispatchedAlerts.length} Dispatched
                  </span>
                </div>

                {dispatchedAlerts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/60 rounded-2xl border border-slate-800/80">
                    No threshold notifications sent yet. Click &ldquo;Send Test Alert to Registered Mail&rdquo; above to verify dispatch.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {dispatchedAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white truncate">{alert.email_subject}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {alert.delivery_status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>To: <strong className="text-slate-300 font-mono">{alert.recipient_email}</strong></span>
                            <span>•</span>
                            <span>Balance: <strong className="text-amber-400 font-mono">{alert.current_balance} Cr</strong></span>
                            <span>•</span>
                            <span>Threshold: <strong className="text-slate-300 font-mono">{alert.threshold_credits} Cr</strong></span>
                            <span>•</span>
                            <span className="text-slate-500">{new Date(alert.sent_at).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewAlert(alert)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer shrink-0 flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>View Email</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: AUTOMATED TRANSACTION REPORTS VIA EMAIL (24 Hours, Weekly, Monthly) */}
          {activeTab === 'transaction_reports' && (
            <div className="space-y-6">
              {reportNotice && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-center space-x-2.5 ${
                    reportNotice.type === 'success'
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {reportNotice.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <span>{reportNotice.message}</span>
                </div>
              )}

              {/* Configuration Form */}
              <form
                onSubmit={handleSaveReportSubscription}
                className="space-y-5 bg-slate-950/80 p-5 rounded-3xl border border-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-sky-400" />
                      <span>Credit &amp; Debit Transaction Email Reports</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Receive comprehensive statement reports of all credits and debits delivered directly to your registered email address at your preferred interval.
                    </p>
                  </div>

                  {/* Master Active Switch */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs text-slate-400 font-semibold">
                      {reportSubEnabled ? 'Email Delivery Active' : 'Delivery Paused'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReportSubEnabled(!reportSubEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        reportSubEnabled ? 'bg-sky-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                          reportSubEnabled ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Customizable Time Intervals: 24h, Weekly, Monthly */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Statement Delivery Frequency:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setReportFrequency('24_HOURS')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        reportFrequency === '24_HOURS'
                          ? 'bg-sky-950/60 border-sky-400 shadow-md ring-1 ring-sky-500/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Daily / 24 Hours</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            reportFrequency === '24_HOURS'
                              ? 'border-sky-400 bg-sky-500 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {reportFrequency === '24_HOURS' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                        Dispatched every 24 hours summarizing daily transactions, credit top-ups, and lead unlocks.
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                        24h Recurring
                      </span>
                    </div>

                    <div
                      onClick={() => setReportFrequency('WEEKLY')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        reportFrequency === 'WEEKLY'
                          ? 'bg-sky-950/60 border-sky-400 shadow-md ring-1 ring-sky-500/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Weekly Statement</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            reportFrequency === 'WEEKLY'
                              ? 'border-sky-400 bg-sky-500 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {reportFrequency === 'WEEKLY' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                        7-day aggregated ledger of all credit additions, debit payouts, and corporate inquiries.
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Every 7 Days
                      </span>
                    </div>

                    <div
                      onClick={() => setReportFrequency('MONTHLY')}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        reportFrequency === 'MONTHLY'
                          ? 'bg-sky-950/60 border-sky-400 shadow-md ring-1 ring-sky-500/30'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Monthly Ledger</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            reportFrequency === 'MONTHLY'
                              ? 'border-sky-400 bg-sky-500 text-slate-950'
                              : 'border-slate-600'
                          }`}
                        >
                          {reportFrequency === 'MONTHLY' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                        Official monthly reconciliation statement with opening and closing corporate balances.
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        Every 30 Days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registered Email Destination */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Destination Registered Email Address:
                    </label>
                    <span className="text-[10px] text-sky-400 font-mono">
                      Verified Business Contact
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      placeholder="corporate.ops@domain.aero"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                {/* Granular Filters */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCredits}
                      onChange={(e) => setIncludeCredits(e.target.checked)}
                      className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 w-4 h-4 bg-slate-900"
                    />
                    <span>Include Credit Additions &amp; Top-Ups</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDebits}
                      onChange={(e) => setIncludeDebits(e.target.checked)}
                      className="rounded border-slate-700 text-sky-600 focus:ring-sky-500 w-4 h-4 bg-slate-900"
                    />
                    <span>Include Debit Disbursals &amp; Charges</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleSendInstantReport()}
                    disabled={isSendingInstantReport}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingInstantReport ? 'Compiling & Sending...' : 'Send Immediate Report Now (Test Delivery)'}</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Delivery Preferences</span>
                  </button>
                </div>
              </form>

              {/* Section 2: Dispatched Statements Archive */}
              <div className="space-y-3 bg-slate-950/80 p-5 rounded-3xl border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Dispatched Statements &amp; Email Delivery History</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Audit trail of transaction statements delivered to your registered email address.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {dispatchedReports.length} Delivered
                  </span>
                </div>

                {dispatchedReports.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/60 rounded-2xl border border-slate-800/80">
                    No transaction statements sent yet. Click &ldquo;Send Immediate Report Now&rdquo; above to generate and inspect your first statement.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {dispatchedReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white truncate">{report.subject}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              {report.frequency}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>To: <strong className="text-slate-300 font-mono">{report.recipient_email}</strong></span>
                            <span>•</span>
                            <span>Credits: <strong className="text-emerald-400 font-mono">+{report.total_credits_volume} Cr</strong></span>
                            <span>•</span>
                            <span>Debits: <strong className="text-rose-400 font-mono">-{report.total_debits_volume} Cr</strong></span>
                            <span>•</span>
                            <span>Balance: <strong className="text-sky-300 font-mono">{report.closing_balance} Cr</strong></span>
                            <span>•</span>
                            <span className="text-slate-500">{new Date(report.dispatched_at).toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setPreviewingReport(report)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer shrink-0 flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>Inspect Email</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TRANSACTIONS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No corporate transactions recorded yet.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-750 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white">{tx.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.timestamp).toLocaleString()} • {tx.actionType}
                      </div>
                    </div>
                    <div
                      className={`font-mono font-black text-sm text-right shrink-0 ml-3 ${
                        tx.credits >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.credits >= 0 ? `+${tx.credits.toLocaleString()}` : tx.credits.toLocaleString()} Cr
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
    </div>
  );

  const subModals = (
    <>
      {/* Credit Limit / No Credits / 80% Cap Popup Modal */}
      {creditLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-white tracking-tight">{creditLimitModal.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{creditLimitModal.message}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2.5">
              {creditLimitModal.autoFixAmount !== undefined && creditLimitModal.autoFixAmount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPayoutAmount(creditLimitModal.autoFixAmount!);
                    setCreditLimitModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-colors"
                >
                  Set to Max (₹{creditLimitModal.autoFixAmount.toLocaleString()})
                </button>
              )}
              <button
                type="button"
                onClick={() => setCreditLimitModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Update Modal (Rule 3: Owner Upload Only) */}
      {showBankUpdateModal && (
        <BankDetailsUpdateModal
          isOpen={showBankUpdateModal}
          onClose={() => setShowBankUpdateModal(false)}
          business={business}
          onSuccess={() => {
            onWalletUpdated();
          }}
        />
      )}

      {/* Bank Document Preview Modal */}
      {bankPreviewDocType && (
        <BankDocumentPreviewModal
          isOpen={!!bankPreviewDocType}
          onClose={() => setBankPreviewDocType(null)}
          documentType={bankPreviewDocType}
          business={business}
        />
      )}

      {/* Registered Email Body Preview Modal */}
      {previewAlert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Registered Email Notification Dispatched</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAlert(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">From:</span> treasury-alerts@truvaer.com
                </div>
                <div>
                  <span className="text-slate-500">To:</span> {previewAlert.recipient_email}
                </div>
                <div>
                  <span className="text-slate-500">Subject:</span> {previewAlert.email_subject}
                </div>
                <div>
                  <span className="text-slate-500">Date:</span> {new Date(previewAlert.sent_at).toUTCString()}
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>{' '}
                  <span className="text-emerald-400 font-bold">
                    {previewAlert.delivery_status} (Registered Address Confirmed)
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {previewAlert.email_body}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statement Preview Modal */}
      {previewingReport && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Delivered Email Statement Preview</h3>
              </div>
              <button
                onClick={() => setPreviewingReport(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto bg-slate-950/60 max-h-[75vh]">
              <div
                dangerouslySetInnerHTML={{ __html: previewingReport.html_preview }}
              />
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewingReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isInline) {
    return (
      <div className="w-full space-y-4">
        {cardContent}
        {subModals}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      {cardContent}
      {subModals}
    </div>
  );
};

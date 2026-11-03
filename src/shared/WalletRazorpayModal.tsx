import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  History,
  Layers,
  Sparkles,
  Lock,
  ChevronRight,
  RefreshCw,
  Mail,
  Check,
  FileText,
  Eye,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  RegularUser,
  DigitalWallet,
  TransactionReportFrequency,
  TransactionReportSubscription,
  DispatchedTransactionReport,
} from '../types';

interface WalletRazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: RegularUser;
  onWalletUpdated: () => void;
  isInline?: boolean;
}

const CREDIT_PACKAGES = [
  {
    id: 'pkg_starter',
    title: 'Starter Aviator Pack',
    inrAmount: 500,
    credits: 500,
    bonusCredits: 0,
    popular: false,
    badge: 'Standard',
  },
  {
    id: 'pkg_pro',
    title: 'Aviator Pro Pack',
    inrAmount: 2000,
    credits: 2200,
    bonusCredits: 200,
    popular: true,
    badge: '+10% Extra Credits',
  },
  {
    id: 'pkg_fleet',
    title: 'Enterprise Fleet Pack',
    inrAmount: 5000,
    credits: 6000,
    bonusCredits: 1000,
    popular: false,
    badge: '+20% Extra Credits',
  },
];

export const WalletRazorpayModal: React.FC<WalletRazorpayModalProps> = ({
  isOpen,
  onClose,
  user,
  onWalletUpdated,
  isInline = false,
}) => {
  const [activeTab, setActiveTab] = useState<'topup' | 'transfer' | 'conversions' | 'history' | 'email_reports'>('topup');
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'UPI_ID' | 'CARD' | 'NETBANKING'>('UPI_QR');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<string | null>(null);

  // Transfer state
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Automated Email Transaction Reports State (24 hours, Weekly, Monthly)
  const initialSub = db.getTransactionReportSubscription(user.user_id);
  const [reportSubEnabled, setReportSubEnabled] = useState(initialSub.enabled);
  const [reportFrequency, setReportFrequency] = useState<TransactionReportFrequency>(initialSub.frequency || '24_HOURS');
  const [reportEmail, setReportEmail] = useState(initialSub.recipient_email || user.email);
  const [reportNotice, setReportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dispatchedReports, setDispatchedReports] = useState(db.getDispatchedTransactionReports(user.user_id));
  const [previewingReport, setPreviewingReport] = useState<DispatchedTransactionReport | null>(null);
  const [isSendingInstantReport, setIsSendingInstantReport] = useState(false);

  const handleSaveReportSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.updateTransactionReportSubscription(user.user_id, {
      enabled: reportSubEnabled,
      frequency: reportFrequency,
      recipient_email: reportEmail.trim() || user.email,
    });
    setReportNotice({ type: res.success ? 'success' : 'error', message: res.message });
    setTimeout(() => setReportNotice(null), 5000);
  };

  const handleSendInstantReport = () => {
    setIsSendingInstantReport(true);
    setTimeout(() => {
      const res = db.generateAndSendTransactionReport(user.user_id, reportFrequency);
      setIsSendingInstantReport(false);
      setReportNotice({ type: res.success ? 'success' : 'error', message: res.message });
      setDispatchedReports(db.getDispatchedTransactionReports(user.user_id));
      setPreviewingReport(res.report);
      setTimeout(() => setReportNotice(null), 6000);
    }, 400);
  };

  if (!isOpen) return null;

  const wallet: DigitalWallet = user.wallet || {
    wallet_id: 'wal_temp',
    purchased_credits: 0,
    earned_credits: 0,
    balance: 0,
    currency: 'INR',
    provisioned_at: new Date().toISOString(),
    transactions: [],
    conversionHistory: [],
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setPaymentSuccessData(null);

    setTimeout(() => {
      let methodLabel = 'UPI QR Scan';
      if (paymentMethod === 'UPI_ID') methodLabel = `UPI (${upiIdInput || 'aviator@okhdfcbank'})`;
      else if (paymentMethod === 'CARD') methodLabel = 'Visa / Mastercard (RBI Tokenized)';
      else if (paymentMethod === 'NETBANKING') methodLabel = 'Corporate NetBanking';

      const res = db.topUpWalletViaRazorpay(
        user.user_id,
        selectedPackage.title,
        selectedPackage.inrAmount,
        selectedPackage.credits,
        selectedPackage.bonusCredits,
        methodLabel
      );

      setIsProcessing(false);
      if (res.success) {
        setPaymentSuccessData(res.message);
        onWalletUpdated();
      }
    }, 1200);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferMessage(null);
    const amt = parseInt(transferAmount, 10);

    const res = db.transferCredits(user.user_id, transferRecipient, amt);
    if (res.success) {
      setTransferMessage({ type: 'success', text: res.message });
      setTransferAmount('');
      setTransferRecipient('');
      onWalletUpdated();
    } else {
      setTransferMessage({ type: 'error', text: res.message });
    }
  };

  const cardContent = (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col ${isInline ? 'min-h-[640px]' : 'max-w-3xl max-h-[90vh]'}`}>
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Truvaer Unified Credit Wallet</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  Razorpay Live
                </span>
              </div>
              <p className="text-xs text-slate-400">Powered by Yarifly Sovereign Ledger & Auto-Debit Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Overview Banner */}
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 p-5 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Total Credit Balance</span>
            <div className="text-2xl font-black text-white mt-0.5 flex items-baseline space-x-1.5">
              <span>{wallet.balance.toLocaleString()}</span>
              <span className="text-xs font-normal text-blue-400">Credits</span>
            </div>
            <span className="text-[11px] text-slate-400">≈ ₹{wallet.balance.toLocaleString()} INR Equivalent</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Purchased Credits</span>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              {wallet.purchased_credits.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">Debitable across all portals & ads</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Earned Credits</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {wallet.earned_credits.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">Onboarding & Review Bounties</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-5 pt-3 bg-slate-950/30 space-x-4">
          <button
            onClick={() => setActiveTab('topup')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'topup'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Razorpay Top-up</span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'transfer'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>P2P Credit Transfer</span>
          </button>

          <button
            onClick={() => setActiveTab('conversions')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'conversions'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Conversion Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Full Transaction Log</span>
          </button>

          <button
            onClick={() => setActiveTab('email_reports')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'email_reports'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Reports (24h/Weekly/Monthly)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: TOP-UP VIA RAZORPAY */}
          {activeTab === 'topup' && (
            <div className="space-y-6">
              {paymentSuccessData && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-sm">Payment Captured Successfully!</div>
                    <div className="mt-1">{paymentSuccessData}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  1. Select Credit Top-Up Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                        selectedPackage.id === pkg.id
                          ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/80'
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {pkg.badge}
                        </span>
                      )}
                      <div className="text-xs font-semibold text-slate-300">{pkg.title}</div>
                      <div className="text-xl font-bold text-white mt-1">₹{pkg.inrAmount.toLocaleString()}</div>
                      <div className="text-xs font-mono text-emerald-400 font-semibold mt-1">
                        +{pkg.credits.toLocaleString()} Credits
                      </div>
                      {pkg.bonusCredits > 0 && (
                        <div className="text-[10px] text-amber-400 mt-0.5">
                          Includes {pkg.bonusCredits} Bonus Credits
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  2. Choose Native Payment Method (Razorpay India Gateway)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_QR')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'UPI_QR'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>UPI Dynamic QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_ID')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'UPI_ID'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>UPI ID (VPA)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'CARD'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Cards (Tokenized)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NETBANKING')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'NETBANKING'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <span>NetBanking</span>
                  </button>
                </div>
              </div>

              {/* Payment Details Preview */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                {paymentMethod === 'UPI_QR' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-white text-sm">Scan to Pay via any UPI App</div>
                      <div className="text-slate-400 mt-1">Google Pay, PhonePe, Paytm, BHIM or Cred</div>
                      <div className="text-[11px] text-emerald-400 font-mono mt-2">
                        Amount: ₹{selectedPackage.inrAmount.toLocaleString()} • Credits: +{selectedPackage.credits.toLocaleString()}
                      </div>
                    </div>
                    {/* Simulated QR Box */}
                    <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                      <div className="w-full h-full border-2 border-slate-900 border-dashed rounded flex flex-col items-center justify-center text-slate-900 font-mono text-[9px] font-bold">
                        <QrCode className="w-12 h-12 text-slate-950 mb-1" />
                        <span>UPI QR LIVE</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'UPI_ID' && (
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Enter your UPI VPA Handle</label>
                    <input
                      type="text"
                      placeholder="aditya@okhdfcbank"
                      value={upiIdInput}
                      onChange={(e) => setUpiIdInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">A payment collect request will be triggered on your UPI app.</p>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Card Number (Simulated Tokenization)</span>
                      <span className="font-mono text-sky-400">Visa / RuPay / Mastercard</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono flex items-center justify-between">
                      <span>4532 •••• •••• 8912</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">TOKENIZED</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Corporate'].map((bank) => (
                      <div key={bank} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-medium text-[11px]">
                        {bank}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with Razorpay Webhook...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pay ₹{selectedPackage.inrAmount.toLocaleString()} & Add {selectedPackage.credits.toLocaleString()} Credits</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: P2P CREDIT TRANSFER */}
          {activeTab === 'transfer' && (
            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 flex items-start space-x-3">
                <Send className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Peer-to-Peer Unified Credit Routing</div>
                  <p className="mt-0.5 text-slate-300">
                    Instantly transfer purchased credits to any verified aviator or enterprise in the Truvaer ecosystem.
                    Zero gateway fees.
                  </p>
                </div>
              </div>

              {transferMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                    transferMessage.type === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/40 border border-rose-500/30 text-rose-200'
                  }`}
                >
                  {transferMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{transferMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Aviator Username or Corporate Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. cadet_kapoor or kapoor@truvaer.com"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Credit Amount to Transfer
                </label>
                <input
                  type="number"
                  min="1"
                  max={wallet.balance}
                  placeholder={`Available: ${wallet.balance}`}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Execute P2P Transfer</span>
              </button>
            </form>
          )}

          {/* TAB 3: CONVERSION OF MAIN BALANCE LEDGER */}
          {activeTab === 'conversions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Main Balance Conversion Records (Currency INR ➔ Credits)
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {wallet.conversionHistory?.length || 0} conversions
                </span>
              </div>

              {(!wallet.conversionHistory || wallet.conversionHistory.length === 0) ? (
                <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No currency conversion records found yet. Top up your balance using Razorpay above!
                </div>
              ) : (
                <div className="space-y-2">
                  {wallet.conversionHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{rec.packageTitle}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                          <span>{rec.paymentMethod}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-400">{rec.razorpayPaymentId}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(rec.timestamp).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400">
                          +{rec.creditsCredited.toLocaleString()} Credits
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Paid ₹{rec.amountPaidInr.toLocaleString()}
                        </div>
                        {rec.bonusCredits > 0 && (
                          <div className="text-[10px] text-amber-400 font-medium">
                            +{rec.bonusCredits} Bonus
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TOTAL WALLET TRANSACTION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Wallet Transaction History (Debits, Bounties & Grants)
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {wallet.transactions?.length || 0} entries
                </span>
              </div>

              {(!wallet.transactions || wallet.transactions.length === 0) ? (
                <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  No wallet transactions recorded.
                </div>
              ) : (
                <div className="space-y-2">
                  {wallet.transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div
                        key={tx.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-white">{tx.description}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2">
                            <span>Type: {tx.type}</span>
                            <span>•</span>
                            <span>{new Date(tx.timestamp).toLocaleString()}</span>
                            {tx.referenceId && <span>• Ref: {tx.referenceId}</span>}
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                          </span>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">
                            {tx.creditType || 'Purchased'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUTOMATED TRANSACTION REPORTS VIA EMAIL */}
          {activeTab === 'email_reports' && (
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

              {/* Preferences Form */}
              <form
                onSubmit={handleSaveReportSubscription}
                className="space-y-5 bg-slate-950/80 p-5 rounded-3xl border border-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-sky-400" />
                      <span>Automated Transaction History Email Reports</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Opt-in to receive scheduled transaction statements delivered straight to your registered email address without manual login.
                    </p>
                  </div>

                  {/* Master Active Switch */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs text-slate-400 font-semibold">
                      {reportSubEnabled ? 'Delivery Enabled' : 'Delivery Off'}
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

                {/* Frequency Selector: 24h, Weekly, Monthly */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Select Preferred Delivery Interval:
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
                        <span className="text-xs font-bold text-white">24 Hours / Daily</span>
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
                        Daily statement of top-ups, transfers, and lead inquiries sent every 24 hours.
                      </p>
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
                        <span className="text-xs font-bold text-white">Weekly (7 Days)</span>
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
                        Weekly summary with opening and closing balances delivered every 7 days.
                      </p>
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
                        <span className="text-xs font-bold text-white">Monthly (30 Days)</span>
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
                        Monthly reconciliation statement of all transactions and earned rewards.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Address Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Registered Email Address:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      placeholder="aviator@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white text-xs outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleSendInstantReport}
                    disabled={isSendingInstantReport}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingInstantReport ? 'Compiling Statement...' : 'Send Test Statement Now'}</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </button>
                </div>
              </form>

              {/* Dispatched History */}
              {dispatchedReports.length > 0 && (
                <div className="space-y-3 bg-slate-950/80 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Delivered Statements ({dispatchedReports.length})</span>
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {dispatchedReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{report.subject}</div>
                          <div className="text-[10px] text-slate-400">
                            Sent to {report.recipient_email} • {new Date(report.dispatched_at).toLocaleString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewingReport(report)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold cursor-pointer flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );

  const statementModal = previewingReport ? (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Delivered Email Statement</h3>
          </div>
          <button
            onClick={() => setPreviewingReport(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto bg-slate-950/60 max-h-[75vh]">
          <div dangerouslySetInnerHTML={{ __html: previewingReport.html_preview }} />
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
  ) : null;

  if (isInline) {
    return (
      <div className="w-full space-y-4">
        {cardContent}
        {statementModal}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      {cardContent}
      {statementModal}
    </div>
  );
};

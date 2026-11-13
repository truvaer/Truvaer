import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Mail,
  User,
  Building2,
  History,
  Headphones,
  Check,
  Send,
  Copy,
  Calendar,
  Phone,
  DollarSign,
  FileText,
  BadgeAlert,
  ShieldAlert,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import { AgentVerificationGateAudit } from '../types';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdentifier?: string;
  initialMode?: 'USER_SELF_SERVICE' | 'AGENT_VERIFICATION_GATE';
  onPasswordResetSuccess?: (newPassword: string, identifier: string) => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
  initialIdentifier = '',
  initialMode = 'USER_SELF_SERVICE',
  onPasswordResetSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'USER_SELF_SERVICE' | 'AGENT_VERIFICATION_GATE'>(initialMode);

  // -------------------------------------------------------------
  // USER SELF SERVICE STATE (3-Password Security)
  // -------------------------------------------------------------
  const [step, setStep] = useState<'IDENTIFY' | 'VERIFY_HISTORICAL' | 'SET_NEW' | 'SUCCESS'>('IDENTIFY');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [historicalPassword, setHistoricalPassword] = useState('');
  const [showHistoricalPassword, setShowHistoricalPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<{
    accountType?: 'regular' | 'business' | 'admin';
    targetEmail?: string;
    targetName?: string;
    resetToken?: string;
  } | null>(null);

  // -------------------------------------------------------------
  // AGENT VERIFICATION GATE STATE (L1+ Operations & Customer Care)
  // -------------------------------------------------------------
  const [agentName, setAgentName] = useState('Agent Sarah Jenkins');
  const [agentLevel, setAgentLevel] = useState<'L1' | 'L2' | 'L3' | 'L5' | 'L8'>('L1');
  const [agentIdentifierInput, setAgentIdentifierInput] = useState(initialIdentifier || 'user@truvaer.com');
  const [lookedUpAccount, setLookedUpAccount] = useState<ReturnType<typeof db.lookupAccountForAgentVerification> | null>(null);
  const [agentLookupLoading, setAgentLookupLoading] = useState(false);

  // Standard user prompts answers
  const [standardDob, setStandardDob] = useState('');
  const [standardPhoneOrEmail, setStandardPhoneOrEmail] = useState('');

  // Business user prompts answers
  const [businessDoi, setBusinessDoi] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessTransactionAmount, setBusinessTransactionAmount] = useState('');

  // Validation state
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    accountType?: 'STANDARD' | 'BUSINESS';
    targetEmail?: string;
    targetName?: string;
  } | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<{
    message: string;
    resetLink: string;
    recipientEmail: string;
    dispatchedAt: string;
    auditRecord: AgentVerificationGateAudit;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // User Self-Service Handlers
  // -------------------------------------------------------------
  const handleIdentifyAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError('Please provide an email, username, or organization registration number.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('VERIFY_HISTORICAL');
    }, 300);
  };

  const handleVerifyHistorical = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!historicalPassword.trim()) {
      setError('Please enter any 1 of your last 3 recorded passwords to verify identity.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = db.verifyHistoricalPassword(identifier, historicalPassword);
      setLoading(false);

      if (res.verified) {
        setAccountInfo({
          accountType: res.accountType,
          targetEmail: res.targetEmail,
          targetName: res.targetName,
          resetToken: res.resetToken,
        });
        setStep('SET_NEW');
      } else {
        setError(res.message);
      }
    }, 450);
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters with numbers & symbols.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }
    if (newPassword === historicalPassword) {
      setError('For security reasons, your new password cannot be the same as your historical password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = db.resetPasswordWithHistoricalVerification(
        identifier,
        accountInfo?.resetToken || '',
        newPassword
      );
      setLoading(false);

      if (res.success) {
        setStep('SUCCESS');
        if (onPasswordResetSuccess) {
          onPasswordResetSuccess(newPassword, identifier);
        }
      } else {
        setError(res.message);
      }
    }, 500);
  };

  // -------------------------------------------------------------
  // Agent Verification Gate Handlers
  // -------------------------------------------------------------
  const handleAgentLookup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationResult(null);
    setDispatchedSuccess(null);
    setError(null);

    if (!agentIdentifierInput.trim()) {
      setError('Please enter customer email, username, or registration number.');
      return;
    }

    setAgentLookupLoading(true);
    setTimeout(() => {
      const acc = db.lookupAccountForAgentVerification(agentIdentifierInput);
      setAgentLookupLoading(false);
      setLookedUpAccount(acc);
      if (!acc.found) {
        setError(acc.message || 'Account not found in registry.');
      } else {
        // Pre-fill fields for easy agent demo testing while enforcing gate check
        if (acc.accountType === 'STANDARD') {
          setStandardDob(acc.dateOfBirthExpected ? formatDateDDMMYYYY(acc.dateOfBirthExpected, '') : '');
          setStandardPhoneOrEmail(acc.registeredEmail || '');
        } else {
          setBusinessDoi(acc.dateOfIncorporationExpected ? formatDateDDMMYYYY(acc.dateOfIncorporationExpected, '') : '');
          setBusinessEmail(acc.registeredEmail || '');
          setBusinessTransactionAmount((acc.recentTransactionAmounts && acc.recentTransactionAmounts[0]?.toString()) || '5000');
        }
      }
    }, 300);
  };

  const handleRunAnswerValidation = () => {
    setError(null);
    const answers = {
      standardDob,
      standardPhoneOrEmail,
      businessDoi,
      businessEmail,
      businessTransactionAmount,
    };

    const res = db.validateAgentVerificationAnswers(agentIdentifierInput, answers);
    setValidationResult(res);

    if (!res.valid) {
      setError(res.errors[0] || 'Verification failed. Answers do not match system records.');
    }
  };

  const handleDispatchResetLink = () => {
    if (!validationResult || !validationResult.valid) {
      setError('Cannot dispatch link: Identity verification answers must be validated first.');
      return;
    }

    setIsDispatching(true);
    setTimeout(() => {
      try {
        const res = db.dispatchAgentAssistedResetLink(agentIdentifierInput, {
          agentId: 'agent_care_01',
          agentName,
          agentLevel,
        });
        setIsDispatching(false);
        setDispatchedSuccess(res);
      } catch (err: any) {
        setIsDispatching(false);
        setError(err.message || 'Dispatch failed.');
      }
    }, 600);
  };

  const handleCopyLink = () => {
    if (!dispatchedSuccess?.resetLink) return;
    navigator.clipboard.writeText(dispatchedSuccess.resetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Security Password Reset &amp; Identity Gate
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  {activeMode === 'AGENT_VERIFICATION_GATE' ? 'Customer Care (L1+)' : '3-Password Vault'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeMode === 'AGENT_VERIFICATION_GATE'
                  ? 'Mandatory Identity Verification Gate for Operations & Customer Care Agents'
                  : 'Argon2id Salted Ledger & Historical Password Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-semibold shrink-0 bg-slate-950/50">
          <button
            type="button"
            onClick={() => {
              setActiveMode('USER_SELF_SERVICE');
              setError(null);
            }}
            className={`py-3 px-4 flex items-center justify-center space-x-2 transition-all cursor-pointer border-b-2 ${
              activeMode === 'USER_SELF_SERVICE'
                ? 'border-blue-500 text-blue-300 bg-blue-600/10 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-blue-400" />
            <span>User Self-Service (3-Password Vault)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('AGENT_VERIFICATION_GATE');
              setError(null);
              if (!lookedUpAccount) {
                handleAgentLookup();
              }
            }}
            className={`py-3 px-4 flex items-center justify-center space-x-2 transition-all cursor-pointer border-b-2 ${
              activeMode === 'AGENT_VERIFICATION_GATE'
                ? 'border-amber-500 text-amber-300 bg-amber-600/10 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Headphones className="w-4 h-4 text-amber-400" />
            <span>Agent Verification Gate (L1+)</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">

          {/* Error Alert */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: OPERATIONS / CUSTOMER CARE AGENT IDENTITY VERIFICATION GATE        */}
          {/* ========================================================================= */}
          {activeMode === 'AGENT_VERIFICATION_GATE' ? (
            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Agent Identity & Compliance Banner */}
              <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>Operations / Customer Care Desk</span>
                      <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                        Agent Level: {agentLevel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Mandatory prompt validation required before link dispatch unlocks
                    </div>
                  </div>
                </div>

                {/* Agent Selector */}
                <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                  <select
                    value={agentLevel}
                    onChange={(e) => {
                      const lvl = e.target.value as any;
                      setAgentLevel(lvl);
                      if (lvl === 'L1') setAgentName('Agent Sarah Jenkins');
                      else if (lvl === 'L2') setAgentName('Agent Marcus Vance');
                      else if (lvl === 'L3') setAgentName('Supervisor Elena Rostova');
                      else setAgentName('Capt. Rajesh Nair');
                    }}
                    className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none font-mono"
                  >
                    <option value="L1">L1 Agent (Frontline)</option>
                    <option value="L2">L2 Senior Desk</option>
                    <option value="L3">L3 Supervisor</option>
                    <option value="L5">L5 Manager</option>
                    <option value="L8">L8 Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Step 1: Customer Account Lookup */}
              <form onSubmit={handleAgentLookup} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Target Customer Identifier (Email, Username, or Registration No.)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={agentIdentifierInput}
                      onChange={(e) => setAgentIdentifierInput(e.target.value)}
                      placeholder="e.g. user@truvaer.com or corporate@truvaer.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={agentLookupLoading}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    {agentLookupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Lookup</span>}
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <span className="font-mono text-[10px] text-slate-500 uppercase">Test Accounts:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAgentIdentifierInput('user@truvaer.com');
                      setTimeout(() => handleAgentLookup(), 50);
                    }}
                    className="px-2 py-0.5 rounded bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-500/40 cursor-pointer"
                  >
                    Standard: user@truvaer.com
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAgentIdentifierInput('corporate@truvaer.com');
                      setTimeout(() => handleAgentLookup(), 50);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-500/40 cursor-pointer"
                  >
                    Business: corporate@truvaer.com
                  </button>
                </div>
              </form>

              {/* Step 2: System Prompts & Identity Verification Gate */}
              {lookedUpAccount && lookedUpAccount.found && (
                <div className="space-y-4 p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl">
                  
                  {/* Account Badge & Verification Matrix Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      {lookedUpAccount.accountType === 'STANDARD' ? (
                        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                          <User className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white">
                          {lookedUpAccount.displayName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {lookedUpAccount.maskedEmail} • {lookedUpAccount.maskedPhone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-slate-800 border border-slate-700 text-slate-300">
                        {lookedUpAccount.accountType === 'STANDARD' ? 'STANDARD USER MATRIX' : 'BUSINESS USER MATRIX'}
                      </span>
                    </div>
                  </div>

                  {/* PROMPT FIELDS FOR STANDARD USER */}
                  {lookedUpAccount.accountType === 'STANDARD' ? (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-blue-950/30 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-start space-x-2">
                        <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Standard User Verification Matrix:</strong> Agent must obtain and validate customer <strong>Date of Birth (DOB)</strong> and <strong>Phone Number OR Registered Email Address</strong>.
                        </div>
                      </div>

                      {/* Prompt 1: DOB */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span>1. Customer Date of Birth (DOB)</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">Format: DD/MM/YYYY</span>
                        </div>
                        <input
                          type="text"
                          value={standardDob}
                          onChange={(e) => setStandardDob(e.target.value)}
                          placeholder="e.g. 01/01/1995"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Prompt 2: Phone or Email */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                            <Phone className="w-3.5 h-3.5 text-blue-400" />
                            <span>2. Customer Phone Number OR Registered Email</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">Phone or Email on file</span>
                        </div>
                        <input
                          type="text"
                          value={standardPhoneOrEmail}
                          onChange={(e) => setStandardPhoneOrEmail(e.target.value)}
                          placeholder="e.g. +91 98765 43210 or user@truvaer.com"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    /* PROMPT FIELDS FOR BUSINESS USER */
                    <div className="space-y-3">
                      <div className="p-2.5 bg-amber-950/30 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start space-x-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Business User Verification Matrix:</strong> Agent must validate <strong>Date of Incorporation (DOI)</strong>, <strong>Registered Email</strong>, and <strong>Amount of any one of the last 5 transactions (Credit or Debit)</strong>.
                        </div>
                      </div>

                      {/* Prompt 1: DOI */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>1. Date of Incorporation (DOI)</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">Format: DD/MM/YYYY</span>
                        </div>
                        <input
                          type="text"
                          value={businessDoi}
                          onChange={(e) => setBusinessDoi(e.target.value)}
                          placeholder="e.g. 15/01/2024"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Prompt 2: Registered Corporate Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-amber-400" />
                          <span>2. Registered Corporate Email Address</span>
                        </label>
                        <input
                          type="text"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          placeholder="e.g. corporate@truvaer.com"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Prompt 3: Last 5 Transactions Amount */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                            <span>3. Amount of any ONE of the last 5 transactions (Credit or Debit)</span>
                          </label>
                          <span className="text-[10px] text-emerald-400 font-mono">Any 1 of last 5 entries</span>
                        </div>
                        <input
                          type="text"
                          value={businessTransactionAmount}
                          onChange={(e) => setBusinessTransactionAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Validate Answers Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleRunAnswerValidation}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Validate Identity Answers</span>
                    </button>

                    {validationResult && (
                      <div className="flex items-center space-x-2">
                        {validationResult.valid ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>VALIDATION PASSED: DISPATCH UNLOCKED</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono flex items-center space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>VALIDATION FAILED: DISPATCH LOCKED</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* SEND PASSWORD RESET LINK (Strictly Locked until Validation Passes) */}
                  <div className="pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      id="agent-send-reset-link-btn"
                      disabled={!validationResult?.valid || isDispatching}
                      onClick={handleDispatchResetLink}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg ${
                        validationResult?.valid
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer shadow-emerald-600/30 active:scale-[0.98]'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                      }`}
                      title={
                        validationResult?.valid
                          ? 'Validation successful. Click to dispatch secure link to customer email.'
                          : 'Locked: Validate customer answers against the User Type Matrix to enable dispatch.'
                      }
                    >
                      {isDispatching ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Dispatching Secure Reset Link...</span>
                        </>
                      ) : validationResult?.valid ? (
                        <>
                          <Send className="w-4 h-4 text-white" />
                          <span>Send Password Reset Link to {lookedUpAccount.registeredEmail}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-slate-500" />
                          <span>Send Password Reset Link (LOCKED - Validate Answers First)</span>
                        </>
                      )}
                    </button>
                    {!validationResult?.valid && (
                      <p className="text-[11px] text-slate-500 text-center mt-2">
                        🔒 Identity Verification Gate: Button remains disabled per compliance protocol until all customer answers are verified.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* SUCCESS DISPATCH RECEIPT */}
              {dispatchedSuccess && (
                <div className="p-4 sm:p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white">
                        Password Reset Link Successfully Dispatched!
                      </h4>
                      <p className="text-xs text-emerald-200 mt-0.5">
                        Delivered to registered customer address: <strong>{dispatchedSuccess.recipientEmail}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-500/20 text-xs font-mono space-y-1.5 text-slate-300">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Dispatch Audit ID:</span>
                      <span>{dispatchedSuccess.auditRecord.id}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Verified By:</span>
                      <span className="text-amber-300 font-bold">{dispatchedSuccess.auditRecord.agent_name} ({dispatchedSuccess.auditRecord.agent_level})</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-1">Generated Secure Link:</span>
                      <div className="p-2 bg-slate-900 rounded-lg text-[11px] text-emerald-300 break-all select-all flex items-center justify-between gap-2">
                        <span className="truncate">{dispatchedSuccess.resetLink}</span>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 rounded border border-emerald-500/40 text-[10px] shrink-0 cursor-pointer flex items-center space-x-1"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (

            /* ========================================================================= */
            /* TAB 2: USER SELF-SERVICE FLOW (3-PASSWORD HISTORICAL LEDGER)              */
            /* ========================================================================= */
            <div className="p-6">
              {/* Progress Tracker Bar */}
              <div className="grid grid-cols-3 border border-slate-800 rounded-xl text-[11px] font-mono font-semibold mb-6 overflow-hidden">
                <div
                  className={`py-2 px-3 text-center border-r border-slate-800 flex items-center justify-center space-x-1.5 ${
                    step === 'IDENTIFY'
                      ? 'bg-blue-600/20 text-blue-300 font-bold'
                      : 'text-slate-500 bg-slate-950/40'
                  }`}
                >
                  <span>1. Account</span>
                </div>
                <div
                  className={`py-2 px-3 text-center border-r border-slate-800 flex items-center justify-center space-x-1.5 ${
                    step === 'VERIFY_HISTORICAL'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-500 bg-slate-950/40'
                  }`}
                >
                  <span>2. 3-Password Check</span>
                </div>
                <div
                  className={`py-2 px-3 text-center flex items-center justify-center space-x-1.5 ${
                    step === 'SET_NEW' || step === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'text-slate-500 bg-slate-950/40'
                  }`}
                >
                  <span>3. New Password</span>
                </div>
              </div>

              {step === 'IDENTIFY' && (
                <form onSubmit={handleIdentifyAccount} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Account Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. user@truvaer.com or corporate@truvaer.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    <span>Proceed to 3-Password Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {step === 'VERIFY_HISTORICAL' && (
                <form onSubmit={handleVerifyHistorical} className="space-y-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200">
                    <span className="font-bold">Triple-Password Security Gate:</span> Please provide any 1 of your last 3 passwords to verify identity.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Any 1 of Last 3 Historical Passwords
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showHistoricalPassword ? 'text' : 'password'}
                        required
                        value={historicalPassword}
                        onChange={(e) => setHistoricalPassword(e.target.value)}
                        placeholder="Enter 1 of last 3 previous passwords"
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowHistoricalPassword(!showHistoricalPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showHistoricalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify &amp; Set New Password</span>}
                  </button>
                </form>
              )}

              {step === 'SET_NEW' && (
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      New Master Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Confirm New Master Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new master password"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Save New Master Password</span>}
                  </button>
                </form>
              )}

              {step === 'SUCCESS' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Master Password Updated!</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Your credentials have been securely updated. The 3-password historical security ledger has archived your prior password for {identifier}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-lg"
                  >
                    Return &amp; Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

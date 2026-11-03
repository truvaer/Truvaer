import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Calendar,
  Globe,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Info,
} from 'lucide-react';
import { RegularUser, RegularRegisterPayload } from '../types';
import { db } from '../data/mockDatabase';

interface RegularRegisterFormProps {
  onSuccess: (user: RegularUser, otpInfo: { otp: string; expiresIn: number }) => void;
  onNavigateLogin: () => void;
}

const COUNTRIES = [
  { code: 'IN', name: 'India (+91)', prefix: '+91' },
  { code: 'US', name: 'United States (+1)', prefix: '+1' },
  { code: 'AE', name: 'United Arab Emirates (+971)', prefix: '+971' },
  { code: 'GB', name: 'United Kingdom (+44)', prefix: '+44' },
  { code: 'SG', name: 'Singapore (+65)', prefix: '+65' },
  { code: 'DE', name: 'Germany (+49)', prefix: '+49' },
  { code: 'QA', name: 'Qatar (+974)', prefix: '+974' },
];

export const RegularRegisterForm: React.FC<RegularRegisterFormProps> = ({
  onSuccess,
  onNavigateLogin,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countryCode, setCountryCode] = useState('IN');
  const [rawPhone, setRawPhone] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate age helper
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(dateOfBirth);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  // Client validation
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    const cleanUser = username.trim().toLowerCase();
    const userRegex = /^[a-z0-9_.]+$/;
    if (!cleanUser) {
      errs.username = 'Username is required.';
    } else if (cleanUser.length < 3 || cleanUser.length > 30) {
      errs.username = 'Username must be between 3 and 30 characters.';
    } else if (!userRegex.test(cleanUser)) {
      errs.username = 'Must contain only lowercase letters, numbers, underscores, and dots (^' + '^[a-z0-9_.]+$).';
    } else if (!db.checkUsernameAvailable(cleanUser)) {
      errs.username = 'This username is already taken.';
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(cleanEmail)) {
      errs.email = 'Enter a valid standard email format.';
    } else if (!db.checkEmailAvailable(cleanEmail)) {
      errs.email = 'This email is already registered.';
    }

    if (!password || password.length < 8) {
      errs.password = 'Password must be at least 8 characters with numbers & symbols.';
    }

    if (!dateOfBirth) {
      errs.date_of_birth = 'Date of birth is required.';
    } else {
      const age = calculateAge(dateOfBirth);
      if (age === null || isNaN(age) || age < 18) {
        errs.date_of_birth = `Age requirement violation: Must be >= 18 years old (Current: ${age ?? 0} yrs).`;
      }
    }

    const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 7 || cleanPhoneDigits.length > 12) {
      errs.phone_number = 'Enter a valid phone number for your selected country.';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const fullPhone = `${selectedCountry.prefix}${rawPhone.replace(/\D/g, '')}`;
    const payload: RegularRegisterPayload = {
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
      date_of_birth: dateOfBirth,
      country_code: countryCode,
      phone_number: fullPhone,
    };

    setTimeout(() => {
      setLoading(false);
      const result = db.registerRegular(payload);

      if (result.statusCode === 201 && 'data' in result.response) {
        const createdUser = db.getRegularUserById(result.response.data.user_id);
        const otpRecord = db.getActiveOtpForUser(result.response.data.user_id);
        if (createdUser && otpRecord) {
          onSuccess(createdUser, {
            otp: otpRecord.otp,
            expiresIn: result.response.data.otp_expires_in_seconds,
          });
        }
      } else {
        setGeneralError(result.response.message || 'Registration failed.');
      }
    }, 450);
  };

  // Fast sample generator
  const handleFillSample = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setUsername(`skypilot_${randomSuffix}`);
    setEmail(`pilot${randomSuffix}@truvaer.com`);
    setPassword('SecurePassword#2026');
    setDateOfBirth('2000-06-15');
    setCountryCode('IN');
    setRawPhone('9876543210');
    setFieldErrors({});
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Regular User Onboarding</h2>
            <p className="text-xs text-slate-400">TRD Section 2.1 & 3.1: Identity Verification & Digital Wallet</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFillSample}
          className="text-xs font-mono text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/30 transition-colors"
        >
          Auto-Fill Sample
        </button>
      </div>

      {generalError && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Username <span className="text-blue-400">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">^[a-z0-9_.]+$ (3-30 chars)</span>
          </div>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              id="regular-reg-username-input"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="e.g. aviation_pro99"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-800 border ${
                fieldErrors.username ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
              } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono`}
            />
          </div>
          {fieldErrors.username && (
            <p className="mt-1 text-xs text-rose-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.username}</span>
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-blue-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              id="regular-reg-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              placeholder="user@domain.com"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-800 border ${
                fieldErrors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
              } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-rose-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Password (Argon2id Salted) <span className="text-blue-400">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              id="regular-reg-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="SecurePassword#2026"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-800 border ${
                fieldErrors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
              } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono`}
            />
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-rose-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.password}</span>
            </p>
          )}
        </div>

        {/* Date of Birth & Age Check */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Date of Birth <span className="text-blue-400">*</span>
            </label>
            {currentAge !== null && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full font-mono ${
                  currentAge >= 18 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                Calculated Age: {currentAge} yrs {currentAge >= 18 ? '✓ (Eligible)' : '✗ (Must be >= 18)'}
              </span>
            )}
          </div>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              id="regular-reg-dob-input"
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-800 border ${
                fieldErrors.date_of_birth ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
              } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            />
          </div>
          {fieldErrors.date_of_birth && (
            <p className="mt-1 text-xs text-rose-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.date_of_birth}</span>
            </p>
          )}
        </div>

        {/* Country & Phone Number (E.164) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Country <span className="text-blue-400">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <select
                id="regular-reg-country-select"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.prefix})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Phone Number (E.164) <span className="text-blue-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Payload: {selectedCountry.prefix}{rawPhone.replace(/\D/g, '') || '...'}
              </span>
            </div>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-700 bg-slate-750 text-slate-300 text-xs font-mono">
                {selectedCountry.prefix}
              </span>
              <input
                id="regular-reg-phone-input"
                type="tel"
                required
                value={rawPhone}
                onChange={(e) => setRawPhone(e.target.value)}
                placeholder="9876543210"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.phone_number ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'
                } rounded-r-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono`}
              />
            </div>
            {fieldErrors.phone_number && (
              <p className="mt-1 text-xs text-rose-400 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{fieldErrors.phone_number}</span>
              </p>
            )}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            Upon submission, a cryptographically random 6-digit OTP will be generated with 15-minute TTL. Email verification automatically provisions your Truvaer Digital Wallet.
          </span>
        </div>

        <button
          id="regular-reg-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span>Processing Registration (POST /api/v1/auth/register/regular)...</span>
          ) : (
            <>
              <span>Create Account & Send Verification OTP</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          Already registered as a Regular User?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-blue-400 hover:text-blue-300 font-semibold underline ml-1 cursor-pointer"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </div>
  );
};

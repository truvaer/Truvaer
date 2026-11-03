import React, { useState } from 'react';
import {
  Building2,
  User,
  FileText,
  CreditCard,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Info,
  Lock,
  Mail,
  Globe,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BusinessProfile, RegNumberType, BusinessRegisterPayload } from '../types';
import { db } from '../data/mockDatabase';
import { LocationAutocomplete } from '../shared/LocationAutocomplete';

interface BusinessRegisterFormProps {
  onSuccess: (business: BusinessProfile) => void;
  onNavigateLogin: () => void;
}

const COUNTRIES = [
  { code: 'IN', name: 'India (PAN / TAN Tax System)', defaultReg: 'TAN' },
  { code: 'US', name: 'United States (EIN / Corporate Reg)', defaultReg: 'CORPORATE_REG_NO' },
  { code: 'AE', name: 'United Arab Emirates (Trade License / Tax)', defaultReg: 'CORPORATE_REG_NO' },
  { code: 'GB', name: 'United Kingdom (Companies House CRN)', defaultReg: 'CORPORATE_REG_NO' },
  { code: 'SG', name: 'Singapore (ACRA UEN Number)', defaultReg: 'CORPORATE_REG_NO' },
];

export const BusinessRegisterForm: React.FC<BusinessRegisterFormProps> = ({
  onSuccess,
  onNavigateLogin,
}) => {
  // Step 1: Corporate Details
  const [organizationName, setOrganizationName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [regNumberType, setRegNumberType] = useState<RegNumberType>('TAN');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [country, setCountry] = useState('IN');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('TS');
  const [businessLocationDisplay, setBusinessLocationDisplay] = useState('Hyderabad, TS, India');
  const [businessEmail, setBusinessEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 1B: Aviation Classification & Non-Listing "Other" Taxonomy
  const taxonomy = db.getAviationTaxonomy();
  const availableCategories = Object.keys(taxonomy).filter((c) => c !== 'All');

  const [selectedCategory, setSelectedCategory] = useState<string>('Private Air Charter');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('VIP Executive Charter');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customSubCategoryName, setCustomSubCategoryName] = useState('');
  const [customCategoryDesc, setCustomCategoryDesc] = useState('');

  // Step 2: File Upload
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; type: string } | null>(null);

  // Step 3: Bank Payout Coordinates
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscSwift, setBankIfscSwift] = useState('');
  const [bankName, setBankName] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        inc_cert_doc: 'File exceeds maximum 10MB limit (Current: ' + (file.size / (1024 * 1024)).toFixed(1) + 'MB).',
      }));
      return;
    }
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.inc_cert_doc;
      return copy;
    });
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    // Org Name
    if (!organizationName || organizationName.trim().length < 2 || organizationName.trim().length > 150) {
      errs.organization_name = 'Organization name must be 2 to 150 characters.';
    }

    // Owner Name
    if (!ownerName || ownerName.trim().length < 3) {
      errs.owner_name = 'Full legal name of primary business owner is required.';
    }

    // Reg Number regex
    const regNorm = registrationNumber.trim().toUpperCase();
    if (!regNorm) {
      errs.registration_number = 'Registration identifier is required.';
    } else if (regNumberType === 'PAN') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(regNorm)) {
        errs.registration_number = 'Invalid Indian Corporate PAN format (e.g. ABCDE1234F).';
      }
    } else if (regNumberType === 'TAN') {
      const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
      if (!tanRegex.test(regNorm)) {
        errs.registration_number = 'Invalid Indian Corporate TAN format (e.g. ABCD12345F).';
      }
    } else {
      if (regNorm.length < 5) {
        errs.registration_number = 'Corporate registration number must be at least 5 alphanumeric characters.';
      }
    }

    // Business Email
    const emailNorm = businessEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailNorm || !emailRegex.test(emailNorm)) {
      errs.business_email = 'Valid corporate domain email is required.';
    }

    if (!password || password.length < 8) {
      errs.password = 'Corporate password must be at least 8 characters.';
    }

    // File check
    if (!uploadedFile) {
      errs.inc_cert_doc = 'Compliance document (Incorporation Cert / Tax TAN) is required for audit.';
    }

    // Bank Account Holder matching check
    if (!bankAccountHolder || bankAccountHolder.trim().length < 2) {
      errs.bank_account_holder = 'Bank account holder name is required.';
    }

    // Bank Account Number
    const rawAcc = bankAccountNumber.replace(/\s+/g, '');
    if (!rawAcc || rawAcc.length < 8) {
      errs.bank_account_number = 'Account number must be at least 8 digits.';
    }

    // IFSC or SWIFT
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    const codeNorm = bankIfscSwift.trim().toUpperCase();
    if (!ifscRegex.test(codeNorm) && !swiftRegex.test(codeNorm)) {
      errs.bank_ifsc_swift = 'Must be a valid Indian IFSC (e.g. HDFC0001234) or SWIFT/BIC code (e.g. CHASUS33XXX).';
    }

    if (!bankName || bankName.trim().length < 2) {
      errs.bank_name = 'Commercial banking institution name is required.';
    }

    if (isCustomCategory) {
      if (!customCategoryName || customCategoryName.trim().length < 2) {
        errs.custom_category = 'Please enter your proposed Category title (e.g. Aviation Operations & Enterprise Services).';
      }
      if (!customSubCategoryName || customSubCategoryName.trim().length < 2) {
        errs.custom_subcategory = 'Please enter your proposed Sub-Category title.';
      }
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

    const payload: BusinessRegisterPayload = {
      organization_name: organizationName.trim(),
      owner_name: ownerName.trim(),
      reg_number_type: regNumberType,
      registration_number: registrationNumber.trim().toUpperCase(),
      country,
      city: city.trim() || 'Hyderabad',
      state: state.trim() || 'TS',
      physical_location: businessLocationDisplay.trim() || `${city}, ${state}, ${country}`,
      business_email: businessEmail.trim().toLowerCase(),
      password,
      bank_account_holder: bankAccountHolder.trim(),
      bank_account_number: bankAccountNumber.trim(),
      bank_ifsc_swift: bankIfscSwift.trim().toUpperCase(),
      bank_name: bankName.trim(),
      category: isCustomCategory ? customCategoryName.trim() : selectedCategory,
      subCategory: isCustomCategory ? customSubCategoryName.trim() : selectedSubCategory,
      custom_category: isCustomCategory ? customCategoryName.trim() : undefined,
      custom_subcategory: isCustomCategory ? customSubCategoryName.trim() : undefined,
      custom_category_desc: isCustomCategory ? customCategoryDesc.trim() : undefined,
      file: uploadedFile ? { ...uploadedFile } : undefined,
    };

    setTimeout(() => {
      setLoading(false);
      const res = db.registerBusiness(payload);

      if (res.statusCode === 202 && 'data' in res.response) {
        const createdBiz = db.getBusinessById(res.response.data.business_id);
        if (createdBiz) {
          if (isCustomCategory && customCategoryName.trim()) {
            db.requestCustomCategory({
              business_id: createdBiz.business_id,
              business_name: createdBiz.organization_name,
              category_name: customCategoryName.trim(),
              sub_category_name: customSubCategoryName.trim() || 'General Operations',
              description: customCategoryDesc.trim() || `Proposed new aviation category and sub-category during onboarding for ${createdBiz.organization_name}.`,
              requested_by: ownerName.trim(),
            });
          }
          onSuccess(createdBiz);
        }
      } else {
        setGeneralError(res.response.message || 'Business registration failed.');
      }
    }, 600);
  };

  const handleFillSample = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setOrganizationName(`AeroGlobal Logistics ${randomSuffix} Pvt Ltd`);
    setOwnerName('Director Aditya Sharma');
    setRegNumberType('TAN');
    setRegistrationNumber('ABCD12345F');
    setCountry('IN');
    setBusinessEmail(`compliance${randomSuffix}@aeroglobal.in`);
    setPassword('CorporateSecret#2026');
    setUploadedFile({
      name: `AeroGlobal_${randomSuffix}_Incorporation_TAN_Certificate.pdf`,
      size: 2450000,
      type: 'application/pdf',
    });
    setBankAccountHolder(`AeroGlobal Logistics ${randomSuffix} Pvt Ltd`);
    setBankAccountNumber('50200084719231');
    setBankIfscSwift('HDFC0001234');
    setBankName('HDFC Commercial Bank Ltd');
    setFieldErrors({});
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Business User Onboarding</h2>
            <p className="text-xs text-slate-400">TRD Section 2.2 & 3.2: High-Compliance Gatekeeper Workflow</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFillSample}
          className="text-xs font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-colors cursor-pointer"
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

      {/* Compliance Notice */}
      <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-200">System Hard-Lock Gatekeeper Enforced:</span>
          <p className="text-amber-300/90 mt-0.5">
            Upon submission, this organization record is set to <span className="font-mono font-bold">HARD_LOCKED</span>. It is routed directly to the Yarifly Compliance Operations desk for legal registry audit. Commercial listings and credits remain locked until review approval.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Corporate Entity Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">1</span>
            <span>Corporate Entity & Legal Identification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Organization Legal Name <span className="text-indigo-400">*</span>
              </label>
              <input
                id="biz-reg-org-name"
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. AeroGlobal Logistics Pvt Ltd"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.organization_name ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              />
              {fieldErrors.organization_name && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.organization_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Owner / Primary Admin Legal Name <span className="text-indigo-400">*</span>
              </label>
              <input
                id="biz-reg-owner-name"
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Director Aditya Sharma"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.owner_name ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              />
              {fieldErrors.owner_name && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.owner_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Country of Registration <span className="text-indigo-400">*</span>
              </label>
              <select
                id="biz-reg-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Location with 3+ character auto-suggestion (Hyderabad, TS, India / Hyderabad, Sindh province, Pakistan) */}
            <div className="sm:col-span-2">
              <LocationAutocomplete
                label="Primary Business Location (City, State, Country)"
                value={businessLocationDisplay}
                placeholder="Type 3+ letters (e.g. Hyderabad, TS, India / Hyderabad, Sindh province, Pakistan)..."
                minChars={3}
                onChange={(display, loc) => {
                  setBusinessLocationDisplay(display);
                  if (loc) {
                    setCity(loc.city);
                    setState(loc.state);
                    if (loc.countryCode) {
                      setCountry(loc.countryCode);
                    }
                  } else {
                    setCity(display);
                  }
                }}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                City, State, and Country automatically display when 3 or more letters are typed (e.g., <strong>Hyderabad, TS, India</strong> / <strong>Hyderabad, Sindh province, Pakistan</strong>). Identifies operating hubs and configures services automatically.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Registration Number Type <span className="text-indigo-400">*</span>
              </label>
              <select
                id="biz-reg-type"
                value={regNumberType}
                onChange={(e) => setRegNumberType(e.target.value as RegNumberType)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-mono"
              >
                <option value="TAN">TAN (Tax Deduction Account Number - India)</option>
                <option value="PAN">PAN (Permanent Account Number - Corporate India)</option>
                <option value="CORPORATE_REG_NO">CORPORATE_REG_NO (Commercial Registry / CRN / ACRA)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Registration Number <span className="text-indigo-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {regNumberType === 'PAN' ? 'ABCDE1234F' : regNumberType === 'TAN' ? 'ABCD12345F' : 'Alpha/Numeric'}
                </span>
              </div>
              <input
                id="biz-reg-number"
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                placeholder={regNumberType === 'TAN' ? 'ABCD12345F' : regNumberType === 'PAN' ? 'ABCDE1234F' : 'CRN-981244'}
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.registration_number ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono`}
              />
              {fieldErrors.registration_number && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.registration_number}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Official Business Email (Domain Auth) <span className="text-indigo-400">*</span>
              </label>
              <input
                id="biz-reg-email"
                type="email"
                required
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value.toLowerCase())}
                placeholder="compliance@yourcompany.com"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.business_email ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              />
              {fieldErrors.business_email && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.business_email}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Corporate Master Password <span className="text-indigo-400">*</span>
              </label>
              <input
                id="biz-reg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.password ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.password}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Aviation Sector Classification & Non-Listing "Other" Category */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">2</span>
              <span>Aviation Sector Classification &amp; Non-Listing Category</span>
            </h3>
            <span className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>&quot;Other&quot; = Admin Desk Review</span>
            </span>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200 flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Non-Listing Category Protocol:</span>
              <span>
                If your specialized aviation domain (e.g. <strong>Pilot Training</strong>, <strong>Drone Inspection</strong>, etc.) is not listed, select <strong>&quot;Other&quot;</strong> below and specify your category and sub-category. It will be routed directly to the Central Admin Desk for review &amp; sovereign approval so it gets permanently added to the portal!
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Aviation Category <span className="text-indigo-400">*</span>
              </label>
              <select
                value={isCustomCategory ? '__OTHER__' : selectedCategory}
                onChange={(e) => {
                  if (e.target.value === '__OTHER__') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setSelectedCategory(e.target.value);
                    const subs = taxonomy[e.target.value] || [];
                    const firstSub = subs.find((s) => s !== 'All Subcategories') || 'General Operations';
                    setSelectedSubCategory(firstSub);
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__OTHER__" className="text-amber-400 font-bold bg-slate-900">
                  + Other (Propose New Category &amp; Sub-Category)
                </option>
              </select>
            </div>

            {!isCustomCategory && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Sub-Category Specialization <span className="text-indigo-400">*</span>
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => {
                    if (e.target.value === '__OTHER_SUB__') {
                      setIsCustomCategory(true);
                      setCustomCategoryName(selectedCategory);
                    } else {
                      setSelectedSubCategory(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {(taxonomy[selectedCategory] || [])
                    .filter((s) => s !== 'All Subcategories')
                    .map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  <option value="__OTHER_SUB__" className="text-amber-400 font-bold bg-slate-900">
                    + Other (Propose New Sub-Category)
                  </option>
                </select>
              </div>
            )}

            {isCustomCategory && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <span>Proposed Category Name</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="e.g. Pilot Training &amp; Flight Academies"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-amber-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                  {fieldErrors.custom_category && (
                    <p className="mt-1 text-xs text-rose-400">{fieldErrors.custom_category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                    <span>Proposed Sub-Category Name</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customSubCategoryName}
                    onChange={(e) => setCustomSubCategoryName(e.target.value)}
                    placeholder="e.g. Commercial Pilot License (CPL)"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-amber-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                  {fieldErrors.custom_subcategory && (
                    <p className="mt-1 text-xs text-rose-400">{fieldErrors.custom_subcategory}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Operational Scope &amp; Admin Review Justification
                  </label>
                  <textarea
                    rows={2}
                    value={customCategoryDesc}
                    onChange={(e) => setCustomCategoryDesc(e.target.value)}
                    placeholder="Provide aircraft types, DGCA / FAA / EASA regulatory certifications, and scope of operations..."
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setCustomCategoryName('');
                        setCustomSubCategoryName('');
                      }}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      ← Back to standard categories
                    </button>
                    <span className="text-[11px] text-amber-400/90 font-medium">
                      ✓ Automatically routed to Admin Approval Desk on submit
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 3: Incorporation Document Upload (Max 10MB, PDF/PNG/JPG) */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">3</span>
            <span>Compliance Document Upload (S3 Encrypted Bucket)</span>
          </h3>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/10'
                : uploadedFile
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            {uploadedFile ? (
              <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white truncate max-w-xs">{uploadedFile.name}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • S3 Encrypted / Private KMS
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded bg-rose-500/10"
                >
                  Remove & Replace
                </button>
              </div>
            ) : (
              <div>
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">
                  Drag and drop Incorporation Certificate / Tax Document here
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, PNG, or JPG (Max 10MB) per TRD Section 2.2</p>
                <label className="mt-3 inline-block px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold cursor-pointer transition-colors">
                  <span>Browse Local File</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
          {fieldErrors.inc_cert_doc && (
            <p className="mt-2 text-xs text-rose-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.inc_cert_doc}</span>
            </p>
          )}
        </div>

        {/* Section 4: Payout Banking Coordinates (AES-256 Encrypted / Masked) */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">4</span>
              <span>Commercial Bank Details (AES-256 Encrypted at Rest)</span>
            </h3>
            {bankAccountNumber && (
              <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                UI Mask Preview: <span className="text-emerald-400">****{bankAccountNumber.replace(/\s+/g, '').slice(-4)}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Bank Account Holder Name <span className="text-indigo-400">*</span>
              </label>
              <input
                id="biz-reg-bank-holder"
                type="text"
                required
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                placeholder="Must match organization name"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.bank_account_holder ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              />
              {fieldErrors.bank_account_holder && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.bank_account_holder}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Bank Account Number <span className="text-indigo-400">*</span>
              </label>
              <input
                id="biz-reg-bank-acc"
                type="text"
                required
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="e.g. 50200084719231"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.bank_account_number ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono`}
              />
              {fieldErrors.bank_account_number && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.bank_account_number}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  IFSC or SWIFT/BIC Code <span className="text-indigo-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">e.g. HDFC0001234 or CHASUS33</span>
              </div>
              <input
                id="biz-reg-bank-ifsc"
                type="text"
                required
                value={bankIfscSwift}
                onChange={(e) => setBankIfscSwift(e.target.value.toUpperCase())}
                placeholder="HDFC0001234"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.bank_ifsc_swift ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono`}
              />
              {fieldErrors.bank_ifsc_swift && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.bank_ifsc_swift}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Commercial Bank Name <span className="text-indigo-400">*</span>
              </label>
              <input
                id="biz-reg-bank-name"
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Commercial Bank Ltd"
                className={`w-full px-4 py-2.5 bg-slate-800 border ${
                  fieldErrors.bank_name ? 'border-rose-500' : 'border-slate-700'
                } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
              />
              {fieldErrors.bank_name && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.bank_name}</p>
              )}
            </div>
          </div>
        </div>

        <button
          id="biz-reg-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span>Uploading Payload & Initiating System Hard-Lock (POST /api/v1/auth/register/business)...</span>
          ) : (
            <>
              <span>Submit Profile for Yarifly Compliance Audit</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-400">
          Already have a corporate profile?{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1 cursor-pointer"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </div>
  );
};

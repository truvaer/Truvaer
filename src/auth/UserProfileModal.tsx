import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Edit3,
  Save,
  LogOut,
  Sparkles,
  Award,
  Globe,
  Briefcase,
  DollarSign,
  Clock,
  Landmark,
  FileText,
  AlertCircle,
  KeyRound,
  Eye,
  UploadCloud,
  PowerOff,
  Headphones,
  ShieldAlert,
  RefreshCw,
  Monitor,
  Activity,
} from 'lucide-react';
import { RegularUser, BusinessProfile } from '../types';
import { db } from '../data/mockDatabase';
import { DirectQuotationModal } from '../marketing/DirectQuotationModal';
import { PasswordResetModal } from './PasswordResetModal';
import { ProfilePictureManager } from '../shared/ProfilePictureManager';
import { BankDetailsUpdateModal } from '../components/BankDetailsUpdateModal';
import { BankDocumentPreviewModal } from '../components/BankDocumentPreviewModal';

interface UserProfileModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  onProfileUpdated?: () => void;
  onLogout?: () => void;
  onOpenCustomerCare?: () => void;
  onTestWarningModal?: () => void;
  idleTimeoutMinutes?: number;
  warningMinutes?: number;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen = true,
  onClose,
  currentUser,
  currentBusiness,
  onProfileUpdated,
  onLogout,
  onOpenCustomerCare,
  onTestWarningModal,
  idleTimeoutMinutes = 45,
  warningMinutes = 3,
}) => {
  if (!isOpen) return null;

  const isBusiness = !!currentBusiness;
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showBankUpdateModal, setShowBankUpdateModal] = useState(false);
  const [bankPreviewDocType, setBankPreviewDocType] = useState<'CANCELLED_CHEQUE' | 'BANK_STATEMENT' | null>(null);

  // Form state for regular user
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [organization, setOrganization] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<'Active Employee' | 'Alumni' | 'Candidate'>('Active Employee');

  // Form state for business
  const [ownerName, setOwnerName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [natureOfBusiness, setNatureOfBusiness] = useState('');
  const [budget, setBudget] = useState('');
  const [pricingRate, setPricingRate] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [servicesOffered, setServicesOffered] = useState('');

  // Bank Account details
  const [bankName, setBankName] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.first_name || '');
      setLastName(currentUser.last_name || '');
      setPhone(currentUser.phone_number || '');
      setCity(currentUser.city || '');
      setOrganization(currentUser.organization || '');
      setEmploymentStatus(currentUser.employment_status || 'Active Employee');
    } else if (currentBusiness) {
      setOrgName(currentBusiness.organization_name || '');
      setOwnerName(currentBusiness.owner_name || '');
      setBizPhone(currentBusiness.phone_number || '');
      setBizEmail(currentBusiness.business_email || '');
      setPhysicalLocation(currentBusiness.physical_location || '');
      setWebsiteUrl(currentBusiness.website_url || '');
      setDescription(currentBusiness.business_description || '');
      setNatureOfBusiness(currentBusiness.nature_of_business || 'VIP Charter & Aircraft Operations');
      setBudget(currentBusiness.budget || '₹1,500,000 / Sector');
      setPricingRate(currentBusiness.pricing_rate || '₹3,50,000 / Block Hour');
      setOperatingHours(currentBusiness.operating_hours || '24/7 Global AOG Dispatch');
      setServicesOffered(
        (currentBusiness.servicesOffered || [
          'VIP Private Jet Charter',
          'Helicopter Tarmac Transfers',
          'AOG Expedited Dispatch',
          'Executive Air Ambulance',
        ]).join(', ')
      );

      // Bank info
      setBankName(currentBusiness.bank_name || 'HDFC Bank Ltd');
      setBankHolder(currentBusiness.bank_account_holder || currentBusiness.organization_name);
      setBankAccountNumber(currentBusiness.bank_account_number || '50200012345678');
      setBankIfsc(currentBusiness.bank_ifsc_swift || 'HDFC0000123');
    }
    setIsEditing(false);
    setSaveSuccess(null);
  }, [currentUser, currentBusiness, isOpen]);

  // Handle ESC key to easily exit or close the profile pop-up
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser) {
      const users = db.getRegularUsers();
      const idx = users.findIndex((u) => u.user_id === currentUser.user_id);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phone.trim(),
          city: city.trim(),
          organization: organization.trim(),
          employment_status: employmentStatus,
        };
      }
    } else if (currentBusiness) {
      const parsedServices = servicesOffered
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      db.updateBusinessProfileDetails(currentBusiness.business_id, {
        organization_name: orgName.trim(),
        owner_name: ownerName.trim(),
        phone_number: bizPhone.trim(),
        business_email: bizEmail.trim(),
        physical_location: physicalLocation.trim(),
        website_url: websiteUrl.trim(),
        business_description: description.trim(),
        nature_of_business: natureOfBusiness.trim(),
        budget: budget.trim(),
        pricing_rate: pricingRate.trim(),
        operating_hours: operatingHours.trim(),
        servicesOffered: parsedServices,
        bank_name: bankName.trim(),
        bank_account_holder: bankHolder.trim(),
        bank_account_number: bankAccountNumber.trim(),
        bank_ifsc_swift: bankIfsc.trim(),
      });
    }

    setSaveSuccess('Business profile details & budget successfully saved and updated across all portals!');
    setIsEditing(false);
    if (onProfileUpdated) onProfileUpdated();

    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };

  const roleTitle = currentUser
    ? currentUser.role === 'SUPER_ADMIN'
      ? 'Super Administrator'
      : currentUser.role === 'ADMIN'
      ? 'Platform Administrator'
      : currentUser.role === 'MANAGER'
      ? 'Operations Manager'
      : 'Standard User'
    : 'Business User';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="User Profile"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Header with Cover Gradient & Prominent Close Button */}
        <div className="shrink-0 relative bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-4 sm:p-5 border-b border-slate-800 z-10 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20 overflow-hidden">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white overflow-hidden">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : currentBusiness?.logoUrl ? (
                    <img src={currentBusiness.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : isBusiness ? (
                    <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400" />
                  ) : (
                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400" />
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    {currentUser
                      ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username
                      : currentBusiness?.organization_name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {roleTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                  {currentUser ? currentUser.email : currentBusiness?.business_email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Identity Verified</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {currentUser ? currentUser.user_id.substring(0, 8) : currentBusiness?.business_id.substring(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            {/* Always Visible Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-white border border-slate-700 hover:border-rose-500 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-md active:scale-95 shrink-0"
              title="Close Profile (Esc)"
              aria-label="Close Profile"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Scrollable Modal Body (min-h-0 prevents flex child from overflowing parent) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Profile &amp; Credentials Overview
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {isBusiness && (
                <button
                  type="button"
                  onClick={() => setShowQuotationModal(true)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                  title="Issue Quotation directly from portal"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Issue Quotation</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer border ${
                  isEditing
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-slate-800 hover:bg-slate-750 text-sky-400 hover:text-sky-300 border-slate-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit Mode' : isBusiness ? 'Edit Profile, Budget & Bank' : 'Edit Profile'}</span>
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                  title="Exit from profile edit"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Exit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Form / Details View */}
          <form id="user-profile-form" onSubmit={handleSaveProfile} className="space-y-4">
            {/* Objective: Profile Picture Management (Add, Update, Delete with crop & cache-busting) */}
            {!isBusiness && currentUser && (
              <ProfilePictureManager
                currentImageUrl={currentUser.avatar_url}
                fallbackInitials={[currentUser.first_name?.[0], currentUser.last_name?.[0]].filter(Boolean).join('') || currentUser.username.slice(0, 2).toUpperCase()}
                isBusiness={false}
                title="Aviator Profile Picture"
                onImageSaved={(newImg) => {
                  db.updateUserProfilePicture(currentUser.user_id, newImg);
                  if (onProfileUpdated) onProfileUpdated();
                }}
              />
            )}

            {isBusiness && currentBusiness && (
              <ProfilePictureManager
                currentImageUrl={currentBusiness.logoUrl}
                fallbackInitials={currentBusiness.organization_name.slice(0, 2).toUpperCase()}
                isBusiness={true}
                title="Business Firm Profile Logo & Picture"
                onImageSaved={(newLogo) => {
                  db.updateBusinessLogo(currentBusiness.business_id, newLogo);
                  if (onProfileUpdated) onProfileUpdated();
                }}
              />
            )}

            {!isBusiness && currentUser && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white font-medium">
                      {currentUser.first_name || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white font-medium">
                      {currentUser.last_name || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Username / Handle</label>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-slate-300 font-mono">
                    @{currentUser.username}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Registered Email</label>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-slate-300 font-mono">
                    {currentUser.email}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white font-mono">
                      {currentUser.phone_number || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City / Base Hub</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white">
                      {currentUser.city || 'Global Aviator'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Organization / Employer</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white">
                      {currentUser.organization || 'SkyStream Aviation Network'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Aviation Employment Status</label>
                  {isEditing ? (
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Active Employee">Active Employee</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Candidate">Candidate</option>
                    </select>
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white">
                      {currentUser.employment_status || 'Active Employee'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isBusiness && currentBusiness && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Organization Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white font-semibold">
                      {currentBusiness.organization_name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Authorized Owner</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white">
                      {currentBusiness.owner_name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Corporate Email</label>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-slate-300 font-mono">
                    {currentBusiness.business_email}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Registration Number ({currentBusiness.reg_number_type})</label>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-amber-300 font-mono font-bold">
                    {currentBusiness.registration_number}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Corporate Phone *</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      placeholder="+91 98200 12345"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white font-mono">
                      {currentBusiness.phone_number || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hangar / Headquarters Base</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={physicalLocation}
                      onChange={(e) => setPhysicalLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-white">
                      {currentBusiness.physical_location || 'Global Operations'}
                    </div>
                  )}
                </div>

                {/* Requirement: Budget & Pricing Rate */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>Charter Budget / Package Price</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. ₹1,500,000 / Sector"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-amber-300 font-bold font-mono">
                      {currentBusiness.budget || '₹1,500,000 / Sector'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Hourly Rate / Operating Hours</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={pricingRate}
                      onChange={(e) => setPricingRate(e.target.value)}
                      placeholder="e.g. ₹3,50,000 / Block Hour"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-sky-300 font-semibold">
                      {currentBusiness.pricing_rate || '₹3,50,000 / Block Hour'} • {currentBusiness.operating_hours || '24/7 Global AOG'}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Services &amp; Fleet Capabilities (comma-separated)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={servicesOffered}
                      onChange={(e) => setServicesOffered(e.target.value)}
                      placeholder="VIP Charter, AOG Rescue, Air Ambulance, Helicopter Transit"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      {(currentBusiness.servicesOffered || ['VIP Private Jet Charter', 'Helicopter Tarmac Transfers']).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Requirement: Bank Account Details & Finance Settlement Verification */}
                <div className="sm:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800/90 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center space-x-2 text-xs font-bold text-white">
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      <span>Registered Settlement Bank Account</span>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center space-x-1.5 w-fit ${
                        currentBusiness.finance_bank_verified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : currentBusiness.bank_verification_status === 'REVOKED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : currentBusiness.bank_verification_status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {currentBusiness.finance_bank_verified ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>✓ Verified by Finance Desk (Remittances Active)</span>
                        </>
                      ) : currentBusiness.bank_verification_status === 'REVOKED' ? (
                        <>
                          <PowerOff className="w-3 h-3 text-rose-400" />
                          <span>⛔ Verification Shut Off / Revoked</span>
                        </>
                      ) : currentBusiness.bank_verification_status === 'REJECTED' ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          <span>❌ Verification Rejected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>⏳ Pending Finance &amp; L7 Settlement Verification</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Bank Details Display */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Bank Name</span>
                      <strong className="text-white">{currentBusiness.bank_name || 'HDFC Bank Ltd'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Account Holder</span>
                      <span className="text-slate-200">{currentBusiness.bank_account_holder || currentBusiness.organization_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Account Number</span>
                      <span className="font-mono text-amber-300">{currentBusiness.bank_account_number_masked || '••••8899'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">IFSC / SWIFT</span>
                      <span className="font-mono text-slate-300">{currentBusiness.bank_ifsc_swift || 'HDFC0000123'}</span>
                    </div>
                  </div>

                  {/* Uploaded Verification Documents Proof */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Attached Proof:</span>
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

                    {/* Owner Action: Change / Upload Bank Details */}
                    <button
                      type="button"
                      onClick={() => setShowBankUpdateModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Coordinates &amp; Upload Proof</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 italic leading-relaxed">
                    Note: Bank details modification is permitted strictly from the account owner who uploaded it. Payout settlements released by the Finance Department will be remitted strictly to this verified bank account.
                  </p>
                </div>

                {/* Requirement: Provide an option to issue quotation directly from the portal */}
                <div className="sm:col-span-2 pt-2">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-amber-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Commercial Quotation Console</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Issue a binding formal aviation quotation directly from your business portal to any client or lead.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuotationModal(true)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-md transition-transform active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Issue Quotation</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel Edit
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1.5"
                  title="Discard changes and exit profile pop-up"
                >
                  <X className="w-4 h-4" />
                  <span>Exit Profile</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>

          {/* ========================================================================= */}
          {/* SESSION INACTIVITY GUARD & TIMEOUT SETTINGS                                */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Session &amp; Inactivity Security Guard
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Keep-Alive Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Idle Timeout</span>
                <p className="font-mono font-bold text-amber-300">{idleTimeoutMinutes} Minutes</p>
                <p className="text-[10px] text-slate-400">Extended standard session duration</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Warning Alert</span>
                <p className="font-mono font-bold text-sky-300">{warningMinutes} Minutes Before</p>
                <p className="text-[10px] text-slate-400">Interactive countdown prompt</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Tab Sync</span>
                <p className="font-mono font-bold text-emerald-400">BroadcastChannel</p>
                <p className="text-[10px] text-slate-400">Cross-tab multi-session alive</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
              <p className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Typing, scrolling, and clicking automatically send background keep-alive pings.</span>
              </p>
              {onTestWarningModal && (
                <button
                  type="button"
                  onClick={onTestWarningModal}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Test the 3-minute auto-logout warning prompt dialog"
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Test Warning Prompt</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer Bar with Always-Visible Exit & Close Buttons */}
        <div className="shrink-0 p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-10 shadow-lg">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="hidden sm:inline">Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">ESC</kbd> or click backdrop to exit</span>
            <span className="sm:hidden">Press ESC to exit</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenCustomerCare) onOpenCustomerCare();
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Connect with Customer Care (Live Chat & Priority Support)"
            >
              <Headphones className="w-3.5 h-3.5 text-blue-400" />
              <span>{isBusiness ? 'VIP Concierge' : 'Connect Care'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordResetModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
              title="Verify historical passwords and reset security credentials"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>3-Password Reset</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-slate-500 text-white font-bold text-xs transition-all cursor-pointer border border-slate-700 flex items-center space-x-1.5 shadow-sm active:scale-95"
              title="Close Profile Pop-up (Esc)"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>Close Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Password Security Verification Modal */}
      {showPasswordResetModal && (
        <PasswordResetModal
          isOpen={showPasswordResetModal}
          onClose={() => setShowPasswordResetModal(false)}
          initialIdentifier={
            currentUser?.email ||
            currentUser?.username ||
            currentBusiness?.business_email ||
            currentBusiness?.registration_number ||
            ''
          }
          onPasswordResetSuccess={() => {
            if (onProfileUpdated) onProfileUpdated();
          }}
        />
      )}

      {/* Direct Quotation Generator Modal */}
      {showQuotationModal && (
        <DirectQuotationModal
          isOpen={showQuotationModal}
          onClose={() => setShowQuotationModal(false)}
          currentBusiness={currentBusiness}
          currentUser={currentUser}
          onQuotationIssued={() => {
            if (onProfileUpdated) onProfileUpdated();
          }}
        />
      )}

      {/* Bank Details Update Modal (Rule 3: Owner Upload Only) */}
      {showBankUpdateModal && currentBusiness && (
        <BankDetailsUpdateModal
          isOpen={showBankUpdateModal}
          onClose={() => setShowBankUpdateModal(false)}
          business={currentBusiness}
          onSuccess={(updated) => {
            if (onProfileUpdated) onProfileUpdated();
          }}
        />
      )}

      {/* Bank Document Preview Modal */}
      {bankPreviewDocType && currentBusiness && (
        <BankDocumentPreviewModal
          isOpen={!!bankPreviewDocType}
          onClose={() => setBankPreviewDocType(null)}
          documentType={bankPreviewDocType}
          business={currentBusiness}
        />
      )}
    </div>
  );
};

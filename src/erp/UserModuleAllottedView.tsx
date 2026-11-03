import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Search,
  Save,
  Users,
  Layers,
  Sparkles,
  ArrowLeft,
  X,
  Sliders,
  Globe,
  Filter,
  User,
  Zap,
} from 'lucide-react';
import { RegularUser, AdminUser } from '../types';
import { db } from '../data/mockDatabase';

export const ALL_39_MODULES = [
  // Column 1 (13)
  'Accounts',
  'Assets',
  'Audit Trail',
  'Automation',
  'Bulk Transaction',
  'Buying',
  'Communication',
  'Contacts',
  'Core',
  'CRM',
  'Custom',
  'Desk',
  'Drive',
  // Column 2 (13)
  'EDI',
  'Email',
  'ERPNext Integrations',
  'Geo',
  'GST India',
  'HR',
  'Income Tax India',
  'Integrations',
  'Maintenance',
  'Manufacturing',
  'Payroll',
  'Portal',
  'Printing',
  // Column 3 (13)
  'Projects',
  'Quality Management',
  'Regional',
  'Selling',
  'Setup',
  'Stock',
  'Subcontracting',
  'Support',
  'Telephony',
  'Utilities',
  'VAT India',
  'Website',
  'Workflow',
];

// Presets for rapid 1-click allocation
const PRESET_OPERATIONS_CORE = [
  'Accounts',
  'Assets',
  'Audit Trail',
  'Automation',
  'Bulk Transaction',
  'Buying',
  'Communication',
  'Contacts',
  'Core',
  'CRM',
  'Desk',
  'Drive',
  'Email',
  'Geo',
  'Maintenance',
  'Payroll',
  'Portal',
  'Projects',
  'Regional',
  'Selling',
  'Stock',
  'Support',
  'Telephony',
  'Workflow',
];

const PRESET_AVIATOR_STANDARD = [
  'Communication',
  'Contacts',
  'Core',
  'CRM',
  'Desk',
  'Drive',
  'Email',
  'Portal',
  'Printing',
  'Support',
  'Telephony',
  'Utilities',
  'Website',
];

// Module Account Holder & Governance Lead Registry (Requirement 5)
export const MODULE_ACCOUNT_HOLDERS: Record<string, { lead: string; role: string }> = {
  Accounts: { lead: 'Sunil Mathur', role: 'Finance Head L6' },
  Assets: { lead: 'Capt. Sameer Khurana', role: 'VP Asset Operations L7' },
  'Audit Trail': { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8' },
  Automation: { lead: 'Aditya Vikram Verma', role: 'Systems Manager L5' },
  'Bulk Transaction': { lead: 'Manish Agarwal', role: 'Treasury Officer L4' },
  Buying: { lead: 'Sunita Rao', role: 'Procurement Lead L6' },
  Communication: { lead: 'Sarah Jenkins', role: 'Corporate Comms L4' },
  Contacts: { lead: 'Pooja Nair', role: 'Support Supervisor L3' },
  Core: { lead: 'B Aditya Narayana', role: 'Chairman & MD L8' },
  CRM: { lead: 'Rohan Mehra', role: 'Commercial Sales Lead L5' },
  Custom: { lead: 'Aditya Vikram Verma', role: 'Operations Manager L5' },
  Desk: { lead: 'Capt. Vikram Malhotra', role: 'Flight Operations Lead L4' },
  Drive: { lead: 'Sarah Jenkins', role: 'Digital Assets Officer L3' },
  EDI: { lead: 'Manish Agarwal', role: 'Integration Specialist L4' },
  Email: { lead: 'Sarah Jenkins', role: 'Enterprise Postmaster L3' },
  'ERPNext Integrations': { lead: 'Aditya Vikram Verma', role: 'Systems Manager L5' },
  Geo: { lead: 'Capt. Rajesh Varma', role: 'Navigation Director L7' },
  'GST India': { lead: 'Sunil Mathur', role: 'Tax Compliance Lead L6' },
  HR: { lead: 'Priya Deshmukh', role: 'Head of People & HRMS L6' },
  'Income Tax India': { lead: 'Sunil Mathur', role: 'Tax Compliance Lead L6' },
  Integrations: { lead: 'Aditya Vikram Verma', role: 'Systems Manager L5' },
  Maintenance: { lead: 'Alok Nath', role: 'Airworthiness Supervisor L3' },
  Manufacturing: { lead: 'Capt. Sameer Khurana', role: 'MRO Director L7' },
  Payroll: { lead: 'Priya Deshmukh', role: 'Compensation Head L5' },
  Portal: { lead: 'Sarah Jenkins', role: 'Client Experience Lead L4' },
  Printing: { lead: 'Alok Nath', role: 'Technical Services L3' },
  Projects: { lead: 'Vikram Sengupta', role: 'PMS Operations Lead L4' },
  'Quality Management': { lead: 'Capt. Rajesh Varma', role: 'Safety Inspector L7' },
  Regional: { lead: 'Aditya Vikram Verma', role: 'Regional Authority Manager L5' },
  Selling: { lead: 'Rohan Mehra', role: 'Commercial Sales Lead L5' },
  Setup: { lead: 'B Aditya Narayana', role: 'Chairman & Super Admin L8' },
  Stock: { lead: 'Alok Nath', role: 'Warehouse & GSE Stores L3' },
  Subcontracting: { lead: 'Sunita Rao', role: 'Vendor Operations L6' },
  Support: { lead: 'Divya Nair', role: 'Customer Care Lead L2' },
  Telephony: { lead: 'Divya Nair', role: 'Voice Dispatch Operator L2' },
  Utilities: { lead: 'Aditya Vikram Verma', role: 'Facilities Lead L4' },
  'VAT India': { lead: 'Sunil Mathur', role: 'Finance Head L6' },
  Website: { lead: 'Sarah Jenkins', role: 'Public Relations L4' },
  Workflow: { lead: 'Capt. Sameer Khurana', role: 'VP Operations L7' },
};

interface UserModuleAllottedViewProps {
  onNavigateToPermissions: () => void;
  onNotice?: (msg: string, type?: 'success' | 'error') => void;
  activeAdminUser?: AdminUser | null;
  initialSelectedUserId?: string;
  onSwitchActiveUser?: (user: RegularUser) => void;
}

export const UserModuleAllottedView: React.FC<UserModuleAllottedViewProps> = ({
  onNavigateToPermissions,
  onNotice,
  activeAdminUser,
  initialSelectedUserId,
  onSwitchActiveUser,
}) => {
  const [users, setUsers] = useState<RegularUser[]>(() => db.getRegularUsers());

  // Default to Standard User, else initial or first user
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    if (initialSelectedUserId) return initialSelectedUserId;
    const stdUser = users.find((u) => u.role === 'STANDARD_USER' || u.user_id === 'usr_standard_user');
    return stdUser ? stdUser.user_id : users[0]?.user_id || '';
  });

  const selectedUser = users.find((u) => u.user_id === selectedUserId) || users[0];

  // Selected Modules for this user
  const [userModules, setUserModules] = useState<string[]>(() => {
    return selectedUser?.allowed_modules && selectedUser.allowed_modules.length > 0
      ? selectedUser.allowed_modules
      : ALL_39_MODULES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSessionActive, setTestSessionActive] = useState(false);

  // Sync when selected user changes
  useEffect(() => {
    if (selectedUser) {
      if (selectedUser.allowed_modules && selectedUser.allowed_modules.length > 0) {
        setUserModules(selectedUser.allowed_modules);
      } else {
        setUserModules(ALL_39_MODULES);
      }
      setSavedSuccess(false);
    }
  }, [selectedUserId]);

  // Toggle single module
  const handleToggleModule = (modName: string) => {
    setUserModules((prev) => {
      if (prev.includes(modName)) {
        return prev.filter((m) => m !== modName);
      } else {
        return [...prev, modName];
      }
    });
    setSavedSuccess(false);
  };

  // Quick Presets
  const applyPreset = (preset: 'all' | 'operations' | 'standard' | 'clear') => {
    if (preset === 'all') setUserModules([...ALL_39_MODULES]);
    else if (preset === 'operations') setUserModules([...PRESET_OPERATIONS_CORE]);
    else if (preset === 'standard') setUserModules([...PRESET_AVIATOR_STANDARD]);
    else if (preset === 'clear') setUserModules([]);
    setSavedSuccess(false);
  };

  // Save Allotted Modules
  const handleSave = () => {
    if (!selectedUser) return;

    selectedUser.allowed_modules = [...userModules];
    const res = db.updateUserModuleAccess(selectedUser.user_id, userModules);

    if (res.success) {
      setSavedSuccess(true);
      const fullName = [selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(' ') || selectedUser.username;
      if (onNotice) {
        onNotice(`Successfully saved ${userModules.length} module allotment(s) for ${fullName}!`, 'success');
      }
    } else {
      if (onNotice) onNotice(res.message, 'error');
    }
  };

  // Switch session to this user to test how their allotted interface works (Requirement 1)
  const handleSwitchSessionToTest = () => {
    if (!selectedUser) return;

    // First persist modules
    selectedUser.allowed_modules = [...userModules];
    db.updateUserModuleAccess(selectedUser.user_id, userModules);

    setTestSessionActive(true);
    if (onSwitchActiveUser) {
      onSwitchActiveUser(selectedUser);
    } else {
      // Fallback direct session write
      const token = `sess_usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      try {
        sessionStorage.setItem('truvaer_client_session_token', token);
        sessionStorage.setItem('truvaer_active_session_type', 'regular');
        sessionStorage.setItem('truvaer_active_session_id', selectedUser.user_id);
      } catch {}
      window.location.reload();
    }

    if (onNotice) {
      const fullName = [selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(' ') || selectedUser.username;
      onNotice(`Testing session activated! Now logged in as @${selectedUser.username} (${fullName}) with ${userModules.length} active module(s).`, 'success');
    }
  };

  const percentageActive = Math.round((userModules.length / ALL_39_MODULES.length) * 100);

  // Column definitions (13 in each column)
  const col1 = ALL_39_MODULES.slice(0, 13);
  const col2 = ALL_39_MODULES.slice(13, 26);
  const col3 = ALL_39_MODULES.slice(26, 39);

  const filterMatches = (name: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const owner = MODULE_ACCOUNT_HOLDERS[name]?.lead.toLowerCase() || '';
    return name.toLowerCase().includes(q) || owner.includes(q);
  };

  const initials = selectedUser
    ? `${selectedUser.first_name?.[0] || 'U'}${selectedUser.last_name?.[0] || ''}`.toUpperCase()
    : 'US';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-black text-white">User Module Allocation Desk</h2>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  39-Module Architecture
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Granular module allocation console with named account holder accountability. Toggle modules and test live user interfaces directly.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Requirement 1: Switch Session To Test Live Interface */}
          <button
            type="button"
            onClick={handleSwitchSessionToTest}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            title="Switch active session to this user to test how their allotted modules function"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>⚡ Test Interface As This User</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToPermissions}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-700"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Role Permissions Matrix</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Allotted Modules</span>
          </button>
        </div>
      </div>

      {/* User Selector & Account Holder Profile Card Bar (Requirement 5) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Picker */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
            {initials}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <label htmlFor="user-select" className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">
                Assigned Aviator / Account Holder:
              </label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-1 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.username} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-xs text-amber-300 font-bold font-mono">
                Account Holder: {[selectedUser?.first_name, selectedUser?.last_name].filter(Boolean).join(' ') || selectedUser?.username}
              </span>
              <span className="text-slate-500 text-xs">|</span>
              <span className="text-xs font-mono text-slate-400">{selectedUser?.email}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {selectedUser?.role || 'STANDARD_USER'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Zone: {selectedUser?.assigned_regions?.[0] || 'GLOBAL'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Governing Admin: B Aditya Narayana (L8 Super Admin)
              </span>
            </div>
          </div>
        </div>

        {/* Counter & Metric Pill */}
        <div className="flex items-center space-x-4 self-end md:self-center">
          <div className="text-right">
            <div className="text-sm font-black text-white font-mono">
              <span className="text-emerald-400">{userModules.length}</span> / 39 Active
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {percentageActive}% Total System Coverage
            </div>
          </div>

          <div className="w-16 h-2.5 bg-slate-800 rounded-full overflow-hidden shrink-0 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full transition-all duration-300"
              style={{ width: `${percentageActive}%` }}
            />
          </div>
        </div>
      </div>

      {/* Preset Action Strip & Search Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono mr-1">
            Quick Presets:
          </span>

          <button
            type="button"
            onClick={() => applyPreset('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              userModules.length === 39
                ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
            }`}
          >
            Full Access (39)
          </button>

          <button
            type="button"
            onClick={() => applyPreset('operations')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-all cursor-pointer"
          >
            Operations Core (24)
          </button>

          <button
            type="button"
            onClick={() => applyPreset('standard')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-all cursor-pointer"
          >
            Aviator Standard (13)
          </button>

          <button
            type="button"
            onClick={() => applyPreset('clear')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
          >
            Clear All (0)
          </button>
        </div>

        {/* Module Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search module or account lead..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Module allotment saved successfully! User <strong>@{[selectedUser?.first_name, selectedUser?.last_name].filter(Boolean).join(' ') || selectedUser?.username}</strong> now has {userModules.length} active platform modules.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccess(false)}
            className="text-emerald-400 hover:text-emerald-200 text-xs cursor-pointer font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3-Column Clean 39-Module Allotment Grid with Account Holder Ownership */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1 (Modules 1-13) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400 font-mono">
            <span>Column 1 (Core &amp; Workspace)</span>
            <span className="text-emerald-400">
              {col1.filter((m) => userModules.includes(m)).length} / 13
            </span>
          </div>

          <div className="space-y-2">
            {col1.map((modName) => {
              const isChecked = userModules.includes(modName);
              const matches = filterMatches(modName);
              if (!matches) return null;
              const owner = MODULE_ACCOUNT_HOLDERS[modName];

              return (
                <label
                  key={modName}
                  className={`flex flex-col p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleModule(modName)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                      <span className="font-bold truncate">{modName}</span>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        isChecked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isChecked ? 'Active' : 'Locked'}
                    </span>
                  </div>

                  {/* Responsible Account Holder (Requirement 5) */}
                  <div className="mt-1.5 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-amber-400 font-bold truncate">
                      Lead: {owner?.lead || 'Platform Admin'}
                    </span>
                    <span className="text-slate-500 text-[9px]">{owner?.role}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Column 2 (Modules 14-26) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400 font-mono">
            <span>Column 2 (Finance &amp; Integrations)</span>
            <span className="text-sky-400">
              {col2.filter((m) => userModules.includes(m)).length} / 13
            </span>
          </div>

          <div className="space-y-2">
            {col2.map((modName) => {
              const isChecked = userModules.includes(modName);
              const matches = filterMatches(modName);
              if (!matches) return null;
              const owner = MODULE_ACCOUNT_HOLDERS[modName];

              return (
                <label
                  key={modName}
                  className={`flex flex-col p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-sky-950/30 border-sky-500/40 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleModule(modName)}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                      <span className="font-bold truncate">{modName}</span>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        isChecked
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isChecked ? 'Active' : 'Locked'}
                    </span>
                  </div>

                  {/* Responsible Account Holder (Requirement 5) */}
                  <div className="mt-1.5 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-sky-300 font-bold truncate">
                      Lead: {owner?.lead || 'Finance Lead'}
                    </span>
                    <span className="text-slate-500 text-[9px]">{owner?.role}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Column 3 (Modules 27-39) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400 font-mono">
            <span>Column 3 (Operations &amp; Support)</span>
            <span className="text-indigo-400">
              {col3.filter((m) => userModules.includes(m)).length} / 13
            </span>
          </div>

          <div className="space-y-2">
            {col3.map((modName) => {
              const isChecked = userModules.includes(modName);
              const matches = filterMatches(modName);
              if (!matches) return null;
              const owner = MODULE_ACCOUNT_HOLDERS[modName];

              return (
                <label
                  key={modName}
                  className={`flex flex-col p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-indigo-950/30 border-indigo-500/40 text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleModule(modName)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-950 border-slate-700 cursor-pointer"
                      />
                      <span className="font-bold truncate">{modName}</span>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        isChecked
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isChecked ? 'Active' : 'Locked'}
                    </span>
                  </div>

                  {/* Responsible Account Holder (Requirement 5) */}
                  <div className="mt-1.5 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-indigo-300 font-bold truncate">
                      Lead: {owner?.lead || 'Operations Director'}
                    </span>
                    <span className="text-slate-500 text-[9px]">{owner?.role}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Save & Summary Bar */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-400">
          Showing allocation for <span className="font-bold text-white">@{[selectedUser?.first_name, selectedUser?.last_name].filter(Boolean).join(' ') || selectedUser?.username}</span>: <strong className="text-emerald-400 font-mono">{userModules.length}</strong> modules selected out of 39.
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleSwitchSessionToTest}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer transition-all flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Test This User</span>
          </button>

          <button
            type="button"
            onClick={() => setUserModules([...ALL_39_MODULES])}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs cursor-pointer transition-all"
          >
            Select All 39
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Allotted Modules</span>
          </button>
        </div>
      </div>
    </div>
  );
};

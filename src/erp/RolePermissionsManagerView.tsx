import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Layers,
  ArrowRight,
  UserCheck,
  X,
  FileCheck,
  User,
} from 'lucide-react';
import { db } from '../data/mockDatabase';

export interface PermissionRuleItem {
  id: string;
  documentType: string;
  role: string;
  onlyIfCreator: boolean;
  level: number;
  accountHolder?: string;
  permissions: {
    select: boolean;
    read: boolean;
    write: boolean;
    create: boolean;
    delete: boolean;
    print: boolean;
    email: boolean;
    report: boolean;
    import: boolean;
    export: boolean;
    setUserPermissions: boolean;
    share: boolean;
  };
}

const DEFAULT_PERMISSION_RULES: PermissionRuleItem[] = [
  {
    id: 'rule_sfp_1',
    documentType: 'Social Feed Post',
    role: 'Community User',
    onlyIfCreator: true,
    level: 0,
    accountHolder: 'Aditya Narayana (Community Lead)',
    permissions: {
      select: false,
      read: false,
      write: true,
      create: true,
      delete: true,
      print: false,
      email: false,
      report: false,
      import: false,
      export: false,
      setUserPermissions: false,
      share: false,
    },
  },
  {
    id: 'rule_sfp_2',
    documentType: 'Social Feed Post',
    role: 'Community User',
    onlyIfCreator: false,
    level: 0,
    accountHolder: 'Aditya Narayana (Community Lead)',
    permissions: {
      select: true,
      read: true,
      write: false,
      create: false,
      delete: false,
      print: false,
      email: false,
      report: false,
      import: false,
      export: false,
      setUserPermissions: false,
      share: true,
    },
  },
  {
    id: 'rule_sfc_1',
    documentType: 'Social Feed Comment',
    role: 'Community User',
    onlyIfCreator: true,
    level: 0,
    accountHolder: 'Aditya Narayana (Community Lead)',
    permissions: {
      select: false,
      read: false,
      write: true,
      create: true,
      delete: true,
      print: false,
      email: false,
      report: false,
      import: false,
      export: false,
      setUserPermissions: false,
      share: false,
    },
  },
  {
    id: 'rule_sfc_2',
    documentType: 'Social Feed Comment',
    role: 'Community User',
    onlyIfCreator: false,
    level: 0,
    accountHolder: 'Aditya Narayana (Community Lead)',
    permissions: {
      select: true,
      read: true,
      write: false,
      create: false,
      delete: false,
      print: false,
      email: false,
      report: false,
      import: false,
      export: false,
      setUserPermissions: false,
      share: true,
    },
  },
  {
    id: 'rule_ops_1',
    documentType: 'Flight Dispatch Clearance',
    role: 'Operations Lead',
    onlyIfCreator: false,
    level: 4,
    accountHolder: 'Vikram Sengupta (Ops Lead L4)',
    permissions: {
      select: true,
      read: true,
      write: true,
      create: true,
      delete: false,
      print: true,
      email: true,
      report: true,
      import: true,
      export: true,
      setUserPermissions: false,
      share: true,
    },
  },
  {
    id: 'rule_dir_1',
    documentType: 'Executive Airspace Sign-off',
    role: 'Regional Manager (L5+)',
    onlyIfCreator: false,
    level: 5,
    accountHolder: 'Aditya Vikram Verma (Manager L5)',
    permissions: {
      select: true,
      read: true,
      write: true,
      create: true,
      delete: true,
      print: true,
      email: true,
      report: true,
      import: true,
      export: true,
      setUserPermissions: true,
      share: true,
    },
  },
  {
    id: 'rule_sup_1',
    documentType: 'Sovereign Platform Governance',
    role: 'Executive Chairman (L8)',
    onlyIfCreator: false,
    level: 8,
    accountHolder: 'B Aditya Narayana (Chairman & MD L8)',
    permissions: {
      select: true,
      read: true,
      write: true,
      create: true,
      delete: true,
      print: true,
      email: true,
      report: true,
      import: true,
      export: true,
      setUserPermissions: true,
      share: true,
    },
  },
];

interface RolePermissionsManagerViewProps {
  onNavigateToUserPermissions: () => void;
  onNotice?: (msg: string, type?: 'success' | 'error') => void;
  isL7OrL8?: boolean;
}

export const RolePermissionsManagerView: React.FC<RolePermissionsManagerViewProps> = ({
  onNavigateToUserPermissions,
  onNotice,
  isL7OrL8 = true,
}) => {
  const [rules, setRules] = useState<PermissionRuleItem[]>(() => {
    try {
      const saved = localStorage.getItem('truvaer_role_permission_rules_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PERMISSION_RULES;
  });

  // Filter States
  const [filterDocType, setFilterDocType] = useState<string>('ALL');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterCapability, setFilterCapability] = useState<string>('ALL');
  const [filterOnlyCreator, setFilterOnlyCreator] = useState<'ALL' | 'CREATOR_ONLY' | 'NOT_CREATOR'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add New Rule Dialog State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState<{
    documentType: string;
    role: string;
    level: number;
    onlyIfCreator: boolean;
    accountHolder: string;
    permissions: PermissionRuleItem['permissions'];
  }>({
    documentType: '',
    role: 'Community User',
    level: 0,
    onlyIfCreator: false,
    accountHolder: 'B Aditya Narayana (Chairman & MD L8)',
    permissions: {
      select: true,
      read: true,
      write: false,
      create: false,
      delete: false,
      print: false,
      email: false,
      report: false,
      import: false,
      export: false,
      setUserPermissions: false,
      share: false,
    },
  });

  const persistRules = (updated: PermissionRuleItem[]) => {
    setRules(updated);
    try {
      localStorage.setItem('truvaer_role_permission_rules_v2', JSON.stringify(updated));
    } catch {}
  };

  // Toggle single permission
  const handleTogglePermission = (ruleId: string, permKey: keyof PermissionRuleItem['permissions']) => {
    const updated = rules.map((r) => {
      if (r.id === ruleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !r.permissions[permKey],
          },
        };
      }
      return r;
    });
    persistRules(updated);
    if (onNotice) onNotice(`Updated permission "${permKey}" for ${rules.find((r) => r.id === ruleId)?.documentType}.`, 'success');
  };

  // Toggle Only If Creator
  const handleToggleOnlyCreator = (ruleId: string) => {
    const updated = rules.map((r) => {
      if (r.id === ruleId) {
        return {
          ...r,
          onlyIfCreator: !r.onlyIfCreator,
        };
      }
      return r;
    });
    persistRules(updated);
    if (onNotice) onNotice(`Updated creator constraint.`, 'success');
  };

  // Delete rule
  const handleDeleteRule = (ruleId: string) => {
    const target = rules.find((r) => r.id === ruleId);
    if (!target) return;
    const confirmed = window.confirm(`Remove permission rule for "${target.documentType}" (${target.role})?`);
    if (!confirmed) return;

    const updated = rules.filter((r) => r.id !== ruleId);
    persistRules(updated);
    if (onNotice) onNotice(`Removed permission rule for ${target.documentType}.`, 'success');
  };

  // Add New Rule
  const handleCreateNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleForm.documentType.trim()) {
      if (onNotice) onNotice('Document / Entity Type is required.', 'error');
      return;
    }

    const newRule: PermissionRuleItem = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      documentType: newRuleForm.documentType.trim(),
      role: newRuleForm.role,
      level: newRuleForm.level,
      onlyIfCreator: newRuleForm.onlyIfCreator,
      accountHolder: newRuleForm.accountHolder.trim() || 'B Aditya Narayana (Super Admin L8)',
      permissions: { ...newRuleForm.permissions },
    };

    const updated = [newRule, ...rules];
    persistRules(updated);
    setShowAddModal(false);
    setNewRuleForm({
      documentType: '',
      role: 'Community User',
      level: 0,
      onlyIfCreator: false,
      accountHolder: 'B Aditya Narayana (Chairman & MD L8)',
      permissions: {
        select: true,
        read: true,
        write: false,
        create: false,
        delete: false,
        print: false,
        email: false,
        report: false,
        import: false,
        export: false,
        setUserPermissions: false,
        share: false,
      },
    });

    if (onNotice) onNotice(`Successfully added permission rule for "${newRule.documentType}"!`, 'success');
  };

  const uniqueDocTypes = Array.from(new Set(rules.map((r) => r.documentType)));
  const uniqueRoles = Array.from(new Set(rules.map((r) => r.role)));

  // Filtered Rules
  const filteredRules = rules.filter((rule) => {
    if (filterDocType !== 'ALL' && rule.documentType !== filterDocType) return false;
    if (filterRole !== 'ALL' && rule.role !== filterRole) return false;
    if (filterLevel !== 'ALL' && String(rule.level) !== filterLevel) return false;
    if (filterOnlyCreator === 'CREATOR_ONLY' && !rule.onlyIfCreator) return false;
    if (filterOnlyCreator === 'NOT_CREATOR' && rule.onlyIfCreator) return false;
    if (filterCapability !== 'ALL') {
      const key = filterCapability as keyof PermissionRuleItem['permissions'];
      if (!rule.permissions[key]) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const match =
        rule.documentType.toLowerCase().includes(q) ||
        rule.role.toLowerCase().includes(q) ||
        (rule.accountHolder && rule.accountHolder.toLowerCase().includes(q)) ||
        String(rule.level).includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Dark Themed with Action Buttons and Account Holder Info    */}
      {/* ========================================================================= */}
      <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90">
        <div>
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Role Permissions Manager
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              Doctype Permissions Matrix
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Configure entity permissions, document types, and granular capabilities across user roles. Supervised by corporate directorate.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Button: Set User Permissions (links to User Module Allotted) */}
          <button
            type="button"
            onClick={onNavigateToUserPermissions}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>User Module Allotted (39)</span>
          </button>

          {/* Button: + Add A New Rule */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Add A New Rule</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PERMISSIONS FILTER SUITE (Dark Themed)                                  */}
      {/* ========================================================================= */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col gap-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-bold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Permissions Filter Suite</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-850 text-slate-300 font-mono border border-slate-750">
              {filteredRules.length} / {rules.length} Rules Active
            </span>
          </div>

          {(searchTerm || filterDocType !== 'ALL' || filterRole !== 'ALL' || filterLevel !== 'ALL' || filterCapability !== 'ALL' || filterOnlyCreator !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterDocType('ALL');
                setFilterRole('ALL');
                setFilterLevel('ALL');
                setFilterCapability('ALL');
                setFilterOnlyCreator('ALL');
              }}
              className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center space-x-1 cursor-pointer font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctype, role, or lead..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter by Document Type */}
          <div>
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Doctype: All Entities</option>
              {uniqueDocTypes.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Role */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Role: All Roles</option>
              {uniqueRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Level */}
          <div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Clearance: All Levels</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                <option key={lvl} value={String(lvl)}>
                  Level {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Capability */}
          <div>
            <select
              value={filterCapability}
              onChange={(e) => setFilterCapability(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Permission: All</option>
              <option value="select">Requires Select</option>
              <option value="read">Requires Read</option>
              <option value="write">Requires Write</option>
              <option value="create">Requires Create</option>
              <option value="delete">Requires Delete</option>
              <option value="export">Requires Export</option>
              <option value="share">Requires Share</option>
              <option value="setUserPermissions">Set User Permissions</option>
            </select>
          </div>

          {/* Filter by Creator Scope */}
          <div>
            <select
              value={filterOnlyCreator}
              onChange={(e) => setFilterOnlyCreator(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-750 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Ownership: All</option>
              <option value="CREATOR_ONLY">Only If Creator</option>
              <option value="NOT_CREATOR">Global / Any Creator</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PERMISSIONS TABLE: Dark Themed with Account Holder on Every Rule        */}
      {/* ========================================================================= */}
      <div className="divide-y divide-slate-800 overflow-x-auto bg-slate-950/60">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Sliders className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-bold text-slate-300">No permission rules match the selected filters.</p>
            <p className="text-xs text-slate-500">Adjust your search term or reset filters above.</p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const p = rule.permissions;
            return (
              <div
                key={rule.id}
                className="px-6 py-5 hover:bg-slate-900/60 transition-colors flex flex-col lg:flex-row lg:items-start justify-between gap-6"
              >
                {/* Column 1: Document / Module Type + Account Holder */}
                <div className="w-full lg:w-48 shrink-0 space-y-1.5">
                  <span className="text-sm font-bold text-white block leading-snug">
                    {rule.documentType}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[10px] text-amber-300 font-mono">
                    <User className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate" title={`Account Holder: ${rule.accountHolder || 'B Aditya Narayana (Super Admin L8)'}`}>
                      {rule.accountHolder || 'B Aditya Narayana (L8)'}
                    </span>
                  </div>
                </div>

                {/* Column 2: Role & "Only If Creator" */}
                <div className="w-full lg:w-44 shrink-0 space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">
                    {rule.role}
                  </span>
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rule.onlyIfCreator}
                      onChange={() => handleToggleOnlyCreator(rule.id)}
                      className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                    />
                    <span className="text-[11px]">Only If Creator</span>
                  </label>
                </div>

                {/* Column 3: Level Number Badge */}
                <div className="w-full lg:w-20 shrink-0 flex items-center lg:justify-center">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20">
                    L{rule.level}
                  </span>
                </div>

                {/* Columns 4, 5, 6: Granular Capability Checkboxes in 3 Columns */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Sub-column 1: Select, Create, Email, Export */}
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.select}
                        onChange={() => handleTogglePermission(rule.id, 'select')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Select</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.create}
                        onChange={() => handleTogglePermission(rule.id, 'create')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Create</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.email}
                        onChange={() => handleTogglePermission(rule.id, 'email')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Email</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.export}
                        onChange={() => handleTogglePermission(rule.id, 'export')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Export</span>
                    </label>
                  </div>

                  {/* Sub-column 2: Read, Delete, Report, Set User Permissions */}
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.read}
                        onChange={() => handleTogglePermission(rule.id, 'read')}
                        className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Read</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.delete}
                        onChange={() => handleTogglePermission(rule.id, 'delete')}
                        className="w-4 h-4 rounded border-slate-700 text-rose-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Delete</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.report}
                        onChange={() => handleTogglePermission(rule.id, 'report')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Report</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.setUserPermissions}
                        onChange={() => handleTogglePermission(rule.id, 'setUserPermissions')}
                        className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-amber-400">Set User Permissions</span>
                    </label>
                  </div>

                  {/* Sub-column 3: Write, Print, Import, Share */}
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.write}
                        onChange={() => handleTogglePermission(rule.id, 'write')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Write</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.print}
                        onChange={() => handleTogglePermission(rule.id, 'print')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Print</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.import}
                        onChange={() => handleTogglePermission(rule.id, 'import')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Import</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={p.share}
                        onChange={() => handleTogglePermission(rule.id, 'share')}
                        className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-900 cursor-pointer"
                      />
                      <span>Share</span>
                    </label>
                  </div>
                </div>

                {/* Right: Delete Action Button */}
                <div className="w-full lg:w-16 shrink-0 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
                    title="Delete Permission Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: + Add A New Rule Dialog (Dark Themed)                           */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-white">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Add A New Permission Rule</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Document / Entity Type
                </label>
                <input
                  type="text"
                  required
                  value={newRuleForm.documentType}
                  onChange={(e) =>
                    setNewRuleForm({ ...newRuleForm, documentType: e.target.value })
                  }
                  placeholder="e.g. Flight Dispatch Log, Quotation, Customer Care..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Target Role</label>
                  <select
                    value={newRuleForm.role}
                    onChange={(e) =>
                      setNewRuleForm({ ...newRuleForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Community User">Community User</option>
                    <option value="Standard Aviator">Standard Aviator</option>
                    <option value="Corporate Business">Corporate Business</option>
                    <option value="Operations Lead">Operations Lead</option>
                    <option value="Regional Manager (L5+)">Regional Manager (L5+)</option>
                    <option value="Executive Chairman (L8)">Executive Chairman (L8)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Clearance Level</label>
                  <select
                    value={newRuleForm.level}
                    onChange={(e) =>
                      setNewRuleForm({ ...newRuleForm, level: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account Holder Name Field (Point 5) */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Responsible Admin / Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={newRuleForm.accountHolder}
                  onChange={(e) =>
                    setNewRuleForm({ ...newRuleForm, accountHolder: e.target.value })
                  }
                  placeholder="e.g. B Aditya Narayana (Chairman & MD) or Ops Directorate..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={newRuleForm.onlyIfCreator}
                    onChange={(e) =>
                      setNewRuleForm({ ...newRuleForm, onlyIfCreator: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-950 cursor-pointer"
                  />
                  <span>Only If Creator (Restrict to author/owner)</span>
                </label>
              </div>

              {/* Initial Permissions Checklist */}
              <div className="pt-2 border-t border-slate-800">
                <label className="font-semibold text-slate-300 block mb-2">Granted Capabilities</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(newRuleForm.permissions).map((permKey) => (
                    <label key={permKey} className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white capitalize">
                      <input
                        type="checkbox"
                        checked={newRuleForm.permissions[permKey as keyof PermissionRuleItem['permissions']]}
                        onChange={(e) =>
                          setNewRuleForm({
                            ...newRuleForm,
                            permissions: {
                              ...newRuleForm.permissions,
                              [permKey]: e.target.checked,
                            },
                          })
                        }
                        className="w-3.5 h-3.5 rounded border-slate-700 text-blue-600 bg-slate-950"
                      />
                      <span className="text-[11px]">{permKey.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Save New Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

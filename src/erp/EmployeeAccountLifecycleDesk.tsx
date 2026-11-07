import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Plus,
  Mail,
  Building2,
  Briefcase,
  Layers,
  Sparkles,
  Key,
  Clock,
  ChevronDown,
  X,
  Filter,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { AdminUser, RegularUser, AdminLevel, AdminDepartment } from '../types';

interface EmployeeAccountLifecycleDeskProps {
  activeAdminUser?: AdminUser | null;
  currentUser?: RegularUser | null;
  onRefreshAll?: () => void;
  onRefreshData?: () => void;
}

export const EmployeeAccountLifecycleDesk: React.FC<EmployeeAccountLifecycleDeskProps> = ({
  activeAdminUser,
  currentUser,
  onRefreshAll,
  onRefreshData,
}) => {
  // Access Restriction: Strictly Level 6 to Level 8 and HR team only
  const isAuthorized = Boolean(
    (activeAdminUser?.level !== undefined && activeAdminUser.level >= 6) ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.department === 'HR' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com'
  );

  const isL8 = Boolean(
    activeAdminUser?.level === 8 ||
    activeAdminUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    activeAdminUser?.email?.toLowerCase() === 'aditya@yarifly.com' ||
    currentUser?.email?.toLowerCase() === 'aditya@yarifly.com'
  );

  const [adminList, setAdminList] = useState<AdminUser[]>(() => db.getAdminUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED' | 'SUSPENDED' | 'ARCHIVED'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  // Modal State for Action (Disable / Suspend / Delete with Reason)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<'DISABLED' | 'SUSPENDED' | 'ARCHIVED'>('DISABLED');
  const [actionReason, setActionReason] = useState('');

  // Add Employee Account Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState<AdminDepartment>('Operations');
  const [newEmpLevel, setNewEmpLevel] = useState<AdminLevel>(3);
  const [newEmpRole, setNewEmpRole] = useState<'ADMIN' | 'MANAGER' | 'SUPER_ADMIN'>('ADMIN');
  const [newEmpPassword, setNewEmpPassword] = useState('Truvaer@2026');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const reloadData = () => {
    setAdminList([...db.getAdminUsers()]);
    if (onRefreshAll) onRefreshAll();
    if (onRefreshData) onRefreshData();
  };

  const actorName = activeAdminUser?.name || currentUser?.first_name || 'HR Oversight Officer';
  const actorRole = activeAdminUser?.level_title || activeAdminUser?.role || 'L6+ Lead';

  // Quick Action: Enable / Recover Account
  const handleRecover = (admin: AdminUser) => {
    const res = db.recoverEmployeeAccount(admin.admin_id, actorName, actorRole);
    if (res.success) {
      reloadData();
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  // Open Modal for Disable / Suspend / Archive
  const handleOpenActionModal = (admin: AdminUser, type: 'DISABLED' | 'SUSPENDED' | 'ARCHIVED') => {
    if (admin.admin_id === 'admin_super_01' || admin.email.toLowerCase() === 'aditya@yarifly.com') {
      alert('Security Policy: Sovereign Root Administrator cannot be disabled, suspended, or archived.');
      return;
    }
    setActionTarget(admin);
    setActionType(type);
    setActionReason(
      type === 'DISABLED'
        ? 'Employee has resigned / departed from organization - Immediate corporate data safeguard cutoff applied'
        : type === 'SUSPENDED'
        ? 'Account access frozen pending operational handover and internal compliance review'
        : 'Employee record archived for statutory retention'
    );
    setActionModalOpen(true);
  };

  // Confirm Action
  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTarget) return;

    const res = db.setEmployeeAccountLifecycleStatus(
      actionTarget.admin_id,
      actionType,
      actionReason,
      actorName,
      actorRole
    );

    if (res.success) {
      reloadData();
      setActionModalOpen(false);
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  // Handle Add Employee Account
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmpEmail.trim().toLowerCase();

    // Domain validation check
    if (!cleanEmail.endsWith('@yarifly.com') && !cleanEmail.endsWith('@truvaer.com')) {
      alert('Security Exception: Corporate policy mandates that all administrative and employee accounts must end with "@yarifly.com" or "@truvaer.com" only.');
      return;
    }

    if (newEmpRole === 'SUPER_ADMIN' || newEmpLevel === 8) {
      if (!isL8) {
        alert('Permission Denied: Promotion or creation of Super Admin / Level 8 accounts requires direct authorization from an active Level 8 Sovereign User.');
        return;
      }
    }

    const res = db.addAdminUser(
      {
        name: newEmpName.trim(),
        email: cleanEmail,
        department: newEmpDept,
        level: newEmpLevel,
        level_title: `L${newEmpLevel} ${newEmpDept} Officer`,
        role: newEmpRole,
        password: newEmpPassword,
      },
      isL8
    );

    if (res.success) {
      reloadData();
      setShowAddModal(false);
      setNewEmpName('');
      setNewEmpEmail('');
      showToast(res.message);
    } else {
      alert(res.message);
    }
  };

  // Filtered List
  const filteredAdmins = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return adminList.filter((a) => {
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.department && a.department.toLowerCase().includes(q)) ||
        (a.level_title && a.level_title.toLowerCase().includes(q));

      const effectiveStatus = a.status || 'ACTIVE';
      const matchesStatus = statusFilter === 'ALL' || effectiveStatus === statusFilter;
      const matchesDept = deptFilter === 'ALL' || a.department === deptFilter;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [adminList, searchQuery, statusFilter, deptFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = adminList.length;
    const active = adminList.filter((a) => (a.status || 'ACTIVE') === 'ACTIVE').length;
    const disabled = adminList.filter((a) => a.status === 'DISABLED').length;
    const suspended = adminList.filter((a) => a.status === 'SUSPENDED').length;
    const corporateDomainValid = adminList.filter(
      (a) => a.email.toLowerCase().endsWith('@yarifly.com') || a.email.toLowerCase().endsWith('@truvaer.com')
    ).length;

    return { total, active, disabled, suspended, corporateDomainValid };
  }, [adminList]);

  // If user is not Level 6-8 or HR, render access denied shield
  if (!isAuthorized) {
    return (
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">Confidential Desk: Clearance Required</h3>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Level 6 to Level 8 &amp; HR Department Only
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
          The <strong>Employee Account Access &amp; Safeguard Lifecycle Desk</strong> manages proprietary organization data, employee separation protocols, and emergency account cutoffs. Access is strictly restricted to Level 6 to Level 8 executive leadership and the Human Resources compliance team.
        </p>
        <div className="text-[11px] font-mono text-slate-400">
          Your current level: <span className="text-amber-400 font-bold">{activeAdminUser?.level_title || `Level ${activeAdminUser?.level || 1}`}</span> • Dept: <span className="text-white">{activeAdminUser?.department || 'Operations'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">Employee Account Access &amp; Safeguard Lifecycle</h2>
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                  L6-L8 &amp; HR Team Desk
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Organizational data safeguard protocol: Instant session cutoff, account disablement, audit suspension, and 1-click recovery for departing staff.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all self-start lg:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Employee / Admin Account</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Staff</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-[10px] text-slate-500">Internal company personnel</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active &amp; Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.active}</div>
          <div className="text-[10px] text-slate-500">Live system credentials</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Data Safeguarded</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.disabled}</div>
          <div className="text-[10px] text-slate-500">Disabled on employee exit</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Audit Suspensions</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400">{stats.suspended}</div>
          <div className="text-[10px] text-slate-500">Pending review / frozen</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Corporate Domain</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">100% Valid</div>
          <div className="text-[10px] text-slate-500">@yarifly.com / @truvaer.com</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden space-y-0">
        {/* Toolbar: Search & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee by name, email, role, or title..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="ALL">All Statuses ({adminList.length})</option>
              <option value="ACTIVE">Active ({stats.active})</option>
              <option value="DISABLED">Disabled / Resigned ({stats.disabled})</option>
              <option value="SUSPENDED">Suspended ({stats.suspended})</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Operations">Operations</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Engineering & Safety">Engineering &amp; Safety</option>
              <option value="Commercial">Commercial</option>
              <option value="Legal & Compliance">Legal &amp; Compliance</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <th className="py-3 px-4">Employee &amp; Rank</th>
                <th className="py-3 px-4">Department &amp; Level</th>
                <th className="py-3 px-4">Mandatory Corporate Domain</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4">Data Safeguard Handover</th>
                <th className="py-3 px-4 text-right">Quick Access Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs italic">
                    No employee accounts matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const status = admin.status || 'ACTIVE';
                  const isRootAdmin = admin.email.toLowerCase() === 'aditya@yarifly.com';
                  const isCorporateDomain =
                    admin.email.toLowerCase().endsWith('@yarifly.com') ||
                    admin.email.toLowerCase().endsWith('@truvaer.com');

                  return (
                    <tr key={admin.admin_id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Employee Name & Rank */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : status === 'DISABLED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {admin.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center space-x-1.5">
                              <span>{admin.name}</span>
                              {isRootAdmin && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black">
                                  SOVEREIGN ROOT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {admin.level_title || `Level ${admin.level || 1} Specialist`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Level */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-200">{admin.department || 'Operations'}</span>
                          <div className="text-[10px] font-mono text-amber-400 font-bold">
                            Level {admin.level ?? 1} &bull; {admin.role}
                          </div>
                        </div>
                      </td>

                      {/* Corporate Domain */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-mono text-slate-300 text-xs block">{admin.email}</span>
                          {isCorporateDomain ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Corporate Domain Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Non-Authorized Domain</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Lifecycle Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {status === 'ACTIVE' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Active Employee</span>
                            </span>
                          )}
                          {status === 'DISABLED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center space-x-1.5">
                              <UserX className="w-3 h-3 text-rose-400" />
                              <span>Disabled &bull; Resigned</span>
                            </span>
                          )}
                          {status === 'SUSPENDED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center space-x-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Suspended &bull; Audit</span>
                            </span>
                          )}
                          {status === 'ARCHIVED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 inline-flex items-center space-x-1.5">
                              <span>Archived Record</span>
                            </span>
                          )}

                          {admin.status_reason && (
                            <div className="text-[10px] text-slate-400 italic line-clamp-1 max-w-xs">
                              {admin.status_reason}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Data Safeguard Handover */}
                      <td className="py-3.5 px-4">
                        {status === 'DISABLED' ? (
                          <div className="space-y-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
                            <div className="font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Data Lockdown Enacted</span>
                            </div>
                            <div className="text-slate-400">Sessions cut off &bull; Handover logged</div>
                          </div>
                        ) : status === 'SUSPENDED' ? (
                          <div className="space-y-0.5 text-[10px] font-mono text-amber-400 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                            <div className="font-bold flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Audit Freeze Pending</span>
                            </div>
                            <div className="text-slate-400">Credentials restricted</div>
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-slate-500">
                            Active Operational Access
                          </div>
                        )}
                      </td>

                      {/* Quick Access Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {isRootAdmin ? (
                          <span className="text-[10px] font-mono text-slate-500 italic">Protected Root</span>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5 flex-wrap">
                            {/* Enable / Activate Button */}
                            {status !== 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => handleRecover(admin)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                                title="1-Click Recovery: Re-enable and restore account access"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Recover Account</span>
                              </button>
                            ) : (
                              <>
                                {/* Quick Access: Disable (Departing Employee) */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenActionModal(admin, 'DISABLED')}
                                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Disable Account to Safeguard Company Data (Employee Resignation / Exit)"
                                >
                                  <Lock className="w-3 h-3 text-rose-400" />
                                  <span>Disable (Exit)</span>
                                </button>

                                {/* Quick Access: Suspend */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenActionModal(admin, 'SUSPENDED')}
                                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                                  title="Suspend account access for audit"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  <span>Suspend</span>
                                </button>
                              </>
                            )}

                            {/* Delete / Archive */}
                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(admin, 'ARCHIVED')}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Archive Employee Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CONFIRM DISABLE / SUSPEND / ARCHIVE WITH DATA SAFEGUARD REASON */}
      {actionModalOpen && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {actionType === 'DISABLED'
                      ? 'Safeguard Data: Disable Employee Account'
                      : actionType === 'SUSPENDED'
                      ? 'Suspend Employee Credentials'
                      : 'Archive Employee Record'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Target: {actionTarget.name} ({actionTarget.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-200/90 space-y-2 leading-relaxed">
              <div className="font-bold text-rose-300 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Enterprise Data Safeguard Checklist</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Immediate session kill: Active browser tokens and sessions are invalidated instantly.</li>
                <li>Access to CRM pipelines, commercial leads, and client quotations revoked.</li>
                <li>Internal communication and administrative desk privileges locked.</li>
                <li><strong>Recovery Guarantee:</strong> This account can be restored at any time via 1-click Recovery.</li>
              </ul>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Reason for Account {actionType === 'DISABLED' ? 'Disablement' : actionType} <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Employee tendered resignation; hand-off completed; access terminated as per corporate data policy"
                  className="w-full p-3 bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none resize-none transition-colors"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-lg cursor-pointer flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Execute {actionType === 'DISABLED' ? 'Disable & Safeguard' : actionType}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW EMPLOYEE WITH CORPORATE DOMAIN ENFORCEMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add New Staff / Admin Account</h3>
                  <p className="text-[11px] text-slate-400">
                    Mandatory corporate domain ending with @yarifly.com or @truvaer.com
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Full Legal Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="e.g. Captain Ananya Verma"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-600 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Corporate Domain Email <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">
                    @yarifly.com or @truvaer.com only
                  </span>
                </div>
                <input
                  type="email"
                  value={newEmpEmail}
                  onChange={(e) => setNewEmpEmail(e.target.value)}
                  placeholder="ananya.verma@yarifly.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs font-mono text-white placeholder-slate-600 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Department</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Engineering & Safety">Engineering &amp; Safety</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Legal & Compliance">Legal &amp; Compliance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Clearance Level</label>
                  <select
                    value={newEmpLevel}
                    onChange={(e) => setNewEmpLevel(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none"
                  >
                    <option value={1}>L1 - Specialist</option>
                    <option value={2}>L2 - Senior Officer</option>
                    <option value={3}>L3 - Lead Specialist</option>
                    <option value={4}>L4 - Department Lead</option>
                    <option value={5}>L5 - Manager</option>
                    <option value={6}>L6 - Senior Manager</option>
                    <option value={7}>L7 - Directorate Head</option>
                    {isL8 && <option value={8}>L8 - Sovereign Super Admin</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Role Classification</label>
                  <select
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    {isL8 && <option value="SUPER_ADMIN">SUPER_ADMIN (L8 Permitted)</option>}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Initial Password</label>
                  <input
                    type="text"
                    value={newEmpPassword}
                    onChange={(e) => setNewEmpPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg cursor-pointer"
                >
                  Create &amp; Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

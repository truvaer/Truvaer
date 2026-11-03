import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Flag,
  RotateCcw,
  Check,
  X,
  Zap,
  Activity,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  AdminProject,
  AdminTask,
  PMSProjectCategory,
  PMSPriority,
  PMSProjectStatus,
  PMSTaskStatus,
  AdminUser,
} from '../types';

interface AdminPMSDeskProps {
  activeAdminUser?: AdminUser | null;
  onRefreshData?: () => void;
}

export const AdminPMSDesk: React.FC<AdminPMSDeskProps> = ({
  activeAdminUser,
  onRefreshData,
}) => {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  // Task Filter State
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'URGENT_ESCALATIONS' | 'ACTIVE_ONLY' | 'COMPLETED'>('ALL');
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>('ALL');
  const [taskBarSelectedId, setTaskBarSelectedId] = useState<string>('');

  // Modals
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<string>('');

  // Project Creation Form
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjCategory, setNewProjCategory] = useState<PMSProjectCategory>('COMPLIANCE');
  const [newProjPriority, setNewProjPriority] = useState<PMSPriority>('HIGH');
  const [newProjLeadId, setNewProjLeadId] = useState('');
  const [newProjTargetDate, setNewProjTargetDate] = useState('');

  // Task Creation Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignedId, setNewTaskAssignedId] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PMSPriority | 'URGENT_ESCALATION'>('HIGH');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskIsEscalated, setNewTaskIsEscalated] = useState(false);

  // Feedback Notification
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    setProjects(db.getAdminProjects());
    setTasks(db.getAdminTasks());
    const admins = db.getAdminUsers();
    setAdminUsers(admins);
    if (!newProjLeadId && admins.length > 0) {
      setNewProjLeadId(admins[0].admin_id);
    }
    if (!newTaskAssignedId && admins.length > 0) {
      setNewTaskAssignedId(admins[0].admin_id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = db.getPMSMetrics();

  // One-click status progression: TODO -> IN_PROGRESS -> IN_REVIEW -> COMPLETED / CLOSED
  const handleProgressStatus = (taskId: string, currentStatus: PMSTaskStatus) => {
    let nextStatus: PMSTaskStatus = 'IN_PROGRESS';
    if (currentStatus === 'TODO') nextStatus = 'IN_PROGRESS';
    else if (currentStatus === 'IN_PROGRESS') nextStatus = 'IN_REVIEW';
    else if (currentStatus === 'IN_REVIEW') nextStatus = 'COMPLETED';
    else if (currentStatus === 'COMPLETED') nextStatus = 'CLOSED';
    else nextStatus = 'TODO'; // restart loop if closed

    db.updateAdminTaskStatus(taskId, nextStatus);
    setFeedback(`Task status updated to ${nextStatus}`);
    loadData();
    if (onRefreshData) onRefreshData();
    setTimeout(() => setFeedback(null), 3000);
  };

  // Quick Dropdown Status Update
  const handleQuickStatusChange = (taskId: string, status: PMSTaskStatus) => {
    db.updateAdminTaskStatus(taskId, status);
    setFeedback(`Task status changed to ${status}`);
    loadData();
    if (onRefreshData) onRefreshData();
    setTimeout(() => setFeedback(null), 3000);
  };

  // Task Reassignment strictly to next level from present level
  const handleReassignTask = (taskId: string, targetAdminId: string) => {
    const res = db.reassignAdminTaskToNextLevel(taskId, targetAdminId);
    setFeedback(res.message);
    if (res.success) {
      loadData();
      if (onRefreshData) onRefreshData();
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Trigger SLA Escalation Workflow
  const handleTriggerEscalation = (taskId: string) => {
    const reason = prompt('Enter SLA escalation directive & breach note:') || 'Urgent Executive SLA Escalation Triggered';
    db.triggerSlaEscalation(taskId, reason);
    setFeedback('SLA Escalation workflow activated! Notification dispatched to executive committee.');
    loadData();
    if (onRefreshData) onRefreshData();
    setTimeout(() => setFeedback(null), 3500);
  };

  // Resolve SLA Escalation
  const handleResolveEscalation = (taskId: string) => {
    db.resolveSlaEscalation(taskId);
    setFeedback('SLA Escalation resolved and closed on-time!');
    loadData();
    if (onRefreshData) onRefreshData();
    setTimeout(() => setFeedback(null), 3500);
  };

  // Submit Project Form
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;

    const leadAdmin = adminUsers.find((a) => a.admin_id === newProjLeadId) || adminUsers[0];

    db.createAdminProject({
      title: newProjTitle.trim(),
      description: newProjDesc.trim(),
      category: newProjCategory,
      priority: newProjPriority,
      lead_admin_id: leadAdmin?.admin_id || 'admin_primary',
      lead_admin_name: leadAdmin?.name || 'Primary Admin',
      lead_admin_role: leadAdmin?.level_title || leadAdmin?.role || 'Admin Lead',
      target_date: newProjTargetDate || new Date(Date.now() + 3600000 * 24 * 30).toISOString().split('T')[0],
      status: 'ACTIVE',
      escalation_level: 'NONE',
    });

    setFeedback(`Project "${newProjTitle}" created successfully!`);
    setShowCreateProjectModal(false);
    setNewProjTitle('');
    setNewProjDesc('');
    loadData();
    if (onRefreshData) onRefreshData();
    setTimeout(() => setFeedback(null), 3500);
  };

  // Submit Task Form
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetProjId = selectedProjectForTask || (projects[0]?.id || 'proj_01');
    const proj = projects.find((p) => p.id === targetProjId);
    const assignedAdmin = adminUsers.find((a) => a.admin_id === newTaskAssignedId) || adminUsers[0];

    db.createAdminTask({
      project_id: targetProjId,
      project_title: proj?.title || 'Platform Project',
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      assigned_admin_id: assignedAdmin?.admin_id || 'admin_primary',
      assigned_admin_name: assignedAdmin?.name || 'Operations Lead',
      assigned_admin_role: assignedAdmin?.level_title || assignedAdmin?.role,
      status: 'TODO',
      priority: newTaskPriority,
      due_date: newTaskDueDate || new Date(Date.now() + 3600000 * 48).toISOString(),
      sla_escalated: newTaskIsEscalated,
      escalation_notes: newTaskIsEscalated ? 'Manual executive escalation flagged on creation' : undefined,
    });

    setFeedback(`Task created and assigned to ${assignedAdmin?.name}`);
    setShowCreateTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskIsEscalated(false);
    loadData();
    if (onRefreshData) onRefreshData();
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedAdminFilter !== 'ALL' && t.assigned_admin_id !== selectedAdminFilter) {
      return false;
    }
    if (taskFilter === 'URGENT_ESCALATIONS' && !t.sla_escalated && t.priority !== 'URGENT_ESCALATION') {
      return false;
    }
    if (taskFilter === 'ACTIVE_ONLY' && (t.status === 'COMPLETED' || t.status === 'CLOSED')) {
      return false;
    }
    if (taskFilter === 'COMPLETED' && t.status !== 'COMPLETED' && t.status !== 'CLOSED') {
      return false;
    }
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase().trim();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.assigned_admin_name.toLowerCase().includes(q) ||
        (t.project_title && t.project_title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center space-x-2 shadow-lg animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Desk Main Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Admin Project Management System (PMS)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                ERP PMS Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Executive Metrics, SLA Escalation Workflows, and One-Click Assignment Pipelines
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => {
              setSelectedProjectForTask(projects[0]?.id || '');
              setShowCreateTaskModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Add Task</span>
          </button>
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE METRICS BAR                                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Total Projects</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.totalProjects}</div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Across 6 Operational Sectors</span>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Active Tasks</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{metrics.activeTasks}</div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>In-flight pipelines</span>
          </div>
        </div>

        {/* Critical Escalations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>Critical Escalations</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono flex items-center space-x-2">
            <span>{metrics.criticalEscalations}</span>
            {metrics.criticalEscalations > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 animate-pulse">
                SLA Alert
              </span>
            )}
          </div>
          <div className="text-[11px] text-rose-300/80">Requires prompt executive sign-off</div>
        </div>

        {/* On-Time Resolution Rates */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono uppercase tracking-wider">
            <span>On-Time Resolution</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.onTimeResolutionRate}%</div>
          <div className="text-[11px] text-emerald-300/80">SLA target compliance achieved</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PERSONAL ADMIN TASK BAR & ASSIGNMENTS                                   */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Personal Admin Task Bar</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {filteredTasks.length} Assigned
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                One-click status progressions (TODO → IN_PROGRESS → IN_REVIEW → COMPLETED / CLOSED)
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setTaskFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  taskFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTaskFilter('URGENT_ESCALATIONS')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                  taskFilter === 'URGENT_ESCALATIONS'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Urgent Escalations</span>
              </button>
              <button
                onClick={() => setTaskFilter('ACTIVE_ONLY')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  taskFilter === 'ACTIVE_ONLY' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setTaskFilter('COMPLETED')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  taskFilter === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Admin Persona Selector Filter */}
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-slate-400 mr-1.5 font-mono text-[10px] uppercase">Assignee:</span>
              <select
                value={selectedAdminFilter}
                onChange={(e) => setSelectedAdminFilter(e.target.value)}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Administrators</option>
                {adminUsers.map((a) => (
                  <option key={a.admin_id} value={a.admin_id} className="bg-slate-900 text-white">
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Task Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            placeholder="Search assignments by company name, task, project title, or directives..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* ========================================================================= */}
        {/* TASK BAR (To Reassign & Quick Access Status Update)                        */}
        {/* ========================================================================= */}
        <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl shadow-lg space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <span>Task Bar (Quick Access &amp; Reassign Engine)</span>
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Policy: Assignment strictly restricted to Next Level (L+1) from present level
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-center">
            {/* Dropdown 1: Select Active Task for Quick Access */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                1. Select Task for Quick Access:
              </label>
              <select
                value={taskBarSelectedId}
                onChange={(e) => setTaskBarSelectedId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white outline-none cursor-pointer truncate"
              >
                <option value="">-- Choose a Task from Queue --</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    [{t.status}] {t.title} ({t.assigned_admin_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Update Status Easily */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                2. Quick Status Update:
              </label>
              {(() => {
                const targetTask = tasks.find((t) => t.id === taskBarSelectedId);
                return (
                  <div className="flex items-center space-x-2">
                    <select
                      disabled={!targetTask}
                      value={targetTask?.status || 'TODO'}
                      onChange={(e) => {
                        if (targetTask) {
                          handleQuickStatusChange(targetTask.id, e.target.value as PMSTaskStatus);
                        }
                      }}
                      className="w-full bg-slate-950 border border-sky-500/40 rounded-xl px-2.5 py-2 text-xs font-bold text-sky-200 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="TODO" className="bg-slate-900 text-slate-200">TODO</option>
                      <option value="IN_PROGRESS" className="bg-slate-900 text-sky-300">IN_PROGRESS</option>
                      <option value="IN_REVIEW" className="bg-slate-900 text-amber-300">IN_REVIEW</option>
                      <option value="COMPLETED" className="bg-slate-900 text-emerald-300">COMPLETED</option>
                      <option value="CLOSED" className="bg-slate-900 text-slate-400">CLOSED</option>
                    </select>
                  </div>
                );
              })()}
            </div>

            {/* Dropdown 3: Reassign Task to Next Level Only */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-amber-400 uppercase font-semibold block">
                3. Reassign to Next Level:
              </label>
              {(() => {
                const targetTask = tasks.find((t) => t.id === taskBarSelectedId);
                if (!targetTask) {
                  return (
                    <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-500 italic">
                      Select a task first to view next-level officers
                    </div>
                  );
                }

                const currentAssignee = adminUsers.find((a) => a.admin_id === targetTask.assigned_admin_id);
                const curLvl = currentAssignee?.level ?? 2;
                const nextLvl = curLvl < 8 ? curLvl + 1 : 8;
                const nextLevelOfficers = adminUsers.filter(
                  (a) => a.level === nextLvl && a.admin_id !== targetTask.assigned_admin_id
                );
                const eligible =
                  nextLevelOfficers.length > 0
                    ? nextLevelOfficers
                    : adminUsers.filter((a) => (a.level || 0) > curLvl && a.admin_id !== targetTask.assigned_admin_id);

                return (
                  <div className="flex items-center space-x-1.5">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleReassignTask(targetTask.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-2.5 py-2 text-xs font-semibold text-amber-200 outline-none cursor-pointer truncate"
                    >
                      <option value="">
                        {eligible.length > 0 ? `Reassign to L${nextLvl} (Next Level)...` : `At Max Level L${curLvl}`}
                      </option>
                      {eligible.map((admin) => (
                        <option key={admin.admin_id} value={admin.admin_id} className="bg-slate-900 text-white">
                          {admin.name} (L{admin.level} - {admin.level_title || admin.role})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Task List Cards */}
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            No assignments match the selected filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((t) => {
              const isUrgent = t.sla_escalated || t.priority === 'URGENT_ESCALATION';
              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUrgent
                      ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-950/30'
                      : t.status === 'COMPLETED' || t.status === 'CLOSED'
                      ? 'bg-slate-950/50 border-slate-800/80 opacity-80'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {isUrgent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/30 text-rose-200 border border-rose-500/50 flex items-center space-x-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>URGENT SLA ESCALATION</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                          {t.project_title || 'Platform Project'}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            t.status === 'COMPLETED' || t.status === 'CLOSED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-sky-500/20 text-sky-300'
                              : t.status === 'IN_REVIEW'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Status: {t.status}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white">{t.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{t.description}</p>

                      {t.escalation_notes && (
                        <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-xl border border-rose-500/30 font-mono">
                          Direct SLA Directive: {t.escalation_notes}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Assignee: <strong className="text-slate-200">{t.assigned_admin_name}</strong></span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Due: {new Date(t.due_date).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Progression Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                      {/* Dropdown to select quick access and update status easily */}
                      <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-inner">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Status:</span>
                        <select
                          value={t.status}
                          onChange={(e) => handleQuickStatusChange(t.id, e.target.value as PMSTaskStatus)}
                          className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                          title="Quick access dropdown to update status"
                        >
                          <option value="TODO" className="bg-slate-900 text-slate-200">TODO</option>
                          <option value="IN_PROGRESS" className="bg-slate-900 text-sky-300">IN_PROGRESS</option>
                          <option value="IN_REVIEW" className="bg-slate-900 text-amber-300">IN_REVIEW</option>
                          <option value="COMPLETED" className="bg-slate-900 text-emerald-300">COMPLETED</option>
                          <option value="CLOSED" className="bg-slate-900 text-slate-400">CLOSED</option>
                        </select>
                      </div>

                      {/* Dropdown to Reassign Task strictly to the next level from present level */}
                      {(() => {
                        const currentAssignee = adminUsers.find((a) => a.admin_id === t.assigned_admin_id);
                        const curLvl = currentAssignee?.level ?? 2;
                        const nextLvl = curLvl < 8 ? curLvl + 1 : 8;
                        const nextLevelOfficers = adminUsers.filter(
                          (a) => a.level === nextLvl && a.admin_id !== t.assigned_admin_id
                        );
                        const eligibleOfficers =
                          nextLevelOfficers.length > 0
                            ? nextLevelOfficers
                            : adminUsers.filter((a) => (a.level || 0) > curLvl && a.admin_id !== t.assigned_admin_id);

                        return (
                          <div className="flex items-center space-x-1.5 bg-slate-950 border border-amber-500/30 rounded-xl px-2.5 py-1.5 shadow-inner">
                            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase whitespace-nowrap">
                              Reassign (L{nextLvl}):
                            </span>
                            {eligibleOfficers.length > 0 ? (
                              <select
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleReassignTask(t.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer max-w-[150px] truncate"
                                title={`Reassign to Next Level officer only (Present: L${curLvl} -> Next: L${nextLvl})`}
                              >
                                <option value="" className="bg-slate-900 text-slate-400">
                                  Select L{nextLvl} Officer...
                                </option>
                                {eligibleOfficers.map((admin) => (
                                  <option key={admin.admin_id} value={admin.admin_id} className="bg-slate-900 text-white">
                                    {admin.name} (L{admin.level} - {admin.level_title || admin.role})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400 italic">
                                {curLvl >= 8 ? 'Executive Peak (L8)' : 'No Next-Level Officer'}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      {/* One-Click Status Progression */}
                      <button
                        onClick={() => handleProgressStatus(t.id, t.status)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm ${
                          t.status === 'TODO'
                            ? 'bg-sky-600 hover:bg-sky-500 text-white'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : t.status === 'IN_REVIEW'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Click to progress task status to next phase"
                      >
                        <span>
                          {t.status === 'TODO' && 'Start → IN_PROGRESS'}
                          {t.status === 'IN_PROGRESS' && 'Submit → IN_REVIEW'}
                          {t.status === 'IN_REVIEW' && 'Approve → COMPLETED'}
                          {t.status === 'COMPLETED' && 'Archive → CLOSED'}
                          {t.status === 'CLOSED' && 'Reopen → TODO'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* SLA Escalation Button */}
                      {!t.sla_escalated ? (
                        <button
                          onClick={() => handleTriggerEscalation(t.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-semibold border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer flex items-center space-x-1"
                          title="Trigger critical SLA escalation workflow"
                        >
                          <Zap className="w-3.5 h-3.5 text-rose-400" />
                          <span>Escalate SLA</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResolveEscalation(t.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                          title="Resolve and close SLA escalation on-time"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Resolve SLA</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. PROJECT MANAGEMENT & ESCALATION ENGINE                                  */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Project Management &amp; Escalation Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                  {projects.length} Master Initiatives
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Executive targets, completion milestones, and automated SLA enforcement
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center space-x-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Executive Project</span>
          </button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => {
            const projTasks = tasks.filter((t) => t.project_id === p.id);
            const completedCount = projTasks.filter((t) => t.status === 'COMPLETED' || t.status === 'CLOSED').length;
            const progressPercent = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;
            const hasBreach = p.escalation_level === 'CRITICAL_SLA_BREACH';

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  hasBreach
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                        {p.category}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          p.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : p.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Priority: {p.priority}
                      </span>
                      {hasBreach && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 font-bold animate-pulse">
                          CRITICAL SLA BREACH
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{p.title}</h4>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProjectForTask(p.id);
                      setShowCreateTaskModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
                    title="Add task directly inside this project"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{p.description}</p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Milestone Progress</span>
                    <span className="font-bold text-white">
                      {completedCount}/{projTasks.length} tasks ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        progressPercent === 100
                          ? 'bg-emerald-500'
                          : hasBreach
                          ? 'bg-rose-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Lead Admin & Target Date */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lead: <strong className="text-white">{p.lead_admin_name}</strong></span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Target: {new Date(p.target_date).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW PROJECT                                                 */}
      {/* ========================================================================= */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-bold text-white">Create New Executive Project</h4>
              </div>
              <button
                onClick={() => setShowCreateProjectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  placeholder="e.g. DGCA AOC International Operator Airworthiness Audit"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Executive Description</label>
                <textarea
                  rows={3}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Provide objective, regulatory compliance standards, and scope..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newProjCategory}
                    onChange={(e) => setNewProjCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="COMPLIANCE">COMPLIANCE</option>
                    <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                    <option value="COMMERCIAL">COMMERCIAL</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="FINANCE">FINANCE</option>
                    <option value="OPERATIONS">OPERATIONS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newProjPriority}
                    onChange={(e) => setNewProjPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lead Administrator</label>
                  <select
                    value={newProjLeadId}
                    onChange={(e) => setNewProjLeadId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {adminUsers.map((a) => (
                      <option key={a.admin_id} value={a.admin_id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={newProjTargetDate}
                    onChange={(e) => setNewProjTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW TASK                                                    */}
      {/* ========================================================================= */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Plus className="w-5 h-5 text-sky-400" />
                <h4 className="text-base font-bold text-white">Add Assignment Task</h4>
              </div>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Parent Project *</label>
                <select
                  value={selectedProjectForTask}
                  onChange={(e) => setSelectedProjectForTask(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Audit uploaded TAN/PAN registration files"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Directives / Scope</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Specific actions required by assignee..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assign To Administrator</label>
                  <select
                    value={newTaskAssignedId}
                    onChange={(e) => setNewTaskAssignedId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {adminUsers.map((a) => (
                      <option key={a.admin_id} value={a.admin_id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT_ESCALATION">URGENT ESCALATION (SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Flag as Active SLA Escalation</span>
                <input
                  type="checkbox"
                  checked={newTaskIsEscalated}
                  onChange={(e) => setNewTaskIsEscalated(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

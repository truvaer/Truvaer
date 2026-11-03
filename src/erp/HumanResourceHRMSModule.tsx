import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Award,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Briefcase,
  Plane,
  Building2,
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Eye,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Layers,
  FileCheck,
  AlertCircle,
  Key,
  CreditCard,
  Send,
  Printer
} from 'lucide-react';
import { AdminUser, AdminDepartment } from '../types';

export interface EmployeeRecord {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: AdminDepartment | 'Human Resource' | 'Operations' | 'Finance' | 'Support' | 'Ground Handling' | 'Executive Office';
  designation: string;
  rank_level: number; // L0 to L8
  rank_title: string;
  base_hub: string; // BOM, DEL, DXB, LHR, SIN, BLR
  status: 'ACTIVE' | 'ON_DUTY' | 'ON_LEAVE' | 'PROBATION' | 'STANDBY';
  employment_type: 'Full-Time' | 'Contract' | 'Contract Specialist';
  joining_date: string;
  reporting_manager: string;
  // Aviation & Compliance Credentials
  credential_id?: string;
  qualification_type?: 'Certified Operations Lead' | 'Certified Growth Strategist' | 'Certified Financial Analyst' | 'Executive Lead';
  compliance_audit_validity?: string;
  security_clearance_bcas?: 'VALID' | 'RENEWAL_DUE' | 'PENDING';
  logged_project_hours?: number;
  last_28_days_duty_hours: number; // Monthly duty cycle tracking (Max 160 hrs limit)
  rest_period_hours: number; // Hours since last flight (Min 12 required)
  fatigue_risk: 'LOW' | 'MODERATE' | 'CRITICAL';
  // Compensation
  monthly_base_salary: number;
  incentive_hourly_rate: number;
  per_diem_allowance: number;
  last_payroll_status: 'DISBURSED' | 'PENDING_APPROVAL' | 'PROCESSING';
  last_payroll_month: string;
  // Leave balances
  leave_balance_pl: number;
  leave_balance_cl: number;
  leave_balance_rest: number;
  performance_score: number; // out of 100
}

export interface LeaveRequestItem {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  leave_type: 'Privileged Leave' | 'Casual / Sick' | 'Compensatory Rest' | 'Emergency';
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  cover_personnel: string;
  status: 'PENDING_MANAGER_L1' | 'PENDING_HR_L2' | 'APPROVED' | 'REJECTED';
  applied_at: string;
  stage1_approver?: string;
  stage2_approver?: string;
  remarks?: string;
}

const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'emp_01',
    employee_id: 'TRV-OPS-0101',
    name: 'Aditya Vikram Verma',
    email: 'aditya.verma@truvaer.com',
    phone: '+91 98200 44101',
    department: 'Operations',
    designation: 'Head of Operations & Platform Strategy',
    rank_level: 7,
    rank_title: 'L7 - Director of Operations',
    base_hub: 'BOM / DXB',
    status: 'ON_DUTY',
    employment_type: 'Full-Time',
    joining_date: '2021-03-15',
    reporting_manager: 'Executive Chairman',
    credential_id: 'OPS-MGT-94812',
    qualification_type: 'Certified Operations Lead',
    compliance_audit_validity: '2027-04-30',
    security_clearance_bcas: 'VALID',
    logged_project_hours: 8450,
    last_28_days_duty_hours: 62,
    rest_period_hours: 18,
    fatigue_risk: 'LOW',
    monthly_base_salary: 850000,
    incentive_hourly_rate: 8500,
    per_diem_allowance: 95000,
    last_payroll_status: 'DISBURSED',
    last_payroll_month: 'October 2026',
    leave_balance_pl: 18,
    leave_balance_cl: 6,
    leave_balance_rest: 4,
    performance_score: 98,
  },
  {
    id: 'emp_02',
    employee_id: 'TRV-MKT-0102',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@truvaer.com',
    phone: '+44 7700 900214',
    department: 'Operations',
    designation: 'Senior Operations & Marketing Specialist',
    rank_level: 5,
    rank_title: 'L5 - Operations & Marketing Lead',
    base_hub: 'LHR',
    status: 'ACTIVE',
    employment_type: 'Full-Time',
    joining_date: '2023-01-10',
    reporting_manager: 'Aditya Vikram Verma',
    credential_id: 'MKT-LD-3391',
    qualification_type: 'Certified Operations Lead',
    compliance_audit_validity: '2027-08-15',
    security_clearance_bcas: 'VALID',
    logged_project_hours: 3820,
    last_28_days_duty_hours: 74,
    rest_period_hours: 24,
    fatigue_risk: 'LOW',
    monthly_base_salary: 520000,
    incentive_hourly_rate: 5500,
    per_diem_allowance: 80000,
    last_payroll_status: 'DISBURSED',
    last_payroll_month: 'October 2026',
    leave_balance_pl: 14,
    leave_balance_cl: 4,
    leave_balance_rest: 2,
    performance_score: 94,
  },
  {
    id: 'emp_03',
    employee_id: 'TRV-ENG-0201',
    name: 'Rajesh Nambiar',
    email: 'rajesh.nambiar@truvaer.com',
    phone: '+91 98401 22849',
    department: 'Finance',
    designation: 'Senior Aviation Financial Controller',
    rank_level: 6,
    rank_title: 'L6 - Principal Financial Controller',
    base_hub: 'DEL',
    status: 'ACTIVE',
    employment_type: 'Full-Time',
    joining_date: '2020-07-01',
    reporting_manager: 'Director of Maintenance',
    credential_id: 'DGCA-AME-B11-4820',
    qualification_type: 'Certified Financial Analyst',
    compliance_audit_validity: '2028-01-20',
    security_clearance_bcas: 'VALID',
    logged_project_hours: 0,
    last_28_days_duty_hours: 40,
    rest_period_hours: 36,
    fatigue_risk: 'LOW',
    monthly_base_salary: 410000,
    incentive_hourly_rate: 0,
    per_diem_allowance: 30000,
    last_payroll_status: 'DISBURSED',
    last_payroll_month: 'October 2026',
    leave_balance_pl: 20,
    leave_balance_cl: 7,
    leave_balance_rest: 0,
    performance_score: 96,
  },
  {
    id: 'emp_04',
    employee_id: 'TRV-OPS-0301',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@truvaer.com',
    phone: '+91 98110 55431',
    department: 'Operations',
    designation: 'Commercial Operations & Logistics Specialist',
    rank_level: 4,
    rank_title: 'L4 - Senior Operations Specialist',
    base_hub: 'BOM',
    status: 'ON_DUTY',
    employment_type: 'Full-Time',
    joining_date: '2022-09-18',
    reporting_manager: 'VP Operations',
    credential_id: 'DGCA-FDM-1092',
    qualification_type: 'Certified Operations Lead',
    compliance_audit_validity: '2028-11-10',
    security_clearance_bcas: 'VALID',
    logged_project_hours: 0,
    last_28_days_duty_hours: 44,
    rest_period_hours: 16,
    fatigue_risk: 'LOW',
    monthly_base_salary: 280000,
    incentive_hourly_rate: 0,
    per_diem_allowance: 25000,
    last_payroll_status: 'DISBURSED',
    last_payroll_month: 'October 2026',
    leave_balance_pl: 12,
    leave_balance_cl: 5,
    leave_balance_rest: 0,
    performance_score: 92,
  },
  {
    id: 'emp_05',
    employee_id: 'TRV-SUP-0401',
    name: 'Natasha Romanova',
    email: 'natasha.r@truvaer.com',
    phone: '+971 50 892 1104',
    department: 'Support',
    designation: 'Senior Client Support & Customer Experience Lead',
    rank_level: 3,
    rank_title: 'L3 - Senior Client Experience Lead',
    base_hub: 'DXB',
    status: 'STANDBY',
    employment_type: 'Full-Time',
    joining_date: '2023-04-12',
    reporting_manager: 'In-Flight Services Manager',
    credential_id: 'GCAA-CC-88219',
    compliance_audit_validity: '2027-02-14',
    security_clearance_bcas: 'VALID',
    logged_project_hours: 1950,
    last_28_days_duty_hours: 58,
    rest_period_hours: 22,
    fatigue_risk: 'LOW',
    monthly_base_salary: 310000,
    incentive_hourly_rate: 3200,
    per_diem_allowance: 55000,
    last_payroll_status: 'DISBURSED',
    last_payroll_month: 'October 2026',
    leave_balance_pl: 16,
    leave_balance_cl: 6,
    leave_balance_rest: 3,
    performance_score: 95,
  },
  {
    id: 'emp_06',
    employee_id: 'TRV-FIN-0501',
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@truvaer.com',
    phone: '+91 99201 88301',
    department: 'Finance',
    designation: 'Senior Aviation Treasury & Fuel Hedging Manager',
    rank_level: 5,
    rank_title: 'L5 - Finance Manager',
    base_hub: 'BOM',
    status: 'ACTIVE',
    employment_type: 'Full-Time',
    joining_date: '2021-11-01',
    reporting_manager: 'Chief Financial Officer',
    qualification_type: 'Executive Lead',
    compliance_audit_validity: '2030-01-01',
    security_clearance_bcas: 'VALID',
    logged_project_hours: 0,
    last_28_days_duty_hours: 38,
    rest_period_hours: 48,
    fatigue_risk: 'LOW',
    monthly_base_salary: 460000,
    incentive_hourly_rate: 0,
    per_diem_allowance: 20000,
    last_payroll_status: 'DISBURSED',
    last_payroll_month: 'October 2026',
    leave_balance_pl: 15,
    leave_balance_cl: 5,
    leave_balance_rest: 0,
    performance_score: 97,
  },
  {
    id: 'emp_07',
    employee_id: 'TRV-SLS-0103',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@truvaer.com',
    phone: '+1 415 555 0192',
    department: 'Operations',
    designation: 'Global Sales & Charter Partner Director',
    rank_level: 6,
    rank_title: 'L6 - Principal Sales & BD Director',
    base_hub: 'SIN',
    status: 'ON_DUTY',
    employment_type: 'Full-Time',
    joining_date: '2022-05-10',
    reporting_manager: 'Aditya Vikram Verma',
    credential_id: 'SLS-DIR-771029',
    qualification_type: 'Certified Operations Lead',
    compliance_audit_validity: '2026-11-30',
    security_clearance_bcas: 'RENEWAL_DUE',
    logged_project_hours: 9200,
    last_28_days_duty_hours: 88,
    rest_period_hours: 14,
    fatigue_risk: 'MODERATE',
    monthly_base_salary: 780000,
    incentive_hourly_rate: 8000,
    per_diem_allowance: 90000,
    last_payroll_status: 'DISBURSED',
    last_payroll_month: 'October 2026',
    leave_balance_pl: 11,
    leave_balance_cl: 3,
    leave_balance_rest: 2,
    performance_score: 93,
  },
  {
    id: 'emp_08',
    employee_id: 'TRV-HRM-0601',
    name: 'Ananya Sen',
    email: 'ananya.sen@truvaer.com',
    phone: '+91 98302 77192',
    department: 'Human Resource',
    designation: 'Head of People & Aviation Talent Acquisition',
    rank_level: 6,
    rank_title: 'L6 - HR Director',
    base_hub: 'DEL',
    status: 'ACTIVE',
    employment_type: 'Full-Time',
    joining_date: '2021-08-15',
    reporting_manager: 'Executive Chairman',
    qualification_type: 'Executive Lead',
    compliance_audit_validity: '2030-01-01',
    security_clearance_bcas: 'VALID',
    logged_project_hours: 0,
    last_28_days_duty_hours: 40,
    rest_period_hours: 48,
    fatigue_risk: 'LOW',
    monthly_base_salary: 490000,
    incentive_hourly_rate: 0,
    per_diem_allowance: 25000,
    last_payroll_status: 'DISBURSED',
    last_payroll_month: 'October 2026',
    leave_balance_pl: 21,
    leave_balance_cl: 8,
    leave_balance_rest: 0,
    performance_score: 99,
  }
];

const INITIAL_LEAVE_REQUESTS: LeaveRequestItem[] = [
  {
    id: 'leave_101',
    employee_id: 'TRV-MKT-0102',
    employee_name: 'Sarah Jenkins',
    department: 'Operations',
    leave_type: 'Compensatory Rest',
    start_date: '2026-10-14',
    end_date: '2026-10-16',
    days_count: 3,
    reason: 'Overtime compensation off following high-volume quarter-end campaign cycle.',
    cover_personnel: 'FO Daniel Miller (Standby)',
    status: 'PENDING_HR_L2',
    applied_at: '2026-10-10 14:30',
    stage1_approver: 'Aditya Vikram Verma (L7 Chief Operations Staff)',
    remarks: 'Approved by Line Commander. Awaiting final HRMS sanction.',
  },
  {
    id: 'leave_102',
    employee_id: 'TRV-ENG-0201',
    employee_name: 'Rajesh Nambiar',
    department: 'Finance',
    leave_type: 'Privileged Leave',
    start_date: '2026-10-20',
    end_date: '2026-10-24',
    days_count: 5,
    reason: 'Annual family leave scheduled during Gulfstream scheduled C-Check window.',
    cover_personnel: 'Suresh Menon (Deputy CAMO)',
    status: 'PENDING_MANAGER_L1',
    applied_at: '2026-10-11 09:15',
    remarks: 'Hangar shift covered by second line lead engineer.',
  },
  {
    id: 'leave_103',
    employee_id: 'TRV-SUP-0401',
    employee_name: 'Natasha Romanova',
    department: 'Support',
    leave_type: 'Casual / Sick',
    start_date: '2026-10-08',
    end_date: '2026-10-09',
    days_count: 2,
    reason: 'Mild sinus congestion, certified unfit for high-altitude cabin pressure by aviation medical officer.',
    cover_personnel: 'Elena Rostova (Standby VIP Host)',
    status: 'APPROVED',
    applied_at: '2026-10-07 19:00',
    stage1_approver: 'In-Flight Services Manager',
    stage2_approver: 'Ananya Sen (HR Director)',
    remarks: 'Medical certificate validated. Resumed duty on Oct 10.',
  }
];

export interface HumanResourceHRMSModuleProps {
  onRefreshAll?: () => void;
  currentUserRole?: string;
}

export const HumanResourceHRMSModule: React.FC<HumanResourceHRMSModuleProps> = ({
  onRefreshAll,
  currentUserRole = 'SUPER_ADMIN',
}) => {
  // Navigation Sub-tab within Human Resource Unified Module
  const [subTab, setSubTab] = useState<
    'overview' | 'directory' | 'attendance_shifts' | 'leaves' | 'payroll' | 'performance' | 'onboarding'
  >('overview');

  // Core Data States
  const [employees, setEmployees] = useState<EmployeeRecord[]>(INITIAL_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>(INITIAL_LEAVE_REQUESTS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [selectedEmployeeDossier, setSelectedEmployeeDossier] = useState<EmployeeRecord | null>(null);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState<EmployeeRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Operations' as EmployeeRecord['department'],
    designation: '',
    rank_level: 4,
    base_hub: 'BOM',
    employment_type: 'Full-Time' as EmployeeRecord['employment_type'],
    credential_id: '',
    monthly_base_salary: 350000,
    incentive_hourly_rate: 4500,
    per_diem_allowance: 40000,
  });

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.credential_id && emp.credential_id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
      const matchStatus = statusFilter === 'ALL' || emp.status === statusFilter;

      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalStaff = employees.length;
    const onDuty = employees.filter((e) => e.status === 'ON_DUTY').length;
    const activeOperationsStaff = employees.filter((e) => e.department === 'Operations').length;
    const pendingLeaves = leaveRequests.filter((l) => l.status.startsWith('PENDING')).length;
    const fatigueAlerts = employees.filter((e) => e.fatigue_risk === 'MODERATE' || e.fatigue_risk === 'CRITICAL').length;
    const totalPayroll = employees.reduce((sum, e) => sum + e.monthly_base_salary + e.per_diem_allowance, 0);

    return { totalStaff, onDuty, activeOperationsStaff, pendingLeaves, fatigueAlerts, totalPayroll };
  }, [employees, leaveRequests]);

  // Action: Approve Leave
  const handleApproveLeave = (leaveId: string) => {
    setLeaveRequests((prev) =>
      prev.map((lr) => {
        if (lr.id === leaveId) {
          if (lr.status === 'PENDING_MANAGER_L1') {
            return {
              ...lr,
              status: 'PENDING_HR_L2',
              stage1_approver: 'Reporting Manager (Approved)',
              remarks: 'Manager approval verified. Forwarded to HRMS Final Sanction.',
            };
          }
          if (lr.status === 'PENDING_HR_L2') {
            return {
              ...lr,
              status: 'APPROVED',
              stage2_approver: 'Human Resource Executive (Sanctioned)',
              remarks: 'Official time-off sanctioned. Shift schedule updated accordingly.',
            };
          }
        }
        return lr;
      })
    );
    showToast('Leave request advanced successfully!', 'success');
  };

  // Action: Reject Leave
  const handleRejectLeave = (leaveId: string) => {
    setLeaveRequests((prev) =>
      prev.map((lr) => {
        if (lr.id === leaveId) {
          return {
            ...lr,
            status: 'REJECTED',
            remarks: 'Time-off request declined due to critical aircraft sector availability requirement.',
          };
        }
        return lr;
      })
    );
    showToast('Leave request rejected.', 'error');
  };

  // Action: Add New Employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email) {
      alert('Please fill out required fields');
      return;
    }

    const created: EmployeeRecord = {
      id: `emp_${Date.now()}`,
      employee_id: `TRV-${newEmp.department.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newEmp.name,
      email: newEmp.email,
      phone: newEmp.phone || '+91 98000 00000',
      department: newEmp.department,
      designation: newEmp.designation || `${newEmp.department} Specialist`,
      rank_level: Number(newEmp.rank_level),
      rank_title: `L${newEmp.rank_level} - Professional`,
      base_hub: newEmp.base_hub,
      status: 'ACTIVE',
      employment_type: newEmp.employment_type,
      joining_date: new Date().toISOString().split('T')[0],
      reporting_manager: 'Department Head',
      credential_id: newEmp.credential_id || 'DGCA-CERT-AUTO',
      compliance_audit_validity: '2028-12-31',
      security_clearance_bcas: 'VALID',
      logged_project_hours: newEmp.department === 'Operations' ? 1200 : 0,
      last_28_days_duty_hours: 24,
      rest_period_hours: 36,
      fatigue_risk: 'LOW',
      monthly_base_salary: Number(newEmp.monthly_base_salary),
      incentive_hourly_rate: Number(newEmp.incentive_hourly_rate),
      per_diem_allowance: Number(newEmp.per_diem_allowance),
      last_payroll_status: 'PENDING_APPROVAL',
      last_payroll_month: 'October 2026',
      leave_balance_pl: 15,
      leave_balance_cl: 6,
      leave_balance_rest: 2,
      performance_score: 90,
    };

    setEmployees([created, ...employees]);
    setShowAddEmployeeModal(false);
    showToast(`Employee ${created.name} onboarded with ID ${created.employee_id}!`, 'success');
  };

  // Action: Process Payroll Batch
  const handleDisburseAllPayrolls = () => {
    setEmployees((prev) =>
      prev.map((e) => ({
        ...e,
        last_payroll_status: 'DISBURSED',
        last_payroll_month: 'October 2026',
      }))
    );
    showToast('Automated payroll batch executed! Bank UTR transfer slips generated for all staff.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2.5 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
                : 'bg-blue-950/90 text-blue-200 border-blue-500/50'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER: UNIFIED HUMAN RESOURCE (HR & HRMS SYSTEM) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Enterprise Aviation HR &amp; HRMS</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                L0–L8 Ranks Unified
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Operations SLA & Shift Compliant
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <span>Human Resource</span>
              <span className="text-xs sm:text-sm font-semibold text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-xl border border-purple-800">
                HR &amp; HRMS System at One Module
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Unified personnel management for aviation business operations, marketing, sales, finance, support, shift rostering, dual-level leave sanctions, automated payroll with payslip ledger, and corporate operational credentials in a single suite.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Onboard Employee</span>
            </button>
            <button
              onClick={handleDisburseAllPayrolls}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Run Payroll Cycle</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Counter strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Personnel</span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">{metrics.totalStaff}</span>
            <span className="text-[10px] text-purple-400 font-mono">100% Verified</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">On Duty / Active Shift</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">{metrics.onDuty}</span>
            <span className="text-[10px] text-emerald-300 font-mono">Active Accounts</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Sales & Marketing</span>
            <span className="text-lg font-black text-sky-400 font-mono mt-0.5 block">{metrics.activeOperationsStaff}</span>
            <span className="text-[10px] text-sky-300 font-mono">Sales & Growth</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Pending Leaves</span>
            <span className="text-lg font-black text-amber-400 font-mono mt-0.5 block">{metrics.pendingLeaves}</span>
            <span className="text-[10px] text-amber-300 font-mono">2-Tier Sign-off</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Shift Overtime Risk</span>
            <span className="text-lg font-black text-rose-400 font-mono mt-0.5 block">
              {metrics.fatigueAlerts > 0 ? `${metrics.fatigueAlerts} Monitor` : 'Zero Alert'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Max Shift Capacity</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Monthly Payroll</span>
            <span className="text-lg font-black text-emerald-300 font-mono mt-0.5 block">
              ₹{(metrics.totalPayroll / 100000).toFixed(1)}L
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Oct 2026 Ready</span>
          </div>
        </div>
      </div>

      {/* UNIFIED SUB-MODULE TABS (HR & HRMS SUITE) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            subTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Executive HR + HRMS Overview</span>
        </button>

        <button
          onClick={() => setSubTab('directory')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            subTab === 'directory'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Master Directory (Core HR)</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-purple-300 font-mono">
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('attendance_shifts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            subTab === 'attendance_shifts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Plane className="w-4 h-4 text-sky-400" />
          <span>Operations Shifts &amp; Work Hours</span>
        </button>

        <button
          onClick={() => setSubTab('leaves')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            subTab === 'leaves'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Leave Approvals &amp; Time-Off (HRMS)</span>
          {metrics.pendingLeaves > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold">
              {metrics.pendingLeaves}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('payroll')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            subTab === 'payroll'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Payroll, Flight Allowances &amp; Payslips</span>
        </button>

        <button
          onClick={() => setSubTab('performance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            subTab === 'performance'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Award className="w-4 h-4 text-yellow-400" />
          <span>Performance &amp; L0–L8 Promotions</span>
        </button>

        <button
          onClick={() => setSubTab('onboarding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            subTab === 'onboarding'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Onboarding &amp; License Vault</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: EXECUTIVE OVERVIEW                                            */}
      {/* ========================================================================= */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card A: Core HR Structure */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="w-4 h-4" />
                  <span>Core HR Pillar</span>
                </span>
                <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">
                  Structure Active
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Department Headcount Distribution</h3>
              <p className="text-xs text-slate-400">
                Staff distribution across certified aviation departments and operational bases.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  { dept: 'Operations', count: 3, pct: '38%', color: 'bg-sky-500' },
                  { dept: 'Finance', count: 1, pct: '13%', color: 'bg-emerald-500' },
                  { dept: 'Support', count: 1, pct: '13%', color: 'bg-indigo-500' },
                  { dept: 'Operations & Dispatch', count: 1, pct: '13%', color: 'bg-amber-500' },
                  { dept: 'Finance & Treasury', count: 1, pct: '13%', color: 'bg-emerald-400' },
                  { dept: 'Human Resource', count: 1, pct: '13%', color: 'bg-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.dept}</span>
                      <span className="text-slate-400 font-mono">{item.count} staff ({item.pct})</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card B: Operations Team Capacity & Service Workload */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Operations &amp; SLA Capacity</span>
                </span>
                <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded">
                  B2B SLA Monitored
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Team Project Hours &amp; Client Deliverable Capacity</h3>
              <p className="text-xs text-slate-400">
                Real-time workload hours allocation and client SLA support coverage across operations, marketing, sales, and finance.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Marcus Sterling</span>
                    <span className="text-[10px] text-slate-400">88 / 100 hrs project load</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                    High Workload
                  </span>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Aditya Vikram Verma</span>
                    <span className="text-[10px] text-slate-400">62 / 100 hrs project load</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    Optimal Capacity
                  </span>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Sarah Jenkins</span>
                    <span className="text-[10px] text-slate-400">74 / 100 hrs project load</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    Optimal Capacity
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSubTab('attendance_shifts')}
                className="w-full py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-bold border border-sky-500/30 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Open Operations Capacity Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card C: Compensation & Leave Approvals Queue */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>HRMS Payroll &amp; Leave</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">
                  Dual Sign-off
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Pending Workflow Approvals</h3>
              <p className="text-xs text-slate-400">
                Action pending leaves and monthly compensation disbursements.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">FO Sarah Jenkins (3 Days)</span>
                    <span className="text-[10px] font-mono text-amber-400">Stage 2 Due</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Compensatory Rest (London - Dubai)</p>
                  <button
                    onClick={() => setSubTab('leaves')}
                    className="mt-1 text-[11px] text-amber-300 underline font-semibold cursor-pointer"
                  >
                    Review in Leave Management &rarr;
                  </button>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">October 2026 Payroll</span>
                    <span className="text-[10px] text-slate-400">100% staff processed</span>
                  </div>
                  <button
                    onClick={() => setSubTab('payroll')}
                    className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
                  >
                    View Ledger
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: EMPLOYEE MASTER DIRECTORY (CORE HR)                           */}
      {/* ========================================================================= */}
      {subTab === 'directory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by staff name, ID (e.g. TRV-OPS-0101), designation, license..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Departments</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Support">Support</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Human Resource">Human Resource</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ON_DUTY">On Duty / Active Shift</option>
                <option value="ACTIVE">Active Ground</option>
                <option value="STANDBY">Standby Crew</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>

              <button
                onClick={() => setShowAddEmployeeModal(true)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Personnel</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Employee ID &amp; Name</th>
                    <th className="p-3.5">Department &amp; Designation</th>
                    <th className="p-3.5">Rank &amp; Grade</th>
                    <th className="p-3.5">Base Hub</th>
                    <th className="p-3.5">License / Credentials</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center font-mono text-xs">
                            {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{emp.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">{emp.employee_id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-200 block">{emp.department}</span>
                        <span className="text-[11px] text-slate-400">{emp.designation}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {emp.rank_title}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">{emp.base_hub}</td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs text-sky-300 block">{emp.credential_id || 'Internal Staff'}</span>
                          <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Compliance Active</span>
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            emp.status === 'ON_DUTY'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : emp.status === 'ACTIVE'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : emp.status === 'STANDBY'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedEmployeeDossier(emp)}
                            className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
                            title="View Full Personnel Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowPayslipModal(emp)}
                            className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                            title="Generate Payslip"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: OPERATIONS SHIFTS & WORK HOURS                    */}
      {/* ========================================================================= */}
      {subTab === 'attendance_shifts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-sky-400" />
                  <span>Operations Team Project Workload &amp; Service SLA Capacity</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tracks active service-level project commitments, client support response coverage, and team delivery capacity across regions.
                </p>
              </div>

              <button
                onClick={() => showToast('Operational project hours and service allocations verified.', 'info')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Audit Workload Capacity</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {employees
                .filter((e) => e.department === 'Operations' || e.department === 'Support')
                .map((staff_member) => {
                  const dutyPct = Math.min(100, Math.round((staff_member.last_28_days_duty_hours / 100) * 100));
                  return (
                    <div
                      key={staff_member.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs">
                            <Plane className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white text-xs block">{staff_member.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{staff_member.designation}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            staff_member.fatigue_risk === 'LOW'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {staff_member.fatigue_risk} Risk
                        </span>
                      </div>

                      {/* Workload & Capacity Meter */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">28-Day Duty Time:</span>
                          <span className="font-mono text-white font-bold">
                            {staff_member.last_28_days_duty_hours} / 100 hrs ({dutyPct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              dutyPct > 85 ? 'bg-amber-400' : 'bg-sky-400'
                            }`}
                            style={{ width: `${dutyPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 font-mono bg-slate-900/60 p-2 rounded-xl">
                        <div>
                          <span className="text-slate-500 block text-[9px]">Rest Period:</span>
                          {staff_member.rest_period_hours} hrs post-flight
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">Logged Career:</span>
                          {staff_member.logged_project_hours} hrs
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Shift Verified</span>
                        </span>
                        <button
                          onClick={() => {
                            showToast(`Shift check-in logged for ${staff_member.name} at ${staff_member.base_hub} Operations Hub!`, 'success');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 cursor-pointer"
                        >
                          Mark Check-In
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-TAB: LEAVE APPROVALS & TIME-OFF (HRMS)                             */}
      {/* ========================================================================= */}
      {subTab === 'leaves' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span>Dual-Stage Leave Management &amp; Time-Off Sanctions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Stage 1: Department Reporting Manager Verification &rarr; Stage 2: Central HRMS Final Sanction.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  {metrics.pendingLeaves} Actions Pending
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              {leaveRequests.map((lr) => (
                <div
                  key={lr.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{lr.employee_name}</span>
                      <span className="text-xs font-mono text-slate-400">({lr.department})</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {lr.leave_type}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          lr.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : lr.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {lr.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{lr.reason}</p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono">
                      <span>Duration: <strong className="text-slate-200">{lr.start_date} to {lr.end_date} ({lr.days_count} Days)</strong></span>
                      <span>Shift Standby Cover: <strong className="text-sky-300">{lr.cover_personnel}</strong></span>
                      {lr.stage1_approver && (
                        <span className="text-emerald-400">L1: {lr.stage1_approver}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {lr.status.startsWith('PENDING') && (
                      <>
                        <button
                          onClick={() => handleRejectLeave(lr.id)}
                          className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveLeave(lr.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lr.status === 'PENDING_MANAGER_L1' ? 'Approve Stage 1' : 'Sanction Stage 2 (HRMS)'}</span>
                        </button>
                      </>
                    )}
                    {lr.status === 'APPROVED' && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sanctioned &amp; Shift Calendar Updated</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-TAB: PAYROLL, FLIGHT ALLOWANCES & PAYSLIPS                         */}
      {/* ========================================================================= */}
      {subTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Automated Payroll, Flight Hour Allowance &amp; Payslip Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Combines base retainers, flying hours per diem, layover stipends, and statutory tax deductions.
                </p>
              </div>

              <button
                onClick={handleDisburseAllPayrolls}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Execute Bank Batch Disbursal</span>
              </button>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Staff</th>
                    <th className="p-3.5">Base Retainer</th>
                    <th className="p-3.5">Incentive Allowance</th>
                    <th className="p-3.5">Per Diem / Layover</th>
                    <th className="p-3.5">Net Monthly</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {employees.map((emp) => {
                    const incentiveComp = (emp.incentive_hourly_rate || 0) * (emp.last_28_days_duty_hours || 0);
                    const netTotal = emp.monthly_base_salary + incentiveComp + emp.per_diem_allowance;
                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{emp.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{emp.employee_id} • {emp.department}</span>
                        </td>

                        <td className="p-3.5 font-mono text-slate-300">₹{emp.monthly_base_salary.toLocaleString()}</td>

                        <td className="p-3.5 font-mono text-sky-300">
                          {incentiveComp > 0 ? `₹${incentiveComp.toLocaleString()} (${emp.last_28_days_duty_hours} hrs)` : 'N/A Ground'}
                        </td>

                        <td className="p-3.5 font-mono text-amber-300">₹{emp.per_diem_allowance.toLocaleString()}</td>

                        <td className="p-3.5 font-mono text-emerald-400 font-bold">₹{netTotal.toLocaleString()}</td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {emp.last_payroll_status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setShowPayslipModal(emp)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer"
                          >
                            Generate Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUB-TAB: PERFORMANCE & PROMOTIONS                                      */}
      {/* ========================================================================= */}
      {subTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>Personnel Appraisal Scores &amp; L0–L8 Promotion Gateways</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Aviation safety incident-free flight hours, On-Time Performance (OTP) adherence, and client charter NPS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {employees.map((emp) => (
                <div key={emp.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm block">{emp.name}</span>
                      <span className="text-[11px] text-slate-400">{emp.rank_title}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-yellow-500/20 text-yellow-300 font-mono text-xs font-bold border border-yellow-500/30">
                      Score: {emp.performance_score}/100
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Annual Flight Safety Rating:</span>
                      <span className="text-emerald-400 font-bold">100% Incident Free</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${emp.performance_score}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-mono">Current: Level {emp.rank_level}</span>
                    <button
                      onClick={() => {
                        showToast(`Promotion nomination ticket raised for ${emp.name} to Level ${emp.rank_level + 1}!`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Nominate for L{emp.rank_level + 1}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SUB-TAB: ONBOARDING & LICENSE VAULT                                     */}
      {/* ========================================================================= */}
      {subTab === 'onboarding' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span>Aviation Credentials, DGCA/FAA Licenses &amp; Security Passes</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Automated tracking of Class 1 aviation medical renewals, BCAS Airport Entry Passes (AEP), and simulator checks.
                </p>
              </div>

              <button
                onClick={() => setShowAddEmployeeModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard New Operations Staff or Staff</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
              {employees.map((emp) => (
                <div key={emp.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{emp.name}</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {emp.department}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 bg-slate-900/60 p-3 rounded-xl font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">License:</span>
                      <span className="text-white">{emp.credential_id || 'General Staff'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Medical Expiry:</span>
                      <span className="text-emerald-400">{emp.compliance_audit_validity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">BCAS Security AEP:</span>
                      <span className={emp.security_clearance_bcas === 'RENEWAL_DUE' ? 'text-amber-400' : 'text-emerald-400'}>
                        {emp.security_clearance_bcas}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showToast(`Compliance certificate for ${emp.name} verified against civil aviation portal.`, 'success');
                    }}
                    className="w-full py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Verify Civil Aviation Ledger
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW EMPLOYEE (ONBOARDING)                                      */}
      {/* ========================================================================= */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Onboard New Aviation Employee</h3>
                  <p className="text-[11px] text-slate-400">Core HR Record Creation &amp; HRMS Profile Activation</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEmployeeModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="e.g. Capt. Rahul Sharma"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    placeholder="rahul.sharma@truvaer.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department *</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Support">Support</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resource">Human Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    placeholder="e.g. Commander (Falcon 8X)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hierarchy Rank (L0–L8)</label>
                  <select
                    value={newEmp.rank_level}
                    onChange={(e) => setNewEmp({ ...newEmp, rank_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                      <option key={lvl} value={lvl}>Level {lvl}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Base Hub Airport</label>
                  <input
                    type="text"
                    value={newEmp.base_hub}
                    onChange={(e) => setNewEmp({ ...newEmp, base_hub: e.target.value })}
                    placeholder="BOM, DEL, DXB, LHR"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Base Salary (₹)</label>
                  <input
                    type="number"
                    value={newEmp.monthly_base_salary}
                    onChange={(e) => setNewEmp({ ...newEmp, monthly_base_salary: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Certifications / Credentials</label>
                  <input
                    type="text"
                    value={newEmp.credential_id}
                    onChange={(e) => setNewEmp({ ...newEmp, credential_id: e.target.value })}
                    placeholder="OPS-CERT-XXXXX"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Onboard &amp; Activate Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EMPLOYEE DOSSIER VIEW                                              */}
      {/* ========================================================================= */}
      {selectedEmployeeDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 to-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-base font-mono">
                  {selectedEmployeeDossier.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedEmployeeDossier.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedEmployeeDossier.employee_id} • {selectedEmployeeDossier.rank_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployeeDossier(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">Department:</span>
                  <span className="text-white font-bold">{selectedEmployeeDossier.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Base Hub:</span>
                  <span className="text-white">{selectedEmployeeDossier.base_hub}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Joining Date:</span>
                  <span className="text-white">{selectedEmployeeDossier.joining_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Reporting To:</span>
                  <span className="text-white">{selectedEmployeeDossier.reporting_manager}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">License Number:</span>
                  <span className="text-sky-300">{selectedEmployeeDossier.credential_id || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Medical Validity:</span>
                  <span className="text-emerald-400">{selectedEmployeeDossier.compliance_audit_validity}</span>
                </div>
              </div>

              {/* Compensation Breakdown */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Compensation &amp; Allowances</h4>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Base Salary:</span>
                    <span className="text-white">₹{selectedEmployeeDossier.monthly_base_salary.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Incentive Rate:</span>
                    <span className="text-white">₹{selectedEmployeeDossier.incentive_hourly_rate.toLocaleString()}/hr</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Per Diem:</span>
                    <span className="text-white">₹{selectedEmployeeDossier.per_diem_allowance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowPayslipModal(selectedEmployeeDossier);
                    setSelectedEmployeeDossier(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Generate Salary Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FORMAL PAYSLIP GENERATOR                                           */}
      {/* ========================================================================= */}
      {showPayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Official Salary Payslip</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Truvaer Aviation Enterprise HRMS • October 2026</p>
                </div>
              </div>
              <button
                onClick={() => setShowPayslipModal(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee Name:</span>
                  <span className="text-white font-bold">{showPayslipModal.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee ID:</span>
                  <span className="text-white">{showPayslipModal.employee_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-white">{showPayslipModal.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Designation:</span>
                  <span className="text-white">{showPayslipModal.designation}</span>
                </div>
              </div>

              {/* Earnings & Deductions */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-2 bg-slate-800/80 p-2.5 font-bold text-slate-200">
                  <span>Earnings Breakdown</span>
                  <span className="text-right">Amount (₹)</span>
                </div>
                <div className="p-3 space-y-1.5 bg-slate-950/60 text-slate-300">
                  <div className="flex justify-between">
                    <span>Basic Retainer Salary</span>
                    <span>₹{showPayslipModal.monthly_base_salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service &amp; Project Performance Incentive ({showPayslipModal.last_28_days_duty_hours} hrs)</span>
                    <span>₹{((showPayslipModal.incentive_hourly_rate || 0) * showPayslipModal.last_28_days_duty_hours).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operational &amp; Client Per Diem</span>
                    <span>₹{showPayslipModal.per_diem_allowance.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-400">
                    <span>Net Disbursed Take-Home</span>
                    <span>
                      ₹{(
                        showPayslipModal.monthly_base_salary +
                        (showPayslipModal.incentive_hourly_rate || 0) * showPayslipModal.last_28_days_duty_hours +
                        showPayslipModal.per_diem_allowance
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px]">
                Bank UTR Clearance: <strong className="text-white font-mono">UTR-TRV-OCT26-99214</strong> • Disbursed by Commercial Treasury
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    showToast(`Payslip for ${showPayslipModal.name} downloaded!`, 'success');
                    setShowPayslipModal(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Payslip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

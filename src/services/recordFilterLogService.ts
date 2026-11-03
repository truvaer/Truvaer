import { AdminUser } from '../types';

export type LoggedModuleType =
  | 'BUSINESS_APPROVALS'
  | 'COMMISSION_PAYOUTS'
  | 'LEAD_STATUS_CHANGES'
  | 'WALLET_DEBITS'
  | 'PROMOTIONS';

export interface ModuleActionLog {
  id: string;
  module: LoggedModuleType;
  action_type: string;
  action_date: string; // Server timestamp in ISO format
  action_by: {
    id: string;
    name: string;
    level: number;
    department?: string;
  } | 'System/Auto-Cron';
  target_id: string;
  target_name: string;
  details: string;
  status: string;
  previous_value?: string;
  new_value?: string;
  masked_pii?: {
    bank_account?: string;
    wallet_id?: string;
    phone?: string;
    email?: string;
  };
}

// Initial realistic action records for the 5 modules
const INITIAL_MODULE_LOGS: ModuleActionLog[] = [
  // 1. Business Approvals
  {
    id: 'LOG-BA-8901',
    module: 'BUSINESS_APPROVALS',
    action_type: 'KYC_HARD_LOCK_RELEASE',
    action_date: new Date(Date.now() - 3600000 * 2).toISOString(),
    action_by: {
      id: 'adm_01',
      name: 'B Aditya Narayana',
      level: 8,
      department: 'Senior Management',
    },
    target_id: 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
    target_name: 'JetVentures VIP SkySuite & Private Charters',
    details: 'Verified corporate PAN, GSTIN & Air Operator Certificate (AOC). Re-instated full booking clearance.',
    status: 'VERIFIED',
    previous_value: 'HARD_LOCKED',
    new_value: 'VERIFIED',
    masked_pii: {
      bank_account: 'HDFC BANK - **** **** 8821',
      phone: '+91 98*** **321',
      email: 'op***@jetventures.com',
    },
  },
  {
    id: 'LOG-BA-8902',
    module: 'BUSINESS_APPROVALS',
    action_type: 'BANK_DOC_AUDIT',
    action_date: new Date(Date.now() - 3600000 * 14).toISOString(),
    action_by: {
      id: 'adm_ops_l1',
      name: 'Karan Mehra',
      level: 1,
      department: 'Operations',
    },
    target_id: 'biz_02',
    target_name: 'SkyHigh Flight Services & Hangar',
    details: 'Preliminary audit of cancelled cheque and GST certificate completed.',
    status: 'IN_REVIEW',
    previous_value: 'PENDING',
    new_value: 'IN_REVIEW',
    masked_pii: {
      bank_account: 'ICICI BANK - **** **** 3390',
      phone: '+91 91*** **882',
    },
  },
  {
    id: 'LOG-BA-8903',
    module: 'BUSINESS_APPROVALS',
    action_type: 'AUTO_COMPLIANCE_SCAN',
    action_date: new Date(Date.now() - 3600000 * 26).toISOString(),
    action_by: 'System/Auto-Cron',
    target_id: 'biz_04',
    target_name: 'AeroLux Global GSE Solutions',
    details: 'Automated 30-day corporate tax compliance and aviation vendor license verification check passed.',
    status: 'COMPLIANT',
    previous_value: 'SCHEDULED',
    new_value: 'COMPLIANT',
  },

  // 2. Commission Payouts
  {
    id: 'LOG-CP-9101',
    module: 'COMMISSION_PAYOUTS',
    action_type: 'COMMISSION_SETTLEMENT',
    action_date: new Date(Date.now() - 3600000 * 4).toISOString(),
    action_by: {
      id: 'adm_fin_l7',
      name: 'Suresh Menon (Finance Director)',
      level: 7,
      department: 'Finance',
    },
    target_id: 'COMM-2026-081',
    target_name: 'Bombardier Global 7500 Charter Contract #412',
    details: 'Treasury payout of ₹2,40,000 released via RTGS to operator escrow account.',
    status: 'SETTLED',
    previous_value: 'RELEASED',
    new_value: 'SETTLED',
    masked_pii: {
      bank_account: 'AXIS BANK - **** **** 9012',
      wallet_id: 'WAL-CORP-****-77',
    },
  },
  {
    id: 'LOG-CP-9102',
    module: 'COMMISSION_PAYOUTS',
    action_type: 'AUTO_CALC_COMMISSION',
    action_date: new Date(Date.now() - 3600000 * 18).toISOString(),
    action_by: 'System/Auto-Cron',
    target_id: 'COMM-2026-082',
    target_name: 'Falcon 8X Cross-Corridor Sale',
    details: 'Automated 5% platform commission accrual sheet computed on ₹68,00,000 deal close won.',
    status: 'COMMITTED',
    previous_value: 'PROPOSAL',
    new_value: 'COMMITTED',
  },
  {
    id: 'LOG-CP-9103',
    module: 'COMMISSION_PAYOUTS',
    action_type: 'COMMISSION_RELEASE_REQUEST',
    action_date: new Date(Date.now() - 3600000 * 30).toISOString(),
    action_by: {
      id: 'adm_fin_l2',
      name: 'Pooja Verma (Finance Associate)',
      level: 2,
      department: 'Finance',
    },
    target_id: 'COMM-2026-079',
    target_name: 'Phenom 300 Regional Air Taxi Batch',
    details: 'Submitted verified commission invoice for senior managerial settlement.',
    status: 'RELEASE_PENDING',
    previous_value: 'COMMITTED',
    new_value: 'RELEASE_PENDING',
    masked_pii: {
      bank_account: 'KOTAK BANK - **** **** 1144',
    },
  },

  // 3. Lead Status Changes
  {
    id: 'LOG-LS-7301',
    module: 'LEAD_STATUS_CHANGES',
    action_type: 'LEAD_STAGE_WON',
    action_date: new Date(Date.now() - 3600000 * 3).toISOString(),
    action_by: {
      id: 'adm_sales_l3',
      name: 'Rohan Sharma (Sales Lead)',
      level: 3,
      department: 'Sales',
    },
    target_id: 'crm_lead_01',
    target_name: 'Corporate Gulfstream G650 Charter (Bengaluru - Dubai)',
    details: 'Contract signed and bank wire verified for ₹42,50,000 charter itinerary.',
    status: 'WON',
    previous_value: 'NEGOTIATION',
    new_value: 'WON',
    masked_pii: {
      phone: '+91 98*** **112',
      email: 'di***@reliancetech.com',
    },
  },
  {
    id: 'LOG-LS-7302',
    module: 'LEAD_STATUS_CHANGES',
    action_type: 'LEAD_STATUS_QUALIFIED',
    action_date: new Date(Date.now() - 3600000 * 12).toISOString(),
    action_by: {
      id: 'adm_sales_l1',
      name: 'Sameer Jain',
      level: 1,
      department: 'Sales',
    },
    target_id: 'crm_lead_04',
    target_name: 'Helicopter Offshore Shuttle Inbound Inquiry',
    details: 'Customer budget and passenger manifest eligibility confirmed.',
    status: 'QUALIFIED',
    previous_value: 'CONTACTED',
    new_value: 'QUALIFIED',
    masked_pii: {
      phone: '+91 97*** **900',
    },
  },
  {
    id: 'LOG-LS-7303',
    module: 'LEAD_STATUS_CHANGES',
    action_type: 'AUTO_LEAD_INGESTION',
    action_date: new Date(Date.now() - 3600000 * 20).toISOString(),
    action_by: 'System/Auto-Cron',
    target_id: 'crm_lead_05',
    target_name: 'Air Ambulance Medevac Express (Hyderabad - Singapore)',
    details: 'Automated CRM lead dispatch from web portal inquiry intake form.',
    status: 'NEW',
    previous_value: 'UNASSIGNED',
    new_value: 'NEW',
  },

  // 4. Wallet Debits
  {
    id: 'LOG-WD-6201',
    module: 'WALLET_DEBITS',
    action_type: 'WALLET_DEBIT_EXECUTION',
    action_date: new Date(Date.now() - 3600000 * 6).toISOString(),
    action_by: {
      id: 'adm_ops_l7',
      name: 'Aditya Vikram Verma (Executive Director)',
      level: 7,
      department: 'Operations',
    },
    target_id: 'DEB-REQ-4819',
    target_name: 'AeroHangar Services Private Limited',
    details: 'Debited 450 Credits for high-volume SMS promotional broadcast dispatch.',
    status: 'EXECUTED',
    previous_value: 'PENDING_EXECUTIVE_APPROVAL',
    new_value: 'EXECUTED',
    masked_pii: {
      wallet_id: 'WAL-CORP-****-32',
      bank_account: 'HDFC BANK - **** **** 5521',
    },
  },
  {
    id: 'LOG-WD-6202',
    module: 'WALLET_DEBITS',
    action_type: 'AUTO_CREDIT_DEDUCTION',
    action_date: new Date(Date.now() - 3600000 * 16).toISOString(),
    action_by: 'System/Auto-Cron',
    target_id: 'DEB-AUTO-1092',
    target_name: 'Signature Aviation Lounge & Ramp Support',
    details: 'Automated monthly recurring listing verification & directory subscription fee debited (100 Credits).',
    status: 'EXECUTED',
    previous_value: 'SCHEDULED',
    new_value: 'EXECUTED',
    masked_pii: {
      wallet_id: 'WAL-CORP-****-89',
    },
  },
  {
    id: 'LOG-WD-6203',
    module: 'WALLET_DEBITS',
    action_type: 'DEBIT_INITIATION',
    action_date: new Date(Date.now() - 3600000 * 28).toISOString(),
    action_by: {
      id: 'adm_fin_l2',
      name: 'Pooja Verma (Finance Associate)',
      level: 2,
      department: 'Finance',
    },
    target_id: 'DEB-REQ-4812',
    target_name: 'Falcon Wings Aviation Spares',
    details: 'Manual debit request initiated for emergency customs fee clearance.',
    status: 'PENDING_LEVEL_1',
    previous_value: 'DRAFT',
    new_value: 'PENDING_LEVEL_1',
    masked_pii: {
      wallet_id: 'WAL-CORP-****-14',
    },
  },

  // 5. Promotions
  {
    id: 'LOG-PR-5501',
    module: 'PROMOTIONS',
    action_type: 'LEVEL_2_ELEVATION_SIGN_OFF',
    action_date: new Date(Date.now() - 3600000 * 5).toISOString(),
    action_by: {
      id: 'adm_01',
      name: 'B Aditya Narayana (Chairman L8)',
      level: 8,
      department: 'Senior Management',
    },
    target_id: 'PROM-001',
    target_name: 'Promotion of Divya Nair (Customer Care L0 -> L1)',
    details: 'Second-tier mandatory approval completed. Enhanced telephone support relay granted.',
    status: 'APPROVED',
    previous_value: 'PENDING_LEVEL_2',
    new_value: 'APPROVED',
  },
  {
    id: 'LOG-PR-5502',
    module: 'PROMOTIONS',
    action_type: 'LEVEL_1_APPROVAL',
    action_date: new Date(Date.now() - 3600000 * 22).toISOString(),
    action_by: {
      id: 'adm_ops_l3',
      name: 'Arjun Patel (Lead L3)',
      level: 3,
      department: 'Operations',
    },
    target_id: 'PROM-002',
    target_name: 'Promotion of Sameer Jain (Sales L0 -> L1)',
    details: 'Stage 1 managerial approval completed based on CSAT performance milestone.',
    status: 'PENDING_LEVEL_2',
    previous_value: 'PENDING_LEVEL_1',
    new_value: 'PENDING_LEVEL_2',
  },
  {
    id: 'LOG-PR-5503',
    module: 'PROMOTIONS',
    action_type: 'STAFF_MOBILITY_REALLOCATION',
    action_date: new Date(Date.now() - 3600000 * 34).toISOString(),
    action_by: {
      id: 'adm_ops_l7',
      name: 'Aditya Vikram Verma (Executive Director L7)',
      level: 7,
      department: 'Operations',
    },
    target_id: 'MOB-2026-04',
    target_name: 'Transfer of Vikramaditya Rao (L2 -> CRM Desk)',
    details: 'Dynamic Allocation System (DAS) staff transfer executed for cross-zone load balancing.',
    status: 'EXECUTED',
    previous_value: 'OPERATIONS',
    new_value: 'CRM_SALES',
  },
];

class RecordFilterLogManager {
  private logs: ModuleActionLog[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem('truvaer_action_records_logs');
      if (saved) {
        this.logs = JSON.parse(saved);
      } else {
        this.logs = [...INITIAL_MODULE_LOGS];
        this.persist();
      }
    } catch {
      this.logs = [...INITIAL_MODULE_LOGS];
    }
  }

  private persist() {
    try {
      localStorage.setItem('truvaer_action_records_logs', JSON.stringify(this.logs));
    } catch {
      // ignore
    }
  }

  public recordAction(entry: {
    module: LoggedModuleType;
    action_type: string;
    action_by: { id: string; name: string; level: number; department?: string } | 'System/Auto-Cron';
    target_id: string;
    target_name: string;
    details: string;
    status: string;
    previous_value?: string;
    new_value?: string;
    masked_pii?: {
      bank_account?: string;
      wallet_id?: string;
      phone?: string;
      email?: string;
    };
  }): ModuleActionLog {
    const newLog: ModuleActionLog = {
      id: `LOG-${entry.module.slice(0, 2)}-${Date.now().toString().slice(-4)}`,
      action_date: new Date().toISOString(),
      ...entry,
    };
    this.logs = [newLog, ...this.logs];
    this.persist();
    return newLog;
  }

  /**
   * RBAC Security Check: View option is available for reporting managers (Level + 2 only).
   * For example: If L1 user performed an action, only L3 (L1 + 2) or higher can view it.
   * If L2 user performed, L4/L5 can view it.
   * L1 & L2 will only have access to view logs related to their own activities.
   * L7 and L8 (Executive Directors & Chairman) have universal visibility.
   */
  public canViewLog(viewer: AdminUser | null | undefined, log: ModuleActionLog): boolean {
    if (!viewer) return false;
    const viewerLevel = viewer.level ?? (viewer.role === 'SUPER_ADMIN' ? 8 : 1);

    // L7 and L8 have universal view access
    if (viewerLevel >= 7 || viewer.role === 'SUPER_ADMIN') {
      return true;
    }

    // System/Auto-Cron actions are viewable by all managers (L2+)
    if (log.action_by === 'System/Auto-Cron') {
      return viewerLevel >= 2;
    }

    const performerId = log.action_by.id;
    const performerLevel = log.action_by.level;

    // L1 and L2 can only view logs related to their own activities
    if (viewerLevel <= 2) {
      return viewer.admin_id === performerId;
    }

    // Reporting managers: Level + 2 condition strictly enforced!
    // Viewer level must be at least performerLevel + 2 (or viewing their own action)
    return viewerLevel >= performerLevel + 2 || viewer.admin_id === performerId;
  }

  /**
   * RBAC Security Check: Export / Download logs is permitted ONLY for L7 and L8.
   */
  public canDownloadLogs(viewer: AdminUser | null | undefined): boolean {
    if (!viewer) return false;
    const level = viewer.level ?? (viewer.role === 'SUPER_ADMIN' ? 8 : 1);
    return level >= 7 || viewer.role === 'SUPER_ADMIN';
  }

  /**
   * Retrieve filtered logs with RBAC visibility filtering.
   */
  public getLogs(
    viewer: AdminUser | null | undefined,
    moduleFilter?: LoggedModuleType | 'ALL',
    searchQuery?: string
  ): ModuleActionLog[] {
    return this.logs.filter((log) => {
      // 1. RBAC Level + 2 visibility check
      if (!this.canViewLog(viewer, log)) return false;

      // 2. Module filter
      if (moduleFilter && moduleFilter !== 'ALL' && log.module !== moduleFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTarget = log.target_name.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesAction = log.action_type.toLowerCase().includes(q);
        const matchesId = log.id.toLowerCase().includes(q);
        const performerName =
          log.action_by === 'System/Auto-Cron'
            ? 'system/auto-cron'
            : log.action_by.name.toLowerCase();
        return matchesTarget || matchesDetails || matchesAction || matchesId || performerName.includes(q);
      }

      return true;
    });
  }

  /**
   * Generates secure CSV content with masked PII and downloads it.
   * Strictly enforces L7 / L8 download permission.
   */
  public exportLogsToCSV(
    viewer: AdminUser | null | undefined,
    logs: ModuleActionLog[],
    moduleNameLabel: string = 'Records_Audit_Logs'
  ): { success: boolean; message: string } {
    if (!this.canDownloadLogs(viewer)) {
      return {
        success: false,
        message: 'Security Policy Violation: Exporting and downloading logs is strictly restricted to L7 (Director) and L8 (Executive Chairman).',
      };
    }

    const headers = [
      'Log ID',
      'Action Date & Time (Server UTC)',
      'Module Impacted',
      'Action Type',
      'Performed By (Admin Name / Auto-Cron)',
      'Admin ID',
      'Admin Level',
      'Target Record',
      'Status',
      'Previous State',
      'New State',
      'Action Audit Details',
      'Masked Bank Account / PII',
      'Masked Corporate Wallet',
    ];

    const rows = logs.map((log) => {
      const performerName =
        log.action_by === 'System/Auto-Cron'
          ? 'System/Auto-Cron Engine'
          : log.action_by.name;
      const performerId =
        log.action_by === 'System/Auto-Cron' ? 'SYSTEM_CRON' : log.action_by.id;
      const performerLevel =
        log.action_by === 'System/Auto-Cron'
          ? 'N/A'
          : `L${log.action_by.level}`;

      // Mask sensitive details
      const maskedBank = log.masked_pii?.bank_account || 'N/A';
      const maskedWallet = log.masked_pii?.wallet_id || 'N/A';

      return [
        `"${log.id}"`,
        `"${log.action_date}"`,
        `"${log.module}"`,
        `"${log.action_type}"`,
        `"${performerName.replace(/"/g, '""')}"`,
        `"${performerId}"`,
        `"${performerLevel}"`,
        `"${log.target_name.replace(/"/g, '""')}"`,
        `"${log.status}"`,
        `"${log.previous_value || 'N/A'}"`,
        `"${log.new_value || 'N/A'}"`,
        `"${log.details.replace(/"/g, '""')}"`,
        `"${maskedBank}"`,
        `"${maskedWallet}"`,
      ].join(',');
    });

    const csvData = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${moduleNameLabel}_L7_L8_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: `Successfully exported ${logs.length} audited log records (PII masked for L7/L8 compliance).`,
    };
  }
}

export const recordFilterLogService = new RecordFilterLogManager();

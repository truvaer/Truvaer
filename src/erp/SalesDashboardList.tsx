import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  CRMSalesRecord,
  SalesPaymentStatus,
  SalesStatus,
  BusinessProfile,
  AdminUser,
  RegularUser,
} from '../types';
import { db } from '../data/mockDatabase';
import {
  Plus,
  Search,
  Copy,
  FileSpreadsheet,
  FileText,
  Printer,
  SlidersHorizontal,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  ChevronDown,
  ArrowUpDown,
  Check,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  Download,
  RotateCcw,
  Receipt,
  Tag,
  User,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface SalesDashboardListProps {
  businessId?: string;
  selectedZone?: string;
  selectedCountry?: string;
  selectedTerritory?: string;
  currentUser: RegularUser | null;
  currentBusiness: BusinessProfile | null;
  currentAdmin: AdminUser | null;
  onRefresh?: () => void;
}

type SortField =
  | 'sales_date'
  | 'sales_code'
  | 'sales_status'
  | 'reference_no'
  | 'customer_name'
  | 'total_amount'
  | 'paid_amount'
  | 'payment_status'
  | 'created_by';

type SortDirection = 'asc' | 'desc';

export const SalesDashboardList: React.FC<SalesDashboardListProps> = ({
  businessId,
  selectedZone,
  selectedCountry,
  selectedTerritory,
  currentUser,
  currentBusiness,
  currentAdmin,
  onRefresh,
}) => {
  // Sales State
  const [sales, setSales] = useState<CRMSalesRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesStatusFilter, setSalesStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [createdByFilter, setCreatedByFilter] = useState('All');
  const [datePreset, setDatePreset] = useState<string>('All');
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(true);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('sales_code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Checkbox Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action Dropdown state
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Column Visibility state
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement | null>(null);
  const [columnsVisibility, setColumnsVisibility] = useState({
    sales_date: true,
    sales_code: true,
    sales_status: true,
    reference_no: true,
    customer_name: true,
    total_amount: true,
    paid_amount: true,
    payment_status: true,
    created_by: true,
    action: true,
  });

  // Modal States
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [selectedSaleForView, setSelectedSaleForView] = useState<CRMSalesRecord | null>(null);
  const [selectedSaleForEdit, setSelectedSaleForEdit] = useState<CRMSalesRecord | null>(null);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<CRMSalesRecord | null>(null);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load Sales from DB
  const loadSales = () => {
    const list = db.getCRMSales(businessId, {
      zone: selectedZone,
      country: selectedCountry,
      territory: selectedTerritory,
    });
    setSales(list);
  };

  useEffect(() => {
    loadSales();
  }, [businessId, selectedZone, selectedCountry, selectedTerritory]);

  // Handle clicking outside action dropdowns & column toggler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
      if (columnMenuRef.current && !columnMenuRef.current.contains(e.target as Node)) {
        setShowColumnMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick date presets
  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'All') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'Today') {
      const today = formatDate(now);
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'This Week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      setStartDate(formatDate(startOfWeek));
      setEndDate(formatDate(now));
    } else if (preset === 'This Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDate(startOfMonth));
      setEndDate(formatDate(now));
    } else if (preset === 'Last 30 Days') {
      const past30 = new Date(now);
      past30.setDate(now.getDate() - 30);
      setStartDate(formatDate(past30));
      setEndDate(formatDate(now));
    } else if (preset === 'This Year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(formatDate(startOfYear));
      setEndDate(formatDate(now));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setSalesStatusFilter('All');
    setPaymentStatusFilter('All');
    setCreatedByFilter('All');
    setDatePreset('All');
    setCurrentPage(1);
    showToast('Filters reset to default view.');
  };

  // Normalizing date for comparison
  const normalizeDate = (dStr: string): string => {
    if (!dStr) return '';
    if (dStr.includes('-') && dStr.length === 10) {
      const parts = dStr.split('-');
      if (parts[0].length === 2 && parts[2].length === 4) {
        // DD-MM-YYYY -> YYYY-MM-DD
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dStr;
  };

  // Filtered & Sorted Sales
  const filteredSales = useMemo(() => {
    let result = [...sales];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.sales_code.toLowerCase().includes(q) ||
          s.customer_name.toLowerCase().includes(q) ||
          (s.reference_no && s.reference_no.toLowerCase().includes(q)) ||
          (s.tag && s.tag.toLowerCase().includes(q)) ||
          s.created_by.toLowerCase().includes(q) ||
          s.payment_status.toLowerCase().includes(q) ||
          s.sales_status.toLowerCase().includes(q)
      );
    }

    // Status Filters
    if (salesStatusFilter !== 'All') {
      result = result.filter((s) => s.sales_status === salesStatusFilter);
    }

    if (paymentStatusFilter !== 'All') {
      result = result.filter((s) => s.payment_status === paymentStatusFilter);
    }

    if (createdByFilter !== 'All') {
      result = result.filter((s) => s.created_by.toLowerCase() === createdByFilter.toLowerCase());
    }

    // Date Range
    if (startDate) {
      result = result.filter((s) => normalizeDate(s.sales_date) >= startDate);
    }
    if (endDate) {
      result = result.filter((s) => normalizeDate(s.sales_date) <= endDate);
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'sales_date') {
        valA = normalizeDate(a.sales_date);
        valB = normalizeDate(b.sales_date);
      } else if (sortField === 'total_amount' || sortField === 'paid_amount') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    sales,
    searchQuery,
    salesStatusFilter,
    paymentStatusFilter,
    createdByFilter,
    startDate,
    endDate,
    sortField,
    sortDirection,
  ]);

  // Aggregate Metrics
  const summaryMetrics = useMemo(() => {
    const totalRev = filteredSales.reduce((acc, s) => acc + s.total_amount, 0);
    const totalPaid = filteredSales.reduce((acc, s) => acc + s.paid_amount, 0);
    const totalDue = Math.max(0, totalRev - totalPaid);
    const countPaid = filteredSales.filter((s) => s.payment_status === 'Paid').length;
    const countUnpaid = filteredSales.filter((s) => s.payment_status === 'Unpaid').length;
    const countPartial = filteredSales.filter((s) => s.payment_status === 'Partial').length;

    return {
      totalRev,
      totalPaid,
      totalDue,
      countPaid,
      countUnpaid,
      countPartial,
      totalRecords: filteredSales.length,
    };
  }, [filteredSales]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / entriesPerPage));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const startIndex = (currentPageClamped - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredSales.length);
  const displayedSales = filteredSales.slice(startIndex, endIndex);

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Select all checkbox
  const isAllSelected =
    displayedSales.length > 0 && displayedSales.every((s) => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      displayedSales.forEach((s) => next.add(s.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Export: Copy to Clipboard (TSV format compatible with Excel & Sheets)
  const handleCopyData = () => {
    if (filteredSales.length === 0) {
      showToast('No sales records to copy.');
      return;
    }

    const headers = [
      'Sales Date',
      'Sales Code',
      'Sales Status',
      'Reference No.',
      'Customer Name',
      'Total (INR)',
      'Paid Payment (INR)',
      'Payment Status',
      'Created by',
    ];

    const rows = filteredSales.map((s) => [
      s.sales_date,
      s.sales_code,
      s.sales_status,
      s.reference_no || '-',
      s.customer_name,
      s.total_amount.toFixed(2),
      s.paid_amount.toFixed(2),
      s.payment_status,
      s.created_by,
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent).then(
      () => {
        showToast(`Copied ${filteredSales.length} sales records to clipboard!`);
      },
      () => {
        showToast('Clipboard access was blocked by browser permissions.');
      }
    );
  };

  // Export: Excel / CSV
  const handleExportCSV = (asExcel = false) => {
    if (filteredSales.length === 0) {
      showToast('No sales records to export.');
      return;
    }

    const headers = [
      'Sales Date',
      'Sales Code',
      'Sales Status',
      'Reference No.',
      'Customer Name',
      'Total Amount',
      'Paid Payment',
      'Payment Status',
      'Created by',
      'Notes',
    ];

    const csvRows = [headers.join(',')];

    filteredSales.forEach((s) => {
      const row = [
        `"${s.sales_date}"`,
        `"${s.sales_code}"`,
        `"${s.sales_status}"`,
        `"${s.reference_no || ''}"`,
        `"${s.customer_name.replace(/"/g, '""')}"`,
        s.total_amount.toFixed(2),
        s.paid_amount.toFixed(2),
        `"${s.payment_status}"`,
        `"${s.created_by}"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sales_List_Report_${new Date().toISOString().split('T')[0]}.${asExcel ? 'csv' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(
      asExcel
        ? `Exported ${filteredSales.length} sales to Excel spreadsheet file!`
        : `Downloaded CSV report with ${filteredSales.length} sales records!`
    );
  };

  // Export: PDF / Print
  const handlePrintOrPDF = (isPDF = false) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups to print or view PDF report.');
      return;
    }

    const title = isPDF ? 'Sales List PDF Report' : 'Sales List Summary Report';
    const rowsHtml = filteredSales
      .map(
        (s) => `
      <tr>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd;">${s.sales_date}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd; font-weight: bold;">${s.sales_code}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd;">${s.sales_status}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd;">${s.reference_no || '-'}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd;">${s.customer_name}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd; text-align: right;">₹ ${s.total_amount.toFixed(2)}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd; text-align: right;">₹ ${s.paid_amount.toFixed(2)}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd; font-weight: bold; color: ${
          s.payment_status === 'Paid'
            ? '#059669'
            : s.payment_status === 'Partial'
            ? '#d97706'
            : '#dc2626'
        };">${s.payment_status}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #ddd;">${s.created_by}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Truvaer Aviation ERP</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 24px; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 16px; }
            .kpis { display: flex; gap: 16px; margin-bottom: 20px; }
            .kpi-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 16px; background: #f8fafc; }
            .kpi-title { font-size: 10px; text-transform: uppercase; color: #64748b; }
            .kpi-val { font-size: 16px; font-weight: bold; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th { background: #335577; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1>Truvaer Aviation - Sales List Report</h1>
              <div class="meta">Generated on ${new Date().toLocaleString()} | Filter: ${filteredSales.length} Transactions</div>
            </div>
            <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Print / Save as PDF</button>
          </div>
          <div class="kpis">
            <div class="kpi-card">
              <div class="kpi-title">Total Sales Revenue</div>
              <div class="kpi-val">₹ ${summaryMetrics.totalRev.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Paid Amount</div>
              <div class="kpi-val" style="color: #059669;">₹ ${summaryMetrics.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Outstanding Balance</div>
              <div class="kpi-val" style="color: #dc2626;">₹ ${summaryMetrics.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sales Date</th>
                <th>Sales Code</th>
                <th>Sales Status</th>
                <th>Reference No.</th>
                <th>Customer Name</th>
                <th style="text-align: right;">Total</th>
                <th style="text-align: right;">Paid Payment</th>
                <th>Payment Status</th>
                <th>Created by</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            setTimeout(() => { window.print(); }, 400);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Delete handler
  const handleDeleteSale = (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete sales record ${code}?`)) {
      const ok = db.deleteCRMSale(id);
      if (ok) {
        setSales((prev) => prev.filter((s) => s.id !== id));
        showToast(`Sales record ${code} deleted successfully.`);
        if (onRefresh) onRefresh();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500/80 text-sky-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header & + New Sales button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/95 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-sky-400" />
            <span>Sales List</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time transaction register, payment clearance ledger, and direct row actions without stage switching.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
              showFilterPanel
                ? 'bg-slate-800 text-sky-300 border-sky-500/50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Toggle Filter Panel"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-400">
              {filteredSales.length}
            </span>
          </button>

          <button
            onClick={() => setShowNewSaleModal(true)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ New Sales</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800/90 p-3.5 rounded-2xl">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-sky-400" />
            <span>Total Sales Value</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white mt-1">
            ₹ {summaryMetrics.totalRev.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {summaryMetrics.totalRecords} transactions logged
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 p-3.5 rounded-2xl">
          <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paid Revenue</span>
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-400 mt-1">
            ₹ {summaryMetrics.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            {summaryMetrics.countPaid} fully settled
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 p-3.5 rounded-2xl">
          <div className="text-[11px] font-mono text-amber-400 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Partially Paid</span>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-400 mt-1">
            {summaryMetrics.countPartial} Deals
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Partial payments received
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/90 p-3.5 rounded-2xl">
          <div className="text-[11px] font-mono text-rose-400 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Outstanding Due</span>
          </div>
          <div className="text-base sm:text-lg font-black text-rose-400 mt-1">
            ₹ {summaryMetrics.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {summaryMetrics.countUnpaid} unpaid transactions
          </div>
        </div>
      </div>

      {/* Rich Filters Panel (Fulfilling: "And filter should be given so that based on it reports can be taken or seen easily") */}
      {showFilterPanel && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Report Filters &amp; Scoping Criteria</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            {/* Date Presets */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Date Range Preset
              </label>
              <select
                value={datePreset}
                onChange={(e) => applyDatePreset(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="All">All Time Records</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Year">This Year</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('Custom');
                }}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('Custom');
                }}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500"
              />
            </div>

            {/* Sales Status */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Sales Status
              </label>
              <select
                value={salesStatusFilter}
                onChange={(e) => setSalesStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="All">All Sales Statuses</option>
                <option value="Final">Final</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
                <option value="Quotation">Quotation</option>
                <option value="Return Raised">Return Raised</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="All">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400">Created by:</span>
            {['All', 'Admin', 'Sales', 'Business'].map((creator) => (
              <button
                key={creator}
                onClick={() => setCreatedByFilter(creator)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  createdByFilter.toLowerCase() === creator.toLowerCase()
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {creator}
              </button>
            ))}

            <div className="ml-auto text-slate-400 font-mono text-[11px]">
              Found: <span className="text-sky-300 font-bold">{filteredSales.length}</span> matching records
            </div>
          </div>
        </div>
      )}

      {/* Main Table Container matching User's uploaded screenshot */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Controls Toolbar: Show entries, Copy/Excel/PDF/Print/CSV/Columns, and Search */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Show [ 10 v ] entries */}
          <div className="flex items-center space-x-2 text-slate-300">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-sky-500 cursor-pointer font-semibold text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          {/* Action Buttons: Copy, Excel, PDF, Print, CSV, Columns */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleCopyData}
              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
              title="Copy visible table text to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>

            <button
              onClick={() => handleExportCSV(true)}
              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
              title="Export to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => handlePrintOrPDF(true)}
              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
              title="Generate PDF report"
            >
              <FileText className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => handlePrintOrPDF(false)}
              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
              title="Print Sales Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={() => handleExportCSV(false)}
              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {/* Column Toggler */}
            <div className="relative" ref={columnMenuRef}>
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
                title="Toggle Columns"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Columns</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showColumnMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="font-bold text-slate-300 px-2 py-1 text-[11px] border-b border-slate-800">
                    Toggle Columns
                  </div>
                  {Object.entries({
                    sales_date: 'Sales Date',
                    sales_code: 'Sales Code',
                    sales_status: 'Sales Status',
                    reference_no: 'Reference No.',
                    customer_name: 'Customer Name',
                    total_amount: 'Total',
                    paid_amount: 'Paid Payment',
                    payment_status: 'Payment Status',
                    created_by: 'Created by',
                  }).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={columnsVisibility[key as keyof typeof columnsVisibility]}
                        onChange={(e) =>
                          setColumnsVisibility((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-700 text-sky-500 focus:ring-0"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search: [ ______ ] */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-slate-300 shrink-0">Search:</span>
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Code, customer, ref..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-3 pr-8 py-1.5 text-xs outline-none focus:border-sky-500"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <Search className="w-3 h-3 text-slate-500 absolute right-2.5 top-2.5" />
              )}
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Header matching screenshot's dark navy #335577 header styling */}
            <thead className="bg-[#244369] text-white border-b border-slate-700">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-0 cursor-pointer"
                  />
                </th>

                {columnsVisibility.sales_date && (
                  <th
                    onClick={() => handleSort('sales_date')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Sales Date</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.sales_code && (
                  <th
                    onClick={() => handleSort('sales_code')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Sales Code</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.sales_status && (
                  <th
                    onClick={() => handleSort('sales_status')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Sales Status</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.reference_no && (
                  <th
                    onClick={() => handleSort('reference_no')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Reference No.</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.customer_name && (
                  <th
                    onClick={() => handleSort('customer_name')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Customer Name</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.total_amount && (
                  <th
                    onClick={() => handleSort('total_amount')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none text-right"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Total</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.paid_amount && (
                  <th
                    onClick={() => handleSort('paid_amount')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none text-right"
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <span>Paid Payment</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.payment_status && (
                  <th
                    onClick={() => handleSort('payment_status')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Payment Status</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.created_by && (
                  <th
                    onClick={() => handleSort('created_by')}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-700/50 transition-colors select-none"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created by</span>
                      <ArrowUpDown className="w-3 h-3 text-sky-300 opacity-70" />
                    </div>
                  </th>
                )}

                {columnsVisibility.action && (
                  <th className="p-3 font-bold text-center w-28">
                    Action
                  </th>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {displayedSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 italic">
                    No matching sales records found for current criteria.
                  </td>
                </tr>
              ) : (
                displayedSales.map((sale) => {
                  const isChecked = selectedIds.has(sale.id);
                  const isMenuOpen = openActionId === sale.id;

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-slate-800/60 transition-colors ${
                        isChecked ? 'bg-sky-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(sale.id)}
                          className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Sales Date */}
                      {columnsVisibility.sales_date && (
                        <td className="p-3 font-medium text-slate-300 whitespace-nowrap">
                          {sale.sales_date}
                        </td>
                      )}

                      {/* Sales Code with tag */}
                      {columnsVisibility.sales_code && (
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono text-sky-300">{sale.sales_code}</span>
                            {sale.tag && (
                              <span className="bg-rose-950/90 border border-rose-800/80 text-rose-300 text-[10px] px-1.5 py-0.2 rounded font-semibold whitespace-nowrap">
                                {sale.tag}
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Sales Status */}
                      {columnsVisibility.sales_status && (
                        <td className="p-3 whitespace-nowrap font-medium text-slate-300">
                          {sale.sales_status}
                        </td>
                      )}

                      {/* Reference No */}
                      {columnsVisibility.reference_no && (
                        <td className="p-3 whitespace-nowrap text-slate-400 font-mono">
                          {sale.reference_no || ''}
                        </td>
                      )}

                      {/* Customer Name */}
                      {columnsVisibility.customer_name && (
                        <td className="p-3 font-medium text-white whitespace-nowrap">
                          {sale.customer_name}
                        </td>
                      )}

                      {/* Total */}
                      {columnsVisibility.total_amount && (
                        <td className="p-3 text-right font-mono font-bold text-white whitespace-nowrap">
                          ₹ {sale.total_amount.toFixed(2)}
                        </td>
                      )}

                      {/* Paid Payment */}
                      {columnsVisibility.paid_amount && (
                        <td className="p-3 text-right font-mono font-medium text-slate-300 whitespace-nowrap">
                          ₹ {sale.paid_amount.toFixed(2)}
                        </td>
                      )}

                      {/* Payment Status Badges matching user image: Paid (green), Partial (orange), Unpaid (red) */}
                      {columnsVisibility.payment_status && (
                        <td className="p-3 whitespace-nowrap">
                          {sale.payment_status === 'Paid' && (
                            <span className="bg-emerald-600/90 text-white font-bold text-[11px] px-2.5 py-0.5 rounded shadow-sm">
                              Paid
                            </span>
                          )}
                          {sale.payment_status === 'Partial' && (
                            <span className="bg-amber-600/90 text-white font-bold text-[11px] px-2.5 py-0.5 rounded shadow-sm">
                              Partial
                            </span>
                          )}
                          {sale.payment_status === 'Unpaid' && (
                            <span className="bg-rose-600/90 text-white font-bold text-[11px] px-2.5 py-0.5 rounded shadow-sm">
                              Unpaid
                            </span>
                          )}
                        </td>
                      )}

                      {/* Created by */}
                      {columnsVisibility.created_by && (
                        <td className="p-3 whitespace-nowrap text-slate-400">
                          {sale.created_by}
                        </td>
                      )}

                      {/* Action Dropdown Button matching screenshot */}
                      {columnsVisibility.action && (
                        <td className="p-3 text-center relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionId(isMenuOpen ? null : sale.id);
                            }}
                            className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded shadow flex items-center justify-center space-x-1 mx-auto cursor-pointer transition-all active:scale-95"
                          >
                            <span>Action</span>
                            <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                          </button>

                          {/* Floating Action Menu */}
                          {isMenuOpen && (
                            <div
                              ref={actionMenuRef}
                              className="absolute right-3 top-10 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 text-left text-xs divide-y divide-slate-800"
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setSelectedSaleForView(sale);
                                    setOpenActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center space-x-2 text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                                  <span>View Sale Details</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedSaleForEdit(sale);
                                    setOpenActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center space-x-2 text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Edit Sales Record</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedSaleForPayment(sale);
                                    setOpenActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center space-x-2 text-slate-200 hover:bg-sky-950/60 hover:text-sky-300 cursor-pointer"
                                >
                                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Record / Settle Payment</span>
                                </button>
                              </div>

                              {/* Quick Status Updates */}
                              <div className="py-1">
                                <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500">
                                  Update Sales Status
                                </div>
                                {(['Final', 'Completed', 'Draft', 'Return Raised'] as SalesStatus[]).map(
                                  (st) => (
                                    <button
                                      key={st}
                                      onClick={() => {
                                        db.updateCRMSale(sale.id, { sales_status: st });
                                        loadSales();
                                        showToast(`Status of ${sale.sales_code} updated to ${st}.`);
                                        setOpenActionId(null);
                                      }}
                                      className={`w-full px-3 py-1 text-[11px] flex items-center justify-between hover:bg-slate-800 cursor-pointer ${
                                        sale.sales_status === st
                                          ? 'text-sky-400 font-bold'
                                          : 'text-slate-300'
                                      }`}
                                    >
                                      <span>Mark as {st}</span>
                                      {sale.sales_status === st && (
                                        <Check className="w-3 h-3 text-sky-400" />
                                      )}
                                    </button>
                                  )
                                )}
                              </div>

                              {/* Print / Invoice */}
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setSelectedSaleForView(sale);
                                    setOpenActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center space-x-2 text-slate-200 hover:bg-slate-800 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Print Tax Invoice</span>
                                </button>

                                <button
                                  onClick={() => {
                                    handleDeleteSale(sale.id, sale.sales_code);
                                    setOpenActionId(null);
                                  }}
                                  className="w-full px-3 py-1.5 flex items-center space-x-2 text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Record</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar matching screenshot */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-bold">{filteredSales.length > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="text-white font-bold">{endIndex}</span> of{' '}
            <span className="text-white font-bold">{filteredSales.length}</span> entries
            {filteredSales.length !== sales.length && (
              <span className="text-slate-500 ml-1 font-mono">
                (filtered from {sales.length} total records)
              </span>
            )}
          </div>

          {/* Pagination Controls: Previous, 1, 2, 3, Next */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPageClamped <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-950 cursor-pointer disabled:cursor-not-allowed font-medium transition-all"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                return (
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPageClamped) <= 1
                );
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-600">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        currentPageClamped === p
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageClamped >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:hover:bg-slate-950 cursor-pointer disabled:cursor-not-allowed font-medium transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. CREATE NEW SALE MODAL */}
      {/* ======================================================= */}
      {showNewSaleModal && (
        <CreateSaleModal
          onClose={() => setShowNewSaleModal(false)}
          onCreated={(newSale) => {
            loadSales();
            setShowNewSaleModal(false);
            showToast(`New sale ${newSale.sales_code} recorded successfully!`);
            if (onRefresh) onRefresh();
          }}
          currentBusiness={currentBusiness}
          currentUser={currentUser}
          currentAdmin={currentAdmin}
          selectedZone={selectedZone}
          selectedCountry={selectedCountry}
          selectedTerritory={selectedTerritory}
        />
      )}

      {/* ======================================================= */}
      {/* 2. VIEW SALE DETAILS / INVOICE MODAL */}
      {/* ======================================================= */}
      {selectedSaleForView && (
        <ViewSaleModal
          sale={selectedSaleForView}
          onClose={() => setSelectedSaleForView(null)}
          onRecordPayment={() => {
            setSelectedSaleForPayment(selectedSaleForView);
            setSelectedSaleForView(null);
          }}
        />
      )}

      {/* ======================================================= */}
      {/* 3. EDIT SALE MODAL */}
      {/* ======================================================= */}
      {selectedSaleForEdit && (
        <EditSaleModal
          sale={selectedSaleForEdit}
          onClose={() => setSelectedSaleForEdit(null)}
          onSaved={(updated) => {
            loadSales();
            setSelectedSaleForEdit(null);
            showToast(`Sales record ${updated.sales_code} updated successfully.`);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* ======================================================= */}
      {/* 4. RECORD PAYMENT MODAL */}
      {/* ======================================================= */}
      {selectedSaleForPayment && (
        <RecordPaymentModal
          sale={selectedSaleForPayment}
          onClose={() => setSelectedSaleForPayment(null)}
          onPaymentRecorded={(updated) => {
            loadSales();
            setSelectedSaleForPayment(null);
            showToast(`Payment recorded for ${updated.sales_code}! Status: ${updated.payment_status}`);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// MODAL 1: CREATE NEW SALE
// -------------------------------------------------------------
interface CreateSaleModalProps {
  onClose: () => void;
  onCreated: (sale: CRMSalesRecord) => void;
  currentBusiness: BusinessProfile | null;
  currentUser: RegularUser | null;
  currentAdmin: AdminUser | null;
  selectedZone?: string;
  selectedCountry?: string;
  selectedTerritory?: string;
}

const CreateSaleModal: React.FC<CreateSaleModalProps> = ({
  onClose,
  onCreated,
  currentBusiness,
  currentUser,
  currentAdmin,
  selectedZone,
  selectedCountry,
  selectedTerritory,
}) => {
  const [salesDate, setSalesDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesCode, setSalesCode] = useState('');
  const [salesStatus, setSalesStatus] = useState<SalesStatus>('Final');
  const [referenceNo, setReferenceNo] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in customer');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(5000);
  const [paidAmount, setPaidAmount] = useState<number>(5000);
  const [paymentStatus, setPaymentStatus] = useState<SalesPaymentStatus>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [createdBy, setCreatedBy] = useState<string>(
    currentAdmin ? 'Admin' : currentBusiness ? 'Business' : 'Sales'
  );
  const [itemDescription, setItemDescription] = useState('Aviation Fuel & Ramp Handling Service');
  const [tag, setTag] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-adjust payment status based on paid vs total
  const handlePaidChange = (newPaid: number) => {
    setPaidAmount(newPaid);
    if (newPaid >= totalAmount && totalAmount > 0) {
      setPaymentStatus('Paid');
    } else if (newPaid > 0) {
      setPaymentStatus('Partial');
    } else {
      setPaymentStatus('Unpaid');
    }
  };

  const handleTotalChange = (newTotal: number) => {
    setTotalAmount(newTotal);
    if (paidAmount >= newTotal && newTotal > 0) {
      setPaymentStatus('Paid');
    } else if (paidAmount > 0) {
      setPaymentStatus('Partial');
    } else {
      setPaymentStatus('Unpaid');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter a customer name.');
      return;
    }

    const created = db.createCRMSale({
      sales_date: salesDate,
      sales_code: salesCode.trim() || undefined,
      sales_status: salesStatus,
      reference_no: referenceNo.trim() || undefined,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim() || undefined,
      customer_phone: customerPhone.trim() || undefined,
      total_amount: Number(totalAmount) || 0,
      paid_amount: Number(paidAmount) || 0,
      payment_status: paymentStatus,
      payment_method: paymentMethod as any,
      created_by: createdBy,
      tag: tag.trim() || undefined,
      notes: notes.trim() || undefined,
      items: [
        {
          description: itemDescription || 'Aviation Service Charge',
          quantity: 1,
          unit_price: Number(totalAmount) || 0,
          total: Number(totalAmount) || 0,
        },
      ],
      business_id: currentBusiness?.business_id || 'a1b2c3d4-5566-7788-9900-aabbccddeeff',
      business_name: currentBusiness?.organization_name || 'JetVentures VIP SkySuite & Private Charters',
      zone: selectedZone !== 'All Zones' ? selectedZone : 'West Zone',
      country: selectedCountry !== 'All Countries' ? selectedCountry : 'IN',
      territory: selectedTerritory !== 'All Hubs' ? selectedTerritory : 'BOM (Mumbai)',
    });

    onCreated(created);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-sky-400" />
              <span>Record New Sale Transaction</span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct entry for walk-in client or corporate aviation booking.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Sales Date *
              </label>
              <input
                type="date"
                required
                value={salesDate}
                onChange={(e) => setSalesDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Sales Code (Leave empty for auto e.g. SL0031)
              </label>
              <input
                type="text"
                placeholder="Auto-generated if blank"
                value={salesCode}
                onChange={(e) => setSalesCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Walk-in customer, Capt. Miller"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Reference No. (PO / Invoice Ref)
              </label>
              <input
                type="text"
                placeholder="e.g. 111, REF-890"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Customer Email (Optional)
              </label>
              <input
                type="email"
                placeholder="client@aviator.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Customer Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 98000 00000"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Total Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={totalAmount}
                onChange={(e) => handleTotalChange(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Paid Payment (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={paidAmount}
                onChange={(e) => handlePaidChange(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as SalesPaymentStatus)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer font-bold"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Sales Status
              </label>
              <select
                value={salesStatus}
                onChange={(e) => setSalesStatus(e.target.value as SalesStatus)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Final">Final</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
                <option value="Quotation">Quotation</option>
                <option value="Return Raised">Return Raised</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Corporate Wallet">Corporate Wallet</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Created By
              </label>
              <select
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Sales">Sales</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Service / Item Description
            </label>
            <input
              type="text"
              placeholder="e.g. Ramp navigation, VIP jet card, fuel dispatch"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Tag / Badge (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Return Raised, Dispatched"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Internal Remarks / Notes
              </label>
              <input
                type="text"
                placeholder="Internal flight OPS or billing notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg cursor-pointer"
            >
              Save Sales Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MODAL 2: VIEW SALE DETAILS / INVOICE RECEIPT
// -------------------------------------------------------------
interface ViewSaleModalProps {
  sale: CRMSalesRecord;
  onClose: () => void;
  onRecordPayment: () => void;
}

const ViewSaleModal: React.FC<ViewSaleModalProps> = ({ sale, onClose, onRecordPayment }) => {
  const balanceDue = Math.max(0, sale.total_amount - sale.paid_amount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
              Sales Tax Receipt &amp; Invoice
            </div>
            <h3 className="text-base font-black text-white flex items-center space-x-2 mt-0.5">
              <span>{sale.sales_code}</span>
              {sale.tag && (
                <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded font-bold">
                  {sale.tag}
                </span>
              )}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Invoice</div>
              <div className="text-base font-black text-white mt-1">₹ {sale.total_amount.toFixed(2)}</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] font-mono text-emerald-400 uppercase">Paid Amount</div>
              <div className="text-base font-black text-emerald-400 mt-1">₹ {sale.paid_amount.toFixed(2)}</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] font-mono text-rose-400 uppercase">Balance Due</div>
              <div className="text-base font-black text-rose-400 mt-1">₹ {balanceDue.toFixed(2)}</div>
            </div>
          </div>

          {/* Key Properties Grid */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[11px] block">Customer Name:</span>
                <span className="text-white font-bold text-xs">{sale.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Sales Date:</span>
                <span className="text-white font-mono text-xs">{sale.sales_date}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 text-[11px] block">Payment Status:</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                    sale.payment_status === 'Paid'
                      ? 'bg-emerald-600 text-white'
                      : sale.payment_status === 'Partial'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {sale.payment_status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Sales Status:</span>
                <span className="text-white font-semibold text-xs">{sale.sales_status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 text-[11px] block">Reference No:</span>
                <span className="text-slate-200 font-mono text-xs">{sale.reference_no || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Created by:</span>
                <span className="text-slate-200 font-medium text-xs">{sale.created_by}</span>
              </div>
            </div>

            {sale.payment_method && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Payment Method:</span>
                <span className="text-sky-300 font-medium text-xs">{sale.payment_method}</span>
              </div>
            )}
          </div>

          {/* Line items */}
          <div>
            <h4 className="text-xs font-bold text-white mb-2">Itemized Services</h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-800/60 text-slate-300">
                  <tr>
                    <th className="p-2.5 text-left">Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {(sale.items && sale.items.length > 0
                    ? sale.items
                    : [{ description: 'Aviation Service Order', quantity: 1, unit_price: sale.total_amount, total: sale.total_amount }]
                  ).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5">{it.description}</td>
                      <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                      <td className="p-2.5 text-right font-mono">₹ {it.unit_price.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-bold">₹ {it.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {sale.notes && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-[11px]">
              <span className="font-bold text-slate-300 block mb-0.5">Notes &amp; Ledger Audit:</span>
              <span>{sale.notes}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <div className="flex items-center space-x-2">
              {balanceDue > 0 && (
                <button
                  type="button"
                  onClick={onRecordPayment}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Receive ₹ {balanceDue.toFixed(2)}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MODAL 3: EDIT SALE
// -------------------------------------------------------------
interface EditSaleModalProps {
  sale: CRMSalesRecord;
  onClose: () => void;
  onSaved: (sale: CRMSalesRecord) => void;
}

const EditSaleModal: React.FC<EditSaleModalProps> = ({ sale, onClose, onSaved }) => {
  const [salesDate, setSalesDate] = useState(sale.sales_date);
  const [salesStatus, setSalesStatus] = useState<SalesStatus>(sale.sales_status);
  const [referenceNo, setReferenceNo] = useState(sale.reference_no || '');
  const [customerName, setCustomerName] = useState(sale.customer_name);
  const [customerEmail, setCustomerEmail] = useState(sale.customer_email || '');
  const [customerPhone, setCustomerPhone] = useState(sale.customer_phone || '');
  const [totalAmount, setTotalAmount] = useState<number>(sale.total_amount);
  const [paidAmount, setPaidAmount] = useState<number>(sale.paid_amount);
  const [paymentStatus, setPaymentStatus] = useState<SalesPaymentStatus>(sale.payment_status);
  const [tag, setTag] = useState(sale.tag || '');
  const [notes, setNotes] = useState(sale.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateCRMSale(sale.id, {
      sales_date: salesDate,
      sales_status: salesStatus,
      reference_no: referenceNo.trim() || undefined,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim() || undefined,
      customer_phone: customerPhone.trim() || undefined,
      total_amount: Number(totalAmount) || 0,
      paid_amount: Number(paidAmount) || 0,
      payment_status: paymentStatus,
      tag: tag.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    if (updated) onSaved(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Edit className="w-5 h-5 text-sky-400" />
              <span>Edit Sales Record ({sale.sales_code})</span>
            </h3>
            <p className="text-xs text-slate-400">Modify transaction particulars and status.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Sales Date
              </label>
              <input
                type="text"
                required
                value={salesDate}
                onChange={(e) => setSalesDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Reference No.
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Sales Status
              </label>
              <select
                value={salesStatus}
                onChange={(e) => setSalesStatus(e.target.value as SalesStatus)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Final">Final</option>
                <option value="Completed">Completed</option>
                <option value="Draft">Draft</option>
                <option value="Quotation">Quotation</option>
                <option value="Return Raised">Return Raised</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Total Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Paid Payment (₹)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-emerald-400 rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as SalesPaymentStatus)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer font-bold"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Tag / Badge
              </label>
              <input
                type="text"
                placeholder="e.g. Return Raised"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Remarks &amp; Audit Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MODAL 4: RECORD / SETTLE PAYMENT
// -------------------------------------------------------------
interface RecordPaymentModalProps {
  sale: CRMSalesRecord;
  onClose: () => void;
  onPaymentRecorded: (sale: CRMSalesRecord) => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  sale,
  onClose,
  onPaymentRecorded,
}) => {
  const remainingDue = Math.max(0, sale.total_amount - sale.paid_amount);
  const [amount, setAmount] = useState<number>(remainingDue > 0 ? remainingDue : 1000);
  const [method, setMethod] = useState<string>('Bank Transfer');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const res = db.recordSalePayment(sale.id, amount, method, notes);
    if (res.success && res.sale) {
      onPaymentRecorded(res.sale);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Record Payment for {sale.sales_code}</span>
            </h3>
            <p className="text-xs text-slate-400">{sale.customer_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex justify-between items-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Due</span>
              <span className="text-sm font-black text-white">₹ {sale.total_amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 block">Already Paid</span>
              <span className="text-sm font-black text-emerald-400">₹ {sale.paid_amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-rose-400 block">Outstanding</span>
              <span className="text-sm font-black text-rose-400">₹ {remainingDue.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Payment Amount to Credit (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-emerald-400 text-base font-mono font-bold rounded-xl px-3 py-2.5 outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Payment Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
              <option value="Credit Card">Credit Card / POS Terminal</option>
              <option value="Corporate Wallet">Corporate Wallet Deduction</option>
              <option value="Cash">Cash at Operations Desk</option>
              <option value="UPI">UPI Instant Pay</option>
              <option value="Cheque">Corporate Bank Cheque</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
              Transaction Reference / Cheque No.
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-9988221, TXN_98124"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow cursor-pointer"
            >
              Confirm Payment Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

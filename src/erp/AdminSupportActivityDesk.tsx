import React, { useState, useEffect } from 'react';
import {
  Headphones,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  UserCheck,
  X,
  Clock,
  MessageSquare,
  Mail,
  PhoneCall,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import {
  CustomerCareTicket,
  SupportTicketZone,
  CustomerCareChannel,
  AdminUser,
} from '../types';
import { maskPII } from '../shared/ConnectWithCustomerCareModal';

interface AdminSupportActivityDeskProps {
  activeAdminUser?: AdminUser | null;
  onDataUpdated?: () => void;
}

export const AdminSupportActivityDesk: React.FC<AdminSupportActivityDeskProps> = ({
  activeAdminUser,
  onDataUpdated,
}) => {
  // Representative Authentication State (Default to current admin if email ends with @truvaer.com)
  const initialAdminEmail = activeAdminUser?.email?.toLowerCase().endsWith('@truvaer.com')
    ? activeAdminUser.email
    : 'sarah.jenkins@truvaer.com';
  const initialAdminName = activeAdminUser?.name || 'Sarah Jenkins';

  const [repLoggedIn, setRepLoggedIn] = useState(true);
  const [repName, setRepName] = useState(initialAdminName);
  const [repEmail, setRepEmail] = useState(initialAdminEmail);
  const [repAuthError, setRepAuthError] = useState<string | null>(null);

  // Tickets List & Filtering
  const [allTickets, setAllTickets] = useState<CustomerCareTicket[]>([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [ticketChannelFilter, setTicketChannelFilter] = useState<'ALL' | CustomerCareChannel>('ALL');
  const [ticketZoneFilter, setTicketZoneFilter] = useState<'ALL' | SupportTicketZone>('ALL');

  // Selected Ticket for Response
  const [selectedTicket, setSelectedTicket] = useState<CustomerCareTicket | null>(null);
  const [repResponseText, setRepResponseText] = useState('');
  const [repResponseStatus, setRepResponseStatus] = useState<'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');
  const [repSubmitError, setRepSubmitError] = useState<string | null>(null);
  const [repSubmitSuccess, setRepSubmitSuccess] = useState<string | null>(null);

  const refreshTickets = () => {
    const list = db.getCustomerCareTickets();
    setAllTickets([...list]);
    if (selectedTicket) {
      const updated = list.find((t) => t.ticket_id === selectedTicket.ticket_id);
      if (updated) setSelectedTicket(updated);
    }
  };

  useEffect(() => {
    refreshTickets();
  }, []);

  // Strict Login Validation for Customer Care Rep
  const handleRepLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRepAuthError(null);
    const trimmed = repEmail.trim().toLowerCase();

    // STRICT DOMAIN ENFORCEMENT
    if (!trimmed.endsWith('@truvaer.com') && !trimmed.endsWith('.truvaer.com')) {
      setRepAuthError(
        'Access Denied: Customer care representatives must authenticate with an official @truvaer.com email address. Other domains are not permitted.'
      );
      return;
    }

    if (!repName.trim()) {
      setRepAuthError('Please enter representative name.');
      return;
    }

    setRepLoggedIn(true);
  };

  // Submit Official Response
  const handleRepSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    setRepSubmitError(null);
    setRepSubmitSuccess(null);

    if (!selectedTicket) return;
    if (!repResponseText.trim()) {
      setRepSubmitError('Please enter a response message.');
      return;
    }

    const trimmed = repEmail.trim().toLowerCase();
    if (!trimmed.endsWith('@truvaer.com') && !trimmed.endsWith('.truvaer.com')) {
      setRepSubmitError('Security Policy Violation: Agent email must end with @truvaer.com.');
      return;
    }

    const res = db.respondToCustomerCareTicket({
      ticketId: selectedTicket.ticket_id,
      message: repResponseText.trim(),
      agentEmail: trimmed,
      agentName: repName.trim(),
      newStatus: repResponseStatus,
    });

    if (res.success && res.ticket) {
      setRepSubmitSuccess(`Response sent successfully from verified staff address ${trimmed}!`);
      setRepResponseText('');
      setSelectedTicket(res.ticket);
      refreshTickets();
      if (onDataUpdated) onDataUpdated();
    } else {
      setRepSubmitError(res.message || 'Failed to submit response.');
    }
  };

  // Filtered Tickets
  const filteredTickets = allTickets.filter((t) => {
    if (ticketStatusFilter !== 'ALL' && t.status !== ticketStatusFilter) return false;
    if (ticketChannelFilter !== 'ALL' && t.channel !== ticketChannelFilter) return false;
    if (ticketZoneFilter !== 'ALL' && t.zone !== ticketZoneFilter) return false;
    if (ticketSearch.trim()) {
      const q = ticketSearch.toLowerCase();
      const matchId = t.ticket_id.toLowerCase().includes(q);
      const matchSubj = t.subject.toLowerCase().includes(q);
      const matchMsg = t.message.toLowerCase().includes(q);
      const matchCust = (t.customer_name || '').toLowerCase().includes(q);
      return matchId || matchSubj || matchMsg || matchCust;
    }
    return true;
  });

  const openTickets = allTickets.filter((t) => t.status === 'OPEN').length;
  const inProgressTickets = allTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = allTickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-5 font-sans">
      {/* Top Banner & Standard Ticket Protocol Header */}
      <div className="p-5 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold shadow-lg shadow-purple-500/10">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Customer Care Representative Desk &bull; Activity Log
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-200 border border-purple-500/40">
                ADMIN END ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard Ticket Protocol: <span className="font-mono text-purple-300 font-semibold">[Zone]/[YY]-[Series][Number]</span> (e.g. <span className="font-mono text-emerald-400">APAC/26-AA0001</span>, <span className="font-mono text-sky-400">EMEA/26-AA0001</span>) &bull; Series advances from <span className="font-mono text-slate-300">AA0001..AA9999</span> to <span className="font-mono text-slate-300">AB0001..AB9999</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right text-[11px] font-mono hidden sm:block">
            <div className="text-slate-400">Authorized Domain Gate:</div>
            <div className="text-emerald-400 font-bold flex items-center justify-end space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>@truvaer.com Staff Only</span>
            </div>
          </div>
          <button
            type="button"
            onClick={refreshTickets}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white cursor-pointer transition-colors shadow"
            title="Refresh Inquiries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">Total Inbound Tickets</div>
          <div className="text-xl font-bold font-mono text-white mt-0.5">{allTickets.length}</div>
        </div>
        <div className="bg-slate-900 border border-amber-500/30 p-3.5 rounded-2xl">
          <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">Open Inquiries (Action Required)</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">{openTickets}</div>
        </div>
        <div className="bg-slate-900 border border-sky-500/30 p-3.5 rounded-2xl">
          <div className="text-[10px] font-mono text-sky-400 uppercase font-bold">In Progress &bull; Staff Assigned</div>
          <div className="text-xl font-bold font-mono text-sky-300 mt-0.5">{inProgressTickets}</div>
        </div>
        <div className="bg-slate-900 border border-emerald-500/30 p-3.5 rounded-2xl">
          <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Resolved &bull; Archived</div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">{resolvedTickets}</div>
        </div>
      </div>

      {/* Representative Login / Active Session Status */}
      {!repLoggedIn ? (
        <div className="p-4 bg-slate-950 border border-purple-500/40 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold text-xs sm:text-sm">
            <LogIn className="w-4 h-4 text-purple-400" />
            <span>Authenticate as Customer Care Representative</span>
          </div>

          {repAuthError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{repAuthError}</span>
            </div>
          )}

          <form onSubmit={handleRepLogin} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Agent Full Name</label>
              <input
                type="text"
                required
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Official Staff Email <span className="text-purple-400">(*@truvaer.com only)</span>
              </label>
              <input
                type="email"
                required
                value={repEmail}
                onChange={(e) => setRepEmail(e.target.value)}
                placeholder="agent@truvaer.com"
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer transition-all"
              >
                Authenticate Agent
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">
              Logged in Representative:{' '}
              <strong className="text-white">{repName}</strong> (
              <span className="font-mono text-emerald-300 font-bold">{repEmail}</span>)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRepLoggedIn(false)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] font-semibold cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Switch Agent Credentials</span>
          </button>
        </div>
      )}

      {/* Activity Log Filter Suite */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
            placeholder="Search Activity Log: Standard ticket ID (e.g. APAC/26-AA0001), customer, subject..."
            className="w-full bg-slate-950 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-purple-500 font-sans"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zone Filter (APAC, EMEA, NA, LATAM, ANZ) */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400 font-semibold">Zone:</span>
            <select
              value={ticketZoneFilter}
              onChange={(e) => setTicketZoneFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-750 text-white rounded-xl px-2.5 py-1.5 text-xs outline-none font-mono"
            >
              <option value="ALL">All Zones</option>
              <option value="APAC">APAC (Asia-Pacific)</option>
              <option value="EMEA">EMEA (Europe &amp; ME)</option>
              <option value="NA">NA (North America)</option>
              <option value="LATAM">LATAM (Latin America)</option>
              <option value="ANZ">ANZ (Australia / NZ)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400 font-semibold">Status:</span>
            <select
              value={ticketStatusFilter}
              onChange={(e) => setTicketStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-750 text-white rounded-xl px-2.5 py-1.5 text-xs outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400 font-semibold">Channel:</span>
            <select
              value={ticketChannelFilter}
              onChange={(e) => setTicketChannelFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-750 text-white rounded-xl px-2.5 py-1.5 text-xs outline-none"
            >
              <option value="ALL">All Channels</option>
              <option value="LIVE_CHAT">Live Chat</option>
              <option value="EMAIL_SUPPORT">Email Ticket</option>
              <option value="PHONE_CALLBACK">Phone Callback</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                <th className="py-3 px-3.5">Standard Ticket ID</th>
                <th className="py-3 px-3.5">Zone</th>
                <th className="py-3 px-3.5">Customer / Organization</th>
                <th className="py-3 px-3.5">Contact (Masked PII)</th>
                <th className="py-3 px-3.5">Inquiry &amp; Latest Message</th>
                <th className="py-3 px-3.5">Channel / Priority</th>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                    No customer care inquiries match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.ticket_id === t.ticket_id;
                  return (
                    <tr
                      key={t.ticket_id}
                      className={`transition-colors hover:bg-slate-900/60 ${
                        isSelected ? 'bg-purple-950/30' : ''
                      }`}
                    >
                      {/* Standard Protocol Ticket ID: Zone/YY-AA0001 */}
                      <td className="py-3 px-3.5 font-mono font-bold text-purple-300 whitespace-nowrap">
                        {t.ticket_id}
                      </td>

                      {/* Zone Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-sky-300 border border-slate-700">
                          {t.zone || 'APAC'}
                        </span>
                      </td>

                      {/* Customer / Org */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-white">
                          {t.customer_name || 'Anonymous Aviator'}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t.context.userType === 'BUSINESS' ? 'B2B Operator' : 'Standard User'}
                        </span>
                      </td>

                      {/* Masked Contact PII */}
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        <span title="Strict anti-circumvention protection active">
                          {maskPII(t.customer_email || t.customer_phone || t.callback_phone)}
                        </span>
                      </td>

                      {/* Inquiry Subject & Snippet */}
                      <td className="py-3 px-3.5 max-w-xs truncate">
                        <div className="font-semibold text-slate-200 truncate">{t.subject}</div>
                        <p className="text-[11px] text-slate-400 truncate">{t.message}</p>
                      </td>

                      {/* Channel & Priority */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {t.channel}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              t.priority === 'URGENT'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : t.priority === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[10px] text-slate-400">
                        {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                            t.status === 'OPEN'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(t)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white'
                          }`}
                        >
                          View &amp; Respond
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Conversation & Response Panel */}
      {selectedTicket && (
        <div className="p-5 bg-slate-950 border border-purple-500/40 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base">
                  Ticket #{selectedTicket.ticket_id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-200 border border-purple-500/30">
                  Zone: {selectedTicket.zone || 'APAC'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedTicket.channel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customer: <strong className="text-white">{selectedTicket.customer_name || 'Anonymous'}</strong> &bull; Protected Contact: {maskPII(selectedTicket.customer_email || selectedTicket.customer_phone)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Original Inbound Message */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
              <span>Customer Inbound Message:</span>
              <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs">
              {selectedTicket.message}
            </p>
          </div>

          {/* Conversation History */}
          {selectedTicket.responses && selectedTicket.responses.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Conversation History &bull; Official Staff Responses:
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {selectedTicket.responses.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-purple-300">{r.senderName}</span>
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                          {r.senderEmail}
                        </span>
                      </div>
                      <span className="text-slate-500">{new Date(r.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{r.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Form */}
          <form onSubmit={handleRepSubmitResponse} className="space-y-3 pt-2">
            {repSubmitError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{repSubmitError}</span>
              </div>
            )}

            {repSubmitSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{repSubmitSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Compose Official Response to Customer:
              </label>
              <textarea
                rows={3}
                required
                value={repResponseText}
                onChange={(e) => setRepResponseText(e.target.value)}
                placeholder={`Type response from verified @truvaer.com representative address (${repEmail})...`}
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-purple-500 font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Update Ticket Status:</span>
                <select
                  value={repResponseStatus}
                  onChange={(e) => setRepResponseStatus(e.target.value as any)}
                  className="bg-slate-900 border border-slate-750 text-white rounded-xl px-2.5 py-1 text-xs outline-none font-medium"
                >
                  <option value="IN_PROGRESS">Keep In Progress</option>
                  <option value="RESOLVED">Mark as Resolved</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!repResponseText.trim() || !repLoggedIn}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer transition-all shadow-md shadow-purple-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Response as {repName} ({repEmail})</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

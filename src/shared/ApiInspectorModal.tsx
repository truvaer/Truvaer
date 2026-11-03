import React, { useState } from 'react';
import {
  FileCode,
  X,
  Copy,
  Check,
  Server,
  ArrowRight,
  Database,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { ApiLogEntry } from '../types';
import { db } from '../data/mockDatabase';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ApiLogEntry[];
  onClearLogs: () => void;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'specs' | 'transitions'>('logs');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Truvaer TRD API & State Inspector
              </h3>
              <p className="text-xs text-slate-400">
                Live Endpoints, Payloads & System State Transitions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'logs' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Traffic ({logs.length})
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'specs' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                TRD Specs
              </button>
              <button
                onClick={() => setActiveTab('transitions')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'transitions' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                State Machine
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: Live Traffic Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Real-time network handshake telemetry for registration and verification:
                </span>
                {logs.length > 0 && (
                  <button
                    onClick={onClearLogs}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No API calls captured yet in this session. Perform a registration, login, or verification action to inspect live payloads.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl bg-slate-850 border border-slate-750 p-4 space-y-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-750">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.method === 'POST' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {log.method}
                        </span>
                        <span className="text-white font-bold">{log.endpoint}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {log.statusCode}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Request Payload:</span>
                          <button
                            onClick={() => handleCopy(JSON.stringify(log.requestPayload, null, 2), `req_${log.id}`)}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedId === `req_${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-40">
                          {JSON.stringify(log.requestPayload, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Response Data:</span>
                          <button
                            onClick={() => handleCopy(JSON.stringify(log.responsePayload, null, 2), `res_${log.id}`)}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedId === `res_${log.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <pre className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-40">
                          {JSON.stringify(log.responsePayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: TRD Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-6 font-mono text-xs">
              {/* Section 5.1 */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">5.1 Endpoint: Regular User Registration</span>
                  <span className="text-blue-400">POST /api/v1/auth/register/regular</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300">
                  <div className="text-slate-500 mb-1">// Request Payload</div>
                  {`{
  "username": "aviation_pro99",
  "email": "user@domain.com",
  "password": "SecurePassword#2026",
  "date_of_birth": "1998-05-14",
  "country_code": "IN",
  "phone_number": "+919876543210"
}`}
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-emerald-300">
                  <div className="text-slate-500 mb-1">// Success Response (201 Created)</div>
                  {`{
  "success": true,
  "message": "User registered successfully. Verification required.",
  "data": {
    "user_id": "c4a7b180-8d3e-4f32-9b12-987123abcdef",
    "username": "aviation_pro99",
    "email": "user@domain.com",
    "status": "PENDING_VERIFICATION",
    "verification_type": "EMAIL_OTP",
    "otp_expires_in_seconds": 900
  }
}`}
                </div>
              </div>

              {/* Section 5.2 */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">5.2 Endpoint: Business User Registration</span>
                  <span className="text-indigo-400">POST /api/v1/auth/register/business</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300">
                  <div className="text-slate-500 mb-1">// Request Form-Data (Multipart/form-data)</div>
                  {`organization_name: AeroGlobal Logistics Pvt Ltd
owner_name: Director name
reg_number_type: TAN
registration_number: ABCD12345F
country: IN
business_email: corporate@domain.com
bank_account_holder: AeroGlobal Logistics Pvt Ltd
bank_account_number: xxxxxxxxxxx11
bank_ifsc_swift: xxxxxxxx123
bank_name: xxxxx Bank
inc_cert_doc: [BINARY_FILE_BLOB_PDF_MAX_10MB]`}
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-emerald-300">
                  <div className="text-slate-500 mb-1">// Success Response (202 Accepted)</div>
                  {`{
  "success": true,
  "message": "Business profile submitted for review. Account is currently locked.",
  "data": {
    "business_id": "f8d1c2b3-001a-42bc-8111-eeef98765432",
    "organization_name": "AeroGlobal Logistics Pvt Ltd",
    "verification_status": "HARD_LOCKED",
    "estimated_review_hours": 72
  }
}`}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Account State Transition Table (Section 6) */}
          {activeTab === 'transitions' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                TRD Section 6: Official Account State Transition Matrix:
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-750">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-850 text-slate-300 border-b border-slate-750">
                    <tr>
                      <th className="p-3">Initial State</th>
                      <th className="p-3">Trigger Event</th>
                      <th className="p-3">Target State</th>
                      <th className="p-3">Permitted Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900 text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">NONE</td>
                      <td className="p-3 text-blue-400">Register Regular</td>
                      <td className="p-3 text-amber-400 font-bold">PENDING_VERIF</td>
                      <td className="p-3">Verify Email OTP</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-amber-400">PENDING_VERIF</td>
                      <td className="p-3 text-blue-400">Verify Email OTP</td>
                      <td className="p-3 text-emerald-400 font-bold">ACTIVE</td>
                      <td className="p-3 text-emerald-300">Full Normal Access</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-400">NONE</td>
                      <td className="p-3 text-indigo-400">Register Business</td>
                      <td className="p-3 text-rose-400 font-bold">HARD_LOCKED</td>
                      <td className="p-3">View Status Page</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-rose-400">HARD_LOCKED</td>
                      <td className="p-3 text-emerald-400">Admin Approve</td>
                      <td className="p-3 text-emerald-400 font-bold">VERIFIED</td>
                      <td className="p-3 text-emerald-300">Full Corp Access</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-rose-400">HARD_LOCKED</td>
                      <td className="p-3 text-rose-400">Admin Reject</td>
                      <td className="p-3 text-red-400 font-bold">REJECTED</td>
                      <td className="p-3">Resubmit Docs</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-emerald-400">VERIFIED / ACTIVE</td>
                      <td className="p-3 text-rose-400">Compliance Breach</td>
                      <td className="p-3 text-red-500 font-bold">SUSPENDED</td>
                      <td className="p-3 text-slate-500">Read-Only / None</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

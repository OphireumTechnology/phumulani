/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.11 Advanced Reporting & Controlled Exports Tab
 */

import React, { useState } from 'react';
import { Download, FileText, ShieldAlert, CheckCircle2, FileSpreadsheet, Lock } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { ReportExportDomain, ExportAuditLog } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const AdvancedReportingExportsTab: React.FC<Props> = ({ currentUser }) => {
  const [selectedDomain, setSelectedDomain] = useState<ReportExportDomain>('COMMUNITY_OPERATIONS');
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'PRINT_HTML'>('CSV');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<ExportAuditLog[]>(phase34Service.getExportAudits());

  const handleExport = () => {
    try {
      const result = phase34Service.executeAuthorizedDataExport(
        selectedDomain,
        selectedFormat,
        currentUser.role,
        currentUser.id
      );

      // Trigger browser download safely
      const blob = new Blob([result.exportData], { type: selectedFormat === 'CSV' ? 'text/csv' : 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);

      setExportNotice(`Export generated: ${result.filename} (VAWA Safeguarding Redactions Applied).`);
      setAuditLogs([...phase34Service.getExportAudits()]);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const domainOptions: { label: string; value: ReportExportDomain }[] = [
    { label: 'Community Operations Aggregate', value: 'COMMUNITY_OPERATIONS' },
    { label: 'Program Impact Metrics', value: 'PROGRAM_METRICS' },
    { label: 'Volunteer Roster (Non-Confidential)', value: 'VOLUNTEER_ROSTER' },
    { label: 'Event Attendance Log', value: 'EVENT_ATTENDANCE' },
    { label: 'Fundraising Settled Summary', value: 'FUNDRAISING_SETTLED_SUMMARY' },
    { label: 'Grant Pipeline Performance', value: 'GRANT_PIPELINE' },
    { label: 'Workflow SLA Telemetry', value: 'WORKFLOW_SLA_PERFORMANCE' },
    { label: 'AI Workforce Quality Telemetry', value: 'AI_WORKFORCE_TELEMETRY' },
    { label: 'Board Governance Audit', value: 'BOARD_GOVERNANCE_AUDIT' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              M34.11
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Advanced Reporting & Controlled Exports
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Server-authorized export generation with automated VAWA survivor record redaction and tamper-evident audit logging.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700">
          <Lock className="w-4 h-4 text-teal-700" />
          <span>Role Gate: {currentUser.role}</span>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
          {exportNotice}
        </div>
      )}

      {/* Export Control Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Generate Controlled Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Report Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as ReportExportDomain)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-800"
            >
              {domainOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Export Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-800"
            >
              <option value="CSV">Comma Separated Values (.csv)</option>
              <option value="PRINT_HTML">Printable Certified HTML (.html)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Authorized Report</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <span>
            <strong>Safeguarding Guarantee:</strong> Restricted confidential fields (survivor names, shelter addresses, crisis transcripts) are automatically stripped at the server layer prior to file serialization.
          </span>
        </div>
      </div>

      {/* Export Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-slate-900">Immutable Export Audit Ledger</h3>
          <span className="text-xs text-slate-500">Every download logged</span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between text-xs text-slate-700">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-teal-800">{log.id}</span>
                  <span className="font-bold text-slate-900">{log.domain}</span>
                  <span className="bg-slate-100 px-1.5 py-0.2 rounded font-mono">{log.format}</span>
                </div>
                <div className="text-slate-500">
                  User: {log.userId} ({log.userRole}) • {log.timestamp}
                </div>
              </div>

              <div className="text-right">
                <span className="text-emerald-700 font-bold block">Authorized</span>
                <span className="text-[10px] text-slate-400">{log.safeguardingFieldsRedactedCount} fields redacted</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

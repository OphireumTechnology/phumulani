/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 26 Funder Reporting & Compliance (M26.15)
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  ShieldCheck,
  Send,
  Award,
} from 'lucide-react';
import { FundingCommandService } from '../../../services/fundingCommandService';
import { FunderReportRecord } from '../../../types/fundingCommand';

interface FunderReportingTabProps {
  currentUser: any;
}

export const FunderReportingTab: React.FC<FunderReportingTabProps> = ({ currentUser }) => {
  const fundingService = FundingCommandService.getInstance();
  const [reports, setReports] = useState<FunderReportRecord[]>(fundingService.getFunderReports());
  const [selectedReport, setSelectedReport] = useState<FunderReportRecord | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCertifyReport = (reportId: string) => {
    try {
      const certified = fundingService.certifyFunderReport(reportId, currentUser);
      setNotice({ type: 'success', message: `Report ${reportId} officially certified by Executive Director (${certified.executiveCertifierId}).` });
      setReports(fundingService.getFunderReports());
    } catch (err: any) {
      setNotice({ type: 'error', message: err.message || 'Certification blocked.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
              M26.15 Funder Compliance
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
              Impact Verification
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Institutional Funder Reporting & Compliance Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliverables tracker, milestone certifications, and authentic program impact citations grounded in verified Phase 25 data.
          </p>
        </div>

        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
          Active Reports: <strong>{reports.length}</strong>
        </span>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {rep.id}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {rep.reportType}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      rep.status === 'EXECUTIVE_CERTIFIED'
                        ? 'text-emerald-800 bg-emerald-100'
                        : 'text-amber-800 bg-amber-100'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  {rep.opportunityTitle}
                </h3>
                <p className="text-xs text-teal-800 font-medium flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {rep.funderName} • Due: <strong>{rep.dueDate}</strong>
                </p>
              </div>

              {rep.status !== 'EXECUTIVE_CERTIFIED' ? (
                <button
                  onClick={() => handleCertifyReport(rep.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Executive Director Certification
                </button>
              ) : (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 shrink-0">
                  Certified by: <strong>{rep.executiveCertifierId}</strong>
                </div>
              )}
            </div>

            {/* Deliverables Checklist */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Compliance Deliverables Checklist
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {rep.deliverablesChecklist.map((deliv, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {deliv.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={deliv.completed ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                      {deliv.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actual Verified Program Impact Cited */}
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Award className="w-4 h-4 text-blue-700" />
                Verified Program Impact Citation ({rep.actualProgramImpactCited.programId}):
              </div>
              <p className="text-slate-700">
                {rep.actualProgramImpactCited.metricsCited}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

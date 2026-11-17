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
      <div className="bg-white border border-phumulani-cream rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded uppercase">
              M26.15 Funder Compliance
            </span>
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-charcoal px-2 py-0.5 rounded uppercase">
              Impact Verification
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-phumulani-charcoal tracking-tight">
            Institutional Funder Reporting & Compliance Calendar
          </h2>
          <p className="text-xs text-phumulani-charcoal mt-0.5">
            Deliverables tracker, milestone certifications, and authentic program impact citations grounded in verified Phase 25 data.
          </p>
        </div>

        <span className="text-xs font-mono bg-phumulani-cream text-phumulani-charcoal px-3 py-1.5 rounded-lg border border-phumulani-cream">
          Active Reports: <strong>{reports.length}</strong>
        </span>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between ${
            notice.type === 'success'
              ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
              : 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-phumulani-earth shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-phumulani-charcoal hover:text-phumulani-earth">✕</button>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white border border-phumulani-cream rounded-xl p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] font-bold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                    {rep.id}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                    {rep.reportType}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      rep.status === 'EXECUTIVE_CERTIFIED'
                        ? 'text-phumulani-charcoal bg-phumulani-cream'
                        : 'text-phumulani-charcoal bg-phumulani-cream'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
                <h3 className="text-base font-serif font-bold text-phumulani-charcoal">
                  {rep.opportunityTitle}
                </h3>
                <p className="text-xs text-phumulani-earth font-medium flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {rep.funderName} • Due: <strong>{rep.dueDate}</strong>
                </p>
              </div>

              {rep.status !== 'EXECUTIVE_CERTIFIED' ? (
                <button
                  onClick={() => handleCertifyReport(rep.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Executive Director Certification
                </button>
              ) : (
                <div className="p-2 bg-phumulani-cream border border-phumulani-green rounded-lg text-xs text-phumulani-charcoal shrink-0">
                  Certified by: <strong>{rep.executiveCertifierId}</strong>
                </div>
              )}
            </div>

            {/* Deliverables Checklist */}
            <div className="p-4 bg-phumulani-cream rounded-lg space-y-2 border border-phumulani-cream">
              <h4 className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider">
                Compliance Deliverables Checklist
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {rep.deliverablesChecklist.map((deliv, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {deliv.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-phumulani-charcoal shrink-0" />
                    )}
                    <span className={deliv.completed ? 'text-phumulani-charcoal font-medium' : 'text-phumulani-charcoal'}>
                      {deliv.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actual Verified Program Impact Cited */}
            <div className="p-3.5 bg-phumulani-cream border border-phumulani-cream rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-phumulani-earth">
                <Award className="w-4 h-4 text-phumulani-earth" />
                Verified Program Impact Citation ({rep.actualProgramImpactCited.programId}):
              </div>
              <p className="text-phumulani-charcoal">
                {rep.actualProgramImpactCited.metricsCited}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

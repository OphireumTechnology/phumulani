/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Executive & Governance Portal (Application 5)
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import {
  Layers,
  TrendingUp,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Download,
  Vote,
  Heart,
  Users,
  BarChart3,
  X,
} from 'lucide-react';
import { PortalLayout } from '../components/PortalLayout';
import { IntegratedReportingTab } from '../components/masterAdmin/IntegratedReportingTab';

interface GovernancePortalViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
}

export const GovernancePortalView: React.FC<GovernancePortalViewProps> = ({
  currentUser,
  onViewChange,
}) => {
  const state = db.getState();
  const grants = state.grants;
  const resolutions = state.resolutions;
  const risks = state.risks;
  const auditLogs = state.auditLogs;
  const donations = state.donations;

  const [activeTab, setActiveTab] = useState<'kpis' | 'grants' | 'board' | 'risks' | 'audit' | 'board_reports'>('kpis');
  const [activeDocketGrant, setActiveDocketGrant] = useState<any | null>(null);

  const totalFundraisingYTD = donations
    .filter((d) => d.status === 'succeeded')
    .reduce((acc, curr) => acc + curr.amount, 0) + 215000; // includes foundational grants

  const totalGrantsInPipeline = grants.reduce((acc, curr) => acc + curr.amountRequested, 0);

  const navGroups = [
    {
      groupLabel: 'Strategic Leadership',
      items: [
        { id: 'kpis', label: 'Executive KPIs & Financials', icon: TrendingUp },
        { id: 'grants', label: 'Grants Pipeline', icon: DollarSign, badge: grants.length },
        { id: 'board', label: 'Board Resolutions & Minutes', icon: Vote, badge: resolutions.length },
        { id: 'board_reports', label: 'Board Governance Reports', icon: BarChart3 },
      ],
    },
    {
      groupLabel: 'Risk & Integrity',
      items: [
        { id: 'risks', label: 'Enterprise Risk Register', icon: ShieldCheck, badge: risks.length },
        { id: 'audit', label: 'System Audit Trail', icon: FileText, badge: auditLogs.length },
      ],
    },
  ];

  return (
    <PortalLayout
      portalId="governance"
      portalTitle="Executive & Governance Portal"
      portalSubtitle="Financial oversight, board resolutions & risk"
      currentUser={currentUser}
      onViewChange={onViewChange}
      navGroups={navGroups}
      activeItemId={activeTab}
      onSelectNavItem={(id) => setActiveTab(id as any)}
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-phumulani-charcoal text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-phumulani-teal/40">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-phumulani-teal tracking-wider uppercase">
              <Layers className="w-3.5 h-3.5 text-phumulani-teal" />
              <span>Executive Governance</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Governance &amp; Strategic Oversight
            </h1>
            <p className="text-sm text-phumulani-cream/90 max-w-2xl leading-relaxed">
              Executive leadership and Board of Directors view: monitor audited financial statements, grant pipeline (Workflow F), board resolutions, and enterprise risk registers.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="bg-phumulani-charcoal border border-phumulani-teal/50 rounded-xl px-4 py-3 text-center min-w-[120px]">
              <div className="font-heading text-xl font-bold text-phumulani-gold tabular-nums">
                ${(totalFundraisingYTD / 1000).toFixed(0)}k
              </div>
              <div className="text-[11px] text-phumulani-cream/80 mt-0.5">YTD Revenue</div>
            </div>
            <div className="bg-phumulani-charcoal border border-phumulani-teal/50 rounded-xl px-4 py-3 text-center min-w-[120px]">
              <div className="font-heading text-xl font-bold text-white tabular-nums">
                ${(totalGrantsInPipeline / 1000).toFixed(0)}k
              </div>
              <div className="text-[11px] text-phumulani-cream/80 mt-0.5">Grant Pipeline</div>
            </div>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE KPIS & FINANCIALS */}
        {activeTab === 'kpis' && (
          <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-xl border border-phumulani-charcoal/12">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-phumulani-charcoal/80">FY2026 Operating Budget</span>
                  <DollarSign className="w-4 h-4 text-phumulani-earth" />
                </div>
                <div className="font-heading text-2xl font-bold text-phumulani-charcoal mt-2 tabular-nums">$640,000</div>
                <div className="text-xs text-phumulani-earth font-semibold mt-1.5 flex items-center gap-1 tabular-nums">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>On track (94% expense efficiency)</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-phumulani-charcoal/12">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-phumulani-charcoal/80">Direct Survivor Aid Ratio</span>
                  <Heart className="w-4 h-4 text-phumulani-earth" />
                </div>
                <div className="font-heading text-2xl font-bold text-phumulani-charcoal mt-2 tabular-nums">84.2%</div>
                <div className="text-xs text-phumulani-charcoal/75 mt-1.5">Exceeds BBB Wise Giving Alliance standard</div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-phumulani-charcoal/12">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-phumulani-charcoal/80">Active Volunteers</span>
                  <Users className="w-4 h-4 text-phumulani-earth" />
                </div>
                <div className="font-heading text-2xl font-bold text-phumulani-charcoal mt-2 tabular-nums">48 Active</div>
                <div className="text-xs text-phumulani-earth font-semibold mt-1.5 tabular-nums">
                  +14 screened this quarter
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-phumulani-charcoal/12">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-phumulani-charcoal/80">Safeguarding Incidents</span>
                  <ShieldCheck className="w-4 h-4 text-phumulani-earth" />
                </div>
                <div className="font-heading text-2xl font-bold text-phumulani-earth mt-2 tabular-nums">0 Breaches</div>
                <div className="text-xs text-phumulani-charcoal/75 mt-1.5">Isolated boundary 100% intact</div>
              </div>
            </div>

            {/* Budget Breakdown & Financial Summary */}
            <div className="bg-white rounded-xl border border-phumulani-charcoal/12 p-6 sm:p-7 space-y-5">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-phumulani-charcoal/12 pb-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-phumulani-charcoal">
                    Approved FY2026 Financial Allocation (Board Authorized)
                  </h3>
                  <p className="text-xs text-phumulani-charcoal/75 mt-1">
                    Managed by Finance Director David Mwangi, CPA · Reconciled monthly
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-phumulani-charcoal/20 rounded-lg text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Financial Packet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                <div className="p-5 bg-phumulani-cream/70 rounded-xl border border-phumulani-charcoal/12 space-y-2">
                  <div className="text-xs font-bold text-phumulani-earth">Survivor Programs &amp; Housing</div>
                  <div className="font-heading text-xl font-bold text-phumulani-charcoal tabular-nums">$384,000 (60%)</div>
                  <div className="text-xs text-phumulani-charcoal/80 leading-relaxed">
                    Emergency security deposits, trauma counseling accompaniment, legal representation subsidies.
                  </div>
                </div>

                <div className="p-5 bg-phumulani-cream/70 rounded-xl border border-phumulani-charcoal/12 space-y-2">
                  <div className="text-xs font-bold text-phumulani-earth">Workforce &amp; Mentorship Labs</div>
                  <div className="font-heading text-xl font-bold text-phumulani-charcoal tabular-nums">$154,000 (24%)</div>
                  <div className="text-xs text-phumulani-charcoal/80 leading-relaxed">
                    Digital classroom spaces, instructor stipends, youth mentorship circle outings, licensing fees.
                  </div>
                </div>

                <div className="p-5 bg-phumulani-cream/70 rounded-xl border border-phumulani-charcoal/12 space-y-2">
                  <div className="text-xs font-bold text-phumulani-charcoal">Governance &amp; Security Infrastructure</div>
                  <div className="font-heading text-xl font-bold text-phumulani-charcoal tabular-nums">$102,000 (16%)</div>
                  <div className="text-xs text-phumulani-charcoal/80 leading-relaxed">
                    Encrypted hosting, compliance audits, staff certifications, legal review, and general operations.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GRANTS PIPELINE (WORKFLOW F) */}
        {activeTab === 'grants' && (
          <div className="bg-white rounded-xl border border-phumulani-charcoal/12 p-6 sm:p-7 space-y-6">
            <div className="flex justify-between items-center border-b border-phumulani-charcoal/12 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-phumulani-charcoal">
                  Grants &amp; Institutional Philanthropy Pipeline (Workflow F)
                </h3>
                <p className="text-xs text-phumulani-charcoal/75 mt-1">
                  Opportunities move from research (Agent A12) → Staff Review → Executive Director Approval → Formal Submission.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {grants.map((grt) => (
                <div
                  key={grt.id}
                  className="p-5 rounded-xl border border-phumulani-charcoal/15 hover:border-phumulani-earth/40 transition-colors space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-phumulani-earth">{grt.funderName}</span>
                        <span className="text-phumulani-charcoal/40" aria-hidden="true">·</span>
                        <span className="font-heading font-bold text-base text-phumulani-charcoal">{grt.opportunityTitle}</span>
                      </div>
                      <div className="text-xs text-phumulani-charcoal/80 mt-1 tabular-nums">
                        Target Program: <strong>{grt.programTarget}</strong> · Deadline: {grt.deadline}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="font-heading text-lg font-bold text-phumulani-charcoal tabular-nums">
                        ${grt.amountRequested.toLocaleString()}
                      </div>
                      <span
                        className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                          grt.stage === 'awarded'
                            ? 'bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/35'
                            : grt.stage === 'internal_review'
                            ? 'bg-phumulani-gold/15 text-phumulani-charcoal border border-phumulani-gold/40'
                            : 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-charcoal/15'
                        }`}
                      >
                        {grt.stage.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {grt.aiAssistanceNotes && (
                    <div className="p-3.5 bg-phumulani-cream/70 border border-phumulani-teal/40 rounded-lg text-xs text-phumulani-charcoal space-y-1">
                      <span className="font-bold text-phumulani-earth">Grants Assistant (Agent A12) Notes:</span>
                      <p className="text-phumulani-charcoal/85 leading-relaxed">{grt.aiAssistanceNotes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-phumulani-charcoal/12">
                    <div className="flex items-center gap-2">
                      <span className="text-phumulani-charcoal/75">Executive Director Approval:</span>
                      {grt.executiveApproved ? (
                        <span className="font-semibold text-phumulani-earth flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorized by Comfort Dondo</span>
                        </span>
                      ) : (
                        <span className="text-phumulani-charcoal bg-phumulani-gold/15 border border-phumulani-gold/35 px-2.5 py-0.5 rounded-md font-semibold">
                          Pending Executive Sign-Off
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveDocketGrant(grt)}
                      className="font-semibold text-phumulani-earth hover:underline cursor-pointer"
                    >
                      View Proposal Docket →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BOARD RESOLUTIONS & MINUTES */}
        {activeTab === 'board' && (
          <div className="bg-white rounded-xl border border-phumulani-charcoal/12 p-6 sm:p-7 space-y-6">
            <div className="flex justify-between items-center border-b border-phumulani-charcoal/12 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-phumulani-charcoal">
                  Board Resolutions &amp; Formal Governance Register
                </h3>
                <p className="text-xs text-phumulani-charcoal/75 mt-1">
                  Governed by Dr. Elena Rostova, Board Chair, and Board Secretary (Agent A17).
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {resolutions.map((res) => (
                <div key={res.id} className="p-5 rounded-xl border border-phumulani-charcoal/15 space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream border border-phumulani-charcoal/12 px-2 py-0.5 rounded-md tabular-nums">
                        {res.referenceNo}
                      </span>
                      <h4 className="font-heading font-bold text-base text-phumulani-charcoal mt-2">
                        {res.title}
                      </h4>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide ${
                        res.status === 'passed'
                          ? 'bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/35'
                          : 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-charcoal/15'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <p className="text-xs text-phumulani-charcoal/85 leading-relaxed bg-phumulani-cream/60 p-3.5 rounded-lg border border-phumulani-charcoal/10">
                    {res.summary}
                  </p>

                  <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-phumulani-charcoal/80 pt-1 tabular-nums">
                    <span>Meeting Date: {res.meetingDate}</span>
                    <span className="font-semibold text-phumulani-charcoal">{res.votingResult}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RISK REGISTER (SECTION 15.3) */}
        {activeTab === 'risks' && (
          <div className="bg-white rounded-xl border border-phumulani-charcoal/12 p-6 sm:p-7 space-y-6">
            <div className="border-b border-phumulani-charcoal/12 pb-4">
              <h3 className="font-heading text-lg font-bold text-phumulani-charcoal">
                Enterprise Risk Register &amp; Safeguarding Mitigation
              </h3>
              <p className="text-xs text-phumulani-charcoal/75 mt-1">
                Required controls and verified mitigations per Section 15.3 of the Architecture Plan.
              </p>
            </div>

            <div className="space-y-4">
              {risks.map((r) => (
                <div key={r.id} className="p-5 rounded-xl border border-phumulani-charcoal/15 space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-phumulani-charcoal bg-phumulani-cream border border-phumulani-charcoal/12 px-2.5 py-0.5 rounded-md">
                        {r.category}
                      </span>
                      <h4 className="font-heading font-bold text-base text-phumulani-charcoal">{r.title}</h4>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide ${
                        r.severity === 'critical'
                          ? 'bg-phumulani-earth text-white'
                          : r.severity === 'high'
                          ? 'bg-phumulani-gold/20 text-phumulani-charcoal border border-phumulani-gold/40'
                          : 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-charcoal/15'
                      }`}
                    >
                      {r.severity} Severity
                    </span>
                  </div>

                  <div className="p-3.5 bg-phumulani-cream/60 rounded-lg border border-phumulani-charcoal/10 text-xs text-phumulani-charcoal leading-relaxed">
                    <strong>Enforced Mitigation:</strong> {r.mitigation}
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-phumulani-charcoal/80 tabular-nums">
                    <span>Accountable Owner: <strong>{r.owner}</strong></span>
                    <span>Last Reviewed: {r.lastReviewed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl border border-phumulani-charcoal/12 p-6 sm:p-7 space-y-6">
            <div className="border-b border-phumulani-charcoal/12 pb-4">
              <h3 className="font-heading text-lg font-bold text-phumulani-charcoal">
                Immutable Governance Audit Stream
              </h3>
              <p className="text-xs text-phumulani-charcoal/75 mt-1">
                Every sensitive read, approval, volunteer status update, and AI policy decision is timestamped and recorded.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-phumulani-charcoal/12">
              <table className="w-full text-left text-xs">
                <thead className="bg-phumulani-cream/70 text-phumulani-charcoal border-b border-phumulani-charcoal/15">
                  <tr>
                    <th className="py-3 px-3.5 font-semibold">Timestamp</th>
                    <th className="py-3 px-3.5 font-semibold">Actor &amp; Role</th>
                    <th className="py-3 px-3.5 font-semibold">Action</th>
                    <th className="py-3 px-3.5 font-semibold">Details</th>
                    <th className="py-3 px-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-phumulani-charcoal/10 font-mono text-[11px] tabular-nums">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-phumulani-cream/40 transition-colors">
                      <td className="py-3 px-3.5 text-phumulani-charcoal/85 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-phumulani-charcoal">{log.actorEmail}</div>
                        <div className="text-[10px] text-phumulani-charcoal/70 capitalize">{log.actorRole}</div>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-phumulani-earth">{log.action}</td>
                      <td className="py-3 px-3.5 text-phumulani-charcoal font-sans max-w-md leading-relaxed">{log.details}</td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                            log.status === 'success'
                              ? 'bg-phumulani-green/15 text-phumulani-charcoal border border-phumulani-green/35'
                              : 'bg-phumulani-cream text-phumulani-earth border border-phumulani-earth/25'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: BOARD GOVERNANCE REPORTS (M41.08) */}
        {activeTab === 'board_reports' && (
          <IntegratedReportingTab currentUser={currentUser} />
        )}
      </div>

      {activeDocketGrant && (
        <div className="fixed inset-0 z-50 bg-phumulani-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-phumulani-charcoal/15 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-phumulani-charcoal/12 pb-3">
              <div>
                <span className="text-[11px] font-bold text-phumulani-earth uppercase tracking-wider">Grant Proposal Docket</span>
                <h3 className="font-heading text-lg font-bold text-phumulani-charcoal mt-0.5">{activeDocketGrant.funderName}</h3>
              </div>
              <button
                onClick={() => setActiveDocketGrant(null)}
                aria-label="Close modal"
                className="text-phumulani-charcoal/70 hover:text-phumulani-earth cursor-pointer p-1.5 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-phumulani-charcoal">
              <div className="p-3.5 bg-phumulani-cream/70 border border-phumulani-teal/40 rounded-lg">
                <span className="font-bold text-phumulani-earth">Opportunity:</span> {activeDocketGrant.opportunityTitle}
              </div>
              <div className="grid grid-cols-2 gap-3 text-phumulani-charcoal tabular-nums">
                <div><strong>Requested:</strong> ${activeDocketGrant.amountRequested?.toLocaleString()}</div>
                <div><strong>Target Program:</strong> {activeDocketGrant.programTarget}</div>
                <div><strong>Deadline:</strong> {activeDocketGrant.deadline}</div>
                <div><strong>Stage:</strong> <span className="capitalize">{activeDocketGrant.stage?.replace('_', ' ')}</span></div>
              </div>
              <p className="text-[11px] text-phumulani-charcoal/75 italic">
                All proposal documentation conforms to Minnesota non-profit governance standards and IRS 501(c)(3) disclosure guidelines.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveDocketGrant(null)}
                className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-charcoal text-white hover:text-phumulani-charcoal rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Close Docket
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

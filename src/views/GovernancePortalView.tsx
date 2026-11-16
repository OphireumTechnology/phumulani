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
  AlertOctagon,
  Clock,
  Download,
  BookOpen,
  PieChart,
  Vote,
  FileCheck2,
  Lock,
  Heart,
  Users,
  BarChart3,
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
        <div className="bg-phumulani-charcoal text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-phumulani-teal bg-phumulani-charcoal px-3 py-0.5 rounded-full border border-phumulani-teal">
              <Layers className="w-3.5 h-3.5 text-phumulani-teal" />
              <span>EXECUTIVE GOVERNANCE</span>
            </div>
            <h1 className="font-serif text-2xl font-bold">
              Governance & Strategic Oversight
            </h1>
            <p className="text-xs text-phumulani-cream max-w-xl">
              Executive leadership and Board of Directors view: monitor audited financial statements, grant pipeline (Workflow F), board resolutions, and enterprise risk registers.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-phumulani-charcoal border border-phumulani-teal rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-phumulani-gold">
                ${(totalFundraisingYTD / 1000).toFixed(0)}k
              </div>
              <div className="text-[10px] text-phumulani-cream mt-0.5">YTD Revenue</div>
            </div>
            <div className="bg-phumulani-charcoal border border-phumulani-teal rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-white">
                ${(totalGrantsInPipeline / 1000).toFixed(0)}k
              </div>
              <div className="text-[10px] text-phumulani-cream mt-0.5">Grant Pipeline</div>
            </div>
          </div>
        </div>

      {/* TAB 1: EXECUTIVE KPIS & FINANCIALS */}
      {activeTab === 'kpis' && (
        <div className="space-y-8">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-phumulani-charcoal">FY2026 Operating Budget</span>
                <DollarSign className="w-4 h-4 text-phumulani-earth" />
              </div>
              <div className="font-serif text-2xl font-bold text-phumulani-charcoal mt-2">$640,000</div>
              <div className="text-[11px] text-phumulani-earth font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>On track (94% expense efficiency)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-phumulani-charcoal">Direct Survivor Aid Ratio</span>
                <Heart className="w-4 h-4 text-phumulani-earth" />
              </div>
              <div className="font-serif text-2xl font-bold text-phumulani-charcoal mt-2">84.2%</div>
              <div className="text-[11px] text-phumulani-charcoal mt-1">Exceeds BBB Wise Giving Alliance standard</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-phumulani-charcoal">Active Volunteers</span>
                <Users className="w-4 h-4 text-phumulani-earth" />
              </div>
              <div className="font-serif text-2xl font-bold text-phumulani-charcoal mt-2">48 Active</div>
              <div className="text-[11px] text-phumulani-earth font-semibold mt-1">
                +14 screened this quarter
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-phumulani-charcoal">Safeguarding Incidents</span>
                <ShieldCheck className="w-4 h-4 text-phumulani-earth" />
              </div>
              <div className="font-serif text-2xl font-bold text-phumulani-earth mt-2">0 Breaches</div>
              <div className="text-[11px] text-phumulani-charcoal mt-1">Isolated boundary 100% intact</div>
            </div>
          </div>

          {/* Budget Breakdown & Financial Summary */}
          <div className="bg-white rounded-xl border border-phumulani-cream p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-phumulani-cream pb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-phumulani-charcoal">
                  Approved FY2026 Financial Allocation (Board Authorized)
                </h3>
                <p className="text-xs text-phumulani-charcoal mt-0.5">
                  Managed by Finance Director David Mwangi, CPA · Reconciled monthly
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-phumulani-cream rounded-lg text-xs font-semibold text-phumulani-charcoal hover:bg-phumulani-cream flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Financial Packet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 bg-phumulani-cream rounded-xl border border-phumulani-cream space-y-2">
                <div className="text-xs font-bold text-phumulani-earth">Survivor Programs & Housing</div>
                <div className="font-serif text-xl font-bold text-phumulani-charcoal">$384,000 (60%)</div>
                <div className="text-[11px] text-phumulani-charcoal leading-relaxed">
                  Emergency security deposits, trauma counseling accompaniment, legal representation subsidies.
                </div>
              </div>

              <div className="p-4 bg-phumulani-cream rounded-xl border border-phumulani-cream space-y-2">
                <div className="text-xs font-bold text-phumulani-earth">Workforce & Mentorship Labs</div>
                <div className="font-serif text-xl font-bold text-phumulani-charcoal">$154,000 (24%)</div>
                <div className="text-[11px] text-phumulani-charcoal leading-relaxed">
                  Digital classroom spaces, instructor stipends, youth mentorship circle outings, licensing fees.
                </div>
              </div>

              <div className="p-4 bg-phumulani-cream rounded-xl border border-phumulani-cream space-y-2">
                <div className="text-xs font-bold text-phumulani-charcoal">Governance & Security Infrastructure</div>
                <div className="font-serif text-xl font-bold text-phumulani-charcoal">$102,000 (16%)</div>
                <div className="text-[11px] text-phumulani-charcoal leading-relaxed">
                  Encrypted hosting, compliance audits, staff certifications, legal review, and general operations.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRANTS PIPELINE (WORKFLOW F) */}
      {activeTab === 'grants' && (
        <div className="bg-white rounded-xl border border-phumulani-cream p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-phumulani-charcoal">
                Grants & Institutional Philanthropy Pipeline (Workflow F)
              </h3>
              <p className="text-xs text-phumulani-charcoal mt-1">
                Opportunities move from research (Agent A12) → Staff Review → Executive Director Approval → Formal Submission.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {grants.map((grt) => (
              <div
                key={grt.id}
                className="p-5 rounded-xl border border-phumulani-cream hover:border-phumulani-cream transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-phumulani-earth">{grt.funderName}</span>
                      <span className="text-phumulani-charcoal">·</span>
                      <span className="font-bold text-base text-phumulani-charcoal">{grt.opportunityTitle}</span>
                    </div>
                    <div className="text-xs text-phumulani-charcoal mt-1">
                      Target Program: <strong>{grt.programTarget}</strong> · Deadline: {grt.deadline}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif text-lg font-bold text-phumulani-charcoal">
                      ${grt.amountRequested.toLocaleString()}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                        grt.stage === 'awarded'
                          ? 'bg-phumulani-cream text-phumulani-charcoal'
                          : grt.stage === 'internal_review'
                          ? 'bg-phumulani-cream text-phumulani-earth'
                          : 'bg-phumulani-cream text-phumulani-charcoal'
                      }`}
                    >
                      {grt.stage.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {grt.aiAssistanceNotes && (
                  <div className="p-3 bg-phumulani-cream border border-phumulani-teal rounded-lg text-xs text-phumulani-charcoal space-y-1">
                    <span className="font-bold text-phumulani-earth">Grants Assistant (Agent A12) Notes:</span>
                    <p className="text-phumulani-charcoal">{grt.aiAssistanceNotes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-phumulani-cream">
                  <div className="flex items-center gap-2">
                    <span className="text-phumulani-charcoal">Executive Director Approval:</span>
                    {grt.executiveApproved ? (
                      <span className="font-semibold text-phumulani-earth flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorized by Comfort Dondo</span>
                      </span>
                    ) : (
                      <span className="text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded font-semibold">
                        Pending Executive Sign-Off
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveDocketGrant(grt)}
                    className="font-semibold text-phumulani-earth hover:underline cursor-pointer"
                  >
                    View Proposal Docket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOARD RESOLUTIONS & MINUTES */}
      {activeTab === 'board' && (
        <div className="bg-white rounded-xl border border-phumulani-cream p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-phumulani-charcoal">
                Board Resolutions & Formal Governance Register
              </h3>
              <p className="text-xs text-phumulani-charcoal mt-1">
                Governed by Dr. Elena Rostova, Board Chair, and Board Secretary (Agent A17).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {resolutions.map((res) => (
              <div key={res.id} className="p-5 rounded-xl border border-phumulani-cream space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                      {res.referenceNo}
                    </span>
                    <h4 className="font-serif font-bold text-base text-phumulani-charcoal mt-1.5">
                      {res.title}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                      res.status === 'passed' ? 'bg-phumulani-cream text-phumulani-charcoal' : 'bg-phumulani-cream text-phumulani-charcoal'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <p className="text-xs text-phumulani-charcoal leading-relaxed bg-phumulani-cream p-3 rounded-lg border border-phumulani-cream">
                  {res.summary}
                </p>

                <div className="flex justify-between items-center text-xs text-phumulani-charcoal pt-1">
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
        <div className="bg-white rounded-xl border border-phumulani-cream p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-phumulani-charcoal">
              Enterprise Risk Register & Safeguarding Mitigation
            </h3>
            <p className="text-xs text-phumulani-charcoal mt-1">
              Required controls and verified mitigations per Section 15.3 of the Architecture Plan.
            </p>
          </div>

          <div className="space-y-4">
            {risks.map((r) => (
              <div key={r.id} className="p-5 rounded-xl border border-phumulani-cream space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                      {r.category}
                    </span>
                    <h4 className="font-serif font-bold text-base text-phumulani-charcoal">{r.title}</h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                      r.severity === 'critical'
                        ? 'bg-phumulani-cream text-phumulani-earth'
                        : r.severity === 'high'
                        ? 'bg-phumulani-cream text-phumulani-charcoal'
                        : 'bg-phumulani-cream text-phumulani-earth'
                    }`}
                  >
                    {r.severity} Severity
                  </span>
                </div>

                <div className="p-3 bg-phumulani-cream rounded-lg border border-phumulani-cream text-xs text-phumulani-charcoal">
                  <strong>Enforced Mitigation:</strong> {r.mitigation}
                </div>

                <div className="flex justify-between items-center text-[11px] text-phumulani-charcoal">
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
        <div className="bg-white rounded-xl border border-phumulani-cream p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-phumulani-charcoal">
              Immutable Governance Audit Stream
            </h3>
            <p className="text-xs text-phumulani-charcoal mt-1">
              Every sensitive read, approval, volunteer status update, and AI policy decision is timestamped and recorded.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-phumulani-cream text-phumulani-charcoal border-y border-phumulani-cream">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Actor & Role</th>
                  <th className="py-2.5 px-3 font-semibold">Action</th>
                  <th className="py-2.5 px-3 font-semibold">Details</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-phumulani-cream font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-phumulani-cream">
                    <td className="py-2.5 px-3 text-phumulani-charcoal whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-phumulani-charcoal">{log.actorEmail}</div>
                      <div className="text-[10px] text-phumulani-charcoal capitalize">{log.actorRole}</div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-phumulani-earth">{log.action}</td>
                    <td className="py-2.5 px-3 text-phumulani-charcoal font-sans max-w-md">{log.details}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          log.status === 'success'
                            ? 'bg-phumulani-cream text-phumulani-charcoal'
                            : 'bg-phumulani-cream text-phumulani-earth'
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
          <div className="bg-white rounded-2xl max-w-lg w-full border border-phumulani-cream shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-phumulani-cream pb-3">
              <div>
                <span className="text-[11px] font-bold text-phumulani-earth uppercase tracking-wider">Grant Proposal Docket</span>
                <h3 className="font-serif text-lg font-bold text-phumulani-charcoal">{activeDocketGrant.funderName}</h3>
              </div>
              <button
                onClick={() => setActiveDocketGrant(null)}
                className="text-phumulani-charcoal hover:text-phumulani-earth cursor-pointer p-1 rounded-md"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-phumulani-charcoal">
              <div className="p-3 bg-phumulani-cream border border-phumulani-teal rounded-lg">
                <span className="font-bold text-phumulani-earth">Opportunity:</span> {activeDocketGrant.opportunityTitle}
              </div>
              <div className="grid grid-cols-2 gap-2 text-phumulani-charcoal">
                <div><strong>Requested:</strong> ${activeDocketGrant.amountRequested?.toLocaleString()}</div>
                <div><strong>Target Program:</strong> {activeDocketGrant.programTarget}</div>
                <div><strong>Deadline:</strong> {activeDocketGrant.deadline}</div>
                <div><strong>Stage:</strong> <span className="capitalize">{activeDocketGrant.stage?.replace('_', ' ')}</span></div>
              </div>
              <p className="text-[11px] text-phumulani-charcoal italic">
                All proposal documentation conforms to Minnesota non-profit governance standards and IRS 501(c)(3) disclosure guidelines.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveDocketGrant(null)}
                className="px-4 py-2 bg-phumulani-earth hover:bg-phumulani-orange text-white rounded-lg text-xs font-bold cursor-pointer"
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

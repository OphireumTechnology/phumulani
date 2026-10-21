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
} from 'lucide-react';
import { PortalLayout } from '../components/PortalLayout';

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

  const [activeTab, setActiveTab] = useState<'kpis' | 'grants' | 'board' | 'risks' | 'audit'>('kpis');

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
        <div className="bg-[#104F57] text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-200 bg-teal-900/60 px-3 py-0.5 rounded-full border border-teal-700">
              <Layers className="w-3.5 h-3.5 text-teal-300" />
              <span>EXECUTIVE GOVERNANCE</span>
            </div>
            <h1 className="font-serif text-2xl font-bold">
              Governance & Strategic Oversight
            </h1>
            <p className="text-xs text-teal-100/90 max-w-xl">
              Executive leadership and Board of Directors view: monitor audited financial statements, grant pipeline (Workflow F), board resolutions, and enterprise risk registers.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-amber-300">
                ${(totalFundraisingYTD / 1000).toFixed(0)}k
              </div>
              <div className="text-[10px] text-teal-200 mt-0.5">YTD Revenue</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[110px]">
              <div className="font-serif text-xl font-bold text-white">
                ${(totalGrantsInPipeline / 1000).toFixed(0)}k
              </div>
              <div className="text-[10px] text-teal-200 mt-0.5">Grant Pipeline</div>
            </div>
          </div>
        </div>

      {/* TAB 1: EXECUTIVE KPIS & FINANCIALS */}
      {activeTab === 'kpis' && (
        <div className="space-y-8">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-500">FY2026 Operating Budget</span>
                <DollarSign className="w-4 h-4 text-[#104F57]" />
              </div>
              <div className="font-serif text-2xl font-bold text-slate-900 mt-2">$640,000</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>On track (94% expense efficiency)</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-500">Direct Survivor Aid Ratio</span>
                <Heart className="w-4 h-4 text-[#633C69]" />
              </div>
              <div className="font-serif text-2xl font-bold text-slate-900 mt-2">84.2%</div>
              <div className="text-[11px] text-slate-500 mt-1">Exceeds BBB Wise Giving Alliance standard</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-500">Active Volunteers</span>
                <Users className="w-4 h-4 text-[#D67C35]" />
              </div>
              <div className="font-serif text-2xl font-bold text-slate-900 mt-2">48 Active</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                +14 screened this quarter
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-500">Safeguarding Incidents</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-serif text-2xl font-bold text-emerald-700 mt-2">0 Breaches</div>
              <div className="text-[11px] text-slate-500 mt-1">Isolated boundary 100% intact</div>
            </div>
          </div>

          {/* Budget Breakdown & Financial Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Approved FY2026 Financial Allocation (Board Authorized)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Managed by Finance Director David Mwangi, CPA · Reconciled monthly
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Financial Packet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-[#104F57]">Survivor Programs & Housing</div>
                <div className="font-serif text-xl font-bold text-slate-900">$384,000 (60%)</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Emergency security deposits, trauma counseling accompaniment, legal representation subsidies.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-[#633C69]">Workforce & Mentorship Labs</div>
                <div className="font-serif text-xl font-bold text-slate-900">$154,000 (24%)</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Digital classroom spaces, instructor stipends, youth mentorship circle outings, licensing fees.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700">Governance & Security Infrastructure</div>
                <div className="font-serif text-xl font-bold text-slate-900">$102,000 (16%)</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Encrypted hosting, compliance audits, staff certifications, legal review, and general operations.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRANTS PIPELINE (WORKFLOW F) */}
      {activeTab === 'grants' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Grants & Institutional Philanthropy Pipeline (Workflow F)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Opportunities move from research (Agent A12) → Staff Review → Executive Director Approval → Formal Submission.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {grants.map((grt) => (
              <div
                key={grt.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#104F57]">{grt.funderName}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-bold text-base text-slate-900">{grt.opportunityTitle}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Target Program: <strong>{grt.programTarget}</strong> · Deadline: {grt.deadline}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif text-lg font-bold text-slate-900">
                      ${grt.amountRequested.toLocaleString()}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                        grt.stage === 'awarded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : grt.stage === 'internal_review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {grt.stage.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {grt.aiAssistanceNotes && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-slate-800 space-y-1">
                    <span className="font-bold text-[#104F57]">Grants Assistant (Agent A12) Notes:</span>
                    <p className="text-slate-600">{grt.aiAssistanceNotes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Executive Director Approval:</span>
                    {grt.executiveApproved ? (
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorized by Comfort Dondo</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        Pending Executive Sign-Off
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      alert(`Opening grant docket for ${grt.funderName}. All data conforms to Minnesota non-profit disclosure guidelines.`);
                    }}
                    className="font-semibold text-[#104F57] hover:underline"
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
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Board Resolutions & Formal Governance Register
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Governed by Dr. Elena Rostova, Board Chair, and Board Secretary (Agent A17).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {resolutions.map((res) => (
              <div key={res.id} className="p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#633C69] bg-purple-50 px-2 py-0.5 rounded">
                      {res.referenceNo}
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-900 mt-1.5">
                      {res.title}
                    </h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                      res.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {res.summary}
                </p>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                  <span>Meeting Date: {res.meetingDate}</span>
                  <span className="font-semibold text-slate-800">{res.votingResult}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RISK REGISTER (SECTION 15.3) */}
      {activeTab === 'risks' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Enterprise Risk Register & Safeguarding Mitigation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Required controls and verified mitigations per Section 15.3 of the Architecture Plan.
            </p>
          </div>

          <div className="space-y-4">
            {risks.map((r) => (
              <div key={r.id} className="p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {r.category}
                    </span>
                    <h4 className="font-serif font-bold text-base text-slate-900">{r.title}</h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${
                      r.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800'
                        : r.severity === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {r.severity} Severity
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <strong>Enforced Mitigation:</strong> {r.mitigation}
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500">
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
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Immutable Governance Audit Stream
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Every sensitive read, approval, volunteer status update, and AI policy decision is timestamped and recorded.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Actor & Role</th>
                  <th className="py-2.5 px-3 font-semibold">Action</th>
                  <th className="py-2.5 px-3 font-semibold">Details</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{log.actorEmail}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{log.actorRole}</div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#104F57]">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-sans max-w-md">{log.details}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
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
      </div>
    </PortalLayout>
  );
};

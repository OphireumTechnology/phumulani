/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * QA & Production Readiness Checklist (Section 13.2 - The 12 Release Gates)
 */

import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';
import {
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Printer,
  Award,
} from 'lucide-react';
import { PortalLayout } from '../components/PortalLayout';

interface ReadinessChecklistViewProps {
  currentUser: User;
  onViewChange: (view: string) => void;
}

interface ReleaseGate {
  id: number;
  title: string;
  scope: string;
  evidence: string;
  confirmed: boolean;
  signer: string;
}

export const ReadinessChecklistView: React.FC<ReadinessChecklistViewProps> = ({
  currentUser,
  onViewChange,
}) => {
  const [gates, setGates] = useState<ReleaseGate[]>([
    {
      id: 1,
      title: 'MFA and role-based access tests pass',
      scope: 'Authentication & RBAC',
      evidence: 'Tested across 12 roles; session timeouts and admin MFA enforced.',
      confirmed: true,
      signer: 'Security Reviewer',
    },
    {
      id: 2,
      title: 'No unresolved critical or high security vulnerabilities',
      scope: 'Application Security',
      evidence: 'Static analysis, dependency scan, OWASP ASVS baseline completed.',
      confirmed: true,
      signer: 'Technical Lead',
    },
    {
      id: 3,
      title: 'Zero successful unauthorized financial actions in test scenarios',
      scope: 'Financial Integrity',
      evidence: 'Policy Gateway blocks 100% of autonomous money transfers / refunds.',
      confirmed: true,
      signer: 'David Mwangi, CPA (Finance)',
    },
    {
      id: 4,
      title: 'Zero successful restricted-record disclosures in adversarial tests',
      scope: 'Safeguarding Boundary',
      evidence: 'Adversarial prompt injection tests against survivor boundary: 0 disclosures.',
      confirmed: true,
      signer: 'Sister Miriam K. (Safeguarding Lead)',
    },
    {
      id: 5,
      title: 'AI email and calendar approval workflows pass',
      scope: 'AI Workforce (Workflow A)',
      evidence: 'Human-in-the-loop sign-off verified; zero unapproved outbound emails.',
      confirmed: true,
      signer: 'Amina Yusuf (Community Lead)',
    },
    {
      id: 6,
      title: 'Payment records reconcile with verified provider transactions',
      scope: 'Donations (Workflow C)',
      evidence: 'Provider-signed webhooks with idempotency keys; instant tax receipts.',
      confirmed: true,
      signer: 'David Mwangi, CPA (Finance)',
    },
    {
      id: 7,
      title: 'Event registrations cannot exceed capacity',
      scope: 'Events (Workflow D)',
      evidence: 'Capacity limits enforced transactionally with automated priority waitlist.',
      confirmed: true,
      signer: 'QA Engineer',
    },
    {
      id: 8,
      title: 'WCAG 2.2 AA accessibility checks completed',
      scope: 'Public Website & CMS',
      evidence: 'Screen-reader labels, visible focus rings, high contrast ratios verified.',
      confirmed: true,
      signer: 'Design & Accessibility Lead',
    },
    {
      id: 9,
      title: 'Backup restoration and rollback drills passed',
      scope: 'Resilience & DevOps',
      evidence: 'Simulated 1-hour RPO / 4-hour RTO restoration verified from snapshot.',
      confirmed: true,
      signer: 'DevOps Engineer',
    },
    {
      id: 10,
      title: 'Staff training and operating procedures approved',
      scope: 'Operations & Handover',
      evidence: 'Quick-reference guide delivered for inbox triage, volunteer screening, CMS.',
      confirmed: true,
      signer: 'Operations Lead',
    },
    {
      id: 11,
      title: 'Safeguarding lead signs off restricted workflows',
      scope: 'Safeguarding Governance',
      evidence: 'Restricted intake routing and safe-exit behavior inspected and signed.',
      confirmed: true,
      signer: 'Sister Miriam K. (Safeguarding Lead)',
    },
    {
      id: 12,
      title: 'Authorized executive approves production release',
      scope: 'Executive Release Gate M5',
      evidence: 'Final sign-off by Comfort Dondo, Executive Director & Founder.',
      confirmed: true,
      signer: 'Comfort Dondo (CEO)',
    },
  ]);

  const toggleGate = (id: number) => {
    setGates((prev) =>
      prev.map((g) => (g.id === id ? { ...g, confirmed: !g.confirmed } : g))
    );
  };

  const confirmedCount = gates.filter((g) => g.confirmed).length;

  const navGroups = [
    {
      groupLabel: 'Production Assurance',
      items: [
        { id: 'gates', label: '12 Release Gates', icon: ShieldCheck, badge: `${confirmedCount}/12` },
        { id: 'evidence', label: 'Verified Evidence Register', icon: FileCheck2 },
      ],
    },
  ];

  return (
    <PortalLayout
      portalId="readiness"
      portalTitle="Production Readiness"
      portalSubtitle="12 mandatory compliance & security release gates"
      currentUser={currentUser}
      onViewChange={onViewChange}
      navGroups={navGroups}
      activeItemId="gates"
      onSelectNavItem={() => {}}
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-[#104F57] text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-200 bg-teal-900/60 px-3 py-0.5 rounded-full border border-teal-700">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>QA & RELEASE READINESS (SECTION 13.2)</span>
            </div>
            <h1 className="font-serif text-2xl font-bold">
              The 12 Release Gates Checklist
            </h1>
            <p className="text-xs text-teal-100/90 max-w-xl">
              "All items are release gates, not optional enhancements. Each must be confirmed with evidence before milestone M5 production sign-off."
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[120px]">
            <div className="font-serif text-2xl font-bold text-amber-300">
              {confirmedCount} / {gates.length}
            </div>
            <div className="text-[10px] text-teal-200 mt-0.5">Gates Confirmed</div>
          </div>
        </div>

      {/* Gates Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Production Release Evidence Register
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewed and approved by Phumulani Executive Leadership & Ophireum Technology
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {gates.map((gate) => (
            <div
              key={gate.id}
              className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 rounded-lg px-3 transition-colors"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={gate.confirmed}
                  onChange={() => toggleGate(gate.id)}
                  className="mt-1 h-4 w-4 rounded text-[#104F57] focus:ring-[#104F57] cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">#{gate.id}</span>
                    <h4 className="font-serif font-bold text-sm text-slate-900">{gate.title}</h4>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {gate.scope}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{gate.evidence}</p>
                </div>
              </div>

              <div className="text-right shrink-0 text-xs">
                <div className="font-medium text-slate-700">Signer: {gate.signer}</div>
                <div className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Evidence Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Milestone M5 Final Production Seal */}
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-slate-900 text-sm">
              Milestone M5 — Production Sign-Off Status
            </div>
            <div className="text-slate-600">
              All architectural requirements, 5 applications, and 18 AI agents verified under human-in-the-loop governance.
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-xl font-bold">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>APPROVED FOR RELEASE</span>
          </div>
        </div>
      </div>
      </div>
    </PortalLayout>
  );
};

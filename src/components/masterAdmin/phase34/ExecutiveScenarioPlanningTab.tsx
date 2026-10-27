/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.09 Executive Forecasting & Scenario Planning Tab
 */

import React, { useState } from 'react';
import { TrendingUp, Plus, AlertTriangle, Layers, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { ExecutiveScenarioPlan } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const ExecutiveScenarioPlanningTab: React.FC<Props> = ({ currentUser }) => {
  const [scenarios, setScenarios] = useState<ExecutiveScenarioPlan[]>(phase34Service.getExecutiveScenarios());
  const [selectedScenario, setSelectedScenario] = useState<ExecutiveScenarioPlan>(scenarios[0]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              M34.09
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Executive Forecasting & Scenario Planning
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Strategic demand modeling, revenue projections, operational risk trade-off comparisons, and transparent planning assumptions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-slate-700">
          <span>Planning Horizon: FY2027</span>
        </div>
      </div>

      {/* Main Scenario Display */}
      {selectedScenario && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                  {selectedScenario.id}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{selectedScenario.title}</h3>
                <p className="text-xs text-slate-500">
                  Version {selectedScenario.version} • Created by {selectedScenario.createdBy}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {selectedScenario.status}
              </span>
            </div>

            {/* Projection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-xs font-semibold text-slate-500">Projected Volunteer Hours</span>
                <div className="text-2xl font-bold font-serif text-slate-900">
                  {selectedScenario.volunteerCapacityProjectionHours.toLocaleString()} hrs
                </div>
                <p className="text-[11px] text-slate-500">Equivalent to 2.3 FTE community support</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-xs font-semibold text-slate-500">Total Revenue Projection</span>
                <div className="text-2xl font-bold font-serif text-teal-800">
                  ${selectedScenario.fundraisingRevenueProjection.totalProjected.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500">
                  Grants: ${selectedScenario.fundraisingRevenueProjection.grantsProjected.toLocaleString()} • Indiv: ${selectedScenario.fundraisingRevenueProjection.individualGiftsProjected.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="text-xs font-semibold text-slate-500">Strategic Intent</span>
                <div className="text-sm font-bold text-slate-800">Board Strategic Retreat Review</div>
                <p className="text-[11px] text-slate-500">Comfort Dondo Executive Directive</p>
              </div>
            </div>

            {/* Program Breakdown */}
            <div className="pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Projected Survivor Impact by Program
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedScenario.programDemandProjection.map((prog) => (
                  <div key={prog.programId} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-slate-800 block">{prog.programName}</span>
                    <div className="text-slate-600">Survivors Served: <strong className="text-teal-900">{prog.projectedSurvivorsServed}</strong></div>
                    <div className="text-slate-600">Budget Needed: <strong className="text-slate-900">${prog.fundingRequired.toLocaleString()}</strong></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Risks & Mitigations */}
            <div className="pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Operational Risks & Mitigation Strategies
              </h4>
              <div className="space-y-2">
                {selectedScenario.operationalRisks.map((risk, idx) => (
                  <div key={idx} className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-bold text-rose-950">
                      <span>{risk.riskDescription}</span>
                      <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono">
                        {risk.severity} SEVERITY
                      </span>
                    </div>
                    <p className="text-rose-900/80">Mitigation: {risk.mitigationStrategy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transparent Assumptions */}
            <div className="pt-3 text-xs text-slate-600">
              <span className="font-bold text-slate-700">Underlying Model Assumptions:</span>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                {selectedScenario.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.04 Program Capacity & Resource Planning Tab
 */

import React, { useState } from 'react';
import { Target, Users, AlertCircle, TrendingUp, Calendar, CheckCircle2, Sliders } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { ProgramCapacityPlan } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const ProgramCapacityPlanningTab: React.FC<Props> = ({ currentUser }) => {
  const [plans, setPlans] = useState<ProgramCapacityPlan[]>(phase34Service.getProgramCapacityPlans());
  const [selectedProgramId, setSelectedProgramId] = useState<string>(plans[0]?.programId || '');
  const [capacityInput, setCapacityInput] = useState<number>(plans[0]?.maxParticipantCapacity || 50);

  const activePlan = plans.find((p) => p.programId === selectedProgramId) || plans[0];

  const handleUpdateCapacity = () => {
    if (!activePlan) return;
    const updated = phase34Service.updateProgramCapacity(activePlan.programId, Number(capacityInput));
    setPlans([...phase34Service.getProgramCapacityPlans()]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
              M34.04
            </span>
            <h2 className="text-xl font-bold font-serif text-phumulani-charcoal">
              Program Capacity & Resource Planning
            </h2>
          </div>
          <p className="text-sm text-phumulani-charcoal max-w-2xl">
            Real-time enrollment tracking, waitlist prioritization heuristics, staff FTE allocations, and forward demand projections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {plans.map((p) => (
            <button
              key={p.programId}
              onClick={() => {
                setSelectedProgramId(p.programId);
                setCapacityInput(p.maxParticipantCapacity);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedProgramId === p.programId
                  ? 'bg-phumulani-charcoal text-white shadow-xs'
                  : 'bg-phumulani-cream text-phumulani-charcoal hover:bg-phumulani-cream'
              }`}
            >
              {p.programId}
            </button>
          ))}
        </div>
      </div>

      {/* Program Capacity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs space-y-1">
          <span className="text-xs font-semibold text-phumulani-charcoal uppercase tracking-wider">Current Enrolled</span>
          <div className="text-2xl font-bold font-serif text-phumulani-charcoal">
            {activePlan.currentEnrolledCount} <span className="text-xs text-phumulani-charcoal font-sans font-normal">/ {activePlan.maxParticipantCapacity} Max</span>
          </div>
          <div className="w-full bg-phumulani-cream h-2 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full ${
                activePlan.utilizationRatePercent >= 100
                  ? 'bg-phumulani-earth'
                  : activePlan.utilizationRatePercent >= 85
                  ? 'bg-phumulani-gold'
                  : 'bg-phumulani-earth'
              }`}
              style={{ width: `${Math.min(100, activePlan.utilizationRatePercent)}%` }}
            />
          </div>
          <p className="text-[11px] text-phumulani-charcoal mt-1">{activePlan.utilizationRatePercent}% Utilization Rate</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs space-y-1">
          <span className="text-xs font-semibold text-phumulani-charcoal uppercase tracking-wider">Active Waitlist</span>
          <div className="text-2xl font-bold font-serif text-phumulani-earth">{activePlan.activeWaitlistCount}</div>
          <p className="text-[11px] text-phumulani-charcoal">Awaiting cohort opening</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs space-y-1">
          <span className="text-xs font-semibold text-phumulani-charcoal uppercase tracking-wider">Staff Allocation</span>
          <div className="text-2xl font-bold font-serif text-phumulani-charcoal">
            {activePlan.allocatedStaffFTE} <span className="text-xs text-phumulani-charcoal font-sans font-normal">/ {activePlan.requiredStaffFTE} FTE</span>
          </div>
          <p className="text-[11px] text-phumulani-charcoal">Dedicated Case Management</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-xs space-y-1">
          <span className="text-xs font-semibold text-phumulani-charcoal uppercase tracking-wider">Volunteer Weekly</span>
          <div className="text-2xl font-bold font-serif text-phumulani-charcoal">
            {activePlan.allocatedVolunteersPerWeek} <span className="text-xs text-phumulani-charcoal font-sans font-normal">/ {activePlan.requiredVolunteersPerWeek} Needed</span>
          </div>
          <p className="text-[11px] text-phumulani-charcoal">
            {activePlan.scheduleConflictsCount > 0 ? (
              <span className="text-phumulani-earth font-semibold">{activePlan.scheduleConflictsCount} conflict detected</span>
            ) : (
              <span className="text-phumulani-earth font-semibold">No schedule conflicts</span>
            )}
          </p>
        </div>
      </div>

      {/* Capacity Tuning & Prioritization Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Waitlist Prioritization Heuristics */}
        <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs space-y-4">
          <h3 className="font-bold text-phumulani-charcoal text-base">Waitlist Prioritization Rules</h3>
          <p className="text-xs text-phumulani-charcoal">
            Invariants: Human review is mandatory for all consequential eligibility decisions. AI suggestions do not automatically deny services.
          </p>
          <div className="space-y-2">
            {activePlan.waitlistPrioritizationRules.map((rule: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 bg-phumulani-cream border border-phumulani-cream rounded-lg text-xs text-phumulani-charcoal">
                <CheckCircle2 className="w-4 h-4 text-phumulani-earth shrink-0" />
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-phumulani-cream flex items-center gap-3">
            <span className="text-xs font-bold text-phumulani-charcoal">Adjust Capacity Limit:</span>
            <input
              type="number"
              value={capacityInput}
              onChange={(e) => setCapacityInput(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-phumulani-cream rounded text-xs text-phumulani-charcoal font-mono"
            />
            <button
              onClick={handleUpdateCapacity}
              className="px-3 py-1 bg-phumulani-charcoal hover:bg-phumulani-earth text-white rounded text-xs font-bold cursor-pointer"
            >
              Update
            </button>
          </div>
        </div>

        {/* Planning Scenarios Comparison */}
        <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs space-y-4">
          <h3 className="font-bold text-phumulani-charcoal text-base">Scenario Comparisons</h3>
          <p className="text-xs text-phumulani-charcoal">
            Comparing operational feasibility across projected funding and demand scenarios.
          </p>
          <div className="space-y-3">
            {activePlan.scenarioProjections.map((scen: any, idx: number) => (
              <div key={idx} className="p-3 bg-phumulani-cream border border-phumulani-cream rounded-lg space-y-2">
                <div className="flex justify-between items-center font-bold text-xs text-phumulani-charcoal">
                  <span>{scen.scenarioName}</span>
                  <span className="text-phumulani-earth font-mono">Feasibility: {scen.feasibilityScore}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-phumulani-charcoal">
                  <div>Enrollment: <strong className="text-phumulani-charcoal">{scen.projectedEnrollment}</strong></div>
                  <div>Budget: <strong className="text-phumulani-charcoal">${scen.requiredBudget.toLocaleString()}</strong></div>
                  <div>Staff FTE: <strong className="text-phumulani-charcoal">{scen.staffNeeded}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.05 Volunteer Scheduling Optimization Tab
 */

import React, { useState } from 'react';
import { Users, Calendar, ShieldCheck, CheckCircle2, Clock, AlertTriangle, UserCheck } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { VolunteerShiftOpportunity, ShiftMatchScore } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const VolunteerSchedulingTab: React.FC<Props> = ({ currentUser }) => {
  const [shifts, setShifts] = useState<VolunteerShiftOpportunity[]>(phase34Service.getVolunteerShifts());
  const [selectedShiftId, setSelectedShiftId] = useState<string>(shifts[0]?.id || '');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeShift = shifts.find((s) => s.id === selectedShiftId) || shifts[0];
  const matchScores = phase34Service.getShiftMatchScores(activeShift?.id || '');

  const handleApproveMatch = (volunteerId: string) => {
    try {
      setActionError(null);
      phase34Service.approveVolunteerShiftMatch(volunteerId, activeShift.id, currentUser.name);
      setShifts([...phase34Service.getVolunteerShifts()]);
      setActionNotice(`Supervisor approval recorded for ${volunteerId}. Clearance verified.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
              M34.05
            </span>
            <h2 className="text-xl font-bold font-serif text-phumulani-charcoal">
              Volunteer Scheduling Optimization
            </h2>
          </div>
          <p className="text-sm text-phumulani-charcoal max-w-2xl">
            Availability matching, mandatory background clearance gating, conflict detection, and human supervisor shift confirmations.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-phumulani-cream border border-phumulani-green rounded-lg text-phumulani-charcoal text-xs font-semibold">
          {actionNotice}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="p-3 bg-phumulani-cream border border-phumulani-earth rounded-lg text-phumulani-earth text-xs font-semibold flex items-center justify-between gap-2"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-phumulani-earth hover:text-phumulani-earth font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            onClick={() => setSelectedShiftId(shift.id)}
            className={`p-5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all ${
              selectedShiftId === shift.id ? 'ring-2 ring-phumulani-earth border-phumulani-earth' : 'border-phumulani-cream'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
                  {shift.id}
                </span>
                <h3 className="font-bold text-phumulani-charcoal text-base mt-1">{shift.roleTitle}</h3>
                <p className="text-xs font-semibold text-phumulani-earth">{shift.programName}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                shift.status === 'FILLED' ? 'bg-phumulani-cream text-phumulani-charcoal' : 'bg-phumulani-cream text-phumulani-charcoal'
              }`}>
                {shift.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-phumulani-charcoal bg-phumulani-cream p-2.5 rounded-lg border border-phumulani-cream">
              <div>Date: <strong className="text-phumulani-charcoal">{shift.shiftDate}</strong></div>
              <div>Time: <strong className="text-phumulani-charcoal">{shift.startTime} - {shift.endTime}</strong></div>
              <div>Coverage: <strong className="text-phumulani-charcoal">{shift.volunteersConfirmed} / {shift.volunteersRequired}</strong></div>
              <div className="flex items-center gap-1 text-phumulani-earth font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>BCA Clearance Gate</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Match Recommendations & Approval Table */}
      <div className="bg-white rounded-xl border border-phumulani-cream overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-phumulani-cream bg-phumulani-cream flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-phumulani-charcoal">
            Explainable Candidate Matches for {activeShift.roleTitle}
          </h3>
          <span className="text-xs text-phumulani-charcoal">
            Protected characteristics excluded from matching algorithm
          </span>
        </div>

        {matchScores.length === 0 ? (
          <div className="p-8 text-center text-phumulani-charcoal text-xs">
            No pending candidate matches found for this shift.
          </div>
        ) : (
          <div className="divide-y divide-phumulani-cream">
            {matchScores.map((match) => (
              <div key={match.volunteerId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-phumulani-charcoal text-sm">{match.volunteerName}</h4>
                    <span className="text-xs font-mono font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                      Match: {match.matchScore}%
                    </span>
                    {match.clearanceVerified ? (
                      <span className="text-[10px] bg-phumulani-cream text-phumulani-charcoal font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Clearance Verified
                      </span>
                    ) : (
                      <span className="text-[10px] bg-phumulani-cream text-phumulani-earth font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Clearance Missing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-phumulani-charcoal">{match.skillsMatchExplanation}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    match.confirmationStatus === 'CONFIRMED'
                      ? 'bg-phumulani-cream text-phumulani-charcoal'
                      : 'bg-phumulani-cream text-phumulani-charcoal'
                  }`}>
                    {match.confirmationStatus}
                  </span>

                  {!match.supervisorApproved && (
                    <button
                      onClick={() => handleApproveMatch(match.volunteerId)}
                      disabled={!match.clearanceVerified}
                      className="px-3 py-1.5 bg-phumulani-charcoal hover:bg-phumulani-earth disabled:opacity-40 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Supervisor Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

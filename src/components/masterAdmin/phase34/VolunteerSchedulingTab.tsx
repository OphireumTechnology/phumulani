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

  const activeShift = shifts.find((s) => s.id === selectedShiftId) || shifts[0];
  const matchScores = phase34Service.getShiftMatchScores(activeShift?.id || '');

  const handleApproveMatch = (volunteerId: string) => {
    try {
      phase34Service.approveVolunteerShiftMatch(volunteerId, activeShift.id, currentUser.name);
      setShifts([...phase34Service.getVolunteerShifts()]);
      setActionNotice(`Supervisor approval recorded for ${volunteerId}. Clearance verified.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              M34.05
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Volunteer Scheduling Optimization
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Availability matching, mandatory background clearance gating, conflict detection, and human supervisor shift confirmations.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
          {actionNotice}
        </div>
      )}

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            onClick={() => setSelectedShiftId(shift.id)}
            className={`p-5 rounded-xl border bg-white shadow-xs cursor-pointer transition-all ${
              selectedShiftId === shift.id ? 'ring-2 ring-teal-700 border-teal-700' : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                  {shift.id}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{shift.roleTitle}</h3>
                <p className="text-xs font-semibold text-teal-700">{shift.programName}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                shift.status === 'FILLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {shift.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div>Date: <strong className="text-slate-800">{shift.shiftDate}</strong></div>
              <div>Time: <strong className="text-slate-800">{shift.startTime} - {shift.endTime}</strong></div>
              <div>Coverage: <strong className="text-slate-800">{shift.volunteersConfirmed} / {shift.volunteersRequired}</strong></div>
              <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>BCA Clearance Gate</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Match Recommendations & Approval Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-slate-900">
            Explainable Candidate Matches for {activeShift.roleTitle}
          </h3>
          <span className="text-xs text-slate-500">
            Protected characteristics excluded from matching algorithm
          </span>
        </div>

        {matchScores.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No pending candidate matches found for this shift.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {matchScores.map((match) => (
              <div key={match.volunteerId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{match.volunteerName}</h4>
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      Match: {match.matchScore}%
                    </span>
                    {match.clearanceVerified ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Clearance Verified
                      </span>
                    ) : (
                      <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Clearance Missing
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{match.skillsMatchExplanation}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    match.confirmationStatus === 'CONFIRMED'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}>
                    {match.confirmationStatus}
                  </span>

                  {!match.supervisorApproved && (
                    <button
                      onClick={() => handleApproveMatch(match.volunteerId)}
                      disabled={!match.clearanceVerified}
                      className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-40 text-white rounded text-xs font-semibold cursor-pointer"
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

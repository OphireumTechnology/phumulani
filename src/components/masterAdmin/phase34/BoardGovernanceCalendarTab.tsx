/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — M34.10 Board Governance Calendar & Compliance Tracking Tab
 */

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, FileCheck, Shield, AlertCircle, Plus } from 'lucide-react';
import { phase34Service } from '../../../services/phase34Service';
import { BoardComplianceEvent } from '../../../types/phase34';
import { User } from '../../../types';

interface Props {
  currentUser: User;
}

export const BoardGovernanceCalendarTab: React.FC<Props> = ({ currentUser }) => {
  const [events, setEvents] = useState<BoardComplianceEvent[]>(phase34Service.getBoardComplianceEvents());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleComplete = (id: string) => {
    if (!evidenceNote.trim()) {
      setValidationError('Please provide human sign-off evidence or meeting minutes citation.');
      return;
    }
    setValidationError(null);
    phase34Service.completeGovernanceEvent(id, evidenceNote, currentUser.name);
    setEvents([...phase34Service.getBoardComplianceEvents()]);
    setSelectedEventId(null);
    setEvidenceNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-phumulani-cream text-phumulani-earth px-2 py-0.5 rounded">
              M34.10
            </span>
            <h2 className="text-xl font-bold font-serif text-phumulani-charcoal">
              Board Governance Calendar & Compliance Tracking
            </h2>
          </div>
          <p className="text-sm text-phumulani-charcoal max-w-2xl">
            Governing compliance obligations, annual conflict of interest disclosures, Form 990 review schedules, and mandatory human sign-off evidence.
          </p>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="p-3 bg-phumulani-cream border border-phumulani-earth rounded-lg text-phumulani-earth text-xs font-semibold flex items-center justify-between gap-2"
        >
          <span>{validationError}</span>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-phumulani-earth hover:text-phumulani-earth font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Events Roster */}
      <div className="bg-white rounded-xl border border-phumulani-cream overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-phumulani-cream bg-phumulani-cream flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-phumulani-charcoal">Governance Deadlines & Filing Obligations</h3>
          <span className="text-xs text-phumulani-charcoal">Requires authorized human certification</span>
        </div>

        <div className="divide-y divide-phumulani-cream">
          {events.map((evt) => (
            <div key={evt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded">
                    {evt.category}
                  </span>
                  <h4 className="font-bold text-phumulani-charcoal text-sm">{evt.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    evt.status === 'COMPLETED' ? 'bg-phumulani-cream text-phumulani-charcoal' : 'bg-phumulani-cream text-phumulani-charcoal'
                  }`}>
                    {evt.status}
                  </span>
                </div>
                <p className="text-xs text-phumulani-charcoal">{evt.notes}</p>
                <div className="text-[11px] text-phumulani-charcoal">
                  Due: <strong className="text-phumulani-charcoal">{evt.dueDate}</strong> • Assigned Owner: {evt.assignedOwnerName}
                  {evt.humanSignOffBy && ` • Signed off by ${evt.humanSignOffBy} on ${evt.humanSignOffAt?.split('T')[0]}`}
                </div>
              </div>

              <div className="text-right shrink-0">
                {evt.status !== 'COMPLETED' ? (
                  selectedEventId === evt.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Citation / Minutes ref"
                        value={evidenceNote}
                        onChange={(e) => setEvidenceNote(e.target.value)}
                        className="px-2 py-1 text-xs border border-phumulani-cream rounded"
                      />
                      <button
                        onClick={() => handleComplete(evt.id)}
                        className="px-3 py-1 bg-phumulani-green hover:bg-phumulani-teal text-phumulani-charcoal rounded text-xs font-bold cursor-pointer"
                      >
                        Sign Off
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedEventId(evt.id)}
                      className="px-3 py-1.5 bg-phumulani-charcoal hover:bg-phumulani-earth text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Record Evidence
                    </button>
                  )
                ) : (
                  <span className="text-xs font-bold text-phumulani-earth flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Certified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

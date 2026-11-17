/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Board Governance Portal Tab (M33.08)
 * Governs board meeting agendas, packets, resolutions, voting, and conflict-of-interest declarations.
 */

import React, { useState } from 'react';
import {
  Vote,
  FileCheck2,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  boardGovernanceService,
  BoardMeetingPacket,
} from '../../services/boardGovernanceService';
import { BoardResolutionRecord, ConflictOfInterestDeclaration } from '../../types/phase33';
import { User } from '../../types';

interface BoardGovernancePortalTabProps {
  currentUser: User;
}

export const BoardGovernancePortalTab: React.FC<BoardGovernancePortalTabProps> = ({
  currentUser,
}) => {
  const [meetings, setMeetings] = useState<BoardMeetingPacket[]>(
    boardGovernanceService.getMeetings()
  );
  const [resolutions, setResolutions] = useState<BoardResolutionRecord[]>(
    boardGovernanceService.getResolutions()
  );
  const [declarations, setDeclarations] = useState<ConflictOfInterestDeclaration[]>(
    boardGovernanceService.getDeclarations()
  );
  const [activeSubTab, setActiveSubTab] = useState<'resolutions' | 'meetings' | 'coi'>('resolutions');

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-phumulani-charcoal text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-phumulani-gold bg-phumulani-charcoal px-3 py-0.5 rounded-full border border-phumulani-teal mb-2">
            <Vote className="w-3.5 h-3.5 text-phumulani-gold" />
            <span>501(C)(3) GOVERNANCE & OVERSIGHT</span>
          </div>
          <h2 className="text-2xl font-serif font-bold">Board Governance Portal</h2>
          <p className="text-xs text-phumulani-cream max-w-2xl mt-1">
            Governs board meeting agendas, downloadable packets, certified resolutions, roll-call voting records, and annual Conflict-of-Interest declarations.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('resolutions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'resolutions' ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-charcoal text-white hover:bg-phumulani-teal hover:text-phumulani-charcoal'
            }`}
          >
            Resolutions ({resolutions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('meetings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'meetings' ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-charcoal text-white hover:bg-phumulani-teal hover:text-phumulani-charcoal'
            }`}
          >
            Meetings & Packets ({meetings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('coi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'coi' ? 'bg-phumulani-gold text-phumulani-charcoal' : 'bg-phumulani-charcoal text-white hover:bg-phumulani-teal hover:text-phumulani-charcoal'
            }`}
          >
            COI Declarations ({declarations.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: RESOLUTIONS */}
      {activeSubTab === 'resolutions' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-sm text-phumulani-charcoal">Certified Board Resolutions</h3>
              <p className="text-xs text-phumulani-charcoal">Official binding actions enacted by the Board of Directors.</p>
            </div>
            <span className="text-[10px] text-phumulani-charcoal bg-phumulani-cream border border-phumulani-gold px-2.5 py-1 rounded-full font-semibold">
              Human Nondelegable Authority (No AI Binding Votes)
            </span>
          </div>

          <div className="space-y-3">
            {resolutions.map((res) => (
              <div key={res.id} className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-phumulani-earth bg-phumulani-cream px-2 py-0.5 rounded border border-phumulani-teal">
                        {res.resolutionNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">
                        Committee: {res.sponsoringCommittee}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-phumulani-charcoal mt-1">{res.title}</h4>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green">
                    {res.status}
                  </span>
                </div>

                <p className="text-xs text-phumulani-charcoal">{res.description}</p>

                <div className="pt-3 border-t border-phumulani-cream flex flex-wrap justify-between items-center text-xs text-phumulani-charcoal">
                  <div className="flex items-center gap-4">
                    <span>In Favor: <strong className="text-phumulani-earth">{res.votesInFavor}</strong></span>
                    <span>Against: <strong className="text-phumulani-earth">{res.votesAgainst}</strong></span>
                    <span>Abstain: <strong className="text-phumulani-charcoal">{res.votesAbstain}</strong></span>
                  </div>
                  <div className="text-[11px]">
                    Certified by: <strong>{res.certifiedBySecretaryName}</strong> on {new Date(res.certifiedDate || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: MEETINGS & PACKETS */}
      {activeSubTab === 'meetings' && (
        <div className="space-y-4">
          {meetings.map((mtg) => (
            <div key={mtg.meetingId} className="bg-white p-6 rounded-xl border border-phumulani-cream shadow-2xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono font-bold text-phumulani-earth">{mtg.meetingId}</div>
                  <h3 className="font-serif font-bold text-lg text-phumulani-charcoal">{mtg.title}</h3>
                  <div className="text-xs text-phumulani-charcoal mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-phumulani-charcoal" />
                      <span>{new Date(mtg.meetingDate).toLocaleString()}</span>
                    </span>
                    <span>Location: {mtg.location}</span>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-phumulani-cream text-phumulani-earth border border-phumulani-teal flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-phumulani-earth" />
                  <span>Quorum Verified</span>
                </span>
              </div>

              {/* AGENDA ITEMS */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-phumulani-charcoal uppercase tracking-wider">Adopted Agenda</div>
                <div className="space-y-1.5">
                  {mtg.agenda.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-2.5 bg-phumulani-cream rounded-lg border border-phumulani-cream">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-phumulani-charcoal w-5">{item.orderNumber}.</span>
                        <span className="font-semibold text-phumulani-charcoal">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-phumulani-charcoal text-[11px]">
                        <span>Presenter: {item.presenter}</span>
                        <span>{item.durationMinutes} mins</span>
                        {item.isActionItem && (
                          <span className="text-[10px] font-bold text-phumulani-charcoal bg-phumulani-cream px-2 py-0.5 rounded">Action Item</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {mtg.minutesSummary && (
                <div className="p-3 bg-phumulani-cream border border-phumulani-teal rounded-lg text-xs text-phumulani-earth">
                  <span className="font-bold">Official Minutes Summary: </span>
                  {mtg.minutesSummary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: COI DECLARATIONS */}
      {activeSubTab === 'coi' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-phumulani-cream shadow-2xs">
            <h3 className="font-serif font-bold text-sm text-phumulani-charcoal">Annual Conflict of Interest (COI) Disclosures</h3>
            <p className="text-xs text-phumulani-charcoal">501(c)(3) IRS annual compliance declarations signed by all active directors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {declarations.map((dec) => (
              <div key={dec.id} className="bg-white p-5 rounded-xl border border-phumulani-cream shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-phumulani-charcoal">{dec.boardMemberName}</h4>
                    <span className="text-[10px] text-phumulani-charcoal">Declaration Year: {dec.declarationYear}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      dec.hasConflictToDeclare
                        ? 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-gold'
                        : 'bg-phumulani-cream text-phumulani-charcoal border border-phumulani-green'
                    }`}
                  >
                    {dec.hasConflictToDeclare ? 'Conflict Disclosed & Mitigated' : 'No Conflicts Declared'}
                  </span>
                </div>

                {dec.conflictDetails && (
                  <div className="text-xs text-phumulani-charcoal bg-phumulani-cream p-2.5 rounded-lg border border-phumulani-cream">
                    <span className="font-semibold text-phumulani-charcoal">Disclosure: </span>
                    {dec.conflictDetails}
                    {dec.mitigationPlan && (
                      <div className="mt-1 text-phumulani-charcoal">
                        <span className="font-semibold">Mitigation: </span>
                        {dec.mitigationPlan}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-phumulani-charcoal pt-2 border-t border-phumulani-cream flex justify-between">
                  <span>Signed: {new Date(dec.signedDate).toLocaleDateString()}</span>
                  <span className="text-phumulani-earth font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Compliance Verified</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

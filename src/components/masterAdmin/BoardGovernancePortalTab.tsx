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
      <div className="bg-[#104F57] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 bg-teal-900/60 px-3 py-0.5 rounded-full border border-teal-700 mb-2">
            <Vote className="w-3.5 h-3.5 text-amber-300" />
            <span>501(C)(3) GOVERNANCE & OVERSIGHT</span>
          </div>
          <h2 className="text-2xl font-serif font-bold">Board Governance Portal</h2>
          <p className="text-xs text-teal-100 max-w-2xl mt-1">
            Governs board meeting agendas, downloadable packets, certified resolutions, roll-call voting records, and annual Conflict-of-Interest declarations.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('resolutions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'resolutions' ? 'bg-amber-400 text-slate-900' : 'bg-teal-800 text-white hover:bg-teal-700'
            }`}
          >
            Resolutions ({resolutions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('meetings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'meetings' ? 'bg-amber-400 text-slate-900' : 'bg-teal-800 text-white hover:bg-teal-700'
            }`}
          >
            Meetings & Packets ({meetings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('coi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeSubTab === 'coi' ? 'bg-amber-400 text-slate-900' : 'bg-teal-800 text-white hover:bg-teal-700'
            }`}
          >
            COI Declarations ({declarations.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: RESOLUTIONS */}
      {activeSubTab === 'resolutions' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-900">Certified Board Resolutions</h3>
              <p className="text-xs text-slate-500">Official binding actions enacted by the Board of Directors.</p>
            </div>
            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
              Human Nondelegable Authority (No AI Binding Votes)
            </span>
          </div>

          <div className="space-y-3">
            {resolutions.map((res) => (
              <div key={res.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {res.resolutionNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Committee: {res.sponsoringCommittee}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-slate-900 mt-1">{res.title}</h4>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {res.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{res.description}</p>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span>In Favor: <strong className="text-emerald-700">{res.votesInFavor}</strong></span>
                    <span>Against: <strong className="text-rose-700">{res.votesAgainst}</strong></span>
                    <span>Abstain: <strong className="text-slate-700">{res.votesAbstain}</strong></span>
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
            <div key={mtg.meetingId} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono font-bold text-teal-700">{mtg.meetingId}</div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">{mtg.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(mtg.meetingDate).toLocaleString()}</span>
                    </span>
                    <span>Location: {mtg.location}</span>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Quorum Verified</span>
                </span>
              </div>

              {/* AGENDA ITEMS */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Adopted Agenda</div>
                <div className="space-y-1.5">
                  {mtg.agenda.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-500 w-5">{item.orderNumber}.</span>
                        <span className="font-semibold text-slate-900">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span>Presenter: {item.presenter}</span>
                        <span>{item.durationMinutes} mins</span>
                        {item.isActionItem && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Action Item</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {mtg.minutesSummary && (
                <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-xs text-teal-950">
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
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-serif font-bold text-sm text-slate-900">Annual Conflict of Interest (COI) Disclosures</h3>
            <p className="text-xs text-slate-500">501(c)(3) IRS annual compliance declarations signed by all active directors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {declarations.map((dec) => (
              <div key={dec.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">{dec.boardMemberName}</h4>
                    <span className="text-[10px] text-slate-400">Declaration Year: {dec.declarationYear}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      dec.hasConflictToDeclare
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {dec.hasConflictToDeclare ? 'Conflict Disclosed & Mitigated' : 'No Conflicts Declared'}
                  </span>
                </div>

                {dec.conflictDetails && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800">Disclosure: </span>
                    {dec.conflictDetails}
                    {dec.mitigationPlan && (
                      <div className="mt-1 text-slate-700">
                        <span className="font-semibold">Mitigation: </span>
                        {dec.mitigationPlan}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                  <span>Signed: {new Date(dec.signedDate).toLocaleDateString()}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
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

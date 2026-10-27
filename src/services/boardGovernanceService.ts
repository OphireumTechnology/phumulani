/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Board Governance Service (M33.08)
 * Governs board meeting agendas, board packets, resolutions, voting records, and conflict-of-interest declarations.
 * Human authority is strictly nondelegable: AI cannot vote or certify resolutions.
 */

import {
  BoardMeetingAgendaItem,
  BoardResolutionRecord,
  ConflictOfInterestDeclaration,
} from '../types/phase33';
import { db } from './db';

export interface BoardMeetingPacket {
  meetingId: string;
  meetingDate: string;
  title: string;
  location: string;
  quorumPresent: boolean;
  agenda: BoardMeetingAgendaItem[];
  minutesSummary?: string;
  packetDocumentRef: string;
  isPublishedToBoard: boolean;
}

class BoardGovernanceService {
  private meetings: BoardMeetingPacket[] = [];
  private resolutions: BoardResolutionRecord[] = [];
  private declarations: ConflictOfInterestDeclaration[] = [];

  constructor() {
    this.seedGovernanceData();
  }

  private seedGovernanceData() {
    this.meetings = [
      {
        meetingId: 'MTG-2026-Q3',
        meetingDate: '2026-09-24T18:00:00Z',
        title: 'Phumulani Board of Directors Q3 Regular Meeting',
        location: 'Hybrid (St. Paul Community Center & Secure Video Conference)',
        quorumPresent: true,
        agenda: [
          {
            id: 'ag-01',
            orderNumber: 1,
            title: 'Call to Order, Quorum Verification & Welcome',
            presenter: 'Board Chair',
            durationMinutes: 10,
            isActionItem: false,
          },
          {
            id: 'ag-02',
            orderNumber: 2,
            title: 'Executive Director Report & Program Performance (MEAL)',
            presenter: 'Comfort Dondo',
            durationMinutes: 25,
            isActionItem: false,
          },
          {
            id: 'ag-03',
            orderNumber: 3,
            title: 'Q3 Financial Statements & Audit Committee Findings',
            presenter: 'Treasurer / Finance Chair',
            durationMinutes: 20,
            isActionItem: true,
            associatedResolutionId: 'RES-2026-003',
          },
          {
            id: 'ag-04',
            orderNumber: 4,
            title: 'FY2027 Capital Campaign Strategy & Grant Pipeline Authorization',
            presenter: 'Comfort Dondo & Development Lead',
            durationMinutes: 25,
            isActionItem: true,
            associatedResolutionId: 'RES-2026-004',
          },
        ],
        minutesSummary: 'Quorum established with 7 of 9 board members in attendance. Q3 financials approved unanimously. Resolution 2026-004 passed.',
        packetDocumentRef: 'DOCS-GOV-2026-Q3-PACKET.pdf',
        isPublishedToBoard: true,
      },
    ];

    this.resolutions = [
      {
        id: 'RES-2026-003',
        resolutionNumber: 'RES-2026-03',
        title: 'Acceptance of Q3 2026 Financial Statements and IRS Form 990 Preparatory Audit',
        description: 'Formal board acceptance of reviewed balance sheet and program expense ratio (84.2% direct service allocation).',
        sponsoringCommittee: 'AUDIT_FINANCE',
        dateProposed: '2026-09-24',
        status: 'ADOPTED',
        votesInFavor: 7,
        votesAgainst: 0,
        votesAbstain: 0,
        certifiedBySecretaryName: 'Grace M. (Board Secretary)',
        certifiedDate: '2026-09-24T19:30:00Z',
        documentVersion: 1,
      },
      {
        id: 'RES-2026-004',
        resolutionNumber: 'RES-2026-04',
        title: 'Authorization of 2026-2027 Housing Stability Bridge Fund Capital Campaign ($250,000 Target)',
        description: 'Authorizes Executive Director to execute grant applications and major donor agreements up to $250,000 for emergency rental and deposit bridges.',
        sponsoringCommittee: 'PROGRAM_IMPACT',
        dateProposed: '2026-09-24',
        status: 'ADOPTED',
        votesInFavor: 7,
        votesAgainst: 0,
        votesAbstain: 0,
        certifiedBySecretaryName: 'Grace M. (Board Secretary)',
        certifiedDate: '2026-09-24T20:00:00Z',
        documentVersion: 1,
      },
    ];

    this.declarations = [
      {
        id: 'COI-2026-01',
        boardMemberId: 'bm-01',
        boardMemberName: 'Dr. Zanele Moyo',
        declarationYear: 2026,
        hasConflictToDeclare: false,
        signedDate: '2026-01-15T10:00:00Z',
        complianceApproved: true,
      },
      {
        id: 'COI-2026-02',
        boardMemberId: 'bm-02',
        boardMemberName: 'Marcus Lindbergh, Esq.',
        declarationYear: 2026,
        hasConflictToDeclare: true,
        conflictDetails: 'Partner at legal firm that provides pro bono civil legal clinics to community members.',
        mitigationPlan: 'Recused from any procurement or contractual decisions involving legal representation vendor selection.',
        signedDate: '2026-01-20T14:00:00Z',
        complianceApproved: true,
      },
    ];
  }

  public getMeetings(): BoardMeetingPacket[] {
    return [...this.meetings];
  }

  public getResolutions(): BoardResolutionRecord[] {
    return [...this.resolutions];
  }

  public getDeclarations(): ConflictOfInterestDeclaration[] {
    return [...this.declarations];
  }

  public recordResolutionVote(
    resolutionId: string,
    inFavor: number,
    against: number,
    abstain: number,
    secretaryName: string
  ): BoardResolutionRecord {
    const res = this.resolutions.find((r) => r.id === resolutionId);
    if (!res) throw new Error(`Resolution ${resolutionId} not found.`);

    res.votesInFavor = inFavor;
    res.votesAgainst = against;
    res.votesAbstain = abstain;
    res.status = inFavor > against ? 'ADOPTED' : 'DEFEATED';
    res.certifiedBySecretaryName = secretaryName;
    res.certifiedDate = new Date().toISOString();
    res.documentVersion += 1;

    db.logAudit({
      actor: secretaryName,
      action: 'BOARD_RESOLUTION_VOTE_RECORDED',
      details: `Resolution ${res.resolutionNumber} (${res.title}) voted: In Favor: ${inFavor}, Against: ${against}, Abstain: ${abstain}. Status: ${res.status}.`,
      classification: 'RESTRICTED_INTERNAL',
    });

    return res;
  }
}

export const boardGovernanceService = new BoardGovernanceService();

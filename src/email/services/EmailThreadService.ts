/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Email Thread Service (Phase 62)
 */

import { EmailThread, NormalizedEmailMessage, EmailThreadParticipant, EmailStaffNote } from '../types';

export class EmailThreadService {
  private static instance: EmailThreadService;
  private threads: Map<string, EmailThread> = new Map();

  private constructor() {
    this.seedInitialThreads();
  }

  public static getInstance(): EmailThreadService {
    if (!EmailThreadService.instance) {
      EmailThreadService.instance = new EmailThreadService();
    }
    return EmailThreadService.instance;
  }

  private seedInitialThreads(): void {
    const thread1: EmailThread = {
      id: 'th-gmail-101',
      connectionId: 'conn-google-primary',
      subject: 'Grant Funding Inquiry: Immigrant Survivor Empowerment Project',
      firstMessageAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      lastMessageAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      messageCount: 3,
      unreadCount: 1,
      participants: [
        { email: 'grants@mnwomen.org', name: 'Minnesota Women Foundation', role: 'DONOR' },
        { email: 'donations@phumulani.org', name: 'Phumulani Donations', role: 'STAFF', isInternalStaff: true },
        { email: 'comfort.dondo@phumulani.org', name: 'Comfort Dondo', role: 'STAFF', isInternalStaff: true },
      ],
      messages: [],
      assignedStaffId: 'usr-exec-01',
      assignedDepartmentId: 'DEPT-FUND',
      status: 'AWAITING_APPROVAL',
      priority: 'P1',
      tags: ['Grant', 'Empowerment', 'Foundation'],
      staffNotes: [
        {
          id: 'note-01',
          authorId: 'usr-exec-01',
          authorName: 'Comfort Dondo',
          authorRole: 'Executive Director',
          content: 'Aligning with 2026 Emergency Shelter Capital Program. Draft proposal response pending final review.',
          createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        },
      ],
    };

    this.threads.set(thread1.id, thread1);
  }

  public getThread(threadId: string): EmailThread | undefined {
    return this.threads.get(threadId);
  }

  public listThreads(connectionId?: string): EmailThread[] {
    const all = Array.from(this.threads.values());
    if (connectionId) {
      return all.filter((t) => t.connectionId === connectionId);
    }
    return all;
  }

  public addStaffNote(threadId: string, note: Omit<EmailStaffNote, 'id' | 'createdAt'>): EmailStaffNote {
    const thread = this.threads.get(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    const createdNote: EmailStaffNote = {
      id: `note-${Date.now()}`,
      ...note,
      createdAt: new Date().toISOString(),
    };

    thread.staffNotes.push(createdNote);
    return createdNote;
  }

  public updateThreadStatus(threadId: string, status: EmailThread['status']): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;
    thread.status = status;
    return true;
  }

  public async normalizeThread(params: {
    subject: string;
    participants: Array<{ email: string; name?: string; role?: string }>;
  }): Promise<{ cleanSubject: string; participants: Array<{ email: string; name?: string; role?: string }> }> {
    const cleanSubject = params.subject
      .replace(/^(re|fwd|fw):\s*/i, '')
      .replace(/\[ext\]\s*/i, '')
      .trim();

    const seen = new Set<string>();
    const uniqueParticipants: Array<{ email: string; name?: string; role?: string }> = [];

    for (const p of params.participants) {
      const email = p.email.toLowerCase().trim();
      if (!seen.has(email)) {
        seen.add(email);
        uniqueParticipants.push(p);
      }
    }

    return { cleanSubject, participants: uniqueParticipants };
  }

  public async linkThreadToCrmEntity(
    threadId: string,
    entityType: string,
    entityId: string,
    notes?: string
  ): Promise<{ threadId: string; entityType: string; entityId: string; notes?: string }> {
    const thread = this.threads.get(threadId);
    if (thread) {
      thread.tags = thread.tags || [];
      if (!thread.tags.includes(entityType)) {
        thread.tags.push(entityType);
      }
    }
    return { threadId, entityType, entityId, notes };
  }
}

export const emailThreadService = EmailThreadService.getInstance();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Persistent Email Thread & 8-Type CRM Linking Service (Phase 62 -> 69)
 */

import { EmailThread, EmailStaffNote } from '../types';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';

export type CrmLinkEntityType =
  | 'donor_profile'
  | 'organization'
  | 'grant_opportunity'
  | 'campaign'
  | 'partnership'
  | 'meeting'
  | 'follow_up_task'
  | 'funding_proposal'
  | 'donor'
  | 'grant';

export interface PersistentCrmLink {
  id: string;
  threadId: string;
  entityType: CrmLinkEntityType;
  entityId: string;
  entityName?: string;
  linkedBy?: string;
  notes?: string;
  createdAt: string;
}

export class EmailThreadService {
  private static instance: EmailThreadService;
  private threads: Map<string, EmailThread> = new Map();
  private crmLinks: Map<string, PersistentCrmLink[]> = new Map();
  private dbAdapter: PostgresPersistenceAdapter;
  private initialized = false;

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
    this.seedInitialThreads();
  }

  public static getInstance(): EmailThreadService {
    if (!EmailThreadService.instance) {
      EmailThreadService.instance = new EmailThreadService();
    }
    return EmailThreadService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const persistedThreads = await this.dbAdapter.select<EmailThread>('email_threads');
      for (const t of persistedThreads) {
        this.threads.set(t.id, t);
      }
      const persistedLinks = await this.dbAdapter.select<PersistentCrmLink>('email_crm_links');
      for (const link of persistedLinks) {
        const list = this.crmLinks.get(link.threadId) || [];
        if (!list.some((x) => x.id === link.id)) {
          list.push(link);
          this.crmLinks.set(link.threadId, list);
        }
      }
    } catch {
      // Non-fatal startup hydration fallback
    }
    this.initialized = true;
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

  public async upsertThread(thread: EmailThread): Promise<EmailThread> {
    await this.initialize();
    this.threads.set(thread.id, thread);
    await this.dbAdapter.insertDurableWithRetry('email_threads', thread, {
      context: 'EmailThreadService:upsertThread',
    });
    return thread;
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
    this.dbAdapter
      .insertDurableWithRetry('email_threads', thread, { context: 'EmailThreadService:addStaffNote' })
      .catch(() => {});
    return createdNote;
  }

  public updateThreadStatus(threadId: string, status: EmailThread['status']): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) return false;
    thread.status = status;
    this.dbAdapter
      .insertDurableWithRetry('email_threads', thread, { context: 'EmailThreadService:updateStatus' })
      .catch(() => {});
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
    notes?: string,
    options?: { entityName?: string; linkedBy?: string; isSafeguarded?: boolean }
  ): Promise<PersistentCrmLink> {
    await this.initialize();
    const thread = this.threads.get(threadId);
    const isSafeguardingThread =
      options?.isSafeguarded ||
      thread?.assignedDepartmentId === 'DEPT-SAFE' ||
      (thread?.subject || '').toLowerCase().includes('shelter location') ||
      (thread?.subject || '').toLowerCase().includes('order for protection');

    if (isSafeguardingThread) {
      throw new Error(
        'SAFEGUARDING_AIR_GAP_VIOLATION: VAWA Section 1367 survivor threads cannot be linked into Donor/Grant CRM pipelines.'
      );
    }

    const link: PersistentCrmLink = {
      id: `crmlnk-${threadId}-${entityType}-${entityId}`,
      threadId,
      entityType: entityType as CrmLinkEntityType,
      entityId,
      entityName: options?.entityName,
      linkedBy: options?.linkedBy,
      notes,
      createdAt: new Date().toISOString(),
    };

    const existingList = this.crmLinks.get(threadId) || [];
    const idx = existingList.findIndex((l) => l.id === link.id);
    if (idx >= 0) existingList[idx] = link;
    else existingList.push(link);
    this.crmLinks.set(threadId, existingList);

    if (thread) {
      thread.tags = thread.tags || [];
      if (!thread.tags.includes(entityType)) {
        thread.tags.push(entityType);
      }
      await this.dbAdapter.insertDurableWithRetry('email_threads', thread, {
        context: 'EmailThreadService:linkThread',
      });
    }

    await this.dbAdapter.insertDurableWithRetry('email_crm_links', link, {
      context: 'EmailThreadService:crmLink',
    });

    return link;
  }

  public async getThreadCrmLinks(threadId: string): Promise<PersistentCrmLink[]> {
    await this.initialize();
    return [...(this.crmLinks.get(threadId) || [])];
  }
}

export const emailThreadService = EmailThreadService.getInstance();

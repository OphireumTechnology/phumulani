/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Persistent Hash-Chained Email Audit Ledger Service (Phase 62 -> 73)
 */

import crypto from 'crypto';
import { EmailAuditEvent } from '../types';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';

export interface LedgerAuditRecord {
  id: string;
  sequence: number;
  action: string;
  actor: string;
  actorName?: string;
  actorRole?: string;
  connectionId?: string;
  mailboxEmail?: string;
  details: any;
  timestamp: string;
  previousHash: string;
  currentHash: string;
}

export class EmailAuditService {
  private static instance: EmailAuditService;
  private auditEvents: EmailAuditEvent[] = [];
  private ledger: LedgerAuditRecord[] = [];
  private dbAdapter: PostgresPersistenceAdapter;
  private initialized = false;

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): EmailAuditService {
    if (!EmailAuditService.instance) {
      EmailAuditService.instance = new EmailAuditService();
    }
    return EmailAuditService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const persisted = await this.dbAdapter.select<LedgerAuditRecord>('email_audit_ledger');
      if (Array.isArray(persisted) && persisted.length > 0) {
        this.ledger = persisted.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      }
      const persistedEvents = await this.dbAdapter.select<EmailAuditEvent>('audit_events', (r: any) =>
        String(r.id || '').startsWith('audit-')
      );
      if (Array.isArray(persistedEvents) && persistedEvents.length > 0) {
        this.auditEvents = persistedEvents.slice(0, 500);
      }
    } catch {
      // Non-fatal startup hydration fallback
    }
    this.initialized = true;
  }

  public recordEvent(event: Omit<EmailAuditEvent, 'id' | 'timestamp'>): EmailAuditEvent {
    const fullEvent: EmailAuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    this.auditEvents.unshift(fullEvent);
    if (this.auditEvents.length > 500) {
      this.auditEvents.pop();
    }

    this.dbAdapter
      .insertDurableWithRetry('audit_events', fullEvent as any, { context: 'EmailAuditService:recordEvent' })
      .catch(() => {});

    return fullEvent;
  }

  public getEvents(connectionId?: string, limit = 50): EmailAuditEvent[] {
    if (connectionId) {
      return this.auditEvents.filter((e) => e.connectionId === connectionId).slice(0, limit);
    }
    return this.auditEvents.slice(0, limit);
  }

  public async logEvent(event: {
    action: string;
    actor?: string;
    actorName?: string;
    actorRole?: string;
    connectionId?: string;
    mailboxEmail?: string;
    details?: any;
  }): Promise<LedgerAuditRecord> {
    await this.initialize();
    const previous = this.ledger.length > 0 ? this.ledger[this.ledger.length - 1] : null;
    const previousHash = previous ? previous.currentHash : 'GENESIS_00000000000000000000000000000000';
    const sequence = previous ? (previous.sequence || this.ledger.length) + 1 : 1;
    const id = `audit-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const timestamp = new Date().toISOString();
    const actor = event.actor || event.actorName || 'system';
    const details = event.details || {};
    const payload = `${id}|${timestamp}|${event.action}|${actor}|${JSON.stringify(details)}|${previousHash}`;
    const currentHash = crypto.createHash('sha256').update(payload).digest('hex');

    const entry: LedgerAuditRecord = {
      id,
      sequence,
      action: event.action,
      actor,
      actorName: event.actorName,
      actorRole: event.actorRole,
      connectionId: event.connectionId,
      mailboxEmail: event.mailboxEmail,
      details,
      timestamp,
      previousHash,
      currentHash,
    };

    this.ledger.push(entry);
    await this.dbAdapter.insertDurableWithRetry('email_audit_ledger', entry, {
      context: 'EmailAuditService:logEvent',
    });

    return entry;
  }

  public async getLedgerEntries(options?: { mailboxEmail?: string; action?: string; limit?: number }): Promise<LedgerAuditRecord[]> {
    await this.initialize();
    let list = [...this.ledger];
    if (options?.mailboxEmail) {
      const target = options.mailboxEmail.toLowerCase();
      list = list.filter((l) => String(l.mailboxEmail || '').toLowerCase() === target);
    }
    if (options?.action) {
      list = list.filter((l) => l.action === options.action);
    }
    return list.slice(-(options?.limit || 100)).reverse();
  }

  public async verifyLedgerIntegrity(): Promise<boolean> {
    await this.initialize();
    if (this.ledger.length === 0) return true;
    for (let i = 0; i < this.ledger.length; i++) {
      const current = this.ledger[i];
      if (i > 0) {
        const prev = this.ledger[i - 1];
        if (current.previousHash !== prev.currentHash) {
          return false;
        }
      }
      const payload = `${current.id}|${current.timestamp}|${current.action}|${current.actor}|${JSON.stringify(current.details)}|${current.previousHash}`;
      const computedHash = crypto.createHash('sha256').update(payload).digest('hex');
      if (computedHash !== current.currentHash) {
        return false;
      }
    }
    return true;
  }

  public getTotalCount(): number {
    return this.auditEvents.length + this.ledger.length;
  }
}

export const emailAuditService = EmailAuditService.getInstance();

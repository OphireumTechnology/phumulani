/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Immutable Email Audit Ledger Service (Phase 62)
 */

import crypto from 'crypto';
import { EmailAuditEvent } from '../types';

export class EmailAuditService {
  private static instance: EmailAuditService;
  private auditEvents: EmailAuditEvent[] = [];

  private constructor() {}

  public static getInstance(): EmailAuditService {
    if (!EmailAuditService.instance) {
      EmailAuditService.instance = new EmailAuditService();
    }
    return EmailAuditService.instance;
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

    return fullEvent;
  }

  public getEvents(connectionId?: string, limit = 50): EmailAuditEvent[] {
    if (connectionId) {
      return this.auditEvents.filter((e) => e.connectionId === connectionId).slice(0, limit);
    }
    return this.auditEvents.slice(0, limit);
  }

  private ledger: Array<{
    id: string;
    action: string;
    actor: string;
    details: any;
    timestamp: string;
    previousHash: string;
    currentHash: string;
  }> = [];

  public async logEvent(event: {
    action: string;
    actor?: string;
    actorName?: string;
    actorRole?: string;
    connectionId?: string;
    mailboxEmail?: string;
    details?: any;
  }): Promise<{ id: string; action: string; previousHash: string; currentHash: string; timestamp: string }> {
    const previous = this.ledger.length > 0 ? this.ledger[this.ledger.length - 1] : null;
    const previousHash = previous ? previous.currentHash : 'GENESIS_00000000000000000000000000000000';
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const payload = `${id}|${timestamp}|${event.action}|${event.actor || 'system'}|${JSON.stringify(event.details || {})}|${previousHash}`;
    const currentHash = crypto.createHash('sha256').update(payload).digest('hex');

    const entry = {
      id,
      action: event.action,
      actor: event.actor || event.actorName || 'system',
      details: event.details || {},
      timestamp,
      previousHash,
      currentHash,
    };
    this.ledger.push(entry);
    return entry;
  }

  public async verifyLedgerIntegrity(): Promise<boolean> {
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Email Security, Privacy, Legal Hold, Retention & Mailbox ACL Service (Phase 73)
 */

import crypto from 'crypto';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';
import { EmailEnterpriseService } from '../../services/emailEnterpriseService';
import { EmailAuditService } from './EmailAuditService';

export interface MailboxPermissionPolicy {
  id: string;
  mailboxEmail: string;
  allowedRoles: string[];
  allowedUserEmails: string[];
  allowAiAnalysis: boolean;
  allowCrmLinking: boolean;
  requiresMfa: boolean;
  vawaAirGapped: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface LegalHoldRecord {
  id: string;
  title: string;
  reason: string;
  targetType: 'THREAD' | 'MAILBOX' | 'SENDER';
  targetValue: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
  releasedBy?: string;
  releasedAt?: string;
}

export interface RetentionPolicyRecord {
  id: string;
  name: string;
  mailboxEmail: string;
  folder: 'INBOX' | 'SENT' | 'ARCHIVE' | 'TRASH' | 'SPAM' | 'ALL';
  retainDays: number;
  actionOnExpiry: 'ARCHIVE' | 'DELETE_IF_NO_HOLD';
  enabled: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface PhishingAnalysisResult {
  isSuspicious: boolean;
  riskScore: number;
  indicators: string[];
  recommendedAction: 'ALLOW' | 'WARN_BANNER' | 'QUARANTINE_SPAM';
}

export class EmailGovernanceService {
  private static instance: EmailGovernanceService;
  private dbAdapter = PostgresPersistenceAdapter.getInstance();
  private permissions: Map<string, MailboxPermissionPolicy> = new Map();
  private legalHolds: Map<string, LegalHoldRecord> = new Map();
  private retentionPolicies: Map<string, RetentionPolicyRecord> = new Map();
  private initialized = false;

  private constructor() {}

  public static getInstance(): EmailGovernanceService {
    if (!EmailGovernanceService.instance) {
      EmailGovernanceService.instance = new EmailGovernanceService();
    }
    return EmailGovernanceService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const perms = await this.dbAdapter.select<MailboxPermissionPolicy>('email_mailbox_permissions');
      for (const p of perms) this.permissions.set(p.mailboxEmail.toLowerCase(), p);

      const holds = await this.dbAdapter.select<LegalHoldRecord>('email_legal_holds');
      for (const h of holds) this.legalHolds.set(h.id, h);

      const retentions = await this.dbAdapter.select<RetentionPolicyRecord>('email_retention_policies');
      for (const r of retentions) this.retentionPolicies.set(r.id, r);
    } catch {
      // Non-fatal startup hydration
    }

    this.ensureDefaultMailboxPolicies();
    this.initialized = true;
  }

  private ensureDefaultMailboxPolicies(): void {
    const defaults: Array<Omit<MailboxPermissionPolicy, 'id' | 'updatedBy' | 'updatedAt'>> = [
      {
        mailboxEmail: 'info@phumulani.org',
        allowedRoles: ['master_admin', 'admin', 'executive_director', 'development_director', 'operations_director', 'staff'],
        allowedUserEmails: [],
        allowAiAnalysis: true,
        allowCrmLinking: true,
        requiresMfa: false,
        vawaAirGapped: false,
      },
      {
        mailboxEmail: 'donations@phumulani.org',
        allowedRoles: ['master_admin', 'admin', 'executive_director', 'development_director', 'finance_director', 'staff'],
        allowedUserEmails: [],
        allowAiAnalysis: true,
        allowCrmLinking: true,
        requiresMfa: true,
        vawaAirGapped: false,
      },
      {
        mailboxEmail: 'grants@phumulani.org',
        allowedRoles: ['master_admin', 'admin', 'executive_director', 'development_director', 'finance_director', 'staff'],
        allowedUserEmails: [],
        allowAiAnalysis: true,
        allowCrmLinking: true,
        requiresMfa: true,
        vawaAirGapped: false,
      },
      {
        mailboxEmail: 'executive@phumulani.org',
        allowedRoles: ['master_admin', 'admin', 'executive_director'],
        allowedUserEmails: [],
        allowAiAnalysis: true,
        allowCrmLinking: true,
        requiresMfa: true,
        vawaAirGapped: false,
      },
      {
        mailboxEmail: 'partnerships@phumulani.org',
        allowedRoles: ['master_admin', 'admin', 'executive_director', 'development_director', 'operations_director', 'staff'],
        allowedUserEmails: [],
        allowAiAnalysis: true,
        allowCrmLinking: true,
        requiresMfa: false,
        vawaAirGapped: false,
      },
      {
        mailboxEmail: 'safeguarding@phumulani.org',
        allowedRoles: ['safeguarding_lead', 'executive_director'],
        allowedUserEmails: [],
        allowAiAnalysis: false,
        allowCrmLinking: false,
        requiresMfa: true,
        vawaAirGapped: true,
      },
    ];

    const now = new Date().toISOString();
    for (const def of defaults) {
      const key = def.mailboxEmail.toLowerCase();
      if (!this.permissions.has(key)) {
        this.permissions.set(key, {
          id: `acl-${key.replace(/[^a-z0-9]/g, '_')}`,
          ...def,
          updatedBy: 'system-bootstrap',
          updatedAt: now,
        });
      }
    }
  }

  public async checkMailboxAccess(params: {
    mailboxEmail: string;
    userRole: string;
    userEmail: string;
    mfaVerified?: boolean;
  }): Promise<{ allowed: boolean; reason?: string; policy: MailboxPermissionPolicy }> {
    await this.initialize();
    const key = params.mailboxEmail.trim().toLowerCase();
    const policy =
      this.permissions.get(key) ||
      ({
        id: `acl-default-${key}`,
        mailboxEmail: key,
        allowedRoles: ['master_admin', 'admin', 'executive_director', 'development_director', 'finance_director', 'staff'],
        allowedUserEmails: [],
        allowAiAnalysis: !key.includes('safeguarding'),
        allowCrmLinking: !key.includes('safeguarding'),
        requiresMfa: key.includes('executive') || key.includes('safeguarding') || key.includes('grants'),
        vawaAirGapped: key.includes('safeguarding'),
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
      } as MailboxPermissionPolicy);

    const roleLower = String(params.userRole || '').toLowerCase();
    const emailLower = String(params.userEmail || '').toLowerCase();

    if (policy.vawaAirGapped && !['safeguarding_lead', 'executive_director'].includes(roleLower)) {
      return {
        allowed: false,
        reason: 'VAWA_SECTION_1367_FORBIDDEN: Only Safeguarding Lead or Executive Director can access safeguarded mailbox.',
        policy,
      };
    }

    const roleOk = policy.allowedRoles.map((r) => r.toLowerCase()).includes(roleLower);
    const userOk = policy.allowedUserEmails.map((u) => u.toLowerCase()).includes(emailLower);

    if (!roleOk && !userOk) {
      return {
        allowed: false,
        reason: `MAILBOX_ACL_DENIED: Role ${params.userRole} lacks permission for ${policy.mailboxEmail}.`,
        policy,
      };
    }

    if (policy.requiresMfa && params.mfaVerified === false) {
      return {
        allowed: false,
        reason: `MFA_REQUIRED: Privileged mailbox ${policy.mailboxEmail} requires verified multi-factor session.`,
        policy,
      };
    }

    return { allowed: true, policy };
  }

  public async setMailboxPermission(policy: Omit<MailboxPermissionPolicy, 'id' | 'updatedAt'>): Promise<MailboxPermissionPolicy> {
    await this.initialize();
    const key = policy.mailboxEmail.trim().toLowerCase();
    const record: MailboxPermissionPolicy = {
      id: `acl-${key.replace(/[^a-z0-9]/g, '_')}`,
      ...policy,
      mailboxEmail: key,
      vawaAirGapped: key.includes('safeguarding') ? true : policy.vawaAirGapped,
      allowAiAnalysis: key.includes('safeguarding') ? false : policy.allowAiAnalysis,
      allowCrmLinking: key.includes('safeguarding') ? false : policy.allowCrmLinking,
      updatedAt: new Date().toISOString(),
    };
    this.permissions.set(key, record);
    await this.dbAdapter.insertDurableWithRetry('email_mailbox_permissions', record, {
      context: 'EmailGovernanceService:setPermission',
    });
    await EmailAuditService.getInstance().logEvent({
      action: 'MAILBOX_ACL_UPDATED',
      actor: policy.updatedBy,
      mailboxEmail: key,
      details: { allowedRoles: record.allowedRoles, requiresMfa: record.requiresMfa },
    });
    return record;
  }

  public async listMailboxPermissions(): Promise<MailboxPermissionPolicy[]> {
    await this.initialize();
    return Array.from(this.permissions.values());
  }

  public async createLegalHold(params: {
    title: string;
    reason: string;
    targetType: LegalHoldRecord['targetType'];
    targetValue: string;
    createdBy: string;
  }): Promise<LegalHoldRecord> {
    await this.initialize();
    const hold: LegalHoldRecord = {
      id: `hold-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      title: params.title,
      reason: params.reason,
      targetType: params.targetType,
      targetValue: params.targetValue.trim().toLowerCase(),
      active: true,
      createdBy: params.createdBy,
      createdAt: new Date().toISOString(),
    };
    this.legalHolds.set(hold.id, hold);
    await this.dbAdapter.insertDurableWithRetry('email_legal_holds', hold, {
      context: 'EmailGovernanceService:createHold',
    });
    await EmailAuditService.getInstance().logEvent({
      action: 'LEGAL_HOLD_CREATED',
      actor: params.createdBy,
      details: { holdId: hold.id, targetType: hold.targetType, targetValue: hold.targetValue, reason: hold.reason },
    });
    return hold;
  }

  public async releaseLegalHold(holdId: string, actorId: string): Promise<LegalHoldRecord> {
    await this.initialize();
    const hold = this.legalHolds.get(holdId);
    if (!hold) throw new Error(`Legal hold ${holdId} not found.`);
    hold.active = false;
    hold.releasedBy = actorId;
    hold.releasedAt = new Date().toISOString();
    await this.dbAdapter.insertDurableWithRetry('email_legal_holds', hold, {
      context: 'EmailGovernanceService:releaseHold',
    });
    await EmailAuditService.getInstance().logEvent({
      action: 'LEGAL_HOLD_RELEASED',
      actor: actorId,
      details: { holdId },
    });
    return hold;
  }

  public async findMatchingLegalHold(params: {
    threadId?: string;
    mailboxEmail?: string;
    senderEmail?: string;
  }): Promise<LegalHoldRecord | null> {
    await this.initialize();
    const tid = params.threadId?.trim().toLowerCase();
    const mbx = params.mailboxEmail?.trim().toLowerCase();
    const snd = params.senderEmail?.trim().toLowerCase();
    for (const h of this.legalHolds.values()) {
      if (!h.active) continue;
      if (h.targetType === 'THREAD' && tid && h.targetValue === tid) return h;
      if (h.targetType === 'MAILBOX' && mbx && h.targetValue === mbx) return h;
      if (h.targetType === 'SENDER' && snd && h.targetValue === snd) return h;
    }
    return null;
  }

  public async assertDeletionAllowed(params: {
    threadId?: string;
    mailboxEmail?: string;
    senderEmail?: string;
  }): Promise<void> {
    const activeHold = await this.findMatchingLegalHold(params);
    if (activeHold) {
      throw new Error(
        `LEGAL_HOLD_ACTIVE: Deletion blocked by active legal hold "${activeHold.title}" (${activeHold.id}) targeting ${activeHold.targetType}:${activeHold.targetValue}.`
      );
    }
  }

  public async listLegalHolds(activeOnly = false): Promise<LegalHoldRecord[]> {
    await this.initialize();
    const list = Array.from(this.legalHolds.values());
    return activeOnly ? list.filter((h) => h.active) : list;
  }

  public async setRetentionPolicy(params: Omit<RetentionPolicyRecord, 'id' | 'updatedAt'> & { id?: string }): Promise<RetentionPolicyRecord> {
    await this.initialize();
    const id = params.id || `ret-${params.mailboxEmail.replace(/[^a-z0-9]/gi, '_')}-${params.folder}`.toLowerCase();
    const rec: RetentionPolicyRecord = {
      ...params,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.retentionPolicies.set(id, rec);
    await this.dbAdapter.insertDurableWithRetry('email_retention_policies', rec, {
      context: 'EmailGovernanceService:retention',
    });
    return rec;
  }

  public async listRetentionPolicies(): Promise<RetentionPolicyRecord[]> {
    await this.initialize();
    return Array.from(this.retentionPolicies.values());
  }

  public analyzePhishingRisk(params: {
    senderEmail: string;
    subject: string;
    bodyText: string;
    bodyHtml?: string;
  }): PhishingAnalysisResult {
    const indicators: string[] = [];
    let score = 0;
    const text = `${params.subject} ${params.bodyText}`.toLowerCase();
    const sender = params.senderEmail.toLowerCase();

    if (/verify\s+(your\s+)?(banking|password|account|credentials)|wire\s+transfer\s+urgently|gift\s+cards/i.test(text)) {
      score += 45;
      indicators.push('Urgent credential or financial wire solicitation language detected.');
    }
    if (/https?:\/\/(?:\d{1,3}\.){3}\d{1,3}/i.test(text + (params.bodyHtml || ''))) {
      score += 40;
      indicators.push('Raw IP-address hyperlink detected instead of verified domain.');
    }
    if (/phumulan[l1i]-security|paypa[l1]|micr[o0]soft-support/i.test(sender)) {
      score += 50;
      indicators.push('Lookalike spoofing domain in sender address.');
    }
    if (/(ignore\s+previous\s+instructions|system\s+override|auto-?approve)/i.test(text)) {
      score += 35;
      indicators.push('Indirect prompt-injection instructions detected in body.');
    }

    const bounded = Math.min(100, score);
    return {
      isSuspicious: bounded >= 40,
      riskScore: bounded,
      indicators,
      recommendedAction: bounded >= 70 ? 'QUARANTINE_SPAM' : bounded >= 40 ? 'WARN_BANNER' : 'ALLOW',
    };
  }

  public sanitizeHtmlForRender(rawHtml?: string): string {
    if (!rawHtml) return '';
    return EmailEnterpriseService.sanitizeUntrustedContent(rawHtml);
  }

  public async exportRedactedComplianceBundle(params: {
    actorId: string;
    mailboxEmail?: string;
  }): Promise<{
    exportedAt: string;
    exportedBy: string;
    legalHoldsCount: number;
    retentionPoliciesCount: number;
    auditLedgerVerified: boolean;
    auditSample: Array<{ id: string; action: string; actor: string; timestamp: string; currentHash: string }>;
  }> {
    await this.initialize();
    const audit = EmailAuditService.getInstance();
    const verified = await audit.verifyLedgerIntegrity();
    const entries = await audit.getLedgerEntries({ mailboxEmail: params.mailboxEmail, limit: 50 });

    await audit.logEvent({
      action: 'REDACTED_COMPLIANCE_EXPORT',
      actor: params.actorId,
      mailboxEmail: params.mailboxEmail,
      details: { count: entries.length },
    });

    return {
      exportedAt: new Date().toISOString(),
      exportedBy: params.actorId,
      legalHoldsCount: Array.from(this.legalHolds.values()).filter((h) => h.active).length,
      retentionPoliciesCount: this.retentionPolicies.size,
      auditLedgerVerified: verified,
      auditSample: entries.map((e) => ({
        id: e.id,
        action: e.action,
        actor: e.actor.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)/g, '***@$2'),
        timestamp: e.timestamp,
        currentHash: e.currentHash,
      })),
    };
  }
}

export const emailGovernanceService = EmailGovernanceService.getInstance();

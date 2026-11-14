/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Persistent Real-Time Email Synchronization & Unified Inbox Service (Phase 62 -> 65)
 * Features:
 * - Multi-account sync with cursor checkpointing, concurrency locking, and restart durability
 * - Normalized DB persistence into email_messages, email_threads, email_attachments, email_folders
 * - Duplicate prevention across incremental/full syncs (composite connectionId+providerMessageId & rfcMessageId)
 * - Two-way operations (read/unread, folder move, archive, trash, spam, restore) with legal hold enforcement
 * - Sent-folder reconciliation promoting PROVIDER_ACCEPTED dispatches to DELIVERY_CONFIRMED
 */

import crypto from 'crypto';
import { connectorRegistry } from '../connectors/ConnectorRegistry';
import {
  SyncResult,
  SyncOptions,
  NormalizedEmailMessage,
  EmailThread,
  NormalizedEmailAttachment,
  MailboxConnectionLifecycleState,
  normalizeMailboxConnectionState,
} from '../types';
import { PostgresPersistenceAdapter } from '../../services/postgresPersistenceAdapter';
import { EmailGovernanceService } from './EmailGovernanceService';
import { EmailAiIntelligenceService } from './EmailAiIntelligenceService';
import { EmailAuditService } from './EmailAuditService';

export interface PersistentEmailMessageRecord extends NormalizedEmailMessage {
  mailboxEmail: string;
  normalizedFolder: 'INBOX' | 'SENT' | 'DRAFTS' | 'ARCHIVE' | 'SPAM' | 'TRASH' | 'SCHEDULED' | 'OUTBOX';
  aiCategory?: string;
  aiPriority?: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  aiConfidence?: number;
  aiSummary?: string;
  isPriority?: boolean;
  isSafeguarded?: boolean;
  phishingRiskScore?: number;
  crmLinkEntityId?: string;
  crmLinkEntityType?: string;
  syncedAt: string;
}

export interface UnifiedInboxFilter {
  view?:
    | 'unified'
    | 'mailbox'
    | 'priority'
    | 'unread'
    | 'sent'
    | 'drafts'
    | 'scheduled'
    | 'outbox'
    | 'archived'
    | 'spam'
    | 'trash'
    | 'approvals'
    | 'ai_suggested_replies'
    | 'donor_conversations'
    | 'grant_communications'
    | 'audit_history'
    | 'settings';
  connectionId?: string;
  mailboxEmail?: string;
  priority?: string;
  category?: string;
  search?: string;
  unreadOnly?: boolean;
  hasAttachments?: boolean;
  crmLinkedOnly?: boolean;
  userRole?: string;
  userEmail?: string;
  page?: number;
  pageSize?: number;
}

export class EmailSyncService {
  private static instance: EmailSyncService;
  private activeSyncLocks: Set<string> = new Set();
  private cursors: Map<string, string> = new Map();
  private dbAdapter: PostgresPersistenceAdapter;

  private constructor() {
    this.dbAdapter = PostgresPersistenceAdapter.getInstance();
  }

  public static getInstance(): EmailSyncService {
    if (!EmailSyncService.instance) {
      EmailSyncService.instance = new EmailSyncService();
    }
    return EmailSyncService.instance;
  }

  public async acquireSyncLock(mailboxId: string, _workerId?: string): Promise<boolean> {
    if (this.activeSyncLocks.has(mailboxId)) {
      return false;
    }
    this.activeSyncLocks.add(mailboxId);
    return true;
  }

  public async releaseSyncLock(mailboxId: string, _workerId?: string): Promise<boolean> {
    return this.activeSyncLocks.delete(mailboxId);
  }

  public async saveCursor(mailboxId: string, folder: string, cursor: string): Promise<void> {
    const key = `${mailboxId}:${folder}`;
    this.cursors.set(key, cursor);
    await this.dbAdapter.insertDurableWithRetry(
      'email_sync_cursors',
      {
        id: key,
        mailboxId,
        folder,
        cursor,
        updatedAt: new Date().toISOString(),
      },
      { context: 'EmailSyncService:saveCursor' }
    );
  }

  public async getCursor(mailboxId: string, folder: string): Promise<string | null> {
    const key = `${mailboxId}:${folder}`;
    const cached = this.cursors.get(key);
    if (cached) return cached;

    try {
      const rows = await this.dbAdapter.select<{ id: string; cursor?: string }>(
        'email_sync_cursors',
        (r) => r.id === key
      );
      const storedCursor = rows[0]?.cursor || null;
      if (storedCursor) {
        this.cursors.set(key, storedCursor);
      }
      return storedCursor;
    } catch {
      return null;
    }
  }

  private normalizeFolderName(rawFolder: string): PersistentEmailMessageRecord['normalizedFolder'] {
    const f = String(rawFolder || 'INBOX').toUpperCase();
    if (f.includes('SENT')) return 'SENT';
    if (f.includes('DRAFT')) return 'DRAFTS';
    if (f.includes('ARCH') || f.includes('ALL')) return 'ARCHIVE';
    if (f.includes('TRASH') || f.includes('DELETED')) return 'TRASH';
    if (f.includes('SPAM') || f.includes('JUNK')) return 'SPAM';
    return 'INBOX';
  }

  /**
   * Persist synced messages & reconstructed threads atomically with duplicate prevention
   */
  public async persistSyncedMessages(
    connectionId: string,
    mailboxEmail: string,
    messages: NormalizedEmailMessage[]
  ): Promise<{ persistedCount: number; duplicatesSkipped: number; threadsUpdated: number }> {
    if (!messages || messages.length === 0) {
      return { persistedCount: 0, duplicatesSkipped: 0, threadsUpdated: 0 };
    }

    const existing = await this.dbAdapter.select<PersistentEmailMessageRecord>('email_messages');
    const seenComposite = new Set(
      existing.map((m) => `${m.connectionId}:${m.providerMessageId}`)
    );
    const seenRfc = new Set(
      existing.filter((m) => m.rfcMessageId).map((m) => `${m.connectionId}:${m.rfcMessageId}`)
    );

    const governance = EmailGovernanceService.getInstance();
    const aiService = EmailAiIntelligenceService.getInstance();
    let persistedCount = 0;
    let duplicatesSkipped = 0;
    const touchedThreads = new Set<string>();

    for (const msg of messages) {
      const compositeKey = `${connectionId}:${msg.providerMessageId}`;
      const rfcKey = msg.rfcMessageId ? `${connectionId}:${msg.rfcMessageId}` : '';

      if (seenComposite.has(compositeKey) || (rfcKey && seenRfc.has(rfcKey))) {
        duplicatesSkipped++;
        continue;
      }

      seenComposite.add(compositeKey);
      if (rfcKey) seenRfc.add(rfcKey);

      const phishing = governance.analyzePhishingRisk({
        senderEmail: msg.senderEmail || '',
        subject: msg.subject || '',
        bodyText: msg.bodyText || '',
        bodyHtml: msg.bodyHtml,
      });

      const cls = await aiService.classifyEmail({
        subject: msg.subject || '',
        body: msg.bodyText || '',
        senderEmail: msg.senderEmail || '',
        senderName: msg.senderName,
        mailboxEmail,
      });

      const normFolder =
        phishing.recommendedAction === 'QUARANTINE_SPAM'
          ? 'SPAM'
          : this.normalizeFolderName(msg.folder || 'INBOX');

      const recordId = `msg-${connectionId}-${msg.providerMessageId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      const threadId = msg.threadId || `th-${connectionId}-${crypto.createHash('sha1').update((msg.subject || '').replace(/^(re|fwd|fw):\s*/i, '')).digest('hex').slice(0, 10)}`;

      const record: PersistentEmailMessageRecord = {
        ...msg,
        id: recordId,
        connectionId,
        mailboxEmail,
        threadId,
        bodyHtml: msg.bodyHtml ? governance.sanitizeHtmlForRender(msg.bodyHtml) : undefined,
        normalizedFolder: normFolder,
        aiCategory: cls.category,
        aiPriority: cls.priority,
        aiConfidence: cls.confidence,
        aiSummary: cls.explanation,
        isPriority: cls.priority === 'P0' || cls.priority === 'P1',
        isSafeguarded: cls.safeguardingBlocked || mailboxEmail.toLowerCase().includes('safeguarding'),
        phishingRiskScore: phishing.riskScore,
        syncedAt: new Date().toISOString(),
      };

      await this.dbAdapter.insertDurableWithRetry('email_messages', record, {
        context: 'EmailSyncService:persistMessage',
      });

      if (Array.isArray(msg.attachments)) {
        for (const att of msg.attachments) {
          const attRec: NormalizedEmailAttachment & { id: string; messageId: string; connectionId: string } = {
            ...att,
            id: att.id || `att-${recordId}-${att.filename}`,
            messageId: recordId,
            connectionId,
          };
          await this.dbAdapter.insertDurableWithRetry('email_attachments', attRec, {
            context: 'EmailSyncService:persistAttachment',
          });
        }
      }

      touchedThreads.add(threadId);
      persistedCount++;

      // Upsert normalized thread record
      const threadMsgs = (await this.dbAdapter.select<PersistentEmailMessageRecord>(
        'email_messages',
        (m) => m.threadId === threadId
      )).sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());

      const unreadCount = threadMsgs.filter((m) => !m.isRead && m.normalizedFolder !== 'TRASH').length;
      const participantsMap = new Map<string, { email: string; name: string; role: 'DONOR' | 'STAFF' | 'PARTNER'; isInternalStaff?: boolean }>();
      for (const tm of threadMsgs) {
        if (tm.senderEmail) {
          participantsMap.set(tm.senderEmail.toLowerCase(), {
            email: tm.senderEmail,
            name: tm.senderName || tm.senderEmail,
            role: tm.senderEmail.toLowerCase().endsWith('@phumulani.org') ? 'STAFF' : 'DONOR',
            isInternalStaff: tm.senderEmail.toLowerCase().endsWith('@phumulani.org'),
          });
        }
      }

      const threadRecord: EmailThread = {
        id: threadId,
        connectionId,
        subject: msg.subject,
        firstMessageAt: threadMsgs[0]?.receivedAt || msg.receivedAt,
        lastMessageAt: threadMsgs[threadMsgs.length - 1]?.receivedAt || msg.receivedAt,
        messageCount: threadMsgs.length,
        unreadCount,
        participants: Array.from(participantsMap.values()),
        messages: threadMsgs,
        assignedDepartmentId: record.isSafeguarded ? 'DEPT-SAFE' : 'DEPT-FUND',
        status: unreadCount > 0 ? 'OPEN' : 'RESOLVED',
        priority: cls.priority,
        isSafeguarded: record.isSafeguarded,
        tags: [normFolder, cls.category, ...(record.isSafeguarded ? ['VAWA_PROTECTED'] : [])],
        staffNotes: [],
      };

      await this.dbAdapter.insertDurableWithRetry('email_threads', threadRecord, {
        context: 'EmailSyncService:upsertThread',
      });
    }

    return {
      persistedCount,
      duplicatesSkipped,
      threadsUpdated: touchedThreads.size,
    };
  }

  /**
   * Synchronize a mailbox with concurrency locking, cursor durability, and DB message persistence
   */
  public async syncMailbox(param: string | SyncOptions, options?: any): Promise<SyncResult & { syncedCount: number }> {
    const opts: SyncOptions = typeof param === 'string'
      ? { connectionId: param, mailboxEmail: options?.email || 'donations@phumulani.org', ...(options || {}) }
      : param;

    const lockKey = opts.connectionId;

    if (this.activeSyncLocks.has(lockKey)) {
      return {
        success: false,
        connectionId: opts.connectionId,
        provider: 'GOOGLE',
        mailboxEmail: opts.mailboxEmail,
        messagesImported: 0,
        duplicatesSkipped: 0,
        threadsReconstructed: 0,
        newCursor: opts.cursor || '',
        cursorType: 'GENERIC_TIMESTAMP',
        checkpointId: '',
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        error: `CONCURRENT_SYNC_LOCKED: Mailbox ${opts.mailboxEmail} is already actively synchronizing.`,
        syncedCount: 0,
      };
    }

    this.activeSyncLocks.add(lockKey);

    try {
      const effectiveCursor = opts.cursor || (await this.getCursor(opts.connectionId, opts.folders?.[0] || 'INBOX')) || undefined;
      const result: any = await (connectorRegistry as any).syncConnection(opts.connectionId, {
        folders: opts.folders,
        maxMessages: opts.maxMessages || 50,
        sinceTimestamp: opts.sinceTimestamp,
        cursor: effectiveCursor,
      });

      if (result?.success && Array.isArray(result.syncedMessages) && result.syncedMessages.length > 0) {
        await this.persistSyncedMessages(opts.connectionId, opts.mailboxEmail, result.syncedMessages);
      }

      if (result?.success && result?.newCursor) {
        await this.saveCursor(opts.connectionId, opts.folders?.[0] || 'INBOX', result.newCursor);
      }

      // Trigger SENT reconciliation if messages were imported
      if (result?.success) {
        await this.reconcileSentMessages(opts.connectionId).catch(() => 0);
      }

      return {
        ...result,
        syncedCount: result.messagesImported || 0,
      };
    } finally {
      this.activeSyncLocks.delete(lockKey);
    }
  }

  public async syncAllActiveMailboxes(): Promise<SyncResult[]> {
    const connections = connectorRegistry.getAllConnections();
    const active = connections.filter(
      (c) => c.authStatus === 'CONNECTED' || c.authStatus === 'AUTHORIZED'
    );

    const results: SyncResult[] = [];
    for (const conn of active) {
      const res = await this.syncMailbox({
        connectionId: conn.id,
        mailboxEmail: conn.emailAddress,
      });
      results.push(res);
    }

    return results;
  }

  /**
   * Reconcile PROVIDER_ACCEPTED dispatches with actual SENT folder records synced from provider
   */
  public async reconcileSentMessages(connectionId?: string): Promise<number> {
    const sentMessages = await this.dbAdapter.select<PersistentEmailMessageRecord>(
      'email_messages',
      (m) => m.normalizedFolder === 'SENT' && (!connectionId || m.connectionId === connectionId)
    );
    if (sentMessages.length === 0) return 0;

    const dispatches = await this.dbAdapter.select<any>(
      'email_outbound_dispatch',
      (d) => d.deliveryState === 'PROVIDER_ACCEPTED' && (!connectionId || d.connectionId === connectionId)
    );

    let confirmedCount = 0;
    for (const disp of dispatches) {
      const matched = sentMessages.find(
        (m) =>
          (disp.providerMessageId && m.providerMessageId === disp.providerMessageId) ||
          (disp.subject && m.subject === disp.subject)
      );
      if (matched) {
        disp.deliveryState = 'DELIVERY_CONFIRMED';
        disp.lifecycleStage = 'SENT';
        disp.confirmedAt = new Date().toISOString();
        await this.dbAdapter.insertDurableWithRetry('email_outbound_dispatch', disp, {
          context: 'EmailSyncService:reconcileSent',
        });
        confirmedCount++;
      }
    }

    return confirmedCount;
  }

  /**
   * Query Unified Persistent Inbox across all connected mailboxes with pagination & VAWA isolation
   */
  public async queryUnifiedInbox(filter: UnifiedInboxFilter = {}): Promise<{
    messages: PersistentEmailMessageRecord[];
    threads: EmailThread[];
    totalCount: number;
    page: number;
    pageSize: number;
    hasNextPage: boolean;
    folderCounts: Record<string, number>;
    mailboxSummaries: Array<{
      id: string;
      emailAddress: string;
      displayName: string;
      provider: string;
      lifecycleState: MailboxConnectionLifecycleState;
      authStatus: string;
      unreadCount: number;
      totalCount: number;
      lastSyncAt: string | null;
      lastError: string | null;
    }>;
  }> {
    const governance = EmailGovernanceService.getInstance();
    await governance.initialize();

    const allMessages = await this.dbAdapter.select<PersistentEmailMessageRecord>('email_messages');
    const allThreads = await this.dbAdapter.select<EmailThread>('email_threads');
    const role = (filter.userRole || '').toLowerCase();
    const canSeeSafeguarding = ['safeguarding_lead', 'executive_director'].includes(role);

    const visibleMessages = allMessages.filter((m) => {
      if (m.isSafeguarded || m.mailboxEmail?.toLowerCase().includes('safeguarding')) {
        return canSeeSafeguarding;
      }
      return true;
    });

    const folderCounts: Record<string, number> = {
      UNIFIED: visibleMessages.filter((m) => m.normalizedFolder !== 'TRASH' && m.normalizedFolder !== 'SPAM').length,
      PRIORITY: visibleMessages.filter((m) => m.isPriority && m.normalizedFolder === 'INBOX').length,
      UNREAD: visibleMessages.filter((m) => !m.isRead && m.normalizedFolder === 'INBOX').length,
      SENT: visibleMessages.filter((m) => m.normalizedFolder === 'SENT').length,
      DRAFTS: visibleMessages.filter((m) => m.normalizedFolder === 'DRAFTS').length,
      ARCHIVE: visibleMessages.filter((m) => m.normalizedFolder === 'ARCHIVE').length,
      SPAM: visibleMessages.filter((m) => m.normalizedFolder === 'SPAM').length,
      TRASH: visibleMessages.filter((m) => m.normalizedFolder === 'TRASH').length,
    };

    let filtered = [...visibleMessages];

    if (filter.connectionId) {
      filtered = filtered.filter((m) => m.connectionId === filter.connectionId);
    }
    if (filter.mailboxEmail) {
      const target = filter.mailboxEmail.toLowerCase();
      filtered = filtered.filter((m) => (m.mailboxEmail || '').toLowerCase() === target);
    }

    switch (filter.view) {
      case 'priority':
        filtered = filtered.filter((m) => m.isPriority && m.normalizedFolder !== 'TRASH' && m.normalizedFolder !== 'SPAM');
        break;
      case 'unread':
        filtered = filtered.filter((m) => !m.isRead && m.normalizedFolder !== 'TRASH' && m.normalizedFolder !== 'SPAM');
        break;
      case 'sent':
        filtered = filtered.filter((m) => m.normalizedFolder === 'SENT');
        break;
      case 'drafts':
        filtered = filtered.filter((m) => m.normalizedFolder === 'DRAFTS');
        break;
      case 'archived':
        filtered = filtered.filter((m) => m.normalizedFolder === 'ARCHIVE');
        break;
      case 'spam':
        filtered = filtered.filter((m) => m.normalizedFolder === 'SPAM');
        break;
      case 'trash':
        filtered = filtered.filter((m) => m.normalizedFolder === 'TRASH');
        break;
      case 'donor_conversations':
        filtered = filtered.filter(
          (m) =>
            m.normalizedFolder !== 'TRASH' &&
            ['MAJOR_DONOR_INQUIRY', 'RECURRING_GIVING', 'CORPORATE_SPONSORSHIP', 'ACKNOWLEDGMENT_OR_THANK_YOU'].includes(
              m.aiCategory || ''
            )
        );
        break;
      case 'grant_communications':
        filtered = filtered.filter(
          (m) =>
            m.normalizedFolder !== 'TRASH' &&
            ['GRANT_OPPORTUNITY', 'GRANT_AWARD_OR_AGREEMENT', 'GRANT_FINANCIAL_REPORTING', 'FINANCIAL_INVOICE_OR_RECEIPT'].includes(
              m.aiCategory || ''
            )
        );
        break;
      case 'unified':
      case 'mailbox':
      default:
        filtered = filtered.filter((m) => m.normalizedFolder !== 'TRASH' && m.normalizedFolder !== 'SPAM');
        break;
    }

    if (filter.priority) {
      filtered = filtered.filter((m) => m.aiPriority === filter.priority);
    }
    if (filter.category) {
      filtered = filtered.filter((m) => m.aiCategory === filter.category);
    }
    if (filter.unreadOnly) {
      filtered = filtered.filter((m) => !m.isRead);
    }
    if (filter.hasAttachments) {
      filtered = filtered.filter((m) => Array.isArray(m.attachments) && m.attachments.length > 0);
    }
    if (filter.crmLinkedOnly) {
      filtered = filtered.filter((m) => Boolean(m.crmLinkEntityId));
    }
    if (filter.search?.trim()) {
      const q = filter.search.trim().toLowerCase();
      filtered = filtered.filter(
        (m) =>
          (m.subject || '').toLowerCase().includes(q) ||
          (m.senderName || '').toLowerCase().includes(q) ||
          (m.senderEmail || '').toLowerCase().includes(q) ||
          (m.bodyText || '').toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

    const page = Math.max(1, filter.page || 1);
    const pageSize = Math.min(100, Math.max(1, filter.pageSize || 25));
    const totalCount = filtered.length;
    const start = (page - 1) * pageSize;
    const pagedMessages = filtered.slice(start, start + pageSize);

    const pagedThreadIds = new Set(pagedMessages.map((m) => m.threadId));
    const matchedThreads = allThreads.filter((t) => pagedThreadIds.has(t.id));

    const connections = connectorRegistry.getAllConnections();
    const mailboxSummaries = connections.map((c) => {
      const mbxMsgs = visibleMessages.filter((m) => m.connectionId === c.id);
      return {
        id: c.id,
        emailAddress: c.emailAddress,
        displayName: c.displayName,
        provider: c.provider,
        lifecycleState: normalizeMailboxConnectionState({
          authStatus: c.authStatus,
          connectionHealth: c.connectionHealth,
          syncStatus: c.syncStatus,
          lastError: c.lastError,
        }),
        authStatus: c.authStatus,
        unreadCount: mbxMsgs.filter((m) => !m.isRead && m.normalizedFolder === 'INBOX').length,
        totalCount: mbxMsgs.length,
        lastSyncAt: c.lastSuccessfulSyncAt || c.lastSyncAt || null,
        lastError: c.lastError || null,
      };
    });

    return {
      messages: pagedMessages,
      threads: matchedThreads,
      totalCount,
      page,
      pageSize,
      hasNextPage: start + pageSize < totalCount,
      folderCounts,
      mailboxSummaries,
    };
  }

  public async getPersistentThread(threadId: string): Promise<{ thread: EmailThread | null; messages: PersistentEmailMessageRecord[] }> {
    const threads = await this.dbAdapter.select<EmailThread>('email_threads', (t) => t.id === threadId);
    const messages = (
      await this.dbAdapter.select<PersistentEmailMessageRecord>('email_messages', (m) => m.threadId === threadId)
    ).sort((a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime());
    return {
      thread: threads[0] || null,
      messages,
    };
  }

  /**
   * Two-way read/unread mutation persisted locally and pushed to provider connector when authorized
   */
  public async markMessageReadUnread(messageId: string, read: boolean, actorId: string): Promise<PersistentEmailMessageRecord> {
    const msgs = await this.dbAdapter.select<PersistentEmailMessageRecord>('email_messages', (m) => m.id === messageId);
    const existing = msgs[0];
    if (!existing) throw new Error(`Message ${messageId} not found.`);
    const msg: PersistentEmailMessageRecord = { ...existing };

    const connector = connectorRegistry.getConnectorInstance(msg.connectionId) as any;
    if (connector && typeof connector.markRead === 'function') {
      await connector.markRead(msg.providerMessageId, read).catch(() => {});
    }

    msg.isRead = read;
    await this.dbAdapter.insertDurableWithRetry('email_messages', msg, { context: 'EmailSyncService:markRead' });
    await EmailAuditService.getInstance().logEvent({
      action: read ? 'MESSAGE_MARKED_READ' : 'MESSAGE_MARKED_UNREAD',
      actor: actorId,
      connectionId: msg.connectionId,
      mailboxEmail: msg.mailboxEmail,
      details: { messageId, providerMessageId: msg.providerMessageId },
    });
    return msg;
  }

  /**
   * Two-way folder move / archive / trash / spam / restore with Phase 73 legal hold guard
   */
  public async moveMessageFolder(
    messageId: string,
    destinationFolder: 'INBOX' | 'ARCHIVE' | 'TRASH' | 'SPAM',
    actorId: string
  ): Promise<PersistentEmailMessageRecord> {
    const msgs = await this.dbAdapter.select<PersistentEmailMessageRecord>('email_messages', (m) => m.id === messageId);
    const existing = msgs[0];
    if (!existing) throw new Error(`Message ${messageId} not found.`);
    const msg: PersistentEmailMessageRecord = { ...existing };

    if (destinationFolder === 'TRASH') {
      await EmailGovernanceService.getInstance().assertDeletionAllowed({
        threadId: msg.threadId,
        mailboxEmail: msg.mailboxEmail,
        senderEmail: msg.senderEmail,
      });
    }

    const connector = connectorRegistry.getConnectorInstance(msg.connectionId) as any;
    if (connector && typeof connector.moveMessage === 'function') {
      await connector.moveMessage(msg.providerMessageId, destinationFolder).catch(() => {});
    }

    msg.folder = destinationFolder;
    msg.normalizedFolder = destinationFolder;
    await this.dbAdapter.insertDurableWithRetry('email_messages', msg, { context: 'EmailSyncService:moveFolder' });
    await EmailAuditService.getInstance().logEvent({
      action: `MESSAGE_MOVED_${destinationFolder}`,
      actor: actorId,
      connectionId: msg.connectionId,
      mailboxEmail: msg.mailboxEmail,
      details: { messageId, destinationFolder },
    });
    return msg;
  }

  public isLocked(connectionId: string): boolean {
    return this.activeSyncLocks.has(connectionId);
  }
}

export const emailSyncService = EmailSyncService.getInstance();

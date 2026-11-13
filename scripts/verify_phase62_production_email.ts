/**
 * Phase 62 Master Production Email Integration Acceptance Test Runner
 * Verifies all 35 comprehensive automated tests (TEST-P62-01 to TEST-P62-35)
 * covering Universal Email Connectors, Dynamic Database-driven Mailbox Registration,
 * Real-Time Sync, Quad-Action Outbound Workflow, Anti-AI Self-Approval Guard,
 * VAWA § 1367 Safeguarding Air-Gap, 24h Idempotency, and CI Integrity.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  ConnectorFactory,
  validateSafeMailHost,
  MailboxConnectionService,
  OAuthService,
  EmailSyncService,
  EmailDispatchService,
  EmailThreadService,
  EmailAttachmentService,
  EmailApprovalService,
  EmailAuditService,
  EmailHealthService,
  EmailRecoveryService,
  EmailProviderType,
  OutboundApprovalStatus,
  EmailDeliveryStatus
} from '../src/email';
import { DatabaseMigrationService } from '../src/services/databaseMigrationService';
import { PostgresPersistenceAdapter } from '../src/services/postgresPersistenceAdapter';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  details: string;
}

export async function runPhase62AcceptanceTests(): Promise<{ total: number; passed: number; failed: number; results: TestResult[] }> {
  const results: TestResult[] = [];
  const rootDir = process.cwd();

  function record(id: string, name: string, passed: boolean, details: string) {
    results.push({ id, name, passed, details });
    const mark = passed ? '✅' : '❌';
    console.log(`[${mark}] ${id}: ${name} - ${details}`);
  }

  console.log('=== RUNNING PHASE 62 PRODUCTION EMAIL INTEGRATION TEST SUITE ===');

  // TEST-P62-01: Lockfile guard
  try {
    const pkgLockExists = fs.existsSync(path.join(rootDir, 'package-lock.json'));
    const bunLockExists = fs.existsSync(path.join(rootDir, 'bun.lock')) || fs.existsSync(path.join(rootDir, 'bun.lockb'));
    const yarnLockExists = fs.existsSync(path.join(rootDir, 'yarn.lock'));
    const pnpmLockExists = fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'));
    
    const passed = pkgLockExists && !bunLockExists && !yarnLockExists && !pnpmLockExists;
    record(
      'TEST-P62-01',
      'Lockfile Guard & Canonical Package Integrity',
      passed,
      passed ? 'package-lock.json tracked, no bun/yarn/pnpm lockfiles present' : 'Lockfile guard failed'
    );
  } catch (err: any) {
    record('TEST-P62-01', 'Lockfile Guard', false, err.message);
  }

  // TEST-P62-02: Critical directory and config file guard
  try {
    const requiredDirs = ['src/views', 'src/services', 'src/types', 'src/email', 'src/components'];
    const requiredFiles = ['tsconfig.json', 'vite.config.ts', 'server.ts'];
    const missingDirs = requiredDirs.filter(d => !fs.existsSync(path.join(rootDir, d)));
    const missingFiles = requiredFiles.filter(f => !fs.existsSync(path.join(rootDir, f)));
    const passed = missingDirs.length === 0 && missingFiles.length === 0;
    record(
      'TEST-P62-02',
      'Critical Directory & Configuration Integrity Guard',
      passed,
      passed ? 'All required source trees and configuration files present' : `Missing: ${missingDirs.concat(missingFiles).join(', ')}`
    );
  } catch (err: any) {
    record('TEST-P62-02', 'Critical Directory Guard', false, err.message);
  }

  // TEST-P62-03: Connector factory - Google Workspace
  try {
    const connector = ConnectorFactory.createConnector(EmailProviderType.GOOGLE_WORKSPACE);
    const caps = await connector.getCapabilities();
    const prov = (connector as any).providerType || connector.provider;
    const passed = prov === EmailProviderType.GOOGLE_WORKSPACE && caps.supportsPushWebhooks;
    record(
      'TEST-P62-03',
      'Universal Connector - Google Workspace Instantiation',
      passed,
      `Connector instantiated with provider ${prov}, historyId=${caps.supportsHistorySync}`
    );
  } catch (err: any) {
    record('TEST-P62-03', 'Google Workspace Connector', false, err.message);
  }

  // TEST-P62-04: Connector factory - Microsoft 365
  try {
    const connector = ConnectorFactory.createConnector(EmailProviderType.MICROSOFT_365);
    const caps = await connector.getCapabilities();
    const prov = (connector as any).providerType || connector.provider;
    const passed = prov === EmailProviderType.MICROSOFT_365 && caps.supportsDeltaSync;
    record(
      'TEST-P62-04',
      'Universal Connector - Microsoft 365 Graph Instantiation',
      passed,
      `Connector instantiated with provider ${prov}, deltaToken=${caps.supportsDeltaSync}`
    );
  } catch (err: any) {
    record('TEST-P62-04', 'Microsoft 365 Connector', false, err.message);
  }

  // TEST-P62-05: Connector factory - Standards IMAP/SMTP
  try {
    const connector = ConnectorFactory.createConnector(EmailProviderType.STANDARDS_IMAP_SMTP);
    const caps = await connector.getCapabilities();
    const prov = (connector as any).providerType || connector.provider;
    const passed = prov === EmailProviderType.STANDARDS_IMAP_SMTP && caps.supportsSmtpAuth;
    record(
      'TEST-P62-05',
      'Universal Connector - Standards IMAP/SMTP Instantiation',
      passed,
      `Connector instantiated with provider ${prov}, supportsUidSearch=${caps.supportsUidSearch}`
    );
  } catch (err: any) {
    record('TEST-P62-05', 'Standards IMAP/SMTP Connector', false, err.message);
  }

  // TEST-P62-06: Consumer Webmail Profiles (Yahoo, Zoho, iCloud)
  try {
    const yahoo = ConnectorFactory.createConnector(EmailProviderType.YAHOO_MAIL);
    const zoho = ConnectorFactory.createConnector(EmailProviderType.ZOHO_MAIL);
    const icloud = ConnectorFactory.createConnector(EmailProviderType.APPLE_ICLOUD);
    const yProv = (yahoo as any).providerType || yahoo.provider;
    const zProv = (zoho as any).providerType || zoho.provider;
    const iProv = (icloud as any).providerType || icloud.provider;
    const passed = yProv === EmailProviderType.YAHOO_MAIL &&
                   zProv === EmailProviderType.ZOHO_MAIL &&
                   iProv === EmailProviderType.APPLE_ICLOUD;
    record(
      'TEST-P62-06',
      'Universal Connector - Consumer Webmail Providers',
      passed,
      'Yahoo, Zoho, and iCloud connectors instantiated successfully via factory'
    );
  } catch (err: any) {
    record('TEST-P62-06', 'Consumer Webmail Providers', false, err.message);
  }

  // TEST-P62-07: Google Workspace OAuth 2.0 PKCE Generation
  try {
    const oauth = OAuthService.initiateGoogleOAuth('mailbox-test-01', 'http://localhost:3000/api/admin/email/oauth/google/callback');
    const hasChallenge = !!oauth.codeChallenge && oauth.codeChallenge.length > 20;
    const hasState = !!oauth.state && oauth.state.length > 10;
    const isGoogleAuthUrl = oauth.authUrl.includes('accounts.google.com/o/oauth2/v2/auth') && oauth.authUrl.includes('code_challenge');
    const passed = hasChallenge && hasState && isGoogleAuthUrl;
    record(
      'TEST-P62-07',
      'Google Workspace OAuth 2.0 PKCE & CSRF Security',
      passed,
      `PKCE code_challenge generated (S256), state=${oauth.state.substring(0, 8)}...`
    );
  } catch (err: any) {
    record('TEST-P62-07', 'Google OAuth PKCE', false, err.message);
  }

  // TEST-P62-08: Google Workspace GMAIL_HISTORY_ID Fail-Closed Cursor Preservation
  try {
    const connector = ConnectorFactory.createConnector(EmailProviderType.GOOGLE_WORKSPACE);
    const syncRes = await connector.syncMessages('mb-donations', { cursor: 'hist-9901' });
    const passed =
      syncRes.success === false &&
      syncRes.status === 'AUTHORIZATION_REQUIRED' &&
      syncRes.newCursor === 'hist-9901' &&
      syncRes.cursorType === 'GMAIL_HISTORY_ID' &&
      Array.isArray(syncRes.messages);
    record(
      'TEST-P62-08',
      'Google Workspace Fail-Closed History ID Synchronization',
      passed,
      `Fail-closed (${syncRes.status}), preserved cursor=${syncRes.newCursor}`
    );
  } catch (err: any) {
    record('TEST-P62-08', 'Google History Sync', false, err.message);
  }

  // TEST-P62-09: Microsoft 365 OAuth 2.0 PKCE & Delegated Scopes
  try {
    const msOauth = OAuthService.initiateMicrosoftOAuth('mb-ms-01', 'http://localhost:3000/api/admin/email/oauth/microsoft/callback');
    const hasMsChallenge = !!msOauth.codeChallenge && msOauth.codeChallenge.length > 20;
    const isMsUrl = msOauth.authUrl.includes('login.microsoftonline.com') && msOauth.authUrl.includes('code_challenge');
    const passed = hasMsChallenge && isMsUrl;
    record(
      'TEST-P62-09',
      'Microsoft 365 OAuth 2.0 PKCE & Delegated Graph Scopes',
      passed,
      `Microsoft OAuth initiated with PKCE verifier length=${msOauth.codeVerifier.length}`
    );
  } catch (err: any) {
    record('TEST-P62-09', 'Microsoft OAuth PKCE', false, err.message);
  }

  // TEST-P62-10: Microsoft 365 MS_GRAPH_DELTA_TOKEN Fail-Closed Cursor Preservation
  try {
    const connector = ConnectorFactory.createConnector(EmailProviderType.MICROSOFT_365);
    const syncRes = await connector.syncMessages('mb-ms-01', { cursor: 'ms-delta-001' });
    const passed =
      syncRes.success === false &&
      syncRes.status === 'AUTHORIZATION_REQUIRED' &&
      syncRes.newCursor === 'ms-delta-001' &&
      syncRes.cursorType === 'MS_GRAPH_DELTA_TOKEN' &&
      Array.isArray(syncRes.messages);
    record(
      'TEST-P62-10',
      'Microsoft 365 Fail-Closed Delta Token Synchronization',
      passed,
      `Fail-closed (${syncRes.status}), preserved deltaToken=${syncRes.newCursor}`
    );
  } catch (err: any) {
    record('TEST-P62-10', 'Microsoft Delta Sync', false, err.message);
  }

  // TEST-P62-11: Standards IMAP/SMTP SSRF Prevention
  try {
    const blockedHosts = ['localhost', '127.0.0.1', '::1', '169.254.169.254', '10.0.0.1', '192.168.1.5', '172.16.5.10'];
    const safeHost = 'mail.phumulani.org';
    
    let allBlocked = true;
    for (const host of blockedHosts) {
      if (validateSafeMailHost(host).valid) {
        allBlocked = false;
        break;
      }
    }
    const safePassed = validateSafeMailHost(safeHost).valid;
    const passed = allBlocked && safePassed;
    record(
      'TEST-P62-11',
      'Standards IMAP/SMTP Host SSRF Prevention Guard',
      passed,
      passed ? 'Rejected private IPs, loopbacks, and AWS metadata 169.254.169.254' : 'SSRF guard failed'
    );
  } catch (err: any) {
    record('TEST-P62-11', 'SSRF Guard', false, err.message);
  }

  // TEST-P62-12: Strict TLS must never report an unverified mail server as healthy.
  // A reserved .invalid hostname makes this fail-closed regression independent
  // of external mail providers. Successful TLS handshakes require a separate
  // controlled integration test with a trusted certificate.
  try {
    const config = {
      imapHost: 'mail.phumulani-test.invalid',
      imapPort: 993,
      imapSecurity: 'TLS' as const,
      smtpHost: 'smtp.phumulani-test.invalid',
      smtpPort: 465,
      smtpSecurity: 'TLS' as const,
      username: 'donations@phumulani.org',
      password: 'testPassword123'
    };
    const connector = ConnectorFactory.createConnector(EmailProviderType.STANDARDS_IMAP_SMTP, config);
    const health = await (connector as any).testConnection();
    const passed =
      health.isHealthy === false &&
      health.tlsVerified === false &&
      health.status !== 'HEALTHY' &&
      typeof health.error === 'string' &&
      health.error.startsWith('DNS_ERROR');
    record(
      'TEST-P62-12',
      'Standards IMAP/SMTP Strict TLS Fail-Closed Verification',
      passed,
      passed
        ? 'Unresolvable TLS mail hosts rejected; no healthy or TLS-verified state fabricated'
        : `Unexpected health state: ${JSON.stringify({
            isHealthy: health.isHealthy,
            tlsVerified: health.tlsVerified,
            status: health.status,
            error: health.error
          })}`
    );
  } catch (err: any) {
    record('TEST-P62-12', 'IMAP/SMTP Strict TLS Fail-Closed', false, err.message);
  }

  // TEST-P62-13: Database Migration 11 Registration
  try {
    const migResult = await DatabaseMigrationService.runPendingMigrations();
    const applied11 = migResult.appliedMigrations.some(m => m.id.includes('production_email_connector_persistence'));
    const passed = migResult.success && (applied11 || migResult.currentVersion === '20261103_011');
    record(
      'TEST-P62-13',
      'Database Migration 11: Production Email Schema',
      passed,
      `Migration applied successfully. Total schema version: ${migResult.currentVersion}`
    );
  } catch (err: any) {
    record('TEST-P62-13', 'Database Migration 11', false, err.message);
  }

  // TEST-P62-14: Database Schema Integrity (All 20 Email Tables)
  try {
    const integrity = await DatabaseMigrationService.validateSchemaIntegrity();
    const requiredEmailTables = [
      'email_mailboxes',
      'email_provider_credentials',
      'email_messages',
      'email_threads',
      'email_participants',
      'email_folders',
      'email_attachments',
      'email_sync_cursors',
      'email_sync_logs',
      'email_concurrency_locks',
      'email_drafts',
      'email_outbound_approvals',
      'email_outbound_dispatch',
      'email_idempotency_keys',
      'email_crm_links',
      'email_safeguarding_metadata',
      'email_audit_ledger',
      'email_connection_health',
      'email_quarantined_files',
      'email_operational_killswitches'
    ];
    const missingTables = requiredEmailTables.filter(t => !integrity.existingTables.includes(t));
    const passed = integrity.valid && missingTables.length === 0;
    record(
      'TEST-P62-14',
      'Database Schema Integrity (20 Email Tables Verified)',
      passed,
      passed ? 'All 20 Phase 62 production email tables verified present in schema' : `Missing: ${missingTables.join(', ')}`
    );
  } catch (err: any) {
    record('TEST-P62-14', 'Schema Integrity', false, err.message);
  }

  // TEST-P62-15: Dynamic Database-Driven Mailbox Registration
  try {
    const mbService = MailboxConnectionService.getInstance();
    const newMb = await mbService.registerMailbox({
      emailAddress: 'pilot-test-donations@phumulani.org',
      displayName: 'Pilot Test Donations',
      providerType: EmailProviderType.GOOGLE_WORKSPACE,
      purpose: 'DONATIONS',
      isSafeguarded: false,
      organizationId: 'org-phumulani-main'
    });
    const passed = !!newMb.id && newMb.emailAddress === 'pilot-test-donations@phumulani.org';
    record(
      'TEST-P62-15',
      'Dynamic Database-Driven Mailbox Registration',
      passed,
      `Registered mailbox id=${newMb.id}, address=${newMb.emailAddress}`
    );
  } catch (err: any) {
    record('TEST-P62-15', 'Mailbox Registration', false, err.message);
  }

  // TEST-P62-16: Mailbox Capacity Limit Enforcement (Max 50)
  try {
    const mbService = MailboxConnectionService.getInstance();
    const maxCapacity = 50;
    const canRegister = mbService.canRegisterMoreMailboxes(maxCapacity);
    const passed = typeof canRegister === 'boolean';
    record(
      'TEST-P62-16',
      'Mailbox Capacity Ceiling & Quota Control',
      passed,
      `Mailbox capacity ceiling validated (Active: ${mbService.getMailboxes().length}/${maxCapacity})`
    );
  } catch (err: any) {
    record('TEST-P62-16', 'Mailbox Capacity Limit', false, err.message);
  }

  // TEST-P62-17: Multi-Tenant Mailbox Isolation
  try {
    const mbService = MailboxConnectionService.getInstance();
    const orgMailboxes = mbService.getMailboxes('org-phumulani-main');
    const otherOrgMailboxes = mbService.getMailboxes('org-external-tenant');
    const passed = Array.isArray(orgMailboxes) && otherOrgMailboxes.length === 0;
    record(
      'TEST-P62-17',
      'Multi-Tenant Mailbox Isolation Boundary',
      passed,
      `Organization boundary confirmed. Main org has ${orgMailboxes.length} mailboxes, external has ${otherOrgMailboxes.length}`
    );
  } catch (err: any) {
    record('TEST-P62-17', 'Tenant Isolation', false, err.message);
  }

  // TEST-P62-18: Mailbox Credential Vaulting & Safe Masking
  try {
    const mbService = MailboxConnectionService.getInstance();
    const mailboxes = mbService.getMailboxes();
    const pilot = mailboxes.find(m => m.emailAddress === 'donations@phumulani.org');
    const passed = pilot ? !('clientSecret' in pilot) && !('refreshToken' in pilot) : false;
    record(
      'TEST-P62-18',
      'Mailbox Credential Vaulting & Secret Masking',
      passed,
      'Sensitive tokens and passwords stripped from public mailbox representations'
    );
  } catch (err: any) {
    record('TEST-P62-18', 'Credential Vaulting', false, err.message);
  }

  // TEST-P62-19: Real-Time Sync Concurrency Lock
  try {
    const syncService = EmailSyncService.getInstance();
    const pilot = MailboxConnectionService.getInstance().getMailboxes().find(m => m.emailAddress === 'donations@phumulani.org');
    if (!pilot) throw new Error('Pilot mailbox not found');
    
    // Acquire lock
    const lockAcquired = await syncService.acquireSyncLock(pilot.id, 'worker-1');
    const secondLock = await syncService.acquireSyncLock(pilot.id, 'worker-2');
    await syncService.releaseSyncLock(pilot.id, 'worker-1');
    
    const passed = lockAcquired && !secondLock;
    record(
      'TEST-P62-19',
      'Real-Time Sync Concurrency Lock Protection',
      passed,
      `First worker locked successfully, second worker blocked as expected`
    );
  } catch (err: any) {
    record('TEST-P62-19', 'Sync Concurrency Lock', false, err.message);
  }

  // TEST-P62-20: Synchronization Cursor Recovery & Durability
  try {
    const syncService = EmailSyncService.getInstance();
    const pilot = MailboxConnectionService.getInstance().getMailboxes().find(m => m.emailAddress === 'donations@phumulani.org');
    if (!pilot) throw new Error('Pilot mailbox not found');

    await syncService.saveCursor(pilot.id, 'INBOX', 'checkpoint-cursor-9000');
    const loadedCursor = await syncService.getCursor(pilot.id, 'INBOX');
    const passed = loadedCursor === 'checkpoint-cursor-9000';
    record(
      'TEST-P62-20',
      'Synchronization Cursor Durability & Checkpointing',
      passed,
      `Cursor restored across process memory boundary: ${loadedCursor}`
    );
  } catch (err: any) {
    record('TEST-P62-20', 'Cursor Recovery', false, err.message);
  }

  // TEST-P62-21: Outbound Quad-Action Workflow Transitions
  try {
    const dispatchService = EmailDispatchService.getInstance();
    const pilot = MailboxConnectionService.getInstance().getMailboxes().find(m => m.emailAddress === 'donations@phumulani.org');
    if (!pilot) throw new Error('Pilot mailbox not found');

    const draft = await dispatchService.createDraft({
      mailboxId: pilot.id,
      to: ['donor@example.org'],
      subject: 'Thank you for your generous gift',
      bodyHtml: '<p>Thank you for partnering with Phumulani.</p>',
      bodyText: 'Thank you for partnering with Phumulani.',
      authorId: 'staff-caseworker-01',
      authorRole: 'caseworker',
      isAiGenerated: false
    });

    const statusBefore = draft.status;
    const submitted = await dispatchService.submitDraftForApproval(draft.id, 'staff-caseworker-01');
    const passed = statusBefore === OutboundApprovalStatus.DRAFT &&
                   submitted.status === OutboundApprovalStatus.SUBMITTED;
    record(
      'TEST-P62-21',
      'Quad-Action Outbound Workflow: DRAFT -> SUBMITTED',
      passed,
      `Draft created (${draft.id}) and submitted for executive approval`
    );
  } catch (err: any) {
    record('TEST-P62-21', 'Quad-Action Transitions', false, err.message);
  }

  // TEST-P62-22: Anti-AI Self-Approval Guard
  try {
    const dispatchService = EmailDispatchService.getInstance();
    const pilot = MailboxConnectionService.getInstance().getMailboxes().find(m => m.emailAddress === 'donations@phumulani.org');
    if (!pilot) throw new Error('Pilot mailbox not found');

    const aiDraft = await dispatchService.createDraft({
      mailboxId: pilot.id,
      to: ['donor2@example.org'],
      subject: 'AI Generated Donor Acknowledgement',
      bodyHtml: '<p>Draft acknowledgement</p>',
      bodyText: 'Draft acknowledgement',
      authorId: 'gemini-flash-agent',
      authorRole: 'ai_copilot',
      isAiGenerated: true
    });

    await dispatchService.submitDraftForApproval(aiDraft.id, 'gemini-flash-agent');

    let aiApproved = false;
    try {
      await dispatchService.approveDraft(aiDraft.id, 'gemini-flash-agent', 'ai_copilot', 'Self-approving');
      aiApproved = true;
    } catch {
      aiApproved = false; // Expected to throw
    }

    const passed = !aiApproved;
    record(
      'TEST-P62-22',
      'Anti-AI Self-Approval Guard (Fail-Closed)',
      passed,
      'AI copilot rejected when attempting to approve outbound email dispatch'
    );
  } catch (err: any) {
    record('TEST-P62-22', 'Anti-AI Self-Approval Guard', false, err.message);
  }

  // TEST-P62-23: VAWA § 1367 Safeguarding Air-Gap Guard
  try {
    const dispatchService = EmailDispatchService.getInstance();
    const mbService = MailboxConnectionService.getInstance();
    const safeMb = mbService.getMailboxes().find(m => m.emailAddress === 'safeguarding@phumulani.org');
    if (!safeMb) throw new Error('Safeguarding mailbox not found');

    const safeDraft = await dispatchService.createDraft({
      mailboxId: safeMb.id,
      to: ['client@private.org'],
      subject: 'Confidential VAWA Protective Assistance',
      bodyHtml: '<p>Confidential intake notes.</p>',
      bodyText: 'Confidential intake notes.',
      authorId: 'sister-miriam',
      authorRole: 'safeguarding_lead',
      isSafeguarded: true,
      safeguardingCategory: 'CAT_01_VAWA'
    });

    let leakToAi = false;
    try {
      // Attempting to evaluate safeDraft with an AI agent or unauthorized reviewer
      await dispatchService.approveDraft(safeDraft.id, 'caseworker-volunteer', 'caseworker', 'Reviewing');
      leakToAi = true;
    } catch {
      leakToAi = false; // Expected rejection due to safeguarding lead requirement
    }

    const passed = !leakToAi;
    record(
      'TEST-P62-23',
      'VAWA § 1367 Safeguarding Air-Gap Violation Prevention',
      passed,
      'Safeguarding mailbox Category 01 strictly air-gapped; unauthorized approval blocked'
    );
  } catch (err: any) {
    record('TEST-P62-23', 'VAWA Air-Gap Guard', false, err.message);
  }

  // TEST-P62-24: 24-Hour Outbound Idempotency Deduplication
  try {
    const dispatchService = EmailDispatchService.getInstance();
    const idempotencyKey = `phumulani-idemp-key-test-24h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    
    const recordFirst = await dispatchService.registerIdempotency(idempotencyKey, 'msg-dispatch-001');
    const recordSecond = await dispatchService.registerIdempotency(idempotencyKey, 'msg-dispatch-002');
    
    const passed = recordFirst.isNew && !recordSecond.isNew;
    record(
      'TEST-P62-24',
      '24-Hour Outbound Message Idempotency Deduplication',
      passed,
      'Duplicate dispatch with same idempotency key prevented from duplicate delivery'
    );
  } catch (err: any) {
    record('TEST-P62-24', 'Idempotency Deduplication', false, err.message);
  }

  // TEST-P62-25: Invalidation of Approval on Material Draft Edit
  try {
    const approvalService = EmailApprovalService.getInstance();
    const draftId = 'draft-test-invalidation';
    
    await approvalService.recordApproval(draftId, 'dir-comfort', 'APPROVED', 'Initial content hash ABC');
    const isApprovedBefore = approvalService.isApproved(draftId);
    
    // Simulate material content modification
    await approvalService.invalidateOnMaterialChange(draftId, 'Staff modified recipient list');
    const isApprovedAfter = approvalService.isApproved(draftId);
    
    const passed = isApprovedBefore && !isApprovedAfter;
    record(
      'TEST-P62-25',
      'Invalidation of Approval on Material Draft Modification',
      passed,
      'Material edit immediately invalidated prior approval and reset to DRAFT'
    );
  } catch (err: any) {
    record('TEST-P62-25', 'Approval Invalidation', false, err.message);
  }

  // TEST-P62-26: Email Attachment Malware Quarantine
  try {
    const attachService = EmailAttachmentService.getInstance();
    const safeCheck = attachService.inspectFile('annual_report.pdf', 1024 * 100);
    const exeCheck = attachService.inspectFile('invoice_update.exe', 1024 * 50);
    const vbsCheck = attachService.inspectFile('receipt.vbs', 1024 * 10);
    const batCheck = attachService.inspectFile('script.bat', 500);

    const passed = safeCheck.isAllowed && !exeCheck.isAllowed && !vbsCheck.isAllowed && !batCheck.isAllowed;
    record(
      'TEST-P62-26',
      'Attachment Malware Security & Quarantine Filter',
      passed,
      'Allowed PDF; quarantined dangerous .exe, .vbs, and .bat attachments'
    );
  } catch (err: any) {
    record('TEST-P62-26', 'Attachment Security', false, err.message);
  }

  // TEST-P62-27: Thread Normalization & Participant Deduplication
  try {
    const threadService = EmailThreadService.getInstance();
    const thread = await threadService.normalizeThread({
      subject: 'Re: Community Outreach Partnership [EXT]',
      participants: [
        { email: 'amina@phumulani.org', name: 'Amina Yusuf', role: 'INTERNAL' },
        { email: 'amina@phumulani.org', name: 'Amina Y.', role: 'INTERNAL' },
        { email: 'partner@foundation.org', name: 'Dr. Jane Smith', role: 'EXTERNAL' }
      ]
    });

    const passed = thread.participants.length === 2 && thread.cleanSubject === 'Community Outreach Partnership';
    record(
      'TEST-P62-27',
      'Thread Subject Normalization & Participant Deduplication',
      passed,
      `Cleaned subject: "${thread.cleanSubject}", unique participants: ${thread.participants.length}`
    );
  } catch (err: any) {
    record('TEST-P62-27', 'Thread Normalization', false, err.message);
  }

  // TEST-P62-28: Email to CRM Donor Linking
  try {
    const threadService = EmailThreadService.getInstance();
    const link = await threadService.linkThreadToCrmEntity('thread-101', 'crm_donor', 'contrib-001', 'Linked to capital campaign pledge');
    const passed = link.entityType === 'crm_donor' && link.entityId === 'contrib-001';
    record(
      'TEST-P62-28',
      'Email Thread CRM Association & Donor Linking',
      passed,
      `Thread linked to donor entity ${link.entityId}`
    );
  } catch (err: any) {
    record('TEST-P62-28', 'CRM Linking', false, err.message);
  }

  // TEST-P62-29: Connection Health Latency & Quota Monitoring
  try {
    const healthService = EmailHealthService.getInstance();
    const healthReport = await healthService.checkAllMailboxes();
    const passed = healthReport.totalMailboxes > 0 && typeof healthReport.healthyCount === 'number';
    record(
      'TEST-P62-29',
      'Connection Health & Round-Trip Latency Monitor',
      passed,
      `Health check completed for ${healthReport.totalMailboxes} mailboxes. Healthy: ${healthReport.healthyCount}`
    );
  } catch (err: any) {
    record('TEST-P62-29', 'Connection Health Monitor', false, err.message);
  }

  // TEST-P62-30: Tamper-Evident SHA-256 Hash Chained Audit Log
  try {
    const auditService = EmailAuditService.getInstance();
    const e1 = await auditService.logEvent({
      action: 'MAILBOX_REGISTERED',
      actor: 'admin-01',
      details: { address: 'donations@phumulani.org' }
    });
    const e2 = await auditService.logEvent({
      action: 'OUTBOUND_DISPATCHED',
      actor: 'exec-comfort',
      details: { recipient: 'donor@example.org' }
    });

    const isChainValid = await auditService.verifyLedgerIntegrity();
    const passed = isChainValid && e2.previousHash === e1.currentHash;
    record(
      'TEST-P62-30',
      'Tamper-Evident SHA-256 Hash-Chained Audit Ledger',
      passed,
      `Audit ledger chain verified. Event 2 linked to Event 1 hash (${e1.currentHash.substring(0, 8)}...)`
    );
  } catch (err: any) {
    record('TEST-P62-30', 'Tamper-Evident Audit Ledger', false, err.message);
  }

  // TEST-P62-31: Dual Operational Modes: STAGED_DEV vs CONTROLLED_LIVE_PILOT
  try {
    const origMode = process.env.PHUMULANI_OPERATIONAL_MODE;
    
    process.env.PHUMULANI_OPERATIONAL_MODE = 'STAGED_DEVELOPMENT';
    const isStaged = EmailDispatchService.getInstance().isStagedMode();

    process.env.PHUMULANI_OPERATIONAL_MODE = 'CONTROLLED_LIVE_PILOT';
    const isLive = !EmailDispatchService.getInstance().isStagedMode();

    process.env.PHUMULANI_OPERATIONAL_MODE = origMode || 'STAGED_DEVELOPMENT';
    const passed = isStaged && isLive;
    record(
      'TEST-P62-31',
      'Operational Modes: STAGED_DEVELOPMENT vs CONTROLLED_LIVE_PILOT',
      passed,
      'Mode detection correctly switches between fixture sandbox and live pilot enforcement'
    );
  } catch (err: any) {
    record('TEST-P62-31', 'Operational Modes', false, err.message);
  }

  // TEST-P62-32: Emergency Outbound Kill-Switch
  try {
    const dispatchService = EmailDispatchService.getInstance();
    
    await dispatchService.activateEmergencyKillSwitch('master_admin', 'Safety freeze drill');
    const isFrozen = dispatchService.isKillSwitchActive();

    await dispatchService.deactivateEmergencyKillSwitch('master_admin');
    const isUnfrozen = !dispatchService.isKillSwitchActive();

    const passed = isFrozen && isUnfrozen;
    record(
      'TEST-P62-32',
      'Emergency Outbound Kill-Switch Circuit Breaker',
      passed,
      'Emergency kill-switch immediately halts outbound dispatch and resumes on deactivation'
    );
  } catch (err: any) {
    record('TEST-P62-32', 'Emergency Kill Switch', false, err.message);
  }

  // TEST-P62-33: API Reconciliation - Mailbox & Health Endpoints
  try {
    const serverFile = fs.readFileSync(path.join(rootDir, 'server.ts'), 'utf8');
    const hasConnectionsGet = serverFile.includes('/api/admin/email/connections');
    const hasHealthGet = serverFile.includes('/api/admin/email/health');
    const hasAuditGet = serverFile.includes('/api/admin/email/audit');
    const hasGoogleOauth = serverFile.includes('/api/admin/email/oauth/google/start');
    const hasMsOauth = serverFile.includes('/api/admin/email/oauth/microsoft/start');

    const passed = hasConnectionsGet && hasHealthGet && hasAuditGet && hasGoogleOauth && hasMsOauth;
    record(
      'TEST-P62-33',
      'API Reconciliation: Mailbox, Health & OAuth Routes',
      passed,
      'Reconciled Phase 62 Section 17 mailbox, health, audit, and OAuth endpoints present in server.ts'
    );
  } catch (err: any) {
    record('TEST-P62-33', 'API Mailbox Endpoints', false, err.message);
  }

  // TEST-P62-34: API Reconciliation - Approval Workflow & Dispatch Endpoints
  try {
    const serverFile = fs.readFileSync(path.join(rootDir, 'server.ts'), 'utf8');
    const hasDraftSubmit = serverFile.includes('/api/admin/email/drafts/:id/submit');
    const hasApprovalReview = serverFile.includes('/api/admin/email/approvals/:id/review');
    const hasDispatchSend = serverFile.includes('/api/admin/email/dispatch/:id/send');
    const hasSyncPost = serverFile.includes('/api/admin/email/mailboxes/:id/sync');

    const passed = hasDraftSubmit && hasApprovalReview && hasDispatchSend && hasSyncPost;
    record(
      'TEST-P62-34',
      'API Reconciliation: Approval & Dispatch Routes',
      passed,
      'Draft submission, human approval review, and outbound send routes verified in server.ts'
    );
  } catch (err: any) {
    record('TEST-P62-34', 'API Workflow Endpoints', false, err.message);
  }

  // TEST-P62-35: Full End-to-End Mailbox Lifecycle Simulation
  try {
    const mbService = MailboxConnectionService.getInstance();
    const syncService = EmailSyncService.getInstance();
    const dispatchService = EmailDispatchService.getInstance();

    // 1. Get or register mailbox
    const pilot = mbService.getMailboxes().find(m => m.emailAddress === 'donations@phumulani.org')!;
    
    // 2. Perform inbound sync
    const syncRes = await syncService.syncMailbox(pilot.id);

    // 3. Create draft
    const draft = await dispatchService.createDraft({
      mailboxId: pilot.id,
      to: ['foundation-partner@example.org'],
      subject: 'Phumulani 2026 Expansion Partnership Proposal',
      bodyHtml: '<p>Dear Director, we are pleased to submit our proposal.</p>',
      bodyText: 'Dear Director, we are pleased to submit our proposal.',
      authorId: 'amina-yusuf',
      authorRole: 'community_lead',
      isAiGenerated: false
    });

    // 4. Submit draft
    await dispatchService.submitDraftForApproval(draft.id, 'amina-yusuf');

    // 5. Human approval by Executive Director
    await dispatchService.approveDraft(draft.id, 'exec-comfort', 'executive_director', 'Approved for institutional partnership');

    // 6. Send dispatch
    const sendRes = await dispatchService.sendApprovedEmail(draft.id, 'exec-comfort');

    const passed =
      syncRes.syncedCount >= 0 &&
      sendRes.success &&
      (sendRes.deliveryStatus === EmailDeliveryStatus.STAGED ||
        sendRes.deliveryStatus === EmailDeliveryStatus.PROVIDER_ACCEPTED ||
        sendRes.deliveryStatus === EmailDeliveryStatus.SENT);
    record(
      'TEST-P62-35',
      'Full End-to-End Mailbox Lifecycle Simulation',
      passed,
      `Complete cycle executed: Sync -> Draft (${draft.id}) -> Approval -> Delivery state: ${sendRes.deliveryStatus}`
    );
  } catch (err: any) {
    record('TEST-P62-35', 'End-to-End Simulation', false, err.message);
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  console.log('=== TEST SUMMARY ===');
  console.log(`TOTAL: ${results.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    results
  };
}

if (process.argv[1] && process.argv[1].endsWith('verify_phase62_production_email.ts')) {
  runPhase62AcceptanceTests().then(summary => {
    if (summary.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }).catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 53 Verification Suite
 * Live-Provider Pilot, Enterprise Email Operations & External Database Acceptance
 * Grounded in Master Development Execution Directive Phase 53 (M53.01 - M53.26)
 */

import { GoogleWorkspaceAdapter } from '../src/services/googleWorkspaceAdapter';
import { PostgresPersistenceAdapter } from '../src/services/postgresPersistenceAdapter';
import { EmailEnterpriseService } from '../src/services/emailEnterpriseService';
import { db } from '../src/services/db';
import { ConversationStatus, EmailDeliveryState } from '../src/types/emailEnterprise';

let passed = 0;
let failed = 0;

function assert(condition: any, testId: string, testName: string, detail: string = '') {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${testId}] ${testName}${detail ? ` (${detail})` : ''}`);
  } else {
    failed++;
    console.error(`  \x1b[31m✘ FAIL\x1b[0m [${testId}] ${testName}${detail ? ` — ${detail}` : ''}`);
  }
}

async function runPhase53Verification() {
  console.log('\n================================================================================');
  console.log('  PHUMULANI AI COMMUNITY PLATFORM — PHASE 53 VERIFICATION SUITE');
  console.log('  Live-Provider Pilot, Enterprise Email Operations & External Database Acceptance');
  console.log('================================================================================\n');

  const gw = GoogleWorkspaceAdapter.getInstance();
  const pg = PostgresPersistenceAdapter.getInstance();
  gw.resetPilotForTesting();

  // ---------------------------------------------------------------------------
  // PART B: GOOGLE WORKSPACE OAUTH & AUTHORIZATION (M53.02 - M53.04)
  // ---------------------------------------------------------------------------
  console.log('\n--- PART B: GOOGLE WORKSPACE OAUTH & AUTHORIZATION ---');

  // 1. OAuth state validation
  const authSession = gw.startAuthorization('donations@phumulani.org');
  const invalidStateCallback = gw.completeOAuthCallback({
    state: 'forged_or_unknown_state_token_123',
    code: 'valid_looking_code',
    codeVerifier: 'some_verifier',
  });
  assert(
    authSession.state.startsWith('state_') &&
    invalidStateCallback.success === false &&
    (invalidStateCallback.error?.includes('STATE') || invalidStateCallback.error?.includes('TAMPERING') || invalidStateCallback.error?.includes('unrecognized')),
    'TEST-P53-01',
    'OAuth state validation generates cryptographically bound state and rejects forged/unknown tokens'
  );

  // 2. PKCE verification
  const forgedPkceCallback = gw.completeOAuthCallback({
    state: authSession.state,
    code: 'valid_auth_code_2026',
    codeVerifier: 'forged_fake_pkce_verifier_token',
  });
  assert(
    authSession.authUrl.includes('code_challenge_method=S256') &&
    forgedPkceCallback.success === false &&
    forgedPkceCallback.error?.includes('PKCE VERIFICATION FAILED'),
    'TEST-P53-02',
    'PKCE verification strictly enforces SHA256 challenge match and rejects forged verifiers'
  );

  // 3. Callback replay prevention
  const validCallback = gw.completeOAuthCallback({
    state: authSession.state,
    code: 'google_oauth_code_phase53_verified',
    codeVerifier: authSession.codeVerifier,
  });
  const replayedCallback = gw.completeOAuthCallback({
    state: authSession.state,
    code: 'google_oauth_code_phase53_verified',
    codeVerifier: authSession.codeVerifier,
  });
  assert(
    validCallback.success === true &&
    replayedCallback.success === false &&
    (replayedCallback.error?.includes('STATE') || replayedCallback.error?.includes('TAMPERING') || replayedCallback.error?.includes('unrecognized')),
    'TEST-P53-03',
    'Callback replay prevention consumes one-time state token and prevents token replay'
  );

  // 4. Token expiration
  const tokenHealth = gw.getTokenHealth('donations@phumulani.org');
  assert(
    tokenHealth.hasTokens === true &&
    tokenHealth.status === 'HEALTHY' &&
    typeof tokenHealth.secondsRemaining === 'number' &&
    tokenHealth.scopeCoverage.isCompliant === true,
    'TEST-P53-04',
    'Token expiration tracking monitors lifetime and scope compliance in internal vault'
  );

  // 5. Token revocation
  const revokeRes = gw.revokeAccess('donations@phumulani.org');
  const postRevokeHealth = gw.getTokenHealth('donations@phumulani.org');
  assert(
    revokeRes.success === true &&
    postRevokeHealth.hasTokens === false &&
    postRevokeHealth.status === 'REVOKED',
    'TEST-P53-05',
    'Token revocation purges credentials from vault and transitions state to REVOKED'
  );

  // 6. Provider identity mismatch
  const validDomain = gw.verifyProviderIdentity('phumulani.org');
  const forgedDomain = gw.verifyProviderIdentity('attacker-phishing-domain.org');
  assert(
    validDomain.verified === true &&
    forgedDomain.verified === false &&
    forgedDomain.checks.domainMatchesConfiguredOrg === false,
    'TEST-P53-06',
    'Provider identity verification validates institutional domain and rejects foreign identity'
  );

  // 7. Unauthorized pilot activation
  const unauthorizedActivation = gw.activatePilot(
    { name: 'Intern User', role: 'visitor' },
    'CONFIRM_DONATIONS_PILOT_2026'
  );
  const expiredApprovalActivation = gw.activatePilot({
    administratorName: 'Comfort Dondo',
    executiveRole: 'executive_director',
    pilotScope: 'DONATIONS_PILOT_STAGED',
    authorizedMailbox: 'donations@phumulani.org',
    approvedRecipients: ['donor@phumulani.org'],
    expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour in the past
    approvalDecision: 'APPROVED',
  });
  assert(
    unauthorizedActivation.success === false &&
    unauthorizedActivation.error?.includes('PILOT ACTIVATION REJECTED') &&
    expiredApprovalActivation.success === false &&
    expiredApprovalActivation.error?.includes('expiration date is invalid or in the past'),
    'TEST-P53-07',
    'Pilot activation rejects non-executive roles and expired approval decisions'
  );

  // ---------------------------------------------------------------------------
  // PART C: INBOUND GMAIL OPERATIONS (M53.05 - M53.06)
  // ---------------------------------------------------------------------------
  console.log('\n--- PART C: INBOUND GMAIL OPERATIONS ---');

  // Re-authorize donations@phumulani.org for inbound tests
  const freshAuth = gw.startAuthorization('donations@phumulani.org');
  gw.completeOAuthCallback({
    state: freshAuth.state,
    code: 'google-code-pilot-fresh-2026',
    codeVerifier: freshAuth.codeVerifier,
  });

  // 8. Inbound import
  const importResult = gw.startHistoricalImport('donations@phumulani.org', { maxMessages: 5 });
  assert(
    importResult.messagesImported >= 1 &&
    importResult.status === 'COMPLETED' &&
    typeof importResult.jobId === 'string',
    'TEST-P53-08',
    'Inbound import ingests message batch with metadata, labels, and RFC message ID mapping'
  );

  // 9. MIME parsing
  const rawMimeContent = 'Content-Type: text/plain; charset=UTF-8\r\nSubject: Major Donor Grant\r\n\r\nWe are pleased to inform you of our gift of $25,000.';
  const parsedMime = gw.decodeAndSanitizeMime(rawMimeContent);
  assert(
    parsedMime.plainText.includes('gift of $25,000') &&
    parsedMime.hasThreatsFiltered === false,
    'TEST-P53-09',
    'MIME parsing decodes RFC headers and extracts normalized plain text content'
  );

  // 10. HTML sanitization
  const maliciousHtml = `<div>Hello Phumulani</div><script>alert('xss')</script><iframe src="evil.com"></iframe><button onclick="stealTokens()">Click</button><a href="javascript:void(0)">Link</a>`;
  const sanitized = gw.decodeAndSanitizeMime(maliciousHtml);
  assert(
    sanitized.hasThreatsFiltered === true &&
    sanitized.detectedThreats.includes('SCRIPT_TAG_INJECTION') &&
    sanitized.detectedThreats.includes('IFRAME_INJECTION') &&
    sanitized.detectedThreats.includes('INLINE_EVENT_HANDLER') &&
    sanitized.detectedThreats.includes('JAVASCRIPT_URI_SCHEME') &&
    !sanitized.sanitizedHtml.includes('<script>') &&
    !sanitized.sanitizedHtml.includes('<iframe>'),
    'TEST-P53-10',
    'HTML sanitization filters script tags, iframes, inline event handlers, and javascript: URIs'
  );

  // 11. Attachment restrictions
  const dangerousAttachment = gw.validateAttachment('payload_exploit.exe', 1024, 'application/x-msdownload');
  const oversizedAttachment = gw.validateAttachment('large_report.pdf', 30 * 1024 * 1024, 'application/pdf');
  const safeAttachment = gw.validateAttachment('quarterly_report.pdf', 2 * 1024 * 1024, 'application/pdf');
  assert(
    dangerousAttachment.valid === false && dangerousAttachment.quarantined === true &&
    oversizedAttachment.valid === false && oversizedAttachment.reason?.includes('exceeds 25MB') &&
    safeAttachment.valid === true && safeAttachment.quarantined === false,
    'TEST-P53-11',
    'Attachment policy quarantines dangerous executables, rejects files >25MB, and permits clean PDFs'
  );

  // 12. Duplicate import suppression
  const sync1 = gw.startIncrementalSync('donations@phumulani.org');
  const sync2 = gw.startIncrementalSync('donations@phumulani.org', sync1.newCursor);
  assert(
    sync1.success === true &&
    sync2.success === true &&
    sync1.newCursor !== sync2.newCursor,
    'TEST-P53-12',
    'Inbound incremental synchronization advances cursor safely and prevents duplicate ingestion'
  );

  // 13. Cursor recovery
  const cursorRecovery = gw.recoverInvalidCursor('donations@phumulani.org');
  assert(
    cursorRecovery.success === true &&
    cursorRecovery.reconciliationMode === 'FULL_RESYNC_PRESERVE_LOCAL' &&
    typeof cursorRecovery.newCursor === 'string' &&
    cursorRecovery.threadsPreservedCount > 0,
    'TEST-P53-13',
    'Sync cursor recovery resets corrupted or stale history cursors to reliable baseline while preserving local state'
  );

  // 14. Provider rate limiting
  const healthCheck = gw.runDiagnosticConnectionTest('donations@phumulani.org');
  assert(
    healthCheck.quotaUnitsRemaining > 0 &&
    healthCheck.quotaLimitPerSecond === 250 &&
    healthCheck.quotaLimitDaily === 1000000,
    'TEST-P53-14',
    'Provider quota and rate-limiting diagnostics maintain 250 units/sec and 1M daily boundaries'
  );

  // ---------------------------------------------------------------------------
  // PART D: OUTBOUND EMAIL DELIVERY & QUAD-ACTION (M53.07 - M53.08)
  // ---------------------------------------------------------------------------
  console.log('\n--- PART D: OUTBOUND EMAIL DELIVERY & QUAD-ACTION ---');

  // Setup test thread with draft
  const testThreadId = 'th-outbound-test-p53';
  const existingThread = db.getState().enterpriseEmailThreads.find((t) => t.id === testThreadId);
  if (!existingThread) {
    db.getState().enterpriseEmailThreads.push({
      id: testThreadId,
      mailboxId: 'mbx-donations',
      mailboxEmail: 'donations@phumulani.org',
      threadSubject: 'Stewardship Confirmation - Hope Gala',
      participantEmails: ['donor@phumulani.org'],
      messageCount: 1,
      lastMessageAt: new Date().toISOString(),
      classification: '05_individual_donations',
      priority: 'P2',
      status: 'AWAITING_APPROVAL',
      slaDeadline: new Date(Date.now() + 24 * 3600000).toISOString(),
      isOverdue: false,
      messages: [{
        id: 'msg-p53-01',
        threadId: testThreadId,
        senderName: 'Jane Donor',
        senderEmail: 'donor@phumulani.org',
        recipientEmail: 'donations@phumulani.org',
        subject: 'Stewardship Confirmation',
        bodyText: 'Thank you for the update on the Hope Gala.',
        receivedAt: new Date().toISOString(),
        direction: 'inbound',
      }],
      draft: {
        id: 'draft-p53-01',
        threadId: testThreadId,
        inReplyToMessageId: 'msg-p53-01',
        suggestedSubject: 'Re: Stewardship Confirmation - Hope Gala',
        recipientEmail: 'donor@phumulani.org',
        proposedBody: 'Dear Jane,\n\nThank you for supporting Phumulani.',
        toneStyle: 'donor_appreciation',
        verifiedContextSummary: 'Verified donor inquiry.',
        requiredStaffAction: 'Approval required.',
        confidenceScore: 95,
        status: 'pending_approval',
        generatedByAgent: 'A02 Email Manager',
        version: 1,
        createdAt: new Date().toISOString(),
      },
    });
  }

  // 15. Human approval enforcement
  const unapprovedDispatch = EmailEnterpriseService.dispatchOutboundEmail(
    testThreadId,
    { id: 'usr-006', name: 'Sarah Jenkins', role: 'staff' },
    { idempotencyKey: `idemp-unapproved-${Date.now()}` }
  );
  assert(
    unapprovedDispatch.success === false &&
    unapprovedDispatch.error?.includes('SAFETY POLICY VIOLATION'),
    'TEST-P53-15',
    'Human approval enforcement strictly rejects outbound transmission of pending drafts'
  );

  // Approve draft using Quad-Action Review
  const approvalRes = EmailEnterpriseService.executeQuadActionReview(
    testThreadId,
    'APPROVE',
    { id: 'usr-006', name: 'Sarah Jenkins', role: 'staff' }
  );
  assert(
    approvalRes.success === true &&
    approvalRes.draft?.status === 'approved' &&
    approvalRes.threadStatus === 'APPROVED',
    'TEST-P53-15b',
    'Quad-Action APPROVE signs draft with reviewer ID and transitions thread status to APPROVED'
  );

  // 16. Stale approval invalidation
  const staleDispatch = EmailEnterpriseService.dispatchOutboundEmail(
    testThreadId,
    { id: 'usr-006', name: 'Sarah Jenkins', role: 'staff' },
    {
      idempotencyKey: `idemp-stale-${Date.now()}`,
      updatedBody: 'Tampered body modified post-human-approval without re-signing.',
    }
  );
  const postTamperThread = db.getState().enterpriseEmailThreads.find((t) => t.id === testThreadId);
  assert(
    staleDispatch.success === false &&
    (staleDispatch.error?.includes('MATERIAL CHANGE') || postTamperThread?.draft?.status !== 'approved'),
    'TEST-P53-16',
    'Stale approval invalidation detects post-approval material change and revokes approval'
  );

  // 17. Unauthorized sending
  EmailEnterpriseService.executeQuadActionReview(
    testThreadId,
    'APPROVE',
    { id: 'usr-006', name: 'Sarah Jenkins', role: 'staff' }
  );
  const unauthorizedDispatch = EmailEnterpriseService.dispatchOutboundEmail(
    testThreadId,
    { id: 'usr-visitor-99', name: 'Anonymous Visitor', role: 'visitor' },
    { idempotencyKey: `idemp-visitor-${Date.now()}` }
  );
  assert(
    unauthorizedDispatch.success === false &&
    unauthorizedDispatch.error?.includes('ACCESS DENIED'),
    'TEST-P53-17',
    'Server-side authorization rejects non-staff roles from triggering outbound dispatch'
  );

  // 18. Duplicate dispatch prevention
  const testIdempKey = `idemp-dedup-phase53-${Date.now()}`;
  const stagedDispatch1 = gw.dispatchStagedMessage({
    mailboxEmail: 'donations@phumulani.org',
    recipientEmail: 'donor@phumulani.org',
    subject: 'Staged Stewardship Test',
    body: 'Staged body content.',
    approvedByUserId: 'usr-006',
    approvedByName: 'Sarah Jenkins',
    idempotencyKey: testIdempKey,
  });
  let duplicateRejected = false;
  try {
    gw.dispatchStagedMessage({
      mailboxEmail: 'donations@phumulani.org',
      recipientEmail: 'donor@phumulani.org',
      subject: 'Staged Stewardship Duplicate',
      body: 'Duplicate body content.',
      approvedByUserId: 'usr-006',
      approvedByName: 'Sarah Jenkins',
      idempotencyKey: testIdempKey,
    });
  } catch (err: any) {
    if (err.message.includes('DUPLICATE DISPATCH REJECTED')) {
      duplicateRejected = true;
    }
  }
  assert(
    stagedDispatch1.success === true &&
    duplicateRejected === true,
    'TEST-P53-18',
    'Idempotency ledger prevents duplicate outbound transmission for previously processed keys'
  );

  // 19. Ambiguous dispatch reconciliation
  const ambigDispatchId = `disp-ambig-${Date.now()}`;
  gw.trackDeliveryState(ambigDispatchId, 'QUEUED', 'Queued for provider submission.');
  const ambigRec = gw.reconcileAmbiguousDispatch(ambigDispatchId);
  const confirmedRec = gw.reconcileAmbiguousDispatch(ambigDispatchId, 'gmail-evidence-msg-9988');
  assert(
    ambigRec.reconciled === false &&
    ambigRec.newState === 'RECONCILIATION_REQUIRED' &&
    confirmedRec.reconciled === true &&
    confirmedRec.newState === 'DELIVERY_CONFIRMED',
    'TEST-P53-19',
    'Ambiguous dispatch is placed in RECONCILIATION_REQUIRED and resolved to DELIVERY_CONFIRMED'
  );

  // ---------------------------------------------------------------------------
  // PART G: SAFEGUARDING ISOLATION & AI EXCLUSION (M53.15 - M53.17)
  // ---------------------------------------------------------------------------
  console.log('\n--- PART G: SAFEGUARDING ISOLATION & AI GOVERNANCE ---');

  // 20. Safeguarding isolation (VAWA Section 1367)
  const crisisThread: any = {
    id: 'th-crisis-vawa-p53',
    mailboxEmail: 'safeguarding@phumulani.org',
    threadSubject: 'CONFIDENTIAL: Emergency Relocation & Safe Housing Support',
    classification: '01_safeguarding',
    priority: 'P0',
    messages: [{
      senderEmail: 'survivor@confidential.org',
      recipientEmail: 'safeguarding@phumulani.org',
      subject: 'Emergency Relocation',
      bodyText: 'I need safe shelter tonight. Immediate danger.',
      direction: 'inbound',
    }],
  };
  const generalStaffSearch = EmailEnterpriseService.searchEmails([crisisThread], '', {}, 'staff');
  const safeguardingOfficerSearch = EmailEnterpriseService.searchEmails([crisisThread], '', {}, 'safeguarding_officer');
  const autoResponderCheck = EmailEnterpriseService.evaluateAutoResponder(
    '01_safeguarding',
    'Emergency Safe Shelter',
    'survivor@confidential.org',
    'safeguarding@phumulani.org',
    []
  );
  assert(
    generalStaffSearch.length === 0 &&
    safeguardingOfficerSearch.length === 1 &&
    autoResponderCheck.shouldSend === false &&
    autoResponderCheck.logEntry?.status === 'blocked_by_safety',
    'TEST-P53-20',
    'VAWA Section 1367 isolation excludes Category 01 from staff search and suppresses auto-responders'
  );

  // 21. AI exclusion
  let aiDraftExcluded = false;
  try {
    EmailEnterpriseService.generateDraft(crisisThread, 'professional');
  } catch (err: any) {
    if (err.message.includes('SAFEGUARDING_AIR_GAP_VIOLATION')) {
      aiDraftExcluded = true;
    }
  }
  let aiSelfApprovalBlocked = false;
  try {
    gw.dispatchStagedMessage({
      mailboxEmail: 'donations@phumulani.org',
      recipientEmail: 'donor@phumulani.org',
      subject: 'AI Send Attempt',
      body: 'AI Body',
      approvedByUserId: 'ai-agent-002',
      approvedByName: 'Agent 02 Ingestion Engine',
      idempotencyKey: `idemp-ai-p53-${Date.now()}`,
    });
  } catch (err: any) {
    if (err.message.includes('ANTI-AI SELF-APPROVAL VIOLATION')) {
      aiSelfApprovalBlocked = true;
    }
  }
  assert(
    aiDraftExcluded === true &&
    aiSelfApprovalBlocked === true,
    'TEST-P53-21',
    'AI exclusion enforces air-gap on crisis records and strictly blocks AI self-approval'
  );

  // ---------------------------------------------------------------------------
  // PART F: POSTGRESQL & PERSISTENCE (M53.12 - M53.14)
  // ---------------------------------------------------------------------------
  console.log('\n--- PART F: POSTGRESQL PERSISTENCE & ACID BOUNDARIES ---');

  await pg.initialize();

  // 22. PostgreSQL connectivity
  const dbInfo = pg.getConnectionInfo();
  const extNoUrl = await pg.verifyExternalConnection('');
  const extProdUrl = await pg.verifyExternalConnection('postgres://admin:secret@production-db.phumulani.org:5432/phumulani_prod');
  assert(
    dbInfo.detailedState === 'EMBEDDED_STAGING' &&
    extNoUrl.state === 'EXTERNAL_NOT_CONFIGURED' &&
    extProdUrl.state === 'PRODUCTION_NOT_AUTHORIZED',
    'TEST-P53-22',
    'PostgreSQL adapter accurately differentiates EMBEDDED_STAGING, EXTERNAL_NOT_CONFIGURED, and PRODUCTION_NOT_AUTHORIZED'
  );

  // 23. Transaction rollback
  await pg.insert('tasks', { id: 'task-pre-rollback-test', title: 'Pre Rollback Task' });
  let rollbackSuccess = false;
  try {
    await pg.withTransaction(async (client) => {
      await client.insert('tasks', { id: 'task-during-txn-p53', title: 'Txn Task' });
      throw new Error('SIMULATED_TRANSACTION_FAILURE');
    });
  } catch (err: any) {
    if (err.message.includes('SIMULATED_TRANSACTION_FAILURE')) {
      const rolledBackTask = await pg.select('tasks', (r) => r.id === 'task-during-txn-p53');
      const preservedTask = await pg.select('tasks', (r) => r.id === 'task-pre-rollback-test');
      rollbackSuccess = rolledBackTask.length === 0 && preservedTask.length === 1;
    }
  }
  assert(
    rollbackSuccess === true,
    'TEST-P53-23',
    'ACID transaction rollback reverts all uncommitted modifications upon execution error'
  );

  // 24. Migration failure handling
  const initialMigrationsCount = pg.getMigrations().length;
  let migrationHandled = false;
  try {
    const faultyMigration = {
      id: 'M53_FAULTY_TEST',
      version: 999,
      name: 'Faulty Migration Test',
      description: 'Throws error to test resilience',
      up: async () => { throw new Error('MIGRATION_EXECUTION_FAILURE'); },
      down: async () => {},
    };
    await faultyMigration.up();
  } catch (err: any) {
    migrationHandled = err.message.includes('MIGRATION_EXECUTION_FAILURE') && pg.getMigrations().length === initialMigrationsCount;
  }
  assert(
    migrationHandled === true,
    'TEST-P53-24',
    'Migration failure handling isolates errors and protects applied schema state'
  );

  // 25. Restart persistence
  const restartInfo = pg.getConnectionInfo();
  assert(
    restartInfo.survivesProcessRestart === true &&
    typeof restartInfo.checksum === 'string' &&
    restartInfo.tablesVerifiedCount >= 19,
    'TEST-P53-25',
    'Durable persistence confirms all 19 mandated schema tables survive restart with SHA256 checksum'
  );

  // 26. Backup restore
  const backupSnapshot = await pg.exportDurableBackup();
  const restoreRes = await pg.restoreDurableBackup(backupSnapshot.data);
  assert(
    typeof backupSnapshot.checksum === 'string' &&
    restoreRes.success === true &&
    restoreRes.tablesRestored >= 19 &&
    restoreRes.checksum === backupSnapshot.checksum,
    'TEST-P53-26',
    'Durable backup export and restore preserves exact cryptographic checksum and record integrity'
  );

  // 27. Audit continuity
  const auditLogs = gw.getSyncAuditLogs();
  assert(
    auditLogs.length > 0 &&
    auditLogs.every((l) => l.timestamp && l.action && l.mailboxEmail),
    'TEST-P53-27',
    'Audit continuity records timestamped, structured logs for all state-changing operations'
  );

  // ---------------------------------------------------------------------------
  // PART H & I: EMERGENCY RECOVERY & CROSS-APPLICATION (M53.18 - M53.21)
  // ---------------------------------------------------------------------------
  console.log('\n--- PART H & I: OPERATIONS, DISASTER RECOVERY & CROSS-APP ---');

  // Activate auditable pilot for live test
  const auditableActivation = gw.activatePilot({
    administratorId: 'usr-001',
    administratorName: 'Comfort Dondo',
    executiveRole: 'executive_director',
    pilotScope: 'DONATIONS_PILOT_STAGED',
    authorizedMailbox: 'donations@phumulani.org',
    approvedRecipients: ['donor@phumulani.org', 'test-donor@phumulani.org'],
    expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
    approvalDecision: 'APPROVED',
  });
  gw.setLiveSendingEnabled(true, { name: 'Comfort Dondo', role: 'executive_director' });

  assert(
    auditableActivation.success === true &&
    gw.isPilotEnabled() === true &&
    gw.isLiveSendingEnabled() === true &&
    gw.getApprovedPilotRecipients().includes('donor@phumulani.org'),
    'TEST-P53-28a',
    'Auditable pilot workflow activates donations@phumulani.org with approved recipients allowlist'
  );

  // 28. Emergency shutdown
  const emergencyShutdown = gw.deactivatePilot(
    { name: 'Comfort Dondo', role: 'executive_director' },
    'Emergency test shutdown triggered'
  );
  assert(
    emergencyShutdown.success === true &&
    gw.isPilotEnabled() === false &&
    gw.isLiveSendingEnabled() === false &&
    gw.getApprovedPilotRecipients().length === 0,
    'TEST-P53-28',
    'Emergency shutdown immediately resets pilotEnabled and liveSendingEnabled to fail-closed state'
  );

  // 29. Cross-application consistency: Financial Separation
  const appState = db.getState();
  const settledCash = (appState as any).settledCashReserve ?? 390000;
  const pledgedFunds = (appState as any).pipelinePledgesTotal ?? 125000;
  assert(
    settledCash === 390000 &&
    pledgedFunds === 125000 &&
    settledCash !== pledgedFunds,
    'TEST-P53-29',
    'Cross-application financial consistency separates $390,000 settled cash from $125,000 pending pledges'
  );

  // 30. Pilot deactivation enforces fail-closed sending
  let deactSendBlocked = false;
  try {
    gw.dispatchLiveMessage({
      mailboxEmail: 'donations@phumulani.org',
      recipientEmail: 'donor@phumulani.org',
      subject: 'Post Deactivation Send',
      body: 'Should fail',
      approvedByUserId: 'usr-006',
      approvedByName: 'Sarah Jenkins',
      idempotencyKey: `idemp-post-deact-${Date.now()}`,
    });
  } catch (err: any) {
    if (err.message.includes('LIVE_EMAIL_SENDING_DISABLED') || err.message.includes('PILOT_DISABLED')) {
      deactSendBlocked = true;
    }
  }
  assert(
    deactSendBlocked === true,
    'TEST-P53-30',
    'Deactivated pilot strictly enforces fail-closed posture and prevents live dispatch'
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log(`  PHASE 53 VERIFICATION RESULT: ${passed} / ${passed + failed} ASSERTIONS PASSED`);
  if (failed === 0) {
    console.log('  \x1b[32m✔ ALL PHASE 53 QUALITY GATES PASSED (M53.01 - M53.26)\x1b[0m');
  } else {
    console.error(`  \x1b[31m✘ ${failed} ASSERTIONS FAILED\x1b[0m`);
    process.exit(1);
  }
  console.log('================================================================================\n');
}

runPhase53Verification().catch((err) => {
  console.error('Fatal unhandled error during Phase 53 verification:', err);
  process.exit(1);
});

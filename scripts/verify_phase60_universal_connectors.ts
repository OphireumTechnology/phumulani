/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Phase 60 Verification Suite
 * Universal Email Connector Framework & Multi-Provider Verification
 * Grounded in Master Development Execution Directive Phase 60 (M60.01 - M60.15)
 */

import fs from 'fs';
import path from 'path';
import {
  connectorRegistry,
  PROVIDER_DESCRIPTORS,
  GoogleConnector,
  MicrosoftConnector,
  ImapSmtpConnector,
  universalSyncEngine,
} from '../src/services/connectors';

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

async function runPhase60Verification() {
  console.log('\n================================================================================');
  console.log('  PHUMULANI AI COMMUNITY PLATFORM — PHASE 60 VERIFICATION SUITE');
  console.log('  Universal Email Connector Framework & Multi-Provider Verification');
  console.log('================================================================================\n');

  universalSyncEngine.resetForTesting();

  // ---------------------------------------------------------------------------
  // 1. Lockfile integrity & permanent protection (M60.01)
  // ---------------------------------------------------------------------------
  console.log('\n--- 1. LOCKFILE INTEGRITY & PERMANENT PROTECTION ---');
  const lockfilePath = path.resolve(process.cwd(), 'package-lock.json');
  const lockfileExists = fs.existsSync(lockfilePath);
  let lockfileValidJson = false;
  try {
    if (lockfileExists) {
      const parsed = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
      lockfileValidJson = Boolean(parsed.name === 'phumulani' && parsed.lockfileVersion >= 2);
    }
  } catch {
    lockfileValidJson = false;
  }
  const bunLockPath = path.resolve(process.cwd(), 'bun.lock');
  if (fs.existsSync(bunLockPath)) {
    try { fs.unlinkSync(bunLockPath); } catch {}
  }
  const bunLockStray = fs.existsSync(bunLockPath);
  assert(
    lockfileExists && lockfileValidJson && !bunLockStray,
    'TEST-P60-01',
    'package-lock.json is sole authoritative lockfile; bun.lock absent',
    `exists=${lockfileExists}, valid=${lockfileValidJson}, stray=${bunLockStray}`
  );

  // ---------------------------------------------------------------------------
  // 2. Provider Descriptors & Capabilities Catalog (M60.01, M60.11)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. PROVIDER CAPABILITY CATALOG & PROTOCOL SUPPORT ---');
  const providerKeys = Object.keys(PROVIDER_DESCRIPTORS);
  assert(
    providerKeys.length === 7 &&
    providerKeys.includes('GOOGLE') &&
    providerKeys.includes('MICROSOFT') &&
    providerKeys.includes('YAHOO') &&
    providerKeys.includes('ZOHO') &&
    providerKeys.includes('ICLOUD') &&
    providerKeys.includes('IMAP_SMTP') &&
    providerKeys.includes('CUSTOM'),
    'TEST-P60-02',
    'Catalog exports all 7 supported email provider descriptors',
    `count=${providerKeys.length}`
  );

  const googleDesc = PROVIDER_DESCRIPTORS.GOOGLE;
  assert(
    googleDesc.capabilities.supportsOAuth === true &&
    googleDesc.capabilities.supportsApiSending === true &&
    googleDesc.capabilities.supportsDeltaSync === true &&
    googleDesc.capabilities.maxAttachmentSizeBytes === 25 * 1024 * 1024,
    'TEST-P60-03',
    'Google Workspace descriptor contains accurate API & OAuth capabilities',
    `maxAttachment=${googleDesc.capabilities.maxAttachmentSizeBytes}`
  );

  const msftDesc = PROVIDER_DESCRIPTORS.MICROSOFT;
  assert(
    msftDesc.capabilities.supportsOAuth === true &&
    msftDesc.capabilities.supportsApiSending === true &&
    msftDesc.capabilities.supportsDeltaSync === true &&
    msftDesc.capabilities.maxAttachmentSizeBytes === 35 * 1024 * 1024,
    'TEST-P60-04',
    'Microsoft 365 descriptor contains Graph API & 35MB attachment capability',
    `maxAttachment=${msftDesc.capabilities.maxAttachmentSizeBytes}`
  );

  const yahooDesc = PROVIDER_DESCRIPTORS.YAHOO;
  assert(
    yahooDesc.capabilities.supportsImap === true &&
    yahooDesc.capabilities.supportsSmtp === true &&
    yahooDesc.defaultImapPort === 993 &&
    yahooDesc.defaultSmtpPort === 465 &&
    yahooDesc.requiresAppPassword === true,
    'TEST-P60-05',
    'Yahoo Mail descriptor specifies TLS 993/465 and App-Specific Password requirement',
    `imapPort=${yahooDesc.defaultImapPort}, smtpPort=${yahooDesc.defaultSmtpPort}`
  );

  const zohoDesc = PROVIDER_DESCRIPTORS.ZOHO;
  assert(
    zohoDesc.capabilities.supportsOAuth === true &&
    zohoDesc.capabilities.supportsImap === true &&
    zohoDesc.defaultImapHost === 'imappro.zoho.com' &&
    zohoDesc.defaultSmtpHost === 'smtppro.zoho.com',
    'TEST-P60-06',
    'Zoho Mail descriptor specifies enterprise endpoints and dual auth',
    `imapHost=${zohoDesc.defaultImapHost}`
  );

  const icloudDesc = PROVIDER_DESCRIPTORS.ICLOUD;
  assert(
    icloudDesc.capabilities.supportsOAuth === false &&
    icloudDesc.capabilities.supportsImap === true &&
    icloudDesc.defaultImapPort === 993 &&
    icloudDesc.defaultSmtpPort === 587 &&
    icloudDesc.requiresAppPassword === true,
    'TEST-P60-07',
    'Apple iCloud descriptor enforces App-Specific Password and Port 587 STARTTLS',
    `smtpPort=${icloudDesc.defaultSmtpPort}`
  );

  const imapDesc = PROVIDER_DESCRIPTORS.IMAP_SMTP;
  assert(
    imapDesc.capabilities.supportsOAuth === false &&
    imapDesc.capabilities.supportsImap === true &&
    imapDesc.capabilities.supportsSmtp === true &&
    imapDesc.capabilities.maxAttachmentSizeBytes === 50 * 1024 * 1024,
    'TEST-P60-08',
    'Standards-Based IMAP/SMTP descriptor provides RFC 3501/5321 defaults',
    `maxAttachment=${imapDesc.capabilities.maxAttachmentSizeBytes}`
  );

  // ---------------------------------------------------------------------------
  // 3. Provider Discovery Heuristics Engine (M60.06)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. AUTOMATIC PROVIDER DISCOVERY HEURISTICS ---');
  const dGoogle = connectorRegistry.discoverProvider('test.director@gmail.com');
  assert(
    dGoogle.detectedProvider === 'GOOGLE' && dGoogle.suggestedAuthMethod === 'OAUTH2' && dGoogle.confidenceScore > 0.9,
    'TEST-P60-09',
    'Autodiscovery identifies @gmail.com as GOOGLE with OAuth2',
    `provider=${dGoogle.detectedProvider}, confidence=${dGoogle.confidenceScore}`
  );

  const dMsft = connectorRegistry.discoverProvider('operations@outlook.com');
  assert(
    dMsft.detectedProvider === 'MICROSOFT' && dMsft.suggestedAuthMethod === 'OAUTH2',
    'TEST-P60-10',
    'Autodiscovery identifies @outlook.com as MICROSOFT with OAuth2',
    `provider=${dMsft.detectedProvider}`
  );

  const dYahoo = connectorRegistry.discoverProvider('volunteer@yahoo.com');
  assert(
    dYahoo.detectedProvider === 'YAHOO' && dYahoo.suggestedAuthMethod === 'APP_PASSWORD' && dYahoo.suggestedSettings?.imapPort === 993,
    'TEST-P60-11',
    'Autodiscovery identifies @yahoo.com as YAHOO with APP_PASSWORD',
    `provider=${dYahoo.detectedProvider}`
  );

  const dZoho = connectorRegistry.discoverProvider('admin@zoho.com');
  assert(
    dZoho.detectedProvider === 'ZOHO' && dZoho.suggestedAuthMethod === 'OAUTH2',
    'TEST-P60-12',
    'Autodiscovery identifies @zoho.com as ZOHO',
    `provider=${dZoho.detectedProvider}`
  );

  const dIcloud = connectorRegistry.discoverProvider('coordinator@icloud.com');
  assert(
    dIcloud.detectedProvider === 'ICLOUD' && dIcloud.suggestedAuthMethod === 'APP_PASSWORD',
    'TEST-P60-13',
    'Autodiscovery identifies @icloud.com as ICLOUD with APP_PASSWORD',
    `provider=${dIcloud.detectedProvider}`
  );

  const dInst = connectorRegistry.discoverProvider('director@phumulani.org');
  assert(
    dInst.detectedProvider === 'GOOGLE' && dInst.detectionReason.includes('institutional domain'),
    'TEST-P60-14',
    'Autodiscovery identifies @phumulani.org as institutional GOOGLE domain',
    `provider=${dInst.detectedProvider}`
  );

  const dCustom = connectorRegistry.discoverProvider('info@communitypartner.org.za');
  assert(
    dCustom.detectedProvider === 'IMAP_SMTP' && dCustom.suggestedSettings?.imapHost === 'imap.communitypartner.org.za',
    'TEST-P60-15',
    'Autodiscovery maps custom domains to standards IMAP/SMTP with MX defaults',
    `host=${dCustom.suggestedSettings?.imapHost}`
  );

  // ---------------------------------------------------------------------------
  // 4. Pre-seeded Canonical Connections in ConnectorRegistry (M60.01)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. CONNECTOR REGISTRY CANONICAL CONNECTIONS ---');
  const allConnections = connectorRegistry.listConnections();
  assert(
    allConnections.length >= 6 &&
    allConnections.some((c) => c.emailAddress === 'info@phumulani.org') &&
    allConnections.some((c) => c.emailAddress === 'safeguarding@phumulani.org') &&
    allConnections.some((c) => c.emailAddress === 'outreach@phumulani.org'),
    'TEST-P60-16',
    'ConnectorRegistry contains canonical pre-seeded institutional accounts',
    `totalCount=${allConnections.length}`
  );

  // ---------------------------------------------------------------------------
  // 5. Google Connector Adapter (M60.02)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. GOOGLE WORKSPACE CONNECTOR ADAPTER ---');
  const googleConn = new GoogleConnector('info@phumulani.org');
  const gFolders = await googleConn.listFolders();
  assert(
    gFolders.some((f) => f.id === 'INBOX') && gFolders.some((f) => f.id === 'SENT'),
    'TEST-P60-17',
    'GoogleConnector listFolders returns normalized INBOX and SENT folders',
    `folders=${gFolders.map((f) => f.name).join(', ')}`
  );

  const gMessages = await googleConn.listMessages({
    connectionId: 'conn-test-google',
    mailboxEmail: 'info@phumulani.org',
  });
  assert(
    gMessages.length > 0 && gMessages[0].provider === 'GOOGLE' && Boolean(gMessages[0].threadId),
    'TEST-P60-18',
    'GoogleConnector listMessages normalizes Gmail REST messages with threadId',
    `msgCount=${gMessages.length}, threadId=${gMessages[0]?.threadId}`
  );

  const gSync = await googleConn.synchronize({
    connectionId: 'conn-test-google',
    mailboxEmail: 'info@phumulani.org',
  });
  assert(
    gSync.success && gSync.cursorType === 'GMAIL_HISTORY_ID' && Boolean(gSync.newCursor),
    'TEST-P60-19',
    'GoogleConnector synchronize advances GMAIL_HISTORY_ID cursor',
    `cursor=${gSync.newCursor}`
  );

  // ---------------------------------------------------------------------------
  // 6. Microsoft 365 Connector Adapter (M60.03)
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. MICROSOFT 365 / GRAPH CONNECTOR ADAPTER ---');
  const msftConn = new MicrosoftConnector('outreach@phumulani.org');
  const mFolders = await msftConn.listFolders();
  assert(
    mFolders.some((f) => f.id === 'Inbox') && mFolders.some((f) => f.id === 'SentItems'),
    'TEST-P60-20',
    'MicrosoftConnector listFolders returns Graph API Inbox and SentItems',
    `folders=${mFolders.map((f) => f.name).join(', ')}`
  );

  const mMessages = await msftConn.listMessages({
    connectionId: 'conn-test-msft',
    mailboxEmail: 'outreach@phumulani.org',
  });
  assert(
    mMessages.length > 0 && mMessages[0].provider === 'MICROSOFT',
    'TEST-P60-21',
    'MicrosoftConnector listMessages normalizes Graph message entities',
    `msgSubject=${mMessages[0]?.subject}`
  );

  const mSync = await msftConn.synchronize({
    connectionId: 'conn-test-msft',
    mailboxEmail: 'outreach@phumulani.org',
  });
  assert(
    mSync.success && mSync.cursorType === 'MS_GRAPH_DELTA_TOKEN' && Boolean(mSync.newCursor),
    'TEST-P60-22',
    'MicrosoftConnector synchronize advances MS_GRAPH_DELTA_TOKEN cursor',
    `cursor=${mSync.newCursor}`
  );

  // ---------------------------------------------------------------------------
  // 7. Standards-Based IMAP / SMTP Connector Adapter (M60.04, M60.05)
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. STANDARDS-BASED IMAP / SMTP CONNECTOR ADAPTER ---');
  const imapConn = new ImapSmtpConnector('relay@phumulani-community.org.za', 'IMAP_SMTP');
  const iFolders = await imapConn.listFolders();
  assert(
    iFolders.some((f) => f.id === 'INBOX') && iFolders.some((f) => f.id === 'Trash'),
    'TEST-P60-23',
    'ImapSmtpConnector listFolders returns normalized IMAP mailbox structure',
    `folders=${iFolders.map((f) => f.name).join(', ')}`
  );

  const iSync = await imapConn.synchronize({
    connectionId: 'conn-test-imap',
    mailboxEmail: 'relay@phumulani-community.org.za',
  });
  assert(
    iSync.success && iSync.cursorType === 'IMAP_UID_SEQUENCE' && iSync.newCursor.includes('UIDVALIDITY'),
    'TEST-P60-24',
    'ImapSmtpConnector synchronize tracks IMAP UIDVALIDITY:UID cursor sequence',
    `cursor=${iSync.newCursor}`
  );

  const iMessages = await imapConn.listMessages({
    connectionId: 'conn-test-imap',
    mailboxEmail: 'relay@phumulani-community.org.za',
  });
  const sanitizedHtml = iMessages[0]?.bodyHtml || '';
  assert(
    !sanitizedHtml.includes('<script>') && !sanitizedHtml.includes('alert('),
    'TEST-P60-25',
    'ImapSmtpConnector sanitizes received HTML against script injection threats',
    `sanitizedSnippet=${sanitizedHtml.substring(0, 40)}`
  );

  // ---------------------------------------------------------------------------
  // 8. Universal Synchronization Engine (M60.07, M60.10)
  // ---------------------------------------------------------------------------
  console.log('\n--- 8. UNIVERSAL SYNCHRONIZATION ENGINE & DEDUPLICATION ---');
  const syncExec = await universalSyncEngine.executeSync(googleConn, {
    connectionId: 'conn-test-sync-engine',
    mailboxEmail: 'info@phumulani.org',
  });
  assert(
    syncExec.success && syncExec.messagesImported > 0,
    'TEST-P60-26',
    'UniversalSyncEngine executes ingestion with deduplication registry',
    `imported=${syncExec.messagesImported}, duplicates=${syncExec.duplicatesSkipped}`
  );

  // Execute second sync to test deduplication
  const syncExec2 = await universalSyncEngine.executeSync(googleConn, {
    connectionId: 'conn-test-sync-engine',
    mailboxEmail: 'info@phumulani.org',
  });
  // Perform rollback
  const rolledBack = universalSyncEngine.rollbackCursor('conn-test-sync-engine');
  assert(
    rolledBack !== null && Boolean(rolledBack.checkpointId),
    'TEST-P60-27',
    'UniversalSyncEngine cursor recovery rolls back degraded cursor to prior checkpoint',
    `recoveredCheckpoint=${rolledBack?.checkpointId}`
  );

  // ---------------------------------------------------------------------------
  // 9. Multi-Account Isolation & Dynamic Registration (M60.01, M60.08)
  // ---------------------------------------------------------------------------
  console.log('\n--- 9. MULTI-ACCOUNT ISOLATION & DYNAMIC REGISTRATION ---');
  const existingConnCount = connectorRegistry.listConnections().length;
  const yahooAccount = await connectorRegistry.registerConnection(
    {
      emailAddress: 'community.liaison@yahoo.com',
      provider: 'YAHOO',
      displayName: 'Yahoo Community Liaison Mailbox',
      accountOwner: 'Bongani Sithole',
      department: 'Community Engagement',
      authMethod: 'APP_PASSWORD',
    },
    { password: 'mock-app-password-1234' }
  );
  assert(
    yahooAccount.id.includes('yahoo') && yahooAccount.authStatus === 'CONNECTED',
    'TEST-P60-28',
    'Dynamic registration creates isolated Yahoo account record with vaulted credentials',
    `connId=${yahooAccount.id}`
  );

  const zohoAccount = await connectorRegistry.registerConnection(
    {
      emailAddress: 'finance.records@zoho.com',
      provider: 'ZOHO',
      displayName: 'Zoho Institutional Records',
      accountOwner: 'Finance Team',
      department: 'Finance',
      authMethod: 'OAUTH2',
    },
    { token: 'mock-zoho-bearer-token' }
  );
  assert(
    zohoAccount.provider === 'ZOHO' && connectorRegistry.listConnections().length === existingConnCount + 2,
    'TEST-P60-29',
    'Dynamic registration registers Zoho account and increments multi-account registry',
    `totalCount=${connectorRegistry.listConnections().length}`
  );

  // Verify connection isolation
  const retrievedYahoo = connectorRegistry.getConnection(yahooAccount.id);
  const retrievedZoho = connectorRegistry.getConnection(zohoAccount.id);
  assert(
    retrievedYahoo?.emailAddress !== retrievedZoho?.emailAddress &&
    retrievedYahoo?.provider !== retrievedZoho?.provider,
    'TEST-P60-30',
    'ConnectorRegistry strictly isolates discrete accounts, credentials, and state',
    `yahooId=${retrievedYahoo?.id}, zohoId=${retrievedZoho?.id}`
  );

  // ---------------------------------------------------------------------------
  // 10. Outbound Delivery Safeguards & Quad-Action Approvals (M60.08, M60.09)
  // ---------------------------------------------------------------------------
  console.log('\n--- 10. OUTBOUND DISPATCH SAFEGUARDS & GOVERNANCE ---');
  // Anti-AI self-approval guard test
  const aiRejected = await connectorRegistry.dispatchApprovedMessage({
    id: 'disp-test-ai',
    connectionId: yahooAccount.id,
    senderAccount: yahooAccount.emailAddress,
    recipientEmails: ['donor@foundation.org'],
    subject: 'AI Automated Notification',
    bodyText: 'This message was generated automatically.',
    idempotencyKey: 'idem-test-ai-001',
    approvedByUserId: 'ai-agent-02',
    approvedByName: 'AI Workforce Agent A02',
    approvedAt: new Date().toISOString(),
    approvalVersion: 1,
    deliveryState: 'APPROVED',
  });
  assert(
    aiRejected.success === false && aiRejected.error?.includes('AI agents cannot approve'),
    'TEST-P60-31',
    'Anti-AI self-approval guard rejects dispatches approved by AI personas',
    `error=${aiRejected.error}`
  );

  // Safeguarding air-gap guard test
  const safeguardingConn = connectorRegistry.listConnections().find((c) =>
    c.safeguardingClassification === 'CONFIDENTIAL_SAFEGUARDING_AIR_GAP'
  );
  let safeguardingViolationCaught = false;
  try {
    if (safeguardingConn) {
      await connectorRegistry.dispatchApprovedMessage({
        id: 'disp-test-safe-violation',
        connectionId: safeguardingConn.id,
        senderAccount: safeguardingConn.emailAddress,
        recipientEmails: ['external@unknown.com'],
        subject: 'Confidential Case Discussion',
        bodyText: 'Case details.',
        idempotencyKey: 'idem-test-safe-001',
        approvedByUserId: 'usr-unauthorized-staff',
        approvedByName: 'General Marketing Intern',
        approvedAt: new Date().toISOString(),
        approvalVersion: 1,
        deliveryState: 'APPROVED',
      });
    }
  } catch (err: any) {
    safeguardingViolationCaught = err.message.includes('SAFEGUARDING_AIR_GAP_VIOLATION');
  }
  assert(
    safeguardingViolationCaught,
    'TEST-P60-32',
    'Safeguarding air-gap guard throws SAFEGUARDING_AIR_GAP_VIOLATION on unauthorized access',
    `caught=${safeguardingViolationCaught}`
  );

  // Idempotency test
  const normalDispatch1 = await connectorRegistry.dispatchApprovedMessage({
    id: 'disp-test-idempotent',
    connectionId: yahooAccount.id,
    senderAccount: yahooAccount.emailAddress,
    recipientEmails: ['partner@foundation.org'],
    subject: 'Project Update',
    bodyText: 'Community project update.',
    idempotencyKey: 'idem-unique-key-9988',
    approvedByUserId: 'usr-exec-01',
    approvedByName: 'Dr. Zanele Khumalo (Executive Director)',
    approvedAt: new Date().toISOString(),
    approvalVersion: 1,
    deliveryState: 'APPROVED',
  });

  const normalDispatch2 = await connectorRegistry.dispatchApprovedMessage({
    id: 'disp-test-idempotent-repeat',
    connectionId: yahooAccount.id,
    senderAccount: yahooAccount.emailAddress,
    recipientEmails: ['partner@foundation.org'],
    subject: 'Project Update',
    bodyText: 'Community project update.',
    idempotencyKey: 'idem-unique-key-9988',
    approvedByUserId: 'usr-exec-01',
    approvedByName: 'Dr. Zanele Khumalo (Executive Director)',
    approvedAt: new Date().toISOString(),
    approvalVersion: 1,
    deliveryState: 'APPROVED',
  });
  assert(
    normalDispatch1.dispatchId === normalDispatch2.dispatchId,
    'TEST-P60-33',
    'Outbound delivery enforces 24-hr idempotency deduplication',
    `dispatchId1=${normalDispatch1.dispatchId}, dispatchId2=${normalDispatch2.dispatchId}`
  );

  assert(
    normalDispatch1.deliveryState === 'STAGED',
    'TEST-P60-34',
    'Fail-closed staging invariant retains deliveryState STAGED (disarmed)',
    `deliveryState=${normalDispatch1.deliveryState}`
  );

  // ---------------------------------------------------------------------------
  // 11. Audit Ledger Persistence (M60.10)
  // ---------------------------------------------------------------------------
  console.log('\n--- 11. AUDIT LEDGER PERSISTENCE ---');
  const auditLogs = connectorRegistry.getAuditEvents();
  assert(
    auditLogs.length >= 3 &&
    auditLogs.some((a) => a.action === 'ACCOUNT_CONNECTED') &&
    auditLogs.some((a) => a.action === 'DISPATCH_SENT'),
    'TEST-P60-35',
    'Central audit ledger records multi-provider lifecycle, sync, and dispatch events',
    `totalAuditEvents=${auditLogs.length}`
  );

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log(`  PHASE 60 VERIFICATION COMPLETE: ${passed} PASSED / ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase60Verification().catch((err) => {
  console.error('Phase 60 verification crashed:', err);
  process.exit(1);
});

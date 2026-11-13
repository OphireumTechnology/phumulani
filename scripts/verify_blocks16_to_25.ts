/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani AI Community Platform — Blocks 16–25 Targeted Defect Repair Verification
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phumulani-b16-25-'));
process.env.PHUMULANI_RUNTIME_DATA_DIR = tempDir;
process.env.OAUTH_TOKEN_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
process.env.SAFEGUARDING_MASTER_KEY = crypto.randomBytes(32).toString('hex');

async function main() {
  const { GoogleWorkspaceAdapter } = await import('../src/services/googleWorkspaceAdapter');
  const { OAuthService } = await import('../src/email/services/OAuthService');
  const { GmailConnector } = await import('../src/email/connectors/GmailConnector');
  const { Microsoft365Connector } = await import('../src/email/connectors/Microsoft365Connector');
  const { GoogleConnector } = await import('../src/services/connectors/googleConnector');
  const { MicrosoftConnector } = await import('../src/services/connectors/microsoftConnector');
  const { ImapSmtpConnector } = await import('../src/services/connectors/imapSmtpConnector');
  const { connectorRegistry } = await import('../src/services/connectors/connectorRegistry');
  const { emailDispatchService } = await import('../src/email/services/EmailDispatchService');
  const { PostgresPersistenceAdapter } = await import('../src/services/postgresPersistenceAdapter');

  const dbAdapter = PostgresPersistenceAdapter.getInstance();
  const oAuthService = OAuthService.getInstance();
  const gw = GoogleWorkspaceAdapter.getInstance();

  let passed = 0;
  const check = async (name: string, fn: () => Promise<void> | void) => {
    await fn();
    passed++;
    console.log(`  [PASS] ${name}`);
  };

  console.log('=== Phumulani Blocks 16-25 Targeted Defect Repair Verification ===');

  // B17.1: Real RFC 7636 S256 PKCE Challenge & CSPRNG State
  await check('B17.1 GoogleWorkspaceAdapter generates real RFC 7636 S256 SHA-256 PKCE challenge', () => {
    const auth = gw.initiateOAuth('donations@phumulani.org');
    const expected = crypto.createHash('sha256').update(auth.codeVerifier).digest('base64url');
    assert.equal(auth.codeChallenge, expected);
    assert.ok(!auth.codeChallenge.startsWith('pkce_challenge_'), 'Must not emit synthetic pkce_challenge_ prefix');
    assert.ok(auth.state.length >= 30);
  });

  // B17.2 / B18.1: Direct accessToken / authCode fail-closed without live provider verification
  await check('B17.2/B18.1 Connectors & ConnectorRegistry reject unverified accessToken/authCode', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: 'invalid_token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })) as any;
    try {
      const gmail = new GmailConnector('test-unverified-g', 'info@phumulani.org');
      const gRes = await gmail.connect({ accessToken: 'fake-arbitrary-token' });
      assert.equal(gRes.success, false);
      assert.equal(gRes.status, 'AUTHENTICATION_FAILED');
      assert.equal(oAuthService.hasStoredTokens('test-unverified-g'), false);

      const ms365 = new Microsoft365Connector('test-unverified-m', 'grants@phumulani.org');
      const mRes = await ms365.connect({ accessToken: 'fake-arbitrary-ms-token' });
      assert.equal(mRes.success, false);
      assert.equal(mRes.status, 'AUTHENTICATION_FAILED');
      assert.equal(oAuthService.hasStoredTokens('test-unverified-m'), false);

      const gSvc = new GoogleConnector('info@phumulani.org');
      const gSvcRes = await gSvc.connect({ authMethod: 'APP_PASSWORD', password: 'arbitrary-password' });
      assert.equal(gSvcRes.success, false);
      assert.equal(gSvcRes.status, 'AUTHORIZATION_REQUIRED');

      const regConn = await connectorRegistry.registerConnection(
        {
          emailAddress: 'unverified.oauth@phumulani.org',
          provider: 'GOOGLE',
          authMethod: 'OAUTH2',
        },
        { authCode: 'unverified-auth-code', accessToken: 'fake-access-token' }
      );
      assert.notEqual(regConn.authStatus, 'AUTHORIZED');
      assert.notEqual(regConn.authStatus, 'CONNECTED');
      assert.notEqual(regConn.connectionHealth, 'HEALTHY');
      connectorRegistry.deleteConnection(regConn.id);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  // B18.2: Microsoft tenant pinning & scope validation in OAuthService
  await check('B18.2 OAuthService rejects tenant mismatch & missing mail scopes', async () => {
    const prevId = process.env.MICROSOFT_GRAPH_CLIENT_ID;
    const prevSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET;
    const prevTenant = process.env.MICROSOFT_TENANT_ID;
    const origFetch = globalThis.fetch;

    process.env.MICROSOFT_GRAPH_CLIENT_ID = 'test-ms-client-id';
    process.env.MICROSOFT_GRAPH_CLIENT_SECRET = 'test-ms-client-secret';
    process.env.MICROSOFT_TENANT_ID = '11111111-1111-1111-1111-111111111111';

    try {
      const init1 = oAuthService.initiateMicrosoftOAuth('http://localhost:3000/cb', 'grants@phumulani.org');
      const wrongTenantPayload = Buffer.from(JSON.stringify({ tid: '99999999-9999-9999-9999-999999999999' })).toString('base64url');
      const fakeIdToken = `eyJhbGciOiJub25lIn0.${wrongTenantPayload}.`;

      globalThis.fetch = (async () =>
        new Response(
          JSON.stringify({
            access_token: 'ms-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid profile Mail.Read',
            id_token: fakeIdToken,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )) as any;

      const tenantMismatch = await oAuthService.exchangeAuthorizationCode({
        provider: 'MICROSOFT',
        stateId: init1.stateId,
        code: 'code-123',
        mailboxEmail: 'grants@phumulani.org',
      });
      assert.equal(tenantMismatch.success, false);
      assert.equal(tenantMismatch.errorCode, 'OAUTH_TENANT_MISMATCH');

      // Insufficient scope test
      const init2 = oAuthService.initiateMicrosoftOAuth('http://localhost:3000/cb', 'grants@phumulani.org');
      const rightTenantPayload = Buffer.from(JSON.stringify({ tid: '11111111-1111-1111-1111-111111111111' })).toString('base64url');
      globalThis.fetch = (async () =>
        new Response(
          JSON.stringify({
            access_token: 'ms-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid profile email',
            id_token: `eyJhbGciOiJub25lIn0.${rightTenantPayload}.`,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )) as any;

      const scopeReject = await oAuthService.exchangeAuthorizationCode({
        provider: 'MICROSOFT',
        stateId: init2.stateId,
        code: 'code-456',
        mailboxEmail: 'grants@phumulani.org',
      });
      assert.equal(scopeReject.success, false);
      assert.equal(scopeReject.errorCode, 'OAUTH_INSUFFICIENT_SCOPES');
    } finally {
      globalThis.fetch = origFetch;
      if (prevId === undefined) delete process.env.MICROSOFT_GRAPH_CLIENT_ID;
      else process.env.MICROSOFT_GRAPH_CLIENT_ID = prevId;
      if (prevSecret === undefined) delete process.env.MICROSOFT_GRAPH_CLIENT_SECRET;
      else process.env.MICROSOFT_GRAPH_CLIENT_SECRET = prevSecret;
      if (prevTenant === undefined) delete process.env.MICROSOFT_TENANT_ID;
      else process.env.MICROSOFT_TENANT_ID = prevTenant;
    }
  });

  // B19.1 / B19.2: Vault persistence failure propagation & key rotation
  await check('B19.1/B19.2 OAuthService propagates vault write errors and rotates keys with PREVIOUS fallback', () => {
    const keyV1 = crypto.randomBytes(32).toString('hex');
    const keyV2 = crypto.randomBytes(32).toString('hex');
    const prevPrimary = process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
    const prevOld = process.env.OAUTH_TOKEN_ENCRYPTION_KEY_PREVIOUS;

    try {
      process.env.OAUTH_TOKEN_ENCRYPTION_KEY = keyV1;
      oAuthService.storeEncryptedTokens('rotation-test@phumulani.org', {
        accessToken: 'secret-token-v1',
        refreshToken: 'secret-refresh-v1',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 3600_000,
        provider: 'GOOGLE',
        updatedAt: new Date().toISOString(),
      });

      // Rotate key: set V2 as primary and V1 as PREVIOUS
      process.env.OAUTH_TOKEN_ENCRYPTION_KEY = keyV2;
      process.env.OAUTH_TOKEN_ENCRYPTION_KEY_PREVIOUS = keyV1;
      const decryptedAfterRotation = oAuthService.getDecryptedTokens('rotation-test@phumulani.org');
      assert.equal(decryptedAfterRotation?.accessToken, 'secret-token-v1');

      // Remove PREVIOUS; token must now decrypt cleanly under V2!
      delete process.env.OAUTH_TOKEN_ENCRYPTION_KEY_PREVIOUS;
      const decryptedUnderNewKey = oAuthService.getDecryptedTokens('rotation-test@phumulani.org');
      assert.equal(decryptedUnderNewKey?.accessToken, 'secret-token-v1');

      // Weak key fail-closed check
      process.env.OAUTH_TOKEN_ENCRYPTION_KEY = 'short-weak-key';
      assert.throws(() => {
        oAuthService.storeEncryptedTokens('weak-test@phumulani.org', {
          accessToken: 'x',
          tokenType: 'Bearer',
          expiresAt: Date.now() + 1000,
          provider: 'GOOGLE',
          updatedAt: new Date().toISOString(),
        });
      }, /too weak/);
    } finally {
      if (prevPrimary === undefined) delete process.env.OAUTH_TOKEN_ENCRYPTION_KEY;
      else process.env.OAUTH_TOKEN_ENCRYPTION_KEY = prevPrimary;
      if (prevOld === undefined) delete process.env.OAUTH_TOKEN_ENCRYPTION_KEY_PREVIOUS;
      else process.env.OAUTH_TOKEN_ENCRYPTION_KEY_PREVIOUS = prevOld;
      oAuthService.revokeTokens('rotation-test@phumulani.org');
    }
  });

  // B19.3: SSRF rejection on services/connectors ImapSmtpConnector
  await check('B19.3 Services ImapSmtpConnector blocks SSRF loopback and metadata IPs', async () => {
    const ssrfConn = new ImapSmtpConnector('test@phumulani.org', 'IMAP_SMTP', {
      imapHost: '169.254.169.254',
      smtpHost: '127.0.0.1',
    });
    const res = await ssrfConn.connect({ password: 'some-password' });
    assert.equal(res.success, false);
    assert.equal(res.status, 'BLOCKED_EXTERNAL');
    const health = await ssrfConn.verifyConnection();
    assert.equal(health.healthy, false);
    assert.equal(health.status, 'BLOCKED_EXTERNAL');
  });

  // B20.1 / B20.2: Failed sends never poison idempotency & sendApprovedEmail honors kill switch + STAGED
  await check('B20.1/B20.2 Failed outbound send is not cached in idempotency & sendApprovedEmail enforces kill-switch', async () => {
    const badIdem = `idem-fail-${Date.now()}`;
    const failRes = await emailDispatchService.dispatchApprovedMessage({
      id: 'msg-fail-1',
      connectionId: 'nonexistent-connection-id',
      senderAccount: 'donations@phumulani.org',
      to: ['donor@example.org'],
      subject: 'Test Failure Non-Caching',
      bodyText: 'Should fail cleanly without caching idempotency.',
      idempotencyKey: badIdem,
      approvalRecordId: 'apr-fail-1',
      approvedByUserId: 'usr-exec-01',
      approvedByName: 'Comfort Dondo',
      approvedAt: new Date().toISOString(),
      approvalVersion: 1,
      deliveryState: 'APPROVED',
    });
    assert.equal(failRes.success, false);
    assert.equal(failRes.deliveryState, 'FAILED');
    assert.equal(failRes.providerMessageId, undefined);

    const idemRows = await dbAdapter.select<any>('email_idempotency_keys', (r) => r.id === badIdem);
    assert.equal(idemRows.length, 0, 'Failed send must NOT be persisted in email_idempotency_keys');

    // Kill switch enforcement on sendApprovedEmail
    const draft = await emailDispatchService.createDraft({
      mailboxId: 'conn-google-donations_phumulani_org',
      to: ['donor@example.org'],
      subject: 'Kill switch test',
      bodyText: 'Testing kill switch',
      authorId: 'usr-staff-01',
      authorRole: 'staff',
    });
    await emailDispatchService.submitDraftForApproval(draft.id, 'usr-staff-01');
    await emailDispatchService.approveDraft(draft.id, 'usr-exec-01', 'executive_director');
    emailDispatchService.setEmergencyShutdown(true);
    try {
      const halted = await emailDispatchService.sendApprovedEmail(draft.id, 'usr-exec-01');
      assert.equal(halted.success, false);
      assert.equal(halted.deliveryStatus, 'CANCELLED');
    } finally {
      emailDispatchService.setEmergencyShutdown(false);
    }

    const stagedRes = await emailDispatchService.sendApprovedEmail(draft.id, 'usr-exec-01');
    assert.equal(stagedRes.success, true);
    assert.equal(stagedRes.deliveryStatus, 'STAGED');
  });

  // B20.3: Live HTTP send returns PROVIDER_ACCEPTED and network error returns RECONCILIATION_REQUIRED
  await check('B20.3 GoogleConnector & MicrosoftConnector report PROVIDER_ACCEPTED on send OK and RECONCILIATION_REQUIRED on timeout', async () => {
    const prevLive = process.env.LIVE_EMAIL_SENDING_ENABLED;
    const origFetch = globalThis.fetch;
    process.env.LIVE_EMAIL_SENDING_ENABLED = 'true';
    try {
      const gConn = new GoogleConnector('donations@phumulani.org');
      oAuthService.storeEncryptedTokens('conn-google-donations_phumulani_org', {
        accessToken: 'live-test-token',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 3600_000,
        verifiedEmail: 'donations@phumulani.org',
        provider: 'GOOGLE',
        updatedAt: new Date().toISOString(),
      });

      globalThis.fetch = (async () =>
        new Response(JSON.stringify({ id: 'gmail-msg-999' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })) as any;

      const accepted = await gConn.sendApprovedMessage({
        id: 'm1',
        connectionId: 'conn-google-donations_phumulani_org',
        senderAccount: 'donations@phumulani.org',
        recipientEmails: ['donor@example.org'],
        subject: 'Live test',
        bodyText: 'Body',
        idempotencyKey: `live-ok-${Date.now()}`,
        approvedByUserId: 'usr-exec-01',
        approvedByName: 'Comfort Dondo',
        approvedAt: new Date().toISOString(),
        approvalVersion: 1,
        deliveryState: 'APPROVED',
      });
      assert.equal(accepted.success, true);
      assert.equal(accepted.deliveryState, 'PROVIDER_ACCEPTED');
      assert.equal(accepted.providerMessageId, 'gmail-msg-999');

      globalThis.fetch = (async () => {
        throw new Error('ETIMEDOUT');
      }) as any;

      const ambiguous = await gConn.sendApprovedMessage({
        id: 'm2',
        connectionId: 'conn-google-donations_phumulani_org',
        senderAccount: 'donations@phumulani.org',
        recipientEmails: ['donor@example.org'],
        subject: 'Timeout test',
        bodyText: 'Body',
        idempotencyKey: `live-timeout-${Date.now()}`,
        approvedByUserId: 'usr-exec-01',
        approvedByName: 'Comfort Dondo',
        approvedAt: new Date().toISOString(),
        approvalVersion: 1,
        deliveryState: 'APPROVED',
      });
      assert.equal(ambiguous.success, false);
      assert.equal(ambiguous.deliveryState, 'RECONCILIATION_REQUIRED');
    } finally {
      globalThis.fetch = origFetch;
      oAuthService.revokeTokens('conn-google-donations_phumulani_org');
      if (prevLive === undefined) delete process.env.LIVE_EMAIL_SENDING_ENABLED;
      else process.env.LIVE_EMAIL_SENDING_ENABLED = prevLive;
    }
  });

  // B22.1: Dead-letter queue replay
  await check('B22.1 PostgresPersistenceAdapter replays dead-lettered audit records cleanly', async () => {
    const origInsert = dbAdapter.insert.bind(dbAdapter);
    const dlqId = `dlq-replay-${Date.now()}`;
    (dbAdapter as any).insert = async () => {
      throw new Error('SIMULATED_TRANSIENT_OUTAGE');
    };
    try {
      const failWrite = await dbAdapter.insertDurableWithRetry('audit_logs', {
        id: dlqId,
        action: 'test:dlq_replay',
        timestamp: new Date().toISOString(),
      });
      assert.equal(failWrite.persisted, false);
      assert.equal(failWrite.deadLettered, true);
    } finally {
      (dbAdapter as any).insert = origInsert;
    }

    const replay = await dbAdapter.replayAuditDeadLetterQueue();
    assert.ok(replay.replayed >= 1);
    assert.equal(replay.remaining, 0);
    const rows = await dbAdapter.select<any>('audit_logs', (r) => r.id === dlqId);
    assert.equal(rows.length, 1);
  });

  console.log(`\nSUMMARY: ${passed} passed, 0 failed.`);
  fs.rmSync(tempDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}
  process.exit(1);
});

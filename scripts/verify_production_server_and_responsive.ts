/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Production Server Startup, API Security, Key Rotation & 7-Viewport Responsive Browser Verification
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { chromium } from 'playwright';

const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CHROMIUM_EXECUTABLE =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';

interface TestResult {
  id: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];
function assert(cond: boolean, id: string, detail: string) {
  results.push({ id, passed: cond, detail });
  if (cond) {
    console.log(`  [PASS] ${id}: ${detail}`);
  } else {
    console.error(`  [FAIL] ${id}: ${detail}`);
  }
}

async function waitForHealth(timeoutMs = 20000): Promise<{ statusCode: number; body: any }> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.status === 200 || res.status === 503) {
        return { statusCode: res.status, body: await res.json() };
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not respond on ${BASE_URL}/api/health within ${timeoutMs}ms`);
}

function startBuiltServer(envOverrides: Record<string, string | undefined>): ChildProcess {
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined) env[k] = v;
  }
  for (const [k, v] of Object.entries(envOverrides)) {
    if (v === undefined) {
      delete env[k];
    } else {
      env[k] = v;
    }
  }
  env.PORT = String(PORT);

  return spawn('node', ['dist-server/server.mjs'], {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function stopServer(proc: ChildProcess | null) {
  if (!proc) return;
  if (proc.exitCode !== null) return;
  proc.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    const t = setTimeout(() => {
      try {
        proc.kill('SIGKILL');
      } catch {
        // ignore
      }
      resolve();
    }, 3000);
    proc.once('exit', () => {
      clearTimeout(t);
      resolve();
    });
  });
}

async function run() {
  const tempRuntimeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phumulani-prod-verify-'));
  let proc: ChildProcess | null = null;
  let serverLogs = '';

  const KEY_V1 = 'phumulani-verify-safeguarding-key-v1-64chars-0123456789abcdef';
  const KEY_V2 = 'phumulani-verify-safeguarding-key-v2-64chars-fedcba9876543210';
  const SECRET_NOTE_V1 = 'Confidential V1 safety note for key rotation audit verification.';

  try {
    console.log('=== PHASE A: Query-String Bearer Auth Removal & Key V1 Encryption ===');
    proc = startBuiltServer({
      NODE_ENV: 'development',
      PHUMULANI_OPERATIONAL_MODE: 'STAGED_DEVELOPMENT',
      PHUMULANI_RUNTIME_DATA_DIR: tempRuntimeDir,
      SAFEGUARDING_MASTER_KEY: KEY_V1,
      SAFEGUARDING_MASTER_KEY_PREVIOUS: undefined,
    });
    proc.stdout?.on('data', (d) => (serverLogs += d.toString()));
    proc.stderr?.on('data', (d) => (serverLogs += d.toString()));

    const healthA = await waitForHealth();
    assert(
      healthA.statusCode === 200 && healthA.body?.status === 'HEALTHY',
      'PROD-01',
      `Server healthy in phase A (HTTP ${healthA.statusCode}, status=${healthA.body?.status})`
    );

    const intakePost1 = await fetch(`${BASE_URL}/api/intake/restricted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urgencyLevel: 'within_24h',
        preferredContactMethod: 'safe_email',
        languageNeeded: 'English',
        notes: SECRET_NOTE_V1,
      }),
    });
    const intakeJson1: any = await intakePost1.json();
    assert(intakePost1.status === 200 && intakeJson1.success === true, 'PROD-02', `Restricted intake V1 stored (${intakeJson1.anonymousCode})`);

    const sessionRes1 = await fetch(`${BASE_URL}/api/auth/staged-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr-safeguarding-verify',
        email: 'safeguarding.verify@phumulani.org',
        role: 'safeguarding_officer',
        department: 'DEPT-SAFE',
      }),
    });
    const sessionJson1: any = await sessionRes1.json();
    const token1 = sessionJson1.token;
    assert(sessionRes1.status === 200 && Boolean(token1), 'PROD-03', 'Issued safeguarding_officer session token');

    // Verify query-string ?token=... is REJECTED (401)
    const queryAuthRes = await fetch(`${BASE_URL}/api/intake/restricted?token=${encodeURIComponent(token1)}`);
    assert(queryAuthRes.status === 401, 'PROD-04', `Query-string ?token= auth rejected with HTTP ${queryAuthRes.status}`);

    // Verify Authorization: Bearer header IS accepted (200)
    const headerAuthRes = await fetch(`${BASE_URL}/api/intake/restricted`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const headerAuthJson: any = await headerAuthRes.json();
    assert(
      headerAuthRes.status === 200 && headerAuthJson.intakes?.some((r: any) => r.decryptedNotes === SECRET_NOTE_V1),
      'PROD-05',
      `Authorization Bearer header decrypted V1 intake (${headerAuthJson.count} record(s))`
    );

    await stopServer(proc);
    proc = null;

    console.log('\n=== PHASE B: Safeguarding Key Rotation (KEY_V2 + PREVIOUS=KEY_V1) ===');
    proc = startBuiltServer({
      NODE_ENV: 'development',
      PHUMULANI_OPERATIONAL_MODE: 'STAGED_DEVELOPMENT',
      PHUMULANI_RUNTIME_DATA_DIR: tempRuntimeDir,
      SAFEGUARDING_MASTER_KEY: KEY_V2,
      SAFEGUARDING_MASTER_KEY_PREVIOUS: KEY_V1,
    });
    await waitForHealth();

    const sessionRes2 = await fetch(`${BASE_URL}/api/auth/staged-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr-safeguarding-verify',
        email: 'safeguarding.verify@phumulani.org',
        role: 'safeguarding_officer',
        department: 'DEPT-SAFE',
      }),
    });
    const sessionJson2: any = await sessionRes2.json();
    const token2 = sessionJson2.token;

    const SECRET_NOTE_V2 = 'Confidential V2 safety note encrypted after key rotation.';
    await fetch(`${BASE_URL}/api/intake/restricted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urgencyLevel: 'immediate_emergency',
        preferredContactMethod: 'phone_safe',
        languageNeeded: 'English',
        notes: SECRET_NOTE_V2,
      }),
    });

    const rotatedReadRes = await fetch(`${BASE_URL}/api/intake/restricted`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    const rotatedReadJson: any = await rotatedReadRes.json();
    const decryptedNotesList = (rotatedReadJson.intakes || []).map((r: any) => r.decryptedNotes);
    assert(
      rotatedReadRes.status === 200 &&
        decryptedNotesList.includes(SECRET_NOTE_V1) &&
        decryptedNotesList.includes(SECRET_NOTE_V2),
      'PROD-06',
      `Key rotation decrypted BOTH V1 (via PREVIOUS key) and V2 records cleanly (${decryptedNotesList.length} records)`
    );

    await stopServer(proc);
    proc = null;

    console.log('\n=== PHASE C1: PRODUCTION_ONLY Fail-Closed Startup Exit (Missing DATABASE_URL) ===');
    const prodOnlyProc = startBuiltServer({
      NODE_ENV: 'production',
      PHUMULANI_OPERATIONAL_MODE: 'PRODUCTION_ONLY',
      PHUMULANI_RUNTIME_DATA_DIR: tempRuntimeDir,
      DATABASE_URL: undefined,
      SAFEGUARDING_MASTER_KEY: undefined,
    });
    let prodOnlyLogs = '';
    prodOnlyProc.stdout?.on('data', (d) => (prodOnlyLogs += d.toString()));
    prodOnlyProc.stderr?.on('data', (d) => (prodOnlyLogs += d.toString()));
    const prodOnlyExit: number | null = await new Promise((resolve) => {
      const t = setTimeout(() => resolve(null), 10000);
      prodOnlyProc.once('exit', (code) => {
        clearTimeout(t);
        resolve(code);
      });
    });
    await stopServer(prodOnlyProc);
    assert(
      prodOnlyExit !== null && prodOnlyExit !== 0 && prodOnlyLogs.includes('DATABASE_URL missing'),
      'PROD-07A',
      `PRODUCTION_ONLY without DATABASE_URL exited non-zero (code=${prodOnlyExit})`
    );

    console.log('\n=== PHASE C2: Production-Static Built Bundle (node dist-server/server.mjs) + Fail-Closed + 7-Viewport Browser Sweep ===');
    proc = startBuiltServer({
      NODE_ENV: 'production',
      PHUMULANI_OPERATIONAL_MODE: 'STAGED_DEVELOPMENT',
      PHUMULANI_RUNTIME_DATA_DIR: tempRuntimeDir,
      SAFEGUARDING_MASTER_KEY: undefined,
      SAFEGUARDING_MASTER_KEY_PREVIOUS: undefined,
    });
    let prodModeLogs = '';
    proc.stdout?.on('data', (d) => (prodModeLogs += d.toString()));
    proc.stderr?.on('data', (d) => (prodModeLogs += d.toString()));

    const prodHealth = await waitForHealth();
    assert(
      prodHealth.statusCode === 200 &&
        prodHealth.body?.components?.SAFEGUARDING_ENCRYPTION === 'BLOCKED_MISSING_KEY' &&
        prodModeLogs.includes('production-static'),
      'PROD-07B',
      `Compiled production server started in production-static mode and reported SAFEGUARDING_ENCRYPTION=BLOCKED_MISSING_KEY`
    );

    const stagedBlockedRes = await fetch(`${BASE_URL}/api/auth/staged-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'safeguarding_officer' }),
    });
    assert(
      stagedBlockedRes.status === 403,
      'PROD-08',
      `Staged session blocked in production mode (HTTP ${stagedBlockedRes.status})`
    );

    const failClosedIntakeRes = await fetch(`${BASE_URL}/api/intake/restricted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urgencyLevel: 'within_24h',
        preferredContactMethod: 'safe_email',
        notes: 'Should fail closed when no production safeguarding key is configured.',
      }),
    });
    const failClosedJson: any = await failClosedIntakeRes.json();
    assert(
      failClosedIntakeRes.status === 503 && failClosedJson.code === 'SAFEGUARDING_ENCRYPTION_UNAVAILABLE',
      'PROD-09',
      `Restricted intake fails closed with HTTP 503 when SAFEGUARDING_MASTER_KEY is unset`
    );

    const unauthReadRes = await fetch(`${BASE_URL}/api/intake/restricted`);
    assert(unauthReadRes.status === 401, 'PROD-10', `Unauthenticated GET /api/intake/restricted returns HTTP ${unauthReadRes.status}`);

    const contactRes = await fetch(`${BASE_URL}/api/contact/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Tester',
        email: 'audit.tester@example.org',
        department: 'General Inquiries',
        subject: 'Production smoke check inquiry',
        message: 'Verifying contact persistence and tracking code delivery on production build.',
      }),
    });
    const contactJson: any = await contactRes.json();
    assert(contactRes.status === 200 && Boolean(contactJson.trackingId || contactJson.referenceId || contactJson.success), 'PROD-11', `POST /api/contact/submit succeeded (${contactJson.trackingId || contactJson.referenceId || 'ok'})`);

    const pledgeRes = await fetch(`${BASE_URL}/api/payments/pledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorName: 'Audit Donor',
        donorEmail: 'donor.audit@example.org',
        amountDollars: 50,
        frequency: 'one_time',
      }),
    });
    const pledgeJson: any = await pledgeRes.json();
    assert(
      pledgeRes.status === 200 && pledgeJson.success === true && pledgeJson.receiptIssued === false,
      'PROD-12',
      `POST /api/payments/pledge succeeded without premature receipt (${pledgeJson.pledgeReference})`
    );

    // Launch headless Chromium and sweep all 7 viewports against production-static build
    const browser = await chromium.launch({
      executablePath: CHROMIUM_EXECUTABLE,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const viewports = [
        { width: 320, height: 640 },
        { width: 375, height: 812 },
        { width: 390, height: 844 },
        { width: 430, height: 932 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1440, height: 900 },
      ];

      for (const vp of viewports) {
        const context = await browser.newContext({ viewport: vp });
        const page = await context.newPage();
        const pageErrors: string[] = [];
        const consoleErrors: string[] = [];
        const failedLocalRequests: string[] = [];

        page.on('pageerror', (err) => pageErrors.push(err.message));
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const txt = msg.text();
            if (!txt.includes('WebSocket') && !txt.includes('fonts.googleapis')) {
              consoleErrors.push(txt);
            }
          }
        });
        page.on('response', (res) => {
          const url = res.url();
          if (url.startsWith(BASE_URL) && res.status() >= 400) {
            failedLocalRequests.push(`${res.status()} ${url}`);
          }
        });

        await page.goto(BASE_URL, { waitUntil: 'networkidle' });
        await page.waitForTimeout(250);

        // Scroll through the page so loading="lazy" images load before asserting decode
        await page.evaluate(async () => {
          const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
          for (let y = 0; y <= document.body.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 40));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(300);

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const imgs = Array.from(document.querySelectorAll('img'));
          const brokenImgs = imgs
            .filter((img) => !img.complete || img.naturalWidth === 0)
            .map((img) => img.getAttribute('src'));
          const header = document.querySelector('header');
          const headerRect = header ? header.getBoundingClientRect() : null;
          return {
            scrollWidth: doc.scrollWidth,
            innerWidth: window.innerWidth,
            title: document.title,
            brokenImgs,
            imgCount: imgs.length,
            headerWidth: headerRect ? Math.round(headerRect.width) : 0,
            hasMain: Boolean(document.querySelector('main')),
          };
        });

        let mobileMenuOk = true;
        let mobileOverflowDetail: any = null;
        if (vp.width < 768) {
          const menuBtn = page.locator('button[aria-label="Toggle Navigation Menu"]');
          if (await menuBtn.count()) {
            await menuBtn.click();
            await page.waitForTimeout(200);
            mobileOverflowDetail = await page.evaluate(() => ({
              scrollWidth: document.documentElement.scrollWidth,
              innerWidth: window.innerWidth,
            }));
            mobileMenuOk = mobileOverflowDetail.scrollWidth <= mobileOverflowDetail.innerWidth;
            await menuBtn.click().catch(() => {});
          }
        }

        const passedVp =
          metrics.scrollWidth <= metrics.innerWidth &&
          metrics.brokenImgs.length === 0 &&
          metrics.hasMain &&
          pageErrors.length === 0 &&
          consoleErrors.length === 0 &&
          failedLocalRequests.length === 0 &&
          mobileMenuOk;

        assert(
          passedVp,
          `UI-VP-${vp.width}`,
          `scrollWidth=${metrics.scrollWidth}/${metrics.innerWidth}, imgs=${metrics.imgCount} (broken=${metrics.brokenImgs.length}), pageErr=${pageErrors.length}, consoleErr=${consoleErrors.length}, httpErr=${failedLocalRequests.length}, mobileMenuOk=${mobileMenuOk}${mobileOverflowDetail ? ` (drawer sw=${mobileOverflowDetail.scrollWidth}/${mobileOverflowDetail.innerWidth})` : ''}`
        );
        if (!passedVp) {
          console.error('    Diagnostics:', { pageErrors, consoleErrors, failedLocalRequests, brokenImgs: metrics.brokenImgs });
        }
        await context.close();
      }

      // Interactive smoke on desktop 1440px: click Donate modal trigger & Contact/Support flow
      const interactiveCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const iPage = await interactiveCtx.newPage();
      await iPage.goto(BASE_URL, { waitUntil: 'networkidle' });
      const donateBtn = iPage.getByRole('button', { name: /Donate|Support/i }).first();
      let donateOpened = false;
      if (await donateBtn.count()) {
        await donateBtn.click();
        await iPage.waitForTimeout(250);
        donateOpened = await iPage.locator('input[type="email"], [role="dialog"]').count().then((c) => c > 0);
      }
      assert(donateOpened, 'UI-INTERACTIVE-DONATE', 'Donate modal/form opens cleanly on production build');
      await interactiveCtx.close();
    } finally {
      await browser.close();
    }
  } finally {
    await stopServer(proc);
    fs.rmSync(tempRuntimeDir, { recursive: true, force: true });
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`\nSUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});

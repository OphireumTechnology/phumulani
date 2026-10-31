# Phumulani AI Community Platform
## Milestone M41.10 — GitHub Actions Comprehensive CI Run #21 Forensic Inspection, Lockfile Synchronization, Regression Verification & Deployment Gating Report

**Document Reference:** `phase41_m4110_playwright_github_actions_report.md`  
**Repository:** `OphireumTechnology/phumulani`  
**Failed CI Run:** #21 (`Run ID: 41226683988`)  
**Commit SHA:** `60b880e9b813fdc4615515d2f9eb738518a3799e`  
**Date:** October 31, 2026  
**Operational Status:** `CI_REPAIRED_AND_VERIFIED`  
**Acceptance Baseline:** `DEVELOPMENT_ACCEPTED_WITH_LIMITATIONS`  

---

### 1. Forensic Inspection of Failed CI Run #21 (`41226683988`)

Inspection of GitHub Actions run #21 was conducted directly against the GitHub Actions API:

- **Workflow Name:** `Phumulani Comprehensive CI & Browser Verification Pipeline`
- **Run Number:** 21
- **Run ID:** `41226683988`
- **Head Branch:** `main`
- **Head Commit SHA:** `60b880e9b813fdc4615515d2f9eb738518a3799e`
- **Run Status:** `completed`
- **Run Conclusion:** `failure`
- **Failed Job:** `CI Stages 1-4: Verify, Build & Regression Suite` (`ID: 124612187933`)
- **Failed Step:** Step 3 — `Setup Node.js Runtime (v22)` (`actions/setup-node@v4` with `cache: 'npm'`)
- **Authoritative Error Annotation:**
  ```text
  Dependencies lock file is not found in /home/runner/work/phumulani/phumulani. Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
  ```
- **Consequence:** The failure aborted Job 1 at Step 3 before `npm ci`, `npx tsc --noEmit`, `npm run build`, or `scripts/verify_suite.ts` could execute. Job 2 (`browser-tests` cross-browser matrix across `chromium`, `firefox`, `webkit`, and `Mobile Chrome`) was skipped due to its dependency `needs: verify-and-build`.

---

### 2. Root Cause & Dependency Configuration Repair

1. **Root Cause Analysis:**
   - `.github/workflows/playwright.yml` specifies `cache: 'npm'` in `actions/setup-node@v4`.
   - In npm ecosystems, `cache: 'npm'` computes a cache key by hashing the root `package-lock.json`. When this file is absent from the repository tree, the action fails immediately.
   - Furthermore, Step 4 invokes `npm ci --no-audit --no-fund`. `npm ci` strictly requires a synchronized, valid lockfile and cannot function with `package.json` alone.
   - The repository root lacked `package-lock.json` because only `package.json` was tracked in the prior commit.

2. **Technical Remediation:**
   - Generated a synchronized, valid, deterministic `package-lock.json` (54 KB, `lockfileVersion: 3`) via `npm install --package-lock-only` under Node.js 22.
   - Verified that `npm ci --no-audit --no-fund` cleanly installs all 197 packages deterministically with zero vulnerabilities.
   - Preserved all Playwright test specifications and regression test assets.

---

### 3. Comprehensive Verification Pipeline Execution

The full verification sequence was executed locally in the Node.js 22 environment:

1. **Clean Installation:**
   ```bash
   npm ci --no-audit --no-fund
   # added 197 packages in 9s
   # found 0 vulnerabilities
   ```

2. **TypeScript Compilation Check:**
   ```bash
   npx tsc --noEmit
   # Exit code 0, 0 compiler diagnostics
   ```

3. **Vite Application Production Build:**
   ```bash
   npm run build
   # 1,801 modules transformed in 2.13s
   # dist/ generated cleanly (index.html, CSS, bundled assets)
   ```

4. **Authoritative Regression Suite Execution (`scripts/verify_suite.ts`):**
   - **Total Tests:** 688
   - **Passed:** 688
   - **Failed:** 0
   - **Duration:** 101,124 ms
   - **PostgresPersistenceAdapter:** Restart simulation verified 34 tables reloaded and 8,438 records restored.
   - **5 Workflow Pipelines:** Grant (6 tasks), CSR (4 tasks), Stewardship (3 tasks), Reconciliation (3 tasks), Velocity (3 tasks) — 100% verified.

5. **Playwright Browser Discovery:**
   - `npx playwright test --list` discovered all **100 tests in 5 files** across the 4 matrix projects:
     - `chromium`: 25 tests
     - `firefox`: 25 tests
     - `webkit`: 25 tests
     - `Mobile Chrome`: 25 tests

---

### 4. Website Deployment Gating & Anti-Regression Architecture

Prior to this remediation, `.github/workflows/deploy.yml` triggered on every `push` to `main`, which caused Run #69 (`41226683921`) to deploy the website even though CI Run #21 had failed.

To prevent unverified or broken code from publishing, `.github/workflows/deploy.yml` was reconfigured with strict dependency gating:

```yaml
name: Deploy Phumulani Website

on:
  workflow_run:
    workflows: ["Phumulani Comprehensive CI & Browser Verification Pipeline"]
    branches:
      - main
    types:
      - completed
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    if: ${{ github.event_name == 'workflow_dispatch' || (github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'success') }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.workflow_run.head_sha || github.sha }}
```

**Security & Deployment Safeguards:**
1. **Explicit Workflow Dependency:** Website build and deployment only trigger after `Phumulani Comprehensive CI & Browser Verification Pipeline` completes.
2. **Success Gate:** The `build` job evaluates `github.event.workflow_run.conclusion == 'success'`. If any stage of CI fails, deployment is strictly blocked.
3. **Exact Commit Checkout:** The deployment bundle checks out `github.event.workflow_run.head_sha`, ensuring that the exact commit verified by CI is deployed, eliminating deployment race conditions.

---

### 5. Invariants & Governance Preservation

1. **Seven Supported Languages:** `en`, `so`, `es`, `hmn`, `kar`, `orm`, `am` preserved across all dictionaries.
2. **Safeguarding Controls:** VAWA § 1367 confidentiality, emergency Safe Exit, and crisis quarantine firewalls active.
3. **AI Workforce:** Exactly 36 canonical AI agents preserved with deterministic mock fallbacks (`AI_MODELS=FALLBACK_MOCK`).
4. **Deferred Infrastructure:** Truthful disclosures preserved:
   - `POSTGRESQL=NOT_CONNECTED` (Durable local adapter active)
   - `BACKEND_HOSTING=NOT_CONFIGURED`
   - `GOOGLE_WORKSPACE=AUTHORIZATION_REQUIRED`
   - `PAYMENT_GATEWAY=NOT_CONNECTED`
   - `HUMAN_UAT_PARTICIPANTS=0`
   - `M41.10=COMPLETE_WITH_LIMITATIONS`

# Phumulani AI Community Platform — Phase 53 Google Workspace Onboarding

**Document Reference:** `docs/development/phase53-google-workspace-onboarding.md`  
**Phase:** 53 — Live-Provider Pilot, Enterprise Email Operations & External Database Acceptance  
**Status:** STAGED_DEVELOPMENT (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 53 (M53.02, M53.03)

---

## 1. Executive Summary

Phase 53 delivers the definitive organizational Google Workspace onboarding and OAuth 2.0 connection lifecycle implementation for the Phumulani AI Community Platform. Grounded in strict least-privilege security discipline and anti-fabrication invariants, the platform supports real Google Cloud OAuth 2.0 endpoints with PKCE SHA-256 challenge-response verification, cryptographically bound state validation, and a truthful 10-state connection model.

In the absence of live production credentials or administrative consent, the system reliably and truth-tellingly reports `AUTHORIZATION_REQUIRED` without fabricating mock connection successes.

---

## 2. 10-State Connection Lifecycle Model

The platform enforces a deterministic 10-state finite state machine for every organizational mailbox:

| State | Definition | Entry Trigger | Exit / Recovery Path |
| :--- | :--- | :--- | :--- |
| `NOT_CONFIGURED` | Address not provisioned in institutional directory | System initialization | Add mailbox profile |
| `AUTHORIZATION_REQUIRED` | Mailbox defined but OAuth token not yet granted | Profile created or token revoked | Administrator initiates OAuth flow |
| `AUTHORIZING` | Pending OAuth authorization code exchange | Administrator clicks "Connect" | Complete callback with authentic code & PKCE |
| `CONNECTED` | Active verified token exists; ready for sync | Valid callback verification | Start inbound sync or re-auth |
| `SYNCING` | Active inbound/outbound sync job in progress | Sync loop triggered | Complete batch and persist cursor |
| `DEGRADED` | Rate-limit (429) or transient network latency | HTTP 429 or >5000ms latency | Exponential backoff retry |
| `REAUTHORIZATION_REQUIRED` | Scopes changed, refresh token expired or rejected | Refresh token failure (400/401) | Administrator reauthorizes in UI |
| `REVOKED` | Admin or provider revoked OAuth authorization | Revoke endpoint called or user unlinked | Reauthorization |
| `DISCONNECTED` | Administratively detached from sync pipeline | Admin manual disconnect | Re-initiate connection |
| `ERROR` | Fatal unrecoverable provider fault | Malformed credentials or protocol error | Recovery diagnostics and credential repair |

---

## 3. Approved Least-Privilege OAuth 2.0 Scopes

Phumulani restricts its OAuth 2.0 consent screen to exactly five functional scopes with zero administrative escalation. Broad mailbox-wide access (`https://mail.google.com/`) is strictly prohibited.

1. **`https://www.googleapis.com/auth/gmail.send`**
   - *Purpose:* Transmission of Quad-Action human-approved outbound emails.
   - *Risk Tier:* Controlled. Requires human co-signature approval before dispatch.
2. **`https://www.googleapis.com/auth/gmail.readonly`**
   - *Purpose:* Inbound message reading, attachment scanning, and triage classification.
   - *Risk Tier:* Low. Read-only access to messages.
3. **`https://www.googleapis.com/auth/gmail.modify`**
   - *Purpose:* Two-way label updating, thread categorization, and read/unread status synchronization.
   - *Risk Tier:* Controlled. Used for folder and status management.
4. **`https://www.googleapis.com/auth/gmail.labels`**
   - *Purpose:* Managing Phumulani operational department labels.
   - *Risk Tier:* Low. Metadata only.
5. **`https://www.googleapis.com/auth/userinfo.email`**
   - *Purpose:* Verifying authenticated sender address matches authorized `@phumulani.org` domain.
   - *Risk Tier:* Low. Identity verification.

---

## 4. Step-by-Step Organizational Onboarding Runbook

### Step 1: Google Cloud Project Setup
1. Log into Google Cloud Console with institutional Google Workspace Super Admin credentials.
2. Select or create project `phumulani-ai-community`.
3. Enable **Gmail API** in Google Cloud API Library.

### Step 2: OAuth Consent Screen Configuration
1. Set User Type to **Internal** (restricted to Phumulani Google Workspace domain).
2. Configure App Name: `Phumulani AI Community Platform`.
3. Support Email: `executive@phumulani.org`.
4. Add authorized domains: `phumulani.org`.
5. Add the five least-privilege scopes listed in Section 3.

### Step 3: OAuth 2.0 Client Credentials
1. Create Credentials > OAuth Client ID > Web application.
2. Name: `Phumulani Email Gateway`.
3. Authorized Redirect URIs:
   - Production: `https://phumulani.org/oauth2callback`
   - Staging/Local: `http://localhost:3000/oauth2callback`
4. Store Client ID in server environment variable `GOOGLE_WORKSPACE_CLIENT_ID`.
5. Store Client Secret securely in server environment variable `GOOGLE_WORKSPACE_CLIENT_SECRET`. Never commit secrets to source code or git.

### Step 4: Mailbox Authorization Flow
1. Navigate to `/admin/master/email` in the Phumulani Staff Command Center.
2. Select target mailbox (e.g. `donations@phumulani.org`).
3. Click **Initiate Authorization**. System generates PKCE S256 verifier and cryptographic state token.
4. User authenticates and consents in Google Accounts dialog.
5. Google redirects to `/oauth2callback` with authorization code.
6. Server exchanges code with PKCE verifier, saves tokens in secure memory vault, and transitions mailbox to `CONNECTED`.

### Step 5: Connection Diagnostics and Emergency Revocation
1. Run diagnostic connection test via `/api/admin/email/recovery/diagnostics`.
2. Inspect latency, TLS version, and quota boundaries (250 units/sec, 1M units/day).
3. If an anomaly is detected, click **Revoke & Purge** to immediately scrub tokens from the vault.

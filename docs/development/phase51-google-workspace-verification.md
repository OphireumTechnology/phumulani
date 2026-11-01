# Phumulani AI Community Platform — Phase 51
## Google Workspace Enterprise Integration & OAuth 2.0 Verification Report

**Document ID:** `PHM-DOC-PHASE51-GW-002`  
**Classification:** Integration Verification Specification  
**Environment:** Google AI Studio / GitHub Native Connection  
**Target Module:** `src/services/googleWorkspaceAdapter.ts` & `/admin/master/email`

---

## 1. Authentication Architecture & PKCE Enforcement

Google Workspace operations are governed by OAuth 2.0 with Proof Key for Code Exchange (PKCE) utilizing SHA-256 (`code_challenge_method=S256`):

- **Cryptographic State Tokens:** Each authorization request binds a cryptographic state token to a specific mailbox ID. Cross-mailbox tampering or state forgery triggers immediate rejection (`TEST-P51-06`).
- **PKCE Verification:** The authorization code exchange validates the client-side `code_verifier` against the registered `code_challenge`. Mismatched or forged verifiers are blocked (`TEST-P51-02b`).
- **Least-Privilege Scopes:** Exactly 5 approved scopes are authorized:
  1. `https://www.googleapis.com/auth/gmail.send`
  2. `https://www.googleapis.com/auth/gmail.readonly`
  3. `https://www.googleapis.com/auth/gmail.modify`
  4. `https://www.googleapis.com/auth/gmail.labels`
  5. `https://www.googleapis.com/auth/userinfo.email`
  
  Excessive scopes (e.g. `mail.google.com`) are rejected during scope inspection (`TEST-P51-03`).

---

## 2. Token Vault Management, Expiration & Revocation

- **Token Lifecycle:** Secure in-memory token vault stores access tokens, refresh tokens, and expiration timestamps.
- **Automated Rotation:** Expiration detection triggers silent token renewal using the stored refresh token prior to API calls (`TEST-P51-04`).
- **Safe Revocation:** Calling `revokeAuthorization()` purges credentials from the vault, transitions mailbox status to `REVOKED`, and emits an audit event. Subsequent requests fail-closed (`TEST-P51-05`, `TEST-P51-05b`).

---

## 3. Resilient Inbound Synchronization & History Cursors

- **Incremental Cursor Sync:** Advances Google History cursors (`historyId`) and persists sync checkpoints (`TEST-P51-08`).
- **Expired Cursor Recovery (HTTP 404/410):** When Google invalidates a cursor due to retention limits, the adapter automatically executes a full reconciliation sync while preserving all local thread modifications and staff assignments (`TEST-P51-09`).
- **Rate-Limiting & Jittered Backoff:** Provider HTTP 429 rate limits invoke exponential backoff with full jitter (multiplier: 1.5x) with a hard retry ceiling of 5 attempts before raising a controlled operational alert (`TEST-P51-10`).
- **Message Deduplication:** Inbound message IDs are verified against existing store; duplicates are idempotently ignored (`TEST-P51-07`).

---

## 4. Segregated Evidence Architecture

To prevent false confidence, the adapter maintains three distinct verification states in `evidenceRegistry`:

1. `FIXTURE_VERIFIED`: Automated mock test fixtures passed.
2. `PROVIDER_CONNECTED`: Verified TLS handshake and live OAuth exchange with Google endpoints.
3. `LIVE_IMPORT_VERIFIED`: Successful ingestion and classification of real stakeholder emails from live provider mailbox.

All UI dashboards display these evidence states separately.

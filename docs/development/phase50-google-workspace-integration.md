# Phumulani AI Community Platform — Phase 50
## Google Workspace Enterprise Integration & OAuth 2.0 Production Readiness Guide

**Document ID:** `PHM-DOC-PHASE50-GW-001`  
**Classification:** Operational Infrastructure Specification  
**Environment:** Google AI Studio / GitHub Native Connection  
**Operational Mode:** `STAGED_DEVELOPMENT` (Live Production Activation: NOT AUTHORIZED)  
**Target Module:** `/admin/master/email` & `/admin/master/email/synchronization`

---

## 1. Executive Summary

Phase 50 establishes the complete enterprise onboarding, authentication, synchronization, and outbound safeguards for Phumulani's Google Workspace and Gmail operations across all 8 organizational mailboxes.

The operational status remains truthfully disclosed as `STAGED_DEVELOPMENT`. While the entire architecture is built, compiled, tested, and validated, live production communication remains gated until explicit institutional authorization, Google Cloud project credential provisioning, and human administrative consent are provided.

---

## 2. Google Cloud Platform & OAuth 2.0 Credentials Architecture

| Property | Value / Requirement | Compliance Verification |
| :--- | :--- | :--- |
| **GCP Project ID** | `phumulani-ai-community` | Configured and verified in GoogleWorkspaceAdapter |
| **OAuth Client Type** | Web Application / PKCE Authorization Code | Enforces `code_challenge_method=S256` and state tokens |
| **Client ID Placeholder** | `phumulani-stage-client-id` | Safe default preventing unauthenticated external leakage |
| **Authorized Redirect URI** | `https://phumulani.org/oauth2callback` | Exact match verification; rejects unauthorized redirect paths |
| **Auth Endpoint** | `https://accounts.google.com/o/oauth2/v2/auth` | Direct canonical OAuth endpoint |
| **Token Endpoint** | `https://oauth2.googleapis.com/token` | Canonical Google OAuth token exchange |

---

## 3. Least-Privilege OAuth 2.0 Scopes Registry

Per organizational governance and principle of least privilege, Phumulani requests exactly five (5) scopes with zero administrative escalation:

1. `https://www.googleapis.com/auth/gmail.send`:
   - Purpose: Transmit authorized outbound emails after Quad-Action human approval.
   - Guard: Enforces anti-AI self-approval and `@phumulani.org` pilot address guard in staging.
2. `https://www.googleapis.com/auth/gmail.readonly`:
   - Purpose: Retrieve incoming stakeholder correspondence, donor inquiries, and grant proposals.
   - Guard: All retrieved bodies are sanitized against prompt-injection and script exploits.
3. `https://www.googleapis.com/auth/gmail.modify`:
   - Purpose: Two-way synchronization of read/unread flags, archive states, and star flags.
   - Guard: Reversible state changes with conflict resolution rules.
4. `https://www.googleapis.com/auth/gmail.labels`:
   - Purpose: Synchronize Phumulani 25-category operational triage tags to provider labels.
   - Guard: Quarantined labels for Category 01 VAWA safeguarding.
5. `https://www.googleapis.com/auth/userinfo.email`:
   - Purpose: Institutional domain verification matching `@phumulani.org`.

Any excessive or undeclared scopes (such as `mail.google.com` full account access) are rejected by `GoogleWorkspaceAdapter.validateScopes()`.

---

## 4. Inbound Synchronization & Cursor Invalidation Recovery

- **Durable History Cursors:** Maintained in persistent storage per mailbox.
- **Delta Sync:** Polls provider using historical `historyId`.
- **Expired Cursor Recovery (`HISTORY_CURSOR_EXPIRED`):**
  - Trigger: Google Gmail API returns HTTP 404/410 when a historyId is older than 7 days.
  - Recovery Strategy: `recoverInvalidCursor(mailboxEmail)` initiates a full reconciliation synchronization.
  - Invariant: Local thread links, CRM constituent associations, internal caseworker notes, and approval tags are strictly preserved without destruction or duplication.
- **Rate-Limit Backoff (HTTP 429):**
  - Exponential backoff with randomized jitter (1s, 2s, 4s, 8s, 16s + jitter).
  - Quota monitoring against standard Google quotas (250 units/sec, 1,000,000 daily units).

---

## 5. Controlled Pilot Outbound Sending Verification

To guarantee zero accidental email leakage to external recipients during staging:
- `verifyPilotSendingAllowed(recipientEmail)` is strictly evaluated prior to RFC 2822 MIME generation.
- Allowed recipient patterns in `STAGED_DEVELOPMENT`:
  - `*@phumulani.org`
  - Approved staging tester whitelist (`stage-test`, `pilot-tester`, `qa-reviewer`).
- Any attempt to dispatch to external third-party recipients throws a deterministic `PILOT_GUARDED_BLOCK` error.

---

## 6. Token Disposal & Revocation Security

- Administrative disconnection calls `revokeAndPurgeTokens(mailboxEmail)`.
- Scrubs access token and refresh token from in-memory token vaults.
- Clears pending PKCE state tokens.
- Emits tamper-evident security audit log event `TOKEN_PURGED_AND_REVOKED`.
- Sets mailbox operational state to `REVOKED` / `DISCONNECTED`.

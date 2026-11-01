# Phumulani AI Community Platform — Phase 58 Enterprise Operations Monitoring & Recovery

**Document Reference:** `docs/development/phase58-monitoring-and-recovery.md`  
**Phase:** 58 — Enterprise Integration, Email Operations, Recovery Security & Live-Provider Verification  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Platform Architecture & Engineering  
**Primary Endpoints:** `GET /api/admin/operations/monitoring`, `POST /api/admin/email/recovery/execute`  
**Directive Reference:** Master Development Execution Directive Phase 58 (M58.15, M58.16)

---

## 1. Enterprise Operations Monitoring Architecture

The `GET /api/admin/operations/monitoring` endpoint provides real-time, comprehensive health auditing across all 10 core subsystems:

1. **`googleWorkspace`**: Evaluates OAuth adapter status, scopes, and connectivity.
2. **`mailboxes`**: Audits the canonical 10-mailbox inventory and active pilot status.
3. **`oauthTokens`**: Inspects encrypted token vault count and active PKCE sessions.
4. **`inboundSync`**: Tracks checkpoint logs and message import state.
5. **`outboundDelivery`**: Audits pilot gating, live sending flags, and allowlist rules.
6. **`postgresql`**: Truthfully reports 6-state persistence classification (`EMBEDDED_STAGING`).
7. **`aiGateway`**: Verifies 36-agent workforce health, anti-self-approval enforcement, and safeguarding air gap.
8. **`paymentGateway`**: Verifies Stripe settlement status and financial reserve separation ($390k cash reserve vs $125k pledges).
9. **`backendHosting`**: Verifies Express server and Vite integration on port 3000.
10. **`auditPersistence`**: Audits append-only immutable ledger and ISO-8601 timestamp integrity.

### Data Redaction Standards
The monitoring payload strictly redacts:
- OAuth access tokens and refresh tokens.
- OAuth client secrets and cryptographic private keys.
- Survivor PII, crisis details, and confidential safeguarding content.

---

## 2. Administrator Operational Recovery Engine

The `POST /api/admin/email/recovery/execute` endpoint provides administrators with authorized, audited operational remediations:

| Recovery Action | Target Component | Remediated State | Dry-Run Supported |
| :--- | :--- | :--- | :--- |
| **`RESET_RATE_LIMIT`** | Quota / Backoff Tracker | Resets exponential backoff counters, restoring mailbox to `CONNECTED` or `AUTHORIZATION_REQUIRED`. | Yes (`DRY_RUN_PROJECTED`) |
| **`CLEAR_ERROR_STATE`** | Gateway Error State | Clears transient HTTP 500/502/503 errors and restores healthy state. | Yes (`DRY_RUN_PROJECTED`) |
| **`RESET_SYNC_CURSOR`** | Gmail History Sync Cursor | Advances sync cursor to fresh timestamp cursor while preserving all local thread state and notes. | Yes (`DRY_RUN_PROJECTED`) |
| **`RECONCILE_STUCK_DISPATCH`** | Outbound Delivery Tracker | Reconciles ambiguous dispatches (`RECONCILIATION_REQUIRED` / `QUEUED`) to `DELIVERY_CONFIRMED`. | Yes (`DRY_RUN_PROJECTED`) |
| **`RESYNC_FULL_CHECKPOINT`** | Inbound Import Engine | Triggers fresh historical import checkpoint generation for the specified mailbox. | Yes (`DRY_RUN_PROJECTED`) |

### Security & Access Control Gates
1. **Mandatory Audit Reason**: Every recovery request must specify an explicit business reason. Empty or whitespace-only reasons fail closed (`AUDIT REQUIREMENT: Explicit recovery reason is mandatory.`).
2. **Elevated Role Authorization**: Restricted strictly to authorized administrative roles (`super_admin`, `executive_director`, `platform_super_admin`, `system_administrator`, `staff_lead`, `it_admin`, or `safeguarding_lead`). Unauthorized roles receive HTTP 403 `PERMISSION_DENIED`.
3. **Cross-Mailbox Safeguarding Isolation (Anti-IDOR)**:
   - Recovery on `safeguarding@phumulani.org` is strictly restricted to the authorized `safeguarding_lead` role.
   - Any non-safeguarding administrator attempting recovery on the safeguarding mailbox is rejected with HTTP 403 `CROSS_MAILBOX_ACCESS_DENIED`.
4. **Dry-Run Capability**: Supplying `{ dryRun: true }` calculates and returns the projected recovery state without mutating underlying database records, cursors, or delivery entries.
5. **Idempotency**: All recovery actions can be safely executed repeatedly without creating duplicate records or corrupted states.

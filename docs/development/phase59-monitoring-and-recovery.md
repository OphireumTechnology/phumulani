# Phumulani AI Community Platform — Phase 59 Operations Monitoring & Recovery

**Document Reference:** `docs/development/phase59-monitoring-and-recovery.md`  
**Phase:** 59 — Live Service Integration, Enterprise Email Operations & Institutional Acceptance  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Platform Architecture & Engineering  
**Primary Endpoints:** `GET /api/admin/operations/monitoring`, `POST /api/admin/email/recovery/execute`  
**Directive Reference:** Master Development Execution Directive Phase 59 (M59.14, M59.15, M59.16)

---

## 1. Enterprise Operations Monitoring API

The `GET /api/admin/operations/monitoring` endpoint provides real-time health auditing across all 10 core subsystems:

1. **`googleWorkspace`**: OAuth 2.0 configuration, scopes count, and connectivity status.
2. **`mailboxes`**: 10-mailbox canonical inventory and pilot designation.
3. **`oauthTokens`**: Encrypted token vault counts and active PKCE sessions.
4. **`inboundSync`**: Checkpoint logs and message synchronization state.
5. **`outboundDelivery`**: Pilot flags, live transmission guardrails, and allowlist counts.
6. **`postgresql`**: 6-state persistence classification (`EMBEDDED_STAGING`).
7. **`aiGateway`**: 36-agent workforce health, anti-self-approval enforcement, and safeguarding air-gap.
8. **`paymentGateway`**: Stripe gateway status and financial reserve segregation ($390k cash vs $125k pledges).
9. **`backendHosting`**: Express and Vite server engine on port 3000.
10. **`auditPersistence`**: Append-only immutable ledger and ISO-8601 timestamp integrity.

### Data Redaction Standards
Monitoring payloads strictly redact OAuth access tokens, refresh tokens, client secrets, private keys, survivor PII, and crisis communications.

---

## 2. Administrator Operational Recovery Engine & Rollback (M59.15)

The `POST /api/admin/email/recovery/execute` endpoint provides targeted operational recovery actions:

| Action | Component | Target Outcome | Dry-Run Supported |
| :--- | :--- | :--- | :--- |
| **`RESET_RATE_LIMIT`** | Quota Tracker | Resets backoff counters and restores mailbox status. | Yes (`DRY_RUN_PROJECTED`) |
| **`CLEAR_ERROR_STATE`** | Gateway Error | Clears transient HTTP 500/502 errors and restores healthy state. | Yes (`DRY_RUN_PROJECTED`) |
| **`RESET_SYNC_CURSOR`** | Sync Engine | Advances sync cursor while preserving local casework annotations. | Yes (`DRY_RUN_PROJECTED`) |
| **`RECONCILE_STUCK_DISPATCH`** | Delivery Tracker | Reconciles ambiguous dispatches to `DELIVERY_CONFIRMED`. | Yes (`DRY_RUN_PROJECTED`) |
| **`RESYNC_FULL_CHECKPOINT`** | Inbound Import | Generates fresh historical import checkpoint. | Yes (`DRY_RUN_PROJECTED`) |
| **`ROLLBACK_RECOVERY`** | Snapshot Engine | Atomically restores state to the pre-recovery snapshot. | N/A (Atomic Rollback) |

### Security & Anti-IDOR Invariants
1. **Mandatory Audit Reason**: Every recovery action requires an explicit audit reason fail-closed (`AUDIT REQUIREMENT: Explicit recovery reason is mandatory.`).
2. **Elevated Role Authorization**: Requires authorized administrator roles (`super_admin`, `executive_director`, `platform_super_admin`, `system_administrator`, `staff_lead`, `it_admin`, or `safeguarding_lead`). Unauthorized roles throw HTTP 403 `PERMISSION_DENIED`.
3. **Cross-Mailbox Safeguarding Isolation**: Recovery actions targeting `safeguarding@phumulani.org` are strictly restricted to the authorized `safeguarding_lead` role. Non-safeguarding admins are rejected with HTTP 403 `CROSS_MAILBOX_ACCESS_DENIED`.
4. **Recovery Rollback (`rollbackAdministratorRecovery`)**: Restores previous mailbox status, history cursor, and delivery states from the pre-recovery snapshot, logging `ADMIN_RECOVERY_ROLLBACK`.

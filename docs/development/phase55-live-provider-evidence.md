# Phumulani AI Community Platform — Phase 55 Live Provider Evidence & Disclosures

**Document Reference:** `docs/development/phase55-live-provider-evidence.md`  
**Phase:** 55 — External Service Activation Readiness, Live Email Pilot & Operational Verification  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 55 (M55.06 - M55.10)

---

## 1. Truthful Integration Disclosures (Zero-Fabrication Mandate)

Phumulani strictly enforces truthful status reporting. In `STAGED_DEVELOPMENT` mode, external live connectivity is never simulated or fabricated as connected when authentic third-party credentials or certificates are absent:

1. **Google Workspace Provider Status:** `BLOCKED_EXTERNAL` / `STAGED_DEVELOPMENT`  
   - Authentic OAuth 2.0 Client ID & Client Secret are not populated in the staging environment.
   - Provider connectivity checks cleanly return `BLOCKED_EXTERNAL` with clear failure reasons and recovery instructions.
2. **Live Email Sending:** `DISARMED` (`LIVE_EMAIL_SENDING_ENABLED=false`)  
   - Any attempt to transmit live messages fails closed with `LIVE_EMAIL_SENDING_DISABLED`.
   - In GitHub CI environments, live sending is unconditionally blocked (`LIVE SENDING FORBIDDEN IN CI`).
3. **External PostgreSQL Database:** `EMBEDDED_STAGING`  
   - The platform utilizes an isolated durable embedded staging engine with 49 schema tables and ACID transactions.
   - External database URIs report `EXTERNAL_NOT_CONFIGURED` or `PRODUCTION_NOT_AUTHORIZED`.
4. **Payment Gateway:** `NOT_CONNECTED`  
   - No live donor credit cards are processed. Staged mock transactions only.

---

## 2. Inbound Synchronization Evidence Categorization (M55.08)

The platform segregates inbound data imports into three auditable evidence categories:
- **`FIXTURE_VERIFIED`**: Synthetic and deterministic fixtures used to validate MIME parsing, thread reconstruction, and triage logic.
- **`PROVIDER_CONNECTED`**: Handshake confirmed with live provider API endpoints, valid TLS 1.3 ciphers, and active token exchange.
- **`LIVE_IMPORT_VERIFIED`**: Actual mailbox messages ingested directly from live provider mailboxes via authenticated API calls.

---

## 3. Rate-Limit Backoff & Jitter Verification (M55.09)

When external providers return HTTP 429 Too Many Requests, Phumulani executes an exponential backoff algorithm with deterministic jitter:
- **Attempt 0:** Base backoff `~1,000ms`
- **Attempt 1:** Backoff `~2,000ms` with jitter
- **Attempt 2:** Backoff `~4,000ms`
- **Max Retries (10):** Handled with `isMaxRetriesExceeded = true` and alert notification to Platform Super Admin.

---

## 4. Controlled Outbound Live Sending Test (M55.10)

The live sending test harness (`executeControlledLiveSendingTest`) enforces 7 consecutive pre-flight safety gates:
1. Environment CI check: Disallowed if `process.env.CI === 'true'`.
2. Live sending flag: Must have `liveSendingEnabled === true`.
3. Pilot activation flag: Must have `pilotEnabled === true`.
4. Allowlist containment: Target email must be in `approvedPilotRecipients`.
5. Executive approval: Must be signed by Executive Director or Platform Super Admin.
6. Target mailbox: Restricted strictly to `donations@phumulani.org`.
7. Idempotency key: Unique SHA-256 dispatch key required to prevent duplicate transmission.

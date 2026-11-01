# Phumulani AI Community Platform — Phase 52
## Google Workspace Controlled Live Pilot Readiness & OAuth 2.0 Provider Architecture

**Document ID:** `PHM-DOC-PHASE52-GW-001`  
**Classification:** Operational Infrastructure Specification  
**Environment:** Google AI Studio / GitHub Native Connection (`OphireumTechnology/phumulani`)  
**Operating Mode:** `STAGED_DEVELOPMENT` (Live Production Activation: NOT AUTHORIZED)  
**Pilot Mailbox Target:** `donations@phumulani.org`  
**Governing Directives:** M52.01 – M52.07

---

## 1. Executive Summary

Phase 52 transitions the Phumulani enterprise email subsystem from static integration validation into an operationally complete, fail-closed live-provider pilot posture. In accordance with organizational governance, live transmission remains restricted until explicit human executive authorization, Google Cloud project provisioning, and administrative consent are provided.

### Core Architecture Invariants:
1. **Single Mailbox Isolation:** The controlled live pilot is confined exclusively to `donations@phumulani.org`. All other 7 mailboxes remain in staged development mode.
2. **Dual Fail-Closed Authorization Gates:**
   - `GOOGLE_WORKSPACE_PILOT_ENABLED` (Default: `false`)
   - `LIVE_EMAIL_SENDING_ENABLED` (Default: `false`)
3. **Evidence Segregation:** Platform state maintains distinct, non-fungible classifications: `FIXTURE_VERIFIED`, `PROVIDER_CONNECTED`, and `LIVE_IMPORT_VERIFIED`.
4. **Emergency Rollback Kill-Switch:** Deactivation immediately resets both pilot flags to `false`, halts pending queues, and records an immutable audit log.

---

## 2. Full 10-State Connection Lifecycle (M52.02)

The platform implements and monitors the complete 10-state connection lifecycle across all mailboxes:

| Lifecycle State | Operational Meaning | Transition Triggers / Actions |
| :--- | :--- | :--- |
| `NOT_CONFIGURED` | Mailbox profile uninitialized | Mailbox creation; awaiting settings definition |
| `AUTHORIZATION_REQUIRED` | Initial baseline state; credentials needed | Clean startup; unauthenticated staging baseline |
| `AUTHORIZING` | Active OAuth handshake in progress | `startAuthorization()` invoked with PKCE S256 |
| `CONNECTED` | Tokens active and valid; handshake verified | `completeOAuthCallback()` with verified verifier |
| `SYNCING` | Inbound/outbound sync job executing | Worker running incremental or historical sync |
| `DEGRADED` | Intermittent network or rate-limit issues | Transient 5xx or backoff condition; auto-recovers |
| `REAUTHORIZATION_REQUIRED` | Token expired or refresh token invalid | Token expiry detected; fresh OAuth flow required |
| `REVOKED` | Tokens purged; administrative revocation | `revokeAccess()` executed; vault purged |
| `DISCONNECTED` | Administratively disconnected | `disconnect()` executed; sync jobs suspended |
| `ERROR` | Unrecoverable provider failure | Protocol mismatch, invalid credentials, or DNS error |

---

## 3. OAuth 2.0 PKCE & Identity Security (M52.03)

- **PKCE S256 Enforcement:** Authorization initiates with `code_challenge_method=S256` and cryptographically random code verifiers. Mismatched or forged code verifiers trigger immediate `PKCE VERIFICATION FAILED` errors.
- **Single-Use State Tokens:** Cryptographic state tokens (`state_...`) are tied strictly to individual mailboxes with a 10-minute TTL. Cross-mailbox tampering or state re-use is detected and blocked.
- **Least-Privilege 5 Scopes:**
  1. `https://www.googleapis.com/auth/gmail.send` (Quad-Action approved delivery only)
  2. `https://www.googleapis.com/auth/gmail.readonly` (Inbound triage ingestion)
  3. `https://www.googleapis.com/auth/gmail.modify` (Labels and read/unread sync)
  4. `https://www.googleapis.com/auth/gmail.labels` (25-category taxonomy labeling)
  5. `https://www.googleapis.com/auth/userinfo.email` (Domain verification)
  *(Full account `mail.google.com` access is strictly forbidden).*

---

## 4. Mailbox Separation: Primary vs. Auxiliary (M52.07)

### Primary Institutional Mailboxes (5):
- `info@phumulani.org`: Front desk, general public inquiries, community outreach.
- `donations@phumulani.org`: **Active Pilot Focus** — Donor stewardship, gift acknowledgments.
- `grants@phumulani.org`: Foundation funding, RFP submissions, compliance reporting.
- `partnerships@phumulani.org`: Corporate CSR, employer pipelines, civic alliances.
- `executive@phumulani.org`: Board communications, legal counsel, media requests.

### Auxiliary Specialized Mailboxes (3):
- `safeguarding@phumulani.org`: **Air-Gapped** — Sister Miriam K. confidential survivor intake (VAWA Section 1367).
- `governance@phumulani.org`: Board resolutions, quorum notices, audit committee minutes.
- `finance@phumulani.org`: David Mwangi, CPA — General ledger reconciliation, Form 990 audits.

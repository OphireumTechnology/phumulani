# Phumulani AI Community Platform — Phase 56 Google Workspace Live Provider Verification

**Document Reference:** `docs/development/phase56-google-workspace-verification.md`  
**Phase:** 56 — Live Provider Verification, PostgreSQL Integration & Enterprise Operational Acceptance  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 56 (M56.06 - M56.12)

---

## 1. Google Workspace Architecture Overview

The Google Workspace integration layer in `src/services/googleWorkspaceAdapter.ts` provides enterprise-grade OAuth 2.0 PKCE authentication, incremental inbound synchronization, token lifecycle management, recipient allowlisting, and controlled pilot execution for Phumulani institutional mailboxes.

In accordance with Phase 56 directives, all provider statuses strictly distinguish between internal simulation and actual Google Workspace provider connectivity, preventing any fabricated connectivity states.

---

## 2. OAuth 2.0 Security & Anti-Replay Protections (M56.06)

1. **PKCE S256 Challenge & Verifier:**
   - Every authorization handshake creates a high-entropy cryptographically random verifier (`base64url`) and a corresponding SHA-256 challenge.
   - Handshake states are registered in an ephemeral server-side map (`activeOAuthStates`) with a strict 10-minute expiration window.
2. **Replay Rejection:**
   - When an OAuth callback is received, the matching state token is immediately purged from memory upon first consumption.
   - Any replay attempt using the same state or code token is immediately rejected fail-closed.
3. **Provider Identity Enforcement:**
   - Returned user profiles are checked against institutional domain constraints (`@phumulani.org`).
   - Mismatches (e.g. attempting to authorize an `@external.com` address for an institutional mailbox) result in immediate rejection.

---

## 3. Seven Pre-Flight Institutional Safety Gates (M56.07)

Before any message can be dispatched or pilot transmission initiated, seven mandatory pre-flight checks must pass in sequence:

1. **Provider Connectivity Gate:** Mailbox must have verified OAuth credentials or active staged simulation.
2. **Token Health Gate:** Access token must be verified as valid and unexpired; refresh token present.
3. **Pilot Activation Gate:** Pilot mode must be actively authorized by an Executive Director or Super Admin.
4. **Recipient Allowlist Gate:** Destination address must be present in the approved pilot recipient set.
5. **Human Approval Gate:** Outbound draft must be approved by an authorized human reviewer via Quad-Action review.
6. **Safeguarding Quarantine Gate:** Category 01 survivor records are air-gapped; automated dispatch is physically forbidden.
7. **Emergency Kill-Switch Gate:** Global emergency disarm flag must be false; immediate shutdown stops all transmission.

---

## 4. Controlled Pilot Activation & Scope Quarantine (M56.08)

- **Target Pilot Mailbox:** Strictly constrained to `donations@phumulani.org`.
- **Authorized Approver Roles:** `executive_director`, `super_admin`, or `platform_super_admin`.
- **Time-Bound Approval:** Expiration timestamp is mandatory and enforced; expired approvals cannot authorize sending.
- **Fail-Closed Staging Enforcement:** In staging and CI environments, live external transmission flags remain disarmed (`LIVE_EMAIL_SENDING_ENABLED=false`), and provider calls report `BLOCKED_EXTERNAL`.

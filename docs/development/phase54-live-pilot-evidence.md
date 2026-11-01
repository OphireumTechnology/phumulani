# Phumulani AI Community Platform — Phase 54 Live Pilot Evidence & Mailbox Readiness

**Document Reference:** `docs/development/phase54-live-pilot-evidence.md`  
**Phase:** 54 — Google Workspace Pilot, External PostgreSQL & Enterprise Operations  
**Operating Mode:** STAGED_DEVELOPMENT (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 54 (M54.04, M54.07, M54.08)

---

## 1. Executive Summary

Phase 54 establishes the controlled operational pilot for the institutional mailbox `donations@phumulani.org`. In strict accordance with the Anti-Fabrication Mandate and fail-closed security architecture, live outbound transmissions are physically blocked unless an elevated executive co-sign approval is granted, an active approved recipients allowlist is configured, and time-bounded activation is verified.

At all times, `GOOGLE_WORKSPACE_PILOT_ENABLED` and `LIVE_EMAIL_SENDING_ENABLED` default to `false` in code and runtime environments.

---

## 2. Institutional Pilot Mailbox Specification

The designated pilot mailbox is strictly confined to Development & Stewardship:
- **Email Address:** `donations@phumulani.org`
- **Department:** Development & Stewardship
- **Scope Limit:** `DONATIONS_ONLY` (Interactions limited to individual gifts, corporate sponsorships, and donor stewardship).
- **Authorized Co-Signers:** Executive Director (`executive_director`), Development Director (`development_director`), or Platform Super Admin (`PLATFORM_SUPER_ADMIN`).

---

## 3. Seven Canonical Pre-Flight Safety Gates

Before any controlled pilot activation or test dispatch can take place, `GoogleWorkspaceAdapter.verifyPilotReady()` validates all seven canonical pre-flight gates:

1. **Mailbox Existence:** `donations@phumulani.org` must exist in the institutional directory.
2. **Domain Match:** Target address must end with `@phumulani.org`.
3. **Executive Authorization:** Co-sign decision must be `APPROVED` by an authorized role.
4. **OAuth Identity Match:** Verified provider identity must match `donations@phumulani.org`.
5. **Scope Approved:** Scope must be explicitly restricted to `DONATIONS_ONLY`.
6. **Recipients Allowlist Configured:** At least one pre-cleared recipient must exist in `approvedPilotRecipients`.
7. **Emergency Shutdown Functional:** The platform kill switch (`deactivatePilot()`) must be operational and verified.

---

## 4. Segregation of Verification Evidence

To ensure unambiguous auditability, Phumulani physically segregates operational evidence into three strict registries:

1. **`FIXTURE_VERIFIED`**: Unit and integration test assertions using synthetic test fixtures.
2. **`PROVIDER_CONNECTED`**: Evidence generated from authentic OAuth 2.0 token handshakes with Google Workspace endpoints.
3. **`LIVE_IMPORT_VERIFIED`**: Evidence from genuine Gmail API message sync and cursor persistence.

In `STAGED_DEVELOPMENT` mode, fixture tests are never reported as provider connections.

---

## 5. Instant Circuit Breaker & Emergency Deactivation

If any anomaly, rate limit breach, or unexpected behavior occurs:
- The administrator can invoke the emergency kill switch from `/admin/master/email` or via `POST /api/admin/email/pilot/deactivate`.
- Both `pilotEnabled` and `liveSendingEnabled` are immediately disarmed to `false`.
- The approved recipient allowlist is cleared.
- An immutable audit log entry is written to the persistent ledger.

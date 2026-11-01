# PHUMULANI AI COMMUNITY PLATFORM
## Phase 47 — Master Email Security, Safeguarding & Quad-Action Test Suite
**Target Test Suite:** Automated Acceptance Runner (`src/services/automatedTestRunner.ts`)  
**Scope:** Directives M47.01 through M47.18 (18 Acceptance Tests)  
**Total Platform Test Suite Baseline:** 706 Automated Tests (688 Historical M41-M46 + 18 Phase 47)  
**Status:** ALL TESTS PASSING (100% Assertion Integrity)

---

## 1. Test Suite Architecture & Verification Matrix

The Phase 47 test suite provides comprehensive test coverage across all administrative email management subsystems, safeguarding gates, human-in-the-loop co-signature protocols, idempotency guards, and provider-agnostic Google Workspace boundaries.

| Test ID | Canonical Name | Directive | Core Assertion & Security Invariant | Result |
| :--- | :--- | :---: | :--- | :---: |
| `TEST-P47-01` | Mailbox Account Administration & Readiness | M47.01 | 5 departmental mailboxes configured with truthful `AUTHORIZATION_REQUIRED` | **PASSED** |
| `TEST-P47-02` | Least-Privilege OAuth 2.0 Scope Policy | M47.02 | Validates 5 core Gmail scopes; strictly rejects excessive drive/admin scopes | **PASSED** |
| `TEST-P47-03` | 25-Category Incoming Message Taxonomy | M47.03 | Validates classification across grants (07), volunteerism (13), and sponsorships (06) | **PASSED** |
| `TEST-P47-04` | P0-P4 Urgency & SLA Hours Allocation | M47.04 | Maps priorities to operational SLAs: P0 (1h), P1 (4h), P2 (24h), P3 (48h) | **PASSED** |
| `TEST-P47-05` | Domestic Violence Safeguarding Quarantine | M47.05 | Crisis keywords & intake forms trigger Category 01 quarantine with P0 emergency flag | **PASSED** |
| `TEST-P47-06` | Safeguarding Anti-Auto-Responder Invariant | M47.06 | Auto-responder strictly suppressed on safeguarding emails (`blocked_by_safety`) | **PASSED** |
| `TEST-P47-07` | Sister Miriam K. / DEPT-SAFE Anti-IDOR | M47.07 | Safeguarding mailboxes restricted exclusively to Sister Miriam; visitors denied | **PASSED** |
| `TEST-P47-08` | AI Draft Watermarking & Co-Signature Gate | M47.08 | Unapproved drafts marked `AI_DRAFT`; unapproved outbound dispatches rejected | **PASSED** |
| `TEST-P47-09` | Quad-Action Gate 1: APPROVE (As-Is) | M47.09 | Human staff co-signs draft as-is; transitions thread status to `APPROVED` | **PASSED** |
| `TEST-P47-10` | Quad-Action Gate 2: EDIT_AND_APPROVE | M47.10 | Reviewer edits draft body; version increments to v2; marks `APPROVED` | **PASSED** |
| `TEST-P47-11` | Quad-Action Gate 3: REJECT with Reason | M47.11 | Reviewer rejects draft with mandatory audit reason; returns thread to `ASSIGNED` | **PASSED** |
| `TEST-P47-12` | Quad-Action Gate 4: ESCALATE_RETURN | M47.12 | Reassigns thread to senior officer (Comfort Dondo) with escalation guidance | **PASSED** |
| `TEST-P47-13` | Anti-AI Self-Approval & Role Gating | M47.13 | Automated AI agents (`ai_agent`) and public visitors are blocked from approving | **PASSED** |
| `TEST-P47-14` | Post-Approval Material Change Invalidation | M47.14 | Tampered draft body revokes approval state; returns to `returned_to_draft` | **PASSED** |
| `TEST-P47-15` | Outbound Dispatch & Idempotency Guard | M47.15 | Dispatches with unique key; suppresses duplicate dispatches with same key | **PASSED** |
| `TEST-P47-16` | Internal Staff Note Isolation & Leak Prevention | M47.16 | Internal caseworker notes are stripped from outbound RFC 2822 payload | **PASSED** |
| `TEST-P47-17` | 12 Operational Templates & Interpolation | M47.17 | 12 templates verified; dynamic tokens (`{{recipient_name}}`, etc.) cleanly merged | **PASSED** |
| `TEST-P47-18` | Seven-Language Parity & Staging Audit | M47.18 | Seven-language parity verified; audit logs durably stored in staging ledger | **PASSED** |

---

## 2. In-Depth Test Specifications

### TEST-P47-01: Mailbox Account Administration & Google Workspace Truthful Readiness
- **Objective:** Ensure all 5 departmental mailboxes (`info@`, `support@`, `director@`, `donations@`, `volunteers@`) are operational in `STAGED_DEVELOPMENT` mode with truthful `AUTHORIZATION_REQUIRED` status.
- **Assertion:** Adapter status equals `AUTHORIZATION_REQUIRED`, operational mode equals `STAGED_DEVELOPMENT`, and all mailboxes are registered.

### TEST-P47-02: Least-Privilege OAuth 2.0 Scope Policy Verification
- **Objective:** Verify least-privilege enforcement. Only `gmail.send`, `gmail.readonly`, `gmail.modify`, `gmail.labels`, and `userinfo.email` are allowed.
- **Assertion:** Excessive scopes like `https://www.googleapis.com/auth/drive` or `https://www.googleapis.com/auth/admin.directory.user` are flagged and rejected with `valid: false`.

### TEST-P47-05 & TEST-P47-06: Safeguarding Quarantine & Anti-Auto-Responder Invariant
- **Objective:** Ensure domestic violence disclosures never receive automated email responses.
- **Assertion:** Any incoming message classified as Category 01 (`01_safeguarding`) results in `evaluateAutoResponder().shouldSend === false` with status `blocked_by_safety`.

### TEST-P47-07: Sister Miriam K. / DEPT-SAFE Anti-IDOR Boundary & Redaction
- **Objective:** Ensure only authorized safeguarding staff (Sister Miriam K. / `safeguarding_lead`) can view unredacted crisis survivor communications.
- **Assertion:** Public visitors or unauthorized staff roles receive HTTP 403 or redacted payloads (`[REDACTED — CONFIDENTIAL SAFEGUARDING COMMUNICATION]`).

### TEST-P47-13: Anti-AI Self-Approval & Role Authorization Enforcement
- **Objective:** Guarantee that AI agents (e.g. `Agent A02 Email Manager`) cannot co-sign or approve their own drafts.
- **Assertion:** Invoking `executeQuadActionReview` with actor role `ai_agent` or `visitor` fails closed with `success: false`.

### TEST-P47-14: Server-Side Post-Approval Material Change Invalidation
- **Objective:** Verify that if an approved draft is modified without going through human review again, outbound dispatch is denied.
- **Assertion:** If `updatedBody !== approvedDraft.approvedBody`, the service revokes the approval and sets status to `returned_to_draft`.

### TEST-P47-15: Controlled Outbound Dispatch & Mandatory Idempotency Guard
- **Objective:** Guarantee that network retries or double-clicks do not cause duplicate emails to be sent.
- **Assertion:** A second dispatch call with the same `idempotencyKey` returns `success: false` and logs duplicate suppression.

### TEST-P47-16: Server-Side Internal Staff Note Isolation
- **Objective:** Ensure private casework notes (e.g. shelter coordinates, internal deliberations) never leak into outbound recipient emails.
- **Assertion:** Outbound email payload verification proves internal notes are 100% stripped from the message body.

### TEST-P47-17 & TEST-P47-18: 12 Templates & Seven-Language Parity
- **Objective:** Verify all 12 operational templates interpolate variables across all 7 supported languages (`en`, `so`, `es`, `hmn`, `kar`, `orm`, `am`).
- **Assertion:** Variable substitution succeeds without syntax errors; audit trails record full provenance in persistent storage.

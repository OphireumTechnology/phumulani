# Phumulani AI Community Platform — Phase 59 Outbound Email Dispatch

**Document Reference:** `docs/development/phase59-email-dispatch.md`  
**Phase:** 59 — Live Service Integration, Enterprise Email Operations & Institutional Acceptance  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Platform Architecture & Engineering  
**Directive Reference:** Master Development Execution Directive Phase 59 (M59.11, M59.12, M59.13)

---

## 1. Human Review Quad-Action Approval Workflow

All outbound draft emails composed or assisted by AI agents must pass through the Quad-Action human approval workflow:

- **`APPROVE`**: Unmodified sign-off. Captures authorized human signature and issues delivery authorization.
- **`EDIT_AND_APPROVE`**: Captures reviewer edits, increments draft version number (`v1 -> v2`), updates timestamp, and issues approval for the modified content.
- **`REJECT`**: Rejects proposed draft. **Mandatory audit reason required** fail-closed; empty or whitespace reasons throw validation errors.
- **`ESCALATE_RETURN`**: Reassigns draft back to senior staff or caseworkers for specialized investigation without approving dispatch.
- **Anti-AI Self-Approval**: AI agents are physically prohibited from approving drafts or co-signing outbound dispatches.
- **Stale Approval Invalidation**: Any post-signature modification to the draft immediately revokes prior approval.

---

## 2. Eight-State Delivery Lifecycle & Idempotency

Outbound message delivery follows an immutable eight-state lifecycle:
1. `STAGED`: Draft approved and staged for transmission.
2. `APPROVED`: Human authorization confirmed.
3. `QUEUED`: Queued in local delivery spooler.
4. `PROVIDER_ACCEPTED`: Provider API acknowledged receipt.
5. `DELIVERY_CONFIRMED`: Final external delivery evidence verified.
6. `FAILED`: Terminal transmission failure.
7. `CANCELLED`: Cancelled by administrator prior to dispatch.
8. `RECONCILIATION_REQUIRED`: Ambiguous response detected; delivery paused pending external confirmation.

- **24-Hour Dispatch Idempotency**: Duplicate send attempts with the same idempotency key are rejected within a 24-hour window.
- **Ambiguous Response Reconciliation**: Dispatches experiencing network timeouts enter `RECONCILIATION_REQUIRED` and do not blindly retry to prevent sending duplicate emails to donors.

---

## 3. Controlled Pilot Sending Protocol

- **Pilot Mailbox**: `donations@phumulani.org` exclusively.
- **Safety Flags**: `GOOGLE_WORKSPACE_PILOT_ENABLED=false` and `LIVE_EMAIL_SENDING_ENABLED=false` by default.
- **7 Pre-Flight Safety Gates**: Valid operating mode, designated mailbox, executive co-signature, pre-approved recipient allowlist, anti-AI self-approval, idempotency key, and emergency shutdown kill-switch.

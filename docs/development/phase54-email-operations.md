# Phumulani AI Community Platform — Phase 54 Enterprise Email Operations

**Document Reference:** `docs/development/phase54-email-operations.md`  
**Phase:** 54 — Google Workspace Pilot, External PostgreSQL & Enterprise Operations  
**Operating Mode:** STAGED_DEVELOPMENT (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 54 (M54.05 - M54.08)

---

## 1. Executive Summary

Phase 54 implements complete enterprise email operations across inbound synchronization, MIME decoding, security sanitization, Quad-Action human review, and 8 outbound delivery states. It eliminates message loss, prevents accidental duplicate dispatches, handles rate limits via exponential backoff with jitter, and provides deterministic reconciliation for ambiguous provider outcomes.

---

## 2. Inbound Message Processing & MIME Sanitization

- **MIME Parsing:** Extracts plain text and HTML components from multipart messages.
- **Threat Sanitization:** `decodeAndSanitizeMime()` cleanses HTML by stripping:
  - `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>` tags.
  - `javascript:`, `vbscript:`, `data:` URI schemes.
  - Inline JavaScript handlers (`onload=`, `onerror=`, `onclick=`).
  - Dangerous tracking pixels or malicious remote styles.
- **Attachment Quarantine:** Files with executable extensions (`.exe`, `.bat`, `.cmd`, `.sh`, `.vbs`, `.js`) or MIME mismatches are isolated to the quarantine registry with `SECURITY_QUARANTINED` status. Safe formats (`.pdf`, `.png`, `.jpg`, `.docx`, `.xlsx`) are validated against size and content limits.

---

## 3. Quad-Action Human Review Workflow

Outbound messages require explicit human interaction prior to dispatch. The system enforces four distinct operational actions:

1. **`APPROVE`**: Signs draft with reviewer ID and timestamp; transitions status to `APPROVED`.
2. **`EDIT_AND_APPROVE`**: Allows human modification of body/subject before co-signing and advancing to `APPROVED`.
3. **`REJECT`**: Records reviewer rationale; moves draft to `REJECTED` and halts dispatch.
4. **`ESCALATE_RETURN`**: Returns draft to caseworkers or AI agents for re-drafting with revision notes.

---

## 4. Eight Outbound Delivery States

Every outgoing message is tracked through an eight-state finite state machine:

| Delivery State | Description | Transition Rule |
| :--- | :--- | :--- |
| `STAGED` | Initial draft generated | Awaiting human Quad-Action review |
| `APPROVED` | Human co-signed and authorized | Transferred to dispatch worker queue |
| `QUEUED` | Placed in active outbound spool | Rate-limiter permits transmission |
| `PROVIDER_ACCEPTED` | Google Workspace returned HTTP 200 / message ID | Temporary intermediate confirmation |
| `DELIVERY_CONFIRMED` | Provider acknowledged delivery to downstream MTA | Final successful delivery terminal state |
| `FAILED` | Provider returned permanent rejection (5xx) | Administrator notification generated |
| `CANCELLED` | Administratively aborted prior to dispatch | Withdrawn from queue |
| `RECONCILIATION_REQUIRED` | Ambiguous outcome (timeout, 502/503 during send) | Idempotent provider query verifies status |

---

## 5. Duplicate Dispatch Prevention & Stale Approval Invalidation

- **Idempotency Enforcement:** Every dispatch requires an `idempotencyKey`. Duplicate submissions return the existing record without re-sending.
- **Stale Approval Invalidation:** If a draft body or recipient is modified after approval, its status is immediately revoked to `STAGED` with `STALE_APPROVAL_REVOKED`.

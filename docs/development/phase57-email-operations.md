# Phumulani AI Community Platform — Phase 57 Enterprise Email Operations

**Document Reference:** `docs/development/phase57-email-operations.md`  
**Phase:** 57 — Enterprise Email Operations, External Provider Integration & Production Security Hardening  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 57 (M57.08 – M57.11)

---

## 1. Standardized Quad-Action Human Review Workflow (M57.10)

The email review workflow standardizes all reviewer actions across frontend views and backend state machines:

| Action Verb | Normalized Mapping | Behavior & Enforcement Rules |
| :--- | :--- | :--- |
| **`APPROVE`** | Canonical | Stamped by authorized human reviewer. Transitions draft to `approved` and thread to `APPROVED`. Authorizes outbound transmission. |
| **`EDIT_AND_APPROVE`** | Normalizes legacy `EDIT` | Updates draft subject/body, automatically increments version number (`v1` -> `v2`), and transitions draft to `approved`. |
| **`REJECT`** | Canonical | Requires mandatory non-empty audit reason fail-closed (`AUDIT REQUIREMENT: Rejection requires an explicit reason.`). Returns thread to `TRIAGED` queue. |
| **`ESCALATE_RETURN`** | Normalizes legacy `REASSIGN` & `REQUEST_CHANGES` | Reassigns to senior reviewer or returns to drafting. Transitions thread to `ASSIGNED` (never `APPROVED`), strictly preventing accidental dispatch. |

---

## 2. Inbound Synchronization & Security (M57.08, M57.09)

- **25-Category Inbound Classification:** Automated triage assigns incoming emails into 25 functional categories with P0–P4 SLA deadlines.
- **MIME Decoding & Threat Sanitization:** All raw MIME emails pass through the sanitization pipeline, stripping `<script>`, `<iframe>`, `javascript:` URLs, and dangerous attributes.
- **Cursor Resync & Recovery:** When Google Workspace returns cursor expiration errors (404/410), the adapter executes safe resynchronization while preserving local annotations, assignments, and thread metadata.
- **Rate-Limit Exponential Backoff:** Inbound and outbound operations implement exponential backoff with random jitter upon encountering HTTP 429 errors.

---

## 3. Outbound Dispatch Engine & Delivery States (M57.11)

- **Delivery States:** `STAGED`, `APPROVED`, `QUEUED`, `PROVIDER_ACCEPTED`, `DELIVERY_CONFIRMED`, `FAILED`, `CANCELLED`, `RECONCILIATION_REQUIRED`.
- **24-Hour Idempotency Window:** Every outbound message requires an idempotency key. Duplicate dispatches are rejected fail-closed.
- **Stale Approval Invalidation:** Post-signature draft edits revoke previous human approval, requiring re-approval before transmission.
- **Ambiguous Outcome Reconciliation:** Network timeouts mark dispatches as `RECONCILIATION_REQUIRED`; confirmed delivery transitions to `DELIVERY_CONFIRMED` upon provider verification.

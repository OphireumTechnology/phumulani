# Phumulani AI Community Platform — Phase 52
## Enterprise Email Operations, Inbound Sync & Outbound Delivery Architecture

**Document ID:** `PHM-DOC-PHASE52-OPS-002`  
**Classification:** Operational Specification  
**Environment:** Google AI Studio / GitHub Native Connection  
**Target Module:** `/admin/master/email` & `src/services/emailEnterpriseService.ts`  
**Governing Directives:** M52.05, M52.06, M52.08, M52.09

---

## 1. Executive Summary

Phase 52 completes the end-to-end operational journey for enterprise email communications across all Phumulani applications. The lifecycle enforces complete determinism:
**Incoming Inbound Message ➔ MIME Sanitization ➔ 25-Category Triage ➔ Priority Scoring ➔ Staff Assignment ➔ AI Draft Proposal ➔ Quad-Action Human Approval ➔ Outbound Dispatch Tracking ➔ Follow-Up Task Scheduling ➔ Resolution ➔ Continuous Immutable Audit.**

---

## 2. Inbound Gmail Synchronization & Sanitization (M52.05)

- **MIME Body Decoding & HTML Scrubbing:**
  All incoming HTML payloads are sanitized by `GoogleWorkspaceAdapter.decodeAndSanitizeMime()`:
  - Dangerous `<script>` tags stripped and replaced with `[FILTERED_SCRIPT]`.
  - Nested `<iframe>` embeddings neutralized.
  - Inline JavaScript execution handlers (`onload=`, `onerror=`, `onclick=`) replaced with disabled attributes.
  - Dangerous protocol schemes (`javascript:`) converted to harmless links.
- **Attachment Policies:**
  - Allowed file types: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.docx`.
  - Blocked executable attachments: `.exe`, `.bat`, `.sh`, `.cmd`, `.vbs`, `.js`, `.scr` quarantined immediately.
  - File size threshold: 25MB maximum.
- **Resilient Sync Architecture:**
  - Inbound deduplication prevents duplicate threads from duplicate message IDs (`TEST-P52-14a`).
  - History cursors persisted in sync checkpoints.
  - Expired cursors (Google 404/410) trigger full reconciliation while strictly preserving local caseworker assignments and thread annotations (`TEST-P52-15b`).
  - Rate limiting implements exponential backoff with randomized jitter up to a 5-attempt retry ceiling.

---

## 3. Outbound Gmail Delivery State Machine (M52.06)

To prevent phantom delivery confirmations and duplicate dispatches, outbound messages progress through 7 canonical states:

```
[ STAGED ] ──► [ APPROVED ] ──► [ QUEUED ] ──► [ PROVIDER_ACCEPTED ] ──► [ DELIVERY_CONFIRMED ]
                                    │
                                    ├──► [ RECONCILIATION_REQUIRED ] (Ambiguous outcome)
                                    ├──► [ FAILED ]
                                    └──► [ CANCELLED ]
```

1. **`STAGED`:** AI-generated draft awaiting human review.
2. **`APPROVED`:** Human co-signed via Quad-Action review (`approveDraft` / `executeQuadActionReview`).
3. **`QUEUED`:** Enqueued in outbound dispatch queue with a unique idempotency key.
4. **`PROVIDER_ACCEPTED`:** Google Gmail API returned HTTP 200/202 acceptance stamp.
5. **`DELIVERY_CONFIRMED`:** Verified against sent folder reconciliation.
6. **`RECONCILIATION_REQUIRED`:** Ambiguous provider outcome (e.g. socket timeout); halts resending until provider message ID or human audit confirms status (`TEST-P52-17a`).
7. **`FAILED`:** Unrecoverable provider rejection.
8. **`CANCELLED`:** Administratively revoked prior to transmission.

---

## 4. Priority System & SLA Monitoring (M52.09)

The platform enforces the P0–P4 priority SLA framework:

| Priority | SLA Deadline | Focus Categories | Escalation Protocol |
| :--- | :---: | :--- | :--- |
| **P0 — Critical** | **1 hour** | `01_safeguarding`, emergency crises | Immediate supervisor alert; Sister Miriam K. quarantine; **alert details redacted** to protect survivor safety. |
| **P1 — Urgent** | **4 hours** | `02_executive`, `03_board_governance`, grants < 24h | Operations alert sent to Comfort Dondo and David Mwangi, CPA. |
| **P2 — High** | **24 hours** | `04_major_donors`, `06_corporate_sponsorships` | Development coordinator check-in; pipeline deal flagged. |
| **P3 — Normal** | **48 hours** | `13_volunteer_applications`, `15_community_programs` | Standard caseworker queue assignment. |
| **P4 — Low** | **72 hours** | `24_newsletters_announcements`, routine info | Bulk processing queue. |

SLA breaches automatically generate supervisor escalation notifications via `EmailEnterpriseService.calculateSlaStatus()`.

# Phumulani AI Community Platform — Phase 53 Email Operations

**Document Reference:** `docs/development/phase53-email-operations.md`  
**Phase:** 53 — Live-Provider Pilot, Enterprise Email Operations & External Database Acceptance  
**Status:** STAGED_DEVELOPMENT (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 53 (M53.05 - M53.11)

---

## 1. Unified Email Administration Architecture

The Phumulani Email Administration system operates across all five platform applications with the 25 canonical classification categories, 10 conversation lifecycle states, and 8 outbound delivery states.

### Mailbox Registry
The platform manages five core institutional mailboxes and three specialized auxiliary desks:
1. `info@phumulani.org` (Front Office & General Inquiries)
2. `donations@phumulani.org` (Individual Donations & Major Donor Stewardship)
3. `grants@phumulani.org` (Foundation Grants & Government Funding)
4. `partnerships@phumulani.org` (Corporate CSR & Coalition Relations)
5. `executive@phumulani.org` (Executive Director Comfort Dondo & Governance)
*Auxiliary Specialized Desks:*
6. `safeguarding@phumulani.org` (Confidential Survivor Inquiries & Safety Planning - VAWA Section 1367 isolated)
7. `governance@phumulani.org` (Board of Directors Secretariat)
8. `finance@phumulani.org` (Finance & Comptroller David Mwangi, CPA)

---

## 2. Inbound Gmail Operations (M53.05)

### MIME Decoding & HTML Threat Sanitization
Every incoming raw RFC payload is decoded and sanitized by `GoogleWorkspaceAdapter.decodeAndSanitizeMime()`:
- `<script>` blocks: Neutralized to `[FILTERED_SCRIPT]` (`SCRIPT_TAG_INJECTION`).
- `<iframe>` elements: Neutralized to `[FILTERED_IFRAME]` (`IFRAME_INJECTION`).
- Inline event handlers (`onclick`, `onload`, `onerror`): Neutralized to `data-disabled-handler=""` (`INLINE_EVENT_HANDLER`).
- `javascript:` URI schemes: Rewritten to `about:blank#filtered-` (`JAVASCRIPT_URI_SCHEME`).
- Plain text extraction: Cleaned of HTML markup and normalized.

### Attachment Validation & Quarantine
`GoogleWorkspaceAdapter.validateAttachment()` strictly blocks risky attachments:
- Dangerous file extensions (`.exe`, `.bat`, `.sh`, `.cmd`, `.vbs`, `.js`, `.scr`) are quarantined.
- Files exceeding 25MB are rejected (`ATTACHMENT_SIZE_EXCEEDED`).
- Standard safe documents (PDFs, PNG, JPEG, DOCX) under 25MB are validated and indexed.

### Sync Cursors & Fault Recovery
- Incremental history sync tracks cursors (`cursor-${timestamp}-${suffix}`).
- If Google Workspace reports `404/410 History Cursor Expired`, the system triggers `recoverInvalidCursor()`, resetting the cursor to a fresh baseline while strictly preserving all local threads, CRM links, and caseworker notes.

---

## 3. Quad-Action Human Review & Outbound Delivery Lifecycle (M53.07)

AI agents (`ORG-AI-001`-`018`, `FUND-AI-001`-`018`) operate strictly as drafting assistants. Automated AI self-approval or unapproved sending is physically prohibited by code.

### Canonical Quad Actions
1. **`APPROVE`:** Signs draft with human approver ID and timestamp, locks content to current version, and transitions thread status to `APPROVED`.
2. **`EDIT_AND_APPROVE`:** Saves human edits, increments draft version (e.g. v1 -> v2), binds approval to new version, and transitions to `APPROVED`.
3. **`REJECT`:** Rejects draft with required caseworker explanation, returns thread to `ASSIGNED`.
4. **`ESCALATE_RETURN`:** Returns draft to caseworker with feedback or escalates to senior supervisor.

### Outbound Delivery Finite State Machine
Outbound dispatches transition through 8 distinct states:
`STAGED` -> `APPROVED` -> `QUEUED` -> `PROVIDER_ACCEPTED` -> `DELIVERY_CONFIRMED`  
*Exception states:* `FAILED`, `CANCELLED`, `RECONCILIATION_REQUIRED`.

- **Ambiguous Outcomes (`RECONCILIATION_REQUIRED`):** When network timeouts or ambiguous provider responses occur, the message is placed in review without automatic duplicate re-transmission. Caseworkers can reconcile against the Gmail sent folder or provider evidence message ID to reach `DELIVERY_CONFIRMED`.

---

## 4. Priority Levels & SLA Monitoring (M53.06, M53.20)

| Priority | Canonical SLA | Target Categories | Escalation Behavior |
| :--- | :--- | :--- | :--- |
| **P0 — Critical** | 1 Hour | 01 Safeguarding | Immediate supervisor alert (redacted for survivor privacy) |
| **P1 — Urgent** | 4 Hours | 02 Executive, 03 Governance, 07 Grants, 08 Gov Funding, 18 Media | Approaching deadline notification at 75% elapsed |
| **P2 — High** | 24 Hours | 04 Major Donors, 06 Corporate Sponsorships, 11 Partnerships, 19 Finance | Dashboard warning badge |
| **P3 — Normal** | 48 Hours | 05 Individual Donations, 13 Volunteers, 15 Programs, 23 General Inquiries | Normal triage queue |
| **P4 — Low** | 72 Hours | 24 Newsletters, 25 Spam Filtering | Background review |

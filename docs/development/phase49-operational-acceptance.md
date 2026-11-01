# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 49 — OPERATIONAL ACCEPTANCE CRITERIA & ROLE SCENARIOS

**Repository:** `OphireumTechnology/phumulani`  
**Operational Status:** `STAGED_DEVELOPMENT`  
**Quality Gate:** M49.20 & M49.21 Operational Readiness  

---

## 1. ORGANIZATIONAL ACCEPTANCE FRAMEWORK

Phase 49 establishes verifiable, end-to-end operational acceptance scenarios for all six key institutional roles. In accordance with organizational governance, human acceptance is NOT simulated or fabricated; acceptance remains formally PENDING until authorized representatives execute these acceptance procedures.

---

## 2. ROLE-SPECIFIC ACCEPTANCE SCENARIOS

### Scenario 1: Email Administrator
- **Designated Role:** IT / Infrastructure Administrator
- **Operational Interface:** `/admin/master/email` (Mailbox Administration Tab)
- **Acceptance Steps:**
  1. Register a new organizational mailbox configuration (`advocacy@phumulani.org`).
  2. Execute connection test handshake and observe simulated latency (18–45ms).
  3. Initiate OAuth 2.0 PKCE onboarding; verify authorization URL targets Google accounts.
  4. Verify state parameter generation and tamper-detection rejection on forged tokens.
  5. Trigger administrative disconnection and verify status transitions immediately to `DISCONNECTED`.
- **Status:** `STAGING_VERIFIED — PENDING_PRODUCTION_ONBOARDING`

### Scenario 2: Communications Staff
- **Designated Role:** Amina Yusuf (Front Office & Communications Coordinator)
- **Operational Interface:** `/admin/master/email` (Unified Inbox & Triage)
- **Acceptance Steps:**
  1. Ingest inbound inquiry into `info@phumulani.org`.
  2. Verify 25-category automated classification tags message as `23_general_inquiries` (P3 Normal).
  3. Generate AI draft in `professional` tone.
  4. Verify visible watermark: `AI_DRAFT — NOT APPROVED — NOT SENT`.
  5. Submit draft for supervisor review; verify thread transitions to `awaiting_approval`.
- **Status:** `STAGING_VERIFIED — PENDING_LIVE_DISPATCH_AUTHORIZATION`

### Scenario 3: Department Supervisor
- **Designated Role:** David Mwangi, CPA (Finance Director & Comptroller)
- **Operational Interface:** `/admin/master/email` (Pending Approvals & Grants Tab)
- **Acceptance Steps:**
  1. Review pending draft for Bush Foundation grant LOI (`th-grant-01`).
  2. Execute `EDIT_AND_APPROVE` with audited financial co-signatures.
  3. Verify draft version increments to `v2` with supervisor attribution.
  4. Authorize outbound dispatch with idempotency key.
  5. Verify RFC 2822 payload serialization, SHA-256 hash, and staged Sent ledger record.
- **Status:** `STAGING_VERIFIED — PENDING_LEADERSHIP_CO_SIGN`

### Scenario 4: Safeguarding Lead
- **Designated Role:** Sister Miriam K. (`usr-002` / `DEPT-SAFE`)
- **Operational Interface:** `/admin/master/email` (Confidential Safeguarding Desk)
- **Acceptance Steps:**
  1. Ingest confidential crisis intake (`th-safe-01`).
  2. Verify automated classification locks thread into `01_safeguarding` (P0 Critical, 1-hour SLA).
  3. Verify automated AI drafting and auto-responders are strictly DISABLED.
  4. Verify non-safeguarding staff members receive masked metadata with body text redacted.
  5. Verify CRM linking to external donor/volunteer registries is REJECTED under VAWA Section 1367.
- **Status:** `SECURITY_VERIFIED — READY_FOR_LEAD_REVIEW`

### Scenario 5: Executive Director
- **Designated Role:** Comfort Dondo (Founder & Executive Director)
- **Operational Interface:** `/admin/master/email` (Executive Communications Tab)
- **Acceptance Steps:**
  1. Review high-priority legislative hearing testimony request (`th-exec-01`, P1 Urgent).
  2. Approve executive briefing draft co-authored by A01 Executive Assistant.
  3. Execute `ESCALATE_RETURN` to assign follow-up tasks to legal counsel.
  4. Review executive email analytics across all 5 organizational mailboxes.
- **Status:** `EXECUTIVE_REVIEW_PENDING — STAGED_FUNCTIONAL`

### Scenario 6: Board Governance Reviewer
- **Designated Role:** Dr. Elena Rostova (Board Secretary & Governance Committee)
- **Operational Interface:** `/admin/master/email` (Audit Logs & Governance Exports)
- **Acceptance Steps:**
  1. Inspect immutable synchronization audit logs for all outbound dispatches.
  2. Export sanitized governance sync report (`EmailEnterpriseService.sanitizeAndExportSyncReport()`).
  3. Verify zero survivor PII or domestic violence disclosures appear in exported records.
- **Status:** `AUDIT_VERIFIED — READY_FOR_BOARD_PRESENTATION`

---

## 3. REMAINING EXTERNAL PREREQUISITES FOR PRODUCTION ACTIVATION

1. **Google Workspace Admin Consent:** Formal OAuth 2.0 domain delegation by organizational administrator.
2. **PostgreSQL Production Connection:** External Cloud SQL or PostgreSQL database instance connection.
3. **Executive Co-Signatures:** Final signoff from Comfort Dondo and David Mwangi, CPA.

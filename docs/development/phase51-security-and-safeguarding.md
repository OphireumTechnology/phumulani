# Phumulani AI Community Platform — Phase 51
## Safeguarding, Security Architecture & Anti-Injection Verification Report

**Document ID:** `PHM-DOC-PHASE51-SEC-004`  
**Classification:** Security Architecture & Safeguarding Specification  
**Governing Standard:** VAWA Section 1367 / MN Domestic Abuse Act  
**Target Modules:** `src/services/emailEnterpriseService.ts`, `src/services/db.ts`

---

## 1. VAWA Section 1367 Safeguarding Air Gap

Phumulani operates confidential support services for African immigrant women and families affected by domestic and sexual violence in Minnesota. Federal and state laws strictly prohibit disclosure of confidential survivor records.

### Category 01 Safeguarding Invariants:
1. **Confidential Classification:** Any email or inquiry containing crisis markers (e.g. domestic violence, immediate danger, orders for protection, safe shelter) is classified into Category `01_safeguarding` (`TEST-P51-16a`).
2. **Automated Response Suppression:** External automated auto-responders are unconditionally blocked for Category 01 to prevent revealing communication trails on a survivor's device (`TEST-P51-16b`).
3. **AI Generation Air Gap:** AI drafting engines are barred from ingesting or generating drafts for Category 01 records.
4. **CRM Link Exclusion:** Attempts to link Category 01 records to CRM databases (donor or volunteer) fail-closed with a security error.
5. **Staff Access Boundary:** Quarantined threads are accessible exclusively to authorized safeguarding personnel (Sister Miriam K.) and Platform Super Admin. General staff searches exclude these records entirely.

---

## 2. Inbound Prompt-Injection & Jailbreak Neutralization

Untrusted incoming emails from external senders could attempt prompt-injection to subvert AI triage or drafting engines. The platform enforces multi-layer sanitization:

- **Instruction Scrubbing:** Text matching override patterns (e.g., `"ignore all previous instructions"`, `"system prompt"`, `"reveal confidential records"`) is stripped and replaced with `[PROMPT_INJECTION_FILTERED]` (`TEST-P51-23`).
- **XML Tag Encapsulation:** Unsanitized email body text is encapsulated within `<untrusted_user_input>` delimiters, preventing model context escaping.
- **Attachment Policy:** Only authorized MIME types (PDF, PNG, JPG, DOCX) under 25MB are permitted. Executables (`.exe`, `.bat`, `.sh`, `.js`) are quarantined (`TEST-P51-15`).

---

## 3. Anti-IDOR Authorization Hardening

All REST and internal service endpoints enforce strict ownership and role verification:
- Accessing or modifying a thread requires validating that the requester has access to that mailbox.
- Non-safeguarding users attempting to query thread IDs belonging to Category 01 receive an authorization failure.
- Outbound sends verify that the sender identity matches an authorized staff profile and possesses the required role permissions (`TEST-P51-13`).

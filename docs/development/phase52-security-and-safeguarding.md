# Phumulani AI Community Platform — Phase 52
## Security Architecture, Safeguarding Quarantine & AI Workforce Safety

**Document ID:** `PHM-DOC-PHASE52-SEC-004`  
**Classification:** Security Architecture & Safeguarding Specification  
**Governing Laws:** VAWA Section 1367 / Minnesota Domestic Abuse Act  
**Target Modules:** `src/services/emailEnterpriseService.ts`, `src/services/db.ts`  
**Governing Directives:** M52.13, M52.14, M52.15

---

## 1. Confidential Safeguarding Boundary (VAWA Section 1367)

Phumulani provides confidential advocacy, legal support, and transitional shelter for African immigrant survivors of domestic and gender-based violence. The safeguarding boundary enforces zero-disclosure controls:

### Category 01 Invariants:
1. **Air-Gapped Quarantine:** Correspondence containing crisis indicators is classified as Category `01_safeguarding` and restricted exclusively to authorized safeguarding personnel (Sister Miriam K.) and Platform Super Admin.
2. **Automated Response Suppression:** External automated auto-responders are unconditionally suppressed for Category 01 to eliminate safety hazards on survivor devices (`TEST-P52-30`).
3. **AI Generation Exclusion:** AI drafting engines are strictly forbidden from reading, analyzing, or generating drafts for Category 01 correspondence.
4. **Search Masking:** Full-text and keyword searches by general staff exclude Category 01 records entirely.
5. **Redacted SLA Alerts:** When an SLA breach occurs on a Category 01 thread, supervisor notifications are emitted in redacted form, revealing no survivor identity, address, or confidential details (`TEST-P52-24`).
6. **CRM Segregation:** Attempts to link Category 01 records to donor or volunteer CRM systems fail-closed with security violations.

---

## 2. Security Negative Testing Matrix (M52.14)

All security protections are validated via automated negative test vectors:

- **Cross-Mailbox IDOR:** State token tampering across mailboxes is blocked (`TEST-P52-05`).
- **Forged PKCE Verifier:** Rejected with explicit authentication failure (`TEST-P52-04`).
- **Unauthorized Pilot Activation:** Visitor/staff attempts to activate the email pilot are rejected (`TEST-P52-19`).
- **Unauthorized Live Email Sending:** Blocked while `LIVE_EMAIL_SENDING_ENABLED=false` (`TEST-P52-21`).
- **Prompt Injection Defense:** Instructions such as `"ignore all previous instructions"` are scrubbed and replaced with `[PROMPT_INJECTION_FILTERED]`.
- **HTML Script & Event Injection:** Dangerous tags (`<script>`, `<iframe>`, inline handlers) are neutralized during MIME decoding (`TEST-P52-12`).
- **Malicious Attachments:** Executable files (`.exe`, `.bat`, `.sh`) are quarantined (`TEST-P52-13a`).

---

## 3. AI Workforce Safety & Governance (M52.15)

The 36 canonical AI agents (`ORG-AI-001` through `ORG-AI-018`, `FUND-AI-001` through `FUND-AI-018`) operate under strict governance:
- **No Independent Outbound Dispatch:** Every AI-generated draft mandates human review and approval.
- **Anti-AI Self-Approval:** Automated agents attempting to approve or co-sign dispatches are rejected fail-closed (`TEST-P52-22b`).
- **Draft-Only Scope:** Agents produce advisory proposals with confidence scoring; final authority resides with human officers.

# Phumulani AI Community Platform — Phase 50
## Enterprise Security Assurance, Safeguarding Architecture & Anti-Tamper Controls

**Document ID:** `PHM-DOC-PHASE50-SEC-003`  
**Classification:** Security Architecture & Safeguarding Specification  
**Governing Mandates:** Violence Against Women Act (VAWA) 8 U.S.C. § 1367, CJIS Safeguards, OWASP Top 10 LLM

---

## 1. Category 01 VAWA Section 1367 Safeguarding Boundary

Phumulani implements an architectural firewall isolating survivor crisis intake, domestic violence disclosures, and safety planning communications:

1. **Quarantine & Access Isolation:**
   - Any correspondence containing trauma indicators, protection orders, emergency shelter requests, or crisis hotline referrals is classified as `01_safeguarding`.
   - Access is restricted exclusively to authorized safeguarding personnel (Sister Miriam K. / DEPT-SAFE).
   - General staff, development officers, and external partners receive body-masked placeholders (`[CONFIDENTIAL SAFEGUARDING QUARANTINE - SISTER MIRIAM K. ACCESS ONLY]`).
2. **Anti-IDOR Protection:**
   - Direct object access to thread IDs classified under `01_safeguarding` is rejected for any non-safeguarding user session with HTTP 403 Forbidden.
3. **CRM Exclusion:**
   - Safeguarded threads are strictly prohibited from linking to public constituent databases, donor CRM records, volunteer profiles, or marketing lists.
4. **Autonomous AI Drafting Prohibition:**
   - Automated AI draft generation is physically disabled for Category 01. Responses must be authored directly by Sister Miriam K.

---

## 2. Anti-AI Self-Approval & Quad-Action Human Review Governance

The platform prevents autonomous AI agents from sending organizational communications without authorized human sign-off:

- **Quad-Action Human Review Gate:**
  1. `APPROVE`: Human reviewer co-signs the proposed draft for outbound dispatch.
  2. `EDIT_AND_APPROVE`: Human reviewer amends facts, tone, or terms, establishing a new draft revision before approval.
  3. `REQUEST_CHANGES`: Draft is routed back to the drafting team with specific revision notes.
  4. `REJECT`: Proposed draft is permanently discarded.
- **Anti-AI Self-Approval Rule:**
  - `dispatchStagedMessage()` explicitly verifies `approvedByUserId`.
  - Any approval attempt where `approvedByUserId` starts with `ai-` or `approvedByName` contains `agent` is rejected with `ANTI-AI SELF-APPROVAL VIOLATION`.
- **Idempotency & Duplicate Prevention:**
  - Every outbound dispatch requires a unique idempotency key.
  - Re-submission of an existing key throws `DUPLICATE DISPATCH REJECTED`.

---

## 3. Untrusted Content Sanitization & Prompt-Injection Defense

All external email data is treated as untrusted and hostile:

1. **Active Script Neutralization:**
   - Strips `<script>`, `<iframe>`, `onerror`, `onload`, and `javascript:` URIs.
2. **Instruction Override Neutralization:**
   - Filters common prompt-injection jailbreak payloads (`ignore previous instructions`, `system override`, `bypass approval`, `auto-approve draft`, `reveal api keys`).
3. **Structured Prompt Boundary:**
   - When calling LLMs for classification or drafting, external text is quarantined inside strict `<untrusted_correspondence>` encapsulation tags with explicit system instructions prohibiting role assumption.

---

## 4. OAuth 2.0 PKCE Security & State Tampering Detection

- **PKCE S256 Enforcement:** SHA-256 code challenge is sent to Google; code verifier is validated on token exchange.
- **Cryptographic State Validation:**
  - State tokens expire in 10 minutes.
  - Cross-mailbox tampering (attempting to use an authorization code issued for mailbox A on mailbox B) is detected and rejected with `CROSS-MAILBOX STATE TAMPERING DETECTED`.
  - Tampered, reused, or forged state tokens throw `OAUTH STATE TAMPERING DETECTED`.

---

## 5. Secrets Management & Diagnostics Sanitization

- API keys and database credentials are kept exclusively on the server side (`process.env.DATABASE_URL`, `process.env.GEMINI_API_KEY`).
- No UI displays plaintext private keys or bearer access tokens.
- Exported audit logs and diagnostics outputs automatically sanitize sensitive connection strings, tokens, and PII.

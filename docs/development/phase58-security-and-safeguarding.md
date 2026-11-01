# Phumulani AI Community Platform — Phase 58 Security & Safeguarding Architecture

**Document Reference:** `docs/development/phase58-security-and-safeguarding.md`  
**Phase:** 58 — Enterprise Integration, Email Operations, Recovery Security & Live-Provider Verification  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Platform Architecture & Engineering  
**Directive Reference:** Master Development Execution Directive Phase 58 (M58.16, M58.17, M58.18)

---

## 1. Statutory Compliance: VAWA Title VIII & 8 U.S.C. § 1367

The Violence Against Women Act (VAWA) and 8 U.S.C. § 1367 establish strict statutory confidentiality safeguards for survivors of domestic violence, human trafficking, sexual assault, and stalking.

In compliance with these legal protections, the Phumulani platform enforces an impenetrable computational and operational air-gap:

1. **Zero CRM Linkage**:
   - Records classified under `01_safeguarding` are never associated with constituent CRM profiles, donor databases, volunteer records, or marketing rosters.
   - Any attempt to link a Category 01 survivor thread to a CRM entity is blocked.

2. **Zero Automated Email Responses**:
   - Automated email responders, rules, and bounce processors are completely disabled for `safeguarding@phumulani.org`.
   - Prevents unauthorized disclosures to shared email inboxes or abuser-monitored devices.

3. **Physical Runtime AI Exclusion**:
   - Calling `EmailEnterpriseService.generateDraft()` on any `01_safeguarding` thread physically throws an unhandled exception:
     `SAFEGUARDING_AIR_GAP_VIOLATION: Automated AI drafting is strictly prohibited on Category 01 confidential safeguarding records under VAWA Section 1367.`
   - Survivor responses must be composed manually by licensed, authorized safeguarding staff (Sister Miriam K. / Dr. Elena Rostova).

4. **Cross-Mailbox Recovery Isolation (Anti-IDOR)**:
   - Administrator operational recovery actions targeting `safeguarding@phumulani.org` require the explicit `safeguarding_lead` role.
   - Any general IT administrator, super administrator, or other staff member attempting recovery is rejected with HTTP 403 `CROSS_MAILBOX_ACCESS_DENIED`.

---

## 2. Platform Threat Model & Defenses

| Threat Vector | Potential Vulnerability | Implemented Defense Mechanism | Verification Standard |
| :--- | :--- | :--- | :--- |
| **OAuth Callback Replay** | Attacker replays intercepted auth code | State nonces purged immediately on first access | `TEST-P58-05` |
| **Provider Identity Hijack** | Attacker uses unauthorized Google domain | Identity matching against institutional catalog | `TEST-P58-07` |
| **MIME Injection / XSS** | Attacker injects malicious HTML / JS | Recursive HTML sanitization stripping scripts/iframes | `TEST-P58-13` |
| **AI Self-Approval** | Compromised agent authorizes dispatch | Role verification banning AI IDs/names | `TEST-P58-08`, `TEST-P58-16` |
| **Duplicate Dispatch** | Repeated requests cause multi-sends | 24-hour idempotency key registry | `TEST-P58-18` |
| **Survivor PII Leakage** | Monitoring API discloses survivor data | Strict data redaction in monitoring aggregator | `TEST-P58-21` |
| **Safeguarding Breach** | Non-safeguarding admin resets mailbox | Cross-mailbox IDOR check requiring `safeguarding_lead` | `TEST-P58-23` |
| **Stale Dispatch Alteration** | Draft altered post human approval | Hash check revoking approval on material change | `TEST-P58-17` |
| **SQL Injection** | Attacker injects malicious query fragments | Parameterized queries + ORM abstraction | `TEST-P58-25` |

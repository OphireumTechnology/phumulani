# Phumulani AI Community Platform — Phase 53 Security and Safeguarding

**Document Reference:** `docs/development/phase53-security-and-safeguarding.md`  
**Phase:** 53 — Live-Provider Pilot, Enterprise Email Operations & External Database Acceptance  
**Status:** STAGED_DEVELOPMENT (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 53 (M53.15 - M53.17)

---

## 1. Confidential Safeguarding Boundary (VAWA Section 1367)

Phumulani enforces strict non-disclosure protections under the Violence Against Women Act (VAWA Section 1367, 8 U.S.C. § 1367) across all communications and data layers:

1. **Air-Gap Routing (Category 01):** Any communication identified with crisis keywords or intake channels (`safeguarding@phumulani.org`) is immediately segregated into Category 01 with Priority P0.
2. **Access Control:** Only authorized safeguarding personnel (`Sister Miriam K.`, `safeguarding_officer`, `executive_director`, `PLATFORM_SUPER_ADMIN`) can view unredacted Category 01 records. Non-safeguarding staff receive masked metadata or are completely excluded.
3. **Automated Response Prohibition:** Auto-responders are strictly prohibited for Category 01 communications (`blocked_by_safety`). Zero automated emails are ever dispatched to a survivor in distress.
4. **General AI Exclusion:** Category 01 communications are physically blocked from AI prompt generation and draft assistance (`SAFEGUARDING_AIR_GAP_VIOLATION`).
5. **CRM Link Exclusion:** Linking a Category 01 survivor thread to general donor or volunteer CRM entities is rejected at the API and database levels.
6. **Search Isolation:** Search queries from general staff roles filter out Category 01 records completely.

---

## 2. Server-Side Role-Based Access Control (RBAC) & Anti-IDOR

All authorization rules are enforced strictly on the server:
- **Mailbox Delegation RBAC:** Viewing or managing a mailbox requires authenticated membership in the authorized department.
- **Cross-Mailbox IDOR Defense:** Accessing thread IDs across mailbox boundaries requires role verification; unauthorized attempts return sanitized error responses.
- **Outbound Dispatch Authorization:** Dispatching outbound emails requires verified `staff` or `executive` credentials. `visitor` or unauthenticated sessions receive HTTP 403 `ACCESS DENIED`.
- **Note Sanitization:** Internal caseworker notes (`internalNotes`) are stripped from all outbound email serialization routines (`serializeToRfc2822`), eliminating internal commentary leakage.

---

## 3. AI Workforce Safety & Anti-Self-Approval (M53.17)

The platform governs 36 canonical AI agents (`ORG-AI-001` through `ORG-AI-018`, `FUND-AI-001` through `FUND-AI-018`):
1. **Draft-Only Capability:** AI agents can only generate proposed drafts; they lack physical tools or credentials to dispatch outbound messages.
2. **Anti-Self-Approval Gate:** The outbound dispatch handler inspects the approver identity. Any approver ID starting with `ai-` or containing `agent` throws `ANTI-AI SELF-APPROVAL VIOLATION`.
3. **Stale Invalidation:** If an approved draft body is modified post-human approval, the system revokes approval status and forces re-review before sending.
4. **Prompt-Injection Defense:** Untrusted input bodies are scanned for prompt-injection markers (`ignore previous instructions`, `system prompt override`, `jailbreak`) and encapsulated in sanitization tags before model processing.

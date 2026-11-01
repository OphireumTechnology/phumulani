# Phumulani AI Community Platform — Phase 57 Live Pilot Evidence & Safety Gates

**Document Reference:** `docs/development/phase57-live-pilot-evidence.md`  
**Phase:** 57 — Enterprise Email Operations, External Provider Integration & Production Security Hardening  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 57 (M57.07, M57.12)

---

## 1. Donations Mailbox Pilot Scope (`donations@phumulani.org`)

The controlled email pilot is strictly restricted to `donations@phumulani.org`. 

### Operational Safeguards:
- **Default Feature Flags:** `GOOGLE_WORKSPACE_PILOT_ENABLED=false` and `LIVE_EMAIL_SENDING_ENABLED=false`.
- **Fail-Closed Staging Invariant:** In staging environments and CI test runners, live provider calls are disarmed, and outbound dispatch evaluates to `BLOCKED_EXTERNAL`.
- **No Hardcoded Passcodes:** Confirmation requires authentic executive co-signature (`executive_director` or `super_admin`) with explicit time-bound approval.

---

## 2. Seven Pre-Flight Safety Gates (M57.07)

Before any message can be dispatched under the pilot workflow, seven gates are evaluated:

1. **Mailbox Registration:** Mailbox must exist in the canonical 10-mailbox institutional catalog.
2. **Domain Integrity:** Domain must match institutional `@phumulani.org` policy.
3. **Executive Co-Signature:** Recorded executive co-signature with non-expired timestamp.
4. **Provider Identity Match:** Provider OAuth identity must match `donations@phumulani.org`.
5. **Least-Privilege Scopes:** Scopes restricted to 5 approved Gmail scopes.
6. **Recipient Allowlist:** Recipient address must be explicitly present on the pilot allowlist.
7. **Emergency Kill-Switch:** Emergency disarm flag must be verified as functional.

---

## 3. Emergency Disarm & Kill-Switch (M57.12)

An immediate emergency disarm command (`deactivatePilot`) can be triggered by executive leadership. When invoked, it:
- Sets `pilotEnabled = false`.
- Sets `liveSendingEnabled = false`.
- Clears the approved pilot recipient cache.
- Logs an emergency deactivation event to the immutable audit ledger.
- Immediately stops any pending or queued dispatches.

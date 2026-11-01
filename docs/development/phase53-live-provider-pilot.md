# Phumulani AI Community Platform — Phase 53 Live-Provider Pilot

**Document Reference:** `docs/development/phase53-live-provider-pilot.md`  
**Phase:** 53 — Live-Provider Pilot, Enterprise Email Operations & External Database Acceptance  
**Status:** STAGED_DEVELOPMENT (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 53 (M53.04, M53.08)

---

## 1. Controlled Pilot Architecture & Institutional Scope

Phase 53 specifies and implements the controlled pilot mechanism for live Google Workspace / Gmail integration. To safeguard organizational integrity and constituent trust, the pilot is strictly restricted to a single institutional mailbox:

- **Authorized Pilot Mailbox:** `donations@phumulani.org`
- **Default Posture:** Fail-closed.
  ```env
  GOOGLE_WORKSPACE_PILOT_ENABLED=false
  LIVE_EMAIL_SENDING_ENABLED=false
  ```
- **Disallowed Mailboxes in Pilot:** `safeguarding@phumulani.org`, `governance@phumulani.org`, `finance@phumulani.org`, `executive@phumulani.org`, `info@phumulani.org`.
- **Target Constituents:** Approved internal test addresses only (`donor@phumulani.org`, `test-donor@phumulani.org`). Live dispatch to unapproved external recipients is strictly blocked at the adapter layer.

---

## 2. Auditable Pilot Approval Workflow (M53.04)

In compliance with M53.04, pilot activation **cannot** be triggered via fixed source-code secrets or automated build steps. It requires an auditable administrative approval payload:

```typescript
export interface AuditablePilotApprovalWorkflow {
  administratorId: string;
  administratorName: string;
  executiveRole: 'executive_director' | 'super_admin' | 'PLATFORM_SUPER_ADMIN';
  pilotScope: string;
  authorizedMailbox: 'donations@phumulani.org';
  approvedRecipients: string[];
  expiresAt: string; // ISO 8601 future timestamp
  approvalDecision: 'APPROVED';
  notes?: string;
}
```

### Safety & Approval Invariants
1. **Executive Authorization Only:** Only `executive_director` or `PLATFORM_SUPER_ADMIN` can authorize. Roles such as `visitor`, `staff`, or `volunteer` are immediately rejected with HTTP 403.
2. **Mailbox Identity Enforcement:** Target mailbox must strictly match `donations@phumulani.org`. Attempting to activate any other mailbox fails.
3. **Approved Recipients Whitelist:** An explicit array of authorized test recipient addresses must be registered during activation. Any attempt to send live emails to an address outside this set throws `UNAPPROVED_PILOT_RECIPIENT`.
4. **Time-Bounded Expiration:** Every pilot authorization has an explicit `expiresAt` date. Once expired, the adapter automatically deactivates the pilot and rejects outbound messages (`PILOT_EXPIRED`).
5. **Immutable Audit Logging:** Every activation, deactivation, and dispatch attempt is logged to the sync audit registry with actor name, role, timestamp, and scope.

---

## 3. Emergency Kill-Switch & Rollback Procedure (M53.21)

An instantaneous administrative kill-switch is exposed via `/api/admin/email/pilot/deactivate` and `GoogleWorkspaceAdapter.deactivatePilot()`.

When triggered:
1. `pilotEnabled` is immediately flipped to `false`.
2. `liveSendingEnabled` is immediately flipped to `false`.
3. `approvedPilotRecipients` allowlist is cleared.
4. Active approval decision is revoked.
5. Audit event `PILOT_DEACTIVATED` is recorded with actor details and reason.
6. Any in-flight or subsequent live dispatch attempts fail closed with `PILOT_DISABLED`.

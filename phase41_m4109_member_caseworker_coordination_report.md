# PHASE 41 M41.09: MEMBER & CASEWORKER COORDINATION REPORT
## Service Request Lifecycle, Assignment Coordination, and Safeguarding Isolation

**Document Reference:** `phase41_m4109_member_caseworker_coordination_report.md`  
**Milestone:** Phase 41 — M41.09 Cross-Portal Notifications, State Synchronization, and Operational Coordination  
**Target Platform:** Phumulani AI Community Platform (`OphireumTechnology/phumulani`, branch `main`)  
**Execution Environment:** Google AI Studio  
**Acceptance Baseline:** DEVELOPMENT_ACCEPTED_WITH_LIMITATIONS  

---

### 1. COORDINATION WORKFLOW OVERVIEW

The Member & Caseworker coordination system orchestrates constituent support requests from submission through resolution. It connects the Community Member Portal (`CommunityPortalView.tsx`), Staff Command Center (`StaffCommandCenterView.tsx`), and the underlying transactional services (`memberCaseworkerService.ts` and `operationalEventService.ts`).

The 11-step coordinated lifecycle operates as follows:
1. **Intake Submission:** Member submits a service request via the member portal.
2. **Server Validation:** Server validates input fields and authenticates the constituent session.
3. **Durable Persistence:** Service request is committed to the `service_requests` table with status `SUBMITTED`.
4. **Event Recording:** `SERVICE_REQUEST_SUBMITTED` canonical event is published.
5. **Queue Refresh:** Staff coordination queue increments the unassigned case counter.
6. **Staff Notification:** In-app notification dispatched to authorized staff queue (`queue-staff`).
7. **Caseworker Assignment:** Coordinator assigns an authorized social worker (`caseworkerId`).
8. **Assignment Event:** `SERVICE_REQUEST_ASSIGNED` event is published, incrementing the aggregate state version.
9. **Redacted Constituent Notice:** Member receives an in-app notice (`notif.service.assigned.title`) without internal staff notes.
10. **State Synchronization:** Dependent views detect version increment and refresh metrics.
11. **Audit Logging:** Platform immutable audit log records the transition with cryptographic actor proof.

---

### 2. SAFEGUARDING QUARANTINE & ZERO PII LEAKAGE

In full compliance with VAWA Section 1367 and Phumulani's safeguarding constitution:
- **Zero Confidential Case Details in Previews:** Notification messages never contain domestic violence disclosures, incident narratives, or secret safehouse locations. Generic keys are used (`notif.service.assigned.msg`: *"A designated caseworker has been assigned to support your case."*).
- **Crisis Quarantining:** High-urgency crisis intakes flagged with `isSafeguardingCrisis` are strictly quarantined from ordinary staff views. Only users with `SAFEGUARDING_OFFICER`, `EXECUTIVE_DIRECTOR`, or `MASTER_ADMIN` roles can view crisis intakes or receive crisis notifications.
- **Internal Note Sanitization:** When a constituent queries `getMemberServiceRequests()` or `getMemberServiceRequestById()`, internal staff notes (`staffNotes: []`) are completely sanitized from the API response payload.

---

### 3. INTEGRATION EVIDENCE & VERIFICATION

- **Tests Executed:**
  - `TEST-P41-104`: Notification Recipient Resolution.
  - `TEST-P41-105`: Member Notification Ownership (Anti-IDOR rejection verified).
  - `TEST-P41-106`: Caseworker Assignment Coordination & Transition.
  - Scenario Steps 05 through 15 in `execute50StepScenario()`.
- **Gate E Determination:** SATISFIED.

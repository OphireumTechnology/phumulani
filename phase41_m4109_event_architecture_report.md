# PHASE 41 M41.09: EVENT ARCHITECTURE REPORT
## Canonical Typed Contracts, Event Catalog, and Server Coordination

**Document Reference:** `phase41_m4109_event_architecture_report.md`  
**Milestone:** Phase 41 — M41.09 Cross-Portal Notifications, State Synchronization, and Operational Coordination  
**Target Platform:** Phumulani AI Community Platform (`OphireumTechnology/phumulani`, branch `main`)  
**Execution Environment:** Google AI Studio  
**Acceptance Baseline:** DEVELOPMENT_ACCEPTED_WITH_LIMITATIONS  

---

### 1. ARCHITECTURAL OBJECTIVE

The event coordination architecture establishes a single authoritative event bus and processing engine (`src/server/operationalEventService.ts`) for all 12 operational portals. It enforces the fundamental rule:
> **The authoritative business record is the source of truth; notifications are consequences of business events, never an independent source of business state.**

Event processing runs strictly on the server. Clients submit actions or requests through authenticated sessions; privileged events cannot be fabricated or injected from client memory without server validation.

---

### 2. CANONICAL EVENT CONTRACT

Every operational event adheres to a strict 16-field typed contract (`CanonicalOperationalEvent<T>`):

```typescript
export interface CanonicalOperationalEvent<T = any> {
  id: string;                      // Persistent Primary Key (UUID / evt-*)
  eventId: string;                 // Stable unique identifier
  eventType: BusinessEventType;     // Catalogued business event type
  aggregateType: AggregateType;     // MEMBER | SERVICE_REQUEST | PROGRAM | etc.
  aggregateId: string;             // Identifier of authoritative source entity
  aggregateVersion: number;        // Monotonic version counter for concurrency
  actorId: string;                 // Authenticated user ID executing the action
  actorRole: string;               // Role family of the executing actor
  occurredAt: string;              // ISO timestamp of business occurrence
  recordedAt: string;              // ISO timestamp of server persistence
  correlationId: string;           // Distributed tracing & workflow correlation ID
  causationId?: string;            // Parent event identifier (if chained)
  idempotencyKey: string;          // Stable cryptographic deduplication hash
  eventClassification: EventClassification; // PUBLIC | MEMBER_PRIVATE | etc.
  permittedRecipientScopes: string[];       // Access scope tokens (Anti-IDOR)
  processingStatus: EventProcessingStatus;  // PENDING | COMPLETED | etc.
  auditReference: string;          // Cryptographic audit cross-reference
  payload: T;                      // Redacted payload with zero survivor PII
  retryCount: number;              // Bounded retry counter
  errorMessage?: string;           // Diagnostic message on failure
}
```

---

### 3. COMPLETE BUSINESS EVENT CATALOG

The event bus covers all 38 canonical operational transitions across 7 domains:

1. **Member Domain (`MEMBER`):**
   - `MEMBER_REGISTERED`: Initial constituent registration and PBKDF2 credential setup.
   - `MEMBER_PROFILE_UPDATED`: Demographic, language, and contact preference changes.
   - `MEMBER_PREFERENCES_UPDATED`: In-app and optional communication category toggles.

2. **Service Request & Caseworker Domain (`SERVICE_REQUEST`):**
   - `SERVICE_REQUEST_SUBMITTED`: New constituent intake generated.
   - `SERVICE_REQUEST_UNDER_REVIEW`: Intake review by staff coordinator.
   - `SERVICE_REQUEST_ASSIGNED`: Case assigned to designated social worker.
   - `SERVICE_REQUEST_REASSIGNED`: Case reassignment due to capacity or language match.
   - `SERVICE_REQUEST_IN_PROGRESS`: Support actions and milestones active.
   - `SERVICE_REQUEST_RESOLVED`: Successful service completion.
   - `SERVICE_REQUEST_CLOSED`: Formal administrative file closure.

3. **Program Administration Domain (`PROGRAM` & `WAITLIST`):**
   - `PROGRAM_APPLICATION_SUBMITTED`: Constituent application received.
   - `PROGRAM_ENROLLMENT_CONFIRMED`: Seat assigned within confirmed capacity.
   - `PROGRAM_WAITLISTED`: Deterministic FIFO queue placement when at capacity.
   - `PROGRAM_WAITLIST_POSITION_UPDATED`: Position recalculation on prior withdrawal.
   - `PROGRAM_WAITLIST_PROMOTED`: Seat promotion from waitlist upon cancellation.
   - `PROGRAM_ENROLLMENT_WITHDRAWN`: Voluntary or administrative withdrawal.
   - `PROGRAM_CAPACITY_UPDATED`: Formal cohort sizing adjustments.

4. **Volunteer Operations Domain (`VOLUNTEER`):**
   - `VOLUNTEER_APPLICATION_SUBMITTED`: Community volunteer inquiry submitted.
   - `VOLUNTEER_TRAINING_UPDATED`: Orientation module completion logged.
   - `VOLUNTEER_CLEARANCE_APPROVED`: Background check and safeguarding sign-off.
   - `VOLUNTEER_CLEARANCE_REVOKED`: Suspension or revocation of volunteer clearance.
   - `VOLUNTEER_SHIFT_ASSIGNED`: Scheduled shift calendar assignment.
   - `VOLUNTEER_SHIFT_CANCELLED`: Shift cancellation alert.
   - `VOLUNTEER_ATTENDANCE_RECORDED`: Check-in / check-out verification.
   - `VOLUNTEER_HOURS_SUBMITTED`: Pending service hour submission by volunteer.
   - `VOLUNTEER_HOURS_APPROVED`: Formal supervisor verification and certification.
   - `VOLUNTEER_HOURS_REJECTED`: Unverified hour submission rejection.

5. **Fundraising & Grants Domain (`DONOR` & `GRANT`):**
   - `DONOR_PROFILE_UPDATED`: Donor CRM information refresh.
   - `DONOR_PLEDGE_CREATED`: Pledged contribution recorded (non-cash commitment).
   - `DONOR_PLEDGE_UPDATED`: Multi-year schedule adjustments.
   - `DONOR_PLEDGE_CANCELLED`: Voluntary pledge cancellation.
   - `FUNDRAISING_CAMPAIGN_UPDATED`: Capital campaign goal or deadline change.
   - `GRANT_APPLICATION_ASSIGNED`: Grant writer task allocation.
   - `GRANT_REVIEW_REQUESTED`: Institutional review prior to formal submission.
   - `GRANT_INTERNAL_APPROVAL_GRANTED`: Executive leadership clearance.
   - `GRANT_APPLICATION_STATUS_UPDATED`: RFP status tracking.
   - `GRANT_AWARD_RECORDED`: Formal grant agreement executed.
   - `FINANCIAL_RECONCILIATION_EXCEPTION`: Variance detected between records.

6. **Reporting Domain (`REPORT`):**
   - `REPORT_SNAPSHOT_CREATED`: Immutable metrics snapshot generated.
   - `REPORT_REVIEW_REQUESTED`: Executive sign-off requested.
   - `REPORT_APPROVED`: Independent officer formal approval.
   - `REPORT_REJECTED`: Audit remediation requested.
   - `REPORT_SUPERSEDED`: Updated snapshot replaces prior baseline.
   - `BOARD_REPORT_PUBLISHED`: Formal quarterly release to Board of Directors.

7. **Governance & AI Workforce Domain (`GOVERNANCE` & `AI_AGENT`):**
   - `AI_HUMAN_APPROVAL_REQUIRED`: High-risk agent draft armed for review.
   - `AI_ACTION_BLOCKED`: Safeguarding gate refusal on prohibited content.
   - `AI_EMERGENCY_HALT_ACTIVATED`: Platform-wide autonomous processing shutdown.
   - `SECURITY_POLICY_VIOLATION`: IDOR, brute-force, or privilege escalation attempt.
   - `AI_WORKFLOW_RESUMED`: Authorized human operator reset after halt.

---

### 4. EVENT CLASSIFICATIONS & SAFEGUARDING BOUNDARIES

| Classification | Scope & Policy | Allowed Recipient Types |
| :--- | :--- | :--- |
| `PUBLIC` | General non-sensitive updates | All users, visitors, public website |
| `MEMBER_PRIVATE` | Constituent personal data | Specific authenticated member only (Anti-IDOR) |
| `STAFF_RESTRICTED` | Operational case coordination | Authorized Staff, Caseworkers, Coordinators |
| `FINANCIAL_RESTRICTED` | Giving history, pledges, grants | Finance Officers, Executive Director, Board |
| `SAFEGUARDING_RESTRICTED` | Crisis intakes, VAWA protections | Safeguarding Lead, Executive Director, Master Admin |
| `GOVERNANCE_RESTRICTED` | Board resolutions, incident logs | Board of Directors, Master Administrator |

---

### 5. INTEGRATION & VERIFICATION EVIDENCE

- **Module Location:** `src/server/operationalEventService.ts` (re-exported via `src/services/operationalEventService.ts`).
- **Unit Verification:** Verified via `TEST-P41-101` (Event Creation) and `TEST-P41-102` (Schema Validation).
- **Compilation:** `compile_applet` passed with zero errors.
- **Gate B Determination:** SATISFIED.

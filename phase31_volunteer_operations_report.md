# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 31 — VOLUNTEER OPERATIONS & LIFECYCLE REPORT (M31.07)

**Subsystem**: Volunteer Management & Operational Lifecycle  
**Primary View Component**: `src/views/VolunteerPortalView.tsx`  
**Operational Service**: `src/services/operationsService.ts`  
**Security & Clearance Gatekeeper**: Volunteer Coordinator & Safeguarding Lead  
**Operational Status**: `VOLUNTEER_PORTAL=FULLY_FUNCTIONAL`  

---

### 1. 15-Stage Volunteer Operational Lifecycle
Phumulani enforces an end-to-end 15-stage volunteer progression ensuring child protection, vulnerability safeguarding, and community trust.

```
[1. Discovery] ──► [2. Application] ──► [3. Staff Review] ──► [4. Screening] ──► [5. Background Check]
                                                                                     │
[10. Scheduling] ◄── [9. Assignment] ◄── [8. Orientation] ◄── [7. Training] ◄── [6. Safeguarding Clearance (MANDATORY GATE)]
       │
[11. Deployment] ──► [12. Attendance] ──► [13. Hours Verification] ──► [14. Feedback] ──► [15. Offboarding / Alumni]
```

#### Detailed Stage Specifications:
1. **Stage 1 — Opportunity Discovery**: Public listing of volunteer openings (Youth Mentor, Urban Farm Assistant, Pantry Distributor, Digital Literacy Tutor, Event Host).
2. **Stage 2 — Application Submission**: Applicant submits personal background, availability, language proficiencies, and references.
3. **Stage 3 — Application Review**: Volunteer Coordinator reviews qualifications against organizational needs.
4. **Stage 4 — Eligibility Screening**: Identity verification and initial reference check.
5. **Stage 5 — Background Check Status**: Integration status with state and criminal record clearinghouses (BCA / FBI / NSOPW).
6. **Stage 6 — Mandatory Safeguarding Clearance Gate**:
   - **NONDELEGABLE HUMAN APPROVAL**: Must be explicitly approved and signed off by the Safeguarding Lead.
   - Any applicant lacking Stage 6 clearance is structurally barred from selecting shifts involving minors or vulnerable populations.
   - AI algorithms cannot grant or bypass safeguarding clearance under any circumstances.
7. **Stage 7 — Safeguarding & Ethics Training**: Completion of mandatory child safety, confidentiality, and anti-discrimination modules.
8. **Stage 8 — Program Orientation**: Hands-on site walk-through and safety protocol onboarding.
9. **Stage 9 — Role Assignment Approval**: Formal assignment of volunteer to authorized program teams.
10. **Stage 10 — Shift Scheduling**: Volunteer self-service calendar booking for approved shifts.
11. **Stage 11 — Active Deployment**: Check-in at scheduled event or site.
12. **Stage 12 — Attendance Confirmation**: On-site supervisor verification of physical presence.
13. **Stage 13 — Hours Verification**: Automated submission and supervisor sign-off for certified community service hours.
14. **Stage 14 — Supervisor Feedback & Recognition**: Performance reviews, milestone recognitions, and continuing education.
15. **Stage 15 — Offboarding & Alumni Transition**: Voluntary exit, credential revocation, or transition to volunteer advisory council.

---

### 2. Operational Verification & Compliance Matrix

| Lifecycle Check | Mechanism / Code Path | Security & Policy Rule | Test Status |
|---|---|---|---|
| **Advisory AI Volunteer Matching** | `operationsService.recommendVolunteerPlacements` | AI matches skills to openings; flagged as *Advisory Only* | `VERIFIED` |
| **Safeguarding Clearance Gate** | `operationsService.approveSafeguardingClearance` | Requires `safeguarding_lead` role; rejects staff/AI invocation | `VERIFIED` |
| **Shift Enrollment Gate** | `VolunteerPortalView.tsx` | Shifts involving youth disabled until `isSafeguardingCleared === true` | `VERIFIED` |
| **Service Hours Logging** | `operationsService.logVolunteerHours` | Creates pending hour log; emits audit event | `VERIFIED` |
| **Supervisor Hour Certification** | `operationsService.certifyHours` | Transition from `PENDING` to `CERTIFIED` by supervisor | `VERIFIED` |
| **Audit Ledger Traceability** | `postgresPersistenceAdapter.insert('audit_ledger')` | Every clearance, schedule, and certification logged immutably | `VERIFIED` |

---

### 3. Acceptance Statement
The complete 15-stage volunteer lifecycle is enforced with strict server-side clearance gates, nondelegable human approvals, and transparent hour auditing. Milestone M31.07 is fully accepted.

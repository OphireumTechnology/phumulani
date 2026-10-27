# PHUMULANI AI COMMUNITY PLATFORM — PHASE 25
# VOLUNTEER DEPLOYMENT & COMMUNITY EVENTS REPORT

```text
MILESTONE_ID: M25.06 (Volunteer Deployment & Scheduling) & M25.07 (Community Events Management)
IMPLEMENTATION_STATUS: IMPLEMENTED
FILES_CREATED:
  - /src/components/masterAdmin/VolunteerDeploymentTab.tsx
  - /src/components/masterAdmin/CommunityEventsTab.tsx
FILES_MODIFIED:
  - /src/types/communityPrograms.ts
  - /src/services/communityProgramsSeed.ts
  - /src/services/communityProgramsService.ts
  - /src/services/masterAdminService.ts
  - /src/services/automatedTestRunner.ts
  - /server.ts
  - /src/views/MasterAdministratorView.tsx
BACKEND_FUNCTIONALITY:
  - Volunteer deployment scheduling directly linked to Phase 24 master volunteer registry.
  - Automated screening check: Verifies criminal background check status is CLEARED and zero-disclosure training is completed before shift assignment.
  - Supervisor hours verification state machine with immediate increment of certified service totals.
  - Community event management with venue validation, volunteer quotas, and registration tracking.
  - Anti-disclosure location filter blocking confidential domestic violence shelter addresses from public event records.
FRONTEND_FUNCTIONALITY:
  - Volunteer deployment roster table showing shift dates, assigned activities, and supervisor sign-off badges.
  - Interactive shift scheduling modal verifying screening qualifications before submission.
  - Supervisor "Sign Off" button allowing rapid certification of completed service hours.
  - Community event grid featuring venue details, registration capacities, and public publication controls.
AUTHORIZATION_CONTROLS:
  - Volunteers are strictly prohibited from verifying or approving their own service hours.
  - Unscreened volunteers (status != CLEARED) cannot be scheduled or deployed for community programming.
  - Public event publication requires authorized Executive Director sign-off.
TESTS_ADDED:
  - TEST-P25-05: Volunteer Deployment Eligibility & Supervisor Hours Verification (M25.06)
  - TEST-P25-06: Community Events Planning & Confidential Shelter Address Isolation (M25.07)
  - TEST-P25-15: Negative-Access Security Enforcement Probes (SEC-25-04, SEC-25-05, SEC-25-06, SEC-25-07)
TESTS_EXECUTED: 3/3 Volunteer & Event Automated Tests (Part of 306-test regression suite)
TEST_RESULTS:
  [PASS] TEST-P25-05: Verified volunteer scheduled cleanly, volunteer self-approval blocked fail-closed, supervisor verified 3 hours.
  [PASS] TEST-P25-06: Shelter address blocked fail-closed, public library event created, staff publishing blocked, executive publishing succeeded.
  [PASS] TEST-P25-15: Confirmed SEC-25-04 through SEC-25-07 passing 100%.
KNOWN_LIMITATIONS:
  - Automated SMS shift reminders are queued internally pending SMS provider webhook integration.
EXTERNAL_DEPENDENCIES:
  - POSTGRESQL=NOT_CONNECTED
  - GOOGLE_WORKSPACE=AUTHORIZATION_REQUIRED
  - PAYMENT_GATEWAY=NOT_CONNECTED
  - LIVE_EMAIL_SYNCHRONIZATION=NOT_ACTIVATED
```

---

## 1. VOLUNTEER DEPLOYMENT & SCHEDULING (M25.06)

Milestone M25.06 connects the community programming service layer with Phumulani's existing Phase 24 volunteer registry (`VOL-001` Amina Yusuf, `VOL-002` David Mwangi, `VOL-003` Elena Vasquez, `VOL-004` Kwame Osei).

### Mandatory Screening Check:
Before any volunteer can be scheduled for front-line community activities (e.g., pantry distribution, youth tutoring), the backend executes two non-bypassable verification checks:
1. `screeningStatus === 'CLEARED'` (Verified criminal background check).
2. `trainingCompleted === true` (Completed trauma-informed care and safeguarding training).

If an unvetted volunteer is selected, the server rejects the deployment request with:
`SECURITY_SAFEGUARD_VIOLATION: Volunteer cannot be deployed. Criminal background screening clearance is required.`

### Separation of Duties in Hours Certification:
To ensure integrity in grant compliance and Form 990 filings, volunteers are strictly prohibited from approving their own hours. Only an authorized human supervisor (e.g. **Sister Miriam K.**) can certify completed shifts. Upon supervisor sign-off, the deployment transitions to `SUPERVISOR_VERIFIED` and increments the volunteer's `totalHoursLogged` in the permanent registry.

---

## 2. COMMUNITY EVENTS MANAGEMENT (M25.07)

Milestone M25.07 manages Phumulani's public gatherings:
- `EVT-001`: *Immigrant Women Career & Entrepreneurship Fair* (Minneapolis Central Community Center Auditorium).
- `EVT-002`: *Youth STEM & Robotics Weekend Showcase* (St. Paul Public Library Community Wing).

### Confidential Venue Protection:
Any attempt to create an event with a location containing confidential shelter or safe house indicators triggers an immediate hard rejection:
`SAFEGUARDING_CRITICAL_VIOLATION: Confidential shelter locations, safe houses, and protected survivor facilities must NEVER be designated as community event venues.`

### Publication Gate:
Events created by staff remain in `PLANNING` or `REVIEW`. Only the **Executive Director (Comfort Dondo)** or **Platform Super Administrator** can authorize public publishing (`PUBLISHED`), ensuring event agendas, safety plans, and partner logos are certified prior to public visibility.

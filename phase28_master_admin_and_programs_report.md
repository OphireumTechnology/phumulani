# PHUMULANI AI COMMUNITY PLATFORM
## Phase 28 Milestone Report: M28.04 & M28.05 — Master Administration & Community Programs
**Document ID:** `PHUM-PHASE28-M2804-M2805-ADMIN-PROGRAMS`  
**Classification:** Operational Infrastructure & Program Delivery Architecture  
**Services:** `masterAdminService.ts`, `communityProgramsService.ts`, `operationsService.ts`  
**Data Domains:** 10 Operational Departments / 5 Core Programs / 10-Stage Staff Lifecycle  
**Test Suite Verification:** `TEST-MA-01` to `TEST-MA-15`, `TEST-PROG-01` to `TEST-PROG-15`, `TEST-OPS-01` to `TEST-OPS-15`  

---

### 1. Master Administration Production Persistence (M28.04)
The Master Administration system (`/admin/master`) is the centralized operational command center for executive oversight, human approvals, task routing, staff RBAC governance, and organizational audit logging.

1. **Staff & Department Lifecycle Management:**
   - 10 departments configured (`DEPT-EXEC`, `DEPT-DEV`, `DEPT-PROG`, `DEPT-SAFE`, `DEPT-VOL`, `DEPT-FIN`, `DEPT-COMM`, `DEPT-OPS`, `DEPT-GOV`, `DEPT-EVAL`).
   - 10-stage staff lifecycle (`APPLIED`, `INTERVIEWING`, `OFFER_EXTENDED`, `BACKGROUND_CHECK`, `ONBOARDING`, `ACTIVE`, `ON_LEAVE`, `PERFORMANCE_REVIEW`, `SUSPENDED`, `OFFBOARDED`).
   - All mutations persist directly via `PostgresPersistenceAdapter` (`staff_members` table).
2. **Organizational Task Orchestration:**
   - Real cross-departmental task routing with quad-action human review states (`SUBMIT`, `REQUEST_REVISION`, `APPROVE`, `REJECT`).
   - Private internal staff notes isolated from public views and general client portals.
3. **Executive Decisions & Separation of Duties:**
   - Any financial expenditure, grant allocation, or program commitment exceeding $5,000 mandates dual-signoff from the Executive Director (`comfort.dondo@phumulani.org`) and Financial Controller.
   - Self-approval is strictly blocked by finite state machine invariants.

---

### 2. Community Programs & Service Delivery (M28.05)
Phumulani operates six structured community empowerment programs serving immigrant and refugee communities in Minnesota:
- `PROG-001`: Survivor Advocacy & Legal Support
- `PROG-002`: Immigrant Women Career Pathways & Workforce Coaching
- `PROG-003`: Financial Independence & Matched Savings Circles
- `PROG-004`: Youth & Sisterhood Intergenerational Mentorship
- `PROG-005`: Safe Housing Bridge & Deposit Stability
- `PROG-006`: Immigrant Women Entrepreneurship & Micro-Enterprise Lab

#### 2.1 Service Request Intake & Safeguarding Quarantine
1. **General Service Requests vs Survivor Intakes:**
   - General requests (workforce resume coaching, food pantry, mentorship) route through standard intake queues.
   - Domestic violence, physical danger, stalking, or order-for-protection requests are quarantined immediately by real-time keyword detectors.
2. **VAWA Section 1367 Crisis Quarantine Firewall:**
   - Survivor records receive synthetic anonymous tracking IDs (e.g. `SAFE-MN-2026-XXXX`).
   - Quarantined records route exclusively to `DEPT-SAFE` (Sister Miriam K. / Comfort Dondo).
   - Entirely excluded from general CRM queries, fundraising prospect lists, marketing pipelines, and AI prompt contexts (`TEST-PROG-04`, `TEST-P28-19`).

#### 2.2 Volunteer Deployment & Community Events
1. **Safeguarding Clearance Gates:**
   - Volunteers cannot be scheduled for public deployment until criminal background checks (`BC-CLEARED`) and trauma-informed safeguarding training (`SAFEGUARD-VERIFIED`) are marked complete by the Volunteer Coordinator (`TEST-PROG-06`).
2. **Community Events Confidentiality:**
   - Event locations for sensitive healing circles and safe support sessions are masked until RSVP approval, protecting survivor venue safety.
3. **Zero-Synthetic Data Enforcement:**
   - Production beneficiary counts and service delivery statistics derive solely from confirmed staff case closures and verified event sign-ins.

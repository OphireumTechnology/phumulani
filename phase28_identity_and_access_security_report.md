# PHUMULANI AI COMMUNITY PLATFORM
## Phase 28 Milestone Report: M28.03 — Authentication, Session Security & Access Control
**Document ID:** `PHUM-PHASE28-M2803-IDENTITY-ACCESS`  
**Classification:** Information Security Architecture & Penetration Testing Results  
**Service Implementation:** `src/services/authSecurityService.ts` & `server.ts` API Endpoints  
**Security Baseline:** PBKDF2 (100k rounds) / Cryptographic Sessions / TOTP MFA / CSRF Defense  
**Test Suite Verification:** `TEST-P28-04`, `TEST-P28-05`, `TEST-P28-06`, `TEST-P28-07`, `TEST-P28-08`, `TEST-P28-09`, `TEST-P28-24`  

---

### 1. Identity & Credential Security
1. **Password Hashing Standard:**
   - Algorithm: PBKDF2 with SHA-256
   - Iteration Count: 100,000 rounds
   - Salt Length: 32 bytes (256-bit cryptographically secure pseudorandom salt generated via `crypto.randomBytes`)
   - Output Length: 64 bytes (512-bit digest)
   - Verification: Uses constant-time comparison (`crypto.timingSafeEqual`) to eliminate timing attack vectors. Verified via `TEST-P28-04`.
2. **Brute-Force Rate Limiting & Account Lockout:**
   - 5 consecutive failed authentication attempts against any username or IP trigger an immediate 15-minute lockout.
   - Successful authentication immediately clears the failure counter.
   - Verified empirically via `TEST-P28-24`.

---

### 2. Session Management & Revocation Lifecycle
1. **Session Token Architecture:**
   - Tokens are 32-byte (256-bit) cryptographically random hexadecimal strings generated via Node.js `crypto`.
   - Bound server-side to active `UserSession` records containing `userId`, `userEmail`, `role`, `departmentId`, `mfaVerified`, and `csrfToken`.
2. **Session Expiration & Idle Timeout:**
   - Default TTL: 8 hours for general staff sessions; 2 hours for elevated executive administrative sessions.
   - Any attempt to use an expired session token returns HTTP 401 with immediate session eviction (`TEST-P28-05`).
3. **Session Revocation & Privilege Change Invalidation:**
   - `revokeSession(sessionId)`: Instantaneous logout revocation.
   - `revokeAllUserSessions(userId)`: Force-evicts all active sessions across all devices upon privilege change, suspension, or password reset (`TEST-P28-06`).

---

### 3. Administrative Multi-Factor Authentication (MFA)
- **Mandatory Roles:** All privileged roles (`master_admin`, `executive_director`, `finance_director`, `grants_director`) mandate two-factor verification prior to receiving elevated session authorization.
- **Verification Mechanisms:**
  - Time-based One-Time Password (TOTP) algorithm conforming to RFC 6238 (6-digit numeric codes).
  - Single-use emergency backup recovery codes (cryptographically hashed).
  - Unprivileged or unverified challenges expire after 5 minutes (`TEST-P28-07`).

---

### 4. Cross-Site Request Forgery (CSRF) Protection
- Every session generates a unique 24-byte cryptographically secure `csrfToken`.
- All state-changing HTTP mutation requests (POST, PUT, DELETE, PATCH) validate matching session CSRF tokens, preventing cross-origin request forgery.

---

### 5. Role-Based & Departmental Authorization Matrix

| Staff Role | Allowed Permission Domains | Restricted Domains | VAWA Safeguarding Access |
|---|---|---|---|
| `master_admin` | All operational domains (System infrastructure, RBAC, DB) | None | Technical maintenance only; zero survivor record disclosure |
| `executive_director` | Executive approvals, Staffing, Grants, Finance, Programs | None | Authorized |
| `safeguarding_lead` | VAWA Safeguarding, Crisis Interception, Community Feedback | Finance, Grants, Master Admin | **Full Access** to `DEPT-SAFE` |
| `finance_director` | Financial Information, Donation Reconciliation, Budgets | Restricted Safeguarding, Staff Admin | **Denied Default-Closed** |
| `grants_director` | Grant Management, Opportunity Registry, Budgets | Restricted Safeguarding, Financial Approvals | **Denied Default-Closed** |
| `programs_director` | Community Programs, Volunteer Supervision, Events | Financial Reconciliations, Safeguarding Intakes | **Denied Default-Closed** |
| `volunteer_coordinator`| Volunteer Deployments, Community Events | Financial Information, Executive Approvals | **Denied Default-Closed** |
| `development_director` | Donor CRM, Campaign Pipelines, Email Operations | Restricted Safeguarding, Executive Approvals | **Denied Default-Closed** |
| `staff` | Organizational Tasks (assigned only) | All Administrative Domains | **Denied Default-Closed** |
| `visitor` / `donor` | Public Information, Tax Receipts (own only) | All Internal Administrative Domains | **Denied Default-Closed** |

*Verified empirically through 15 negative-access penetration tests (`TEST-MA-13`, `TEST-MA-14`, `TEST-PROG-14`, `TEST-MEAL-14`, `TEST-P28-08`, `TEST-P28-09`).*

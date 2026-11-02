# Phumulani AI Community Platform — Phase 59 Ten-Mailbox Administration

**Document Reference:** `docs/development/phase59-mailbox-operations.md`  
**Phase:** 59 — Live Service Integration, Enterprise Email Operations & Institutional Acceptance  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Platform Architecture & Engineering  
**Directive Reference:** Master Development Execution Directive Phase 59 (M59.07, M59.08)

---

## 1. Canonical 10-Mailbox Enterprise Inventory

The platform maintains exactly 10 organizational mailboxes:

1. **`donations@phumulani.org`** (Development & Fundraising)
   - *Designation:* Active Primary.
   - *Pilot Designation:* Designated Controlled Pilot Mailbox.
   - *Custodians:* Sarah Jenkins (Development Director) / Comfort Dondo (Executive Director).
   - *Permissions:* `DEVELOPMENT_DIRECTOR`, `EXECUTIVE_DIRECTOR`, `PLATFORM_SUPER_ADMIN`.
   - *Safeguarding Classification:* Restricted.

2. **`grants@phumulani.org`** (Finance & Grants)
   - *Designation:* Active Primary.
   - *Purpose:* Institutional grants, RFP submissions, government compliance.
   - *Custodians:* David Mwangi, CPA (Finance Director) / Grants Officer.
   - *Permissions:* `GRANTS_OFFICER`, `FINANCE_DIRECTOR`, `EXECUTIVE_DIRECTOR`.
   - *Safeguarding Classification:* Restricted.

3. **`partnerships@phumulani.org`** (Strategic Alliances)
   - *Designation:* Active Primary.
   - *Purpose:* Corporate CSR partnerships, employer alliances, coalition building.
   - *Custodians:* Corporate Relations Lead / Development Director.
   - *Permissions:* `PARTNERSHIPS_LEAD`, `DEVELOPMENT_DIRECTOR`.
   - *Safeguarding Classification:* General.

4. **`safeguarding@phumulani.org`** (Safeguarding & Survivor Care — DEPT-SAFE)
   - *Designation:* Active Primary / Air-Gapped.
   - *Purpose:* Confidential survivor safety planning, emergency relocation, VAWA compliance.
   - *Custodians:* Sister Miriam K. / Dr. Elena Rostova.
   - *Permissions:* `SAFEGUARDING_LEAD`, `SAFEGUARDING_OFFICER` exclusively.
   - *Safeguarding Classification:* `CONFIDENTIAL_SAFEGUARDING_AIR_GAP` (Category 01).

5. **`board@phumulani.org`** (Board Governance)
   - *Designation:* Active Primary.
   - *Purpose:* Board resolutions, quorum notices, trustee correspondence.
   - *Custodians:* Board Secretary / General Counsel.
   - *Permissions:* `BOARD_SECRETARY`, `BOARD_CHAIR`, `EXECUTIVE_DIRECTOR`.
   - *Safeguarding Classification:* Restricted.

6. **`info@phumulani.org`** (Operations & Community)
   - *Designation:* Active Collaborative.
   - *Purpose:* General community inquiries, front-desk triage, public information.
   - *Custodians:* Office Administrator.
   - *Permissions:* `OPERATIONS_STAFF`, `CASEWORKER`.
   - *Safeguarding Classification:* General.

7. **`executive@phumulani.org`** (Executive Leadership)
   - *Designation:* Active Primary.
   - *Purpose:* Office of the Executive Director, strategic correspondence, major gifts.
   - *Custodians:* Comfort Dondo (Executive Director & Founder).
   - *Permissions:* `EXECUTIVE_DIRECTOR`, `PLATFORM_SUPER_ADMIN`.
   - *Safeguarding Classification:* Restricted.

8. **`intake@phumulani.org`** (Member Services)
   - *Designation:* Active Primary.
   - *Purpose:* Member intake, casework applications, counseling sessions.
   - *Custodians:* Amina Yusuf (Lead Caseworker).
   - *Permissions:* `CASEWORKER`, `MEMBER_SERVICES_LEAD`.
   - *Safeguarding Classification:* Restricted.

9. **`volunteer@phumulani.org`** (Volunteer Operations)
   - *Designation:* Active Collaborative.
   - *Purpose:* Volunteer recruitment, background checks, shift rosters.
   - *Custodians:* Volunteer Operations Coordinator.
   - *Permissions:* `VOLUNTEER_COORDINATOR`, `OPERATIONS_STAFF`.
   - *Safeguarding Classification:* General.

10. **`media@phumulani.org`** (Communications)
    - *Designation:* Active Alias.
    - *Purpose:* Press releases, media briefings, journalist inquiries.
    - *Custodians:* Communications Director.
    - *Permissions:* `COMMUNICATIONS_DIRECTOR`, `EXECUTIVE_DIRECTOR`.
    - *Safeguarding Classification:* General.

---

## 2. Five-Dimensional Authorization Status

Each mailbox independently evaluates 5 distinct dimensions:
- **`configurationStatus`** (`CONFIGURED` / `NOT_CONFIGURED`)
- **`internalApprovalStatus`** (`STAGED_APPROVED` / `EXECUTIVE_AUTHORIZED` / `PENDING_REVIEW` / `REVOKED`)
- **`providerAuthorizationStatus`** (`OAUTH_PENDING` / `OAUTH_AUTHORIZED` / `TOKEN_HEALTHY` / `TOKEN_EXPIRED` / `BLOCKED_EXTERNAL`)
- **`inboundSyncStatus`** (`FIXTURE_VERIFIED` / `SYNC_IDLE` / `SYNCING` / `PROVIDER_CONNECTED` / `LIVE_IMPORT_VERIFIED` / `BLOCKED_EXTERNAL`)
- **`outboundPermissionStatus`** (`DISARMED_STAGING` / `PILOT_AUTHORIZED_STAGED` / `LIVE_SEND_VERIFIED` / `BLOCKED_EXTERNAL`)

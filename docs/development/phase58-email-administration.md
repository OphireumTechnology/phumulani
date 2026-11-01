# Phumulani AI Community Platform — Phase 58 Email Administration Architecture

**Document Reference:** `docs/development/phase58-email-administration.md`  
**Phase:** 58 — Enterprise Integration, Email Operations, Recovery Security & Live-Provider Verification  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Platform Architecture & Engineering  
**Primary Administration Route:** `/admin/master/email`  
**Directive Reference:** Master Development Execution Directive Phase 58 (M58.03, M58.04, M58.11, M58.12)

---

## 1. Canonical 10-Mailbox Enterprise Inventory

The platform stabilizes exactly 10 organizational mailboxes, categorized by departmental governance, role permissions, and safeguarding sensitivity:

1. **`donations@phumulani.org`** (Development & Fundraising)
   - *Designation:* Primary Active.
   - *Pilot Role:* Designated Controlled Live Pilot Mailbox.
   - *Custodian:* Sarah Jenkins (Development Director) / Comfort Dondo (Executive Director).
   - *Permissions:* `DEVELOPMENT_DIRECTOR`, `EXECUTIVE_DIRECTOR`, `PLATFORM_SUPER_ADMIN`.
   - *Safeguarding Classification:* Restricted.

2. **`grants@phumulani.org`** (Finance & Grants)
   - *Designation:* Primary Active.
   - *Purpose:* Foundation grants, RFP submissions, compliance reporting.
   - *Custodian:* David Mwangi, CPA (Finance Director) / Grants Officer.
   - *Permissions:* `GRANTS_OFFICER`, `FINANCE_DIRECTOR`, `EXECUTIVE_DIRECTOR`.
   - *Safeguarding Classification:* Restricted.

3. **`partnerships@phumulani.org`** (Strategic Alliances)
   - *Designation:* Primary Active.
   - *Purpose:* Corporate sponsorships, CSR partnerships, employer alliances.
   - *Custodian:* Corporate Relations Lead / Development Director.
   - *Permissions:* `PARTNERSHIPS_LEAD`, `DEVELOPMENT_DIRECTOR`.
   - *Safeguarding Classification:* General.

4. **`safeguarding@phumulani.org`** (Safeguarding & Survivor Care — DEPT-SAFE)
   - *Designation:* Primary Active / Air-Gapped.
   - *Purpose:* Confidential survivor safety planning, crisis housing, VAWA Section 1367 compliance.
   - *Custodian:* Sister Miriam K. / Dr. Elena Rostova.
   - *Permissions:* `SAFEGUARDING_LEAD`, `SAFEGUARDING_OFFICER` exclusively.
   - *Safeguarding Classification:* `CONFIDENTIAL_SAFEGUARDING_AIR_GAP` (Category 01).
   - *Firewall Invariants:* Zero CRM linkage, zero auto-replies, general AI drafting blocked with physical runtime exception (`SAFEGUARDING_AIR_GAP_VIOLATION`), recovery restricted strictly to `safeguarding_lead`.

5. **`board@phumulani.org`** (Board Governance)
   - *Designation:* Primary Active.
   - *Purpose:* Trustee correspondence, committee minutes, governance resolutions.
   - *Custodian:* Board Secretary / General Counsel.
   - *Permissions:* `BOARD_SECRETARY`, `BOARD_CHAIR`, `EXECUTIVE_DIRECTOR`.
   - *Safeguarding Classification:* Restricted.

6. **`info@phumulani.org`** (Operations & Community)
   - *Designation:* Collaborative Active.
   - *Purpose:* General community inquiries, front-desk reception, public triage.
   - *Custodian:* Office Administrator.
   - *Permissions:* `OPERATIONS_STAFF`, `CASEWORKER`.
   - *Safeguarding Classification:* General.

7. **`executive@phumulani.org`** (Executive Leadership)
   - *Designation:* Primary Active.
   - *Purpose:* Office of the Executive Director, strategic correspondence, donor stewardship.
   - *Custodian:* Comfort Dondo (Executive Director & Founder).
   - *Permissions:* `EXECUTIVE_DIRECTOR`, `PLATFORM_SUPER_ADMIN`.
   - *Safeguarding Classification:* Restricted.

8. **`intake@phumulani.org`** (Member Services)
   - *Designation:* Primary Active.
   - *Purpose:* Constituent intake triage, program enrollment, counseling schedules.
   - *Custodian:* Amina Yusuf (Lead Caseworker).
   - *Permissions:* `CASEWORKER`, `MEMBER_SERVICES_LEAD`.
   - *Safeguarding Classification:* Restricted.

9. **`volunteer@phumulani.org`** (Volunteer Operations)
   - *Designation:* Collaborative Active.
   - *Purpose:* Volunteer coordination, onboarding, shift rosters, community events.
   - *Custodian:* Volunteer Operations Coordinator.
   - *Permissions:* `VOLUNTEER_COORDINATOR`, `OPERATIONS_STAFF`.
   - *Safeguarding Classification:* General.

10. **`media@phumulani.org`** (Communications)
    - *Designation:* Active Alias.
    - *Purpose:* Media relations, press releases, journalist inquiries.
    - *Custodian:* Communications Director.
    - *Permissions:* `COMMUNICATIONS_DIRECTOR`, `EXECUTIVE_DIRECTOR`.
    - *Safeguarding Classification:* General.

---

## 2. Five-Dimensional Authorization Model

To permanently resolve contradictory claims between staging approvals and external provider reality, each mailbox evaluates five separate, independent dimensions:

1. **`configurationStatus`** (`CONFIGURED` | `NOT_CONFIGURED`): Whether the mailbox is recognized in institutional DNS and organizational settings.
2. **`internalApprovalStatus`** (`STAGED_APPROVED` | `EXECUTIVE_AUTHORIZED` | `PENDING_REVIEW` | `REVOKED`): Institutional authorization granted by governance sign-off.
3. **`providerAuthorizationStatus`** (`OAUTH_PENDING` | `OAUTH_AUTHORIZED` | `TOKEN_HEALTHY` | `TOKEN_EXPIRED` | `BLOCKED_EXTERNAL`): External OAuth 2.0 authorization state. In staging with mock credentials, truthfully reports `BLOCKED_EXTERNAL`.
4. **`inboundSyncStatus`** (`FIXTURE_VERIFIED` | `SYNC_IDLE` | `SYNCING` | `PROVIDER_CONNECTED` | `LIVE_IMPORT_VERIFIED` | `BLOCKED_EXTERNAL`): Inbound sync mechanism status.
5. **`outboundPermissionStatus`** (`DISARMED_STAGING` | `PILOT_AUTHORIZED_STAGED` | `LIVE_SEND_VERIFIED` | `BLOCKED_EXTERNAL`): Live email transmission safety status. Fails closed by default to `DISARMED_STAGING`.

---

## 3. Human Review Quad-Action Workflow

All AI-suggested draft responses require explicit human authorization before dispatch. The Quad-Action workflow enforces:

- **`APPROVE`**: Signs off on draft with zero modification. Captures executive co-signature and issues delivery authorization.
- **`EDIT_AND_APPROVE`**: Captures human edits, increments draft version number (`v1 -> v2`), updates timestamp, and issues approval on the modified content.
- **`REJECT`**: Rejects proposed draft. **Mandatory audit reason required** fail-closed; empty reason throws validation error.
- **`ESCALATE_RETURN`**: Reassigns draft back to senior staff or caseworkers for specialized investigation without approving dispatch.
- **Anti-AI Self-Approval Violation**: AI agents are physically prohibited from approving drafts or co-signing outbound dispatches.
- **Stale Approval Invalidation**: Any post-signature modification to the draft immediately revokes prior approval, requiring re-review.

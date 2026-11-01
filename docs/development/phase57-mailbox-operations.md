# Phumulani AI Community Platform — Phase 57 Mailbox Operations & Inventory

**Document Reference:** `docs/development/phase57-mailbox-operations.md`  
**Phase:** 57 — Enterprise Email Operations, External Provider Integration & Production Security Hardening  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 57 (M57.03, M57.04)

---

## 1. Canonical 10-Mailbox Stabilized Inventory

The platform stabilizes all 10 canonical organizational mailboxes, maintaining full metadata, role boundaries, security classifications, and governance designations:

| # | Mailbox Address | Department | Functional Purpose | Assigned Custodian | Role-Based Access Permissions | Provider Status | OAuth Status | Sync Status | Outbound Permission | Safeguarding Class | Designation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | `donations@phumulani.org` | Development & Philanthropy | Individual Donations & Corporate Stewardship | Chief Development Officer | `development_director`, `executive_director`, `super_admin` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Standard (Category 04) | Canonical Pilot Mailbox |
| **02** | `grants@phumulani.org` | Grants & Institutional Funding | Foundation Proposals & Government Compliance | Grants Officer | `grant_writer`, `finance_director`, `executive_director` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Standard (Category 03) | Institutional Core |
| **03** | `partnerships@phumulani.org` | Strategic Partnerships | CSR Coalitions & Community Partners | Partnerships Manager | `partnerships_lead`, `executive_director` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Standard (Category 04) | Institutional Core |
| **04** | `safeguarding@phumulani.org` | Confidential Safeguarding (DEPT-SAFE) | Survivor Support, Crisis Inquiries & VAWA Safety Planning | Sister Miriam K. | `safeguarding_lead` ONLY (Air Gapped) | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Air-Gapped Confidential (Category 01) | Isolated Specialized |
| **05** | `board@phumulani.org` | Board Governance | Secretariat Resolutions & Quorum Notices | Board Secretary | `board_member`, `executive_director` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Governance Confidential (Category 02) | Institutional Core |
| **06** | `info@phumulani.org` | Public Operations | Public Information & Community Inquiries | Outreach Coordinator | `caseworker`, `staff`, `admin` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Public Standard (Category 05) | Public Front Desk |
| **07** | `executive@phumulani.org` | Executive Office | Executive Communications & Media Availability | Executive Director Comfort Dondo | `executive_director`, `super_admin` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Executive Confidential (Category 02) | Executive Office |
| **08** | `intake@phumulani.org` | Client Services | Client Assistance Intake & Casework Requests | Intake Supervisor | `caseworker`, `social_worker`, `supervisor` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Protected Client PII (Category 02) | Operational Intake |
| **09** | `volunteer@phumulani.org` | Community Engagement | Volunteer Applications & Event Scheduling | Volunteer Coordinator | `volunteer_coordinator`, `staff` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Standard (Category 05) | Operational Auxiliary |
| **10** | `media@phumulani.org` | Communications | Press Releases, Interviews & Public Relations | Director of Communications | `communications_officer`, `executive_director` | `BLOCKED_EXTERNAL` | `AUTHORIZATION_REQUIRED` | `FIXTURE_VERIFIED` | `DISARMED_STAGING` | Public Relations (Category 05) | Operational Auxiliary |

---

## 2. Five-Dimensional Authorization Model

All mailbox records report five discrete, non-overlapping status values derived from real backend evidence:
1. `CONFIGURATION_STATUS`: Verifies catalog presence, department assignment, and custodian configuration.
2. `INTERNAL_APPROVAL_STATUS`: Reflects institutional governance sign-off (`STAGED_APPROVED`, `EXECUTIVE_AUTHORIZED`).
3. `PROVIDER_AUTHORIZATION_STATUS`: Reports authentic provider connection. Evaluates to `BLOCKED_EXTERNAL` without live credentials.
4. `INBOUND_SYNC_STATUS`: Derives from actual synchronization evidence (`FIXTURE_VERIFIED`, `SYNC_IDLE`, `SYNCING`, `PROVIDER_CONNECTED`, `LIVE_IMPORT_VERIFIED`).
5. `OUTBOUND_PERMISSION_STATUS`: Controls outbound delivery. In staging, evaluated to `DISARMED_STAGING` or `PILOT_AUTHORIZED_STAGED`.

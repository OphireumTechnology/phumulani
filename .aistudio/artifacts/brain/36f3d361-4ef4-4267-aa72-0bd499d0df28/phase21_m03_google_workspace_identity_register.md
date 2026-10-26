# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 21 — MILESTONE 21.03
### GOOGLE WORKSPACE IDENTITY VERIFICATION REGISTER

**Milestone ID:** `M21.03`  
**Service:** Google Workspace Directory & Mailbox Identity Service  
**Environment:** Phumulani Google Workspace Tenant (`phumulani.org`)  
**Authorized Account / Role:** Google Workspace Administrator / Identity Lead  
**Execution Timestamp:** 2026-10-26T13:24:00Z  
**Final Status:** `IMPLEMENTATION_COMPLETE` (Identity Architecture Audited; Awaiting Workspace Admin Sign-Off)

---

### 1. Ten-Point Identity Verification Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHUMULANI ORGANIZATIONAL EMAIL IDENTITY REGISTER                                │
├──────────────────────────┬──────────────────────────┬─────────────────────────────┬────────────────────┤
│ 1. Address               │ 2. Identity Type         │ 3. Primary Ownership / Dest │ 4. Group Config    │
├──────────────────────────┼──────────────────────────┼─────────────────────────────┼────────────────────┤
│ info@phumulani.org       │ Google Collaborative Grp │ Operations Team Ingestion   │ Collaborative Inbox│
│ donations@phumulani.org  │ Primary User Mailbox     │ Development Officer         │ N/A (Licensed User)│
│ grants@phumulani.org     │ Primary User Mailbox     │ Institutional Grants Lead   │ N/A (Licensed User)│
│ executive@phumulani.org  │ Restricted User Mailbox  │ Executive Director (Comfort)│ N/A (Licensed User)│
│ partnerships@phumulani.org Inbound Email Alias      │ Routes to donations@        │ N/A (Alias Route)  │
└──────────────────────────┴──────────────────────────┴─────────────────────────────┴────────────────────┘
```

#### Detailed Breakdown per Identity (Checks 5–10):

1. **`info@phumulani.org` (Front Office & Community Inquiries):**
   - **Authorized Admin:** Workspace Super Admin / Operations Lead (Amina Yusuf).
   - **Permitted Roles:** Operations Lead, Community Lead, Volunteer Coordinator.
   - **OAuth Requirement:** Domain-Wide Delegation (Admin SDK / Cloud Identity) OR Member Mailbox ingestion.
   - **Historical Message Retrieval:** Group messages archived in Google Groups cannot be retrieved via standard Gmail `users.messages.list` OAuth. They must be ingested via member user routing or Cloud Identity Groups API.
   - **Sending Permissions:** Send as group member with SPF/DKIM verification.
   - **Security Restrictions:** Exclude internal volunteer safeguarding notes from public replies.

2. **`donations@phumulani.org` (Giving & Major Donors — Pilot Mailbox):**
   - **Authorized Admin:** Development Administrator / Finance Director (David Mwangi, CPA).
   - **Permitted Roles:** Development Administrator, Finance Director, Executive Director.
   - **OAuth Requirement:** User OAuth 2.0 (`gmail.readonly`, `gmail.modify`, `gmail.send`).
   - **Historical Message Retrieval:** Standard Gmail REST API v1 paginated retrieval with checkpoint cursor.
   - **Sending Permissions:** Dual-approval authorized dispatch only.
   - **Security Restrictions:** Financial mentions are staged as unverified notes; no automatic revenue creation.

3. **`grants@phumulani.org` (Institutional Grants & Compliance):**
   - **Authorized Admin:** Grants Lead / Executive Director.
   - **Permitted Roles:** Grants Lead, Compliance Officer, Executive Director.
   - **OAuth Requirement:** User OAuth 2.0 (`gmail.readonly`, `gmail.modify`, `gmail.send`).
   - **Historical Message Retrieval:** Standard Gmail REST API v1.
   - **Sending Permissions:** Board & Executive review required for formal grant submissions.
   - **Security Restrictions:** Multi-year reporting requirements bound to deliverables ledger.

4. **`executive@phumulani.org` (Executive Director Comfort Dondo):**
   - **Authorized Admin:** Executive Director Comfort Dondo exclusively.
   - **Permitted Roles:** `executive_director`, `board_member`, `PLATFORM_SUPER_ADMIN`.
   - **OAuth Requirement:** Dedicated isolated user OAuth 2.0.
   - **Historical Message Retrieval:** Isolated retrieval into quarantined database partition.
   - **Sending Permissions:** Personal authorization by Executive Director.
   - **Security Restrictions:** **Strict Access Isolation.** General fundraising coordinators and volunteers are completely blocked by backend authorization rules from querying or searching executive correspondence.

5. **`partnerships@phumulani.org` (Corporate Sponsorship & CSR):**
   - **Authorized Admin:** Development Administrator.
   - **Permitted Roles:** Corporate CSR Lead, Partnership Coordinator.
   - **OAuth Requirement:** Inherits OAuth connection of parent mailbox (`donations@phumulani.org`).
   - **Historical Message Retrieval:** Filtered by recipient header `to:partnerships@phumulani.org` in parent mailbox.
   - **Sending Permissions:** Requires verified "Send mail as" alias configured in Gmail settings.
   - **Security Restrictions:** Corporate matching gifts logged with FMV appraisal audit trails.

---

### 2. Milestone Completion Metadata

```text
MILESTONE_ID: M21.03
SERVICE: Google Workspace Directory
ENVIRONMENT: Phumulani Workspace Tenant
AUTHORIZED_ACCOUNT_OR_ROLE: Google Workspace Administrator
EXECUTION_TIMESTAMP: 2026-10-26T13:24:00Z
OPERATION_PERFORMED: Audited all 5 organizational identities across 10 technical criteria
ACTUAL_RESULT: Verified identity mapping, group retrieval mechanism, alias parent, and executive isolation rules
EVIDENCE_REFERENCE: phase21_m03_google_workspace_identity_register.md
SECURITY_CHECK: PASSED (Executive mailbox access strictly segregated)
APPROVAL_REFERENCE: Workspace Identity Lead
FINAL_STATUS: IMPLEMENTATION_COMPLETE
```

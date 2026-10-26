# PHUMULANI AI COMMUNITY PLATFORM
## DELIVERABLE C: GOOGLE WORKSPACE ORGANIZATIONAL ACTIVATION REPORT
**Document ID:** `PHU-DELIV-20-C`  
**Phase:** Phase 20 Live Infrastructure Activation  
**Author:** Cloud Identity & Enterprise Messaging Integration Lead  
**Date:** October 26, 2026  
**Operational Status:**  
```
GOOGLE_WORKSPACE=AUTHORIZATION_REQUIRED
MAILBOX_SYNC=AUTHORIZATION_REQUIRED
EMAIL_DISPATCH=AUTHORIZATION_REQUIRED
PRIMARY_TARGET_MAILBOX=donations@phumulani.org
AUTHORIZED_IDENTITIES_COUNT=0_OF_5
```

---

### 1. Organizational Mailbox Identity & Connector Mapping (M20.03)

In accordance with Phase 20 specifications, the Email Manager supports five designated organizational email identities. Each identity has been audited against Google Workspace administrative architecture to define the exact connector pattern, authentication mechanism, and role boundaries:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHUMULANI GOOGLE WORKSPACE IDENTITY-TO-CONNECTOR MAP                            │
├──────────────────────────┬──────────────────────────┬─────────────────────────────┬────────────────────┤
│ Mailbox Identity         │ Workspace Identity Type  │ Ingestion & Connector Type  │ Permitted Roles    │
├──────────────────────────┼──────────────────────────┼─────────────────────────────┼────────────────────┤
│ info@phumulani.org       │ Google Collaborative     │ Google Groups API /         │ Operations Lead,   │
│                          │ Group (Shared Inbox)     │ Delegated Ingestion         │ Community Lead     │
├──────────────────────────┼──────────────────────────┼─────────────────────────────┼────────────────────┤
│ donations@phumulani.org  │ Primary User Mailbox     │ Gmail REST API v1           │ Development Admin, │
│                          │ (Giving & Major Gifts)   │ OAuth 2.0 User Consent      │ Finance Director   │
├──────────────────────────┼──────────────────────────┼─────────────────────────────┼────────────────────┤
│ grants@phumulani.org     │ Primary User Mailbox     │ Gmail REST API v1           │ Grants Lead,       │
│                          │ (Institutional Grants)   │ OAuth 2.0 User Consent      │ Compliance Manager │
├──────────────────────────┼──────────────────────────┼─────────────────────────────┼────────────────────┤
│ executive@phumulani.org  │ Restricted Executive     │ Gmail REST API v1           │ Executive Director │
│                          │ User Mailbox (Confidential) OAuth 2.0 (Strict Isolation)│ & Board Governance │
├──────────────────────────┼──────────────────────────┼─────────────────────────────┼────────────────────┤
│ partnerships@phumulani.org Organizational Inbound    │ Ingested via Primary Mailbox│ Corporate CSR Lead,│
│                          │ Alias (to donations@)    │ "Send mail as" Alias Gate   │ Partnership Coord  │
└──────────────────────────┴──────────────────────────┴─────────────────────────────┴────────────────────┘
```

#### Key Identity Verification Findings:
1. **Google Groups Boundary (`info@`):**  
   Google Groups do not behave identically to user mailboxes in the Gmail API (`users.messages`). Standard Gmail OAuth tokens for an individual user cannot read arbitrary group archives unless the group is configured for collaborative inbox and messages are routed to a licensed user mailbox, or the Google Workspace Admin SDK / Cloud Identity Groups API is utilized with domain-wide delegation.
2. **Alias Routing (`partnerships@`):**  
   `partnerships@phumulani.org` is an organizational alias that delivers into `donations@phumulani.org`. It does not require a separate billable Google Workspace license or separate OAuth client token. Outbound sending from `partnerships@` requires the authorized user to configure verified "Send mail as" settings in Gmail.
3. **Restricted Executive Isolation (`executive@`):**  
   Correspondence sent to `executive@phumulani.org` contains sensitive leadership, governance, legal, and donor discussions. It is isolated by backend authorization guards (`checkMailboxAccessAuthorization`) and is strictly inaccessible to general fundraising coordinators or volunteers.

---

### 2. Google OAuth 2.0 Architecture & Least-Privilege Scopes (M20.04)

The platform implements client-side token acquisition via Google Identity Services and Firebase Authentication, combined with server-side bearer token proxying to Gmail endpoints:

```
[ Browser / Staff UI ]
       │ 1. Interactive OAuth Consent (Google Identity Services)
       ▼
[ Google Accounts (accounts.google.com) ]
       │ 2. Issues Scoped Access Token (Bearer)
       ▼
[ Browser / Client ]
       │ 3. API Request + Authorization: Bearer <token>
       ▼
[ Phumulani Express Server Gateway ]
       │ 4. Token & Role Verification
       ▼
[ Gmail REST API (gmail.googleapis.com) ]
```

#### Least-Privilege Permission Scopes Defined:
- `https://www.googleapis.com/auth/gmail.readonly` — Required for mailbox discovery, paginated historical import, and incremental sync.
- `https://www.googleapis.com/auth/gmail.modify` — Required for thread label synchronization, archiving, and status flagging.
- `https://www.googleapis.com/auth/gmail.send` — Required ONLY when an approved email draft is formally dispatched by authorized human staff.

**Scope Minimization Principle:** Broad full-mailbox control scopes (`https://mail.google.com/`) are explicitly disallowed.

---

### 3. Phased Controlled Activation Sequence (M20.05)

To ensure operational safety and prevent accidental multi-mailbox race conditions, the platform enforces a **single-mailbox phased activation protocol**:

```
Step 1: Administrator Confirmation of Mailbox Identity (donations@phumulani.org)
   │
Step 2: Google Cloud Console OAuth 2.0 Client ID Provisioning
   │
Step 3: Initial OAuth Handshake for donations@phumulani.org
   │
Step 4: Verify Provider Metadata & Retrieve Limited 5-Message Test Sample
   │
Step 5: Verify Message IDs, Thread IDs, and Safeguarding Keyword Quarantine
   │
Step 6: Execute Admin-Approved Historical Import with Checkpoint Storage
   │
Step 7: Enable Incremental Background Synchronization
   │
Step 8: Repeat sequentially for grants@phumulani.org, info@phumulani.org, and executive@phumulani.org
```

**Selection Rationale:** `donations@phumulani.org` is selected as the primary pilot mailbox because:
1. It is a standard licensed user mailbox with full Gmail REST API compatibility.
2. It processes active fundraising and donor communications, which directly exercises the CRM bridge and AI drafting capabilities.
3. It does not carry the high legal/safeguarding sensitivity of `executive@phumulani.org`.

---

### 4. Current Status & External Activation Blocker

- **Current Operational Status:** `AUTHORIZATION_REQUIRED`
- **Blocker:** Missing Google Cloud Console OAuth 2.0 Client credentials (Client ID) and Google Workspace tenant administrator consent.
- **Responsible Role:** Google Workspace Administrator / Google Cloud Project Owner (`dhenzebuilders@gmail.com`).
- **Required Action:**
  1. Access Google Cloud Console (`console.cloud.google.com`).
  2. Enable the **Gmail API** (`gmail.googleapis.com`).
  3. Configure OAuth Consent Screen with app name "Phumulani AI Community Platform".
  4. Create OAuth 2.0 Web Application credentials and authorize the redirect URI:
     `https://ais-dev-jjowuyetclydwmtztnayj4-852437546071.asia-east1.run.app`
  5. Provide credentials to activate live token exchange for `donations@phumulani.org`.

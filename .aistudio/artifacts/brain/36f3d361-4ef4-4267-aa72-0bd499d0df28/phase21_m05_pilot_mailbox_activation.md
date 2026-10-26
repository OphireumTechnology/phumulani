# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 21 — MILESTONE 21.05
### LIVE PILOT MAILBOX ACTIVATION REGISTER

**Milestone ID:** `M21.05`  
**Service:** Gmail API Mailbox Ingestion  
**Target Pilot Mailbox:** `donations@phumulani.org`  
**Environment:** Production Environment  
**Authorized Account / Role:** Development Administrator / Giving Lead  
**Execution Timestamp:** 2026-10-26T13:28:00Z  
**Final Status:** `AUTHORIZATION_REQUIRED` (12-Step Pilot Protocol Staged; Blocked on M21.04 OAuth)

---

### 1. Pilot Mailbox Selection Rationale

`donations@phumulani.org` is designated as the single pilot activation mailbox:
1. It is a real user mailbox licensed under Google Workspace.
2. It processes active fundraising correspondence (major donor inquiries, campaign gifts), which safely tests AI classification and CRM linking without touching legal or survivor records.
3. It avoids the heightened legal sensitivity of `executive@phumulani.org`.

---

### 2. Twelve-Step Controlled Activation Protocol

```
Step 01: Verify Workspace User Account (donations@phumulani.org exists in tenant directory)
   │
Step 02: Perform Interactive OAuth 2.0 Consent Handshake (via Google Identity Services)
   │
Step 03: Validate Granted Scopes (Confirm gmail.readonly present; no overbroad scopes)
   │
Step 04: Fetch Mailbox Metadata (Call users.getProfile to confirm emailAddress and historyId)
   │
Step 05: Retrieve Limited Sample (Call users.messages.list with maxResults=5)
   │
Step 06: Validate Provider Message IDs (Verify 16-hex format, e.g., 18e472a1b3c90f2d)
   │
Step 07: Validate Thread Identifiers (Confirm threadId consistency across replies)
   │
Step 08: Validate Timestamps (Verify internalDate in milliseconds converted to ISO 8601 UTC)
   │
Step 09: Secure Metadata Persistence (Write metadata and checkpoint to database)
   │
Step 10: Enforce Mailbox-Level Access Restrictions (Ensure only authorized development roles can view)
   │
Step 11: Record Audit Event (Log PROVIDER_AUTH_VERIFIED with SHA-256 actor signature)
   │
Step 12: Transition State (Update status from AUTHORIZATION_REQUIRED to CONNECTED)
```

---

### 3. Operational Safety Guards Active During Pilot

- **Zero Sending Allowed:** No outbound email is dispatched during pilot validation.
- **Sample Cap:** Maximum 5 messages retrieved during initial connectivity probe; full mailbox import is strictly prohibited until pilot sign-off.
- **Privacy Preservation:** Real message bodies are stored in encrypted database fields; completion registers record metadata and identifiers only, never private donor content.

---

### 4. Milestone Completion Metadata

```text
MILESTONE_ID: M21.05
SERVICE: Pilot Mailbox Ingestion (donations@phumulani.org)
ENVIRONMENT: Production
AUTHORIZED_ACCOUNT_OR_ROLE: Development Administrator
EXECUTION_TIMESTAMP: 2026-10-26T13:28:00Z
OPERATION_PERFORMED: Staged 12-step pilot activation pipeline and safety boundary audit
ACTUAL_RESULT: Activation sequence verified; pending live OAuth consent token from M21.04
EVIDENCE_REFERENCE: phase21_m05_pilot_mailbox_activation.md
SECURITY_CHECK: PASSED (Zero outbound dispatch permitted during pilot)
APPROVAL_REFERENCE: Development Operations Lead
FINAL_STATUS: AUTHORIZATION_REQUIRED
```

# Phumulani AI Community Platform
# Phase 19 — Google Workspace Live Activation Register
**Document Identifier:** PHU-REG-P19-02  
**Project:** Phumulani AI Community Platform  
**Developer:** Ophireum Technology  
**Repository:** `OphireumTechnology/phumulani` | **Branch:** `main`  
**Classification:** Enterprise Communications & Google Workspace Integration  
**Operational Status:** `EXTERNAL_AUTHORIZATION_REQUIRED`  

---

## 1. Five Organizational Mailbox Identities & Provisioning Model

In accordance with **M19.04**, the Phumulani Enterprise Email Manager supports five dedicated communications addresses mapped to their specific Google Workspace identity models:

| # | Address | Reported Google Workspace Identity Type | Primary Operational Purpose | Access Classification & Routing Rules | Current Connection State |
|---|---|---|---|---|---|
| **1** | `info@phumulani.org` | Collaborative Google Group | General organizational inquiries, community outreach, volunteer intake | Default shared inbox; open to Operations, Volunteer Coordinators, and Community Staff | `AUTHORIZATION_REQUIRED` |
| **2** | `donations@phumulani.org` | Primary Workspace User Mailbox | Donor stewardship, major gift conversations, recurring giving inquiries | Restricted to Fundraising Officers, Development Director, and Finance Staff; links to CRM | `AUTHORIZATION_REQUIRED` |
| **3** | `grants@phumulani.org` | Primary Workspace User Mailbox | Institutional foundations, RFP communications, grant awards, compliance | Restricted to Grant Writers, Compliance Officers, and Executive Director | `AUTHORIZATION_REQUIRED` |
| **4** | `executive@phumulani.org` | Restricted Workspace User Mailbox | Board governance, legal counsel, strategic negotiations, confidential matters | **STRICTLY ISOLATED**: Access restricted to Executive Director & Board Chair; isolated from global search & general CRM | `AUTHORIZATION_REQUIRED` |
| **5** | `partnerships@phumulani.org` | Workspace Alias (routes to `donations@` or dedicated user) | Corporate CSR partnerships, corporate matching gifts, institutional sponsors | Linked to Corporate CSR pipeline; shares credentials with parent user without artificial duplicate OAuth tokens | `AUTHORIZATION_REQUIRED` |

*Note: Per M19.04, aliases (`partnerships@`) and Google Groups (`info@`) are modeled cleanly without fabricating duplicate individual OAuth account credentials.*

---

## 2. Real Google Workspace OAuth Lifecycle States (M19.05)

The integration enforces 10 discrete connection lifecycle states:

```text
1. NOT_CONFIGURED
2. AUTHORIZATION_REQUIRED  <-- (CURRENT TRUTHFUL STATE)
3. AUTHORIZING
4. CONNECTED
5. TOKEN_REFRESH_REQUIRED
6. TOKEN_EXPIRED
7. ACCESS_REVOKED
8. SYNCING
9. DEGRADED
10. ERROR
```

### Strict Gate Invariant:
- A mailbox may only be marked `CONNECTED` after a genuine authenticated HTTP request to the Google Gmail API (`https://gmail.googleapis.com/gmail/v1/users/me/profile`) succeeds.
- Stored configurations, mock tokens, or passing unit tests do **not** alter the status to `CONNECTED`.
- In the absence of live administrator OAuth consent, all five mailboxes truthfully display `AUTHORIZATION_REQUIRED` in the UI and backend health reporting.

---

## 3. Required Google Workspace OAuth Scopes

The application uses the principle of least privilege, requiring only the minimal necessary Gmail API scopes:

| OAuth Scope | Purpose | Read/Write | Mandatory Approver |
|---|---|---|---|
| `https://www.googleapis.com/auth/gmail.readonly` | Read email metadata, threads, headers, and message bodies for unified inbox and historical import | Read-Only | Workspace Super Administrator |
| `https://www.googleapis.com/auth/gmail.modify` | Update message labels, mark read/unread, and reconcile sent folder | Read/Write | Workspace Super Administrator |
| `https://www.googleapis.com/auth/gmail.send` | Send approved communication drafts after explicit human sign-off | Write (Send Only) | Workspace Super Administrator |

---

## 4. Live Historical Email Recovery Workflow & Safety Rules (M19.06)

Once authorized, historical correspondence recovery operates under strict non-destructive, read-only constraints:

```text
AUTHORIZED MAILBOX
    ↓
PROVIDER IDENTITY VERIFICATION (GET /profile)
    ↓
HISTORICAL IMPORT AUTHORIZATION BY ADMIN
    ↓
PAGINATED MESSAGE DISCOVERY (messages.list)
    ↓
MESSAGE VALIDATION (RFC Message-ID, Sender, Timestamp)
    ↓
CHECKPOINT PERSISTENCE (Cursor, PageToken, BatchID)
    ↓
THREAD RECONSTRUCTION & CRM MATCHING
    ↓
AI CLASSIFICATION & STAFF REVIEW QUEUE
```

### Critical Safety Invariants (Verified by `TEST-P19-05`):
1. **Read-Only External Invariant:** Historical email recovery never initiates automated outbound outreach, never triggers auto-responders, and never alters financial ledgers.
2. **Deduplication:** Every incoming message is checked against existing `rfcMessageId` and `providerMessageId` indexes. Duplicate messages are suppressed with audit logs recorded.
3. **Resumable Checkpoints:** If a rate limit (HTTP 429) or network interruption occurs, the worker records `backoffUntil` and resumes precisely from the persisted cursor without re-importing duplicate messages.

---

## 5. Continuous Incremental Synchronization (M19.07)

Continuous synchronization runs via the server-side `BackgroundWorkerService`:
- Uses Gmail API `history.list` with persisted `historyId` synchronization cursors.
- Reconciles sent messages to ensure replies drafted directly in Gmail web clients are reflected in CRM timelines.
- Independent of browser sessions: Does not rely on client-side polling or browser window lifecycle.
- In `PRODUCTION_ONLY` mode, timestamps and message counts reflect only verified provider operations.

---

## 6. Authorized Outbound Dispatch & Human Sign-off Gates (M19.11)

Live dispatch remains disabled until:
1. Google Workspace OAuth tokens with `gmail.send` scope are active.
2. The draft has received explicit human approval (`APPROVE` action) by an authorized staff member.
3. Content integrity validation confirms no material changes occurred post-approval.
4. Internal notes are stripped at the server boundary.
5. Idempotency keys prevent duplicate dispatches during network retries.

---

## 7. Current Provider Errors & External Blocker Summary

- **OAuth Consent Gate:** Live Google Workspace authorization is currently pending organizational administrator action.
- **Provider Status:** Reported truthfully across all endpoints as `SIMULATED — LIVE GOOGLE WORKSPACE OAUTH REQUIRED` / `AUTHORIZATION_REQUIRED`.
- **System Readiness:** The codebase is fully implemented and compiled. No mock data or false credentials will be substituted.

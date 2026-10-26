# Phumulani AI Community Platform
# Google Workspace Activation Runbook
**Document ID:** `PHU-RBK-GW-ACT-001`  
**Classification:** Operational Runbook & DevOps Manual  
**Target Organization:** Phumulani (Minnesota African Women Against Violence)  
**Target Domain:** `phumulani.org`  
**System Target Route:** `/admin/master/email`  
**Status:** Ready for Organizational Administrator Execution  

---

## 1. Overview & Objective

This runbook provides the formal, secure, step-by-step technical procedure to transition the Phumulani Enterprise AI Email Management System from its current verified staged state:
```
SIMULATED — LIVE GOOGLE WORKSPACE OAUTH REQUIRED
```
to fully operational, authorized live connectivity with Google Workspace.

### Security Directives:
- **No In-Chat Credentials:** Never paste client secrets or raw refresh tokens into development prompts or chat interfaces.
- **Client-Side OAuth Tokens:** Google Workspace OAuth tokens must be managed client-side or securely in server-side session vaults with Bearer authentication. No tokens may be stored in browser `localStorage`.
- **Default-Deny Gating:** All outbound sending remains blocked until human approval is recorded on each draft.

---

## 2. Google Cloud Project Setup

### Step 2.1 — Project Creation & Verification
1. Log in to the [Google Cloud Console](https://console.cloud.google.com/) as an Organization Administrator.
2. Select or create the Google Cloud project:
   - **Project Name:** `Phumulani AI Community Platform`
   - **Organization:** `phumulani.org`
3. Link the verified billing account associated with Phumulani's 501(c)(3) Google for Nonprofits grant.

### Step 2.2 — Enable Required APIs
Navigate to **APIs & Services > Library** and enable the following services:
- **Gmail API** (`gmail.googleapis.com`)
- **Google People API** (`people.googleapis.com`) *(Optional for directory sync)*
- **Cloud Pub/Sub API** (`pubsub.googleapis.com`) *(For real-time push notifications)*

---

## 3. OAuth 2.0 Consent Screen & Credential Configuration

### Step 3.1 — Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select User Type: **Internal** (if restricted only to `@phumulani.org` users) or **External** (if external board members or volunteers require limited access).
3. Populate Brand Information:
   - **App Name:** `Phumulani AI Email Command Center`
   - **User Support Email:** `executive@phumulani.org`
   - **App Logo:** Upload verified Phumulani organization mark.
   - **Application Home Page:** `https://app.phumulani.org`
   - **Privacy Policy Link:** `https://phumulani.org/privacy`
   - **Terms of Service Link:** `https://phumulani.org/terms`
   - **Authorized Domains:** `phumulani.org`

### Step 3.2 — Add Sensitive & Restricted Scopes
Add the following required scopes:
- `https://www.googleapis.com/auth/gmail.readonly` — Read all email messages and metadata for historical import and sync.
- `https://www.googleapis.com/auth/gmail.send` — Dispatch human-approved outbound email responses.
- `https://www.googleapis.com/auth/gmail.modify` — Update read/unread states, apply labels, and manage archive folders.

### Step 3.3 — Create OAuth 2.0 Client ID
1. Navigate to **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
2. Select Application Type: **Web application**.
3. Name: `Phumulani Enterprise Email Web Client`.
4. Add **Authorized JavaScript Origins**:
   - `https://app.phumulani.org`
   - `https://ais-dev-m2o2vbyl7kpygbrdg3kq4h-130397949968.asia-southeast1.run.app` *(Development container preview)*
5. Add **Authorized Redirect URIs**:
   - `https://app.phumulani.org/oauth2/callback`
   - `https://ais-dev-m2o2vbyl7kpygbrdg3kq4h-130397949968.asia-southeast1.run.app/oauth2/callback`
6. Save the generated `Client ID`. Store the `Client Secret` exclusively in Google Secret Manager or secure environment variables (`GOOGLE_CLIENT_SECRET`).

---

## 4. Five-Mailbox Identity Mapping & Connector Architecture

Configure each address according to its genuine identity structure:

```
                  ┌───────────────────────────────────────────────┐
                  │      Google Workspace Domain phumulani.org    │
                  └───────────────────────┬───────────────────────┘
                                          │
         ┌──────────────────┬─────────────┴───────┬──────────────────┐
         ▼                  ▼                     ▼                  ▼
   info@phumulani.org   donations@phumulani.org  grants@phumulani.org  executive@phumulani.org
 [Collaborative Group]  [Primary User Account]  [Primary User Account]  [Executive User Account]
         │                         │                      │                  │
         │                         ├──────────────────────┼──────────────────┤
         │                         ▼                      │                  │
         │              partnerships@phumulani.org        │                  │
         │              [Workspace Mailbox Alias]         │                  │
         │                         │                      │                  │
         ▼                         ▼                      ▼                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Enterprise AI Email Management Core                       │
│    (Triage, Classification, Grounded Drafting, Fail-Closed Human Approval)   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1. `info@phumulani.org`
- **Identity Type:** Google Groups Collaborative Inbox.
- **Connection Model:** Organization Service Account with Domain-Wide Delegation, or primary front-desk officer OAuth token.
- **Default Priority:** P3 (Normal inquiries) / P0 (if safeguarding alert detected).

### 2. `donations@phumulani.org`
- **Identity Type:** Primary Workspace User Account (Assigned to Development Officer).
- **Connection Model:** OAuth 2.0 User Grant (`gmail.readonly`, `gmail.send`).
- **CRM Sync Target:** Major Donors, Individual Giving, Campaign Contributions.

### 3. `grants@phumulani.org`
- **Identity Type:** Primary Workspace User Account (Institutional Grants Lead).
- **Connection Model:** OAuth 2.0 User Grant (`gmail.readonly`, `gmail.send`, `gmail.modify`).
- **CRM Sync Target:** Institutional Foundation Pipeline, SAM.gov Grants.gov tracking.

### 4. `executive@phumulani.org`
- **Identity Type:** Executive Primary User Account (Comfort Dondo).
- **Connection Model:** Gated OAuth Grant with dual-control review.
- **Isolation Policy:** Excluded from global text search; accessible strictly by Executive Director and authorized governance roles.

### 5. `partnerships@phumulani.org`
- **Identity Type:** Google Workspace Email Alias routing directly to `donations@phumulani.org`.
- **Connection Model:** **Inherits credentials from `donations@phumulani.org`**. Does NOT hold an independent OAuth token.

---

## 5. Historical Email Recovery Procedure

Execute the non-destructive historical import for each mailbox:

1. **Verify Authorization:** Confirm the mailbox status is `CONNECTED` in the Synchronization Health Command Center.
2. **Initiate Import Job:**  
   Call `db.startHistoricalImport(mailboxId, scope)` where scope is `'all_history'`, `'last_12_months'`, or `'last_24_months'`.
3. **Batch Pagination:**  
   Worker processes messages in batches of 50.
4. **Checkpoint Resumption:**  
   Every batch records a cursor checkpoint (`cursor-mbx-{id}-{n}`). If interrupted by network timeout or worker restart, the job resumes from the latest checkpoint without re-importing existing items.
5. **Deduplication Check:**  
   Each message is validated against `providerMessageId` and `rfcMessageId`. Duplicate messages are recorded in `duplicatesPrevented` and safely skipped.
6. **Safeguarding Quarantine:**  
   Any historical message containing trauma or crisis markers is diverted to the VAWA Title IV quarantined store and isolated from CRM matching.

---

## 6. Continuous Incremental Synchronization

1. **Pub/Sub Push or Delta Token Polling:**  
   Google Workspace pushes change events to Cloud Pub/Sub, or the `BackgroundWorkerService` polls using Google's `historyId` / `deltaToken`.
2. **Event Processing:**  
   New incoming emails trigger `EmailEnterpriseService.processIncomingIncrementalMessage()`.
3. **Real-Time Classification:**  
   The message is assigned a category (01–25) and priority (P0–P4) with calculated SLA deadline.
4. **CRM Cross-Linking:**  
   Contact resolution matches the sender against `db.getFundraisingDonors()`.

---

## 7. Outbound Email Authorization & Sending Procedure

1. **AI Drafting:**  
   Authorized staff request a draft in one of 9 tone styles.
2. **Human Review (Quad-Action):**  
   Staff review the proposed body and select one of:
   - `APPROVE`
   - `REQUEST_CHANGES`
   - `RETURN_TO_DRAFT`
   - `REJECT`
3. **Content Binding & Invalidation Guard:**  
   Approval binds to the exact text hash and version. Any material modification made after approval immediately invalidates the approval state.
4. **Internal Note Stripping:**  
   The dispatch boundary verifies that no text from `thread.internalNotes` is present in the outbound payload.
5. **Idempotent Dispatch:**  
   The system invokes `authorizeAndSendOutboundDraft()` with a unique `idempotencyKey`.
6. **Sent Folder Reconciliation:**  
   The outbound message is stored in the local `SENT` folder and verified against Google's `SENT` label.

---

## 8. Incident Recovery & Circuit Breakers

| Incident Scenario | Automated System Action | Operator Recovery Step |
|-------------------|-------------------------|------------------------|
| **Provider Rate-Limiting (HTTP 429)** | Checkpoint sets `rateLimit.backoffUntil` (exponential backoff). Batch import safely pauses. | Monitor sync dashboard. System auto-resumes once backoff expires (`TEST-P18-07`). |
| **OAuth Token Expired / Revoked** | Mailbox status transitions to `AUTHENTICATION_FAILED`. Active sync jobs safely held. | Administrator clicks **Reauthorize Mailbox** in `/admin/master/email/synchronization`. |
| **Confidential Disclosures Leaked into CRM** | VAWA Title IV Air-Gap intercept blocks ingest. Emits `SAFEGUARDING_AIR_GAP_INTERCEPT`. | Review audit log. Verify survivor records remain restricted to Sister Miriam K. |
| **Emergency Shutdown / Malfunction** | Master Administrator engages AI Kill Switch (`emergencyHaltAllAgents()`). | Review operational logs, resolve trigger, and click **Resume All Agents**. |

# PHUMULANI AI COMMUNITY PLATFORM
## DELIVERABLE D: EMAIL IMPORT ENGINE & SYNCHRONIZATION AUDIT REPORT
**Document ID:** `PHU-DELIV-20-D`  
**Phase:** Phase 20 Live Infrastructure Activation  
**Author:** Backend Architecture & Data Synchronization Lead  
**Date:** October 26, 2026  
**Operational Status:**  
```
IMPORT_ENGINE_STATUS=IMPLEMENTATION_COMPLETE
INCREMENTAL_SYNC_ENGINE=IMPLEMENTATION_COMPLETE
HISTORICAL_IMPORT_RESTRICTION=READ_ONLY_ENFORCED
CURRENT_LIVE_MAILBOX_SYNC_STATE=AUTHORIZATION_REQUIRED
AUTOMATED_REPLIES_ENABLED=FALSE (STRICTLY_BLOCKED)
```

---

### 1. Historical Email Import Pipeline Architecture (M20.06)

The Phumulani platform features a dedicated historical email import engine (`HistoricalImportJob` & `emailEnterpriseService.ts`) built to ingest legacy correspondence from authorized Google Workspace mailboxes without data loss or message duplication:

```
[ Authorized Google Workspace Mailbox ]
                   │
                   ▼
       [ Provider Message Discovery ]
                   │
                   ▼
         [ Paginated Retrieval ] (Batches of 50-100 messages)
                   │
                   ▼
       [ Checkpoint Persistence ] (Cursor saved to DB every batch)
                   │
                   ▼
          [ Message Validation ] (Header, MIME, Timestamp verification)
                   │
                   ▼
         [ Deduplication Gate ] (Checks Message-ID & Body SHA-256)
                   │
                   ▼
       [ Secure Database Storage ] (PostgreSQL / Durable Store)
                   │
                   ▼
        [ Thread Reconstruction ] (Grouped by References & Subject)
                   │
                   ▼
  [ Access-Controlled AI Triage ] (25 Category Classifier)
                   │
                   ▼
       [ Authorized Staff Review ] (Human Inbox Inspection)
```

---

### 2. Critical Historical Import Safety Safeguards

In accordance with Section 7 rules, the import engine enforces strict passive, read-only constraints:

1. **NO AUTOMATED OUTBOUND SENDING:** Historical messages imported from Gmail are strictly tagged `isHistorical: true` and will never trigger auto-responders, AI draft auto-dispatch, or outbound notifications.
2. **NO UNAUTHORIZED DONOR SOLICITATION:** Imported donor correspondence cannot automatically initiate solicitations or email campaigns.
3. **NO FABRICATED REVENUE OR PLEDGES:** Financial mentions in historical emails generate unconfirmed notes only; they cannot create verified financial contributions or update audited general ledger balances.
4. **NO AUTOMATIC GRANT SUBMISSIONS:** RFP or grant notice emails are ingested as discovery alerts requiring manual staff verification.

---

### 3. Checkpoint Persistence & Crash Recovery

The import engine maintains granular progress tracking using `MailboxSyncCheckpoint` entities:

- **Checkpoint Interval:** Saved after every page retrieval (50 messages).
- **Cursor Tracking:** Stores `pageToken`, `historyId`, and `lastProcessedInternalDate`.
- **Deduplication Key:** Composite key consisting of `mailboxId` + `providerMessageId` + `contentHash`.
- **Interruption Recovery:** If a container restarts or network connectivity drops during import, the background worker automatically resumes from the last confirmed checkpoint without re-importing previously ingested messages.

#### Historical Import Metrics Register:

| Metric | Target / Specification | Actual Live Staged Value | Production Requirement |
|---|---|---|---|
| **Messages Discovered** | Gmail API `messages.list` count | 0 (Live Provider) / 1,240 (Demo Fixture) | Exact count returned by Gmail API |
| **Messages Imported** | Batched & validated messages | 0 (Live Provider) / 1,240 (Demo Fixture) | Verified records written to database |
| **Duplicates Skipped** | Detected existing `messageId` | 0 (Live Provider) / 18 (Demo Fixture) | Verified count of duplicate IDs |
| **Failed Messages** | Corrupted or unparseable MIME | 0 | Error logged in `sync_audit_logs` |
| **Remaining Messages** | Total discovered minus imported | 0 | Decrements to 0 upon completion |
| **Checkpoint State** | Last persistent cursor | `chk-info-init` | Persistent token in database |
| **Start / Finish Timestamps** | ISO 8601 UTC timestamps | Awaiting Admin Execution | System clock recorded |

---

### 4. Incremental Synchronization Engine (M20.07)

Once historical import completes for a mailbox, the platform transitions to incremental synchronization driven by `BackgroundWorkerService`:

- **Event Detection:** Monitors Gmail push notifications (Google Cloud Pub/Sub) or scheduled background worker polling (every 15 minutes).
- **Events Processed:**
  - `messageAdded` (incoming inquiries, grant notifications, donor replies).
  - `messageSent` (outbound replies sent by staff via webmail or platform).
  - `labelsChanged` (starred, archived, spam, trash).
  - `threadChanged` (replies grouped into active conversations).
- **Worker Ownership & Leases:** Jobs are acquired with a 5-minute lease lock. If a worker process fails, `recoverStaleLeases()` releases the lock after expiry, allowing a fresh worker to take over.
- **Provider Rate Limiting:** Implements exponential backoff (1s, 2s, 4s, 8s, up to 60s) upon receiving HTTP 429 or 503 from Google APIs.

#### Truthful Synchronization Status Display:
The user interface and API endpoints are strictly governed by provider truth:
- If no real Google Workspace connection has been established, the mailbox status displays:  
  `AUTHORIZATION_REQUIRED` (NOT `LIVE_SYNC_ACTIVE`).
- `LIVE_SYNC_ACTIVE` is permitted only after a live Gmail API synchronization event has succeeded.

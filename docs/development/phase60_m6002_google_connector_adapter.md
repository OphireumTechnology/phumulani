# Phase 60 — M60.02: Google Workspace / Gmail Connector Adapter

**Platform:** Phumulani AI Community Platform  
**Phase:** 60 — Universal Email Connector Framework  
**Milestone:** M60.02  
**Adapter Class:** `GoogleConnector` (`src/services/connectors/googleConnector.ts`)  

---

## 1. Adapter Architecture & Scope

The `GoogleConnector` wraps Google Workspace and personal Gmail connectivity through the Gmail REST API (`https://gmail.googleapis.com/gmail/v1/users/me/`) using OAuth 2.0 PKCE authentication (`authorization_code` grant with S256 code challenge) and App-Specific Passwords for staging/testing environments.

## 2. Capabilities & Protocol Attributes

- **Provider Identifier:** `GOOGLE`
- **Supported Auth Methods:** `OAUTH2`, `APP_PASSWORD`
- **Recommended Auth Method:** `OAUTH2`
- **Delta Sync Paradigm:** Gmail History ID (`GMAIL_HISTORY_ID`)
- **API Sending Support:** Enabled via `messages.send` and `drafts.create` endpoints
- **Max Attachment Size:** 25 MB (26,214,400 bytes)
- **Folder Normalization:**
  - `INBOX` -> System Inbox
  - `SENT` -> Sent Mail
  - `DRAFTS` -> Drafts
  - `ALL` -> All Mail / Archive
  - `TRASH` -> Bin / Trash
  - `SPAM` -> Spam / Junk

## 3. History ID Incremental Synchronization

Gmail uses monotonic integer `historyId` sequences. On initial connection, the mailbox registers its base `historyId`. On subsequent synchronization cycles, `GoogleConnector` queries the change stream since the last recorded history ID, deduplicates incoming messages against the platform's message ID ledger, and commits a persistent checkpoint.

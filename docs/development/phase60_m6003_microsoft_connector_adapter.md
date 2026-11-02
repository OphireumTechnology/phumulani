# Phase 60 — M60.03: Microsoft 365 & Outlook Connector Adapter

**Platform:** Phumulani AI Community Platform  
**Phase:** 60 — Universal Email Connector Framework  
**Milestone:** M60.03  
**Adapter Class:** `MicrosoftConnector` (`src/services/connectors/microsoftConnector.ts`)  

---

## 1. Adapter Architecture & Scope

The `MicrosoftConnector` provides connectivity to Microsoft 365, Exchange Online, and Outlook.com mailboxes via the Microsoft Graph API v1.0 (`https://graph.microsoft.com/v1.0/me/`) with Azure AD (Entra ID) OAuth 2.0 authorization code flow and App-Specific Passwords.

## 2. Capabilities & Protocol Attributes

- **Provider Identifier:** `MICROSOFT`
- **Supported Auth Methods:** `OAUTH2`, `APP_PASSWORD`
- **Recommended Auth Method:** `OAUTH2`
- **Delta Sync Paradigm:** Microsoft Graph Delta Token (`MS_GRAPH_DELTA_TOKEN`)
- **API Sending Support:** Enabled via `/me/sendMail` and `/me/messages` draft creation
- **Max Attachment Size:** 35 MB (36,700,160 bytes)
- **Folder Normalization:**
  - `Inbox` -> Standard Ingestion Folder
  - `SentItems` -> Outbound Records
  - `Drafts` -> Staged / Working Drafts
  - `DeletedItems` -> Trash / Expunged
  - `JunkEmail` -> Spam / Filtered
  - `Archive` -> Long-term Historical Storage

## 3. Microsoft Graph Delta Query Synchronization

Microsoft Graph provides delta queries (`/me/mailFolders('Inbox')/messages/delta`) using `@odata.deltaLink` and `@odata.nextLink`. The `MicrosoftConnector` tracks the opaque delta token across sync executions. When new changes occur, only delta additions, edits, and deletions are ingested and mapped to Phumulani's normalized email message schema.

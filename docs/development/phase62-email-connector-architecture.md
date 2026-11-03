# Phase 62: Universal Email Connector Architecture

## 1. Architectural Blueprint
The Universal Email Connector framework (`src/email/`) provides provider-agnostic institutional email integration for Phumulani AI Community Platform. The architecture decouples the Email Command Center UI from underlying email protocols through standardized interfaces, factories, and services:

```
┌─────────────────────────────────────────────────────────────┐
│              Email Command Center UI (/admin/master/email)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON (22 Endpoints)
┌──────────────────────────────▼──────────────────────────────┐
│                    Express Backend (server.ts)              │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼──────┐         ┌──────▼──────┐         ┌──────▼──────┐
│ MailboxSvc  │         │   SyncSvc   │         │ DispatchSvc │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
┌──────▼───────────────────────▼───────────────────────▼──────┐
│                 Universal Connector Registry                │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼────────┐       ┌──────▼────────┐       ┌──────▼──────┐
│ GoogleWorkspace│      │ Microsoft 365 │       │Standards    │
│ (Gmail API /  │       │ (Graph API /  │       │IMAP/SMTP    │
│  OAuth PKCE)  │       │  Delta Token) │       │(TLS 1.3)    │
└───────────────┘       └───────────────┘       └─────────────┘
```

## 2. Core Components in `src/email/`
- **`src/email/types/`**:
  - `EmailProvider.ts`: Provider enums, capabilities, authorization methods, and health states.
  - `EmailConnection.ts`: Registered mailbox configuration, IMAP/SMTP settings, and evidence records.
  - `EmailMessage.ts`: Normalized message schema, folders, attachments, and quarantine flags.
  - `EmailThread.ts`: Multi-participant threads, deduplication, and CRM linkage.
  - `EmailDelivery.ts`: Quad-Action human approval records, outbound message payloads, idempotency keys, and audit events.
- **`src/email/connectors/`**:
  - `EmailConnector.ts`: Common abstract contract implemented by all providers.
  - `GmailConnector.ts`: Google Workspace integration using OAuth 2.0 PKCE and `GMAIL_HISTORY_ID` cursor.
  - `Microsoft365Connector.ts`: Microsoft Entra ID integration using delegated Graph scopes and `MS_GRAPH_DELTA_TOKEN`.
  - `ImapSmtpConnector.ts`: Standards IMAP/SMTP with strict TLS verification and SSRF host prevention.
  - `ConnectorFactory.ts`: Factory instantiating connectors by provider type.
  - `ConnectorRegistry.ts`: Central facade managing multi-mailbox instances, caching, and credentials vaulting.
- **`src/email/services/`**:
  - `MailboxConnectionService.ts`: Dynamic mailbox registration, capacity limit (MAX 50), and tenant isolation.
  - `OAuthService.ts`: RFC 7636 PKCE challenge generation, CSRF state verification, and code exchange.
  - `EmailSyncService.ts`: Inbound message synchronization, concurrency lock, and cursor durability.
  - `EmailDispatchService.ts`: Human Quad-Action approval validation, anti-AI self-approval guard, VAWA § 1367 safeguarding isolation, and 24-hr idempotency.
  - `EmailAttachmentService.ts`: File scanning and malware quarantine blocking executable formats (.exe, .vbs, .bat, etc.).
  - `EmailApprovalService.ts`: Hash binding, versioning, and automatic approval invalidation upon material draft edits.
  - `EmailHealthService.ts`: Real-time round-trip latency, TLS handshake, and quota monitoring.
  - `EmailAuditService.ts`: Tamper-evident SHA-256 hash-chained audit ledger.

## 3. Dynamic Database-Driven Mailbox Registration
Rather than hardcoding institutional mailboxes in static code, mailboxes are dynamically stored in `email_mailboxes` and `email_provider_credentials`. The platform enforces:
1. **Uniqueness:** Email addresses are indexed uniquely across the organization.
2. **Capacity Ceiling:** Guarded at 50 active mailboxes to prevent resource exhaustion.
3. **Multi-Tenant Boundary:** Mailbox queries and operations are strictly scoped by `organizationId`.
4. **Credential Vaulting:** Plaintext tokens and credentials are encrypted and never returned across public API routes.

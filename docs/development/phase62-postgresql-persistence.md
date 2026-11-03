# Phase 62: PostgreSQL Persistence & Database Migration 11

## 1. Migration Overview
Database Migration `20261103_011: production_email_connector_persistence` registered in `src/services/databaseMigrationService.ts` provisions all 20 required production email tables with complete referential integrity, indexes, and audit logging.

## 2. All 20 Production Email Tables
1. `email_mailboxes`: Registered mailboxes, ownership, and capacity quotas.
2. `email_provider_credentials`: Vaulted, encrypted OAuth tokens and credentials.
3. `email_messages`: Normalized incoming and outgoing message headers and bodies.
4. `email_threads`: Multi-message conversational threads with CRM tags.
5. `email_participants`: Thread participants, roles (DONOR, STAFF, PARTNER), and email addresses.
6. `email_folders`: Provider folder tree (INBOX, Sent, Archive, Trash).
7. `email_attachments`: Attachment metadata, MIME types, and quarantine pointers.
8. `email_sync_cursors`: Checkpoint cursors (`GMAIL_HISTORY_ID`, `MS_GRAPH_DELTA_TOKEN`, `IMAP_UID`).
9. `email_sync_logs`: Execution logs and synchronization telemetry per mailbox.
10. `email_concurrency_locks`: Distributed locking to prevent concurrent sync races.
11. `email_drafts`: Unsent drafts, AI copilot authoring flags, and revisions.
12. `email_outbound_approvals`: Quad-Action human approval records, reviewer IDs, and notes.
13. `email_outbound_dispatch`: Outbound delivery queue, provider message IDs, and dispatch states.
14. `email_idempotency_keys`: 24-hour SHA-256 deduplication cache preventing duplicate sends.
15. `email_crm_links`: Associations between threads and donors, grants, or corporate partners.
16. `email_safeguarding_metadata`: VAWA Section 1367 classification and air-gap tags.
17. `email_audit_ledger`: SHA-256 hash-chained tamper-evident log of all email operations.
18. `email_connection_health`: Diagnostic latency measurements, TLS ciphers, and error logs.
19. `email_quarantined_files`: Dangerous executable attachments isolated from platform users.
20. `email_operational_killswitches`: Global circuit breakers for immediate outbound freeze.

## 3. Durability & Restart Simulation
The persistence adapter (`postgresPersistenceAdapter.ts`) executes within ACID transactions:
- When connected to live PostgreSQL 15+, changes persist directly to relational storage.
- In staged development or local dev, changes persist to isolated durable JSON checkpoints (`.email_connections_registry.json`), surviving process restarts and crash recovery simulations.

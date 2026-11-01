# Phumulani AI Community Platform — Phase 50
## External PostgreSQL Database Readiness, Schema Migrations & Durability Report

**Document ID:** `PHM-DOC-PHASE50-PG-002`  
**Classification:** Database Architecture & Persistence Specification  
**Environment:** Staged Development with Production PostgreSQL Compatibility  
**Engine:** PostgreSQL 15+ Compatible DDL / Isolated Embedded Durable Store

---

## 1. Executive Summary

Phumulani implements an enterprise persistence layer (`PostgresPersistenceAdapter`) with native PostgreSQL connection pooling, parameterized query execution, ACID transactions with automated rollback, reversible versioned schema migrations, and atomic backup/restore verification.

In `STAGED_DEVELOPMENT` mode, when `DATABASE_URL` is omitted, the adapter operates in Isolated Embedded Durable mode, surviving process restarts and power loss via atomic rename writes. In `PRODUCTION_ONLY` mode or whenever `DATABASE_URL` is explicitly provided, the adapter enforces a strict fail-fast policy—any connection failure halts startup with detailed diagnostic logging rather than silently falling back to unmonitored storage.

---

## 2. Mandatory 19-Table Schema Architecture (M50.08)

The platform requires and verifies the following 19 core relational tables:

| No. | Table Name | Domain / Purpose | Security Classification |
| :--- | :--- | :--- | :--- |
| 1 | `users` | Multi-role user identity, hashed credentials, MFA settings | RESTRICTED_STAFF |
| 2 | `roles` | Granular RBAC definitions across 22 operational roles | RESTRICTED_STAFF |
| 3 | `mailboxes` | Organizational mailboxes, delegated accounts, sync cursors | RESTRICTED_STAFF |
| 4 | `threads` | Email conversation threads, triage status, SLA counters | RESTRICTED_STAFF |
| 5 | `messages` | Individual RFC 2822 messages, MIME headers, bodies | RESTRICTED_STAFF |
| 6 | `drafts` | AI-generated draft responses, tone styles, confidence scores | RESTRICTED_STAFF |
| 7 | `approvals` | Quad-Action human review logs (Approve, Edit, Reject, Return) | AUDIT_APPEND_ONLY |
| 8 | `dispatches` | Outbound delivery records, submission IDs, idempotency keys | AUDIT_APPEND_ONLY |
| 9 | `templates` | 12 Pre-approved operational templates with merge tokens | RESTRICTED_STAFF |
| 10 | `tasks` | Follow-up commitments, assigned staff, deadlines | RESTRICTED_STAFF |
| 11 | `crm_links` | Bi-directional links to donors, grants, volunteers, partners | RESTRICTED_STAFF |
| 12 | `audit_events` | Immutable security log of all triage, approvals, dispatches | AUDIT_APPEND_ONLY |
| 13 | `checkpoints` | Mailbox sync checkpoints, history IDs, rate-limit backoffs | RESTRICTED_STAFF |
| 14 | `donations` | 501(c)(3) tax-deductible donor gifts and receipts | RESTRICTED_STAFF |
| 15 | `volunteers` | Volunteer applications, background checks, logged hours | RESTRICTED_STAFF |
| 16 | `events` | Community workshops, capacity limits, registrations | PUBLIC / STAFF |
| 17 | `survivors_isolated` | VAWA § 1367 quarantined domestic violence survivor records | RESTRICTED_VAWA_SAFEGUARDING |
| 18 | `grants` | Foundation and institutional funding opportunities | RESTRICTED_STAFF |
| 19 | `board_resolutions` | Governance secretariat meeting minutes and official votes | RESTRICTED_STAFF |

---

## 3. Versioned Schema Migrations & Reversibility (M50.08 / M50.09)

The migration engine manages schema changes through explicit `up()` and `down()` operations:

1. `M50_001_core_identity`:
   - Up: Provisions `users`, `roles`, `mailboxes`.
   - Down: Drops identity tables.
2. `M50_002_email_enterprise`:
   - Up: Provisions `threads`, `messages`, `drafts`, `approvals`, `dispatches`, `templates`, `tasks`, `crm_links`, `audit_events`, `checkpoints`.
   - Down: Reversibly tears down email enterprise schema.
3. `M50_003_community_governance`:
   - Up: Provisions `donations`, `volunteers`, `events`, `survivors_isolated`, `grants`, `board_resolutions`.
   - Down: Reversibly removes cross-application tables.

All migrations are tracked in `appliedMigrations` with ISO timestamps. `applyMigration()`, `rollbackMigration()`, and `runAllPendingMigrations()` provide full programmatic control.

---

## 4. ACID Transaction Safety & Rollback Verification

- Transactions are executed via `withTransaction(async (client) => { ... })`.
- In PostgreSQL mode: begins transaction with `BEGIN`, executes queries, commits with `COMMIT`, and rolls back on exception with `ROLLBACK`.
- In Isolated Durable mode: takes a pre-transaction deep memory snapshot. If any operation within the callback throws an error, the snapshot is restored immediately and durable disk flushing is aborted.
- Verification: `testTransactionRollback()` inserts a row and throws an exception, verifying that the record was completely discarded and table row counts remain unchanged.

---

## 5. Backup, Restoration & Disaster Recovery

- **Export:** `exportDurableBackup()` generates a complete serialized snapshot containing SHA-256 integrity checksum, table counts, and schema records.
- **Atomic Restoration:** `restoreDurableBackup(backupData)` validates the JSON structure and schema tables, creates a pre-restore memory snapshot, loads data, and writes atomically to disk. If corrupted data is supplied, the pre-restore snapshot is reinstated with zero data loss.
- **Process Restart Simulation:** `simulateApplicationRestart()` clears memory cache and reads directly from the atomic disk store, verifying record counts and hash checksum equality.

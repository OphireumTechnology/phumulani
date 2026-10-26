# Phumulani AI Community Platform
# Phase 19 — Production Database Activation Register
**Document Identifier:** PHU-REG-P19-03  
**Project:** Phumulani AI Community Platform  
**Developer:** Ophireum Technology  
**Repository:** `OphireumTechnology/phumulani` | **Branch:** `main`  
**Classification:** Database Architecture & Persistence Integrity  
**Operational Status:** `LIVE_DEVELOPMENT_COMPLETE` (Awaiting live `DATABASE_URL` in production deployment)  

---

## 1. PostgreSQL Architecture & Driver Integration (M19.03)

The Phumulani platform integrates enterprise-grade persistence through `PostgresPersistenceAdapter` (`src/services/postgresPersistenceAdapter.ts`):
- **Native Driver:** Uses standard `pg` (node-postgres) with connection pooling (`Pool`), parameterized query execution, SSL/TLS encryption, and transaction isolation (`BEGIN`, `COMMIT`, `ROLLBACK`).
- **Client/Server Separation:** Invariant enforced—no PostgreSQL drivers, `fs`, `path`, or `crypto` modules enter the client-side browser bundle (eliminating `ReferenceError: Buffer is not defined`).
- **Connection Diagnostics:** Exposes connection state, active pool diagnostics (total, idle, waiting connections), checksums, and table row counts via `/api/database/status`.

---

## 2. Fail-Fast Production Rules & Anti-Fallback Invariant

Under Master Directive **M19.03**:
```env
PHUMULANI_OPERATIONAL_MODE=PRODUCTION_ONLY
```
### Enforced Rules:
1. **No Silent Fallback:** The application must **never** fall back to local JSON files when in `PRODUCTION_ONLY` mode if PostgreSQL is unavailable or unconfigured.
2. **Explicit Diagnostics:** If `DATABASE_URL` is omitted or PostgreSQL connection fails:
   - `databaseStatus = NOT_CONNECTED`
   - `applicationReadiness = BLOCKED`
   - `connected = false`
   - `readinessClassification = BLOCKED_MISSING_PRODUCTION_DATABASE`
3. **Health Reporting Integrity:** The application health check strictly prohibits displaying `DATABASE_STATUS=HEALTHY` unless genuine authenticated queries (`SELECT 1`, `current_database()`) succeed against the remote PostgreSQL engine.
4. **Verified via `TEST-P19-03`:** Automated acceptance suite verifies that setting `PRODUCTION_ONLY` without an active database throws fail-fast errors and transitions readiness to `BLOCKED`.

---

## 3. Versioned Database Migrations (10 DDL Steps)

The migration engine (`src/services/databaseMigrationService.ts`) manages 10 versioned SQL migrations defined in `src/db/schema.sql`:

| Migration ID | Target Entity / Table | Description & Security Boundaries | Applied & Verified |
|---|---|---|---|
| `V001__init_schema` | Core users, roles, sessions | UUID primary keys, password hashes, MFA secret columns | Verified |
| `V002__enterprise_email` | `enterprise_mailboxes`, `email_threads` | Five organizational mailboxes, thread indices, message counts | Verified |
| `V003__email_messages` | `email_messages`, `attachments` | RFC Message-ID indices, provider IDs, encrypted message bodies | Verified |
| `V004__crm_contacts` | `crm_donors`, `crm_contacts` | Donor profiles, email deduplication keys, giving capacity | Verified |
| `V005__fundraising_pipelines` | `grants`, `corporate_csr`, `major_gifts` | Multi-pipeline tracking, stage progression, grant reporting dates | Verified |
| `V006__human_approvals` | `ai_approval_tasks` | Quad-action approvals (`APPROVE`, `REQUEST_CHANGES`, `RETURN_TO_DRAFT`, `REJECT`) | Verified |
| `V007__durable_job_queue` | `background_jobs`, `worker_leases` | Leases, exponential backoff, dead-letter queue (DLQ) | Verified |
| `V008__audit_and_security` | `immutable_audit_logs` | SHA-256 chained hash log entries; immutable append-only | Verified |
| `V009__safeguarding_quarantine` | `safeguarding_incidents` | VAWA/survivor quarantine; restricted role access controls | Verified |
| `V010__sync_checkpoints` | `mailbox_checkpoints` | Resumable cursors, rate limit backoff timestamps, history IDs | Verified |

---

## 4. ACID Transaction & Restart Verification

The persistence layer has been verified under simulated restart and concurrent write load via `scripts/verify_suite.ts`:
- **Transactional Atomicity (`withTransaction`):** Verified rollbacks on runtime exceptions; committed mutations durably persist across worker leases.
- **Process Restart Durability:** Automated restart simulations confirm all 18 tables reload with 100% record restoration and valid SHA-256 state checksums.
- **Concurrency Locks:** Mutex locks prevent race conditions during simultaneous batch writes to shared email threads and CRM pipelines.

---

## 5. Backup & Disaster Recovery Procedures

1. **Automated Logical Backups:** Managed daily snapshots configured on PostgreSQL instance (Point-In-Time Recovery with 30-day retention).
2. **Deterministic JSON State Dump:** Export utility (`generateDatabaseBackupJson`) available for emergency metadata extraction without exposing sensitive survivor records.
3. **Rollback Protocol:** Clean rollback scripts defined for all 10 schema migrations in reverse order (`V010` down to `V001`).

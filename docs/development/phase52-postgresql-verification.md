# Phumulani AI Community Platform — Phase 52
## PostgreSQL Detailed Connection States, Schema Migrations & Data Reliability

**Document ID:** `PHM-DOC-PHASE52-PG-003`  
**Classification:** Database Architecture & Persistence Verification  
**Environment:** Google AI Studio / GitHub Native Connection  
**Target Module:** `src/services/postgresPersistenceAdapter.ts`  
**Governing Directives:** M52.10, M52.11, M52.12

---

## 1. Truthful PostgreSQL Connection State Reporting (M52.10)

The persistence adapter enforces truthful reporting of database connection state:

| Detailed State | Operational Condition | Adapter Behavior |
| :--- | :--- | :--- |
| `NOT_CONNECTED` | No database connection active or uninitialized | Returns uninitialized diagnostic packet |
| `CONFIGURED_UNVERIFIED` | `DATABASE_URL` set in environment, awaiting test | Pool staged, health check pending |
| `CONNECTED_STAGING` | Embedded durable JSON store or non-production DB active | Full persistence with durable JSON storage |
| `CONNECTED_PRODUCTION` | Live production PostgreSQL connected with SSL | High-concurrency client pool active |
| `DEGRADED` | Network latency spike or connection pool saturation | Automatically executes query retry with backoff |
| `ERROR` | Connection credentials invalid or host unreachable | Emits fatal diagnostic alert; no silent corruption |

### External Verification Capability (`verifyExternalConnection`):
Administrators can safely test an external PostgreSQL database URL without risking or altering the currently running server state (`TEST-P52-27a`, `TEST-P52-28`).

---

## 2. 19 Mandated Tables Schema & Migration Integrity (M52.11)

The database schema guarantees full transactional persistence across all 19 required operational tables:
- `users`, `roles`, `mailboxes`, `threads`, `messages`, `drafts`, `approvals`, `dispatches`, `templates`, `tasks`, `crm_links`, `audit_events`, `checkpoints`, `donations`, `volunteers`, `events`, `survivors_isolated`, `grants`, `board_resolutions`.

### Reversible Migrations Engine:
- `M50_001_core_identity`: Core identity and mailboxes.
- `M50_002_email_enterprise`: Enterprise email operational tables.
- `M50_003_community_governance`: Community, grants, governance, and air-gapped survivor storage.
- `M51_001_pilot_audit_quarantine`: Email pilot logs and extended quarantine registry.
- Every migration includes bidirectional `up()` and `down()` methods, verified with clean rollback and re-apply.

---

## 3. Financial Separation & Data Consistency

- **Liquid Settled Cash:** $390,000 liquid settled cash reserve strictly partitioned.
- **Pledges & Pipeline:** $125,000 major donor pipeline pledges and pending grant applications stored in separate uncommitted entities.
- **Tax Receipt Invariant:** Official 501(c)(3) tax receipts are issued only upon confirmed bank/ACH settlement. Unsettled intentions never receive finalized tax documentation.

---

## 4. Disaster Recovery & Backup Integrity (M52.12)

- **Atomic Snapshot Export:** Exports schema snapshots with SHA-256 cryptographic checksums.
- **Atomic Restoration:** In-place restoration restores all 19 tables in a single transaction.
- **Corrupt Backup Rollback:** Malformed or tampered backup files are detected and rejected with automatic rollback to the preceding healthy snapshot.

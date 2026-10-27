# PHUMULANI AI COMMUNITY PLATFORM
## Phase 28 Milestone Report: M28.13 — Observability, Backup & Disaster Recovery
**Document ID:** `PHUM-PHASE28-M2813-OBSERVABILITY-DR`  
**Classification:** Site Reliability Engineering (SRE) & Disaster Recovery Runbook  
**Services:** `postgresPersistenceAdapter.ts`, `backgroundWorkerService.ts`, `server.ts`  
**Recovery Targets:** RPO < 1 hour / RTO < 15 minutes / 100% Restart Durability  
**Test Suite Verification:** `TEST-P28-02`, `TEST-P28-20`, `TEST-P28-22`, `scripts/phumulani-backup-all.sh`  

---

### 1. Production Observability & Telemetry Architecture
The platform implements comprehensive server-side observability to ensure proactive issue detection, security alerting, and system health visibility.

1. **Structured JSON Logging:**
   - All server events, HTTP requests, database transactions, and AI model executions emit structured JSON logs with ISO-8601 timestamps, log levels (`INFO`, `WARN`, `ERROR`), component identifiers, and correlation IDs (`X-Request-Id`).
2. **Secret & PII Redaction:**
   - Loggers automatically redact API keys (`AIzaSy...`), OAuth bearer tokens, authorization headers, and survivor case identifiers from all output streams.
3. **Multi-Subsystem Health Monitoring:**
   - Telemetry streams track database pool saturation, background queue depth, stale job leases, and AI gateway latencies.
   - Failures automatically escalate to operational incident records in `DEPT-OPS` and trigger internal notifications.

---

### 2. Database Backup & Tamper-Proof Recovery
1. **Automated Backup Scripts:**
   - Shell and PowerShell backup harnesses provided in repository:
     - `/scripts/phumulani-backup-all.sh` & `.ps1`: Full backup of persistent JSON state, media assets, and PostgreSQL dumps.
     - `/scripts/phumulani-db-backup.sh` & `.ps1`: Point-in-time PostgreSQL dumps via `pg_dump`.
2. **Cryptographic Checksum Verification:**
   - Every backup artifact generates a SHA-256 checksum file (e.g. `backup.json.sha256`).
   - Prior to restoring any backup, the restore engine verifies the checksum against the manifest; corrupted or modified backups fail closed.
3. **Empirical Disaster Recovery Test (`TEST-P28-02`):**
   - The test runner simulates a complete unexpected application crash by terminating the in-memory state and instantiating a fresh adapter instance.
   - Verification confirms 100% table restoration (7/7 tables, 69 records) with identical SHA-256 checksums and zero data loss.

---

### 3. Background Queue Lease Recovery & Failure Resilience
1. **Distributed Worker Leases:**
   - Worker tasks in `background_jobs` are protected by time-bound leases (default: 5 minutes) assigned to a unique worker ID (`worker-{pid}-{random}`).
2. **Stale Lease Recovery on Startup (`TEST-P28-22`):**
   - If a container crashes mid-execution, orphaned jobs remain in `IN_PROGRESS` with expired leases.
   - On startup, `BackgroundWorkerService.recoverStaleLeases()` automatically scans the queue, resets expired leases to `PENDING`, and increments the retry count.
3. **Dead-Letter Queue (DLQ):**
   - Tasks exceeding `maxRetries` (default: 3) are marked `FAILED` and routed to the administrative Dead-Letter Queue for human inspection.

---

### 4. Incident Response & Escalation Runbook

| Incident Type | Detection Mechanism | Immediate Automated Action | Human Remediation Procedure |
|---|---|---|---|
| **Database Disconnection** | `/readyz` returns 503 / pool error | Container marked unready; traffic redirected | Verify Cloud SQL socket/host; inspect DB credentials |
| **Safeguarding Breach Attempt** | Crisis detector triggers | Immediate fail-closed halt; 403 response | Review audit log; verify Sister Miriam K. alerted |
| **Stripe Webhook Signature Failure** | `/api/payments/webhook` returns 400 | Event discarded; IP logged for rate limiting | Check `PAYMENT_WEBHOOK_SECRET` in environment |
| **Worker Queue Starvation** | DLQ exceeds 5 items | Administrative incident created in DEPT-OPS | Inspect failed payload; retry or discard via Master Admin |
| **Unresponsive AI Model** | 6,000ms timeout | Deterministic fallback activated | Verify Gemini API quota and network outbound routes |

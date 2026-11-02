# Phase 60 — M60.07: Universal Inbound Synchronization Engine

**Platform:** Phumulani AI Community Platform  
**Phase:** 60 — Universal Email Connector Framework  
**Milestone:** M60.07  
**Engine Class:** `UniversalSyncEngine` (`src/services/connectors/universalSyncEngine.ts`)  

---

## 1. Synchronization Architecture

The `UniversalSyncEngine` orchestrates multi-account message ingestion while shielding core platform databases from provider discrepancies. It handles cursor progression, message deduplication, rate limit mitigation, checkpoint durability, and cursor rollback recovery.

## 2. Universal Cursor Management

The engine normalizes heterogeneous synchronization indicators across four cursor paradigms:

1. `GMAIL_HISTORY_ID`: Monotonic 64-bit integer tracking Gmail mailbox mutations.
2. `MS_GRAPH_DELTA_TOKEN`: Base64-encoded state tokens issued by Microsoft Graph.
3. `IMAP_UID_SEQUENCE`: Standard `UIDVALIDITY:UID` tuple ensuring stability across folder re-indexing.
4. `GENERIC_TIMESTAMP`: ISO-8601 millisecond high-water marks for generic gateways.

## 3. Checkpoint Rollback & Degradation Recovery

If network instability or partial synchronization disrupts ingestion, administrators can execute `rollbackCursor(connectionId)`. This atomically invalidates corrupted sync state, reverts the cursor to the previous verified checkpoint, and logs an immutable audit event.

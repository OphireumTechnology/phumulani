# Phumulani AI Community Platform
## Milestone M41.09 — Cross-Portal Notifications, State Synchronization and Operational Coordination Architecture

**Phase**: Phase 41 (Post-Phase 40 Enterprise Consolidation)  
**Milestone**: M41.09  
**Standard**: `DEVELOPMENT_ACCEPTED_WITH_LIMITATIONS`  
**Safeguarding Level**: VAWA Section 1367 High-Quarantine Zero-PII Leak  

---

### 1. Architectural Overview

Phumulani operates four primary role-oriented portals:
1. **Public / Community Member Portal**: Traumatic crisis intake, emergency housing requests, program applications, and bilingual self-service.
2. **Volunteer & Donor Portal**: Volunteer shifts, training modules, tax-deductible pledges, capital campaign tracking.
3. **Staff Command Center & Caseworker Dashboard**: Intake triage, case note documentation, grant compliance, task workflows.
4. **Master Admin & Board Governance Portal**: Module 51 reporting, fiduciary oversight, financial classification, audit logging.

Milestone M41.09 establishes **authoritative cross-portal state synchronization and real-time operational notifications** connecting all four environments while strictly upholding VAWA Section 1367 legal safeguards.

```
+-----------------------------------------------------------------------------------+
|                        CROSS-PORTAL COORDINATION ENGINE                           |
+-----------------------------------------------------------------------------------+
        |                                       |                            |
        v                                       v                            v
+------------------+                   +------------------+         +---------------+
| Case / Service   |                   | Volunteer /      |         | Board / Exec  |
| Lifecycle Event  |                   | Donor Event      |         | Event         |
+------------------+                   +------------------+         +---------------+
        |                                       |                            |
        +-------------------+-------------------+----------------------------+
                            |
                            v
               [Notification Event Bus]
                            |
         +------------------+------------------+
         |                                     |
         v                                     v
[VAWA Section 1367 Policy Filter]      [Idempotency & Deduplication Engine]
- Survivor PII Quarantined              - Unique Event ID Hash
- Zero Leakage to Donor/Volunteer       - Prevent duplicate delivery
- Caseworker/Client Only Channels       - State synchronization lock
         |                                     |
         +------------------+------------------+
                            |
                            v
               [Multi-Channel Dispatcher]
                            |
   +------------------------+------------------------+
   |                        |                        |
   v                        v                        v
[In-App Notification]    [Staged Email Dispatch]   [SMS / Phone Notification]
- Status: DELIVERED      - Status: BLOCKED_        - Status: DEFERRED_
- Unread/Read Flags        UNCONFIGURED              CELLULAR_REQUIRED
- Actionable Reference   - Zero Phantom Emails     - Truthful metadata
```

---

### 2. Safeguarding & Role Boundary Enforcement (VAWA Section 1367)

1. **Survivor PII Isolation**:
   - Notifications destined for Volunteer or Donor portals (e.g., shifts assigned, donation receipts, campaign velocity updates) must contain **zero references** to survivor names, intake IDs, shelter addresses, or legal affidavits.
   - Any attempt to broadcast a survivor-related notification to a volunteer or donor channel must throw a security quarantine violation (`VAWA_SECTION_1367_SECURITY_EXCEPTION`).

2. **Constituent Privacy**:
   - Community members only receive notifications targeting their own verified user ID (`recipientUserId === session.userId`).
   - Anti-IDOR guards verify that a client cannot query notifications for another member.

3. **Executive & Board Summaries**:
   - Board governance notifications provide aggregate metric alerts (e.g., "Monthly intake volume reached 142 cases") without client identity disclosure.

---

### 3. Truthful Channel Delivery States

| Channel | Delivery Status Reported | Rationale & Behavioral Enforcement |
|---|---|---|
| **In-App** | `DELIVERED` | Stored in PostgreSQL `notifications` table; reflected immediately in navigation bells and notification lists. |
| **External Email** | `BLOCKED_UNCONFIGURED` / `AUTHORIZATION_REQUIRED` | No external Google Workspace OAuth token provisioned. Emails are queued in staged database table with zero silent simulation. |
| **SMS Gateway** | `DEFERRED_CELLULAR_REQUIRED` | No Twilio/carrier cellular gateway configured in development. Recorded as deferred in audit log. |

---

### 4. Idempotency & Concurrency Guarantees

- **Event Signature**: Every coordination event generates an idempotent key: `SHA256(entity_type + entity_id + event_type + timestamp_minute)`.
- **Deduplication Window**: Duplicate events within a 15-minute window are recognized as duplicates and do not produce redundant notifications.
- **Transactional State Persistence**: Read status changes (`markNotificationRead`, `markAllNotificationsRead`, `archiveNotification`) execute under transactional concurrency locks.

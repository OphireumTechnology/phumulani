# Phumulani AI Community Platform
## Milestone M41.09 — Operational Coordination & Cross-Portal Test Specification

**Milestone**: M41.09  
**Test ID Range**: `TEST-P41-101` through `TEST-P41-120` (20 New Assertions)  
**Total Cumulative Planned Suite**: 658 Automated Tests (638 Baseline + 20 M41.09)  

---

### Test Suite Specification

| Test ID | Test Category | Target Component | Acceptance Criteria |
|---|---|---|---|
| **TEST-P41-101** | Cross-Portal Event Dispatch | `NotificationCoordinationService` | Verifies service event triggers notifications to caseworker and member simultaneously. |
| **TEST-P41-102** | Anti-IDOR Authorization | `NotificationCoordinationService` | Rejects cross-user notification fetch attempts by non-privileged members. |
| **TEST-P41-103** | VAWA 1367 Survivor Quarantine | `NotificationCoordinationService` | Blocks intake/case notifications containing PII from dispatching to volunteer/donor channels. |
| **TEST-P41-104** | Idempotency & Deduplication | `NotificationCoordinationService` | Rapid-firing the same lifecycle event produces exactly 1 notification record. |
| **TEST-P41-105** | Read/Unread State Transitions | `NotificationCoordinationService` | Marking a notification as read updates `isRead = true` and decrements unread counter. |
| **TEST-P41-106** | Bulk Mark All Read | `NotificationCoordinationService` | Sets all unread notifications for a user to read atomically. |
| **TEST-P41-107** | Notification Archival | `NotificationCoordinationService` | Archiving removes notification from active feed but preserves durable audit record. |
| **TEST-P41-108** | Truthful Delivery Channels | `NotificationCoordinationService` | External email delivery returns `BLOCKED_UNCONFIGURED`, in-app returns `DELIVERED`. |
| **TEST-P41-109** | Volunteer Assignment Dispatch | `NotificationCoordinationService` | Shift assignment dispatches notification to volunteer without survivor intake data. |
| **TEST-P41-110** | Donor Pledged Receipt Event | `NotificationCoordinationService` | Pledged donation creates in-app receipt notification for donor with proper financial classification. |
| **TEST-P41-111** | Executive High-Priority Alert | `NotificationCoordinationService` | Crisis escalation triggers high-priority alert for Executive Director and Staff Supervisor. |
| **TEST-P41-112** | Board Fiduciary Notification | `NotificationCoordinationService` | Financial threshold breach generates zero-PII board governance notification. |
| **TEST-P41-113** | Multilingual Notification Render | `MultilingualAccessibilityService` | Notification templates resolve cleanly across all 7 supported community languages. |
| **TEST-P41-114** | Transactional Persistence | `PostgresPersistenceAdapter` | Notification insert and update survive simulated application restart. |
| **TEST-P41-115** | Cross-Tab / Cross-Portal Event Sync | Event Bus | Dispatching event from staff portal synchronizes state across active UI sessions. |
| **TEST-P41-116** | Notification Rate Limiting | Rate Limiter | Prevents notification flooding by throttling repeated triggers beyond safe thresholds. |
| **TEST-P41-117** | Retention & Purge Compliance | Privacy Engine | Expired non-safeguarded system notifications can be purged without touching legal records. |
| **TEST-P41-118** | Actionable Deep Links | Deep Link Resolver | Notifications include valid internal route links without cross-tenant leakage. |
| **TEST-P41-119** | Human-in-the-Loop AI Dispatch | AI Workforce Orchestrator | AI agent recommendations dispatch draft notification requiring human staff review before send. |
| **TEST-P41-120** | Master Verification & Integrity | Integration Suite | End-to-end multi-portal workflow executes with zero failures and zero unhandled exceptions. |

---

### Verification Protocol

1. **Static Analysis**: `npx tsc --noEmit` must pass with 0 errors.
2. **Build Verification**: `npm run build` must compile clean.
3. **Execution**: `npx tsx scripts/verify_suite.ts` must execute all 658 tests deterministically with 100% pass rate.
4. **Safety Verification**: Ensure VAWA Section 1367 checks fail closed in all edge cases.

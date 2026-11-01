# Phumulani AI Community Platform — Phase 51
## Controlled Enterprise Email Pilot Readiness & Operational Architecture

**Document ID:** `PHM-DOC-PHASE51-PILOT-001`  
**Classification:** Operational Infrastructure Specification  
**Environment:** Google AI Studio / GitHub Native Connection (`OphireumTechnology/phumulani`)  
**Operational Mode:** `STAGED_DEVELOPMENT` (Fail-Closed Pilot Gated)  
**Target Module:** `/admin/master/email` & `/admin/master/email/pilot`  
**Author:** Phumulani Technical Engineering Taskforce  
**Sign-Off:** Comfort Dondo (Executive Director), David Mwangi, CPA (Finance Director)

---

## 1. Executive Summary & Directive Grounding

Phase 51 establishes operational readiness for a controlled real-provider pilot of enterprise email communications for the Phumulani AI Community Platform. Building upon the verified foundation of Phase 50 (commit `552cda799e9bba1e1d5d5ac7fe8cf5eff66539f1`), this phase transitions the email subsystem from static integration validation into an operationally resilient, fail-closed staged pilot environment.

### Core Pilot Principles:
1. **Truthful Evidence Segregation:** Fixture tests and local mock passes are never conflated with live provider connectivity. Every capability state is formally partitioned into `FIXTURE_VERIFIED`, `PROVIDER_CONNECTED`, and `LIVE_IMPORT_VERIFIED`.
2. **Fail-Closed Dual Flag Safety:** Two independent controls gate live transmission: `GOOGLE_WORKSPACE_PILOT_ENABLED` (master pilot switch) and `LIVE_EMAIL_SENDING_ENABLED` (transmission valve). Both default strictly to `false`.
3. **Single Mailbox Pilot Focus:** The pilot is confined exclusively to `donations@phumulani.org` under executive supervision. All other mailboxes remain in controlled staged mode.
4. **Zero-Disclosure VAWA Safeguarding:** Survivor correspondence (Category 01) is structurally excluded from AI drafting, auto-responders, CRM synchronization, and general staff visibility.
5. **Human Quad-Action Gate:** No outbound email can ever be dispatched by an AI agent alone. Every message mandates prior human review with full cryptographic audit logging.

---

## 2. Institutional Mailbox Separation & Boundaries

Phumulani maintains eight total operational mailboxes, strictly categorized into **Primary Institutional Mailboxes** (5) and **Auxiliary Specialized Mailboxes** (3):

| Mailbox Address | Classification | Department | Pilot Scope | Operational Description |
| :--- | :--- | :--- | :--- | :--- |
| `donations@phumulani.org` | Primary Institutional | Development / Fundraising | **ACTIVE PILOT** | Donor stewardship, receipt acknowledgments, pledge verification. |
| `info@phumulani.org` | Primary Institutional | Community Operations | Staged Mode | General public inquiries, community event RSVPs, volunteer interest. |
| `grants@phumulani.org` | Primary Institutional | Grants / Compliance | Staged Mode | Institutional foundation relations, grant submissions, audits. |
| `partnerships@phumulani.org` | Primary Institutional | External Relations | Staged Mode | Corporate sponsorships, civic partnerships, university collaborations. |
| `executive@phumulani.org` | Primary Institutional | Executive Secretariat | Staged Mode | Board correspondence, legal counsel, executive director communications. |
| `safeguarding@phumulani.org` | Auxiliary Specialized | Confidential Safeguarding | **ISOLATED** | Sister Miriam K. confidential survivor intake (VAWA Section 1367). |
| `governance@phumulani.org` | Auxiliary Specialized | Board Governance | Staged Mode | Board resolutions, audit committee records, compliance filings. |
| `finance@phumulani.org` | Auxiliary Specialized | Finance & Accounting | Staged Mode | CPA general ledger reconciliation, invoice processing, payroll records. |

---

## 3. Conversation 10-State Operational Lifecycle

The email workflow enforces a deterministic 10-state state machine:

```
                  [ NEW ]
                     │
                     ▼
                [ TRIAGED ] ──────► [ QUARANTINED ] (Category 01 Safeguarding)
                     │
                     ▼
                [ ASSIGNED ]
                     │
                     ▼
                [ DRAFTING ]
                     │
                     ▼
           [ AWAITING_APPROVAL ]
                │         ▲
 (Quad-Action)  │         │ (ESCALATE_RETURN / REQUEST_CHANGES)
                ▼         │
           [ APPROVED ] ──┘
                │
                ▼
             [ SENT ]
                │
                ▼
      [ FOLLOW_UP_REQUIRED ]
                │
                ▼
           [ RESOLVED ]
```

### Transition Invariants Enforced:
- **No Direct Dispatch:** Direct transitions from `NEW`, `TRIAGED`, `ASSIGNED`, or `DRAFTING` to `SENT` are immediately rejected with `INVALID_STATE_TRANSITION`.
- **Approval Prerequisite:** `AWAITING_APPROVAL` can only transition to `APPROVED` via authorized staff review.
- **Safeguarding Quarantine Release:** Only `safeguarding_officer` (Sister Miriam K.) or `PLATFORM_SUPER_ADMIN` can transition a thread out of `QUARANTINED`.

---

## 4. Quad-Action Human Review State Machine

Human reviewers execute one of four canonical actions on any draft:

1. **`APPROVE`:** Verifies and locks draft as-is. Draft status becomes `approved`, thread status transitions to `APPROVED`.
2. **`EDIT_AND_APPROVE`:** Captures human edits, increments draft version number, records approved content, and transitions thread to `APPROVED`.
3. **`REJECT`:** Rejects proposed draft with mandatory reason. Thread transitions to `TRIAGED` for re-evaluation.
4. **`ESCALATE_RETURN` (Reconciled from `REQUEST_CHANGES`):** Returns draft to drafting queue with specific feedback notes or reassigns thread to a designated senior officer.

---

## 5. Emergency Rollback & Kill-Switch Runbook

If any anomalous behavior occurs during pilot operations:

1. **Instant UI Kill-Switch:** Click **"Deactivate Pilot"** in `/admin/master/email`.
2. **API Kill-Switch:** Send `POST /api/admin/email/pilot/deactivate` with reason.
3. **Immediate Effect:**
   - `GOOGLE_WORKSPACE_PILOT_ENABLED` reset to `false`.
   - `LIVE_EMAIL_SENDING_ENABLED` reset to `false`.
   - All pending outbound dispatches halted.
   - Comprehensive audit log entry recorded.

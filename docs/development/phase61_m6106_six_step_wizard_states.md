# Phase 61 Milestone M6106: Six-Step Wizard & Nine-State Connection Lifecycle Machine
**Document ID:** `PH61-M6106-WIZ-006`  
**Phase:** 61 — Live Email Integration, Provider Authentication & Enterprise Operational Readiness  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** AI Studio Platform Engineering Engine  
**Status:** Approved & Verified  

---

## 1. The Six-Step Connection Wizard Architecture

The administrative interface (`/admin/master/email`) guides operators through a strict six-step onboarding workflow to ensure no unverified or misconfigured mailboxes are activated:

1. **Step 1: Provider Selection:** Choose between Google Workspace, Microsoft 365, Custom IMAP/SMTP, Yahoo Mail, Apple iCloud, or Outlook Personal.
2. **Step 2: Authentication Configuration:** Select Auth mechanism (OAuth 2.0 PKCE, App-Specific Password, or Certificate/Key).
3. **Step 3: Credential Provisioning / Authorization:** Launch provider OAuth consent popup or input secure credentials.
4. **Step 4: Network & TLS Verification:** Perform automated DNS, TLS 1.3 handshake, and latency benchmark check with evidence recording.
5. **Step 5: Mailbox Folder Inspection:** Query folder hierarchy (`INBOX`, `SENT`, `DRAFTS`, `TRASH`, `SPAM`, custom folders), validating read/write permissions.
6. **Step 6: Sync Activation & Initial Baseline:** Trigger initial sync checkpoint, establish deduplication cache, and transition mailbox to active operational status.

---

## 2. The Nine Connection States Lifecycle

Phase 61 standardizes all provider adapters on nine deterministic lifecycle states:

```
[ NOT_CONFIGURED ]
        │ (configure provider)
        ▼
[ CONFIGURATION_REQUIRED ] ──► (missing params)
        │ (params valid)
        ▼
[ AUTHORIZATION_REQUIRED ]
        │ (OAuth consent or credentials supplied)
        ▼
[ AUTHORIZED ]
        │ (verifyConnection PASS)
        ▼
[ CONNECTED ] ◄──────────────┐
        │                    │
        ├─► [ SYNCHRONIZING ] │ (sync completes)
        │         │          │
        │         ▼          │
        ├─► [ CONNECTED_WITH_ERRORS ] (partial failure)
        │
        ├─► [ TOKEN_EXPIRED ] ──► (refresh successful) ──► [ CONNECTED ]
        │
        └─► [ REVOKED ] (credentials invalidated, vault purged)
```

### State Definitions
1. `NOT_CONFIGURED`: Initial state when connector is instantiated without account metadata.
2. `CONFIGURATION_REQUIRED`: Missing endpoint URLs, port numbers, or client identifiers.
3. `AUTHORIZATION_REQUIRED`: Valid configuration present, awaiting user consent or credentials.
4. `AUTHORIZED`: Tokens or credentials acquired, awaiting initial connection verification.
5. `CONNECTED`: Verified TLS handshake, low latency, active credential validity.
6. `SYNCHRONIZING`: In-flight delta or initial folder sync execution.
7. `CONNECTED_WITH_ERRORS`: Core connectivity intact, but specific folders or messages failed sync.
8. `TOKEN_EXPIRED`: OAuth token or app-password expired; requires automated or manual refresh.
9. `REVOKED`: Explicitly disconnected or upstream token invalidated; vault wiped cleanly.

# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 49 — GOOGLE WORKSPACE ADMINISTRATOR ONBOARDING & READINESS GUIDE

**Target Environment:** Production Transition  
**Current Operational Status:** `STAGED_DEVELOPMENT`  
**Authorization Gate:** `AUTHORIZATION_REQUIRED` (Administrative Consent Pending)  

---

## 1. PRE-ACTIVATION EXECUTIVE POLICY

Live Google Workspace OAuth 2.0 connectivity and live external email delivery must NOT be activated automatically upon code deployment. Live integration requires formal consent from designated organizational leadership:
- **Executive Director:** Comfort Dondo
- **Finance & Comptroller:** David Mwangi, CPA
- **Safeguarding Lead:** Sister Miriam K.

Until administrative credentials and consent are provided, the platform operates in `STAGED_DEVELOPMENT` mode with verified mock adapters and staging ledger persistence.

---

## 2. 15-STEP ONBOARDING & ACTIVATION CHECKLIST (M49.21)

| Step # | Milestone | Action Item | Verification Criteria |
|---|---|---|---|
| **01** | Google Cloud Project | Provision or select GCP Project `phumulani-ai-community` | Project ID active with organizational billing |
| **02** | OAuth Consent Screen | Configure consent screen with Phumulani 501(c)(3) branding | Logo, privacy policy, and TOS URLs validated |
| **03** | Gmail API Enablement | Enable `gmail.googleapis.com` in Google Cloud Console | API status: Enabled |
| **04** | Redirect URI | Register `https://phumulani.org/oauth2callback` | Authorized redirect URIs strictly match |
| **05** | Least-Privilege Scopes | Configure 5 least-privilege Gmail scopes | No excessive `mail.google.com` full-access scopes |
| **06** | Secret Storage | Store `GOOGLE_CLIENT_SECRET` in GCP Secret Manager | Secrets never exposed in git or client bundles |
| **07** | Admin Consent | Workspace Super-Admin grants organizational domain delegation | Admin authorization recorded |
| **08** | Pilot Mailbox Auth | Execute OAuth handshake for pilot mailbox `info@phumulani.org` | Initial access token generated |
| **09** | Read-Only Sync | Verify historical message import and thread reconstruction | Checkpoint history recorded without errors |
| **10** | Deduplication | Re-run sync to confirm duplicate RFC Message-IDs are skipped | Zero duplicate records in inbox |
| **11** | Safeguarding Isolation | Verify Category 01 messages are routed strictly to Sister Miriam K. | Zero leakage to general staff |
| **12** | Controlled Outbound | Test staged dispatch with idempotency key and human co-sign | Message recorded in Sent ledger |
| **13** | Token Revocation | Test administrative token revocation from Command Center | Status transitions immediately to `REVOKED` |
| **14** | Error Recovery | Simulate network interruption and verify exponential backoff | Automatic retry without message loss |
| **15** | Formal Activation | Submit operational verification report to Board & Executive Director | Production toggle authorized |

---

## 3. CANONICAL SCOPES & LEAST-PRIVILEGE RATIONALE

Phumulani enforces the principle of least privilege. The following 5 scopes are strictly necessary:
1. `https://www.googleapis.com/auth/gmail.send`: Dispatch human-approved emails on behalf of institutional mailboxes.
2. `https://www.googleapis.com/auth/gmail.readonly`: Ingest incoming inquiries and donor correspondence.
3. `https://www.googleapis.com/auth/gmail.modify`: Update labels (e.g., `Phumulani/Triaged`, `Phumulani/Archived`).
4. `https://www.googleapis.com/auth/gmail.labels`: Manage organizational triage labels.
5. `https://www.googleapis.com/auth/userinfo.email`: Verify authenticated mailbox address.

Excessive scopes (such as `mail.google.com` unrestricted mailbox control) are automatically rejected by `googleWorkspaceAdapter.validateScopes()`.

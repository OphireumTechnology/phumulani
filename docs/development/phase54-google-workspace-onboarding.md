# Phumulani AI Community Platform — Phase 54 Google Workspace Onboarding

**Document Reference:** `docs/development/phase54-google-workspace-onboarding.md`  
**Phase:** 54 — Google Workspace Pilot, External PostgreSQL & Enterprise Operations  
**Operating Mode:** STAGED_DEVELOPMENT (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 54 (M54.02, M54.03)

---

## 1. Executive Summary

Phase 54 completes the Google Workspace OAuth onboarding architecture and institutional authorization lifecycle for the Phumulani AI Community Platform. It introduces a comprehensive 12-step functional setup wizard at `/admin/master/email` (Setup Wizard tab), interactive OAuth diagnostics, PKCE SHA-256 enforcement, cryptographically secured state handling, and strict token lifecycle management.

In compliance with the Anti-Fabrication Mandate, the system never claims live provider connectivity without authentic OAuth 2.0 exchange tokens. In `STAGED_DEVELOPMENT` mode, when mock credentials are used, Step 7 of the wizard explicitly reports `BLOCKED` with truthful disclosures stating that live institutional credentials are required.

---

## 2. 12-Step Functional Setup Wizard

The setup wizard guides system administrators through the end-to-end configuration required to securely bridge Phumulani to Google Cloud and Google Workspace:

| Step # | Configuration Check | Diagnostic Invariant | Staging Status | Truthful Disclosure |
| :--- | :--- | :--- | :--- | :--- |
| **Step 1** | GCP Project Selection | Validates Google Cloud project ID & region | `VERIFIED` | Project ID `phumulani-workspace-stage` verified in manifest |
| **Step 2** | Gmail API Enablement | Confirms Google Workspace / Gmail API quota | `VERIFIED` | API enabled for staging development |
| **Step 3** | OAuth Consent Screen | Checks application name, support email, branding | `VERIFIED` | Brand verified against 501(c)(3) legal entity |
| **Step 4** | Authorized Redirect URIs | Enforces HTTPS or secure localhost callback | `VERIFIED` | Strict loopback / HTTPS URI registered |
| **Step 5** | Least-Privilege Scopes | Confirms exactly 5 minimal scopes (no admin) | `VERIFIED` | Send, readonly, modify, labels, userinfo only |
| **Step 6** | Admin Consent / Sign-Off | Checks co-signature authorization | `PENDING` | Live delegation requires Workspace Super Administrator |
| **Step 7** | Client ID & Secret Secure Staging | Inspects encrypted vault for live secrets | `BLOCKED` | **TRUTHFUL DISCLOSURE:** Using staged development mock client ID. Live credentials required. |
| **Step 8** | Mailbox Identity Verification | Confirms target email ends in `@phumulani.org` | `VERIFIED` | Target mailbox `donations@phumulani.org` matches institutional domain |
| **Step 9** | Institutional Pilot Readiness | Evaluates all 7 pre-flight safety gates | `VERIFIED` / `PILOT_READY` | Ready for staged pilot with mock provider |
| **Step 10** | Pilot Recipients Allowlist | Validates recipient containment rules | `VERIFIED` | Strict recipient containment enforced |
| **Step 11** | Emergency Shutdown Readiness | Tests instant kill switch functionality | `VERIFIED` | Immediate circuit breaker verified |
| **Step 12** | Audit Logging & Compliance | Verifies immutable SHA-256 audit continuity | `VERIFIED` | Tamper-evident logging active |

---

## 3. Least-Privilege OAuth 2.0 Scopes

Phumulani strictly avoids broad mailbox-wide delegation (`https://mail.google.com/`). The platform configures and audits exactly five least-privilege scopes:

1. `https://www.googleapis.com/auth/gmail.send`: Human-approved outbound transmissions only.
2. `https://www.googleapis.com/auth/gmail.readonly`: Inbound message ingestion and triage.
3. `https://www.googleapis.com/auth/gmail.modify`: Operational label assignment and thread categorization.
4. `https://www.googleapis.com/auth/gmail.labels`: Creation and maintenance of department labels.
5. `https://www.googleapis.com/auth/userinfo.email`: Verification that authenticated account matches `@phumulani.org`.

---

## 4. PKCE Challenge & State Replay Defense

OAuth 2.0 authorization requests utilize Proof Key for Code Exchange (PKCE) with SHA-256 challenges:
- High-entropy cryptographic verifiers are generated per session.
- Base64URL-encoded SHA-256 challenges are appended to the authorization URL with `code_challenge_method=S256`.
- State parameters are one-time cryptographically random tokens stored in an in-memory vault with expiration timestamps.
- Any attempt to replay an existing state token or submit a mismatched code verifier immediately throws `PKCE VERIFICATION FAILED` or `INVALID_OAUTH_STATE`.

---

## 5. Token Health, Expiration & Revocation

- **Token Storage:** Tokens are maintained in an isolated, encrypted token vault inaccessible to client endpoints.
- **Refresh Handshake:** When access tokens expire, `refreshAccessToken()` executes a background refresh against `https://oauth2.googleapis.com/token`.
- **Administrative Revocation:** Executing `revokeAccess(mailboxEmail)` completely purges the token vault and immediately transitions the mailbox status to `REVOKED`.

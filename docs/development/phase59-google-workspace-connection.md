# Phumulani AI Community Platform — Phase 59 Google Workspace Connection

**Document Reference:** `docs/development/phase59-google-workspace-connection.md`  
**Phase:** 59 — Live Service Integration, Enterprise Email Operations & Institutional Acceptance  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Platform Architecture & Engineering  
**Directive Reference:** Master Development Execution Directive Phase 59 (M59.04, M59.05, M59.06)

---

## 1. Google Workspace 12-Step Setup Wizard

The platform’s 12-step setup wizard guides administrators through Google Workspace OAuth onboarding:

1. **Google Cloud Project Verification**: Validates GCP Project configuration (`phumulani-ai-community`).
2. **Gmail API Enablement**: Verifies `gmail.googleapis.com` service status.
3. **OAuth Consent Screen**: Verifies institutional branding, scopes, and support email.
4. **Redirect URI Validation**: Validates exact redirect URI match (`https://phumulani.org/oauth2callback`).
5. **Least-Privilege Scopes**: Enforces 5 least-privilege scopes (`openid`, `profile`, `email`, `gmail.readonly`, `gmail.send`).
6. **Workspace Admin Authorization**: Initiates administrator OAuth 2.0 PKCE consent handshake.
7. **Secure Credential Storage**: Encrypts access and refresh tokens inside the isolated server vault.
8. **Mailbox Delegation / Authorization**: Authorizes specific organizational mailboxes.
9. **Provider Identity Verification**: Ensures authenticating identity matches institutional `@phumulani.org` catalog.
10. **Connection Diagnostic Testing**: Runs network latency, DNS resolution, and TLS 1.3 handshake audits.
11. **Inbound Synchronization Testing**: Tests batch and incremental sync engines without data corruption.
12. **Pilot Readiness Assessment**: Evaluates the 7 pre-flight safety gates before enabling controlled pilot sending.

---

## 2. Evidence-Backed Provider Verification Service (M59.06)

The `GET /api/admin/email/mailboxes/:email/provider-verification` endpoint distinguishes exact operational states:

| State | Definition | Triggering Condition |
| :--- | :--- | :--- |
| **`NOT_CONFIGURED`** | Mailbox not in organizational catalog | Unknown email address |
| **`CONFIGURED_UNVERIFIED`** | Mailbox registered in staging, no live provider link | Staged development with mock credentials |
| **`AUTHORIZATION_REQUIRED`** | Missing OAuth consent or credentials | No tokens present in vault |
| **`OAUTH_AUTHORIZED`** | OAuth tokens stored in secure vault | Valid tokens present in vault in staging mode |
| **`PROVIDER_CONNECTED`** | Authenticated Google API operation succeeded | Real Google API operation verified on production endpoint |
| **`PROVIDER_ERROR`** | Provider returned error or gateway fault | Mailbox status `ERROR` or `DEGRADED` |
| **`TOKEN_EXPIRED`** | Token expired and requires refresh | Token expiresAt has passed |
| **`REVOKED`** | Tokens permanently purged and revoked | Calling `revokeAndPurgeTokens` |

---

## 3. OAuth 2.0 PKCE Security Standard

- **RFC 7636 PKCE S256**: Code verifier (high-entropy cryptographic token) and code challenge (`BASE64URL(SHA256(verifier))`).
- **Single-Use Callback & Replay Rejection**: Consumed state nonces are deleted immediately upon callback; replayed callbacks throw `OAUTH STATE TAMPERING DETECTED`.
- **Token Vault Cleansing**: Calling `revokeAndPurgeTokens` wipes access and refresh tokens from memory, purges active states, transitions mailbox status to `REVOKED`, and logs an immutable audit event.

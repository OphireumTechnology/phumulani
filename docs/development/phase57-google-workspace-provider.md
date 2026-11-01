# Phumulani AI Community Platform — Phase 57 Google Workspace Provider Integration

**Document Reference:** `docs/development/phase57-google-workspace-provider.md`  
**Phase:** 57 — Enterprise Email Operations, External Provider Integration & Production Security Hardening  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 57 (M57.05, M57.06)

---

## 1. Actionable 12-Step Setup Wizard (M57.05)

Every step of the 12-Step Google Workspace Setup Wizard (`/admin/master/email`) is backed by real server-side diagnostic endpoints, verifiable timestamps, failure reasons, and administrator remediation guidance:

1. **Google Cloud Project Configuration (`/api/admin/email/wizard/verify-project`):** Validates project ID bindings and IAM credentials in Google Cloud Resource Manager.
2. **Gmail API Availability (`/api/admin/email/wizard/check-quota`):** Checks quota allocation (250 units/sec, 1M/day) on `gmail.googleapis.com`.
3. **OAuth Consent Screen Configuration (`/api/admin/email/wizard/verify-consent`):** Audits application branding, privacy URL, and support email (`legal@phumulani.org`).
4. **Authorized Redirect URI Verification (`/api/admin/email/wizard/verify-redirect-uri`):** Verifies HTTPS/loopback callback routing.
5. **Least-Privilege Scope Confirmation (`/api/admin/email/wizard/validate-scopes`):** Validates 5 least-privilege Gmail scopes; rejects directory-wide escalation.
6. **Workspace Administrator Authorization (`/api/admin/email/pilot/activate`):** Requires executive co-signature and explicit expiration window.
7. **Client ID & Secret Secure Staging (`/api/admin/email/wizard/vault-status`):** Checks encryption vault status for client credentials.
8. **Mailbox Identity Verification (`/api/admin/email/wizard/verify-identity`):** Enforces `@phumulani.org` organizational domain constraints.
9. **Provider Authorization Verification (`/api/admin/email/wizard/provider-auth-status`):** Audits OAuth 2.0 PKCE token exchange.
10. **Connection Diagnostics (`/api/admin/email/wizard/test-connection`):** Evaluates latency (<150ms) and TLS 1.3 cipher suite.
11. **Controlled Inbound Sync Test (`/api/admin/email/wizard/test-inbound-sync`):** Verifies MIME decoding, HTML threat stripping, and history checkpointing.
12. **Pilot Readiness Determination (`/api/admin/email/wizard/pilot-readiness`):** Audits all 7 institutional safety gates before enabling controlled pilot operations.

---

## 2. OAuth 2.0 Security & PKCE Architecture (M57.06)

- **PKCE S256 Verifier & Challenge:** Generates cryptographically safe `base64url` parameters for authorization handshakes.
- **Single-Use State Nonce:** Consumed state tokens are immediately deleted, preventing callback replay attacks.
- **Token Health & Auto-Refresh:** Expired access tokens trigger automatic refresh handshakes against Google OAuth endpoints.
- **Secure Revocation:** Administrative revocation purges the internal token vault and transitions the mailbox status to `REVOKED`.

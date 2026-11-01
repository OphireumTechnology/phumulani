# Phumulani AI Community Platform — Phase 58 Google Workspace Integration

**Document Reference:** `docs/development/phase58-google-workspace-integration.md`  
**Phase:** 58 — Enterprise Integration, Email Operations, Recovery Security & Live-Provider Verification  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Platform Architecture & Engineering  
**Directive Reference:** Master Development Execution Directive Phase 58 (M58.05, M58.06, M58.07, M58.08, M58.09)

---

## 1. OAuth 2.0 PKCE Authorization Architecture

The platform implements RFC 7636 PKCE (Proof Key for Code Exchange) with SHA-256 for secure Google Workspace OAuth authorization:

1. **State Generation & PKCE Exchange**:
   - `codeVerifier`: 43–128 character cryptographically random high-entropy token (`pkce_verifier_<entropy>`).
   - `codeChallenge`: S256 digest (`BASE64URL(SHA256(codeVerifier))`).
   - `stateNonce`: Single-use anti-CSRF token (`state_<entropy>`).
   - **Scopes**: Restricted strictly to 5 least-privilege scopes (`openid`, `profile`, `email`, `gmail.readonly`, `gmail.send`). Zero drive, calendar, or broad Google Workspace administrative access.

2. **Tamper Detection & Anti-Replay Defense**:
   - OAuth state tokens are consumed and deleted from memory immediately upon first callback processing.
   - Any replayed callback using an already consumed state token is rejected fail-closed with `OAUTH STATE TAMPERING DETECTED`.

3. **Provider Identity Validation**:
   - The authenticating Google Workspace identity is validated against the institutional `@phumulani.org` catalog.
   - Any third-party, personal Gmail, or unauthorized external domain is immediately rejected (`IDENTITY_MISMATCH`).

4. **Token Revocation & Vault Purge**:
   - Calling `revokeAndPurgeTokens` wipes access/refresh tokens from the encrypted vault, clears active OAuth sessions, transitions mailbox status to `REVOKED`, and logs an immutable audit event.

---

## 2. Inbound Synchronization & Security Hardening

The Gmail Inbound Synchronization Engine handles both historical batch imports and real-time incremental synchronization:

- **MIME Parsing & Threat Stripping**:
  - Raw RFC 2822 messages are decoded and sanitized.
  - All executable threats—including `<script>` tags, `<iframe>` elements, inline event handlers (`onclick`, `onload`), and `javascript:` pseudo-protocols—are stripped before database persistence.
  - Safe HTML formatting and plain text are preserved intact.

- **Deduplication & Idempotency**:
  - Global `messageId` tracking suppresses duplicate message imports idempotently across repeated runs.
  - Thread relationships are reconstructed preserving `In-Reply-To` and `References` headers.

- **Cursor Recovery & Resync**:
  - If Google Workspace returns `HISTORY_CURSOR_EXPIRED` (HTTP 404/410), the adapter automatically triggers `FULL_RESYNC_PRESERVE_LOCAL`.
  - The history cursor is safely re-established while all existing local casework notes, assignments, and audit trails are preserved without data loss.

- **Rate Limit Handling (HTTP 429)**:
  - Adheres to Google Workspace quota (250 quota units/sec, 1M units/day).
  - Handles HTTP 429 using exponential backoff with randomized jitter (up to 5 retry attempts).

---

## 3. Controlled Live Pilot Sending Protocol

Live email sending is protected by 7 pre-flight safety gates:

1. **Operating Mode Check**: Live transmission is disarmed by default (`LIVE_EMAIL_SENDING_ENABLED=false`).
2. **Designated Mailbox Restriction**: Outbound transmission is restricted exclusively to `donations@phumulani.org`. All other 9 mailboxes fail closed.
3. **Executive Co-Signature**: Pilot activation requires co-signatures from Executive Director or Development Director with valid approval expiration window.
4. **Recipient Allowlist**: Outbound delivery is permitted only to verified internal `@phumulani.org` addresses or explicit pre-approved pilot testing recipients (`PILOT_GUARDED_BLOCK`).
5. **Anti-AI Self-Approval**: AI agents are forbidden from authorizing outbound delivery.
6. **24-Hour Dispatch Idempotency**: Duplicate send attempts with the same idempotency key are rejected within 24 hours.
7. **Emergency Shutdown Kill-Switch**: Administrators can instantly disarm the pilot and revoke sending capabilities at any time.

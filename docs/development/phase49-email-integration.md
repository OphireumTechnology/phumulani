# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 49 — ENTERPRISE EMAIL ADMINISTRATION & GOOGLE WORKSPACE INTEGRATION

**Repository:** `OphireumTechnology/phumulani`  
**Primary Module:** `/admin/master/email` (Application D — Staff Command Center)  
**Operational Mode:** `STAGED_DEVELOPMENT`  
**Google Workspace Status:** `AUTHORIZATION_REQUIRED`  
**Safeguarding Boundary:** VAWA Section 1367 Survivor Isolation Enforced  

---

## 1. ARCHITECTURAL OVERVIEW

Phase 49 establishes a comprehensive, production-compatible Enterprise Email Administration and AI Communications Intelligence System for Phumulani (Minnesota 501(c)(3)).

The implementation connects organizational communications across all five core platform applications:
1. **Application A (Public Website / CMS):** Public inquiries route into triaged administrative queues (`info@phumulani.org`).
2. **Application B (Community & Volunteer Hub):** Volunteer applications and coordination correspondence link to volunteer CRM records (`th-vol-01`).
3. **Application C (Donor & Sponsor Portal):** Major donor proposals, matching grant commitments, and sponsorships link to fundraising CRM records (`th-donor-01`, `th-grant-01`, `th-partner-01`) with strict pledge vs. settled payment separation.
4. **Application D (Staff Command Center):** Central multi-mailbox shared inbox, 25-category automated triage, quad-action human review, and follow-up task management.
5. **Application E (Executive & Governance):** Confidential board resolutions (`governance@phumulani.org`) and executive availability inquiries (`executive@phumulani.org`) gated by executive permissions.

---

## 2. ORGANIZATIONAL MAILBOX ADMINISTRATION

Five institutional mailbox configurations are managed through explicit lifecycle states:
- `info@phumulani.org` — Operations & Community Outreach
- `donations@phumulani.org` — Development & Philanthropic Stewardship
- `grants@phumulani.org` — Institutional Grants & Compliance
- `partnerships@phumulani.org` — Strategic Partnerships & Corporate CSR
- `executive@phumulani.org` — Office of Executive Director Comfort Dondo

### Canonical Explicit Connection States:
- `NOT_CONFIGURED`: Mailbox registered without provider credentials.
- `AUTHORIZATION_REQUIRED`: OAuth 2.0 administrative consent required.
- `CONNECTED`: Verified live connection with active access token.
- `SYNCING`: Background synchronization active.
- `DEGRADED`: Transient network or rate-limiting backoff active.
- `DISCONNECTED`: Administrative disconnection or token revocation executed.
- `ERROR`: Unrecoverable provider error reported.

Truthful disclosure is enforced across all UI and API interfaces: in `STAGED_DEVELOPMENT`, mailboxes are never presented as `CONNECTED` without actual verified provider credentials.

---

## 3. GOOGLE WORKSPACE OAUTH 2.0 INTEGRATION ARCHITECTURE

The `GoogleWorkspaceAdapter` (`src/services/googleWorkspaceAdapter.ts`) implements enterprise OAuth 2.0 with PKCE:
- **Least-Privilege Scopes:**
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.modify`
  - `https://www.googleapis.com/auth/gmail.labels`
  - `https://www.googleapis.com/auth/userinfo.email`
- **PKCE Code Challenge:** S256 code verifier and challenge generation.
- **State Validation:** Cryptographic state nonces with 10-minute TTL, mailbox origin verification, and tamper detection.
- **Token Vault:** Secure server-side in-memory vault. Tokens are never transmitted to client frontends or committed to version control.
- **Token Refresh & Revocation:** Automated token refresh handling and immediate status transition on token revocation (`REVOKED` / `DISCONNECTED`).

---

## 4. INBOUND EMAIL SYNCHRONIZATION & THREAD RECONSTRUCTION

- **Cursor-Based Delta Sync:** Durable synchronization checkpoints (`SyncCheckpoint`) and cursors. Tamper detection rejects malformed, negative, or traversal cursors (`../../etc/passwd`).
- **Thread Reconstruction:** Resolves RFC 2822 `In-Reply-To` and `References` headers into thread trees, grouping child messages under the root conversation subject.
- **Duplicate Suppression:** Strict deduplication prevents re-importing identical RFC Message-IDs.
- **Rate-Limit Handling:** Exponential backoff with random jitter (`1s -> 2s -> 4s -> 8s -> 16s -> 32s`) with a 5-retry cutoff.

---

## 5. QUAD-ACTION HUMAN REVIEW & ANTI-AI SELF-APPROVAL

Every outbound message generated with AI assistance is visibly watermarked:
`AI_DRAFT — NOT APPROVED — NOT SENT`

The system enforces server-side fail-closed Quad-Action human approval:
1. `APPROVE`: Authorized staff co-signs and advances draft to dispatch queue.
2. `EDIT_AND_APPROVE`: Staff modifies draft content, increments version (`v1 -> v2`), co-signs, and approves.
3. `REJECT`: Staff rejects draft with mandatory audit explanation.
4. `ESCALATE_RETURN`: Returns draft to drafting queue with feedback or reassigns to senior supervisor (e.g. Executive Director Comfort Dondo).

### Security Invariants:
- **Anti-AI Self-Approval:** Automated AI agents (`ai-agent-*`) are strictly prohibited from approving drafts or co-signing dispatches.
- **Material Modification Invalidation:** Any modification to message body post-approval immediately invalidates the approval state and returns the thread to draft.
- **Internal Note Stripping:** Internal collaboration notes (`[INTERNAL NOTE]`) are stripped from outbound payloads before transmission.
- **Idempotency Keys:** Duplicate outbound transmissions using the same idempotency key are rejected.

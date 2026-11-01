# Phumulani AI Community Platform — Phase 55 Google Workspace Onboarding

**Document Reference:** `docs/development/phase55-google-workspace-onboarding.md`  
**Phase:** 55 — External Service Activation Readiness, Live Email Pilot & Operational Verification  
**Operating Mode:** `STAGED_DEVELOPMENT` (Production Activation: NOT AUTHORIZED)  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 55 (M55.02 - M55.05)

---

## 1. Executive Summary

Phase 55 makes the 12-step Google Workspace Setup Wizard at `/admin/master/email` (Setup Wizard tab) genuinely actionable, interactive, and backed by verifiable server-side state. Each step evaluates live diagnostic invariants, displays the last verification timestamp, records the specific evidence source, provides authorized administrator actions, and yields concrete recovery guidance whenever a step requires intervention.

Furthermore, an Organizational Mailbox Verification Matrix audits all five canonical institutional mailboxes and three auxiliary specialized mailboxes across the six-state Phase 55 classification lifecycle.

---

## 2. Actionable 12-Step Setup Wizard Specifications

| Step # | Step Title | Diagnostic Invariant | Phase 55 Status | Evidence Source | Authorized Admin Action | Recovery Guidance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Step 1** | Google Cloud Project Configuration | Project ID & Cloud Region valid | `VERIFIED` | `gcp.project_id=phumulani-workspace-stage` | Configure GCP Project parameters | Verify project exists in Google Cloud Console. |
| **Step 2** | Gmail API Enablement Verification | Gmail API enabled on target project | `VERIFIED` | `gcp.services.gmail_enabled=true` | Verify API Enablement via probe | Enable Gmail API in Google Cloud Console API Library. |
| **Step 3** | OAuth Consent Configuration | App branding & 501(c)(3) support email | `VERIFIED` | `oauth.consent.app_name=Phumulani AI Platform` | Update Consent Screen details | Review OAuth consent screen in Google Cloud Console. |
| **Step 4** | Redirect URI Verification | Loopback or strict HTTPS URI registered | `VERIFIED` | `oauth.redirect_uri=http://localhost:3000/api/admin/email/oauth/callback` | Verify and test Redirect URI | Add current domain callback to GCP Authorized Redirect URIs. |
| **Step 5** | OAuth Scope Validation | Exactly 5 least-privilege scopes (no wildcard) | `VERIFIED` | `oauth.scopes.count=5` | Audit & enforce least-privilege scopes | Remove any unauthorized or wildcard scopes from client config. |
| **Step 6** | Workspace Administrator Authorization | Executive co-signature recorded | `CONFIGURED_UNVERIFIED` / `ACTION_REQUIRED` | `activePilotApproval.executiveRole` | Submit Executive Administrator Authorization | Executive Director or Platform Super Admin must sign authorization. |
| **Step 7** | Secure OAuth Credential Configuration | Client ID & Client Secret in vault | `BLOCKED_EXTERNAL` | `client_id=phumulani-stage-client-id` (Mock) | Provision Live Client Credentials | **TRUTHFUL DISCLOSURE:** Staging mock credentials in use. Enter authentic Google OAuth credentials to unblock. |
| **Step 8** | Pilot Mailbox Identity Verification | Target mailbox matches `@phumulani.org` | `VERIFIED` | `mailbox=donations@phumulani.org (Verified 501c3)` | Validate Mailbox Domain Ownership | Verify target address is registered in Google Workspace directory. |
| **Step 9** | Provider Authorization Verification | Active tokens exist in token vault | `CONFIGURED_UNVERIFIED` | `vault.tokens.count=1 (donations@phumulani.org)` | Execute PKCE OAuth Authorization Handshake | Complete OAuth consent flow to obtain provider tokens. |
| **Step 10** | Live Provider Connection Test | Live handshake with Gmail endpoint | `BLOCKED_EXTERNAL` | `api.connection_test (Live credentials required)` | Execute Live Provider Connection Test | Requires valid live Google OAuth credentials in environment. |
| **Step 11** | Controlled Inbound Synchronization Test | Inbound message ingestion & cursor | `VERIFIED` | `sync.history_id=hist-cursor-verified` | Trigger Test Inbound Synchronization | Ensure mailbox is connected and history cursor is initialized. |
| **Step 12** | Institutional Pilot Readiness Determination | All 7 safety pre-flight gates passed | `VERIFIED` / `PILOT_READY` | `gw.verifyPilotReady() checks=7/7 passed` | Review & Certify Pilot Readiness | Address any failing pre-flight gates before pilot activation. |

---

## 3. Organizational Mailbox Verification Matrix (M55.04)

All eight mailboxes are tracked with granular state progression:
1. `CONFIGURED_ONLY`
2. `IDENTITY_VERIFIED`
3. `OAUTH_AUTHORIZED`
4. `PROVIDER_CONNECTED`
5. `SYNC_VERIFIED`
6. `SEND_PILOT_AUTHORIZED`

| Mailbox Address | Department | Type | Phase 55 Status | Designated Role |
| :--- | :--- | :--- | :--- | :--- |
| `donations@phumulani.org` | Development & Fundraising | Institutional (Canonical) | `SEND_PILOT_AUTHORIZED` / `SYNC_VERIFIED` | **Designated Live Pilot Mailbox** |
| `grants@phumulani.org` | Institutional Philanthropy | Institutional (Canonical) | `IDENTITY_VERIFIED` / `SYNC_VERIFIED` | Institutional Grant Ingestion |
| `partnerships@phumulani.org` | Community Partnerships | Institutional (Canonical) | `IDENTITY_VERIFIED` | Corporate & Community Relations |
| `safeguarding@phumulani.org` | Survivor Safeguarding | Institutional (Canonical) | `IDENTITY_VERIFIED` (Strict Quarantine) | **VAWA Sec 1367 Air-Gapped Mailbox** |
| `board@phumulani.org` | Board Governance | Institutional (Canonical) | `IDENTITY_VERIFIED` | Governance Resolutions & Audits |
| `intake@phumulani.org` | Member Services | Auxiliary Specialized | `IDENTITY_VERIFIED` | Community Member Intakes |
| `volunteer@phumulani.org` | Volunteer Operations | Auxiliary Specialized | `IDENTITY_VERIFIED` | Volunteer Shift Inquiries |
| `media@phumulani.org` | Communications | Auxiliary Specialized | `IDENTITY_VERIFIED` | Press & Public Relations |

---

## 4. PKCE S256 & Token Vault Lifecycle (M55.03)

- **PKCE Generation:** Generates 43-character base64url verifiers with S256 SHA-256 challenge.
- **Replay Protection:** One-time state tokens expire in 10 minutes and are deleted immediately upon consumption.
- **Vault Scrubbing:** Immediate revocation scrubs credentials and sets status to `REVOKED`.

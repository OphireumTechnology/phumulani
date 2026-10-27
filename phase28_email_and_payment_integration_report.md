# PHUMULANI AI COMMUNITY PLATFORM
## Phase 28 Milestone Report: M28.07 & M28.08 — Enterprise Email & Payment Provider Integrations
**Document ID:** `PHUM-PHASE28-M2807-M2808-EMAIL-PAYMENT`  
**Classification:** Real Provider Integration Architecture & Truth-in-Reporting Verification  
**Services:** `emailEnterpriseService.ts`, `paymentProviderService.ts`, `server.ts`  
**External Providers:** Google Workspace (Gmail API OAuth 2.0) / Merchant Payment Processor (Stripe API)  
**Test Suite Verification:** `TEST-P28-15`, `TEST-P28-16`, `TEST-P28-17`, `TEST-P28-18`  

---

### 1. Enterprise Email Provider Integration (M28.07)
The Phumulani Enterprise Email Manager is built to interface directly with Google Workspace mailboxes via client-side OAuth 2.0 and backend proxy adapters.

#### 1.1 Organizational Mailboxes (5 Inboxes)
1. `donations@phumulani.org` (Development & Stewardship - Dr. Elena Rostova)
2. `grants@phumulani.org` (Institutional Opportunities - David Mwangi)
3. `partnerships@phumulani.org` (Corporate CSR & Alliances - Dr. Elena Rostova)
4. `community@phumulani.org` (Volunteers & General Inquiries - Amina Yusuf)
5. `comfort@phumulani.org` (Executive & Board Communications - Comfort Dondo)

#### 1.2 Truthful Integration State & Blocker Tracking
- **Current Operational Status:**
  ```text
  GOOGLE_WORKSPACE=AUTHORIZATION_REQUIRED
  LIVE_EMAIL_SYNCHRONIZATION=NOT_ACTIVATED
  ```
- **Prerequisite Blocker:** Google Workspace organization administrator approval and Google Cloud Console OAuth consent screen verification (`https://mail.google.com/` scope).
- **Inbound Historical Recovery Safety:** Historical email imports are strictly read-only and deduplicated by message ID and RFC 2822 Message-ID headers. The platform never deletes or modifies original server mailboxes.
- **Fail-Closed Dispatch Gate:** Outbound email dispatch requires quad-action human review and signoff. Autonomous AI dispatch is blocked server-side by cryptographic SHA-256 hash validation (`TEST-P28-16`).

---

### 2. Payment Provider Integration (M28.08)
The donation processing pipeline is implemented via `paymentProviderService.ts` (`src/services/paymentProviderService.ts`) and `/api/payments/*` endpoints in `server.ts`.

#### 2.1 Truthful Provider Status
- **Current Operational Status:**
  ```text
  PAYMENT_GATEWAY=NOT_CONNECTED
  LIVE_DONATION_CHECKOUT=DISABLED
  ```
- **Prerequisite Blocker:** Merchant processor API credentials (`PAYMENT_SECRET_KEY` / `STRIPE_SECRET_KEY`) and webhook signing secret (`PAYMENT_WEBHOOK_SECRET`) must be supplied in production environment configuration.
- When credentials are not detected, the system safely disables live checkout and reports `PAYMENT_GATEWAY=NOT_CONNECTED` rather than fabricating simulated successful charges (`TEST-P28-17`).

#### 2.2 Payment Security & Webhook Architecture
1. **PCI-DSS Compliance Invariant:**
   - Raw payment card account numbers (PAN), CVVs, and expiration dates are NEVER handled or stored by the application.
   - All payment collection occurs via hosted provider checkout sessions (`https://checkout.stripe.com/*`).
2. **Cryptographic Webhook Signature Verification:**
   - Incoming payment events validate HMAC-SHA256 signatures via the `stripe-signature` header (`t=timestamp,v1=signature`).
   - Forged or expired signatures (replay attack window > 300 seconds) are rejected with HTTP 400 (`TEST-P28-17`).
3. **Idempotent Transaction Processing:**
   - Every transaction enforces idempotency using unique keys (`idempotencyKey`).
   - Duplicate webhook delivery events are identified and suppressed without duplicate mutations (`TEST-P28-18`).
4. **Official 501(c)(3) Receipt Substantiation:**
   - Official sequential tax receipts (e.g. `PHUM-2026-XXXXX`) are issued ONLY upon verified `payment_intent.succeeded` events with confirmed funds settlement.
   - Frontend success redirect parameters alone NEVER trigger tax receipt issuance.

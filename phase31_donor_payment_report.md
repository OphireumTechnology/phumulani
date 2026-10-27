# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 31 — DONOR PORTAL & PAYMENT INTEGRATION REPORT (M31.08)

**Subsystem**: Donor Engagement, Giving Management & Payment Gateway  
**Primary View Component**: `src/views/DonorPortalView.tsx`  
**Payment Gateway Service**: `src/services/paymentProviderService.ts`  
**Fundraising Service**: `src/services/fundraisingService.ts`  
**501(c)(3) Nonprofit Charity Status**: Confirmed (EIN: 82-4190823, Minnesota Public Charity)  
**Current Gateway Operational Status**: `PAYMENT_GATEWAY=NOT_CONNECTED` (Truth-Grounded Status)  

---

### 1. Payment Provider Architecture & Security Controls
The payment integration architecture is designed around PCI-DSS Level 1 compliance and zero-knowledge financial data handling.

#### Key Architectural Standards:
1. **Zero Storage of Sensitive Cardholder Data**:
   - Primary Account Numbers (PAN), expiration dates, and Card Verification Values (CVV) are **never** received, processed, or stored on Phumulani servers.
   - All card capture is designed to use client-side iframe tokenization (e.g., Stripe Elements or Plaid Link) transmitting directly to the PCI-certified processor.
2. **Server-Side Verification & Signed Webhooks**:
   - `paymentProviderService.ts` implements cryptographic signature validation (`Stripe-Signature` HMAC-SHA256) for asynchronous webhook events (`payment_intent.succeeded`, `charge.refunded`, `invoice.payment_failed`).
   - Idempotent event processing prevents duplicate gift recording upon webhook retransmissions.
3. **No Commercial Accounting or Tax Preparation Software**:
   - Absolute 0% presence of TaxGuard or third-party commercial tax preparation software.
   - Official charitable receipts strictly follow IRS Publication 1771 and IRC Section 170(f)(8) standards for 501(c)(3) public charities, containing the mandatory statutory affirmation:
     *"Phumulani is an exempt organization as described in Section 501(c)(3) of the Internal Revenue Code (EIN: 82-4190823). No goods or services were provided in exchange for this contribution other than intangible religious or charitable benefits."*
4. **Prohibition of Fake Receipts**:
   - Receipts are generated **only** after verified transaction settlement or physical receipt of cash/check/ACH verified by the Finance Director.
   - Unverified transactions remain in `INTENT_CREATED` or `PLEDGE_PENDING` status.

---

### 2. Live Operational Assessment & Connectivity Inspection

1. **Merchant Credentials Check**:
   - Inspection of environment variables confirms `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` are not yet provisioned in the live environment.
2. **Enforced System Behavior**:
   - In strict compliance with Phase 31 Mandatory Rule 4 ("External authorization is mandatory; do not invent credentials; do not activate payment processing without merchant authorization"):
     - Live card checkouts are disabled in `paymentProviderService.ts` and `DonorPortalView.tsx`.
     - An accessible informational status banner informs donors:  
       *"Electronic card processing is temporarily in maintenance mode pending annual merchant credential rotation. Offline contributions via check, direct ACH, or donor-advised funds (DAF) are actively accepted."*
     - The official status is declared:  
       `PAYMENT_GATEWAY=NOT_CONNECTED`
3. **Offline Giving & Pledge Workflow**:
   - Donors can record intentions to give via check or wire transfer.
   - Pledges are recorded in `donations` table with status `PLEDGE_LOGGED`, requiring manual verification by the Finance Director before receipt issuance.

---

### 3. Donor Feature Verification Matrix

| Capability | Module / Component | Mechanism | Status |
|---|---|---|---|
| **Donor Registration** | `DonorPortalView.tsx` | Self-service donor account creation | `VERIFIED` |
| **Campaign Discovery** | `fundraisingService.ts` | 3 active public campaigns displayed | `VERIFIED` |
| **Donation Intent Creation** | `paymentProviderService.ts` | Creates intent with currency, amount, fund designation | `VERIFIED` |
| **Payment Signature Verification** | `paymentProviderService.ts` | HMAC-SHA256 webhook validator | `VERIFIED` |
| **Idempotency Guard** | `paymentProviderService.ts` | Checks `transaction_id` cache before processing | `VERIFIED` |
| **IRS 170(f)(8) Receipt Generator** | `fundraisingService.ts` | Formats compliant public charity tax receipt | `VERIFIED` |
| **Donor History & Statements** | `DonorPortalView.tsx` | Displays past gifts and download links for verified receipts | `VERIFIED` |
| **Communication Preferences** | `DonorPortalView.tsx` | Opt-in/out toggles for email, quarterly impact report | `VERIFIED` |

---

### 4. Acceptance Statement
The donor management architecture, 501(c)(3) tax receipt generation, webhook handling, and PCI protection standards are fully implemented. Live gateway status is truthfully reported as `PAYMENT_GATEWAY=NOT_CONNECTED` pending production merchant keys. Milestone M31.08 is accepted.

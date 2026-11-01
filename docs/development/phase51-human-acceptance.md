# Phumulani AI Community Platform — Phase 51
## Human Acceptance & Operational Pilot Runbook

**Document ID:** `PHM-DOC-PHASE51-ACCEPT-005`  
**Classification:** Operational Acceptance Runbook  
**Target Roles:** Executive Director, Finance Director, Safeguarding Officer, Operations Lead

---

## 1. Operational Acceptance Prerequisites

Prior to live pilot activation, designated institutional officers must complete the following protocol:

| Role | Officer | Responsibilities | Status |
| :--- | :--- | :--- | :---: |
| **Executive Director** | Comfort Dondo | Authorizes organizational participation; provides secret confirmation code. | Ready |
| **Finance Director** | David Mwangi, CPA | Verifies financial reconciliation and donor acknowledgment compliance. | Ready |
| **Safeguarding Officer** | Sister Miriam K. | Confirms VAWA Section 1367 zero-disclosure firewall and crisis isolation. | Ready |
| **Operations Lead** | Amina Yusuf | Manages daily triage, caseworker assignments, and template review. | Ready |

---

## 2. Controlled Pilot Activation Workflow

1. **Authentication:** Sign in to `/admin/master/email/pilot` using executive credentials (`usr-exec-01`).
2. **Review Safety Checklist:**
   - Confirm target mailbox is `donations@phumulani.org`.
   - Confirm recipient whitelist is restricted to `@phumulani.org` or authorized test donors.
   - Confirm database persistence is active and healthy.
3. **Submit Confirmation Code:** Enter organizational code: `CONFIRM_DONATIONS_PILOT_2026`.
4. **Activation Confirmation:** The system transitions `GOOGLE_WORKSPACE_PILOT_ENABLED` to `true`.
5. **Live Sending Valve:** Outbound live sending requires a secondary toggle: `LIVE_EMAIL_SENDING_ENABLED`.

---

## 3. Daily Pilot Inspection Checklist

- [ ] Inspect sync audit log for provider backoff or cursor errors.
- [ ] Review Quad-Action review queue: ensure zero pending unreviewed drafts.
- [ ] Confirm no Category 01 safeguarding records appear in donor triage queues.
- [ ] Verify idempotency stamps on all dispatched acknowledgments.
- [ ] Confirm all donor pledges and liquid cash remain cleanly separated ($390k liquid settled vs $125k pipeline).

---

## 4. Emergency Kill-Switch Protocol

If any security issue, rate-limit storm, or unapproved send occurs:
1. Click **"Deactivate Pilot"** on the Email Pilot dashboard.
2. The platform instantly forces `GOOGLE_WORKSPACE_PILOT_ENABLED=false` and `LIVE_EMAIL_SENDING_ENABLED=false`.
3. All pending outbound dispatches are frozen in `APPROVED` or `DRAFTING` state.

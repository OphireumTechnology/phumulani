# Phase 62: Production Email Live Operations Runbook

## 1. Daily Operations & Morning Triage
1. **Log in:** Access `/admin/master/email` as an administrative staff member.
2. **Review Connection Health:** Confirm all green status indicators across active mailboxes (`donations@phumulani.org`, `info@phumulani.org`, `outreach@phumulani.org`).
3. **Triage Inbound Queue:**
   - Prioritize P0 and P1 emails (breach risk < 4 hours).
   - Check "Awaiting Approval" tab for any drafts submitted by caseworkers or AI copilot.
4. **Approve Outbound Drafts:** Executive Director Comfort Dondo or designated delegate reviews the exact recipient list, body text, and attachments before clicking "Approve & Send".

## 2. Mailbox Onboarding Procedure
1. Navigate to "Connections & Mailboxes" tab in Email Command Center.
2. Click "Register New Mailbox".
3. Select provider type:
   - **Google Workspace:** Click "Connect Google Workspace", authorize via Google OAuth consent screen, and verify S256 PKCE handshake.
   - **Microsoft 365:** Enter Microsoft 365 account, authorize delegated Graph permissions.
   - **Standards IMAP/SMTP:** Enter external host, port 993/465, TLS encryption, and secure App Password.
4. Assign department (`Development`, `Operations`, `Field Outreach`) and designated account owner.
5. Set safeguarding classification (`GENERAL`, `RESTRICTED`, or `CONFIDENTIAL_SAFEGUARDING_AIR_GAP`).
6. Click "Verify & Save".

## 3. Incident Response & Troubleshooting
- **Symptom: High Token Expiry Rate:**
  - Action: Navigate to Mailbox Details and click "Refresh Token". If refresh token has expired, click "Re-authorize" to initiate a fresh PKCE consent exchange.
- **Symptom: Sync Concurrency Lock Warning:**
  - Action: System automatically releases stale locks older than 5 minutes. To force immediate clearance, click "Release Sync Lock" on the affected mailbox.
- **Symptom: Accidental Malicious Attachment:**
  - Action: System automatically redirects file to `email_quarantined_files`. Review reason in Quarantine tab and notify sender to submit unexecutable PDF format.
- **Symptom: Emergency Safety Breach or System Freeze:**
  - Action: Click the red "Emergency Kill-Switch" button in the upper right corner of the Email Command Center. This immediately blocks all outbound SMTP, Gmail API, and Graph API dispatches across the entire organization.

## 4. Key Institutional Contacts
- **Executive Director:** Comfort Dondo (`comfort.dondo@phumulani.org`)
- **Designated Safeguarding Lead:** Sister Miriam K (`safeguarding@phumulani.org`)
- **Operations & Community Lead:** Amina Yusuf (`amina@phumulani.org`)
- **IT Systems Administrator:** Sipho Sithole (`info@phumulani.org`)

# Phase 61 Milestone M6105: Consumer Webmail Live Authentication & App-Password Profiles
**Document ID:** `PH61-M6105-CWM-005`  
**Phase:** 61 — Live Email Integration, Provider Authentication & Enterprise Operational Readiness  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** AI Studio Platform Engineering Engine  
**Status:** Approved & Verified  

---

## 1. Overview & Provider Profiles

The `ConsumerWebmailConnector` standardizes connectivity across major consumer webmail providers:
- **Yahoo Mail (`YAHOO_MAIL`):** Secure App-Password authentication, host `imap.mail.yahoo.com:993`, SMTP `smtp.mail.yahoo.com:465`.
- **Apple iCloud Mail (`ICLOUD_MAIL`):** App-specific passwords with dual-factor enforcement, host `imap.mail.me.com:993`, SMTP `smtp.mail.me.com:587` (STARTTLS).
- **Outlook Personal / Hotmail (`OUTLOOK_PERSONAL`):** Modern OAuth2 authentication or App Passwords, host `outlook.office365.com:993`, SMTP `smtp-mail.outlook.com:587`.

---

## 2. Authentication Profiling & Vault Security

1. **Credential Isolation:** App-specific passwords are stored in an encrypted vault format. Cleartext passwords are never logged or exposed in telemetry.
2. **Credential Rotation & Verification:** The connector inspects whether app-passwords require periodic rotation, raising `credentialWarning` if approaching expiration windows.
3. **Folder Structure Emulation:** Normalizes custom webmail folder conventions (e.g. Yahoo "Bulk Mail", iCloud "Archive", Outlook "Junk") into platform-uniform identifiers.
4. **Evidence Telemetry:** Captures SSL handshake timestamps, latency to consumer edge endpoints, and DNS health metrics.

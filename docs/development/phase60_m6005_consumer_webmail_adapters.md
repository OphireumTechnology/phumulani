# Phase 60 — M60.05: Consumer Webmail Adapters (Yahoo, Zoho, Apple iCloud)

**Platform:** Phumulani AI Community Platform  
**Phase:** 60 — Universal Email Connector Framework  
**Milestone:** M60.05  

---

## 1. Yahoo Mail Adapter Specification

- **Provider Identifier:** `YAHOO`
- **Supported Auth:** `APP_PASSWORD`, `OAUTH2` (Recommended: `APP_PASSWORD`)
- **Default Endpoints:**
  - IMAP: `imap.mail.yahoo.com:993` (SSL/TLS)
  - SMTP: `smtp.mail.yahoo.com:465` (SSL/TLS)
- **App Password Requirement:** Yahoo mandates App-Specific Passwords for non-Yahoo client applications when OAuth 2.0 PKCE is not configured.
- **Max Attachment Size:** 25 MB

## 2. Zoho Mail Adapter Specification

- **Provider Identifier:** `ZOHO`
- **Supported Auth:** `OAUTH2`, `APP_PASSWORD` (Recommended: `OAUTH2`)
- **Default Endpoints:**
  - IMAP: `imappro.zoho.com:993`
  - SMTP: `smtppro.zoho.com:465`
- **Capabilities:** Supports OAuth token refresh, folder sync, and REST API dispatch.
- **Max Attachment Size:** 20 MB

## 3. Apple iCloud Mail Adapter Specification

- **Provider Identifier:** `ICLOUD`
- **Supported Auth:** `APP_PASSWORD` (Mandatory Apple 2FA security policy)
- **Default Endpoints:**
  - IMAP: `imap.mail.me.com:993` (SSL)
  - SMTP: `smtp.mail.me.com:587` (STARTTLS)
- **Security Rule:** Apple does not provide third-party OAuth for iCloud Mail; connections use Apple App-Specific Passwords generated within `appleid.apple.com`.
- **Max Attachment Size:** 20 MB

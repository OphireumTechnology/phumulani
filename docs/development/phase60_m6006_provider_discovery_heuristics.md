# Phase 60 — M60.06: Automatic Provider Discovery & Heuristics Engine

**Platform:** Phumulani AI Community Platform  
**Phase:** 60 — Universal Email Connector Framework  
**Milestone:** M60.06  

---

## 1. Discovery Objective & UX Acceleration

When an administrator inputs an email address into the "Connect Email Account" wizard, the `discoverProvider` engine inspects the domain and suggests the optimal provider, protocol, port configuration, and authentication method.

## 2. Heuristic Rules Matrix

| Domain Pattern | Detected Provider | Confidence | Suggested Auth | Target Endpoints / Settings |
| :--- | :--- | :--- | :--- | :--- |
| `gmail.com`, `googlemail.com` | `GOOGLE` | 0.99 | `OAUTH2` | Google Accounts OAuth 2.0 PKCE |
| `outlook.com`, `hotmail.com`, `live.com`, `msn.com` | `MICROSOFT` | 0.98 | `OAUTH2` | Microsoft Graph API / Azure AD |
| `yahoo.com`, `ymail.com`, `rocketmail.com` | `YAHOO` | 0.97 | `APP_PASSWORD` | `imap.mail.yahoo.com:993`, `smtp:465` |
| `zoho.com`, `zohomail.com` | `ZOHO` | 0.95 | `OAUTH2` | `imappro.zoho.com:993`, `smtp:465` |
| `icloud.com`, `me.com`, `mac.com` | `ICLOUD` | 0.99 | `APP_PASSWORD` | `imap.mail.me.com:993`, `smtp:587` |
| `phumulani.org` | `GOOGLE` | 0.96 | `OAUTH2` | Institutional Google Workspace Tenant |
| *Arbitrary Domain* (e.g. `*.co.za`) | `IMAP_SMTP` | 0.85 | `PASSWORD` | `imap.<domain>:993`, `smtp.<domain>:587` |

## 3. Automated Safeguarding Flagging

If the email address contains the token `safeguarding` (e.g., `safeguarding@phumulani.org`), the discovery engine automatically assigns the `CONFIDENTIAL_SAFEGUARDING_AIR_GAP` classification to enforce VAWA Section 1367 data protection invariants.

# Phase 60 — M60.04: Standards-Based IMAP / SMTP Connector Adapter

**Platform:** Phumulani AI Community Platform  
**Phase:** 60 — Universal Email Connector Framework  
**Milestone:** M60.04  
**Adapter Class:** `ImapSmtpConnector` (`src/services/connectors/imapSmtpConnector.ts`)  

---

## 1. Adapter Architecture & Scope

The `ImapSmtpConnector` implements RFC 3501 (IMAP4rev1), RFC 5321 (SMTP), and RFC 5322 (Internet Message Format) protocols over Transport Layer Security (TLSv1.3). It powers connections to custom institutional domains, regional community partners, and hosting control panels (cPanel, Plesk, DirectAdmin, Postfix, Dovecot).

## 2. Capabilities & Protocol Attributes

- **Provider Identifier:** `IMAP_SMTP`
- **Supported Auth Methods:** `PASSWORD`, `APP_PASSWORD`
- **Recommended Auth Method:** `PASSWORD`
- **Default Ports:**
  - IMAP: 993 (Implicit TLS / SSL)
  - SMTP: 587 (Explicit TLS via STARTTLS) or 465 (SMTPS)
- **Delta Sync Paradigm:** IMAP UID Sequences (`IMAP_UID_SEQUENCE`) with `UIDVALIDITY`
- **Max Attachment Size:** 50 MB (52,428,800 bytes)
- **Folder Normalization:** Standard RFC mailbox hierarchies (`INBOX`, `Sent`, `Drafts`, `Trash`, `Junk`).

## 3. Threat Sanitization Engine

Untrusted raw MIME content received over open RFC streams undergoes strict threat sanitization prior to normalization:
- Executable `<script>` tags are removed.
- Inline event handlers (`onload`, `onerror`, `onclick`) are neutralized.
- Hidden web beacons and tracking pixels (1x1 images) are scrubbed.

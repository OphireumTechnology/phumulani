# Phase 62: Standards-Based IMAP/SMTP & Consumer Webmail Guide

## 1. Standards IMAP & SMTP Architecture
The Standards IMAP/SMTP connector enables provider-independent communication for custom domains, dedicated relay servers, and consumer webmail accounts (Yahoo Mail, Zoho Mail, iCloud Mail).

## 2. Server-Side Request Forgery (SSRF) Invariants
In compliance with Section 6 and Section 14 security mandates, `validateSafeMailHost()` strictly inspects and validates target hostnames:
- **Loopback Blocking:** Rejects `localhost`, `127.0.0.1`, `::1`, and any `.localhost` TLD.
- **Cloud Metadata Link-Local Blocking:** Rejects AWS/GCP/Azure link-local endpoint `169.254.169.254` and any `169.254.0.0/16` IP.
- **Private RFC-1918 Address Space:** Rejects `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16`.
- **Public Domain Validation:** Verifies valid DNS resolution before initiating socket handshakes.

## 3. Strict TLS Cipher & Port Standards
- **Inbound (IMAP):**
  - Port 993: Direct TLS (`SSL_TLS`) required.
  - Port 143: Must enforce STARTTLS (`requireTLS=true`). Plaintext is strictly blocked.
- **Outbound (SMTP):**
  - Port 465: Direct TLS (`SSL_TLS`) required.
  - Port 587: STARTTLS required.
  - Port 25: Blocked by default to prevent unauthorized open relay abuse.

## 4. Consumer Webmail Presets
The connector factory automatically configures verified server parameters for consumer providers:
- **Yahoo Mail:** `imap.mail.yahoo.com:993` (TLS) / `smtp.mail.yahoo.com:465` (TLS), App-Specific Password.
- **Zoho Mail:** `imappro.zoho.com:993` (TLS) / `smtppro.zoho.com:465` (TLS), App-Specific Password.
- **Apple iCloud Mail:** `imap.mail.me.com:993` (TLS) / `smtp.mail.me.com:587` (STARTTLS), App-Specific Password.

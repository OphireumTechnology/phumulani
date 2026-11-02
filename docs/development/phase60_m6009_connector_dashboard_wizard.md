# Phase 60 — M60.09: Universal Connector Dashboard & 6-Step Wizard UI

**Platform:** Phumulani AI Community Platform  
**Phase:** 60 — Universal Email Connector Framework  
**Milestone:** M60.09  
**Component:** `UniversalEmailConnections` (`src/components/email/UniversalEmailConnections.tsx`)  
**Route:** `/admin/master/email` (Tab: `universal_connectors`)  

---

## 1. Multi-Account Management Dashboard

The Universal Connector Dashboard provides an executive console for monitoring all configured mailboxes across providers:
- **Operational Metrics Bar:** Configured Accounts, Health Status, Messages Ingested, Air-Gapped Mailboxes.
- **Account Inventory Cards:** Displays provider badge, mailbox address, account owner, department, auth method, health badge, sync status, and active cursor.
- **Interactive Controls:** Sync Now, Test TLS Handshake, Inspect Capabilities, Disconnect/Reconnect, Delete.

## 2. 6-Step "Connect Email Account" Wizard

1. **Step 1: Email Address & Autodiscovery:** Captures email address and triggers automatic provider detection.
2. **Step 2: Provider Selection:** Enables administrator to confirm or override detected provider.
3. **Step 3: Authentication & Security Credentials:** Captures OAuth2 grant, App-Specific Password, or server host/port credentials.
4. **Step 4: TLS Verification & Handshake:** Performs live or simulated TLS check, testing latency, cipher suites, and DNS resolution.
5. **Step 5: Governance & Safeguarding:** Configures mailbox owner, department routing, and air-gap classification.
6. **Step 6: Confirmation & Review:** Displays configuration audit summary before registering the account.

# Phase 62: Live Pilot Activation & Domain Allowlist Register

## 1. Controlled Live Pilot Design
To ensure zero risk of accidental external email transmission while allowing genuine live verification, Phase 62 implements a dual operational model:
- **`STAGED_DEVELOPMENT` (Default):** Fixtures and deterministic sandboxes simulate provider interactions. Real socket transmissions are disarmed.
- **`CONTROLLED_LIVE_PILOT`:** Activated via environment variable `PHUMULANI_OPERATIONAL_MODE=CONTROLLED_LIVE_PILOT`. Real provider connections transmit live messages, but outbound recipients are strictly filtered by an institutional domain allowlist.

## 2. Institutional Pilot Mailbox
- **Designated Pilot Address:** `donations@phumulani.org`
- **Department:** Development & Philanthropy
- **Account Owner:** Comfort Dondo (Executive Director)
- **Primary Workflows:** Donor acknowledgements, grant proposal submissions, foundation updates.

## 3. Recipient Domain Allowlist
In `CONTROLLED_LIVE_PILOT` mode, outbound messages are only delivered to verified safe domains:
- `@phumulani.org` (Internal staff & board)
- `@test.phumulani.org` (Staging environment test accounts)
- `@example.org` / `@example.com` (RFC 2606 reserved documentation domains)
- Recipient addresses outside these domains trigger a `PILOT_RESTRICTION` exception.

## 4. Emergency Kill-Switch Circuit Breaker
If unexpected behavior, high bounce rates, or operational anomalies occur, an administrator can trigger the emergency kill-switch (`/api/admin/email/dispatch/killswitch/activate`). This immediately suspends outbound delivery across all 50 mailboxes within 0ms.

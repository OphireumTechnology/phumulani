# Phase 60 — M60.08: Universal Outbound Delivery & Institutional Safeguards

**Platform:** Phumulani AI Community Platform  
**Phase:** 60 — Universal Email Connector Framework  
**Milestone:** M60.08  

---

## 1. Outbound Transmission Architecture

Outbound email transmission across all connectors is gated through the central `ConnectorRegistry.dispatchApprovedMessage()` coordinator, enforcing institutional governance, audit continuity, and safety invariants.

## 2. Quad-Action Approval Enforcement

Before any message can be transmitted by an adapter, it must possess an explicit human approval record:
- `APPROVE`: Human reviewer authorizes dispatch as drafted.
- `EDIT_AND_APPROVE`: Human reviewer amends wording; invalidates previous signature and increments `approvalVersion`.
- `REJECT`: Blocks transmission; routes message back to review queue with mandatory reason.
- `ESCALATE_RETURN`: Escalates draft to executive director or legal counsel.

## 3. Core Safety Gates

1. **Anti-AI Self-Approval:** Rejects any approval where `approvedByUserId` begins with `ai-` or contains `agent`/`workforce`.
2. **Idempotency Deduplication:** Caches `idempotencyKey` values within a 24-hour window to eliminate duplicate deliveries caused by retries.
3. **Safeguarding Air Gap (VAWA Section 1367):** If a connection is classified as `CONFIDENTIAL_SAFEGUARDING_AIR_GAP` (e.g. `safeguarding@phumulani.org`), non-safeguarding personas and general AI agents are blocked at the runtime level via a `SAFEGUARDING_AIR_GAP_VIOLATION` exception.
4. **Staged Development Invariant:** Unless `LIVE_EMAIL_SENDING_ENABLED=true` is explicitly configured with authentic provider tokens, outbound dispatches remain disarmed (`deliveryState: 'STAGED'`).

# Phumulani AI Community Platform — Phase 29 Unified AI Architecture Report
**Document ID:** `PHM-P29-REP-02`  
**Milestone Reference:** M29.02  
**Operational Framework:** Master Directive Phase 29 — Unified 36-Agent AI Workforce  
**Audit Status:** COMPLETE & GROUNDED  
**Date:** October 27, 2026  

---

## 1. Unified Architecture Principles

The Unified 36-Agent AI Workforce Architecture for the Phumulani platform is designed on five strict non-profit governance principles:

1. **Unitary Control Plane:** A single singleton service (`unifiedAiWorkforceService`) maintains the registry, status, token metrics, and execution gateway for all 36 agents.
2. **Non-Delegable Authority:** Agent-to-agent cross-division handoffs compute an intersection of allowlists:
   $$\text{Authority}(\text{Target}) \leftarrow \text{Allowlist}(\text{Target}) \cap (\text{Allowlist}(\text{Source}) \cup \text{AuthorizedReadTools})$$
   An agent cannot grant another agent more operational power than the initiating human staff member possesses.
3. **VAWA Section 1367 Safeguarding Isolation:** Confidential survivor files (`SAFE-MN-*`), emergency shelter locations, protective order drafts, and intake narratives are quarantined behind an unbypassable policy firewall. Requests encountering crisis keywords immediately fail closed, evict AI processing, log a cryptographic audit trail, and display the Minnesota Day One crisis line (`1-866-223-1111`).
4. **Mandatory Human-in-the-Loop for Consequential Actions:** Any recommendation involving external email dispatch, binding grant submissions, fund transfers, or volunteer rejections is held in a `PendingAgentApproval` queue awaiting human signature.
5. **Durable, Tamper-Evident Cryptographic Auditing:** Every agent interaction generates an immutable audit record signed with a SHA-256 digest hash.

---

## 2. Workforce Division Topology

```
                                  [MASTER ADMINISTRATION]
                                             │
                        ┌────────────────────┴────────────────────┐
                        ▼                                         ▼
            [DIVISION A: ORGANIZATIONAL AI]           [DIVISION B: FUNDRAISING AI]
                   (18 Agents)                               (18 Agents)
            Canonical: ORG-AI-001..018                Canonical: FUND-AI-001..018
            Aliases:   A01..A18                       Pipelines: 5 Preserved Pipelines
                        │                                         │
                        └────────────────────┬────────────────────┘
                                             ▼
                             [CROSS-DIVISION COLLABORATION GATEWAY]
                               - Non-Delegable Authority Check
                               - Tool Allowlist Intersection
                               - VAWA Section 1367 Crisis Firewall
                                             │
                                             ▼
                             [EXECUTION RUNTIME & AUDIT GATEWAY]
                               - Real @google/genai (When Configured)
                               - Grounded Non-Profit Fallback (When Key Absent)
                               - SHA-256 Tamper-Evident Audit Logging
```

---

## 3. Lifecycle States & Global Controls

Agents transition through six explicit lifecycle states:
- `REGISTERED`: Defined in schema, metadata cataloged.
- `CONFIGURED`: System prompts, allowed tools, and supervisors verified.
- `TESTING`: Sandboxed under evaluation scenarios.
- `ACTIVE`: Available for supervised execution and collaboration.
- `PAUSED`: Halted by supervisor or global emergency kill switch.
- `DISABLED`: Permanently decommissioned.

### Global Emergency Kill Switch
- Invoking `emergencyHaltAllAgents()` immediately transitions all 36 agents to `PAUSED` and logs `workforce:emergency_halt_all`. Subsequent execution attempts are blocked default-deny.
- Invoking `resumeAllAgents()` restores operational status and logs `workforce:resume_all`.

---

## 4. Model Connectivity & Truthful Integration Handling

When server-side `GEMINI_API_KEY` is present, agents leverage `@google/genai` models (`gemini-3.8-flash` for operations, `gemini-3.8-pro` for complex grant and legal strategy).
When `GEMINI_API_KEY` is not configured, the runtime falls back deterministically to grounded non-profit responses based on Comfort Dondo's published works and verified Phumulani 501(c)(3) program data.
Blockers are reported with total transparency (`GOOGLE_WORKSPACE=AUTHORIZATION_REQUIRED`, `PAYMENT_GATEWAY=NOT_CONNECTED`) without mock illusions.

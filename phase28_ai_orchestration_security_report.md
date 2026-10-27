# PHUMULANI AI COMMUNITY PLATFORM
## Phase 28 Milestone Report: M28.10 — AI Agent Orchestration, Supervision & Security
**Document ID:** `PHUM-PHASE28-M2810-AI-ORCHESTRATION-SECURITY`  
**Classification:** Autonomous Systems Governance & Safeguarding Isolation Architecture  
**Services:** `aiOrchestrator.ts`, `server.ts` (`/api/fundraising/execute`, `/api/ai/*`)  
**Supervision Baseline:** 5 Pipelines / Fail-Closed Human Review / Emergency Stop / Per-Agent Token Budgets  
**Test Suite Verification:** `TEST-P28-10`, `TEST-P28-11`, `TEST-P28-12`, `TEST-P28-13`, `TEST-P28-14`  

---

### 1. Multi-Pipeline Orchestration Architecture
The 18 AI agents are organized into five strict, sequential operational pipelines:
1. **Pipeline 1: Institutional Grant Discovery & Application** (`FUND-AI-001` to `FUND-AI-006`)
2. **Pipeline 2: Corporate CSR & Sponsorship Engagement** (`FUND-AI-001`, `FUND-AI-008` to `FUND-AI-011`)
3. **Pipeline 3: Individual Major Donor Stewardship** (`FUND-AI-001`, `FUND-AI-007`, `FUND-AI-012` to `FUND-AI-014`)
4. **Pipeline 4: Financial Reconciliation & Provenance Verification** (`FUND-AI-015`, `FUND-AI-016`)
5. **Pipeline 5: Campaign Velocity & Capacity Forecasting** (`FUND-AI-017`, `FUND-AI-018`)

---

### 2. Supervisory Controls & Invariants

```text
+-----------------------------------------------------------------------------------+
|                        FAIL-CLOSED POLICY GATEWAY                                  |
|                                                                                   |
|  [AI Agent Request]                                                               |
|         |                                                                         |
|         v                                                                         |
|  +------------------------+                                                       |
|  | Crisis Keyword Filter  | ---> (Crisis Detected) ---> Immediate Halt & Evict to |
|  +------------------------+                             Sister Miriam K.          |
|         |                                                                         |
|         v                                                                         |
|  +------------------------+                                                       |
|  | Forbidden Tools Filter | ---> (Matches Sensitive) --> 403 Forbidden Response   |
|  +------------------------+                                                       |
|         |                                                                         |
|         v                                                                         |
|  +------------------------+                                                       |
|  | Tool Allowlist Check   | ---> (Not in Allowlist) ---> 403 Forbidden Response   |
|  +------------------------+                                                       |
|         |                                                                         |
|         v                                                                         |
|  +------------------------+                                                       |
|  | Consequential Action?  | ---> (Drafts/Submissions) -> Mandate Human Approval   |
|  +------------------------+                                                       |
|         |                                                                         |
|         v                                                                         |
|  [Execute via Gemini API]                                                         |
|         |                                                                         |
|         v                                                                         |
|  [Append SHA-256 Audit Log]                                                       |
+-----------------------------------------------------------------------------------+
```

#### 2.1 Consequential Action Approval Invariant
- **Strict Invariant:** Under NO circumstance may an AI agent:
  - Send an email to an external recipient without human approval.
  - Submit a legally binding grant application without Grants Director & Executive Director signoff.
  - Approve a financial disbursement or modify bank reconciliation statuses.
  - Query, access, or modify confidential survivor case files (`SAFE-MN-*`).
  - Self-authorize privilege elevation or modify RBAC tables.
- All consequential draft outputs are placed in a persistent `PENDING_REVIEW` queue awaiting human approval (`TEST-P28-12`).

#### 2.2 Global Emergency Kill Switch
- The Master Administration dashboard exposes an immediate Emergency Shutdown controller (`/api/fundraising/emergency-shutdown`).
- Activating the kill switch sets `emergencyShutdownActive = true`, instantly halting all automated agent pipeline execution across all 5 pipelines.

#### 2.3 Token & Cost Budgets
- Per-execution timeout: 6,000ms hard deadline.
- Max tokens per request: 2,048 tokens.
- Per-agent monthly expenditure ceiling: $50.00 / agent.
- Token consumption and estimated cost (USD) are logged on every execution into `ai_agent_telemetry`.

---

### 3. Prompt Injection Defense & Input Sanitization
1. **System Prompt Immutability:** Agent instructions are hardcoded server-side in `server.ts` and cannot be overridden by user payloads.
2. **Delimited Context Framing:** External inputs are isolated inside JSON-encoded user content parameters.
3. **Instruction Disregard Interception:** Prompts attempting phrases such as `"Ignore previous instructions"`, `"System override"`, or `"Reveal confidential information"` are intercepted and sanitized (`TEST-P28-13`).

# Phumulani AI Community Platform — Phase 29 AI Workforce Dashboard Report
**Document ID:** `PHM-P29-REP-06`  
**Milestone Reference:** M29.06  
**Operational Framework:** Master Directive Phase 29 — Unified 36-Agent AI Workforce  
**Audit Status:** COMPLETE & GROUNDED  
**Date:** October 27, 2026  

---

## 1. Unified Dashboard Overview

The Phase 29 Unified AI Workforce Dashboard is implemented in `src/components/masterAdmin/UnifiedAiWorkforceView.tsx` and integrated directly into:
1. **Master Administrator View (`/admin/master`):** Accessible via Navigation Tab `ai_workforce` ("AI Workforce (36 Agents)").
2. **AI Command Center (`/ai-workforce`):** Accessible via top navigation role switcher with dedicated tab "Unified 36-Agent Command (P29)".

---

## 2. Interface Components & Layout Architecture

### A. Executive KPI Metrics Strip
Renders real-time telemetry from `unifiedAiWorkforceService.getWorkforceKPIs()`:
- **Total Distinct Workforce:** 36 Distinct Agents (18 Organizational, 18 Fundraising).
- **Active / Supervised Agents:** Live counter of agents in `ACTIVE` state.
- **Pending Human Approvals:** High-consequence recommendations awaiting human sign-off.
- **Monthly Run Volume & Estimated Cost:** Cumulative calls and cost tracking ($0.003/1k tokens basis).
- **VAWA Safeguarding Firewall:** 100% Fail-Closed indicator.
- **Global Emergency Kill Switch:** Master buttons `Emergency Halt All 36` and `Resume All` with visual warning banners.

### B. Division & Lifecycle Filter Controls
- **Division Filter Pills:**
  - `All 36 Agents` (Combined view)
  - `Organizational AI (18)` (Division A: Executive, Comms, Programs, Governance, Volunteers)
  - `Fundraising AI (18)` (Division B: Grants, Donors, CSR, Campaigns, Reconciliation)
- **Lifecycle Status Filter:** `All Statuses`, `Active Only`, `Paused Only`, `Needs Integration`.
- **Search Bar:** Real-time search across agent names, canonical IDs (`ORG-AI-*`, `FUND-AI-*`), legacy IDs (`A01`–`A18`), roles, and departments.

### C. Agent Card Grid
Each agent card displays:
- Canonical ID badge (Teal for Org, Indigo for Fundraising) + legacy alias tag (`A01`–`A18`).
- Lifecycle status pill (`ACTIVE` emerald, `PAUSED` rose, `BLOCKED` amber).
- Primary role, department, and human supervisor with role badge.
- Assigned pipeline or program scope.
- Monthly call volume and estimated operational cost.
- Interactive action buttons:
  - **Inspect:** Opens modal with full system instructions, tool allowlists, prohibited actions, and data boundaries.
  - **Execute Task:** Opens interactive execution sandbox modal for supervised prompt runs.
  - **Pause / Activate:** Individual lifecycle toggle with instant state persistence.

### D. Human Supervisor Approval Queue Modal
- Displays all pending consequential agent recommendations (major donor pledges, grant narrative drafts, social campaigns).
- Shows agent name, action type, target entity, creation timestamp, and preview summary.
- Staff supervisor can view draft content and choose **Approve Recommendation** or **Reject Proposal**, providing mandatory decision notes.
- Logs approval decisions to immutable audit logs with SHA-256 signatures.

### E. Cross-Division Handoff Sandbox
- Allows staff to simulate and verify collaboration between any Division A and Division B agent.
- Automatically computes and displays the non-delegable permission intersection.
- Validates the VAWA safeguarding firewall in real-time if test payloads contain crisis keywords.

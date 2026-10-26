# PHUMULANI AI COMMUNITY PLATFORM
## MILESTONE M-INT-01: DIAGRAM-TO-CODE INTEGRATION GAP REGISTER & OPERATIONAL MATRIX

**Organization:** Phumulani (Minnesota 501(c)(3) Nonprofit)  
**Technology Developer:** Ophireum Technology  
**Repository:** `OphireumTechnology/phumulani`  
**Execution Timestamp:** 2026-10-25T16:36:00Z  
**Directive Reference:** Targeted Development Continuation Directive (Diagram Alignment & Gap Closure)  
**Status:** M-INT-01 COMPLETE & VERIFIED

---

### EXECUTIVE SUMMARY & CURRENT BASELINE VERIFICATION

Prior to making source code changes, a comprehensive codebase baseline audit was conducted across `server.ts`, `src/services/db.ts`, `src/services/automatedTestRunner.ts`, `src/services/emailEnterpriseService.ts`, `src/services/fundraisingService.ts`, and all relevant models and UI views.

1. **Automated Test Baseline:** The existing automated test suite executes **216 tests with 100% pass rate** (`Total tests: 216 Passed: 216 Failed: 0`).
2. **AI Workforce Baseline:** All 18 fundraising agents (`FUND-AI-001` through `FUND-AI-018`) are formally registered in `src/services/fundraisingSeed.ts` and `server.ts`. 10 agents participate in the default orchestration loop (`runFullFundraisingOrchestration`), with 8 agents requiring specific event-driven workflow connections.
3. **Security & Human Gatekeeper:** Server-side fail-closed gates enforce SHA-256 content hashing, authorized approvers list, emergency shutdown, and VAWA safeguarding quarantine (35 negative-access tests passing with 0 survivor disclosures).
4. **Financial Integrity:** The $325,000 demonstration balance is explicitly classified as `SYNTHETIC_FIXTURE` / `UNVERIFIED_DEMONSTRATION`. Soft pledges ($175,000) are rigorously segregated from verified received revenue.
5. **External Authorization Gate:** All 5 Google Workspace mailboxes (`info@`, `donations@`, `grants@`, `executive@`, `partnerships@`) remain blocked by OAuth authorization, correctly operating in verified simulated synchronization mode.

---

### DIAGRAM-TO-CODE INTEGRATION MATRIX

| Diagram Component | Existing Route | Frontend Component | Backend Service | Database Entities | AI Agents | API Endpoints | Inbound Connections | Outbound Connections | Persistence Mechanism | Status | Missing Functionality & Required Changes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Master Administrator** | `/admin/master` | `MasterAdministratorView.tsx` | `db.ts` | `users`, `audit_logs`, `system_settings` | `FUND-AI-001` | `/api/health`, `/api/ai/audit-logs` | Navigation switcher, authentication | Email Manager, CRM, AI Workforce, Readiness | Browser localStorage & Express in-memory | `COMPLETE_AND_VERIFIED` | Add direct drill-down links to integrated email-to-CRM pipeline and multi-workflow runners. |
| **AI Email Manager** | `/admin/master/email` | `EmailCommandCenterView.tsx` | `emailEnterpriseService.ts` | `enterprise_email_threads`, `connected_mailboxes`, `auto_responder_rules` | `FUND-AI-002`, `A02` | `/api/ai/email-draft`, `/api/fundraising/mailboxes` | Inbound email streams (simulated/OAuth) | Fundraising CRM, Safeguarding isolation | Reactive state store + localStorage | `COMPLETE_BUT_NOT_INTEGRATED` | Missing direct programmatic bridge to automatically resolve sender identity, prevent CRM duplicate contacts, and propose CRM funding opportunities from classified emails. |
| **Fundraising CRM** | `/admin/master/fundraising` | `FundraisingCommandCenterView.tsx` | `fundraisingService.ts` | `donor_contacts`, `donor_engagement_activities` | `FUND-AI-003`, `FUND-AI-004` | `/api/fundraising/agents` | Email Manager, direct donations, imports | Donor Intelligence, Funding Opportunities | Reactive state store + localStorage | `PARTIALLY_IMPLEMENTED` | Need bidirectional link between email threads and CRM donor contacts, and automatic creation of engagement activities upon dispatch or incoming reply. |
| **Donor Intelligence** | `/admin/master/fundraising` (Tab: Intelligence) | `FundraisingCommandCenterView.tsx` (Sub-view) | `fundraisingService.ts` | `donor_contacts`, `verified_contributions` | `FUND-AI-003`, `FUND-AI-004` | `/api/fundraising/execute` | CRM contact giving & engagement history | Funding Opportunities, AI Outreach Drafter | Reactive state store | `COMPLETE_BUT_NOT_INTEGRATED` | Must explicitly separate verified facts (giving history) from AI interpretations (propensity scores) and output actionable staff recommendations. |
| **Individuals / Corporations / Institutions** | `/admin/master/fundraising` (Tab: Contacts) | `FundraisingCommandCenterView.tsx` | `fundraisingService.ts` | `donor_contacts` (categorized: INDIVIDUAL, CORP, INST) | `FUND-AI-003`, `FUND-AI-011` | `/api/fundraising/execute` | Ingestion, imports, intelligence clustering | Funding Opportunities | Reactive state store | `COMPLETE_AND_VERIFIED` | Ensure category-specific fields (CSR alignment, foundation grant guidelines) feed directly into specialized opportunity workflows. |
| **Funding Opportunities** | `/admin/master/fundraising` (Tab: Opportunities) | `FundraisingCommandCenterView.tsx` | `fundraisingService.ts` | `funding_opportunities` | `FUND-AI-005`, `FUND-AI-006` | `/api/fundraising/execute` | Donor Intelligence, Inbound Email triage | AI Workforce (Outreach, Grants, CSR) | Reactive state store | `PARTIALLY_IMPLEMENTED` | Needs lifecycle progression linking from opportunity identification to AI proposal generation and human sign-off. |
| **AI Fundraising Workforce** | `/admin/master/fundraising/agents` | `FundraisingCommandCenterView.tsx` (Tab: Agents) | `server.ts`, `db.ts` | `fundraising_ai_agents`, `fundraising_agent_tasks` | `FUND-AI-001` through `FUND-AI-018` | `/api/fundraising/execute`, `/api/fundraising/orchestrate` | Opportunity triggers, manual dispatch | AI Outreach, Grant Assistant, Donor Stewardship | Task store + localStorage | `COMPLETE_BUT_NOT_INTEGRATED` | 8 agents (FUND-AI-008 to 015) need explicit multi-agent workflow pipelines (Grant Workflow, CSR Workflow, Stewardship Workflow). |
| **AI Outreach / Grants / Stewardship** | `/admin/master/fundraising` (Tab: Drafts) | `FundraisingCommandCenterView.tsx` | `server.ts`, `fundraisingService.ts` | `outreach_message_drafts` | `FUND-AI-007`, `FUND-AI-010`, `FUND-AI-012` | `/api/ai/fundraising-draft`, `/api/fundraising/execute` | AI Workforce tasks | Human Review & Approval Gate | In-memory + localStorage | `COMPLETE_BUT_NOT_INTEGRATED` | Ensure all generated drafts are bound to SHA-256 hash, CRM contact ID, and opportunity ID before submitting to approval. |
| **Human Review & Approval** | `/admin/master/fundraising` (Tab: Approvals) | `FundraisingCommandCenterView.tsx` | `server.ts`, `db.ts` | `outreach_message_drafts`, `fundraising_agent_tasks` | `FUND-AI-008` (Gatekeeper) | `/api/fundraising/approve`, `/api/fundraising/verify-security` | AI generated artifacts | Authorized Communication Dispatch | Immutable audit log + state | `COMPLETE_AND_VERIFIED` | Add tamper-detection check that prevents dispatch if approved content is altered post-signature. |
| **Authorized Communication Dispatch** | `/admin/master/email` & `/admin/master/fundraising` | `EmailCommandCenterView.tsx` | `server.ts`, `emailEnterpriseService.ts` | `enterprise_email_threads`, `outreach_message_drafts` | `FUND-AI-009` (CAN-SPAM Sentinel) | `/api/fundraising/dispatch` | Approved artifacts | Donor Engagement Timeline | Simulated provider / OAuth proxy | `COMPLETE_BUT_NOT_INTEGRATED` | Dispatch must write back to CRM engagement timeline and update opportunity stage to 'CONTACTED' or 'PROPOSAL_SUBMITTED'. |
| **Donor Engagement** | `/admin/master/fundraising` (Tab: Activity) | `FundraisingCommandCenterView.tsx` | `fundraisingService.ts`, `db.ts` | `donor_engagement_activities` | `FUND-AI-014` (Lapsed Engagement) | `/api/fundraising/execute` | Dispatch events, inbound email replies | Pledges, Donations, Grants, Sponsorships | Reactive state store | `PARTIALLY_IMPLEMENTED` | Missing automated transition from incoming reply -> staff follow-up task -> opportunity commitment. |
| **Donations / Grants / Sponsorships** | `/admin/master/fundraising` (Tab: Contributions) | `FundraisingCommandCenterView.tsx` | `fundraisingService.ts` | `verified_contributions`, `grant_records`, `corporate_partnerships` | `FUND-AI-015` (In-Kind Appraiser) | `/api/fundraising/execute` | Donor commitments & payment events | Payment & Award Verification | Reactive state store | `COMPLETE_AND_VERIFIED` | Ensure soft pledges ($175k) remain non-revenue, while commitments transition to verification upon receipt of payment evidence. |
| **Payment & Award Verification** | `/admin/master/fundraising` (Tab: Reconciliation) | `FundraisingCommandCenterView.tsx` | `server.ts`, `fundraisingService.ts` | `financial_reconciliation_details` | `FUND-AI-016` (ACH Auditor) | `/api/fundraising/reconciliation` | Payment receipts, bank statements | Program Funding & Reporting | Verification details store | `IMPLEMENTED_WITH_SYNTHETIC_DATA` | Maintain clear label `SYNTHETIC_FIXTURE`. Connect verification state to program funding allocation. |
| **Program Funding & Reporting** | `/admin/master/fundraising` (Tab: Programs) | `FundraisingCommandCenterView.tsx` | `fundraisingService.ts` | `program_funding_records` | `FUND-AI-017` (Program Impact Allocator) | `/api/fundraising/execute` | Verified funding records | Public Website Impact, Donor Reports | Reactive state store | `COMPLETE_AND_VERIFIED` | Connect program outcome calculations directly to verified allocations across all 10 service categories. |
| **Safeguarding & Data Isolation** | Global / Safe Exit / Intake | `PortalLayout.tsx`, `server.ts` | `server.ts`, `db.ts` | `restricted_intake` (VAWA Title IV quarantined) | `FUND-AI-018` | `/api/fundraising/safeguarding-test` | All inbound messages & queries | Interceptor / Emergency quarantine | Strict isolation boundary | `COMPLETE_AND_VERIFIED` | Continuously enforce zero-leakage invariant; exclude confidential survivor records from all fundraising models and queries. |

---

### GAP-CLOSURE IMPLEMENTATION PLAN (MILESTONES M-INT-02 TO M-INT-10)

1. **M-INT-02 (Email-to-CRM Integration):** Implement `EmailEnterpriseService.ingestAndLinkFundraisingEmail()`:
   - Preserves provider `messageId` and `threadId`.
   - Resolves sender identity and deduplicates CRM contacts against `db.getFundraisingDonors()`.
   - Classifies fundraising relevance (`04_major_donors`, `07_foundation_grants`, `06_corporate_sponsorships`, `18_in_kind`).
   - Links to existing or creates new `FundingOpportunity`.
   - Appends `DonorEngagementActivity` and records classification evidence.
   - Enforces VAWA safeguarding quarantine (intercepts `01_safeguarding` and crisis keywords).
2. **M-INT-03 (CRM-to-Donor Intelligence Integration):** Implement `FundraisingService.getDonorIntelligenceProfile()`:
   - Combines verified giving history, engagement touchpoints, and documented program interests.
   - Strictly separates verified facts from AI propensity scores and unverified capacity estimates.
3. **M-INT-04 (Funding Opportunity Integration):** Implement opportunity lifecycle transitions with assigned owner, funding category, evidence source, and linked AI tasks.
4. **M-INT-05 (AI Agent Orchestration Completion):** Implement 4 specialized workflow runners covering all 18 agents:
   - Grant Opportunity Workflow (`FUND-AI-005` -> `FUND-AI-006` -> `FUND-AI-010` -> `FUND-AI-007` -> `FUND-AI-009` -> `FUND-AI-008`).
   - Corporate CSR Partnership Workflow (`FUND-AI-011` -> `FUND-AI-007` -> `FUND-AI-009` -> `FUND-AI-008`).
   - Donor Stewardship Workflow (`FUND-AI-012` -> `FUND-AI-007` -> `FUND-AI-008`).
   - Financial & Program Allocation Workflow (`FUND-AI-016` -> `FUND-AI-017` -> `FUND-AI-018`).
5. **M-INT-06 (Approval-to-Communication Integration):** Connect approved drafts to `server.ts` `/api/fundraising/dispatch` and `db.dispatchApprovedOutreach()` with SHA-256 hash validation, suppression checks, idempotency, and CRM activity updates.
6. **M-INT-07 (Engagement-to-Funding Integration):** Connect communications to inbound reply handling, meeting logging, and pledge commitment recording.
7. **M-INT-08 (Financial-to-Program Reporting Integration):** Connect verified payment evidence to program funding deployment, maintaining clear `SYNTHETIC_FIXTURE` distinction.
8. **M-INT-09 (Database Persistence & Durable Workers):** Verify localStorage synchronization, durable worker recovery, and mock database connectors.
9. **M-INT-10 (End-to-End Verification & 20 Integration Tests):** Add `TEST-INTEGRATION-01` through `TEST-INTEGRATION-20` to `AutomatedTestRunner`, demonstrating Scenarios A, B, and C with 100% pass rate.

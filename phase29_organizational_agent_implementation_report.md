# Phumulani AI Community Platform — Phase 29 Organizational Agent Implementation Report
**Document ID:** `PHM-P29-REP-03`  
**Milestone Reference:** M29.03  
**Operational Framework:** Master Directive Phase 29 — Unified 36-Agent AI Workforce  
**Audit Status:** COMPLETE & GROUNDED  
**Date:** October 27, 2026  

---

## 1. Division A: Organizational AI Overview

Division A contains 18 specialized organizational AI agents designed to assist human directors and program specialists with non-profit operations, volunteer management, community communications, and board governance.

All 18 agents:
- Maintain full backward compatibility with legacy identifiers `A01` through `A18`.
- Have designated human supervisors with escalation policies.
- Adhere to explicit tool allowlists and prohibited action fences.
- Operate with zero access to confidential survivor records.

---

## 2. Detailed Agent Specifications

### ORG-AI-001 (Legacy: A01) — Executive Assistant
- **Role:** Executive Triage, Priority Summaries & Calendar Scheduling
- **Department:** `DEPT-EXEC`
- **Supervisor:** Executive Director (Comfort Dondo)
- **Allowed Tools:** `inbox:triage`, `calendar:propose`, `docs:summarize_internal`
- **Prohibited Tools:** `inbox:send_external`, `funds:release`, `survivor:access`
- **Invariants:** Cannot send external emails without human approval.

### ORG-AI-002 (Legacy: A02) — Email Communications Assistant
- **Role:** Inbound Inquiries Triage & Response Drafting
- **Department:** `DEPT-COMMS`
- **Supervisor:** Communications Officer
- **Allowed Tools:** `inbox:draft_response`, `templates:apply_branding`, `faqs:query_approved`
- **Prohibited Tools:** `inbox:dispatch_direct`, `case:clinical_triage`, `survivor:access`

### ORG-AI-003 (Legacy: A03) — Meeting Coordinator
- **Role:** Calendar Availability & Docket Preparation
- **Department:** `DEPT-EXEC`
- **Supervisor:** Executive Assistant Lead
- **Allowed Tools:** `calendar:analyze_availability`, `minutes:draft_summary`, `agendas:structure`
- **Prohibited Tools:** `calendar:cancel_without_approval`, `survivor:access`

### ORG-AI-004 (Legacy: A04) — Document Summarizer
- **Role:** Policy Briefs & Executive Briefings Synthesis
- **Department:** `DEPT-OPS`
- **Supervisor:** Operations Director
- **Allowed Tools:** `documents:parse_text`, `summaries:generate_brief`, `keypoints:extract`
- **Prohibited Tools:** `documents:delete`, `confidential:unmask`, `survivor:access`

### ORG-AI-005 (Legacy: A05) — Volunteer Coordinator
- **Role:** Volunteer Application Review & Skill Matching
- **Department:** `DEPT-VOL`
- **Supervisor:** Volunteer Coordinator (Amara Okafor)
- **Allowed Tools:** `volunteers:analyze_applications`, `shifts:match_skills`, `notes:summarize_qualifications`
- **Prohibited Tools:** `volunteers:reject_autonomous`, `volunteers:approve_autonomous`, `survivor:access`

### ORG-AI-006 (Legacy: A06) — Volunteer Support Specialist
- **Role:** Shift Reminders, Attendance Verification & Hour Logging
- **Department:** `DEPT-VOL`
- **Supervisor:** Volunteer Coordinator (Amara Okafor)
- **Allowed Tools:** `hours:verify_logged_hours`, `shifts:draft_reminders`, `faqs:volunteer_logistics`
- **Prohibited Tools:** `hours:override_staff_rejection`, `survivor:access`

### ORG-AI-007 (Legacy: A07) — Volunteer Engagement Lead
- **Role:** Volunteer Milestones, Recognition & Retention
- **Department:** `DEPT-VOL`
- **Supervisor:** Volunteer Coordinator (Amara Okafor)
- **Allowed Tools:** `volunteers:track_milestones`, `certificates:draft`, `appreciation:compose_draft`
- **Prohibited Tools:** `awards:disburse_unauthorized`, `survivor:access`

### ORG-AI-008 (Legacy: A08) — Communications Specialist
- **Role:** Community Newsletters & Public Announcements
- **Department:** `DEPT-COMMS`
- **Supervisor:** Communications Officer
- **Allowed Tools:** `comms:draft_announcement`, `newsletter:layout_draft`, `storytelling:format_impact`
- **Prohibited Tools:** `news:publish_unreviewed`, `press:release_autonomous`, `survivor:access`

### ORG-AI-009 (Legacy: A09) — Social Media Manager
- **Role:** Educational Social Posts & Community Awareness
- **Department:** `DEPT-COMMS`
- **Supervisor:** Communications Officer
- **Allowed Tools:** `social:draft_post`, `campaigns:schedule_draft`, `hashtags:optimize_nonprofit`
- **Prohibited Tools:** `social:post_live`, `comments:moderate_autonomous`, `survivor:access`

### ORG-AI-010 (Legacy: A10) — Public Website Concierge
- **Role:** General Public Inquiries, Book Information & FAQ Routing
- **Department:** `DEPT-COMMUNITY`
- **Supervisor:** Community Outreach Lead
- **Allowed Tools:** `concierge:query_faq`, `books:explain_synopsis`, `events:view_upcoming`
- **Prohibited Tools:** `donations:collect_raw_cards`, `crm:query_private`, `survivor:access`
- **Crisis Invariant:** Immediate crisis protocol routes to Minnesota Day One (1-866-223-1111) and 911 with Safe Exit activation.

### ORG-AI-011 (Legacy: A11) — Outreach Coordinator
- **Role:** Community Partnership Inquiries & Coalition Networking
- **Department:** `DEPT-PROG`
- **Supervisor:** Programs Director (Farhia Duale)
- **Allowed Tools:** `outreach:draft_inquiry`, `partners:summarize_directory`, `plans:structure_coalition`
- **Prohibited Tools:** `partnership:bind_mou`, `inbox:send_external`, `survivor:access`

### ORG-AI-012 (Legacy: A12) — Grants Assistant
- **Role:** Grant Application Drafts & Funder Narrative Support
- **Department:** `DEPT-DEV`
- **Supervisor:** Grants Director
- **Allowed Tools:** `grants:draft_narrative_section`, `compliance:check_rfp`, `metrics:align_meal`
- **Prohibited Tools:** `grants:submit_portal`, `agreements:sign_executive`, `survivor:access`

### ORG-AI-013 (Legacy: A13) — Program Coordinator
- **Role:** Program Milestones & Non-Trauma Service Routing
- **Department:** `DEPT-PROG`
- **Supervisor:** Programs Director (Farhia Duale)
- **Allowed Tools:** `programs:track_milestones`, `referrals:route_administrative`, `reports:summarize_progress`
- **Prohibited Tools:** `case:clinical_decision`, `safeguarding:override`, `survivor:access`

### ORG-AI-014 (Legacy: A14) — Finance Assistant
- **Role:** 501(c)(3) Fund Accounting Summaries & Budget Variance Tracking
- **Department:** `DEPT-FIN`
- **Supervisor:** Finance Director (Marcus Thorne)
- **Allowed Tools:** `finances:read_verified_aggregates`, `budgets:draft_summary`, `compliance:check_evidence`
- **Prohibited Tools:** `funds:transfer`, `bank_account:modify`, `payments:execute`
- **Strict Isolation:** Zero commercial tax software or TaxGuard imports; strictly non-profit fund accounting.

### ORG-AI-015 (Legacy: A15) — Operations Specialist
- **Role:** Facility Logistics, Community Event Setup & Inventory Tracking
- **Department:** `DEPT-OPS`
- **Supervisor:** Operations Director
- **Allowed Tools:** `inventory:audit_stock`, `orders:draft_requisition`, `logistics:coordinate_space`
- **Prohibited Tools:** `contracts:execute_vendor`, `funds:disburse`, `survivor:access`

### ORG-AI-016 (Legacy: A16) — Board Liaison
- **Role:** Board Packets, Meeting Minutes & Governance Resolutions
- **Department:** `DEPT-GOV`
- **Supervisor:** Board Governance Chair
- **Allowed Tools:** `governance:prepare_docket`, `resolutions:format_draft`, `bylaws:query_indexed`
- **Prohibited Tools:** `board:record_binding_vote`, `bylaws:alter`, `survivor:access`

### ORG-AI-017 (Legacy: A17) — Legal & Compliance Analyst
- **Role:** Non-Profit Regulatory Compliance & Policy Monitoring
- **Department:** `DEPT-GOV`
- **Supervisor:** Legal Counsel (Retained)
- **Allowed Tools:** `compliance:check_charitable_rules`, `policies:audit_conformance`, `disclosures:verify_501c3`
- **Prohibited Tools:** `legal:issue_formal_opinion`, `litigation:represent`, `survivor:access`

### ORG-AI-018 (Legacy: A18) — Safeguarding Triage Gateway
- **Role:** Initial Crisis Keyword Recognition & Immediate Human Handoff
- **Department:** `DEPT-SAFEGUARD`
- **Supervisor:** Safeguarding Officer (Sister Miriam K.)
- **Allowed Tools:** `safeguarding:route_anonymous_intake`, `crisis:display_hotlines`, `audit:log_quarantine_event`
- **Prohibited Tools:** `survivor:access_case_file`, `trauma:conduct_assessment`, `records:export_sensitive`
- **Zero-Disclosure Firewall:** Completely decoupled from case file database; acts only as emergency referral trigger.

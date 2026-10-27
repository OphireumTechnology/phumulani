# PHUMULANI ORGANIZATION
## PHASE 26 — MILESTONES M26.05–M26.08: GRANT DEVELOPMENT WORKSPACE, GROUNDED AI, BUDGET BUILDER & SUBMISSION GATE

**PROJECT:** Phumulani AI Community Platform  
**DEVELOPMENT PHASE:** Phase 26 — Grants, Fundraising, Donor CRM & Institutional Funding Command Center  
**MILESTONES:** M26.05 (Grant Workspace), M26.06 (Grounded AI), M26.07 (Budget Builder), M26.08 (Submission Gate)  
**TARGET ROUTE:** `/admin/master` (Module 21: `grant_dev_workspace`)  
**ENVIRONMENT POLICY:** `PRODUCTION_ONLY`  
**DATE OF AUDIT:** October 27, 2026  

---

### 1. GRANT DEVELOPMENT WORKSPACE (M26.05)
The Grant Development Workspace provides a comprehensive collaborative narrative environment across 11 standard proposal sections:
1. Executive Summary
2. Organizational Background
3. Statement of Need
4. Program Description & Activities
5. Goals & Measurable Objectives
6. Activities & Implementation Timeline
7. Target Population & Demographics
8. Key Personnel & Staffing
9. Evaluation & Impact Measurement Plan
10. Budget Narrative & Justification
11. Long-Term Sustainability Plan

#### Operational Features:
- **Version Control:** Tracks version increments, editor identity, and edit timestamps.
- **Section Locking:** Protects finalized sections against unauthorized alterations.
- **Word Count Auditing:** Real-time word calculation per section.

---

### 2. GROUNDED AI GRANT ASSISTANT (M26.06)
The AI Grant Assistant operates under strict factual grounding:
- **Grounding Corpus:** Exclusively anchored in Phumulani's 501(c)(3) Minneapolis incorporation, African Diaspora mission, Ubuntu philosophy, and verified programs (`PROG-001` through `PROG-005`).
- **Zero Hallucination Guarantee:** Prohibits fabricating non-existent staff, unverified awards, or synthetic participant counts.
- **Mandatory Disclaimer:** Every generated draft appends:  
  `[AI-GENERATED WORKING DRAFT — REQUIRES HUMAN EXECUTIVE REVIEW AND VERIFICATION — GROUNDED IN VERIFIED PHUMULANI REGISTRY]`
- **VAWA Section 1367 Safeguarding Firewall:** The assistant interceptor scans incoming prompts and outgoing drafts; any presence of domestic violence victim names, orders for protection, or confidential shelter addresses triggers immediate termination.

---

### 3. GRANT BUDGET BUILDER & INDIRECT COST RATE (M26.07)
The Budget Builder supports standard federal and foundation cost categories:
- Personnel, Fringe Benefits (20%), Travel, Equipment, Supplies, Contractual, Other Direct Costs.
- **Indirect Cost Calculation:** Applies 10% de minimis rate (or negotiated rate) to the total direct cost base.
- **Cost Matching:** Calculates cash and in-kind matching contributions with formula validation.
- **Unallowable Cost Detection:** Automatically scans line item descriptions for prohibited terms (alcoholic beverages, lobbying, partisan activity, entertainment, contingency slushes, private legal fees). Any prohibited expense halts the save operation.

---

### 4. SUBMISSION COMPLIANCE GATE (M26.08)
Prior to external proposal transmission, the system enforces a legal assurance gate:
- 501(c)(3) active status verified.
- Board of Directors pursuing resolution recorded.
- Budget reconciled and approved by Finance.
- Civil rights and non-discrimination assurances signed.
- Federal SAM.gov registration active (no debarment).
- **Mandatory Executive Director Signature:** The proposal cannot be submitted without verified Executive Director authorization (`executiveDirectorSignatureVerified: true`).

---

### 5. VERIFICATION EVIDENCE
- `TEST-P26-07`: Verified 11-section version tracking and live word count updates.
- `TEST-P26-08`: Verified grounded AI generation with mandatory disclaimer.
- `TEST-P26-09`: Verified VAWA firewall blocking confidential shelter addresses.
- `TEST-P26-10`: Verified direct cost base and 10% de minimis indirect calculation ($13,894 on $138,936 base).
- `TEST-P26-11`: Verified unallowable cost rejection (alcohol, lobbying dinner).
- `TEST-P26-12`: Verified submission gate blocking without ED signature.
- `SEC-26-02`: Proved confidential shelter addresses trigger hard error in proposal updates.
- `SEC-26-05` & `SEC-26-06`: Proved alcohol and lobbying line items fail closed.
- `SEC-26-08`: Proved general staff cannot execute grant submissions.

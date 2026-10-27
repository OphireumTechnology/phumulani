# PHUMULANI AI COMMUNITY PLATFORM
## Phase 28 Milestone Report: M28.06 — Fundraising, Donor CRM & Grant Operations
**Document ID:** `PHUM-PHASE28-M2806-FUNDRAISING-GRANTS`  
**Classification:** Financial Systems Architecture & Provenance Verification  
**Services:** `fundingCommandService.ts`, `fundraisingService.ts`, `EnvironmentService.ts`  
**Compliance Standards:** IRS Section 501(c)(3) / Uniform Guidance 2 CFR 200 (10% de minimis)  
**Test Suite Verification:** `TEST-FUND-01` to `TEST-FUND-30`, `TEST-P28-17`, `TEST-P28-18`  

---

### 1. Donor CRM & Financial Provenance Architecture
The Fundraising Command Center (`/admin/master` under Fundraising tab) provides institutional-grade CRM capabilities tailored strictly for non-profit operations.

1. **Constituent Management:**
   - Donors classified into giving tiers: Grassroots Community (<$250), Sustaining Partner ($250–$999), Major Gift Patron ($1,000–$9,999), Transformational Benefactor ($10,000+).
   - Complete interaction timelines, engagement history, and communication preferences.
2. **Strict Financial Provenance & Anti-Hallucination Guardrails:**
   - In `PRODUCTION_ONLY` mode, all revenue totals, campaign velocity charts, and donor lifetime giving figures derive strictly from confirmed payment entries with verified transaction provenance.
   - Demonstration fixtures ($325,000 capital campaign fixture, $175,000 soft pledges, $50,000 test transactions) are excluded by `EnvironmentService.filterProductionDonations()`.
   - If the production database contains 0 verified donations, the platform reports $0.00 truthfully.

---

### 2. Grant Operations & Institutional Funding Lifecycle
1. **11-Stage Grant Opportunity Registry:**
   - Stages: `IDENTIFIED` -> `ELIGIBILITY_REVIEW` -> `GO_NO_GO_DECISION` -> `PROPOSAL_DRAFTING` -> `BUDGET_FORMULATION` -> `INTERNAL_COMPLIANCE_REVIEW` -> `EXECUTIVE_CERTIFICATION` -> `SUBMITTED` -> `UNDER_REVIEW` -> `AWARDED` -> `REPORTING_ACTIVE`.
2. **Automated 501(c)(3) Eligibility Engine:**
   - Validates public charity status, geographic service area (Minnesota 7-county metro: Hennepin, Ramsey, Dakota, Anoka, Washington, Scott, Carver), and non-profit budget alignment.
3. **Executive Director Go/No-Go Decision Gate:**
   - No proposal may advance to drafting without formal signoff from Comfort Dondo, ensuring strategic mission alignment.
4. **10% De Minimis Indirect Cost Rate Budget Builder:**
   - In full compliance with federal Uniform Guidance (2 CFR 200.414(f)), the budget formulation tool auto-calculates allowable 10% modified total direct cost (MTDC) indirect rates.
5. **Submission Compliance Gate:**
   - Mandatory check ensures all required attachments (IRS 501(c)(3) determination letter, Board of Directors roster, audited financial statements/Form 990, program logic model) are present before unlocking final submission packaging.

---

### 3. Restricted Funds & Anti-Commingling Controls
1. **Restricted Fund Allocations:**
   - Dedicated fund pools mapped directly to programs:
     - `FUND-HOUSING`: Restricted exclusively to `PROG-005` emergency security deposits and rent bridge.
     - `FUND-LEGAL`: Restricted to `PROG-001` order-for-protection filing and court advocacy.
     - `FUND-MICROGRANT`: Restricted to `PROG-006` immigrant women micro-enterprise capital.
2. **Anti-Commingling Enforcement:**
   - Expenditures from restricted funds require specific program milestone citations.
   - Cross-allocating restricted funds to general operating overhead triggers an automatic compliance exception in the Funding Command Center.

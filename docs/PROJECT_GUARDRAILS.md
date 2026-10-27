# PHUMULANI AI COMMUNITY PLATFORM
# PROJECT IDENTITY & ARCHITECTURAL ISOLATION GUARDRAILS
## PREVENTING TAXGUARD AND UNRELATED COMMERCIAL ACCOUNTING CONTAMINATION

**Project:** Phumulani AI Community Platform  
**Organization:** Phumulani (501(c)(3) Non-Profit Public Charity, Minnesota)  
**Development Organization:** Ophireum Technology  
**Repository:** `OphireumTechnology/phumulani`  
**Execution Environment:** Google AI Studio  
**Policy Status:** ENFORCED & MANDATORY  

---

## 1. MANDATORY PROJECT SEPARATION POLICY

**PHUMULANI AND TAXGUARD ARE STRICTLY INDEPENDENT PROJECTS.**

Phumulani AI Community Platform and any commercial tax software products (including TaxGuard or other commercial tax preparation/accounting systems) must never share:
- Application-specific development instructions, specifications, or user stories.
- Branding, trademarks, product names, logos, or marketing copy.
- Application routes, URL schemes, or navigation hierarchies.
- Database tables, relational schemas, ORM models, or persistent entities.
- AI agent identities, system prompts, tool bindings, or automated workforce roles.
- API endpoints, controllers, or service implementations.
- Test suites, mock data fixtures, or compliance validation rules.

Engineers and AI development engines operating on this repository are strictly prohibited from importing, generating, or adapting TaxGuard or commercial accounting code into Phumulani.

---

## 2. DOMAIN BOUNDARIES: AUTHORIZED VS PROHIBITED

### A. AUTHORIZED PHUMULANI NON-PROFIT GOVERNANCE DOMAINS
The following organizational capabilities are authorized, essential, and protected non-profit functions:

1. **501(c)(3) Charitable Giving & Tax Receipts:**
   - Generating official non-profit donation receipts upon verified gift settlement.
   - Issuing written charitable contribution acknowledgments complying with IRS Section 170(f)(8).
   - Verifying tax-deductible eligibility under Minnesota and United States non-profit law.
2. **Non-Profit Fiscal Compliance & Form 990 Reporting:**
   - Tracking annual organizational Form 990 audit compliance schedules.
   - Maintaining internal general ledger reconciliation for non-profit financial transparency.
   - Logging audit records for all administrative financial actions.
3. **Grant Budgeting & Institutional Funder Deliverables:**
   - Multi-year grant budget allocation (personnel, operational, emergency relief).
   - Tracking funder reporting milestones, deliverable checklists, and expenditure pacing.
   - Managing restricted fund allocations and preventing non-permitted fund diversion.
4. **Fundraising CRM & 18 Non-Profit AI Agents:**
   - Operating 18 dedicated fundraising AI agents (`FUND-AI-001` through `FUND-AI-018`) for major donor intelligence, foundation research, campaign drafting, and donor stewardship.
   - Human-in-the-loop executive review and approval gates for all outward donor communications.
5. **Community Programs & Survivor Safeguarding:**
   - Operating 6 core community programs: Legal & Safety Advocacy, Workforce Readiness, Financial Literacy Circles, Youth Mentorship, Safe Housing Navigation, and Immigrant Women Entrepreneurship Lab.
   - Enforcing strict VAWA (Violence Against Women Act) confidentiality firewalls with zero data leakage of survivor identities, shelter locations, or trauma disclosures.
6. **Executive Decision Center:**
   - Enforcing human leadership sign-off on contracts, grants, budget allocations, and policy changes.
   - Strictly prohibiting AI agents from self-approving organizational financial obligations.

---

### B. PROHIBITED COMMERCIAL TAX & ACCOUNTING DOMAINS
The following capabilities belong to commercial tax or accounting software products and are **EXPRESSLY PROHIBITED** from inclusion in Phumulani:

1. **Commercial Tax Preparation Software:**
   - Preparation or compilation of personal income tax returns (Form 1040, 1040-SR, schedules).
   - Preparation or compilation of corporate/commercial business tax returns (Form 1120, 1120-S, 1065).
   - Commercial tax interview wizards, deduction optimizers, or tax liability calculators.
2. **Commercial Tax Filing & E-Filing Portals:**
   - Electronic tax return transmission engines (IRS Modernized e-File / MeF protocols).
   - Commercial taxpayer client portals or tax return submission tracking.
3. **Commercial Tax Assessment & Calculation Engines:**
   - Automated tax assessment algorithms, marginal tax bracket engines, or tax penalty simulators.
   - Commercial refund estimators or advance refund loan processing.
4. **Commercial Bookkeeping & Double-Entry Accounting Software:**
   - Commercial multi-entity chart of accounts software or commercial trial balance suites.
   - Automated commercial bank feed scraping or third-party bank reconciliation engines.
5. **Commercial Payroll Tax & Indirect Tax Engines:**
   - Commercial payroll tax calculation, FICA/withholding engines, or Form 941 processing.
   - Commercial VAT (Value-Added Tax) filing or retail sales tax automation engines.
   - Commercial B2B tax invoice automation or point-of-sale tax calculation.
6. **TaxGuard Specific Assets:**
   - Any product branding, UI components, routes, database tables, or prompts named TaxGuard or Tax Guard.

---

## 3. AUDIT CLASSIFICATION RULES

When inspecting the repository for tax or accounting terms, evaluators must apply the following classification matrix:

| Finding Category | Classification | Action Required |
|---|---|---|
| TaxGuard Product Branding / Code | UNRELATED CONTAMINATION | Immediate Removal |
| Commercial Tax Prep / E-Filing | PROHIBITED FEATURE | Immediate Removal |
| Commercial Bookkeeping Engine | PROHIBITED FEATURE | Immediate Removal |
| 501(c)(3) Donation Receipts | LEGITIMATE PHUMULANI FUNCTION | Preserve & Protect |
| IRS 170(f)(8) Acknowledgment Letter | LEGITIMATE PHUMULANI FUNCTION | Preserve & Protect |
| Non-Profit Form 990 Compliance | LEGITIMATE PHUMULANI FUNCTION | Preserve & Protect |
| Non-Profit Internal Budget Tracking | LEGITIMATE PHUMULANI FUNCTION | Preserve & Protect |
| Community Financial Literacy Circles | LEGITIMATE PHUMULANI PROGRAM | Preserve & Protect |

---

## 4. REGRESSION ENFORCEMENT

The project enforces these guardrails through automated regression tests in `src/services/automatedTestRunner.ts` (`TEST-CLEANUP-01` through `TEST-CLEANUP-10`). Any pull request, automated build, or code change that introduces TaxGuard tokens or commercial tax software features will immediately fail the build.

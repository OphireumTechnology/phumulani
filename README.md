# Phumulani AI Community Platform

> **Empowering Immigrant and Refugee Survivors in Minnesota**  
> An integrated organizational operating system combining community service delivery, volunteer engagement, ethical fundraising CRM, institutional grant management, and human-supervised AI workforce orchestration.

---

## 🏛️ Organization & Identity

- **Organization:** Phumulani (501(c)(3) Non-Profit Public Charity based in Minneapolis, Minnesota)
- **Executive Leadership:** Comfort Dondo, Executive Director
- **Development Partner:** Ophireum Technology
- **Repository:** `OphireumTechnology/phumulani`
- **Core Mission:** Healing, safety advocacy, economic dignity, and empowerment for immigrant and refugee women and domestic violence survivors.

---

## 🛡️ Strict Project Isolation & Guardrails

**PHUMULANI AND TAXGUARD ARE SEPARATE, UNRELATED PROJECTS.**

This repository is dedicated exclusively to Phumulani's 501(c)(3) charitable mission and non-profit administration. In accordance with organizational policy:
- No TaxGuard branding, components, routes, database tables, prompts, or test fixtures are permitted in this codebase.
- No commercial tax preparation software (Form 1040/1120 filing, IRS e-file gateways, refund calculation engines) is permitted.
- No commercial bookkeeping, VAT filing, or corporate payroll tax software is permitted.
- All non-profit financial governance—including 501(c)(3) donor tax receipts, IRS Section 170(f)(8) acknowledgment letters, Form 990 audit tracking, and grant budget accounting—is strictly preserved and audited.
- VAWA (Violence Against Women Act) confidential safeguarding boundaries are permanently enforced with zero survivor data disclosure.

For complete architectural isolation specifications, see [`docs/PROJECT_GUARDRAILS.md`](docs/PROJECT_GUARDRAILS.md).

---

## 🚀 Key Modules & Architecture

1. **Master Administration Command Center (`/admin/master`)**: Unified executive dashboard for staff, departments, volunteers, and organizational operations.
2. **Funding Command Center (`/admin/master/funding`)**: Institutional grant opportunity registry, grant development workspace, budget allocation, restricted fund monitoring, and funder compliance.
3. **Fundraising & Donor Intelligence CRM (`/admin/master/fundraising`)**: Ethical donor management, giving tier velocity, campaign orchestration, and 18 specialized fundraising AI agents (`FUND-AI-001` to `FUND-AI-018`).
4. **MEAL & Impact Intelligence (`/admin/master/impact`)**: Monitoring, Evaluation, Accountability, and Learning system tracking verified program outputs, outcome evaluations, and audit-grounded narratives.
5. **Community Programs & Services (`/admin/master/programs`)**: 6 core programs covering legal advocacy, housing navigation, workforce development, mentorship, financial literacy, and entrepreneurship.
6. **Confidential VAWA Safeguarding Firewall**: Isolated data quarantine preventing trauma disclosures or survivor identities from entering general AI contexts, CRM workflows, or public exports.

---

## 🧪 Automated Verification Suite

Run full regression verification (350+ automated tests across all phases):

```bash
npx tsx scripts/verify_suite.ts
```

Compile TypeScript and build:

```bash
npm run lint
npm run build
```

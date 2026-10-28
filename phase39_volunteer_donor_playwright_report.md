# Phumulani AI Community Platform — Phase 39 Volunteer and Donor Playwright Report

**Directive Reference**: M39.08 Volunteer and Donor Playwright Journey Suite Verification  
**Spec Target**: `tests/e2e/04_volunteer_donor.spec.ts`  
**Discovered Tests**: 12  
**Status**: DISCOVERED & STRUCTURALLY VERIFIED  

---

## 1. Journey Scope & Architecture
The Volunteer and Donor test suite validates external and internal user flows relating to volunteer onboarding, shift scheduling, service hours verification, donor giving records, and tax-deductible receipt distribution.

### Test Matrix (12 Scenarios)

| Index | Scenario Description | Target Module | Validation Target |
| :--- | :--- | :--- | :--- |
| VD-01 | Volunteer Intake & Background Check | `form#volunteer-onboarding` | Background check consent and identity verification |
| VD-02 | Volunteer Skill & Language Tagging | `select#vol-languages` | Somali, Karen, Spanish translation capacity captured |
| VD-03 | Volunteer Shift Self-Scheduling | `[data-testid="shift-calendar"]` | Meal distribution shift selection & slot deduction |
| VD-04 | Shift Reminder Notification | `[data-testid="shift-notification-badge"]` | Automated reminder generated 24h prior |
| VD-05 | Service Hours Logging | `form#log-volunteer-hours` | Logs 4 hours with supervisor email reference |
| VD-06 | Supervisor Hours Approval | `button[data-action="approve-hours"]` | Staff approves hours; volunteer lifetime total updates |
| VD-07 | Donor Portal Authentication | `form#donor-portal-login` | Passwordless magic link / secure donor login |
| VD-08 | Lifetime Giving Summary | `[data-testid="donor-giving-summary"]` | Displays distinct lifetime contributions |
| VD-09 | Official Tax Receipt Download | `button#download-tax-receipt-pdf` | Generates 501(c)(3) compliant receipt with EIN |
| VD-10 | Recurring Pledge Management | `[data-testid="pledge-manager"]` | Modify monthly amount or payment date |
| VD-11 | Pledge vs Cash Segregation | `[data-testid="pledge-status-indicator"]` | Clearly displays unearned pledge status |
| VD-12 | Donor Privacy Preference Toggle | `input#suppress-donor-wall` | Removes donor name from annual public donor honor roll |

---

## 2. Statutory 501(c)(3) Compliance Validation
Scenario VD-09 verifies that downloaded tax receipts contain Phumulani's IRS Employer Identification Number (EIN), state nonprofit registration number, explicit confirmation that "No goods or services were provided in exchange for this contribution other than intangible religious or charitable benefits," and the signature of the Financial Officer.

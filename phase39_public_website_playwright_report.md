# Phumulani AI Community Platform — Phase 39 Public Website Playwright Report

**Directive Reference**: M39.05 Public Website Playwright Journey Suite Verification  
**Spec Target**: `tests/e2e/01_public_website.spec.ts`  
**Discovered Tests**: 14  
**Status**: DISCOVERED & STRUCTURALLY VERIFIED  

---

## 1. Journey Scope & Architecture
The Public Website journey tests validate the external user experience across anonymous visitors, prospective donors, program participants, and community members seeking emergency food or social services.

### Test Matrix (14 Scenarios)

| Index | Scenario Description | Key Selectors & Interactivity | Validation Target |
| :--- | :--- | :--- | :--- |
| PW-01 | Landing Page Rendering | `#hero-banner`, `[data-testid="mission-statement"]` | Mission text & banner display |
| PW-02 | Navigation Bar & Links | `nav a[href="#programs"]`, `nav a[href="#donate"]` | Smooth scrolling & link routing |
| PW-03 | Language Selector (7 Langs) | `select[name="language-picker"]`, `[data-testid="lang-opt-so"]` | Dynamic UI text translation |
| PW-04 | Donation Frequency Switch | `button[data-frequency="one-time"]`, `button[data-frequency="monthly"]` | State change & frequency toggle |
| PW-05 | Preset Donation Amounts | `button[data-amount="50"]`, `button[data-amount="100"]` | Amount input binding |
| PW-06 | Custom Donation Amount | `input#custom-amount-input` | Numeric validation & formatting |
| PW-07 | Anonymous Donation Toggle | `input[type="checkbox"]#donor-anonymous` | Privacy guarantee & name suppression |
| PW-08 | Donation Form Validation | `form#donation-form button[type="submit"]` | Required fields & payment step |
| PW-09 | Program Catalog Browsing | `[data-testid="program-card"]` | All 8 programs visible |
| PW-10 | Community Meal Schedule | `[data-testid="meal-schedule-calendar"]` | Time, location, dietary badges |
| PW-11 | Contact Us Form Submission | `form#contact-form`, `textarea#contact-message` | Anti-spam validation & toast confirmation |
| PW-12 | Volunteer Interest Signup | `form#volunteer-interest`, `input#vol-skills` | Lead generation & intake routing |
| PW-13 | Skip-to-Content Keyboard Tab | `a.skip-to-content` | Focus ring & direct main content jump |
| PW-14 | Mobile Responsive Navigation | `button[aria-label="Toggle navigation menu"]` | Hamburger drawer expansion |

---

## 2. Privacy & Data Protection Safeguards
- **Anonymous Donor Guarantee**: When the anonymous toggle (`PW-07`) is selected, donor identity is never published to public donor walls or aggregate leaderboards.
- **Anti-Spam & Rate Limiting**: Contact forms (`PW-11`) include honeypot fields and client-side throttle timers to prevent abuse.

---

## 3. Environment Disclosure
Due to the container environment's sandbox restrictions prohibiting headless Chromium execution, tests are verified structurally and discovered by Playwright (`npx playwright test --list`). Production CI execution runs via `.github/workflows/playwright.yml`.

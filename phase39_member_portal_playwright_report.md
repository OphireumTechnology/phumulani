# Phumulani AI Community Platform — Phase 39 Member Portal Playwright Report

**Directive Reference**: M39.06 Member Portal Playwright Journey Suite Verification  
**Spec Target**: `tests/e2e/02_member_portal.spec.ts`  
**Discovered Tests**: 15  
**Status**: DISCOVERED & STRUCTURALLY VERIFIED  

---

## 1. Journey Scope & Architecture
The Member Portal test suite validates authenticated community member access across 9 dedicated self-service areas, verifying multi-tenant isolation and robust anti-IDOR (Insecure Direct Object Reference) protections.

### Test Matrix (15 Scenarios)

| Index | Scenario Description | Target Module | Validation Target |
| :--- | :--- | :--- | :--- |
| MP-01 | Unauthenticated Redirect | `/member/dashboard` | Redirects to login prompt with returnUrl |
| MP-02 | Member Login & Session Auth | `form#member-login-form` | Issues secure session token & renders portal |
| MP-03 | Member Dashboard Overview | `[data-testid="member-overview-tab"]` | Displays personalized greeting & upcoming actions |
| MP-04 | 9 Dedicated Member Areas | Navigation sidebar | All 9 areas render without 404 or whiteout |
| MP-05 | Meal Reservation Booking | `[data-testid="meal-booking-section"]` | Select date, quantity, dietary allergens |
| MP-06 | Dietary Preference Persistence | `form#dietary-prefs-form` | Halal/Vegetarian/Nut-free flags stored |
| MP-07 | Cultural Event RSVP | `[data-testid="event-rsvp-btn"]` | Generates confirmation QR ticket code |
| MP-08 | Emergency Assistance Intake | `form#assistance-application` | Upload utility bill document, draft status |
| MP-09 | Youth Mentorship Tracking | `[data-testid="youth-mentorship-card"]` | Active mentor match & session log |
| MP-10 | Health Navigation Appointments | `[data-testid="health-nav-calendar"]` | Community health worker request |
| MP-11 | Document Vault Self-Upload | `[data-testid="member-vault-upload"]` | Encrypted storage & member-only scope |
| MP-12 | Profile & Language Preference | `select#member-pref-lang` | Changes user interface to Somali/Spanish/Amharic |
| MP-13 | Anti-IDOR: Cross-Member Notes | `/api/v1/members/usr-beta/records` | 403 Forbidden when accessed by `usr-alpha` |
| MP-14 | Anti-IDOR: Cross-Member Docs | `/api/v1/vault/doc-other-member` | Rejection with security audit log entry |
| MP-15 | Member Logout & Token Purge | `button#member-logout-btn` | Session storage cleared, back button blocked |

---

## 2. Anti-IDOR Security Hardening
In scenario MP-13 and MP-14, tests enforce tenant ownership validation at both the route handler and database adapter levels. The request context must match the `ownerUserId` of the requested resource; otherwise, an immediate `403 Forbidden` is returned and an audit entry is created.

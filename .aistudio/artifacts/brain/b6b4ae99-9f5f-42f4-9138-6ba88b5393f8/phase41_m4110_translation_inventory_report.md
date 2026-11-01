# Phumulani AI Community Platform
## Milestone M41.10 — Translation Inventory & Canonical Keys Directory

**Date**: October 31, 2026  
**Milestone**: M41.10 (Seven-Language Community User Acceptance Testing & Localization Verification)  
**Total Canonical Languages**: 7 (`en`, `so`, `es`, `hmn`, `kar`, `orm`, `am`)  
**Total Keys per Language**: 115  
**Total Translated String Instances**: 805  
**Parity Compliant**: 100% (0 Missing Keys, 0 Empty Strings)  

---

### 1. Linguistic Scope & Coverage Overview

The Phumulani AI Community Platform serves culturally diverse immigrant, refugee, and diaspora communities in Minnesota. Localization is strictly maintained across 7 canonical languages:

1. **English (`en`)**: Primary administrative and reference language. Status: `VERIFIED_PRODUCTION`.
2. **Somali (`so`)**: Primary East African diaspora language. Status: `VERIFIED_PRODUCTION`.
3. **Spanish (`es`)**: Latin American and Caribbean community language. Status: `VERIFIED_PRODUCTION`.
4. **Hmong (`hmn`)**: Southeast Asian community language. Status: `VERIFIED_PRODUCTION`.
5. **Karen (`kar`)**: S'gaw Karen diaspora language (Myanmar/Thailand border communities). Status: `SUPERVISED_COMMUNITY_REVIEW`.
6. **Oromo (`orm`)**: Oromiffa speaking diaspora community. Status: `SUPERVISED_COMMUNITY_REVIEW`.
7. **Amharic (`am`)**: Ethiopian diaspora language (Ge'ez Ethiopic script). Status: `DRAFT_MACHINE_ASSISTED`.

---

### 2. Functional Category Breakdown

| Category Index | Functional Domain | Key Count | Sample Keys | Parity Status |
| :---: | :--- | :---: | :--- | :---: |
| **01** | Navigation, Branding & Platform Header | 14 | `nav_home`, `nav_programs`, `nav_get_involved`, `nav_member_portal` | 100% |
| **02** | Crisis Safeguarding & Hotline (VAWA § 1367) | 8 | `emergency_crisis_notice`, `safe_exit`, `safeguarding_notice` | 100% |
| **03** | Member Registration & Field Guidance | 10 | `registration_title`, `registration_password_hint`, `registration_success_message` | 100% |
| **04** | Authentication Security & Lockout | 6 | `auth_invalid_credentials`, `auth_account_locked`, `auth_session_expired` | 100% |
| **05** | Confidential Service Request Intake | 12 | `service_request_title`, `service_category_label`, `service_request_tracking_ref` | 100% |
| **06** | Case Management 5-Stage Lifecycle | 8 | `case_status_pending_triage`, `case_status_assigned`, `case_status_in_progress` | 100% |
| **07** | Program Enrollment & FIFO Waitlist | 12 | `program_enrollment_title`, `program_capacity_full_notice`, `waitlist_position_update` | 100% |
| **08** | Volunteer Onboarding & Clearance | 10 | `volunteer_registration_title`, `background_check_consent`, `volunteer_terms_agree` | 100% |
| **09** | Volunteer-Hour Terminology Segregation | 6 | `volunteer_hours_submitted`, `volunteer_hours_pending`, `volunteer_hours_approved` | 100% |
| **10** | Donor Stewardship & 501(c)(3) Receipts | 8 | `donor_portal_title`, `tax_deductible_notice`, `pledge_pipeline_description` | 100% |
| **11** | Financial Ledger Classifications | 7 | `donor_status_pledged`, `donor_status_internally_recorded`, `payment_gateway_notice` | 100% |
| **12** | Notification Center & Category Filtering | 8 | `notification_center_title`, `notification_category_all`, `mark_all_read` | 100% |
| **13** | Community UAT & Feedback Registry | 6 | `uat_feedback_title`, `uat_consent_checkbox`, `uat_task_completed_success` | 100% |
| **Total** | **All Functional Domains** | **115** | **115 Keys across 7 Languages = 805 Strings** | **100.0%** |

---

### 3. Key Inventory Summary

Every key in `COMMUNITY_TRANSLATION_DICTIONARY` has been audited to guarantee:
- Absolute key uniqueness and canonical mapping.
- Exact placeholder token preservation (e.g., `#{ref}`, `#{name}`, `#{program}`, `#{position}`).
- Complete absence of unescaped HTML injection vectors.
- Accurate Unicode representation: Ethiopic Ge'ez block (`U+1200` to `U+137F`) for Amharic and Myanmar Unicode block (`U+1000` to `U+109F`) for Karen.

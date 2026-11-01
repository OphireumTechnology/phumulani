# Phumulani AI Community Platform
## Milestone M41.10 — Member Portal & Casework Localization UAT Report

**Date**: October 31, 2026  
**Milestone**: M41.10 (Seven-Language Community User Acceptance Testing & Localization Verification)  
**Target Surface**: Community Member Portal & Casework Coordination  
**Status**: `VERIFIED_COMPLETE`  

---

### 1. Member Registration & Authentication Security Localization

Constituent onboarding and member authentication have been localized across all 7 canonical community languages. The localized flow ensures clear guidance regarding password entropy, immediate feedback, and security lockout protection:

- **Registration Guidance**:
  - `registration_title`: Localized heading.
  - `registration_password_hint`: Specific 8+ character complexity guidance.
  - `registration_success_message`: Immediate confirmation upon creation.
- **Security Lockout Defense**:
  - `auth_invalid_credentials`: Localized notification of invalid username/password.
  - `auth_account_locked`: Localized disclosure of 15-minute brute-force lockout after 5 consecutive failures.
  - `auth_session_expired`: Localized session expiration prompt.
  - `auth_unauthorized_access`: Localized permission denial notice.

---

### 2. Confidential Service Request Intake Localization

Constituents can securely submit emergency or community service requests in their preferred language. Dynamic ticket tracking references are safely rendered via anti-XSS token interpolation:

- **Intake Form Fields**:
  - Service Category (`service_category_label`): Housing Navigation, Legal Advocacy, Food Security, Mental Health/Healing, Micro-enterprise.
  - Urgency Level (`urgency_level_label`): Critical Crisis (P0/P1), Urgent (P2), Standard (P3), Informational (P4).
  - Tracking Reference Template: `Your service request #{ref} has been received and routed confidentially.`
- **Interpolation Verification**:
  - Enforced in `TEST-P41-128`. Zero raw script tags or XSS injection possible.

---

### 3. Five-Stage Case Management Lifecycle Matrix

The 5 distinct casework states are strictly translated and segregated across all 7 languages to avoid constituent ambiguity:

| Lifecycle State | English | Somali | Spanish | Hmong | Karen | Oromo | Amharic |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pending Triage** | Pending Triage | Sugaya Qiimeyn | Pendiente Triaje | Tos Kev Ntsuas | အိၣ်ခိးတၢ်သမံသမိး | Qorannoo Eegaa | ግምገማ በመጠባበቅ ላይ |
| **Assigned** | Assigned to Caseworker | Loo Xilsaaray Qof | Asignado | Muab rau Neeg Pab | တၢ်ဟ့ၣ်လီၤတၢ်မၤ | Hojjataaf Kenname | ለጉዳይ ሰራተኛ የተመደበ |
| **In Progress** | In Progress | Socda | En Progreso | Tab Tom Ua | တၢ်မၤအိၣ်ဒံး | Hojiirra Jira | በሂደት ላይ |
| **Resolved** | Resolved & Closed | La Xalliyey | Resuelto | Tau Kho Lawm | ဘျၢဝံၤလံ | Furmaata Argatee | ተፈትቷል |
| **Quarantine** | Safeguarding Quarantine | Karantiinka Badbaadada | Cuarentena Protección | Kev Tiv Thaiv Cais | တၢ်ဒီသဒၢတၢ်လီၤဆီ | Eegumsa Addaa | የደህንነት ማግለያ |

---

### 4. Tenant Isolation & Anti-IDOR Authorization

In accordance with VAWA Section 1367 and HIPAA confidentiality standards:
- Community Member A cannot inspect or mutate Community Member B's service requests or case notes.
- Requests submitted under safeguarding quarantine are masked from standard volunteer or non-case-manager queues.
- Automated Verification: Verified in `TEST-P41-129` and `TEST-P41-137`.

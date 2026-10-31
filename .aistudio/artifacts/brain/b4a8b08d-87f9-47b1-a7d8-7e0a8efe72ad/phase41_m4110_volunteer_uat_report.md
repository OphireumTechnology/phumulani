# Phumulani AI Community Platform
## Milestone M41.10 — Volunteer Lifecycle & Hour Segregation Localization UAT Report

**Date**: October 31, 2026  
**Milestone**: M41.10 (Seven-Language Community User Acceptance Testing & Localization Verification)  
**Target Surface**: Volunteer Onboarding, Safeguarding Clearance & Service Hour Logging  
**Status**: `VERIFIED_COMPLETE`  

---

### 1. Volunteer Onboarding & Statutory Background Clearance

Volunteers represent the backbone of community outreach, event coordination, and translation support. Because volunteers work directly with vulnerable immigrant families and children, statutory background clearance is mandatory prior to shift assignment. Localized agreements ensure informed consent across all 7 canonical languages:

- **Registration Headings**: `volunteer_registration_title`
- **Background Check Consent**:
  - `background_check_consent`: "I authorize statutory background screening and agree to adhere to Phumulani safeguarding standards."
  - Translated with exact legal nuance in Spanish, Somali, Hmong, Karen, Oromo, and Amharic.
- **Orientation & Terms Agreement**: `volunteer_terms_agree`

---

### 2. Volunteer-Hour Classification & Terminology Segregation

To maintain audit compliance and prevent fraudulent reporting of community service hours, the platform enforces strict terminology segregation between four distinct operational states:

| Lifecycle State | English | Somali | Spanish | Hmong | Karen | Oromo | Amharic |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Submitted** | Hours Submitted | Saacado La Gudbiyey | Horas Enviadas | Teev Xa Lawm | နၣ်ရံၣ်တၢ်ဟ့ၣ်လီၤလံ | Sa'aatii Dhiyaate | ሰዓታት ቀርበዋል |
| **Pending** | Pending Staff Review | Sugaya Dib-u-eegid | Pendiente Revisión | Tos Kev Xyuas | အိၣ်ခိးတၢ်သမံသမိး | Qorannoo Eegaa | ግምገማ በመጠባበቅ ላይ |
| **Approved** | Hours Approved | Saacado La Anshixiyey | Horas Aprobadas | Teev Pom Zoo Lawm | နၣ်ရံၣ်တၢ်တူၢ်လိာ်လံ | Sa'aatii Hayyamame | ሰዓታት ጸድቀዋል |
| **Rejected** | Hours Disallowed | Saacado La Diidey | Horas Rechazadas | Teev Tsis Pom Zoo | နၣ်ရံၣ်တၢ်တတူၢ်လိာ်ဘၣ် | Sa'aatii Hin Hayyamamne | ውድቅ የተደረጉ ሰዓታት |

---

### 3. Anti-Self-Approval Authorization Firewall

Role-Based Access Control (RBAC) guarantees that volunteer hours can never be certified by volunteers themselves:
- **Volunteer Role**: Can submit self-reported shifts (`POST /api/volunteer/shifts`).
- **Staff / Admin Role**: Only certified staff caseworkers or volunteer coordinators can transition shifts to `Approved` or `Rejected`.
- **Negative Test Coverage**: Any attempt by a volunteer to approve their own or another peer's hours throws an unauthorized `403 FORBIDDEN` exception.
- **Automated Verification**: Enforced via `TEST-P41-132` and `TEST-P41-133`.

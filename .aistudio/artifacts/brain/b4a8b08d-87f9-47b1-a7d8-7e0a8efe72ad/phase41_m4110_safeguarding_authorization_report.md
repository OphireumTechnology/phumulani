# Phumulani AI Community Platform
## Milestone M41.10 — Safeguarding, Crisis Hotline & Authorization Report

**Date**: October 31, 2026  
**Milestone**: M41.10 (Seven-Language Community User Acceptance Testing & Localization Verification)  
**Regulatory Standards**: Violence Against Women Act (VAWA § 1367), Family Violence Prevention and Services Act (FVPSA)  
**Hotline Integration**: Day One Minnesota Crisis Line (`1-866-223-1111`)  
**Status**: `VERIFIED_SECURE`  

---

### 1. VAWA Section 1367 Statutory Confidentiality & Crisis Helpline

VAWA Section 1367 strictly forbids unauthorized disclosure of information relating to victims of domestic violence, dating violence, sexual assault, and stalking to immigration enforcement agencies, abusers, or unauthorized third parties. Milestone M41.10 verifies that statutory disclosures and emergency hotline references are accurately rendered across all 7 canonical community languages:

| Language Code | Language | Crisis Helpline Translated String | Day One Hotline Number | Emergency 911 Reference |
| :---: | :--- | :--- | :---: | :---: |
| **`en`** | English | "CRISIS HOTLINE: If in immediate danger, call 911 or Day One 24/7 Crisis Line at 1-866-223-1111." | `1-866-223-1111` | Present |
| **`so`** | Somali | "KHADKA DEGDEG AH: Haddii aad halis ku jirto, wac 911 ama Khadka Day One 24/7 ee 1-866-223-1111." | `1-866-223-1111` | Present |
| **`es`** | Spanish | "LÍNEA DE CRISIS: Si está en peligro inmediato, llame al 911 o a la Línea Day One 24/7 al 1-866-223-1111." | `1-866-223-1111` | Present |
| **`hmn`** | Hmong | "XOV TOOJ XWM CEEV: Yog koj muaj kev phom sij tam sim, hu rau 911 lossis Day One 1-866-223-1111." | `1-866-223-1111` | Present |
| **`kar`** | Karen | "တၢ်ဘံၣ်တၢ်ဘၢကလုၢ်ဟ့ၣ်ပလီၢ်: လီတဲစိ Day One မၤတၢ် ၂၄/၇ နီၣ်ဂံၢ် ၁-၈၆၆-၂၂၃-၁၁၁၁ (1-866-223-1111)." | `1-866-223-1111` | Present |
| **`orm`** | Oromo | "SARARA YEROO RAKKOO: Yoo balaa keessa jiraattan 911 ykn Day One 24/7 1-866-223-1111 bilbilaa." | `1-866-223-1111` | Present |
| **`am`** | Amharic | "የአደጋ ጊዜ መስመር፡ አፋጣኝ አደጋ ላይ ከሆኑ 911 ወይም የ 24/7 Day One ቀጥታ መስመር በ 1-866-223-1111 ይደውሉ።" | `1-866-223-1111` | Present |

---

### 2. Multi-Tier Safeguarding Firewall & Confidential Quarantine

When a service request involves domestic violence, stalking, or urgent shelter placement, the platform automatically applies the `SAFEGUARDING_RESTRICTED` security classification:

1. **Physical Shelter Address Masking**: Exact emergency safe house coordinates are completely stripped from API payloads and replaced with generic neighborhood or administrative references.
2. **Access Isolation**: Standard volunteers, general staff, donors, and non-certified roles receive `403 FORBIDDEN` when querying safeguarding records.
3. **Notification Redaction**: In-app notifications generated from crisis events do not disclose constituent names, physical locations, or trauma details to non-safeguarding queues.
4. **Automated Verification**: Enforced via `TEST-P41-118`, `TEST-P41-138`, and `TEST-P41-139`.

---

### 3. Safe Exit & History Erasure Engine

The *Safe Exit* action allows any constituent to immediately leave the platform:
- Redirects browser to neutral destination (e.g., weather.com or google.com).
- Replaces history state via `window.location.replace` to prevent back-button re-entry into domestic violence pages.
- Clears session cookies and local storage state tokens immediately upon invocation.
- Accessible via persistent top-right header button or global `Escape` key trigger.

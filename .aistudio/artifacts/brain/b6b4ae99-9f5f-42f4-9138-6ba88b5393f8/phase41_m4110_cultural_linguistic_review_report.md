# Phumulani AI Community Platform
## Milestone M41.10 — Cultural Linguistic Review & Community Dialect Report

**Date**: October 31, 2026  
**Milestone**: M41.10 (Seven-Language Community User Acceptance Testing & Localization Verification)  
**Target Languages**: `en`, `so`, `es`, `hmn`, `kar`, `orm`, `am`  
**Linguistic Framework**: Culturally Specific, Trauma-Informed & Non-Retraumatizing  

---

### 1. Language Review Status Registry

In compliance with truthful community readiness standards, each canonical language is assigned an explicit review classification reflecting its verification depth:

| Language Code | Language Name | Orthography / Script | Review Classification | Verified Key Count |
| :---: | :--- | :--- | :---: | :---: |
| **`en`** | English | Latin (US English) | `VERIFIED_PRODUCTION` | 115 / 115 |
| **`so`** | Somali | Latin (Somali Latin alphabet) | `VERIFIED_PRODUCTION` | 115 / 115 |
| **`es`** | Spanish | Latin (Universal Latin American) | `VERIFIED_PRODUCTION` | 115 / 115 |
| **`hmn`** | Hmong | Latin (Romanized Popular Alphabet - RPA) | `VERIFIED_PRODUCTION` | 115 / 115 |
| **`kar`** | Karen | Myanmar Script (S'gaw Karen `U+1000..U+109F`) | `SUPERVISED_COMMUNITY_REVIEW` | 115 / 115 |
| **`orm`** | Oromo | Latin (Qubee Afaan Oromoo) | `SUPERVISED_COMMUNITY_REVIEW` | 115 / 115 |
| **`am`** | Amharic | Ge'ez Ethiopic Script (`U+1200..U+137F`) | `DRAFT_MACHINE_ASSISTED` | 115 / 115 |

---

### 2. Cultural Sensitivity & Trauma-Informed Terminology

Phumulani works at the intersection of domestic violence, forced migration, racial justice, and immigrant integration. Direct word-for-word machine translation often results in offensive, stigmatizing, or culturally inaccurate phrasing. Milestone M41.10 audits the following sensitive domains:

1. **Domestic Violence & Trauma Healing**:
   - Rather than literal translations that imply personal culpability, terms like *Healing Circles* (*Goobaha Bogsiinta* in Somali, *Círculos de Sanación* in Spanish, *Kev Kho Siab* in Hmong) emphasize communal restoration and emotional safety.
2. **Confidentiality & Safeguarding (VAWA Section 1367)**:
   - For immigrant survivors without legal permanent residency, fear of deportation or disclosure to abusive spouses is a critical barrier.
   - Localized safeguarding notices explicitly assure survivors that service records are quarantined from immigration authorities and unauthorized third parties.
3. **Statutory Background Clearance for Volunteers**:
   - In diaspora communities with histories of state surveillance, "police check" can trigger severe trauma.
   - Terminology is carefully framed as *Statutory Community Safeguarding Clearance* (*Oggolaanshaha Ilaalinta Bulshada*, *Autorización Legal de Protección*).
4. **Emergency Safe Exit (Quick Close)**:
   - Survivors browsing the platform in abusive households need instant exit capability. The *Safe Exit* action is rendered uniformly across all 7 languages and bound to the `Escape` key.

---

### 3. Orthographic & Script Rendering Integrity

- **Karen (S'gaw Karen)**: Employs standard Unicode Myanmar glyphs (`တၢ်`, `ကျိာ်`, `ဟံၣ်`). Line-wrapping algorithms and mobile fonts were tested to ensure tone markers do not detach or overlap consonants.
- **Amharic (Fidel / Ge'ez)**: Employs full Ethiopic Unicode syllabary (`መነሻ`, `ፕሮግራሞች`, `የደህንነት`). Mobile line-breaking conforms to word boundary spaces (`\u0020`) and traditional word separators (`\u1361`).
- **Hmong RPA**: Utilizes tone markers encoded as trailing consonants (`-b`, `-m`, `-d`, `-j`, `-v`, `-s`, `-g`). The spell-checker dictionary preserves RPA tone integrity without stripping suffixes.

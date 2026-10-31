# Phumulani AI Community Platform
## Milestone M41.10 — Donor Stewardship, Financial Classification & Notification UAT Report

**Date**: October 31, 2026  
**Milestone**: M41.10 (Seven-Language Community User Acceptance Testing & Localization Verification)  
**Target Surface**: Donor Stewardship, Financial Ledger Classifications & Notification Center  
**Status**: `VERIFIED_COMPLETE`  

---

### 1. Donor Stewardship & 501(c)(3) Receipt Localization

Donors and institutional funders require precise transparency regarding tax deductibility, fund restriction, and campaign allocation. Localized strings across all 7 languages clearly articulate Phumulani's 501(c)(3) tax-exempt status:

- **Portal Title**: `donor_portal_title`
- **Tax Deductibility Disclosure**: `tax_deductible_notice` ("Contributions are tax-deductible to the extent permitted by law under 501(c)(3) status.")
- **Pipeline Description**: `pledge_pipeline_description` ("Pledges represent pipeline commitments and are not recognized as settled bank cash until cleared.")
- **Tax Receipt Reference Interpolation**: `donor_tax_receipt_ref` (`Official 501(c)(3) receipt: #{receipt}`)

---

### 2. Four-Tier Financial Classification Anti-Conflation Firewall

To protect accounting integrity and prevent unearned pledges from being reported as actual operating cash, the platform enforces strict 4-tier terminology segregation in all 7 community languages:

| Classification Tier | English | Somali | Spanish | Hmong | Karen | Oromo | Amharic |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Pipeline Pledge** | Pipeline Pledge (Unearned) | Ballanqaad (Aan La Helin) | Promesa (No Recaudada) | Kev Cog Lus (Tsis Tau Txais) | တၢ်ကတိၤအၢၣ်လီၤ (တဒိးန့ၢ်ဒံးဘၣ်) | Waadaa (Hin Argamne) | የተገባ ቃል (ያልተገኘ) |
| **Tier 2: Internally Logged** | Internally Logged (Pending Settlement) | Diiwaangashan (Sugaya Xaqiijin) | Registrado Internamente | Sau Tseg Hauv Tsev | တၢ်ကွဲးနီၣ်ပူၤ | Galmaa'eera (Eeggataa) | በውስጥ የተመዘገበ |
| **Tier 3: Bank Verified** | Bank Verified Cash | Lacag Bangi Xaqiijiyey | Efectivo Verificado | Nyiaj Pom Tseeb Hauv Txhab | စရီဘျၢလံၤတၢ်အၢၣ်လီၤ | Mallaqa Baankii Mirkanaa'e | በባንክ የተረጋገጠ ገንዘብ |
| **Tier 4: Pending Grant** | Pending Foundation Grant | Deeq Mu'asasadeed Sugaysa | Subvención Pendiente | Nyiaj Pab Tos Txais | တၢ်ဟ့ၣ်မၤဘူၣ်အိၣ်ခိး | Deeggarsa Eegamaa Jiru | በመጠባበቅ ላይ ያለ የድጋፍ ስጦታ |

---

### 3. Payment Gateway Staged Development Disclosure

Because external Stripe/Plink merchant gateways are not connected in the development sandbox, the platform displays an explicit localized disclosure:
- `payment_gateway_notice`: "PAYMENT GATEWAY NOTICE: Platform is operating in STAGED_DEVELOPMENT mode. No real transactions are processed."
- Enforced and validated across all 7 languages in `TEST-P41-135`.

---

### 4. Notification Center Localization & Category Filtering

The unified notification center aggregates real-time constituent and administrative alerts across 6 distinct categories:

1. **All (`notification_category_all`)**: Unified inbox.
2. **Casework (`notification_category_casework`)**: Service intake and triage alerts.
3. **Programs (`notification_category_programs`)**: Enrollment and waitlist position updates.
4. **Volunteer (`notification_category_volunteer`)**: Shift reminders and hour approvals.
5. **Donations (`notification_category_donations`)**: Pledge acknowledgments and tax receipts.
6. **System (`notification_category_system`)**: Security announcements and password resets.
7. **Action**: `mark_all_read` ("Mark all as read").
- **Automated Verification**: Enforced via `TEST-P41-134`, `TEST-P41-135`, and `TEST-P41-136`.

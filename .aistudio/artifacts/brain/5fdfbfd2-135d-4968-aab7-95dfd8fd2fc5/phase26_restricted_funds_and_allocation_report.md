# PHUMULANI ORGANIZATION
## PHASE 26 — MILESTONE M26.09: RESTRICTED FUNDS & PROGRAM ALLOCATION CONTROL REPORT

**PROJECT:** Phumulani AI Community Platform  
**DEVELOPMENT PHASE:** Phase 26 — Grants, Fundraising, Donor CRM & Institutional Funding Command Center  
**MILESTONE:** M26.09 — Restricted Funds & Anti-Commingling Control  
**TARGET ROUTE:** `/admin/master` (Module 24: `restricted_funds_p26`)  
**ENVIRONMENT POLICY:** `PRODUCTION_ONLY`  
**DATE OF AUDIT:** October 27, 2026  

---

### 1. RESTRICTED FUND LEDGER & PROGRAM SEGREGATION
Under FASB ASC 958 and nonprofit donor intent standards, Phumulani must strictly segregate restricted grants from general operating pools. Milestone M26.09 implements program-level isolation:

| Fund ID | Funder / Source | Restricted Program | Total Award | Expended | Remaining Balance | Status |
|---|---|---|---|---|---|---|
| `REST-2026-001` | Hennepin County Health | `PROG-004` (Health Navigators) | $60,000 | $8,500 | $51,500 | ON_TRACK |
| `REST-2026-002` | Pohlad Family Foundation | `PROG-001` (Youth Mentorship) | $50,000 | $38,200 | $11,800 | ON_TRACK |
| `REST-2026-003` | Hugh J. Andersen Foundation | `PROG-003` (Healing Circles) | $45,000 | $22,000 | $23,000 | ON_TRACK |
| `REST-2026-004` | Target Foundation | `PROG-002` (Immigrant Self-Sufficiency) | $35,000 | $11,200 | $23,800 | ON_TRACK |
| **TOTALS** | **4 Institutional Allocations** | **4 Distinct Programs** | **$190,000** | **$79,900** | **$110,100** | **100% AUDITED** |

---

### 2. MANDATORY FIDUCIARY CONTROLS
1. **Commingling Prevention Firewall:** If staff attempts to disburse funds from a restricted allocation (e.g. `REST-2026-001` designated for `PROG-004`) to pay for another program's expenses (e.g. `PROG-005` or general operating overhead), the transaction is blocked fail-closed with a statutory violation notice.
2. **Grant-Specific Unallowable Expenses:** Each fund maintains customized restriction rules (e.g. out-of-state travel, remodeling, administrative overhead > 8%). Disbursing against these terms is blocked.
3. **Overdraft Protection:** Prevents disbursements exceeding the available unexpended balance.
4. **Spend-Down Schedule Monitoring:** Tracks pacing against grant expiration dates (`ON_TRACK`, `ACCELERATED`, `SLOW`, `OVERALLOCATED`, `EXPIRED`).

---

### 3. VERIFICATION EVIDENCE
- `TEST-P26-13`: Verified $110,100 restricted ledger across 4 programs and blocked cross-program commingling.
- `TEST-P26-14`: Verified balance overdraft blocking.
- `SEC-26-04`: Proved cross-program fund leakage fails closed.
- `SEC-26-10`: Proved expenditure exceeding remaining balance ($999,999 on $51,500) is rejected.
- `SEC-26-11`: Proved grant-specific unallowable travel expenses are blocked.
- `SEC-26-16`: Proved capital improvements are blocked on youth program funds.

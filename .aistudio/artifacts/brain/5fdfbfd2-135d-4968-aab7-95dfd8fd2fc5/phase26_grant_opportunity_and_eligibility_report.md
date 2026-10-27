# PHUMULANI ORGANIZATION
## PHASE 26 — MILESTONES M26.02–M26.04: GRANT OPPORTUNITY REGISTRY, ELIGIBILITY ENGINE & GO/NO-GO GATE

**PROJECT:** Phumulani AI Community Platform  
**DEVELOPMENT PHASE:** Phase 26 — Grants, Fundraising, Donor CRM & Institutional Funding Command Center  
**MILESTONES:** M26.02 (Opportunity Registry), M26.03 (Eligibility Engine), M26.04 (Go/No-Go Decision Gate)  
**TARGET ROUTE:** `/admin/master` (Module 20: `grant_registry_p26`)  
**ENVIRONMENT POLICY:** `PRODUCTION_ONLY`  
**DATE OF AUDIT:** October 27, 2026  

---

### 1. GRANT OPPORTUNITY REGISTRY (M26.02)
The Grant Opportunity Registry implements a complete 11-stage opportunity lifecycle:
```text
DISCOVERED → SCREENING → QUALIFIED → GO_NO_GO_REVIEW → APPROVED_TO_PURSUE 
→ IN_DEVELOPMENT → SUBMITTED → AWARDED | DECLINED | NOT_PURSUED | EXPIRED | CLOSED
```

#### Seeded Institutional Opportunities:
1. `GR-OPP-2026-001`: **Minnesota Department of Human Services (DHS)**  
   - Title: *Culturally-Specific Violence Prevention and Youth Healing Grant*  
   - Program: `PROG-001` | Range: $100,000 – $150,000 | Status: `IN_DEVELOPMENT`  
   - Deadline: 2026-11-20 | Match: 10% in-kind allowed.
2. `GR-OPP-2026-002`: **Otto Bremer Trust**  
   - Title: *Immigrant Family Economic Stability and Micro-Enterprise Initiative*  
   - Program: `PROG-002` | Range: $75,000 – $100,000 | Status: `GO_NO_GO_REVIEW`  
   - Deadline: 2026-12-05 | Match: None required.
3. `GR-OPP-2026-003`: **Bush Foundation**  
   - Title: *Community Healing and Intergenerational Resilience Grant*  
   - Program: `PROG-003` | Range: $120,000 – $200,000 | Status: `QUALIFIED`  
   - Deadline: 2027-01-15 | Match: None required.
4. `GR-OPP-2026-004`: **Hennepin County Community Health & Human Services**  
   - Title: *Community Health Navigator & Maternal Wellness Partnership*  
   - Program: `PROG-004` | Award: $60,000 | Status: `AWARDED`  
   - Contract Active FY2026-2027.
5. `GR-OPP-2026-005`: **Women's Foundation of Minnesota**  
   - Title: *Gender Justice and Legal Systems Advocacy Fund*  
   - Program: `PROG-005` | Range: $40,000 – $60,000 | Status: `SUBMITTED`  
   - Submission Ref: `WFMN-SUB-2026-8841`.
6. `GR-OPP-2026-006`: **National Endowment for the Humanities**  
   - Title: *Diaspora Oral History and Archival Digitization Grant*  
   - Program: `PROG-003` | Potential: $200,000 | Status: `NOT_PURSUED`  
   - Outcome: Concluded NO_GO due to severe 50% cash match obligation ($100k).

---

### 2. GRANT ELIGIBILITY ENGINE (M26.03)
The eligibility engine compares opportunity criteria against Phumulani's authentic legal charter:
- **501(c)(3) Nonprofit Status:** Verified IRC 501(c)(3) determination and Minnesota AG Charitable Organization active registration.
- **Geographic Alignment:** Automated parsing for Minnesota, Twin Cities, Hennepin, and Ramsey County service footprints.
- **Programmatic Mapping:** Enforces 1-to-1 linkage with verified initiatives (`PROG-001` through `PROG-005`).
- **Target Population:** African Diaspora, immigrant women, youth, and low-to-moderate income households.
- **Cost Matching Feasibility:** Flags cash match obligations > 15% for executive review.
- **Non-Negotiable Oversight Rule:** Returns `ELIGIBLE`, `POTENTIALLY_ELIGIBLE`, `INELIGIBLE`, or `REQUIRES_HUMAN_REVIEW`. AI and automated rulesets are strictly prohibited from making the final determination.

---

### 3. GO / NO-GO DECISION GATE (M26.04)
Funding opportunities cannot enter proposal development without passing a formal leadership gate:
- **Material Commitment Threshold:** Material grant pursuits require Executive Director signature (`edSignatureVerified: true`).
- **Captured Criteria:** Funding potential, alignment score (1-100), workload hours, reporting burden (`LOW`, `MEDIUM`, `HIGH`, `SEVERE`), and strategic risks.
- **Decisions Supported:** `GO`, `NO_GO`, `HOLD`, `NEEDS_INFORMATION`.

---

### 4. VERIFICATION EVIDENCE
- `TEST-P26-02`: Verified 11-stage lifecycle state management.
- `TEST-P26-03`: Verified automated comparison of Minnesota DHS grant against 501(c)(3) and Twin Cities footprint.
- `TEST-P26-04`: Verified human oversight requirement (`requiresHumanReview: true`).
- `TEST-P26-05`: Verified Executive Director authorization gate for material commitments.
- `TEST-P26-06`: Verified automatic lifecycle transitions (`APPROVED_TO_PURSUE` vs `NOT_PURSUED`).
- `SEC-26-01`: Proved unauthorized non-executive users fail closed when attempting Go decisions.
- `SEC-26-12`: Proved unapproved opportunities are blocked from entering `IN_DEVELOPMENT`.

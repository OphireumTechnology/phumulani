# PHUMULANI AI COMMUNITY PLATFORM — PHASE 25
# OUTREACH & SERVICE COORDINATION REPORT

```text
MILESTONE_ID: M25.03 (Community Outreach), M25.04 (General Service Requests), M25.05 (Referrals & Partner Coordination)
IMPLEMENTATION_STATUS: IMPLEMENTED
FILES_CREATED:
  - /src/components/masterAdmin/CommunityOutreachTab.tsx
  - /src/components/masterAdmin/GeneralServiceRequestsTab.tsx
  - /src/components/masterAdmin/ReferralPartnerTab.tsx
FILES_MODIFIED:
  - /src/types/communityPrograms.ts
  - /src/services/communityProgramsSeed.ts
  - /src/services/communityProgramsService.ts
  - /src/services/automatedTestRunner.ts
  - /server.ts
  - /src/views/MasterAdministratorView.tsx
BACKEND_FUNCTIONALITY:
  - Outreach operations management with aggregate demographic summaries and anti-surveillance venue filtering.
  - Non-confidential General Service Request triage (food pantry hampers, youth tutoring inquiries, ESL translation).
  - Automated crisis keyword detection interceptor triggering immediate quarantine halt upon domestic abuse or shelter indicators.
  - Gated partner referral creation and tracking linked to Phase 24 verified institutional partnerships.
  - Fail-closed dispatch lock holding external email transmissions while Google Workspace is disconnected.
FRONTEND_FUNCTIONALITY:
  - Field outreach planning cards with scheduled dates, partner tables, and approved multilingual distribution lists.
  - Service intake queue with real-time intake form and prominent VAWA Section 1367 Safeguarding Banner.
  - Quarantined file indicator displaying redaction status and direct routing to DEPT-SAFE.
  - Partner referral registry displaying verified MOUs and Gated Dispatch badges.
AUTHORIZATION_CONTROLS:
  - Outreach target locations undergo automatic keyword scanning; confidential shelter addresses are rejected fail-closed.
  - Intake text containing trauma or domestic violence indicators halts general processing, redacts cleartext, and routes exclusively to Sister Miriam K.
  - Outbound referral emails to external partners remain blocked while Google Workspace is disconnected.
TESTS_ADDED:
  - TEST-P25-02: Community Outreach Operations & Aggregate Data Protection (M25.03)
  - TEST-P25-03: General Service Request Coordination & Safeguarding Crisis Firewall (M25.04)
  - TEST-P25-04: Referral Coordination & Google Workspace Gated Dispatch (M25.05)
  - TEST-P25-13: VAWA Section 1367 Safeguarding Boundary & Quarantine Protocol (M25.14)
TESTS_EXECUTED: 4/4 Service Coordination Automated Tests (Part of 306-test regression suite)
TEST_RESULTS:
  [PASS] TEST-P25-02: Outreach created with aggregate reach; confidential shelter address was blocked fail-closed.
  [PASS] TEST-P25-03: General pantry request logged; crisis intake containing assault indicators instantly quarantined and redacted.
  [PASS] TEST-P25-04: Referral drafted; external email transmission safely gated awaiting Google Workspace authorization.
  [PASS] TEST-P25-13: All quarantined intakes verified in DEPT-SAFE with zero cleartext crisis disclosures in general views.
KNOWN_LIMITATIONS:
  - Live external email dispatch to partner clinics is staged locally pending Google Workspace OAuth authorization.
EXTERNAL_DEPENDENCIES:
  - POSTGRESQL=NOT_CONNECTED
  - GOOGLE_WORKSPACE=AUTHORIZATION_REQUIRED
  - PAYMENT_GATEWAY=NOT_CONNECTED
  - LIVE_EMAIL_SYNCHRONIZATION=NOT_ACTIVATED
```

---

## 1. COMMUNITY OUTREACH MANAGEMENT (M25.03)

Field outreach initiatives (e.g. `OUT-001` in Cedar-Riverside and `OUT-002` in Brooklyn Center) enable Phumulani advocates to connect with immigrant and refugee families directly in public parks, library halls, and cultural community centers.

### Anti-Surveillance Safeguard:
In accordance with Directive Section 3 (M25.03), community outreach initiatives must collect **aggregate participation data only**. The system strictly prohibits collecting identifiable survivor details through outreach tables. Furthermore, target venue fields undergo automated keyword inspection to ensure confidential domestic violence shelters and safe houses are never inadvertently designated as public outreach sites.

---

## 2. GENERAL SERVICE REQUEST COORDINATION & CRISIS QUARANTINE FIREWALL (M25.04)

The General Service Request subsystem coordinates routine, non-sensitive assistance:
- Emergency cultural food hampers (halal grains, lentils, fresh produce).
- Middle and high school STEM tutoring enrollment.
- Public transit and school lunch form translation.

### Strict Safeguarding Crisis Quarantine Protocol:
If an intake contains keywords associated with domestic abuse, protective orders, stalking, or violence:
1. General intake processing is immediately halted.
2. The record's intake summary is redacted in the general registry (`[REDACTED — SENSITIVE SAFEGUARDING CRISIS QUARANTINE]`).
3. The record is flagged with `isSafeguardingCrisisQuarantine: true`.
4. The case is routed exclusively to **Restricted Safeguarding Lead Sister Miriam K.** in `DEPT-SAFE`.
5. The matter is blocked from general staff tasks, donor CRM exports, and all AI processing contexts.

---

## 3. REFERRALS & SERVICE PARTNER COORDINATION (M25.05)

Service referrals link participants to Phumulani's network of verified community partners, such as **Hennepin Healthcare Community Clinic** and the **Target Foundation Community Partner Desk**.

### Gated Dispatch Invariant:
While external Google Workspace OAuth authorization remains deferred (`GOOGLE_WORKSPACE=AUTHORIZATION_REQUIRED`), all outbound email transmissions to external partner desks are locked in a staged state. Staff coordinators can draft, review, and authorize referrals internally, but no live network dispatch is executed until the administrator authorizes live Workspace credentials.

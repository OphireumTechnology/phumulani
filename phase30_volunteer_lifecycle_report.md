# Phase 30: 15-Stage Volunteer Operational Lifecycle Report (M30.07)
**Project**: Phumulani AI Community Platform (`OphireumTechnology/phumulani`)  
**Date**: October 27, 2026  
**Status**: COMPLETE & VERIFIED  

---

## 1. The 15-Stage Volunteer Pipeline Architecture
Phumulani's volunteer operations follow a rigorous 15-stage workflow designed to balance rapid volunteer mobilization with uncompromising survivor safeguarding and child protection standards:

```
[01 Discovery & Intake] -> [02 Identity & Legal] -> [03 Skills & Language] -> [04 AI Match Evaluation]
                                                                                      ↓
[08 Criminal Background] <- [07 Reference Audits] <- [06 Staff Interview] <- [05 Coordinator Review]
         ↓
[09 Safeguarding Module] -> [10 Staff Authorization] -> [11 Program Placement] -> [12 Shift Scheduling]
                                                                                          ↓
[15 Milestone / Renewal] <- [14 Quarterly Check-In] <- [13 Hours Auditing] <--------------'
```

### Detailed Stage Breakdown:
1. **Discovery & Intake**: Volunteer discovers opportunity on website; submits initial application; automated deduplication against existing records.
2. **Identity & Legal Consent**: Contact verification, legal waivers, confidentiality acknowledgments, and emergency contact details recorded.
3. **Skills & Language Audit**: Assessment of spoken dialects (Somali, Oromo, Amharic, Karen, Spanish, Arabic) and professional skills (tutoring, translation, career counseling).
4. **AI Match Evaluation**: Agent A04 (Volunteer Recruiter) analyzes application against open opportunity requirements; generates non-binding matching score and commentary.
5. **Human Coordinator Review**: Volunteer coordinator inspects AI notes, evaluates suitability, and approves candidate for personal interview.
6. **Staff Interview**: Structured trauma-informed interview assessing cultural humility, survivor privacy commitments, and availability.
7. **Reference Audits**: Verification of two community peer references with documented response notes.
8. **Criminal Background Clearance**: Submission and verification of Minnesota Bureau of Criminal Apprehension (BCA) and DHS child protection clearances.
9. **Mandatory Safeguarding Module**: Completion of 2 core training modules: "Cultural Humility & Survivor Privacy" and "Mandatory Escalation & Emergency Protocols".
10. **Staff Credentialing Authorization**: Program Director signs off on credential issuance and grants active status.
11. **Program Placement**: Formal assignment to a program circle (e.g. Bilingual Youth Mentorship, Career Readiness Circle).
12. **Shift Scheduling & Calendar Sync**: Volunteer reserves slots via portal; calendar event syncs to coordinators.
13. **Service Hours Logging & Audit**: Volunteer logs hours, dates, and activity summaries; queued for supervisor review and verified in persistent DB.
14. **Quarterly Check-In**: Periodic supervisor check-in evaluating mutual satisfaction and volunteer well-being.
15. **Milestone Recognition & Annual Renewal**: Annual recertification, presidential service awards, and volunteer appreciation certificates.

---

## 2. Portal User Interface (`src/views/CommunityPortalView.tsx`)
In `CommunityPortalView.tsx`, the volunteer lifecycle is presented through:
- **15-Stage Pipeline Diagram**: A responsive, 15-card visual tracker illustrating each stage's name, sequence, and operational purpose.
- **Application Record Cards**: Displays application tracking IDs (`APP-2026-001`, `APP-2026-002`), current stage status pills (`screening_review`, `approved_active`), Workflow B step indicators, and Agent A04 advisory recommendations.
- **Log Hours Tab**: Dedicated form with service date picker, decimal hours input, assignment dropdown, and activity description textarea.
- **Safeguarding Credentials Tab**: Displays completed certification modules governed by Safeguarding Officer Sister Miriam K.

---

## 3. Acceptance Verification
- `TEST-P30-07` passed: Verified all 15 stages from intake, AI matching, BCA screening, safeguarding credentials, through service hours logging.

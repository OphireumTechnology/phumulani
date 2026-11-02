# Phase 61 Milestone M6108: Institutional Operations, AI-Governed Triage & CRM Ingestion
**Document ID:** `PH61-M6108-CRM-008`  
**Phase:** 61 — Live Email Integration, Provider Authentication & Enterprise Operational Readiness  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** AI Studio Platform Engineering Engine  
**Status:** Approved & Verified  

---

## 1. Governed AI Email Triage Architecture

All incoming messages processed through universal connectors pass through a rigorous, rule-governed AI triage pipeline:

1. **24-Category Institutional Classification:** Accurately classifies emails into operational categories (e.g. Legal Aid, Survivor Relocation, Medical Assistance, Housing Relief, Food Support, Emergency Grants, Volunteer Coordination, etc.).
2. **Deterministic Priority & SLA Timers:**
   - `P0 (CRITICAL)`: 15-minute response SLA. Emergency threats, acute domestic violence reports.
   - `P1 (HIGH)`: 2-hour response SLA. Urgent housing evictions, legal deadlines.
   - `P2 (MEDIUM)`: 8-hour response SLA. Case updates, standard resource inquiries.
   - `P3 (LOW)`: 24-hour response SLA. General questions, partner outreach.
   - `P4 (ROUTINE)`: 48-hour response SLA. Newsletters, system notices.
3. **Department Routing:** Automatically routes tickets to designated internal casework teams (`Intake`, `Legal`, `Crisis Intervention`, `Shelter Services`).
4. **AI Reply Drafting (Human-in-the-Loop):** Synthesizes compassionate, policy-compliant response drafts. No AI draft can ever be dispatched autonomously.

---

## 2. Institutional CRM Entity Correlation

Synchronized messages are correlated with existing CRM constituent and donor records:
- **Email Normalization:** Strips sub-addressing (+ tags) and checks normalized addresses against beneficiary and donor databases.
- **Thread Continuity:** Appends email threads to existing client cases, preserving conversation history and caseworker notes.
- **Privacy Enforcement:** Respects opt-out preferences and data residency mandates.

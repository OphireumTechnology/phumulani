# PHUMULANI AI COMMUNITY PLATFORM
## Phase 47 — Master Email Administration & AI Communications Technical Specification
**Module:** `/admin/master/email` (Application D — Staff Command Center)  
**Operational Mode:** `STAGED_DEVELOPMENT`  
**Security Classification:** Highly Confidential (Safeguarding & CRM Protected)  
**Authoritative Revision:** Phase 47 Baseline

---

## 1. Executive Architecture Overview

The PHUMULANI Email Administration & AI Communications Engine (`/admin/master/email`) consolidates all organizational communication channels into an authoritative, multi-tenant administrative interface within Application D (Staff Command Center). The platform bridges incoming community inquiries, donor contributions, volunteer coordination, and emergency crisis survivor communications with AI-assisted triage, classification, and drafting, anchored by strict human co-signature governance and safeguarding boundaries.

The system enforces five non-negotiable architectural axioms:
1. **Human-in-the-Loop Co-Signature:** Zero autonomous AI outbound sending. All AI drafts are prominently stamped `AI_DRAFT — NOT APPROVED — NOT SENT` and require quad-action review by authorized human personnel before dispatch.
2. **Safeguarding Quarantine & Anti-IDOR:** All crisis, domestic violence, stalking, and emergency survivor communications are immediately categorized as Category 01 (`01_safeguarding`), assigned Priority P0 (1-hour SLA), and quarantined exclusively to `DEPT-SAFE` (Sister Miriam K.). Message text is redacted for non-safeguarding staff, auto-replies are blocked (`blocked_by_safety`), and external CRM linking is prohibited.
3. **Staff Note Boundary Isolation:** Internal caseworker collaboration notes, triage annotations, and reassignment reasons are isolated within an air-gapped data structure and strictly stripped prior to RFC 2822 outbound dispatch serialization.
4. **Idempotency & Anti-Tamper Protection:** Outbound dispatches enforce mandatory idempotency keys to eliminate duplicate transmission. Any material modification to an approved draft body immediately revokes approval state and returns the message to draft status.
5. **Truthful Infrastructure Disclosures:** The Google Workspace / Gmail connection adapter reports `AUTHORIZATION_REQUIRED` in staging environments until explicit administrator OAuth consent is granted.

---

## 2. The 14 Functional Sections

The Email Administration Dashboard provides 14 dedicated tabs organized into three functional clusters:

### Navigation & Inbox Cluster
1. **Overview & Health (`overview`):**
   - High-level KPIs: Active Mailboxes, 24h Message Volume, Pending Approvals, Open P0/P1 SLAs, Average Response Time, and System Health status.
   - Mailbox operational roster displaying provider status, unread counts, and Google Workspace OAuth state.
   - Real-time 25-category taxonomy distribution and SLA compliance telemetry.

2. **Unified Shared Inbox (`all_mailboxes`):**
   - Aggregated message feed spanning all active organizational mailboxes.
   - Real-time search, priority badges (P0-P4), unread indicators, and state tags.
   - Safeguarding indicators with automatic redaction for non-safeguarding personnel.

3. **Mailboxes & Accounts (`mailboxes`):**
   - Management of the 5 canonical organizational mailboxes:
     - `info@phumulani.org` (General Inquiries)
     - `support@phumulani.org` (Community Support & Crisis Triage)
     - `director@phumulani.org` (Executive Office & Sister Miriam K.)
     - `donations@phumulani.org` (Donor Relations & Receipts)
     - `volunteers@phumulani.org` (Volunteer Intake & Management)
   - Connection status, OAuth scope verification, and inbound/outbound sync toggles.

4. **Sent Mail (`sent`):**
   - Authoritative ledger of dispatched communications.
   - Provider delivery receipt tracking, idempotency keys, and RFC 2822 dispatch timestamps.
   - Approver sign-off metadata (timestamp, human staff identity, approval action).

5. **Drafts (`drafts`):**
   - Work-in-progress staff drafts and AI-generated candidate responses.
   - Mandatory visual watermark: `AI_DRAFT — NOT APPROVED — NOT SENT`.
   - Thread history, template picker, and submission to the approval queue.

### Governance & Workflow Cluster
6. **Pending Approvals (`approvals`):**
   - Dedicated Quad-Action Human Review Queue for all AI-generated drafts.
   - Reviewer actions:
     - **APPROVE:** Confirms draft unmodified; transitions thread to `APPROVED` for dispatch.
     - **EDIT_AND_APPROVE:** Incorporates caseworker edits, increments draft version, logs diff, and marks `APPROVED`.
     - **REJECT:** Discards draft; provides caseworker rationale and returns thread to `ASSIGNED`.
     - **ESCALATE_RETURN:** Reassigns thread to senior staff or supervisor with urgent escalation note.
   - Anti-AI self-approval validation: Rejects review requests submitted by AI agent identities.

7. **Assigned Conversations (`assigned_to_me`):**
   - Focused workspace filtering threads currently assigned to the active staff user.
   - SLA countdown indicators, quick note adding, and direct reply drafting.

8. **Follow-Up Tasks (`follow_up_tasks`):**
   - Automated and manual follow-up scheduling for unresolved inquiries.
   - Due date tracking, overdue alerts, and completion toggles.

9. **Email Templates (`templates`):**
   - Repository of 12 production-grade organizational templates spanning 7 languages:
     - `tpl_general_inquiry_ack` (Inquiry Acknowledgment)
     - `tpl_donor_tax_receipt` (Donation Tax Receipt & Gratitude)
     - `tpl_volunteer_welcome` (Volunteer Onboarding & Orientation)
     - `tpl_casework_intake_notice` (Community Intake Confirmation)
     - `tpl_safeguarding_crisis_auto` (Confidential Crisis Response)
     - `tpl_board_governance_brief` (Board Governance Notice)
     - `tpl_media_press_response` (Press Inquiry Response)
     - `tpl_grant_compliance_update` (Funder Compliance Report)
     - `tpl_community_workshop_invite` (Workshop & Outreach Invite)
     - `tpl_legal_aid_referral` (Legal Referral Notification)
     - `tpl_donor_impact_update` (Monthly Impact Newsletter)
     - `tpl_staff_escalation_alert` (Internal Escalation Warning)
   - Dynamic merge-field interpolation engine (`{{recipient_name}}`, `{{donation_amount}}`, etc.).
   - Standardized organizational signature blocks.

10. **Contacts & CRM (`crm_connections`):**
    - Bi-directional linking of email threads to constituent CRM profiles (Donors, Volunteers, Community Clients).
    - Engagement history, lifetime donation metrics, and relationship status.
    - Strict safeguarding exclusion: Category 01 threads are permanently blocked from CRM indexing.

### Intelligence & System Cluster
11. **AI Email Intelligence (`ai_intelligence`):**
    - The 25-category taxonomy classification breakdown with confidence scores.
    - AI sentiment analysis, language detection across the 7 canonical languages (`en`, `so`, `es`, `hmn`, `kar`, `orm`, `am`).
    - SLA monitoring matrix enforcing turnaround commitments from P0 (1h) down to P4 (48h).

12. **Email Analytics & Reports (`analytics`):**
    - Volume trends, category distribution, SLA breach analysis, and staff workload distribution.
    - Quad-action approval rates, average draft edit distance, and sentiment distributions.

13. **Audit History & Logs (`audit_history`):**
    - Immutable event ledger recording every triage, draft creation, quad-action review, dispatch, and escalation.
    - Searchable by thread ID, actor, action type, and date range.
    - Structured JSON audit trail export for compliance auditing.

14. **Settings & Integrations (`settings`):**
    - Google Workspace / Gmail API adapter configuration.
    - Truthful `AUTHORIZATION_REQUIRED` operational status indicators.
    - OAuth scope audit and validation tools.
    - Safeguarding fail-safe switches and automated digest preferences.

---

## 3. The 25-Category Taxonomy & SLA Matrix

Every incoming communication is evaluated and mapped to one of 25 canonical categories:

| Code | Category Name | Target Mailbox | Department | Default Priority | Target SLA | Auto-Reply Policy |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `01_safeguarding` | Domestic Violence & Crisis Support | `support@phumulani.org` | `DEPT-SAFE` | **P0** | **1 Hour** | **BLOCKED (Safety Risk)** |
| `02_donor_major` | Major Donor Relations ($10k+) | `donations@phumulani.org` | Development | P1 | 4 Hours | Human Review Required |
| `03_donor_recurring` | Monthly Sustainer Inquiries | `donations@phumulani.org` | Development | P2 | 8 Hours | AI Draft + Human Co-Sign |
| `04_donor_tax` | Tax Receipt & Acknowledgment | `donations@phumulani.org` | Development | P3 | 24 Hours | Template Merge + Human Co-Sign |
| `05_volunteer_inquiry` | Volunteer Application & Screening | `volunteers@phumulani.org` | Operations | P3 | 24 Hours | AI Draft + Human Co-Sign |
| `06_volunteer_dispute` | Volunteer Conflict / Grievance | `volunteers@phumulani.org` | Operations | P1 | 4 Hours | Human Only (Escalate) |
| `07_casework_intake` | General Community Intake | `support@phumulani.org` | Casework | P2 | 8 Hours | AI Draft + Human Co-Sign |
| `08_legal_referral` | Legal Aid & Immigration Referral | `support@phumulani.org` | Legal | P1 | 4 Hours | Human Co-Sign (Legal Staff) |
| `09_board_governance` | Board Resolutions & Minutes | `director@phumulani.org` | Executive | P1 | 4 Hours | Executive Co-Sign |
| `10_grant_reporting` | Foundation Grant Reporting | `director@phumulani.org` | Development | P2 | 8 Hours | Executive Co-Sign |
| `11_media_press` | Press & Public Relations | `info@phumulani.org` | Communications | P1 | 4 Hours | Communications Co-Sign |
| `12_vendor_billing` | Vendor Invoices & AP | `info@phumulani.org` | Finance | P3 | 24 Hours | Human Co-Sign |
| `13_community_event` | Cultural Workshop & Event RSVP | `info@phumulani.org` | Outreach | P4 | 48 Hours | AI Draft + Human Co-Sign |
| `14_multilingual_inq` | Non-English Community Inquiry | `info@phumulani.org` | Casework | P2 | 8 Hours | Multilingual AI Draft + Co-Sign |
| `15_youth_program` | Youth Mentorship & Tutoring | `support@phumulani.org` | Programs | P3 | 24 Hours | AI Draft + Human Co-Sign |
| `16_elder_care` | Senior Care & Translation Escort | `support@phumulani.org` | Casework | P2 | 8 Hours | Human Co-Sign |
| `17_food_shelf` | Emergency Food Assistance | `support@phumulani.org` | Casework | P1 | 4 Hours | Immediate Outreach |
| `18_housing_crisis` | Eviction Defense & Shelter Placement| `support@phumulani.org` | Casework | P1 | 4 Hours | Immediate Casework Triage |
| `19_partnership_corp` | Corporate Sponsorship Inquiry | `donations@phumulani.org` | Development | P2 | 8 Hours | Executive Co-Sign |
| `20_internship_app` | College Internship Application | `volunteers@phumulani.org` | Operations | P4 | 48 Hours | Operations Review |
| `21_complaint_service` | Community Service Grievance | `director@phumulani.org` | Compliance | P1 | 4 Hours | Executive Investigation |
| `22_data_privacy_req` | GDPR/CCPA Record Access Request | `info@phumulani.org` | Compliance | P2 | 8 Hours | Legal / Privacy Officer |
| `23_alumni_network` | Past Client Success & Alumni | `info@phumulani.org` | Outreach | P4 | 48 Hours | Outreach Coordinator |
| `24_general_info` | Hours, Location & Directions | `info@phumulani.org` | Communications | P4 | 48 Hours | AI Draft + Human Co-Sign |
| `25_spam_marketing` | Unsolicited Commercial Email | `info@phumulani.org` | IT Admin | P4 | 48 Hours | Quarantined / Auto-Archive |

---

## 4. Safeguarding Quarantine Specification (VAWA Compliance)

When an incoming message contains domestic violence keywords, stalking patterns, or traumatic crisis markers:
1. **Immediate Quarantine:** State is forced to `QUARANTINED` and department assigned to `DEPT-SAFE`.
2. **Access Control (Anti-IDOR):** Thread ownership is locked to `staff_sister_miriam` (Sister Miriam K.). Requests from any other staff identity return a redacted view with:
   - Body text masked: `[REDACTED — CONFIDENTIAL SAFEGUARDING COMMUNICATION — AUTHORIZED SAFEGUARDING STAFF ONLY]`
   - Sender address masked: `[PROTECTED SURVIVOR]`
   - Status badge indicating active quarantine under VAWA confidentiality.
3. **Suppression of Automated Responses:** Automated email replies are strictly suppressed. Auto-responders to survivor inboxes risk notifying an abuser or compromising safe shelter locations.
4. **CRM Air-Gap:** The thread is flagged `quarantine_safeguarding: true`, which blocks the constituent profile from synchronizing to external or general donor CRMs.

---

## 5. Quad-Action Human Review Workflow

```
[ Inbound Email ] ──> [ AI Triage & Classification ] ──> [ AI Draft Generated ]
                                                                 │
                                                       (Watermarked "AI_DRAFT")
                                                                 ▼
                                                  ┌─────────────────────────────┐
                                                  │ Quad-Action Human Review    │
                                                  │ (Staff Co-Signature)        │
                                                  └──────────────┬──────────────┘
                                                                 │
            ┌─────────────────────┬──────────────────────────────┴──────────────────────────┬────────────────────────┐
            ▼                     ▼                                                         ▼                        ▼
       [ APPROVE ]       [ EDIT_AND_APPROVE ]                                           [ REJECT ]          [ ESCALATE_RETURN ]
            │                     │                                                         │                        │
  State: `APPROVED`     State: `APPROVED`                                          State: `ASSIGNED`        State: `ASSIGNED`
  Draft Unchanged       Body Updated, Ver +1                                       Draft Discarded          Reassigned to Lead
            │                     │                                                         │                        │
            └──────────┬──────────┘                                                         ▼                        ▼
                       ▼                                                               [ Redraft ]             [ Senior Review ]
              [ Outbound Dispatch ]
                       │
              (RFC 2822 Serialized)
              (Idempotency Verified)
              (Notes Stripped)
                       ▼
             State: `SENT`
```

---

## 6. Staging Infrastructure & Google Workspace Readiness

In compliance with AI Studio build guidelines and staged development security:
- Operational Mode is persistently `STAGED_DEVELOPMENT`.
- Google Workspace adapter status is truthful: `AUTHORIZATION_REQUIRED`.
- The system never pretends a live OAuth session exists when credentials have not been authorized in the UI.
- All outbound staging dispatches are logged to persistent storage with RFC 2822 payload generation, simulation receipts, and complete audit entries.

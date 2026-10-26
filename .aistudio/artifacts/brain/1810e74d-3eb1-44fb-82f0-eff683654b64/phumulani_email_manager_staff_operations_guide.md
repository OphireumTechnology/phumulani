# Phumulani AI Community Platform
# Enterprise Email Manager — Staff Operations Guide
**Document ID:** `PHU-MAN-STAFF-EMAIL-001`  
**Classification:** Internal Staff Operations Manual  
**Target Audience:** Master Administrators, Development Officers, Grants Leads, Corporate Partnership Coordinators, Executive Staff  
**System Route:** `/admin/master/email`  

---

## 1. Introduction to the Email Command Center

The **Phumulani AI Email Command Center** is the central communications intelligence workspace for Phumulani (Minnesota African Women Against Violence). It integrates five organizational mailboxes into a unified, secure dashboard designed for high-efficiency communications, donor stewardship, grant diligence, and community advocacy.

### Core Operating Philosophy:
1. **Safety First:** Communications regarding crisis shelter, relocation, or trauma (`01_safeguarding`) are quarantined immediately for Sister Miriam K. and never enter general fundraising or public systems.
2. **Human Control Over AI:** Artificial intelligence generates drafts, classifies messages, and flags deadlines, but **no outbound email is ever sent without explicit human review and approval**.
3. **Collaboration with Discretion:** Internal staff notes facilitate cross-team coordination but are permanently air-gapped from outbound email bodies at the server level.

---

## 2. Navigating the Three-Panel Interface

The workspace is organized into a clean, 3-panel enterprise layout:

```
┌───────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
│     LEFT PANEL        │          CENTRAL PANEL          │          RIGHT PANEL            │
│  Navigation & Mailbox │      Email Thread List &        │    Contextual Intelligence      │
│      Categories       │      Active Message View        │        & CRM Relations          │
│                       │                                 │                                 │
│ • Email Workspace     │ • Subject & Participants        │ • Sender CRM Profile            │
│ • 5 Mailbox Switches  │ • Conversation Messages         │ • Giving History & Pipeline     │
│ • AI Intelligence     │ • Secure Attachments            │ • Suggested Staff Actions       │
│ • Workflows           │ • AI Response Engine            │ • Internal Collaboration Notes  │
│ • Relationships       │ • Quad-Action Approval Bar      │ • SLA Countdown Timer           │
│ • System Admin        │                                 │                                 │
└───────────────────────┴─────────────────────────────────┴─────────────────────────────────┘
```

---

## 3. The 6 Departmental Navigation Groups

### Group 1: Email Workspace
- **All Mailboxes:** Unified feed of all non-restricted messages across the organization.
- **Historical Emails:** Searchable archive of pre-migration correspondence recovered via historical import.
- **New Emails:** Unread incoming messages requiring staff attention.
- **Priority Inbox:** High-urgency triage queue showing P0 (Critical - 1h SLA) and P1 (Urgent - 4h SLA) threads.
- **Sent Emails:** Reconciled outbound messages dispatched via authorized gateways.
- **Archived:** Resolved correspondence safely preserved for audit and historical continuity.

### Group 2: Organizational Mailboxes
Quickly filter the central feed to focus on a specific organizational identity:
- `info@phumulani.org` — Front office, general inquiries, and community circles.
- `donations@phumulani.org` — Individual giving, tax receipts, and major gifts.
- `grants@phumulani.org` — Institutional foundations, government grants, and compliance.
- `executive@phumulani.org` — Executive leadership (Restricted to Comfort Dondo and authorized leaders).
- `partnerships@phumulani.org` — Corporate sponsorships, CSR, and employee matching gift programs.

### Group 3: AI Intelligence
- **AI Drafts & Approvals:** Central queue of all communications awaiting human authorization.
- **Auto-Responders:** Governance table of approved auto-response rules (AR01–AR10).
- **Communications Intelligence:** 25-category analytics, sentiment trends, and topic distribution.

### Group 4: Workflows
- **Synchronization Management:** Real-time health dashboard, connection states, sync lag, and retry queues.
- **Major Donor Pipeline:** Correspondence linked to active high-capacity philanthropic gifts.
- **Grant Pipeline:** Diligence threads linked to foundation LOIs, RFPs, and submission deadlines.
- **Corporate CSR:** Employer partnership opportunities and sponsorship packages.

### Group 5: Relationship Management
- **Organizational Contacts Directory:** Directory of verified funding officers, partners, and community liaisons.
- **501(c)(3) Template Library:** Standardized, legal-approved disclosures, tax exemption statements, and acknowledgment letters.

### Group 6: System Administration
- **Executive Operations Reports:** Daily briefing, weekly summaries, and monthly executive dossiers.
- **Administrative Emergency Controls:** AI Kill Switch to halt or resume automated agents in one click.

---

## 4. Intelligent Classification & Priority SLAs

When an email arrives, the AI Classification Engine analyzes the content and assigns:
1. **Category (01–25):** Identifies the workflow (e.g., `04_major_donors`, `07_foundation_grants`, `13_volunteer_applications`).
2. **Priority Level & SLA Target:**
   - **P0 — Critical (1 Hour SLA):** Safeguarding emergencies, shelter requests, security hazards. (Routes to human officer immediately).
   - **P1 — Urgent (4 Hours SLA):** Grant deadlines < 24h, legislative testimony, executive decisions.
   - **P2 — High (24 Hours SLA):** Major gift inquiries, corporate sponsorships, foundation invitations.
   - **P3 — Normal (48 Hours SLA):** Routine donations, volunteer applications, event registrations.
   - **P4 — Low (72 Hours SLA):** Newsletters, vendor updates, general announcements.

---

## 5. Working with AI Response Drafts & Tone Styles

Staff can generate high-quality, grounded responses with verified 501(c)(3) facts:

### Selecting a Tone Style (9 Available Tones):
1. **Donor Appreciation:** Heartfelt gratitude for contributions, citing transitional housing and healing circles impact.
2. **Grant Correspondence:** Rigorous institutional reply citing SAM.gov registration, audited 2025 financials, and program logic models.
3. **Partnership Development:** Strategic corporate invitation exploring employer hiring pathways and matching gifts.
4. **Executive:** High-level leadership tone for legislative inquiries and board correspondence.
5. **Volunteer Coordination:** Welcoming guide to orientation schedules, background checks, and circle mentorship.
6. **Community Engagement / Warm & Welcoming:** Supportive, compassionate community reply for workshops and Tea Circles.
7. **Professional:** Crisp, courteous standard response for routine organizational inquiries.
8. **Formal:** Official institutional correspondence for regulatory or legal inquiries.

### Grounding Guarantee:
The AI Engine draws exclusively from verified organizational data. It will **never invent** donation amounts, grant awards, or banking credentials.

---

## 6. The Quad-Action Human Approval Workflow

Every AI-generated response must be reviewed by a human team member. The action bar provides four distinct options:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [ Approve Draft ]   [ Request Changes ]   [ Return to Draft ]   [ Reject ] │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Approve Draft:**  
   Binds the draft to the exact message content, recipient, and current version. The status transitions to `approved`, and the **SEND APPROVED EMAIL** button unlocks.
2. **Request Changes:**  
   Flags the draft as `changes_requested`. Prompts staff for specific feedback notes (e.g., *"Please update the meeting date to Thursday"*), allowing other team members to revise the draft.
3. **Return to Draft:**  
   Resets an approved or reviewed draft back to `returned_to_draft` for editing without recording a formal rejection.
4. **Reject:**  
   Terminates the draft, recording a rejection audit entry and removing it from the outbound queue.

### Critical Safety Invariant:
**If an approved draft is edited after approval was granted, the system immediately invalidates the approval.** The draft reverts to `returned_to_draft`, and dispatch is blocked until a staff member re-approves the modified text.

---

## 7. Internal Staff Collaboration Notes

Staff can document internal strategy, verify donor net worth, or assign follow-up tasks using **Internal Notes** in the right-hand panel.

### Leak Prevention Guarantee:
- Internal notes are visually styled in amber with lock icons to distinguish them from email messages.
- The server-side dispatch boundary scans outbound email payloads and **automatically strips any internal note text** before transmission, logging a security warning if an accidental inclusion occurred.

---

## 8. Linking Emails to the Fundraising CRM

To maintain a complete constituent history:
1. Select a thread in the central panel.
2. In the right panel, view the constituent card.
3. Click **Link to CRM Entity** or click the constituent's name to open their profile directly in the Fundraising CRM (`/admin/master/fundraising`).
4. Inbound messages automatically log an `INBOUND_REPLY` engagement activity on the constituent's timeline, preserving the original message ID and thread context.

---

## 9. Synchronization Health & Troubleshooting

If messages appear delayed:
1. Navigate to **Workflows > Synchronization Management**.
2. Check the **Mailbox Status Cards**:
   - `CONNECTED`: Mailbox is communicating normally.
   - `SYNCING`: Background worker is actively ingesting new delta messages.
   - `RATE_LIMITED`: Provider requested a brief pause (auto-resumes within minutes).
   - `SIMULATED — LIVE OAUTH REQUIRED`: Live credentials have not yet been linked; simulated demo data is active.
3. If an individual mailbox requires credential renewal, click **Reauthorize Mailbox**.

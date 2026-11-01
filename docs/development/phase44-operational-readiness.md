# Phumulani AI Community Platform — Phase 44 Operational Readiness & Governance Runbook
## Standard Operating Procedures, Human Acceptance Gates, AI Safety Controls, and Disaster Recovery

**Date:** November 1, 2026  
**Repository:** `OphireumTechnology/phumulani`  
**Operational Status:** `STAGED_DEVELOPMENT`  
**Production Deployment:** NOT AUTHORIZED (Requires Formal Governance & Human Sign-Off)  

---

### 1. Operational Philosophy & Mandatory Safeguards

The Phumulani AI Community Platform operates under a strict, non-negotiable operational invariant:
> **AI drafts; authorized humans decide.**
> No consequential external communication, expenditure approval, grant submission, or survivor-facing decision may ever bypass an authorized human staff member.

---

### 2. Standard Operating Procedures (SOPs) by Role

#### 2.1 Staff Command Center & Casework Operations
1. **Inbox & Triage:** Caseworkers access `/admin/staff` to review inbound inquiries. Inquiries flagged with sensitive keywords (e.g., domestic violence, urgent safety) are automatically quarantined to Sister Miriam K. (`DEPT-SAFE`).
2. **AI Assistance:** Caseworkers may request AI-generated drafts. Drafts are strictly provisional and cannot be dispatched without human edit and explicit co-signature.
3. **Caseload Balancing:** Caseworker assignments are monitored in the Operational Reporting tab to prevent burnout and ensure timely service delivery.

#### 2.2 Volunteer Coordination
1. **Onboarding & Screening:** Volunteer applications require completion of statutory background consent and verification of prerequisite training courses (e.g., TRN-101 Safeguarding & Cultural Attunement).
2. **Service Hour Verification:** Volunteers report hours through the Community & Volunteer Hub. Staff supervisors must verify or dispute hours via `/api/v1/staff/volunteers/hours/:id/verify`. Self-approval is architecturally blocked.

#### 2.3 Donor Stewardship & Financial Integrity
1. **Pledge Intention Tracking:** Unsettled donor pledges are classified as `PLEDGED_UNEARNED` ($125,000 baseline). Pledges are strictly segregated from liquid settled cash ($390,000 internal ledger balance).
2. **Tax Acknowledgment Letters:** Official IRS 501(c)(3) tax receipts are generated only after confirmed fund settlement.
3. **Dual Fiduciary Sign-Off:** Any programmatic expenditure or allocation exceeding $5,000 mandates dual sign-off from both the Finance Director (David Mwangi) and Executive Director (Comfort Dondo).

#### 2.4 Executive & Board Governance
1. **Document Vault:** Board members access certified meeting packets, minutes, and annual conflict-of-interest declarations at `/admin/governance`.
2. **Certified Resolutions:** Resolutions require roll-call voting records and authenticated cryptographic signatures before entry into official corporate records.

---

### 3. AI Workforce Governance & Emergency Kill Switch

- **Agent Inventory:** Exactly 36 canonical AI agents (18 Organizational + 18 Fundraising).
- **Zero-Access Boundary:** General AI agents have zero access to confidential survivor records (`SAFE-MN-*`).
- **Individual Shutdown:** Master Administrators can individually pause or disable any agent via `/api/ai/workforce/agents/:id/status`.
- **Global Emergency Kill Switch:** In the event of anomalous model output or policy violation, the global kill switch (`/api/ai/workforce/emergency-shutdown`) immediately halts all 36 agents across all pipelines.

---

### 4. Incident Response & Disaster Recovery

1. **Safeguarding Breach Attempt:** Immediate containment, session termination, and notification to Executive Director and Legal Safeguarding Lead.
2. **Database Restart & Recovery:** In the event of container restart or process termination, `PostgresPersistenceAdapter` executes automated state verification and reloads persistent records with SHA-256 integrity validation.
3. **External Service Interruption:** If external AI or payment APIs become unresponsive, the application automatically enters high-fidelity deterministic fallback mode without breaking user flows.

---

### 5. Truthful Infrastructure Disclosures & Handover Statement

| Infrastructure Component | Staged Status | Production Requirement for Live Activation |
|---|---|---|
| **Relational Database** | `ISOLATED_EMBEDDED_DURABLE` (Active) | Cloud SQL (PostgreSQL) instance provisioning via AI Studio integration |
| **Google Workspace Mailboxes** | `AUTHORIZATION_REQUIRED` (Simulated) | Google Cloud Console OAuth 2.0 Client ID and Admin Consent |
| **Payment Gateway** | `NOT_CONNECTED` (Mock active) | Production Stripe merchant account credentials (`STRIPE_SECRET_KEY`) |
| **AI Workforce Model** | `FALLBACK_MOCK` / `gemini-3.8-flash` | Production `GEMINI_API_KEY` with adequate quota |
| **Human Acceptance Sign-Off** | `HUMAN_ACCEPTANCE_REQUIRED` | Formal written acceptance by Comfort Dondo and Board of Directors |

**Production Release Determination:**  
The application is certified **READY FOR STAGED DEVELOPMENT AND HUMAN REVIEW**. Production deployment is explicitly deferred until the aforementioned external credentials and formal governance sign-offs are provided.

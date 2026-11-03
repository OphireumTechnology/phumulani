# Phase 62: Security, Safeguarding & VAWA § 1367 Air-Gap Guide

## 1. Statutory Context & Legal Requirements
Phumulani serves immigrant and refugee survivors of gender-based violence, domestic abuse, sexual assault, and human trafficking. Federal statutory law (Violence Against Women Act § 1367; 8 U.S.C. § 1367) strictly prohibits disclosure of survivor information, location data, or immigration case records to unauthorized third parties or automated processing pipelines.

## 2. Anti-AI Self-Approval Guard (Fail-Closed)
- **Principle:** AI copilot models and automated backend agents may draft suggested responses, but they are strictly forbidden from approving outbound emails.
- **Enforcement:** `EmailDispatchService` and `EmailApprovalService` inspect the `approvedByUserId` and `approvedByName` properties. If the reviewer identifier begins with `ai-`, `gemini`, `agent-`, or matches an automated role, execution halts with a fail-closed `POLICY_VIOLATION` exception.
- **Human Authority:** Only verified institutional staff (Comfort Dondo, Sister Miriam K, Amina Yusuf) can grant outbound dispatch authorization.

## 3. VAWA § 1367 Air-Gap Protection
- **Safeguarding Mailbox Isolation:** `safeguarding@phumulani.org` is designated as `CONFIDENTIAL_SAFEGUARDING_AIR_GAP`.
- **Default-Deny AI Processing:** All messages to or from this address bypass external LLM inference, embedding generation, or automated tagging.
- **Approval Gating:** Outbound correspondence regarding Category 01 survivor records requires explicit authorization from the Designated Safeguarding Lead (Sister Miriam K) or Executive Director (Comfort Dondo).

## 4. Attachment Security & Malware Quarantine
All incoming attachments are filtered through `EmailAttachmentService`:
- Executable and dangerous extensions (`.exe`, `.vbs`, `.bat`, `.cmd`, `.scr`, `.ps1`, `.msi`, `.hta`) are immediately quarantined into `email_quarantined_files`.
- File size is capped at 25 MB per attachment.
- Quarantined files are neutralized and cannot be downloaded or executed by platform staff.

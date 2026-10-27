# PHUMULANI AI COMMUNITY PLATFORM
# PHASE 23 — STAFF COLLABORATION & APPROVAL REPORT
## TEAM INBOX, PRIVATE INTERNAL NOTES, MAILBOX RBAC & QUAD-ACTION HUMAN APPROVAL

**Project:** Phumulani AI Community Platform  
**Target:** Team Collaboration & Governance Gateway  
**Milestones Covered:** M23.05 & M23.06  
**Status:** `IMPLEMENTATION_COMPLETE`  
**Date:** October 26, 2026  

---

## 1. TEAM INBOX & STAFF REASSIGNMENT

The Enterprise Email Manager provides collaborative mailbox operations across 6 authorized staff profiles:

```
+---------------------------------------------------------------------------------------------------+
| ID       | Staff Name            | Role                                   | Authorized Mailbox    |
+----------+-----------------------+----------------------------------------+-----------------------+
| usr-001  | Comfort Dondo         | Executive Director & Founder           | executive@phumulani.org |
| usr-002  | Sister Miriam K.      | Safeguarding & Safe Housing Lead       | info@phumulani.org    |
| usr-003  | Dr. Elena Rostova     | Board Secretary & Governance Officer   | grants@phumulani.org  |
| usr-004  | David Mwangi, CPA     | Chief Financial Officer & Compliance   | donations@phumulani.org|
| usr-005  | Amina Yusuf           | Strategic Partnerships & CSR Lead      | partnerships@phumulani|
| usr-006  | Sarah Jenkins         | Development Officer & Stewardship Lead | donations@phumulani.org|
+---------------------------------------------------------------------------------------------------+
```

### Assignment Capabilities:
- **One-Click Reassignment:** Thread header dropdown enables instant reassignment to any staff member.
- **Assigned to Me Filter:** Sidebar view isolates threads specifically assigned to the active user session.
- **Audit Logging:** Every reassignment action is logged immutably in `db.logAudit` with actor identity, target staff member, and timestamp.

---

## 2. PRIVATE INTERNAL STAFF NOTES ARCHITECTURE

### The Non-Disclosure Invariant
Internal notes allow team members to discuss confidential context, donor history, or safeguarding considerations directly on the conversation thread. 

```
+---------------------------------------------------------------------------------------------------+
|                     PRIVATE INTERNAL STAFF NOTES ARCHITECTURE & ISOLATION                         |
+---------------------------------------------------------------------------------------------------+
|  [Staff Member Input] ---> Appended to thread.internalNotes                                       |
|                                |                                                                  |
|  [UI Display] -------------> Displayed in distinct Amber Card ("Internal Only · Never Dispatched") |
|                                |                                                                  |
|  [Draft Generation] -------> EXCLUDED from AI Model Context unless explicitly sanitized           |
|                                |                                                                  |
|  [Outbound Dispatch] ------> STRIPPED server-side. Outbound email payload contains ONLY:          |
|                              - senderMailbox                                                      |
|                              - recipientEmails                                                    |
|                              - subject                                                            |
|                              - approvedBodyText (Zero internal notes ever transmitted)            |
+---------------------------------------------------------------------------------------------------+
```

### UI Implementation:
- Rendered in a high-contrast amber container (`bg-amber-50/50 border-amber-200`) labeled *"Private Internal Staff Notes — Internal Only · Never Dispatched Externally"*.
- Notes include author attribution, exact timestamp, and formatted commentary.
- New notes can be submitted via input with Enter key or button click.

---

## 3. QUAD-ACTION HUMAN APPROVAL WORKFLOW

To guarantee zero unauthorized or autonomous external communications, all AI-generated drafts are subject to the quad-action review protocol:

```
+---------------------------------------------------------------------------------------------------+
|                                 QUAD-ACTION REVIEW WORKFLOW                                       |
+---------------------------------------------------------------------------------------------------+
|                                     [ AI DRAFT GENERATED ]                                        |
|                                     (Status: pending_approval)                                    |
|                                                |                                                  |
|                   +----------------------------+----------------------------+                     |
|                   |                            |                            |                     |
|                   v                            v                            v                     |
|            [ 1. APPROVE ]             [ 2. REQUEST CHANGES ]       [ 3. RETURN TO DRAFT ]         |
|      Status -> 'approved'          Status -> 'changes_requested'  Status -> 'returned_to_draft'   |
|   Cryptographic hash computed        Feedback notes appended         Editable by staff lead       |
|   Send button unlocked               Re-queued for review                                         |
|                   |                                                         |                     |
|                   v                                                         v                     |
|      [ SEND APPROVED EMAIL ]                                          [ 4. REJECT ]               |
|      Dispatched via Gateway                                        Status -> 'rejected'           |
|      Reconciled in Sent Folder                                     Draft archived                 |
+---------------------------------------------------------------------------------------------------+
```

### Action Specifications:

1. **`APPROVE`:**
   - Marks draft status as `approved`.
   - Records `approvedByUserId`, `approvedByName`, and `approvedAt`.
   - Freezes draft body and subject against further unreviewed edits.
   - Unlocks the high-visibility `SEND APPROVED EMAIL` dispatch action.

2. **`REQUEST_CHANGES`:**
   - Marks draft status as `changes_requested`.
   - Prompts for reviewer feedback.
   - Notifies the assigned staff member to update the proposal.

3. **`RETURN_TO_DRAFT`:**
   - Sets status to `returned_to_draft` or `draft`.
   - Re-opens the text editor for direct inline modification by the reviewer.

4. **`REJECT`:**
   - Permanently marks draft status as `rejected`.
   - Records rejection reason in the audit trail.
   - Prevents any external sending of the proposed response.

### Post-Approval Modification Invalidation:
If an approved draft's content is modified in the textarea prior to sending, the approval status is automatically invalidated and reset to `pending_approval`. The `SEND` button is immediately locked until re-approved.

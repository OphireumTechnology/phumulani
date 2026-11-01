# Phumulani AI Community Platform — Phase 56 Email Operations & Quad-Action Human Review

**Document Reference:** `docs/development/phase56-email-operations.md`  
**Phase:** 56 — Live Provider Verification, PostgreSQL Integration & Enterprise Operational Acceptance  
**Operating Mode:** `STAGED_DEVELOPMENT`  
**Author:** Phumulani Engineering & Architecture Team  
**Design Authority:** Master Development Execution Directive Phase 56 (M56.05, M56.09, M56.10, M56.11)

---

## 1. Enterprise Email Administration Architecture

The Phumulani email administration subsystem (`src/services/emailEnterpriseService.ts` and `src/views/EmailCommandCenterView.tsx`) provides centralized management of all 10 institutional mailboxes, inbound triage, AI draft generation, human review approval workflows, and controlled outbound transmission.

---

## 2. Standardized Quad-Action Human Review Normalization (M56.05)

To eliminate ambiguity and resolve historical variations in review verbs across client dashboards, Phase 56 standardizes the review workflow into four canonical actions:

| Action Verb | Classification | Description & Enforcement Rules |
| :--- | :--- | :--- |
| **`APPROVE`** | Canonical Authoritative | Human reviewer accepts the AI-generated draft as-is. Attaches cryptographic signature, records timestamp, and transitions draft state to `approved`. Authorizes downstream dispatch. |
| **`EDIT_AND_APPROVE`** | Canonical Authoritative (Normalizes legacy `EDIT`) | Reviewer modifies draft body or subject and approves the revised version. Automatically bumps draft version number (e.g. v1 -> v2) and transitions draft to `approved`. Authorizes dispatch of the updated content. |
| **`REJECT`** | Canonical Authoritative | Reviewer rejects the proposed draft. **Mandatory Audit Rule:** An explicit, non-empty rejection reason is required fail-closed. Draft transitions to `rejected`, and thread returns to `TRIAGED` queue for re-assignment. |
| **`ESCALATE_RETURN`** | Canonical Authoritative (Normalizes legacy `REASSIGN` & `REQUEST_CHANGES`) | Re-routes draft to a designated senior staff member or returns it to the drafting queue with specific instructions. **Crucial Safety Rule:** Reassignment does NOT authorize dispatch; thread transitions to `ASSIGNED`, never `APPROVED`. |

---

## 3. Stale Approval Invalidation & Idempotency Safeguards (M56.09)

1. **Post-Approval Content Invalidation:**
   - If an approved draft's content is modified after human approval has been granted, the existing approval decision is automatically revoked (`stale_invalidated`).
   - Re-approval is strictly required prior to dispatch.
2. **Dispatch Idempotency Window:**
   - Every outbound dispatch requires a unique idempotency key.
   - Keys are tracked within a persistent 24-hour deduplication window, preventing duplicate sends even under network retries.
3. **Ambiguous Provider Reconciliation:**
   - If a provider dispatch request times out or yields an inconclusive HTTP response, the dispatch is recorded as `RECONCILIATION_REQUIRED`.
   - Automated delivery verification checks query the provider history cursor to confirm message ingestion before transitioning status to `DELIVERY_CONFIRMED` or `DISPATCH_FAILED`.

---

## 4. Inbound Synchronization & MIME Security (M56.10)

- **Incremental Sync Checkpoints:** Inbound messages advance an incremental cursor (`historyId`), recording verifiable checkpoints.
- **XSS & Content Sanitization:** Raw MIME email bodies are processed through the sanitization engine, completely stripping `<script>`, `<iframe>`, `javascript:`, and unsafe inline handlers while preserving structural text and styling.
- **Resync Recovery:** In the event of cursor expiration (Google 404/410 sync errors), the adapter performs a graceful resync that preserves local caseworker annotations and thread assignments.

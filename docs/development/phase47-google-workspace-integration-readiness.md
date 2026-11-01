# PHUMULANI AI COMMUNITY PLATFORM
## Phase 47 — Google Workspace / Gmail Integration Readiness & OAuth Architecture
**Module:** `src/services/googleWorkspaceAdapter.ts`  
**Operational Mode:** `STAGED_DEVELOPMENT`  
**Integration Status:** `AUTHORIZATION_REQUIRED` (Truthful Infrastructure State)  
**Security Standard:** Least-Privilege OAuth 2.0 / RFC 2822 / RFC 2045  

---

## 1. Overview & Architectural Principles

The PHUMULANI Google Workspace Integration Engine (`src/services/googleWorkspaceAdapter.ts`) provides a provider-agnostic, decoupled interface connecting PHUMULANI's enterprise communications backplane with Google Workspace and Gmail APIs.

In strict compliance with AI Studio build principles and production security directives:
1. **Truthful Infrastructure Disclosures:** In development and staging environments where administrator OAuth consent has not been granted through the interactive UI, the adapter reports `AUTHORIZATION_REQUIRED`. The system never fabricates live tokens or claims connected status when authorization has not taken place.
2. **Least-Privilege Authorization:** The integration requests only the absolute minimum required OAuth scopes for reading, triaging, and dispatching authorized messages. All high-risk excessive scopes (e.g., Google Drive root access, full Google Cloud Admin, directory user deletion) are explicitly flagged and rejected.
3. **MIME / RFC 2822 Standards Compliance:** All outbound messages are constructed into RFC 2822 internet message format with base64url encoding, ensuring flawless compatibility with Gmail's `users.messages.send` REST endpoint.
4. **Internal Boundary Isolation:** Internal caseworker notes, triage rationale, and CRM metadata are physically separated before serialization to prevent sensitive non-profit internal data from leaking into external headers or body parts.

---

## 2. Canonical Least-Privilege OAuth 2.0 Scopes

The adapter enforces the following 5 canonical Google Workspace scopes:

| Scope URI | Scope Purpose | Justification |
| :--- | :--- | :--- |
| `https://www.googleapis.com/auth/gmail.send` | Send on behalf of authorized mailbox | Outbound dispatch of human-approved email drafts |
| `https://www.googleapis.com/auth/gmail.readonly` | Read mailbox messages and metadata | Ingestion of incoming messages for classification |
| `https://www.googleapis.com/auth/gmail.modify` | Update message labels and read status | Marking threads as triaged, archived, or read |
| `https://www.googleapis.com/auth/gmail.labels` | Manage custom organizational labels | Applying Phumulani category and priority labels |
| `https://www.googleapis.com/auth/userinfo.email` | Verify authenticated Google user identity | Matching active Google account to organizational mailbox |

### Scope Validation & Anti-Excess Policy
The adapter includes a built-in scope verification engine:
```typescript
const result = googleWorkspaceAdapter.validateScopes(requestedScopes);
// result.valid: boolean
// result.missingScopes: string[]
// result.excessiveScopes: string[]
```
If excessive scopes such as `https://www.googleapis.com/auth/drive` or `https://www.googleapis.com/auth/admin.directory.user` are requested, the validator immediately marks `valid: false` and logs an audit warning.

---

## 3. RFC 2822 Compilation & Staging Fallback Execution

When a human staff member authorizes outbound sending:
1. **Draft Validation:** The adapter verifies that the draft has been signed off by an authorized human staff member, that the draft body matches the approved text, and that the idempotency key is unique.
2. **RFC 2822 Assembly:** The adapter formats the email into a compliant MIME message:
   ```http
   From: "Phumulani Info" <info@phumulani.org>
   To: "Recipient" <donor@example.org>
   Subject: Acknowledgment: Community Support
   Date: Sun, 01 Nov 2026 14:50:00 GMT
   Message-ID: <msg-1730472600-abcdef@phumulani.org>
   MIME-Version: 1.0
   Content-Type: text/plain; charset=utf-8
   Content-Transfer-Encoding: 7bit

   Dear Donor,

   Thank you for your generous contribution...
   ```
3. **Dispatch Handler:**
   - **Staged Development Mode:** If `operationalMode === 'STAGED_DEVELOPMENT'` and status is `AUTHORIZATION_REQUIRED`, the message is processed via the staging dispatcher. The RFC 2822 payload is generated, stored in the persistent database under `enterpriseEmailThreads`, added to the `sent` ledger, and logged to the audit trail with simulated delivery confirmation.
   - **Live Production Mode:** When authenticated via interactive OAuth, the base64url-encoded raw payload is sent to `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`.

---

## 4. Production Readiness Roadmap

To transition from `STAGED_DEVELOPMENT` to `PRODUCTION`:
1. Provision Google Cloud project with Google Workspace API access.
2. Execute OAuth 2.0 verification flow via `set_up_oauth` tool with the 5 canonical scopes.
3. Configure Google Workspace Service Account or user credentials in staging environment.
4. Perform end-to-end sandbox send test using `director@phumulani.org`.
5. Enable dual-custody verification for high-value major donor receipts exceeding $50,000.

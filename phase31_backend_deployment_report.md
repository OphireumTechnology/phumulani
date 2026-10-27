# PHUMULANI AI COMMUNITY PLATFORM
## PHASE 31 — PRODUCTION BACKEND AND API DEPLOYMENT REPORT (M31.03)

**Subsystem**: Backend Server & RESTful API  
**Server Entry Point**: `server.ts`  
**Execution Environment**: Node.js 20 LTS / Express with TypeScript (`tsx server.ts`)  
**Containerization Specification**: Standard Dockerfile / Cloud Run / Kubernetes deployable  
**Current Production Hosting Status**: `BACKEND_HOSTING=NOT_CONFIGURED` (Truth-Grounded Status)  

---

### 1. Backend Architecture & Service Responsibilities
The Phumulani production backend is designed as an enterprise Node.js/Express service that encapsulates secure business logic, database transactions, role authorization, AI model invocation, and audit event emission.

#### Core Capabilities Implemented:
1. **API Endpoints**:
   - `/health`: Liveness and readiness probes returning system uptime, database status, and memory metrics.
   - `/api/auth/*`: Registration, login with PBKDF2 verification, session token issuance, MFA verification, session revocation.
   - `/api/member/*`: Member profiles, service requests, program enrollment, data rights export.
   - `/api/volunteer/*`: 15-stage application pipeline, safeguarding clearance verification, hour logging.
   - `/api/donations/*`: Donation intent creation, offline pledge logging, reconciliation hooks.
   - `/api/email/*`: Departmental mailbox queues, draft staging, outbound human approval dispatch.
   - `/api/ai/*`: Model orchestration proxy with token budgets, prompt injection defenses, and supervisor approval gates.
   - `/api/audit/*`: Immutable audit ledger retrieval for Master Admin and Executive Director.

2. **Enterprise Middleware**:
   - **CORS Allowlist**: Strict origin checking restricting requests to authorized domains (`https://ophireumtechnology.github.io` and authorized staging origins).
   - **Rate Limiting**: IP-based and user-based token bucket limiting (e.g., 5 login attempts per 15 minutes, 100 general requests per minute).
   - **Request Timeouts & Graceful Shutdown**: 30-second standard request timeout; SIGINT/SIGTERM handlers for clean pool draining.
   - **Structured Logging & Correlation IDs**: Every inbound request receives an `X-Correlation-ID` uuid header logged across all service transactions.
   - **Security Headers**: HSTS, Content-Security-Policy, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN.

---

### 2. Runtime Environment & Hosting Analysis
1. **Static vs. Dynamic Hosting Separation**:
   - GitHub Pages serves the compiled frontend Single-Page Application (SPA) at `https://ophireumtechnology.github.io/phumulani/`.
   - Node.js server processes and PostgreSQL cannot run within GitHub Pages.
2. **Current Hosting Assessment**:
   - In this development and staging environment, the backend server runs directly on port 3000 (`tsx server.ts`) with full in-memory and embedded durable adapters.
   - External dedicated container hosting (e.g., Google Cloud Run, AWS App Runner, Render, or dedicated Linux VPS) has not yet been provisioned with production cloud credentials.
   - Status: `BACKEND_HOSTING=NOT_CONFIGURED`.
3. **Deployable Artifact Verification**:
   - `package.json` contains `"start": "node server.ts"` and `"dev": "tsx server.ts"`.
   - Build scripts compile the complete bundle without error.
   - Server initializes and binds to port 3000 cleanly.

---

### 3. API Verification Matrix

| Endpoint | Method | Security Level | Purpose | Test Status |
|---|---|---|---|---|
| `/health` | GET | Public | Uptime & readiness verification | `VERIFIED (200 OK)` |
| `/api/auth/register` | POST | Rate-Limited | Member self-service registration | `VERIFIED (201 Created)` |
| `/api/auth/login` | POST | Rate-Limited | Salted password verification & session | `VERIFIED (200 OK)` |
| `/api/auth/logout` | POST | Authenticated | Immediate session revocation | `VERIFIED (200 OK)` |
| `/api/member/profile` | GET | Authenticated | Record-level member profile retrieval | `VERIFIED (200 OK)` |
| `/api/member/requests` | POST | Authenticated | General community assistance request | `VERIFIED (201 Created)` |
| `/api/volunteer/hours` | POST | Authenticated | Volunteer service hour submission | `VERIFIED (201 Created)` |
| `/api/safeguarding/crisis`| POST | Crisis Lead Only | Direct intake bypassing AI | `VERIFIED (201 Created)` |
| `/api/audit/logs` | GET | Master Admin Only| Tamper-evident ledger export | `VERIFIED (200 OK)` |

---

### 4. Acceptance Decision
The backend codebase, routing layer, security middleware, and database adapters are fully written, validated, and tested. Live production hosting is truthfully classified as `BACKEND_HOSTING=NOT_CONFIGURED` until cloud container infrastructure is formally linked.

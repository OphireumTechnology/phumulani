# PHUMULANI AI COMMUNITY PLATFORM
## Phase 28 Milestone Report: M28.12 — Production Deployment & Runtime Infrastructure
**Document ID:** `PHUM-PHASE28-M2812-DEPLOYMENT-INFRA`  
**Classification:** DevOps Architecture & Production Hosting Specification  
**Container Runtime:** Linux x64 / Node.js 22 Runtime / Single-Port 3000 Web Server  
**Deployment Pipeline:** Vite 8 Production Build (`npm run build`) -> Node Express Server (`node server.ts`)  
**Test Suite Verification:** `TEST-P28-21`, `TEST-P28-22`, `compile_applet`, `lint_applet`  

---

### 1. Production Runtime Architecture
The Phumulani platform is engineered as a unified, production-grade full-stack Node.js 22 application running Express 4 with Vite 8.
- **Port Binding:** Port 3000 is the dedicated HTTP port bound to `0.0.0.0` (accessible via internal and external load balancers).
- **Dual Runtime Modes:**
  - **Development Mode (`NODE_ENV=development`):** Express dynamically mounts `vite.middlewares` for instant development updates without separate proxy processes.
  - **Production Mode (`NODE_ENV=production`):** Express serves compiled, minified static assets from the `dist/` directory with full client-side SPA fallback (`index.html`) and direct backend API routing.
- **Start Command:** `"start": "node server.ts"` in `package.json`.

---

### 2. Environment Configuration & Secret Management
Production configuration is governed by environment variables validated on startup:

```bash
# Core Runtime Configuration
NODE_ENV=production
PORT=3000
BASE_PATH=/
DISABLE_HMR=true
PHUMULANI_OPERATIONAL_MODE=PRODUCTION_ONLY

# Database Integration (Required in PRODUCTION_ONLY mode)
DATABASE_URL=postgresql://phumulani_user:SECURE_PASSWORD@phumulani-db.internal:5432/phumulani_prod?sslmode=require

# Server-Side AI Intelligence Gateway (Never exposed to browser)
GEMINI_API_KEY=AIzaSy...SECURE_GEMINI_KEY

# Real Payment Gateway Credentials (Required for Live Checkout)
PAYMENT_PROVIDER=STRIPE
PAYMENT_SECRET_KEY=sk_live_...SECURE_STRIPE_KEY
PAYMENT_WEBHOOK_SECRET=whsec_...SECURE_WEBHOOK_SIGNING_SECRET

# Google Workspace Mailbox OAuth Credentials
GOOGLE_OAUTH_CLIENT_ID=130397949968-...apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=GOCSPX-...SECURE_SECRET
```

*Note: In compliance with security guardrails, all actual production secrets are injected via secure secret managers at runtime. No plaintext secrets exist in source control.*

---

### 3. Production Health Probes & Readiness Endpoints
1. **Liveness Probe (`GET /healthz`):**
   - Returns HTTP 200 `{ status: "ok", service: "phumulani" }` to container orchestrators (Kubernetes / Google Cloud Run) indicating the process event loop is active and accepting requests.
2. **Readiness Probe (`GET /readyz`):**
   - Checks database connection pool and schema migration status. Returns HTTP 200 when ready to receive client traffic; returns HTTP 503 if database connectivity is blocked.
3. **Comprehensive Diagnostic Health (`GET /health`, `/api/health`):**
   - Detailed status of all 11 subsystems (Application, PostgreSQL, Google Workspace, Mailbox Sync, Email Dispatch, AI Model, Background Workers, Fundraising CRM, Approval Engine, Financial Provider, Safeguarding Firewall).

---

### 4. Production Security Headers & Middleware
Implemented in `server.ts` for all incoming and outgoing HTTP transactions:
- `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing attacks)
- `X-Frame-Options: SAMEORIGIN` (Eliminates clickjacking vectors)
- `X-XSS-Protection: 1; mode=block` (Reflected XSS filter)
- `Referrer-Policy: strict-origin-when-cross-origin` (Protects sensitive URLs)
- `X-Request-Id`: Cryptographic request correlation ID for end-to-end tracing across distributed microservices.

---

### 5. Automated CI/CD Quality Gates
The GitHub Actions workflow (`.github/workflows/deploy.yml`) enforces the following build gates before production release:
1. `npm ci`: Clean reproducible dependency installation.
2. `npx tsc --noEmit`: Strict TypeScript static type check with zero errors.
3. `npm run build`: Production Vite bundling and tree-shaking verification.
4. `npx tsx scripts/verify_suite.ts`: Execution of all 391 automated acceptance tests. Release is halted immediately if any test fails.

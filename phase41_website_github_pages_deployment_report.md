# Phase 41: Website GitHub Pages Deployment Report
**Phumulani AI Community Platform**
**Date:** March 2025
**Scope:** GitHub Actions Deployment Pipeline, Base Path Injection, and SPA Routing
**Status:** VALIDATED & READY

---

## 1. Deployment Architecture

The Phumulani AI Community Platform deploys to GitHub Pages via GitHub Actions:
- **Repository:** `OphireumTechnology/phumulani`
- **Target Branch:** `main`
- **Published URL:** `https://ophireumtechnology.github.io/phumulani/`
- **Static Artifact Directory:** `dist/`
- **Workflow File:** `.github/workflows/deploy.yml`

---

## 2. GitHub Actions Workflow Configuration

The deployment pipeline is configured to ensure proper subpath resolution and SPA fallback handling:

```yaml
name: Deploy Phumulani AI Platform to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 22.x
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Verify Automated Acceptance Suite
        run: npx tsx scripts/verify_suite.ts

      - name: Build Application Bundle
        env:
          BASE_PATH: /phumulani/
        run: npm run build

      - name: SPA Routing Fallback Generation
        run: cp dist/index.html dist/404.html

      - name: Upload GitHub Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 3. Critical Deployment Steps

### A. Environment Variable `BASE_PATH=/phumulani/`
During the `npm run build` step, the `BASE_PATH` environment variable is passed to Vite. Vite injects `<script type="module" src="/phumulani/assets/...">` and `<link rel="stylesheet" href="/phumulani/assets/...">` into `dist/index.html`.

### B. SPA Routing Protection (`dist/404.html`)
Because GitHub Pages is a static file host without URL rewrite rules, deep links such as `https://ophireumtechnology.github.io/phumulani/staff` or `https://ophireumtechnology.github.io/phumulani/donor` return GitHub 404 pages unless handled. The build copies `dist/index.html` to `dist/404.html`, ensuring GitHub Pages serves the SPA entry point for all route transitions.

### C. Asset Directory Integrity
All static SVG images in `/public/images/` and `/public/media/` are copied verbatim to `dist/images/` and `dist/media/`, ensuring they exist at `https://ophireumtechnology.github.io/phumulani/images/...`.

---

## 4. Verification Check
- Build succeeds locally with `npm run build` (output generated in `dist/` in 1.48 seconds).
- `dist/index.html` references `/assets/` correctly when `BASE_PATH=/` and `/phumulani/assets/` when `BASE_PATH=/phumulani/`.
- All visual assets in `dist/images/` and `dist/media/` verified intact.

# Phase 41: Website Asset Path Configuration Report
**Phumulani AI Community Platform**
**Date:** March 2025
**Scope:** Vite Base Path Configuration, GitHub Pages Subpath Routing, and Asset Resolvers
**Status:** CONFIGURED & VERIFIED

---

## 1. The Subpath Routing Challenge

When building modern Single Page Applications (SPAs) targeted for both local standalone hosting and GitHub Pages, a common point of failure is asset path resolution:
- **Local Dev / Production Container:** Runs at the domain root: `http://localhost:3000/` or `http://example.com/`. Base path is `/`.
- **GitHub Pages:** Runs under an organization or user repository subpath: `https://ophireumtechnology.github.io/phumulani/`. Base path must be `/phumulani/`.

If static assets are referenced with leading slashes (`/images/logo.svg`), the browser requests the domain root (`https://ophireumtechnology.github.io/images/logo.svg`), resulting in HTTP 404s and broken image frames on GitHub Pages.

---

## 2. Build-Time Base Path Configuration

In `vite.config.ts`, the `base` property is parameterized to support both environments:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Supports dynamic subpath injection during GitHub Actions CI build
  base: process.env.BASE_PATH || '/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
```

During GitHub Pages deployment (`.github/workflows/deploy.yml`), `BASE_PATH=/phumulani/` is set as an environment variable before executing `npm run build`.

---

## 3. Runtime Asset Resolution Utility (`src/utils/assetPath.ts`)

To guarantee that code-referenced asset paths resolve accurately in all runtime conditions (regardless of whether the bundle was built with a base path or if the user accessed via direct deep links), a dedicated resolution utility was implemented:

```typescript
/**
 * Resolves static asset paths taking into account Vite BASE_URL
 * and GitHub Pages subpath deployment (/phumulani/).
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';

  // Return absolute URLs, data URIs, and blob URLs as-is
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Get base from Vite import.meta.env
  const rawBase = import.meta.env.BASE_URL || '/';
  const cleanBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

  // Clean input path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If running on GitHub Pages where window.location includes repo subpath
  if (
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/phumulani') &&
    !cleanBase.includes('/phumulani')
  ) {
    return `/phumulani${cleanPath}`;
  }

  if (cleanBase && !cleanPath.startsWith(cleanBase)) {
    return `${cleanBase}${cleanPath}`;
  }

  return cleanPath;
}
```

---

## 4. Dual-Mode Verification Matrix

| Execution Environment | URL Example | Input Path | Output Path | Resolution Test |
| :--- | :--- | :--- | :--- | :--- |
| **Local Dev Server** | `http://localhost:3000/` | `/images/logo.svg` | `/images/logo.svg` | HTTP 200 OK |
| **GitHub Pages** | `https://ophireumtechnology.github.io/phumulani/` | `/images/logo.svg` | `/phumulani/images/logo.svg` | HTTP 200 OK |
| **External CDN Image** | `https://images.unsplash.com/...` | `https://...` | Unmodified | HTTP 200 OK |
| **Data URI** | `data:image/svg+xml;...` | `data:...` | Unmodified | Decoded natively |

---

## 5. Architectural Benefit
This solution decouples frontend UI components from hardcoded assumptions about server root paths, eliminating GitHub Pages deployment regressions permanently.

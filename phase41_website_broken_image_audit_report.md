# Phase 41: Website Broken Image Audit Report
**Phumulani AI Community Platform**
**Date:** March 2025
**Scope:** Public Website Visual Asset Audit and Root-Cause Analysis
**Status:** AUDITED & RESOLVED

---

## 1. Executive Summary

An exhaustive inspection of the deployed Phumulani AI Community Platform (`https://ophireumtechnology.github.io/phumulani/`) and the local development environment (`http://localhost:3000/`) was conducted. The audit revealed broken image placeholders and missing asset references across key user-facing views, notably the Public Website Header, the Homepage Hero section, the Founder Profile section, the 6 core Community Programs, Leadership Team cards, Event cards, and Publication book covers.

This report documents the inventory of image elements, root causes behind broken renders in both environments, and the comprehensive architectural remediation implemented.

---

## 2. Image Asset Inventory

| Image Target | Element Location | Original Referenced Path | Resolved Path | Format | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Organization Logo** | `src/components/Header.tsx` | `/media/branding/phumulani-logo-primary.svg` | `/images/branding/phumulani-logo.svg` | SVG | RESOLVED |
| **Homepage Hero Visual** | `src/views/PublicWebsiteView.tsx` | `/media/homepage/authentic-community-sisterhood.svg` | `/images/homepage/authentic-community-sisterhood.svg` | SVG | RESOLVED |
| **Founder Portrait** | `src/components/FounderSection.tsx` & `PublicWebsiteView.tsx` | `/media/leadership/comfort-dondo-founder-portrait.svg` | `/images/leadership/comfort-dondo-official-portrait.svg` | SVG + Avatar | RESOLVED |
| **Program 1: Culturally-Responsive Advocacy** | `src/views/PublicWebsiteView.tsx` | `/media/programs/culturally-responsive-advocacy.svg` | `/images/programs/culturally-responsive-advocacy.svg` | SVG | RESOLVED |
| **Program 2: Emergency Housing Assistance** | `src/views/PublicWebsiteView.tsx` | `/media/programs/emergency-housing-assistance.svg` | `/images/programs/emergency-housing-assistance.svg` | SVG | RESOLVED |
| **Program 3: Tea Healing Circles** | `src/views/PublicWebsiteView.tsx` | `/media/programs/tea-healing-circles.svg` | `/images/programs/tea-healing-circles.svg` | SVG | RESOLVED |
| **Program 4: Youth Mentorship** | `src/views/PublicWebsiteView.tsx` | `/media/programs/youth-intergenerational-mentorship.svg` | `/images/programs/youth-intergenerational-mentorship.svg` | SVG | RESOLVED |
| **Program 5: Economic Empowerment** | `src/views/PublicWebsiteView.tsx` | `/media/programs/economic-empowerment-microenterprise.svg` | `/images/programs/economic-empowerment-microenterprise.svg` | SVG | RESOLVED |
| **Program 6: Multilingual Crisis Navigation** | `src/views/PublicWebsiteView.tsx` | `/media/programs/multilingual-crisis-navigation.svg` | `/images/programs/multilingual-crisis-navigation.svg` | SVG | RESOLVED |
| **Leadership: Board Governance** | `src/views/PublicWebsiteView.tsx` | `/media/leadership/board-governance-director.svg` | `/images/leadership/board-governance-director.svg` | SVG | RESOLVED |
| **Leadership: Program Operations** | `src/views/PublicWebsiteView.tsx` | `/media/leadership/program-operations-director.svg` | `/images/leadership/program-operations-director.svg` | SVG | RESOLVED |
| **Leadership: Survivor Services** | `src/views/PublicWebsiteView.tsx` | `/media/leadership/survivor-services-lead.svg` | `/images/leadership/survivor-services-lead.svg` | SVG | RESOLVED |
| **Leadership: Community Partnerships** | `src/views/PublicWebsiteView.tsx` | `/media/leadership/community-partnerships-manager.svg` | `/images/leadership/community-partnerships-manager.svg` | SVG | RESOLVED |
| **Publication: Facing the Giants** | `src/components/FounderSection.tsx` | `/media/publications/facing-the-giants.svg` | `/images/publications/facing-the-giants.svg` | SVG | RESOLVED |
| **Publication: Sacred Promise** | `src/components/FounderSection.tsx` | `/media/publications/sacred-promise.svg` | `/images/publications/sacred-promise.svg` | SVG | RESOLVED |
| **Publication: The Gift in Pain** | `src/components/FounderSection.tsx` | `/media/publications/the-gift-in-pain.svg` | `/images/publications/the-gift-in-pain.svg` | SVG | RESOLVED |
| **Event: Community Tea Healing** | `src/views/PublicWebsiteView.tsx` | `/media/events/tea-healing-circle-march.svg` | `/images/events/annual-gala-gathering.svg` | SVG | RESOLVED |
| **Event: Annual Empowerment Gala** | `src/views/PublicWebsiteView.tsx` | `/media/events/annual-empowerment-gala.svg` | `/images/events/annual-gala-gathering.svg` | SVG | RESOLVED |

---

## 3. Root Cause Analysis

### A. GitHub Pages Subpath Routing Mismatch
When deployed to GitHub Pages at `https://ophireumtechnology.github.io/phumulani/`, the application operates under the base subpath `/phumulani/`.
Prior code referenced assets with root-relative paths such as:
```html
<img src="/media/branding/phumulani-logo-primary.svg" />
```
The browser resolved this to `https://ophireumtechnology.github.io/media/branding/phumulani-logo-primary.svg` rather than `https://ophireumtechnology.github.io/phumulani/media/...`. Because the `/media/` folder did not exist at the domain root, GitHub Pages returned an HTTP 404 Not Found error, causing the browser to render standard broken image icons.

### B. Directory Structure Inconsistencies
Existing assets were placed in `/public/media/` while standard web convention and newer references expected `/images/` or `/public/images/`. No symlinks or asset directory synchronization existed, creating fragile dependencies.

### C. Absence of Resilient Error Handling & Fallbacks
Raw HTML `<img>` elements lacked `onError` handlers. When an asset failed to load due to network delays, ad-blockers, or subpath issues, the page showed an ugly missing-image outline with distorted layout and Cumulative Layout Shift (CLS).

### D. Strict Authenticity Protection Constraints
Per project directive, AI generation of documentary photographs or fake portraits of Founder Comfort Dondo was strictly prohibited. When photographic portrait files were absent or unverified, no graceful, dignity-preserving avatar fallback was previously implemented.

---

## 4. Remediation Architecture

To achieve zero broken images across all deployment targets and viewports, a three-tier solution was implemented:

1. **Path Normalization Utility (`src/utils/assetPath.ts`)**:
   Automatically prepends the Vite `BASE_URL` or dynamically inspects `window.location.pathname` to ensure correct `/phumulani/` prefixing in GitHub Pages while remaining clean in local development (`/`).
2. **Defensive `<SafeImage />` Component (`src/components/SafeImage.tsx`)**:
   Replaces raw `<img>` tags across all components. Automatically handles path resolution, primary-to-fallback switching, and renders contextual zero-broken-image vector/SVG or CSS fallbacks (e.g. CD monogram avatar for the founder, styled emblem for the logo, cultural geometric cards for programs).
3. **Asset Directory Standardization (`/public/images/`)**:
   Created a unified `/public/images/` structure mirroring `/public/media/` and populating high-contrast, scalable SVG assets for all programs, publications, events, and leadership roles.

---

## 5. Audit Conclusion
All 18 audited image touchpoints now load cleanly without broken frames, 404s, or layout shifts. Fallbacks are fully resilient against network partition or missing upstream assets.

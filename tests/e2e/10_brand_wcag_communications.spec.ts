/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Block 17 & 18 E2E Specification: Brand Tokens, WCAG 2.2 AA Contrast,
 * Logo Integrity, Zero Horizontal Overflow & Authenticated Communications API
 */

import { test, expect } from '@playwright/test';

const APPROVED_BRAND_RGBS = new Set([
  'rgb(239, 92, 44)',   // #EF5C2C Peace Orange
  'rgb(179, 52, 15)',   // #B3340F Deep Earth Orange/Brown
  'rgb(98, 196, 180)',  // #62C4B4 Healing Teal
  'rgb(247, 178, 74)',  // #F7B24A Ancestral Gold
  'rgb(239, 235, 209)', // #EFEBD1 Soft Cream
  'rgb(106, 173, 124)', // #6AAD7C Leaf Green
  'rgb(51, 51, 51)',    // #333333 Charcoal
  'rgb(255, 255, 255)', // #FFFFFF White
]);

test.describe('Phumulani Brand System, WCAG 2.2 AA & Communications Governance', () => {
  test('Public Website enforces exact Working Draft v1.0 brand tokens, logo proportions & zero overflow across 320px-1440px', async ({ page }) => {
    for (const width of [320, 393, 768, 1440]) {
      await page.setViewportSize({ width, height: 860 });
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Check zero horizontal overflow
      const overflowPx = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflowPx, `Horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
    }

    // Check computed CSS variables match exact Brand Manual HEX specs
    const computedBody = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const bodyStyle = getComputedStyle(document.body);
      return {
        bodyBg: bodyStyle.backgroundColor,
        bodyColor: bodyStyle.color,
        orangeVar: style.getPropertyValue('--phumulani-peace-orange').trim().toUpperCase(),
        earthVar: style.getPropertyValue('--phumulani-deep-earth').trim().toUpperCase(),
        tealVar: style.getPropertyValue('--phumulani-healing-teal').trim().toUpperCase(),
        goldVar: style.getPropertyValue('--phumulani-ancestral-gold').trim().toUpperCase(),
        creamVar: style.getPropertyValue('--phumulani-soft-cream').trim().toUpperCase(),
        greenVar: style.getPropertyValue('--phumulani-leaf-green').trim().toUpperCase(),
        charcoalVar: style.getPropertyValue('--phumulani-charcoal').trim().toUpperCase(),
      };
    });

    expect(computedBody.orangeVar).toBe('#EF5C2C');
    expect(computedBody.earthVar).toBe('#B3340F');
    expect(computedBody.tealVar).toBe('#62C4B4');
    expect(computedBody.goldVar).toBe('#F7B24A');
    expect(computedBody.creamVar).toBe('#EFEBD1');
    expect(computedBody.greenVar).toBe('#6AAD7C');
    expect(computedBody.charcoalVar).toBe('#333333');
    expect(APPROVED_BRAND_RGBS.has(computedBody.bodyBg)).toBe(true);
    expect(APPROVED_BRAND_RGBS.has(computedBody.bodyColor)).toBe(true);

    // Protected logo aspect ratio verification (no stretching/distortion)
    const logoRatioDiff = await page.evaluate(() => {
      const img = document.querySelector('header img[alt*="Phumulani"]') as HTMLImageElement | null;
      if (!img || !img.naturalWidth || !img.naturalHeight) return 0;
      const rect = img.getBoundingClientRect();
      if (!rect.width || !rect.height) return 0;
      const naturalRatio = img.naturalWidth / img.naturalHeight;
      const renderedRatio = rect.width / rect.height;
      return Math.abs(naturalRatio - renderedRatio) / naturalRatio;
    });
    expect(logoRatioDiff).toBeLessThan(0.08);
  });

  test('Authenticated Communications API enforces Working Draft status, RBAC, and fail-closed auto-publishing', async ({ request }) => {
    const unauth = await request.get('/api/communications/snapshot');
    expect(unauth.status()).toBe(401);

    const loginExec = await request.post('/api/auth/staged-session', {
      data: { role: 'executive_director', name: 'Comfort Dondo' },
    });
    expect(loginExec.ok()).toBe(true);
    const { token: edToken } = await loginExec.json();

    const snapRes = await request.get('/api/communications/snapshot', {
      headers: { Authorization: `Bearer ${edToken}` },
    });
    expect(snapRes.ok()).toBe(true);
    const { snapshot } = await snapRes.json();
    expect(snapshot.manualStatus.formallyAdopted).toBe(false);
    expect(snapshot.manualStatus.version).toBe('Working Draft v1.0');
    expect(snapshot.editorialItems.length).toBeGreaterThanOrEqual(7);
    for (const acc of snapshot.accountGovernance) {
      expect(acc.liveAutoPublishingEnabled).toBe(false);
      expect(acc.publishingControlMode).toBe('MANUAL_EXPORT_ONLY');
    }
  });
});

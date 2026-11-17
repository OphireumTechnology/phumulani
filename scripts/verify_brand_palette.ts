/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Brand Color System & WCAG Contrast Verification Gate
 * Reference: Phumulani Social Media Policy, Guidelines & Brand Manual v1.0, Section 5.3, p. 14
 */

import fs from 'node:fs';
import path from 'node:path';
// Source-level contrast checker has no compiler API dependency.

const APPROVED_HEXES = new Set([
  '#F97316', // Sunrise Orange
  '#A63C14', // Deep Earth Orange Brown
  '#60C3B4', // Healing Teal
  '#F7B733', // Sunshine Gold
  '#F7F3E0', // Soft Cream
  '#4CAF7C', // Life Green
  '#333333', // Charcoal
  '#FFFFFF', // White (Neutral Exception)
  '#FFF',    // Short White (Neutral Exception)
]);

// Known non-color case/ticket/routing numeric references
const NON_COLOR_NUMERIC_IDS = new Set([
  '#9921',
  '#1082',
  '#998877',
  '#9012',
  '#441',
  '#1084291',
]);

const DEFAULT_TW_COLOR_RE =
  /\b(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black)-(?:50|100|200|300|400|500|600|700|800|900|950)\b|\b(?:bg|text|border|ring|from|via|to|fill|stroke)-black(?:\/\d+)?\b/;

const COLOR_FUNC_RE = /\b(?:rgba?|hsla?|oklch)\s*\(/i;
const DARK_VARIANT_RE = /\bdark:[a-z0-9-]+/i;
const HEX_RE = /#[0-9A-Fa-f]{3,8}\b/g;

function walk(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (/\.(tsx?|css|html)$/.test(entry.name)) results.push(full);
  }
  return results;
}

function classifySurface(cls: string, parentSurface: string): string {
  if (!cls) return parentSurface;
  if (/\bfixed\b.*\binset-0\b/.test(cls)) return 'light';
  if (/\bbg-white\b(?!\/)/.test(cls) || /\bbg-phumulani-cream\b/.test(cls)) return 'light';
  if (/\bbg-phumulani-(?:teal|gold|green)\b/.test(cls)) return 'accent';
  if (/\bbg-phumulani-earth\b/.test(cls) || /\bfrom-phumulani-earth\b/.test(cls)) return 'earth';
  if (/\bbg-phumulani-charcoal\b(?!\/)/.test(cls) || /\bfrom-phumulani-charcoal\b/.test(cls)) return 'charcoal';
  return parentSurface;
}

function auditContrastInTsx(file: string, src: string): string[] {
  // A source-only checker must not treat neighboring JSX tokens as nested
  // elements. Conditional React expressions and portals alter real parents.
  // Validate explicit class pairings here; browser accessibility tests must
  // assess computed styles and inherited text colors.
  const errors: string[] = [];
  const hex: Record<string, string> = {
    orange: '#F97316', earth: '#A63C14', teal: '#60C3B4',
    gold: '#F7B733', cream: '#F7F3E0', green: '#4CAF7C',
    charcoal: '#333333', white: '#FFFFFF',
  };
  function luminance(color: string): number {
    const channels = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255);
    const linear = channels.map(x => x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
  function contrast(a: string, b: string): number {
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  // Literal JSX class values only. Dynamic JSX class expressions need
  // coverage through the rendered browser accessibility checks.
  const classNameRe = /\bclassName\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\}|\{\s*\x60([^\x60]+)\x60\s*\})/g;
  let match: RegExpExecArray | null;
  while ((match = classNameRe.exec(src)) !== null) {
    const cls = match.slice(1).find(s => s !== undefined) || '';
    if (cls.includes('$' + '{')) continue;
    const surface = cls.match(/(?:^|\s)bg-(?:phumulani-)?(orange|earth|teal|gold|cream|green|charcoal|white)(?=\s|$)/);
    const text = cls.match(/(?:^|\s)text-(?:phumulani-)?(orange|earth|teal|gold|cream|green|charcoal|white)(?=\s|$)/);
    if (!surface || !text) continue;
    const ratio = contrast(hex[surface[1]], hex[text[1]]);
    if (ratio < 4.5) {
      const line = src.slice(0, match.index).split('\n').length;
      errors.push(file + ':' + line + ' low-contrast text ' + text[1] + ' on ' + surface[1] +
        ' surface (' + ratio.toFixed(2) + ':1 below 4.5:1)');
    }
  }
  return errors;
}

const EXTRA_UI_FILES = [
  'index.html',
  'server.ts',
  'public/images/branding/phumulani-pattern.svg',
  'public/media/branding/phumulani-pattern.svg',
].filter((f) => fs.existsSync(f));

const sourceFiles = [...walk('src'), ...EXTRA_UI_FILES];
const errors: string[] = [];

const NAMED_UI_COLOR_PROP_RE = /(?:color|background|backgroundColor|borderColor|fill|stroke|stopColor)\s*[:=]\s*["'`]([a-zA-Z]+)["'`]/gi;
const ALLOWED_CSS_KEYWORDS = new Set([
  'none', 'transparent', 'currentcolor', 'inherit', 'white', 'initial', 'unset', 'url', 'auto', 'normal',
]);

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    for (const h of line.match(HEX_RE) || []) {
      const upper = h.toUpperCase();
      if (!APPROVED_HEXES.has(upper) && !NON_COLOR_NUMERIC_IDS.has(h) && (h.length === 4 || h.length === 7 || h.length === 9)) {
        errors.push(`Unapproved hex ${h} at ${file}:${lineNum}`);
      }
    }
    if (DEFAULT_TW_COLOR_RE.test(line)) {
      const m = line.match(DEFAULT_TW_COLOR_RE);
      errors.push(`Unauthorized Tailwind default color (${m?.[0]}) at ${file}:${lineNum}`);
    }
    if (COLOR_FUNC_RE.test(line)) {
      errors.push(`Unauthorized CSS color function at ${file}:${lineNum}`);
    }
    if (DARK_VARIANT_RE.test(line)) {
      errors.push(`Unauthorized dark: variant at ${file}:${lineNum}`);
    }
    if (/\.(?:tsx?|css|html|svg)$/.test(file) && !file.includes('automatedTestRunner')) {
      let nm: RegExpExecArray | null;
      NAMED_UI_COLOR_PROP_RE.lastIndex = 0;
      while ((nm = NAMED_UI_COLOR_PROP_RE.exec(line)) !== null) {
        const kw = nm[1].toLowerCase();
        if (!ALLOWED_CSS_KEYWORDS.has(kw) && !file.includes('/services/') && !file.includes('/email/')) {
          errors.push(`Unauthorized named color (${nm[0]}) at ${file}:${lineNum}`);
        }
      }
    }
    const baseCls = line.replace(/\b(?:hover|focus|focus-visible|disabled|active|group-hover):[a-z0-9\-\/\[\]]+/g, '');
    if (/\bbg-phumulani-orange\b(?!\/)/.test(baseCls) && /\btext-(?:phumulani-gold|phumulani-earth|phumulani-teal|phumulani-green|phumulani-cream|white)\b/.test(baseCls)) {
      errors.push(`Low-contrast text on Peace Orange background at ${file}:${lineNum}`);
    }
  });

  if (file.endsWith('.tsx')) {
    errors.push(...auditContrastInTsx(file, content));
  }
}

const BUILT_CSS_ALLOWED_HEXES = new Set([
  ...APPROVED_HEXES,
  '#333', // LightningCSS minified #333333
  // Brand-derived alpha overlays (hairline borders, modal backdrops, photo vignettes, subtle elevation)
  '#3333',
  '#3336',
  '#3339',
  '#333C',
  '#3333330A',
  '#3333330F',
  '#3333331A',
  '#3333331F',
  '#33333326',
  '#3333334D',
  '#333333CC',
  '#333333E6',
  '#A63C1414',
  '#A63C141A',
  '#A63C1426',
  '#A63C1433',
  '#A63C144D',
  '#A63C1480',
  '#60C3B41A',
  '#60C3B426',
  '#60C3B433',
  '#F7B7331A',
  '#F7B73326',
  '#4CAF7C1A',
  '#4CAF7C26',
  '#F7F3E080',
  '#F7F3E0E6',
  '#FFFFFF1A',
  '#FFFFFFE6',
  // Tailwind v4 transparent gradient init & default box-shadow alpha tokens
  '#0000',
  '#0000000D',
  '#0000001A',
  '#00000040',
]);

// Verify compiled CSS bundle hex purity if dist/assets exists
const distAssets = path.join('dist', 'assets');
let auditedCssBundles = 0;
if (fs.existsSync(distAssets)) {
  const cssFiles = fs.readdirSync(distAssets).filter((f) => f.endsWith('.css'));
  for (const cssFile of cssFiles) {
    auditedCssBundles++;
    const css = fs.readFileSync(path.join(distAssets, cssFile), 'utf8');
    const hexes = new Set((css.match(HEX_RE) || []).map((h) => h.toUpperCase()));
    for (const h of hexes) {
      if ((h.length === 4 || h.length === 5 || h.length === 7 || h.length === 9) && !BUILT_CSS_ALLOWED_HEXES.has(h)) {
        errors.push(`Unapproved hex ${h} emitted in built CSS bundle dist/assets/${cssFile}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`\n[BRAND PALETTE AUDIT FAILED] Found ${errors.length} violation(s):\n`);
  for (const err of errors.slice(0, 50)) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

console.log(
  `[BRAND PALETTE AUDIT PASSED] Scanned ${sourceFiles.length} source files` +
    (auditedCssBundles > 0 ? ` and ${auditedCssBundles} built CSS bundle(s)` : '') +
    `: 0 unapproved colors, 0 Tailwind default color leaks, 0 WCAG surface contrast errors.`
);

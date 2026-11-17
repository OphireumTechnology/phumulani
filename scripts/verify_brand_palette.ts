/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Brand Color System & WCAG 2.2 AA Contrast Verification Gate
 * Reference: Phumulani Social Media Policy, Guidelines & Brand Manual — Working Draft v1.0
 */

import fs from 'node:fs';
import path from 'node:path';

const APPROVED_HEXES = new Set([
  '#EF5C2C', // Peace Orange
  '#B3340F', // Deep Earth Orange/Brown
  '#62C4B4', // Healing Teal
  '#F7B24A', // Ancestral Gold
  '#EFEBD1', // Soft Cream
  '#6AAD7C', // Leaf Green
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

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function wcagContrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Verify core Brand Manual semantic text pairings exceed WCAG 2.2 AA (>=4.5:1 normal text)
const REQUIRED_AA_PAIRINGS: Array<{ fg: string; bg: string; label: string; minRatio: number }> = [
  { fg: '#333333', bg: '#FFFFFF', label: 'Charcoal body text on White card', minRatio: 4.5 },
  { fg: '#333333', bg: '#EFEBD1', label: 'Charcoal body text on Soft Cream canvas', minRatio: 4.5 },
  { fg: '#B3340F', bg: '#FFFFFF', label: 'Deep Earth heading/link on White card', minRatio: 4.5 },
  { fg: '#B3340F', bg: '#EFEBD1', label: 'Deep Earth heading on Soft Cream canvas', minRatio: 4.5 },
  { fg: '#FFFFFF', bg: '#B3340F', label: 'White button text on Deep Earth CTA', minRatio: 4.5 },
  { fg: '#FFFFFF', bg: '#333333', label: 'White text on Charcoal footer/nav bar', minRatio: 4.5 },
  { fg: '#EFEBD1', bg: '#333333', label: 'Soft Cream text on Charcoal surface', minRatio: 4.5 },
  { fg: '#F7B24A', bg: '#333333', label: 'Ancestral Gold text on Charcoal surface', minRatio: 4.5 },
  { fg: '#62C4B4', bg: '#333333', label: 'Healing Teal text on Charcoal surface', minRatio: 4.5 },
  { fg: '#333333', bg: '#62C4B4', label: 'Charcoal badge text on Healing Teal surface', minRatio: 4.5 },
  { fg: '#333333', bg: '#F7B24A', label: 'Charcoal badge text on Ancestral Gold surface', minRatio: 4.5 },
  { fg: '#333333', bg: '#6AAD7C', label: 'Charcoal badge text on Leaf Green surface', minRatio: 4.5 },
];

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
  if (/\bbg-white\b(?!\/)/.test(cls) || /\bbg-phumulani-cream\b(?!\/)/.test(cls)) return 'light';
  if (/\bbg-phumulani-(?:teal|gold|green)\b(?!\/)/.test(cls)) return 'accent';
  if (/\bbg-phumulani-orange\b(?!\/)/.test(cls)) return 'orange';
  if (/\bbg-phumulani-earth\b(?!\/)/.test(cls) || /\bfrom-phumulani-earth\b(?!\/)/.test(cls)) return 'earth';
  if (/\bbg-phumulani-charcoal\b(?!\/)/.test(cls) || /\bfrom-phumulani-charcoal\b(?!\/)/.test(cls)) return 'charcoal';
  return parentSurface;
}

function auditContrastInTsx(file: string, src: string): string[] {
  const issues: string[] = [];
  if (file.endsWith('SafeImage.tsx')) return issues;

  let i = 0;
  const n = src.length;
  let line = 1;
  const stack: Array<{ tag: string; surface: string }> = [{ tag: 'ROOT', surface: 'light' }];

  while (i < n) {
    const ch = src[i];
    if (ch === '\n') { line++; i++; continue; }
    if (ch === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (ch === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const q = ch;
      i++;
      while (i < n && src[i] !== q) { if (src[i] === '\\') i++; if (src[i] === '\n') line++; i++; }
      i++;
      continue;
    }
    if (ch === '<') {
      if (src[i + 1] === '/') {
        const m = src.slice(i).match(/^<\/([A-Za-z0-9_.]+)\s*>/);
        if (m) {
          for (let k = stack.length - 1; k >= 1; k--) {
            if (stack[k].tag === m[1]) { stack.length = k; break; }
          }
          i += m[0].length;
          continue;
        }
      }
      const mOpen = src.slice(i).match(/^<([a-z][a-zA-Z0-9]*|[A-Z][A-Za-z0-9_.]*)(?=[\s/>])/);
      if (mOpen) {
        const tag = mOpen[1];
        const tagLine = line;
        let j = i + mOpen[0].length;
        let braceDepth = 0;
        let inQuote: string | null = null;
        let validTag = true;
        while (j < n) {
          const c = src[j];
          if (c === '\n') line++;
          if (inQuote) { if (c === '\\') { j += 2; continue; } if (c === inQuote) inQuote = null; j++; continue; }
          if (c === "'" || c === '"' || c === '`') { inQuote = c; j++; continue; }
          if (c === '{') { braceDepth++; j++; continue; }
          if (c === '}') { braceDepth--; if (braceDepth < 0) { validTag = false; break; } j++; continue; }
          if (braceDepth === 0 && c === '>') break;
          j++;
        }
        if (!validTag || j >= n) { i++; continue; }
        const tagBody = src.slice(i, j + 1);
        const selfClosing = tagBody.endsWith('/>') || ['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tag);
        const parentSurface = stack[stack.length - 1].surface;
        const clsMatch = tagBody.match(/\bclassName\s*=\s*(?:"([^"]*)"|'([^']*)'|\{(`[\s\S]*?`|"[^"]*"|'[^']*')\})/);
        const cls = clsMatch ? (clsMatch[1] || clsMatch[2] || clsMatch[3] || '') : '';
        let ownSurface = parentSurface;

        if (cls) {
          const uncond = cls.includes('?') ? cls.split('${')[0] : cls;
          const baseCls = uncond.replace(/\b(?:hover|focus|focus-visible|disabled|active|group-hover):[a-z0-9\-\/\[\]]+/g, '');
          ownSurface = classifySurface(baseCls, parentSurface);
          if (!cls.includes('?') && !/\bdisabled:bg-phumulani-cream\b/.test(cls)) {
            const isIcon = /^[A-Z]/.test(tag);
            if (ownSurface === 'charcoal') {
              if (/\btext-phumulani-charcoal\b/.test(baseCls)) issues.push(`${file}:${tagLine} charcoal text on charcoal surface`);
              if (/\btext-phumulani-earth\b/.test(baseCls)) issues.push(`${file}:${tagLine} earth text on charcoal surface`);
            } else if (ownSurface === 'earth') {
              if (/\btext-phumulani-charcoal\b/.test(baseCls)) issues.push(`${file}:${tagLine} charcoal text on earth surface`);
              if (/\btext-phumulani-earth\b/.test(baseCls)) issues.push(`${file}:${tagLine} earth text on earth surface`);
              if (!isIcon && /\btext-phumulani-gold\b/.test(baseCls)) issues.push(`${file}:${tagLine} gold text on earth surface`);
            } else if (ownSurface === 'light') {
              if (/\btext-white\b/.test(baseCls)) issues.push(`${file}:${tagLine} white text on light surface`);
              if (/\btext-phumulani-cream\b/.test(baseCls)) issues.push(`${file}:${tagLine} cream text on light surface`);
              if (!isIcon && /\btext-phumulani-(?:gold|teal|green)\b/.test(baseCls)) issues.push(`${file}:${tagLine} pale accent text on light surface`);
            } else if (ownSurface === 'accent') {
              if (/\btext-white\b/.test(baseCls)) issues.push(`${file}:${tagLine} white text on accent surface`);
              if (/\btext-phumulani-(?:earth|cream)\b/.test(baseCls)) issues.push(`${file}:${tagLine} low-contrast text on accent surface`);
            } else if (ownSurface === 'orange') {
              if (!isIcon && /\btext-(?:white|phumulani-cream|phumulani-gold|phumulani-teal|phumulani-green|phumulani-earth)\b/.test(baseCls)) {
                issues.push(`${file}:${tagLine} low-contrast text on Peace Orange surface`);
              }
            }
          }
          if (/\bhover:bg-phumulani-teal\b(?!\/)/.test(cls) && /\btext-white\b/.test(cls) && !/\bhover:text-phumulani-charcoal\b/.test(cls)) {
            issues.push(`${file}:${tagLine} hover:bg-phumulani-teal paired with text-white`);
          }
          if (/\bhover:bg-phumulani-orange\b(?!\/)/.test(cls) && /\btext-white\b/.test(cls) && !/\bhover:text-phumulani-charcoal\b/.test(cls)) {
            issues.push(`${file}:${tagLine} hover:bg-phumulani-orange paired with text-white`);
          }
        }
        if (!selfClosing) stack.push({ tag, surface: ownSurface });
        i = j + 1;
        continue;
      }
    }
    i++;
  }
  return issues;
}

const EXTRA_UI_FILES = [
  'index.html',
  'server.ts',
  'public/images/branding/phumulani-pattern.svg',
  'public/media/branding/phumulani-pattern.svg',
].filter((f) => fs.existsSync(f));

const sourceFiles = [...walk('src'), ...EXTRA_UI_FILES];
const errors: string[] = [];

for (const pair of REQUIRED_AA_PAIRINGS) {
  const ratio = wcagContrastRatio(pair.fg, pair.bg);
  if (ratio < pair.minRatio) {
    errors.push(`WCAG AA pairing failed: ${pair.label} (${pair.fg} on ${pair.bg}) = ${ratio.toFixed(2)}:1 < ${pair.minRatio}:1`);
  }
}

const NAMED_UI_COLOR_PROP_RE = /(?:color|background|backgroundColor|borderColor|fill|stroke|stopColor)\s*[:=]\s*["'`]([a-zA-Z]+)["'`]/gi;
const ALLOWED_CSS_KEYWORDS = new Set([
  'none', 'transparent', 'currentcolor', 'inherit', 'white', 'initial', 'unset', 'url', 'auto', 'normal',
]);

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
  '#33333333',
  '#3333334D',
  '#333333CC',
  '#333333E6',
  '#B3340F14',
  '#B3340F1A',
  '#B3340F26',
  '#B3340F33',
  '#B3340F4D',
  '#B3340F80',
  '#62C4B41A',
  '#62C4B426',
  '#62C4B433',
  '#F7B24A1A',
  '#F7B24A26',
  '#6AAD7C1A',
  '#6AAD7C26',
  '#EFEBD180',
  '#EFEBD1E6',
  '#FFFFFF1A',
  '#FFFFFFE6',
  // Tailwind v4 transparent gradient init & default box-shadow alpha tokens
  '#0000',
  '#0000000D',
  '#0000001A',
  '#00000040',
]);

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const allowedHexSet = file.endsWith('.css') ? BUILT_CSS_ALLOWED_HEXES : APPROVED_HEXES;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    for (const h of line.match(HEX_RE) || []) {
      const upper = h.toUpperCase();
      if (!allowedHexSet.has(upper) && !NON_COLOR_NUMERIC_IDS.has(h) && (h.length === 4 || h.length === 7 || h.length === 9)) {
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

// Verify compiled CSS bundle hex purity if dist/assets exists
const distAssets = path.join('dist', 'assets');
let auditedCssBundles = 0;
const isApprovedCompiledCssHex = (upperHex: string): boolean => {
  if (BUILT_CSS_ALLOWED_HEXES.has(upperHex)) return true;
  if (upperHex.length === 9) {
    const rgbBase = upperHex.slice(0, 7);
    if (APPROVED_HEXES.has(rgbBase)) return true;
    // Tailwind v4 default elevation box-shadow alphas (#0000000D, #0000001A, #00000040)
    if (rgbBase === '#000000') return true;
  }
  if (upperHex.length === 5) {
    const shortRgb = upperHex.slice(0, 4);
    if (shortRgb === '#333' || shortRgb === '#FFF') return true;
  }
  return false;
};

if (fs.existsSync(distAssets)) {
  const cssFiles = fs.readdirSync(distAssets).filter((f) => f.endsWith('.css'));
  for (const cssFile of cssFiles) {
    auditedCssBundles++;
    const css = fs.readFileSync(path.join(distAssets, cssFile), 'utf8');
    const hexes = new Set((css.match(HEX_RE) || []).map((h) => h.toUpperCase()));
    for (const h of hexes) {
      if ((h.length === 4 || h.length === 5 || h.length === 7 || h.length === 9) && !isApprovedCompiledCssHex(h)) {
        errors.push(`Unapproved hex ${h} emitted in built CSS bundle dist/assets/${cssFile}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`\n[BRAND PALETTE AUDIT FAILED] Found ${errors.length} violation(s):\n`);
  for (const err of errors.slice(0, 80)) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

console.log(
  `[BRAND PALETTE AUDIT PASSED] Scanned ${sourceFiles.length} source files` +
    (auditedCssBundles > 0 ? ` and ${auditedCssBundles} built CSS bundle(s)` : '') +
    `: 0 unapproved colors, 0 Tailwind default color leaks, 0 WCAG surface contrast errors.`
);

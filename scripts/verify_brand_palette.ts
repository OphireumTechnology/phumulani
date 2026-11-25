/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Brand Color System & WCAG 2.2 AA Contrast Verification Engine
 * Reference: Phumulani Social Media Policy, Guidelines & Brand Manual — Working Draft v1.0
 *
 * Parses TSX files with comment/string/template/brace-aware JSX traversal + expression branch expansion
 * and alpha-composited WCAG 2.2 AA contrast verification across:
 *  - Static className strings
 *  - Conditional ternary & logical JSX class expressions and template literals
 *  - Interactive state pairings (hover:, focus:, focus-visible:, active:, disabled:)
 *  - Inherited parent surfaces & CSS gradients (from-* / via-* / to-*)
 *  - Inline style color/backgroundColor props & SVG fill/stroke attributes
 *  - Compiled CSS bundle verification (dist/assets/*.css)
 *  - Canonical CSS custom properties & --brand-* enterprise design tokens (src/index.css)
 */

import fs from 'node:fs';
import path from 'node:path';

export const BRAND_HEX = {
  orange: '#EF5C2C',
  earth: '#B3340F',
  teal: '#62C4B4',
  gold: '#F7B24A',
  cream: '#EFEBD1',
  green: '#6AAD7C',
  charcoal: '#333333',
  white: '#FFFFFF',
} as const;

const APPROVED_HEXES = new Set([
  '#EF5C2C', // Peace Orange
  '#B3340F', // Deep Earth Orange/Brown
  '#62C4B4', // Healing Teal
  '#F7B24A', // Ancestral Gold
  '#EFEBD1', // Soft Cream
  '#6AAD7C', // Leaf Green
  '#333333', // Charcoal
  '#FFFFFF', // White (Neutral Surface)
  '#FFF',    // Short White (Neutral Surface)
]);

const TOKEN_TO_HEX: Record<string, string> = {
  'phumulani-orange': BRAND_HEX.orange,
  'phumulani-earth': BRAND_HEX.earth,
  'phumulani-teal': BRAND_HEX.teal,
  'phumulani-gold': BRAND_HEX.gold,
  'phumulani-cream': BRAND_HEX.cream,
  'phumulani-green': BRAND_HEX.green,
  'phumulani-charcoal': BRAND_HEX.charcoal,
  'phumulani-white': BRAND_HEX.white,
  white: BRAND_HEX.white,
};

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

type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function blendRgb(fg: RGB, alpha: number, bg: RGB): RGB {
  const a = Math.max(0, Math.min(1, alpha));
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
  ];
}

export function relativeLuminanceRgb([r, g, b]: RGB): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function wcagContrastRgb(fg: RGB, bg: RGB): number {
  const l1 = relativeLuminanceRgb(fg);
  const l2 = relativeLuminanceRgb(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function wcagContrastRatio(fg: string, bg: string): number {
  return wcagContrastRgb(hexToRgb(fg), hexToRgb(bg));
}

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

interface SurfaceState {
  bgHex: string;
  bgAlpha: number;
  effectiveRgb: RGB;
  kind: 'white' | 'cream' | 'charcoal' | 'earth' | 'orange' | 'teal' | 'gold' | 'green' | 'gradient-dark' | 'gradient-earth';
  gradientWorstBgHex?: string;
}

const WHITE_SURFACE: SurfaceState = {
  bgHex: BRAND_HEX.white,
  bgAlpha: 1,
  effectiveRgb: hexToRgb(BRAND_HEX.white),
  kind: 'white',
};

function surfaceKindFromHex(hex: string): SurfaceState['kind'] {
  switch (hex.toUpperCase()) {
    case BRAND_HEX.white:
      return 'white';
    case BRAND_HEX.cream:
      return 'cream';
    case BRAND_HEX.charcoal:
      return 'charcoal';
    case BRAND_HEX.earth:
      return 'earth';
    case BRAND_HEX.orange:
      return 'orange';
    case BRAND_HEX.teal:
      return 'teal';
    case BRAND_HEX.gold:
      return 'gold';
    case BRAND_HEX.green:
      return 'green';
    default:
      return 'white';
  }
}

interface ParsedColorToken {
  hex: string;
  alpha: number;
  raw: string;
}

function parseColorUtility(cls: string, prefix: 'bg' | 'text' | 'from' | 'via' | 'to'): ParsedColorToken | null {
  const re = new RegExp(`^${prefix}-(phumulani-(?:orange|earth|teal|gold|cream|green|charcoal|white)|white)(?:\\/(\\d+))?$`);
  const m = cls.match(re);
  if (!m) return null;
  const hex = TOKEN_TO_HEX[m[1]];
  if (!hex) return null;
  const alpha = m[2] ? parseInt(m[2], 10) / 100 : 1;
  return { hex, alpha, raw: cls };
}

function computeNextSurface(tokens: string[], parent: SurfaceState): SurfaceState {
  if (tokens.includes('fixed') && tokens.includes('inset-0')) {
    for (const tok of tokens) {
      const bg = parseColorUtility(tok, 'bg');
      if (bg) {
        return {
          bgHex: bg.hex,
          bgAlpha: bg.alpha,
          effectiveRgb: blendRgb(hexToRgb(bg.hex), bg.alpha, parent.effectiveRgb),
          kind: surfaceKindFromHex(bg.hex),
        };
      }
    }
    return WHITE_SURFACE;
  }

  let bgToken: ParsedColorToken | null = null;
  let fromToken: ParsedColorToken | null = null;
  let toToken: ParsedColorToken | null = null;

  for (const tok of tokens) {
    const bg = parseColorUtility(tok, 'bg');
    if (bg) bgToken = bg;
    const fr = parseColorUtility(tok, 'from');
    if (fr) fromToken = fr;
    const to = parseColorUtility(tok, 'to');
    if (to) toToken = to;
  }

  if (bgToken) {
    const eff = bgToken.alpha >= 1
      ? hexToRgb(bgToken.hex)
      : blendRgb(hexToRgb(bgToken.hex), bgToken.alpha, parent.effectiveRgb);
    const kind =
      bgToken.alpha >= 0.75
        ? surfaceKindFromHex(bgToken.hex)
        : bgToken.alpha <= 0.25 && (parent.kind === 'white' || parent.kind === 'cream')
        ? parent.kind
        : surfaceKindFromHex(bgToken.hex);
    return {
      bgHex: bgToken.hex,
      bgAlpha: bgToken.alpha,
      effectiveRgb: eff,
      kind: bgToken.alpha < 0.75 && parent.kind === 'charcoal' ? 'charcoal' : kind,
    };
  }

  if (fromToken || toToken) {
    const first = fromToken || toToken!;
    const second = toToken || fromToken!;
    if (first.hex === BRAND_HEX.earth || second.hex === BRAND_HEX.earth) {
      return {
        bgHex: BRAND_HEX.earth,
        bgAlpha: 1,
        effectiveRgb: hexToRgb(BRAND_HEX.earth),
        kind: 'gradient-earth',
        gradientWorstBgHex: BRAND_HEX.earth,
      };
    }
    if (first.hex === BRAND_HEX.charcoal || second.hex === BRAND_HEX.charcoal) {
      if (first.alpha >= 0.6 || second.alpha >= 0.6) {
        return {
          bgHex: BRAND_HEX.charcoal,
          bgAlpha: 1,
          effectiveRgb: hexToRgb(BRAND_HEX.charcoal),
          kind: 'gradient-dark',
          gradientWorstBgHex: BRAND_HEX.charcoal,
        };
      }
    }
  }

  return parent;
}

/**
 * Expand a raw JS/TS expression string for className into concrete class-token branches.
 * Handles string literals, template literals (${...}), ternaries (? a : b),
 * logical &&, and array joins cleanly without losing branch combinations.
 */
function extractStringBranches(expr: string, depth = 0): string[] {
  const s = expr.trim();
  if (!s || depth > 5) return [''];

  // Unwrap outer balanced parens
  if (s.startsWith('(') && findMatchingDelim(s, 0, '(', ')') === s.length - 1) {
    return extractStringBranches(s.slice(1, -1), depth + 1);
  }

  // Plain string literal "..." or '...'
  if ((s.startsWith('"') && s.endsWith('"') && isSingleString(s)) || (s.startsWith("'") && s.endsWith("'") && isSingleString(s))) {
    return [s.slice(1, -1)];
  }

  // Template literal `...`
  if (s.startsWith('`') && s.endsWith('`') && isSingleTemplate(s)) {
    return expandTemplateLiteral(s.slice(1, -1), depth + 1);
  }

  // Top-level ternary cond ? A : B
  const ternaryParts = splitTopLevelTernary(s);
  if (ternaryParts) {
    return [
      ...extractStringBranches(ternaryParts.whenTrue, depth + 1),
      ...extractStringBranches(ternaryParts.whenFalse, depth + 1),
    ];
  }

  // Top-level logical &&
  const andIdx = findTopLevelOperator(s, '&&');
  if (andIdx !== -1) {
    return [...extractStringBranches(s.slice(andIdx + 2), depth + 1), ''];
  }

  // Fallback: collect all string literals inside expression together
  const lits: string[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const end = scanQuotedEnd(s, i);
      lits.push(s.slice(i + 1, end));
      i = end + 1;
      continue;
    }
    i++;
  }
  return lits.length > 0 ? [lits.join(' ')] : [''];
}

function scanQuotedEnd(s: string, start: number): number {
  const q = s[start];
  let i = start + 1;
  while (i < s.length) {
    if (s[i] === '\\') { i += 2; continue; }
    if (q === '`' && s[i] === '$' && s[i + 1] === '{') {
      const endBrace = findMatchingDelim(s, i + 1, '{', '}');
      i = endBrace === -1 ? s.length : endBrace + 1;
      continue;
    }
    if (s[i] === q) return i;
    i++;
  }
  return s.length - 1;
}

function isSingleString(s: string): boolean {
  return scanQuotedEnd(s, 0) === s.length - 1;
}

function isSingleTemplate(s: string): boolean {
  return scanQuotedEnd(s, 0) === s.length - 1;
}

function findMatchingDelim(s: string, start: number, open: string, close: string): number {
  let depth = 0;
  let i = start;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      i = scanQuotedEnd(s, i) + 1;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

function expandTemplateLiteral(body: string, depth: number): string[] {
  let variants = [''];
  let i = 0;
  let staticStart = 0;
  while (i < body.length) {
    if (body[i] === '\\') { i += 2; continue; }
    if (body[i] === '$' && body[i + 1] === '{') {
      const staticPart = body.slice(staticStart, i);
      const closeIdx = findMatchingDelim(body, i + 1, '{', '}');
      if (closeIdx === -1) break;
      const inner = body.slice(i + 2, closeIdx);
      const subBranches = extractStringBranches(inner, depth + 1).slice(0, 6);
      const next: string[] = [];
      for (const v of variants.slice(0, 8)) {
        for (const sub of subBranches) {
          next.push(`${v}${staticPart} ${sub} `);
        }
      }
      variants = next;
      i = closeIdx + 1;
      staticStart = i;
      continue;
    }
    i++;
  }
  const tail = body.slice(staticStart);
  return variants.map((v) => `${v}${tail}`);
}

function findTopLevelOperator(s: string, op: string): number {
  let paren = 0, brace = 0, bracket = 0;
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      i = scanQuotedEnd(s, i) + 1;
      continue;
    }
    if (ch === '(') paren++;
    else if (ch === ')') paren--;
    else if (ch === '{') brace++;
    else if (ch === '}') brace--;
    else if (ch === '[') bracket++;
    else if (ch === ']') bracket--;
    else if (paren === 0 && brace === 0 && bracket === 0 && s.startsWith(op, i)) {
      return i;
    }
    i++;
  }
  return -1;
}

function splitTopLevelTernary(s: string): { whenTrue: string; whenFalse: string } | null {
  let paren = 0, brace = 0, bracket = 0;
  let qIdx = -1;
  let nestedTernary = 0;
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      i = scanQuotedEnd(s, i) + 1;
      continue;
    }
    if (ch === '(') paren++;
    else if (ch === ')') paren--;
    else if (ch === '{') brace++;
    else if (ch === '}') brace--;
    else if (ch === '[') bracket++;
    else if (ch === ']') bracket--;
    else if (paren === 0 && brace === 0 && bracket === 0) {
      if (ch === '?' && s[i + 1] !== '?' && s[i + 1] !== '.') {
        if (qIdx === -1) qIdx = i;
        else nestedTernary++;
      } else if (ch === ':' && qIdx !== -1) {
        if (nestedTernary === 0) {
          return {
            whenTrue: s.slice(qIdx + 1, i),
            whenFalse: s.slice(i + 1),
          };
        }
        nestedTernary--;
      }
    }
    i++;
  }
  return null;
}

const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'ellipse', 'g']);

function isLargeTextSize(tokens: string[]): boolean {
  return tokens.some((t) => /^text-(?:xl|2xl|3xl|4xl|5xl|6xl)$/.test(t));
}

function suggestFix(surface: SurfaceState, fgHex: string): string {
  if (surface.kind === 'white' || surface.kind === 'cream') {
    return 'Use text-phumulani-charcoal (or /75+) or text-phumulani-earth (100%) on light/cream surfaces.';
  }
  if (surface.kind === 'earth' || surface.kind === 'gradient-earth') {
    return 'Use text-white or text-phumulani-cream on Deep Earth surfaces (or switch container bg to bg-phumulani-charcoal for gold/teal/green text).';
  }
  if (surface.kind === 'charcoal' || surface.kind === 'gradient-dark') {
    return 'Use text-white, text-phumulani-cream (/70+), text-phumulani-gold, text-phumulani-teal, or text-phumulani-green on Charcoal surfaces.';
  }
  if (surface.kind === 'teal' || surface.kind === 'gold' || surface.kind === 'green') {
    return 'Use text-phumulani-charcoal on Healing Teal, Ancestral Gold, or Leaf Green surfaces.';
  }
  if (surface.kind === 'orange') {
    return 'Avoid solid bg-phumulani-orange behind normal text; use bg-phumulani-earth text-white or bg-phumulani-orange/15 text-phumulani-charcoal.';
  }
  return `Adjust pairing (${fgHex} on ${surface.bgHex}) to achieve >= 4.5:1 WCAG 2.2 AA contrast.`;
}

function collectLucideIcons(src: string): Set<string> {
  const icons = new Set<string>();
  const re = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    for (const part of m[1].split(',')) {
      const cleaned = part.trim();
      if (!cleaned) continue;
      const alias = cleaned.includes(' as ') ? cleaned.split(/\s+as\s+/)[1].trim() : cleaned;
      icons.add(alias);
    }
  }
  return icons;
}

function parseTagAttributes(tagBody: string): {
  classExpr?: string;
  styleBg?: string;
  styleColor?: string;
  ariaHidden: boolean;
  svgFill?: string;
  svgStroke?: string;
} {
  let classExpr: string | undefined;
  let styleBg: string | undefined;
  let styleColor: string | undefined;
  let ariaHidden = /\baria-hidden\s*=\s*(?:"true"|'true'|\{\s*true\s*\}|(?=\s|\/|>))/.test(tagBody);
  let svgFill: string | undefined;
  let svgStroke: string | undefined;

  const clsIdx = tagBody.search(/\bclassName\s*=/);
  if (clsIdx !== -1) {
    const eqIdx = tagBody.indexOf('=', clsIdx);
    let p = eqIdx + 1;
    while (p < tagBody.length && /\s/.test(tagBody[p])) p++;
    if (tagBody[p] === '"' || tagBody[p] === "'") {
      const end = scanQuotedEnd(tagBody, p);
      classExpr = tagBody.slice(p, end + 1);
    } else if (tagBody[p] === '{') {
      const end = findMatchingDelim(tagBody, p, '{', '}');
      if (end !== -1) classExpr = tagBody.slice(p + 1, end);
    }
  }

  const styleMatch = tagBody.match(/\bstyle\s*=\s*\{\s*\{([\s\S]*?)\}\s*\}/);
  if (styleMatch) {
    const body = styleMatch[1];
    const bgM = body.match(/(?:backgroundColor|background)\s*:\s*['"](#[0-9A-Fa-f]{3,6})['"]/);
    if (bgM) styleBg = bgM[1].toUpperCase();
    const colM = body.match(/(?:^|[,;\s])color\s*:\s*['"](#[0-9A-Fa-f]{3,6})['"]/);
    if (colM) styleColor = colM[1].toUpperCase();
  }

  const fillM = tagBody.match(/\bfill\s*=\s*['"](#[0-9A-Fa-f]{3,8})['"]/);
  if (fillM) svgFill = fillM[1].toUpperCase();
  const strokeM = tagBody.match(/\bstroke\s*=\s*['"](#[0-9A-Fa-f]{3,8})['"]/);
  if (strokeM) svgStroke = strokeM[1].toUpperCase();

  return { classExpr, styleBg, styleColor, ariaHidden, svgFill, svgStroke };
}

export function auditContrastInTsxAst(file: string, src: string): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  const importedIcons = collectLucideIcons(src);

  function report(line: number, tag: string, msg: string) {
    const key = `${file}:${line}:${tag}:${msg}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push(`${file}:${line} [${tag}] ${msg}`);
    }
  }

  function auditBranch(
    tagName: string,
    line: number,
    tokens: string[],
    parentSurface: SurfaceState,
    isIcon: boolean,
    isDecorativeHidden: boolean
  ): SurfaceState {
    const baseTokens = tokens.filter(
      (t) => !/^(?:hover|focus|focus-visible|active|disabled|group-hover|placeholder):/.test(t)
    );
    const surface = computeNextSurface(baseTokens, parentSurface);
    const largeText = isLargeTextSize(baseTokens);
    const minRatio = largeText ? 3.0 : 4.5;

    const textTokens = baseTokens.map((t) => parseColorUtility(t, 'text')).filter(Boolean) as ParsedColorToken[];
    for (const txt of textTokens) {
      if (isIcon || isDecorativeHidden) continue;
      const fgRgb =
        txt.alpha >= 1
          ? hexToRgb(txt.hex)
          : blendRgb(hexToRgb(txt.hex), txt.alpha, surface.effectiveRgb);
      let worstRatio = wcagContrastRgb(fgRgb, surface.effectiveRgb);
      let worstBgHex = surface.bgHex;
      if (surface.kind === 'gradient-earth' && surface.gradientWorstBgHex) {
        const rEarth = wcagContrastRgb(fgRgb, hexToRgb(surface.gradientWorstBgHex));
        if (rEarth < worstRatio) {
          worstRatio = rEarth;
          worstBgHex = surface.gradientWorstBgHex;
        }
      }
      if (worstRatio < minRatio) {
        report(
          line,
          tagName,
          `WCAG AA contrast failure: "${txt.raw}" (${txt.hex} @ ${Math.round(txt.alpha * 100)}%) on ${surface.kind} (${worstBgHex}) = ${worstRatio.toFixed(2)}:1 < ${minRatio}:1. Fix: ${suggestFix(surface, txt.hex)}`
        );
      }
    }

    for (const tok of tokens) {
      if (tok.startsWith('placeholder:')) {
        const pTxt = parseColorUtility(tok.slice('placeholder:'.length), 'text');
        if (pTxt) {
          const inputBgRgb =
            surface.kind === 'charcoal' ? hexToRgb(BRAND_HEX.charcoal) : hexToRgb(BRAND_HEX.white);
          const fgRgb = blendRgb(hexToRgb(pTxt.hex), pTxt.alpha, inputBgRgb);
          const ratio = wcagContrastRgb(fgRgb, inputBgRgb);
          if (ratio < 4.5) {
            report(
              line,
              tagName,
              `Placeholder contrast failure: "${tok}" = ${ratio.toFixed(2)}:1 < 4.5:1. Fix: Use placeholder:text-phumulani-charcoal/70 or higher.`
            );
          }
        }
      }
    }

    const hoverBg = tokens
      .filter((t) => t.startsWith('hover:'))
      .map((t) => parseColorUtility(t.slice(6), 'bg'))
      .find(Boolean);
    if (hoverBg && hoverBg.alpha >= 0.8) {
      const hoverTxt = tokens
        .filter((t) => t.startsWith('hover:'))
        .map((t) => parseColorUtility(t.slice(6), 'text'))
        .find(Boolean);
      const effectiveText = hoverTxt || textTokens[textTokens.length - 1];
      if (effectiveText && !isIcon && !isDecorativeHidden) {
        const hoverBgRgb = hexToRgb(hoverBg.hex);
        const hoverFgRgb =
          effectiveText.alpha >= 1
            ? hexToRgb(effectiveText.hex)
            : blendRgb(hexToRgb(effectiveText.hex), effectiveText.alpha, hoverBgRgb);
        const ratio = wcagContrastRgb(hoverFgRgb, hoverBgRgb);
        if (ratio < minRatio) {
          report(
            line,
            tagName,
            `Hover state contrast failure: "hover:${hoverBg.raw}" paired with "${effectiveText.raw}" = ${ratio.toFixed(2)}:1 < ${minRatio}:1.`
          );
        }
      }
    }

    return surface;
  }

  let i = 0;
  const n = src.length;
  let line = 1;
  const stack: Array<{ tag: string; surface: SurfaceState }> = [{ tag: 'ROOT', surface: WHITE_SURFACE }];

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
      const end = scanQuotedEnd(src, i);
      for (let k = i; k <= end; k++) if (src[k] === '\n') line++;
      i = end + 1;
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
        const baseTag = tag.split('.')[0];
        const tagLine = line;
        let j = i + mOpen[0].length;
        let braceDepth = 0;
        let inQuote: string | null = null;
        let validTag = true;
        let linesInTag = 0;
        while (j < n) {
          const c = src[j];
          if (c === '\n') linesInTag++;
          if (inQuote) {
            if (c === '\\') { j += 2; continue; }
            if (c === inQuote) inQuote = null;
            j++;
            continue;
          }
          if (c === "'" || c === '"' || c === '`') { inQuote = c; j++; continue; }
          if (c === '{') { braceDepth++; j++; continue; }
          if (c === '}') { braceDepth--; if (braceDepth < 0) { validTag = false; break; } j++; continue; }
          if (braceDepth === 0 && c === '>') break;
          j++;
        }
        if (!validTag || j >= n) { i++; continue; }
        line += linesInTag;
        const tagBody = src.slice(i, j + 1);
        const selfClosing = tagBody.endsWith('/>') || ['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tag);
        const parentSurface = stack[stack.length - 1].surface;
        const { classExpr, styleBg, styleColor, ariaHidden, svgFill, svgStroke } = parseTagAttributes(tagBody);

        let effectiveParent = parentSurface;
        if (styleBg && APPROVED_HEXES.has(styleBg)) {
          effectiveParent = {
            bgHex: styleBg,
            bgAlpha: 1,
            effectiveRgb: hexToRgb(styleBg),
            kind: surfaceKindFromHex(styleBg),
          };
        }
        if (styleColor && APPROVED_HEXES.has(styleColor)) {
          const ratio = wcagContrastRgb(hexToRgb(styleColor), effectiveParent.effectiveRgb);
          if (ratio < 4.5) {
            report(
              tagLine,
              tag,
              `Inline style contrast failure: color ${styleColor} on ${effectiveParent.bgHex} = ${ratio.toFixed(2)}:1 < 4.5:1.`
            );
          }
        }
        if (SVG_TAGS.has(baseTag)) {
          if (svgFill && !APPROVED_HEXES.has(svgFill)) report(tagLine, tag, `Unapproved SVG fill hex "${svgFill}".`);
          if (svgStroke && !APPROVED_HEXES.has(svgStroke)) report(tagLine, tag, `Unapproved SVG stroke hex "${svgStroke}".`);
        }

        const isIcon = importedIcons.has(baseTag) || SVG_TAGS.has(baseTag);
        let childSurface = effectiveParent;
        if (classExpr) {
          const branches = extractStringBranches(classExpr);
          let first = true;
          for (const branchStr of branches) {
            const tokens = branchStr.split(/\s+/).filter(Boolean);
            const s = auditBranch(tag, tagLine, tokens, effectiveParent, isIcon, ariaHidden);
            if (first) {
              childSurface = s;
              first = false;
            }
          }
        }

        if (!selfClosing) stack.push({ tag, surface: childSurface });
        i = j + 1;
        continue;
      }
    }
    i++;
  }

  return issues;
}

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

function runSelfTest(): void {
  console.log('=== Running Brand Palette & WCAG AST Engine Regression Fixtures ===');
  const fixtures: Array<{ name: string; code: string; expectViolation: boolean }> = [
    {
      name: '1. Compliant tokens pass',
      code: `export const Ok = () => <div className="bg-phumulani-charcoal text-white"><span className="text-phumulani-teal">Ready</span><button className="bg-phumulani-earth text-white hover:bg-phumulani-charcoal">Go</button></div>;`,
      expectViolation: false,
    },
    {
      name: '2. Conditional ternary Earth + Leaf Green fails',
      code: `export const Bad = ({ ok }: { ok: boolean }) => <span className={ok ? 'bg-phumulani-earth text-phumulani-green' : 'bg-white text-phumulani-charcoal'}>Status</span>;`,
      expectViolation: true,
    },
    {
      name: '3. Template literal branch pale Gold on Cream fails',
      code: `export const BadTpl = ({ a }: { a: boolean }) => <div className="bg-phumulani-cream"><span className={\`px-2 \${a ? 'text-phumulani-gold' : 'text-phumulani-charcoal'}\`}>Label</span></div>;`,
      expectViolation: true,
    },
    {
      name: '4. Low-opacity Charcoal /50 on White fails (< 4.5:1)',
      code: `export const BadAlpha = () => <div className="bg-white"><p className="text-phumulani-charcoal/50">Muted copy</p></div>;`,
      expectViolation: true,
    },
    {
      name: '5. PascalCase non-icon React component NOT exempted',
      code: `import { Badge } from './Badge'; export const BadComp = () => <div className="bg-white"><Badge className="text-phumulani-gold">Gold text</Badge></div>;`,
      expectViolation: true,
    },
    {
      name: '6. Hover state hover:bg-phumulani-teal with text-white fails',
      code: `export const BadHover = () => <button className="bg-phumulani-earth text-white hover:bg-phumulani-teal">Action</button>;`,
      expectViolation: true,
    },
    {
      name: '7. Inline style contrast failure caught',
      code: `export const BadStyle = () => <div style={{ backgroundColor: '#EFEBD1', color: '#F7B24A' }}>Text</div>;`,
      expectViolation: true,
    },
    {
      name: '8. Gradient Earth->Charcoal with Gold text fails worst stop',
      code: `export const BadGrad = () => <div className="bg-gradient-to-br from-phumulani-earth to-phumulani-charcoal"><span className="text-phumulani-gold">Title</span></div>;`,
      expectViolation: true,
    },
  ];

  let passed = 0;
  for (const fx of fixtures) {
    const res = auditContrastInTsxAst('fixture.tsx', fx.code);
    const hasViolation = res.length > 0;
    if (hasViolation === fx.expectViolation) {
      passed++;
      console.log(`[PASS] ${fx.name}`);
    } else {
      console.error(`[FAIL] ${fx.name} (expected violation=${fx.expectViolation}, got=${res.length}):`, res);
      process.exit(1);
    }
  }
  console.log(`[SELF-TEST PASSED] ${passed}/${fixtures.length} regression fixtures verified.`);
}

if (process.argv.includes('--self-test')) {
  runSelfTest();
}

const EXTRA_UI_FILES = [
  'index.html',
  'server.ts',
  'public/images/branding/phumulani-pattern.svg',
  'public/media/branding/phumulani-pattern.svg',
].filter((f) => fs.existsSync(f));

const sourceFiles = [...walk('src'), ...EXTRA_UI_FILES];
const errors: string[] = [];

if (fs.existsSync('src/index.css')) {
  const indexCss = fs.readFileSync('src/index.css', 'utf8');
  const requiredVars = [
    '--phumulani-peace-orange',
    '--phumulani-deep-earth',
    '--phumulani-healing-teal',
    '--phumulani-ancestral-gold',
    '--phumulani-soft-cream',
    '--phumulani-leaf-green',
    '--phumulani-charcoal',
    '--brand-primary',
    '--brand-secondary',
    '--brand-accent',
    '--brand-background',
    '--brand-surface',
    '--brand-text-primary',
    '--brand-text-secondary',
    '--brand-border',
    '--brand-focus',
    '--brand-interactive',
    '--brand-interactive-hover',
    '--brand-interactive-active',
    '--brand-success',
    '--brand-warning',
    '--brand-error',
    '--brand-info',
  ];
  for (const v of requiredVars) {
    if (!indexCss.includes(`${v}:`)) {
      errors.push(`Missing required CSS design token ${v} in src/index.css`);
    }
  }
}

for (const pair of REQUIRED_AA_PAIRINGS) {
  const ratio = wcagContrastRatio(pair.fg, pair.bg);
  if (ratio < pair.minRatio) {
    errors.push(
      `WCAG AA pairing failed: ${pair.label} (${pair.fg} on ${pair.bg}) = ${ratio.toFixed(2)}:1 < ${pair.minRatio}:1`
    );
  }
}

const NAMED_UI_COLOR_PROP_RE =
  /(?:color|background|backgroundColor|borderColor|fill|stroke|stopColor)\s*[:=]\s*["'`]([a-zA-Z]+)["'`]/gi;
const ALLOWED_CSS_KEYWORDS = new Set([
  'none', 'transparent', 'currentcolor', 'inherit', 'white', 'initial', 'unset', 'url', 'auto', 'normal',
]);

const BUILT_CSS_ALLOWED_HEXES = new Set([
  ...APPROVED_HEXES,
  '#333',
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
  });

  if (file.endsWith('.tsx')) {
    errors.push(...auditContrastInTsxAst(file, content));
  }
}

const distAssets = path.join('dist', 'assets');
let auditedCssBundles = 0;
const isApprovedCompiledCssHex = (upperHex: string): boolean => {
  if (BUILT_CSS_ALLOWED_HEXES.has(upperHex)) return true;
  if (upperHex.length === 9) {
    const rgbBase = upperHex.slice(0, 7);
    if (APPROVED_HEXES.has(rgbBase)) return true;
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
  for (const err of errors.slice(0, 120)) {
    console.error(` - ${err}`);
  }
  if (errors.length > 120) {
    console.error(` ... and ${errors.length - 120} more violation(s).`);
  }
  process.exit(1);
}

console.log(
  `[BRAND PALETTE AUDIT PASSED] Scanned ${sourceFiles.length} source files` +
    (auditedCssBundles > 0 ? ` and ${auditedCssBundles} built CSS bundle(s)` : '') +
    `: 0 unapproved colors, 0 Tailwind default color leaks, 0 WCAG 2.2 AA AST contrast errors.`
);

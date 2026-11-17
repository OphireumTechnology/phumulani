/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Master Brand Color System & WCAG Contrast Verification Gate
 * Reference: Phumulani Social Media Policy, Guidelines & Brand Manual v1.0, Section 5.3, p. 14
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

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
  const issues: string[] = [];
  if (file.endsWith('SafeImage.tsx')) return issues;
  // Use the TypeScript AST so conditional JSX branches and fragments cannot
  // corrupt the surface stack as they did in the former character scanner.
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const variants = (e: ts.Expression | undefined): string[] | null => {
    if (!e) return [];
    if (ts.isStringLiteralLike(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
    if (ts.isConditionalExpression(e)) { const x=variants(e.whenTrue), y=variants(e.whenFalse); return x && y ? [...x,...y] : null; }
    if (ts.isTemplateExpression(e)) {
      let out=[e.head.text];
      for (const s of e.templateSpans) { const choices=variants(s.expression); if (!choices) return null;
        out=out.flatMap(p=>choices.map(v=>p+v)); if(out.length>64) return null; out=out.map(v=>v+s.literal.text); }
      return out;
    }
    if (ts.isBinaryExpression(e) && e.operatorToken.kind===ts.SyntaxKind.PlusToken) {
      const x=variants(e.left), y=variants(e.right); return x&&y ? x.flatMap(p=>y.map(v=>p+v)) : null;
    }
    return null;
  };
  const classes=(attrs: ts.JsxAttributes): string[] | null => {
    for (const p of attrs.properties) {
      if (!ts.isJsxAttribute(p) || p.name.getText(sf)!=='className') continue;
      if (!p.initializer) return [];
      if (ts.isStringLiteral(p.initializer)) return [p.initializer.text];
      if (ts.isJsxExpression(p.initializer)) return variants(p.initializer.expression);
      return null;
    }
    return [];
  };
  const check=(tag:string,line:number,cls:string,parent:string):string => {
    const surface=classifySurface(cls,parent), icon=/^[A-Z]/.test(tag);
    const add=(message:string)=>issues.push(file+':'+line+' '+message);
    if(surface==='charcoal'){ if(/\btext-phumulani-charcoal\b/.test(cls)) add('charcoal text on charcoal surface'); if(/\btext-phumulani-earth\b/.test(cls)) add('earth text on charcoal surface'); }
    else if(surface==='earth'){ if(/\btext-phumulani-charcoal\b/.test(cls)) add('charcoal text on earth surface'); if(/\btext-phumulani-earth\b/.test(cls)) add('earth text on earth surface'); if(!icon&&/\btext-phumulani-gold\b/.test(cls)) add('gold text on earth surface'); }
    else if(surface==='light'){ if(/\btext-white\b/.test(cls)) add('white text on light surface'); if(/\btext-phumulani-cream\b/.test(cls)) add('cream text on light surface'); if(!icon&&/\btext-phumulani-(?:gold|teal|green)\b/.test(cls)) add('pale accent text on light surface'); }
    else if(surface==='accent'){ if(/\btext-white\b/.test(cls)) add('white text on accent surface'); if(/\btext-phumulani-(?:earth|cream)\b/.test(cls)) add('low-contrast text on accent surface'); }
    if(/\bhover:bg-phumulani-teal\b/.test(cls)&&/\btext-white\b/.test(cls)) add('hover:bg-phumulani-teal paired with text-white');
    return surface;
  };
  const visit=(n:ts.Node,parent:string):void=>{
    if(ts.isJsxElement(n)){ const o=n.openingElement, tag=o.tagName.getText(sf), line=sf.getLineAndCharacterOfPosition(o.getStart(sf)).line+1;
      const cs=classes(o.attributes);
      const surfaces=cs ? [...new Set(cs.map(v=>check(tag,line,v,parent)))] : [parent];
      n.children.forEach(ch=>surfaces.forEach(surface=>visit(ch,surface))); return; }
    if(ts.isJsxSelfClosingElement(n)){ const line=sf.getLineAndCharacterOfPosition(n.getStart(sf)).line+1, cs=classes(n.attributes);
      if(cs) cs.forEach(v=>check(n.tagName.getText(sf),line,v,parent)); return; }
    if(ts.isJsxFragment(n)){ n.children.forEach(ch=>visit(ch,parent)); return; }
    if(ts.isJsxExpression(n)){ if(n.expression) visit(n.expression,parent); return; }
    ts.forEachChild(n,ch=>visit(ch,parent));
  };
  visit(sf,'light'); return [...new Set(issues)];
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

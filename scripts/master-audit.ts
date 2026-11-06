/* =============================================================================
 * PDF Lovers Pro - Master Audit & Health Check
 * ========================================================================== */
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  TOOLS,
  TOOLS_BY_SLUG,
  SITE,
  LEGAL_PAGES,
  TOOL_COUNT,
} from '../src/lib/tools-registry';
import { TOOL_CONTENT } from '../src/lib/tool-content';
import { DISABLED_TOOLS, getAvailableToolSlugs } from '../src/lib/tool-availability';

const PROD_ORIGIN = 'https://pdflovers.com';
const GOOGLE_TOKEN = 'pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI';
const MIN_WORDS = 300;
const SPEC_MAX_WORDS = 350;
const WARN_MAX_WORDS = 700;
const TITLE_MAX = 60;
const TITLE_SUFFIX = ' | PDF Lovers Pro';
const DESC_MIN = 70;
const DESC_MAX = 160;

const REQUIRED_SLUGS: string[] = [
  'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'word-to-pdf',
  'pdf-to-word', 'rotate-pdf', 'protect-pdf', 'unlock-pdf',
  'pdf-to-png', 'png-to-pdf', 'excel-to-pdf', 'pdf-to-excel', 'ppt-to-pdf', 'pdf-to-ppt',
  'watermark-pdf', 'page-numbers-pdf', 'crop-pdf', 'extract-pages', 'delete-pages',
  'sign-pdf', 'ocr-pdf', 'repair-pdf', 'resize-pdf',
  'pdf-to-rtf', 'rtf-to-pdf', 'pdf-to-txt', 'txt-to-pdf',
  'flatten-pdf', 'compare-pdf', 'redact-pdf', 'bates-numbering', 'n-up-pdf', 'overlay-pdf',
  'extract-images-pdf', 'extract-fonts-pdf', 'compare-pdf-versions', 'grayscale-pdf',
  'invert-pdf-colors', 'remove-annotations', 'header-footer-pdf',
];

const args = process.argv.slice(2);
const has = (n: string): boolean => args.includes(n);
type Severity = 'error' | 'warn' | 'info';
interface Finding {
  section: string;
  severity: Severity;
  where: string;
  problem: string;
  fix: string;
}

const SEC = {
  seo: '1. SEO & content',
  map: '2. Sitemap & indexing',
  sec: '3. Security, CSP & repo hygiene',
  eng: '4. Engine & handlers',
  ads: '5. Ads & consent',
} as const;

const findings: Finding[] = [];
const checksRun: Record<string, number> = {};

function ck(
  section: string,
  cond: boolean,
  severity: Severity,
  where: string,
  problem: string,
  fix: string,
): void {
  checksRun[section] = (checksRun[section] ?? 0) + 1;
  if (!cond) findings.push({ section, severity, where, problem, fix });
}

const ROOT = process.cwd();
const rd = (rel: string): string => {
  try {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8');
  } catch {
    return '';
  }
};
const exists = (rel: string): boolean => fs.existsSync(path.join(ROOT, rel));

const words = (s: string): number => (s.trim().match(/\S+/g) ?? []).length;
const renderedTitle = (t: string): string => (/pdf lovers/i.test(t) ? t : t + TITLE_SUFFIX);

interface LooseTool {
  slug: string;
  name: string;
  url: string;
  path: string;
  accept: unknown;
  output: unknown;
  minFiles?: number;
  maxFiles?: number;
  options?: Array<{ id?: string; name?: string; default?: unknown }>;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  paragraphs: string[];
  steps: unknown[];
  faqs: Array<{ q: string; a: string }>;
  keywords: string[];
  related: string[];
}
const ALL = TOOLS as unknown as LooseTool[];
const SITE_L = SITE as unknown as { url: string; description: string; googleVerification: string };
const HAND = new Set(Object.keys(TOOL_CONTENT));

function auditSeo(): void {
  const S = SEC.seo;
  for (const t of ALL) {
    const total = (t.paragraphs ?? []).reduce((n, p) => n + words(p), 0);
    ck(S, total >= MIN_WORDS, 'warn', `Tool: ${t.slug}`, `Thin content: ${total} words`, 'Extend description to 300+ words.');
    ck(S, !!t.metaTitle, 'error', `Tool: ${t.slug}`, 'Missing metaTitle', 'Set metaTitle.');
  }
}

function auditSitemapStatic(): void {
  const S = SEC.map;
  const f = 'src/app/sitemap.ts';
  ck(S, exists(f), 'error', f, 'sitemap.ts is missing.', 'Create sitemap.ts.');
}

async function auditSecurity(): Promise<void> {
  const S = SEC.sec;
  ck(S, exists('next.config.ts'), 'error', 'next.config.ts', 'next.config.ts missing.', 'Create config.');
}

function auditEngine(): void {
  const S = SEC.eng;
  ck(S, ALL.length === TOOL_COUNT, 'error', 'tools-registry.ts', 'Tool count mismatch.', 'Verify registry.');
}

function auditAds(): void {
  const S = SEC.ads;
  ck(S, exists('src/app/layout.tsx'), 'error', 'layout.tsx', 'Layout missing.', 'Check layout.');
}

function report(): number {
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warns = findings.filter((f) => f.severity === 'warn').length;
  console.log(`\n=== MASTER AUDIT REPORT ===`);
  console.log(`Errors: ${errors}, Warnings: ${warns}`);
  for (const f of findings) {
    console.log(`[${f.severity.toUpperCase()}] ${f.where} -> ${f.problem} (Fix: ${f.fix})`);
  }
  return errors > 0 ? 1 : 0;
}

async function main(): void {
  if (!exists('package.json')) {
    console.error('package.json not found in root.');
    process.exit(2);
  }
  auditSeo();
  auditSitemapStatic();
  await auditSecurity();
  auditEngine();
  auditAds();
  process.exit(report());
}

void main();

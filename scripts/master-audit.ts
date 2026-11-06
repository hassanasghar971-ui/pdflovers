/* =============================================================================
 * PDF Lovers Pro - Master Audit & Health Check (short version)
 * ========================================================================== */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { TOOLS, TOOL_COUNT } from '../src/lib/tools-registry';

const args = process.argv.slice(2);
void args;

const MIN_WORDS = 300;

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

function ck(
  section: string,
  cond: boolean,
  severity: Severity,
  where: string,
  problem: string,
  fix: string,
): void {
  if (!cond) findings.push({ section, severity, where, problem, fix });
}

const ROOT = process.cwd();
const exists = (rel: string): boolean => fs.existsSync(path.join(ROOT, rel));
const words = (s: string): number => (s.trim().match(/\S+/g) ?? []).length;

interface LooseTool {
  slug: string;
  metaTitle: string;
  paragraphs: string[];
}
const ALL = TOOLS as unknown as LooseTool[];

function auditSeo(): void {
  for (const t of ALL) {
    const total = (t.paragraphs ?? []).reduce((n, p) => n + words(p), 0);
    ck(SEC.seo, total >= MIN_WORDS, 'warn', `Tool: ${t.slug}`, `Thin content: ${total} words`, 'Extend description to 300+ words.');
    ck(SEC.seo, !!t.metaTitle, 'error', `Tool: ${t.slug}`, 'Missing metaTitle', 'Set metaTitle.');
  }
}

function auditSitemapStatic(): void {
  ck(SEC.map, exists('src/app/sitemap.ts'), 'error', 'src/app/sitemap.ts', 'sitemap.ts is missing.', 'Create sitemap.ts.');
}

function auditSecurity(): void {
  ck(SEC.sec, exists('next.config.ts'), 'error', 'next.config.ts', 'next.config.ts missing.', 'Create config.');
}

function auditEngine(): void {
  ck(SEC.eng, ALL.length === TOOL_COUNT, 'error', 'src/lib/tools-registry.ts', 'Tool count mismatch.', 'Verify registry.');
}

function auditAds(): void {
  ck(SEC.ads, exists('src/app/layout.tsx'), 'error', 'src/app/layout.tsx', 'Layout missing.', 'Check layout.');
}

function report(): number {
  const errors = findings.filter((f) => f.severity === 'error').length;
  const warns = findings.filter((f) => f.severity === 'warn').length;
  console.log('\n=== MASTER AUDIT REPORT ===');
  console.log(`Errors: ${errors}, Warnings: ${warns}`);
  for (const f of findings) {
    console.log(`[${f.severity.toUpperCase()}] ${f.where} -> ${f.problem} (Fix: ${f.fix})`);
  }
  return errors > 0 ? 1 : 0;
}

async function main(): Promise<void> {
  if (!exists('package.json')) {
    console.error('package.json not found in root.');
    process.exit(2);
  }
  auditSeo();
  auditSitemapStatic();
  auditSecurity();
  auditEngine();
  auditAds();
  process.exit(report());
}

void main();

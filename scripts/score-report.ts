import * as fs from 'node:fs';
import * as path from 'node:path';
import { TOOLS, TOOL_COUNT, LEGAL_PAGES } from '../src/lib/tools-registry';
import { TOOL_CONTENT } from '../src/lib/tool-content';

/** ===== MANUAL INPUT: add a slug only after testing it with a real file ===== */
const TESTED_WITH_REAL_FILES: readonly string[] = ['merge-pdf', 'compress-pdf'];

/** Pass mark for on-site readiness. */
const TARGET_SCORE = 90;

type Check = { label: string; points: number; earned: number; fix: string };
type Section = { name: string; max: number; earned: number; checks: Check[] };

const ROOT = process.cwd();
const round1 = (n: number): number => Math.round(n * 10) / 10;
const share = (n: number, d: number): number => (d === 0 ? 0 : n / d);
const exists = (rel: string): boolean => fs.existsSync(path.join(ROOT, rel));
const read = (rel: string): string =>
  exists(rel) ? fs.readFileSync(path.join(ROOT, rel), 'utf8') : '';

function listFiles(rel: string): string[] {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const child = path.join(rel, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(child));
    else out.push(child);
  }
  return out;
}

function check(label: string, points: number, result: boolean | number, fix: string): Check {
  const ratio =
    typeof result === 'boolean' ? (result ? 1 : 0) : Math.max(0, Math.min(1, result));
  return { label, points, earned: round1(points * ratio), fix };
}

function section(name: string, checks: Check[]): Section {
  const max = checks.reduce((s, c) => s + c.points, 0);
  const earned = round1(checks.reduce((s, c) => s + c.earned, 0));
  return { name, max, earned, checks };
}

function levelOf(score: number): string {
  if (score >= 90) return 'Excellent: technical foundation ready to compete';
  if (score >= 75) return 'Strong: a few gaps left';
  if (score >= 60) return 'Solid: usable, but not yet competitive';
  if (score >= 40) return 'Developing: important work remains';
  return 'Early stage: foundations missing';
}

function bar(earned: number, max: number): string {
  const filled = Math.round(share(earned, max) * 20);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
}

/* ---------- gather facts ---------- */
const contentSlugs = Object.keys(TOOL_CONTENT as unknown as Record<string, unknown>);
const handwritten = Math.min(contentSlugs.length, TOOL_COUNT);

const descOk = TOOLS.filter(
  (t) => t.metaDescription.length >= 70 && t.metaDescription.length <= 160,
).length;
const titles = TOOLS.map((t) => t.metaTitle);
const titleOk = TOOLS.filter(
  (t) => t.metaTitle.length <= 60 && titles.filter((x) => x === t.metaTitle).length === 1,
).length;

const sitemapSrc = read('src/app/sitemap.ts');
const nextConfig = read('next.config.ts');
const layoutSrc = read('src/app/layout.tsx');
const gateSrc = read('src/components/SocialBarGate.tsx');

const legalOk = LEGAL_PAGES.filter((p) =>
  exists(`src/app/${p.path.replace(/^\/+/, '')}/page.tsx`),
).length;

const hasConsent = listFiles('src').some((f) => /consent|cookie/i.test(path.basename(f)));

const validTested = TESTED_WITH_REAL_FILES.filter((slug) =>
  TOOLS.some((t) => t.slug === slug),
).length;

const verifyScripts = [
  'scripts/verify-engine.ts',
  'scripts/verify-content.ts',
  'scripts/verify-registry.ts',
].filter(exists).length;

/* ---------- sections ---------- */
const sections: Section[] = [
  section('Content', [
    check(
      'Unique content on every tool',
      24,
      share(handwritten, TOOL_COUNT),
      `Write unique content for ${TOOL_COUNT - handwritten} more tools in src/lib/tool-content.ts`,
    ),
    check(
      'Meta descriptions 70-160 chars on every tool',
      3,
      share(descOk, TOOL_COUNT),
      `Fix metaDescription length on ${TOOL_COUNT - descOk} tools`,
    ),
    check(
      'Meta titles at most 60 chars and unique',
      3,
      share(titleOk, TOOL_COUNT),
      `Shorten or de-duplicate metaTitle on ${TOOL_COUNT - titleOk} tools`,
    ),
  ]),
  section('Technical SEO', [
    check(
      'sitemap.ts exists, no new Date(), no Object.keys(TOOLS_REGISTRY',
      5,
      sitemapSrc !== '' &&
        !sitemapSrc.includes('new Date(') &&
        !sitemapSrc.includes('Object.keys(TOOLS_REGISTRY'),
      'Repair src/app/sitemap.ts (fixed dates, slugs from getAvailableToolSlugs)',
    ),
    check(
      'No placeholder lastmod (2026-01-15)',
      3,
      sitemapSrc !== '' && !sitemapSrc.includes('2026-01-15'),
      'Set the three LASTMOD constants in sitemap.ts to the real deploy date (never a future date)',
    ),
    check('robots.ts exists', 2, exists('src/app/robots.ts'), 'Add src/app/robots.ts'),
    check('manifest.ts exists', 2, exists('src/app/manifest.ts'), 'Add src/app/manifest.ts'),
    check(
      'Favicon / app icon in repo',
      4,
      exists('src/app/icon.svg') || exists('src/app/favicon.ico') || exists('src/app/icon.png'),
      'Add src/app/icon.svg (or run scripts/generate-brand-assets.mjs)',
    ),
    check(
      'Social share image in repo',
      2,
      listFiles('src/app').some((f) => /^opengraph-image\./.test(path.basename(f))),
      'Add src/app/opengraph-image.png',
    ),
    check(
      'Google verification in layout',
      2,
      layoutSrc.includes('verification'),
      'Add verification: { google: SITE.googleVerification } in layout metadata',
    ),
  ]),
  section('Security', [
    check('Content-Security-Policy', 4, nextConfig.includes('Content-Security-Policy'), 'Add CSP in next.config.ts'),
    check('CSP worker-src', 1, nextConfig.includes('worker-src'), 'Add worker-src self blob:'),
    check('X-Content-Type-Options', 2, nextConfig.includes('X-Content-Type-Options'), 'Add nosniff header'),
    check(
      'Clickjacking protection',
      2,
      nextConfig.includes('X-Frame-Options') || nextConfig.includes('frame-ancestors'),
      'Add X-Frame-Options or frame-ancestors',
    ),
    check('Strict-Transport-Security', 2, nextConfig.includes('Strict-Transport-Security'), 'Add HSTS header'),
    check('Referrer-Policy', 2, nextConfig.includes('Referrer-Policy'), 'Add Referrer-Policy'),
    check('Permissions-Policy', 2, nextConfig.includes('Permissions-Policy'), 'Add Permissions-Policy'),
  ]),
  section('Trust and compliance', [
    check(
      'All legal pages present',
      5,
      share(legalOk, LEGAL_PAGES.length),
      `${LEGAL_PAGES.length - legalOk} legal page file(s) missing under src/app`,
    ),
    check(
      'Consent banner component',
      6,
      hasConsent,
      'Build the consent banner and gate Social Bar and Native Banner behind it',
    ),
    check(
      'Social Bar capped per session',
      2,
      gateSrc.includes('MAX_LOADS_PER_SESSION'),
      'Add src/components/SocialBarGate.tsx and use it in layout.tsx',
    ),
    check(
      'security.txt present',
      2,
      exists('public/.well-known/security.txt'),
      'Add public/.well-known/security.txt',
    ),
  ]),
  section('Real-file testing', [
    check(
      'Tools tested with real files',
      16,
      share(validTested, TOOL_COUNT),
      `Test ${TOOL_COUNT - validTested} more tools with real files, then add the slug to TESTED_WITH_REAL_FILES`,
    ),
    check(
      'Verify scripts present',
      4,
      share(verifyScripts, 3),
      'Add the missing scripts/verify-*.ts files',
    ),
  ]),
];

const total = round1(sections.reduce((s, x) => s + x.earned, 0));
const maxTotal = sections.reduce((s, x) => s + x.max, 0);
const percent = round1(share(total, maxTotal) * 100);

const gaps = sections
  .flatMap((s) => s.checks.map((c) => ({ ...c, section: s.name, gain: round1(c.points - c.earned) })))
  .filter((c) => c.gain > 0.05)
  .sort((a, b) => b.gain - a.gain);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ total, maxTotal, percent, level: levelOf(percent), sections, gaps }, null, 2));
} else {
  console.log('PDF Lovers Pro: readiness score');
  console.log('='.repeat(60));
  console.log(`Score : ${total} / ${maxTotal}  (${percent}%)`);
  console.log(`Level : ${levelOf(percent)}`);
  console.log(`Gap to the ${TARGET_SCORE}-point target: ${Math.max(0, round1(TARGET_SCORE - percent))} points`);
  console.log('');
  for (const s of sections) {
    console.log(`${s.name.padEnd(22)} ${bar(s.earned, s.max)}  ${s.earned} / ${s.max}`);
  }
  console.log('');
  console.log('Actions, largest gain first:');
  if (gaps.length === 0) console.log('  none');
  for (const g of gaps) {
    console.log(`  +${String(g.gain).padEnd(5)} [${g.section}] ${g.fix}`);
  }
  console.log('');
  console.log('Not measured: backlinks, brand searches, real-user Core Web Vitals,');
  console.log('Search Console impressions and clicks. This score covers on-site readiness only.');
}

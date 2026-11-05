import { TOOL_CONTENT } from '../src/lib/tool-content';
import { SITE, TOOLS_BY_SLUG, TOOL_COUNT, countWords } from '../src/lib/tools-registry';
import { DISABLED_TOOLS, getAvailableToolSlugs } from '../src/lib/tool-availability';

let failed = 0;
const fail = (msg: string) => {
  console.error(`✗ ${msg}`);
  failed++;
};

/* ---- Sitemap slugs must be real tool slugs (catches "/tools/0" bugs) ---- */
const available = getAvailableToolSlugs();
for (const slug of available) {
  if (!TOOLS_BY_SLUG[slug]) fail(`sitemap slug "${slug}" is not a tool`);
}
for (const slug of DISABLED_TOOLS) {
  if (!TOOLS_BY_SLUG[slug]) fail(`DISABLED_TOOLS contains unknown slug "${slug}"`);
}
const expected = TOOL_COUNT - DISABLED_TOOLS.size;
if (available.length !== expected) {
  fail(`sitemap has ${available.length} tool slugs, expected ${expected}`);
}
console.log(`✓ sitemap: ${available.length} tool URLs, ${DISABLED_TOOLS.size} disabled`);

/* ---- Hand-written content checks ---- */
const BRAND_SUFFIX = ` | ${SITE.name}`;
const seenSentences = new Map<string, string>();

for (const [slug, c] of Object.entries(TOOL_CONTENT)) {
  if (!TOOLS_BY_SLUG[slug]) {
    fail(`${slug}: not a slug in the registry`);
    continue;
  }
  if (c.h2s.length !== c.paragraphs.length) fail(`${slug}: h2s and paragraphs differ in length`);

  const words = countWords(c.paragraphs.join(' '));
  if (words < 300 || words > 700) fail(`${slug}: ${words} words (expected 300-700)`);

  const renderedTitle = /pdf lovers/i.test(c.metaTitle)
    ? c.metaTitle.length
    : c.metaTitle.length + BRAND_SUFFIX.length;
  if (renderedTitle > 60) fail(`${slug}: rendered title is ${renderedTitle} chars (max 60)`);

  if (c.metaDescription.length < 70 || c.metaDescription.length > 160) {
    fail(`${slug}: metaDescription is ${c.metaDescription.length} chars (expected 70-160)`);
  }
  if (c.faqs.length < 4) fail(`${slug}: fewer than 4 FAQs`);
  if (c.steps.length !== 4) fail(`${slug}: expected 4 steps, found ${c.steps.length}`);

  for (const raw of c.paragraphs.join(' ').split(/(?<=[.!?])\s+/)) {
    const key = raw.trim().toLowerCase();
    if (key.length < 40) continue;
    const prev = seenSentences.get(key);
    if (prev && prev !== slug) fail(`${slug}: sentence repeated from ${prev}: "${raw.slice(0, 60)}..."`);
    seenSentences.set(key, slug);
  }

  console.log(`✓ ${slug}: ${words} words, ${c.faqs.length} FAQs, rendered title ${renderedTitle} chars`);
}

if (failed) {
  console.error(`\n${failed} problem(s) found.`);
  process.exit(1);
}
console.log(`\nAll checks passed (${Object.keys(TOOL_CONTENT).length} content entries).`);

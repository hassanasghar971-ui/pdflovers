import { TOOL_CONTENT } from '../src/lib/tool-content';
import { TOOLS_BY_SLUG, countWords } from '../src/lib/tools-registry';

let failed = 0;
const fail = (msg: string) => {
  console.error(`✗ ${msg}`);
  failed++;
};
const seenSentences = new Map<string, string>();

for (const [slug, c] of Object.entries(TOOL_CONTENT)) {
  if (!TOOLS_BY_SLUG[slug]) {
    fail(`${slug}: not a slug in the registry`);
    continue;
  }
  if (c.h2s.length !== c.paragraphs.length) fail(`${slug}: h2s and paragraphs differ in length`);

  const words = countWords(c.paragraphs.join(' '));
  if (words < 350 || words > 700) fail(`${slug}: ${words} words (expected 350-700)`);
  if (c.metaTitle.length > 60) fail(`${slug}: metaTitle is ${c.metaTitle.length} chars (max 60)`);
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

  console.log(`✓ ${slug}: ${words} words, ${c.faqs.length} FAQs, title ${c.metaTitle.length} chars`);
}

if (failed) {
  console.error(`\n${failed} problem(s) found.`);
  process.exit(1);
}
console.log(`\nAll ${Object.keys(TOOL_CONTENT).length} content entries passed.`);

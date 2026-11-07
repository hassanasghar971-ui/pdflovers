import { TOOLS } from '../src/lib/tools-registry';
import { TOOL_CONTENT } from '../src/lib/tool-content';

const FIELDS = [
  'slug',
  'name',
  'category',
  'accept',
  'output',
  'multiple',
  'minFiles',
  'maxFiles',
  'options',
  'related',
] as const;

const done = new Set(Object.keys(TOOL_CONTENT));
const pending = TOOLS.filter((t) => !done.has(t.slug));

console.log(`Done: ${done.size}   Pending: ${pending.length}`);
console.log('='.repeat(60));

for (const t of pending) {
  const rec = t as unknown as Record<string, unknown>;
  const facts: Record<string, unknown> = {};
  for (const key of FIELDS) facts[key] = rec[key];
  console.log(JSON.stringify(facts, null, 2));
  console.log('-'.repeat(60));
}

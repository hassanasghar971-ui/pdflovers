/**
 * View helpers for pages. Registry content is read through tolerant accessors so a small naming
 * difference (q/question, a/answer, string vs {title,text}) cannot blank out a page.
 * Server-safe; client components must only `import type` from here, otherwise the whole registry
 * would be bundled into the browser.
 */

import { CATEGORIES, CATEGORY_ORDER, TOOLS, getTool } from './tools-registry';
import type { Tool } from './tools-registry';

type Loose = Record<string, unknown>;

const asLoose = (v: unknown): Loose => (v && typeof v === 'object' ? (v as Loose) : {});

function textOf(v: unknown, keys: string[]): string {
  if (typeof v === 'string') return v.trim();
  const o = asLoose(v);
  for (const k of keys) {
    const x = o[k];
    if (typeof x === 'string' && x.trim()) return x.trim();
  }
  return '';
}

function listOf(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) return v.split(/\n{2,}/);
  return [];
}

function titleCase(id: string): string {
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/* ---------------- content ---------------- */

export interface Section {
  heading: string;
  paragraphs: string[];
}

export interface Step {
  title: string;
  text: string;
}

export interface Faq {
  q: string;
  a: string;
}

export function getParagraphs(tool: Tool): string[] {
  return listOf(asLoose(tool).paragraphs)
    .map((p) => textOf(p, ['text', 'body', 'content']))
    .filter((p) => p.length > 0);
}

export function getH2s(tool: Tool): string[] {
  return listOf(asLoose(tool).h2s)
    .map((h) => textOf(h, ['text', 'title', 'heading']))
    .filter((h) => h.length > 0);
}

export function getSteps(tool: Tool): Step[] {
  return listOf(asLoose(tool).steps)
    .map((s) => ({
      title: typeof s === 'string' ? '' : textOf(s, ['title', 'name', 'heading']),
      text: typeof s === 'string' ? s.trim() : textOf(s, ['text', 'description', 'body', 'detail']),
    }))
    .filter((s) => s.title || s.text);
}

export function getFaqs(tool: Tool): Faq[] {
  return listOf(asLoose(tool).faqs)
    .map((f) => ({
      q: textOf(asLoose(f).q ?? asLoose(f).question, []) || textOf(f, ['q', 'question']),
      a: textOf(asLoose(f).a ?? asLoose(f).answer, []) || textOf(f, ['a', 'answer']),
    }))
    .filter((f) => f.q && f.a);
}

/**
 * Pairs the H2 list with the paragraph list: paragraphs are split into consecutive chunks, one chunk
 * per H2. Sections without paragraphs are dropped. With no H2s a single "About" section is used.
 */
export function getSections(tool: Tool): Section[] {
  const paragraphs = getParagraphs(tool);
  const h2s = getH2s(tool);
  if (paragraphs.length === 0) return [];
  if (h2s.length === 0) return [{ heading: `About ${tool.name}`, paragraphs }];
  const chunk = Math.max(1, Math.ceil(paragraphs.length / h2s.length));
  const out: Section[] = [];
  h2s.forEach((heading, i) => {
    const slice = paragraphs.slice(i * chunk, (i + 1) * chunk);
    if (slice.length > 0) out.push({ heading, paragraphs: slice });
  });
  return out;
}

/** Related tools: the registry `related` list first, topped up with tools of the same category. */
export function getRelated(tool: Tool, max = 6): Tool[] {
  const picked: Tool[] = [];
  const seen = new Set<string>([tool.slug]);
  const add = (t: Tool | undefined) => {
    if (t && !seen.has(t.slug)) {
      seen.add(t.slug);
      picked.push(t);
    }
  };
  for (const r of listOf(asLoose(tool).related)) {
    const slug = typeof r === 'string' ? r : textOf(r, ['slug']);
    if (slug) add(getTool(slug));
  }
  if (picked.length < 3) {
    for (const t of TOOLS) {
      if (picked.length >= max) break;
      if (t.category === tool.category) add(t);
    }
  }
  return picked.slice(0, max);
}

/** Dev-time hints about thin content (does not throw). */
export function contentGaps(tool: Tool): string[] {
  const gaps: string[] = [];
  if (getSections(tool).length === 0) gaps.push('no paragraphs');
  if (getSteps(tool).length === 0) gaps.push('no steps');
  if (getFaqs(tool).length === 0) gaps.push('no FAQs');
  return gaps;
}

/* ---------------- categories ---------------- */

export interface CategoryInfo {
  id: string;
  label: string;
  description: string;
}

export function categoryInfo(id: string): CategoryInfo {
  const cats: unknown = CATEGORIES;
  let entry: unknown;
  if (Array.isArray(cats)) {
    entry = cats.find((c) => {
      const o = asLoose(c);
      return o.id === id || o.slug === id || o.key === id;
    });
  } else if (cats && typeof cats === 'object') {
    entry = (cats as Loose)[id];
  }
  const label = textOf(entry, ['label', 'name', 'title']) || titleCase(id);
  const description = typeof entry === 'string' ? '' : textOf(entry, ['description', 'blurb', 'summary', 'tagline']);
  return { id, label, description };
}

export function categoryIds(): string[] {
  const order: unknown = CATEGORY_ORDER;
  if (Array.isArray(order) && order.length > 0) return order.map(String);
  const cats: unknown = CATEGORIES;
  if (Array.isArray(cats)) return cats.map((c) => textOf(asLoose(c).id ?? asLoose(c).slug ?? asLoose(c).key, []));
  return Object.keys(asLoose(cats));
}

/* ---------------- slim card data (safe to send to the browser) ---------------- */

export interface ToolCardData {
  slug: string;
  name: string;
  description: string;
  category: string;
  categoryLabel: string;
  icon: string;
  search: string;
}

export function toCard(tool: Tool): ToolCardData {
  const keywords = listOf(asLoose(tool).keywords).map((k) => String(k)).join(' ');
  const description = textOf(asLoose(tool).metaDescription, []);
  return {
    slug: tool.slug,
    name: tool.name,
    description,
    category: String(tool.category),
    categoryLabel: categoryInfo(String(tool.category)).label,
    icon: typeof asLoose(tool).icon === 'string' ? (asLoose(tool).icon as string) : '',
    search: `${tool.name} ${tool.slug.replace(/-/g, ' ')} ${keywords}`.toLowerCase(),
  };
}

/* ---------------- JSON-LD ---------------- */

/** JSON for an inline <script type="application/ld+json">; "<" is escaped so content cannot close the tag. */
export function safeJson(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

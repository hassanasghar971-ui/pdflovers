import type { Metadata } from 'next';
import NativeBanner from '@/components/NativeBanner';
import ToolCard from '@/components/ToolCard';
import ToolGrid from '@/components/ToolGrid';
import { POPULAR_SLUGS, SITE, TOOLS, TOOL_COUNT, getTool } from '@/lib/tools-registry';
import type { Tool } from '@/lib/tools-registry';
import { categoryIds, categoryInfo, safeJson, toCard } from '@/lib/tool-view';

const TITLE = `PDF Lovers Pro - ${TOOL_COUNT} Free Online PDF Tools That Never Upload Your Files`;
const DESCRIPTION = `Merge, split, compress, convert, sign, protect and edit PDFs with ${TOOL_COUNT} free tools. Everything runs in your browser, so your files never leave your device.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: SITE.url },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SITE.url, type: 'website', siteName: SITE.name },
};

const STEPS = [
  { title: 'Pick a tool', text: 'Choose from merging, splitting, compressing, converting, signing, protecting and more.' },
  { title: 'Add your files', text: 'Drop them on the page. They are opened by your browser, not sent to a server.' },
  { title: 'Download the result', text: 'Save the new file, or a ZIP when a tool produces several. Memory is released when you finish.' },
];

export default function HomePage() {
  const cards = TOOLS.map(toCard);
  const categories = categoryIds().map(categoryInfo);
  const popular = POPULAR_SLUGS.map((s) => getTool(s))
    .filter((t): t is Tool => Boolean(t))
    .map(toCard);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE.name} tools`,
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: `${SITE.url}/tools/${t.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(itemList) }} />

      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          {TOOL_COUNT} free PDF tools that run in your browser
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Merge, split, compress, convert, sign, protect and edit PDF files. Your documents are processed on your own
          device and are never uploaded.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <a href="#all-tools" className="btn btn-primary btn-lg">
            Browse all tools
          </a>
          <span className="chip chip-brand">No uploads</span>
          <span className="chip chip-brand">No sign-up</span>
          <span className="chip chip-brand">{TOOL_COUNT} tools</span>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="popular-heading">
        <h2 id="popular-heading" className="mb-4 text-2xl font-bold">
          Popular tools
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((t) => (
            <li key={t.slug}>
              <ToolCard tool={t} />
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto mt-10 max-w-3xl">
        <NativeBanner />
      </div>

      <section id="all-tools" className="mt-12 scroll-mt-24" aria-labelledby="all-heading">
        <h2 id="all-heading" className="mb-4 text-2xl font-bold">
          All {TOOL_COUNT} tools
        </h2>
        <ToolGrid tools={cards} categories={categories.map((c) => ({ id: c.id, label: c.label }))} />
      </section>

      <section className="mt-14" aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-4 text-2xl font-bold">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 font-bold text-white" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="seo-content mt-14 max-w-3xl" aria-labelledby="private-heading">
        <h2 id="private-heading">Private by design</h2>
        <p>
          {SITE.name} uses your browser as the processing engine. When you add a file, your device opens it, changes it
          and hands the result back to you; there is no upload step and no account. That is why the tools keep working
          on slow connections once a page has loaded.
        </p>
        <p>
          Running locally has honest limits. Very large files depend on the memory your device has free, scanned
          documents need the OCR tool before their text can be searched, and conversions to and from Word, Excel and
          PowerPoint rebuild the content rather than copying every layout detail. Each tool page explains what to expect
          before you start.
        </p>
      </section>
    </div>
  );
}

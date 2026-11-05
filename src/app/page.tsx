import type { Metadata } from 'next';
import Link from 'next/link';
import NativeBanner from '@/components/NativeBanner';
import ToolCard from '@/components/ToolCard';
import ToolGrid from '@/components/ToolGrid';
import { POPULAR_SLUGS, SITE, TOOLS, TOOL_COUNT, getTool } from '@/lib/tools-registry';
import type { Tool } from '@/lib/tools-registry';
import { isToolAvailable } from '@/lib/tool-availability';
import { categoryIds, categoryInfo, safeJson, toCard } from '@/lib/tool-view';

// Rendered title stays under 60 characters (about 49 here).
const TITLE = `${SITE.name}: ${TOOL_COUNT} Free PDF Tools in Your Browser`;
const DESCRIPTION = `Merge, split, compress, convert, sign and edit PDFs with ${TOOL_COUNT} free tools. Files are processed in your browser and not uploaded to our servers. No sign-up.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: SITE.url },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SITE.url, type: 'website', siteName: SITE.name },
};

const STEPS = [
  { title: 'Pick a tool', text: 'Choose from merging, splitting, compressing, converting, signing and more.' },
  { title: 'Add your files', text: 'Drop them on the page. Your browser opens them; they are not sent to our servers.' },
  { title: 'Download the result', text: 'Save the new file, or a ZIP when a tool produces several. Memory is released when you finish.' },
];

export default function HomePage() {
  const cards = TOOLS.map(toCard);
  const categories = categoryIds().map(categoryInfo);
  const popular = POPULAR_SLUGS.map((s) => getTool(s))
    .filter((t): t is Tool => Boolean(t))
    .map(toCard);

  // Only tools that are indexable go into the structured list.
  const listed = TOOLS.filter((t) => isToolAvailable(t.slug));
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE.name} tools`,
    numberOfItems: listed.length,
    itemListElement: listed.map((t, i) => ({
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
          Merge, split, compress, convert, sign and edit PDF files. Your documents are opened by your browser on your
          own device and are not uploaded to our servers.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <a href="#all-tools" className="btn btn-primary btn-lg">
            Browse all tools
          </a>
          <span className="chip chip-brand">No file uploads</span>
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
        <h2 id="private-heading">Processed on your device</h2>
        <p>
          {SITE.name} uses your browser as the processing engine. When you add a file, your device opens it, changes it
          and hands the result back to you; there is no upload step and no account. Once a page has loaded, most tools
          keep working on a slow connection.
        </p>
        <p>
          Running locally has honest limits. Very large files depend on the memory your device has free, scanned
          documents need the OCR tool before their text can be searched, and conversions to and from Word, Excel and
          PowerPoint rebuild the content rather than copying every layout detail. Each tool page explains what to
          expect before you start.
        </p>
        <p>
          This site shows ads from third-party networks, which may set cookies of their own. They are separate from
          your documents. Details are in the <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import { POPULAR_SLUGS, getTool } from '@/lib/tools-registry';
import type { Tool } from '@/lib/tools-registry';
import { toCard } from '@/lib/tool-view';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const popular = POPULAR_SLUGS.map((s) => getTool(s))
    .filter((t): t is Tool => Boolean(t))
    .slice(0, 6)
    .map(toCard);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Error 404</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">We couldn&rsquo;t find that page</h1>
      <p className="mx-auto mt-3 max-w-xl text-gray-700">
        The link may be mistyped or the page may have moved. Pick a tool below or head back to the home page.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary btn-lg">
          Go to home page
        </Link>
        <Link href="/#all-tools" className="btn btn-secondary btn-lg">
          Browse all tools
        </Link>
      </div>

      <section className="mt-12 text-left" aria-labelledby="nf-popular">
        <h2 id="nf-popular" className="mb-3 text-xl font-bold">
          Popular tools
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((t) => (
            <li key={t.slug}>
              <ToolCard tool={t} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

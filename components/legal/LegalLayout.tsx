import Link from "next/link";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-300">{title}</span>
      </nav>

      <div className="mb-10 border-b border-slate-200 pb-8 dark:border-slate-800">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
          Legal Document
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-a:text-brand-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline dark:prose-invert">
        {children}
      </article>
    </div>
  );
}

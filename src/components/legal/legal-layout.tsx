import type { ReactNode } from "react";

export const legalLinkClass =
  "font-medium text-red-600 underline-offset-2 hover:underline";

export function LegalLayout({
  eyebrow = "Legal",
  title,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <header className="mb-10 border-b border-slate-200 pb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-red-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {updated && (
          <p className="mt-3 text-sm text-slate-500">Last updated: {updated}</p>
        )}
      </header>
      <div className="space-y-10">{children}</div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-3 leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

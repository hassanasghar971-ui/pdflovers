import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";
import { TOOLS } from "@/lib/tools-registry";
import ToolCard from "@/components/tool-card";

export default function NotFound() {
  const suggestedTools = TOOLS.slice(0, 4);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
        <FileQuestion size={36} />
      </span>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-600">
        404 Error
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
        This page seems to have gone missing
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        The page you're looking for doesn't exist or may have been moved. Try
        searching for a PDF tool below, or head back to the homepage.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          <Home size={16} /> Back to Homepage
        </Link>
        <Link
          href="/tools"
          className="focus-ring flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Search size={16} /> Browse All Tools
        </Link>
      </div>

      <div className="mt-16 w-full">
        <h2 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">
          Popular tools you might be looking for
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {suggestedTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </main>
  );
}

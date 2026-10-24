"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/tools?search=${encodeURIComponent(trimmed)}` : "/tools"
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30"
    >
      <Search size={18} className="ml-2 shrink-0 text-zinc-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search merge, split, compress, convert..."
        className="focus-ring min-w-0 flex-1 rounded-lg bg-transparent px-1 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:text-white"
      />
      <button
        type="submit"
        className="focus-ring flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        Search
        <ArrowRight size={15} />
      </button>
    </form>
  );
}

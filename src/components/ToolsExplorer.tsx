"use client";

import { useMemo, useState } from "react";
import { TOOLS, CATEGORIES, type ToolCategory } from "@/lib/tools-data";
import SearchBar from "./SearchBar";
import ToolCard from "./ToolCard";

export default function ToolsExplorer() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | ToolCategory>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      if (activeCategory !== "All" && tool.category !== activeCategory) return false;
      if (!q) return true;
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<ToolCategory, typeof TOOLS>();
    for (const cat of CATEGORIES) map.set(cat, []);
    filtered.forEach((t) => map.get(t.category)?.push(t));
    return map;
  }, [filtered]);

  return (
    <div id="tools-explorer" className="w-full">
      <div className="mx-auto mb-8 max-w-2xl">
        <SearchBar value={query} onChange={setQuery} resultCount={filtered.length} />
      </div>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <button onClick={() => setActiveCategory("All")} className={pillClass(activeCategory === "All")}>
          All Tools ({TOOLS.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={pillClass(activeCategory === cat)}>
            {cat} ({TOOLS.filter((t) => t.category === cat).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-neutral-500 dark:text-neutral-400">
          No tools found for &ldquo;{query}&rdquo;. Try a different keyword.
        </p>
      ) : (
        <div className="space-y-14">
          {CATEGORIES.filter((cat) => activeCategory === "All" || activeCategory === cat).map((cat) => {
            const items = grouped.get(cat) || [];
            if (items.length === 0) return null;
            return (
              <section key={cat} aria-labelledby={`cat-${cat}`}>
                <h3
                  id={`cat-${cat}`}
                  className="mb-5 flex items-center gap-3 text-xl font-bold text-neutral-900 dark:text-white"
                >
                  <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                  {cat}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function pillClass(active: boolean) {
  return `rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
    active
      ? "border-[#DC2626] bg-[#DC2626] text-white shadow-lg shadow-red-600/30"
      : "border-black/10 bg-white/60 text-neutral-700 backdrop-blur-md hover:border-[#DC2626]/50 hover:text-[#DC2626] dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
  }`;
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, LayoutGrid } from "lucide-react";
import ToolCard from "@/components/tool-card";
import {
  TOOLS,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type ToolCategory,
} from "@/lib/tools-registry";

export default function ToolsExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = (searchParams.get("category") as ToolCategory) ?? "";

  const [query, setQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "">(
    initialCategory
  );

  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
    setActiveCategory((searchParams.get("category") as ToolCategory) ?? "");
  }, [searchParams]);

  function updateUrl(nextQuery: string, nextCategory: ToolCategory | "") {
    const params = new URLSearchParams();
    if (nextQuery) params.set("search", nextQuery);
    if (nextCategory) params.set("category", nextCategory);
    const qs = params.toString();
    router.push(qs ? `/tools?${qs}` : "/tools", { scroll: false });
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    updateUrl(value, activeCategory);
  }

  function handleCategoryChange(category: ToolCategory | "") {
    const next = category === activeCategory ? "" : category;
    setActiveCategory(next);
    updateUrl(query, next);
  }

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q));
      const matchesCategory = !activeCategory || tool.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  return (
    <div>
      <div className="mx-auto mb-8 max-w-xl">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by tool name or keyword..."
            className="focus-ring w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </div>
      </div>

      <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handleCategoryChange("")}
          className={`focus-ring flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === ""
              ? "border-red-600 bg-red-600 text-white"
              : "border-zinc-200 text-zinc-600 hover:border-red-300 dark:border-zinc-700 dark:text-zinc-300"
          }`}
        >
          <LayoutGrid size={14} /> All Tools
        </button>
        {ALL_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category
                ? "border-red-600 bg-red-600 text-white"
                : "border-zinc-200 text-zinc-600 hover:border-red-300 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-200">
            No tools found
          </p>
          <p className="text-sm text-zinc-500">
            Try a different search term or clear your filters.
          </p>
        </div>
      )}
    </div>
  );
}

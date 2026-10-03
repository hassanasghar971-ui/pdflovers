"use client";
import { useMemo, useState } from "react";
import type { ToolDef, Category } from "@/lib/tools";
import { categories } from "@/lib/tools";
import ToolCard from "./ToolCard";

export default function ToolExplorer({ tools }: { tools: ToolDef[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Category | "All">("All");

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchesCategory = active === "All" || t.category === active;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.shortDescription.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [tools, query, active]);

  return (
    <div>
      <div className="glass-card-strong flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 42 tools — e.g. merge, compress, sign…"
            className="w-full rounded-2xl border border-current/10 bg-transparent py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["All", ...categories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                active === c ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow" : "glass-pill text-secondary hover:text-current"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-secondary">
        Showing <span className="font-semibold text-current">{filtered.length}</span> of {tools.length} tools
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card mt-6 rounded-3xl p-10 text-center text-secondary">No tools match your search just yet.</div>
      )}
    </div>
  );
}

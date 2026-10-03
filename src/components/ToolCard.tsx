import Link from "next/link";
import type { ToolDef } from "@/lib/tools";
import ToolBadge from "./ToolBadge";

export default function ToolCard({ tool }: { tool: ToolDef }) {
  return (
    <Link
      href={`/${tool.slug}`}
      className="hover-lift glass-card group flex flex-col gap-4 rounded-3xl p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      <div className="flex items-start justify-between gap-3">
        <ToolBadge tool={tool} />
        <span className="rounded-full border border-current/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-secondary">
          {tool.category}
        </span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-current transition-colors group-hover:text-violet-500">{tool.name}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-secondary">{tool.shortDescription}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-violet-500">
        Open tool
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-0.5">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

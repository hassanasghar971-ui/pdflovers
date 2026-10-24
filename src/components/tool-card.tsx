import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DynamicIcon from "@/components/dynamic-icon";
import { CATEGORY_LABELS, type Tool } from "@/lib/tools-registry";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="focus-ring group relative flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-lg hover:shadow-red-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900/50 dark:hover:shadow-red-950/30"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white dark:bg-red-950/40 dark:text-red-500">
          <DynamicIcon name={tool.icon} className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {CATEGORY_LABELS[tool.category]}
        </span>
      </div>

      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
        {tool.name}
      </h3>
      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {tool.shortDescription}
      </p>

      <span className="flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-500">
        Use tool
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

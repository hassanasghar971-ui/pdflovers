import Link from "next/link";
import type { Tool } from "@/lib/tools-data";

export default function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#DC2626]/40 hover:shadow-xl hover:shadow-red-600/10 dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DC2626]/10 text-[#DC2626] transition-colors group-hover:bg-[#DC2626] group-hover:text-white">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900 dark:text-white">{tool.title}</h4>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
          {tool.description}
        </p>
      </div>
    </Link>
  );
}

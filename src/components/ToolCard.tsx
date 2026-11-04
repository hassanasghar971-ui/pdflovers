import Link from 'next/link';
import type { ToolCardData } from '@/lib/tool-view';

/** Short icon strings (emoji) are shown as-is; anything else falls back to the first letter. */
function IconBadge({ icon, name }: { icon: string; name: string }) {
  const trimmed = icon.trim();
  const isGlyph = trimmed.length > 0 && Array.from(trimmed).length <= 3;
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl font-bold text-brand-700"
    >
      {isGlyph ? trimmed : name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function ToolCard({ tool }: { tool: ToolCardData }) {
  return (
    <Link href={`/tools/${tool.slug}`} prefetch={false} className="card card-hover flex h-full items-start gap-3 p-4">
      <IconBadge icon={tool.icon} name={tool.name} />
      <span className="min-w-0">
        <span className="block font-semibold text-gray-900">{tool.name}</span>
        {tool.description ? (
          <span className="mt-0.5 line-clamp-2 block text-sm text-gray-600">{tool.description}</span>
        ) : null}
        <span className="chip mt-2">{tool.categoryLabel}</span>
      </span>
    </Link>
  );
}

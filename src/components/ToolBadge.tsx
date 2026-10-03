import type { ToolDef } from "@/lib/tools";

export default function ToolBadge({ tool, size = 48 }: { tool: ToolDef; size?: number }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${tool.color} shadow-lg`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.95}
        height={size * 0.95}
        viewBox="0 0 24 24"
        className="absolute opacity-25"
        fill="none"
      >
        <path
          d="M6 2.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 20V4a1.5 1.5 0 0 1 1.5-1.5Z"
          fill="#ffffff"
        />
        <path d="M14 2.5V6a1 1 0 0 0 1 1h3.5" stroke="#000000" strokeOpacity="0.1" strokeWidth="1" />
      </svg>
      <span className="relative text-white drop-shadow-sm" style={{ fontSize: size * 0.3, fontWeight: 800, letterSpacing: "-0.02em" }}>
        {tool.initials}
      </span>
    </div>
  );
}

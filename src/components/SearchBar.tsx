import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  resultCount?: number;
}

export default function SearchBar({ value, onChange, resultCount }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search 42 PDF tools... e.g. merge, compress, watermark"
        aria-label="Search PDF tools"
        className="w-full rounded-full border border-black/10 bg-white/70 py-4 pl-12 pr-4 text-base text-neutral-900 shadow-lg shadow-black/5 backdrop-blur-xl outline-none ring-[#DC2626]/40 transition-all focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
      {typeof resultCount === "number" && value && (
        <span className="mt-2 block text-center text-xs text-neutral-500 dark:text-neutral-400">
          {resultCount} tool{resultCount !== 1 ? "s" : ""} found
        </span>
      )}
    </div>
  );
}

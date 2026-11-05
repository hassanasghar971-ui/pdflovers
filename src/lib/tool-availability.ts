import { TOOLS_REGISTRY } from "@/lib/tools-registry";

/** Tools that exist in the registry but aren't ready. Remove a slug when it ships. */
export const DISABLED_TOOLS: ReadonlySet<string> = new Set([
  "unlock-pdf",  // needs a qpdf WASM build; pdf-lib can't decrypt
  "protect-pdf", // needs a verified encryption library
]);

export function isToolAvailable(slug: string): boolean {
  return (
    Object.prototype.hasOwnProperty.call(TOOLS_REGISTRY, slug) &&
    !DISABLED_TOOLS.has(slug)
  );
}

export function getAvailableToolSlugs(): string[] {
  return Object.keys(TOOLS_REGISTRY).filter((slug) => !DISABLED_TOOLS.has(slug));
}

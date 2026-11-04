/* =============================================================================
 * PDF Lovers Pro – Universal engine dispatcher
 *
 *   runTool(slug, ctx)
 *     1. looks the tool up in the registry (single source of truth)
 *     2. validates file count / type / size
 *     3. resolves + coerces options (defaults, clamping, showWhen, required)
 *     4. lazy-loads the engine module for that tool's group
 *     5. runs the handler inside a MemoryScope, which is ALWAYS disposed
 *        (object URLs revoked, canvases purged, workers terminated)
 *     6. fires `plp:action` on success (this is what arms the Adsterra Social Bar)
 *
 * The UI must NOT dispatch `plp:action` itself; the engine does it exactly once.
 * ========================================================================== */

import { getAllSlugs, getTool, type Tool, type ToolOption, type OptionValue } from './tools-registry';
import { MemoryScope } from './memory';
import {
  ToolError,
  type HandlerMap,
  type OptionValues,
  type ProgressFn,
  type RunContext,
  type ToolHandler,
  type ToolResult,
} from './engine/types';
import { MAX_FILE_BYTES, fileMatchesAccept, formatBytes, normalizeError, throwIfAborted } from './engine/shared';

/* ------------------------------ Public re-exports ------------------------- */

export type { OptionValues, ProgressFn, RunContext, ResultFile, ToolResult, ToolHandler, HandlerMap } from './engine/types';
export { ToolError } from './engine/types';
export {
  formatBytes,
  fileMatchesAccept,
  downloadBlob,
  downloadResultFiles,
  zipResultFiles,
} from './engine/shared';

/* ------------------------------ Handler groups ---------------------------- */

type GroupId = 'organize' | 'optimize' | 'to-pdf' | 'from-pdf' | 'edit' | 'security' | 'analyze';

interface EngineModule {
  handlers: HandlerMap;
}

/** Each group is its own chunk. Nothing heavy is downloaded until a tool in that group runs. */
const LOADERS: Record<GroupId, () => Promise<EngineModule>> = {
  organize: () => import('./engine/organize'),
  optimize: () => import('./engine/optimize'),
  'to-pdf': () => import('./engine/to-pdf'),
  'from-pdf': () => import('./engine/from-pdf'),
  edit: () => import('./engine/edit'),
  security: () => import('./engine/security'),
  analyze: () => import('./engine/analyze'),
};

/** slug -> engine group. Exactly 42 entries (checked against the registry). */
export const GROUP_OF: Record<string, GroupId> = {
  // organize (8)
  'merge-pdf': 'organize',
  'split-pdf': 'organize',
  'rotate-pdf': 'organize',
  'crop-pdf': 'organize',
  'extract-pages': 'organize',
  'delete-pages': 'organize',
  'resize-pdf': 'organize',
  'n-up-pdf': 'organize',
  // optimize (6)
  'compress-pdf': 'optimize',
  'repair-pdf': 'optimize',
  'flatten-pdf': 'optimize',
  'grayscale-pdf': 'optimize',
  'invert-pdf-colors': 'optimize',
  'remove-annotations': 'optimize',
  // to-pdf (7)
  'jpg-to-pdf': 'to-pdf',
  'png-to-pdf': 'to-pdf',
  'word-to-pdf': 'to-pdf',
  'excel-to-pdf': 'to-pdf',
  'ppt-to-pdf': 'to-pdf',
  'rtf-to-pdf': 'to-pdf',
  'txt-to-pdf': 'to-pdf',
  // from-pdf (8)
  'pdf-to-jpg': 'from-pdf',
  'pdf-to-png': 'from-pdf',
  'pdf-to-word': 'from-pdf',
  'pdf-to-excel': 'from-pdf',
  'pdf-to-ppt': 'from-pdf',
  'pdf-to-rtf': 'from-pdf',
  'pdf-to-txt': 'from-pdf',
  'ocr-pdf': 'from-pdf',
  // edit (6)
  'watermark-pdf': 'edit',
  'page-numbers-pdf': 'edit',
  'sign-pdf': 'edit',
  'bates-numbering': 'edit',
  'overlay-pdf': 'edit',
  'header-footer-pdf': 'edit',
  // security (3)
  'protect-pdf': 'security',
  'unlock-pdf': 'security',
  'redact-pdf': 'security',
  // analyze (4)
  'compare-pdf': 'analyze',
  'compare-pdf-versions': 'analyze',
  'extract-images-pdf': 'analyze',
  'extract-fonts-pdf': 'analyze',
};

async function getHandler(slug: string): Promise<ToolHandler> {
  const group = GROUP_OF[slug];
  if (!group) throw new ToolError(`No engine is registered for "${slug}".`, 'unsupported');
  const mod = await LOADERS[group]();
  const handler = mod.handlers[slug];
  if (!handler) throw new ToolError(`The "${slug}" engine is not available.`, 'unsupported');
  return handler;
}

/** Warm the chunk for a tool (call on hover or after the tool page mounts). Never throws. */
export function preloadEngine(slug: string): void {
  const group = GROUP_OF[slug];
  if (group) void LOADERS[group]().catch(() => undefined);
}

/** Compare the dispatcher map with the registry. Used by dev checks and scripts/verify-registry.ts. */
export function verifyEngineCoverage(): { missing: string[]; extra: string[] } {
  const slugs = new Set(getAllSlugs());
  const mapped = new Set(Object.keys(GROUP_OF));
  return {
    missing: [...slugs].filter((s) => !mapped.has(s)),
    extra: [...mapped].filter((s) => !slugs.has(s)),
  };
}

if (process.env.NODE_ENV !== 'production') {
  const { missing, extra } = verifyEngineCoverage();
  if (missing.length || extra.length) {
    console.error('[pdf-engine] Registry/engine mismatch.', { missing, extra });
  }
}

/* -------------------------------- Validation ------------------------------ */

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function validateFiles(tool: Tool, files: File[]): void {
  if (!Array.isArray(files) || files.length < tool.minFiles) {
    if (tool.minFiles > 1) {
      const need = tool.minFiles === tool.maxFiles ? `exactly ${tool.minFiles}` : `at least ${tool.minFiles}`;
      throw new ToolError(`${tool.name} needs ${need} files. You added ${files?.length ?? 0}.`);
    }
    throw new ToolError('Please choose a file first.');
  }
  if (files.length > tool.maxFiles) {
    throw new ToolError(`${tool.name} accepts up to ${plural(tool.maxFiles, 'file')}. You added ${files.length}.`);
  }
  const extensions = tool.accept.filter((a) => a.startsWith('.')).join(', ');
  for (const f of files) {
    if (f.size === 0) throw new ToolError(`"${f.name}" is empty (0 bytes).`);
    if (f.size > MAX_FILE_BYTES) {
      throw new ToolError(`"${f.name}" is ${formatBytes(f.size)}. The limit is ${formatBytes(MAX_FILE_BYTES, 0)} per file because processing happens in your browser memory.`);
    }
    if (!fileMatchesAccept(f, tool.accept)) {
      throw new ToolError(`"${f.name}" is not a supported file type for ${tool.name}. Accepted: ${extensions}.`);
    }
  }
}

function coerceOption(opt: ToolOption, value: OptionValue | undefined): OptionValue {
  if (value === undefined || value === null) return opt.default;
  switch (opt.type) {
    case 'number':
    case 'range': {
      const n = typeof value === 'number' ? value : parseFloat(String(value));
      if (!Number.isFinite(n)) return opt.default;
      let v = n;
      if (opt.min !== undefined) v = Math.max(opt.min, v);
      if (opt.max !== undefined) v = Math.min(opt.max, v);
      return v;
    }
    case 'checkbox':
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      return opt.default;
    case 'select': {
      const s = String(value);
      return opt.choices?.some((c) => c.value === s) ? s : opt.default;
    }
    case 'color':
      return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(value)) ? String(value) : opt.default;
    default:
      return String(value); // text, password, signature (data URL)
  }
}

/** Fill defaults, coerce types, clamp ranges and enforce `required` for visible options. */
export function resolveOptions(tool: Tool, raw: OptionValues): OptionValues {
  const out: OptionValues = { ...(raw ?? {}) };
  for (const opt of tool.options) out[opt.key] = coerceOption(opt, raw?.[opt.key]);

  for (const opt of tool.options) {
    if (!opt.required) continue;
    if (opt.showWhen && String(out[opt.showWhen.key]) !== String(opt.showWhen.equals)) continue;
    const v = out[opt.key];
    if (typeof v === 'string' && v.trim() === '') {
      throw new ToolError(`${opt.label} is required.`);
    }
  }
  return out;
}

function validateResult(tool: Tool, result: ToolResult): void {
  if (!result || !Array.isArray(result.files)) {
    throw new ToolError(`${tool.name} did not return a result.`, 'internal');
  }
  if (result.files.length === 0 && !result.report) {
    throw new ToolError(`${tool.name} finished but produced no output.`, 'internal');
  }
  for (const f of result.files) {
    if (!f.blob || f.blob.size === 0) {
      throw new ToolError(`${tool.name} produced an empty file ("${f.name}"). The input may not contain what this tool needs.`, 'internal');
    }
  }
}

/* -------------------------------- Progress -------------------------------- */

/** Monotonic, clamped, integer progress. UI callback errors never break processing. */
function createProgressReporter(cb: ProgressFn | undefined): ProgressFn {
  let last = 0;
  return (percent, message) => {
    const p = Math.max(last, Math.min(100, Math.round(Number.isFinite(percent) ? percent : last)));
    last = p;
    try {
      cb?.(p, message);
    } catch {
      /* ignore UI errors */
    }
  };
}

/* ---------------------------------- runTool ------------------------------- */

export async function runTool(slug: string, ctx: RunContext): Promise<ToolResult> {
  const tool = getTool(slug);
  if (!tool) throw new ToolError(`Unknown tool "${slug}".`, 'unsupported');

  const mem = new MemoryScope(`tool:${slug}`);
  const progress = createProgressReporter(ctx.onProgress);

  try {
    throwIfAborted(ctx.signal);
    validateFiles(tool, ctx.files);
    const options = resolveOptions(tool, ctx.options);

    progress(1, 'Loading engine…');
    const handler = await getHandler(slug);
    throwIfAborted(ctx.signal);

    progress(3, 'Processing…');
    const result = await handler({ files: ctx.files, options, onProgress: progress, signal: ctx.signal }, mem);

    throwIfAborted(ctx.signal);
    validateResult(tool, result);

    progress(100, 'Done');
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('plp:action'));
    return result;
  } catch (e) {
    throw normalizeError(e);
  } finally {
    // Revokes object URLs, purges canvases, closes bitmaps, terminates workers.
    await mem.dispose();
  }
}

// Small, dependency-light helpers used by the engine handler modules.
// These deliberately do not depend on exact signatures of the larger helpers in
// ./shared so the handlers stay robust if those signatures are tuned later.

import type { MemoryScope } from '../memory';
import { ToolError } from './types';
import type { OptionValues, RunContext } from './types';
import { renderPageToCanvas } from './shared';

/* ------------------------------ options ------------------------------ */

export function optStr(options: OptionValues, key: string, fallback = ''): string {
  const v = (options as Record<string, unknown>)[key];
  return v === undefined || v === null ? fallback : String(v);
}

export function optNum(options: OptionValues, key: string, fallback: number): number {
  const v = (options as Record<string, unknown>)[key];
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function optFlag(options: OptionValues, key: string, fallback = false): boolean {
  const v = (options as Record<string, unknown>)[key];
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  return fallback;
}

export function clampNum(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Accepts 0–1 or 1–100 and returns a JPEG quality in 0.1–1. */
export function qualityOf(value: number): number {
  const q = value > 1 ? value / 100 : value;
  return clampNum(q, 0.1, 1);
}

/* ------------------------------ progress ----------------------------- */

export function progress(ctx: RunContext, pct: number, label?: string): void {
  const fn = ctx.onProgress as unknown as (p: number, l?: string) => void;
  fn(clampNum(Math.round(pct), 0, 100), label);
}

/* ------------------------------- files ------------------------------- */

export async function bytesOf(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/** File name without extension, filesystem-safe. */
export function stem(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const cleaned = base
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.slice(0, 120) || 'document';
}

export function pdfFileName(file: File, suffix: string): string {
  return `${stem(file.name)}-${suffix}.pdf`;
}

export function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

export function allIndexes(total: number): number[] {
  return Array.from({ length: total }, (_, i) => i);
}

export function isPasswordError(e: unknown): boolean {
  return e instanceof ToolError && (e.code === 'password-required' || e.code === 'wrong-password');
}

/* ----------------------------- geometry ------------------------------ */

/** Snap any /Rotate value to 0, 90, 180 or 270. */
export function normalizeRotation(angle: number): 0 | 90 | 180 | 270 {
  const snapped = (((Math.round(angle / 90) * 90) % 360) + 360) % 360;
  return snapped as 0 | 90 | 180 | 270;
}

const PAGE_PORTRAIT_PT: Record<string, readonly [number, number]> = {
  a3: [841.89, 1190.55],
  a4: [595.28, 841.89],
  a5: [419.53, 595.28],
  a6: [297.64, 419.53],
  letter: [612, 792],
  legal: [612, 1008],
  tabloid: [792, 1224],
  executive: [522, 756],
};

/** Returns [width, height] in points. Throws on unknown size keys. */
export function pageSizeFor(key: string, landscape: boolean): [number, number] {
  const dims = PAGE_PORTRAIT_PT[key.toLowerCase()];
  if (!dims) {
    throw new ToolError(`Unsupported page size "${key}".`, 'invalid-input');
  }
  return landscape ? [dims[1], dims[0]] : [dims[0], dims[1]];
}

/* ------------------------- page range groups ------------------------- */

/**
 * Parses "1-3, 5, 8-" into contiguous groups of zero-based page indexes.
 * "N-" means N to the last page and "-N" means page 1 to N.
 * Each token becomes one group (one output file in Split).
 */
export function parseGroups(input: string, total: number): number[][] {
  const tokens = input
    .split(/[,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) {
    throw new ToolError('Enter at least one page range, for example 1-3, 5, 8-10.', 'invalid-input');
  }
  const groups: number[][] = [];
  for (const token of tokens) {
    let from: number;
    let to: number;
    const single = /^(\d+)$/.exec(token);
    const range = /^(\d+)?\s*-\s*(\d+)?$/.exec(token);
    if (single) {
      from = to = Number(single[1]);
    } else if (range && (range[1] || range[2])) {
      from = range[1] ? Number(range[1]) : 1;
      to = range[2] ? Number(range[2]) : total;
    } else {
      throw new ToolError(`"${token}" is not a valid page range.`, 'invalid-input');
    }
    if (from < 1 || to < 1 || from > total || to > total) {
      throw new ToolError(
        `Range "${token}" is outside this document (it has ${total} page${total === 1 ? '' : 's'}).`,
        'invalid-input',
      );
    }
    if (from > to) {
      throw new ToolError(`Range "${token}" runs backwards. Write it as ${to}-${from}.`, 'invalid-input');
    }
    const group: number[] = [];
    for (let p = from; p <= to; p += 1) group.push(p - 1);
    groups.push(group);
  }
  return groups;
}

/* ------------------------------ rendering ---------------------------- */

export type PageArg = Parameters<typeof renderPageToCanvas>[0];

/**
 * Renders a pdf.js page to a canvas owned by `mem`. The caller must
 * `mem.release(canvas)` when finished. Tolerates `renderPageToCanvas`
 * returning either the canvas itself or an object that contains it.
 */
export async function renderToCanvas(
  page: PageArg,
  mem: MemoryScope,
  opts: { scale: number; signal?: AbortSignal },
): Promise<HTMLCanvasElement> {
  const res: unknown = await renderPageToCanvas(page, mem, {
    scale: opts.scale,
    background: '#ffffff',
    signal: opts.signal,
  });
  if (res instanceof HTMLCanvasElement) return res;
  const inner = (res as { canvas?: unknown } | null)?.canvas;
  if (inner instanceof HTMLCanvasElement) return inner;
  throw new ToolError('Could not render a page of this PDF.', 'internal');
}

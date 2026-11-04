/**
 * Analyze handlers: compare-pdf, compare-pdf-versions, extract-images-pdf, extract-fonts-pdf.
 *
 * Honest limits (also repeated in result notes where relevant):
 * - Text comparison is LINE based on pdf.js text positions. A paragraph that re-flows shows as
 *   changed even if the words are the same. Pages are aligned by exact-content matching first
 *   (so inserted/deleted pages do not shift everything), then paired by position inside gaps.
 * - Visual comparison pairs page N with page N. Inserted pages shift the pairing.
 * - Extracted images are what pdf.js decodes for display (soft masks applied, CMYK -> RGB).
 *   JPEG sources are re-encoded, not copied byte-for-byte. Vector art and text are not images.
 * - Fonts are read from the PDF's own font dictionaries with pdf-lib and the embedded font
 *   program is copied out. Embedded fonts are almost always SUBSETS (only the glyphs used),
 *   and bare CFF / subset TrueType files often will not install on an OS without repair.
 *   Fonts are copyrighted; extraction does not grant any licence to use them.
 */
import type { PDFDocument, PDFRawStream } from 'pdf-lib';
import type { MemoryScope } from '../memory';
import type { HandlerMap, OptionValues, ResultFile, RunContext, ToolResult } from './types';
import { ToolError } from './types';
import { MAX_CANVAS_DIMENSION, MAX_CANVAS_PIXELS, extractTextLines, formatBytes, loadPdfJs, loadPdfLibDocument, throwIfAborted, withPdfDocument, yieldToMain, } from './shared';
import { bytesOf, clampNum, optFlag, optNum, optStr, pad, progress, renderToCanvas, stem } from './handler-utils';
import { getTool } from '../tools-registry';

/* ------------------------------------------------------------------ */
/* Small shared helpers */
/* ------------------------------------------------------------------ */

// pdf.js page/document proxies are used structurally so this file does not depend on pdfjs types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPage = any;
interface AnyDoc {
  numPages: number;
  getPage(n: number): Promise<AnyPage>;
  getMetadata(): Promise<{ info?: Record<string, unknown> }>;
}

const BOM = '\uFEFF';

function textFile(name: string, text: string): ResultFile {
  return { name, blob: new Blob([BOM + text], { type: 'text/plain;charset=utf-8' }), mime: 'text/plain' };
}

async function readBytes(file: File): Promise<Uint8Array> {
  const raw: unknown = await bytesOf(file);
  return raw instanceof Uint8Array ? raw : new Uint8Array(raw as ArrayBuffer);
}

/** Runs `fn` with an open pdf.js document. Works whether or not withPdfDocument is generic. */
async function withDoc<T>(
  bytes: Uint8Array,
  fileName: string,
  signal: AbortSignal | undefined,
  fn: (doc: AnyDoc) => Promise<T>,
): Promise<T> {
  let out: T | undefined;
  let done = false;
  await withPdfDocument(
    bytes,
    async (doc: unknown) => {
      out = await fn(doc as AnyDoc);
      done = true;
    },
    { fileName, signal },
  );
  if (!done) throw new ToolError('The PDF could not be processed.', 'internal');
  return out as T;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new ToolError('The browser could not encode an image.', 'out-of-memory'))),
      type,
      quality,
    );
  });
}

function normalizeLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

function shortStem(name: string): string {
  return stem(name).slice(0, 40) || 'file';
}

/* ------------------------------------------------------------------ */
/* LCS + line / page diff */
/* ------------------------------------------------------------------ */

const MAX_LCS_CELLS = 12_000_000;

interface LcsResult {
  pairs: Array<[number, number]>;
  /** false when the middle section was too large and is reported as fully replaced */
  exact: boolean;
}

function lcs(a: string[], b: string[]): LcsResult {
  const n = a.length;
  const m = b.length;
  let start = 0;
  while (start < n && start < m && a[start] === b[start]) start++;
  let endA = n;
  let endB = m;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < start; i++) pairs.push([i, i]);
  const rn = endA - start;
  const rm = endB - start;
  let exact = true;
  if (rn > 0 && rm > 0) {
    if ((rn + 1) * (rm + 1) <= MAX_LCS_CELLS) {
      const w = rm + 1;
      const size = (rn + 1) * w;
      const table: Uint16Array | Uint32Array = Math.min(rn, rm) < 65535 ? new Uint16Array(size) : new Uint32Array(size);
      for (let i = rn - 1; i >= 0; i--) {
        for (let j = rm - 1; j >= 0; j--) {
          table[i * w + j] = a[start + i] === b[start + j] ? table[(i + 1) * w + j + 1] + 1 : Math.max(table[(i + 1) * w + j], table[i * w + j + 1]);
        }
      }
      let i = 0;
      let j = 0;
      while (i < rn && j < rm) {
        if (a[start + i] === b[start + j]) {
          pairs.push([start + i, start + j]);
          i++;
          j++;
        } else if (table[(i + 1) * w + j] >= table[i * w + j + 1]) {
          i++;
        } else {
          j++;
        }
      }
    } else {
      exact = false;
    }
  }
  for (let k = 0; k < n - endA; k++) pairs.push([endA + k, endB + k]);
  return { pairs, exact };
}

interface Op {
  kind: 'same' | 'del' | 'add';
  text: string;
}

function diffLines(a: string[], b: string[]): { ops: Op[]; exact: boolean } {
  const { pairs, exact } = lcs(a, b);
  const ops: Op[] = [];
  let ia = 0;
  let ib = 0;
  for (const [pa, pb] of pairs) {
    while (ia < pa) ops.push({ kind: 'del', text: a[ia++] });
    while (ib < pb) ops.push({ kind: 'add', text: b[ib++] });
    ops.push({ kind: 'same', text: a[pa] });
    ia = pa + 1;
    ib = pb + 1;
  }
  while (ia < a.length) ops.push({ kind: 'del', text: a[ia++] });
  while (ib < b.length) ops.push({ kind: 'add', text: b[ib++] });
  return { ops, exact };
}

interface PageDiff {
  /** 1-based page numbers, null when the page does not exist on that side */
  a: number | null;
  b: number | null;
  status: 'identical' | 'changed' | 'removed' | 'added';
  ops: Op[];
  added: number;
  removed: number;
  exact: boolean;
}

function pairDiff(a: string[], b: string[], pa: number, pb: number): PageDiff {
  const { ops, exact } = diffLines(a, b);
  let added = 0;
  let removed = 0;
  for (const op of ops) {
    if (op.kind === 'add') added++;
    else if (op.kind === 'del') removed++;
  }
  return { a: pa, b: pb, status: added + removed === 0 ? 'identical' : 'changed', ops, added, removed, exact };
}

function diffDocuments(a: string[][], b: string[][]): PageDiff[] {
  const keysA = a.map((p) => p.join('\n'));
  const keysB = b.map((p) => p.join('\n'));
  const anchors = lcs(keysA, keysB).pairs;
  const result: PageDiff[] = [];
  let ia = 0;
  let ib = 0;

  const flushGap = (endA: number, endB: number) => {
    const gapA = endA - ia;
    const gapB = endB - ib;
    const k = Math.min(gapA, gapB);
    for (let t = 0; t < k; t++) result.push(pairDiff(a[ia + t], b[ib + t], ia + t + 1, ib + t + 1));
    for (let t = k; t < gapA; t++) {
      const lines = a[ia + t];
      result.push({
        a: ia + t + 1,
        b: null,
        status: 'removed',
        ops: lines.map((text) => ({ kind: 'del' as const, text })),
        added: 0,
        removed: lines.length,
        exact: true,
      });
    }
    for (let t = k; t < gapB; t++) {
      const lines = b[ib + t];
      result.push({
        a: null,
        b: ib + t + 1,
        status: 'added',
        ops: lines.map((text) => ({ kind: 'add' as const, text })),
        added: lines.length,
        removed: 0,
        exact: true,
      });
    }
  };

  for (const [pa, pb] of anchors) {
    flushGap(pa, pb);
    result.push({ a: pa + 1, b: pb + 1, status: 'identical', ops: [], added: 0, removed: 0, exact: true });
    ia = pa + 1;
    ib = pb + 1;
  }
  flushGap(a.length, b.length);
  return result;
}

interface DiffSummary {
  identical: number;
  changed: number;
  removed: number;
  added: number;
  linesAdded: number;
  linesRemoved: number;
  inexact: number;
}

function summarize(diffs: PageDiff[]): DiffSummary {
  const s: DiffSummary = { identical: 0, changed: 0, removed: 0, added: 0, linesAdded: 0, linesRemoved: 0, inexact: 0 };
  for (const d of diffs) {
    if (d.status === 'identical') s.identical++;
    else if (d.status === 'changed') s.changed++;
    else if (d.status === 'removed') s.removed++;
    else s.added++;
    s.linesAdded += d.added;
    s.linesRemoved += d.removed;
    if (!d.exact) s.inexact++;
  }
  return s;
}

/** Renders one page diff as report lines: changed lines with one line of context. */
function renderPageDiff(d: PageDiff, oldLabel: string, newLabel: string): string[] {
  const out: string[] = [];
  if (d.status === 'identical') return out;
  if (d.status === 'removed') {
    out.push(`Page ${d.a} (${oldLabel}) - not present in the ${newLabel} file (${plural(d.removed, 'line')})`);
  } else if (d.status === 'added') {
    out.push(`Page ${d.b} (${newLabel}) - new page, not present in the ${oldLabel} file (${plural(d.added, 'line')})`);
  } else {
    out.push(
      `Page ${d.a} (${oldLabel}) <-> page ${d.b} (${newLabel}): ${plural(d.removed, 'line')} removed, ${d.added} added` +
        (d.exact ? '' : ' [page too large for a detailed diff: shown as fully replaced]'),
    );
  }
  const show = new Array<boolean>(d.ops.length).fill(false);
  d.ops.forEach((op, i) => {
    if (op.kind !== 'same') {
      show[i] = true;
      if (i > 0) show[i - 1] = true;
      if (i < d.ops.length - 1) show[i + 1] = true;
    }
  });
  let gap = false;
  d.ops.forEach((op, i) => {
    if (!show[i]) {
      gap = true;
      return;
    }
    if (gap) out.push(' ...');
    gap = false;
    out.push(`${op.kind === 'del' ? ' - ' : op.kind === 'add' ? ' + ' : ' '}${op.text}`);
  });
  out.push('');
  return out;
}

/* ------------------------------------------------------------------ */
/* Reading a document: text, page sizes, metadata */
/* ------------------------------------------------------------------ */

interface PageSize {
  w: number;
  h: number;
}
interface DocRead {
  pageCount: number;
  pages: string[][];
  sizes: PageSize[];
  lineCount: number;
  emptyPages: number;
  meta: Record<string, unknown>;
}

async function readDoc(
  file: File,
  bytes: Uint8Array,
  ctx: RunContext,
  from: number,
  to: number,
  label: string,
  wantMeta: boolean,
): Promise<DocRead> {
  return withDoc(bytes, file.name, ctx.signal, async (doc) => {
    const pages: string[][] = [];
    const sizes: PageSize[] = [];
    let lineCount = 0;
    let emptyPages = 0;
    const total = doc.numPages;
    for (let i = 1; i <= total; i++) {
      throwIfAborted(ctx.signal);
      const page = await doc.getPage(i);
      try {
        const vp = page.getViewport({ scale: 1 });
        sizes.push({ w: vp.width, h: vp.height });
        const raw = (await extractTextLines(page)) as Array<{ text: string }>;
        const lines = raw.map((l) => normalizeLine(l.text)).filter((l) => l.length > 0);
        if (lines.length === 0) emptyPages++;
        lineCount += lines.length;
        pages.push(lines);
      } finally {
        page.cleanup();
      }
      progress(ctx, Math.round(from + ((to - from) * i) / total), `${label} (${i}/${total})`);
      if (i % 4 === 0) await yieldToMain();
    }
    let meta: Record<string, unknown> = {};
    if (wantMeta) {
      try {
        meta = (await doc.getMetadata()).info ?? {};
      } catch {
        meta = {};
      }
    }
    return { pageCount: total, pages, sizes, lineCount, emptyPages, meta };
  });
}

const PAPER: ReadonlyArray<readonly [string, number, number]> = [
  ['A3', 841.89, 1190.55],
  ['A4', 595.28, 841.89],
  ['A5', 419.53, 595.28],
  ['Letter', 612, 792],
  ['Legal', 612, 1008],
  ['Tabloid', 792, 1224],
];

function sizeLabel(w: number, h: number): string {
  const portrait = w <= h;
  const [s, l] = portrait ? [w, h] : [h, w];
  const dims = `${Math.round(w)} x ${Math.round(h)} pt`;
  for (const [name, pw, ph] of PAPER) {
    if (Math.abs(s - pw) <= 3 && Math.abs(l - ph) <= 3) return `${name} ${portrait ? 'portrait' : 'landscape'} (${dims})`;
  }
  return `custom ${portrait ? 'portrait' : 'landscape'} (${dims})`;
}

function describeSizes(sizes: PageSize[]): string {
  if (sizes.length === 0) return 'no pages';
  const counts = new Map<string, number>();
  for (const s of sizes) {
    const k = sizeLabel(s.w, s.h);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].map(([k, n]) => `${n} x ${k}`).join('; ');
}

function formatPdfDate(v: string): string {
  const m = /^D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?(?:([Zz+-])(\d{2})?'?(\d{2})?'?)?/.exec(v);
  if (!m) return v;
  const [, y, mo = '01', d = '01', h = '00', mi = '00', s = '00', sign, oh = '00', om = '00'] = m;
  const tz = !sign ? '' : sign === 'Z' || sign === 'z' ? ' UTC' : ` ${sign}${oh}:${om}`;
  return `${y}-${mo}-${d} ${h}:${mi}:${s}${tz}`;
}

const META_FIELDS: ReadonlyArray<readonly [string, string, boolean]> = [
  ['Title', 'Title', false],
  ['Author', 'Author', false],
  ['Subject', 'Subject', false],
  ['Keywords', 'Keywords', false],
  ['Creator', 'Creator application', false],
  ['Producer', 'PDF producer', false],
  ['CreationDate', 'Created', true],
  ['ModDate', 'Modified', true],
  ['PDFFormatVersion', 'PDF version', false],
  ['IsAcroFormPresent', 'Has form fields', false],
  ['IsXFAPresent', 'Has XFA forms', false],
  ['IsLinearized', 'Fast web view (linearized)', false],
];

function metaValue(meta: Record<string, unknown>, key: string, isDate: boolean): string {
  const v = meta[key];
  if (v === undefined || v === null || v === '') return '(not set)';
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  const s = String(v).trim();
  if (!s) return '(not set)';
  return isDate ? formatPdfDate(s) : s;
}

/* ------------------------------------------------------------------ */
/* Font listing (pdf-lib dictionaries) - shared by two handlers */
/* ------------------------------------------------------------------ */

type FontFileKey = 'FontFile' | 'FontFile2' | 'FontFile3';

interface FontInfo {
  baseName: string;
  displayName: string;
  subset: boolean;
  subtype: string;
  descendant: string;
  encoding: string;
  embedded: boolean;
  fileKey: FontFileKey | null;
  fileSubtype: string;
  stream: PDFRawStream | null;
}

function decodeName(s: string): string {
  return s.replace(/^\//, '').replace(/#([0-9A-Fa-f]{2})/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));
}

async function listFonts(doc: PDFDocument): Promise<FontInfo[]> {
  const lib = await import('pdf-lib');
  const { PDFName, PDFDict, PDFArray, PDFRawStream: RawStream } = lib;
  const nameOf = (v: unknown): string => (v instanceof PDFName ? decodeName(v.asString()) : '');
  const found = new Map<string, FontInfo>();
  const streamIds = new Map<object, number>();
  const VALID = new Set(['Type1', 'MMType1', 'TrueType', 'Type0', 'Type3']);

  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFDict)) continue;
    if (nameOf(obj.lookup(PDFName.of('Type'))) !== 'Font') continue;
    const subtype = nameOf(obj.lookup(PDFName.of('Subtype')));
    if (!VALID.has(subtype)) continue;

    let descriptor: unknown;
    let descendant = '';
    if (subtype === 'Type0') {
      const arr = obj.lookup(PDFName.of('DescendantFonts'));
      const first = arr instanceof PDFArray ? arr.lookup(0) : undefined;
      if (first instanceof PDFDict) {
        descendant = nameOf(first.lookup(PDFName.of('Subtype')));
        descriptor = first.lookup(PDFName.of('FontDescriptor'));
      }
    } else {
      descriptor = obj.lookup(PDFName.of('FontDescriptor'));
    }

    let baseName = nameOf(obj.lookup(PDFName.of('BaseFont')));
    if (!baseName && descriptor instanceof PDFDict) baseName = nameOf(descriptor.lookup(PDFName.of('FontName')));
    if (!baseName) baseName = '(unnamed)';

    const enc = obj.lookup(PDFName.of('Encoding'));
    let encoding = '';
    if (enc instanceof PDFName) encoding = decodeName(enc.asString());
    else if (enc instanceof PDFDict) {
      const base = nameOf(enc.lookup(PDFName.of('BaseEncoding')));
      encoding = (base || 'custom') + ' + Differences';
    }

    let stream: PDFRawStream | null = null;
    let fileKey: FontFileKey | null = null;
    let fileSubtype = '';
    if (descriptor instanceof PDFDict) {
      for (const key of ['FontFile', 'FontFile2', 'FontFile3'] as const) {
        const s = descriptor.lookup(PDFName.of(key));
        if (s instanceof RawStream) {
          stream = s;
          fileKey = key;
          fileSubtype = nameOf(s.dict.lookup(PDFName.of('Subtype')));
          break;
        }
      }
    }

    const subset = /^[A-Z]{6}\+/.test(baseName);
    const displayName = subset ? baseName.slice(7) : baseName;

    let dedupe: string;
    if (stream) {
      let id = streamIds.get(stream);
      if (id === undefined) {
        id = streamIds.size + 1;
        streamIds.set(stream, id);
      }
      dedupe = `stream#${id}`;
    } else {
      dedupe = `name#${baseName}|${subtype}|${encoding}`;
    }

    if (found.has(dedupe)) continue;
    found.set(dedupe, {
      baseName,
      displayName,
      subset,
      subtype,
      descendant,
      encoding,
      embedded: stream !== null || subtype === 'Type3',
      fileKey,
      fileSubtype,
      stream,
    });
  }
  return [...found.values()].sort((x, y) => x.displayName.localeCompare(y.displayName));
}

function fontTypeLabel(f: FontInfo): string {
  if (f.subtype === 'Type0') return `Type 0 / ${f.descendant || 'CID'}`;
  if (f.subtype === 'Type3') return 'Type 3 (glyphs drawn by PDF content)';
  return f.subtype;
}

function sniffFont(bytes: Uint8Array, key: FontFileKey, fileSubtype: string): { ext: string; label: string } {
  const tag = String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0);
  if (tag === 'OTTO') return { ext: 'otf', label: 'OpenType (CFF)' };
  if (tag === 'ttcf') return { ext: 'ttc', label: 'TrueType collection' };
  if (tag === 'true' || (bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0)) {
    return { ext: 'ttf', label: 'TrueType' };
  }
  if (key === 'FontFile2') return { ext: 'ttf', label: 'TrueType (subset fragment)' };
  if (key === 'FontFile3') {
    if (fileSubtype === 'OpenType') return { ext: 'otf', label: 'OpenType' };
    return { ext: 'cff', label: 'bare CFF (Compact Font Format)' };
  }
  if (bytes[0] === 0x80) return { ext: 'pfb', label: 'Type 1 (PFB)' };
  return { ext: 't1', label: 'raw Type 1 program' };
}

/* ------------------------------------------------------------------ */
/* compare-pdf */
/* ------------------------------------------------------------------ */

function fromNumber(n: number, spec: { min?: number; max?: number } | undefined): number {
  const min = spec?.min;
  const max = spec?.max;
  if (typeof min === 'number' && typeof max === 'number' && max > min) return clampNum((n - min) / (max - min), 0.05, 1);
  if (n <= 1) return clampNum(n, 0.05, 1);
  return clampNum(n / 100, 0.05, 1);
}

function sensitivityOf(options: OptionValues): number {
  const raw: unknown = (options as Record<string, unknown>)['sensitivity'];
  const spec = getTool('compare-pdf')?.options?.find((o) => o.key === 'sensitivity') as unknown as | { min?: number; max?: number } | undefined;
  if (typeof raw === 'string') {
    const s = raw.toLowerCase();
    if (/(low|loose|relax|coarse)/.test(s)) return 0.25;
    if (/(med|normal|balanc|default|standard)/.test(s)) return 0.5;
    if (/(high|strict|fine|sensitive|max)/.test(s)) return 0.85;
    const n = Number(s);
    return Number.isFinite(n) ? fromNumber(n, spec) : 0.5;
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) return fromNumber(raw, spec);
  return 0.5;
}

async function compareText(
  ctx: RunContext,
  fa: File,
  fb: File,
  bytesA: Uint8Array,
  bytesB: Uint8Array,
): Promise<ToolResult> {
  const a = await readDoc(fa, bytesA, ctx, 5, 45, 'Reading original', false);
  const b = await readDoc(fb, bytesB, ctx, 45, 85, 'Reading revised', false);
  if (a.lineCount === 0 && b.lineCount === 0) {
    throw new ToolError(
      'Neither file contains selectable text, so a text comparison is not possible. Use Visual mode, or run OCR PDF on both files first.',
      'unsupported',
    );
  }
  progress(ctx, 90, 'Comparing text');
  const diffs = diffDocuments(a.pages, b.pages);
  const s = summarize(diffs);
  const differs = s.changed + s.removed + s.added > 0;
  const summary: string[] = [
    `Original: ${fa.name} (${plural(a.pageCount, 'page')}, ${formatBytes(fa.size)})`,
    `Revised: ${fb.name} (${plural(b.pageCount, 'page')}, ${formatBytes(fb.size)})`,
    differs ? `Result: ${plural(s.changed, 'page')} changed, ${plural(s.removed, 'page')} only in the original, ${plural(s.added, 'page')} only in the revised file.` : 'Result: no text differences found.',
    `Lines: ${s.linesRemoved} removed, ${s.linesAdded} added. Identical pages: ${s.identical}.`,
  ];
  const lines: string[] = [
    'PDF TEXT COMPARISON',
    '===================',
    ...summary,
    '',
    'Legend: "-" line only in the original "+" line only in the revised file',
    '',
  ];
  if (!differs) {
    lines.push('Every page has the same text lines in both files.');
  } else {
    for (const d of diffs) lines.push(...renderPageDiff(d, 'original', 'revised'));
  }
  lines.push(
    '',
    'Limits: this compares text lines, not images or layout. A re-flowed paragraph shows as changed even when the words are the same. ' +
      'Use Visual mode to catch image, colour and layout changes. Nothing was uploaded; the comparison ran in your browser.',
  );
  const notes: string[] = [];
  if (a.lineCount === 0 || b.lineCount === 0) {
    notes.push(
      `${a.lineCount === 0 ? 'The original' : 'The revised file'} has no selectable text (probably scanned), so everything in the other file shows as different.`,
    );
  }
  if (a.emptyPages > 0 || b.emptyPages > 0) {
    notes.push(`Pages without text: ${a.emptyPages} (original), ${b.emptyPages} (revised).`);
  }
  if (s.inexact > 0) notes.push(`${plural(s.inexact, 'page')} too large for a line-by-line diff and shown as fully replaced.`);
  progress(ctx, 97, 'Writing report');
  return {
    files: [textFile(`${shortStem(fa.name)}-vs-${shortStem(fb.name)}-text-diff.txt`, lines.join('\n'))],
    report: summary.join('\n'),
    note: notes.length ? notes.join(' ') : undefined,
  };
}

/* ---------------- visual ---------------- */

const MAX_VISUAL_PAGES = 300;
const VISUAL_SCALE = 1.25;

interface VisualRow {
  page: number;
  status: 'identical' | 'different' | 'only-original' | 'only-revised';
  changedPct: number;
  sizeNote: string;
}

function padCanvas(src: HTMLCanvasElement, w: number, h: number, mem: MemoryScope): HTMLCanvasElement {
  if (src.width === w && src.height === h) return src;
  const c = mem.canvas(w, h);
  const g = c.getContext('2d');
  if (!g) throw new ToolError('Could not create a drawing surface.', 'out-of-memory');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  g.drawImage(src, 0, 0);
  return c;
}

async function diffRenderedPages(
  pageA: AnyPage,
  pageB: AnyPage,
  ctx: RunContext,
  mem: MemoryScope,
  tol: number,
): Promise<{ changedPct: number; differs: boolean; sizeNote: string; blob: Blob | null }> {
  const vpA = pageA.getViewport({ scale: 1 });
  const vpB = pageB.getViewport({ scale: 1 });
  const sizeDiffers = Math.abs(vpA.width - vpB.width) > 1.5 || Math.abs(vpA.height - vpB.height) > 1.5;
  const sizeNote = sizeDiffers ? `page size differs: ${Math.round(vpA.width)}x${Math.round(vpA.height)} pt vs ${Math.round(vpB.width)}x${Math.round(vpB.height)} pt` : '';
  let ca: HTMLCanvasElement | null = null;
  let cb: HTMLCanvasElement | null = null;
  let ta: HTMLCanvasElement | null = null;
  let tb: HTMLCanvasElement | null = null;
  let oc: HTMLCanvasElement | null = null;
  try {
    ca = await renderToCanvas(pageA, mem, { scale: VISUAL_SCALE, signal: ctx.signal });
    cb = await renderToCanvas(pageB, mem, { scale: VISUAL_SCALE, signal: ctx.signal });
    const w = Math.max(ca.width, cb.width);
    const h = Math.max(ca.height, cb.height);
    const pa = padCanvas(ca, w, h, mem);
    if (pa !== ca) ta = pa;
    const pb = padCanvas(cb, w, h, mem);
    if (pb !== cb) tb = pb;
    const ga = pa.getContext('2d');
    const gb = pb.getContext('2d');
    if (!ga || !gb) throw new ToolError('Could not read the rendered pages.', 'out-of-memory');
    const A = ga.getImageData(0, 0, w, h).data;
    const B = gb.getImageData(0, 0, w, h).data;
    oc = mem.canvas(w, h);
    const go = oc.getContext('2d');
    if (!go) throw new ToolError('Could not create a drawing surface.', 'out-of-memory');
    const od = go.createImageData(w, h);
    const O = od.data;
    let changed = 0;
    for (let p = 0, len = A.length; p < len; p += 4) {
      const ar = A[p];
      const ag = A[p + 1];
      const ab = A[p + 2];
      const br = B[p];
      const bg = B[p + 1];
      const bb = B[p + 2];
      const d = Math.max(Math.abs(ar - br), Math.abs(ag - bg), Math.abs(ab - bb));
      if (d > tol) {
        changed++;
        if (ar + ag + ab < br + bg + bb) {
          O[p] = 229;
          O[p + 1] = 50;
          O[p + 2] = 45;
        } else {
          O[p] = 22;
          O[p + 1] = 163;
          O[p + 2] = 74;
        }
      } else {
        O[p] = 255 - (255 - br) * 0.3;
        O[p + 1] = 255 - (255 - bg) * 0.3;
        O[p + 2] = 255 - (255 - bb) * 0.3;
      }
      O[p + 3] = 255;
    }
    const total = w * h;
    const differs = changed > Math.max(25, total * 0.00005) || sizeDiffers;
    let blob: Blob | null = null;
    if (differs) {
      go.putImageData(od, 0, 0);
      blob = await canvasBlob(oc, 'image/png');
    }
    return { changedPct: (changed / total) * 100, differs, sizeNote, blob };
  } finally {
    for (const c of [ca, cb, ta, tb, oc]) if (c) mem.release(c);
  }
}

async function compareVisual(
  ctx: RunContext,
  mem: MemoryScope,
  fa: File,
  fb: File,
  bytesA: Uint8Array,
  bytesB: Uint8Array,
): Promise<ToolResult> {
  const tolerance = Math.round(6 + (1 - sensitivityOf(ctx.options)) * 70);
  const rows: VisualRow[] = [];
  const images: ResultFile[] = [];
  let pagesA = 0;
  let pagesB = 0;
  let compared = 0;
  const nameA = shortStem(fa.name);
  const nameB = shortStem(fb.name);
  await withDoc(bytesA, fa.name, ctx.signal, async (docA) => {
    await withDoc(bytesB, fb.name, ctx.signal, async (docB) => {
      pagesA = docA.numPages;
      pagesB = docB.numPages;
      const total = Math.max(pagesA, pagesB);
      compared = Math.min(total, MAX_VISUAL_PAGES);
      const digits = String(compared).length;
      for (let i = 1; i <= compared; i++) {
        throwIfAborted(ctx.signal);
        const pageA = i <= pagesA ? await docA.getPage(i) : null;
        const pageB = i <= pagesB ? await docB.getPage(i) : null;
        try {
          if (pageA && pageB) {
            const r = await diffRenderedPages(pageA, pageB, ctx, mem, tolerance);
            rows.push({
              page: i,
              status: r.differs ? 'different' : 'identical',
              changedPct: r.changedPct,
              sizeNote: r.sizeNote,
            });
            if (r.blob) {
              images.push({
                name: `${nameA}-vs-${nameB}-diff-page-${pad(i, digits)}.png`,
                blob: r.blob,
                mime: 'image/png',
              });
            }
          } else {
            rows.push({
              page: i,
              status: pageA ? 'only-original' : 'only-revised',
              changedPct: 100,
              sizeNote: '',
            });
          }
        } finally {
          pageA?.cleanup();
          pageB?.cleanup();
        }
        progress(ctx, Math.round(5 + (88 * i) / compared), `Comparing page ${i} of ${compared}`);
        await yieldToMain();
      }
    });
  });
  const different = rows.filter((r) => r.status === 'different');
  const onlyA = rows.filter((r) => r.status === 'only-original');
  const onlyB = rows.filter((r) => r.status === 'only-revised');
  const anyDiff = different.length + onlyA.length + onlyB.length > 0;
  const summary: string[] = [
    `Original: ${fa.name} (${plural(pagesA, 'page')}, ${formatBytes(fa.size)})`,
    `Revised: ${fb.name} (${plural(pagesB, 'page')}, ${formatBytes(fb.size)})`,
    anyDiff ? `Result: ${plural(different.length, 'page')} differ visually, ${onlyA.length} only in the original, ${onlyB.length} only in the revised file.` : 'Result: no visual differences found.',
  ];
  const lines: string[] = [
    'PDF VISUAL COMPARISON',
    '=====================',
    ...summary,
    '',
    `Method: each page is rendered at ${VISUAL_SCALE}x and compared pixel by pixel (page N against page N). ` +
      `A pixel counts as changed when any colour channel differs by more than ${tolerance}/255.`,
    'Diff images: RED = content only in the original, GREEN = content only in the revised file, faded grey = unchanged.',
    '',
    'Page Status Changed pixels',
  ];
  for (const r of rows) {
    const status = r.status === 'different' ? 'DIFFERENT' : r.status === 'identical' ? 'identical' : r.status === 'only-original' ? 'only in original' : 'only in revised';
    const pct = r.status === 'only-original' || r.status === 'only-revised' ? '-' : `${r.changedPct.toFixed(2)}%`;
    lines.push(`${String(r.page).padEnd(7)}${status.padEnd(17)}${pct}${r.sizeNote ? ` (${r.sizeNote})` : ''}`);
  }
  lines.push(
    '',
    'Limits: pages are paired by number, so an inserted page makes every later page look different (use Text mode or Compare PDF Versions for page-aware alignment). ' +
      'Slight anti-aliasing differences between files are ignored according to the sensitivity setting. Nothing was uploaded.',
  );
  const notes: string[] = [];
  if (Math.max(pagesA, pagesB) > MAX_VISUAL_PAGES) {
    notes.push(`Only the first ${MAX_VISUAL_PAGES} pages were compared; later pages were not checked.`);
  }
  if (!anyDiff) notes.push('The files look identical when rendered. Invisible differences such as metadata or hidden text are not detected.');
  progress(ctx, 96, 'Writing report');
  return {
    files: [textFile(`${nameA}-vs-${nameB}-visual-summary.txt`, lines.join('\n')), ...images],
    report: summary.join('\n'),
    note: notes.length ? notes.join(' ') : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* compare-pdf-versions */
/* ------------------------------------------------------------------ */

function rangeList(nums: number[]): string {
  if (nums.length === 0) return '';
  const out: string[] = [];
  let s = nums[0];
  let p = nums[0];
  for (let i = 1; i <= nums.length; i++) {
    const n = nums[i];
    if (n === p + 1) {
      p = n;
      continue;
    }
    out.push(s === p ? String(s) : `${s}-${p}`);
    s = n;
    p = n;
  }
  return out.join(', ');
}

async function fontsOf(bytes: Uint8Array, name: string): Promise<{ fonts: FontInfo[]; error: string }> {
  try {
    const doc = await loadPdfLibDocument(bytes, { fileName: name });
    return { fonts: await listFonts(doc), error: '' };
  } catch (e) {
    return { fonts: [], error: e instanceof Error ? e.message : 'unknown error' };
  }
}

function fontKey(f: FontInfo): string {
  return `${f.displayName} [${f.subtype === 'Type0' ? 'Type0' : f.subtype}]`;
}

async function compareVersions(ctx: RunContext): Promise<ToolResult> {
  const [fa, fb] = ctx.files;
  const includeMeta = optFlag(ctx.options, 'includeMetadata', true);
  const bytesA = await readBytes(fa);
  const bytesB = await readBytes(fb);
  const a = await readDoc(fa, bytesA, ctx, 3, 40, 'Reading original', includeMeta);
  const b = await readDoc(fb, bytesB, ctx, 40, 78, 'Reading revised', includeMeta);
  progress(ctx, 80, 'Reading fonts');
  const fontsA = await fontsOf(bytesA, fa.name);
  throwIfAborted(ctx.signal);
  const fontsB = await fontsOf(bytesB, fb.name);
  progress(ctx, 88, 'Comparing');
  const diffs = diffDocuments(a.pages, b.pages);
  const ds = summarize(diffs);
  const textDiffers = ds.changed + ds.removed + ds.added > 0;

  const metaRows: string[] = [];
  let metaChanged = 0;
  if (includeMeta) {
    for (const [key, label, isDate] of META_FIELDS) {
      const va = metaValue(a.meta, key, isDate);
      const vb = metaValue(b.meta, key, isDate);
      const same = va === vb;
      if (!same) metaChanged++;
      metaRows.push(same ? ` ${label}: ${va}` : ` ${label}: CHANGED\n original: ${va}\n revised: ${vb}`);
    }
  }

  const common = Math.min(a.sizes.length, b.sizes.length);
  const sizeDiffPages: number[] = [];
  for (let i = 0; i < common; i++) {
    if (Math.abs(a.sizes[i].w - b.sizes[i].w) > 1.5 || Math.abs(a.sizes[i].h - b.sizes[i].h) > 1.5) sizeDiffPages.push(i + 1);
  }

  const setA = new Map(fontsA.fonts.map((f) => [fontKey(f), f]));
  const setB = new Map(fontsB.fonts.map((f) => [fontKey(f), f]));
  const fontsRemoved = [...setA.keys()].filter((k) => !setB.has(k));
  const fontsAdded = [...setB.keys()].filter((k) => !setA.has(k));
  const embeddingChanged = [...setA.keys()].filter((k) => setB.has(k) && setA.get(k)!.embedded !== setB.get(k)!.embedded);
  const fontsAvailable = !fontsA.error && !fontsB.error;
  const fontsDiffer = fontsRemoved.length + fontsAdded.length + embeddingChanged.length > 0;
  const pageCountDiffers = a.pageCount !== b.pageCount;
  const anything = metaChanged > 0 || pageCountDiffers || sizeDiffPages.length > 0 || fontsDiffer || textDiffers;

  const summary: string[] = [
    `Original: ${fa.name} (${plural(a.pageCount, 'page')}, ${formatBytes(fa.size)})`,
    `Revised: ${fb.name} (${plural(b.pageCount, 'page')}, ${formatBytes(fb.size)})`,
    anything ? 'Result: differences found.' : 'Result: no differences found in the checked areas.',
    `Page count: ${pageCountDiffers ? `CHANGED (${a.pageCount} -> ${b.pageCount})` : `same (${a.pageCount})`}`,
    `Page sizes: ${sizeDiffPages.length ? `${plural(sizeDiffPages.length, 'page')} differ` : 'same'}`,
    includeMeta ? `Properties: ${metaChanged ? `${plural(metaChanged, 'field')} changed` : 'same'}` : 'Properties: not compared',
    fontsAvailable ? `Fonts: ${fontsDiffer ? 'changed' : 'same'}` : 'Fonts: could not be read for one file',
    `Text: ${textDiffers ? `${plural(ds.changed, 'page')} changed, ${plural(ds.removed, 'page')} removed, ${plural(ds.added, 'page')} added (${ds.linesRemoved} lines removed, ${ds.linesAdded} added)` : 'same'}`,
  ];
  const L: string[] = ['PDF VERSION COMPARISON', '======================', ...summary, ''];
  if (includeMeta) {
    L.push('1. DOCUMENT PROPERTIES', '----------------------', ...metaRows, '');
  }
  L.push('2. PAGE COUNT AND SIZES', '-----------------------');
  L.push(` Original: ${plural(a.pageCount, 'page')} - ${describeSizes(a.sizes)}`);
  L.push(` Revised: ${plural(b.pageCount, 'page')} - ${describeSizes(b.sizes)}`);
  if (pageCountDiffers) L.push(` Page count changed by ${b.pageCount - a.pageCount > 0 ? '+' : ''}${b.pageCount - a.pageCount}.`);
  if (sizeDiffPages.length) L.push(` Pages (by number) whose size differs: ${rangeList(sizeDiffPages)}`);
  L.push('');
  L.push('3. FONTS', '--------');
  if (!fontsAvailable) {
    if (fontsA.error) L.push(` Original: could not list fonts (${fontsA.error})`);
    if (fontsB.error) L.push(` Revised: could not list fonts (${fontsB.error})`);
  } else {
    L.push(` Original: ${plural(fontsA.fonts.length, 'font')} Revised: ${plural(fontsB.fonts.length, 'font')}`);
    if (!fontsDiffer) L.push(' Same font names and embedding in both files.');
    for (const k of fontsRemoved) L.push(` - only in original: ${k}`);
    for (const k of fontsAdded) L.push(` + only in revised: ${k}`);
    for (const k of embeddingChanged) {
      L.push(` ~ embedding changed: ${k} (${setA.get(k)!.embedded ? 'embedded -> not embedded' : 'not embedded -> embedded'})`);
    }
    L.push(' (Subset prefixes such as ABCDEF+ are ignored when matching names.)');
  }
  L.push('');
  L.push('4. TEXT DIFFERENCES (page by page)', '----------------------------------');
  if (a.lineCount === 0 && b.lineCount === 0) {
    L.push(' Neither file has selectable text (scanned?). Run OCR PDF first, or use Compare PDF in Visual mode.');
  } else if (!textDiffers) {
    L.push(' Every page has the same text lines in both files.');
  } else {
    L.push(' Legend: "-" line only in the original, "+" line only in the revised file.', '');
    for (const d of diffs) L.push(...renderPageDiff(d, 'original', 'revised').map((x) => (x ? ` ${x}` : x)));
  }
  L.push(
    '',
    'Limits: images, vector graphics, colours and layout are not compared here - use Compare PDF in Visual mode for that. ' +
      'Text is compared line by line, so a re-flowed paragraph shows as changed. Nothing was uploaded; the comparison ran in your browser.',
  );
  const notes: string[] = [];
  if (a.lineCount === 0 || b.lineCount === 0) {
    notes.push(`${a.lineCount === 0 ? 'The original' : 'The revised file'} has no selectable text.`);
  }
  if (ds.inexact > 0) notes.push(`${plural(ds.inexact, 'page')} too large for a line-by-line diff and shown as fully replaced.`);
  progress(ctx, 97, 'Writing report');
  return {
    files: [textFile(`${shortStem(fa.name)}-vs-${shortStem(fb.name)}-version-report.txt`, L.join('\n'))],
    report: summary.join('\n'),
    note: notes.length ? notes.join(' ') : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* extract-images-pdf */
/* ------------------------------------------------------------------ */

const MAX_IMAGES = 1000;
const JPEG_QUALITY = 0.92;

interface RawImage {
  width: number;
  height: number;
  kind?: number;
  data?: Uint8Array | Uint8ClampedArray | null;
  bitmap?: ImageBitmap | null;
}

async function getImageObject(page: AnyPage, id: string): Promise<RawImage | null> {
  const store = id.startsWith('g_') ? page.commonObjs : page.objs;
  try {
    if (store.has(id)) return store.get(id) as RawImage;
  } catch {
    /* not resolved yet: fall through to the callback form */
  }
  return new Promise<RawImage | null>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 4000);
    try {
      store.get(id, (data: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve((data as RawImage) ?? null);
      });
    } catch {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }
  });
}

function fillImageData(dst: Uint8ClampedArray, img: RawImage, flatten: boolean): boolean {
  const { width: w, height: h } = img;
  const src = img.data;
  if (!src) return false;
  const n = w * h;
  const put = (p: number, r: number, g: number, b: number, a: number) => {
    if (flatten && a < 255) {
      const inv = 255 - a;
      r = (r * a + 255 * inv) / 255;
      g = (g * a + 255 * inv) / 255;
      b = (b * a + 255 * inv) / 255;
      a = 255;
    }
    dst[p] = r;
    dst[p + 1] = g;
    dst[p + 2] = b;
    dst[p + 3] = a;
  };
  if (img.kind === 1) {
    const rowBytes = (w + 7) >> 3;
    if (src.length < rowBytes * h) return false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const bit = (src[y * rowBytes + (x >> 3)] >> (7 - (x & 7))) & 1;
        const v = bit ? 255 : 0;
        put((y * w + x) * 4, v, v, v, 255);
      }
    }
    return true;
  }
  if (src.length >= n * 4 && (img.kind === 3 || src.length === n * 4)) {
    for (let i = 0, p = 0; i < n; i++, p += 4) put(p, src[p], src[p + 1], src[p + 2], src[p + 3]);
    return true;
  }
  if (src.length >= n * 3 && (img.kind === 2 || src.length === n * 3)) {
    for (let i = 0, s = 0, p = 0; i < n; i++, s += 3, p += 4) put(p, src[s], src[s + 1], src[s + 2], 255);
    return true;
  }
  if (src.length === n) {
    for (let i = 0, p = 0; i < n; i++, p += 4) put(p, src[i], src[i], src[i], 255);
    return true;
  }
  return false;
}

async function imageToBlob(img: RawImage, format: 'png' | 'jpg', mem: MemoryScope): Promise<Blob | null> {
  const w = img.bitmap?.width ?? img.width;
  const h = img.bitmap?.height ?? img.height;
  const canvas = mem.canvas(w, h);
  try {
    const g = canvas.getContext('2d');
    if (!g) return null;
    if (img.bitmap) {
      if (format === 'jpg') {
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, w, h);
      }
      g.drawImage(img.bitmap, 0, 0, w, h);
    } else if (img.data) {
      const id = g.createImageData(w, h);
      if (!fillImageData(id.data, img, format === 'jpg')) return null;
      g.putImageData(id, 0, 0);
    } else {
      return null;
    }
    return await canvasBlob(canvas, format === 'jpg' ? 'image/jpeg' : 'image/png', JPEG_QUALITY);
  } finally {
    mem.release(canvas);
  }
}

async function extractImages(ctx: RunContext, mem: MemoryScope): Promise<ToolResult> {
  const file = ctx.files[0];
  const format: 'png' | 'jpg' = optStr(ctx.options, 'format', 'png') === 'jpg' ? 'jpg' : 'png';
  const minSize = Math.max(0, Math.floor(optNum(ctx.options, 'minSize', 50)));
  const bytes = await readBytes(file);
  const pdfjs = (await loadPdfJs()) as unknown as { OPS?: Record<string, number> };
  const OPS = pdfjs.OPS ?? {};
  const opImage = OPS.paintImageXObject ?? 85;
  const opRepeat = OPS.paintImageXObjectRepeat ?? 86;
  const opInline = OPS.paintInlineImageXObject ?? 87;
  const opMasks = new Set<number>([
    OPS.paintImageMaskXObject ?? 83,
    OPS.paintImageMaskXObjectGroup ?? 84,
    OPS.paintInlineImageXObjectGroup ?? 88,
  ]);
  const base = stem(file.name) || 'document';
  const ext = format === 'jpg' ? 'jpg' : 'png';
  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const out: ResultFile[] = [];
  const stats = { found: 0, small: 0, large: 0, masks: 0, undecodable: 0, capped: false };
  const globalSeen = new Set<string>();

  await withDoc(bytes, file.name, ctx.signal, async (doc) => {
    const total = doc.numPages;
    const digits = String(total).length;
    for (let p = 1; p <= total && !stats.capped; p++) {
      throwIfAborted(ctx.signal);
      const page = await doc.getPage(p);
      try {
        const ops = await page.getOperatorList();
        const seen = new Set<string>();
        let index = 0;
        for (let k = 0; k < ops.fnArray.length; k++) {
          const fn: number = ops.fnArray[k];
          let img: RawImage | null = null;
          if (fn === opImage || fn === opRepeat) {
            const id: unknown = ops.argsArray[k]?.[0];
            if (typeof id !== 'string' || seen.has(id)) continue;
            seen.add(id);
            if (id.startsWith('g_')) {
              if (globalSeen.has(id)) continue;
              globalSeen.add(id);
            }
            img = await getImageObject(page, id);
          } else if (fn === opInline) {
            img = (ops.argsArray[k]?.[0] as RawImage) ?? null;
          } else if (opMasks.has(fn)) {
            stats.masks++;
            continue;
          } else {
            continue;
          }
          stats.found++;
          if (!img || !(img.width > 0) || !(img.height > 0) || (!img.data && !img.bitmap)) {
            stats.undecodable++;
            continue;
          }
          if (Math.min(img.width, img.height) < minSize) {
            stats.small++;
            continue;
          }
          if (
            img.width * img.height > MAX_CANVAS_PIXELS ||
            img.width > MAX_CANVAS_DIMENSION ||
            img.height > MAX_CANVAS_DIMENSION
          ) {
            stats.large++;
            continue;
          }
          if (out.length >= MAX_IMAGES) {
            stats.capped = true;
            break;
          }
          const blob = await imageToBlob(img, format, mem);
          if (!blob) {
            stats.undecodable++;
            continue;
          }
          index++;
          out.push({ name: `${base}-p${pad(p, digits)}-img${pad(index, 2)}.${ext}`, blob, mime });
        }
      } finally {
        page.cleanup();
      }
      progress(ctx, Math.round(5 + (90 * p) / total), `Scanning page ${p} of ${total}`);
      await yieldToMain();
    }
  });

  if (out.length === 0) {
    const why: string[] = [];
    if (stats.small) why.push(`${plural(stats.small, 'image')} smaller than ${minSize}px`);
    if (stats.large) why.push(`${plural(stats.large, 'image')} too large for the browser to decode`);
    if (stats.masks) why.push(`${plural(stats.masks, 'stencil mask')} skipped`);
    if (stats.undecodable) why.push(`${plural(stats.undecodable, 'image')} could not be decoded`);
    throw new ToolError(
      `No images were extracted${why.length ? ` (${why.join(', ')})` : ''}. ` +
        (stats.small ? 'Try lowering the minimum size. ' : '') +
        'Pages that are scans are one big image each; text and vector drawings are not images.',
      'unsupported',
    );
  }

  const notes: string[] = [
    `Extracted ${plural(out.length, 'image')} as ${ext.toUpperCase()}, as decoded for display: transparency masks are applied and CMYK is converted to RGB. ` +
      (format === 'jpg' ? `All images are re-encoded at quality ${Math.round(JPEG_QUALITY * 100)}, with transparency flattened onto white.` : 'Images that were JPEGs inside the PDF are re-encoded as PNG, so files can be larger than the originals.'),
  ];
  if (stats.small) notes.push(`${plural(stats.small, 'image')} below ${minSize}px (shortest side) skipped.`);
  if (stats.large) notes.push(`${plural(stats.large, 'image')} too large for the browser skipped.`);
  if (stats.masks) notes.push(`${plural(stats.masks, 'stencil mask')} skipped.`);
  if (stats.undecodable) notes.push(`${plural(stats.undecodable, 'image')} could not be decoded.`);
  if (stats.capped) notes.push(`Stopped after ${MAX_IMAGES} images; later pages were not scanned.`);
  notes.push('An image repeated on several pages may appear more than once.');
  progress(ctx, 97, 'Finishing');
  return { files: out, note: notes.join(' ') };
}

/* ------------------------------------------------------------------ */
/* extract-fonts-pdf */
/* ------------------------------------------------------------------ */

async function extractFonts(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  const bytes = await readBytes(file);
  const wantReport = optFlag(ctx.options, 'includeReport', true);
  progress(ctx, 10, 'Reading font dictionaries');
  const doc = await loadPdfLibDocument(bytes, { fileName: file.name });
  const lib = await import('pdf-lib');
  const fonts = await listFonts(doc);
  throwIfAborted(ctx.signal);
  const base = stem(file.name) || 'document';
  const out: ResultFile[] = [];
  const report: string[] = [];
  const failures: string[] = [];
  const used = new Set<string>();
  let extracted = 0;
  let notEmbedded = 0;
  let type3 = 0;
  const digits = Math.max(2, String(fonts.length).length);

  for (let i = 0; i < fonts.length; i++) {
    throwIfAborted(ctx.signal);
    const f = fonts[i];
    const head = `${pad(i + 1, digits)}. ${f.displayName}`;
    const facts = [`Type: ${fontTypeLabel(f)}`];
    if (f.encoding) facts.push(`Encoding: ${f.encoding}`);
    let fileLine = '';
    if (f.subtype === 'Type3') {
      type3++;
      facts.push('Embedded: glyphs are drawn by PDF content (no font file)');
      fileLine = 'File: none (Type 3 fonts have no font program)';
    } else if (f.stream && f.fileKey) {
      facts.push(`Embedded: yes${f.subset ? ` (subset ${f.baseName.slice(0, 6)})` : ' (full font)'}`);
      try {
        const decoded = lib.decodePDFRawStream(f.stream).decode();
        const kind = sniffFont(decoded, f.fileKey, f.fileSubtype);
        const safe = f.displayName.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 60) || 'font';
        let name = `${pad(i + 1, digits)}-${safe}.${kind.ext}`;
        let n = 2;
        while (used.has(name)) name = `${pad(i + 1, digits)}-${safe}-${n++}.${kind.ext}`;
        used.add(name);
        out.push({
          name,
          blob: new Blob([decoded as unknown as BlobPart], { type: 'application/octet-stream' }),
          mime: 'application/octet-stream',
        });
        extracted++;
        fileLine = `File: ${name} - ${kind.label}, ${formatBytes(decoded.length)}`;
      } catch {
        failures.push(f.displayName);
        fileLine = 'File: embedded, but its stream could not be decoded';
      }
    } else {
      notEmbedded++;
      facts.push('Embedded: no (the viewer substitutes a font installed on the reader\'s device)');
      fileLine = 'File: none';
    }
    report.push(head, ` ${facts.join(' | ')}`, ` ${fileLine}`, '');
    progress(ctx, Math.round(15 + (75 * (i + 1)) / Math.max(1, fonts.length)), 'Extracting fonts');
  }

  const summary = [
    `File: ${file.name}`,
    `Fonts found: ${fonts.length} (${extracted} extracted, ${notEmbedded} not embedded, ${type3} Type 3)`,
  ];
  const reportText = [
    'PDF FONT REPORT',
    '===============',
    ...summary,
    '',
    ...(fonts.length ? report : ['No font dictionaries were found. The file may contain only images or vector drawings.', '']),
    'Notes:',
    '- Embedded fonts are usually SUBSETS: they contain only the glyphs this document uses.',
    '- Bare CFF (.cff) and subset TrueType files often lack tables an operating system needs; open them in a font editor (for example FontForge) to repair or convert.',
    '- Fonts are copyrighted. Extracting a font does not give you a licence to install, use or distribute it.',
    '- Nothing was uploaded; the file was read in your browser.',
  ].join('\n');

  const files: ResultFile[] = [...out];
  const forced = extracted === 0 && !wantReport;
  if (wantReport || forced) files.push(textFile(`${base}-fonts-report.txt`, reportText));

  const notes: string[] = [];
  if (extracted > 0) notes.push(`${plural(extracted, 'font file')} copied out of the PDF as embedded (subset fonts contain only the glyphs used).`);
  if (forced) notes.push('No font files could be extracted, so the report was included anyway.');
  if (notEmbedded > 0) notes.push(`${plural(notEmbedded, 'font')} not embedded in the PDF, so there is nothing to extract.`);
  if (failures.length) notes.push(`Could not decode: ${failures.join(', ')}.`);
  notes.push('Fonts are copyrighted; check the licence before using them.');
  progress(ctx, 97, 'Finishing');
  return { files, report: summary.join('\n'), note: notes.join(' ') };
}

/* ------------------------------------------------------------------ */
/* Handler map */
/* ------------------------------------------------------------------ */

export const handlers: HandlerMap = {
  'compare-pdf': async (ctx, mem) => {
    const [fa, fb] = ctx.files;
    const mode = optStr(ctx.options, 'mode', 'text') === 'visual' ? 'visual' : 'text';
    const bytesA = await readBytes(fa);
    const bytesB = await readBytes(fb);
    return mode === 'visual' ? compareVisual(ctx, mem, fa, fb, bytesA, bytesB) : compareText(ctx, fa, fb, bytesA, bytesB);
  },
  'compare-pdf-versions': async (ctx) => compareVersions(ctx),
  'extract-images-pdf': async (ctx, mem) => extractImages(ctx, mem),
  'extract-fonts-pdf': async (ctx) => extractFonts(ctx),
};

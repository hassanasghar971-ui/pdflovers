// src/lib/engine/from-pdf.ts
//
// PDF → other formats. Eight handlers:
//   pdf-to-jpg, pdf-to-png      pdf.js canvas render → image per page (ZIP when several)
//   pdf-to-txt                  shared extractTextLines/linesToText
//   pdf-to-rtf, pdf-to-word     layout-aware text → paragraphs (own RTF writer / `docx`)
//   pdf-to-excel                row/column heuristics → one sheet per page (SheetJS)
//   pdf-to-ppt                  page image per slide + extracted text in speaker notes
//   ocr-pdf                     tesseract.js → searchable PDF (or TXT)
//
// HONEST LIMITS (also surfaced as result notes where relevant):
//  * Text-based conversions (txt / rtf / word / excel) read the PDF's text layer.
//    Scanned PDFs have none — those tools throw a clear "run OCR first" error.
//  * Lines are rebuilt from glyph positions. Multi-column pages can interleave
//    columns, and text rotated more than ~27° (watermarks, vertical margin text)
//    is skipped and counted. Reading order is a heuristic, never guaranteed.
//  * Word/RTF keep headings (by font size), paragraphs, lists-as-text and column gaps
//    (as tab stops). They do NOT reproduce fonts, images, vector art, tables or columns.
//  * Excel table detection is a heuristic based on horizontal alignment of text.
//  * PPT slides are page pictures (not editable shapes); text lives in speaker notes.
//  * Password-protected PDFs: these tools have no password field, so pdf.js raises a
//    password error that normalizeError maps to a friendly message. Unlock first.
//  * OCR downloads the language model (~10–25 MB, cached by tesseract.js) from a CDN
//    on first use. Page images are never uploaded. Set NEXT_PUBLIC_TESSERACT_* to
//    self-host the worker, core and language data.

import { ToolError } from './types';
import type { HandlerMap, ResultFile, RunContext, ToolResult } from './types';
import {
  MAX_CANVAS_DIMENSION,
  MAX_CANVAS_PIXELS,
  MIME,
  canvasToBlob,
  extractTextLines,
  linesToText,
  parsePageList,
  renderPageToBlob,
  throwIfAborted,
  withPdfDocument,
  yieldToMain,
} from './shared';
import {
  allIndexes,
  bytesOf,
  clampNum,
  optNum,
  optStr,
  pad,
  progress,
  stem,
} from './handler-utils';
import type { MemoryScope } from '../memory';
import type { Paragraph as DocxParagraph, Tab as DocxTab } from 'docx';

/* -------------------------------------------------------------------------- */
/*  Small shared helpers                                                       */
/* -------------------------------------------------------------------------- */

const NO_TEXT_MESSAGE =
  'This PDF has no selectable text — it looks like a scan or an image-only file. Run it through OCR PDF first, then convert the result.';

/** Accepts 0–1 or 1–100 and returns a canvas quality between 0.1 and 1. */
function toQuality(v: number): number {
  return clampNum(v > 1 ? v / 100 : v, 0.1, 1);
}

/** Zero-based page indexes from the "pages" option; blank means every page. */
function pickPages(spec: string, total: number): number[] {
  const trimmed = spec.trim();
  if (!trimmed) return allIndexes(total);
  const idx = parsePageList(trimmed, total, { allowEmpty: false, dedupe: true });
  return idx.length ? idx : allIndexes(total);
}

/**
 * Iterates pages with guaranteed page.cleanup(), abort checks, progress and a
 * yield to the main thread between pages (keeps the UI responsive).
 */
async function eachPage<P extends { cleanup(): unknown }>(
  doc: { getPage(pageNumber: number): Promise<P> },
  indexes: number[],
  ctx: RunContext,
  cb: (page: P, index: number, pos: number) => Promise<void>,
  range: readonly [number, number],
  label: string,
): Promise<void> {
  const [from, to] = range;
  for (let pos = 0; pos < indexes.length; pos++) {
    throwIfAborted(ctx.signal);
    const index = indexes[pos];
    const page = await doc.getPage(index + 1);
    try {
      await cb(page, index, pos);
    } finally {
      page.cleanup();
    }
    progress(
      ctx,
      from + ((to - from) * (pos + 1)) / indexes.length,
      `${label} ${pos + 1} of ${indexes.length}`,
    );
    await yieldToMain();
  }
}

/** Strips characters that are illegal in XML/RTF output and lone surrogates. */
function clean(s: string): string {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ToolError('Could not read a rendered page image.', 'internal'));
    reader.onload = () => {
      const url = String(reader.result ?? '');
      resolve(url.slice(url.indexOf(',') + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/* -------------------------------------------------------------------------- */
/*  1 & 2 — PDF → JPG / PNG                                                    */
/* -------------------------------------------------------------------------- */

async function exportImages(
  ctx: RunContext,
  mem: MemoryScope,
  type: 'image/jpeg' | 'image/png',
  ext: 'jpg' | 'png',
): Promise<ToolResult> {
  const file = ctx.files[0];
  const scale = clampNum(Number(optStr(ctx.options, 'scale', '2')) || 2, 1, 4);
  const quality = type === 'image/jpeg' ? toQuality(optNum(ctx.options, 'quality', 85)) : undefined;
  const base = stem(file.name);
  const files: ResultFile[] = [];
  let downscaled = false;

  progress(ctx, 3, 'Opening PDF…');
  const bytes = await bytesOf(file);

  await withPdfDocument(
    bytes,
    async (doc) => {
      const total = doc.numPages;
      const indexes = pickPages(optStr(ctx.options, 'pages', ''), total);
      const width = String(total).length;
      await eachPage(
        doc,
        indexes,
        ctx,
        async (page, index) => {
          const r = await renderPageToBlob(page, mem, { type, quality, scale });
          if (r.width < r.pageWidth * scale * 0.98) downscaled = true;
          files.push({
            name: `${base}-page-${pad(index + 1, width)}.${ext}`,
            blob: r.blob,
            mime: type === 'image/jpeg' ? MIME.jpg : MIME.png,
          });
        },
        [5, 98],
        'Rendering page',
      );
    },
    { signal: ctx.signal, fileName: file.name },
  );

  if (!files.length) throw new ToolError('No pages were selected.', 'invalid-input');
  return {
    files,
    note: downscaled
      ? 'Some large pages were rendered at a lower scale to stay within browser canvas limits.'
      : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*  3 — PDF → TXT                                                              */
/* -------------------------------------------------------------------------- */

async function pdfToTxt(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  progress(ctx, 3, 'Opening PDF…');
  const bytes = await bytesOf(file);

  const parts = await withPdfDocument(
    bytes,
    async (doc) => {
      const out: string[] = [];
      await eachPage(
        doc,
        allIndexes(doc.numPages),
        ctx,
        async (page) => {
          const lines = await extractTextLines(page);
          out.push(linesToText(lines, { paragraphs: true }));
        },
        [5, 95],
        'Extracting page',
      );
      return out;
    },
    { signal: ctx.signal, fileName: file.name },
  );

  const empty = parts.filter((p) => !p.trim()).length;
  if (empty === parts.length) throw new ToolError(NO_TEXT_MESSAGE, 'unsupported');

  // Pages are separated by a form feed (the pdftotext convention); txt-to-pdf honours it.
  const text = parts.join('\n\f');
  return {
    files: [
      {
        name: `${stem(file.name)}.txt`,
        blob: new Blob([text], { type: 'text/plain;charset=utf-8' }),
        mime: MIME.txt,
      },
    ],
    note:
      empty > 0
        ? `${empty} page${empty === 1 ? '' : 's'} had no selectable text and ${empty === 1 ? 'is' : 'are'} empty in the output.`
        : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*  Layout-aware text reader (used by RTF, Word, Excel, PPT notes)             */
/* -------------------------------------------------------------------------- */

interface TextPageLike {
  getViewport(p: { scale: number }): { transform: number[]; width: number; height: number };
  getTextContent(): Promise<{ items: unknown[] }>;
  cleanup(): unknown;
}
interface TextDocLike {
  numPages: number;
  getPage(n: number): Promise<TextPageLike>;
}
interface RawItem {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
}
interface Frag {
  str: string;
  x: number;
  y: number;
  w: number;
  size: number;
}
interface Cell {
  text: string;
  x: number;
  right: number;
}
interface DocLine {
  y: number;
  x: number;
  right: number;
  size: number;
  cells: Cell[];
  /** Cells joined with tab characters. */
  text: string;
}
interface PageText {
  index: number;
  width: number;
  height: number;
  lines: DocLine[];
  skipped: number;
}
interface ReadDoc {
  pages: PageText[];
  bodySize: number;
  firstW: number;
  firstH: number;
  skipped: number;
  emptyPages: number;
}

/** pdf.js Util.transform: result applies m2 first, then m1. */
function mul(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

async function readPageText(page: TextPageLike, index: number): Promise<PageText> {
  // The viewport transform folds in the page's /Rotate and flips Y, so lines come out
  // top-to-bottom in *visual* order even for rotated pages.
  const vp = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const frags: Frag[] = [];
  let skipped = 0;

  for (const raw of content.items as RawItem[]) {
    if (typeof raw.str !== 'string' || !raw.transform || raw.transform.length < 6) continue;
    if (!raw.str.trim()) continue; // spacing is re-derived from gaps below
    const m = mul(vp.transform, raw.transform);
    if (Math.abs(m[1]) > Math.abs(m[0]) * 0.5) {
      skipped++;
      continue;
    }
    frags.push({
      str: raw.str,
      x: m[4],
      y: m[5],
      w: Math.abs(raw.width ?? 0),
      size: Math.hypot(m[2], m[3]) || Math.abs(raw.height ?? 0) || 10,
    });
  }

  frags.sort((a, b) => a.y - b.y || a.x - b.x);

  // 1) cluster fragments into visual rows by baseline
  const rows: { items: Frag[]; sumY: number }[] = [];
  for (const f of frags) {
    const row = rows[rows.length - 1];
    if (row) {
      const tol = Math.max(1.5, Math.min(f.size, row.items[0].size) * 0.4);
      if (Math.abs(f.y - row.sumY / row.items.length) <= tol) {
        row.items.push(f);
        row.sumY += f.y;
        continue;
      }
    }
    rows.push({ items: [f], sumY: f.y });
  }

  // 2) split each row into cells at wide horizontal gaps
  const lines: DocLine[] = [];
  for (const row of rows) {
    const items = row.items.slice().sort((a, b) => a.x - b.x);
    const cells: Cell[] = [];
    let cur: Cell | null = null;
    let prevRight = 0;
    let prev: Frag | null = null;
    let longest = items[0];

    for (const f of items) {
      if (f.str.length > longest.str.length) longest = f;
      // faux-bold: the same text drawn twice with a tiny offset
      if (prev && prev.str === f.str && Math.abs(prev.x - f.x) < f.size * 0.15) continue;
      const gap = f.x - prevRight;
      const size = Math.max(f.size, 1);
      if (cur && gap <= size * 1.6) {
        const needSpace = gap > size * 0.12 && !/\s$/.test(cur.text) && !/^\s/.test(f.str);
        cur.text += (needSpace ? ' ' : '') + f.str;
        cur.right = f.x + f.w;
      } else {
        cur = { text: f.str, x: f.x, right: f.x + f.w };
        cells.push(cur);
      }
      prevRight = f.x + f.w;
      prev = f;
    }
    for (const c of cells) c.text = clean(c.text).trim();
    const kept = cells.filter((c) => c.text);
    if (!kept.length) continue;
    lines.push({
      y: row.sumY / row.items.length,
      x: kept[0].x,
      right: kept[kept.length - 1].right,
      size: longest.size,
      cells: kept,
      text: kept.map((c) => c.text).join('\t'),
    });
  }

  return { index, width: vp.width, height: vp.height, lines, skipped };
}

async function readDocument(ctx: RunContext, file: File): Promise<ReadDoc> {
  progress(ctx, 3, 'Opening PDF…');
  const bytes = await bytesOf(file);

  const pages = await withPdfDocument(
    bytes,
    async (doc) => {
      const d = doc as unknown as TextDocLike;
      const out: PageText[] = [];
      await eachPage(
        d,
        allIndexes(d.numPages),
        ctx,
        async (page, index) => {
          out.push(await readPageText(page, index));
        },
        [5, 90],
        'Reading page',
      );
      return out;
    },
    { signal: ctx.signal, fileName: file.name },
  );

  // Body size = the most common font size, weighted by amount of text.
  const hist = new Map<number, number>();
  let chars = 0;
  for (const p of pages) {
    for (const l of p.lines) {
      const key = Math.round(l.size * 2) / 2;
      hist.set(key, (hist.get(key) ?? 0) + l.text.length);
      chars += l.text.length;
    }
  }
  if (chars === 0) throw new ToolError(NO_TEXT_MESSAGE, 'unsupported');
  let bodySize = 11;
  let best = -1;
  for (const [size, weight] of hist) {
    if (weight > best) {
      best = weight;
      bodySize = size;
    }
  }

  return {
    pages,
    bodySize: clampNum(bodySize, 6, 28),
    firstW: pages[0]?.width ?? 595,
    firstH: pages[0]?.height ?? 842,
    skipped: pages.reduce((n, p) => n + p.skipped, 0),
    emptyPages: pages.filter((p) => p.lines.length === 0).length,
  };
}

/* ---- lines → paragraphs ---- */

interface Para {
  text: string;
  size: number;
  heading: 0 | 1 | 2 | 3;
  tabbed: boolean;
}

const LIST_START = /^\s*(?:[•●▪◦‣▫■□–—*]\s?|-\s|\(?\d{1,3}[.)]\s)/;
const TERMINAL = /[.!?:;”")\]]\s*$/;

function headingLevel(size: number, body: number, textLength: number): 0 | 1 | 2 | 3 {
  if (textLength > 120) return 0;
  const ratio = size / body;
  if (ratio >= 1.7) return 1;
  if (ratio >= 1.35) return 2;
  if (ratio >= 1.15) return 3;
  return 0;
}

function buildParagraphs(lines: DocLine[], body: number): Para[] {
  if (!lines.length) return [];
  const minX = Math.min(...lines.map((l) => l.x));
  const maxRight = Math.max(...lines.map((l) => l.right));
  const shortLimit = minX + (maxRight - minX) * 0.72;

  const out: Para[] = [];
  let cur: Para | null = null;
  let prev: DocLine | null = null;

  for (const line of lines) {
    const level = headingLevel(line.size, body, line.text.length);
    const multi = line.cells.length > 1;
    let breakHere = !cur || !prev;

    if (cur && prev && !breakHere) {
      const gap = line.y - prev.y;
      const prevShort = prev.right < shortLimit;
      breakHere =
        gap > Math.max(prev.size, line.size) * 1.65 ||
        level !== cur.heading ||
        multi ||
        cur.tabbed ||
        LIST_START.test(line.text) ||
        (prevShort && TERMINAL.test(cur.text));
    }

    if (breakHere || !cur) {
      cur = { text: line.text, size: line.size, heading: level, tabbed: multi };
      out.push(cur);
    } else if (/[A-Za-zÀ-ÿ]-$/.test(cur.text) && /^[a-zà-ÿ]/.test(line.text)) {
      // de-hyphenate a word broken across lines (a genuine hyphen here would be lost)
      cur.text = cur.text.slice(0, -1) + line.text;
    } else {
      cur.text += ' ' + line.text;
    }
    prev = line;
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*  4 — PDF → RTF                                                              */
/* -------------------------------------------------------------------------- */

function rtfEscape(s: string): string {
  const u16 = (n: number) => (n > 32767 ? n - 65536 : n);
  let out = '';
  for (const ch of clean(s)) {
    const cp = ch.codePointAt(0) ?? 0;
    if (ch === '\\') out += '\\\\';
    else if (ch === '{') out += '\\{';
    else if (ch === '}') out += '\\}';
    else if (ch === '\t') out += '\\tab ';
    else if (cp < 0x20) continue;
    else if (cp < 0x80) out += ch;
    else if (cp <= 0xffff) out += `\\u${u16(cp)}?`;
    else {
      const c = cp - 0x10000;
      out += `\\u${u16(0xd800 + (c >> 10))}?\\u${u16(0xdc00 + (c & 0x3ff))}?`;
    }
  }
  return out;
}

function buildRtf(read: ReadDoc): string {
  const tw = (pt: number) => Math.round(pt * 20);
  const landscape = read.firstW > read.firstH;
  const paperW = tw(Math.min(read.firstW, read.firstH));
  const paperH = tw(Math.max(read.firstW, read.firstH));
  const bodyHalf = Math.round(clampNum(read.bodySize, 8, 14) * 2);

  let rtf =
    '{\\rtf1\\ansi\\ansicpg1252\\deff0\\uc1' +
    '{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}}' +
    `\\paperw${landscape ? paperH : paperW}\\paperh${landscape ? paperW : paperH}` +
    (landscape ? '\\landscape' : '') +
    '\\margl1080\\margr1080\\margt1080\\margb1080\\viewkind4' +
    `\\f0\\fs${bodyHalf}\n`;

  let emitted = 0;
  for (const page of read.pages) {
    const paras = buildParagraphs(page.lines, read.bodySize);
    if (!paras.length) continue;
    paras.forEach((p, i) => {
      const pageBreak = i === 0 && emitted > 0 ? '\\pagebb' : '';
      if (p.heading) {
        const half = Math.min(72, Math.round(p.size * 2));
        rtf += `\\pard${pageBreak}\\sb120\\sa120{\\b\\fs${half} ${rtfEscape(p.text)}}\\par\n`;
      } else {
        rtf += `\\pard${pageBreak}\\sa120 ${rtfEscape(p.text)}\\par\n`;
      }
    });
    emitted++;
  }
  return rtf + '}';
}

async function pdfToRtf(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  const read = await readDocument(ctx, file);
  progress(ctx, 94, 'Writing RTF…');
  const rtf = buildRtf(read);
  return {
    files: [
      {
        name: `${stem(file.name)}.rtf`,
        blob: new Blob([rtf], { type: 'application/rtf' }),
        mime: MIME.rtf,
      },
    ],
    note: layoutNote(read, 'RTF'),
  };
}

function layoutNote(read: ReadDoc, format: string): string {
  const bits = [
    `Text-only ${format}: headings, paragraphs and column gaps are kept; images, tables, multi-column layout and original fonts are not reproduced.`,
  ];
  if (read.emptyPages) {
    bits.push(`${read.emptyPages} page${read.emptyPages === 1 ? '' : 's'} had no selectable text.`);
  }
  if (read.skipped) {
    bits.push(`${read.skipped} rotated text fragment${read.skipped === 1 ? '' : 's'} (watermarks or vertical text) skipped.`);
  }
  return bits.join(' ');
}

/* -------------------------------------------------------------------------- */
/*  5 — PDF → Word (.docx)                                                     */
/* -------------------------------------------------------------------------- */

async function buildDocx(read: ReadDoc, title: string): Promise<Blob> {
  const d = await import('docx');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Tab, PageOrientation } = d;

  const twips = (pt: number) => Math.round(pt * 20);
  const a = twips(read.firstW);
  const b = twips(read.firstH);
  // docx swaps width/height itself when orientation is landscape, so pass portrait dims.
  const landscape = a > b;
  const headings = [
    undefined,
    HeadingLevel.HEADING_1,
    HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3,
  ] as const;

  const runChildren = (text: string): Array<string | DocxTab> => {
    const parts = clean(text).split('\t');
    const out: Array<string | DocxTab> = [];
    parts.forEach((part, i) => {
      if (i > 0) out.push(new Tab());
      out.push(part);
    });
    return out;
  };

  const children: DocxParagraph[] = [];
  let emitted = 0;
  for (const page of read.pages) {
    const paras = buildParagraphs(page.lines, read.bodySize);
    if (!paras.length) continue;
    paras.forEach((p, i) => {
      children.push(
        new Paragraph({
          heading: p.heading ? headings[p.heading] : undefined,
          pageBreakBefore: i === 0 && emitted > 0,
          spacing: { after: 120 },
          children: [new TextRun({ children: runChildren(p.text) })],
        }),
      );
    });
    emitted++;
  }

  const document = new Document({
    creator: 'PDF Lovers Pro',
    title,
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: Math.round(clampNum(read.bodySize, 8, 14) * 2) },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: Math.min(a, b),
              height: Math.max(a, b),
              orientation: landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
            },
            margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
          },
        },
        children,
      },
    ],
  });
  return Packer.toBlob(document);
}

async function pdfToWord(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  const read = await readDocument(ctx, file);
  progress(ctx, 94, 'Building Word document…');
  const blob = await buildDocx(read, stem(file.name));
  return {
    files: [{ name: `${stem(file.name)}.docx`, blob, mime: MIME.docx }],
    note: layoutNote(read, 'Word file'),
  };
}

/* -------------------------------------------------------------------------- */
/*  6 — PDF → Excel                                                            */
/* -------------------------------------------------------------------------- */

const MAX_SHEETS = 150;

function toCellValue(text: string): string | number {
  const t = text.trim();
  const digits = t.replace(/\D/g, '').length;
  if (digits > 15) return t; // would lose precision as a double
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(t)) return Number(t);
  if (/^-?[1-9]\d{0,2}(?:,\d{3})+(?:\.\d+)?$/.test(t)) return Number(t.replace(/,/g, ''));
  return t; // keeps leading zeros, phone numbers, currency, percentages as text
}

/**
 * Column detection: take every cell from rows that have 2+ cells, merge horizontally
 * overlapping spans into columns (right-aligned numbers overlap their header, so they
 * land in the same column), then map each cell to the column it overlaps most.
 * Cells overlapping 2+ columns (titles, long text) go to the first column they touch.
 */
function sheetRows(lines: DocLine[]): { rows: (string | number)[][]; tableLike: boolean } {
  const multi = lines.filter((l) => l.cells.length > 1);
  if (multi.length < 2) {
    return { rows: lines.map((l) => [l.cells.map((c) => c.text).join(' ')]), tableLike: false };
  }

  const spans = multi
    .flatMap((l) => l.cells)
    .map((c) => ({ x: c.x, r: c.right }))
    .sort((p, q) => p.x - q.x);
  const cols: { x0: number; x1: number }[] = [];
  for (const s of spans) {
    const last = cols[cols.length - 1];
    if (last && s.x < last.x1 - 1) last.x1 = Math.max(last.x1, s.r);
    else cols.push({ x0: s.x, x1: s.r });
  }

  const rows: (string | number)[][] = [];
  for (const line of lines) {
    const row: string[] = new Array(cols.length).fill('');
    for (const cell of line.cells) {
      const overlaps: number[] = [];
      let bestCol = -1;
      let bestOverlap = 0;
      cols.forEach((c, i) => {
        const o = Math.min(c.x1, cell.right) - Math.max(c.x0, cell.x);
        if (o > 0) overlaps.push(i);
        if (o > bestOverlap) {
          bestOverlap = o;
          bestCol = i;
        }
      });
      let target = bestCol;
      if (overlaps.length > 1) target = overlaps[0];
      if (target < 0) {
        // no overlap: nearest column starting at or before the cell
        target = 0;
        cols.forEach((c, i) => {
          if (c.x0 <= cell.x + 2) target = i;
        });
      }
      row[target] = row[target] ? `${row[target]} ${cell.text}` : cell.text;
    }
    rows.push(row.map(toCellValue));
  }
  return { rows, tableLike: true };
}

async function pdfToExcel(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  const read = await readDocument(ctx, file);
  progress(ctx, 92, 'Building workbook…');

  const mod = await import('xlsx');
  const X = ((mod as unknown as { default?: typeof mod }).default ?? mod) as typeof mod;
  const wb = X.utils.book_new();

  let sheets = 0;
  let tables = 0;
  let truncated = false;
  for (const page of read.pages) {
    if (!page.lines.length) continue;
    if (sheets >= MAX_SHEETS) {
      truncated = true;
      break;
    }
    const { rows, tableLike } = sheetRows(page.lines);
    if (tableLike) tables++;
    const ws = X.utils.aoa_to_sheet(rows);
    const colCount = rows.reduce((n, r) => Math.max(n, r.length), 0);
    ws['!cols'] = Array.from({ length: colCount }, (_, c) => ({
      wch: Math.min(60, rows.reduce((w, r) => Math.max(w, String(r[c] ?? '').length), 8) + 2),
    }));
    X.utils.book_append_sheet(wb, ws, `Page ${page.index + 1}`);
    sheets++;
  }
  if (!sheets) throw new ToolError(NO_TEXT_MESSAGE, 'unsupported');

  const out = X.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  const bits = [
    tables === 0
      ? 'No table-like alignment was detected, so text was placed one line per row in column A.'
      : `Table detection is a heuristic based on text alignment (${tables} of ${sheets} sheet${sheets === 1 ? '' : 's'} looked tabular) — check column boundaries, merged cells and numbers.`,
  ];
  if (truncated) bits.push(`Only the first ${MAX_SHEETS} pages with text were converted.`);
  if (read.skipped) bits.push(`${read.skipped} rotated text fragments were skipped.`);
  return {
    files: [
      {
        name: `${stem(file.name)}.xlsx`,
        blob: new Blob([out], { type: MIME.xlsx }),
        mime: MIME.xlsx,
      },
    ],
    note: bits.join(' '),
  };
}

/* -------------------------------------------------------------------------- */
/*  7 — PDF → PowerPoint                                                       */
/* -------------------------------------------------------------------------- */

const MAX_PPT_PAGES = 300;

interface PptxSlide {
  addImage(o: Record<string, unknown>): void;
  addNotes(text: string): void;
}
interface PptxDeck {
  layout: string;
  author: string;
  title: string;
  defineLayout(l: { name: string; width: number; height: number }): void;
  addSlide(): PptxSlide;
  write(o: { outputType: string; compression?: boolean }): Promise<unknown>;
}

async function pdfToPpt(ctx: RunContext, mem: MemoryScope): Promise<ToolResult> {
  const file = ctx.files[0];
  const scale = clampNum(Number(optStr(ctx.options, 'scale', '2')) || 2, 1, 3);

  progress(ctx, 3, 'Opening PDF…');
  const bytes = await bytesOf(file);

  const mod = (await import('pptxgenjs')) as unknown as { default?: unknown };
  const Ctor = (typeof mod.default === 'function' ? mod.default : mod) as new () => PptxDeck;
  const deck = new Ctor();
  deck.author = 'PDF Lovers Pro';
  deck.title = stem(file.name);

  let slides = 0;
  await withPdfDocument(
    bytes,
    async (doc) => {
      const total = doc.numPages;
      if (total > MAX_PPT_PAGES) {
        throw new ToolError(
          `This PDF has ${total} pages. PDF to PowerPoint keeps every page image in memory, so it is limited to ${MAX_PPT_PAGES} pages — split the PDF first.`,
          'out-of-memory',
        );
      }

      // One slide size for the whole deck, taken from page 1 (PowerPoint max is 56 in).
      const first = await doc.getPage(1);
      const vp = first.getViewport({ scale: 1 });
      first.cleanup();
      const layoutW = clampNum(vp.width / 72, 1, 56);
      const layoutH = clampNum(vp.height / 72, 1, 56);
      deck.defineLayout({ name: 'PDFPAGE', width: layoutW, height: layoutH });
      deck.layout = 'PDFPAGE';

      await eachPage(
        doc,
        allIndexes(total),
        ctx,
        async (page, index) => {
          const r = await renderPageToBlob(page, mem, { type: 'image/jpeg', quality: 0.85, scale });
          const data = await blobToBase64(r.blob);

          // contain-fit this page on the shared slide size
          const pw = r.pageWidth / 72;
          const ph = r.pageHeight / 72;
          const k = Math.min(layoutW / pw, layoutH / ph);
          const w = pw * k;
          const h = ph * k;

          const slide = deck.addSlide();
          slide.addImage({
            data: `image/jpeg;base64,${data}`,
            x: (layoutW - w) / 2,
            y: (layoutH - h) / 2,
            w,
            h,
          });

          const text = await readPageText(page as unknown as TextPageLike, index);
          const notes = text.lines.map((l) => l.text.replace(/\t/g, '  ')).join('\n');
          if (notes.trim()) slide.addNotes(clean(notes));
          slides++;
        },
        [5, 92],
        'Building slide',
      );
    },
    { signal: ctx.signal, fileName: file.name },
  );

  progress(ctx, 95, 'Packaging presentation…');
  const written = await deck.write({ outputType: 'blob', compression: true });
  const blob =
    written instanceof Blob
      ? written
      : new Blob([written as BlobPart], { type: MIME.pptx });

  return {
    files: [{ name: `${stem(file.name)}.pptx`, blob, mime: MIME.pptx }],
    note: `${slides} slide${slides === 1 ? '' : 's'} created. Each slide is a picture of the page (not editable shapes); the page's text is stored in the speaker notes. Scanned pages have no notes.`,
  };
}

/* -------------------------------------------------------------------------- */
/*  8 — OCR PDF                                                                */
/* -------------------------------------------------------------------------- */

interface OcrWorker {
  recognize(
    image: Blob,
    options: Record<string, unknown>,
    output: Record<string, boolean>,
  ): Promise<{ data: { text?: string; pdf?: number[] | null } }>;
  setParameters(p: Record<string, string>): Promise<unknown>;
  terminate(): Promise<unknown>;
}

function abortable<T>(p: Promise<T>, signal: AbortSignal | undefined, onAbort: () => void): Promise<T> {
  if (!signal) return p;
  return new Promise<T>((resolve, reject) => {
    const abort = () => {
      onAbort();
      reject(new ToolError('Cancelled.', 'aborted'));
    };
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    p.then(
      (v) => {
        signal.removeEventListener('abort', abort);
        resolve(v);
      },
      (e) => {
        signal.removeEventListener('abort', abort);
        reject(e);
      },
    );
  });
}

async function createOcrWorker(
  lang: string,
  onLog: (status: string, p: number) => void,
): Promise<OcrWorker> {
  const { createWorker } = await import('tesseract.js');
  const opts: NonNullable<Parameters<typeof createWorker>[2]> = {
    logger: (m: { status: string; progress: number }) => onLog(m.status, m.progress),
  };
  // Optional self-hosting (must be literal process.env.* so Next can inline them).
  const langPath = process.env.NEXT_PUBLIC_TESSERACT_LANG_PATH;
  const workerPath = process.env.NEXT_PUBLIC_TESSERACT_WORKER_PATH;
  const corePath = process.env.NEXT_PUBLIC_TESSERACT_CORE_PATH;
  if (langPath) opts.langPath = langPath;
  if (workerPath) opts.workerPath = workerPath;
  if (corePath) opts.corePath = corePath;
  return (await createWorker(lang, 1, opts)) as unknown as OcrWorker;
}

interface OcrImage {
  blob: Blob;
  pxPerPt: number;
  widthPt: number;
  heightPt: number;
}

/** Normalises a PNG/JPG (EXIF rotation, transparency) into a JPEG for OCR. */
async function prepareImage(file: File, mem: MemoryScope): Promise<OcrImage> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new ToolError(`"${file.name}" could not be read as an image.`, 'invalid-input');
  }
  mem.bitmap(bmp);
  const w = bmp.width;
  const h = bmp.height;
  const k = Math.min(1, Math.sqrt(MAX_CANVAS_PIXELS / (w * h)), MAX_CANVAS_DIMENSION / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * k));
  const ch = Math.max(1, Math.round(h * k));

  const canvas = mem.canvas(cw, ch);
  const g = canvas.getContext('2d');
  if (!g) throw new ToolError('Canvas is not available in this browser.', 'unsupported');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, cw, ch);
  g.drawImage(bmp, 0, 0, cw, ch);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  mem.release(canvas);
  mem.releaseBitmap(bmp);

  const ptPerPx = Math.min(0.75, 1440 / Math.max(cw, ch));
  return { blob, pxPerPt: 1 / ptPerPx, widthPt: cw * ptPerPx, heightPt: ch * ptPerPx };
}

async function ocrPdf(ctx: RunContext, mem: MemoryScope): Promise<ToolResult> {
  const file = ctx.files[0];
  const lang = optStr(ctx.options, 'language', 'eng');
  const wantPdf = optStr(ctx.options, 'outputMode', 'searchable-pdf') !== 'txt';
  const scale = clampNum(Number(optStr(ctx.options, 'scale', '2')) || 2, 1, 4);
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

  const state = { base: 15, span: 5 };
  progress(ctx, 3, 'Starting OCR engine…');
  const worker = await createOcrWorker(lang, (status, p) => {
    if (status === 'recognizing text') {
      progress(ctx, state.base + state.span * p, 'Recognizing text…');
    } else if (/load|initiali/i.test(status)) {
      progress(ctx, 4 + 10 * p, 'Loading OCR engine and language data…');
    }
  });

  let terminated = false;
  const terminate = async () => {
    if (terminated) return;
    terminated = true;
    try {
      await worker.terminate();
    } catch {
      /* worker already gone */
    }
  };
  mem.onDispose(terminate);

  const { PDFDocument } = await import('pdf-lib');
  const out = wantPdf ? await PDFDocument.create() : null;
  const texts: string[] = [];
  // Only request what we need: tesseract defaults also compute hOCR/TSV, which is slower.
  const output = { text: true, blocks: false, hocr: false, tsv: false, pdf: wantPdf };

  const recognizePage = async (img: Blob, pxPerPt: number, widthPt: number, heightPt: number) => {
    const dpi = clampNum(Math.round(72 * pxPerPt), 36, 1200);
    await worker.setParameters({ user_defined_dpi: String(dpi) });
    const { data } = await abortable(worker.recognize(img, {}, output), ctx.signal, () => {
      void terminate();
    });
    texts.push(data.text ?? '');
    if (out) {
      if (!data.pdf || !data.pdf.length) {
        throw new ToolError(
          'The OCR engine did not return a PDF text layer. Try the plain-text output mode.',
          'internal',
        );
      }
      const src = await PDFDocument.load(Uint8Array.from(data.pdf));
      const [copied] = await out.copyPages(src, [0]);
      // Normalise to the original page size so the page is not scaled by DPI guesses.
      const { width } = copied.getSize();
      if (width > 0 && Math.abs(width - widthPt) / widthPt > 0.01) {
        const k = widthPt / width;
        copied.scale(k, k);
      }
      out.addPage(copied);
    }
    void heightPt;
  };

  try {
    if (isPdf) {
      const bytes = await bytesOf(file);
      await withPdfDocument(
        bytes,
        async (doc) => {
          const total = doc.numPages;
          await eachPage(
            doc,
            allIndexes(total),
            ctx,
            async (page, _index, pos) => {
              state.base = 15 + (80 * pos) / total;
              state.span = 80 / total;
              const r = await renderPageToBlob(page, mem, {
                type: 'image/jpeg',
                quality: 0.85,
                scale,
              });
              await recognizePage(r.blob, r.width / r.pageWidth, r.pageWidth, r.pageHeight);
            },
            [15, 95],
            'Recognizing page',
          );
        },
        { signal: ctx.signal, fileName: file.name },
      );
    } else {
      state.base = 15;
      state.span = 80;
      const img = await prepareImage(file, mem);
      await recognizePage(img.blob, img.pxPerPt, img.widthPt, img.heightPt);
    }
  } finally {
    await terminate();
  }

  const recognized = texts.join('').trim().length;
  const emptyNote = recognized === 0 ? ' No text was recognized — check that the language matches the document.' : '';

  if (out) {
    out.setProducer('PDF Lovers Pro');
    out.setCreator('PDF Lovers Pro');
    progress(ctx, 97, 'Saving searchable PDF…');
    const saved = await out.save();
    return {
      files: [
        {
          name: `${stem(file.name)}-ocr.pdf`,
          blob: new Blob([saved as unknown as BlobPart], { type: MIME.pdf }),
          mime: MIME.pdf,
        },
      ],
      note:
        `Pages were rasterized at ${scale}× and an invisible text layer was added, so the output is image-based and may be larger than the original. ` +
        `OCR accuracy depends on scan quality; right-to-left scripts may need their text order checked.` +
        emptyNote,
    };
  }

  return {
    files: [
      {
        name: `${stem(file.name)}-ocr.txt`,
        blob: new Blob([texts.join('\n\f')], { type: 'text/plain;charset=utf-8' }),
        mime: MIME.txt,
      },
    ],
    note: `Recognized text is only as accurate as the scan. Right-to-left scripts may need their order checked.${emptyNote}`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Handler map                                                                */
/* -------------------------------------------------------------------------- */

export const handlers: HandlerMap = {
  'pdf-to-jpg': (ctx, mem) => exportImages(ctx, mem, 'image/jpeg', 'jpg'),
  'pdf-to-png': (ctx, mem) => exportImages(ctx, mem, 'image/png', 'png'),
  'pdf-to-txt': (ctx) => pdfToTxt(ctx),
  'pdf-to-rtf': (ctx) => pdfToRtf(ctx),
  'pdf-to-word': (ctx) => pdfToWord(ctx),
  'pdf-to-excel': (ctx) => pdfToExcel(ctx),
  'pdf-to-ppt': (ctx, mem) => pdfToPpt(ctx, mem),
  'ocr-pdf': (ctx, mem) => ocrPdf(ctx, mem),
};

// Text layout engine on top of pdf-lib.
//
// Fonts: pdf-lib's built-in fonts only cover WinAnsi (Latin-1 plus a few
// punctuation marks). When text outside that set is present we try to embed a
// TrueType font from /fonts/NotoSans-Regular.ttf (same origin) via fontkit.
// If that file is missing, unsupported characters are replaced with "?" and
// the count is exposed on FontSet.replaced so handlers can tell the user.
// The font file is NOT bundled: add it to /public/fonts yourself. Noto Sans
// covers Latin, Cyrillic, Greek and Vietnamese. For Arabic, Urdu or CJK, put a
// TTF that covers those scripts at the same path. Right-to-left ordering is not
// implemented here.

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PDFFont, PDFPage } from 'pdf-lib';
import { ToolError } from './types';
import { throwIfAborted, yieldToMain } from './shared';

export type FontFamily = 'helvetica' | 'times' | 'courier';
export type Align = 'left' | 'center' | 'right';
export const UNICODE_FONT_URL = '/fonts/NotoSans-Regular.ttf';

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  size?: number;
}
export interface ParaBlock {
  type: 'para';
  runs: Run[];
  align?: Align;
  indent?: number;
  bullet?: string;
  spaceBefore?: number;
  spaceAfter?: number;
  size?: number;
  bold?: boolean;
}
export interface TableBlock {
  type: 'table';
  rows: string[][];
  header?: boolean;
  fontSize?: number;
  /** Keep natural column widths and split wide tables into column bands (one band per page set). */
  bands?: boolean;
}
export interface ImageBlock {
  type: 'image';
  bytes: Uint8Array;
  kind: 'png' | 'jpeg';
}
export interface BreakBlock {
  type: 'pagebreak';
}
export type Block = ParaBlock | TableBlock | ImageBlock | BreakBlock;

export interface FontSet {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
  /** True when a Unicode TTF is in use (all four slots share it, so no bold/italic). */
  unicode: boolean;
  /** True when the text contained characters outside WinAnsi. */
  wantedUnicode: boolean;
  /** Characters replaced with "?" so far. */
  replaced: number;
  fix(text: string, count?: boolean): string;
}

/* ------------------------------- encoding ---------------------------- */

const WINANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152,
  0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
  0x0153, 0x017e, 0x0178,
]);

function isInvisible(c: number): boolean {
  return c === 0xad || (c >= 0x200b && c <= 0x200f) || (c >= 0x2028 && c <= 0x202e) || c === 0xfeff || c === 0x2060;
}
function isWinAnsi(c: number): boolean {
  return (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff) || WINANSI_EXTRA.has(c);
}

export function needsUnicode(text: string): boolean {
  for (const ch of text) {
    const c = ch.codePointAt(0) as number;
    if (c < 0x20 || c === 0x7f || isInvisible(c)) continue;
    if (!isWinAnsi(c)) return true;
  }
  return false;
}

function toWinAnsi(text: string, onReplace: (() => void) | null): string {
  let out = '';
  for (const ch of text) {
    const c = ch.codePointAt(0) as number;
    if (c === 10) out += '\n';
    else if (c === 9) out += '    ';
    else if (c < 0x20 || c === 0x7f || isInvisible(c)) continue;
    else if (c === 0xa0) out += ' ';
    else if (c === 0x2212) out += '-';
    else if (isWinAnsi(c)) out += ch;
    else {
      out += '?';
      if (onReplace) onReplace();
    }
  }
  return out;
}

async function fetchUnicodeFont(): Promise<Uint8Array | null> {
  try {
    const res = await fetch(UNICODE_FONT_URL, { cache: 'force-cache' });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length < 1000) return null;
    const tag = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    const ok = (bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0) || tag === 'true' || tag === 'OTTO';
    return ok ? bytes : null;
  } catch {
    return null;
  }
}

export async function createFonts(doc: PDFDocument, family: FontFamily, sample: string): Promise<FontSet> {
  const wanted = needsUnicode(sample);
  let uni: PDFFont | null = null;
  if (wanted) {
    const bytes = await fetchUnicodeFont();
    if (bytes) {
      try {
        const mod = await import('@pdf-lib/fontkit');
        const fk = ((mod as unknown as { default?: unknown }).default ?? mod) as Parameters<
          PDFDocument['registerFontkit']
        >[0];
        doc.registerFontkit(fk);
        uni = await doc.embedFont(bytes, { subset: true });
      } catch {
        uni = null;
      }
    }
  }

  let regular: PDFFont;
  let bold: PDFFont;
  let italic: PDFFont;
  let boldItalic: PDFFont;
  if (uni) {
    regular = bold = italic = boldItalic = uni;
  } else {
    const F = StandardFonts;
    const names =
      family === 'times'
        ? [F.TimesRoman, F.TimesRomanBold, F.TimesRomanItalic, F.TimesRomanBoldItalic]
        : family === 'courier'
          ? [F.Courier, F.CourierBold, F.CourierOblique, F.CourierBoldOblique]
          : [F.Helvetica, F.HelveticaBold, F.HelveticaOblique, F.HelveticaBoldOblique];
    regular = await doc.embedFont(names[0]);
    bold = await doc.embedFont(names[1]);
    italic = await doc.embedFont(names[2]);
    boldItalic = await doc.embedFont(names[3]);
  }

  const set: FontSet = {
    regular,
    bold,
    italic,
    boldItalic,
    unicode: uni !== null,
    wantedUnicode: wanted,
    replaced: 0,
    fix(text: string, count = true): string {
      if (uni) return text.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, (m) => (m === '\t' ? '    ' : ''));
      return toWinAnsi(text, count ? () => { set.replaced += 1; } : null);
    },
  };
  return set;
}

/** Human-readable sentence about font fallbacks, or '' when nothing notable happened. */
export function fontNote(fonts: FontSet): string {
  if (!fonts.wantedUnicode) return '';
  if (fonts.unicode) {
    return (
      ' Characters outside Latin-1 were drawn with the font at /fonts/NotoSans-Regular.ttf; bold and italic are not ' +
      'available in that case, and right-to-left scripts are not reordered. Glyphs missing from that font will show as blanks.'
    );
  }
  return (
    ` ${fonts.replaced} character${fonts.replaced === 1 ? '' : 's'} outside the Latin-1 range ` +
    'could not be drawn and were replaced with "?". To support more scripts, add a TrueType font that covers them at ' +
    'public/fonts/NotoSans-Regular.ttf.'
  );
}

export function pickFont(fonts: FontSet, bold: boolean, italic: boolean): PDFFont {
  if (bold && italic) return fonts.boldItalic;
  if (bold) return fonts.bold;
  if (italic) return fonts.italic;
  return fonts.regular;
}

export function blocksText(blocks: Block[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.type === 'para') {
      for (const r of b.runs) parts.push(r.text);
      if (b.bullet) parts.push(b.bullet);
    } else if (b.type === 'table') {
      for (const row of b.rows) for (const cell of row) parts.push(cell);
    }
  }
  return parts.join('\n');
}

/* -------------------------------- layout ----------------------------- */

export interface LinePart {
  text: string;
  font: PDFFont;
  size: number;
  width: number;
}
export interface Line {
  parts: LinePart[];
  width: number;
  height: number;
  size: number;
}

/**
 * Greedy word wrap of styled runs. A "\n" inside a run forces a line break.
 * Leading spaces are kept on the first line of a paragraph (so plain-text
 * indentation survives) and dropped on wrapped lines.
 */
export function layoutRuns(
  runs: Run[],
  fonts: FontSet,
  maxWidth: number,
  baseSize: number,
  lineHeight: number,
  count = true,
): Line[] {
  const lines: Line[] = [];
  let parts: LinePart[] = [];
  let width = 0;
  let first = true;
  const limit = Math.max(maxWidth, 1);

  const finish = () => {
    while (parts.length > 0) {
      const last = parts[parts.length - 1];
      const trimmed = last.text.replace(/\s+$/, '');
      if (trimmed.length === last.text.length) break;
      if (trimmed.length === 0) {
        width -= last.width;
        parts.pop();
        continue;
      }
      const w = last.font.widthOfTextAtSize(trimmed, last.size);
      width -= last.width - w;
      last.text = trimmed;
      last.width = w;
      break;
    }
    let size = 0;
    for (const p of parts) size = Math.max(size, p.size);
    if (size === 0) size = baseSize;
    lines.push({ parts, width: Math.max(0, width), height: size * lineHeight, size });
    parts = [];
    width = 0;
    first = false;
  };

  const append = (text: string, font: PDFFont, size: number, w: number) => {
    const last = parts[parts.length - 1];
    if (last && last.font === font && last.size === size) {
      last.text += text;
      last.width += w;
    } else {
      parts.push({ text, font, size, width: w });
    }
    width += w;
  };

  for (const run of runs) {
    const size = run.size ?? baseSize;
    const font = pickFont(fonts, !!run.bold, !!run.italic);
    const segments = fonts.fix(run.text, count).split('\n');
    for (let s = 0; s < segments.length; s += 1) {
      if (s > 0) finish();
      const tokens = segments[s].match(/\s+|\S+/g) ?? [];
      for (const tok of tokens) {
        const w = font.widthOfTextAtSize(tok, size);
        if (/^\s/.test(tok)) {
          if (parts.length === 0 && !first) continue;
          if (width + w > limit && parts.length > 0) {
            finish();
            continue;
          }
          append(tok, font, size, w);
          continue;
        }
        if (width + w > limit && parts.length > 0) finish();
        if (w <= limit - width) {
          append(tok, font, size, w);
          continue;
        }
        // Single word wider than a whole line: split by characters.
        let chunk = '';
        for (const ch of tok) {
          const cw = font.widthOfTextAtSize(chunk + ch, size);
          if (cw > limit - width && chunk) {
            append(chunk, font, size, font.widthOfTextAtSize(chunk, size));
            finish();
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        if (chunk) append(chunk, font, size, font.widthOfTextAtSize(chunk, size));
      }
    }
  }
  if (parts.length > 0 || lines.length === 0) finish();
  return lines;
}

/** Draws one laid-out line whose TOP edge is at `top` (PDF coordinates). */
export function drawLine(
  page: PDFPage,
  line: Line,
  x: number,
  top: number,
  boxWidth: number,
  align: Align = 'left',
): void {
  let cx = x;
  if (align === 'center') cx = x + (boxWidth - line.width) / 2;
  else if (align === 'right') cx = x + boxWidth - line.width;
  const baseline = top - (line.height - line.size) / 2 - line.size * 0.8;
  for (const part of line.parts) {
    if (part.text) page.drawText(part.text, { x: cx, y: baseline, size: part.size, font: part.font, color: rgb(0, 0, 0) });
    cx += part.width;
  }
}

/* -------------------------------- render ----------------------------- */

export interface RenderOptions {
  pageSize: [number, number];
  margin: number;
  baseSize: number;
  lineHeight?: number;
  maxPages?: number;
}
export interface RenderStats {
  pages: number;
  skippedImages: number;
}
export interface RenderHooks {
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

export async function renderBlocks(
  doc: PDFDocument,
  fonts: FontSet,
  blocks: Block[],
  opts: RenderOptions,
  hooks: RenderHooks = {},
): Promise<RenderStats> {
  const [pageW, pageH] = opts.pageSize;
  const m = opts.margin;
  const lh = opts.lineHeight ?? 1.35;
  const maxPages = opts.maxPages ?? 3000;
  const contentW = pageW - 2 * m;
  const top0 = pageH - m;
  const st: { page: PDFPage | null; y: number; pages: number } = { page: null, y: top0, pages: 0 };
  let skipped = 0;

  const newPage = (): PDFPage => {
    if (st.pages >= maxPages) {
      throw new ToolError(
        `This document would need more than ${maxPages} pages. Split the source file and convert it in parts.`,
        'out-of-memory',
      );
    }
    st.page = doc.addPage([pageW, pageH]);
    st.pages += 1;
    st.y = top0;
    return st.page;
  };
  const ensure = (h: number): PDFPage => (st.page && st.y - h >= m ? st.page : newPage());

  for (let bi = 0; bi < blocks.length; bi += 1) {
    const b = blocks[bi];
    if (bi % 100 === 0) {
      throwIfAborted(hooks.signal);
      hooks.onProgress?.(bi / blocks.length);
      if (bi > 0 && bi % 400 === 0) await yieldToMain();
    }

    if (b.type === 'pagebreak') {
      if (st.page && st.y < top0 - 0.5) st.page = null;
      continue;
    }

    if (b.type === 'para') {
      const size = b.size ?? opts.baseSize;
      const indent = b.indent ?? 0;
      const bulletGap = b.bullet
        ? Math.max(16, fonts.regular.widthOfTextAtSize(fonts.fix(b.bullet, false), size) + 6)
        : 0;
      const textX = m + indent + bulletGap;
      const maxW = Math.max(30, contentW - indent - bulletGap);
      const runs = b.bold ? b.runs.map((r) => ({ ...r, bold: true })) : b.runs;
      const lines = layoutRuns(runs, fonts, maxW, size, lh);
      if (st.page && st.y < top0) st.y -= b.spaceBefore ?? 0;
      for (let li = 0; li < lines.length; li += 1) {
        const line = lines[li];
        const pg = ensure(line.height);
        const top = st.y;
        drawLine(pg, line, textX, top, maxW, b.align ?? 'left');
        if (li === 0 && b.bullet) {
          const bl = layoutRuns([{ text: b.bullet }], fonts, bulletGap + 40, size, lh)[0];
          drawLine(pg, bl, m + indent, top, bulletGap);
        }
        st.y -= line.height;
      }
      st.y -= b.spaceAfter ?? 0;
      continue;
    }

    if (b.type === 'image') {
      let img;
      try {
        img = b.kind === 'png' ? await doc.embedPng(b.bytes) : await doc.embedJpg(b.bytes);
      } catch {
        skipped += 1;
        continue;
      }
      const nw = img.width * 0.75;
      const nh = img.height * 0.75;
      const s = Math.min(1, contentW / nw, (pageH - 2 * m) / nh);
      const w = nw * s;
      const h = nh * s;
      const pg = ensure(h + 6);
      pg.drawImage(img, { x: m, y: st.y - h, width: w, height: h });
      st.y -= h + 6;
      continue;
    }

    // ---- table ----
    const size = b.fontSize ?? Math.max(7, opts.baseSize - 1);
    const pad = 3;
    const cols = b.rows.reduce((mx, r) => Math.max(mx, r.length), 0);
    if (cols === 0) continue;
    const cells = b.rows.map((r) => Array.from({ length: cols }, (_, c) => r[c] ?? ''));
    const header = !!b.header;

    const natural: number[] = new Array<number>(cols).fill(0);
    const sampleRows = Math.min(cells.length, 400);
    for (let r = 0; r < sampleRows; r += 1) {
      const f = header && r === 0 ? fonts.bold : fonts.regular;
      for (let c = 0; c < cols; c += 1) {
        const t = fonts.fix(cells[r][c], false).replace(/\n/g, ' ');
        natural[c] = Math.max(natural[c], f.widthOfTextAtSize(t, size));
      }
    }
    const maxCol = b.bands ? Math.min(contentW, 260) : contentW;
    const widths = natural.map((w) => Math.min(maxCol, Math.max(28, w * 1.06 + 2 * pad)));

    let bands: number[][];
    if (b.bands) {
      bands = [];
      let current: number[] = [];
      let sum = 0;
      for (let c = 0; c < cols; c += 1) {
        if (current.length > 0 && sum + widths[c] > contentW) {
          bands.push(current);
          current = [];
          sum = 0;
        }
        current.push(c);
        sum += widths[c];
      }
      if (current.length > 0) bands.push(current);
    } else {
      const total = widths.reduce((a, w) => a + w, 0);
      if (total > contentW) {
        const k = contentW / total;
        for (let c = 0; c < cols; c += 1) widths[c] = Math.max(20, widths[c] * k);
        const sum2 = widths.reduce((a, w) => a + w, 0);
        if (sum2 > contentW) for (let c = 0; c < cols; c += 1) widths[c] *= contentW / sum2;
      }
      bands = [Array.from({ length: cols }, (_, c) => c)];
    }

    const maxLines = Math.max(1, Math.floor((pageH - 2 * m - 2 * pad) / (size * 1.25)));
    const layoutRow = (row: string[], band: number[], bold: boolean) => {
      const laid = band.map((c) =>
        layoutRuns([{ text: row[c], bold }], fonts, widths[c] - 2 * pad, size, 1.25, true).slice(0, maxLines),
      );
      const h = Math.max(...laid.map((l) => l.reduce((s, ln) => s + ln.height, 0))) + 2 * pad;
      return { laid, h };
    };
    const drawRow = (
      pg: PDFPage,
      band: number[],
      row: { laid: Line[][]; h: number },
      shaded: boolean,
    ) => {
      let x = m;
      band.forEach((c, k) => {
        const w = widths[c];
        pg.drawRectangle({
          x,
          y: st.y - row.h,
          width: w,
          height: row.h,
          borderColor: rgb(0.72, 0.72, 0.72),
          borderWidth: 0.5,
          color: shaded ? rgb(0.94, 0.94, 0.94) : undefined,
        });
        let ty = st.y - pad;
        for (const ln of row.laid[k]) {
          drawLine(pg, ln, x + pad, ty, w - 2 * pad);
          ty -= ln.height;
        }
        x += w;
      });
      st.y -= row.h;
    };

    for (let bandIndex = 0; bandIndex < bands.length; bandIndex += 1) {
      const band = bands[bandIndex];
      if (bandIndex > 0) st.page = null;
      const hdr = header ? layoutRow(cells[0], band, true) : null;
      for (let r = 0; r < cells.length; r += 1) {
        if (r % 100 === 0) {
          throwIfAborted(hooks.signal);
          if (r > 0) await yieldToMain();
        }
        const isHeader = header && r === 0;
        const row = isHeader && hdr ? hdr : layoutRow(cells[r], band, false);
        let pg = st.page;
        if (!pg || st.y - row.h < m) {
          pg = newPage();
          if (hdr && r > 0) drawRow(pg, band, hdr, true);
        }
        drawRow(pg, band, row, isHeader);
      }
    }
    st.y -= 8;
  }

  hooks.onProgress?.(1);
  return { pages: st.pages, skippedImages: skipped };
}

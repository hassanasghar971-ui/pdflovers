// To-PDF tools: jpg, png, txt, word, excel, powerpoint, rtf.
//
// These are CONTENT converters, not layout-faithful renderers. A browser cannot
// run Word, Excel or PowerPoint, so each format is read directly:
//  - Word (.docx): mammoth converts to HTML (headings, lists, bold/italic, tables,
//    inline images). Page layout, fonts, colours, columns, headers/footers,
//    footnotes and text boxes are not reproduced.
//  - Excel/CSV: SheetJS reads cell text as formatted in the workbook. Charts,
//    images, merged cells, colours and column widths are not reproduced; wide
//    sheets are split into column bands.
//  - PowerPoint (.pptx): slide XML is read directly. Text boxes and pictures
//    that have explicit positions are placed there; placeholders without a
//    position are laid out as a title plus one body area. Backgrounds, charts,
//    SmartArt, animations, shapes and picture cropping are not reproduced.
//  - RTF: small hand-written parser (bold, italic, size, alignment, unicode).
//    Text after \'hh escapes is assumed to be Windows-1252.

import { PDFDocument } from 'pdf-lib';
import type { PDFImage } from 'pdf-lib';
import type JSZip from 'jszip';
import type { MemoryScope } from '../memory';
import { ToolError } from './types';
import type { HandlerMap, RunContext, ToolHandler } from './types';
import { canvasToBlob, formatBytes, pdfResultFile, savePdfBytes, throwIfAborted, yieldToMain } from './shared';
import { bytesOf, clampNum, optNum, optStr, pageSizeFor, progress, stem } from './handler-utils';
import {
  bytesToBlob,
  dataUriBytes,
  decodeToCanvas,
  imageGeometry,
  jpegOrientation,
  mimeOfKind,
  readText,
  sniffBytes,
} from './convert-utils';
import { blocksText, createFonts, drawLine, fontNote, layoutRuns, needsUnicode, renderBlocks } from './pdf-text';
import type { Align, Block, FontFamily, FontSet, Line, ParaBlock, Run } from './pdf-text';

/* ============================== images ================================ */

async function embedImageFile(
  out: PDFDocument,
  file: File,
  mem: MemoryScope,
): Promise<{ img: PDFImage; reencoded: boolean }> {
  const bytes = await bytesOf(file);
  const kind = sniffBytes(bytes);
  if (kind === 'unknown') {
    throw new ToolError(`"${file.name}" is not a supported image (JPG, PNG, WebP, GIF or BMP).`, 'invalid-input');
  }
  if (kind === 'jpeg' && jpegOrientation(bytes) <= 1) {
    try {
      return { img: await out.embedJpg(bytes), reencoded: false };
    } catch {
      /* fall through to canvas re-encode */
    }
  }
  if (kind === 'png') {
    try {
      return { img: await out.embedPng(bytes), reencoded: false };
    } catch {
      /* fall through to canvas re-encode */
    }
  }
  // EXIF-rotated JPEG, WebP, GIF (first frame), BMP, or a file pdf-lib rejected.
  const canvas = await decodeToCanvas(bytesToBlob(bytes, mimeOfKind(kind)), mem, file.name);
  try {
    const asJpeg = kind === 'jpeg';
    const blob = await canvasToBlob(canvas, asJpeg ? 'image/jpeg' : 'image/png', 0.92);
    const data = new Uint8Array(await blob.arrayBuffer());
    const img = asJpeg ? await out.embedJpg(data) : await out.embedPng(data);
    return { img, reencoded: true };
  } finally {
    mem.release(canvas);
  }
}

function makeImageHandler(): ToolHandler {
  return async (ctx, mem) => {
    const sizeKey = optStr(ctx.options, 'pageSize', 'fit');
    const orientation = optStr(ctx.options, 'orientation', 'auto');
    // ASSUMPTION: the registry's "margin" is in PDF points. Check its label.
    const margin = clampNum(optNum(ctx.options, 'margin', 0), 0, 200);
    if (sizeKey !== 'fit') pageSizeFor(sizeKey, false);

    const out = await PDFDocument.create();
    out.setProducer('PDF Lovers Pro');
    out.setCreator('PDF Lovers Pro');
    let reencoded = 0;
    const n = ctx.files.length;

    for (let i = 0; i < n; i += 1) {
      throwIfAborted(ctx.signal);
      const file = ctx.files[i];
      progress(ctx, 4 + (i / n) * 88, `Adding ${file.name}`);
      const { img, reencoded: re } = await embedImageFile(out, file, mem);
      if (re) reencoded += 1;
      const g = imageGeometry(img.width, img.height, sizeKey, orientation, margin);
      const page = out.addPage([g.pageW, g.pageH]);
      page.drawImage(img, { x: g.x, y: g.y, width: g.w, height: g.h });
      await yieldToMain();
    }

    progress(ctx, 94, 'Saving PDF');
    const bytes = await savePdfBytes(out, { objectStreams: true });
    const name = n === 1 ? `${stem(ctx.files[0].name)}.pdf` : 'images.pdf';
    return {
      files: [pdfResultFile(bytes, name)],
      note:
        `Created a ${n}-page PDF (${formatBytes(bytes.length)}).` +
        (reencoded > 0
          ? ` ${reencoded} image${reencoded === 1 ? ' was' : 's were'} re-encoded (rotation fix or non-JPEG/PNG format); animated GIFs use their first frame.`
          : ' JPEG and PNG data was embedded without re-compression.'),
    };
  };
}

/* ============================== plain text ============================ */

function asFamily(v: string): FontFamily {
  return v === 'times' || v === 'courier' ? v : 'helvetica';
}

/* ================================ Word ================================ */

const HEADING_SIZE: Record<string, number> = { h1: 20, h2: 16, h3: 14, h4: 12.5, h5: 11.5, h6: 11 };
const BLOCK_TAGS = new Set(['p', 'div', 'ul', 'ol', 'table', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article']);

type Seg = Run | { type: 'image'; bytes: Uint8Array; kind: 'png' | 'jpeg' };
interface HtmlStats {
  skippedImages: number;
}

function walkInline(node: Node, bold: boolean, italic: boolean, out: Seg[], stats: HtmlStats): void {
  if (node.nodeType === 3) {
    const t = (node.textContent ?? '').replace(/\s+/g, ' ');
    if (t) out.push({ text: t, bold, italic });
    return;
  }
  if (node.nodeType !== 1) return;
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  if (tag === 'br') {
    out.push({ text: '\n', bold, italic });
    return;
  }
  if (tag === 'img') {
    const data = dataUriBytes(el.getAttribute('src'));
    if (data && (data.kind === 'png' || data.kind === 'jpeg')) {
      out.push({ type: 'image', bytes: data.bytes, kind: data.kind });
    } else {
      stats.skippedImages += 1;
    }
    return;
  }
  if (tag === 'ul' || tag === 'ol' || tag === 'table') return;
  const b = bold || tag === 'strong' || tag === 'b' || /^h[1-6]$/.test(tag);
  const i = italic || tag === 'em' || tag === 'i';
  el.childNodes.forEach((c) => walkInline(c, b, i, out, stats));
}

function pushSegs(segs: Seg[], blocks: Block[], props: Partial<ParaBlock>): void {
  let runs: Run[] = [];
  let bulletUsed = false;
  const flush = () => {
    if (runs.length > 0) {
      runs[0] = { ...runs[0], text: runs[0].text.replace(/^\s+/, '') };
      const li = runs.length - 1;
      runs[li] = { ...runs[li], text: runs[li].text.replace(/\s+$/, '') };
    }
    if (runs.some((r) => r.text.trim().length > 0)) {
      const p: ParaBlock = { type: 'para', runs, ...props };
      if (bulletUsed) delete p.bullet;
      else if (props.bullet) bulletUsed = true;
      blocks.push(p);
    }
    runs = [];
  };
  for (const seg of segs) {
    if ('text' in seg) runs.push(seg);
    else {
      flush();
      blocks.push(seg);
    }
  }
  flush();
}

function walkList(list: Element, blocks: Block[], stats: HtmlStats, depth: number): void {
  const ordered = list.tagName.toLowerCase() === 'ol';
  let n = 0;
  for (const li of Array.from(list.children)) {
    if (li.tagName.toLowerCase() !== 'li') continue;
    n += 1;
    const segs: Seg[] = [];
    li.childNodes.forEach((c) => walkInline(c, false, false, segs, stats));
    pushSegs(segs, blocks, {
      indent: 14 * depth,
      bullet: ordered ? `${n}.` : depth % 2 === 0 ? '\u2022' : '\u2013',
      spaceAfter: 2,
    });
    for (const nested of Array.from(li.children)) {
      const t = nested.tagName.toLowerCase();
      if (t === 'ul' || t === 'ol') walkList(nested, blocks, stats, depth + 1);
    }
  }
}

function walkBlocks(parent: Node, blocks: Block[], stats: HtmlStats): void {
  parent.childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      if ((node.textContent ?? '').trim()) {
        const segs: Seg[] = [];
        walkInline(node, false, false, segs, stats);
        pushSegs(segs, blocks, { spaceAfter: 6 });
      }
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      const segs: Seg[] = [];
      walkInline(el, true, false, segs, stats);
      pushSegs(segs, blocks, { size: HEADING_SIZE[tag], spaceBefore: 10, spaceAfter: 4 });
    } else if (tag === 'ul' || tag === 'ol') {
      walkList(el, blocks, stats, 0);
    } else if (tag === 'table') {
      const rows: string[][] = [];
      let header = false;
      el.querySelectorAll('tr').forEach((tr, idx) => {
        const cells = Array.from(tr.children).filter((c) => /^(td|th)$/i.test(c.tagName));
        if (idx === 0 && cells.some((c) => c.tagName.toLowerCase() === 'th')) header = true;
        rows.push(cells.map((c) => (c.textContent ?? '').replace(/\s+/g, ' ').trim()));
      });
      if (rows.length > 0) blocks.push({ type: 'table', rows, header });
    } else if (tag === 'p') {
      const segs: Seg[] = [];
      walkInline(el, false, false, segs, stats);
      pushSegs(segs, blocks, { spaceAfter: 6 });
    } else if (BLOCK_TAGS.has(tag) || Array.from(el.children).some((c) => BLOCK_TAGS.has(c.tagName.toLowerCase()))) {
      walkBlocks(el, blocks, stats);
    } else {
      const segs: Seg[] = [];
      walkInline(el, false, false, segs, stats);
      pushSegs(segs, blocks, { spaceAfter: 6 });
    }
  });
}

function htmlToBlocks(html: string): { blocks: Block[]; stats: HtmlStats } {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks: Block[] = [];
  const stats: HtmlStats = { skippedImages: 0 };
  walkBlocks(doc.body, blocks, stats);
  return { blocks, stats };
}

/* ================================ RTF ================================= */

const RTF_SKIP = new Set([
  'fonttbl', 'colortbl', 'stylesheet', 'info', 'pict', 'object', 'header', 'footer', 'headerl', 'headerr',
  'headerf', 'footerl', 'footerr', 'footerf', 'footnote', 'themedata', 'colorschememapping', 'datastore',
  'latentstyles', 'listtable', 'listoverridetable', 'rsidtbl', 'generator', 'xmlnstbl', 'fldinst', 'revtbl',
  'private', 'bkmkstart', 'bkmkend',
]);
const CP1252_80 = [
  0x20ac, 0x81, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x8d,
  0x017d, 0x8f, 0x90, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
  0x0153, 0x9d, 0x017e, 0x0178,
];
function cp1252(n: number): string {
  return n >= 0x80 && n <= 0x9f ? String.fromCharCode(CP1252_80[n - 0x80]) : String.fromCharCode(n);
}
const RTF_SYMBOLS: Record<string, string> = {
  emdash: '\u2014', endash: '\u2013', bullet: '\u2022', lquote: '\u2018', rquote: '\u2019',
  ldblquote: '\u201c', rdblquote: '\u201d', emspace: ' ', enspace: ' ', tab: '\t', line: '\n',
};

interface RtfState {
  bold: boolean;
  italic: boolean;
  size: number | undefined;
  skip: boolean;
  uc: number;
}

function rtfToBlocks(src: string): Block[] {
  if (!/^\s*\{\\rtf/.test(src)) {
    throw new ToolError('This file does not look like a valid RTF document.', 'invalid-input');
  }
  let st: RtfState = { bold: false, italic: false, size: undefined, skip: false, uc: 1 };
  const stack: RtfState[] = [];
  const paras: { runs: Run[]; align: Align }[] = [{ runs: [], align: 'left' }];
  const cur = () => paras[paras.length - 1];
  const emit = (text: string) => {
    if (st.skip || !text) return;
    const runs = cur().runs;
    const last = runs[runs.length - 1];
    if (last && !!last.bold === st.bold && !!last.italic === st.italic && last.size === st.size) last.text += text;
    else runs.push({ text, bold: st.bold, italic: st.italic, size: st.size });
  };
  const newPara = () => {
    if (!st.skip) paras.push({ runs: [], align: 'left' });
  };

  const WORD = /\\([a-zA-Z]+)(-?\d+)? ?/y;
  const n = src.length;
  let i = 0;
  while (i < n) {
    const ch = src[i];
    if (ch === '{') {
      stack.push({ ...st });
      i += 1;
      if (src[i] === '\\') {
        if (src[i + 1] === '*') st.skip = true;
        else {
          const m = /^\\([a-zA-Z]+)/.exec(src.slice(i, i + 24));
          if (m && RTF_SKIP.has(m[1])) st.skip = true;
        }
      }
      continue;
    }
    if (ch === '}') {
      st = stack.pop() ?? st;
      i += 1;
      continue;
    }
    if (ch === '\\') {
      const next = src[i + 1];
      if (next === undefined) break;
      if (next === '\\' || next === '{' || next === '}') {
        emit(next);
        i += 2;
      } else if (next === "'") {
        emit(cp1252(parseInt(src.slice(i + 2, i + 4), 16) || 0));
        i += 4;
      } else if (next === '~') {
        emit('\u00a0');
        i += 2;
      } else if (next === '_') {
        emit('-');
        i += 2;
      } else if (next === '\n' || next === '\r') {
        newPara();
        i += 2;
      } else if (/[a-zA-Z]/.test(next)) {
        WORD.lastIndex = i;
        const m = WORD.exec(src);
        if (!m) {
          i += 2;
          continue;
        }
        i += m[0].length;
        const name = m[1];
        const param = m[2] === undefined ? undefined : Number(m[2]);
        switch (name) {
          case 'par': newPara(); break;
          case 'pard': cur().align = 'left'; break;
          case 'plain': st.bold = false; st.italic = false; st.size = undefined; break;
          case 'b': st.bold = param !== 0; break;
          case 'i': st.italic = param !== 0; break;
          case 'fs': st.size = param ? clampNum(param / 2, 6, 60) : undefined; break;
          case 'uc': st.uc = param ?? 1; break;
          case 'ql': cur().align = 'left'; break;
          case 'qc': cur().align = 'center'; break;
          case 'qr': cur().align = 'right'; break;
          case 'cell': emit(' | '); break;
          case 'row': {
            const runs = cur().runs;
            const last = runs[runs.length - 1];
            if (last && last.text.endsWith(' | ')) last.text = last.text.slice(0, -3);
            newPara();
            break;
          }
          case 'u': {
            if (param !== undefined) {
              const code = param < 0 ? param + 65536 : param;
              emit(String.fromCodePoint(code));
            }
            for (let k = 0; k < st.uc; k += 1) {
              if (src[i] === '\\' && src[i + 1] === "'") i += 4;
              else if (i < n && src[i] !== '{' && src[i] !== '}' && src[i] !== '\\') i += 1;
              else break;
            }
            break;
          }
          default:
            if (RTF_SYMBOLS[name] !== undefined) emit(RTF_SYMBOLS[name]);
        }
      } else {
        i += 2;
      }
      continue;
    }
    if (ch === '\r' || ch === '\n') {
      i += 1;
      continue;
    }
    let j = i;
    while (j < n && src[j] !== '{' && src[j] !== '}' && src[j] !== '\\' && src[j] !== '\n' && src[j] !== '\r') j += 1;
    emit(src.slice(i, j));
    i = j;
  }

  const blocks: ParaBlock[] = paras.map((p) => ({
    type: 'para',
    runs: p.runs.length > 0 ? p.runs : [{ text: '' }],
    align: p.align,
    spaceAfter: 4,
  }));
  while (blocks.length > 0 && blocks[blocks.length - 1].runs.every((r) => !r.text.trim())) blocks.pop();
  return blocks;
}

/* ============================== PowerPoint ============================ */

const EMU_PER_PT = 12700;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface SlidePara {
  runs: Run[];
  bullet: boolean;
  level: number;
}
interface SlideText {
  paras: SlidePara[];
  rect: Rect | null;
  title: boolean;
}
interface SlideImage {
  rect: Rect;
  bytes: Uint8Array;
  kind: 'png' | 'jpeg';
}
interface SlideModel {
  texts: SlideText[];
  images: SlideImage[];
}

function parseXml(text: string): Document {
  const d = new DOMParser().parseFromString(text, 'application/xml');
  if (d.getElementsByTagName('parsererror').length > 0) {
    throw new ToolError('The presentation contains XML that could not be read.', 'invalid-input');
  }
  return d;
}

function child(el: Element | null | undefined, name: string): Element | null {
  if (!el) return null;
  for (const c of Array.from(el.children)) if (c.tagName === name) return c;
  return null;
}

function resolvePath(dir: string, target: string): string {
  if (target.startsWith('/')) return target.slice(1);
  const parts = dir.split('/').filter(Boolean);
  for (const seg of target.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg && seg !== '.') parts.push(seg);
  }
  return parts.join('/');
}

function xfrmRect(el: Element): Rect | null {
  let xfrm: Element | null = null;
  for (const c of Array.from(el.children)) {
    if (c.tagName === 'p:spPr') xfrm = child(c, 'a:xfrm');
    else if (c.tagName === 'p:xfrm') xfrm = c;
  }
  const off = child(xfrm, 'a:off');
  const ext = child(xfrm, 'a:ext');
  if (!off || !ext) return null;
  const x = Number(off.getAttribute('x'));
  const y = Number(off.getAttribute('y'));
  const w = Number(ext.getAttribute('cx'));
  const h = Number(ext.getAttribute('cy'));
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return null;
  return { x: x / EMU_PER_PT, y: y / EMU_PER_PT, w: w / EMU_PER_PT, h: h / EMU_PER_PT };
}

function parseParas(txBody: Element): SlidePara[] {
  const out: SlidePara[] = [];
  for (const p of Array.from(txBody.children)) {
    if (p.tagName !== 'a:p') continue;
    const pPr = child(p, 'a:pPr');
    const level = Number(pPr?.getAttribute('lvl') ?? 0) || 0;
    const bullet = !!pPr && !!(child(pPr, 'a:buChar') || child(pPr, 'a:buAutoNum'));
    const runs: Run[] = [];
    for (const r of Array.from(p.children)) {
      if (r.tagName === 'a:r' || r.tagName === 'a:fld') {
        const t = child(r, 'a:t')?.textContent ?? '';
        const rPr = child(r, 'a:rPr');
        const sz = rPr?.getAttribute('sz');
        runs.push({
          text: t,
          bold: rPr?.getAttribute('b') === '1',
          italic: rPr?.getAttribute('i') === '1',
          size: sz ? Number(sz) / 100 : undefined,
        });
      } else if (r.tagName === 'a:br') {
        runs.push({ text: '\n' });
      }
    }
    out.push({ runs, bullet, level });
  }
  return out;
}

async function parseSlide(zip: JSZip, slidePath: string, stats: { skipped: number }): Promise<SlideModel> {
  const file = zip.file(slidePath);
  if (!file) throw new ToolError('A slide listed in the presentation is missing from the file.', 'invalid-input');
  const doc = parseXml(await file.async('string'));
  const dir = slidePath.slice(0, slidePath.lastIndexOf('/'));
  const relsFile = zip.file(slidePath.replace(/([^/]+)$/, '_rels/$1.rels'));
  const rels = new Map<string, string>();
  if (relsFile) {
    const rdoc = parseXml(await relsFile.async('string'));
    Array.from(rdoc.getElementsByTagName('Relationship')).forEach((r) => {
      const id = r.getAttribute('Id');
      const target = r.getAttribute('Target');
      if (id && target) rels.set(id, target);
    });
  }

  const model: SlideModel = { texts: [], images: [] };
  const pending: Promise<void>[] = [];

  const walk = (container: Element, rectOk: boolean) => {
    for (const el of Array.from(container.children)) {
      const tag = el.tagName;
      if (tag === 'p:sp') {
        const body = child(el, 'p:txBody');
        if (!body) continue;
        const phType = el.getElementsByTagName('p:ph')[0]?.getAttribute('type') ?? '';
        if (phType === 'sldNum' || phType === 'dt' || phType === 'ftr') continue;
        const paras = parseParas(body);
        if (!paras.some((p) => p.runs.some((r) => r.text.trim()))) continue;
        model.texts.push({
          paras,
          rect: rectOk ? xfrmRect(el) : null,
          title: phType === 'title' || phType === 'ctrTitle',
        });
      } else if (tag === 'p:pic') {
        const rect = rectOk ? xfrmRect(el) : null;
        const rid = el.getElementsByTagName('a:blip')[0]?.getAttribute('r:embed');
        const target = rid ? rels.get(rid) : undefined;
        if (!rect || !target) {
          stats.skipped += 1;
          continue;
        }
        const mediaFile = zip.file(resolvePath(dir, target));
        if (!mediaFile) {
          stats.skipped += 1;
          continue;
        }
        pending.push(
          mediaFile.async('uint8array').then((bytes) => {
            const kind = sniffBytes(bytes);
            if (kind === 'png' || kind === 'jpeg') model.images.push({ rect, bytes, kind });
            else stats.skipped += 1;
          }),
        );
      } else if (tag === 'p:graphicFrame') {
        const tbl = el.getElementsByTagName('a:tbl')[0];
        if (!tbl) {
          stats.skipped += 1; // chart, SmartArt, embedded object
          continue;
        }
        const paras: SlidePara[] = [];
        for (const tr of Array.from(tbl.getElementsByTagName('a:tr'))) {
          const cells = Array.from(tr.getElementsByTagName('a:tc')).map((tc) =>
            Array.from(tc.getElementsByTagName('a:t')).map((t) => t.textContent ?? '').join(' ').trim(),
          );
          paras.push({ runs: [{ text: cells.join(' | ') }], bullet: false, level: 0 });
        }
        if (paras.length > 0) model.texts.push({ paras, rect: rectOk ? xfrmRect(el) : null, title: false });
      } else if (tag === 'p:grpSp') {
        walk(el, false);
      }
    }
  };

  const tree = doc.getElementsByTagName('p:spTree')[0];
  if (tree) walk(tree, true);
  await Promise.all(pending);
  return model;
}

interface LaidPara {
  lines: Line[];
  indent: number;
  bulletW: number;
  bullet: boolean;
  size: number;
  gap: number;
}

function layoutParas(
  paras: SlidePara[],
  fonts: FontSet,
  width: number,
  baseSize: number,
  scale: number,
  count: boolean,
): { laid: LaidPara[]; height: number } {
  const laid: LaidPara[] = [];
  let height = 0;
  for (const p of paras) {
    const size = baseSize * scale;
    const indent = (p.bullet ? 16 : 14) * scale * p.level;
    const bulletW = p.bullet ? 14 * scale : 0;
    const maxW = Math.max(20, width - indent - bulletW);
    const runs: Run[] =
      p.runs.length > 0
        ? p.runs.map((r) => ({ ...r, size: r.size ? r.size * scale : undefined }))
        : [{ text: '' }];
    const lines = layoutRuns(runs, fonts, maxW, size, 1.2, count);
    const gap = size * 0.35;
    height += lines.reduce((s, l) => s + l.height, 0) + gap;
    laid.push({ lines, indent, bulletW, bullet: p.bullet, size, gap });
  }
  return { laid, height };
}

function drawTextBox(
  page: import('pdf-lib').PDFPage,
  fonts: FontSet,
  paras: SlidePara[],
  rect: Rect,
  pageH: number,
  defaultSize: number,
): void {
  // Shrink the text (down to 35%) until it fits the box. Measuring passes do
  // not count replaced characters; only the final pass does.
  let scale = 1;
  for (let attempt = 0; attempt < 14; attempt += 1) {
    const { height } = layoutParas(paras, fonts, rect.w, defaultSize, scale, false);
    if (height <= rect.h || scale <= 0.35) break;
    scale *= 0.9;
  }
  const { laid } = layoutParas(paras, fonts, rect.w, defaultSize, scale, true);
  let top = pageH - rect.y;
  for (const lp of laid) {
    for (let li = 0; li < lp.lines.length; li += 1) {
      const line = lp.lines[li];
      if (top - line.height < -20) return;
      drawLine(page, line, rect.x + lp.indent + lp.bulletW, top, rect.w - lp.indent - lp.bulletW);
      if (li === 0 && lp.bullet) {
        const bl = layoutRuns([{ text: '\u2022' }], fonts, 60, lp.size, 1.2, false)[0];
        drawLine(page, bl, rect.x + lp.indent, top, lp.bulletW);
      }
      top -= line.height;
    }
    top -= lp.gap;
  }
}

/* ============================== handlers ============================== */

export const handlers: HandlerMap = {
  'jpg-to-pdf': makeImageHandler(),
  'png-to-pdf': makeImageHandler(),

  /* ------------------------------- txt -------------------------------- */
  'txt-to-pdf': async (ctx) => {
    const family = asFamily(optStr(ctx.options, 'font', 'helvetica'));
    const size = clampNum(optNum(ctx.options, 'fontSize', 11), 6, 36);
    const pageSize = pageSizeFor(optStr(ctx.options, 'pageSize', 'a4'), false);

    progress(ctx, 4, 'Reading text');
    const texts: string[] = [];
    for (const file of ctx.files) {
      throwIfAborted(ctx.signal);
      texts.push((await readText(file)).replace(/\r\n?/g, '\n'));
    }
    if (texts.every((t) => !t.trim())) {
      throw new ToolError('The text file is empty.', 'invalid-input');
    }

    const doc = await PDFDocument.create();
    doc.setProducer('PDF Lovers Pro');
    doc.setCreator('PDF Lovers Pro');
    const fonts = await createFonts(doc, family, texts.join('\n'));

    const blocks: Block[] = [];
    texts.forEach((text, fi) => {
      if (fi > 0) blocks.push({ type: 'pagebreak' });
      const pages = text.split('\f');
      pages.forEach((pageText, pi) => {
        if (pi > 0) blocks.push({ type: 'pagebreak' });
        const lines = pageText.replace(/\n+$/, '').split('\n');
        for (const line of lines) blocks.push({ type: 'para', runs: [{ text: line }], size });
      });
    });

    const stats = await renderBlocks(
      doc,
      fonts,
      blocks,
      { pageSize, margin: 54, baseSize: size, lineHeight: 1.3 },
      { signal: ctx.signal, onProgress: (f) => progress(ctx, 10 + f * 80, 'Laying out pages') },
    );
    progress(ctx, 94, 'Saving PDF');
    const bytes = await savePdfBytes(doc, { objectStreams: true });
    const name = ctx.files.length === 1 ? `${stem(ctx.files[0].name)}.pdf` : 'text-files.pdf';
    return {
      files: [pdfResultFile(bytes, name)],
      note:
        `Created ${stats.pages} page${stats.pages === 1 ? '' : 's'} (${formatBytes(bytes.length)}).` +
        (ctx.files.length > 1 ? ' Each text file starts on a new page of one combined PDF.' : '') +
        fontNote(fonts),
    };
  },

  /* ------------------------------ word -------------------------------- */
  'word-to-pdf': async (ctx) => {
    const file = ctx.files[0];
    const pageSize = pageSizeFor(optStr(ctx.options, 'pageSize', 'a4'), false);

    progress(ctx, 5, 'Reading document');
    let html: string;
    try {
      const mod = await import('mammoth');
      const api = (typeof mod.convertToHtml === 'function'
        ? mod
        : (mod as unknown as { default: typeof mod }).default) as typeof mod;
      const result = await api.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
      html = result.value;
    } catch {
      throw new ToolError(
        `"${file.name}" could not be read. Only .docx files are supported (not old .doc files), and password-protected documents cannot be opened.`,
        'invalid-input',
      );
    }

    progress(ctx, 25, 'Converting content');
    const { blocks, stats: htmlStats } = htmlToBlocks(html);
    html = '';
    if (blocks.length === 0) {
      throw new ToolError('No readable text or images were found in this document.', 'invalid-input');
    }

    const doc = await PDFDocument.create();
    doc.setProducer('PDF Lovers Pro');
    doc.setCreator('PDF Lovers Pro');
    doc.setTitle(stem(file.name));
    const fonts = await createFonts(doc, 'helvetica', blocksText(blocks));
    const stats = await renderBlocks(
      doc,
      fonts,
      blocks,
      { pageSize, margin: 64, baseSize: 11, lineHeight: 1.35 },
      { signal: ctx.signal, onProgress: (f) => progress(ctx, 35 + f * 55, 'Laying out pages') },
    );
    progress(ctx, 94, 'Saving PDF');
    const bytes = await savePdfBytes(doc, { objectStreams: true });
    const skipped = htmlStats.skippedImages + stats.skippedImages;
    return {
      files: [pdfResultFile(bytes, `${stem(file.name)}.pdf`)],
      note:
        `Created ${stats.pages} page${stats.pages === 1 ? '' : 's'} (${formatBytes(bytes.length)}). ` +
        'Text, headings, lists, tables and PNG/JPEG images are kept; fonts, colours, columns, headers/footers, footnotes and original page breaks are not.' +
        (skipped > 0 ? ` ${skipped} image${skipped === 1 ? '' : 's'} in an unsupported format (for example EMF/WMF) were left out.` : '') +
        fontNote(fonts),
    };
  },

  /* ------------------------------ excel ------------------------------- */
  'excel-to-pdf': async (ctx) => {
    const file = ctx.files[0];
    // ASSUMPTION: anything other than "portrait" means landscape (good default for tables).
    const landscape = optStr(ctx.options, 'orientation', 'landscape') !== 'portrait';
    const pageSize = pageSizeFor(optStr(ctx.options, 'pageSize', 'a4'), landscape);
    const ROW_CAP = 10000;

    progress(ctx, 5, 'Reading workbook');
    const mod = (await import('xlsx')) as typeof import('xlsx') & { default?: typeof import('xlsx') };
    const XLSX = typeof mod.read === 'function' ? mod : (mod.default as typeof import('xlsx'));

    let wb: import('xlsx').WorkBook;
    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        wb = XLSX.read(await readText(file), { type: 'string', raw: true });
      } else {
        wb = XLSX.read(await bytesOf(file), { type: 'array', cellDates: true });
      }
    } catch {
      throw new ToolError(
        `"${file.name}" could not be read as a spreadsheet. Password-protected workbooks are not supported.`,
        'invalid-input',
      );
    }

    const blocks: Block[] = [];
    let sheetsUsed = 0;
    let hidden = 0;
    const truncated: string[] = [];
    const visibleCount = wb.SheetNames.length;

    wb.SheetNames.forEach((name, idx) => {
      if ((wb.Workbook?.Sheets?.[idx]?.Hidden ?? 0) !== 0) {
        hidden += 1;
        return;
      }
      const ws = wb.Sheets[name];
      if (!ws) return;
      let rows = XLSX.utils
        .sheet_to_json<unknown[]>(ws, { header: 1, raw: false, defval: '', blankrows: false })
        .map((r) => r.map((v) => String(v ?? '')));
      if (rows.length === 0) return;
      if (rows.length > ROW_CAP) {
        truncated.push(`${name} (${rows.length} rows)`);
        rows = rows.slice(0, ROW_CAP);
      }
      let maxCol = 0;
      for (const r of rows) {
        for (let c = r.length - 1; c >= 0; c -= 1) {
          if (r[c].trim()) {
            maxCol = Math.max(maxCol, c + 1);
            break;
          }
        }
      }
      if (maxCol === 0) return;
      rows = rows.map((r) => r.slice(0, maxCol));
      if (sheetsUsed > 0) blocks.push({ type: 'pagebreak' });
      if (visibleCount > 1) {
        blocks.push({ type: 'para', runs: [{ text: name, bold: true }], size: 13, spaceAfter: 6 });
      }
      blocks.push({ type: 'table', rows, header: true, fontSize: 8, bands: true });
      sheetsUsed += 1;
    });

    if (sheetsUsed === 0) throw new ToolError('The workbook has no data to convert.', 'invalid-input');

    const doc = await PDFDocument.create();
    doc.setProducer('PDF Lovers Pro');
    doc.setCreator('PDF Lovers Pro');
    doc.setTitle(stem(file.name));
    const fonts = await createFonts(doc, 'helvetica', blocksText(blocks));
    const stats = await renderBlocks(
      doc,
      fonts,
      blocks,
      { pageSize, margin: 36, baseSize: 10, lineHeight: 1.25 },
      { signal: ctx.signal, onProgress: (f) => progress(ctx, 20 + f * 70, 'Drawing tables') },
    );
    progress(ctx, 94, 'Saving PDF');
    const bytes = await savePdfBytes(doc, { objectStreams: true });
    return {
      files: [pdfResultFile(bytes, `${stem(file.name)}.pdf`)],
      note:
        `Converted ${sheetsUsed} sheet${sheetsUsed === 1 ? '' : 's'} into ${stats.pages} page${stats.pages === 1 ? '' : 's'} (${formatBytes(bytes.length)}). ` +
        'Cell text is shown as formatted in the workbook; colours, merged cells, charts and images are not reproduced, and sheets wider than a page continue on following pages.' +
        (hidden > 0 ? ` ${hidden} hidden sheet${hidden === 1 ? ' was' : 's were'} skipped.` : '') +
        (truncated.length > 0 ? ` Limited to the first ${ROW_CAP} rows for: ${truncated.join(', ')}.` : '') +
        fontNote(fonts),
    };
  },

  /* ---------------------------- powerpoint ---------------------------- */
  'ppt-to-pdf': async (ctx) => {
    const file = ctx.files[0];
    progress(ctx, 5, 'Opening presentation');
    let zip: JSZip;
    try {
      const JSZipCtor = (await import('jszip')).default;
      zip = await JSZipCtor.loadAsync(await bytesOf(file));
    } catch {
      throw new ToolError(
        `"${file.name}" could not be opened. Only .pptx files are supported (not old .ppt files), and password-protected files cannot be read.`,
        'invalid-input',
      );
    }

    const presFile = zip.file('ppt/presentation.xml');
    const presRels = zip.file('ppt/_rels/presentation.xml.rels');
    if (!presFile || !presRels) {
      throw new ToolError('This does not look like a valid .pptx file.', 'invalid-input');
    }
    const pres = parseXml(await presFile.async('string'));
    const relMap = new Map<string, string>();
    Array.from(parseXml(await presRels.async('string')).getElementsByTagName('Relationship')).forEach((r) => {
      const id = r.getAttribute('Id');
      const target = r.getAttribute('Target');
      if (id && target) relMap.set(id, target);
    });

    const sz = pres.getElementsByTagName('p:sldSz')[0];
    const W = clampNum((Number(sz?.getAttribute('cx')) || 9144000) / EMU_PER_PT, 144, 5000);
    const H = clampNum((Number(sz?.getAttribute('cy')) || 6858000) / EMU_PER_PT, 144, 5000);

    const slidePaths = Array.from(pres.getElementsByTagName('p:sldId'))
      .map((s) => relMap.get(s.getAttribute('r:id') ?? ''))
      .filter((t): t is string => !!t)
      .map((t) => resolvePath('ppt', t));
    if (slidePaths.length === 0) throw new ToolError('This presentation has no slides.', 'invalid-input');

    const stats = { skipped: 0 };
    const slides: SlideModel[] = [];
    for (let i = 0; i < slidePaths.length; i += 1) {
      throwIfAborted(ctx.signal);
      progress(ctx, 8 + (i / slidePaths.length) * 40, `Reading slide ${i + 1} of ${slidePaths.length}`);
      slides.push(await parseSlide(zip, slidePaths[i], stats));
      await yieldToMain();
    }

    const sampleText = slides
      .flatMap((s) => s.texts.flatMap((t) => t.paras.flatMap((p) => p.runs.map((r) => r.text))))
      .join('\n');
    const doc = await PDFDocument.create();
    doc.setProducer('PDF Lovers Pro');
    doc.setCreator('PDF Lovers Pro');
    doc.setTitle(stem(file.name));
    const fonts = await createFonts(doc, 'helvetica', sampleText);

    for (let i = 0; i < slides.length; i += 1) {
      throwIfAborted(ctx.signal);
      progress(ctx, 50 + (i / slides.length) * 42, `Drawing slide ${i + 1} of ${slides.length}`);
      const slide = slides[i];
      const page = doc.addPage([W, H]);

      for (const img of slide.images) {
        try {
          const embedded = img.kind === 'png' ? await doc.embedPng(img.bytes) : await doc.embedJpg(img.bytes);
          page.drawImage(embedded, { x: img.rect.x, y: H - img.rect.y - img.rect.h, width: img.rect.w, height: img.rect.h });
        } catch {
          stats.skipped += 1;
        }
      }

      const titleFlow: SlidePara[] = [];
      const bodyFlow: SlidePara[] = [];
      for (const t of slide.texts) {
        if (t.rect) drawTextBox(page, fonts, t.paras, t.rect, H, t.title ? 32 : 18);
        else (t.title ? titleFlow : bodyFlow).push(...t.paras);
      }
      if (titleFlow.length > 0) {
        drawTextBox(page, fonts, titleFlow, { x: W * 0.06, y: H * 0.05, w: W * 0.88, h: H * 0.17 }, H, 32);
      }
      if (bodyFlow.length > 0) {
        drawTextBox(page, fonts, bodyFlow, { x: W * 0.06, y: H * 0.25, w: W * 0.88, h: H * 0.68 }, H, 18);
      }
      slide.images.length = 0;
      await yieldToMain();
    }

    progress(ctx, 95, 'Saving PDF');
    const bytes = await savePdfBytes(doc, { objectStreams: true });
    return {
      files: [pdfResultFile(bytes, `${stem(file.name)}.pdf`)],
      note:
        `Created ${slides.length} slide page${slides.length === 1 ? '' : 's'} (${formatBytes(bytes.length)}). ` +
        'Slide text and PNG/JPEG pictures are placed at their positions where the file stores them; backgrounds, shapes, charts, SmartArt, animations and picture cropping are not reproduced. Long text is shrunk to fit its box.' +
        (stats.skipped > 0 ? ` ${stats.skipped} object${stats.skipped === 1 ? '' : 's'} (charts, grouped or unsupported pictures) could not be drawn.` : '') +
        fontNote(fonts),
    };
  },

  /* -------------------------------- rtf ------------------------------- */
  'rtf-to-pdf': async (ctx) => {
    const file = ctx.files[0];
    const pageSize = pageSizeFor(optStr(ctx.options, 'pageSize', 'a4'), false);
    progress(ctx, 5, 'Reading RTF');
    const blocks = rtfToBlocks(await readText(file));
    if (blocks.length === 0 || !blocksText(blocks).trim()) {
      throw new ToolError('No readable text was found in this RTF file.', 'invalid-input');
    }
    const doc = await PDFDocument.create();
    doc.setProducer('PDF Lovers Pro');
    doc.setCreator('PDF Lovers Pro');
    doc.setTitle(stem(file.name));
    const fonts = await createFonts(doc, 'helvetica', blocksText(blocks));
    const stats = await renderBlocks(
      doc,
      fonts,
      blocks,
      { pageSize, margin: 64, baseSize: 11, lineHeight: 1.3 },
      { signal: ctx.signal, onProgress: (f) => progress(ctx, 20 + f * 70, 'Laying out pages') },
    );
    progress(ctx, 94, 'Saving PDF');
    const bytes = await savePdfBytes(doc, { objectStreams: true });
    return {
      files: [pdfResultFile(bytes, `${stem(file.name)}.pdf`)],
      note:
        `Created ${stats.pages} page${stats.pages === 1 ? '' : 's'} (${formatBytes(bytes.length)}). ` +
        'Bold, italic, font size and alignment are kept; fonts, colours, images and real table borders are not (tables become rows of text separated by "|").' +
        fontNote(fonts),
    };
  },
};

// Referenced so a refactor that removes direct uses doesn't trip unused-import checks.
export type ToPdfContext = RunContext;
void needsUnicode;

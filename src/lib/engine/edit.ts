// src/lib/engine/edit.ts
//
// Six handlers: watermark-pdf, page-numbers-pdf, sign-pdf, bates-numbering,
// overlay-pdf, header-footer-pdf. All edit the original pages in place with pdf-lib,
// so text, links, forms and bookmarks survive (overlay "background" excepted: see below).
//
// HONEST LIMITS
//  * Everything stamped is an ordinary page element. None of it is secured: anyone with
//    PDF editing software can move or delete it.
//  * Text uses Helvetica. Non-Latin text needs the optional Unicode TTF (see stamp-utils).
//  * sign-pdf places an IMAGE of a signature. It is not a cryptographic digital signature.
//  * Encrypted inputs are rejected with a friendly message; run Unlock PDF first.
//  * Overlay "background" re-orders the page's content streams so the overlay is painted
//    first. If a page's /Contents cannot be re-ordered, that page keeps a foreground overlay
//    and the note says so.
//  * Overlay ignores /Rotate on the overlay file's own pages (they embed unrotated).

import { PDFArray } from 'pdf-lib';
import type { PDFDocument, PDFPage } from 'pdf-lib';
import { ToolError } from './types';
import type { HandlerMap, ResultFile, RunContext, ToolResult } from './types';
import { loadPdfLibDocument, pdfResultFile, savePdfBytes, throwIfAborted, yieldToMain } from './shared';
import { bytesOf, clampNum, optFlag, optNum, optStr, pad, progress, stem } from './handler-utils';
import {
  anchorBox,
  drawEmbeddedAt,
  drawImageAt,
  drawTextAt,
  drawTextCentered,
  embedTextFont,
  expandTokens,
  pageFrame,
  parseAnchor,
  parseColor,
  unitOpacity,
} from './stamp-utils';

/* -------------------------------- helpers ---------------------------------- */

async function openForEdit(file: File): Promise<PDFDocument> {
  const bytes = await bytesOf(file);
  return loadPdfLibDocument(bytes, { ignoreEncryption: false, fileName: file.name });
}

async function finish(doc: PDFDocument, name: string): Promise<ResultFile> {
  const out = await savePdfBytes(doc);
  return pdfResultFile(out, name);
}

function joinNotes(...parts: Array<string | undefined | false>): string | undefined {
  const s = parts.filter(Boolean).join(' ');
  return s || undefined;
}

async function tick(i: number): Promise<void> {
  if (i % 8 === 7) await yieldToMain();
}

/* ------------------------------ 1 · watermark ------------------------------ */

async function watermarkPdf(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  const text = optStr(ctx.options, 'text', '').trim();
  if (!text) throw new ToolError('Enter the watermark text.', 'invalid-input');
  const baseSize = clampNum(optNum(ctx.options, 'fontSize', 48), 6, 400);
  const opacity = unitOpacity(optNum(ctx.options, 'opacity', 0.3));
  const angle = clampNum(optNum(ctx.options, 'rotation', 45), -360, 360);
  const color = parseColor(optStr(ctx.options, 'color', '#888888'), [0.53, 0.53, 0.53]);
  const tiled = optStr(ctx.options, 'layout', 'center') === 'tiled';

  progress(ctx, 3, 'Opening PDF…');
  const doc = await openForEdit(file);
  const sf = await embedTextFont(doc, text, true);
  const label = sf.encode(text).trim();
  if (!label) throw new ToolError('The watermark text contains no printable characters.', 'invalid-input');

  const rad = (angle * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  const pages = doc.getPages();

  for (let i = 0; i < pages.length; i++) {
    throwIfAborted(ctx.signal);
    const page = pages[i];
    const frame = pageFrame(page);

    if (!tiled) {
      const w0 = sf.font.widthOfTextAtSize(label, baseSize);
      const fit = Math.min(1, (frame.vw * 0.9) / (w0 * c + baseSize * s), (frame.vh * 0.9) / (w0 * s + baseSize * c));
      drawTextCentered(page, frame, label, frame.vw / 2, frame.vh / 2, {
        size: baseSize * fit,
        font: sf.font,
        color,
        opacity,
        angle,
      });
    } else {
      const w = sf.font.widthOfTextAtSize(label, baseSize);
      let stepX = w * c + baseSize * s + baseSize;
      let stepY = w * s + baseSize * c + baseSize;
      let cols = Math.ceil(frame.vw / stepX) + 1;
      let rows = Math.ceil(frame.vh / stepY) + 1;
      while (cols * rows > 400) {
        stepX *= 1.3;
        stepY *= 1.3;
        cols = Math.ceil(frame.vw / stepX) + 1;
        rows = Math.ceil(frame.vh / stepY) + 1;
      }
      for (let j = 0; j < rows; j++) {
        const cy = stepY * (j + 0.5);
        const start = j % 2 ? stepX : stepX / 2;
        for (let cx = start - stepX; cx < frame.vw + stepX / 2; cx += stepX) {
          drawTextCentered(page, frame, label, cx, cy, { size: baseSize, font: sf.font, color, opacity, angle });
        }
      }
    }
    progress(ctx, 8 + (84 * (i + 1)) / pages.length, `Watermarking page ${i + 1} of ${pages.length}`);
    await tick(i);
  }

  progress(ctx, 95, 'Saving…');
  return {
    files: [await finish(doc, `${stem(file.name)}-watermarked.pdf`)],
    note: joinNotes(
      `Watermark added to ${pages.length} page${pages.length === 1 ? '' : 's'}. It is a normal page element, not a secured one.`,
      sf.warning,
    ),
  };
}

/* ----------------------------- 2 · page numbers ----------------------------- */

function numberLabel(format: string, n: number, total: number): string {
  switch (format) {
    case 'page-n':
      return `Page ${n}`;
    case 'n-of-total':
      return `${n} of ${total}`;
    case 'page-n-of-total':
      return `Page ${n} of ${total}`;
    default:
      return String(n);
  }
}

async function pageNumbersPdf(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  const anchor = parseAnchor(optStr(ctx.options, 'position', 'bottom-center'), { v: 'bottom', h: 'center' });
  const format = optStr(ctx.options, 'format', 'n');
  const start = Math.round(clampNum(optNum(ctx.options, 'start', 1), -9999, 999999));
  const size = clampNum(optNum(ctx.options, 'fontSize', 11), 6, 48);
  const skipFirst = optFlag(ctx.options, 'skipFirst', false);

  progress(ctx, 3, 'Opening PDF…');
  const doc = await openForEdit(file);
  const sf = await embedTextFont(doc, 'Page 0123456789 of', false);
  const pages = doc.getPages();
  const total = start + pages.length - 1;
  let stamped = 0;

  for (let i = 0; i < pages.length; i++) {
    throwIfAborted(ctx.signal);
    if (!(skipFirst && i === 0)) {
      const page = pages[i];
      const frame = pageFrame(page);
      const label = numberLabel(format, start + i, total);
      const w = sf.font.widthOfTextAtSize(label, size);
      const box = anchorBox(frame, anchor, w, size, 28);
      drawTextAt(page, frame, label, box.x, box.y + size * 0.2, { size, font: sf.font, color: parseColor('#000000') });
      stamped++;
    }
    progress(ctx, 8 + (84 * (i + 1)) / pages.length, `Numbering page ${i + 1} of ${pages.length}`);
    await tick(i);
  }

  progress(ctx, 95, 'Saving…');
  return {
    files: [await finish(doc, `${stem(file.name)}-numbered.pdf`)],
    note: joinNotes(
      `Numbered ${stamped} page${stamped === 1 ? '' : 's'}.`,
      skipFirst && 'The first page is not numbered but still counts toward the sequence.',
      'Numbers are drawn over existing content; leave room in your layout if the margin is crowded.',
    ),
  };
}

/* --------------------------------- 3 · sign --------------------------------- */

function decodeDataUrl(value: string): { bytes: Uint8Array; mime: string } | null {
  const m = /^data:([^;,]+)(?:;[^,]*)?;base64,(.*)$/s.exec(value.trim());
  if (!m) return null;
  try {
    const bin = atob(m[2]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { bytes, mime: m[1].toLowerCase() };
  } catch {
    return null;
  }
}

/**
 * ASSUMPTION (check against the registry): `width` ≤ 100 is a percentage of the page
 * width; anything larger is points.
 */
function signatureWidthPt(width: number, pageWidth: number): number {
  return width <= 100 ? (pageWidth * clampNum(width, 5, 100)) / 100 : width;
}

async function signPdf(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  // Contract with the UI: the signature option is a PNG (or JPEG) data URL.
  const decoded = decodeDataUrl(optStr(ctx.options, 'signature', ''));
  if (!decoded) throw new ToolError('Draw or add your signature first.', 'invalid-input');
  if (decoded.mime !== 'image/png' && decoded.mime !== 'image/jpeg') {
    throw new ToolError('The signature must be a PNG or JPEG image.', 'invalid-input');
  }
  const target = optStr(ctx.options, 'target', 'last');
  const anchor = parseAnchor(optStr(ctx.options, 'position', 'bottom-right'), { v: 'bottom', h: 'right' });
  const width = optNum(ctx.options, 'width', 25);

  progress(ctx, 3, 'Opening PDF…');
  const doc = await openForEdit(file);
  const pages = doc.getPages();
  const n = pages.length;

  let indexes: number[];
  if (target === 'first') indexes = [0];
  else if (target === 'all') indexes = pages.map((_, i) => i);
  else if (target === 'custom') {
    const p = Math.round(optNum(ctx.options, 'customPage', 1));
    if (p < 1 || p > n) throw new ToolError(`Page ${p} does not exist — this PDF has ${n} page${n === 1 ? '' : 's'}.`, 'invalid-input');
    indexes = [p - 1];
  } else indexes = [n - 1];

  const image = decoded.mime === 'image/png' ? await doc.embedPng(decoded.bytes) : await doc.embedJpg(decoded.bytes);
  const ratio = image.height / Math.max(1, image.width);

  indexes.forEach((i, k) => {
    throwIfAborted(ctx.signal);
    const page = pages[i];
    const frame = pageFrame(page);
    let w = signatureWidthPt(width, frame.vw);
    let h = w * ratio;
    const maxH = frame.vh * 0.5;
    if (h > maxH) {
      w *= maxH / h;
      h = maxH;
    }
    w = Math.min(w, frame.vw - 20);
    const box = anchorBox(frame, anchor, w, h, 36);
    drawImageAt(page, frame, image, box.x, box.y, w, h, 1);
    progress(ctx, 10 + (80 * (k + 1)) / indexes.length, `Signing page ${i + 1}`);
  });

  progress(ctx, 95, 'Saving…');
  return {
    files: [await finish(doc, `${stem(file.name)}-signed.pdf`)],
    note: `Signature placed on ${indexes.length} page${indexes.length === 1 ? '' : 's'}. This is a visual (image) signature, not a cryptographic digital signature, and it can be removed by anyone who can edit the PDF.`,
  };
}

/* ------------------------------- 4 · Bates ---------------------------------- */

async function batesNumbering(ctx: RunContext): Promise<ToolResult> {
  const prefix = optStr(ctx.options, 'prefix', '');
  const suffix = optStr(ctx.options, 'suffix', '');
  const digits = Math.round(clampNum(optNum(ctx.options, 'digits', 6), 1, 12));
  let counter = Math.max(0, Math.round(optNum(ctx.options, 'start', 1)));
  const anchor = parseAnchor(optStr(ctx.options, 'position', 'bottom-right'), { v: 'bottom', h: 'right' });
  const size = clampNum(optNum(ctx.options, 'fontSize', 10), 6, 36);

  const files: ResultFile[] = [];
  const ranges: string[] = [];
  const used = new Set<string>();
  const warnings = new Set<string>();

  for (let f = 0; f < ctx.files.length; f++) {
    const file = ctx.files[f];
    const from = 4 + (90 * f) / ctx.files.length;
    const to = 4 + (90 * (f + 1)) / ctx.files.length;
    progress(ctx, from, `Opening ${file.name}…`);

    const doc = await openForEdit(file);
    const sf = await embedTextFont(doc, prefix + suffix + '0123456789', false);
    if (sf.warning) warnings.add(sf.warning);
    const pages = doc.getPages();
    const first = counter;

    for (let i = 0; i < pages.length; i++) {
      throwIfAborted(ctx.signal);
      const page = pages[i];
      const frame = pageFrame(page);
      const label = sf.encode(`${prefix}${pad(counter, digits)}${suffix}`);
      const w = sf.font.widthOfTextAtSize(label, size);
      const box = anchorBox(frame, anchor, w, size, 24);
      drawTextAt(page, frame, label, box.x, box.y + size * 0.2, { size, font: sf.font, color: parseColor('#000000') });
      counter++;
      progress(ctx, from + ((to - from) * (i + 1)) / pages.length, `${file.name}: page ${i + 1} of ${pages.length}`);
      await tick(i);
    }

    let name = `${stem(file.name)}-bates.pdf`;
    for (let k = 2; used.has(name.toLowerCase()); k++) name = `${stem(file.name)}-bates-${k}.pdf`;
    used.add(name.toLowerCase());
    files.push(await finish(doc, name));
    ranges.push(`${file.name}: ${prefix}${pad(first, digits)}${suffix} – ${prefix}${pad(counter - 1, digits)}${suffix}`);
  }

  const shown = ranges.slice(0, 6).join(' · ') + (ranges.length > 6 ? ` · …and ${ranges.length - 6} more` : '');
  return {
    files,
    note: joinNotes(
      `Numbered ${counter - Math.max(0, Math.round(optNum(ctx.options, 'start', 1)))} pages continuously in the order the files were added. ${shown}`,
      ...warnings,
    ),
  };
}

/* ------------------------------- 5 · overlay -------------------------------- */

/** pdf-lib appends new content last; move that new stream to the front (paint first). */
function sendNewContentToBack(page: PDFPage): boolean {
  const contents = page.node.Contents();
  if (!(contents instanceof PDFArray)) return false;
  const size = contents.size();
  if (size <= 1) return true;
  const last = contents.get(size - 1);
  contents.remove(size - 1);
  contents.insert(0, last);
  return true;
}

async function overlayPdf(ctx: RunContext): Promise<ToolResult> {
  const [baseFile, overlayFile] = ctx.files;
  const background = optStr(ctx.options, 'placement', 'foreground') === 'background';
  const matchPages = optStr(ctx.options, 'pageMode', 'first') === 'match';
  const opacity = unitOpacity(optNum(ctx.options, 'opacity', 1));

  progress(ctx, 3, 'Opening files…');
  const baseDoc = await openForEdit(baseFile);
  const overlayDoc = await openForEdit(overlayFile);
  const basePages = baseDoc.getPages();
  const overlayPages = overlayDoc.getPages();
  if (!overlayPages.length) throw new ToolError('The overlay PDF has no pages.', 'invalid-input');

  const needed = matchPages ? overlayPages.slice(0, basePages.length) : [overlayPages[0]];
  const embedded = await baseDoc.embedPages(needed);

  let applied = 0;
  let notReordered = 0;
  for (let i = 0; i < basePages.length; i++) {
    throwIfAborted(ctx.signal);
    const emb = embedded[matchPages ? i : 0];
    if (emb) {
      const page = basePages[i];
      const frame = pageFrame(page);
      const k = Math.min(frame.vw / emb.width, frame.vh / emb.height);
      const w = emb.width * k;
      const h = emb.height * k;
      drawEmbeddedAt(page, frame, emb, (frame.vw - w) / 2, (frame.vh - h) / 2, w, h, opacity);
      if (background && !sendNewContentToBack(page)) notReordered++;
      applied++;
    }
    progress(ctx, 10 + (82 * (i + 1)) / basePages.length, `Overlaying page ${i + 1} of ${basePages.length}`);
    await tick(i);
  }

  progress(ctx, 95, 'Saving…');
  const skipped = basePages.length - applied;
  return {
    files: [await finish(baseDoc, `${stem(baseFile.name)}-overlay.pdf`)],
    note: joinNotes(
      `Overlay applied to ${applied} of ${basePages.length} page${basePages.length === 1 ? '' : 's'}, scaled to fit each page.`,
      skipped > 0 && `${skipped} page${skipped === 1 ? '' : 's'} had no matching overlay page and ${skipped === 1 ? 'was' : 'were'} left unchanged.`,
      notReordered > 0 && `${notReordered} page${notReordered === 1 ? '' : 's'} could not be re-ordered and received a foreground overlay instead.`,
      opacity < 1 && 'Overlay transparency depends on the installed pdf-lib supporting opacity on embedded pages.',
    ),
  };
}

/* --------------------------- 6 · header & footer ---------------------------- */

async function headerFooterPdf(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  const header = optStr(ctx.options, 'header', '');
  const footer = optStr(ctx.options, 'footer', 'Page {page} of {total}');
  if (!header.trim() && !footer.trim()) throw new ToolError('Enter header text, footer text, or both.', 'invalid-input');
  const align = parseAnchor(optStr(ctx.options, 'align', 'center'), { v: 'bottom', h: 'center' }).h;
  const size = clampNum(optNum(ctx.options, 'fontSize', 10), 6, 48);
  // ASSUMPTION: margin is in points.
  const margin = clampNum(optNum(ctx.options, 'margin', 24), 0, 200);
  const skipFirst = optFlag(ctx.options, 'skipFirst', false);

  progress(ctx, 3, 'Opening PDF…');
  const doc = await openForEdit(file);
  const sf = await embedTextFont(doc, header + footer + '0123456789', false);
  const pages = doc.getPages();
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  let stamped = 0;

  for (let i = 0; i < pages.length; i++) {
    throwIfAborted(ctx.signal);
    if (!(skipFirst && i === 0)) {
      const page = pages[i];
      const frame = pageFrame(page);
      const tokens = { page: i + 1, total: pages.length, date };
      const place = (raw: string, top: boolean) => {
        const text = sf.encode(expandTokens(raw, tokens)).trim();
        if (!text) return;
        const w = sf.font.widthOfTextAtSize(text, size);
        const x = align === 'left' ? margin : align === 'right' ? frame.vw - margin - w : (frame.vw - w) / 2;
        const y = top ? frame.vh - margin - size * 0.8 : margin + size * 0.2;
        drawTextAt(page, frame, text, Math.max(0, x), y, { size, font: sf.font, color: parseColor('#000000') });
      };
      if (header.trim()) place(header, true);
      if (footer.trim()) place(footer, false);
      stamped++;
    }
    progress(ctx, 8 + (84 * (i + 1)) / pages.length, `Stamping page ${i + 1} of ${pages.length}`);
    await tick(i);
  }

  progress(ctx, 95, 'Saving…');
  return {
    files: [await finish(doc, `${stem(file.name)}-header-footer.pdf`)],
    note: joinNotes(
      `Header/footer added to ${stamped} page${stamped === 1 ? '' : 's'}. Text is drawn over existing content; very long lines are not wrapped.`,
      sf.warning,
    ),
  };
}

/* ------------------------------- handler map -------------------------------- */

export const handlers: HandlerMap = {
  'watermark-pdf': (ctx) => watermarkPdf(ctx),
  'page-numbers-pdf': (ctx) => pageNumbersPdf(ctx),
  'sign-pdf': (ctx) => signPdf(ctx),
  'bates-numbering': (ctx) => batesNumbering(ctx),
  'overlay-pdf': (ctx) => overlayPdf(ctx),
  'header-footer-pdf': (ctx) => headerFooterPdf(ctx),
};

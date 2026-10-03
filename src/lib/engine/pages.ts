"use client";
import { PDFDocument, StandardFonts, rgb, degrees, PageSizes } from "pdf-lib";
import JSZip from "jszip";
import {
  fileToUint8Array,
  parsePageRanges,
  sanitizeBaseName,
  fileResult,
  bytesToBlob,
  EngineFileResult,
  ToolError,
} from "./utils";

async function loadDoc(file: File) {
  const bytes = await fileToUint8Array(file);
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

export async function mergePdfs(files: File[]): Promise<EngineFileResult> {
  if (files.length < 2) throw new ToolError("Please add at least two PDF files to merge.");
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await loadDoc(file);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), "merged.pdf");
}

export async function splitPdfEachPage(file: File): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  if (count < 2) throw new ToolError("This PDF only has one page.");
  const zip = new JSZip();
  const base = sanitizeBaseName(file.name);
  for (let i = 0; i < count; i++) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(src, [i]);
    out.addPage(page);
    const bytes = await out.save();
    zip.file(`${base}-page-${i + 1}.pdf`, bytes);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return fileResult(blob, `${base}-split.zip`);
}

export async function splitPdfByRange(file: File, rangeStr: string): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const indices = parsePageRanges(rangeStr, count);
  if (!indices.length) throw new ToolError("Enter a valid page range, e.g. 1-3,5.");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-extract.pdf`);
}

export async function splitPdfBySize(file: File, maxKb: number): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const maxBytes = Math.max(50, maxKb) * 1024;
  const zip = new JSZip();
  const base = sanitizeBaseName(file.name);
  let partIndex = 1;
  let current = await PDFDocument.create();
  let pagesInCurrent = 0;

  async function flush() {
    if (pagesInCurrent === 0) return;
    const bytes = await current.save();
    zip.file(`${base}-part-${partIndex}.pdf`, bytes);
    partIndex++;
    current = await PDFDocument.create();
    pagesInCurrent = 0;
  }

  for (let i = 0; i < count; i++) {
    const [page] = await current.copyPages(src, [i]);
    current.addPage(page);
    pagesInCurrent++;
    const estBytes = await current.save();
    if (estBytes.length > maxBytes && pagesInCurrent > 1) {
      current.removePage(current.getPageCount() - 1);
      await flush();
      const [p2] = await current.copyPages(src, [i]);
      current.addPage(p2);
      pagesInCurrent = 1;
    }
  }
  await flush();
  if (partIndex <= 2) {
    const only = zip.file(`${base}-part-1.pdf`);
    if (only) {
      const data = await only.async("blob");
      return fileResult(data, `${base}-part-1.pdf`);
    }
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return fileResult(blob, `${base}-size-split.zip`);
}

export async function removePages(file: File, rangeStr: string): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const toRemove = new Set(parsePageRanges(rangeStr, count));
  if (!toRemove.size) throw new ToolError("Enter the page numbers to remove, e.g. 2,4-5.");
  const keep = Array.from({ length: count }, (_, i) => i).filter((i) => !toRemove.has(i));
  if (!keep.length) throw new ToolError("You can't remove every page.");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, keep);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-removed.pdf`);
}

export async function extractPages(file: File, rangeStr: string): Promise<EngineFileResult> {
  return splitPdfByRange(file, rangeStr);
}

export async function organizePdf(file: File, orderStr: string): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const order = orderStr
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= count)
    .map((n) => n - 1);
  if (order.length !== count) {
    throw new ToolError(`Provide all ${count} page numbers in the new order, separated by commas.`);
  }
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, order);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-organized.pdf`);
}

export async function reversePages(file: File): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const order = Array.from({ length: count }, (_, i) => count - 1 - i);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, order);
  pages.forEach((p) => out.addPage(p));
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-reversed.pdf`);
}

export async function duplicatePages(file: File, rangeStr: string): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const indices = rangeStr.trim() ? parsePageRanges(rangeStr, count) : Array.from({ length: count }, (_, i) => i);
  const out = await PDFDocument.create();
  for (let i = 0; i < count; i++) {
    const [page] = await out.copyPages(src, [i]);
    out.addPage(page);
    if (indices.includes(i)) {
      const [dup] = await out.copyPages(src, [i]);
      out.addPage(dup);
    }
  }
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-duplicated.pdf`);
}

export async function insertBlankPage(file: File, position: number, afterPage: number): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const out = await PDFDocument.create();
  const insertAt = Math.min(Math.max(afterPage, 0), count);
  for (let i = 0; i < count; i++) {
    const [page] = await out.copyPages(src, [i]);
    out.addPage(page);
    if (i + 1 === insertAt) {
      const size = position === 1 ? PageSizes.A4 : PageSizes.Letter;
      out.addPage(size as [number, number]);
    }
  }
  if (insertAt === 0) {
    const size = position === 1 ? PageSizes.A4 : PageSizes.Letter;
    out.insertPage(0, out.addPage(size as [number, number]));
  }
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-inserted.pdf`);
}

export async function rotatePdf(file: File, angle: number, rangeStr: string): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const targets = rangeStr.trim() ? new Set(parsePageRanges(rangeStr, count)) : null;
  const pages = src.getPages();
  pages.forEach((page, i) => {
    if (!targets || targets.has(i)) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angle) % 360));
    }
  });
  const bytes = await src.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-rotated.pdf`);
}

export async function cropPdf(
  file: File,
  margins: { top: number; right: number; bottom: number; left: number }
): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  src.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.setCropBox(
      margins.left,
      margins.bottom,
      Math.max(10, width - margins.left - margins.right),
      Math.max(10, height - margins.top - margins.bottom)
    );
  });
  const bytes = await src.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-cropped.pdf`);
}

export async function addWatermark(
  file: File,
  text: string,
  opacity: number,
  fontSize: number,
  rotation: number,
  colorHex: string
): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const font = await src.embedFont(StandardFonts.HelveticaBold);
  const color = hexToRgb(colorHex);
  src.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(rotation),
    });
  });
  const bytes = await src.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-watermarked.pdf`);
}

export async function addStamp(
  file: File,
  imageFile: File,
  position: string,
  widthPt: number
): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const imgBytes = await fileToUint8Array(imageFile);
  const isPng = imageFile.type.includes("png");
  const image = isPng ? await src.embedPng(imgBytes) : await src.embedJpg(imgBytes);
  const ratio = image.height / image.width;
  const w = widthPt;
  const h = w * ratio;
  src.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const pad = 24;
    let x = pad;
    let y = pad;
    if (position.includes("right")) x = width - w - pad;
    if (position.includes("center")) x = width / 2 - w / 2;
    if (position.includes("top")) y = height - h - pad;
    if (position.includes("middle")) y = height / 2 - h / 2;
    page.drawImage(image, { x, y, width: w, height: h, opacity: 0.9 });
  });
  const bytes = await src.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-stamped.pdf`);
}

export async function addPageNumbers(
  file: File,
  position: string,
  startAt: number,
  format: string
): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const font = await src.embedFont(StandardFonts.Helvetica);
  const pages = src.getPages();
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    const num = startAt + i;
    const label = format.replace("{n}", String(num)).replace("{total}", String(pages.length));
    const size = 10;
    const textWidth = font.widthOfTextAtSize(label, size);
    let x = width / 2 - textWidth / 2;
    if (position.includes("left")) x = 36;
    if (position.includes("right")) x = width - textWidth - 36;
    const y = position.includes("top") ? page.getSize().height - 30 : 20;
    page.drawText(label, { x, y, size, font, color: rgb(0.2, 0.2, 0.2) });
  });
  const bytes = await src.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-numbered.pdf`);
}

export async function addHeaderFooter(file: File, header: string, footer: string): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const font = await src.embedFont(StandardFonts.Helvetica);
  src.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    if (header) {
      page.drawText(header, { x: 36, y: height - 28, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    }
    if (footer) {
      page.drawText(footer, { x: 36, y: 18, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    }
  });
  const bytes = await src.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-headerfooter.pdf`);
}

export async function nUpPdf(file: File, n: number): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const count = src.getPageCount();
  const cols = n === 2 ? 2 : 2;
  const rows = n === 2 ? 1 : 2;
  const [pageW, pageH] = PageSizes.A4;
  const out = await PDFDocument.create();
  const embeddedPages = await out.embedPages(src.getPages());
  for (let i = 0; i < count; i += n) {
    const page = out.addPage([pageW, pageH]);
    const cellW = pageW / cols;
    const cellH = pageH / rows;
    for (let slot = 0; slot < n && i + slot < count; slot++) {
      const embedded = embeddedPages[i + slot];
      const scale = Math.min(cellW / embedded.width, cellH / embedded.height) * 0.92;
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      const x = col * cellW + (cellW - embedded.width * scale) / 2;
      const y = pageH - (row + 1) * cellH + (cellH - embedded.height * scale) / 2;
      page.drawPage(embedded, { x, y, xScale: scale, yScale: scale });
    }
  }
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-nup.pdf`);
}

export async function editMetadata(
  file: File,
  meta: { title: string; author: string; subject: string; keywords: string }
): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  src.setTitle(meta.title || "");
  src.setAuthor(meta.author || "");
  src.setSubject(meta.subject || "");
  src.setKeywords(meta.keywords ? meta.keywords.split(",").map((k) => k.trim()).filter(Boolean) : []);
  src.setProducer("PDF Lovers");
  src.setModificationDate(new Date());
  const bytes = await src.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-metadata.pdf`);
}

export async function fillAndFlattenForm(file: File): Promise<EngineFileResult> {
  const src = await loadDoc(file);
  const form = src.getForm();
  try {
    form.flatten();
  } catch {
    throw new ToolError("This PDF doesn't contain a fillable form, or it could not be flattened.");
  }
  const bytes = await src.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-flattened.pdf`);
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}

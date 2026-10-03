"use client";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { loadPdfDocument, renderPageToCanvas, canvasToBlob } from "./pdfjs";
import { fileToUint8Array, sanitizeBaseName, fileResult, bytesToBlob, EngineFileResult, ToolError } from "./utils";

export async function pdfToImages(
  file: File,
  format: "jpeg" | "png",
  scale: number,
  password?: string
): Promise<EngineFileResult> {
  const data = await fileToUint8Array(file);
  const pdf = await loadPdfDocument(data, password);
  const base = sanitizeBaseName(file.name);
  const ext = format === "jpeg" ? "jpg" : "png";
  const mime = format === "jpeg" ? "image/jpeg" : "image/png";

  if (pdf.numPages === 1) {
    const canvas = await renderPageToCanvas(pdf, 1, scale);
    const blob = await canvasToBlob(canvas, mime, 0.92);
    return fileResult(blob, `${base}.${ext}`);
  }

  const zip = new JSZip();
  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, scale);
    const blob = await canvasToBlob(canvas, mime, 0.92);
    zip.file(`${base}-page-${i}.${ext}`, blob);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return fileResult(blob, `${base}-images.zip`);
}

export async function imagesToPdf(
  files: File[],
  pageFit: "fit" | "fill",
  marginPt: number
): Promise<EngineFileResult> {
  if (!files.length) throw new ToolError("Please add at least one image.");
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = await fileToUint8Array(file);
    const isPng = file.type.includes("png") || file.name.toLowerCase().endsWith(".png");
    const image = isPng ? await out.embedPng(bytes) : await out.embedJpg(bytes);
    const pageW = 595.28;
    const pageH = 841.89;
    const page = out.addPage([pageW, pageH]);
    const availW = pageW - marginPt * 2;
    const availH = pageH - marginPt * 2;
    const ratio = image.width / image.height;
    let w = availW;
    let h = w / ratio;
    if (h > availH) {
      h = availH;
      w = h * ratio;
    }
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    page.drawImage(image, { x, y, width: w, height: h });
  }
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), "images-to-pdf.pdf");
}

export async function extractImagesAsPages(file: File, scale: number, password?: string): Promise<EngineFileResult> {
  return pdfToImages(file, "png", scale, password);
}

export async function compressPdf(
  file: File,
  quality: number,
  scale: number,
  password?: string
): Promise<EngineFileResult> {
  const original = await fileToUint8Array(file);
  const pdf = await loadPdfDocument(original, password);
  const out = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, scale);
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const image = await out.embedJpg(bytes);
    const page = out.addPage([canvas.width * (72 / 96) / scale, canvas.height * (72 / 96) / scale]);
    const { width, height } = page.getSize();
    page.drawImage(image, { x: 0, y: 0, width, height });
  }
  const bytes = await out.save();
  const blob = bytesToBlob(bytes, "application/pdf");
  if (blob.size >= original.length) {
    throw new ToolError(
      "This PDF is already well optimized — compressing it further would increase file size, so no file was produced."
    );
  }
  return fileResult(blob, `${sanitizeBaseName(file.name)}-compressed.pdf`);
}

export async function grayscalePdf(file: File, scale: number, password?: string): Promise<EngineFileResult> {
  const original = await fileToUint8Array(file);
  const pdf = await loadPdfDocument(original, password);
  const out = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, scale);
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imageData.data;
    for (let p = 0; p < d.length; p += 4) {
      const gray = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114;
      d[p] = d[p + 1] = d[p + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const image = await out.embedJpg(bytes);
    const page = out.addPage([canvas.width * (72 / 96) / scale, canvas.height * (72 / 96) / scale]);
    const { width, height } = page.getSize();
    page.drawImage(image, { x: 0, y: 0, width, height });
  }
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-grayscale.pdf`);
}

export type RedactionBox = { page: number; xPct: number; yPct: number; wPct: number; hPct: number };

export async function redactPdf(
  file: File,
  boxes: RedactionBox[],
  scale: number,
  password?: string
): Promise<EngineFileResult> {
  const original = await fileToUint8Array(file);
  const pdf = await loadPdfDocument(original, password);
  const out = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, scale);
    const ctx = canvas.getContext("2d")!;
    const pageBoxes = boxes.filter((b) => b.page === i);
    ctx.fillStyle = "#000000";
    for (const b of pageBoxes) {
      ctx.fillRect(
        (b.xPct / 100) * canvas.width,
        (b.yPct / 100) * canvas.height,
        (b.wPct / 100) * canvas.width,
        (b.hPct / 100) * canvas.height
      );
    }
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const image = await out.embedJpg(bytes);
    const page = out.addPage([canvas.width * (72 / 96) / scale, canvas.height * (72 / 96) / scale]);
    const { width, height } = page.getSize();
    page.drawImage(image, { x: 0, y: 0, width, height });
  }
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-redacted.pdf`);
}

export async function repairPdf(file: File): Promise<EngineFileResult> {
  const original = await fileToUint8Array(file);
  try {
    const doc = await PDFDocument.load(original, { ignoreEncryption: true, throwOnInvalidObject: false });
    const bytes = await doc.save({ useObjectStreams: false });
    return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-repaired.pdf`);
  } catch {
    // Fallback: rebuild the document by rasterizing every page that pdf.js can still salvage.
    const pdf = await loadPdfDocument(original);
    const out = await PDFDocument.create();
    for (let i = 1; i <= pdf.numPages; i++) {
      const canvas = await renderPageToCanvas(pdf, i, 2);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const image = await out.embedJpg(bytes);
      const page = out.addPage([canvas.width * (72 / 96) / 2, canvas.height * (72 / 96) / 2]);
      const { width, height } = page.getSize();
      page.drawImage(image, { x: 0, y: 0, width, height });
    }
    const bytes = await out.save();
    return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-repaired.pdf`);
  }
}

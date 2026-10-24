"use client";

import {
  PDFDocument,
  degrees,
  rgb,
  StandardFonts,
} from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

/* -------------------------------------------------------------------------- */
/* WORKER BOOTSTRAP                                                           */
/* -------------------------------------------------------------------------- */

if (typeof window !== "undefined") {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs";
  }
}

/* -------------------------------------------------------------------------- */
/* MEMORY MANAGEMENT / SELF-HEALING UTILITIES                                */
/* -------------------------------------------------------------------------- */

export function purgeCanvas(canvas: HTMLCanvasElement | null | undefined): void {
  if (!canvas) return;
  try {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;
  } catch {
    /* no-op: canvas already garbage collected */
  }
}

export function revokeObjectUrls(urls: (string | null | undefined)[]): void {
  urls.forEach((url) => {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* no-op */
    }
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

function renderPageToCanvas(
  page: pdfjsLib.PDFPageProxy,
  scale: number
): { canvas: HTMLCanvasElement; renderTask: Promise<void> } {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to acquire 2D canvas rendering context.");
  }
  const renderTask = page.render({ canvasContext: ctx, viewport }).promise;
  return { canvas, renderTask };
}

/* -------------------------------------------------------------------------- */
/* CORE TOOL IMPLEMENTATIONS                                                 */
/* -------------------------------------------------------------------------- */

export async function mergePDFs(
  files: File[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  if (files.length < 2) {
    throw new Error("Please provide at least two PDF files to merge.");
  }
  const mergedPdf = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const bytes = await files[i].arrayBuffer();
    const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices()
    );
    copiedPages.forEach((page) => mergedPdf.addPage(page));
    onProgress?.(Math.round(((i + 1) / files.length) * 100));
  }
  const outBytes = await mergedPdf.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

export interface SplitRange {
  start: number;
  end: number;
}

export async function splitPDF(
  file: File,
  mode: "all" | "range",
  ranges?: SplitRange[]
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const zip = new JSZip();

  if (mode === "all") {
    for (let i = 0; i < totalPages; i++) {
      const newDoc = await PDFDocument.create();
      const [page] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(page);
      const pdfBytes = await newDoc.save();
      zip.file(`page-${String(i + 1).padStart(3, "0")}.pdf`, pdfBytes);
    }
  } else {
    if (!ranges || ranges.length === 0) {
      throw new Error("Please provide at least one valid page range.");
    }
    for (let r = 0; r < ranges.length; r++) {
      const { start, end } = ranges[r];
      const indices = Array.from(
        { length: Math.max(0, end - start + 1) },
        (_, i) => start - 1 + i
      ).filter((i) => i >= 0 && i < totalPages);
      if (indices.length === 0) continue;
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, indices);
      copiedPages.forEach((page) => newDoc.addPage(page));
      const pdfBytes = await newDoc.save();
      zip.file(`split-range-${r + 1}.pdf`, pdfBytes);
    }
  }

  return await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export async function rotatePDF(
  file: File,
  rotation: 90 | 180 | 270,
  pageIndices?: number[]
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const targets =
    pageIndices && pageIndices.length > 0
      ? pageIndices
      : doc.getPageIndices();

  targets.forEach((index) => {
    if (index < 0 || index >= doc.getPageCount()) return;
    const page = doc.getPage(index);
    const currentAngle = page.getRotation().angle;
    page.setRotation(degrees((currentAngle + rotation) % 360));
  });

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

export async function deletePages(
  file: File,
  pagesToRemove: number[]
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  if (pagesToRemove.length >= doc.getPageCount()) {
    throw new Error("Cannot delete all pages — a PDF requires at least one page.");
  }

  const sortedDescending = [...new Set(pagesToRemove)].sort((a, b) => b - a);
  sortedDescending.forEach((index) => {
    if (index >= 0 && index < doc.getPageCount()) {
      doc.removePage(index);
    }
  });

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

export async function extractPages(
  file: File,
  pageNumbers: number[]
): Promise<Blob> {
  if (pageNumbers.length === 0) {
    throw new Error("Please select at least one page to extract.");
  }
  const bytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();
  const indices = pageNumbers
    .map((n) => n - 1)
    .filter((i) => i >= 0 && i < srcDoc.getPageCount());

  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  const outBytes = await newDoc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

export type CompressionQuality = "low" | "medium" | "high";

export async function compressPDF(
  file: File,
  quality: CompressionQuality = "medium",
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const scaleMap: Record<CompressionQuality, number> = {
    low: 0.6,
    medium: 1.0,
    high: 1.5,
  };
  const jpegQualityMap: Record<CompressionQuality, number> = {
    low: 0.4,
    medium: 0.65,
    high: 0.85,
  };

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const outDoc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const { canvas, renderTask } = renderPageToCanvas(page, scaleMap[quality]);
    await renderTask;

    const jpegDataUrl = canvas.toDataURL("image/jpeg", jpegQualityMap[quality]);
    const jpegBytes = await (await fetch(jpegDataUrl)).arrayBuffer();
    const embeddedImage = await outDoc.embedJpg(jpegBytes);
    const newPage = outDoc.addPage([canvas.width, canvas.height]);
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    });

    purgeCanvas(canvas);
    onProgress?.(Math.round((i / pdf.numPages) * 100));
  }

  const outBytes = await outDoc.save({ useObjectStreams: true });
  return new Blob([outBytes], { type: "application/pdf" });
}

export type ImageFormat = "png" | "jpeg";

export async function pdfToImages(
  file: File,
  format: ImageFormat = "png",
  scale = 2,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const zip = new JSZip();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const { canvas, renderTask } = renderPageToCanvas(page, scale);
    await renderTask;

    const mime = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mime, 0.92);
    const base64 = dataUrl.split(",")[1] ?? "";
    const extension = format === "png" ? "png" : "jpg";
    zip.file(`page-${String(i).padStart(3, "0")}.${extension}`, base64, {
      base64: true,
    });

    purgeCanvas(canvas);
    onProgress?.(Math.round((i / pdf.numPages) * 100));
  }

  return await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export async function imagesToPDF(
  files: File[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error("Please upload at least one image.");
  }
  const doc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const bytes = await file.arrayBuffer();
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    const embeddedImage = isPng
      ? await doc.embedPng(bytes)
      : await doc.embedJpg(bytes);

    const page = doc.addPage([embeddedImage.width, embeddedImage.height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: embeddedImage.width,
      height: embeddedImage.height,
    });

    onProgress?.(Math.round(((i + 1) / files.length) * 100));
  }

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

export interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: number;
  color?: { r: number; g: number; b: number };
  rotationDeg?: number;
}

export async function addWatermark(
  file: File,
  options: WatermarkOptions
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  const opacity = options.opacity ?? 0.3;
  const fontSize = options.fontSize ?? 50;
  const color = options.color ?? { r: 0.5, g: 0.5, b: 0.5 };
  const rotation = options.rotationDeg ?? 45;
  const text = options.text || "PDF Lovers Pro";

  doc.getPages().forEach((page) => {
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

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

export async function pdfToWord(
  file: File,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const paragraphs: Paragraph[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? (item as { str: string }).str : ""))
      .join(" ");

    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: pageText || " " })],
      })
    );
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

    onProgress?.(Math.round((i / pdf.numPages) * 100));
  }

  const docxDoc = new DocxDocument({
    sections: [{ children: paragraphs }],
  });

  return await Packer.toBlob(docxDoc);
}

export async function excelToPdf(
  file: File,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(bytes, { type: "array" });
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const sheetNames = workbook.SheetNames;
  const pageWidth = 842;
  const pageHeight = 595;
  const marginX = 30;
  const rowHeight = 18;
  const colWidth = 90;

  for (let s = 0; s < sheetNames.length; s++) {
    const sheet = workbook.Sheets[sheetNames[s]];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
    });

    let page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - 35;
    page.drawText(`Sheet: ${sheetNames[s]}`, {
      x: marginX,
      y: pageHeight - 20,
      size: 12,
      font: fontBold,
    });

    for (let r = 0; r < rows.length; r++) {
      if (y < 40) {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - 20;
      }
      const row = rows[r] ?? [];
      for (let c = 0; c < row.length; c++) {
        const cellText = String(row[c] ?? "").slice(0, 20);
        const xPos = marginX + c * colWidth;
        if (xPos > pageWidth - marginX) continue;
        page.drawText(cellText, {
          x: xPos,
          y,
          size: 9,
          font: r === 0 ? fontBold : fontRegular,
        });
      }
      y -= rowHeight;
    }

    onProgress?.(Math.round(((s + 1) / sheetNames.length) * 100));
  }

  const outBytes = await doc.save();
  return new Blob([outBytes], { type: "application/pdf" });
}

export async function ocrPDF(
  file: File,
  language = "eng",
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const { createWorker } = await import("tesseract.js");
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const worker = await createWorker(language);

  let fullText = "";

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const { canvas, renderTask } = renderPageToCanvas(page, 2);
      await renderTask;

      const {
        data: { text },
      } = await worker.recognize(canvas);
      fullText += `\n--- Page ${i} ---\n${text}\n`;

      purgeCanvas(canvas);
      onProgress?.(Math.round((i / pdf.numPages) * 100));
    }
  } finally {
    await worker.terminate();
  }

  return new Blob([fullText], { type: "text/plain;charset=utf-8" });
}

/* -------------------------------------------------------------------------- */
/* UNIVERSAL FACTORY DISPATCHER                                              */
/* -------------------------------------------------------------------------- */

export type ToolActionKey =
  | "merge"
  | "split"
  | "rotate"
  | "delete-pages"
  | "extract-pages"
  | "compress"
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "watermark"
  | "pdf-to-word"
  | "excel-to-pdf"
  | "ocr-pdf";

export interface RunToolParams {
  action: ToolActionKey;
  files: File[];
  options?: {
    mode?: "all" | "range";
    ranges?: SplitRange[];
    rotation?: 90 | 180 | 270;
    pages?: number[];
    quality?: CompressionQuality;
    scale?: number;
    text?: string;
    opacity?: number;
    fontSize?: number;
    rotationDeg?: number;
    color?: { r: number; g: number; b: number };
    language?: string;
  };
  onProgress?: (percent: number) => void;
}

export interface RunToolResult {
  blob: Blob;
  filename: string;
}

export async function runTool({
  action,
  files,
  options,
  onProgress,
}: RunToolParams): Promise<RunToolResult> {
  if (!files || files.length === 0) {
    throw new Error("Please upload at least one file to continue.");
  }

  switch (action) {
    case "merge":
      return {
        blob: await mergePDFs(files, onProgress),
        filename: "merged.pdf",
      };

    case "split":
      return {
        blob: await splitPDF(files[0], options?.mode ?? "all", options?.ranges),
        filename: "split-pages.zip",
      };

    case "rotate":
      return {
        blob: await rotatePDF(
          files[0],
          options?.rotation ?? 90,
          options?.pages
        ),
        filename: "rotated.pdf",
      };

    case "delete-pages":
      return {
        blob: await deletePages(files[0], options?.pages ?? []),
        filename: "edited.pdf",
      };

    case "extract-pages":
      return {
        blob: await extractPages(files[0], options?.pages ?? []),
        filename: "extracted.pdf",
      };

    case "compress":
      return {
        blob: await compressPDF(
          files[0],
          options?.quality ?? "medium",
          onProgress
        ),
        filename: "compressed.pdf",
      };

    case "pdf-to-jpg":
      return {
        blob: await pdfToImages(
          files[0],
          "jpeg",
          options?.scale ?? 2,
          onProgress
        ),
        filename: "pdf-images.zip",
      };

    case "jpg-to-pdf":
      return {
        blob: await imagesToPDF(files, onProgress),
        filename: "converted.pdf",
      };

    case "watermark":
      return {
        blob: await addWatermark(files[0], {
          text: options?.text ?? "PDF Lovers Pro",
          opacity: options?.opacity,
          fontSize: options?.fontSize,
          rotationDeg: options?.rotationDeg,
          color: options?.color,
        }),
        filename: "watermarked.pdf",
      };

    case "pdf-to-word":
      return {
        blob: await pdfToWord(files[0], onProgress),
        filename: "converted.docx",
      };

    case "excel-to-pdf":
      return {
        blob: await excelToPdf(files[0], onProgress),
        filename: "converted.pdf",
      };

    case "ocr-pdf":
      return {
        blob: await ocrPDF(files[0], options?.language ?? "eng", onProgress),
        filename: "ocr-extracted-text.txt",
      };

    default:
      throw new Error(`Unsupported tool action: ${action}`);
  }
}

export async function processAndDownload(params: RunToolParams): Promise<void> {
  const { blob, filename } = await runTool(params);
  downloadBlob(blob, filename);
}

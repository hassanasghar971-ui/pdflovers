"use client";
// Routes a tool slug + uploaded files + form field values to the correct
// client-side processing function. Every import below is dynamic so each
// tool's (sometimes heavy) dependencies are only downloaded when needed.
import { EngineResult, ToolError, infoResult } from "./utils";

export type RunArgs = {
  slug: string;
  files: File[];
  values: Record<string, string | number | boolean>;
  onProgress?: (msg: string) => void;
};

function str(v: unknown, fallback = ""): string {
  return v === undefined || v === null ? fallback : String(v);
}
function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function bool(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  if (v === undefined) return fallback;
  return v === "true" || v === "on" || v === "1";
}

export async function runTool({ slug, files, values, onProgress }: RunArgs): Promise<EngineResult> {
  const file = files[0];
  const password = str(values.password || values.pdfPassword) || undefined;

  switch (slug) {
    case "merge-pdf": {
      const { mergePdfs } = await import("./pages");
      return mergePdfs(files);
    }
    case "split-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { splitPdfEachPage } = await import("./pages");
      return splitPdfEachPage(file);
    }
    case "split-by-range": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { splitPdfByRange } = await import("./pages");
      return splitPdfByRange(file, str(values.range));
    }
    case "split-by-size": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { splitPdfBySize } = await import("./pages");
      return splitPdfBySize(file, num(values.maxKb, 1024));
    }
    case "compress-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { compressPdf } = await import("./images");
      return compressPdf(file, num(values.quality, 0.6), num(values.scale, 1.5), password);
    }
    case "pdf-to-word": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { pdfToWord } = await import("./convert");
      return pdfToWord(file, password);
    }
    case "word-to-pdf": {
      if (!file) throw new ToolError("Please choose a .docx file.");
      const { wordToPdf } = await import("./convert");
      return wordToPdf(file);
    }
    case "pdf-to-powerpoint": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { pdfToPowerPoint } = await import("./convert");
      return pdfToPowerPoint(file, password);
    }
    case "powerpoint-to-pdf": {
      if (!file) throw new ToolError("Please choose a .pptx file.");
      const { powerPointToPdf } = await import("./convert");
      return powerPointToPdf(file);
    }
    case "pdf-to-excel": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { pdfToExcel } = await import("./convert");
      return pdfToExcel(file, password);
    }
    case "excel-to-pdf": {
      if (!file) throw new ToolError("Please choose a spreadsheet file.");
      const { excelToPdf } = await import("./convert");
      return excelToPdf(file);
    }
    case "pdf-to-jpg": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { pdfToImages } = await import("./images");
      return pdfToImages(file, "jpeg", num(values.scale, 2), password);
    }
    case "pdf-to-png": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { pdfToImages } = await import("./images");
      return pdfToImages(file, "png", num(values.scale, 2), password);
    }
    case "jpg-to-pdf":
    case "png-to-pdf": {
      const { imagesToPdf } = await import("./images");
      return imagesToPdf(files, "fit", num(values.margin, 24));
    }
    case "edit-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const { fileToUint8Array, bytesToBlob, fileResult, sanitizeBaseName } = await import("./utils");
      const bytes = await fileToUint8Array(file);
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pageIndex = Math.min(Math.max(num(values.page, 1) - 1, 0), doc.getPageCount() - 1);
      const page = doc.getPages()[pageIndex];
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const hex = str(values.color, "#111827").replace("#", "");
      const bigint = parseInt(hex, 16);
      const color = rgb(((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255);
      page.drawText(str(values.text, ""), {
        x: num(values.x, 50),
        y: num(values.y, 50),
        size: num(values.size, 18),
        font,
        color,
      });
      const out = await doc.save();
      return fileResult(bytesToBlob(out, "application/pdf"), `${sanitizeBaseName(file.name)}-edited.pdf`);
    }
    case "sign-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { PDFDocument } = await import("pdf-lib");
      const { fileToUint8Array, bytesToBlob, fileResult, sanitizeBaseName } = await import("./utils");
      const signatureDataUrl = str(values.signatureDataUrl);
      if (!signatureDataUrl) throw new ToolError("Please draw a signature first.");
      const bytes = await fileToUint8Array(file);
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pngBytes = Uint8Array.from(atob(signatureDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
      const image = await doc.embedPng(pngBytes);
      const pageIndex = Math.min(Math.max(num(values.page, 1) - 1, 0), doc.getPageCount() - 1);
      const page = doc.getPages()[pageIndex];
      const w = num(values.width, 160);
      const h = w * (image.height / image.width);
      page.drawImage(image, { x: num(values.x, 60), y: num(values.y, 60), width: w, height: h });
      const out = await doc.save();
      return fileResult(bytesToBlob(out, "application/pdf"), `${sanitizeBaseName(file.name)}-signed.pdf`);
    }
    case "watermark-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { addWatermark } = await import("./pages");
      return addWatermark(
        file,
        str(values.text, "CONFIDENTIAL"),
        num(values.opacity, 0.25),
        num(values.fontSize, 60),
        num(values.rotation, 45),
        str(values.color, "#ef4444")
      );
    }
    case "add-stamp": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const stampFile = files[1];
      if (!stampFile) throw new ToolError("Please also upload a stamp/logo image.");
      const { addStamp } = await import("./pages");
      return addStamp(file, stampFile, str(values.position, "bottom-right"), num(values.width, 90));
    }
    case "header-footer": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { addHeaderFooter } = await import("./pages");
      return addHeaderFooter(file, str(values.header), str(values.footer));
    }
    case "page-numbers": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { addPageNumbers } = await import("./pages");
      return addPageNumbers(file, str(values.position, "bottom-center"), num(values.startAt, 1), str(values.format, "Page {n} of {total}"));
    }
    case "rotate-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { rotatePdf } = await import("./pages");
      return rotatePdf(file, num(values.angle, 90), str(values.range));
    }
    case "remove-pages": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { removePages } = await import("./pages");
      return removePages(file, str(values.range));
    }
    case "extract-pages": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { extractPages } = await import("./pages");
      return extractPages(file, str(values.range));
    }
    case "organize-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { organizePdf } = await import("./pages");
      return organizePdf(file, str(values.order));
    }
    case "reverse-pages": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { reversePages } = await import("./pages");
      return reversePages(file);
    }
    case "duplicate-pages": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { duplicatePages } = await import("./pages");
      return duplicatePages(file, str(values.range));
    }
    case "crop-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { cropPdf } = await import("./pages");
      return cropPdf(file, {
        top: num(values.top, 20),
        right: num(values.right, 20),
        bottom: num(values.bottom, 20),
        left: num(values.left, 20),
      });
    }
    case "nup-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { nUpPdf } = await import("./pages");
      return nUpPdf(file, num(values.n, 2));
    }
    case "protect-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { protectPdf } = await import("./security");
      return protectPdf(file, str(values.userPassword), str(values.ownerPassword), {
        printing: bool(values.printing, true),
        copying: bool(values.copying, true),
        modifying: bool(values.modifying, false),
        annotating: bool(values.annotating, true),
      });
    }
    case "unlock-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { unlockPdf } = await import("./security");
      return unlockPdf(file, str(values.password));
    }
    case "redact-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const boxesRaw = str(values.boxesJson, "[]");
      let boxes: Array<{ page: number; xPct: number; yPct: number; wPct: number; hPct: number }> = [];
      try {
        boxes = JSON.parse(boxesRaw);
      } catch {
        /* ignore */
      }
      if (!boxes.length) throw new ToolError("Draw at least one redaction box first.");
      const { redactPdf } = await import("./images");
      return redactPdf(file, boxes, 2, password);
    }
    case "grayscale-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { grayscalePdf } = await import("./images");
      return grayscalePdf(file, 2, password);
    }
    case "repair-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { repairPdf } = await import("./images");
      return repairPdf(file);
    }
    case "compare-pdf": {
      const [a, b] = files;
      if (!a || !b) throw new ToolError("Please choose two PDF files to compare.");
      const { comparePdf } = await import("./convert");
      return comparePdf(a, b);
    }
    case "html-to-pdf": {
      const { htmlToPdf } = await import("./convert");
      return htmlToPdf(str(values.html), "html-export");
    }
    case "extract-text": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { extractText } = await import("./convert");
      return extractText(file, password);
    }
    case "extract-images": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { extractImagesAsPages } = await import("./images");
      return extractImagesAsPages(file, num(values.scale, 2), password);
    }
    case "ocr-pdf": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { ocrPdf } = await import("./convert");
      return ocrPdf(file, password, onProgress);
    }
    case "pdf-metadata": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { editMetadata } = await import("./pages");
      return editMetadata(file, {
        title: str(values.title),
        author: str(values.author),
        subject: str(values.subject),
        keywords: str(values.keywords),
      });
    }
    case "fill-flatten-form": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { fillAndFlattenForm } = await import("./pages");
      return fillAndFlattenForm(file);
    }
    case "pdf-analyzer": {
      if (!file) throw new ToolError("Please choose a PDF file.");
      const { pdfInfo } = await import("./convert");
      const rows = await pdfInfo(file, password);
      return infoResult(rows);
    }
    default:
      throw new ToolError(`Unknown tool: ${slug}`);
  }
}

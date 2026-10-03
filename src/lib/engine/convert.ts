"use client";
import { fileToUint8Array, sanitizeBaseName, fileResult, textResult, bytesToBlob, EngineFileResult, EngineTextResult, ToolError } from "./utils";
import { extractTextFromPdf, loadPdfDocument, renderPageToCanvas, canvasToBlob } from "./pdfjs";

export async function extractText(file: File, password?: string): Promise<EngineTextResult> {
  const data = await fileToUint8Array(file);
  const pages = await extractTextFromPdf(data, password);
  const text = pages.map((p, i) => `--- Page ${i + 1} ---\n${p || "(no extractable text)"}`).join("\n\n");
  return textResult(text, `${sanitizeBaseName(file.name)}.txt`);
}

export async function pdfInfo(file: File, password?: string) {
  const data = await fileToUint8Array(file);
  const pdf = await loadPdfDocument(data, password);
  const meta = await pdf.getMetadata().catch(() => null);
  const info = (meta?.info ?? {}) as Record<string, unknown>;
  const rows: Array<{ label: string; value: string }> = [
    { label: "File name", value: file.name },
    { label: "File size", value: `${(file.size / 1024).toFixed(1)} KB` },
    { label: "Page count", value: String(pdf.numPages) },
    { label: "PDF version", value: String(info.PDFFormatVersion ?? "Unknown") },
    { label: "Title", value: String(info.Title ?? "—") },
    { label: "Author", value: String(info.Author ?? "—") },
    { label: "Creator", value: String(info.Creator ?? "—") },
    { label: "Producer", value: String(info.Producer ?? "—") },
    { label: "Encrypted", value: info.IsEncrypted ? "Yes" : "No" },
  ];
  const page1 = await pdf.getPage(1);
  const vp = page1.getViewport({ scale: 1 });
  rows.push({ label: "Page size (pt)", value: `${Math.round(vp.width)} × ${Math.round(vp.height)}` });
  return rows;
}

export async function pdfToWord(file: File, password?: string): Promise<EngineFileResult> {
  const { Document, Packer, Paragraph, HeadingLevel } = await import("docx");
  const data = await fileToUint8Array(file);
  const pages = await extractTextFromPdf(data, password);
  const children = [];
  for (let i = 0; i < pages.length; i++) {
    children.push(new Paragraph({ text: `Page ${i + 1}`, heading: HeadingLevel.HEADING_3 }));
    const text = pages[i] || "(no extractable text on this page)";
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    let chunk = "";
    for (const s of sentences) {
      chunk += s;
      if (chunk.length > 220) {
        children.push(new Paragraph(chunk.trim()));
        chunk = "";
      }
    }
    if (chunk.trim()) children.push(new Paragraph(chunk.trim()));
  }
  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  return fileResult(blob, `${sanitizeBaseName(file.name)}.docx`);
}

export async function wordToPdf(file: File): Promise<EngineFileResult> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return htmlToPdf(result.value, sanitizeBaseName(file.name));
}

export async function htmlToPdf(html: string, baseName = "document"): Promise<EngineFileResult> {
  if (!html.trim()) throw new ToolError("Please provide some HTML or rich text content to convert.");
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;
  (window as unknown as { html2canvas: typeof html2canvas }).html2canvas = html2canvas;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "720px";
  container.style.padding = "24px";
  container.style.background = "#ffffff";
  container.style.color = "#111111";
  container.style.fontFamily = "Helvetica, Arial, sans-serif";
  container.style.fontSize = "13px";
  container.innerHTML = html;
  document.body.appendChild(container);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  await new Promise<void>((resolve, reject) => {
    doc.html(container, {
      margin: [36, 36, 36, 36],
      autoPaging: "text",
      html2canvas: { scale: 0.75, useCORS: true },
      callback: () => resolve(),
      x: 0,
      y: 0,
    });
    setTimeout(() => reject(new Error("Timed out rendering HTML to PDF.")), 30000);
  }).finally(() => container.remove());

  const blob = doc.output("blob");
  return fileResult(blob, `${baseName}.pdf`);
}

export async function pdfToExcel(file: File, password?: string): Promise<EngineFileResult> {
  const XLSX = await import("xlsx");
  const data = await fileToUint8Array(file);
  const pages = await extractTextFromPdf(data, password);
  const rows: string[][] = [["Page", "Content"]];
  pages.forEach((text, i) => {
    const lines = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (!lines.length) rows.push([String(i + 1), ""]);
    lines.forEach((line, idx) => rows.push([idx === 0 ? String(i + 1) : "", line]));
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "PDF Content");
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return fileResult(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${sanitizeBaseName(file.name)}.xlsx`);
}

export async function excelToPdf(file: File): Promise<EngineFileResult> {
  const XLSX = await import("xlsx");
  const { jsPDF } = await import("jspdf");
  const { autoTable } = await import("jspdf-autotable");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  wb.SheetNames.forEach((sheetName, idx) => {
    const ws = wb.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
    if (idx > 0) doc.addPage();
    doc.setFontSize(14);
    doc.text(sheetName, 24, 28);
    const body = rows.slice(1).map((r) => r.map((c) => (c == null ? "" : String(c))));
    const head = rows.length ? [rows[0].map((c) => (c == null ? "" : String(c)))] : [[]];
    autoTable(doc, { head, body, startY: 40, styles: { fontSize: 8 } });
  });
  const blob = doc.output("blob");
  return fileResult(blob, `${sanitizeBaseName(file.name)}.pdf`);
}

export async function pdfToPowerPoint(file: File, password?: string): Promise<EngineFileResult> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const data = await fileToUint8Array(file);
  const pdf = await loadPdfDocument(data, password);
  const pres = new PptxGenJS();
  pres.defineLayout({ name: "PDFL", width: 13.333, height: 7.5 });
  pres.layout = "PDFL";
  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, 1.8);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const slide = pres.addSlide();
    const ratio = canvas.width / canvas.height;
    let w = 13.333;
    let h = w / ratio;
    if (h > 7.5) {
      h = 7.5;
      w = h * ratio;
    }
    slide.addImage({ data: dataUrl, x: (13.333 - w) / 2, y: (7.5 - h) / 2, w, h });
  }
  const blob = (await pres.write({ outputType: "blob" })) as Blob;
  return fileResult(blob, `${sanitizeBaseName(file.name)}.pptx`);
}

export async function powerPointToPdf(file: File): Promise<EngineFileResult> {
  const JSZip = (await import("jszip")).default;
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const zip = await JSZip.loadAsync(file);
  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0", 10);
      return na - nb;
    });
  if (!slideFiles.length) throw new ToolError("No slides found in this PowerPoint file.");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async("text");
    const texts = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1]);
    const page = doc.addPage([720, 540]);
    page.drawText(`Slide ${i + 1}`, { x: 40, y: 500, size: 10, font, color: rgb(0.5, 0.5, 0.5) });
    let y = 460;
    texts.forEach((t, idx) => {
      const size = idx === 0 ? 22 : 14;
      const useFont = idx === 0 ? boldFont : font;
      const wrapped = wrapText(t, useFont, size, 640);
      wrapped.forEach((line) => {
        if (y < 40) return;
        page.drawText(line, { x: 40, y, size, font: useFont, color: rgb(0.1, 0.1, 0.1) });
        y -= size + 10;
      });
      y -= 6;
    });
  }
  const bytes = await doc.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}.pdf`);
}

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export async function comparePdf(fileA: File, fileB: File): Promise<EngineTextResult> {
  const [dataA, dataB] = await Promise.all([fileToUint8Array(fileA), fileToUint8Array(fileB)]);
  const [pagesA, pagesB] = await Promise.all([extractTextFromPdf(dataA), extractTextFromPdf(dataB)]);
  const max = Math.max(pagesA.length, pagesB.length);
  const lines: string[] = [];
  let diffCount = 0;
  for (let i = 0; i < max; i++) {
    const a = pagesA[i] ?? "(missing page)";
    const b = pagesB[i] ?? "(missing page)";
    if (a === b) {
      lines.push(`Page ${i + 1}: identical ✔`);
    } else {
      diffCount++;
      lines.push(`Page ${i + 1}: DIFFERENT ✘`);
      lines.push(`  File A: ${a.slice(0, 300)}${a.length > 300 ? "…" : ""}`);
      lines.push(`  File B: ${b.slice(0, 300)}${b.length > 300 ? "…" : ""}`);
    }
  }
  const summary = `Compared "${fileA.name}" (${pagesA.length} pages) with "${fileB.name}" (${pagesB.length} pages).\n${diffCount} of ${max} page(s) differ.\n\n`;
  return textResult(summary + lines.join("\n"), "pdf-comparison.txt");
}

export async function ocrPdf(
  file: File,
  password?: string,
  onProgress?: (msg: string) => void
): Promise<EngineTextResult> {
  const { createWorker } = await import("tesseract.js");
  const data = await fileToUint8Array(file);
  const pdf = await loadPdfDocument(data, password);
  const worker = await createWorker("eng", undefined, {
    logger: (m) => {
      if (m.status && onProgress) onProgress(`${m.status} ${(m.progress * 100).toFixed(0)}%`);
    },
  });
  let fullText = "";
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(`Rendering page ${i} of ${pdf.numPages}…`);
      const canvas = await renderPageToCanvas(pdf, i, 2.2);
      const blob = await canvasToBlob(canvas, "image/png");
      onProgress?.(`Running OCR on page ${i} of ${pdf.numPages}…`);
      const { data: ocrData } = await worker.recognize(blob);
      fullText += `--- Page ${i} ---\n${ocrData.text.trim()}\n\n`;
    }
  } finally {
    await worker.terminate();
  }
  return textResult(fullText.trim(), `${sanitizeBaseName(file.name)}-ocr.txt`);
}

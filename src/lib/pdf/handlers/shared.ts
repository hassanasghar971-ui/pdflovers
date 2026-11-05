import { PDFDocument } from "pdf-lib";

export interface OutputFile {
  name: string;
  blob: Blob;
}

export interface HandlerResult {
  files: OutputFile[];
  report?: Record<string, unknown>;
}

export type ProgressFn = (percent: number, message?: string) => void;

export interface HandlerInput {
  files: File[];
  options: Record<string, unknown>;
  onProgress?: ProgressFn;
}

export type PdfHandler = (input: HandlerInput) => Promise<HandlerResult>;

/** Errors whose messages are safe to show to users. */
export class PdfToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfToolError";
  }
}

export function requireFile(files: File[]): File {
  const file = files[0];
  if (!file) throw new PdfToolError("Please select a PDF file.");
  return file;
}

export async function loadPdf(
  file: File,
  opts: { updateMetadata?: boolean } = {}
): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer();
  try {
    return await PDFDocument.load(bytes, {
      updateMetadata: opts.updateMetadata ?? true,
    });
  } catch (err) {
    if (/encrypted/i.test(String(err))) {
      throw new PdfToolError("This PDF is password-protected and can't be processed.");
    }
    throw new PdfToolError("Could not read this PDF. The file may be corrupted.");
  }
}

export function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export function outName(file: File, suffix: string): string {
  const base = file.name.replace(/\.pdf$/i, "") || "document";
  return `${base}-${suffix}.pdf`;
}

export function optStr(o: Record<string, unknown>, k: string, d = ""): string {
  const v = o[k];
  return typeof v === "string" ? v : d;
}

export function optNum(o: Record<string, unknown>, k: string, d: number): number {
  const v = Number(o[k]);
  return Number.isFinite(v) ? v : d;
}

/** Parses "1-3, 5, 8-" into sorted, unique, zero-based indexes. Empty = all pages. */
export function parsePageRanges(input: string, total: number): number[] {
  const text = input.trim();
  if (!text) return Array.from({ length: total }, (_, i) => i);

  const set = new Set<number>();
  for (const part of text.split(",")) {
    const token = part.trim();
    if (!token) continue;

    const m = token.match(/^(\d+)?\s*-\s*(\d+)?$/) ?? token.match(/^(\d+)$/);
    if (!m) throw new PdfToolError(`Invalid page range: "${token}".`);

    const isRange = token.includes("-");
    const start = m[1] ? parseInt(m[1], 10) : 1;
    const end = isRange ? (m[2] ? parseInt(m[2], 10) : total) : start;

    if (start < 1 || end < start || end > total) {
      throw new PdfToolError(`Page range "${token}" is outside this document (1-${total}).`);
    }
    for (let p = start; p <= end; p++) set.add(p - 1);
  }

  if (set.size === 0) throw new PdfToolError("No valid pages selected.");
  return [...set].sort((a, b) => a - b);
}

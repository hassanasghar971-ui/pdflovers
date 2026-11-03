import { PDFDocument, EncryptedPDFError } from 'pdf-lib';
import { PdfProcessingError } from './errors';

export { PdfProcessingError } from './errors';
export { formatFileSize, withSuffix } from './format';

export async function loadPdf(bytes: ArrayBuffer | Uint8Array, label?: string): Promise<PDFDocument> {
  const prefix = label ? `"${label}": ` : '';
  try {
    return await PDFDocument.load(bytes);
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new PdfProcessingError(`${prefix}This PDF is password-protected. Remove the password first, then try again.`, { cause: error });
    }
    throw new PdfProcessingError(`${prefix}This file could not be read. It may be corrupted or not a valid PDF.`, { cause: error });
  }
}

export async function processPdfBytes(fileBytes: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await loadPdf(fileBytes);
  return pdfDoc.save();
}

export function bytesToBlob(bytes: Uint8Array, type = 'application/pdf'): Blob {
  return new Blob([bytes as BlobPart], { type });
}

export function createBlobUrl(bytes: Uint8Array, type = 'application/pdf'): string {
  return URL.createObjectURL(bytesToBlob(bytes, type));
}

export function revokeBlobUrl(url: string | null | undefined): void {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

export function parseRanges(spec: string, pageCount: number): number[][] {
  const parts = spec.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) throw new PdfProcessingError('Enter at least one page number, e.g. 1-3, 5.');

  return parts.map((part) => {
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part);
    if (!match) throw new PdfProcessingError(`"${part}" is not a valid page or range.`);
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end < start) throw new PdfProcessingError(`"${part}" is not a valid range.`);
    if (end > pageCount) {
      throw new PdfProcessingError(`Page ${end} is out of range. This document has ${pageCount} page${pageCount === 1 ? '' : 's'}.`);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
  });
}

export function parsePageSpec(spec: string, pageCount: number): number[] {
  const seen = new Set<number>();
  const result: number[] = [];
  for (const group of parseRanges(spec, pageCount)) {
    for (const index of group) {
      if (!seen.has(index)) {
        seen.add(index);
        result.push(index);
      }
    }
  }
  return result;
}

"use client";
import { PDFDocument } from "pdf-lib";
import { loadPdfDocument, renderPageToCanvas, canvasToBlob } from "./pdfjs";
import { fileToUint8Array, sanitizeBaseName, fileResult, bytesToBlob, EngineFileResult, ToolError } from "./utils";
import { protectPdfBytes, ProtectPermissions } from "./pdfCrypto";

export async function protectPdf(
  file: File,
  userPassword: string,
  ownerPassword: string,
  permissions: ProtectPermissions
): Promise<EngineFileResult> {
  if (!userPassword) throw new ToolError("Please enter a password to protect the PDF with.");
  const original = await fileToUint8Array(file);
  const doc = await PDFDocument.load(original, { ignoreEncryption: true });
  const normalized = await doc.save({ useObjectStreams: false });
  const protectedBytes = protectPdfBytes(normalized, userPassword, ownerPassword || userPassword, permissions);
  return fileResult(bytesToBlob(protectedBytes, "application/pdf"), `${sanitizeBaseName(file.name)}-protected.pdf`);
}

/**
 * Removes password protection by fully re-rendering every page (pdf.js can
 * decrypt RC4 and AES-128/256 natively) into a brand-new, unencrypted PDF.
 */
export async function unlockPdf(file: File, password: string, scale = 2): Promise<EngineFileResult> {
  const data = await fileToUint8Array(file);
  let pdf;
  try {
    pdf = await loadPdfDocument(data, password);
  } catch {
    throw new ToolError("Incorrect password, or this file isn't a supported encrypted PDF.");
  }
  const out = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, scale);
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const image = await out.embedJpg(bytes);
    const page = out.addPage([(canvas.width * 72) / 96 / scale, (canvas.height * 72) / 96 / scale]);
    const { width, height } = page.getSize();
    page.drawImage(image, { x: 0, y: 0, width, height });
  }
  const bytes = await out.save();
  return fileResult(bytesToBlob(bytes, "application/pdf"), `${sanitizeBaseName(file.name)}-unlocked.pdf`);
}

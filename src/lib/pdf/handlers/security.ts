import { PDFName } from "pdf-lib";
import {
  type PdfHandler,
  PdfToolError,
  loadPdf,
  optStr,
  outName,
  pdfBlob,
  requireFile,
} from "./shared";

export const protectPdf: PdfHandler = async ({ files, options, onProgress }) => {
  const file = requireFile(files);
  const password = optStr(options, "password");
  const confirm = optStr(options, "confirmPassword", password);

  if (password.length < 4) {
    throw new PdfToolError("Use a password with at least 4 characters.");
  }
  if (password !== confirm) {
    throw new PdfToolError("The passwords do not match.");
  }

  onProgress?.(10, "Reading PDF");
  const doc = await loadPdf(file);
  const plain = await doc.save();

  onProgress?.(50, "Encrypting");
  // pdf-lib cannot encrypt, so this needs a dedicated library (see notes).
  const { encryptPDF } = await import("@pdfsmaller/pdf-encrypt-lite");
  const encrypted = await encryptPDF(plain, password, password);

  onProgress?.(95, "Done");
  return { files: [{ name: outName(file, "protected"), blob: pdfBlob(encrypted) }] };
};

export const removeMetadata: PdfHandler = async ({ files, onProgress }) => {
  const file = requireFile(files);

  onProgress?.(10, "Reading PDF");
  // updateMetadata:false stops pdf-lib from stamping its own producer/dates.
  const doc = await loadPdf(file, { updateMetadata: false });

  const before = {
    title: doc.getTitle() ?? null,
    author: doc.getAuthor() ?? null,
    subject: doc.getSubject() ?? null,
    keywords: doc.getKeywords() ?? null,
    creator: doc.getCreator() ?? null,
    producer: doc.getProducer() ?? null,
  };

  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setCreator("");
  doc.setProducer("");
  doc.catalog.delete(PDFName.of("Metadata")); // XMP metadata stream

  onProgress?.(80, "Saving");
  const bytes = await doc.save();

  return {
    files: [{ name: outName(file, "clean"), blob: pdfBlob(bytes) }],
    report: { removedFields: before },
  };
};

/** Keys must match the slugs in TOOLS_REGISTRY. */
export const securityHandlers: Record<string, PdfHandler> = {
  "protect-pdf": protectPdf,
  "remove-metadata": removeMetadata,
};

import { PDFName } from "pdf-lib";
import {
  type PdfHandler,
  loadPdf,
  outName,
  pdfBlob,
  requireFile,
} from "./shared";

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

/** protect-pdf is intentionally absent until a verified encryption library is added. */
export const securityHandlers: Record<string, PdfHandler> = {
  "remove-metadata": removeMetadata,
};

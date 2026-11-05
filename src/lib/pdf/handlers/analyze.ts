import { PDFDocument } from "pdf-lib";
import { type PdfHandler, PdfToolError, optStr, requireFile } from "./shared";

const PT_TO_MM = 25.4 / 72;

function paperName(wMm: number, hMm: number): string {
  const sizes: Record<string, [number, number]> = {
    A3: [297, 420],
    A4: [210, 297],
    A5: [148, 210],
    Letter: [216, 279],
    Legal: [216, 356],
  };
  const short = Math.min(wMm, hMm);
  const long = Math.max(wMm, hMm);
  for (const [name, [w, h]] of Object.entries(sizes)) {
    if (Math.abs(short - w) <= 2 && Math.abs(long - h) <= 2) return name;
  }
  return "Custom";
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}

export const pdfInfo: PdfHandler = async ({ files, options, onProgress }) => {
  const file = requireFile(files);

  onProgress?.(10, "Reading PDF");
  const bytes = await file.arrayBuffer();

  let doc: PDFDocument;
  try {
    // ignoreEncryption lets us report encrypted files instead of failing.
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  } catch {
    throw new PdfToolError("Could not read this PDF. The file may be corrupted.");
  }

  if (doc.isEncrypted) {
    return {
      files: [],
      report: {
        fileName: file.name,
        fileSize: formatBytes(file.size),
        encrypted: true,
        note: "This PDF is encrypted, so its contents and metadata can't be analysed.",
      },
    };
  }

  onProgress?.(50, "Analysing pages");
  const pages = doc.getPages();
  const sizeCounts = new Map<string, { label: string; count: number }>();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const wMm = Math.round(width * PT_TO_MM);
    const hMm = Math.round(height * PT_TO_MM);
    const orientation = width > height ? "landscape" : width < height ? "portrait" : "square";
    const label = `${paperName(wMm, hMm)} (${wMm} × ${hMm} mm, ${orientation})`;
    const entry = sizeCounts.get(label);
    if (entry) entry.count++;
    else sizeCounts.set(label, { label, count: 1 });
  }

  const report = {
    fileName: file.name,
    fileSize: formatBytes(file.size),
    fileSizeBytes: file.size,
    encrypted: false,
    pageCount: pages.length,
    pageSizes: [...sizeCounts.values()],
    title: doc.getTitle() ?? null,
    author: doc.getAuthor() ?? null,
    subject: doc.getSubject() ?? null,
    keywords: doc.getKeywords() ?? null,
    creator: doc.getCreator() ?? null,
    producer: doc.getProducer() ?? null,
    created: doc.getCreationDate()?.toISOString() ?? null,
    modified: doc.getModificationDate()?.toISOString() ?? null,
  };

  onProgress?.(95, "Done");

  if (optStr(options, "download") === "true") {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const base = file.name.replace(/\.pdf$/i, "") || "document";
    return { files: [{ name: `${base}-report.json`, blob }], report };
  }

  return { files: [], report };
};

/** Keys must match the slugs in TOOLS_REGISTRY. */
export const analyzeHandlers: Record<string, PdfHandler> = {
  "pdf-info": pdfInfo,
};

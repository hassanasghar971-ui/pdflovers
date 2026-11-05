import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import {
  type HandlerResult,
  type PdfHandler,
  PdfToolError,
  loadPdf,
  optNum,
  optStr,
  outName,
  parsePageRanges,
  pdfBlob,
  requireFile,
} from "./shared";

async function finish(doc: PDFDocument, file: File, suffix: string): Promise<HandlerResult> {
  const bytes = await doc.save();
  return { files: [{ name: outName(file, suffix), blob: pdfBlob(bytes) }] };
}

/** Standard fonts are Latin-only, so fail with a clear message. */
function safeMeasure(
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  text: string,
  size: number
): number {
  try {
    return font.widthOfTextAtSize(text, size);
  } catch {
    throw new PdfToolError(
      "The text contains characters that aren't supported. Use Latin letters, numbers, and common symbols."
    );
  }
}

export const rotatePdf: PdfHandler = async ({ files, options, onProgress }) => {
  const file = requireFile(files);
  const angle = optNum(options, "angle", 90);
  if (![90, 180, 270].includes(((angle % 360) + 360) % 360)) {
    throw new PdfToolError("Rotation must be 90, 180, or 270 degrees.");
  }

  onProgress?.(10, "Reading PDF");
  const doc = await loadPdf(file);
  const pages = doc.getPages();
  const targets = parsePageRanges(optStr(options, "pages"), pages.length);

  targets.forEach((index, i) => {
    const page = pages[index];
    const next = (((page.getRotation().angle + angle) % 360) + 360) % 360;
    page.setRotation(degrees(next));
    onProgress?.(10 + Math.round(((i + 1) / targets.length) * 80), "Rotating pages");
  });

  return finish(doc, file, "rotated");
};

export const deletePages: PdfHandler = async ({ files, options, onProgress }) => {
  const file = requireFile(files);
  const doc = await loadPdf(file);
  const total = doc.getPageCount();

  const raw = optStr(options, "pages");
  if (!raw.trim()) throw new PdfToolError("Enter the pages you want to delete.");

  const targets = parsePageRanges(raw, total);
  if (targets.length >= total) {
    throw new PdfToolError("You can't delete every page of the document.");
  }

  onProgress?.(30, "Removing pages");
  for (const index of [...targets].reverse()) doc.removePage(index);

  return finish(doc, file, "pages-removed");
};

type NumberPosition =
  | "bottom-center" | "bottom-left" | "bottom-right"
  | "top-center" | "top-left" | "top-right";

export const addPageNumbers: PdfHandler = async ({ files, options, onProgress }) => {
  const file = requireFile(files);
  const position = optStr(options, "position", "bottom-center") as NumberPosition;
  const startAt = Math.max(1, Math.floor(optNum(options, "startAt", 1)));
  const fontSize = Math.min(48, Math.max(6, optNum(options, "fontSize", 11)));
  const margin = 28;

  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  pages.forEach((page, i) => {
    const label = `${startAt + i}`;
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    const x = position.endsWith("left")
      ? margin
      : position.endsWith("right")
        ? width - margin - textWidth
        : (width - textWidth) / 2;
    const y = position.startsWith("top") ? height - margin : margin - fontSize / 2;

    page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
    onProgress?.(Math.round(((i + 1) / pages.length) * 90), "Numbering pages");
  });

  return finish(doc, file, "numbered");
};

export const addWatermark: PdfHandler = async ({ files, options, onProgress }) => {
  const file = requireFile(files);
  const text = optStr(options, "text").trim();
  if (!text) throw new PdfToolError("Enter the watermark text.");

  const opacity = Math.min(1, Math.max(0.05, optNum(options, "opacity", 0.2)));
  const fontSize = Math.min(200, Math.max(10, optNum(options, "fontSize", 64)));
  const angle = 45;
  const rad = (angle * Math.PI) / 180;

  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const textWidth = safeMeasure(font, text, fontSize);
  const textHeight = fontSize * 0.7;
  const pages = doc.getPages();

  pages.forEach((page, i) => {
    const { width, height } = page.getSize();
    // Offset the start point so the rotated text is centred on the page.
    const x = width / 2 - (textWidth / 2) * Math.cos(rad) + (textHeight / 2) * Math.sin(rad);
    const y = height / 2 - (textWidth / 2) * Math.sin(rad) - (textHeight / 2) * Math.cos(rad);

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(angle),
    });
    onProgress?.(Math.round(((i + 1) / pages.length) * 90), "Adding watermark");
  });

  return finish(doc, file, "watermarked");
};

export const cropPdf: PdfHandler = async ({ files, options, onProgress }) => {
  const file = requireFile(files);
  const top = Math.max(0, optNum(options, "top", 0));
  const right = Math.max(0, optNum(options, "right", 0));
  const bottom = Math.max(0, optNum(options, "bottom", 0));
  const left = Math.max(0, optNum(options, "left", 0));

  if (!top && !right && !bottom && !left) {
    throw new PdfToolError("Enter at least one margin to crop.");
  }

  const doc = await loadPdf(file);
  const pages = doc.getPages();

  pages.forEach((page, i) => {
    const { x, y, width, height } = page.getMediaBox();
    const newW = width - left - right;
    const newH = height - top - bottom;
    if (newW < 10 || newH < 10) {
      throw new PdfToolError(`Crop margins are too large for page ${i + 1}.`);
    }
    page.setCropBox(x + left, y + bottom, newW, newH);
    onProgress?.(Math.round(((i + 1) / pages.length) * 90), "Cropping pages");
  });

  return finish(doc, file, "cropped");
};

/** Keys must match the slugs in TOOLS_REGISTRY. */
export const editHandlers: Record<string, PdfHandler> = {
  "rotate-pdf": rotatePdf,
  "delete-pages": deletePages,
  "add-page-numbers": addPageNumbers,
  "add-watermark": addWatermark,
  "crop-pdf": cropPdf,
};

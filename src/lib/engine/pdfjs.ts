// Lazily-loaded pdf.js wrapper. Code-split so the ~1.2MB worker / core bundle
// is only ever fetched when a tool that needs rendering is actually used.
"use client";

type PdfjsModule = typeof import("pdfjs-dist");

let modPromise: Promise<PdfjsModule> | null = null;

export async function getPdfjs(): Promise<PdfjsModule> {
  if (!modPromise) {
    modPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return mod;
    });
  }
  return modPromise;
}

export async function loadPdfDocument(data: Uint8Array, password?: string) {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({
    data,
    password,
  });
  return loadingTask.promise;
}

export async function renderPageToCanvas(
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNumber: number,
  scale = 1.5
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export image from canvas."));
      },
      type,
      quality
    );
  });
}

export async function extractTextFromPdf(data: Uint8Array, password?: string): Promise<string[]> {
  const pdf = await loadPdfDocument(data, password);
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(text);
  }
  return pages;
}

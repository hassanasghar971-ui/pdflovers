type PdfJs = typeof import('pdfjs-dist');

let cached: Promise<PdfJs> | null = null;

export function loadPdfJs(): Promise<PdfJs> {
  cached ??= import('pdfjs-dist/legacy/build/pdf.mjs')
    .then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();
      return mod as PdfJs;
    })
    .catch((error) => {
      cached = null;
      throw error;
    });
  return cached;
}

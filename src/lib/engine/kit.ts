import { ToolError } from './types';
import type { OptionValues } from './types';

/* ------------------------------------------------------------------ */
/* Limits                                                              */
/* ------------------------------------------------------------------ */
export const MAX_CANVAS_PIXELS = 16_000_000;
export const MAX_CANVAS_SIDE = 16_384;

/* ------------------------------------------------------------------ */
/* Option readers                                                      */
/* ------------------------------------------------------------------ */
export function str(o: OptionValues, key: string, fallback = ''): string {
  const v = o[key];
  return v === undefined || v === null ? fallback : String(v);
}

export function num(o: OptionValues, key: string, fallback: number): number {
  const v = o[key];
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string' && v.trim() !== ''
        ? Number(v)
        : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function bool(o: OptionValues, key: string, fallback: boolean): boolean {
  const v = o[key];
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1' || v === 'on';
  if (typeof v === 'number') return v !== 0;
  return fallback;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/* ------------------------------------------------------------------ */
/* Bytes                                                               */
/* ------------------------------------------------------------------ */
/** Returns a view typed as Uint8Array<ArrayBuffer> (copies only if the backing store is not a plain ArrayBuffer). */
export function toBuf(u: Uint8Array): Uint8Array<ArrayBuffer> {
  if (u.buffer instanceof ArrayBuffer) return u as Uint8Array<ArrayBuffer>;
  const copy = new Uint8Array(u.length);
  copy.set(u);
  return copy;
}

export function concat(...parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

export function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(n));
}

export function toHex(u: Uint8Array): string {
  return Array.from(u, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function readBytes(file: File): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await file.arrayBuffer());
}

export function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([toBuf(bytes)], { type: 'application/pdf' });
}

export function stripExt(name: string): string {
  return name.replace(/\.[^./\\]+$/, '') || 'document';
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ToolError('Cancelled.', 'aborted');
}

/** '#rrggbb' or '#rgb' to 0..1 components. */
export function parseColor(hex: string, fallback: [number, number, number] = [0, 0, 0]): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return fallback;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* ------------------------------------------------------------------ */
/* pdf.js                                                              */
/* ------------------------------------------------------------------ */
export type PdfJs = typeof import('pdfjs-dist');
export type PdfDoc = Awaited<ReturnType<PdfJs['getDocument']>['promise']>;
export type PdfPage = Awaited<ReturnType<PdfDoc['getPage']>>;

let pdfjsPromise: Promise<PdfJs> | null = null;

export function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((m) => {
      if (!m.GlobalWorkerOptions.workerSrc) {
        m.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();
      }
      return m;
    });
  }
  return pdfjsPromise;
}

function mapPdfJsError(e: unknown): ToolError {
  if (e instanceof ToolError) return e;
  const err = e as { name?: string; code?: number; message?: string };
  if (err?.name === 'PasswordException') {
    return err.code === 2
      ? new ToolError('Incorrect password.', 'wrong-password')
      : new ToolError('This PDF needs a password.', 'password-required');
  }
  if (err?.name === 'InvalidPDFException' || err?.name === 'MissingPDFException') {
    return new ToolError('This file is not a valid PDF, or it is damaged.', 'invalid-pdf');
  }
  return new ToolError(`Could not read this PDF: ${err?.message ?? 'unknown error'}`, 'invalid-pdf');
}

/** Opens a PDF with pdf.js. pdf.js detaches the buffer it receives, so a copy is passed. */
export async function openPdfJs(bytes: Uint8Array, password?: string): Promise<PdfDoc> {
  const pdfjs = await loadPdfJs();
  const base = process.env.NEXT_PUBLIC_PDFJS_ASSET_BASE;
  const task = pdfjs.getDocument({
    data: toBuf(bytes).slice(),
    password: password === undefined || password === '' ? undefined : password,
    isEvalSupported: false,
    ...(base ? { cMapUrl: `${base}/cmaps/`, cMapPacked: true, standardFontDataUrl: `${base}/standard_fonts/` } : {}),
  });
  try {
    return await task.promise;
  } catch (e) {
    void task.destroy();
    throw mapPdfJsError(e);
  }
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */
export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.floor(w));
  c.height = Math.max(1, Math.floor(h));
  return c;
}

/** Releases the canvas backing store immediately. */
export function purgeCanvas(c: HTMLCanvasElement | null | undefined): void {
  if (!c) return;
  c.width = 0;
  c.height = 0;
}

export function safeScale(widthPt: number, heightPt: number, wanted: number): number {
  const byPixels = Math.sqrt(MAX_CANVAS_PIXELS / Math.max(1, widthPt * heightPt));
  const bySide = MAX_CANVAS_SIDE / Math.max(1, widthPt, heightPt);
  return Math.max(0.1, Math.min(wanted, byPixels, bySide));
}

export function canvasToBlob(c: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new ToolError('The browser ran out of memory while encoding an image.', 'out-of-memory'))),
      type,
      quality,
    );
  });
}

export interface RenderedPage {
  canvas: HTMLCanvasElement;
  g: CanvasRenderingContext2D;
  viewport: ReturnType<PdfPage['getViewport']>;
  widthPt: number;
  heightPt: number;
}

/** Renders a page on a white canvas. The caller MUST call purgeCanvas(result.canvas). */
export async function renderPage(page: PdfPage, scale: number): Promise<RenderedPage> {
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: safeScale(base.width, base.height, scale) });
  const canvas = makeCanvas(viewport.width, viewport.height);
  const g = canvas.getContext('2d', { alpha: false });
  if (!g) {
    purgeCanvas(canvas);
    throw new ToolError('Canvas is not available in this browser.', 'unsupported');
  }
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, canvas.width, canvas.height);
  try {
    await page.render({ canvasContext: g, viewport }).promise;
  } catch (e) {
    purgeCanvas(canvas);
    throw e;
  }
  return { canvas, g, viewport, widthPt: base.width, heightPt: base.height };
}

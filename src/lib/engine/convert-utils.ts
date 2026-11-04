// Helpers for converters: image sniffing, EXIF orientation, text decoding,
// data-URI decoding and image page geometry.

import type { MemoryScope } from '../memory';
import { ToolError } from './types';
import { MAX_CANVAS_PIXELS, decodeImageToCanvas } from './shared';
import { clampNum, pageSizeFor } from './handler-utils';

export type RasterKind = 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp' | 'unknown';

export function sniffBytes(b: Uint8Array): RasterKind {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'gif';
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return 'webp';
  }
  if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) return 'bmp';
  return 'unknown';
}

export function mimeOfKind(kind: RasterKind): string {
  switch (kind) {
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'bmp': return 'image/bmp';
    default: return 'application/octet-stream';
  }
}

/** Reads the EXIF orientation tag (1-8) from a JPEG. Returns 1 when absent. */
export function jpegOrientation(b: Uint8Array): number {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return 1;
  let o = 2;
  while (o + 4 < b.length) {
    if (b[o] !== 0xff) return 1;
    const marker = b[o + 1];
    if (marker === 0xda || marker === 0xd9) return 1;
    const len = (b[o + 2] << 8) | b[o + 3];
    if (
      marker === 0xe1 && len >= 16 &&
      b[o + 4] === 0x45 && b[o + 5] === 0x78 && b[o + 6] === 0x69 && b[o + 7] === 0x66 &&
      b[o + 8] === 0 && b[o + 9] === 0
    ) {
      const t = o + 10;
      const little = b[t] === 0x49;
      const u16 = (p: number) => (little ? b[p] | (b[p + 1] << 8) : (b[p] << 8) | b[p + 1]);
      const u32 = (p: number) =>
        little
          ? b[p] + (b[p + 1] << 8) + (b[p + 2] << 16) + b[p + 3] * 16777216
          : b[p] * 16777216 + (b[p + 1] << 16) + (b[p + 2] << 8) + b[p + 3];
      const ifd = t + u32(t + 4);
      if (ifd + 2 > b.length) return 1;
      const n = u16(ifd);
      for (let i = 0; i < n; i += 1) {
        const e = ifd + 2 + i * 12;
        if (e + 12 > b.length) return 1;
        if (u16(e) === 0x0112) return u16(e + 8);
      }
      return 1;
    }
    o += 2 + len;
  }
  return 1;
}

export function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes as unknown as BlobPart], { type });
}

/**
 * EXIF-aware decode into a canvas owned by `mem` (caller must mem.release it).
 * Tolerates decodeImageToCanvas returning the canvas or an object holding it.
 */
export async function decodeToCanvas(blob: Blob, mem: MemoryScope, name: string): Promise<HTMLCanvasElement> {
  let res: unknown;
  try {
    res = await decodeImageToCanvas(blob, mem, MAX_CANVAS_PIXELS);
  } catch (e) {
    if (e instanceof ToolError) throw e;
    throw new ToolError(`"${name}" could not be decoded as an image.`, 'invalid-input');
  }
  if (res instanceof HTMLCanvasElement) return res;
  const inner = (res as { canvas?: unknown } | null)?.canvas;
  if (inner instanceof HTMLCanvasElement) return inner;
  throw new ToolError(`"${name}" could not be decoded as an image.`, 'internal');
}

/** UTF-16 BOM, then strict UTF-8, then Windows-1252. */
export async function readText(file: File): Promise<string> {
  const b = new Uint8Array(await file.arrayBuffer());
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) return new TextDecoder('utf-16le').decode(b.subarray(2));
  if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) return new TextDecoder('utf-16be').decode(b.subarray(2));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(b);
  } catch {
    return new TextDecoder('windows-1252').decode(b);
  }
}

export function dataUriBytes(uri: string | null): { bytes: Uint8Array; kind: RasterKind } | null {
  if (!uri) return null;
  const m = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(uri);
  if (!m || !m[2]) return null;
  try {
    const bin = atob(m[3]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return { bytes, kind: sniffBytes(bytes) };
  } catch {
    return null;
  }
}

export interface PageGeometry {
  pageW: number;
  pageH: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Page size and image placement (PDF points, origin bottom-left).
 * "fit" makes the page match the image at 96 dpi (0.75 pt per pixel), with the
 * longest side limited to 1440 pt, plus the margin on every side.
 */
export function imageGeometry(
  imgW: number,
  imgH: number,
  sizeKey: string,
  orientation: string,
  marginIn: number,
): PageGeometry {
  if (sizeKey === 'fit') {
    let w = imgW * 0.75;
    let h = imgH * 0.75;
    const longest = Math.max(w, h);
    if (longest > 1440) {
      const k = 1440 / longest;
      w *= k;
      h *= k;
    } else if (longest < 72) {
      const k = 72 / longest;
      w *= k;
      h *= k;
    }
    const m = clampNum(marginIn, 0, 200);
    return { pageW: w + 2 * m, pageH: h + 2 * m, x: m, y: m, w, h };
  }
  const landscape = orientation === 'auto' ? imgW > imgH : orientation === 'landscape';
  const [pw, ph] = pageSizeFor(sizeKey, landscape);
  const m = clampNum(marginIn, 0, Math.min(pw, ph) / 3);
  const s = Math.min((pw - 2 * m) / imgW, (ph - 2 * m) / imgH);
  const w = imgW * s;
  const h = imgH * s;
  return { pageW: pw, pageH: ph, x: (pw - w) / 2, y: (ph - h) / 2, w, h };
}

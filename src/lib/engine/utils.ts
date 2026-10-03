// Shared browser-side helpers used across every PDF tool.
// Everything here runs 100% client-side — no data ever leaves the browser.

export function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const a of arrays) total += a.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

export async function fileToUint8Array(file: File | Blob): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

/** Wraps a Uint8Array (e.g. from pdf-lib) into a Blob, sidestepping TS's
 * overly-strict BlobPart typing for generic ArrayBufferLike-backed views. */
export function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes as unknown as BlobPart], { type });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function sanitizeBaseName(name: string): string {
  const withoutExt = name.replace(/\.[^/.]+$/, "");
  return withoutExt.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60) || "document";
}

/** Parse a page-range string like "1-3,5,8-10" into a 0-indexed, de-duplicated page array. */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const result = new Set<number>();
  const cleaned = input.trim();
  if (!cleaned) return [];
  const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      let start = parseInt(rangeMatch[1], 10);
      let end = parseInt(rangeMatch[2], 10);
      if (start > end) [start, end] = [end, start];
      for (let p = start; p <= end; p++) {
        if (p >= 1 && p <= pageCount) result.add(p - 1);
      }
    } else if (/^\d+$/.test(part)) {
      const p = parseInt(part, 10);
      if (p >= 1 && p <= pageCount) result.add(p - 1);
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

export function assertFile(file: File | undefined | null, kind = "file"): File {
  if (!file) throw new ToolError(`Please choose a ${kind} to continue.`);
  return file;
}

export type EngineFileResult = {
  kind: "file";
  blob: Blob;
  filename: string;
};

export type EngineTextResult = {
  kind: "text";
  text: string;
  filename: string;
};

export type EngineInfoResult = {
  kind: "info";
  rows: Array<{ label: string; value: string }>;
};

export type EngineResult = EngineFileResult | EngineTextResult | EngineInfoResult;

export function fileResult(blob: Blob, filename: string): EngineFileResult {
  return { kind: "file", blob, filename };
}

export function textResult(text: string, filename: string): EngineTextResult {
  return { kind: "text", text, filename };
}

export function infoResult(rows: Array<{ label: string; value: string }>): EngineInfoResult {
  return { kind: "info", rows };
}

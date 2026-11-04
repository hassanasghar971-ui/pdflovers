// src/lib/engine/security.ts
//
// protect-pdf, unlock-pdf, redact-pdf.
//
// ── PROTECT ─────────────────────────────────────────────────────────────────────
// pdf-lib cannot encrypt, so this file implements the PDF 2.0 Standard Security
// Handler itself: V5 / R6, AES-256 (AESV3), using only the browser's Web Crypto API
// (no MD5/RC4 needed). Flow: load → encrypt every string and stream in place → write
// /Encrypt + /ID into the trailer → save WITHOUT object streams → SELF-CHECK by
// reopening the result with pdf.js (it must demand a password, and must open and
// decrypt page 1 with the right one). A file that fails the check is never delivered.
//  * Written from the spec and pdf.js's behaviour, not independently audited.
//  * Readable by Acrobat X+, Chrome, Firefox, macOS Preview, mupdf. Very old readers
//    (Acrobat < 9 and some old mobile viewers) cannot open AES-256 files.
//  * Only an open-password is set (owner = user password; all permissions allowed).
//    Permission flags are advisory anyway, so none are restricted.
//  * Passwords use their UTF-8 bytes (max 127). No SASLprep normalisation.
//
// ── UNLOCK ──────────────────────────────────────────────────────────────────────
// pdf-lib cannot decrypt either. Unlock therefore opens the file with pdf.js using the
// supplied password and REBUILDS every page as an image. Only the correct password works.
// Consequence: text becomes non-selectable (run OCR PDF afterwards), links/forms/bookmarks
// are lost and the file may grow. Unencrypted files are returned unchanged.
//
// ── REDACT ──────────────────────────────────────────────────────────────────────
// Terms are located through pdf.js text positions (per-glyph widths are interpolated
// proportionally, so boxes are approximate and padded). Matching is on the text layer
// only: scanned pages need OCR first. Two modes:
//   rasterize ON  : pages become images with the boxes burned in. Text is truly removed.
//   rasterize OFF : black boxes are drawn over the text, and the text stays in the file
//                   and CAN BE COPIED. The result note says this explicitly.

import {
  EncryptedPDFError,
  PDFArray,
  PDFBool,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFRawStream,
  PDFStream,
  PDFString,
} from 'pdf-lib';
import type { PDFObject } from 'pdf-lib';
import { ToolError } from './types';
import type { HandlerMap, RunContext, ToolResult } from './types';
import { canvasToBlob, loadPdfLibDocument, pdfResultFile, savePdfBytes, throwIfAborted, withPdfDocument, yieldToMain } from './shared';
import { allIndexes, bytesOf, clampNum, isPasswordError, optFlag, optStr, progress, renderToCanvas, stem } from './handler-utils';
import { eachPage } from './page-loop';
import { parseColor } from './stamp-utils';
import type { MemoryScope } from '../memory';

/* ========================================================================== */
/*  Web Crypto helpers                                                         */
/* ========================================================================== */

const bs = (u: Uint8Array): BufferSource => u as unknown as BufferSource;
const toHex = (u: Uint8Array): string => Array.from(u, (b) => b.toString(16).padStart(2, '0')).join('');
const random = (n: number): Uint8Array => crypto.getRandomValues(new Uint8Array(n));

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

async function sha(bits: 256 | 384 | 512, data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest(`SHA-${bits}`, bs(data)));
}

/** AES-CBC with PKCS#7 padding (what Web Crypto offers). */
async function aesCbc(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', bs(key), { name: 'AES-CBC' }, false, ['encrypt']);
  return new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv: bs(iv) }, k, bs(data)));
}

/**
 * AES-CBC WITHOUT padding. `data` must be a multiple of 16 bytes: Web Crypto then appends one
 * full padding block at the very end, which CBC lets us simply drop.
 */
async function aesCbcNoPad(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const full = await aesCbc(key, iv, data);
  return full.subarray(0, data.length);
}

/** ISO 32000-2 Algorithm 2.B (revision 6 password hash). */
async function hash2B(pw: Uint8Array, salt: Uint8Array, udata: Uint8Array): Promise<Uint8Array> {
  let k = await sha(256, concat(pw, salt, udata));
  let e: Uint8Array = new Uint8Array(1); // Explicitly typed to avoid TS 5.9 generic mismatch
  for (let i = 0; i < 64 || e[e.length - 1] > i - 32; i++) {
    const unit = concat(pw, k, udata);
    const k1 = new Uint8Array(unit.length * 64);
    for (let j = 0; j < 64; j++) k1.set(unit, j * unit.length);
    e = await aesCbcNoPad(k.subarray(0, 16), k.subarray(16, 32), k1);
    let sum = 0;
    for (let j = 0; j < 16; j++) sum += e[j];
    const r = sum % 3;
    k = await sha(r === 0 ? 256 : r === 1 ? 384 : 512, e);
  }
  return k.subarray(0, 32);
}

/* ========================================================================== */
/*  Protect                                                                    */
/* ========================================================================== */

const PERMISSIONS_ALL = -4; // 0xFFFFFFFC as a signed 32-bit integer
const ZERO_IV = new Uint8Array(16);

async function buildKeys(password: Uint8Array, fileKey: Uint8Array) {
  const empty = new Uint8Array(0);

  const uValSalt = random(8);
  const uKeySalt = random(8);
  const U = concat(await hash2B(password, uValSalt, empty), uValSalt, uKeySalt);
  const UE = await aesCbcNoPad(await hash2B(password, uKeySalt, empty), ZERO_IV, fileKey);

  const oValSalt = random(8);
  const oKeySalt = random(8);
  const O = concat(await hash2B(password, oValSalt, U), oValSalt, oKeySalt);
  const OE = await aesCbcNoPad(await hash2B(password, oKeySalt, U), ZERO_IV, fileKey);

  const perms = new Uint8Array(16);
  new DataView(perms.buffer).setInt32(0, PERMISSIONS_ALL, true);
  perms.set([0xff, 0xff, 0xff, 0xff], 4);
  perms.set([0x54, 0x61, 0x64, 0x62], 8); // 'T' (metadata encrypted), 'a', 'd', 'b'
  perms.set(random(4), 12);
  const Perms = (await aesCbcNoPad(fileKey, ZERO_IV, perms)).slice(0, 16);

  return { U, UE, O, OE, Perms };
}

type Cipher = (data: Uint8Array) => Promise<Uint8Array>;

async function makeCipher(fileKey: Uint8Array): Promise<Cipher> {
  const key = await crypto.subtle.importKey('raw', bs(fileKey), { name: 'AES-CBC' }, false, ['encrypt']);
  return async (data) => {
    const iv = random(16);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv: bs(iv) }, key, bs(data)));
    return concat(iv, ct);
  };
}

async function encryptValue(value: PDFObject, enc: Cipher): Promise<PDFObject | null> {
  if (value instanceof PDFString || value instanceof PDFHexString) {
    return PDFHexString.of(toHex(await enc(value.asBytes())));
  }
  if (value instanceof PDFDict || value instanceof PDFArray) await encryptStrings(value, enc);
  return null;
}

/** Encrypts every direct string inside a dictionary / array (recursively; refs are not followed). */
async function encryptStrings(node: PDFDict | PDFArray, enc: Cipher): Promise<void> {
  if (node instanceof PDFDict) {
    for (const [key, value] of node.entries()) {
      const next = await encryptValue(value, enc);
      if (next) node.set(key, next);
    }
  } else {
    for (let i = 0; i < node.size(); i++) {
      const next = await encryptValue(node.get(i), enc);
      if (next) node.set(i, next);
    }
  }
}

async function encryptDocument(
  doc: PDFDocument,
  password: Uint8Array,
  fileKey: Uint8Array,
  onFraction: (f: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const keys = await buildKeys(password, fileKey);
  const enc = await makeCipher(fileKey);
  const context = doc.context;
  const objects = context.enumerateIndirectObjects();
  const typeKey = PDFName.of('Type');
  const xref = PDFName.of('XRef');

  const handle = async (ref: (typeof objects)[number][0], obj: PDFObject): Promise<void> => {
    if (obj instanceof PDFStream) {
      if (obj.dict.get(typeKey) === xref) return; // cross-reference streams are never encrypted
      await encryptStrings(obj.dict, enc);
      context.assign(ref, PDFRawStream.of(obj.dict, await enc(obj.getContents())));
    } else if (obj instanceof PDFDict || obj instanceof PDFArray) {
      await encryptStrings(obj, enc);
    } else if (obj instanceof PDFString || obj instanceof PDFHexString) {
      context.assign(ref, PDFHexString.of(toHex(await enc(obj.asBytes()))));
    }
  };

  const CHUNK = 64;
  for (let i = 0; i < objects.length; i += CHUNK) {
    throwIfAborted(signal);
    await Promise.all(objects.slice(i, i + CHUNK).map(([ref, obj]) => handle(ref, obj)));
    onFraction(Math.min(1, (i + CHUNK) / objects.length));
    if ((i / CHUNK) % 16 === 15) await yieldToMain();
  }

  // The Encrypt dictionary is registered AFTER the loop, so its own strings stay in the clear.
  const encryptDict = context.obj({
    Filter: 'Standard',
    V: 5,
    R: 6,
    Length: 256,
    P: PERMISSIONS_ALL,
    O: PDFHexString.of(toHex(keys.O)),
    U: PDFHexString.of(toHex(keys.U)),
    OE: PDFHexString.of(toHex(keys.OE)),
    UE: PDFHexString.of(toHex(keys.UE)),
    Perms: PDFHexString.of(toHex(keys.Perms)),
    CF: { StdCF: { AuthEvent: 'DocOpen', CFM: 'AESV3', Length: 32 } },
    StmF: 'StdCF',
    StrF: 'StdCF',
    EncryptMetadata: PDFBool.True,
  });
  context.trailerInfo.Encrypt = context.register(encryptDict);

  const id = PDFHexString.of(toHex(random(16)));
  context.trailerInfo.ID = context.obj([id, id]);

  // Adobe extension level 8 marks the file as using revision 6.
  const extensions = PDFName.of('Extensions');
  if (!doc.catalog.has(extensions)) {
    doc.catalog.set(extensions, context.obj({ ADBE: { BaseVersion: '1.7', ExtensionLevel: 8 } }));
  }
}

function isPasswordFailure(e: unknown): boolean {
  if (e instanceof ToolError && (e.code === 'password-required' || e.code === 'wrong-password')) return true;
  return isPasswordError(e);
}

async function verifyEncrypted(out: Uint8Array, password: string, ctx: RunContext, fileName: string): Promise<void> {
  // 1) It must NOT open without a password.
  let openedWithoutPassword = false;
  try {
    await withPdfDocument(
      out,
      async (pdf) => {
        openedWithoutPassword = pdf.numPages > 0;
      },
      { signal: ctx.signal, fileName },
    );
  } catch (e) {
    if (!isPasswordFailure(e)) throw e;
  }
  if (openedWithoutPassword) {
    throw new ToolError('Encryption self-check failed (file still opens without a password). No file was produced.', 'internal');
  }

  // 2) It must open with the password and decrypt real page content.
  try {
    await withPdfDocument(
      out,
      async (pdf) => {
        if (pdf.numPages < 1) return;
        const page = await pdf.getPage(1);
        try {
          await page.getTextContent();
        } finally {
          page.cleanup();
        }
      },
      { password, signal: ctx.signal, fileName },
    );
  } catch (e) {
    if (e instanceof ToolError && e.code === 'aborted') throw e;
    throw new ToolError(
      'Encryption self-check failed (the protected file could not be reopened with its password). No file was produced.',
      'internal',
    );
  }
}

async function protectPdf(ctx: RunContext, mem: MemoryScope): Promise<ToolResult> {
  const file = ctx.files[0];
  const password = optStr(ctx.options, 'password', '');
  if (!password) throw new ToolError('Enter a password.', 'invalid-input');
  if (optStr(ctx.options, 'confirm', '') !== password) {
    throw new ToolError('The two passwords do not match.', 'invalid-input');
  }

  const pwBytes = new TextEncoder().encode(password).slice(0, 127);
  const fileKey = random(32);
  mem.onDispose(() => {
    fileKey.fill(0);
    pwBytes.fill(0);
  });

  progress(ctx, 3, 'Opening PDF…');
  const bytes = await bytesOf(file);
  const doc = await loadPdfLibDocument(bytes, { ignoreEncryption: false, fileName: file.name });

  progress(ctx, 8, 'Encrypting with AES-256…');
  await encryptDocument(doc, pwBytes, fileKey, (f) => progress(ctx, 8 + 62 * f, 'Encrypting with AES-256…'), ctx.signal);

  progress(ctx, 72, 'Saving…');
  // No object streams (objects inside them are not individually encrypted), and no late
  // appearance generation (it would add unencrypted objects after our pass).
  const saved = await doc.save({ useObjectStreams: false, addDefaultPage: false, updateFieldAppearances: false });

  progress(ctx, 80, 'Verifying the protected file…');
  await verifyEncrypted(saved, password, ctx, file.name);

  progress(ctx, 97, 'Done');
  return {
    files: [pdfResultFile(saved, `${stem(file.name)}-protected.pdf`)],
    note:
      'Protected with AES-256 (PDF 2.0, revision 6). The file was reopened with pdf.js as a self-check. A password is required to open it; there is no recovery, so keep it safe. Very old PDF readers (before Acrobat 9) cannot open AES-256 files, and no print/copy restrictions were set.',
  };
}

/* ========================================================================== */
/*  Raster rebuild (Unlock + true Redact)                                      */
/* ========================================================================== */

const MAX_RASTER_PAGES = 400;

interface RasterOptions {
  password?: string;
  scale: number;
  quality: number;
  fileName: string;
  label: string;
  range: readonly [number, number];
  /** Draws on the rendered page; `k` = canvas pixels per point. Returns items drawn. */
  decorate?: (g: CanvasRenderingContext2D, k: number, index: number) => number;
}

async function rasterRebuild(
  ctx: RunContext,
  mem: MemoryScope,
  bytes: Uint8Array,
  o: RasterOptions,
): Promise<{ bytes: Uint8Array; pages: number; drawn: number }> {
  const out = await PDFDocument.create();
  let drawn = 0;
  let pages = 0;

  await withPdfDocument(
    bytes,
    async (doc) => {
      const total = doc.numPages;
      if (total > MAX_RASTER_PAGES) {
        throw new ToolError(
          `This PDF has ${total} pages. Rebuilding pages as images keeps them all in memory, so it is limited to ${MAX_RASTER_PAGES} pages — split the PDF first.`,
          'out-of-memory',
        );
      }
      await eachPage(
        doc,
        allIndexes(total),
        ctx,
        async (page, index) => {
          const vp = page.getViewport({ scale: 1 });
          const canvas = (await renderToCanvas(page, mem, { scale: o.scale, signal: ctx.signal })) as HTMLCanvasElement;
          let jpeg: Uint8Array;
          try {
            const g = canvas.getContext('2d');
            if (o.decorate && g) drawn += o.decorate(g, canvas.width / vp.width, index);
            const blob = await canvasToBlob(canvas, 'image/jpeg', o.quality);
            jpeg = new Uint8Array(await blob.arrayBuffer());
          } finally {
            mem.release(canvas);
          }
          const img = await out.embedJpg(jpeg);
          const p = out.addPage([vp.width, vp.height]);
          p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
          pages++;
        },
        o.range,
        o.label,
      );
    },
    { password: o.password, signal: ctx.signal, fileName: o.fileName },
  );

  out.setProducer('PDF Lovers Pro');
  out.setCreator('PDF Lovers Pro');
  return { bytes: await savePdfBytes(out), pages, drawn };
}

/* ========================================================================== */
/*  Unlock                                                                     */
/* ========================================================================== */

async function unlockPdf(ctx: RunContext, mem: MemoryScope): Promise<ToolResult> {
  const file = ctx.files[0];
  const password = optStr(ctx.options, 'password', '');

  progress(ctx, 3, 'Opening PDF…');
  const bytes = await bytesOf(file);

  // pdf-lib throws EncryptedPDFError only when an /Encrypt entry exists.
  let encrypted = false;
  try {
    await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (e) {
    if (e instanceof EncryptedPDFError) encrypted = true;
    else throw e;
  }

  if (!encrypted) {
    return {
      files: [pdfResultFile(bytes, `${stem(file.name)}-unlocked.pdf`)],
      note: 'This PDF is not password-protected, so it was returned unchanged.',
    };
  }

  progress(ctx, 6, 'Checking the password…');
  const res = await rasterRebuild(ctx, mem, bytes, {
    password,
    scale: 2,
    quality: 0.88,
    fileName: file.name,
    label: 'Unlocking page',
    range: [8, 95],
  });

  return {
    files: [pdfResultFile(res.bytes, `${stem(file.name)}-unlocked.pdf`)],
    note: `Unlocked ${res.pages} page${res.pages === 1 ? '' : 's'}. Because the original cannot be decrypted in place in the browser, each page was rebuilt as an image: the new file has no password, but text is no longer selectable (run OCR PDF to restore it), and links, forms and bookmarks are gone. Only unlock files you are allowed to open.`,
  };
}

/* ========================================================================== */
/*  Redact                                                                     */
/* ========================================================================== */

interface RawItem {
  str?: string;
  transform?: number[];
  width?: number;
}
interface ViewportLike {
  transform: number[];
  width: number;
  height: number;
  convertToPdfPoint(x: number, y: number): number[];
}
interface TextPageLike {
  getViewport(p: { scale: number }): ViewportLike;
  getTextContent(): Promise<{ items: unknown[] }>;
  cleanup(): unknown;
}
interface TItem {
  str: string;
  x: number;
  y: number;
  w: number;
  size: number;
  dx: number;
  dy: number;
}
interface Box {
  vx0: number;
  vy0: number;
  vx1: number;
  vy1: number;
  px0: number;
  py0: number;
  px1: number;
  py1: number;
}

function mul(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

/** Viewport-space AABB of characters [i0, i1) of an item (rotation-aware, generously padded). */
function itemRect(it: TItem, i0: number, i1: number): [number, number, number, number] {
  const n = Math.max(1, it.str.length);
  const a = (it.w * i0) / n;
  const b = (it.w * i1) / n;
  const ax = it.x + it.dx * a;
  const ay = it.y + it.dy * a;
  const bx = it.x + it.dx * b;
  const by = it.y + it.dy * b;
  const ux = it.dy; // "up" on screen (y grows downward)
  const uy = -it.dx;
  const asc = it.size * 0.88;
  const desc = it.size * 0.25;
  const xs = [ax + ux * asc, ax - ux * desc, bx + ux * asc, bx - ux * desc];
  const ys = [ay + uy * asc, ay - uy * desc, by + uy * asc, by - uy * desc];
  const pad = 1.5;
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad];
}

async function scanPage(page: TextPageLike, terms: string[], caseSensitive: boolean): Promise<Box[]> {
  const vp = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const items: TItem[] = [];
  for (const raw of content.items as RawItem[]) {
    if (typeof raw.str !== 'string' || !raw.str.trim() || !raw.transform || raw.transform.length < 6) continue;
    const m = mul(vp.transform, raw.transform);
    const len = Math.hypot(m[0], m[1]) || 1;
    items.push({
      str: raw.str,
      x: m[4],
      y: m[5],
      w: Math.abs(raw.width ?? 0),
      size: Math.hypot(m[2], m[3]) || 10,
      dx: m[0] / len,
      dy: m[1] / len,
    });
  }

  const isHorizontal = (i: TItem) => Math.abs(i.dy) < 0.1 && i.dx > 0;
  const horizontal = items.filter(isHorizontal).sort((a, b) => a.y - b.y || a.x - b.x);
  const clusters: { items: TItem[]; sumY: number }[] = [];
  for (const it of horizontal) {
    const last = clusters[clusters.length - 1];
    if (last && Math.abs(it.y - last.sumY / last.items.length) <= Math.max(1.5, it.size * 0.4)) {
      last.items.push(it);
      last.sumY += it.y;
    } else clusters.push({ items: [it], sumY: it.y });
  }
  // Rotated fragments are matched one item at a time (never skipped: a missed redaction is worse than a big box).
  const rowSets: TItem[][] = [
    ...clusters.map((c) => c.items.sort((a, b) => a.x - b.x)),
    ...items.filter((i) => !isHorizontal(i)).map((i) => [i]),
  ];

  const boxes: Box[] = [];
  for (const row of rowSets) {
    let joined = '';
    const segs: { start: number; end: number; item: TItem }[] = [];
    let prev: TItem | null = null;
    let prevRight = -Infinity;
    for (const it of row) {
      if (prev && prev.str === it.str && Math.abs(prev.x - it.x) < it.size * 0.15) continue; // faux-bold duplicate
      const gap = it.x - prevRight;
      if (joined && gap > it.size * 0.12 && !/\s$/.test(joined) && !/^\s/.test(it.str)) joined += ' ';
      segs.push({ start: joined.length, end: joined.length + it.str.length, item: it });
      joined += it.str;
      prevRight = it.x + it.w;
      prev = it;
    }

    const lowered = caseSensitive ? joined : joined.toLowerCase();
    const fold = !caseSensitive && lowered.length === joined.length;
    const hay = fold ? lowered : joined;
    for (const term of terms) {
      const needle = fold ? term.toLowerCase() : term;
      for (let at = hay.indexOf(needle); at !== -1; at = hay.indexOf(needle, at + needle.length)) {
        const end = at + needle.length;
        for (const seg of segs) {
          const o0 = Math.max(at, seg.start);
          const o1 = Math.min(end, seg.end);
          if (o0 >= o1) continue;
          const [x0, y0, x1, y1] = itemRect(seg.item, o0 - seg.start, o1 - seg.start);
          const p0 = vp.convertToPdfPoint(x0, y0);
          const p1 = vp.convertToPdfPoint(x1, y1);
          boxes.push({
            vx0: x0,
            vy0: y0,
            vx1: x1,
            vy1: y1,
            px0: Math.min(p0[0], p1[0]),
            py0: Math.min(p0[1], p1[1]),
            px1: Math.max(p0[0], p1[0]),
            py1: Math.max(p0[1], p1[1]),
          });
        }
      }
    }
  }
  return boxes;
}

function cssHex(value: string): string {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(value.trim());
  return m ? `#${m[1]}` : '#000000';
}

async function redactPdf(ctx: RunContext, mem: MemoryScope): Promise<ToolResult> {
  const file = ctx.files[0];
  const caseSensitive = optFlag(ctx.options, 'caseSensitive', false);
  const rasterize = optFlag(ctx.options, 'rasterize', true);
  const colorHex = optStr(ctx.options, 'color', '#000000');
  const terms = Array.from(
    new Set(
      optStr(ctx.options, 'terms', '')
        .split(/[,;\n]/)
        .map((t) => t.replace(/\s+/g, ' ').trim())
        .filter(Boolean),
    ),
  );
  if (!terms.length) throw new ToolError('Enter at least one word or phrase to redact (separate several with commas).', 'invalid-input');

  progress(ctx, 3, 'Opening PDF…');
  const bytes = await bytesOf(file);

  // Pass 1: locate matches (text only, fast). Fail early if nothing matches.
  const found = new Map<number, Box[]>();
  await withPdfDocument(
    bytes,
    async (doc) => {
      await eachPage(
        doc,
        allIndexes(doc.numPages),
        ctx,
        async (page, index) => {
          const boxes = await scanPage(page as unknown as TextPageLike, terms, caseSensitive);
          if (boxes.length) found.set(index, boxes);
        },
        [5, 35],
        'Searching page',
      );
    },
    { signal: ctx.signal, fileName: file.name },
  );

  let hits = 0;
  for (const b of found.values()) hits += b.length;
  if (!hits) {
    throw new ToolError(
      'None of the terms were found in the PDF’s text layer, so nothing was redacted. If this is a scan, run OCR PDF first. Check spelling and the case-sensitive option.',
      'invalid-input',
    );
  }
  const pagesHit = found.size;

  if (rasterize) {
    const css = cssHex(colorHex);
    const res = await rasterRebuild(ctx, mem, bytes, {
      scale: 2,
      quality: 0.9,
      fileName: file.name,
      label: 'Redacting page',
      range: [38, 96],
      decorate: (g, k, index) => {
        const boxes = found.get(index);
        if (!boxes) return 0;
        g.fillStyle = css;
        for (const b of boxes) g.fillRect(b.vx0 * k, b.vy0 * k, (b.vx1 - b.vx0) * k, (b.vy1 - b.vy0) * k);
        return boxes.length;
      },
    });
    return {
      files: [pdfResultFile(res.bytes, `${stem(file.name)}-redacted.pdf`)],
      note: `${hits} match${hits === 1 ? '' : 'es'} redacted on ${pagesHit} page${pagesHit === 1 ? '' : 's'}. Pages were rebuilt as images, so the redacted text is permanently gone from the file (original metadata, links and forms are gone too), but no text in the document is selectable any more. Matching only covers the text layer, so check the result by eye, especially for text that is part of images.`,
    };
  }

  progress(ctx, 50, 'Drawing redaction boxes…');
  const doc = await loadPdfLibDocument(bytes, { ignoreEncryption: false, fileName: file.name });
  const color = parseColor(colorHex, [0, 0, 0]);
  const pages = doc.getPages();
  for (const [index, boxes] of found) {
    const page = pages[index];
    if (!page) continue;
    for (const b of boxes) {
      page.drawRectangle({ x: b.px0, y: b.py0, width: b.px1 - b.px0, height: b.py1 - b.py0, color });
    }
  }
  progress(ctx, 92, 'Saving…');
  return {
    files: [pdfResultFile(await savePdfBytes(doc), `${stem(file.name)}-redacted.pdf`)],
    note: `WARNING: ${hits} box${hits === 1 ? '' : 'es'} drawn on ${pagesHit} page${pagesHit === 1 ? '' : 's'}, but the covered text is STILL IN THE FILE and can be selected, copied or recovered. This is a visual cover only. Turn on "rasterize" for real redaction.`,
  };
}

/* ========================================================================== */
/*  Handler map                                                                */
/* ========================================================================== */

export const handlers: HandlerMap = {
  'protect-pdf': (ctx, mem) => protectPdf(ctx, mem),
  'unlock-pdf': (ctx, mem) => unlockPdf(ctx, mem),
  'redact-pdf': (ctx, mem) => redactPdf(ctx, mem),
};

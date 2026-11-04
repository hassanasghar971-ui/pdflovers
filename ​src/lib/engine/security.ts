
import {
  EncryptedPDFError,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFRawStream,
  PDFStream,
  PDFString,
  rgb,
} from 'pdf-lib';
import { ToolError } from './types';
import type { HandlerMap, RunContext, ToolResult } from './types';
import {
  bool,
  canvasToBlob,
  concat,
  openPdfJs,
  parseColor,
  pdfBlob,
  purgeCanvas,
  randomBytes,
  readBytes,
  renderPage,
  str,
  stripExt,
  throwIfAborted,
  toBuf,
  toHex,
} from './kit';
import type { PdfPage } from './kit';

/* ================================================================== */
/* Web Crypto helpers                                                  */
/* ================================================================== */
function subtle(): SubtleCrypto {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new ToolError('Encryption needs a secure (HTTPS) browser context.', 'unsupported');
  }
  return crypto.subtle;
}

type ShaName = 'SHA-256' | 'SHA-384' | 'SHA-512';

async function sha(alg: ShaName, data: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(await subtle().digest(alg, toBuf(data)));
}

/**
 * AES-CBC without padding. Web Crypto always adds PKCS#7 padding, so the input must be a
 * multiple of 16 bytes and the extra final block is dropped.
 */
async function aesCbcNoPad(
  key: Uint8Array,
  iv: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array<ArrayBuffer>> {
  const k = await subtle().importKey('raw', toBuf(key), { name: 'AES-CBC' }, false, ['encrypt']);
  const out = new Uint8Array(await subtle().encrypt({ name: 'AES-CBC', iv: toBuf(iv) }, k, toBuf(data)));
  return out.subarray(0, data.length);
}

/** ISO 32000-2 Algorithm 2.B (revision 6 hash). */
async function hashR6(
  password: Uint8Array,
  salt: Uint8Array,
  udata: Uint8Array,
): Promise<Uint8Array<ArrayBuffer>> {
  let k = await sha('SHA-256', concat(password, salt, udata));
  let i = 0;
  for (;;) {
    const unit = concat(password, k, udata);
    const k1 = new Uint8Array(unit.length * 64);
    for (let j = 0; j < 64; j++) k1.set(unit, j * unit.length);
    const e = await aesCbcNoPad(k.subarray(0, 16), k.subarray(16, 32), k1);
    let sum = 0;
    for (let j = 0; j < 16; j++) sum += e[j];
    const alg: ShaName = sum % 3 === 0 ? 'SHA-256' : sum % 3 === 1 ? 'SHA-384' : 'SHA-512';
    k = await sha(alg, e);
    i++;
    if (i >= 64 && e[e.length - 1] <= i - 32) break;
  }
  return k.slice(0, 32);
}

interface EncryptionParams {
  fileKey: Uint8Array<ArrayBuffer>;
  O: Uint8Array;
  U: Uint8Array;
  OE: Uint8Array;
  UE: Uint8Array;
  Perms: Uint8Array;
}

const P_ALL_ALLOWED = -4; // 0xFFFFFFFC

/** Builds the AES-256 (V5 / R6) standard security handler values. */
async function buildEncryption(userPw: Uint8Array, ownerPw: Uint8Array): Promise<EncryptionParams> {
  const zeroIv = new Uint8Array(16);
  const empty = new Uint8Array(0);
  const fileKey = randomBytes(32);

  // User entries
  const uValSalt = randomBytes(8);
  const uKeySalt = randomBytes(8);
  const U = concat(await hashR6(userPw, uValSalt, empty), uValSalt, uKeySalt);
  const UE = await aesCbcNoPad(await hashR6(userPw, uKeySalt, empty), zeroIv, fileKey);

  // Owner entries (the 48-byte U value is mixed in)
  const oValSalt = randomBytes(8);
  const oKeySalt = randomBytes(8);
  const O = concat(await hashR6(ownerPw, oValSalt, U), oValSalt, oKeySalt);
  const OE = await aesCbcNoPad(await hashR6(ownerPw, oKeySalt, U), zeroIv, fileKey);

  // Perms: P (LE) + 0xFFFFFFFF + 'T' (EncryptMetadata) + 'adb' + 4 random bytes, AES-256-ECB
  const perms = new Uint8Array(16);
  new DataView(perms.buffer).setInt32(0, P_ALL_ALLOWED, true);
  perms.set([0xff, 0xff, 0xff, 0xff], 4);
  perms[8] = 0x54; // 'T'
  perms[9] = 0x61; // 'a'
  perms[10] = 0x64; // 'd'
  perms[11] = 0x62; // 'b'
  perms.set(randomBytes(4), 12);
  // One block in CBC with a zero IV is identical to ECB.
  const Perms = await aesCbcNoPad(fileKey, zeroIv, perms);

  return { fileKey, O, U, OE, UE, Perms };
}

/* ================================================================== */
/* Object encryption (AESV3: file key used directly, random IV prefix) */
/* ================================================================== */
type EncryptFn = (data: Uint8Array) => Promise<Uint8Array>;

async function makeEncryptFn(fileKey: Uint8Array): Promise<EncryptFn> {
  const key = await subtle().importKey('raw', toBuf(fileKey), { name: 'AES-CBC' }, false, ['encrypt']);
  return async (data) => {
    const iv = randomBytes(16);
    const ct = new Uint8Array(await subtle().encrypt({ name: 'AES-CBC', iv }, key, toBuf(data)));
    return concat(iv, ct);
  };
}

/** Encrypts strings inside dicts/arrays in place. Returns a replacement if `obj` itself is a string. */
async function encryptValue(obj: PDFObject, enc: EncryptFn): Promise<PDFObject | null> {
  if (obj instanceof PDFString || obj instanceof PDFHexString) {
    return PDFHexString.of(toHex(await enc(obj.asBytes())));
  }
  if (obj instanceof PDFDict) {
    for (const [key, value] of obj.entries()) {
      const r = await encryptValue(value, enc);
      if (r) obj.set(key, r);
    }
    return null;
  }
  if (obj instanceof PDFArray) {
    for (let i = 0; i < obj.size(); i++) {
      const r = await encryptValue(obj.get(i), enc);
      if (r) obj.set(i, r);
    }
    return null;
  }
  return null;
}

function isNameValue(v: PDFObject | undefined, name: string): boolean {
  return v instanceof PDFName && v.asString() === `/${name}`;
}

/* ================================================================== */
/* protect-pdf                                                         */
/* ================================================================== */
const MAX_PW_BYTES = 127;

async function protectPdf(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  if (!file) throw new ToolError('Choose a PDF first.', 'invalid-input');

  const password = str(ctx.options, 'password');
  const confirm = str(ctx.options, 'confirm', password);
  if (!password) throw new ToolError('Enter a password.', 'invalid-input');
  if (password !== confirm) throw new ToolError('The two passwords do not match.', 'invalid-input');
  const pw = new TextEncoder().encode(password);
  if (pw.length > MAX_PW_BYTES) {
    throw new ToolError(`The password is too long (maximum ${MAX_PW_BYTES} bytes in UTF-8).`, 'invalid-input');
  }

  ctx.onProgress(3, 'Reading PDF');
  const bytes = await readBytes(file);
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (e) {
    if (e instanceof EncryptedPDFError) {
      throw new ToolError('This PDF is already password protected. Unlock it first.', 'invalid-pdf');
    }
    throw new ToolError('This file is not a valid PDF, or it is damaged.', 'invalid-pdf');
  }
  const pageCount = doc.getPageCount();
  throwIfAborted(ctx.signal);

  ctx.onProgress(10, 'Deriving encryption keys');
  const params = await buildEncryption(pw, pw);
  const enc = await makeEncryptFn(params.fileKey);
  throwIfAborted(ctx.signal);

  const context = doc.context;
  const entries = context.enumerateIndirectObjects();
  for (let i = 0; i < entries.length; i++) {
    const [ref, obj] = entries[i];
    if (obj instanceof PDFStream) {
      const type = obj.dict.get(PDFName.of('Type'));
      if (isNameValue(type, 'XRef') || isNameValue(type, 'ObjStm')) {
        // Structural streams are regenerated by pdf-lib when it writes the file.
        context.delete(ref);
        continue;
      }
      await encryptValue(obj.dict, enc);
      const encrypted = await enc(obj.getContents());
      obj.dict.set(PDFName.of('Length'), PDFNumber.of(encrypted.length));
      context.assign(ref, PDFRawStream.of(obj.dict, encrypted));
    } else {
      const replacement = await encryptValue(obj, enc);
      if (replacement) context.assign(ref, replacement);
    }
    if (i % 40 === 0) {
      ctx.onProgress(10 + Math.round((i / entries.length) * 65), 'Encrypting content');
      throwIfAborted(ctx.signal);
    }
  }

  // The Encrypt dictionary is added AFTER the pass so its own strings stay unencrypted.
  const encryptDict = context.obj({
    Filter: 'Standard',
    V: 5,
    R: 6,
    Length: 256,
    P: P_ALL_ALLOWED,
    O: PDFHexString.of(toHex(params.O)),
    U: PDFHexString.of(toHex(params.U)),
    OE: PDFHexString.of(toHex(params.OE)),
    UE: PDFHexString.of(toHex(params.UE)),
    Perms: PDFHexString.of(toHex(params.Perms)),
    CF: { StdCF: { AuthEvent: 'DocOpen', CFM: 'AESV3', Length: 32 } },
    StmF: 'StdCF',
    StrF: 'StdCF',
  });
  context.trailerInfo.Encrypt = context.register(encryptDict);
  const id = toHex(randomBytes(16));
  context.trailerInfo.ID = context.obj([PDFHexString.of(id), PDFHexString.of(id)]);

  ctx.onProgress(80, 'Writing file');
  const out = await doc.save({ useObjectStreams: false, addDefaultPage: false });

  ctx.onProgress(90, 'Verifying the encrypted file');
  await selfCheckEncrypted(out, password, pageCount);

  ctx.onProgress(100, 'Done');
  return {
    files: [{ name: `${stripExt(file.name)}-protected.pdf`, blob: pdfBlob(out), mime: 'application/pdf' }],
    note:
      'Encrypted with AES-256. Keep the password safe: it cannot be recovered. ' +
      'This is a self-built implementation that has not been independently audited. ' +
      'Open the file in your usual PDF viewer to confirm it works there before relying on it.',
  };
}

/** Re-opens the output with pdf.js: it must refuse no password and accept the right one. */
async function selfCheckEncrypted(out: Uint8Array, password: string, pageCount: number): Promise<void> {
  let refused = false;
  try {
    const d = await openPdfJs(out);
    await d.destroy();
  } catch (e) {
    refused = e instanceof ToolError && e.code === 'password-required';
  }
  if (!refused) {
    throw new ToolError('The encrypted file failed its self-check (it opened without a password). It was not saved.', 'internal');
  }

  try {
    const d = await openPdfJs(out, password);
    try {
      if (d.numPages !== pageCount) throw new Error('page count mismatch');
      const page = await d.getPage(1);
      await page.getTextContent();
      page.cleanup();
    } finally {
      await d.destroy();
    }
  } catch {
    throw new ToolError('The encrypted file failed its self-check (it could not be read back). It was not saved.', 'internal');
  }
}

/* ================================================================== */
/* unlock-pdf                                                          */
/* ================================================================== */
const UNLOCK_SCALE = 2;
const RASTER_JPEG_QUALITY = 0.9;

async function addRasterPage(
  out: PDFDocument,
  canvas: HTMLCanvasElement,
  widthPt: number,
  heightPt: number,
): Promise<void> {
  const blob = await canvasToBlob(canvas, 'image/jpeg', RASTER_JPEG_QUALITY);
  const jpg = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
  const page = out.addPage([widthPt, heightPt]);
  page.drawImage(jpg, { x: 0, y: 0, width: widthPt, height: heightPt });
}

async function unlockPdf(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  if (!file) throw new ToolError('Choose a PDF first.', 'invalid-input');
  const password = str(ctx.options, 'password');

  ctx.onProgress(3, 'Reading PDF');
  const bytes = await readBytes(file);

  // pdf-lib refuses encrypted files, so a successful plain load means there is nothing to unlock.
  try {
    await PDFDocument.load(bytes, { updateMetadata: false });
    return {
      files: [{ name: file.name, blob: pdfBlob(bytes), mime: 'application/pdf' }],
      note: 'This PDF is not encrypted, so it was returned unchanged.',
    };
  } catch (e) {
    if (!(e instanceof EncryptedPDFError)) {
      throw new ToolError('This file is not a valid PDF, or it is damaged.', 'invalid-pdf');
    }
  }

  const pdf = await openPdfJs(bytes, password); // throws password-required / wrong-password
  const out = await PDFDocument.create();
  try {
    const total = pdf.numPages;
    for (let p = 1; p <= total; p++) {
      throwIfAborted(ctx.signal);
      ctx.onProgress(8 + Math.round(((p - 1) / total) * 84), `Unlocking page ${p} of ${total}`);
      const page: PdfPage = await pdf.getPage(p);
      const r = await renderPage(page, UNLOCK_SCALE);
      try {
        await addRasterPage(out, r.canvas, r.widthPt, r.heightPt);
      } finally {
        purgeCanvas(r.canvas);
        page.cleanup();
      }
    }
  } finally {
    await pdf.destroy();
  }

  ctx.onProgress(95, 'Writing file');
  const result = await out.save({ useObjectStreams: false });
  ctx.onProgress(100, 'Done');
  return {
    files: [{ name: `${stripExt(file.name)}-unlocked.pdf`, blob: pdfBlob(result), mime: 'application/pdf' }],
    note:
      'The password was removed by re-drawing every page as an image. The result opens without a password, ' +
      'but its text is no longer selectable or searchable. Only unlock files you are allowed to open.',
  };
}

/* ================================================================== */
/* redact-pdf                                                          */
/* ================================================================== */
interface TextItemLike {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
}

function isTextItem(x: unknown): x is TextItemLike {
  return typeof x === 'object' && x !== null && 'str' in x && 'transform' in x && 'width' in x;
}

type Rect = [number, number, number, number]; // x1, y1, x2, y2 in PDF user space

interface Segment {
  start: number;
  end: number;
  item: TextItemLike;
}

/** Lower-cases without ever changing string length, so match offsets stay valid. */
function foldCase(s: string): string {
  return Array.from(s, (ch) => {
    const l = ch.toLowerCase();
    return l.length === ch.length ? l : ch;
  }).join('');
}

function parseTerms(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(/[\r\n,]+/)) {
    const t = part.trim();
    if (t) seen.add(t);
  }
  return [...seen];
}

function segmentRect(item: TextItemLike, from: number, to: number): Rect | null {
  const len = item.str.length;
  if (len === 0 || !(item.width > 0)) return null;
  const [ta, tb] = item.transform;
  const tx = item.transform[4];
  const ty = item.transform[5];
  const mag = Math.hypot(ta, tb) || 1;
  const ux = ta / mag;
  const uy = tb / mag;
  const nx = -uy;
  const ny = ux;
  const h = Math.abs(item.height) || mag;
  const x0 = (from / len) * item.width;
  const x1 = (to / len) * item.width;
  const yLow = -0.25 * h - 1;
  const yHigh = 0.95 * h + 1;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const x of [x0 - 1, x1 + 1]) {
    for (const y of [yLow, yHigh]) {
      xs.push(tx + ux * x + nx * y);
      ys.push(ty + uy * x + ny * y);
    }
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

async function findRects(page: PdfPage, terms: string[], caseSensitive: boolean): Promise<{ rects: Rect[]; hits: number }> {
  const content = await page.getTextContent();
  const segments: Segment[] = [];
  let text = '';
  for (const raw of content.items as unknown[]) {
    if (!isTextItem(raw)) continue;
    const start = text.length;
    text += raw.str;
    segments.push({ start, end: text.length, item: raw });
    if (raw.hasEOL) text += '\n';
  }
  const hay = caseSensitive ? text : foldCase(text);
  const rects: Rect[] = [];
  let hits = 0;
  for (const term of terms) {
    const needle = caseSensitive ? term : foldCase(term);
    if (!needle) continue;
    let from = 0;
    for (;;) {
      const at = hay.indexOf(needle, from);
      if (at === -1) break;
      const end = at + needle.length;
      hits++;
      for (const seg of segments) {
        if (seg.end <= at || seg.start >= end) continue;
        const r = segmentRect(seg.item, Math.max(at, seg.start) - seg.start, Math.min(end, seg.end) - seg.start);
        if (r) rects.push(r);
      }
      from = end;
    }
  }
  return { rects, hits };
}

async function redactPdf(ctx: RunContext): Promise<ToolResult> {
  const file = ctx.files[0];
  if (!file) throw new ToolError('Choose a PDF first.', 'invalid-input');

  const terms = parseTerms(str(ctx.options, 'terms'));
  if (terms.length === 0) throw new ToolError('Enter at least one word or phrase to redact.', 'invalid-input');
  const caseSensitive = bool(ctx.options, 'caseSensitive', false);
  const rasterize = bool(ctx.options, 'rasterize', true);
  const [cr, cg, cb] = parseColor(str(ctx.options, 'color', '#000000'));

  ctx.onProgress(3, 'Reading PDF');
  const bytes = await readBytes(file);
  const pdf = await openPdfJs(bytes, undefined);

  const rectsByPage = new Map<number, Rect[]>();
  let totalHits = 0;
  const rasterOut = rasterize ? await PDFDocument.create() : null;

  try {
    const total = pdf.numPages;
    for (let p = 1; p <= total; p++) {
      throwIfAborted(ctx.signal);
      ctx.onProgress(5 + Math.round(((p - 1) / total) * 80), `Searching page ${p} of ${total}`);
      const page = await pdf.getPage(p);
      try {
        const { rects, hits } = await findRects(page, terms, caseSensitive);
        totalHits += hits;
        if (rects.length) rectsByPage.set(p, rects);

        if (rasterOut) {
          const r = await renderPage(page, 2);
          try {
            r.g.fillStyle = `rgb(${Math.round(cr * 255)},${Math.round(cg * 255)},${Math.round(cb * 255)})`;
            for (const [x1, y1, x2, y2] of rects) {
              const v = r.viewport.convertToViewportRectangle([x1, y1, x2, y2]);
              const vx = Math.min(v[0], v[2]);
              const vy = Math.min(v[1], v[3]);
              r.g.fillRect(vx, vy, Math.abs(v[2] - v[0]), Math.abs(v[3] - v[1]));
            }
            await addRasterPage(rasterOut, r.canvas, r.widthPt, r.heightPt);
          } finally {
            purgeCanvas(r.canvas);
          }
        }
      } finally {
        page.cleanup();
      }
    }
  } finally {
    await pdf.destroy();
  }

  if (totalHits === 0) {
    throw new ToolError('None of those words or phrases were found, so nothing was redacted.', 'invalid-input');
  }

  let result: Uint8Array;
  if (rasterOut) {
    ctx.onProgress(92, 'Writing file');
    result = await rasterOut.save({ useObjectStreams: false });
  } else {
    ctx.onProgress(88, 'Applying redaction boxes');
    let doc: PDFDocument;
    try {
      doc = await PDFDocument.load(bytes, { updateMetadata: false });
    } catch (e) {
      if (e instanceof EncryptedPDFError) {
        throw new ToolError('This PDF is password protected. Unlock it first.', 'password-required');
      }
      throw new ToolError('This file is not a valid PDF, or it is damaged.', 'invalid-pdf');
    }
    const pages = doc.getPages();
    for (const [pageNo, rects] of rectsByPage) {
      const page = pages[pageNo - 1];
      if (!page) continue;
      for (const [x1, y1, x2, y2] of rects) {
        page.drawRectangle({ x: x1, y: y1, width: x2 - x1, height: y2 - y1, color: rgb(cr, cg, cb) });
      }
    }
    result = await doc.save({ useObjectStreams: false });
  }

  ctx.onProgress(100, 'Done');
  const pagesAffected = rectsByPage.size;
  return {
    files: [{ name: `${stripExt(file.name)}-redacted.pdf`, blob: pdfBlob(result), mime: 'application/pdf' }],
    report: `Redacted ${totalHits} match${totalHits === 1 ? '' : 'es'} on ${pagesAffected} page${pagesAffected === 1 ? '' : 's'}.`,
    note: rasterize
      ? 'Every page was converted to an image, so the redacted text is permanently gone. Text in the rest of the document is no longer selectable. Text that exists only inside scanned images cannot be found or redacted.'
      : 'WARNING: black boxes were drawn on top of the text, but the original text is still inside the file and can be copied. Turn on "rasterize" for permanent redaction.',
  };
}

/* ================================================================== */
/* Handler map                                                         */
/* ================================================================== */
export const securityHandlers: HandlerMap = {
  'protect-pdf': protectPdf,
  'unlock-pdf': unlockPdf,
  'redact-pdf': redactPdf,
};

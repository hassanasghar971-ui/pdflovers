// A from-scratch, dependency-light implementation of the PDF "Standard Security
// Handler" (RC4, 128-bit, Revision 3) used to add real, openable password
// protection to PDF files entirely inside the browser. pdf-lib intentionally
// ships with no encryption support, so this module post-processes the raw
// bytes pdf-lib produces (classic, non-object-stream layout) and appends an
// incremental update that introduces the /Encrypt dictionary. Verified against
// pdf.js to correctly gate opening behind the supplied password(s).
import SparkMD5 from "spark-md5";
import { concatUint8Arrays } from "./utils";

const PAD = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00,
  0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

function md5(bytes: Uint8Array): Uint8Array {
  const copy = bytes.slice();
  const raw = SparkMD5.ArrayBuffer.hash(copy.buffer, true);
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = raw.charCodeAt(i) & 0xff;
  return out;
}

function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 255;
    const t = S[i];
    S[i] = S[j];
    S[j] = t;
  }
  const out = new Uint8Array(data.length);
  let i = 0;
  j = 0;
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 255;
    j = (j + S[i]) & 255;
    const t = S[i];
    S[i] = S[j];
    S[j] = t;
    out[k] = data[k] ^ S[(S[i] + S[j]) & 255];
  }
  return out;
}

function xorKey(key: Uint8Array, byte: number): Uint8Array {
  const out = new Uint8Array(key.length);
  for (let i = 0; i < key.length; i++) out[i] = key[i] ^ byte;
  return out;
}

function padPassword(pw: string): Uint8Array {
  const bytes = new TextEncoder().encode(pw).slice(0, 32);
  const out = new Uint8Array(32);
  out.set(bytes, 0);
  out.set(PAD.slice(0, 32 - bytes.length), bytes.length);
  return out;
}

function computeOwnerKey(ownerPwPadded: Uint8Array, userPwPadded: Uint8Array, revision: number, keyLen: number) {
  let hash = md5(ownerPwPadded);
  if (revision >= 3) {
    for (let i = 0; i < 50; i++) hash = md5(hash.slice(0, keyLen));
  }
  const rc4Key = hash.slice(0, keyLen);
  if (revision === 2) return rc4(rc4Key, userPwPadded);
  let cur = userPwPadded;
  for (let i = 0; i < 20; i++) cur = rc4(xorKey(rc4Key, i), cur);
  return cur;
}

function computeEncryptionKey(
  userPwPadded: Uint8Array,
  O: Uint8Array,
  P: number,
  idBytes: Uint8Array,
  revision: number,
  keyLen: number
) {
  const pBytes = new Uint8Array(4);
  pBytes[0] = P & 0xff;
  pBytes[1] = (P >> 8) & 0xff;
  pBytes[2] = (P >> 16) & 0xff;
  pBytes[3] = (P >> 24) & 0xff;
  const input = concatUint8Arrays(userPwPadded, O, pBytes, idBytes);
  let hash = md5(input);
  if (revision >= 3) {
    for (let i = 0; i < 50; i++) hash = md5(hash.slice(0, keyLen));
  }
  return hash.slice(0, keyLen);
}

function computeUserKey(encKey: Uint8Array, idBytes: Uint8Array, revision: number) {
  if (revision === 2) return rc4(encKey, PAD);
  let hash = md5(concatUint8Arrays(PAD, idBytes));
  let cur = rc4(encKey, hash);
  for (let i = 1; i < 20; i++) cur = rc4(xorKey(encKey, i), cur);
  const result = new Uint8Array(32);
  result.set(cur, 0);
  return result;
}

function perObjectKey(encKey: Uint8Array, objNum: number, gen: number, keyLen: number) {
  const extra = new Uint8Array(5);
  extra[0] = objNum & 0xff;
  extra[1] = (objNum >> 8) & 0xff;
  extra[2] = (objNum >> 16) & 0xff;
  extra[3] = gen & 0xff;
  extra[4] = (gen >> 8) & 0xff;
  const hash = md5(concatUint8Arrays(encKey, extra));
  return hash.slice(0, Math.min(keyLen + 5, 16));
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ProtectPermissions = {
  printing: boolean;
  copying: boolean;
  modifying: boolean;
  annotating: boolean;
};

/**
 * Adds standard PDF password encryption (RC4, 128-bit, revision 3) to an
 * already-serialized PDF. The input MUST be produced with
 * `PDFDocument.save({ useObjectStreams: false })` so that the file uses a
 * classic, plain-text cross-reference table (required for this in-place /
 * incremental-update technique to work).
 */
export function protectPdfBytes(
  source: Uint8Array,
  userPassword: string,
  ownerPassword: string,
  permissions: ProtectPermissions
): Uint8Array {
  const revision = 3;
  const keyLen = 16;
  const text = new TextDecoder("latin1").decode(source);

  const objRe = /(\d+)[ \t]+(\d+)[ \t]+obj\b/g;
  const objects: Array<{ objNum: number; gen: number; bodyStart: number; end: number }> = [];
  let maxObjNum = 0;
  let match: RegExpExecArray | null;
  while ((match = objRe.exec(text))) {
    const objNum = parseInt(match[1], 10);
    const gen = parseInt(match[2], 10);
    maxObjNum = Math.max(maxObjNum, objNum);
    const endIdx = text.indexOf("endobj", objRe.lastIndex);
    if (endIdx === -1) continue;
    objects.push({ objNum, gen, bodyStart: objRe.lastIndex, end: endIdx });
  }

  function resolveIndirectInt(num: number): number | null {
    const re = new RegExp("(^|[^0-9])" + num + "[ \\t]+0[ \\t]+obj\\b");
    const m = re.exec(text);
    if (!m) return null;
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 30);
    const nm = /\s*(\d+)/.exec(after);
    return nm ? parseInt(nm[1], 10) : null;
  }

  const rootMatch = /\/Root\s+(\d+)\s+(\d+)\s+R/.exec(text);
  if (!rootMatch) throw new Error("Could not locate document catalog while protecting PDF.");
  const rootObjNum = parseInt(rootMatch[1], 10);
  const rootGen = parseInt(rootMatch[2], 10);

  const startxrefMatches = [...text.matchAll(/startxref\s+(\d+)/g)];
  const prevXrefOffset = startxrefMatches.length ? startxrefMatches[startxrefMatches.length - 1][1] : "0";

  const idBytes = crypto.getRandomValues(new Uint8Array(16));
  const userPwPadded = padPassword(userPassword || "");
  const ownerPwPadded = padPassword(ownerPassword || userPassword || "");

  let P = 0xfffffffc | 0; // base: all permissions granted, reserved bits 1-2 = 0
  // Clear specific bits the user wants to restrict (bit numbers per PDF spec table).
  if (!permissions.printing) P &= ~(1 << 2); // bit 3
  if (!permissions.modifying) P &= ~(1 << 3); // bit 4
  if (!permissions.copying) P &= ~(1 << 4); // bit 5
  if (!permissions.annotating) P &= ~(1 << 5); // bit 6
  P = P | 0;

  const O = computeOwnerKey(ownerPwPadded, userPwPadded, revision, keyLen);
  const encKey = computeEncryptionKey(userPwPadded, O, P, idBytes, revision, keyLen);

  const out = source.slice();
  for (const obj of objects) {
    const spanText = text.slice(obj.bodyStart, obj.end);
    const streamMatch = /stream\r?\n/.exec(spanText);
    if (!streamMatch) continue;
    const dictText = spanText.slice(0, streamMatch.index);
    let length: number | null = null;
    const lenIndirect = /\/Length\s+(\d+)\s+(\d+)\s+R/.exec(dictText);
    const lenDirect = /\/Length\s+(\d+)(?!\s*\d*\s*R)/.exec(dictText);
    if (lenIndirect) length = resolveIndirectInt(parseInt(lenIndirect[1], 10));
    else if (lenDirect) length = parseInt(lenDirect[1], 10);
    if (length == null || length < 0) continue;
    const dataStart = obj.bodyStart + streamMatch.index + streamMatch[0].length;
    const dataEnd = Math.min(dataStart + length, out.length);
    const raw = out.slice(dataStart, dataEnd);
    const key = perObjectKey(encKey, obj.objNum, obj.gen, keyLen);
    const enc = rc4(key, raw);
    out.set(enc, dataStart);
  }

  const U = computeUserKey(encKey, idBytes, revision);
  const encObjNum = maxObjNum + 1;
  const idHex = toHex(idBytes);

  const appendOffset = out.length;
  const encObjStr = `\n${encObjNum} 0 obj\n<< /Filter /Standard /V 2 /R 3 /Length 128 /O <${toHex(
    O
  )}> /U <${toHex(U)}> /P ${P} >>\nendobj\n`;
  const encObjOffset = appendOffset + 1; // account for leading newline
  const xrefStart = appendOffset + new TextEncoder().encode(encObjStr).length;
  const xrefSection = `xref\n${encObjNum} 1\n${String(encObjOffset).padStart(10, "0")} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${
    encObjNum + 1
  } /Root ${rootObjNum} ${rootGen} R /Encrypt ${encObjNum} 0 R /ID [<${idHex}><${idHex}>] /Prev ${prevXrefOffset} >>\nstartxref\n${xrefStart}\n%%EOF`;

  const appendix = new TextEncoder().encode(encObjStr + xrefSection + trailer);
  return concatUint8Arrays(out, appendix);
}

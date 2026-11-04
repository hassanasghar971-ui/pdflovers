// src/lib/engine/stamp-utils.ts
//
// Helpers for drawing text / images / embedded pages onto EXISTING pdf-lib pages.
//
//  * PageFrame maps "visual" coordinates (origin = bottom-left of the page as the user
//    sees it, after /Rotate) to PDF user space, so stamps are upright on rotated pages.
//  * embedTextFont uses Helvetica (WinAnsi only). Text outside WinAnsi needs a Unicode
//    TTF at UNICODE_FONT_URL (not bundled). Without it, those characters become "?"
//    and the result note says so. Scripts the TTF does not cover render as blank boxes.
//  * No RTL shaping or reordering.

import { degrees, rgb, StandardFonts } from 'pdf-lib';
import type { Color, PDFDocument, PDFEmbeddedPage, PDFFont, PDFImage, PDFPage } from 'pdf-lib';
import { clampNum } from './handler-utils';
import { UNICODE_FONT_URL } from './pdf-text';

/* ------------------------------ text encoding ------------------------------ */

const WIN_SPECIALS = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';

/** Maps text onto WinAnsi; unsupported characters become "?" (and are counted). */
export function toWinAnsi(text: string): { text: string; replaced: number } {
  let out = '';
  let replaced = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (ch === '\t' || ch === '\n' || ch === '\r') out += ' ';
    else if ((cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff) || WIN_SPECIALS.includes(ch)) out += ch;
    else if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0) || (cp >= 0x200b && cp <= 0x200f) || cp === 0xfeff) continue;
    else {
      out += '?';
      replaced++;
    }
  }
  return { text: out, replaced };
}

export interface StampFont {
  font: PDFFont;
  unicode: boolean;
  encode(text: string): string;
  /** Sentence for the result note when characters could not be rendered faithfully. */
  warning?: string;
}

const stripControls = (t: string) => t.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, ' ');

async function tryEmbedUnicode(doc: PDFDocument): Promise<PDFFont | null> {
  try {
    const res = await fetch(UNICODE_FONT_URL);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const mod = await import('@pdf-lib/fontkit');
    const fontkit = (mod as unknown as { default?: unknown }).default ?? mod;
    doc.registerFontkit(fontkit as never);
    return await doc.embedFont(bytes, { subset: true });
  } catch {
    return null;
  }
}

/** Embeds Helvetica, or the Unicode TTF when `sample` needs characters outside WinAnsi. */
export async function embedTextFont(doc: PDFDocument, sample: string, bold = false): Promise<StampFont> {
  const needsUnicode = toWinAnsi(sample).replaced > 0;
  if (needsUnicode) {
    const uni = await tryEmbedUnicode(doc);
    if (uni) {
      return {
        font: uni,
        unicode: true,
        encode: stripControls,
        warning:
          'A Unicode font was used. Characters it does not cover (for example Arabic or CJK with the default Noto Sans) appear as blank boxes, and bold is not available.',
      };
    }
  }
  const font = await doc.embedFont(bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
  return {
    font,
    unicode: false,
    encode: (t) => toWinAnsi(t).text,
    warning: needsUnicode
      ? 'Some characters outside Latin-1 were replaced with "?" because no Unicode font is installed. Add public/fonts/NotoSans-Regular.ttf (or a TTF covering your script) to enable them.'
      : undefined,
  };
}

/* --------------------------------- values ---------------------------------- */

/** Accepts 0–1 or 1–100 and returns an opacity in [min, 1]. */
export function unitOpacity(v: number, min = 0.05): number {
  return clampNum(v > 1 ? v / 100 : v, min, 1);
}

export function parseColor(value: string, fallback: [number, number, number] = [0, 0, 0]): Color {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(value.trim());
  if (!m) return rgb(...fallback);
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return rgb(parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255);
}

/** Replaces {page}, {total} and {date}. */
export function expandTokens(template: string, v: { page: number; total: number; date: string }): string {
  return template
    .replace(/\{page\}/gi, String(v.page))
    .replace(/\{total\}/gi, String(v.total))
    .replace(/\{date\}/gi, v.date);
}

/* ------------------------------- positioning -------------------------------- */

export interface Anchor {
  v: 'top' | 'middle' | 'bottom';
  h: 'left' | 'center' | 'right';
}

/**
 * Keyword-based so it tolerates values like "bottom-right", "top_left", "center".
 * "bottom-center" → bottom/center; "center" alone → middle/center.
 */
export function parseAnchor(value: string, fallback: Anchor): Anchor {
  const s = value.toLowerCase();
  const v: Anchor['v'] = /top|upper|header/.test(s)
    ? 'top'
    : /bottom|lower|footer/.test(s)
      ? 'bottom'
      : /middle|center|centre/.test(s)
        ? 'middle'
        : fallback.v;
  const h: Anchor['h'] = /left/.test(s)
    ? 'left'
    : /right/.test(s)
      ? 'right'
      : /center|centre|middle/.test(s)
        ? 'center'
        : fallback.h;
  return { v, h };
}

export interface PageFrame {
  /** Visual (as displayed) width and height in points. */
  vw: number;
  vh: number;
  rot: 0 | 90 | 180 | 270;
  /** Visual point (origin bottom-left, y up) → PDF user space. */
  toUser(vx: number, vy: number): { x: number; y: number };
}

export function pageFrame(page: PDFPage): PageFrame {
  const { x, y, width: w, height: h } = page.getCropBox();
  const raw = Math.round(page.getRotation().angle / 90) * 90;
  const rot = ((((raw % 360) + 360) % 360) as 0 | 90 | 180 | 270);
  const swap = rot === 90 || rot === 270;
  return {
    vw: swap ? h : w,
    vh: swap ? w : h,
    rot,
    toUser(vx, vy) {
      switch (rot) {
        case 90:
          return { x: x + w - vy, y: y + vx };
        case 180:
          return { x: x + w - vx, y: y + h - vy };
        case 270:
          return { x: x + vy, y: y + h - vx };
        default:
          return { x: x + vx, y: y + vy };
      }
    },
  };
}

/** Lower-left corner of a w×h box placed at `anchor` inside the visual page. */
export function anchorBox(
  frame: PageFrame,
  anchor: Anchor,
  w: number,
  h: number,
  margin: number,
): { x: number; y: number } {
  const x = anchor.h === 'left' ? margin : anchor.h === 'right' ? frame.vw - margin - w : (frame.vw - w) / 2;
  const y = anchor.v === 'bottom' ? margin : anchor.v === 'top' ? frame.vh - margin - h : (frame.vh - h) / 2;
  return { x, y };
}

/* -------------------------------- drawing ---------------------------------- */

export interface TextStyle {
  size: number;
  font: PDFFont;
  color?: Color;
  opacity?: number;
  /** Counter-clockwise visual angle in degrees. */
  angle?: number;
}

/** (x, y) = baseline-left origin in visual coordinates. */
export function drawTextAt(page: PDFPage, frame: PageFrame, text: string, x: number, y: number, s: TextStyle): void {
  const p = frame.toUser(x, y);
  page.drawText(text, {
    x: p.x,
    y: p.y,
    size: s.size,
    font: s.font,
    color: s.color,
    opacity: s.opacity,
    rotate: degrees((s.angle ?? 0) + frame.rot),
  });
}

/** Centres the text's visual middle on (cx, cy), honouring the rotation angle. */
export function drawTextCentered(
  page: PDFPage,
  frame: PageFrame,
  text: string,
  cx: number,
  cy: number,
  s: TextStyle,
): void {
  const theta = ((s.angle ?? 0) * Math.PI) / 180;
  const u0 = s.font.widthOfTextAtSize(text, s.size) / 2;
  const v0 = s.size * 0.35;
  const ox = cx - (u0 * Math.cos(theta) - v0 * Math.sin(theta));
  const oy = cy - (u0 * Math.sin(theta) + v0 * Math.cos(theta));
  drawTextAt(page, frame, text, ox, oy, s);
}

/** (x, y) = lower-left corner in visual coordinates. */
export function drawImageAt(
  page: PDFPage,
  frame: PageFrame,
  image: PDFImage,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity = 1,
): void {
  const p = frame.toUser(x, y);
  page.drawImage(image, { x: p.x, y: p.y, width: w, height: h, opacity, rotate: degrees(frame.rot) });
}

/**
 * Draws an embedded page. `opacity` is passed through an untyped options object:
 * if the installed pdf-lib version does not support it on drawPage, it is ignored.
 */
export function drawEmbeddedAt(
  page: PDFPage,
  frame: PageFrame,
  embedded: PDFEmbeddedPage,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity = 1,
): void {
  const p = frame.toUser(x, y);
  const opts = { x: p.x, y: p.y, width: w, height: h, rotate: degrees(frame.rot), opacity };
  page.drawPage(embedded, opts as unknown as Parameters<PDFPage['drawPage']>[1]);
}

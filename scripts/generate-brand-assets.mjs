// Run: npm i --no-save sharp && node scripts/generate-brand-assets.mjs
// Renders every icon and social image from one SVG design. Commit the outputs.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const RED_TOP = '#f0504b';
const RED_BOTTOM = '#c71f1b';

/** The artwork: a document with a folded corner, text lines and a heart. Design box: 512 x 512. */
function artwork() {
  return `
    <path d="M160 92h150l62 62v266a24 24 0 0 1-24 24H160a24 24 0 0 1-24-24V116a24 24 0 0 1 24-24z" fill="#ffffff"/>
    <path d="M310 92v62h62z" fill="#f9c9c7"/>
    <rect x="176" y="186" width="120" height="16" rx="8" fill="#f3d0ce"/>
    <rect x="176" y="218" width="84" height="16" rx="8" fill="#f3d0ce"/>
    <path transform="translate(188 233) scale(5.5)" fill="${RED_BOTTOM}"
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>`;
}

const gradient = `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${RED_TOP}"/><stop offset="1" stop-color="${RED_BOTTOM}"/>
</linearGradient>`;

/** Tile + artwork. `scale` shrinks the artwork about its centre (used for safe zones). */
function tile({ rounded, scale }) {
  return `
    <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="url(#g)"/>
    <g transform="translate(256 256) scale(${scale}) translate(-254 -268)">${artwork()}</g>`;
}

function markSvg(opts) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>${gradient}</defs>${tile(opts)}
</svg>`;
}

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>${gradient}
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff7f6"/><stop offset="1" stop-color="#fde4e2"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(90 136) scale(0.7)">${tile({ rounded: true, scale: 1 })}</g>
  <g font-family="Arial, Helvetica, sans-serif">
    <text x="520" y="285" font-size="84" font-weight="700" fill="#111827">PDF Lovers Pro</text>
    <text x="520" y="352" font-size="36" fill="#4b5563">Free PDF tools that run in your browser</text>
    <text x="520" y="404" font-size="36" fill="#4b5563">Your files are not uploaded to our servers</text>
    <text x="520" y="490" font-size="34" font-weight="700" fill="${RED_BOTTOM}">pdflovers.com</text>
  </g>
</svg>`;
}

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** Packs PNG images into a .ico (PNG-compressed entries are valid in all modern browsers). */
function buildIco(images) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, buf }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt16LE(1, o + 4); // colour planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, dir, ...images.map((i) => i.buf)]);
}

const standard = markSvg({ rounded: true, scale: 1 });
const favicon = markSvg({ rounded: true, scale: 1.15 }); // bigger glyph so it reads at 16px
const maskable = markSvg({ rounded: false, scale: 0.72 }); // inside Android's 80% safe zone
const apple = markSvg({ rounded: false, scale: 0.9 }); // iOS rounds the corners itself

await mkdir('public/icons', { recursive: true });
await mkdir('src/app', { recursive: true });

const out = async (path, data) => {
  await writeFile(path, data);
  console.log('wrote', path);
};

await out('public/logo.svg', standard);
await out('src/app/icon.svg', favicon);
await out('src/app/apple-icon.png', await png(apple, 180));
await out('public/icons/icon-192.png', await png(standard, 192));
await out('public/icons/icon-512.png', await png(standard, 512));
await out('public/icons/icon-maskable-512.png', await png(maskable, 512));
await out(
  'src/app/favicon.ico',
  buildIco(await Promise.all([16, 32, 48].map(async (size) => ({ size, buf: await png(favicon, size) })))),
);

const og = await sharp(Buffer.from(ogSvg()), { density: 144 }).resize(1200, 630).png({ compressionLevel: 9 }).toBuffer();
await out('src/app/opengraph-image.png', og);
await out('src/app/twitter-image.png', og);
const alt = 'PDF Lovers Pro: free PDF tools that run in your browser';
await out('src/app/opengraph-image.alt.txt', alt);
await out('src/app/twitter-image.alt.txt', alt);

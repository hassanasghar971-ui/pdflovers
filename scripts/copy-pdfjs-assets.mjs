import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const from = join(root, 'node_modules', 'pdfjs-dist');
const to = join(root, 'public', 'pdfjs');

rmSync(to, { recursive: true, force: true });
let copied = 0;
for (const dir of ['cmaps', 'standard_fonts']) {
  const src = join(from, dir);
  if (!existsSync(src)) {
    console.warn(`[copy-pdfjs-assets] ${src} not found, skipping`);
    continue;
  }
  mkdirSync(to, { recursive: true });
  cpSync(src, join(to, dir), { recursive: true });
  copied++;
}
console.log(`[copy-pdfjs-assets] copied ${copied} of 2 folders to public/pdfjs`);

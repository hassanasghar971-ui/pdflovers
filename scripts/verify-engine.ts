import {
  formatBytes,
  normalizeError,
  parsePageList,
  sniffImageType,
  winAnsiSafe,
} from '../src/lib/engine/shared';

let failed = 0;
let passed = 0;
const check = (label: string, ok: boolean, detail = '') => {
  if (ok) {
    passed++;
  } else {
    failed++;
    console.error(`✗ ${label}${detail ? ` (${detail})` : ''}`);
  }
};
const eq = (label: string, got: unknown, want: unknown) =>
  check(label, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
const expectThrow = (label: string, fn: () => unknown) => {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  check(`${label} should throw`, threw);
};

/* page ranges */
eq('1-3, 5', parsePageList('1-3, 5', 10), [0, 1, 2, 4]);
eq('open end 8-', parsePageList('8-', 10), [7, 8, 9]);
eq('open start -3', parsePageList('-3', 10), [0, 1, 2]);
eq('last', parsePageList('last', 10), [9]);
eq('dedupe keeps typed order', parsePageList('3, 3, 2-4', 6), [2, 1, 3]);
eq('all', parsePageList('all', 4), [0, 1, 2, 3]);
eq('empty means every page', parsePageList('', 3), [0, 1, 2]);
expectThrow('empty with allowEmpty=false', () => parsePageList('', 3, { allowEmpty: false }));
expectThrow('page 0', () => parsePageList('0', 10));
expectThrow('page beyond total', () => parsePageList('11', 10));
expectThrow('backwards range', () => parsePageList('5-2', 10));
expectThrow('garbage', () => parsePageList('abc', 10));

/* image sniffing: these bytes are the real file signatures */
const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50]);
eq('webp', sniffImageType(webp), 'webp');
eq('jpeg', sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0])), 'jpeg');
eq('png', sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'png');
eq('gif', sniffImageType(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0])), 'gif');
eq('bmp', sniffImageType(new Uint8Array([0x42, 0x4d, 0, 0])), 'bmp');
eq('unknown', sniffImageType(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])), 'unknown');

/* text and sizes */
eq('winAnsiSafe keeps WinAnsi, replaces the rest', winAnsiSafe('Hello “x” – ok ا'), 'Hello “x” – ok ?');
eq('formatBytes 0', formatBytes(0), '0 B');
eq('formatBytes 1536', formatBytes(1536), '1.5 KB');
eq('formatBytes 250 MB', formatBytes(250 * 1024 * 1024, 0), '250 MB');

/* error mapping */
eq('password required', normalizeError({ name: 'PasswordException', code: 1 }).code, 'password-required');
eq('wrong password', normalizeError({ name: 'PasswordException', code: 2 }).code, 'wrong-password');
eq('invalid pdf', normalizeError({ name: 'InvalidPDFException', message: 'x' }).code, 'invalid-pdf');
eq('abort', normalizeError({ name: 'AbortError' }).code, 'aborted');
check(
  'stale chunk gives a reload message',
  /reload/i.test(normalizeError(new Error('Loading chunk 123 failed.')).message),
);
check(
  'dynamic import failure gives a reload message',
  /reload/i.test(normalizeError(new TypeError('Failed to fetch dynamically imported module: https://x/y.js')).message),
);

if (failed) {
  console.error(`\n${failed} check(s) failed, ${passed} passed.`);
  process.exit(1);
}
console.log(`All ${passed} engine checks passed.`);

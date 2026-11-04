/* =============================================================================
 * PDF Lovers Pro – Universal Tool Registry
 * https://pdflovers.com
 * Single source of truth for all 42 tools: routing, SEO copy, FAQs, JSON-LD and
 * the option schema that drives the generic workspace UI (no per-tool UI code).
 * ========================================================================== */

/* ----------------------------- Site constants ----------------------------- */

export const SITE = {
  name: 'PDF Lovers Pro',
  url: 'https://pdflovers.com',
  tagline: '42 free PDF tools that run 100% in your browser – private, fast, no upload.',
  description:
    'PDF Lovers Pro offers 42 free online PDF tools – merge, split, compress, convert, edit, sign, OCR and more. Everything runs inside your browser, so your files never leave your device.',
  founder: 'Hassan Asghar',
  founderTitle: 'Lead Architect & Founder',
  email: 'hassanasghar7868686@gmail.com',
  whatsappPrimary: '03451098607',
  whatsappSecondary: '03497726469',
  whatsappPrimaryLink: 'https://wa.me/923451098607',
  whatsappSecondaryLink: 'https://wa.me/923497726469',
  googleVerification: 'pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI',
} as const;

export const LEGAL_PAGES = [
  { slug: 'about-us', title: 'About Us' },
  { slug: 'contact-us', title: 'Contact Us' },
  { slug: 'privacy-policy', title: 'Privacy Policy' },
  { slug: 'terms-and-conditions', title: 'Terms & Conditions' },
  { slug: 'dmca-notice', title: 'DMCA Notice' },
] as const;

/* --------------------------------- Types ---------------------------------- */

export type ToolCategoryId =
  | 'organize'
  | 'optimize'
  | 'to-pdf'
  | 'from-pdf'
  | 'edit'
  | 'security'
  | 'analyze';

export type OutputKind = 'pdf' | 'zip' | 'docx' | 'xlsx' | 'pptx' | 'rtf' | 'txt' | 'report';

export type OptionType =
  | 'text'
  | 'number'
  | 'select'
  | 'range'
  | 'password'
  | 'color'
  | 'checkbox'
  | 'signature';

export type OptionValue = string | number | boolean;

export interface ToolOption {
  key: string;
  label: string;
  type: OptionType;
  default: OptionValue;
  placeholder?: string;
  help?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  choices?: { value: string; label: string }[];
  /** Only render this option when another option has the given value. */
  showWhen?: { key: string; equals: OptionValue };
}

export type FAQ = { q: string; a: string };

interface ToolSeed {
  slug: string;
  name: string;
  category: ToolCategoryId;
  icon: string;
  accept: string[];
  output: OutputKind;
  multiple?: boolean;
  minFiles?: number;
  maxFiles?: number;
  fileLabels?: string[];
  tagline: string;
  intro: string;
  /** lowercase-first phrases (they are capitalised for lists, used inline in prose) */
  benefits: [string, string, string];
  uses: [string, string, string];
  tip: string;
  faqs: [[string, string], [string, string]];
  options?: ToolOption[];
  extraKeywords?: string[];
}

export interface Tool extends Omit<ToolSeed, 'faqs' | 'multiple' | 'minFiles' | 'maxFiles' | 'options'> {
  multiple: boolean;
  minFiles: number;
  maxFiles: number;
  options: ToolOption[];
  url: string;
  path: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h2s: { howTo: string; why: string; faq: string };
  paragraphs: string[];
  steps: string[];
  faqs: FAQ[];
  keywords: string[];
  related: string[];
}

/* ------------------------------- Categories ------------------------------- */

export const CATEGORIES: Record<ToolCategoryId, { label: string; description: string }> = {
  organize: { label: 'Organize PDF', description: 'Merge, split, rotate, crop and rearrange pages.' },
  optimize: { label: 'Optimize & Repair', description: 'Shrink, repair, flatten and clean up documents.' },
  'to-pdf': { label: 'Convert to PDF', description: 'Turn images, Office files and text into PDF.' },
  'from-pdf': { label: 'Convert from PDF', description: 'Export PDFs to images, Office formats and text.' },
  edit: { label: 'Edit & Annotate', description: 'Watermark, number, sign, redact and stamp pages.' },
  security: { label: 'PDF Security', description: 'Protect, unlock and permanently redact content.' },
  analyze: { label: 'Compare & Analyze', description: 'Compare files and extract embedded assets.' },
};

export const CATEGORY_ORDER: ToolCategoryId[] = [
  'organize',
  'optimize',
  'to-pdf',
  'from-pdf',
  'edit',
  'security',
  'analyze',
];

/* --------------------------- Option helper builders ----------------------- */

type Choice = [string, string];

const oSelect = (
  key: string,
  label: string,
  choices: Choice[],
  def: string,
  extra: Partial<ToolOption> = {},
): ToolOption => ({
  key,
  label,
  type: 'select',
  default: def,
  choices: choices.map(([value, l]) => ({ value, label: l })),
  ...extra,
});

const oNumber = (
  key: string,
  label: string,
  def: number,
  min: number,
  max: number,
  step = 1,
  extra: Partial<ToolOption> = {},
): ToolOption => ({ key, label, type: 'number', default: def, min, max, step, ...extra });

const oRange = (
  key: string,
  label: string,
  def: number,
  min: number,
  max: number,
  step: number,
  extra: Partial<ToolOption> = {},
): ToolOption => ({ key, label, type: 'range', default: def, min, max, step, ...extra });

const oText = (
  key: string,
  label: string,
  def = '',
  placeholder?: string,
  extra: Partial<ToolOption> = {},
): ToolOption => ({ key, label, type: 'text', default: def, placeholder, ...extra });

const oPassword = (key: string, label: string, extra: Partial<ToolOption> = {}): ToolOption => ({
  key,
  label,
  type: 'password',
  default: '',
  required: true,
  ...extra,
});

const oColor = (key: string, label: string, def: string): ToolOption => ({
  key,
  label,
  type: 'color',
  default: def,
});

const oCheck = (key: string, label: string, def: boolean, help?: string): ToolOption => ({
  key,
  label,
  type: 'checkbox',
  default: def,
  help,
});

const PAGE_SIZES: Choice[] = [
  ['a4', 'A4'],
  ['letter', 'US Letter'],
  ['legal', 'US Legal'],
  ['a3', 'A3'],
  ['a5', 'A5'],
];

const RENDER_SCALES: Choice[] = [
  ['1', 'Standard (72 DPI)'],
  ['2', 'High (144 DPI)'],
  ['3', 'Print (216 DPI)'],
];

const POSITIONS: Choice[] = [
  ['bottom-center', 'Bottom center'],
  ['bottom-right', 'Bottom right'],
  ['bottom-left', 'Bottom left'],
  ['top-center', 'Top center'],
  ['top-right', 'Top right'],
  ['top-left', 'Top left'],
];

const pagesOpt = (label = 'Pages', required = false): ToolOption =>
  oText('pages', label, '', 'e.g. 1-3, 5, 8-10', {
    required,
    help: required ? 'Use commas and dashes. Example: 1-3, 5, 8-10.' : 'Leave empty to apply to every page.',
  });

const PDF = ['.pdf', 'application/pdf'];

/* ================================ 42 TOOLS ================================= */

const SEEDS: ToolSeed[] = [
  /* 1 */ {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    category: 'organize',
    icon: '🧩',
    accept: PDF,
    output: 'pdf',
    multiple: true,
    minFiles: 2,
    maxFiles: 100,
    tagline: 'Combine multiple PDF files into one organized document in seconds.',
    intro:
      'Merge PDF lets you combine two or more PDF documents into a single, perfectly ordered file in a few seconds. Drag your files into the order you want, remove any you no longer need, and export one clean document that is ready to email, print or archive without any loss of quality.',
    benefits: [
      'drag-and-drop reordering before you merge',
      'support for dozens of files in a single run',
      'lossless page copying that keeps text and links intact',
    ],
    uses: [
      'bundle invoices into one monthly statement',
      'assemble a complete job application pack',
      'join scanned chapters into a single report',
    ],
    tip: 'Add numbers like 01 and 02 to your file names before uploading so they land in the right order automatically.',
    faqs: [
      ['Will merging reduce the quality of my PDFs?', 'No. Pages are copied directly from one document to another, so fonts, images and vector graphics stay exactly as they were.'],
      ['Is there a limit on how many files I can merge?', 'There is no fixed limit. The practical ceiling depends on the memory available in your browser, and most modern devices handle dozens of files comfortably.'],
    ],
  },
  /* 2 */ {
    slug: 'split-pdf',
    name: 'Split PDF',
    category: 'organize',
    icon: '✂️',
    accept: PDF,
    output: 'zip',
    tagline: 'Split a PDF by page ranges, fixed intervals or into single pages.',
    intro:
      'Split PDF separates one large document into smaller files exactly the way you need. Extract custom page ranges, cut the file every few pages, or turn every single page into its own PDF. All the pieces are bundled in a ZIP archive so you can download everything together in one click.',
    benefits: [
      'three split modes: custom ranges, fixed intervals and one page per file',
      'an instant page count before you split',
      'a ZIP download with neatly numbered file names',
    ],
    uses: [
      'send only the relevant chapter to a colleague',
      'separate a scanned batch into individual documents',
      'stay under email attachment size limits',
    ],
    tip: 'Type ranges such as 1-3, 7, 10-12 to create several different parts in one go.',
    faqs: [
      ['Can I split by custom page ranges?', 'Yes. Choose the ranges mode and enter pages like 1-3, 5, 8-10. Each range becomes its own PDF inside the ZIP download.'],
      ['Do I get one file or many files?', 'You receive a ZIP archive containing every part. If you only request a single range, you get just that one PDF.'],
    ],
    options: [
      oSelect('mode', 'Split mode', [['ranges', 'Custom page ranges'], ['every-n', 'Every N pages'], ['each', 'Every page separately']], 'ranges'),
      oText('ranges', 'Page ranges', '', 'e.g. 1-3, 5, 8-10', { required: true, showWhen: { key: 'mode', equals: 'ranges' } }),
      oNumber('n', 'Pages per file', 2, 1, 500, 1, { showWhen: { key: 'mode', equals: 'every-n' } }),
    ],
  },
  /* 3 */ {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    category: 'optimize',
    icon: '🗜️',
    accept: PDF,
    output: 'pdf',
    tagline: 'Reduce PDF file size for email and upload without leaving your browser.',
    intro:
      'Compress PDF shrinks bulky documents so they are easy to email, upload and store. The tool re-encodes heavy page content at a smarter quality level while keeping the layout intact, helping you cut file size dramatically without sending a single byte to an outside server.',
    benefits: [
      'three compression levels from light to maximum',
      'a before-and-after size comparison',
      'local processing so confidential files stay private',
    ],
    uses: [
      'fit a scanned contract under an upload limit',
      'make a portfolio easier to share on messaging apps',
      'free up storage on a phone or laptop',
    ],
    tip: 'Start with Balanced. Only move to Maximum if the file is still too large, because it trades more visual quality for size.',
    faqs: [
      ['How much smaller will my PDF get?', 'It depends on the content. Scanned and photo-heavy files often shrink by more than half, while text-only PDFs are already compact and gain less.'],
      ['Will my text stay selectable after compression?', 'Light mode keeps the document structure, so text stays selectable. Balanced and Maximum may rasterise pages to reach smaller sizes, so choose Light if you need searchable text.'],
    ],
    options: [
      oSelect('level', 'Compression level', [['low', 'Light – best quality'], ['medium', 'Balanced – recommended'], ['high', 'Maximum – smallest size']], 'medium'),
    ],
  },
  /* 4 */ {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    category: 'from-pdf',
    icon: '🖼️',
    accept: PDF,
    output: 'zip',
    tagline: 'Convert every PDF page into a high-quality JPG image.',
    intro:
      'PDF to JPG turns each page of your document into a crisp JPG image you can share, edit or post anywhere. Pick the resolution that suits your purpose, choose all pages or only a few, and download the results as a tidy ZIP archive, all rendered locally in your browser.',
    benefits: [
      'adjustable resolution from screen to print quality',
      'optional page selection so you only convert what you need',
      'a ZIP archive with sequentially named images',
    ],
    uses: [
      'post a single page on social media',
      'drop slides into a presentation or website',
      'create thumbnails and previews of documents',
    ],
    tip: 'Choose High (144 DPI) for most screens and Print (216 DPI) only when you plan to print the images.',
    faqs: [
      ['What resolution should I choose?', 'Standard suits quick previews, High is ideal for screens and sharing, and Print gives the sharpest results at the cost of larger files.'],
      ['Can I convert only some pages?', 'Yes. Enter a page selection such as 1-3, 5 and only those pages are rendered. Leave it empty to convert the whole document.'],
    ],
    options: [
      oSelect('scale', 'Image quality', RENDER_SCALES, '2'),
      oRange('quality', 'JPG compression quality', 0.92, 0.5, 1, 0.01),
      pagesOpt('Pages to convert'),
    ],
  },
  /* 5 */ {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    category: 'to-pdf',
    icon: '📷',
    accept: ['.jpg', '.jpeg', 'image/jpeg'],
    output: 'pdf',
    multiple: true,
    maxFiles: 200,
    tagline: 'Turn one or many JPG photos into a single tidy PDF.',
    intro:
      'JPG to PDF converts your photos and scans into a polished PDF document. Add as many images as you like, arrange them in the right order, and choose page size, orientation and margins. Each picture becomes a page and the final file is built entirely on your device.',
    benefits: [
      'unlimited images combined into one PDF',
      'page size choices including A4, Letter and fit-to-image',
      'automatic or manual page orientation',
    ],
    uses: [
      'turn phone photos of receipts into one expense file',
      'build a document from scanned pages',
      'share a photo album as a single attachment',
    ],
    tip: 'Choose Fit to image if you want zero white borders and the original photo proportions preserved.',
    faqs: [
      ['Will my images lose quality?', 'No. JPG images are embedded directly without re-compression, so they look exactly as they did before conversion.'],
      ['Can I put several photos in one PDF?', 'Yes. Add multiple images, reorder them, and each one becomes its own page in the resulting document.'],
    ],
    options: [
      oSelect('pageSize', 'Page size', [['fit', 'Fit to image'], ...PAGE_SIZES], 'a4'),
      oSelect('orientation', 'Orientation', [['auto', 'Automatic'], ['portrait', 'Portrait'], ['landscape', 'Landscape']], 'auto'),
      oNumber('margin', 'Margin (points)', 0, 0, 100),
    ],
  },
  /* 6 */ {
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'to-pdf',
    icon: '📝',
    accept: ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    output: 'pdf',
    tagline: 'Convert Word DOCX documents to shareable PDF files.',
    intro:
      'Word to PDF converts your DOCX documents into universally readable PDF files. Headings, paragraphs, lists and basic styling are carried over so the result looks professional on every device, and the entire conversion happens privately inside your browser without uploading anything.',
    benefits: [
      'support for modern DOCX files',
      'headings, lists and basic text styling preserved',
      'choice of A4 or US Letter output',
    ],
    uses: [
      'send a CV that cannot be accidentally edited',
      'archive reports in a stable format',
      'share assignments with classmates or teachers',
    ],
    tip: 'For the most faithful result, keep your document simple with standard fonts, headings and lists.',
    faqs: [
      ['Does it support the older .doc format?', 'Modern .docx files are supported. If you have an older .doc file, open it in Word or LibreOffice and save it as .docx first.'],
      ['Will complex layouts look identical?', 'Text-focused documents convert very well. Heavily designed layouts with floating objects or advanced columns may look slightly different from the original.'],
    ],
    options: [oSelect('pageSize', 'Page size', [['a4', 'A4'], ['letter', 'US Letter']], 'a4')],
  },
  /* 7 */ {
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'from-pdf',
    icon: '📄',
    accept: PDF,
    output: 'docx',
    tagline: 'Convert PDF to an editable Word DOCX document.',
    intro:
      'PDF to Word extracts the text from your PDF and rebuilds it as an editable DOCX document. Paragraphs and reading order are reconstructed page by page, giving you a solid starting point for edits in Microsoft Word, Google Docs or LibreOffice, all without uploading your file.',
    benefits: [
      'editable DOCX output that opens in any word processor',
      'page breaks preserved between pages',
      'private browser-based extraction',
    ],
    uses: [
      'update a contract you only have as a PDF',
      'reuse text from a report in a new document',
      'quote passages without retyping them',
    ],
    tip: 'If your PDF is a scan with no selectable text, run it through OCR PDF first and then convert the result.',
    faqs: [
      ['Will the layout match the PDF exactly?', 'Text and reading order are rebuilt as editable paragraphs. Complex layouts with columns, tables or overlapping graphics may need small manual adjustments.'],
      ['Why is my converted file empty?', 'The PDF is probably a scanned image without a text layer. Use the OCR PDF tool first to recognise the text, then convert it to Word.'],
    ],
  },
  /* 8 */ {
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    category: 'organize',
    icon: '🔄',
    accept: PDF,
    output: 'pdf',
    tagline: 'Rotate all or selected PDF pages by 90, 180 or 270 degrees.',
    intro:
      'Rotate PDF fixes sideways or upside-down pages permanently. Turn the whole document or only specific pages by 90, 180 or 270 degrees, then save a new file that opens correctly everywhere. It is perfect for scans that came out the wrong way around.',
    benefits: [
      'rotation of entire documents or selected pages',
      'three angle choices for any orientation problem',
      'a permanent fix that works in every PDF viewer',
    ],
    uses: [
      'repair scanned pages fed into the scanner sideways',
      'correct landscape slides that appear as portrait',
      'prepare documents before printing',
    ],
    tip: 'Enter specific pages like 2, 4-6 to rotate only the pages that are wrong and leave the rest untouched.',
    faqs: [
      ['Is the rotation permanent?', 'Yes. The rotation is written into the new PDF, so every viewer and printer shows the pages the right way up.'],
      ['Can I rotate just one page?', 'Yes. Enter the page number in the pages field and only that page is rotated. Leave the field empty to rotate everything.'],
    ],
    options: [
      oSelect('angle', 'Rotation', [['90', '90° clockwise'], ['180', '180°'], ['270', '90° counter-clockwise']], '90'),
      pagesOpt('Pages to rotate'),
    ],
  },
  /* 9 */ {
    slug: 'protect-pdf',
    name: 'Protect PDF',
    category: 'security',
    icon: '🔒',
    accept: PDF,
    output: 'pdf',
    tagline: 'Encrypt a PDF with a password so only authorised people can open it.',
    intro:
      'Protect PDF locks your document behind a password so only people who know it can open the file. Encryption is applied inside your browser, which means neither your document nor your password is ever transmitted anywhere. It is a simple way to secure sensitive paperwork before sharing.',
    benefits: [
      'password encryption applied locally',
      'a confirmation field to avoid typing mistakes',
      'no upload, so your password never leaves your device',
    ],
    uses: [
      'send salary slips or bank statements securely',
      'protect legal documents shared by email',
      'lock private notes stored in cloud drives',
    ],
    tip: 'Use a long passphrase and share it through a different channel than the file itself, such as a phone call.',
    faqs: [
      ['What happens if I forget the password?', 'There is no recovery option because nothing is stored on any server. Keep your password somewhere safe before you share the file.'],
      ['Is my password sent to a server?', 'No. Encryption happens entirely in your browser and the password is never transmitted or stored.'],
    ],
    options: [
      oPassword('password', 'Password'),
      oPassword('confirm', 'Confirm password'),
    ],
  },
  /* 10 */ {
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'security',
    icon: '🔓',
    accept: PDF,
    output: 'pdf',
    tagline: 'Remove the password from a PDF you own and know the password for.',
    intro:
      'Unlock PDF removes password protection from documents you own or are authorised to open. Enter the current password once and save a clean copy that opens without prompts. Everything runs locally, and the tool cannot be used to guess or break passwords, only to remove a password you already know.',
    benefits: [
      'password removal using the password you provide',
      'a clean unprotected copy for easier sharing',
      'private processing with no upload',
    ],
    uses: [
      'stop typing a password every time you open a file',
      'prepare an archived document for editing',
      'share a file with colleagues who do not need the password',
    ],
    tip: 'Only unlock files you own or have permission to modify. This tool needs the correct password to work.',
    faqs: [
      ['Can this tool crack a forgotten password?', 'No. It only removes protection when you supply the correct password, which keeps it appropriate for legitimate use.'],
      ['Is unlocking a PDF legal?', 'Removing a password from your own document is fine. Only unlock files you own or have explicit permission to change.'],
    ],
    options: [oPassword('password', 'Current password')],
  },
  /* 11 */ {
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    category: 'from-pdf',
    icon: '🎨',
    accept: PDF,
    output: 'zip',
    tagline: 'Convert PDF pages to lossless PNG images with sharp text.',
    intro:
      'PDF to PNG renders each page of your document as a lossless PNG image with crisp text and clean lines. It is ideal for diagrams, screenshots and designs where JPG artefacts would be noticeable. Choose your resolution, select pages if you wish, and download everything as a ZIP.',
    benefits: [
      'lossless PNG output with sharp text',
      'three resolution presets',
      'a ZIP archive with ordered page images',
    ],
    uses: [
      'extract diagrams for slide decks',
      'turn a PDF poster into a web graphic',
      'capture clean page snapshots for documentation',
    ],
    tip: 'PNG files are larger than JPG. Pick Standard or High unless you genuinely need print-level detail.',
    faqs: [
      ['When should I use PNG instead of JPG?', 'Use PNG for text, diagrams and graphics that need crisp edges. JPG is better for photographs where smaller files matter more.'],
      ['Can I choose which pages become images?', 'Yes. Enter pages such as 1-3, 6 and only those are converted. Leave the field empty to export every page.'],
    ],
    options: [oSelect('scale', 'Image quality', RENDER_SCALES, '2'), pagesOpt('Pages to convert')],
  },
  /* 12 */ {
    slug: 'png-to-pdf',
    name: 'PNG to PDF',
    category: 'to-pdf',
    icon: '🖼️',
    accept: ['.png', 'image/png'],
    output: 'pdf',
    multiple: true,
    maxFiles: 200,
    tagline: 'Combine PNG images into a single PDF with transparency handled.',
    intro:
      'PNG to PDF converts screenshots, graphics and designs into a clean PDF document. Add several images, reorder them, and pick the page size and margins that suit your project. Transparent areas are placed on a white page so your graphics look right in every viewer.',
    benefits: [
      'multiple PNG files merged into one document',
      'correct handling of transparent backgrounds',
      'flexible page size and orientation options',
    ],
    uses: [
      'package screenshots into a support document',
      'turn design mockups into a client-ready PDF',
      'archive scanned PNG pages',
    ],
    tip: 'Use the Fit to image page size to keep screenshots at their exact pixel proportions.',
    faqs: [
      ['What happens to transparent PNG backgrounds?', 'Transparent areas appear on a white page background, which keeps the output readable in every PDF viewer.'],
      ['Can I convert many PNGs at once?', 'Yes. Add as many images as you like, reorder them, and each one becomes a page in the final PDF.'],
    ],
    options: [
      oSelect('pageSize', 'Page size', [['fit', 'Fit to image'], ...PAGE_SIZES], 'a4'),
      oSelect('orientation', 'Orientation', [['auto', 'Automatic'], ['portrait', 'Portrait'], ['landscape', 'Landscape']], 'auto'),
      oNumber('margin', 'Margin (points)', 0, 0, 100),
    ],
  },
  /* 13 */ {
    slug: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'to-pdf',
    icon: '📊',
    accept: ['.xlsx', '.xls', '.csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'],
    output: 'pdf',
    tagline: 'Convert Excel and CSV spreadsheets into printable PDF tables.',
    intro:
      'Excel to PDF turns spreadsheets into clean, printable tables. Every worksheet is laid out with readable columns and automatic page breaks, so budgets, schedules and reports are easy to share. XLSX, XLS and CSV files are supported, and the conversion never leaves your browser.',
    benefits: [
      'XLSX, XLS and CSV input',
      'every worksheet included with automatic page breaks',
      'portrait or landscape layout for wide tables',
    ],
    uses: [
      'share a budget with people who do not use Excel',
      'print a clean timetable or roster',
      'archive monthly sales sheets',
    ],
    tip: 'Choose landscape for sheets with many columns so the table does not get squeezed.',
    faqs: [
      ['Are formulas included in the PDF?', 'The PDF shows the calculated values you see in the sheet, not the underlying formulas.'],
      ['Does it convert every worksheet?', 'Yes. Each worksheet is added in order, with its name as a heading, and long tables continue across pages.'],
    ],
    options: [
      oSelect('orientation', 'Orientation', [['landscape', 'Landscape'], ['portrait', 'Portrait']], 'landscape'),
      oSelect('pageSize', 'Page size', [['a4', 'A4'], ['letter', 'US Letter'], ['a3', 'A3']], 'a4'),
    ],
  },
  /* 14 */ {
    slug: 'pdf-to-excel',
    name: 'PDF to Excel',
    category: 'from-pdf',
    icon: '📈',
    accept: PDF,
    output: 'xlsx',
    tagline: 'Extract tables and text from PDF into an editable Excel workbook.',
    intro:
      'PDF to Excel pulls the text from your PDF and arranges it into rows and columns inside an XLSX workbook. Each page becomes its own sheet, with text positions used to detect cells, so you can sort, filter and calculate instead of retyping numbers from statements and reports.',
    benefits: [
      'one worksheet per PDF page',
      'position-based detection of rows and columns',
      'a standard XLSX file for Excel and Google Sheets',
    ],
    uses: [
      'move figures from a bank statement into a spreadsheet',
      'analyse data published only as a PDF table',
      'convert price lists for editing',
    ],
    tip: 'Works best on PDFs with real text. For scans, run OCR PDF first to create a text layer.',
    faqs: [
      ['How accurate is the table detection?', 'Simple, well-aligned tables convert accurately. Complex layouts with merged cells may need light cleanup in Excel afterwards.'],
      ['Can it read scanned PDFs?', 'Scanned pages have no text to extract. Run them through OCR PDF first, then convert the result to Excel.'],
    ],
  },
  /* 15 */ {
    slug: 'ppt-to-pdf',
    name: 'PPT to PDF',
    category: 'to-pdf',
    icon: '📽️',
    accept: ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    output: 'pdf',
    tagline: 'Convert PowerPoint PPTX slides into a shareable PDF handout.',
    intro:
      'PPT to PDF converts your PowerPoint presentation into a lightweight PDF handout. Slide titles and text content are placed on landscape pages in order, which makes the deck easy to distribute, print and read on any device without needing PowerPoint installed.',
    benefits: [
      'PPTX support with slide order preserved',
      'landscape pages sized like presentation slides',
      'text content extracted privately in your browser',
    ],
    uses: [
      'send lecture notes to students',
      'share a pitch outline with investors',
      'print meeting slides as a handout',
    ],
    tip: 'This converter focuses on slide text. Keep key information as text rather than inside images for the best result.',
    faqs: [
      ['Are images and animations included?', 'The converter focuses on slide titles and text. Animations are not supported, and complex graphics may be simplified.'],
      ['Does it support the old .ppt format?', 'Only modern .pptx files are supported. Save older presentations as .pptx in PowerPoint or LibreOffice first.'],
    ],
  },
  /* 16 */ {
    slug: 'pdf-to-ppt',
    name: 'PDF to PPT',
    category: 'from-pdf',
    icon: '🎞️',
    accept: PDF,
    output: 'pptx',
    tagline: 'Turn PDF pages into PowerPoint slides you can present or edit.',
    intro:
      'PDF to PPT converts every page of your PDF into a PowerPoint slide. Each slide contains a high-quality image of the page, so the look is preserved exactly, and you can add notes, reorder slides or present straight away. The PPTX file is created entirely in your browser.',
    benefits: [
      'one slide per PDF page',
      'visually accurate page images',
      'a PPTX file that opens in PowerPoint, Keynote and Google Slides',
    ],
    uses: [
      'present a PDF report as a slideshow',
      'reuse designed pages inside a deck',
      'add speaker notes to a document',
    ],
    tip: 'Choose High resolution for projectors and large screens, and Standard for smaller files.',
    faqs: [
      ['Is the text editable inside PowerPoint?', 'Slides contain page images for accurate visuals. The text is not individually editable, but you can still add new text boxes and notes on top.'],
      ['Can I choose the image quality?', 'Yes. Pick Standard, High or Print resolution depending on whether you value small files or sharper slides.'],
    ],
    options: [oSelect('scale', 'Slide image quality', RENDER_SCALES, '2')],
  },
  /* 17 */ {
    slug: 'watermark-pdf',
    name: 'Watermark PDF',
    category: 'edit',
    icon: '💧',
    accept: PDF,
    output: 'pdf',
    tagline: 'Stamp custom text watermarks across your PDF pages.',
    intro:
      'Watermark PDF adds a custom text stamp such as CONFIDENTIAL, DRAFT or your company name across every page. Control the colour, size, opacity and angle, and choose between a single centered mark or a repeating tiled pattern. The result is created locally and downloaded instantly.',
    benefits: [
      'full control over text, colour, size, opacity and angle',
      'centered or tiled watermark patterns',
      'an instant result with no upload',
    ],
    uses: [
      'mark a contract as DRAFT during review',
      'brand a proposal with your company name',
      'discourage unauthorised copying of a document',
    ],
    tip: 'Keep opacity between 15% and 30% so the watermark is visible without making the page hard to read.',
    faqs: [
      ['Can I use my own text?', 'Yes. Type any text you like, then adjust the colour, size, opacity and rotation until it looks right.'],
      ['Can a watermark be removed later?', 'Watermarks are drawn onto the page content, so they are not trivially removable, but no watermark is completely tamper-proof.'],
    ],
    options: [
      oText('text', 'Watermark text', 'CONFIDENTIAL', 'Enter watermark text', { required: true }),
      oNumber('fontSize', 'Font size', 60, 12, 200),
      oRange('opacity', 'Opacity', 0.25, 0.05, 1, 0.05),
      oNumber('rotation', 'Rotation (degrees)', 45, -90, 90),
      oColor('color', 'Colour', '#888888'),
      oSelect('layout', 'Layout', [['center', 'Single, centered'], ['tiled', 'Repeating tiles']], 'center'),
    ],
  },
  /* 18 */ {
    slug: 'page-numbers-pdf',
    name: 'Page Numbers',
    category: 'edit',
    icon: '🔢',
    accept: PDF,
    output: 'pdf',
    tagline: 'Add page numbers to a PDF in your preferred position and format.',
    intro:
      'Page Numbers adds clean numbering to every page of your PDF. Choose the position, the format, the starting number and the font size, then save a professional-looking document. It is a quick way to make long reports, manuals and legal files easier to reference and discuss.',
    benefits: [
      'six position choices around the page',
      'formats like 1, Page 1 and 1 of 10',
      'a custom starting number and optional first-page skip',
    ],
    uses: [
      'number a thesis or report before printing',
      'make a merged document easy to reference',
      'prepare legal bundles for court or review',
    ],
    tip: 'Tick Skip first page when your document starts with a cover page that should not be numbered.',
    faqs: [
      ['Can numbering start from a number other than 1?', 'Yes. Set the starting number to any value, which is useful when your PDF is a continuation of another document.'],
      ['Can I skip the cover page?', 'Yes. Enable the skip option and the first page stays clean while numbering continues from the second page.'],
    ],
    options: [
      oSelect('position', 'Position', POSITIONS, 'bottom-center'),
      oSelect('format', 'Format', [['n', '1'], ['page-n', 'Page 1'], ['n-of-total', '1 of 10'], ['page-n-of-total', 'Page 1 of 10']], 'n'),
      oNumber('start', 'Starting number', 1, 0, 100000),
      oNumber('fontSize', 'Font size', 11, 6, 48),
      oCheck('skipFirst', 'Skip first page', false),
    ],
  },
  /* 19 */ {
    slug: 'crop-pdf',
    name: 'Crop PDF',
    category: 'organize',
    icon: '📐',
    accept: PDF,
    output: 'pdf',
    tagline: 'Trim white margins and unwanted edges from PDF pages.',
    intro:
      'Crop PDF trims margins and unwanted edges from your pages. Set how much to remove from the top, right, bottom and left as a percentage, apply it to all pages or a selection, and the visible area shrinks accordingly. It is great for removing scanner borders and wasted white space.',
    benefits: [
      'independent crop control for each side',
      'percentage-based values that suit any page size',
      'apply to every page or only selected pages',
    ],
    uses: [
      'remove black scanner borders',
      'trim excess margins for e-readers',
      'focus a page on a single chart or table',
    ],
    tip: 'Start with small values such as 5% and increase gradually to avoid cutting off real content.',
    faqs: [
      ['Does cropping delete the hidden content?', 'Cropping changes the visible page area. For sensitive information that must be gone for good, use the Redact PDF tool instead.'],
      ['Can I crop only certain pages?', 'Yes. Enter the pages you want to crop, or leave the field empty to apply the same crop to the whole document.'],
    ],
    options: [
      oNumber('top', 'Top (%)', 0, 0, 45, 0.5),
      oNumber('right', 'Right (%)', 0, 0, 45, 0.5),
      oNumber('bottom', 'Bottom (%)', 0, 0, 45, 0.5),
      oNumber('left', 'Left (%)', 0, 0, 45, 0.5),
      pagesOpt('Pages to crop'),
    ],
  },
  /* 20 */ {
    slug: 'extract-pages',
    name: 'Extract Pages',
    category: 'organize',
    icon: '📤',
    accept: PDF,
    output: 'pdf',
    tagline: 'Pull selected pages out of a PDF into a new document.',
    intro:
      'Extract Pages copies only the pages you choose into a brand new PDF, leaving your original untouched. Enter single pages or ranges, and in seconds you have a focused document that contains exactly what you need, ready to send without the rest of the file attached.',
    benefits: [
      'single pages and ranges in one field',
      'your original file stays untouched',
      'pages keep their original quality and order',
    ],
    uses: [
      'send only a signed page to a client',
      'pull a chapter out of a long manual',
      'create a short summary from a large report',
    ],
    tip: 'Pages are extracted in the order you type them, so 5, 1-2 produces page 5 first and then pages 1 and 2.',
    faqs: [
      ['Does extracting change my original PDF?', 'No. Your original file is never modified. A new PDF containing only the selected pages is created for you to download.'],
      ['What is the difference between Extract and Split?', 'Extract builds one document from the pages you choose, while Split cuts a document into several separate files.'],
    ],
    options: [pagesOpt('Pages to extract', true)],
  },
  /* 21 */ {
    slug: 'delete-pages',
    name: 'Delete Pages',
    category: 'organize',
    icon: '🗑️',
    accept: PDF,
    output: 'pdf',
    tagline: 'Remove unwanted pages from a PDF and keep the rest.',
    intro:
      'Delete Pages removes the pages you do not need and keeps everything else in the original order. Type the page numbers or ranges to remove, and download a cleaner, lighter document. It is a fast way to drop blank pages, ads or outdated sections from any PDF.',
    benefits: [
      'remove single pages or entire ranges',
      'the remaining pages keep their order and quality',
      'smaller files after unneeded pages are gone',
    ],
    uses: [
      'drop blank pages created by a scanner',
      'remove a confidential appendix before sharing',
      'cut outdated sections from a handbook',
    ],
    tip: 'Preview the page count first, because you cannot remove every page, at least one must remain.',
    faqs: [
      ['Can I undo a deletion?', 'Your original file is never changed. If you delete the wrong pages, just reload the original and try again.'],
      ['Can I delete a range of pages?', 'Yes. Enter ranges such as 3-6 along with single pages like 9 and 12 in the same field.'],
    ],
    options: [pagesOpt('Pages to delete', true)],
  },
  /* 22 */ {
    slug: 'sign-pdf',
    name: 'Sign PDF',
    category: 'edit',
    icon: '✍️',
    accept: PDF,
    output: 'pdf',
    tagline: 'Draw or upload your signature and place it on a PDF.',
    intro:
      'Sign PDF lets you draw a signature with your mouse or finger, or upload an image of your handwritten one, and place it on your document. Choose the page, position and size, then download the signed file. Your signature never leaves your device, so it stays private.',
    benefits: [
      'draw with a mouse, trackpad or touch screen',
      'upload a transparent PNG of your signature',
      'control over page, position and size',
    ],
    uses: [
      'sign rental agreements without printing',
      'return signed forms to employers quickly',
      'approve invoices and purchase orders',
    ],
    tip: 'Sign on a plain white background and upload it as a PNG for the cleanest, most professional result.',
    faqs: [
      ['Is this a legally binding digital signature?', 'It places a visual signature image on your document. Legal requirements vary, so check whether your situation needs a certificate-based signature.'],
      ['Is my signature stored anywhere?', 'No. Your signature exists only in your browser memory during the session and is discarded when you finish.'],
    ],
    options: [
      { key: 'signature', label: 'Your signature', type: 'signature', default: '', required: true },
      oSelect('target', 'Sign which page?', [['last', 'Last page'], ['first', 'First page'], ['all', 'Every page'], ['custom', 'Specific page']], 'last'),
      oNumber('customPage', 'Page number', 1, 1, 10000, 1, { showWhen: { key: 'target', equals: 'custom' } }),
      oSelect('position', 'Position', [['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left'], ['bottom-center', 'Bottom center'], ['center', 'Center']], 'bottom-right'),
      oNumber('width', 'Signature width (% of page)', 25, 8, 70),
    ],
  },
  /* 23 */ {
    slug: 'ocr-pdf',
    name: 'OCR PDF',
    category: 'from-pdf',
    icon: '🔍',
    accept: [...PDF, '.png', '.jpg', '.jpeg', 'image/png', 'image/jpeg'],
    output: 'pdf',
    tagline: 'Make scanned PDFs searchable with in-browser OCR.',
    intro:
      'OCR PDF recognises the text inside scanned documents and photos and adds an invisible text layer, so you can search, select and copy words that were previously just pixels. Recognition runs in your browser using WebAssembly, supports several languages including Urdu and Arabic, and never uploads your pages.',
    benefits: [
      'searchable PDF output or plain TXT export',
      'multiple languages including English, Urdu, Arabic and Hindi',
      'on-device recognition for private documents',
    ],
    uses: [
      'search through a scanned book or contract',
      'copy text from a photographed page',
      'prepare scans for conversion to Word or Excel',
    ],
    tip: 'Pick the correct language before you start. It has the biggest impact on recognition accuracy.',
    faqs: [
      ['Why is OCR slower than other tools?', 'Recognising text is computationally heavy and happens on your own device. Large documents take longer, but the privacy benefit is worth the wait.'],
      ['How accurate is the recognition?', 'Clean, high-resolution scans in the right language give excellent results. Blurry, skewed or handwritten pages reduce accuracy.'],
    ],
    options: [
      oSelect('language', 'Document language', [['eng', 'English'], ['urd', 'Urdu'], ['ara', 'Arabic'], ['hin', 'Hindi'], ['fra', 'French'], ['deu', 'German'], ['spa', 'Spanish'], ['ita', 'Italian'], ['por', 'Portuguese'], ['rus', 'Russian'], ['tur', 'Turkish']], 'eng'),
      oSelect('outputMode', 'Output', [['searchable-pdf', 'Searchable PDF'], ['txt', 'Plain text (.txt)']], 'searchable-pdf'),
      oSelect('scale', 'Recognition quality', [['2', 'Balanced (144 DPI)'], ['3', 'Best (216 DPI) – slower']], '2'),
    ],
  },
  /* 24 */ {
    slug: 'repair-pdf',
    name: 'Repair PDF',
    category: 'optimize',
    icon: '🛠️',
    accept: PDF,
    output: 'pdf',
    tagline: 'Rebuild corrupted PDFs and recover readable pages.',
    intro:
      'Repair PDF attempts to rescue documents that refuse to open or display errors. The tool tolerates damaged structures, recovers every page it can read and rebuilds a clean, valid file. It is worth trying before you give up on an important document after a failed download or transfer.',
    benefits: [
      'tolerant parsing of damaged file structures',
      'page-by-page recovery with a clean rebuilt file',
      'a recovery summary showing what was saved',
    ],
    uses: [
      'rescue a file from an interrupted download',
      'open a document that shows a damaged-file error',
      'normalise a PDF before further processing',
    ],
    tip: 'Keep a copy of the original. If the damage is severe, recovery may only salvage some of the pages.',
    faqs: [
      ['Can every broken PDF be repaired?', 'No. Minor structural damage is often fixable, but files that are truncated or heavily corrupted may only be partially recoverable.'],
      ['Does repairing change my content?', 'Pages are copied into a fresh document, so visible content stays the same while the internal structure is cleaned up.'],
    ],
  },
  /* 25 */ {
    slug: 'resize-pdf',
    name: 'Resize PDF',
    category: 'organize',
    icon: '📏',
    accept: PDF,
    output: 'pdf',
    tagline: 'Change PDF page size to A4, Letter, A3 and more.',
    intro:
      'Resize PDF converts your pages to a standard paper size such as A4, US Letter, Legal, A3 or A5. Page content can be scaled and centered to fit the new size, which is perfect when a document was created for the wrong paper and needs to print correctly.',
    benefits: [
      'five common paper sizes',
      'content scaled and centered to fit the new page',
      'consistent page sizes across mixed documents',
    ],
    uses: [
      'convert US Letter documents for A4 printers',
      'standardise a merged file with mixed page sizes',
      'shrink poster-sized pages for desktop printing',
    ],
    tip: 'Leave Scale content enabled so your text and images fit inside the new page without being cut off.',
    faqs: [
      ['Will resizing distort my content?', 'No. With scaling enabled, content keeps its proportions and is centered on the new page, adding margins where needed.'],
      ['Can I use custom dimensions?', 'This tool focuses on standard paper sizes, which cover the vast majority of printing and sharing needs.'],
    ],
    options: [
      oSelect('size', 'Target page size', PAGE_SIZES, 'a4'),
      oCheck('scaleContent', 'Scale content to fit', true, 'Keeps proportions and centers the page content.'),
    ],
  },
  /* 26 */ {
    slug: 'pdf-to-rtf',
    name: 'PDF to RTF',
    category: 'from-pdf',
    icon: '📃',
    accept: PDF,
    output: 'rtf',
    tagline: 'Convert PDF text into an RTF file for any word processor.',
    intro:
      'PDF to RTF extracts the readable text from your PDF and saves it as a Rich Text Format file, a universal format opened by WordPad, TextEdit, Word, LibreOffice and many other editors. Page breaks are preserved, and special characters are encoded properly, all without uploading your document.',
    benefits: [
      'a universally supported RTF output',
      'page breaks preserved between pages',
      'proper encoding for accented and special characters',
    ],
    uses: [
      'edit text on a device without Microsoft Word',
      'move content into older software that needs RTF',
      'create a lightweight editable copy of a document',
    ],
    tip: 'Scanned PDFs need OCR first, because RTF conversion relies on selectable text.',
    faqs: [
      ['What is an RTF file?', 'Rich Text Format is a cross-platform document format that keeps basic text structure and opens in almost every word processor.'],
      ['Will images be included?', 'RTF output focuses on text. Images and complex graphics are not carried over in this conversion.'],
    ],
  },
  /* 27 */ {
    slug: 'rtf-to-pdf',
    name: 'RTF to PDF',
    category: 'to-pdf',
    icon: '📑',
    accept: ['.rtf', 'application/rtf', 'text/rtf'],
    output: 'pdf',
    tagline: 'Convert Rich Text Format files into clean, shareable PDFs.',
    intro:
      'RTF to PDF turns Rich Text Format documents into polished PDF files. Paragraphs, line breaks and special characters are interpreted and laid out on neat pages with automatic wrapping, so your text is easy to share and print. The conversion is done locally in your browser.',
    benefits: [
      'RTF control codes interpreted into clean text',
      'automatic line wrapping and pagination',
      'private conversion with no upload',
    ],
    uses: [
      'share an old WordPad document as a PDF',
      'archive legacy text files',
      'prepare simple letters for printing',
    ],
    tip: 'For documents that rely on images or tables, convert from DOCX instead for better fidelity.',
    faqs: [
      ['Does it keep fonts and colours?', 'The converter focuses on the document text and structure. Advanced formatting such as custom fonts and colours is simplified.'],
      ['Can it handle non-English text?', 'Common accented characters are supported. Scripts that need special fonts may display differently.'],
    ],
    options: [oSelect('pageSize', 'Page size', [['a4', 'A4'], ['letter', 'US Letter']], 'a4')],
  },
  /* 28 */ {
    slug: 'pdf-to-txt',
    name: 'PDF to TXT',
    category: 'from-pdf',
    icon: '🔤',
    accept: PDF,
    output: 'txt',
    tagline: 'Extract plain text from any PDF in one click.',
    intro:
      'PDF to TXT pulls every piece of selectable text out of your document and saves it as a plain text file. It is lightweight, searchable and ready for notes, scripts or data pipelines. Page separators keep the original structure clear, and the extraction runs entirely in your browser.',
    benefits: [
      'clean UTF-8 plain text output',
      'page separators that keep structure readable',
      'instant extraction with no upload',
    ],
    uses: [
      'feed document text into other tools',
      'search or analyse large reports quickly',
      'copy quotes without formatting problems',
    ],
    tip: 'If the output is empty, your PDF is probably a scan. Use OCR PDF with the TXT output option instead.',
    faqs: [
      ['Why did I get an empty text file?', 'The PDF likely contains scanned images instead of real text. Use the OCR PDF tool to recognise the text.'],
      ['Is the reading order correct?', 'Text is read in the order it appears on the page. Multi-column layouts can occasionally interleave lines.'],
    ],
  },
  /* 29 */ {
    slug: 'txt-to-pdf',
    name: 'TXT to PDF',
    category: 'to-pdf',
    icon: '📋',
    accept: ['.txt', 'text/plain'],
    output: 'pdf',
    multiple: true,
    maxFiles: 50,
    tagline: 'Convert plain text files into neatly formatted PDF documents.',
    intro:
      'TXT to PDF converts plain text files into tidy, paginated PDF documents. Choose the font, size and paper format, and long lines are wrapped automatically. It is a quick way to turn notes, logs and code listings into something that is easy to print, archive and share.',
    benefits: [
      'a choice of Helvetica, Times or Courier fonts',
      'automatic wrapping and pagination',
      'multiple text files converted in one run',
    ],
    uses: [
      'archive meeting notes in a stable format',
      'print code listings with a monospaced font',
      'share logs with people who prefer PDF',
    ],
    tip: 'Pick Courier when your text contains code or aligned columns so spacing stays consistent.',
    faqs: [
      ['Which text encodings are supported?', 'UTF-8 text is supported. Characters outside the standard font set may be replaced with a placeholder.'],
      ['Can I convert several files at once?', 'Yes. Add multiple TXT files and each one is converted into its own PDF, delivered together as a ZIP.'],
    ],
    options: [
      oSelect('font', 'Font', [['helvetica', 'Helvetica'], ['times', 'Times Roman'], ['courier', 'Courier (monospace)']], 'helvetica'),
      oNumber('fontSize', 'Font size', 12, 6, 36),
      oSelect('pageSize', 'Page size', [['a4', 'A4'], ['letter', 'US Letter']], 'a4'),
    ],
  },
  /* 30 */ {
    slug: 'flatten-pdf',
    name: 'Flatten PDF',
    category: 'optimize',
    icon: '🧱',
    accept: PDF,
    output: 'pdf',
    tagline: 'Flatten forms and annotations into permanent page content.',
    intro:
      'Flatten PDF merges interactive elements such as form fields and annotations into the page itself, so they can no longer be edited. This keeps filled-in forms looking exactly the same on every device and prevents accidental changes before you send the final version to someone.',
    benefits: [
      'form fields converted into fixed page content',
      'an optional full-page flatten for maximum safety',
      'consistent appearance in every viewer',
    ],
    uses: [
      'lock a filled application form before submitting it',
      'stop recipients from altering your answers',
      'fix display problems caused by form fields',
    ],
    tip: 'Choose Forms and annotations first. The full-page option converts pages to images and removes selectable text.',
    faqs: [
      ['What is the difference between the two modes?', 'Forms and annotations mode keeps text selectable while locking fields. Full-page mode converts each page to an image for maximum protection.'],
      ['Can flattened forms be edited again?', 'No. Flattening is permanent, so keep a copy of the editable original if you may need to change answers later.'],
    ],
    options: [
      oSelect('mode', 'Flatten mode', [['forms', 'Forms and annotations (keeps text)'], ['full', 'Full page (rasterise)']], 'forms'),
      oSelect('scale', 'Full-page quality', [['2', 'High (144 DPI)'], ['3', 'Print (216 DPI)']], '2', { showWhen: { key: 'mode', equals: 'full' } }),
    ],
  },
  /* 31 */ {
    slug: 'compare-pdf',
    name: 'Compare PDF',
    category: 'analyze',
    icon: '🆚',
    accept: PDF,
    output: 'report',
    multiple: true,
    minFiles: 2,
    maxFiles: 2,
    fileLabels: ['Original PDF', 'Revised PDF'],
    tagline: 'Compare two PDF files and highlight the differences page by page.',
    intro:
      'Compare PDF checks two documents side by side and shows exactly what changed. Choose a text comparison to list added and removed lines, or a visual comparison that highlights changed pixels on every page. It is ideal for contracts, drafts and design proofs.',
    benefits: [
      'text-based and visual comparison modes',
      'page-by-page results with change highlights',
      'a downloadable comparison report',
    ],
    uses: [
      'spot last-minute edits in a contract',
      'verify that a designer applied your feedback',
      'check two exports of the same report',
    ],
    tip: 'Use Text mode for contracts and reports, and Visual mode for layouts, brochures and designs.',
    faqs: [
      ['Which file should be the original?', 'Choose the older version as the original and the newer one as revised, so additions and removals are labelled correctly.'],
      ['Can it compare scanned PDFs?', 'Visual mode works on any PDF. Text mode needs selectable text, so run scans through OCR first.'],
    ],
    options: [
      oSelect('mode', 'Comparison mode', [['text', 'Text differences'], ['visual', 'Visual (pixel) differences']], 'text'),
      oRange('sensitivity', 'Visual sensitivity', 0.1, 0.01, 0.5, 0.01, { showWhen: { key: 'mode', equals: 'visual' } }),
    ],
  },
  /* 32 */ {
    slug: 'redact-pdf',
    name: 'Redact PDF',
    category: 'security',
    icon: '⬛',
    accept: PDF,
    output: 'pdf',
    tagline: 'Permanently black out sensitive words and numbers in a PDF.',
    intro:
      'Redact PDF permanently hides sensitive information such as names, ID numbers and email addresses. Enter the words or phrases to remove, and every match is covered with a solid box. With true redaction enabled, pages are flattened so the hidden text cannot be recovered by copying.',
    benefits: [
      'search-based redaction for multiple terms at once',
      'true irreversible redaction through page flattening',
      'a customisable box colour',
    ],
    uses: [
      'remove personal data before publishing a document',
      'share legal paperwork with names masked',
      'hide account numbers on statements',
    ],
    tip: 'Keep true redaction switched on. Drawing a box over text without flattening leaves the text behind it recoverable.',
    faqs: [
      ['Is the hidden text really gone?', 'With true redaction enabled, pages are rendered as images with the boxes burned in, so the original text no longer exists in the file.'],
      ['Can I redact several words at once?', 'Yes. Separate multiple terms with commas and every occurrence of each one is covered.'],
    ],
    options: [
      oText('terms', 'Words or phrases to redact', '', 'e.g. John Smith, 4111 1111, secret@mail.com', { required: true, help: 'Separate multiple terms with commas.' }),
      oCheck('caseSensitive', 'Case sensitive', false),
      oCheck('rasterize', 'True redaction (flatten pages)', true, 'Required to make redaction irreversible.'),
      oColor('color', 'Box colour', '#000000'),
    ],
  },
  /* 33 */ {
    slug: 'bates-numbering',
    name: 'Add Bates Numbering',
    category: 'edit',
    icon: '🏷️',
    accept: PDF,
    output: 'pdf',
    multiple: true,
    maxFiles: 50,
    tagline: 'Stamp sequential Bates identifiers on legal and business documents.',
    intro:
      'Add Bates Numbering stamps a unique, sequential identifier on every page, the standard way lawyers and compliance teams reference documents. Set a prefix, suffix, starting number and digit count, and choose where the stamp appears. Numbering can continue across several files in one run.',
    benefits: [
      'custom prefix, suffix, start number and digit padding',
      'continuous numbering across multiple files',
      'six placement options on the page',
    ],
    uses: [
      'prepare discovery documents for legal review',
      'index large evidence bundles',
      'track pages in audit and compliance files',
    ],
    tip: 'Use six digits or more for large productions so the numbers sort correctly everywhere.',
    faqs: [
      ['What does a Bates number look like?', 'A typical stamp is a prefix followed by a padded number, such as ABC000123. You control each part of it.'],
      ['Does numbering continue across files?', 'Yes. When you add several PDFs, numbering continues from where the previous document ended.'],
    ],
    options: [
      oText('prefix', 'Prefix', 'DOC-', 'e.g. ABC-'),
      oText('suffix', 'Suffix', '', 'optional'),
      oNumber('start', 'Starting number', 1, 0, 999999999),
      oNumber('digits', 'Digits', 6, 1, 12),
      oSelect('position', 'Position', POSITIONS, 'bottom-right'),
      oNumber('fontSize', 'Font size', 10, 6, 36),
    ],
  },
  /* 34 */ {
    slug: 'n-up-pdf',
    name: 'N-Up PDF',
    category: 'organize',
    icon: '🔲',
    accept: PDF,
    output: 'pdf',
    tagline: 'Place 2, 4, 6 or 9 PDF pages on a single sheet.',
    intro:
      'N-Up PDF arranges several pages of your document onto one sheet, which is perfect for saving paper and creating handouts. Choose 2, 4, 6 or 9 pages per sheet, set orientation and paper size, and optionally draw thin borders around each page for a clean, professional look.',
    benefits: [
      '2, 4, 6 or 9 pages per sheet',
      'portrait or landscape sheets in common paper sizes',
      'optional borders and adjustable spacing',
    ],
    uses: [
      'print lecture slides as compact handouts',
      'reduce paper use for long documents',
      'review layouts side by side',
    ],
    tip: 'Use 2-up landscape for documents and 6-up landscape for slide handouts with room for notes.',
    faqs: [
      ['Is the page order preserved?', 'Yes. Pages are placed left to right and top to bottom in their original order on every sheet.'],
      ['Will small text still be readable?', 'Readability depends on the original size. 2-up and 4-up stay legible, while 9-up is best for slides and previews.'],
    ],
    options: [
      oSelect('perSheet', 'Pages per sheet', [['2', '2'], ['4', '4'], ['6', '6'], ['9', '9']], '4'),
      oSelect('orientation', 'Sheet orientation', [['landscape', 'Landscape'], ['portrait', 'Portrait']], 'landscape'),
      oSelect('pageSize', 'Sheet size', [['a4', 'A4'], ['letter', 'US Letter'], ['a3', 'A3']], 'a4'),
      oNumber('gap', 'Spacing (points)', 8, 0, 60),
      oCheck('border', 'Draw borders', true),
    ],
  },
  /* 35 */ {
    slug: 'overlay-pdf',
    name: 'PDF Overlay',
    category: 'edit',
    icon: '🗂️',
    accept: PDF,
    output: 'pdf',
    multiple: true,
    minFiles: 2,
    maxFiles: 2,
    fileLabels: ['Base PDF', 'Overlay PDF'],
    tagline: 'Place one PDF on top of or behind another, such as letterheads.',
    intro:
      'PDF Overlay lays one PDF over another so you can add letterheads, stamps and backgrounds in one pass. Pick a base document and an overlay, decide whether the overlay sits on top or behind, and set its opacity. Use a single overlay page on all pages, or match page by page.',
    benefits: [
      'foreground and background overlay modes',
      'adjustable overlay opacity',
      'single-page repeat or page-by-page matching',
    ],
    uses: [
      'apply a company letterhead to plain documents',
      'add a background template to generated reports',
      'stamp an approval mark on every page',
    ],
    tip: 'Use Background mode for letterheads so your original text stays on top and fully readable.',
    faqs: [
      ['Which file is the base?', 'The first file is the base document. The second is the overlay that is placed on top of it or behind it.'],
      ['What if the overlay has fewer pages?', 'In match mode the last overlay page repeats. In repeat mode the first overlay page is used for every base page.'],
    ],
    options: [
      oSelect('placement', 'Overlay placement', [['foreground', 'On top of the base'], ['background', 'Behind the base']], 'foreground'),
      oSelect('pageMode', 'Page mapping', [['first', 'Repeat first overlay page'], ['match', 'Match page by page']], 'first'),
      oRange('opacity', 'Overlay opacity', 1, 0.1, 1, 0.05),
    ],
  },
  /* 36 */ {
    slug: 'extract-images-pdf',
    name: 'Extract Images from PDF',
    category: 'analyze',
    icon: '🖼️',
    accept: PDF,
    output: 'zip',
    tagline: 'Pull every embedded image out of a PDF into a ZIP archive.',
    intro:
      'Extract Images from PDF finds every picture embedded in your document and saves it as an individual file. Choose PNG or JPG output, ignore tiny decorative graphics with a minimum size filter, and download everything together in a ZIP. It is a fast way to recover photos and artwork.',
    benefits: [
      'every embedded picture saved as its own file',
      'PNG or JPG output formats',
      'a minimum size filter to skip icons and bullets',
    ],
    uses: [
      'recover photos from a brochure or catalogue',
      'reuse artwork from an old report',
      'gather product images from a price list',
    ],
    tip: 'Raise the minimum size filter to skip tiny logos and decorations and keep only meaningful pictures.',
    faqs: [
      ['Will images keep their original quality?', 'Images are exported at their embedded resolution, so you get the same detail that was stored in the PDF.'],
      ['Why did I find no images?', 'The PDF may contain only text or vector graphics, or the pages may be scans where the whole page is one large image.'],
    ],
    options: [
      oSelect('format', 'Image format', [['png', 'PNG (lossless)'], ['jpg', 'JPG (smaller)']], 'png'),
      oNumber('minSize', 'Minimum width/height (px)', 50, 1, 2000),
    ],
  },
  /* 37 */ {
    slug: 'extract-fonts-pdf',
    name: 'Extract Fonts from PDF',
    category: 'analyze',
    icon: '🔠',
    accept: PDF,
    output: 'zip',
    tagline: 'List and extract the embedded fonts used inside a PDF.',
    intro:
      'Extract Fonts from PDF inspects your document and lists every font it uses, including whether each one is embedded. Where font data is stored in the file, it is exported so you can review it. A report summarises names, types and the pages where each font appears.',
    benefits: [
      'a complete list of fonts used in the document',
      'embedded font data exported where available',
      'a readable report with types and page usage',
    ],
    uses: [
      'check fonts before sending a file to print',
      'identify the typeface used in a design',
      'audit documents for missing embedded fonts',
    ],
    tip: 'Fonts in PDFs are usually subsets, so exported files may contain only the characters the document actually uses.',
    faqs: [
      ['Can I install the extracted fonts?', 'Exported fonts are often subsets and may be licensed, so they may not be complete or free to use. Always respect font licences.'],
      ['Why are some fonts not exported?', 'Fonts that are not embedded are referenced by name only, so there is no font data in the PDF to extract.'],
    ],
    options: [oCheck('includeReport', 'Include font report (report.txt)', true)],
  },
  /* 38 */ {
    slug: 'compare-pdf-versions',
    name: 'Compare PDF Versions',
    category: 'analyze',
    icon: '🧾',
    accept: PDF,
    output: 'report',
    multiple: true,
    minFiles: 2,
    maxFiles: 2,
    fileLabels: ['Older version', 'Newer version'],
    tagline: 'Compare the structure and metadata of two PDF versions.',
    intro:
      'Compare PDF Versions goes beyond visible content and compares the structure of two files. It reports differences in page count, page sizes, file size, metadata, embedded fonts and text per page, giving you a clear changelog between an older and a newer revision of the same document.',
    benefits: [
      'metadata, page count and size comparison',
      'font and per-page text change summary',
      'a downloadable text report',
    ],
    uses: [
      'document what changed between two releases',
      'verify exports from different software',
      'audit a document revision history',
    ],
    tip: 'Use this alongside Compare PDF: one reports structural changes and the other highlights visible differences.',
    faqs: [
      ['How is this different from Compare PDF?', 'Compare PDF highlights content differences visually or by text. This tool reports structure: metadata, page sizes, fonts, and page-level changes.'],
      ['Does it show who changed the file?', 'It reports the author, producer and dates stored in metadata, which may reveal the software and times involved.'],
    ],
    options: [oCheck('includeMetadata', 'Include metadata comparison', true)],
  },
  /* 39 */ {
    slug: 'grayscale-pdf',
    name: 'Grayscale PDF',
    category: 'optimize',
    icon: '⚫',
    accept: PDF,
    output: 'pdf',
    tagline: 'Convert a colour PDF to black and white to save ink.',
    intro:
      'Grayscale PDF converts every page of your document to shades of grey, which saves colour ink and often reduces file size. Each page is rendered locally, converted and rebuilt into a new PDF, so the result prints consistently on black-and-white printers and looks professional on screen.',
    benefits: [
      'full conversion to grayscale for every page',
      'adjustable quality for balance of size and sharpness',
      'ink-saving output for black-and-white printing',
    ],
    uses: [
      'print drafts without using colour cartridges',
      'prepare documents for monochrome publishing',
      'shrink scanned colour documents',
    ],
    tip: 'Pick High quality for documents with small text and Standard when you only need an efficient draft.',
    faqs: [
      ['Will text still be selectable?', 'Pages are rendered as images during conversion, so the output is a visual copy. Run OCR PDF afterwards if you need searchable text.'],
      ['Does grayscale reduce file size?', 'Often yes, especially for colour scans, though results vary depending on the original content.']
    ],
    options: [
      oSelect('scale', 'Quality', RENDER_SCALES, '2'),
      oRange('quality', 'JPEG quality', 0.85, 0.4, 1, 0.01),
    ],
  },
  /* 40 */ {
    slug: 'invert-pdf-colors',
    name: 'Invert PDF Colors',
    category: 'optimize',
    icon: '🌓',
    accept: PDF,
    output: 'pdf',
    tagline: 'Invert PDF colours for dark-mode reading and ink-saving prints.',
    intro:
      'Invert PDF Colors flips the colours of every page, turning white backgrounds dark and dark text light. It is perfect for reading at night, reducing eye strain and saving ink on documents with heavy backgrounds. Pages are processed locally and rebuilt into a brand new PDF.',
    benefits: [
      'dark-mode style reading for any PDF',
      'adjustable output quality',
      'useful for ink saving on dark-background pages',
    ],
    uses: [
      'read long documents comfortably at night',
      'convert dark slides into print-friendly pages',
      'create a high-contrast version for accessibility',
    ],
    tip: 'Photos will also be inverted, so this works best for text-heavy documents and slides.',
    faqs: [
      ['Will images be inverted too?', 'Yes. The whole page is inverted, including photos, so it suits text documents better than image-heavy ones.'],
      ['Is the text still searchable?', 'Pages are converted to images, so text becomes non-searchable. Use OCR PDF afterwards if you need searchable text.'],
    ],
    options: [
      oSelect('scale', 'Quality', RENDER_SCALES, '2'),
      oRange('quality', 'JPEG quality', 0.9, 0.4, 1, 0.01),
    ],
  },
  /* 41 */ {
    slug: 'remove-annotations',
    name: 'Remove Annotations',
    category: 'optimize',
    icon: '🧽',
    accept: PDF,
    output: 'pdf',
    tagline: 'Strip comments, highlights, notes and links from a PDF.',
    intro:
      'Remove Annotations cleans comments, highlights, sticky notes, stamps and links out of your PDF in one step. Choose to remove everything, only review markup, or only hyperlinks, and receive a clean copy that is ready to publish or share without leftover feedback or reviewer notes.',
    benefits: [
      'removal of comments, highlights, notes and stamps',
      'separate options for markup-only or links-only cleanup',
      'a clean copy produced without touching your original',
    ],
    uses: [
      'clean a reviewed draft before publishing',
      'remove reviewer comments before sharing externally',
      'strip hyperlinks from a document for print',
    ],
    tip: 'Choose Comments and markup only if you want to keep working hyperlinks in the final document.',
    faqs: [
      ['Does this remove form fields?', 'No. Form fields are separate from annotations. Use Flatten PDF if you want to lock form content into the page.'],
      ['Are my original comments deleted?', 'Your original file is untouched. A new copy without annotations is created for you to download.'],
    ],
    options: [
      oSelect('mode', 'What to remove', [['all', 'All annotations'], ['markup', 'Comments and markup only'], ['links', 'Links only']], 'all'),
    ],
  },
  /* 42 */ {
    slug: 'header-footer-pdf',
    name: 'Add Header & Footer',
    category: 'edit',
    icon: '📎',
    accept: PDF,
    output: 'pdf',
    tagline: 'Add custom headers and footers with page numbers and dates.',
    intro:
      'Add Header & Footer places custom text at the top and bottom of every page. Use handy tokens for the page number, total pages and the current date to create professional running headers, confidentiality notices or document titles that appear consistently throughout your PDF.',
    benefits: [
      'separate header and footer text',
      'tokens for page number, total pages and date',
      'alignment, size and margin controls',
    ],
    uses: [
      'add a confidentiality notice to every page',
      'show a document title and version in the header',
      'print page x of y in the footer',
    ],
    tip: 'Type {page} and {total} in the footer to produce text such as Page 3 of 12 automatically.',
    faqs: [
      ['Which tokens can I use?', 'Use {page} for the current page number, {total} for the total page count and {date} for today’s date.'],
      ['Can I skip the first page?', 'Yes. Enable the skip option and the cover page stays clean while the rest of the document receives the header and footer.'],
    ],
    options: [
      oText('header', 'Header text', '', 'e.g. Company Confidential'),
      oText('footer', 'Footer text', 'Page {page} of {total}', 'e.g. Page {page} of {total}'),
      oSelect('align', 'Alignment', [['center', 'Center'], ['left', 'Left'], ['right', 'Right']], 'center'),
      oNumber('fontSize', 'Font size', 10, 6, 36),
      oNumber('margin', 'Margin from edge (points)', 28, 8, 120),
      oCheck('skipFirst', 'Skip first page', false),
    ],
  },
];

/* ============================ Content composition ========================== */

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function buildParagraphs(s: ToolSeed): string[] {
  const n = s.name;
  const fileWord = s.multiple ? 'files' : 'file';
  return [
    s.intro,
    `${n} on ${SITE.name} runs entirely inside your web browser. Your documents are never uploaded to a server, so contracts, invoices, IDs and other private files stay on your own device from the moment you select them until you save the result. There is nothing to install, no account to create, no watermark on your output and no daily limit.`,
    `Here is what you get with this tool: ${s.benefits[0]}, ${s.benefits[1]}, and ${s.benefits[2]}.`,
    `Using it takes only a moment. Add your ${fileWord} using the upload area or drag them in, adjust the available settings if you need to, press the ${n} button and download the finished file. Every step happens instantly on your device, and the temporary memory used is released automatically once you are done.`,
    `People commonly rely on ${n.toLowerCase()} to ${s.uses[0]}, ${s.uses[1]}, or ${s.uses[2]}.`,
    `Because the engine is built on WebAssembly and modern browser APIs, it works smoothly in current versions of Chrome, Edge, Firefox and Safari on both desktop and mobile. Very large files simply take a little longer, since your own device does the heavy lifting.`,
    `Pro tip: ${s.tip}`,
    `Try ${n} now and experience fast, private and completely free document tools from ${SITE.name}.`,
  ];
}

function buildSteps(s: ToolSeed): string[] {
  const many = s.multiple ? 'files' : 'file';
  const minNote = s.minFiles && s.minFiles > 1 ? ` (${s.minFiles}${s.maxFiles === s.minFiles ? '' : '+'} required)` : '';
  return [
    `Upload your ${many}${minNote} by clicking the upload area or dragging it in.`,
    s.options && s.options.length > 0
      ? 'Adjust the settings that appear below your file to match what you need.'
      : 'Review your file details. No extra settings are needed for this tool.',
    `Press the ${s.name} button and wait a moment while your device processes the file.`,
    'Download the finished result. Temporary memory is cleared automatically afterwards.',
  ];
}

const genericFaqs = (name: string): FAQ[] => [
  {
    q: `Is ${name} really free?`,
    a: `Yes. ${name} is completely free with no account, no watermark and no daily limits. The site is supported by unobtrusive advertising.`,
  },
  {
    q: `Are my files uploaded to a server when I use ${name}?`,
    a: 'No. All processing happens locally in your browser using WebAssembly. Your files never leave your device and nothing is stored on our servers.',
  },
  {
    q: `Does ${name} work on phones and tablets?`,
    a: 'Yes. It works in modern mobile browsers. Very large files may be slower on older phones because your own device performs the processing.',
  },
];

function finalize(seed: ToolSeed): Tool {
  const { faqs, options, multiple, minFiles, maxFiles, ...rest } = seed;
  const path = `/tools/${seed.slug}`;
  const lowerName = seed.name.toLowerCase();
  const related = SEEDS.filter((o) => o.category === seed.category && o.slug !== seed.slug)
    .map((o) => o.slug)
    .slice(0, 4);
  if (related.length < 4) {
    for (const o of SEEDS) {
      if (related.length >= 4) break;
      if (o.slug !== seed.slug && !related.includes(o.slug)) related.push(o.slug);
    }
  }
  return {
    ...rest,
    multiple: multiple ?? false,
    minFiles: minFiles ?? 1,
    maxFiles: maxFiles ?? 1,
    options: options ?? [],
    url: `${SITE.url}${path}`,
    path,
    metaTitle: `${seed.name} Online Free – No Upload`,
    metaDescription: `${seed.tagline} Free, private ${lowerName} that runs in your browser – no upload, no signup.`,
    h1: `${seed.name} Online – Free & Private`,
    h2s: {
      howTo: `How to use ${seed.name}`,
      why: `Why choose ${SITE.name} for ${lowerName}?`,
      faq: `${seed.name} – Frequently Asked Questions`,
    },
    paragraphs: buildParagraphs(seed),
    steps: buildSteps(seed),
    faqs: [...faqs.map(([q, a]) => ({ q, a })), ...genericFaqs(seed.name)],
    keywords: [
      lowerName,
      `${lowerName} online`,
      `free ${lowerName}`,
      `${lowerName} no upload`,
      `${lowerName} without signup`,
      'private pdf tools',
      ...(seed.extraKeywords ?? []),
    ],
    related,
  };
}

/* ============================== Public exports ============================= */

export const TOOLS: Tool[] = SEEDS.map(finalize);

export const TOOL_COUNT = 42;

export const TOOLS_BY_SLUG: Record<string, Tool> = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export const POPULAR_SLUGS = [
  'merge-pdf',
  'split-pdf',
  'compress-pdf',
  'pdf-to-jpg',
  'jpg-to-pdf',
  'word-to-pdf',
  'pdf-to-word',
  'rotate-pdf',
];

export const getTool = (slug: string): Tool | undefined => TOOLS_BY_SLUG[slug];
export const getAllSlugs = (): string[] => TOOLS.map((t) => t.slug);
export const getRelatedTools = (tool: Tool): Tool[] =>
  tool.related.map((s) => TOOLS_BY_SLUG[s]).filter((t): t is Tool => Boolean(t));
export const getToolsByCategory = (cat: ToolCategoryId): Tool[] => TOOLS.filter((t) => t.category === cat);
export const getDescriptionText = (tool: Tool): string => tool.paragraphs.join(' ');
export const capitalize = cap;

/* ---------------------------------- JSON-LD ------------------------------- */

/**
 * SoftwareApplication + FAQPage + BreadcrumbList for a tool page.
 * No aggregateRating is emitted on purpose: fabricated ratings violate Google's
 * structured-data policy and can trigger manual actions.
 */
export function buildToolJsonLd(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${tool.url}#software`,
        name: `${tool.name} – ${SITE.name}`,
        url: tool.url,
        description: tool.metaDescription,
        applicationCategory: 'UtilitiesApplication',
        applicationSubCategory: 'PDF Tools',
        operatingSystem: 'Any (Web Browser)',
        browserRequirements: 'Requires JavaScript and WebAssembly support',
        inLanguage: 'en',
        isAccessibleForFree: true,
        featureList: tool.benefits.map(cap),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Person', name: SITE.founder, jobTitle: SITE.founderTitle },
        publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      },
      {
        '@type': 'FAQPage',
        '@id': `${tool.url}#faq`,
        mainEntity: tool.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${tool.url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: CATEGORIES[tool.category].label, item: `${SITE.url}/#${tool.category}` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: tool.url },
        ],
      },
    ],
  };
}

/* ------------------------------ Integrity checks -------------------------- */

(function assertRegistry() {
  if (TOOLS.length !== TOOL_COUNT) {
    throw new Error(`[tools-registry] Expected ${TOOL_COUNT} tools, found ${TOOLS.length}.`);
  }
  const seen = new Set<string>();
  for (const t of TOOLS) {
    if (seen.has(t.slug)) throw new Error(`[tools-registry] Duplicate slug: ${t.slug}`);
    seen.add(t.slug);
    if (t.minFiles > t.maxFiles) throw new Error(`[tools-registry] minFiles > maxFiles for ${t.slug}`);
  }
  if (process.env.NODE_ENV !== 'production') {
    for (const t of TOOLS) {
      const words = countWords(getDescriptionText(t));
      if (words < 300 || words > 350) {
        console.warn(`[tools-registry] ${t.slug}: description is ${words} words (target 300–350). Tune intro/tip text.`);
      }
    }
  }
})();

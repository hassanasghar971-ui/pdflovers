export const TOOL_CATEGORIES = ['Organize', 'Optimize', 'Convert', 'Edit', 'Security', 'Advanced'] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
export type ToolStatus = 'live' | 'soon';

interface OptionBase {
  name: string;
  label: string;
  help?: string;
  defaultValue?: string;
}
export interface TextOption extends OptionBase {
  type: 'text';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}
export interface NumberOption extends OptionBase {
  type: 'number';
  min: number;
  max: number;
  step?: number;
}
export interface SelectOption extends OptionBase {
  type: 'select';
  choices: { value: string; label: string }[];
}
export type ToolOption = TextOption | NumberOption | SelectOption;

export interface ToolItem {
  slug: string;
  title: string;
  category: ToolCategory;
  description: string;
  status: ToolStatus;
  accepts: string[];
  multiple?: boolean;
  minFiles?: number;
  options?: ToolOption[];
  steps?: string[];
  wordCountArticle: string;
}

const PDF = ['.pdf'];
const IMAGES = ['.jpg', '.jpeg', '.png', '.webp'];

const pageSizeOption: SelectOption = {
  type: 'select',
  name: 'pageSize',
  label: 'Page size',
  defaultValue: 'a4',
  choices: [
    { value: 'a4', label: 'A4' },
    { value: 'letter', label: 'US Letter' },
    { value: 'fit', label: 'Same as image' },
  ],
};

const dpiOption: SelectOption = {
  type: 'select',
  name: 'dpi',
  label: 'Image quality',
  defaultValue: '150',
  choices: [
    { value: '96', label: 'Standard (96 DPI, smaller files)' },
    { value: '150', label: 'High (150 DPI)' },
    { value: '300', label: 'Print (300 DPI, large files)' },
  ],
};

export const TOOLS_REGISTRY: ToolItem[] = [
  {
    slug: 'merge-pdf', title: 'Merge PDF', category: 'Organize', status: 'live', accepts: PDF, multiple: true, minFiles: 2,
    description: 'Combine multiple PDF files into a single structured document directly in your browser without file uploads.',
    steps: ['Select two or more PDF files.', 'Order them using arrows.', 'Click Merge PDF and download.'],
    wordCountArticle: 'Merge PDF joins several documents into a single file securely in your browser.',
  },
  {
    slug: 'split-pdf', title: 'Split PDF', category: 'Organize', status: 'live', accepts: PDF,
    description: 'Extract individual pages or custom ranges into separate high-quality PDF files instantly.',
    wordCountArticle: 'Split PDF separates a document into smaller files by page or custom ranges.',
  },
  {
    slug: 'compress-pdf', title: 'Compress PDF', category: 'Optimize', status: 'live', accepts: PDF,
    description: 'Reduce PDF file size with a light optimisation or strong compression.',
    wordCountArticle: 'Compress PDF reduces file size so documents are easier to email and store.',
  },
  {
    slug: 'pdf-to-jpg', title: 'PDF to JPG', category: 'Convert', status: 'live', accepts: PDF, options: [dpiOption],
    description: 'Convert high-resolution PDF pages into vibrant JPG image files.',
    wordCountArticle: 'PDF to JPG renders each page of a PDF as a high-quality JPG image.',
  },
  {
    slug: 'jpg-to-pdf', title: 'JPG to PDF', category: 'Convert', status: 'live', accepts: IMAGES, multiple: true, options: [pageSizeOption],
    description: 'Convert JPG, PNG, and WebP images into clean, formatted PDF documents.',
    wordCountArticle: 'JPG to PDF turns photos and images into a single PDF document.',
  },
  {
    slug: 'rotate-pdf', title: 'Rotate PDF', category: 'Edit', status: 'live', accepts: PDF,
    description: 'Adjust page orientation permanently across single or all pages.',
    wordCountArticle: 'Rotate PDF changes the orientation of pages and saves the changes permanently.',
  },
  {
    slug: 'pdf-to-png', title: 'PDF to PNG', category: 'Convert', status: 'live', accepts: PDF, options: [dpiOption],
    description: 'Convert PDF pages into sharp, lossless PNG images.',
    wordCountArticle: 'PDF to PNG exports each page as a lossless PNG image.',
  },
  {
    slug: 'png-to-pdf', title: 'PNG to PDF', category: 'Convert', status: 'live', accepts: ['.png'], multiple: true, options: [pageSizeOption],
    description: 'Merge PNG images into a clean, multi-page PDF document.',
    wordCountArticle: 'PNG to PDF combines PNG images into a multi-page PDF document.',
  },
  {
    slug: 'watermark-pdf', title: 'Watermark PDF', category: 'Edit', status: 'live', accepts: PDF,
    description: 'Stamp a custom text watermark across all pages of your document.',
    wordCountArticle: 'Watermark PDF stamps text diagonally across every page for security.',
  },
  {
    slug: 'page-numbers-pdf', title: 'Page Numbers', category: 'Edit', status: 'live', accepts: PDF,
    description: 'Add page numbers to the header or footer of every PDF page.',
    wordCountArticle: 'Page Numbers adds a counter to headers or footers automatically.',
  },
  {
    slug: 'crop-pdf', title: 'Crop PDF', category: 'Edit', status: 'live', accepts: PDF,
    description: 'Trim margins and white space from every page.',
    wordCountArticle: 'Crop PDF trims margins and borders visually in your browser.',
  },
  {
    slug: 'extract-pages', title: 'Extract Pages', category: 'Organize', status: 'live', accepts: PDF,
    description: 'Pull out specific pages from long PDF documents into a standalone file.',
    wordCountArticle: 'Extract Pages copies selected pages into a new PDF file.',
  },
  {
    slug: 'delete-pages', title: 'Delete Pages', category: 'Organize', status: 'live', accepts: PDF,
    description: 'Remove blank, duplicate, or unnecessary pages from your PDFs.',
    wordCountArticle: 'Delete Pages removes unwanted pages securely.',
  },
  {
    slug: 'repair-pdf', title: 'Repair PDF', category: 'Advanced', status: 'live', accepts: PDF,
    description: 'Rebuild a damaged PDF and recover readable pages.',
    wordCountArticle: 'Repair PDF rebuilds corrupt file structures locally.',
  },
  {
    slug: 'resize-pdf', title: 'Resize PDF', category: 'Optimize', status: 'live', accepts: PDF,
    description: 'Adjust page dimensions to standard sizes like A4 or Letter.',
    wordCountArticle: 'Resize PDF changes dimensions to standard print sizes.',
  },
  { slug: 'word-to-pdf', title: 'Word to PDF', category: 'Convert', status: 'soon', accepts: ['.doc'], wordCountArticle: 'Coming soon.' },
  { slug: 'pdf-to-word', title: 'PDF to Word', category: 'Convert', status: 'soon', accepts: PDF, wordCountArticle: 'Coming soon.' },
  { slug: 'protect-pdf', title: 'Protect PDF', category: 'Security', status: 'soon', accepts: PDF, wordCountArticle: 'Coming soon.' },
  { slug: 'unlock-pdf', title: 'Unlock PDF', category: 'Security', status: 'soon', accepts: PDF, wordCountArticle: 'Coming soon.' },
  { slug: 'excel-to-pdf', title: 'Excel to PDF', category: 'Convert', status: 'soon', accepts: ['.xls'], wordCountArticle: 'Coming soon.' },
  { slug: 'pdf-to-excel', title: 'PDF to Excel', category: 'Convert', status: 'soon', accepts: PDF, wordCountArticle: 'Coming soon.' },
  { slug: 'ppt-to-pdf', title: 'PPT to PDF', category: 'Convert', status: 'soon', accepts: ['.ppt'], wordCountArticle: 'Coming soon.' },
  { slug: 'pdf-to-ppt', title: 'PDF to PPT', category: 'Convert', status: 'soon', accepts: PDF, wordCountArticle: 'Coming soon.' },
  { slug: 'sign-pdf', title: 'Sign PDF', category: 'Security', status: 'soon', accepts: PDF, wordCountArticle: 'Coming soon.' },
  { slug: 'ocr-pdf', title: 'OCR PDF', category: 'Advanced', status: 'soon', accepts: PDF, wordCountArticle: 'Coming soon.' }
];

export const getToolBySlug = (slug: string): ToolItem | undefined =>
  TOOLS_REGISTRY.find((t) => t.slug === slug);

export const getLiveTools = (): ToolItem[] => TOOLS_REGISTRY.filter((t) => t.status === 'live');

export const getRelatedTools = (tool: ToolItem, limit = 3): ToolItem[] => {
  const others = getLiveTools().filter((t) => t.slug !== tool.slug);
  return [
    ...others.filter((t) => t.category === tool.category),
    ...others.filter((t) => t.category !== tool.category),
  ].slice(0, limit);
};

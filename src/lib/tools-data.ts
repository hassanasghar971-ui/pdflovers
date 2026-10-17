import type { LucideIcon } from "lucide-react";
import {
  Combine, Scissors, RotateCw, Trash2, FileOutput, ListOrdered, Crop, Edit3,
  FileText, FileSpreadsheet, Presentation, Image, FileImage, FileType, Code2, Table,
  FileCode, Images, Lock, Unlock, PenTool, EyeOff, KeyRound, KeySquare,
  Minimize2, Wrench, Gauge, Contrast, Zap, ScanText, GitCompare, FileCheck2,
  Layers, Hash, Droplets, ListTree,
} from "lucide-react";

export type ToolCategory =
  | "Organize & Edit"
  | "Convert from PDF"
  | "Convert to PDF"
  | "Security & Sign"
  | "Optimization & Repair"
  | "Advanced PDF Utilities";

export interface Tool {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  keywords: string[];
}

export const CATEGORIES: ToolCategory[] = [
  "Organize & Edit",
  "Convert from PDF",
  "Convert to PDF",
  "Security & Sign",
  "Optimization & Repair",
  "Advanced PDF Utilities",
];

export const TOOLS: Tool[] = [
  // ───────── Organize & Edit ─────────
  { slug: "merge-pdf", title: "Merge PDF", description: "Combine multiple PDF files into a single document in your chosen order.", category: "Organize & Edit", icon: Combine, keywords: ["merge", "combine", "join", "concat"] },
  { slug: "split-pdf", title: "Split PDF", description: "Separate one PDF into multiple files by page range or page count.", category: "Organize & Edit", icon: Scissors, keywords: ["split", "separate", "divide"] },
  { slug: "rotate-pdf", title: "Rotate PDF", description: "Rotate individual or all pages by 90°, 180°, or 270° permanently.", category: "Organize & Edit", icon: RotateCw, keywords: ["rotate", "turn", "orientation"] },
  { slug: "delete-pages", title: "Delete Pages", description: "Remove unwanted pages from your PDF document instantly.", category: "Organize & Edit", icon: Trash2, keywords: ["delete", "remove pages"] },
  { slug: "extract-pages", title: "Extract Pages", description: "Pull out specific pages from a PDF and save them as a new file.", category: "Organize & Edit", icon: FileOutput, keywords: ["extract", "export pages"] },
  { slug: "organize-pdf", title: "Organize Pages", description: "Drag and drop to reorder, rotate, or delete pages visually.", category: "Organize & Edit", icon: ListOrdered, keywords: ["organize", "reorder", "sort pages"] },
  { slug: "crop-pdf", title: "Crop PDF", description: "Trim margins and whitespace from PDF pages with visual controls.", category: "Organize & Edit", icon: Crop, keywords: ["crop", "trim", "margins"] },
  { slug: "edit-pdf", title: "Edit PDF", description: "Add text, shapes, and annotations directly onto your PDF pages.", category: "Organize & Edit", icon: Edit3, keywords: ["edit", "annotate", "text"] },

  // ───────── Convert from PDF ─────────
  { slug: "pdf-to-word", title: "PDF to Word", description: "Convert PDF documents into fully editable Microsoft Word (.docx) files.", category: "Convert from PDF", icon: FileText, keywords: ["pdf to word", "docx", "doc"] },
  { slug: "pdf-to-excel", title: "PDF to Excel", description: "Extract tables from PDF files into editable Excel (.xlsx) spreadsheets.", category: "Convert from PDF", icon: FileSpreadsheet, keywords: ["pdf to excel", "xlsx", "spreadsheet"] },
  { slug: "pdf-to-powerpoint", title: "PDF to PowerPoint", description: "Transform PDF slides into editable PowerPoint (.pptx) presentations.", category: "Convert from PDF", icon: Presentation, keywords: ["pdf to ppt", "pptx", "slides"] },
  { slug: "pdf-to-jpg", title: "PDF to JPG", description: "Convert each PDF page into a high-resolution JPG image file.", category: "Convert from PDF", icon: Image, keywords: ["pdf to jpg", "image", "photo"] },
  { slug: "pdf-to-png", title: "PDF to PNG", description: "Export PDF pages as transparent, lossless PNG image files.", category: "Convert from PDF", icon: FileImage, keywords: ["pdf to png", "transparent image"] },
  { slug: "pdf-to-text", title: "PDF to Text", description: "Extract raw, plain text content from any PDF document instantly.", category: "Convert from PDF", icon: FileType, keywords: ["pdf to text", "txt", "extract text"] },
  { slug: "pdf-to-html", title: "PDF to HTML", description: "Convert PDF layout and content into clean, structured HTML markup.", category: "Convert from PDF", icon: Code2, keywords: ["pdf to html", "webpage"] },
  { slug: "pdf-to-csv", title: "PDF to CSV", description: "Pull tabular data out of PDFs into a comma-separated CSV file.", category: "Convert from PDF", icon: Table, keywords: ["pdf to csv", "data export"] },

  // ───────── Convert to PDF ─────────
  { slug: "word-to-pdf", title: "Word to PDF", description: "Convert Microsoft Word (.docx) documents into shareable PDF files.", category: "Convert to PDF", icon: FileText, keywords: ["word to pdf", "docx to pdf"] },
  { slug: "excel-to-pdf", title: "Excel to PDF", description: "Turn Excel spreadsheets into print-ready, formatted PDF documents.", category: "Convert to PDF", icon: FileSpreadsheet, keywords: ["excel to pdf", "xlsx to pdf"] },
  { slug: "powerpoint-to-pdf", title: "PowerPoint to PDF", description: "Export PowerPoint presentations as universally viewable PDF files.", category: "Convert to PDF", icon: Presentation, keywords: ["ppt to pdf", "pptx to pdf"] },
  { slug: "jpg-to-pdf", title: "JPG to PDF", description: "Combine one or more JPG images into a single PDF document.", category: "Convert to PDF", icon: Image, keywords: ["jpg to pdf", "image to pdf"] },
  { slug: "png-to-pdf", title: "PNG to PDF", description: "Convert transparent PNG images into a clean PDF file.", category: "Convert to PDF", icon: FileImage, keywords: ["png to pdf"] },
  { slug: "html-to-pdf", title: "HTML to PDF", description: "Render any webpage or HTML snippet into a downloadable PDF.", category: "Convert to PDF", icon: FileCode, keywords: ["html to pdf", "webpage to pdf"] },
  { slug: "text-to-pdf", title: "Text to PDF", description: "Convert plain .txt files into formatted, paginated PDF documents.", category: "Convert to PDF", icon: FileType, keywords: ["text to pdf", "txt to pdf"] },
  { slug: "images-to-pdf", title: "Images to PDF", description: "Batch convert multiple images of mixed formats into one PDF.", category: "Convert to PDF", icon: Images, keywords: ["images to pdf", "photos to pdf", "batch"] },

  // ───────── Security & Sign ─────────
  { slug: "protect-pdf", title: "Protect PDF", description: "Encrypt your PDF with AES-256 and restrict copy, print, or edit permissions.", category: "Security & Sign", icon: Lock, keywords: ["protect", "encrypt", "secure"] },
  { slug: "unlock-pdf", title: "Unlock PDF", description: "Remove a known password or restriction from a protected PDF file.", category: "Security & Sign", icon: Unlock, keywords: ["unlock", "decrypt"] },
  { slug: "sign-pdf", title: "Sign PDF", description: "Draw, type, or upload a signature and place it anywhere on your PDF.", category: "Security & Sign", icon: PenTool, keywords: ["sign", "signature", "esign"] },
  { slug: "redact-pdf", title: "Redact PDF", description: "Permanently black out sensitive text or images before sharing.", category: "Security & Sign", icon: EyeOff, keywords: ["redact", "censor", "blackout"] },
  { slug: "add-password", title: "Add Password", description: "Set a custom open-password to lock access to your PDF document.", category: "Security & Sign", icon: KeyRound, keywords: ["add password", "lock pdf"] },
  { slug: "remove-password", title: "Remove Password", description: "Strip the password requirement from a PDF you own and can access.", category: "Security & Sign", icon: KeySquare, keywords: ["remove password", "decrypt pdf"] },

  // ───────── Optimization & Repair ─────────
  { slug: "compress-pdf", title: "Compress PDF", description: "Shrink PDF file size dramatically while preserving visual quality.", category: "Optimization & Repair", icon: Minimize2, keywords: ["compress", "reduce size", "shrink"] },
  { slug: "repair-pdf", title: "Repair PDF", description: "Fix corrupted, damaged, or unreadable PDF files automatically.", category: "Optimization & Repair", icon: Wrench, keywords: ["repair", "fix", "corrupted"] },
  { slug: "optimize-pdf", title: "Optimize PDF", description: "Clean up fonts, images, and metadata for faster PDF loading.", category: "Optimization & Repair", icon: Gauge, keywords: ["optimize", "performance"] },
  { slug: "grayscale-pdf", title: "Grayscale PDF", description: "Convert colored PDF pages into black-and-white for cheaper printing.", category: "Optimization & Repair", icon: Contrast, keywords: ["grayscale", "black and white"] },
  { slug: "linearize-pdf", title: "Linearize PDF", description: "Optimize PDFs for Fast Web View so pages load progressively online.", category: "Optimization & Repair", icon: Zap, keywords: ["linearize", "fast web view"] },

  // ───────── Advanced PDF Utilities ─────────
  { slug: "ocr-pdf", title: "OCR PDF", description: "Make scanned PDFs searchable and selectable using on-device OCR.", category: "Advanced PDF Utilities", icon: ScanText, keywords: ["ocr", "scanned", "searchable"] },
  { slug: "compare-pdf", title: "Compare PDF", description: "Visually compare two PDF versions and highlight every difference.", category: "Advanced PDF Utilities", icon: GitCompare, keywords: ["compare", "diff", "versions"] },
  { slug: "pdf-to-pdfa", title: "PDF to PDF/A", description: "Convert PDFs into the ISO-standard PDF/A archival format.", category: "Advanced PDF Utilities", icon: FileCheck2, keywords: ["pdf/a", "archive", "iso"] },
  { slug: "flatten-pdf", title: "Flatten PDF", description: "Merge form fields and annotation layers into the static page content.", category: "Advanced PDF Utilities", icon: Layers, keywords: ["flatten", "forms"] },
  { slug: "edit-metadata", title: "Edit Metadata", description: "View and modify PDF title, author, subject, and keyword metadata.", category: "Advanced PDF Utilities", icon: Hash, keywords: ["metadata", "author", "properties"] },
  { slug: "add-watermark", title: "Add Watermark", description: "Stamp a custom text or image watermark across every PDF page.", category: "Advanced PDF Utilities", icon: Droplets, keywords: ["watermark", "stamp", "brand"] },
  { slug: "add-page-numbers", title: "Add Page Numbers", description: "Insert customizable page numbers in any position or format.", category: "Advanced PDF Utilities", icon: ListTree, keywords: ["page numbers", "pagination"] },
];

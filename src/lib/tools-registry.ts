export type ToolCategory =
  | "organize"
  | "convert"
  | "optimize"
  | "security"
  | "edit";

export type ToolAction =
  | "merge"
  | "split"
  | "rotate"
  | "delete-pages"
  | "extract-pages"
  | "compress"
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "watermark"
  | "pdf-to-word"
  | "excel-to-pdf"
  | "ocr-pdf";

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface ToolContent {
  intro: string;
  howItWorksTitle: string;
  steps: string[];
  benefits: ToolBenefit[];
  securityNote: string;
  faqs: ToolFAQ[];
}

export interface Tool {
  slug: string;
  name: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: ToolCategory;
  icon: string;
  action: ToolAction;
  acceptedFileTypes: string[];
  acceptedMimeTypes: string[];
  outputFileType: string;
  multipleFiles: boolean;
  content: ToolContent;
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  organize: "Organize PDF",
  convert: "Convert PDF",
  optimize: "Optimize PDF",
  security: "Security & Privacy",
  edit: "Edit PDF",
};

export const TOOLS: Tool[] = [
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    shortDescription:
      "Combine multiple PDF files into one single document in seconds, in the correct order.",
    metaTitle: "Merge PDF Files Online Free – Combine PDFs Securely",
    metaDescription:
      "Merge multiple PDF files into one document for free. 100% browser-based WebAssembly processing — no uploads, no watermark, no file size limits.",
    keywords: [
      "merge pdf",
      "combine pdf files",
      "join pdf online free",
      "merge pdf without upload",
    ],
    category: "organize",
    icon: "Combine",
    action: "merge",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "PDF",
    multipleFiles: true,
    content: {
      intro:
        "Merging PDF files is one of the most common document tasks for students, professionals, and businesses. Our Merge PDF tool lets you combine two or more PDF documents into a single, clean file while preserving original formatting, fonts, and images — all processed instantly inside your browser using WebAssembly, so no file is ever uploaded to a server.",
      howItWorksTitle: "How to Merge PDF Files Online",
      steps: [
        "Click the upload area or drag and drop your PDF files directly into the tool.",
        "Reorder the files using drag handles until the sequence matches your desired output.",
        "Click the Merge PDF button to combine the documents using the local WebAssembly engine.",
        "Preview the generated file and click Download to save the merged PDF to your device.",
      ],
      benefits: [
        {
          icon: "ShieldCheck",
          title: "100% Private Processing",
          description:
            "Your files are merged directly in your browser's memory using pdf-lib WebAssembly — nothing is ever transmitted to a remote server.",
        },
        {
          icon: "Zap",
          title: "Instant Results",
          description:
            "No queue, no waiting for server uploads. Merging happens locally at native speed, even for large multi-page files.",
        },
        {
          icon: "Infinity",
          title: "No File Limits",
          description:
            "Merge unlimited PDF files of any size since everything runs on your own device's resources.",
        },
      ],
      securityNote:
        "This tool uses client-side WebAssembly (pdf-lib) executed entirely within your browser's sandboxed memory. Files are automatically purged from RAM and object URLs are revoked the moment you download or close the tab, ensuring zero data retention and zero leakage risk.",
      faqs: [
        {
          question: "Is it safe to merge confidential PDF files here?",
          answer:
            "Yes. Because processing happens 100% client-side in your browser, your confidential files never leave your device or touch our servers.",
        },
        {
          question: "Is there a limit on how many PDFs I can merge?",
          answer:
            "No artificial limit is imposed. The only constraint is your device's available RAM, since all processing happens locally.",
        },
        {
          question: "Will merging affect the quality of my PDF?",
          answer:
            "No. The merge operation copies original page objects without re-rendering or compressing content, so quality remains identical to the source files.",
        },
      ],
    },
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    shortDescription:
      "Extract or separate PDF pages into individual files or custom page ranges instantly.",
    metaTitle: "Split PDF Online Free – Separate PDF Pages Instantly",
    metaDescription:
      "Split a PDF file into multiple documents or extract specific page ranges for free. Fast, private, browser-based WebAssembly PDF splitting tool.",
    keywords: [
      "split pdf",
      "separate pdf pages",
      "extract pdf pages online",
      "pdf splitter free",
    ],
    category: "organize",
    icon: "Scissors",
    action: "split",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "ZIP",
    multipleFiles: false,
    content: {
      intro:
        "Splitting a PDF allows you to break a large document into smaller, manageable files or isolate specific sections you need to share. Our Split PDF tool gives you full control: split every page into its own file, or define custom page ranges, all computed locally through our WebAssembly PDF engine for maximum speed and privacy.",
      howItWorksTitle: "How to Split a PDF File",
      steps: [
        "Upload the PDF document you want to split using the file picker or drag-and-drop zone.",
        "Choose between 'Split all pages' or 'Custom ranges' mode.",
        "If using custom ranges, define start and end page numbers for each output file.",
        "Click Split PDF and download the generated ZIP archive containing your separated files.",
      ],
      benefits: [
        {
          icon: "ShieldCheck",
          title: "Local-Only Processing",
          description:
            "Your document is parsed and split entirely in-browser; no third-party server ever receives your data.",
        },
        {
          icon: "ListChecks",
          title: "Flexible Range Control",
          description:
            "Choose exact page ranges or auto-split every single page — the choice is entirely yours.",
        },
        {
          icon: "FileArchive",
          title: "Organized ZIP Output",
          description:
            "All split files are automatically packaged into a single downloadable ZIP archive using JSZip.",
        },
      ],
      securityNote:
        "The splitting engine uses pdf-lib to copy page objects in-memory and JSZip to bundle results without ever writing data to disk or network. All canvas and buffer references are purged immediately after the ZIP is generated.",
      faqs: [
        {
          question: "Can I split just one page out of a large PDF?",
          answer:
            "Yes, simply set the custom range to the exact page number you need, and it will be extracted as a standalone PDF inside the ZIP.",
        },
        {
          question: "Does splitting reduce PDF quality?",
          answer:
            "No. Pages are copied as native PDF objects without rasterization, preserving full original fidelity.",
        },
        {
          question: "What format is the output delivered in?",
          answer:
            "You receive a ZIP file containing each split PDF document, ready to extract and use individually.",
        },
      ],
    },
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    shortDescription:
      "Reduce PDF file size while maintaining visual quality for easier sharing and storage.",
    metaTitle: "Compress PDF Online Free – Reduce PDF File Size Fast",
    metaDescription:
      "Compress large PDF files online for free without losing quality. Browser-based WebAssembly compression with adjustable quality levels.",
    keywords: [
      "compress pdf",
      "reduce pdf size",
      "pdf compressor free online",
      "shrink pdf file size",
    ],
    category: "optimize",
    icon: "Minimize2",
    action: "compress",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "PDF",
    multipleFiles: false,
    content: {
      intro:
        "Large PDF files are difficult to email, upload, or store. Our Compress PDF tool intelligently reduces file size by re-rendering pages at optimized resolution and recompressing embedded imagery, giving you three quality presets to balance size versus clarity — all computed locally on your device with zero data exposure.",
      howItWorksTitle: "How to Compress a PDF File",
      steps: [
        "Upload the PDF file you wish to shrink in size.",
        "Select a compression level: Low, Medium, or High quality retention.",
        "Click Compress PDF to begin local WebAssembly-based rasterization and re-encoding.",
        "Download your newly compressed, smaller PDF file instantly.",
      ],
      benefits: [
        {
          icon: "Gauge",
          title: "Adjustable Compression Levels",
          description:
            "Choose the right balance of quality and file size for your exact use case, from email attachments to archival storage.",
        },
        {
          icon: "ShieldCheck",
          title: "Zero Upload Compression",
          description:
            "Compression happens entirely via canvas rendering and pdf-lib re-embedding inside your browser — no server round-trip required.",
        },
        {
          icon: "Clock",
          title: "Fast Turnaround",
          description:
            "Even multi-page documents compress within seconds thanks to native WebAssembly execution speed.",
        },
      ],
      securityNote:
        "Each page is rendered to an isolated HTMLCanvasElement, re-encoded as optimized JPEG, and immediately purged from memory using purgeCanvas() after embedding, preventing any residual data from lingering in browser RAM.",
      faqs: [
        {
          question: "Will compression make my PDF look blurry?",
          answer:
            "At Medium and High settings, visual quality remains very close to the original. Low setting is optimized for maximum size reduction and is best for text-heavy documents.",
        },
        {
          question: "Can I compress scanned PDF documents?",
          answer:
            "Yes, scanned and image-heavy PDFs typically see the largest size reductions since embedded images are recompressed efficiently.",
        },
        {
          question: "Is there a maximum file size I can compress?",
          answer:
            "There is no hard-coded limit — performance depends only on your device's available memory and processing power.",
        },
      ],
    },
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    shortDescription:
      "Fix sideways or upside-down PDF pages by rotating them 90, 180, or 270 degrees.",
    metaTitle: "Rotate PDF Online Free – Fix Sideways PDF Pages",
    metaDescription:
      "Rotate PDF pages 90, 180, or 270 degrees for free directly in your browser. No upload required, fast WebAssembly-powered PDF rotation.",
    keywords: [
      "rotate pdf",
      "fix sideways pdf",
      "rotate pdf pages online",
      "turn pdf page free",
    ],
    category: "organize",
    icon: "RotateCw",
    action: "rotate",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "PDF",
    multipleFiles: false,
    content: {
      intro:
        "Scanned documents or exported files often end up sideways or upside down. Our Rotate PDF tool instantly corrects page orientation by 90, 180, or 270 degrees, applied to all pages or a custom selection, processed entirely through local WebAssembly rendering with no quality loss.",
      howItWorksTitle: "How to Rotate PDF Pages",
      steps: [
        "Upload the PDF file containing pages that need orientation correction.",
        "Select the rotation angle: 90°, 180°, or 270°.",
        "Optionally select specific pages, or apply rotation to the entire document.",
        "Click Rotate PDF and download your corrected document instantly.",
      ],
      benefits: [
        {
          icon: "RotateCw",
          title: "Precise Angle Control",
          description:
            "Apply exact 90-degree increment rotations to fix any orientation issue with pinpoint accuracy.",
        },
        {
          icon: "ShieldCheck",
          title: "Lossless Transformation",
          description:
            "Rotation only modifies the page's rotation metadata via pdf-lib, keeping the underlying content pixel-perfect.",
        },
        {
          icon: "MousePointerClick",
          title: "Selective Page Rotation",
          description:
            "Rotate only the specific pages that need correction while leaving the rest of the document untouched.",
        },
      ],
      securityNote:
        "Rotation is applied directly to the PDF's internal page dictionary using pdf-lib without rasterizing any content, ensuring both maximum fidelity and that your document remains entirely within your browser's local memory throughout the operation.",
      faqs: [
        {
          question: "Can I rotate only specific pages instead of the whole document?",
          answer:
            "Yes, you can select individual page numbers to rotate while keeping the rest of the document in its original orientation.",
        },
        {
          question: "Does rotating a PDF reduce its quality?",
          answer:
            "No, rotation is a metadata-level transformation and does not re-render or recompress any page content.",
        },
        {
          question: "Can I rotate scanned image-based PDFs?",
          answer:
            "Yes, this tool works with both text-based and scanned image-based PDF files equally well.",
        },
      ],
    },
  },
  {
    slug: "delete-pdf-pages",
    name: "Delete PDF Pages",
    shortDescription:
      "Remove unwanted or blank pages from your PDF document quickly and securely.",
    metaTitle: "Delete PDF Pages Online Free – Remove Pages from PDF",
    metaDescription:
      "Remove unwanted pages from a PDF file for free. Fast, secure, browser-based page deletion with instant WebAssembly processing.",
    keywords: [
      "delete pdf pages",
      "remove pages from pdf",
      "pdf page remover online",
      "delete blank pdf page",
    ],
    category: "edit",
    icon: "Trash2",
    action: "delete-pages",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "PDF",
    multipleFiles: false,
    content: {
      intro:
        "Unwanted blank pages, duplicate scans, or irrelevant sections can clutter an otherwise clean PDF. The Delete PDF Pages tool lets you visually select and permanently remove specific pages from your document, with the entire operation handled locally via WebAssembly for complete privacy.",
      howItWorksTitle: "How to Delete Pages from a PDF",
      steps: [
        "Upload your PDF file to load a live page-by-page thumbnail preview.",
        "Click on each page thumbnail you want to remove to mark it for deletion.",
        "Review your selections in the summary panel before confirming.",
        "Click Delete Pages and download your newly cleaned PDF document.",
      ],
      benefits: [
        {
          icon: "Eye",
          title: "Visual Page Preview",
          description:
            "See exactly what each page looks like before deciding to remove it, thanks to client-side pdfjs-dist rendering.",
        },
        {
          icon: "ShieldCheck",
          title: "Private Editing",
          description:
            "No page content is ever transmitted externally — selection and deletion occur fully inside your browser sandbox.",
        },
        {
          icon: "Undo2",
          title: "Non-Destructive Workflow",
          description:
            "Your original file remains untouched on your device; only the downloaded output reflects your changes.",
        },
      ],
      securityNote:
        "Page thumbnails are rendered using pdfjs-dist into temporary canvas elements that are purged immediately after preview generation, while deletions are performed directly on the in-memory PDFDocument object via pdf-lib.",
      faqs: [
        {
          question: "Can I undo a page deletion after downloading?",
          answer:
            "Since the original file is never modified on your device, you can simply re-upload it and start over if you need to make changes.",
        },
        {
          question: "Is there a limit to how many pages I can delete?",
          answer:
            "No, you may delete any number of pages, including all but one, since a PDF must retain at least a single page.",
        },
        {
          question: "Will deleting pages affect my document's bookmarks?",
          answer:
            "Internal links pointing to removed pages may become inactive; all other bookmarks and navigation remain intact.",
        },
      ],
    },
  },
  {
    slug: "extract-pdf-pages",
    name: "Extract PDF Pages",
    shortDescription:
      "Pull out specific pages from a PDF to create a new, smaller standalone document.",
    metaTitle: "Extract PDF Pages Online Free – Save Specific Pages as New PDF",
    metaDescription:
      "Extract specific pages from a PDF and save them as a new document for free. Private, fast, browser-based WebAssembly extraction tool.",
    keywords: [
      "extract pdf pages",
      "save pdf pages as new file",
      "pdf page extractor online",
      "pull pages from pdf",
    ],
    category: "organize",
    icon: "FileOutput",
    action: "extract-pages",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "PDF",
    multipleFiles: false,
    content: {
      intro:
        "Sometimes you only need a few pages from a larger PDF — a single chapter, a signed page, or a report section. Our Extract PDF Pages tool lets you cherry-pick exactly the pages you need and compile them into a brand-new, compact PDF document, powered entirely by local WebAssembly processing.",
      howItWorksTitle: "How to Extract Pages from a PDF",
      steps: [
        "Upload the source PDF document you want to extract pages from.",
        "Browse the rendered page thumbnails and select the pages you need.",
        "Confirm the page order for your new output document.",
        "Click Extract Pages and download your newly created PDF file.",
      ],
      benefits: [
        {
          icon: "MousePointerClick",
          title: "Visual Page Selection",
          description:
            "Thumbnail previews make it easy to identify and select exactly the content you need to extract.",
        },
        {
          icon: "ShieldCheck",
          title: "Browser-Only Processing",
          description:
            "Extraction logic runs entirely on the client using pdf-lib's copyPages API with zero network transmission.",
        },
        {
          icon: "FileCheck2",
          title: "Preserves Original Fidelity",
          description:
            "Extracted pages retain their original fonts, vector graphics, and image quality without any re-rendering.",
        },
      ],
      securityNote:
        "The extraction process uses pdf-lib's native copyPages function to transplant selected page objects into a fresh PDFDocument instance entirely in browser memory, which is released immediately after your file downloads.",
      faqs: [
        {
          question: "Can I reorder pages while extracting them?",
          answer:
            "Yes, you can select pages in any order and the output document will reflect your chosen sequence.",
        },
        {
          question: "Will extracted pages lose quality?",
          answer:
            "No, pages are copied as native vector PDF objects, preserving complete original quality and formatting.",
        },
        {
          question: "Can I extract pages from a password-protected PDF?",
          answer:
            "If the PDF does not use strong encryption, the tool will attempt to open it; heavily encrypted files may require decryption first.",
        },
      ],
    },
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    shortDescription:
      "Convert each page of your PDF document into high-quality JPG image files.",
    metaTitle: "PDF to JPG Converter Online Free – Convert PDF Pages to Images",
    metaDescription:
      "Convert PDF pages to high-quality JPG images for free, directly in your browser. No uploads, fast WebAssembly rendering, ZIP download.",
    keywords: [
      "pdf to jpg",
      "convert pdf to image",
      "pdf to jpg converter free online",
      "pdf page to picture",
    ],
    category: "convert",
    icon: "ImageDown",
    action: "pdf-to-jpg",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "ZIP",
    multipleFiles: false,
    content: {
      intro:
        "Need to share a PDF page as a picture, embed it in a presentation, or post it on social media? Our PDF to JPG converter renders every page of your document into a crisp, high-resolution JPG image using the pdfjs-dist rendering engine, bundled instantly into a convenient ZIP archive for download.",
      howItWorksTitle: "How to Convert PDF to JPG",
      steps: [
        "Upload the PDF file you want to convert into images.",
        "Choose your preferred rendering resolution (standard or high-definition).",
        "Click Convert to JPG to render each page using the local WebAssembly canvas engine.",
        "Download the ZIP archive containing one JPG file per page.",
      ],
      benefits: [
        {
          icon: "ImageDown",
          title: "High-Resolution Rendering",
          description:
            "Pages are rendered at up to 2x scale for sharp, print-ready image output suitable for any use case.",
        },
        {
          icon: "ShieldCheck",
          title: "No Server Upload",
          description:
            "Conversion happens via pdfjs-dist canvas rendering directly in your browser, keeping your documents fully private.",
        },
        {
          icon: "FileArchive",
          title: "Convenient ZIP Packaging",
          description:
            "All generated images are automatically compressed into a single ZIP file for effortless batch downloading.",
        },
      ],
      securityNote:
        "Each PDF page is rendered onto a temporary HTMLCanvasElement using pdfjs-dist, exported as a JPEG data URL, and then the canvas is explicitly purged via purgeCanvas() to free GPU and RAM resources immediately.",
      faqs: [
        {
          question: "What image resolution do I get?",
          answer:
            "By default, pages render at 2x scale for crisp quality, suitable for both screen viewing and printing.",
        },
        {
          question: "Can I convert a multi-page PDF at once?",
          answer:
            "Yes, every page in your document will be converted and packaged together into a single downloadable ZIP file.",
        },
        {
          question: "Does the converted image include transparency?",
          answer:
            "JPG format does not support transparency; the background will render as solid white matching the original page.",
        },
      ],
    },
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    shortDescription:
      "Convert one or multiple JPG or PNG images into a single organized PDF document.",
    metaTitle: "JPG to PDF Converter Online Free – Convert Images to PDF",
    metaDescription:
      "Convert JPG or PNG images into a PDF document for free. Combine multiple photos into one PDF instantly using secure browser-based processing.",
    keywords: [
      "jpg to pdf",
      "image to pdf converter",
      "convert photos to pdf free",
      "png to pdf online",
    ],
    category: "convert",
    icon: "ImageUp",
    action: "jpg-to-pdf",
    acceptedFileTypes: [".jpg", ".jpeg", ".png"],
    acceptedMimeTypes: ["image/jpeg", "image/png"],
    outputFileType: "PDF",
    multipleFiles: true,
    content: {
      intro:
        "Turn scanned photos, screenshots, or image collections into a single shareable PDF document. Our JPG to PDF converter accepts multiple JPG or PNG files, arranges them in your chosen order, and embeds each one as a full page using pdf-lib — all computed locally without ever uploading your images anywhere.",
      howItWorksTitle: "How to Convert Images to PDF",
      steps: [
        "Upload one or more JPG or PNG image files using the upload zone.",
        "Drag to reorder the images into your desired page sequence.",
        "Click Convert to PDF to embed each image as a dedicated page.",
        "Download your finished, multi-page PDF document instantly.",
      ],
      benefits: [
        {
          icon: "Layers",
          title: "Batch Image Support",
          description:
            "Combine dozens of images into a single organized PDF document in one streamlined operation.",
        },
        {
          icon: "ShieldCheck",
          title: "Private Local Embedding",
          description:
            "Images are embedded directly into the PDF structure using pdf-lib within your browser's own memory space.",
        },
        {
          icon: "LayoutGrid",
          title: "Preserves Aspect Ratio",
          description:
            "Each image is placed onto a page sized to match its native dimensions, avoiding any unwanted stretching or cropping.",
        },
      ],
      securityNote:
        "Image bytes are read via the File API and embedded directly into a pdf-lib PDFDocument object without any intermediate server transmission, ensuring your personal photos remain completely private throughout conversion.",
      faqs: [
        {
          question: "Can I mix JPG and PNG files in the same PDF?",
          answer:
            "Yes, you can combine both JPG and PNG images together in a single output PDF document.",
        },
        {
          question: "Will my images lose quality during conversion?",
          answer:
            "No, images are embedded at their original resolution without any recompression or quality loss.",
        },
        {
          question: "How many images can I combine into one PDF?",
          answer:
            "There is no fixed limit — you may add as many images as your device's available memory can handle.",
        },
      ],
    },
  },
  {
    slug: "watermark-pdf",
    name: "Watermark PDF",
    shortDescription:
      "Add custom text watermarks to every page of your PDF for branding or copyright protection.",
    metaTitle: "Add Watermark to PDF Online Free – Stamp Text on PDF Pages",
    metaDescription:
      "Add a custom text watermark to your PDF for free. Adjustable opacity, size, and rotation — processed securely in your browser.",
    keywords: [
      "watermark pdf",
      "add text to pdf",
      "stamp pdf online free",
      "pdf watermark tool",
    ],
    category: "edit",
    icon: "StampIcon",
    action: "watermark",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "PDF",
    multipleFiles: false,
    content: {
      intro:
        "Protect your intellectual property or brand your documents by stamping a custom watermark across every page of your PDF. Our Watermark PDF tool allows full control over text, opacity, rotation angle, and color, rendering the result instantly using pdf-lib directly within your browser.",
      howItWorksTitle: "How to Add a Watermark to a PDF",
      steps: [
        "Upload the PDF document you want to watermark.",
        "Type your custom watermark text, such as 'Confidential' or your company name.",
        "Adjust opacity, font size, and rotation angle using the live preview controls.",
        "Click Apply Watermark and download your branded PDF document.",
      ],
      benefits: [
        {
          icon: "StampIcon",
          title: "Full Customization",
          description:
            "Control exact text, transparency, size, and rotation to match your brand guidelines or legal requirements.",
        },
        {
          icon: "ShieldCheck",
          title: "Applied Entirely Locally",
          description:
            "Watermark text is drawn directly onto each page using pdf-lib's vector text rendering, with no data leaving your browser.",
        },
        {
          icon: "Layers",
          title: "Consistent Page Coverage",
          description:
            "The watermark is automatically applied uniformly across every page in the document for consistent branding.",
        },
      ],
      securityNote:
        "Watermark text is embedded as a vector drawText() operation via pdf-lib using the StandardFonts.HelveticaBold font, ensuring crisp scalable output that becomes a permanent part of the PDF's content stream.",
      faqs: [
        {
          question: "Can I control how transparent the watermark appears?",
          answer:
            "Yes, you can freely adjust the opacity slider from fully transparent to fully solid to match your preference.",
        },
        {
          question: "Can the watermark be removed later by someone else?",
          answer:
            "Since the watermark becomes part of the permanent page content stream, removing it would require specialized PDF editing tools.",
        },
        {
          question: "Can I apply a diagonal watermark across the page?",
          answer:
            "Yes, the rotation angle control lets you set any angle, including the common 45-degree diagonal watermark style.",
        },
      ],
    },
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    shortDescription:
      "Convert PDF documents into editable Word (.docx) files while preserving readable text content.",
    metaTitle: "PDF to Word Converter Online Free – Convert PDF to DOCX",
    metaDescription:
      "Convert PDF files to editable Word documents for free. Fast, browser-based text extraction and DOCX generation with no uploads required.",
    keywords: [
      "pdf to word",
      "convert pdf to docx",
      "pdf to word converter free online",
      "edit pdf text in word",
    ],
    category: "convert",
    icon: "FileText",
    action: "pdf-to-word",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "DOCX",
    multipleFiles: false,
    content: {
      intro:
        "Turning a static PDF into an editable Word document saves hours of manual retyping. Our PDF to Word converter extracts text content from each page using pdfjs-dist and reconstructs it into a properly formatted .docx file using the docx library, all generated instantly in your browser.",
      howItWorksTitle: "How to Convert PDF to Word",
      steps: [
        "Upload the PDF document containing the text you want to make editable.",
        "Click Convert to Word to begin local text extraction from every page.",
        "Wait for the WebAssembly engine to reconstruct your content into DOCX format.",
        "Download your editable Word document ready for use in Microsoft Word or Google Docs.",
      ],
      benefits: [
        {
          icon: "FileText",
          title: "Editable Output",
          description:
            "Resulting DOCX files can be freely edited, reformatted, and reused in any standard word processor.",
        },
        {
          icon: "ShieldCheck",
          title: "Private Text Extraction",
          description:
            "Text is extracted directly via pdfjs-dist's text layer API within your browser, with nothing ever sent externally.",
        },
        {
          icon: "Clock",
          title: "Fast Conversion",
          description:
            "Even lengthy documents convert within seconds since processing is handled natively on your own device.",
        },
      ],
      securityNote:
        "Text content is extracted using pdfjs-dist's getTextContent() API per page and compiled into Paragraph and TextRun objects using the docx library, with the final file packaged via Packer.toBlob() entirely client-side.",
      faqs: [
        {
          question: "Will the converted Word file keep the exact original layout?",
          answer:
            "Text content is preserved accurately; however, complex layouts, tables, and graphics may require manual formatting adjustments after conversion.",
        },
        {
          question: "Does this work on scanned (image-based) PDFs?",
          answer:
            "For scanned PDFs without a text layer, we recommend first using our OCR PDF tool to extract text before conversion.",
        },
        {
          question: "What Word format is generated?",
          answer:
            "The tool generates a standard .docx file fully compatible with Microsoft Word, Google Docs, and LibreOffice Writer.",
        },
      ],
    },
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    shortDescription:
      "Convert Excel spreadsheets (.xlsx) into clean, printable PDF documents instantly.",
    metaTitle: "Excel to PDF Converter Online Free – Convert XLSX to PDF",
    metaDescription:
      "Convert Excel spreadsheets to PDF for free directly in your browser. Supports multiple sheets, fast WebAssembly-based table rendering.",
    keywords: [
      "excel to pdf",
      "convert xlsx to pdf",
      "spreadsheet to pdf online free",
      "excel pdf converter",
    ],
    category: "convert",
    icon: "Table",
    action: "excel-to-pdf",
    acceptedFileTypes: [".xlsx", ".xls"],
    acceptedMimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ],
    outputFileType: "PDF",
    multipleFiles: false,
    content: {
      intro:
        "Sharing spreadsheets as PDFs ensures consistent formatting across every device and prevents accidental edits. Our Excel to PDF tool parses your .xlsx workbook using the xlsx library and renders each sheet's rows and columns into clean, paginated PDF tables using pdf-lib, fully processed on your own device.",
      howItWorksTitle: "How to Convert Excel to PDF",
      steps: [
        "Upload your Excel spreadsheet file (.xlsx or .xls format).",
        "The tool automatically detects all sheets within your workbook.",
        "Click Convert to PDF to render each sheet's data into formatted PDF pages.",
        "Download your finished, print-ready PDF document.",
      ],
      benefits: [
        {
          icon: "Table",
          title: "Multi-Sheet Support",
          description:
            "Every sheet in your workbook is automatically detected and rendered as its own labeled section in the output PDF.",
        },
        {
          icon: "ShieldCheck",
          title: "Local Data Parsing",
          description:
            "Spreadsheet data is parsed entirely using the xlsx WebAssembly-friendly library without ever leaving your browser.",
        },
        {
          icon: "Printer",
          title: "Print-Ready Formatting",
          description:
            "Output pages are automatically paginated and formatted for clean, consistent printing across any device.",
        },
      ],
      securityNote:
        "Workbook data is parsed in-memory using the xlsx library's array buffer reader, then rendered row-by-row onto PDF pages using pdf-lib's drawText API, ensuring your financial or business data never transits any network.",
      faqs: [
        {
          question: "Will my spreadsheet formulas be converted too?",
          answer:
            "The tool converts the calculated cell values currently displayed in your spreadsheet, not the underlying formulas themselves.",
        },
        {
          question: "Can I convert a workbook with multiple sheets?",
          answer:
            "Yes, every sheet is automatically processed and clearly labeled within the resulting PDF document.",
        },
        {
          question: "Does formatting like colors and fonts carry over?",
          answer:
            "The tool focuses on preserving data accuracy and readable table structure rather than exact cell styling.",
        },
      ],
    },
  },
  {
    slug: "ocr-pdf",
    name: "OCR PDF (Text Recognition)",
    shortDescription:
      "Extract readable text from scanned PDF documents and images using AI-powered OCR.",
    metaTitle: "OCR PDF Online Free – Extract Text from Scanned PDF",
    metaDescription:
      "Extract text from scanned PDF documents for free using AI-powered Tesseract.js OCR, processed securely and privately in your browser.",
    keywords: [
      "ocr pdf",
      "extract text from scanned pdf",
      "pdf text recognition online",
      "image to text pdf free",
    ],
    category: "convert",
    icon: "ScanText",
    action: "ocr-pdf",
    acceptedFileTypes: [".pdf"],
    acceptedMimeTypes: ["application/pdf"],
    outputFileType: "TXT",
    multipleFiles: false,
    content: {
      intro:
        "Scanned documents and image-based PDFs don't contain selectable text — until now. Our OCR PDF tool uses the Tesseract.js WebAssembly-powered optical character recognition engine to analyze each rendered page and extract accurate, readable text, all performed locally without sending your scanned documents to any external server.",
      howItWorksTitle: "How to OCR a Scanned PDF",
      steps: [
        "Upload the scanned PDF document you want to extract text from.",
        "Select the recognition language that matches your document's content.",
        "Click Start OCR to begin local Tesseract.js text recognition per page.",
        "Download the extracted text as a plain text (.txt) file.",
      ],
      benefits: [
        {
          icon: "ScanText",
          title: "AI-Powered Recognition",
          description:
            "Tesseract.js leverages a trained neural network model to accurately recognize characters across diverse fonts and layouts.",
        },
        {
          icon: "ShieldCheck",
          title: "Fully Offline-Capable",
          description:
            "Once the WASM OCR model loads, recognition runs entirely within your browser without transmitting scanned content externally.",
        },
        {
          icon: "Globe2",
          title: "Multi-Language Support",
          description:
            "Choose from multiple supported languages to accurately recognize text in documents beyond English.",
        },
      ],
      securityNote:
        "Each PDF page is rendered to a canvas via pdfjs-dist, then passed directly into a Tesseract.js worker for recognition entirely in-browser; the worker is terminated and all canvases purged immediately after processing completes.",
      faqs: [
        {
          question: "How accurate is the OCR text extraction?",
          answer:
            "Accuracy depends on scan quality and font clarity, but Tesseract.js typically achieves high accuracy on clean, well-lit scanned documents.",
        },
        {
          question: "Can OCR process handwritten text?",
          answer:
            "OCR engines like Tesseract.js are optimized for printed text and may have limited accuracy with handwritten content.",
        },
        {
          question: "Does OCR work on multi-page scanned PDFs?",
          answer:
            "Yes, every page is processed sequentially and the extracted text is compiled into a single downloadable text file.",
        },
      ],
    },
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function getAllToolSlugs(): string[] {
  return TOOLS.map((tool) => tool.slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter(
    (tool) =>
      tool.name.toLowerCase().includes(q) ||
      tool.shortDescription.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
  );
}

export const ALL_CATEGORIES: ToolCategory[] = [
  "organize",
  "convert",
  "optimize",
  "security",
  "edit",
];

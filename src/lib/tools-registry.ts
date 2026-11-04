export interface ToolDefinition {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  h1: string;
  h2: string;
  category: 'Convert' | 'Edit' | 'Security' | 'Optimize' | 'OCR & Sign';
  faqs: { question: string; answer: string }[];
}

export const TOOLS_REGISTRY: Record<string, ToolDefinition> = {
  'merge-pdf': {
    slug: 'merge-pdf',
    title: 'Merge PDF Files Online Free - Combine PDF Documents',
    shortDescription: 'Combine multiple PDF files into one single document securely in your browser with zero upload limits.',
    longDescription: 'Merge PDF files quickly and securely without uploading sensitive documents to external servers. PDF Lovers Pro uses cutting-edge client-side WebAssembly technology to combine multiple PDF documents into a single organized file right inside your browser. Whether you are merging contracts, invoices, academic papers, or personal records, our tool preserves original formatting, vector graphics, and image quality. Enjoy unlimited free merges with lightning-fast processing speeds, absolute privacy, and zero data retention.',
    h1: 'Merge PDF Files Online Instantly',
    h2: 'How to Combine PDFs Securely in Your Browser',
    category: 'Edit',
    faqs: [
      { question: 'Is my data secure when merging PDFs?', answer: 'Yes! All processing happens locally in your browser using WebAssembly. Your files never leave your device.' },
      { question: 'Is there a limit on file size?', answer: 'No arbitrary server limits. You can merge as many large PDF files as your browser RAM can handle.' }
    ]
  },
  'split-pdf': {
    slug: 'split-pdf',
    title: 'Split PDF Online - Extract Pages from PDF Free',
    shortDescription: 'Separate PDF pages or extract specific page ranges instantly with our free client-side tool.',
    longDescription: 'Split large PDF documents into individual pages or custom page ranges with absolute ease. PDF Lovers Pro gives you complete control over your document architecture without risking confidentiality. Extract specific chapters, invoices, or single pages instantly with zero server uploads and 100% client-side privacy.',
    h1: 'Split PDF Documents Online for Free',
    h2: 'Extract and Separate PDF Pages Instantly',
    category: 'Edit',
    faqs: [
      { question: 'Can I extract non-consecutive pages?', answer: 'Yes, you can specify exact page numbers or ranges to extract.' }
    ]
  },
  'compress-pdf': {
    slug: 'compress-pdf',
    title: 'Compress PDF Online - Reduce PDF File Size Free',
    shortDescription: 'Shrink PDF file size without losing quality using our advanced browser-based compression engine.',
    longDescription: 'Reduce heavy PDF file sizes instantly for effortless email sharing, web uploading, and archival storage. Our intelligent client-side compression engine optimizes embedded fonts, downsamples images, and strips redundant metadata while preserving visual clarity.',
    h1: 'Compress PDF Files Without Losing Quality',
    h2: 'Optimize and Shrink PDF Size in Seconds',
    category: 'Optimize',
    faqs: [
      { question: 'Will my images become blurry?', answer: 'Our smart compression algorithm balances file size reduction with high visual fidelity.' }
    ]
  },
  'pdf-to-jpg': {
    slug: 'pdf-to-jpg',
    title: 'PDF to JPG Converter - Convert PDF Pages to Images Free',
    shortDescription: 'Transform every page of your PDF document into high-resolution JPG image files instantly.',
    longDescription: 'Convert PDF pages into crisp, high-definition JPG images directly in your browser. Perfect for presentations, social media sharing, or graphic design workflows. Fast, private, and requires zero software installation.',
    h1: 'Convert PDF to High-Resolution JPG Images',
    h2: 'Extract Every PDF Page as JPG Instantly',
    category: 'Convert',
    faqs: [
      { question: 'Can I convert multi-page PDFs?', answer: 'Yes, all pages are converted into a ZIP archive of individual JPG images.' }
    ]
  },
  'jpg-to-pdf': {
    slug: 'jpg-to-pdf',
    title: 'JPG to PDF Converter - Turn Images into PDF Free',
    shortDescription: 'Combine multiple JPG, PNG, or image files into a single professional PDF document.',
    longDescription: 'Convert your photo collections, scans, and graphic files into polished PDF documents within seconds. Rearrange images, adjust page orientations, and compile albums securely on your device.',
    h1: 'Convert JPG Images to Professional PDF',
    h2: 'Combine Photos and Scans into PDF Format',
    category: 'Convert',
    faqs: [
      { question: 'Can I upload multiple images at once?', answer: 'Yes, select and reorder multiple images before generating your PDF.' }
    ]
  },
  'word-to-pdf': {
    slug: 'word-to-pdf',
    title: 'Word to PDF Converter - DOCX to PDF Online Free',
    shortDescription: 'Convert Microsoft Word documents (DOCX/DOC) into clean, standard PDF files instantly.',
    longDescription: 'Transform Word documents into universally readable PDF files while keeping fonts, tables, and styling intact. Process your documents securely right inside your browser.',
    h1: 'Convert Word DOCX Files to PDF Online',
    h2: 'Preserve Formatting While Converting Word to PDF',
    category: 'Convert',
    faqs: [
      { question: 'Do I need Microsoft Office installed?', answer: 'No, our parser converts your Word documents directly in the browser.' }
    ]
  },
  'pdf-to-word': {
    slug: 'pdf-to-word',
    title: 'PDF to Word Converter - PDF to DOCX Free',
    shortDescription: 'Extract editable text and structure from PDF documents into Microsoft Word format.',
    longDescription: 'Convert static PDF files into fully editable Word DOCX documents. Save time on retyping and effortlessly edit agreements, reports, and resumes.',
    h1: 'Convert PDF to Editable Word Documents',
    h2: 'Extract Text and Layout into DOCX Format',
    category: 'Convert',
    faqs: [
      { question: 'Is the converted text editable?', answer: 'Yes, text is extracted into standard editable paragraph blocks.' }
    ]
  },
  'rotate-pdf': {
    slug: 'rotate-pdf',
    title: 'Rotate PDF Pages Online - Turn PDF Landscape or Portrait',
    shortDescription: 'Rotate single or multiple PDF pages 90, 180, or 270 degrees permanently.',
    longDescription: 'Fix upside-down scans or misoriented PDF pages instantly. Rotate individual pages or entire documents with zero quality loss and immediate download.',
    h1: 'Rotate PDF Pages Online Easily',
    h2: 'Fix Document Orientation in Seconds',
    category: 'Edit',
    faqs: [
      { question: 'Can I rotate only specific pages?', answer: 'Yes, choose precise pages or rotate the entire document.' }
    ]
  },
  'protect-pdf': {
    slug: 'protect-pdf',
    title: 'Encrypt & Password Protect PDF Online Securely',
    shortDescription: 'Add strong AES password encryption to secure confidential PDF documents against unauthorized access.',
    longDescription: 'Safeguard your confidential agreements, financial statements, and personal records with robust password protection. Encryption runs 100% locally on your machine.',
    h1: 'Password Protect PDF Files Securely',
    h2: 'Encrypt Confidential Documents with AES',
    category: 'Security',
    faqs: [
      { question: 'Are my passwords sent to a server?', answer: 'Never. Encryption keys are generated and applied strictly inside your browser.' }
    ]
  },
  'unlock-pdf': {
    slug: 'unlock-pdf',
    title: 'Unlock PDF Online - Remove PDF Password Protection Free',
    shortDescription: 'Remove known passwords and security restrictions from your PDF documents instantly.',
    longDescription: 'Strip printing, copying, and password restrictions from authorized PDF files so you can read, edit, and share them without friction.',
    h1: 'Remove PDF Password Restrictions Online',
    h2: 'Unlock Protected PDF Documents Instantly',
    category: 'Security',
    faqs: [
      { question: 'Do I need to know the current password?', answer: 'Yes, you must provide the correct password to remove security restrictions.' }
    ]
  },
  'pdf-to-png': {
    slug: 'pdf-to-png',
    title: 'PDF to PNG Converter - High Quality Image Export Free',
    shortDescription: 'Convert PDF pages into lossless PNG image format with transparent background support.',
    longDescription: 'Export crisp, lossless PNG renders of your PDF pages for high-end graphic design, publishing, and digital archiving.',
    h1: 'Convert PDF Pages to Lossless PNG Images',
    h2: 'High-Fidelity PDF Image Extraction',
    category: 'Convert',
    faqs: [
      { question: 'What is the advantage of PNG over JPG?', answer: 'PNG offers lossless compression ideal for sharp lines and graphics.' }
    ]
  },
  'png-to-pdf': {
    slug: 'png-to-pdf',
    title: 'PNG to PDF Converter - Combine PNG Images to PDF',
    shortDescription: 'Convert PNG images into clean, standardized PDF documents with customized layouts.',
    longDescription: 'Transform high-resolution PNG graphics and screenshots into professional multi-page PDF documents instantly.',
    h1: 'Convert PNG Images into PDF Format',
    h2: 'Fast and Secure Image-to-PDF Compilation',
    category: 'Convert',
    faqs: [
      { question: 'Can I combine mixed PNG and JPG files?', answer: 'Yes, our tool supports multiple image formats in a single workflow.' }
    ]
  },
  'excel-to-pdf': {
    slug: 'excel-to-pdf',
    title: 'Excel to PDF Converter - Spreadsheets to PDF Free',
    shortDescription: 'Convert Excel spreadsheets (XLSX/XLS) into neatly formatted PDF documents.',
    longDescription: 'Turn complex data tables, financial models, and charts into beautifully structured PDF reports without formatting distortions.',
    h1: 'Convert Excel Spreadsheets to PDF Online',
    h2: 'Transform XLSX and XLS Files into Clean PDFs',
    category: 'Convert',
    faqs: [
      { question: 'Are formulas calculated before conversion?', answer: 'Yes, cell values and calculated data are rendered directly.' }
    ]
  },
  'pdf-to-excel': {
    slug: 'pdf-to-excel',
    title: 'PDF to Excel Converter - Extract Tables to XLSX Free',
    shortDescription: 'Extract tabular data from PDF documents directly into Microsoft Excel spreadsheets.',
    longDescription: 'Convert static PDF tables into editable Excel spreadsheets. Save hours of manual data entry with our intelligent table parser.',
    h1: 'Extract PDF Tables to Excel Spreadsheets',
    h2: 'Convert PDF Data into XLSX Format',
    category: 'Convert',
    faqs: [
      { question: 'Does it preserve table rows and columns?', answer: 'Yes, table cells are mapped directly into spreadsheet grid structures.' }
    ]
  },
  'ppt-to-pdf': {
    slug: 'ppt-to-pdf',
    title: 'PPT to PDF Converter - PowerPoint Presentations to PDF',
    shortDescription: 'Convert PowerPoint slides (PPTX/PPT) into universal PDF documents for easy sharing.',
    longDescription: 'Convert slide decks and presentations into professional PDF handouts that look identical on any device or operating system.',
    h1: 'Convert PowerPoint PPTX Slides to PDF',
    h2: 'Turn Presentations into Portable PDF Documents',
    category: 'Convert',
    faqs: [
      { question: 'Will slide animations be preserved?', answer: 'PDFs are static document formats, so animations are flattened into standard slide views.' }
    ]
  },
  'pdf-to-ppt': {
    slug: 'pdf-to-ppt',
    title: 'PDF to PowerPoint Converter - PDF to PPTX Free',
    shortDescription: 'Convert PDF presentation slides back into editable PowerPoint PPTX format.',
    longDescription: 'Transform static PDF slide decks into fully editable PowerPoint presentations for quick updates and redesigns.',
    h1: 'Convert PDF Documents to PowerPoint PPTX',
    h2: 'Make Static PDF Slides Editable Again',
    category: 'Convert',
    faqs: [
      { question: 'Can I edit the text after conversion?', answer: 'Yes, text elements become editable text boxes in PowerPoint.' }
    ]
  },
  'watermark-pdf': {
    slug: 'watermark-pdf',
    title: 'Watermark PDF Online - Add Text or Image Watermarks',
    shortDescription: 'Stamp custom text, copyright notices, or company logos across your PDF pages securely.',
    longDescription: 'Protect your intellectual property by stamping professional text or image watermarks with adjustable opacity, rotation, and positioning.',
    h1: 'Add Custom Watermarks to PDF Documents',
    h2: 'Protect Your Copyright with Text & Image Stamps',
    category: 'Security',
    faqs: [
      { question: 'Can I customize watermark opacity?', answer: 'Yes, adjust transparency levels so your content remains fully readable.' }
    ]
  },
  'page-numbers-pdf': {
    slug: 'page-numbers-pdf',
    title: 'Add Page Numbers to PDF Online Free',
    shortDescription: 'Insert sequential page numbers into headers or footers of your PDF documents.',
    longDescription: 'Number your PDF pages automatically with custom positioning, font styles, and starting numbers for academic papers, legal briefs, and reports.',
    h1: 'Insert Page Numbers into PDF Files',
    h2: 'Add Professional Headers and Footers Instantly',
    category: 'Edit',
    faqs: [
      { question: 'Can I start numbering from a specific page?', answer: 'Yes, you can configure starting page offsets easily.' }
    ]
  },
  'crop-pdf': {
    slug: 'crop-pdf',
    title: 'Crop PDF Pages Online - Trim Margins & White Space',
    shortDescription: 'Trim margins and remove unwanted whitespace or borders from PDF pages.',
    longDescription: 'Crop PDF page boundaries precisely to fit specific layouts, remove printer marks, or focus on key document sections.',
    h1: 'Crop PDF Pages and Margins Online',
    h2: 'Trim Unwanted Borders from PDF Documents',
    category: 'Edit',
    faqs: [
      { question: 'Can I crop all pages at once?', answer: 'Yes, apply crop box coordinates across all pages uniformly.' }
    ]
  },
  'extract-pages': {
    slug: 'extract-pages',
    title: 'Extract Pages from PDF Online - Save Specific Pages',
    shortDescription: 'Pull out individual pages or custom page ranges into a brand new PDF document.',
    longDescription: 'Extract exact pages from large PDF files and save them as standalone documents instantly without server uploads.',
    h1: 'Extract Specific Pages from PDF Online',
    h2: 'Create New PDF Files from Selected Pages',
    category: 'Edit',
    faqs: [
      { question: 'Is the original PDF modified?', answer: 'No, your original file remains untouched while a new file is generated.' }
    ]
  },
  'delete-pages': {
    slug: 'delete-pages',
    title: 'Delete PDF Pages Online - Remove Unwanted Pages',
    shortDescription: 'Remove blank, outdated, or confidential pages from your PDF documents instantly.',
    longDescription: 'Clean up your PDF files by deleting unwanted pages with a single click. Fast, secure, and fully client-side.',
    h1: 'Delete Unwanted Pages from PDF Online',
    h2: 'Remove Pages and Rebuild Your PDF',
    category: 'Edit',
    faqs: [
      { question: 'Can I delete multiple non-adjacent pages?', answer: 'Yes, select any combination of pages for removal.' }
    ]
  },
  'sign-pdf': {
    slug: 'sign-pdf',
    title: 'Sign PDF Online - Draw or Type Digital Signatures',
    shortDescription: 'Add legally binding electronic signatures, initials, and dates to your PDF documents.',
    longDescription: 'Sign contracts, agreements, and forms digitally by drawing, typing, or uploading your signature directly in your browser.',
    h1: 'Sign PDF Documents Online Securely',
    h2: 'Add Handwritten Electronic Signatures Instantly',
    category: 'OCR & Sign',
    faqs: [
      { question: 'Are digital signatures secure?', answer: 'Signatures are flattened securely into the PDF document layer.' }
    ]
  },
  'ocr-pdf': {
    slug: 'ocr-pdf',
    title: 'OCR PDF Online - Extract Text from Scanned PDFs',
    shortDescription: 'Recognize text in scanned documents and images using advanced client-side OCR engine.',
    longDescription: 'Transform scanned paper documents and image-based PDFs into searchable, selectable text files using Optical Character Recognition.',
    h1: 'Optical Character Recognition (OCR) for PDF',
    h2: 'Convert Scanned PDFs into Searchable Text',
    category: 'OCR & Sign',
    faqs: [
      { question: 'What languages does OCR support?', answer: 'Our Tesseract-powered engine supports multiple global languages.' }
    ]
  },
  'repair-pdf': {
    slug: 'repair-pdf',
    title: 'Repair Damaged PDF Online - Fix Corrupted Files',
    shortDescription: 'Recover data and fix broken or corrupted PDF documents safely in your browser.',
    longDescription: 'Attempt recovery on damaged, unreadable, or corrupted PDF files and extract usable document streams and content.',
    h1: 'Repair Corrupted and Damaged PDF Files',
    h2: 'Recover Unreadable PDF Documents Online',
    category: 'Optimize',
    faqs: [
      { question: 'Can all corrupted PDFs be repaired?', answer: 'Recovery depends on the severity of file structure damage, but minor index corruptions are easily fixed.' }
    ]
  },
  'resize-pdf': {
    slug: 'resize-pdf',
    title: 'Resize PDF Page Format - Change Page Dimensions Free',
    shortDescription: 'Scale and change PDF page dimensions between A4, Letter, Legal, and custom sizes.',
    longDescription: 'Adjust your PDF page dimensions to fit standard printing formats or presentation dimensions seamlessly.',
    h1: 'Resize PDF Page Dimensions Online',
    h2: 'Change Paper Size to A4, Letter, or Custom',
    category: 'Optimize',
    faqs: [
      { question: 'Will my content scale proportionally?', answer: 'Yes, content scales to fit the new page boundaries cleanly.' }
    ]
  }
};

// src/lib/tool-content.ts
// Hand-written content for the highest-traffic tools. Applied over the
// template-generated copy in tools-registry.ts. Keep h2s and paragraphs the
// same length: the tool page renders them as pairs.
import type { FaqItem } from './tools-registry';

export interface ToolContent {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  h2s: [string, string, string, string];
  paragraphs: [string, string, string, string];
  steps: string[];
  faqs: FaqItem[];
  keywords: string[];
}

const uploadFaq = (name: string): FaqItem => ({
  q: 'Are my files uploaded to a server?',
  a: `No. ${name} runs in your browser, so your files are processed on your device and are not sent to PDF Lovers Pro's servers. The site does show third-party ads (see the Privacy Policy), so avoid any online tool for documents that must never leave systems you control.`,
});

export const TOOL_CONTENT: Record<string, ToolContent> = {
  /* ------------------------------ merge-pdf ------------------------------ */
  'merge-pdf': {
    metaTitle: 'Merge PDF Files Online, Free and No Upload',
    metaDescription:
      'Combine multiple PDFs into one file in the order you choose. Runs in your browser, with no upload, no sign-up and no watermark.',
    h1: 'Merge PDF Files Online for Free',
    h2s: [
      'Combine PDFs into one document',
      'What happens to your pages during a merge',
      'Practical ways people use Merge PDF',
      'Limits, bookmarks and privacy',
    ],
    paragraphs: [
      `Merge PDF takes two or more PDF files and joins them into a single document. You add the files, put them in the order you want, and the tool produces one PDF whose pages run from the first file's first page to the last file's last page. There is no account to create and no watermark is added to the result. It is the quickest way to turn a folder of loose scans, exports and attachments into one file that is easy to send, print or archive.`,
      `Each file is opened inside your browser tab, and its pages are copied one at a time into a new document. Pages are copied rather than redrawn, so text stays selectable, images keep their original quality and embedded fonts stay embedded. The order in the list is the order in the output, and you can drag rows or use the arrow buttons to rearrange them before you start. You can combine up to 100 files in one run. The practical ceiling is your device's memory, so a phone copes with fewer large scans than a laptop does.`,
      `Merging is routine in office and student life. Finance teams combine a month of invoices into one statement for the accountant. Job applicants put a cover letter, CV and certificates into a single attachment so recruiters open one file instead of four. Students join lecture handouts into a study pack, and people applying for a visa or a loan merge ID scans, bank statements and forms into the single upload a portal allows. Property managers and lawyers use it to assemble bundles where every page must sit in a fixed sequence.`,
      `Decide the order before you merge, because changing it afterwards means running the tool again. Bookmarks, outlines and interactive form fields from the original files are not carried into the combined document, so flatten completed forms first if their contents matter. Encrypted files should be unlocked before merging. If the combined file is too big for an email limit, run it through Compress PDF afterwards. Your files are processed in your browser and are not uploaded to our servers, and closing the tab releases the memory they used.`,
    ],
    steps: [
      'Click the upload area or drag in two or more PDF files.',
      'Reorder the list by dragging rows or using the arrows. The top file supplies the first pages.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the combined PDF and check the page order before you share it.',
    ],
    faqs: [
      { q: 'How many PDF files can I merge at once?', a: `From two up to 100 files in one run. In practice your device's memory sets the limit, so a phone handles fewer large scans than a laptop.` },
      { q: 'Does merging lower the quality of my pages?', a: 'No. Pages are copied into the new file rather than redrawn, so text stays selectable and images keep their original quality.' },
      { q: 'Can I change the order after the files are merged?', a: 'Not inside the finished file. Reorder the list and run Merge PDF again, or use Extract Pages to pick pages in a new order.' },
      { q: 'Why are my bookmarks and form fields missing from the result?', a: 'Pages are copied without the document outline and interactive form data of the originals. Flatten completed forms first if their contents must survive.' },
      uploadFaq('Merge PDF'),
    ],
    keywords: ['merge pdf', 'combine pdf files', 'join pdf online', 'merge pdf free no upload', 'pdf merger'],
  },

  /* ------------------------------ split-pdf ------------------------------ */
  'split-pdf': {
    metaTitle: 'Split PDF by Page Range, Free and No Upload',
    metaDescription:
      'Split a PDF by page ranges, every N pages, or one file per page. Files stay in your browser and results arrive in one ZIP.',
    h1: 'Split PDF Files Online for Free',
    h2s: [
      'Cut one PDF into smaller files',
      'Three ways to split a document',
      'Everyday reasons to split a PDF',
      'Before you split: limits and privacy',
    ],
    paragraphs: [
      `Split PDF breaks a single document into several smaller PDFs. You decide where the cuts go: by page ranges you type, in equal chunks of a fixed number of pages, or as one file per page. When the job produces more than one file, everything is delivered together in a ZIP archive, so you download once and nothing gets lost in your downloads folder. Your original file is never altered, and you can run the tool again with different settings as often as you like.`,
      `The three modes suit different jobs. Ranges mode takes groups written the way you would in a print dialog, for example 1-3, 4-6, 7, and turns each comma-separated group into its own file. Every N pages mode slices the document into equal parts, and the last file simply holds whatever pages remain. The every-page mode gives one PDF per page. Ranges may overlap, so a page listed in two groups is copied into both files. Keep your ranges inside the document's page count.`,
      `People split PDFs to share only what is needed. A scanned book can become one file per chapter. A signed page can be pulled out of a long contract. HR teams break a combined payslip run into one file per employee, so each person receives only their own. Large reports are cut into parts that fit under an email attachment limit, and a multi-invoice export becomes individual invoices that can be filed separately. Teachers split exam papers by section, and researchers separate one article from the journal issue it arrived in.`,
      `Check the total page count first so your ranges stay inside it. Bookmarks, outlines and interactive form fields are not carried into the pieces, so keep the original if you still need them. Splitting a very long file into one file per page creates a very large number of files and needs more memory, so for long documents prefer ranges or chunks. Encrypted files should be unlocked first. Your document is processed in your browser and is not uploaded to our servers, and the ZIP is built on your device.`,
    ],
    steps: [
      'Add the PDF you want to split by dragging it in or clicking the upload area.',
      'Choose a split mode, then type your page ranges or the number of pages per file.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the ZIP and open a couple of the files to confirm the pages are right.',
    ],
    faqs: [
      { q: 'How do I write page ranges?', a: 'Use hyphens for runs and commas between groups. For example, 1-3, 4-6, 9 creates three files, and each group becomes its own PDF.' },
      { q: 'Can I save every page as a separate PDF?', a: 'Yes. Choose the every-page option and you receive one PDF per page, delivered together in a ZIP.' },
      { q: 'What does the Every N pages mode do?', a: 'It cuts the document into equal parts of N pages. The last file holds whatever pages remain.' },
      { q: 'Will the split files lose quality?', a: 'No. Pages are copied, not re-rendered. Bookmarks and interactive form fields are not carried into the pieces, though.' },
      uploadFaq('Split PDF'),
    ],
    keywords: ['split pdf', 'split pdf by page range', 'separate pdf pages', 'split pdf online free', 'divide pdf into multiple files'],
  },

  /* ----------------------------- compress-pdf ---------------------------- */
  'compress-pdf': {
    metaTitle: 'Compress PDF Online, Free and No Upload',
    metaDescription:
      'Reduce PDF size for email and forms. Lossless mode keeps text selectable, stronger modes shrink more. Runs in your browser.',
    h1: 'Compress PDF Online for Free',
    h2s: [
      'Make a PDF small enough to send',
      'Lossless clean-up versus image-based compression',
      'When compressing a PDF is worth it',
      'Honest expectations and privacy',
    ],
    paragraphs: [
      `Compress PDF reduces the size of a document so it fits an email attachment limit, an online application form or a messaging app. It does this inside your browser, with no upload and no waiting in a server queue. You choose between three levels. The gentlest keeps your text exactly as it is. The stronger two trade text selectability for a much smaller file. Compare the size of the result with your original before you decide which one to use.`,
      `Low mode rewrites the file's internal structure and packs its objects more efficiently without touching text, fonts or images. It is lossless, but the saving depends on how wastefully the file was written, and files that are already optimized may barely shrink. Medium and high modes work differently: each page is rendered in your browser and saved as a compressed JPEG inside a new PDF. That can cut scanned and photo-heavy documents dramatically, but the text on those pages becomes part of the picture, so it can no longer be selected, copied or searched.`,
      `Compression helps most with scans and documents full of photographs, which are large because of their images. Typical cases are a scanned contract that exceeds a ten megabyte upload limit, a brochure exported from a design tool at print resolution that is going onto a website, or a bundle of statements for a government portal with a strict size cap. Text-only documents are already small, so compressing them achieves little.`,
      `Start with low and check the size. Move to medium or high only if you need more, and keep your original, because image-based output cannot become selectable text again except through OCR. Occasionally the output is larger than the input, particularly for well-optimized files. In that case keep the original. Image-based modes also drop bookmarks and links, because pages are rebuilt. Everything runs in your browser and your file is not uploaded to our servers.`,
    ],
    steps: [
      'Add your PDF by dragging it in or clicking the upload area.',
      'Pick a compression level. Start with low if you want to keep selectable text.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the result and compare its size with the original before using it.',
    ],
    faqs: [
      { q: 'Which compression level should I choose?', a: 'Try low first because it keeps text selectable. Use medium or high when you need a much smaller file and do not need to select or search the text.' },
      { q: 'Why can I not select text after compressing?', a: 'Medium and high modes rebuild each page as an image. Run OCR PDF on the result if you need searchable text again.' },
      { q: 'How much smaller will my file get?', a: 'It depends on the content. Scans and photo-heavy files shrink the most in the image-based modes. Text-only files barely change.' },
      { q: 'Can the compressed file be larger than the original?', a: 'Occasionally, for files that are already well optimized. If the result is larger, keep your original.' },
      uploadFaq('Compress PDF'),
    ],
    keywords: ['compress pdf', 'reduce pdf size', 'compress pdf online free', 'shrink pdf for email', 'pdf compressor no upload'],
  },

  /* ------------------------------ pdf-to-jpg ----------------------------- */
  'pdf-to-jpg': {
    metaTitle: 'PDF to JPG Converter, Free and No Upload',
    metaDescription:
      'Convert PDF pages to JPG images at 1x to 3x resolution. Choose pages and quality. Results arrive in a ZIP, all in your browser.',
    h1: 'PDF to JPG Converter Online for Free',
    h2s: [
      'Turn PDF pages into JPG images',
      'Resolution and quality settings explained',
      'Where JPG pages come in handy',
      'Memory, limits and privacy',
    ],
    paragraphs: [
      `PDF to JPG converts the pages of a PDF into ordinary JPG pictures that you can post online, paste into a slide deck, attach to a chat or open on any device. You pick which pages to convert, how sharp the pictures should be and how strongly they are compressed. Results with more than one page are bundled into a single ZIP, so one download covers the whole job. No account is needed, and the conversion runs in your browser.`,
      `Each page is drawn onto a canvas by the PDF engine in your browser and then encoded as JPEG. The resolution setting multiplies the page's natural size. 1x suits quick screen previews, 2x is sharp on most displays, and 3x is aimed at print. The quality slider runs from 40 to 100. Around 85 balances sharpness and size, while lower values make smaller files with visible artefacts around small text. The canvas is cleared as soon as each page is saved, which keeps memory use steady on long documents.`,
      `Common jobs include posting one page of a brochure on social media, dropping a contract page into a presentation, sending a preview to someone who cannot open PDFs, making thumbnails for a document library, and capturing a form page to mark up in an image editor. If you want the pictures embedded inside a PDF rather than pictures of its pages, the Extract Images tool pulls each embedded picture out as its own file.`,
      `Convert only the pages you need, using a list such as 1-3, 8, because every extra page costs memory and download size. Very large pages are scaled down to stay within browser canvas limits, so a huge poster can come out smaller than the 3x setting suggests. JPG is lossy and has no transparency, so for crisp text and line art use PDF to PNG instead. Your PDF is rendered locally and is not uploaded to our servers.`,
    ],
    steps: [
      'Add your PDF by dragging it in or clicking the upload area.',
      'Choose a resolution and quality, and enter page numbers if you only want some pages.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the images, which arrive in a ZIP when there are several pages.',
    ],
    faqs: [
      { q: 'What resolution should I pick?', a: '2x suits most uses. Choose 3x when you plan to print the images and 1x for small previews.' },
      { q: 'Can I convert only some pages?', a: 'Yes. Enter a page list such as 1-3, 8 in the pages field and only those pages are converted.' },
      { q: 'Should I choose JPG or PNG?', a: 'JPG gives smaller files and suits photographs. PNG is lossless, so text and line art stay sharper.' },
      { q: 'Why is a very large page smaller than I expected?', a: 'Pages that would exceed browser canvas limits are scaled down automatically, so oversized pages can come out below the selected resolution.' },
      uploadFaq('PDF to JPG'),
    ],
    keywords: ['pdf to jpg', 'pdf to jpeg', 'convert pdf to image', 'pdf to jpg online free', 'pdf pages to images'],
  },

  /* ------------------------------ jpg-to-pdf ----------------------------- */
  'jpg-to-pdf': {
    metaTitle: 'JPG to PDF Converter, Free and No Upload',
    metaDescription:
      'Turn JPG photos and scans into one PDF. Choose page size, orientation and margins. Photos stay sharp. Runs in your browser.',
    h1: 'JPG to PDF Converter Online for Free',
    h2s: [
      'Combine JPG photos into one PDF',
      'Page size, orientation and margins',
      'Typical uses for JPG to PDF',
      'Order, limits and privacy',
    ],
    paragraphs: [
      `JPG to PDF turns photographs and scans into a PDF document. Add a single picture or up to 200, arrange them in the order you want, and each image becomes one page. The result is one file that is easier to email, print and upload than a pile of separate images, and it opens the same way on every device. There is no account and no watermark is added.`,
      `JPEG photos are embedded directly where possible rather than re-encoded, so they keep their original quality inside the PDF. Page size can fit each image exactly, or be set to A4, US Letter, US Legal, A3 or A5. With automatic orientation each page follows the shape of its own image, so portrait and landscape photos can sit in the same document. You can also force one orientation. Margins are measured in points, where 72 points equal one inch, from 0 to 144.`,
      `People use it to gather phone photos of receipts into one expense file, turn photographed pages of a book or notes into a shareable document, assemble artwork into a quick portfolio, or send ID photos and proof of address as the single attachment a form allows. If your scans already exist as PDFs and you only need to join them, Merge PDF is the better route.`,
      `The page order follows the order of files in the list, so sort it before converting. Use the fit option to avoid white borders, or A4 with a modest margin for printing. Large phone photos use a lot of memory, so convert big batches in smaller groups if your device slows down, and use Compress PDF afterwards if the result is too big to send. This tool accepts .jpg and .jpeg files. For PNG images use PNG to PDF. Images are processed in your browser and are not uploaded to our servers.`,
    ],
    steps: [
      'Add your JPG files by dragging them in or clicking the upload area.',
      'Put them in the order you want, then choose page size, orientation and margin.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the PDF and scroll through it to check the page order.',
    ],
    faqs: [
      { q: 'Are my photos recompressed?', a: 'JPEG photos are embedded directly where possible, so they keep their original quality inside the PDF.' },
      { q: 'Can I mix portrait and landscape photos?', a: 'Yes. With automatic orientation each page follows the shape of its own image.' },
      { q: 'How many images can I convert at once?', a: `Up to 200 per run, as long as your device has enough memory. Convert big batches in smaller groups if it slows down.` },
      { q: 'Can I convert PNG or iPhone HEIC photos?', a: 'This tool accepts .jpg and .jpeg. Use PNG to PDF for PNG files, and export HEIC photos as JPG on your phone first.' },
      uploadFaq('JPG to PDF'),
    ],
    keywords: ['jpg to pdf', 'jpeg to pdf', 'photos to pdf', 'jpg to pdf converter free', 'combine images into pdf'],
  },

  /* ----------------------------- word-to-pdf ----------------------------- */
  'word-to-pdf': {
    metaTitle: 'Word to PDF Converter (DOCX), No Upload',
    metaDescription:
      'Convert DOCX to PDF in your browser. Headings, lists, tables and images carry over, though complex layout is simplified.',
    h1: 'Word to PDF Converter Online for Free',
    h2s: [
      'Convert a DOCX file to PDF',
      'What carries over and what does not',
      'When this converter is the right choice',
      'Layout limits and privacy',
    ],
    paragraphs: [
      `Word to PDF converts a DOCX document into a PDF without installing Microsoft Office and without uploading the file to a server. Headings, paragraphs, lists, tables and embedded pictures are carried over and typeset onto A4 or US Letter pages, giving you a file that opens the same way on every phone, laptop and printer. It suits letters, CVs, assignments and reports where the content matters more than exact placement on the page.`,
      `A browser cannot run Word, so this tool takes a different route. The document is read by a converter in your tab, which extracts its structure (headings, paragraphs, lists, tables and images) and then lays that content out on pages itself. That is why the result is faithful to the content rather than a pixel-for-pixel copy. Page breaks may fall in different places, and styling that depends on Word's own layout engine is simplified. Only the modern .docx format is supported. An older .doc file must be re-saved as DOCX first.`,
      `Use it when you need a quick, shareable PDF of a text-led document: a CV to attach to an application, a report for an upload portal that insists on PDF, a letter that recipients should not edit by accident, or an archive copy of a draft. If exact fidelity is critical, for example a brochure with text boxes, columns and custom fonts, or a file going to a professional printer, use Word's own Save as PDF or Export option, which uses the original layout engine.`,
      `Always open the result and check page breaks, tables and images before sending it. Text boxes, multi-column sections, headers and footers, tracked changes and unusual fonts are the usual places where output differs from Word, and some of them may be simplified or left out. Custom fonts from the original are not guaranteed to be preserved. Your DOCX file is processed in your browser and is not uploaded to our servers.`,
    ],
    steps: [
      'Add your DOCX file by dragging it in or clicking the upload area.',
      'Choose A4 or US Letter as the page size.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the PDF and check page breaks, tables and images before sending it.',
    ],
    faqs: [
      { q: 'Will the PDF look exactly like my Word document?', a: 'Not always. Content, headings, lists, tables and images are kept, but complex layout and fonts may differ because the conversion runs without Word.' },
      { q: 'Can I convert an old .doc file?', a: 'No. Open it in Word or a free office suite and save it as DOCX first.' },
      { q: 'Is the text in the PDF selectable?', a: 'Yes. The content is typeset as text, so you can select, copy and search it in the PDF.' },
      { q: 'When should I use Word itself instead?', a: `Use Word's Save as PDF when exact layout matters, such as columns, text boxes or custom fonts, or when the file is going to a professional printer.` },
      uploadFaq('Word to PDF'),
    ],
    keywords: ['word to pdf', 'docx to pdf', 'convert word document to pdf', 'word to pdf free no upload', 'docx to pdf converter'],
  },

  /* ----------------------------- pdf-to-word ----------------------------- */
  'pdf-to-word': {
    metaTitle: 'PDF to Word Converter, Free and No Upload',
    metaDescription:
      'Convert PDF text into an editable DOCX file in your browser. Headings and paragraphs are rebuilt, with no upload and no sign-up.',
    h1: 'PDF to Word Converter Online for Free',
    h2s: [
      'Turn a PDF into an editable Word file',
      'How paragraphs are rebuilt from a PDF',
      'What to expect from the result',
      'Scanned PDFs, limits and privacy',
    ],
    paragraphs: [
      `PDF to Word creates an editable DOCX from your PDF. The text is read from each page and rebuilt as real Word content, so you can open the file in Word, LibreOffice or Google Docs, fix a typo, update a price or reuse a paragraph without retyping it. No account is needed, and the conversion happens in your browser rather than on a server.`,
      `A PDF does not store paragraphs the way a Word file does. It stores characters at positions on a page. The tool groups characters into lines by position, then groups lines into paragraphs and headings using spacing and font size, and writes the result as a Word document with page breaks. This is inference, not recovery, so quality depends on the source. Simple documents such as letters, articles and reports convert well.`,
      `Expect the wording to be correct and the layout to be simplified. Images, tables and multi-column designs are not rebuilt exactly, and fonts and spacing may differ. Treat the result as a head start: get the text out, then format it in Word. People use it to update a price list they only have as a PDF, reuse wording from a brochure, edit a contract draft, or let colleagues comment in a shared document. For plain text, PDF to Text is lighter, and PDF to PowerPoint keeps the look of each page.`,
      `Scanned PDFs are pictures of text and contain no text to read, so converting them directly gives an empty or near-empty result. Run OCR PDF first to create a searchable PDF, then convert that. Encrypted files should be unlocked first. Check numbers, names and special characters in the output before you rely on it. Your PDF is processed in your browser and is not uploaded to our servers.`,
    ],
    steps: [
      'Add your PDF by dragging it in or clicking the upload area.',
      'Run the conversion. There are no settings to change for this tool.',
      'Wait for the progress bar to finish, then download the DOCX file.',
      'Open it in Word or a free office suite and tidy up the layout.',
    ],
    faqs: [
      { q: 'Will the layout match the PDF?', a: 'Text is carried over, but layout is simplified. Tables, columns and images are not reproduced exactly.' },
      { q: 'Does it work on scanned documents?', a: 'Only if they contain real text. For scans, use OCR PDF first to create a text layer, then convert the result.' },
      { q: 'Why are my tables and pictures not rebuilt?', a: 'A PDF has no concept of tables or paragraphs, only positioned text and graphics. This tool rebuilds text and structure but not tables or images.' },
      { q: 'Which programs can open the DOCX file?', a: 'Microsoft Word, LibreOffice Writer, Google Docs and most other word processors.' },
      uploadFaq('PDF to Word'),
    ],
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf to word free no upload', 'pdf to editable word'],
  },

  /* ------------------------------ rotate-pdf ----------------------------- */
  'rotate-pdf': {
    metaTitle: 'Rotate PDF Pages Online, Free and No Upload',
    metaDescription:
      'Rotate all or selected PDF pages by 90, 180 or 270 degrees and save the fixed file. No quality loss, runs in your browser.',
    h1: 'Rotate PDF Pages Online for Free',
    h2s: [
      'Fix sideways and upside-down pages',
      'Rotation without re-rendering',
      'Situations where rotating helps',
      'Page selection, limits and privacy',
    ],
    paragraphs: [
      `Rotate PDF fixes pages that were scanned sideways, saved upside down or exported in the wrong orientation. Pick a quarter turn clockwise, a half turn or a quarter turn counter-clockwise, apply it to every page or only the ones that are wrong, and download a copy that opens the right way up in any viewer. Nothing is uploaded and no account is needed.`,
      `A PDF page carries a rotation value, and viewers use it to decide how to display the page. This tool changes that value instead of redrawing the page, so text stays text, images keep their original quality and the file size barely changes. The turn you choose is added to whatever rotation the page already has, which means running the tool twice on the same page keeps turning it. If a page is upside down, choose 180 degrees rather than two quarter turns.`,
      `Rotation comes up constantly after scanning. A few sheets go through a document feeder sideways, a landscape table or drawing sits inside a portrait report, a phone app saves a receipt with the wrong orientation, or a fax-style file arrives upside down. Fixing orientation also helps before other steps. Correcting it before OCR PDF usually improves text recognition, and correcting it before Merge PDF means the combined document reads consistently.`,
      `Use the pages field to target specific pages, for example 3, 7-9, and leave it empty to rotate the whole document. Page numbers start at 1. The rotation is saved in the file, so pages appear turned in standard viewers, but a few specialised programs ignore it, so check the result in the app your recipient uses. Your original file is untouched, and processing happens in your browser without any upload.`,
    ],
    steps: [
      'Add your PDF by dragging it in or clicking the upload area.',
      'Choose the rotation and, optionally, the pages to turn. Leave pages empty for all.',
      'Press the run button and wait for the progress bar to finish.',
      'Download the corrected PDF and scroll through it to confirm every page is upright.',
    ],
    faqs: [
      { q: 'Does rotating reduce quality?', a: 'No. Only the page rotation value changes, so text and images are not re-rendered or recompressed.' },
      { q: 'Can I rotate just one page?', a: 'Yes. Type the page number or range in the pages field and only those pages are rotated.' },
      { q: 'Why does a page keep turning when I run the tool again?', a: 'The new rotation is added to the one the page already has, so repeating the tool turns it further. Run it once on the original file.' },
      { q: 'Will the rotation show in every PDF viewer?', a: 'In standard viewers and browsers, yes. A few specialised programs ignore page rotation, so test in the app your recipient uses.' },
      uploadFaq('Rotate PDF'),
    ],
    keywords: ['rotate pdf', 'rotate pdf pages', 'turn pdf sideways', 'rotate pdf online free', 'fix upside down pdf'],
  },

  /* ----------------------------- protect-pdf ----------------------------- */
  'protect-pdf': {
    metaTitle: 'Password Protect PDF with AES-256, No Upload',
    metaDescription:
      'Add a password to a PDF using AES-256 encryption in your browser. Your file and password are never sent to our servers.',
    h1: 'Password Protect a PDF Online for Free',
    h2s: [
      'Lock a PDF behind a password',
      'How the encryption is applied',
      'Good uses and sensible limits',
      'Choosing a password and staying safe',
    ],
    paragraphs: [
      `Protect PDF adds a password to your document so that anyone opening it must type the password first. Choose a password, confirm it, and download an encrypted copy. Because the encryption is applied in your browser, this tool never transmits your document or your password to a server, which is the main reason to prefer it over upload-based services for private files.`,
      `The file is written with AES-256 encryption using the PDF 2.0 (Revision 6) scheme, built on the cryptography functions your browser provides. After encrypting, the tool reopens the result with your password to confirm that it works before offering the download, which catches most failures early. Passwords can be up to 127 characters long. Most current PDF viewers support this scheme, but older readers and older third-party software may not, so open the output in the viewer your recipient will use before you send it.`,
      `People use it to email payslips or contracts, store tax records in cloud folders, send medical or legal paperwork, and protect files on a USB stick that might be lost. It deters casual access and keeps a file private in transit. It is not a replacement for managed document security. Once someone has both the file and the password they can open it, copy it and remove the protection, and a weak password can be guessed by software.`,
      `Use a long, unique password. A passphrase of several unrelated words is easier to remember than random symbols. Send it through a different channel than the file. There is no recovery: the password exists only on your device, so if you forget it the file cannot be opened by us or by anyone else. This implementation has not been independently audited, so for highly sensitive material such as regulated financial or health data, use certified software and follow your organisation's policies. Keep the unencrypted original somewhere safe.`,
    ],
    steps: [
      'Add the PDF you want to protect by dragging it in or clicking the upload area.',
      'Type your password, then type it again to confirm it.',
      'Press the run button and wait while the file is encrypted and checked.',
      'Download the protected PDF, then open it with your password to test it before sending.',
    ],
    faqs: [
      { q: 'Can a forgotten password be recovered?', a: 'No. The password never leaves your device, so nobody can reset it for you. Keep it somewhere safe.' },
      { q: 'Which encryption does it use?', a: 'AES-256 with the PDF 2.0 scheme. The implementation is not independently audited, so choose certified tools for extremely sensitive files.' },
      { q: 'Will the protected PDF open in Adobe Reader and Chrome?', a: 'It is designed to, since most current viewers support this scheme, but older readers may not. Open the result in the viewer your recipient will use before sending.' },
      { q: 'Can I remove the password later?', a: 'Yes, with Unlock PDF, by entering the password. That tool rebuilds pages as images, so keep your original unprotected file if you need selectable text.' },
      uploadFaq('Protect PDF'),
    ],
    keywords: ['protect pdf', 'password protect pdf', 'encrypt pdf', 'add password to pdf free', 'pdf aes-256 encryption'],
  },

  /* ----------------------------- unlock-pdf ------------------------------ */
  'unlock-pdf': {
    metaTitle: 'Unlock PDF When You Know the Password',
    metaDescription:
      'Remove a PDF password when you know it. Enter the password and get an unprotected copy. No cracking, no upload.',
    h1: 'Unlock a Password-Protected PDF Online',
    h2s: [
      'Remove a PDF password you already know',
      'What the unlock process actually does',
      'Legitimate reasons to unlock a PDF',
      'Important limits and privacy',
    ],
    paragraphs: [
      `Unlock PDF removes password protection from a document when you can supply the password. You enter it once and the tool produces a copy that opens without a prompt. That is useful when you handle the same statement or report repeatedly, or when another tool refuses encrypted files. This is not a password cracker. It does not guess, bypass or break passwords, and without the correct one it cannot open the file.`,
      `The document is opened in your browser with the password you provide. Each page is then rendered and rebuilt into a new, unprotected PDF. Because pages are drawn rather than copied, restrictions on printing or copying attached to the original do not carry across, and the output is made of page images. The text looks the same but can no longer be selected, copied or searched. Up to 400 pages are supported in one run.`,
      `Typical reasons include removing the password from your own bank or utility statements before archiving them, preparing a file for software that cannot read encrypted PDFs, sharing a document with a colleague who would otherwise need the password, and removing friction from a file you protected yourself. If a document was restricted by someone else, make sure you have the right or permission to remove its protection.`,
      `Because the result is image-based, run OCR PDF afterwards if you need selectable, searchable text again. The file may also be larger than the original, and Compress PDF can help with that. Very long documents take time and memory because every page must be rendered. If the tool reports a wrong password, check capitalisation and keyboard layout, since PDF passwords are case-sensitive. Your file and password are handled in your browser and are not uploaded to our servers.`,
    ],
    steps: [
      'Add the protected PDF by dragging it in or clicking the upload area.',
      'Type the password that opens the file.',
      'Press the run button and wait for each page to be rebuilt.',
      'Download the unlocked PDF, and run OCR PDF if you need selectable text.',
    ],
    faqs: [
      { q: 'Can this crack a PDF if I forgot the password?', a: 'No. You must supply the correct password. The tool does not guess, bypass or crack passwords.' },
      { q: 'Why is the text not selectable afterwards?', a: 'Pages are rebuilt as images to produce a clean copy. Use OCR PDF to make the text searchable again.' },
      { q: 'Why is the unlocked file larger than the original?', a: 'Image-based pages usually take more space than the original text and vector content. Compress PDF can reduce the size.' },
      { q: 'Is it acceptable to unlock any PDF?', a: 'Removing protection from your own files is fine. For files owned by others, you need permission, and the rules vary by country. We cannot give legal advice.' },
      uploadFaq('Unlock PDF'),
    ],
    keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf', 'unlock pdf with password', 'remove password from pdf online'],
  },
};

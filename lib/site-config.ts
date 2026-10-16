export const siteConfig = {
  name: "PDF Lovers Pro",
  shortName: "PDF Lovers",
  legalEntity: "PDF Lovers Pro",
  url: "https://pdflovers.com",
  ogImage: "https://pdflovers.com/og-image.png",
  description:
    "PDF Lovers Pro offers free, private PDF tools that run 100% inside your browser using WebAssembly. Merge, split, compress, and convert PDFs with zero uploads, zero servers, and zero data collection.",
  keywords: [
    "PDF tools",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF to Word",
    "client-side PDF editor",
    "private PDF tools",
    "WebAssembly PDF",
    "free PDF converter",
    "no upload PDF tool",
  ],
  googleSiteVerification: "pwyfdDe7eDVI1cMvuebKjXMzJ6kFspOCtUPX7aDskuI",
  founder: {
    name: "Hassan Asghar",
    title: "Founder & Lead Architect",
    email: "hassanasghar7868686@gmail.com",
    phoneDisplay: "+92 345 1098607",
    phoneRaw: "00923451098607",
    whatsapp: "https://wa.me/923451098607",
  },
  social: {
    twitter: "@pdfloverspro",
  },
  dateFounded: "2024-01-15",
  jurisdiction: "Islamic Republic of Pakistan",
} as const;

export const toolRoutes = [
  {
    slug: "merge-pdf",
    title: "Merge PDF",
    description:
      "Combine multiple PDF files into a single document, entirely in your browser.",
  },
  {
    slug: "split-pdf",
    title: "Split PDF",
    description:
      "Extract or separate pages from a PDF file without uploading anything.",
  },
  {
    slug: "compress-pdf",
    title: "Compress PDF",
    description:
      "Reduce PDF file size locally on your device for faster sharing.",
  },
  {
    slug: "pdf-to-word",
    title: "PDF to Word",
    description:
      "Convert PDF documents into editable Word files with full client-side privacy.",
  },
] as const;

export const legalRoutes = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-and-conditions", title: "Terms & Conditions" },
  { slug: "dmca-notice", title: "DMCA Notice" },
  { slug: "about-us", title: "About Us" },
  { slug: "contact-us", title: "Contact Us" },
] as const;

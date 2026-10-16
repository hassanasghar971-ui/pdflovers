import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import MergeTool from "./MergeTool";

export const metadata: Metadata = {
  title: "Merge PDF Files Online — Free & Private",
  description:
    "Combine multiple PDF files into one document instantly, 100% in your browser. No uploads, no sign-up, completely free.",
  alternates: { canonical: `${siteConfig.url}/merge-pdf` },
};

export default function MergePdfPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Merge PDF Files Online for Free",
    step: [
      { "@type": "HowToStep", text: "Click 'Select Files' and choose two or more PDF files from your device." },
      { "@type": "HowToStep", text: "Reorder files if needed by dragging them into the desired sequence." },
      { "@type": "HowToStep", text: "Click 'Merge PDFs' — processing happens instantly in your browser." },
      { "@type": "HowToStep", text: "Download your merged PDF file." },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
        Merge PDF Files
      </h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        Combine multiple PDFs into a single document — processed entirely in
        your browser. Your files are never uploaded anywhere.
      </p>

      <MergeTool />

      <section className="prose prose-slate mt-16 max-w-none dark:prose-invert">
        <h2>How It Works</h2>
        <ol>
          <li>Select two or more PDF files from your device.</li>
          <li>We load each file locally using the open-source <code>pdf-lib</code> library running in your browser.</li>
          <li>Pages are combined in order into a single new PDF document.</li>
          <li>The merged file is generated and offered to you as a direct download — it never touches a server.</li>
        </ol>

        <h2>Is It Safe to Merge Confidential PDFs Here?</h2>
        <p>
          Yes. Because processing happens entirely client-side via
          WebAssembly/JavaScript, your confidential documents are never
          transmitted over the network. You can verify this yourself by
          opening your browser's Network tab — you'll see no file upload
          requests occur during merging.
        </p>

        <h2>Frequently Asked Questions</h2>
        <h3>Is there a file size or page limit?</h3>
        <p>
          Limits depend on your device's available memory rather than any
          artificial restriction we impose, since processing occurs locally.
        </p>
        <h3>Do I need to create an account?</h3>
        <p>No account or registration is required to use this tool.</p>
      </section>
    </div>
  );
}

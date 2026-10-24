import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Gavel } from "lucide-react";

const SITE_URL = "https://pdflovers.com";
const LAST_UPDATED = "January 15, 2025";

export const metadata: Metadata = {
  title: "DMCA Notice",
  description:
    "PDF Lovers Pro DMCA copyright policy and takedown notice procedure. Learn how to file a copyright infringement claim.",
  alternates: { canonical: `${SITE_URL}/dmca-notice` },
};

export default function DmcaNoticePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-red-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          DMCA Notice
        </span>
      </nav>

      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
          <Gavel size={24} />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            DMCA Notice &amp; Copyright Policy
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <article className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-red-600">
        <p>
          PDF Lovers Pro, operated by Hassan Asghar, respects the
          intellectual property rights of others and expects its users to do
          the same. We respond to notices of alleged copyright infringement
          that comply with the Digital Millennium Copyright Act of 1998
          ("DMCA") and similar international copyright laws.
        </p>

        <h2>1. Important Context: Client-Side Architecture</h2>
        <p>
          It is important to understand that PDF Lovers Pro does not host,
          store, index, or have any access to files that users process using
          our tools. Every PDF, image, Word, or Excel file you process is
          handled entirely within your own browser's local memory using
          WebAssembly technology and is never transmitted to, uploaded to, or
          stored on our servers. As a result, we have no technical ability
          to access, view, remove, or host any user-generated or
          user-uploaded content, because no such content ever reaches our
          infrastructure.
        </p>
        <p>
          This DMCA policy therefore primarily applies to original content
          published directly on the PDF Lovers Pro website itself, such as
          our blog articles, tool descriptions, graphics, logos, and other
          creative assets we have authored or licensed.
        </p>

        <h2>2. Filing a DMCA Takedown Notice</h2>
        <p>
          If you believe that content published directly on pdflovers.com
          (not content processed through our client-side tools) infringes
          your copyright, please submit a written notice containing the
          following information to our designated agent listed below:
        </p>
        <ul>
          <li>
            A physical or electronic signature of the copyright owner or a
            person authorized to act on their behalf
          </li>
          <li>
            Identification of the copyrighted work claimed to have been
            infringed
          </li>
          <li>
            Identification of the material that is claimed to be infringing,
            including the specific URL on pdflovers.com where the material
            is located
          </li>
          <li>
            Your contact information, including your address, telephone
            number, and email address
          </li>
          <li>
            A statement that you have a good-faith belief that the disputed
            use is not authorized by the copyright owner, its agent, or the
            law
          </li>
          <li>
            A statement, made under penalty of perjury, that the above
            information is accurate and that you are the copyright owner or
            authorized to act on the copyright owner's behalf
          </li>
        </ul>

        <h2>3. Designated Agent for Copyright Notices</h2>
        <p>Please send DMCA notices to our designated agent:</p>
        <ul>
          <li>
            <strong>Name:</strong> Hassan Asghar
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:hassanasghar7868686@gmail.com">
              hassanasghar7868686@gmail.com
            </a>
          </li>
          <li>
            <strong>Phone / WhatsApp:</strong> +92 345 1098607
          </li>
        </ul>

        <h2>4. Counter-Notification</h2>
        <p>
          If you believe that content you posted or that was identified as
          infringing was removed or disabled by mistake or misidentification,
          you may submit a counter-notification containing:
        </p>
        <ul>
          <li>Your physical or electronic signature</li>
          <li>
            Identification of the material that was removed and its location
            before removal
          </li>
          <li>
            A statement under penalty of perjury that you have a good-faith
            belief the material was removed as a result of mistake or
            misidentification
          </li>
          <li>Your name, address, telephone number, and consent to jurisdiction</li>
        </ul>

        <h2>5. Repeat Infringer Policy</h2>
        <p>
          In appropriate circumstances, PDF Lovers Pro reserves the right to
          restrict or terminate access to the Site for users who are found to
          repeatedly infringe the intellectual property rights of others
          through content they publish or link to in connection with our
          Site.
        </p>

        <h2>6. False Claims</h2>
        <p>
          Please note that under Section 512(f) of the DMCA, any person who
          knowingly materially misrepresents that material is infringing may
          be subject to liability for damages. Please ensure the accuracy of
          your claims before submitting a notice.
        </p>
      </article>
    </main>
  );
}

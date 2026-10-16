import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about PDF Lovers Pro's mission to deliver private, zero-server PDF tools, and meet founder Hassan Asghar.",
  alternates: { canonical: `${siteConfig.url}/about-us` },
};

export default function AboutUsPage() {
  return (
    <LegalLayout title="About PDF Lovers Pro" lastUpdated="June 1, 2024">
      <h2>Our Story</h2>
      <p>
        {siteConfig.legalEntity} was founded on a simple but radical idea:
        your documents are yours alone, and no PDF tool should require you to
        hand them over to a stranger's server just to merge, split, or
        compress a file. Too many "free" PDF websites quietly upload your
        files to remote servers, retain copies indefinitely, and monetize your
        data. We built {siteConfig.shortName} to be the opposite of that.
      </p>

      <h2>Our Mission</h2>
      <p>
        Our mission is to make professional-grade PDF tools universally
        accessible, completely private, and genuinely free — by processing
        every single operation locally, inside your own browser, using modern
        WebAssembly technology. No uploads. No waiting on server queues. No
        privacy trade-offs.
      </p>

      <h2>The Zero-Server Philosophy</h2>
      <p>
        Every tool on {siteConfig.url} — from merging PDFs to compressing
        large files — runs entirely on your device's CPU via WebAssembly
        modules delivered as static assets. We do not operate a database. We
        do not operate file-storage servers. We do not require sign-ups. This
        isn't just a marketing claim — it's an architectural constraint we
        designed the entire product around, verifiable by inspecting network
        activity in your browser's developer tools.
      </p>

      <h2>Meet the Founder</h2>
      <p>
        <strong>Hassan Asghar</strong> is the Founder and Lead Architect of
        {" "}{siteConfig.legalEntity}. With a background in full-stack web
        engineering and a strong focus on performance, security, and user
        privacy, Hassan set out to build a PDF utility platform that puts
        users first — eliminating the hidden server-side data handling common
        across the PDF tools industry. Hassan personally oversees the
        product's architecture, security posture, and compliance with global
        privacy regulations including GDPR and CCPA.
      </p>
      <p>
        You can reach Hassan directly at{" "}
        <a href={`mailto:${siteConfig.founder.email}`}>{siteConfig.founder.email}</a>{" "}
        or via WhatsApp at{" "}
        <a href={siteConfig.founder.whatsapp}>{siteConfig.founder.phoneDisplay}</a>.
      </p>

      <h2>Our Values</h2>
      <ul>
        <li><strong>Privacy by Design</strong> — your files never leave your device;</li>
        <li><strong>Radical Transparency</strong> — our architecture and policies are documented openly;</li>
        <li><strong>Accessibility</strong> — core tools remain free, with no artificial limits designed to force payment;</li>
        <li><strong>Performance</strong> — WebAssembly-powered processing is often faster than round-tripping files to a remote server;</li>
        <li><strong>Security</strong> — hardened CSP, HSTS, and anti-tampering headers protect every visitor.</li>
      </ul>

      <h2>Our Technology</h2>
      <p>
        {siteConfig.shortName} is built on Next.js, deployed on Vercel's global
        edge network, and uses WebAssembly-compiled PDF engines to perform
        document operations client-side. This stack allows us to deliver a
        fast, reliable, installable Progressive Web App (PWA) experience
        without maintaining any backend infrastructure that touches your
        documents.
      </p>

      <h2>Trust &amp; Transparency</h2>
      <p>
        We publish detailed{" "}
        <a href="/privacy-policy">Privacy Policy</a>,{" "}
        <a href="/terms-and-conditions">Terms and Conditions</a>, and{" "}
        <a href="/dmca-notice">DMCA Notice</a> pages so that users,
        regulators, and advertising partners can independently verify our
        data-handling commitments at any time.
      </p>

      <h2>Get in Touch</h2>
      <p>
        Have feedback, a feature request, or a business inquiry? Visit our{" "}
        <a href="/contact-us">Contact Us</a> page or reach out directly to
        {" "}{siteConfig.founder.name} at{" "}
        <a href={`mailto:${siteConfig.founder.email}`}>{siteConfig.founder.email}</a>.
      </p>
    </LegalLayout>
  );
}

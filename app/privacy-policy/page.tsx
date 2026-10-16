import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/legal/LegalLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how PDF Lovers Pro protects your privacy with a zero-server, zero-upload architecture. GDPR, CCPA, and DART cookie compliant.",
  alternates: { canonical: `${siteConfig.url}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="June 1, 2024">
      <h2>1. Introduction</h2>
      <p>
        Welcome to <strong>{siteConfig.legalEntity}</strong> ("{siteConfig.name}",
        "we," "us," or "our"), accessible at{" "}
        <Link href={siteConfig.url}>{siteConfig.url}</Link>. This Privacy Policy
        explains how we handle information in connection with your use of our
        website and PDF processing tools (collectively, the "Service"). This
        policy is designed to comply with the General Data Protection Regulation
        (GDPR), the California Consumer Privacy Act (CCPA) as amended by the
        California Privacy Rights Act (CPRA), the Children's Online Privacy
        Protection Act (COPPA), and Google AdSense program policies.
      </p>
      <p>
        By using {siteConfig.name}, you agree to the collection and use of
        information in accordance with this policy.
      </p>

      <h2>2. Our Core Privacy Promise: Zero-Server Architecture</h2>
      <p>
        {siteConfig.name} is built on a <strong>100% client-side, zero-server
        architecture</strong>. This is the single most important fact about our
        Service:
      </p>
      <ul>
        <li>
          <strong>Your files never leave your device.</strong> All PDF
          processing (merging, splitting, compressing, converting) is performed
          entirely within your web browser using WebAssembly (WASM) and
          JavaScript execution engines running locally on your computer or
          mobile device.
        </li>
        <li>
          <strong>We operate no backend file-storage servers.</strong> There is
          no database, no object storage bucket, and no server-side processing
          pipeline that ever receives, inspects, or retains the documents you
          work with.
        </li>
        <li>
          <strong>No file ever touches our infrastructure.</strong> Once you
          close or refresh your browser tab, any data held temporarily in your
          browser's memory for processing purposes is permanently and
          irreversibly discarded.
        </li>
      </ul>
      <p>
        This architecture means that, as a technical and practical matter, we
        are unable to access, view, copy, sell, or disclose the content of any
        document you process using our tools — because we never receive it in
        the first place.
      </p>

      <h2>3. Information We Do NOT Collect</h2>
      <p>We do not collect, store, transmit, or have access to:</p>
      <ul>
        <li>The content of any PDF, Word, image, or other file you process;</li>
        <li>File names, metadata, or document contents;</li>
        <li>Account credentials (we do not require account registration);</li>
        <li>Payment information (our core tools are provided free of charge);</li>
        <li>Precise geolocation data.</li>
      </ul>

      <h2>4. Information We May Collect</h2>
      <p>
        While we do not collect file content, we and our third-party service
        providers may automatically collect limited, non-identifying technical
        information when you visit our Service, including:
      </p>
      <ul>
        <li>
          <strong>Usage Data:</strong> pages visited, time spent, referring URL,
          browser type, operating system, and device type, typically collected
          via privacy-respecting analytics tools;
        </li>
        <li>
          <strong>Log Data:</strong> IP address (used transiently by our hosting
          provider for routing and security, and not linked to file content);
        </li>
        <li>
          <strong>Cookie Data:</strong> as described in Section 5 below.
        </li>
      </ul>

      <h2>5. Cookies, DART Cookies & Google AdSense</h2>
      <p>
        We use cookies and similar tracking technologies to operate and improve
        the Service, and to support advertising that keeps {siteConfig.name}{" "}
        free for everyone.
      </p>
      <h3>5.1 Google AdSense &amp; the DART Cookie</h3>
      <p>
        This Service may display advertisements served by Google, a third-party
        vendor. Google uses the <strong>DoubleClick DART cookie</strong> to
        serve ads based on a visitor's prior visits to this website and other
        websites across the internet. Google's use of the DART cookie enables
        it and its partners to serve ads based on your visit to our Service
        and/or other sites.
      </p>
      <p>
        You may opt out of the use of the DART cookie for interest-based
        advertising by visiting Google's Ads Settings at{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          adssettings.google.com
        </a>
        , or opt out of third-party vendor use of cookies by visiting{" "}
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
          www.aboutads.info/choices
        </a>
        .
      </p>
      <h3>5.2 Cookie Categories</h3>
      <ul>
        <li>
          <strong>Strictly Necessary Cookies:</strong> required for core
          functionality (e.g., remembering your cookie consent choice).
        </li>
        <li>
          <strong>Analytics Cookies:</strong> help us understand aggregate
          usage patterns (e.g., Google Analytics).
        </li>
        <li>
          <strong>Advertising Cookies:</strong> used by Google AdSense and its
          partners to serve relevant ads and measure ad performance.
        </li>
      </ul>
      <p>
        You can control or delete cookies at any time through your browser
        settings. Disabling cookies may affect certain features of the
        Service.
      </p>

      <h2>6. GDPR Rights (EU/EEA/UK Residents)</h2>
      <p>
        If you are located in the European Economic Area, the United Kingdom,
        or Switzerland, you have the following rights under the GDPR:
      </p>
      <ul>
        <li><strong>Right of Access</strong> — request confirmation of what limited data we hold about you;</li>
        <li><strong>Right to Rectification</strong> — correct inaccurate data;</li>
        <li><strong>Right to Erasure</strong> ("right to be forgotten");</li>
        <li><strong>Right to Restrict Processing</strong>;</li>
        <li><strong>Right to Data Portability</strong>;</li>
        <li><strong>Right to Object</strong> to processing, including for direct marketing or interest-based advertising;</li>
        <li><strong>Right to Withdraw Consent</strong> at any time;</li>
        <li><strong>Right to Lodge a Complaint</strong> with your local Data Protection Authority.</li>
      </ul>
      <p>
        Because we do not operate servers that store your file content or
        require account registration, the scope of personal data we hold is
        inherently minimal. To exercise any of the above rights regarding the
        limited analytics/technical data we may process, contact us using the
        details in Section 12.
      </p>

      <h2>7. CCPA / CPRA Rights (California Residents)</h2>
      <p>
        If you are a California resident, you have rights under the CCPA, as
        amended by the CPRA, including:
      </p>
      <ul>
        <li><strong>Right to Know</strong> what categories of personal information we collect and how it is used;</li>
        <li><strong>Right to Delete</strong> personal information we hold about you;</li>
        <li><strong>Right to Correct</strong> inaccurate personal information;</li>
        <li>
          <strong>Right to Opt-Out of Sale/Sharing</strong> — we do{" "}
          <strong>not</strong> sell or share your personal information for
          monetary or other valuable consideration, as defined by the CCPA;
        </li>
        <li><strong>Right to Non-Discrimination</strong> for exercising your privacy rights.</li>
      </ul>
      <p>
        To exercise these rights, email{" "}
        <a href={`mailto:${siteConfig.founder.email}`}>{siteConfig.founder.email}</a>{" "}
        with the subject line "CCPA Request." We will verify and respond within
        the statutory timeframe.
      </p>

      <h2>8. Children's Privacy (COPPA)</h2>
      <p>
        {siteConfig.name} is not directed at children under the age of 13, and
        we do not knowingly collect personal information from children under
        13. If we become aware that a child under 13 has provided us with
        personal information, we will take steps to delete such information.
      </p>

      <h2>9. Data Security</h2>
      <p>
        Because document content never leaves your browser, your files benefit
        from the strongest possible security posture: they are never exposed
        to network transmission interception, server breaches, or third-party
        access. Our website infrastructure (hosted on Vercel) additionally
        employs HTTPS/TLS encryption, strict Content Security Policy headers,
        HSTS, and other hardening measures described in our technical
        configuration.
      </p>

      <h2>10. Third-Party Service Providers</h2>
      <p>We rely on the following categories of third-party infrastructure providers:</p>
      <ul>
        <li><strong>Vercel Inc.</strong> — static hosting and edge network delivery;</li>
        <li><strong>Google Fonts</strong> — web font delivery;</li>
        <li><strong>Google Analytics</strong> — aggregate, anonymized usage analytics;</li>
        <li><strong>Google AdSense</strong> — contextual and interest-based advertising.</li>
      </ul>
      <p>
        Each provider maintains its own privacy policy governing data it
        processes on its own infrastructure.
      </p>

      <h2>11. International Data Transfers</h2>
      <p>
        Limited technical/analytics data described above may be processed on
        servers located outside your country of residence, including in the
        United States, by our infrastructure and analytics providers, who
        maintain appropriate safeguards (such as Standard Contractual Clauses)
        for cross-border data transfers.
      </p>

      <h2>12. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify
        users of material changes by updating the "Last Updated" date at the
        top of this page. Continued use of the Service after changes
        constitutes acceptance of the revised policy.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        For privacy-related questions, data subject requests, or concerns,
        please contact:
      </p>
      <ul>
        <li><strong>Data Controller:</strong> {siteConfig.founder.name}, Founder, {siteConfig.legalEntity}</li>
        <li><strong>Email:</strong> <a href={`mailto:${siteConfig.founder.email}`}>{siteConfig.founder.email}</a></li>
        <li><strong>WhatsApp/Phone:</strong> <a href={siteConfig.founder.whatsapp}>{siteConfig.founder.phoneDisplay}</a></li>
      </ul>
    </LegalLayout>
  );
}

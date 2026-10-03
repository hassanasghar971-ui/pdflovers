import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PDF Lovers Privacy Policy — how we handle data for our 100% client-side PDF tools.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-secondary">Last updated: January 2026</p>

      <div className="glass-card mt-6 space-y-6 rounded-3xl p-7 text-sm leading-relaxed text-secondary">
        <section>
          <h2 className="text-base font-semibold text-current">1. No file uploads</h2>
          <p className="mt-2">
            PDF Lovers processes every document entirely within your own browser using client-side JavaScript and
            WebAssembly (pdf-lib, pdf.js and related libraries). The files you choose to merge, split, convert, sign or
            protect are never transmitted to, stored on, or processed by our servers.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">2. Information we may collect</h2>
          <p className="mt-2">
            We may collect standard, non-identifying analytics information (such as pages visited, device/browser
            type, and approximate location derived from IP address) to understand usage trends and improve the
            service. This data is aggregated and is not linked to the content of any document you process.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">3. Cookies & advertising</h2>
          <p className="mt-2">
            We use third-party advertising partners, including Google AdSense and Adsterra, which may use cookies or
            similar technologies to serve relevant ads. These partners may collect data as described in their own
            privacy policies. You can control cookie preferences through your browser settings or via Google&apos;s Ad
            Settings.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">4. GDPR & your rights</h2>
          <p className="mt-2">
            If you are located in the European Economic Area, you have the right to access, correct, or delete any
            personal data we may hold, and the right to object to or restrict processing. Since document content never
            leaves your device, the vast majority of your data is never in our possession. For requests regarding
            analytics or advertising data, contact us using the details below.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">5. Children&apos;s privacy</h2>
          <p className="mt-2">PDF Lovers is not directed at children under 13 and we do not knowingly collect data from them.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">6. Changes to this policy</h2>
          <p className="mt-2">We may update this Privacy Policy periodically. Continued use of the site constitutes acceptance of any changes.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">7. Contact</h2>
          <p className="mt-2">
            Questions about this policy? Email{" "}
            <a className="text-violet-500 hover:underline" href="mailto:hassanasghar7868686@gmail.com">
              hassanasghar7868686@gmail.com
            </a>{" "}
            or WhatsApp 00923451098607.
          </p>
        </section>
      </div>
    </div>
  );
}

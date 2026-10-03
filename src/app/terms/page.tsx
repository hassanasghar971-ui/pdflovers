import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of PDF Lovers' free online PDF tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Terms of Service</h1>
      <p className="mt-2 text-sm text-secondary">Last updated: January 2026</p>

      <div className="glass-card mt-6 space-y-6 rounded-3xl p-7 text-sm leading-relaxed text-secondary">
        <section>
          <h2 className="text-base font-semibold text-current">1. Acceptance of terms</h2>
          <p className="mt-2">By accessing or using PDF Lovers (the &quot;Service&quot;), you agree to be bound by these Terms of Service.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">2. Description of service</h2>
          <p className="mt-2">
            PDF Lovers provides free, browser-based tools for viewing, creating and modifying PDF and related document
            files. All processing occurs locally within your browser; we do not take ownership of, or responsibility
            for, the content of files you process.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">3. Acceptable use</h2>
          <p className="mt-2">
            You agree not to use PDF Lovers for any unlawful purpose, including processing content you do not have the
            right to use, or attempting to circumvent protections on documents you do not own or have permission to
            modify.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">4. No warranty</h2>
          <p className="mt-2">
            The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not
            guarantee that any tool will be error-free, uninterrupted, or produce a specific result for every file.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">5. Limitation of liability</h2>
          <p className="mt-2">
            To the fullest extent permitted by law, PDF Lovers and its owner shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Service, including data loss.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">6. Advertising</h2>
          <p className="mt-2">
            The Service is supported by third-party advertising (including Google AdSense and Adsterra). We are not
            responsible for the content of third-party advertisements.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">7. Changes</h2>
          <p className="mt-2">We may revise these Terms at any time. Continued use after changes constitutes acceptance of the revised Terms.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">8. Contact</h2>
          <p className="mt-2">
            Questions about these Terms? Email{" "}
            <a className="text-violet-500 hover:underline" href="mailto:hassanasghar7868686@gmail.com">
              hassanasghar7868686@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for PDF Lovers' free, client-side PDF tools.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Disclaimer</h1>
      <div className="glass-card mt-6 space-y-6 rounded-3xl p-7 text-sm leading-relaxed text-secondary">
        <section>
          <h2 className="text-base font-semibold text-current">General information</h2>
          <p className="mt-2">
            The tools and information provided on PDF Lovers are for general purposes only. While we strive to keep
            every tool accurate and reliable, we make no representations or warranties of any kind, express or
            implied, about the completeness, accuracy, reliability or suitability of the Service for any purpose.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">File processing accuracy</h2>
          <p className="mt-2">
            Some tools (such as document conversions) simplify complex formatting during conversion. Always review
            output files before relying on them for critical or legal purposes. For Protect/Unlock PDF tools, always
            retain a backup of your original file.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">Third-party advertising</h2>
          <p className="mt-2">
            PDF Lovers displays advertisements from third-party networks, including Google AdSense and Adsterra. We do
            not endorse and are not responsible for the products, services or content advertised by these networks.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">External links</h2>
          <p className="mt-2">Our site may link to external websites. We have no control over and assume no responsibility for the content of third-party sites.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-current">Contact</h2>
          <p className="mt-2">
            Questions? Email{" "}
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

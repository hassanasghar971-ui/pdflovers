import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about PDF Lovers — 42 free, privacy-first PDF tools built and maintained by Hassan Asghar.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">About PDF Lovers</h1>
      <div className="glass-card mt-6 space-y-4 rounded-3xl p-7 text-sm leading-relaxed text-secondary">
        <p>
          <strong className="text-current">PDF Lovers</strong> was built on a simple idea: everyday PDF tasks — merging,
          splitting, converting, signing, protecting — shouldn&apos;t require uploading your private documents to a
          stranger&apos;s server. Every one of our 42 tools runs entirely inside your browser using modern web
          technology (WebAssembly and JavaScript), so your files never leave your device.
        </p>
        <p>
          The platform is designed and maintained by <strong className="text-current">Hassan Asghar</strong>, Owner
          &amp; Lead Architect, who set out to make PDF Lovers the fastest, most reliable, and most beautiful free PDF
          toolkit on the web — with a glassmorphic interface, instant multi-theme switching, and zero sign-up friction.
        </p>
        <p>
          We believe great tools should be fast, private and accessible to everyone, everywhere, on any device. That
          philosophy drives every decision we make — from our 100% client-side architecture to our commitment to
          keeping every tool free.
        </p>
        <p>
          Have feedback, a feature request, or just want to say hello? Visit our{" "}
          <a className="text-violet-500 hover:underline" href="/contact">
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}

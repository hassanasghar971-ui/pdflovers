import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  Cpu,
  Globe2,
  Target,
  Users,
} from "lucide-react";

const SITE_URL = "https://pdflovers.com";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about PDF Lovers Pro, founded by Hassan Asghar — a privacy-first, 100% client-side WebAssembly PDF toolkit built for speed, security, and trust.",
  alternates: { canonical: `${SITE_URL}/about-us` },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Every tool we build is architected to run entirely in your browser. We never see, store, or transmit your files — by design, not by policy alone.",
  },
  {
    icon: Zap,
    title: "Performance Obsessed",
    description:
      "We leverage WebAssembly-compiled libraries to deliver near-native processing speeds, so you never wait in an upload queue again.",
  },
  {
    icon: Cpu,
    title: "Engineering Excellence",
    description:
      "From memory-safe canvas purging to self-healing garbage collection routines, every line of code is written to prevent crashes and leaks.",
  },
  {
    icon: Globe2,
    title: "Accessible to Everyone",
    description:
      "No sign-ups, no paywalls, no hidden limits. We believe essential document tools should be free and available to anyone, anywhere.",
  },
];

export default function AboutUsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-red-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          About Us
        </span>
      </nav>

      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          About PDF Lovers Pro
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          We are on a mission to make document management effortless, private,
          and completely free — by rethinking how PDF tools should work in a
          world that values your data.
        </p>
      </div>

      <section className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
            Our Story
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            <p>
              PDF Lovers Pro was founded by{" "}
              <strong className="text-zinc-800 dark:text-zinc-200">
                Hassan Asghar
              </strong>
              , a full-stack architect who grew frustrated with the
              traditional online PDF tool landscape — services that required
              uploading sensitive personal and business documents to unknown
              third-party servers, often behind paywalls, with no transparency
              about how that data was stored, used, or deleted.
            </p>
            <p>
              Determined to build something fundamentally different, Hassan
              set out to prove that modern browsers equipped with
              WebAssembly were powerful enough to handle complex PDF
              operations — merging, splitting, compressing, converting, and
              even AI-powered OCR text recognition — entirely on the client
              side, without ever touching a server.
            </p>
            <p>
              The result is PDF Lovers Pro: a collection of 42+ production-
              grade tools built on an optimized WebAssembly engine, wrapped in
              a fast, beautiful, ad-supported interface that remains
              completely free for everyone, forever.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-red-50 to-white p-8 dark:border-zinc-800 dark:from-red-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-2xl font-bold text-white">
              HA
            </span>
            <div>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                Hassan Asghar
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Lead Architect &amp; Founder
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            "I believe privacy shouldn't be a premium feature. Every tool on
            PDF Lovers Pro was built to prove that powerful software can
            respect your data by never asking for it in the first place."
          </p>
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            What We Stand For
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
                  <Icon size={20} />
                </span>
                <h3 className="mb-1.5 text-base font-semibold text-zinc-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Target className="mx-auto mb-3 text-red-600" size={24} />
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            42+
          </p>
          <p className="text-sm text-zinc-500">Fully Working PDF Tools</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <ShieldCheck className="mx-auto mb-3 text-red-600" size={24} />
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            0
          </p>
          <p className="text-sm text-zinc-500">Files Ever Stored on Servers</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <Users className="mx-auto mb-3 text-red-600" size={24} />
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            100%
          </p>
          <p className="text-sm text-zinc-500">Free, Forever, No Sign-Up</p>
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">
          Want to get in touch?
        </h2>
        <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
          We'd love to hear your feedback, feature requests, or partnership
          inquiries.
        </p>
        <Link
          href="/contact-us"
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Contact Us
        </Link>
      </section>
    </main>
  );
}

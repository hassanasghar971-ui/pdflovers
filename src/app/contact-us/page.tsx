import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Mail, MessageCircle, Clock, MapPin } from "lucide-react";
import ContactForm from "@/components/contact-form";

const SITE_URL = "https://pdflovers.com";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the PDF Lovers Pro team. Reach out via email or WhatsApp for support, feedback, or partnership inquiries.",
  alternates: { canonical: `${SITE_URL}/contact-us` },
};

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email Us",
    value: "hassanasghar7868686@gmail.com",
    href: "mailto:hassanasghar7868686@gmail.com",
  },
  {
    icon: MessageCircle,
    title: "Primary WhatsApp",
    value: "+92 345 1098607",
    href: "https://wa.me/923451098607",
  },
  {
    icon: MessageCircle,
    title: "Support WhatsApp",
    value: "+92 300 4977264",
    href: "https://wa.me/923004977264",
  },
  {
    icon: Clock,
    title: "Response Time",
    value: "Usually within 24–48 hours",
    href: null,
  },
];

export default function ContactUsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-red-600">
          Home
        </Link>
        <ChevronRight size={12} />
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Contact Us
        </span>
      </nav>

      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          Have a question, found a bug, or want to suggest a new PDF tool?
          We'd love to hear from you. Reach out through any channel below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {CONTACT_METHODS.map((method) => {
              const Icon = method.icon;
              const content = (
                <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-red-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-900/50">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
                    <Icon size={19} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {method.title}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {method.value}
                    </p>
                  </div>
                </div>
              );
              return method.href ? (
                <a
                  key={method.title}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    method.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <div key={method.title}>{content}</div>
              );
            })}

            <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
                <MapPin size={19} />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Operating From
                </p>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  Pakistan — Serving users worldwide, 100% remote-first
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}

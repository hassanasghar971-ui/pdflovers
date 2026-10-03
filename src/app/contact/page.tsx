import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the PDF Lovers team — email or WhatsApp Hassan Asghar, Owner & Lead Architect.",
  alternates: { canonical: "/contact" },
};

const channels = [
  {
    label: "Email",
    value: "hassanasghar7868686@gmail.com",
    href: "mailto:hassanasghar7868686@gmail.com",
    icon: "✉️",
  },
  {
    label: "WhatsApp (Primary)",
    value: "00923451098607",
    href: "https://wa.me/923451098607",
    icon: "💬",
  },
  {
    label: "WhatsApp (Secondary)",
    value: "00923497726469",
    href: "https://wa.me/923497726469",
    icon: "💬",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold">Contact Us</h1>
      <p className="mt-3 text-secondary">
        Questions, feedback, partnership ideas, or need help with a tool? Reach out any time — we usually respond
        within 24 hours.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {channels.map((c) => (
          <a key={c.label} href={c.href} className="glass-card hover-lift rounded-3xl p-6 text-center">
            <span className="text-3xl">{c.icon}</span>
            <p className="mt-3 text-sm font-semibold">{c.label}</p>
            <p className="mt-1 break-words text-sm text-secondary">{c.value}</p>
          </a>
        ))}
      </div>

      <div className="glass-card mt-8 rounded-3xl p-7 text-sm leading-relaxed text-secondary">
        <p>
          <strong className="text-current">Hassan Asghar</strong> — Owner &amp; Lead Architect of PDF Lovers, personally
          oversees support and product direction. For business inquiries, please use email for the fastest, most
          detailed response.
        </p>
      </div>
    </div>
  );
}

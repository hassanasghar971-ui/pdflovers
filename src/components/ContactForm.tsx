"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { OWNER_EMAIL, OWNER_WHATSAPP_LINK } from "@/lib/constants";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(
      subject || "Support Request - PDF Lovers Pro"
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Your Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="John Doe" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Your Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="john@example.com" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input" placeholder="e.g. Bug report on Merge PDF tool" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Message</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input resize-none"
          placeholder="Tell us how we can help..."
        />
      </div>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#DC2626] px-6 py-3 font-semibold text-white shadow-lg shadow-red-600/30 transition-transform hover:scale-[1.02]"
      >
        <Send className="h-4 w-4" /> Send via Email
      </button>
      <a
        href={OWNER_WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-[#DC2626] px-6 py-3 font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626] hover:text-white"
      >
        <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
      </a>
    </form>
  );
}

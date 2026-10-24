"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const DESTINATION_EMAIL = "hassanasghar7868686@gmail.com";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const mailSubject = encodeURIComponent(
      subject.trim() || "New Contact Form Message - PDF Lovers Pro"
    );
    const mailBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${DESTINATION_EMAIL}?subject=${mailSubject}&body=${mailBody}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-10 text-center dark:border-green-900/40 dark:bg-green-950/20">
        <CheckCircle2 size={32} className="text-green-600 dark:text-green-500" />
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
          Your email client should now be opening
        </h3>
        <p className="text-sm text-green-700 dark:text-green-500">
          If it didn't open automatically, please email us directly at{" "}
          <a href={`mailto:${DESTINATION_EMAIL}`} className="underline">
            {DESTINATION_EMAIL}
          </a>
          .
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm font-medium text-green-700 underline dark:text-green-400"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            Your Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-ring w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            Your Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="focus-ring w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          placeholder="How can we help?"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-200"
        >
          Message
        </label>
        <textarea
          id="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="focus-ring w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          placeholder="Tell us what's on your mind..."
        />
      </div>

      <button
        type="submit"
        className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        <Send size={16} /> Send Message
      </button>
      <p className="text-center text-xs text-zinc-400">
        This form opens your default email client — we have no backend
        servers that store your message.
      </p>
    </form>
  );
}

"use client";
import { useState } from "react";
import type { EngineResult } from "@/lib/engine/utils";
import { downloadBlob } from "@/lib/engine/utils";

export default function ResultPanel({ result, toolName }: { result: EngineResult; toolName: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      if (result.kind === "file") {
        const file = new File([result.blob], result.filename, { type: result.blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: result.filename });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: toolName, text: `Processed with ${toolName} on PDF Lovers`, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share — ignore */
    }
  }

  async function handleCopy() {
    try {
      if (result.kind === "text") {
        await navigator.clipboard.writeText(result.text);
      } else if (result.kind === "info") {
        await navigator.clipboard.writeText(result.rows.map((r) => `${r.label}: ${r.value}`).join("\n"));
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked — ignore */
    }
  }

  return (
    <div className="glass-card-strong animate-shimmer rounded-3xl bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-xl text-emerald-500">✔</span>
        <div>
          <h3 className="font-semibold">All done!</h3>
          <p className="text-sm text-secondary">
            {result.kind === "file" && `${result.filename} is ready.`}
            {result.kind === "text" && "Your text output is ready."}
            {result.kind === "info" && "Here's what we found in your PDF."}
          </p>
        </div>
      </div>

      {result.kind === "info" && (
        <dl className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {result.rows.map((r) => (
            <div key={r.label} className="glass-card rounded-xl px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-secondary">{r.label}</dt>
              <dd className="mt-0.5 break-words font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {result.kind === "text" && (
        <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/5 p-4 text-xs leading-relaxed dark:bg-white/5">
          {result.text}
        </pre>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {result.kind === "file" && (
          <button
            onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            ⬇ Download {result.filename}
          </button>
        )}
        {result.kind === "text" && (
          <button
            onClick={() => downloadBlob(new Blob([result.text], { type: "text/plain" }), result.filename)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            ⬇ Download {result.filename}
          </button>
        )}
        <button onClick={handleCopy} className="glass-pill rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03]">
          {copied ? "Copied ✔" : "📋 Copy"}
        </button>
        <button onClick={handleShare} className="glass-pill rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03]">
          🔗 Share
        </button>
      </div>
    </div>
  );
}

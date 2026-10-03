"use client";
import { useMemo, useState } from "react";
import type { ToolDef } from "@/lib/tools";
import FileDropzone from "./FileDropzone";
import FieldRenderer from "./FieldRenderer";
import SignaturePad from "./SignaturePad";
import RedactEditor from "./RedactEditor";
import ResultPanel from "./ResultPanel";
import type { EngineResult } from "@/lib/engine/utils";
import { runTool } from "@/lib/engine/dispatch";

type Values = Record<string, string | number | boolean>;

export default function ToolRunner({ tool }: { tool: ToolDef }) {
  const [files, setFiles] = useState<File[]>([]);
  const [secondaryFiles, setSecondaryFiles] = useState<File[]>([]);
  const [values, setValues] = useState<Values>(() => {
    const init: Values = {};
    tool.fields?.forEach((f) => {
      init[f.key] = f.defaultValue ?? (f.type === "checkbox" ? false : "");
    });
    return init;
  });
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EngineResult | null>(null);

  const isTwoPdf = tool.inputKind === "two-pdf";
  const isHtml = tool.inputKind === "html";
  const needsFile = !isHtml;

  const canRun = useMemo(() => {
    if (tool.slug === "html-to-pdf") return String(values.html || "").trim().length > 0;
    if (isTwoPdf) return files.length >= 1 && secondaryFiles.length >= 1;
    if (tool.inputKind === "multi-pdf") return files.length >= 2;
    if (tool.inputKind === "images") return files.length >= 1;
    if (tool.slug === "add-stamp") return files.length >= 1 && secondaryFiles.length >= 1;
    if (tool.slug === "sign-pdf") return files.length >= 1 && Boolean(signatureDataUrl);
    if (tool.slug === "redact-pdf") return files.length >= 1 && Boolean(values.boxesJson);
    return needsFile ? files.length >= 1 : true;
  }, [tool, files, secondaryFiles, signatureDataUrl, values, isTwoPdf, needsFile]);

  async function handleRun() {
    setError(null);
    setResult(null);
    setLoading(true);
    setProgress(null);
    try {
      const allFiles = isTwoPdf ? [...files, ...secondaryFiles] : tool.slug === "add-stamp" ? [...files, ...secondaryFiles] : files;
      const finalValues: Values = { ...values };
      if (signatureDataUrl) finalValues.signatureDataUrl = signatureDataUrl;
      const res = await runTool({
        slug: tool.slug,
        files: allFiles,
        values: finalValues,
        onProgress: (msg) => setProgress(msg),
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong while processing your file.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  function setField(key: string, v: string | number | boolean) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <div className="space-y-6">
      {needsFile && tool.slug !== "redact-pdf" && (
        <FileDropzone
          accept={tool.accept}
          multiple={tool.multiple}
          files={files}
          onChange={setFiles}
          label={
            tool.inputKind === "multi-pdf"
              ? "Drag & drop two or more PDFs here"
              : tool.inputKind === "images"
              ? "Drag & drop images here"
              : undefined
          }
        />
      )}

      {tool.slug === "redact-pdf" && (
        <FileDropzone accept={tool.accept} files={files} onChange={setFiles} />
      )}
      {tool.slug === "redact-pdf" && files[0] && (
        <RedactEditor file={files[0]} onChange={(boxes) => setField("boxesJson", JSON.stringify(boxes))} />
      )}

      {isTwoPdf && (
        <div>
          <p className="mb-2 text-sm font-medium text-secondary">Second PDF to compare</p>
          <FileDropzone accept={tool.accept} files={secondaryFiles} onChange={setSecondaryFiles} />
        </div>
      )}

      {tool.slug === "add-stamp" && (
        <div>
          <p className="mb-2 text-sm font-medium text-secondary">Stamp / logo image (JPG or PNG)</p>
          <FileDropzone accept="image/png,image/jpeg" files={secondaryFiles} onChange={setSecondaryFiles} />
        </div>
      )}

      {tool.slug === "sign-pdf" && <SignaturePad onChange={setSignatureDataUrl} />}

      {tool.fields && tool.fields.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tool.fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
              <FieldRenderer field={f} value={values[f.key]} onChange={(v) => setField(f.key, v)} />
            </div>
          ))}
        </div>
      )}

      {tool.needsPassword && (
        <div className="max-w-xs">
          <FieldRenderer
            field={{ key: "password", label: "PDF password (only if encrypted)", type: "password" }}
            value={values.password ?? ""}
            onChange={(v) => setField("password", v)}
          />
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={!canRun || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-6 py-3.5 text-base font-semibold text-white shadow-xl transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            {progress || "Processing…"}
          </>
        ) : (
          <>{tool.actionLabel}</>
        )}
      </button>

      {error && (
        <div className="glass-card rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">⚠ {error}</div>
      )}

      {result && <ResultPanel result={result} toolName={tool.name} />}
    </div>
  );
}

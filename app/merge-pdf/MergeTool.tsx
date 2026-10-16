"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

export default function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const pdfFiles = Array.from(fileList).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...pdfFiles]);
    setDownloadUrl(null);
    setError(null);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mergeFiles = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files to merge.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: "application/pdf" });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while merging your files. Please ensure all files are valid PDFs."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-950"
      >
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          Drag &amp; drop PDF files here
        </p>
        <p className="mt-1 text-sm text-slate-500">or</p>
        <label className="mt-3 cursor-pointer rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
          Select Files
          <input
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {files.length > 0 && (
        <ul className="mt-6 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-white px-4 py-2 text-sm shadow-sm dark:bg-slate-950"
            >
              <span className="truncate text-slate-700 dark:text-slate-300">
                📄 {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </span>
              <button
                onClick={() => removeFile(i)}
                className="ml-4 text-red-500 hover:text-red-700"
                aria-label={`Remove ${file.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={mergeFiles}
          disabled={files.length < 2 || isProcessing}
          className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Merging…" : `Merge ${files.length || ""} PDFs`}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download="merged-pdflovers-pro.pdf"
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            ⬇ Download Merged PDF
          </a>
        )}
      </div>
    </div>
  );
}

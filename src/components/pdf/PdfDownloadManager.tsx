"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download, Eye, X, Loader2, FileArchive, FileText, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProcessedPdfFile } from "@/types/pdf";

interface PdfDownloadManagerProps {
  files: ProcessedPdfFile[];
  zipFileName?: string;
  onClearAll?: () => void;
}

interface PreviewFile extends ProcessedPdfFile {
  url: string;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb < 0.1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
}

export default function PdfDownloadManager({
  files,
  zipFileName = "PDFLovers_Processed_Files.zip",
  onClearAll,
}: PdfDownloadManagerProps) {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const urlsRef = useRef<string[]>([]);

  // ── Memory-safe object URL lifecycle ──────────────────────────────
  useEffect(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];

    const next: PreviewFile[] = files.map((f) => {
      const url = URL.createObjectURL(f.blob);
      urlsRef.current.push(url);
      return { ...f, url };
    });

    setPreviewFiles(next);
    setSelectedId(next.length > 0 ? next[0].id : null);

    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
    };
  }, [files]);

  const selectedFile = useMemo(
    () => previewFiles.find((f) => f.id === selectedId) || null,
    [previewFiles, selectedId]
  );

  const totalSize = useMemo(
    () => previewFiles.reduce((acc, f) => acc + f.sizeBytes, 0),
    [previewFiles]
  );

  const handleSingleDownload = useCallback((file: PreviewFile) => {
    saveAs(file.blob, file.name);
  }, []);

  // ── Chunked ZIP generation — prevents main-thread freeze on big batches ──
  const handleDownloadZip = useCallback(async () => {
    if (previewFiles.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);
    setError(null);

    try {
      const zip = new JSZip();
      const folder = zip.folder("PDF_Lovers_Export");

      for (let i = 0; i < previewFiles.length; i++) {
        const f = previewFiles[i];
        folder?.file(f.name, f.blob);
        if (i % 5 === 0) await new Promise((r) => setTimeout(r, 0)); // yield to UI thread
      }

      const zipBlob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        (meta) => setZipProgress(Math.round(meta.percent))
      );

      saveAs(zipBlob, zipFileName);
      setTimeout(() => setZipProgress(0), 800);
    } catch (err) {
      console.error("ZIP generation failed", err);
      setError("Failed to generate ZIP. Try processing fewer files at once.");
    } finally {
      setIsZipping(false);
    }
  }, [previewFiles, zipFileName]);

  if (previewFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
        <FileText className="w-10 h-10 mb-3" />
        <p>No processed files yet. Upload and process a PDF to see results here.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4">
        <div>
          <h3 className="font-semibold text-gray-900">
            {previewFiles.length} file{previewFiles.length > 1 ? "s" : ""} ready
          </h3>
          <p className="text-sm text-gray-500">Total size: {formatBytes(totalSize)}</p>
        </div>
        <div className="flex items-center gap-2">
          {onClearAll && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isZipping ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Zipping {zipProgress}%</>
            ) : (
              <><FileArchive className="w-4 h-4" /> Download ZIP</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 px-5 py-3 text-sm text-red-600">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Split Screen */}
      <div className="grid grid-cols-1 md:grid-cols-5 h-[560px]">
        {/* LEFT: scrollable file list */}
        <div className="md:col-span-2 border-r border-gray-100 overflow-y-auto">
          <ul className="divide-y divide-gray-100">
            {previewFiles.map((file) => (
              <li
                key={file.id}
                className={`flex items-center justify-between gap-2 px-4 py-3 cursor-pointer transition-colors ${
                  selectedId === file.id ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedId(file.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.sizeBytes)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedId(file.id); }}
                    title="View"
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSingleDownload(file); }}
                    title="Download"
                    className="rounded-md p-2 text-blue-600 hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: live "Click to View" preview */}
        <div className="md:col-span-3 bg-gray-100 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
            <span className="truncate text-sm font-medium text-gray-700">
              {selectedFile ? selectedFile.name : "Select a file to preview"}
            </span>
          </div>
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {selectedFile && (
                <motion.div
                  key={selectedFile.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0"
                >
                  <object data={selectedFile.url} type="application/pdf" className="h-full w-full">
                    <iframe src={selectedFile.url} className="h-full w-full" title={selectedFile.name} />
                  </object>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

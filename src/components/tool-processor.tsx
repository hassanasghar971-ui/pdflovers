"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  FileIcon,
} from "lucide-react";
import {
  runTool,
  downloadBlob,
  type ToolActionKey,
  type SplitRange,
} from "@/lib/pdf-engine";
import type { Tool } from "@/lib/tools-registry";

type Status = "idle" | "processing" | "success" | "error";

interface ToolProcessorProps {
  tool: Tool;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function parseRanges(input: string): SplitRange[] {
  const ranges: SplitRange[] = [];
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((p) => p.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
        ranges.push({ start, end });
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num > 0) {
        ranges.push({ start: num, end: num });
      }
    }
  }
  return ranges;
}

const NEEDS_PAGE_SELECTOR: ToolActionKey[] = [
  "rotate",
  "delete-pages",
  "extract-pages",
];

export default function ToolProcessor({ tool }: ToolProcessorProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState("");

  const [pageCount, setPageCount] = useState<number | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [rotateAllPages, setRotateAllPages] = useState(true);

  const [compressionQuality, setCompressionQuality] = useState<
    "low" | "medium" | "high"
  >("medium");

  const [watermarkText, setWatermarkText] = useState("PDF Lovers Pro");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkFontSize, setWatermarkFontSize] = useState(50);
  const [watermarkRotation, setWatermarkRotation] = useState(45);

  const [splitMode, setSplitMode] = useState<"all" | "range">("all");
  const [rangesText, setRangesText] = useState("1-2, 3-4");

  const [ocrLanguage, setOcrLanguage] = useState("eng");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptString = tool.acceptedFileTypes.join(",");

  const validateFile = useCallback(
    (file: File): boolean => {
      const nameLower = file.name.toLowerCase();
      const extMatch = tool.acceptedFileTypes.some((ext) =>
        nameLower.endsWith(ext.toLowerCase())
      );
      const mimeMatch = tool.acceptedMimeTypes.includes(file.type);
      return extMatch || mimeMatch;
    },
    [tool.acceptedFileTypes, tool.acceptedMimeTypes]
  );

  function addFiles(newFiles: File[]) {
    const valid = newFiles.filter(validateFile);
    if (valid.length === 0) {
      setErrorMessage(
        `Unsupported file type. Please upload a ${tool.acceptedFileTypes.join(
          ", "
        )} file.`
      );
      setStatus("error");
      return;
    }
    setErrorMessage("");
    setStatus("idle");
    setFiles((prev) => (tool.multipleFiles ? [...prev, ...valid] : [valid[0]]));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    addFiles(dropped);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function moveFile(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function togglePage(page: number) {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) {
        next.delete(page);
      } else {
        next.add(page);
      }
      return next;
    });
  }

  function selectAllPages() {
    if (!pageCount) return;
    setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
  }

  function clearPageSelection() {
    setSelectedPages(new Set());
  }

  useEffect(() => {
    const needsPages = NEEDS_PAGE_SELECTOR.includes(tool.action);
    if (!needsPages || files.length === 0) {
      setPageCount(null);
      setSelectedPages(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const bytes = await files[0].arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        if (!cancelled) setPageCount(doc.getPageCount());
      } catch {
        if (!cancelled) setPageCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [files, tool.action]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  function handleReset() {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setStatus("idle");
    setProgress(0);
    setErrorMessage("");
    setResultUrl(null);
    setResultFilename("");
    setSelectedPages(new Set());
    setPageCount(null);
  }

  async function handleProcess() {
    setStatus("processing");
    setErrorMessage("");
    setProgress(0);

    try {
      const options: Record<string, unknown> = {};

      switch (tool.action) {
        case "split": {
          options.mode = splitMode;
          if (splitMode === "range") {
            const parsed = parseRanges(rangesText);
            if (parsed.length === 0) {
              throw new Error(
                "Please enter at least one valid page range, e.g. 1-3, 5-7"
              );
            }
            options.ranges = parsed;
          }
          break;
        }
        case "rotate": {
          options.rotation = rotation;
          if (!rotateAllPages) {
            if (selectedPages.size === 0) {
              throw new Error("Please select at least one page to rotate.");
            }
            options.pages = Array.from(selectedPages).map((p) => p - 1);
          }
          break;
        }
        case "delete-pages": {
          if (selectedPages.size === 0) {
            throw new Error("Please select at least one page to delete.");
          }
          options.pages = Array.from(selectedPages).map((p) => p - 1);
          break;
        }
        case "extract-pages": {
          if (selectedPages.size === 0) {
            throw new Error("Please select at least one page to extract.");
          }
          options.pages = Array.from(selectedPages);
          break;
        }
        case "compress": {
          options.quality = compressionQuality;
          break;
        }
        case "pdf-to-jpg": {
          options.scale = 2;
          break;
        }
        case "watermark": {
          if (!watermarkText.trim()) {
            throw new Error("Please enter watermark text.");
          }
          options.text = watermarkText;
          options.opacity = watermarkOpacity;
          options.fontSize = watermarkFontSize;
          options.rotationDeg = watermarkRotation;
          break;
        }
        case "ocr-pdf": {
          options.language = ocrLanguage;
          break;
        }
        default:
          break;
      }

      const result = await runTool({
        action: tool.action,
        files,
        options,
        onProgress: (p) => setProgress(p),
      });

      const url = URL.createObjectURL(result.blob);
      setResultUrl(url);
      setResultFilename(result.filename);
      downloadBlob(result.blob, result.filename);
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while processing your file."
      );
      setStatus("error");
    }
  }

  const canProcess =
    files.length > 0 &&
    (tool.action !== "merge" || files.length >= 2) &&
    status !== "processing";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
      {status === "success" && resultUrl ? (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-500">
            <CheckCircle2 size={32} />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Your file is ready!
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {resultFilename} has been processed and downloaded automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={resultUrl}
              download={resultFilename}
              className="focus-ring flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <Download size={16} /> Download Again
            </a>
            <button
              onClick={handleReset}
              className="focus-ring flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <RefreshCw size={16} /> Process Another File
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`focus-ring flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              isDragging
                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                : "border-zinc-300 hover:border-red-400 dark:border-zinc-700"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptString}
              multiple={tool.multipleFiles}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-500">
              <Upload size={22} />
            </span>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Click to upload or drag &amp; drop
            </p>
            <p className="text-xs text-zinc-400">
              Supported: {tool.acceptedFileTypes.join(", ")}
              {tool.multipleFiles ? " · multiple files allowed" : ""}
            </p>
          </div>

          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <FileIcon size={16} className="shrink-0 text-red-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  {tool.multipleFiles && files.length > 1 && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveFile(index, -1)}
                        disabled={index === 0}
                        className="focus-ring rounded p-1 text-zinc-400 hover:text-red-600 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(index, 1)}
                        disabled={index === files.length - 1}
                        className="focus-ring rounded p-1 text-zinc-400 hover:text-red-600 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown size={15} />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="focus-ring shrink-0 rounded p-1 text-zinc-400 hover:text-red-600"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {NEEDS_PAGE_SELECTOR.includes(tool.action) &&
            files.length > 0 &&
            pageCount !== null &&
            (tool.action !== "rotate" || !rotateAllPages) && (
              <div className="mt-5 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    Select pages ({pageCount} total)
                  </p>
                  <div className="flex gap-3 text-xs font-medium text-red-600">
                    <button type="button" onClick={selectAllPages}>
                      Select All
                    </button>
                    <button type="button" onClick={clearPageSelection}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => togglePage(page)}
                        className={`focus-ring rounded-lg border px-0 py-2 text-xs font-medium transition-colors ${
                          selectedPages.has(page)
                            ? "border-red-600 bg-red-600 text-white"
                            : "border-zinc-200 text-zinc-600 hover:border-red-300 dark:border-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {tool.action === "rotate" && files.length > 0 && (
            <div className="mt-5 space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Rotation angle
                </label>
                <div className="flex gap-2">
                  {([90, 180, 270] as const).map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => setRotation(angle)}
                      className={`focus-ring rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        rotation === angle
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={rotateAllPages}
                  onChange={(e) => setRotateAllPages(e.target.checked)}
                  className="h-4 w-4 rounded accent-red-600"
                />
                Apply rotation to all pages
              </label>
            </div>
          )}

          {tool.action === "compress" && files.length > 0 && (
            <div className="mt-5 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Compression level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCompressionQuality(level)}
                    className={`focus-ring rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                      compressionQuality === level
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tool.action === "watermark" && files.length > 0 && (
            <div className="mt-5 space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Watermark text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="focus-ring w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    Opacity ({watermarkOpacity})
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={watermarkOpacity}
                    onChange={(e) =>
                      setWatermarkOpacity(parseFloat(e.target.value))
                    }
                    className="w-full accent-red-600"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    Font size
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={watermarkFontSize}
                    onChange={(e) =>
                      setWatermarkFontSize(parseInt(e.target.value, 10) || 50)
                    }
                    className="focus-ring w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    Rotation (°)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={watermarkRotation}
                    onChange={(e) =>
                      setWatermarkRotation(parseInt(e.target.value, 10) || 0)
                    }
                    className="focus-ring w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {tool.action === "split" && files.length > 0 && (
            <div className="mt-5 space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSplitMode("all")}
                  className={`focus-ring flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    splitMode === "all"
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Split every page
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode("range")}
                  className={`focus-ring flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    splitMode === "range"
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Custom ranges
                </button>
              </div>
              {splitMode === "range" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">
                    Page ranges (e.g. 1-3, 5-7, 10)
                  </label>
                  <input
                    type="text"
                    value={rangesText}
                    onChange={(e) => setRangesText(e.target.value)}
                    className="focus-ring w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              )}
            </div>
          )}

          {tool.action === "ocr-pdf" && files.length > 0 && (
            <div className="mt-5 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <label className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Recognition language
              </label>
              <select
                value={ocrLanguage}
                onChange={(e) => setOcrLanguage(e.target.value)}
                className="focus-ring w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              >
                <option value="eng">English</option>
                <option value="ara">Arabic</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
                <option value="spa">Spanish</option>
                <option value="urd">Urdu</option>
                <option value="hin">Hindi</option>
                <option value="chi_sim">Chinese (Simplified)</option>
              </select>
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {status === "processing" && (
            <div className="mt-5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-red-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-zinc-500">
                Processing locally in your browser... {progress}%
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleProcess}
            disabled={!canProcess}
            className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "processing" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing...
              </>
            ) : (
              <>{tool.name}</>
            )}
          </button>

          {tool.action === "merge" && files.length === 1 && (
            <p className="mt-2 text-center text-xs text-zinc-400">
              Add at least one more PDF file to enable merging.
            </p>
          )}
        </>
      )}
    </div>
  );
}

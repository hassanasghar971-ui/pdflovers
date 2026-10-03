"use client";
import { useCallback, useRef, useState } from "react";
import { formatBytes } from "@/lib/engine/utils";

export default function FileDropzone({
  accept,
  multiple,
  files,
  onChange,
  label,
}: {
  accept?: string;
  multiple?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list || !list.length) return;
      const arr = Array.from(list);
      onChange(multiple ? [...files, ...arr] : [arr[0]]);
    },
    [files, multiple, onChange]
  );

  function removeAt(idx: number) {
    onChange(files.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...files];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-violet-500 bg-violet-500/10" : "border-current/15 hover:border-violet-400"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg animate-float">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V4m0 0 4 4m-4-4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-semibold">{label || "Drag & drop files here, or click to browse"}</p>
        <p className="text-xs text-secondary">Processed 100% locally in your browser — files never leave your device.</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="glass-card flex items-center gap-3 rounded-xl px-3 py-2 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                📄
              </span>
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="shrink-0 text-xs text-secondary">{formatBytes(f.size)}</span>
              {multiple && (
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="rounded-md px-1.5 py-0.5 hover:bg-current/10" aria-label="Move up">
                    ↑
                  </button>
                  <button type="button" onClick={() => move(i, 1)} className="rounded-md px-1.5 py-0.5 hover:bg-current/10" aria-label="Move down">
                    ↓
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-red-500 hover:bg-red-500/10"
                aria-label="Remove file"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

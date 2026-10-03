"use client";
import { useEffect, useRef, useState } from "react";
import { fileToUint8Array } from "@/lib/engine/utils";

type Box = { page: number; xPct: number; yPct: number; wPct: number; hPct: number };

export default function RedactEditor({ file, onChange }: { file: File | null; onChange: (boxes: Box[]) => void }) {
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<Box | null>(null);

  useEffect(() => {
    onChange(boxes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxes]);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!file) return;
      setLoading(true);
      const { loadPdfDocument, renderPageToCanvas } = await import("@/lib/engine/pdfjs");
      const data = await fileToUint8Array(file);
      const pdf = await loadPdfDocument(data);
      if (cancelled) return;
      setNumPages(pdf.numPages);
      const safePage = Math.min(pageNum, pdf.numPages);
      const canvas = await renderPageToCanvas(pdf, safePage, 1.2);
      if (cancelled || !canvasRef.current) return;
      canvasRef.current.width = canvas.width;
      canvasRef.current.height = canvas.height;
      const ctx = canvasRef.current.getContext("2d")!;
      ctx.drawImage(canvas, 0, 0);
      setLoading(false);
    }
    render();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, pageNum]);

  function pctFromEvent(e: React.PointerEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onDown(e: React.PointerEvent) {
    const p = pctFromEvent(e);
    dragStart.current = p;
    setDraft({ page: pageNum, xPct: p.x, yPct: p.y, wPct: 0, hPct: 0 });
  }
  function onMove(e: React.PointerEvent) {
    if (!dragStart.current) return;
    const p = pctFromEvent(e);
    const x = Math.min(dragStart.current.x, p.x);
    const y = Math.min(dragStart.current.y, p.y);
    const w = Math.abs(p.x - dragStart.current.x);
    const h = Math.abs(p.y - dragStart.current.y);
    setDraft({ page: pageNum, xPct: x, yPct: y, wPct: w, hPct: h });
  }
  function onUp() {
    if (draft && draft.wPct > 1 && draft.hPct > 1) {
      setBoxes((b) => [...b, draft]);
    }
    setDraft(null);
    dragStart.current = null;
  }

  const pageBoxes = boxes.filter((b) => b.page === pageNum);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            disabled={pageNum <= 1}
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
            className="glass-pill rounded-full px-3 py-1 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-secondary">
            Page {pageNum} / {numPages}
          </span>
          <button
            type="button"
            disabled={pageNum >= numPages}
            onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
            className="glass-pill rounded-full px-3 py-1 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
        <button type="button" onClick={() => setBoxes([])} className="text-xs font-medium text-red-500 hover:underline">
          Clear all boxes ({boxes.length})
        </button>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="relative w-full touch-none select-none overflow-hidden rounded-2xl border border-current/15"
      >
        <canvas ref={canvasRef} className="block w-full" />
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-sm">Loading page…</div>}
        {pageBoxes.map((b, i) => (
          <div
            key={i}
            className="absolute border-2 border-red-500 bg-black/80"
            style={{ left: `${b.xPct}%`, top: `${b.yPct}%`, width: `${b.wPct}%`, height: `${b.hPct}%` }}
          />
        ))}
        {draft && (
          <div
            className="absolute border-2 border-dashed border-red-400 bg-red-500/30"
            style={{ left: `${draft.xPct}%`, top: `${draft.yPct}%`, width: `${draft.wPct}%`, height: `${draft.hPct}%` }}
          />
        )}
      </div>
      <p className="mt-2 text-xs text-secondary">
        Click and drag on the page preview to draw a black redaction box. Switch pages to add more boxes. Pages are flattened to
        images on export, so redacted content can&apos;t be recovered.
      </p>
    </div>
  );
}

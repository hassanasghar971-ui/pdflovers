'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

const W = 640;
const H = 220;
const PEN = '#111827';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export default function SignaturePad({ value, onChange, disabled = false, id }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const emitted = useRef('');
  const [error, setError] = useState('');
  const [hasInk, setHasInk] = useState(Boolean(value));

  const ctx2d = () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null;

  const emit = (v: string) => {
    emitted.current = v;
    onChange(v);
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (c) {
      c.width = W;
      c.height = H;
    }
    return () => {
      if (c) {
        c.width = 0;
        c.height = 0;
      }
    };
  }, []);

  const drawDataUrl = (url: string) => {
    const img = new Image();
    img.onload = () => {
      const g = ctx2d();
      if (g) {
        g.clearRect(0, 0, W, H);
        const k = Math.min((W - 20) / img.width, (H - 20) / img.height, 1);
        const w = img.width * k;
        const h = img.height * k;
        g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      }
      img.onload = null;
      img.src = '';
    };
    img.onerror = () => {
      setError('That image could not be read.');
      img.onerror = null;
    };
    img.src = url;
  };

  useEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    const g = ctx2d();
    if (!g) return;
    g.clearRect(0, 0, W, H);
    if (!value) {
      setHasInk(false);
      return;
    }
    setHasInk(true);
    drawDataUrl(value);
  }, [value]);

  const point = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };

  const exportCropped = () => {
    const c = canvasRef.current;
    const g = ctx2d();
    if (!c || !g) return;
    const { data } = g.getImageData(0, 0, W, H);
    let minX = W;
    let minY = H;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < H; y++) {
      const row = y * W * 4;
      for (let x = 0; x < W; x++) {
        if (data[row + x * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) {
      setHasInk(false);
      emit('');
      return;
    }
    const pad = 6;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(W - 1, maxX + pad);
    maxY = Math.min(H - 1, maxY + pad);
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    tmp.getContext('2d')?.drawImage(c, minX, minY, w, h, 0, 0, w, h);
    const url = tmp.toDataURL('image/png');
    tmp.width = 0;
    tmp.height = 0;
    setHasInk(true);
    emit(url);
  };

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const g = ctx2d();
    if (!g) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setError('');
    drawing.current = true;
    const p = point(e);
    last.current = p;
    g.fillStyle = PEN;
    g.beginPath();
    g.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = PEN;
    g.lineWidth = 3.4;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(p.x, p.y);
  };

  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const g = ctx2d();
    if (!g) return;
    const p = point(e);
    const mid = { x: (last.current.x + p.x) / 2, y: (last.current.y + p.y) / 2 };
    g.quadraticCurveTo(last.current.x, last.current.y, mid.x, mid.y);
    g.stroke();
    g.beginPath();
    g.moveTo(mid.x, mid.y);
    last.current = p;
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    exportCropped();
  };

  const clear = () => {
    const g = ctx2d();
    g?.clearRect(0, 0, W, H);
    setError('');
    setHasInk(false);
    emit('');
  };

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    setError('');
    if (!/^image\/(png|jpeg)$/.test(file.type) && !/\.(png|jpe?g)$/i.test(file.name)) {
      setError('Please choose a PNG or JPG image.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError('That image is larger than 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (!/^data:image\/(png|jpeg);base64,/.test(url)) {
        setError('Please choose a PNG or JPG image.');
        return;
      }
      setHasInk(true);
      emitted.current = url;
      drawDataUrl(url);
      onChange(url);
    };
    reader.onerror = () => setError('That image could not be read.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="signature-pad">
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
        <canvas
          ref={canvasRef}
          id={id}
          width={W}
          height={H}
          role="img"
          aria-label={hasInk ? 'Your signature' : 'Signature drawing area'}
          className="block w-full cursor-crosshair"
          style={{ touchAction: 'none', aspectRatio: `${W} / ${H}` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-secondary text-sm" onClick={clear} disabled={disabled || !hasInk}>
          Clear
        </button>
        <button type="button" className="btn btn-secondary text-sm" onClick={() => fileRef.current?.click()} disabled={disabled}>
          Upload image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            onUpload(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <span className="field-help">
          {hasInk ? 'Signature ready.' : 'Draw with mouse, finger or pen, or upload a PNG/JPG of your signature.'}
        </span>
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

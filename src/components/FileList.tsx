'use client';

import { useState } from 'react';
import { formatBytes } from '@/lib/pdf-engine';

const ids = new WeakMap<File, number>();
let nextId = 1;
function idOf(f: File): number {
  let id = ids.get(f);
  if (id === undefined) {
    id = nextId++;
    ids.set(f, id);
  }
  return id;
}

export interface FileListProps {
  files: File[];
  labels?: string[];
  disabled?: boolean;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onClear: () => void;
}

export default function FileList({ files, labels, disabled = false, onRemove, onMove, onClear }: FileListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const reorderable = files.length > 1 && !disabled;
  const total = files.reduce((n, f) => n + f.size, 0);

  if (files.length === 0) return null;

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-700">
          {files.length} {files.length === 1 ? 'file' : 'files'} &middot; {formatBytes(total)}
          {reorderable ? <span className="ml-2 font-normal text-gray-500">Drag rows or use the arrows to reorder.</span> : null}
        </p>
        <button type="button" className="btn btn-ghost text-sm" onClick={onClear} disabled={disabled}>
          Remove all
        </button>
      </div>

      <ul className="space-y-2" aria-label="Selected files">
        {files.map((file, i) => (
          <li
            key={idOf(file)}
            className="file-row"
            draggable={reorderable}
            data-dragging={dragIndex === i ? 'true' : undefined}
            data-over={overIndex === i && dragIndex !== null && dragIndex !== i ? 'true' : undefined}
            onDragStart={(e) => {
              if (!reorderable) return;
              setDragIndex(i);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(i));
            }}
            onDragOver={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (overIndex !== i) setOverIndex(i);
            }}
            onDrop={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              if (dragIndex !== i) onMove(dragIndex, i);
              endDrag();
            }}
            onDragEnd={endDrag}
          >
            <span className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-gray-500" aria-hidden="true">
              {i + 1}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium" title={file.name}>
                {file.name}
              </span>
              <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
            </span>

            {labels?.[i] ? <span className="chip chip-brand shrink-0">{labels[i]}</span> : null}

            {reorderable && (
              <span className="flex shrink-0 gap-1">
                <button
                  type="button"
                  className="btn btn-ghost px-2 py-1"
                  aria-label={`Move ${file.name} up`}
                  disabled={i === 0}
                  onClick={() => onMove(i, i - 1)}
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  className="btn btn-ghost px-2 py-1"
                  aria-label={`Move ${file.name} down`}
                  disabled={i === files.length - 1}
                  onClick={() => onMove(i, i + 1)}
                >
                  &darr;
                </button>
              </span>
            )}

            <button
              type="button"
              className="btn btn-ghost shrink-0 px-2 py-1"
              aria-label={`Remove ${file.name}`}
              disabled={disabled}
              onClick={() => onRemove(i)}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

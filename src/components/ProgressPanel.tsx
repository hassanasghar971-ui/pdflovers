'use client';

export interface ProgressPanelProps {
  pct: number;
  label: string;
  cancelling: boolean;
  onCancel: () => void;
}

export default function ProgressPanel({ pct, label, cancelling, onCancel }: ProgressPanelProps) {
  const value = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <span className="truncate">{cancelling ? 'Cancelling…' : label || 'Working…'}</span>
        </span>
        <span className="shrink-0 font-semibold tabular-nums">{value}%</span>
      </div>
      <div
        className="progress-track mt-3"
        role="progressbar"
        aria-label="Processing progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">Your files stay on this device. Closing the tab stops the job.</p>
        <button type="button" className="btn btn-secondary text-sm" onClick={onCancel} disabled={cancelling}>
          Cancel
        </button>
      </div>
    </div>
  );
}

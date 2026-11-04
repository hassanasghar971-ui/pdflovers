'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getTool } from '@/lib/tools-registry';
import type { Tool } from '@/lib/tools-registry';
import { ToolError, formatBytes, preloadEngine, runTool } from '@/lib/pdf-engine';
import type { OptionValues, ToolResult } from '@/lib/pdf-engine';
import { registerPageHideCleanup } from '@/lib/memory';
import Dropzone, { acceptLabel, normalizeAccept } from './Dropzone';
import FileList from './FileList';
import OptionsForm, { defaultValues, isVisible, toOptionDefs, validateOptions } from './OptionsForm';
import ProgressPanel from './ProgressPanel';
import ResultPanel from './ResultPanel';

type Phase = 'idle' | 'running' | 'done';

function describeError(e: unknown): { message: string; aborted: boolean } {
  if (e instanceof ToolError) return { message: e.message, aborted: e.code === 'aborted' };
  if (e instanceof DOMException && e.name === 'AbortError') return { message: 'Cancelled.', aborted: true };
  if (e instanceof Error && e.message) return { message: `Something went wrong while processing: ${e.message}`, aborted: false };
  return { message: 'Something went wrong while processing this file. Please try again.', aborted: false };
}

function Runner({ tool }: { tool: Tool }) {
  const defs = useMemo(() => toOptionDefs(tool), [tool]);
  const accept = useMemo(() => normalizeAccept(tool.accept), [tool]);
  const minFiles = Math.max(1, tool.minFiles ?? 1);
  const maxFiles = Math.max(minFiles, tool.maxFiles ?? (tool.multiple ? 100 : 1));
  const multiple = Boolean(tool.multiple) && maxFiles > 1;
  const labels = (tool as unknown as { fileLabels?: string[] }).fileLabels;

  const [files, setFiles] = useState<File[]>([]);
  const [values, setValues] = useState<OptionValues>(() => defaultValues(defs));
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState({ pct: 0, label: 'Starting' });
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);
  const running = phase === 'running';

  useEffect(() => {
    mountedRef.current = true;
    registerPageHideCleanup();
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const warm = () => {
      void Promise.resolve(preloadEngine(tool.slug)).catch(() => undefined);
    };
    let idleId: number | undefined;
    let timerId: number | undefined;
    if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(warm, { timeout: 3000 });
    else timerId = window.setTimeout(warm, 1500);
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [tool.slug]);

  useEffect(() => {
    if (!running) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [running]);

  const dropResult = () => {
    setResult(null);
    setError('');
    if (phase === 'done') setPhase('idle');
  };

  const addFiles = (accepted: File[], rejected: File[]) => {
    const messages: string[] = [];
    if (rejected.length > 0) {
      messages.push(
        `${rejected.length} ${rejected.length === 1 ? 'file was' : 'files were'} skipped (not ${acceptLabel(accept) || 'a supported type'}): ${rejected
          .slice(0, 3)
          .map((f) => f.name)
          .join(', ')}${rejected.length > 3 ? '…' : ''}`,
      );
    }
    if (accepted.length > 0) {
      dropResult();
      if (!multiple) {
        setFiles([accepted[0]]);
        if (accepted.length > 1) messages.push('This tool takes one file; the first one was used.');
      } else {
        const room = Math.max(0, maxFiles - files.length);
        setFiles([...files, ...accepted.slice(0, room)]);
        if (accepted.length > room) messages.push(`This tool accepts at most ${maxFiles} files; ${accepted.length - room} not added.`);
      }
    }
    setNotice(messages.join(' '));
  };

  const removeFile = (i: number) => {
    dropResult();
    setNotice('');
    setFiles((prev) => prev.filter((_, k) => k !== i));
  };

  const moveFile = (from: number, to: number) => {
    dropResult();
    setFiles((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = prev.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const clearAll = () => {
    dropResult();
    setNotice('');
    setFiles([]);
  };

  const setOption = (key: string, value: unknown) => {
    setValues((prev) => ({ ...(prev as unknown as Record<string, unknown>), [key]: value }) as unknown as OptionValues);
  };

  const reset = () => {
    setResult(null);
    setError('');
    setNotice('');
    setFiles([]);
    setPhase('idle');
    setProgress({ pct: 0, label: 'Starting' });
  };

  const problem = validateOptions(defs, values as unknown as Record<string, unknown>);
  const needMore = files.length < minFiles;
  const canRun = !running && !needMore && !problem;

  let hint = '';
  if (needMore && files.length > 0) {
    hint =
      labels && labels.length >= minFiles
        ? `Add ${minFiles} files in this order: ${labels.slice(0, minFiles).join(', ')}.`
        : `Add at least ${minFiles} files to continue.`;
  } else if (!needMore && problem) {
    hint = problem;
  }

  const run = async () => {
    if (!canRun) return;
    const ac = new AbortController();
    abortRef.current = ac;
    setError('');
    setNotice('');
    setResult(null);
    setCancelling(false);
    setProgress({ pct: 0, label: 'Starting' });
    setPhase('running');

    try {
      const res = await runTool(tool.slug, {
        files,
        options: values,
        signal: ac.signal,
        onProgress: (pct: number, label?: string) => {
          if (!mountedRef.current) return;
          setProgress((prev) => {
            const nextPct = Math.max(prev.pct, Math.min(100, Math.round(pct)));
            const nextLabel = label ?? prev.label;
            return nextPct === prev.pct && nextLabel === prev.label ? prev : { pct: nextPct, label: nextLabel };
          });
        },
      });
      if (!mountedRef.current) return;
      setResult(res);
      setPhase('done');
    } catch (e) {
      if (!mountedRef.current) return;
      const d = describeError(e);
      setPhase('idle');
      if (d.aborted) setNotice('Cancelled. Nothing was kept.');
      else setError(d.message);
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      if (mountedRef.current) setCancelling(false);
    }
  };

  const cancel = () => {
    setCancelling(true);
    abortRef.current?.abort();
  };

  const hasVisibleOptions = defs.some((d) => isVisible(d, values as unknown as Record<string, unknown>));
  const showDropzone = files.length === 0 || !multiple || files.length < maxFiles;
  const totalBytes = files.reduce((n, f) => n + f.size, 0);

  return (
    <section aria-label={`${tool.name} tool`} className="space-y-5">
      <div className="card space-y-4 p-4 sm:p-6">
        {showDropzone && (
          <Dropzone
            accept={accept}
            multiple={multiple}
            disabled={running}
            compact={files.length > 0}
            title={files.length > 0 ? (multiple ? 'Add more files' : 'Replace file') : undefined}
            onFiles={addFiles}
          />
        )}

        {notice ? (
          <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {notice}
          </p>
        ) : null}

        <FileList
          files={files}
          labels={labels}
          disabled={running}
          onRemove={removeFile}
          onMove={moveFile}
          onClear={clearAll}
        />

        {files.length === 0 && (
          <p className="text-center text-xs text-gray-500">
            Files are processed on your device and never uploaded. Up to 250 MB per file.
          </p>
        )}
      </div>

      {files.length > 0 && hasVisibleOptions && (
        <div className="card p-4 sm:p-6">
          <h2 className="mb-3 text-base font-bold">Options</h2>
          <OptionsForm defs={defs} values={values} disabled={running} onChange={setOption} />
        </div>
      )}

      {files.length > 0 && !running && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary btn-lg" onClick={run} disabled={!canRun}>
              {phase === 'done' ? `${tool.name} again` : tool.name}
            </button>
            <span className="text-xs text-gray-500">{formatBytes(totalBytes)} selected</span>
          </div>
          {hint ? <p className="text-sm text-gray-600">{hint}</p> : null}
        </div>
      )}

      {running && <ProgressPanel pct={progress.pct} label={progress.label} cancelling={cancelling} onCancel={cancel} />}

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Could not complete this task</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      {result && phase === 'done' && <ResultPanel result={result} zipName={`${tool.slug}-results.zip`} onReset={reset} />}
    </section>
  );
}

export default function ToolRunner({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) return null;
  return <Runner key={slug} tool={tool} />;
}

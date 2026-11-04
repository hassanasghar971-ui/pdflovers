'use client';

import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import type { OptionValues } from '@/lib/pdf-engine';
import type { Tool } from '@/lib/tools-registry';
import SignaturePad from './SignaturePad';

export interface OptionDef {
  key: string;
  label: string;
  type: string;
  default?: unknown;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  placeholder?: string;
  required?: boolean;
  choices?: Array<{ value: string | number; label?: string }>;
  showWhen?: { key: string; equals: unknown };
}

export function toOptionDefs(tool: Tool): OptionDef[] {
  return ((tool as unknown as { options?: OptionDef[] }).options ?? []) as OptionDef[];
}

export function isVisible(def: OptionDef, values: Record<string, unknown>): boolean {
  const w = def.showWhen;
  if (!w) return true;
  const cur = values[w.key];
  if (Array.isArray(w.equals)) return w.equals.map(String).includes(String(cur));
  return String(cur) === String(w.equals);
}

export function defaultValues(defs: OptionDef[]): OptionValues {
  const out: Record<string, unknown> = {};
  for (const d of defs) {
    let v = d.default;
    if (v === undefined || v === null) {
      switch (d.type) {
        case 'checkbox':
          v = false;
          break;
        case 'number':
        case 'range':
          v = d.min ?? 0;
          break;
        case 'select':
          v = d.choices?.[0]?.value ?? '';
          break;
        case 'color':
          v = '#000000';
          break;
        default:
          v = '';
      }
    }
    out[d.key] = v;
  }
  return out as unknown as OptionValues;
}

export function validateOptions(defs: OptionDef[], values: Record<string, unknown>): string | null {
  for (const d of defs) {
    if (!isVisible(d, values)) continue;
    const v = values[d.key];
    if (d.required && (v === undefined || v === null || v === '')) {
      return d.type === 'signature' ? 'Draw or upload your signature first.' : `Enter a value for "${d.label}".`;
    }
  }
  const hasPw = defs.some((d) => d.key === 'password');
  const hasConfirm = defs.some((d) => d.key === 'confirm');
  if (hasPw && hasConfirm && values.password !== values.confirm) return 'The two passwords do not match.';
  return null;
}

function clamp(n: number, min?: number, max?: number): number {
  let x = n;
  if (typeof min === 'number') x = Math.max(min, x);
  if (typeof max === 'number') x = Math.min(max, x);
  return x;
}

function NumberField({
  id,
  def,
  value,
  disabled,
  onChange,
}: {
  id: string;
  def: OptionDef;
  value: unknown;
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value ?? ''));

  useEffect(() => {
    if (Number(draft) !== Number(value)) setDraft(String(value ?? ''));
  }, [value]);

  const commit = () => {
    const parsed = draft.trim() !== '' && Number.isFinite(Number(draft)) ? Number(draft) : Number(def.default ?? def.min ?? 0);
    const n = clamp(parsed, def.min, def.max);
    setDraft(String(n));
    onChange(n);
  };

  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      className="field-input"
      value={draft}
      min={def.min}
      max={def.max}
      step={def.step ?? 'any'}
      disabled={disabled}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n);
      }}
      onBlur={commit}
    />
  );
}

function PasswordField({
  id,
  def,
  value,
  disabled,
  onChange,
}: {
  id: string;
  def: OptionDef;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex gap-2">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className="field-input"
        value={value}
        placeholder={def.placeholder}
        autoComplete="new-password"
        spellCheck={false}
        autoCapitalize="off"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="btn btn-secondary shrink-0 text-sm"
        onClick={() => setShow((s) => !s)}
        aria-pressed={show}
        disabled={disabled}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export interface OptionsFormProps {
  defs: OptionDef[];
  values: OptionValues;
  disabled?: boolean;
  onChange: (key: string, value: unknown) => void;
}

export default function OptionsForm({ defs, values, disabled = false, onChange }: OptionsFormProps) {
  const uid = useId();
  const vals = values as unknown as Record<string, unknown>;
  const visible = defs.filter((d) => isVisible(d, vals));
  if (visible.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {visible.map((def) => {
        const id = `${uid}-${def.key}`;
        const v = vals[def.key];
        const wide = def.type === 'signature' || def.type === 'text';
        let control: ReactNode;

        switch (def.type) {
          case 'select':
            control = (
              <select
                id={id}
                className="field-input"
                value={String(v ?? '')}
                disabled={disabled}
                onChange={(e) => onChange(def.key, e.target.value)}
              >
                {(def.choices ?? []).map((c) => (
                  <option key={String(c.value)} value={String(c.value)}>
                    {c.label ?? String(c.value)}
                  </option>
                ))}
              </select>
            );
            break;
          case 'range':
            control = (
              <div className="flex items-center gap-3">
                <input
                  id={id}
                  type="range"
                  className="w-full"
                  min={def.min ?? 0}
                  max={def.max ?? 100}
                  step={def.step ?? 1}
                  value={Number(v ?? def.min ?? 0)}
                  disabled={disabled}
                  onChange={(e) => onChange(def.key, Number(e.target.value))}
                />
                <output htmlFor={id} className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {String(v ?? '')}
                </output>
              </div>
            );
            break;
          case 'number':
            control = (
              <NumberField id={id} def={def} value={v} disabled={disabled} onChange={(n) => onChange(def.key, n)} />
            );
            break;
          case 'password':
            control = (
              <PasswordField
                id={id}
                def={def}
                value={String(v ?? '')}
                disabled={disabled}
                onChange={(s) => onChange(def.key, s)}
              />
            );
            break;
          case 'color':
            control = (
              <div className="flex items-center gap-3">
                <input
                  id={id}
                  type="color"
                  className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white p-1"
                  value={/^#[0-9a-fA-F]{6}$/.test(String(v)) ? String(v) : '#000000'}
                  disabled={disabled}
                  onChange={(e) => onChange(def.key, e.target.value)}
                />
                <span className="text-sm tabular-nums text-gray-600">{String(v ?? '')}</span>
              </div>
            );
            break;
          case 'checkbox':
            control = (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  id={id}
                  type="checkbox"
                  className="h-4 w-4"
                  checked={Boolean(v)}
                  disabled={disabled}
                  onChange={(e) => onChange(def.key, e.target.checked)}
                />
                <span className="font-medium">{def.label}</span>
              </label>
            );
            break;
          case 'signature':
            control = (
              <SignaturePad id={id} value={String(v ?? '')} disabled={disabled} onChange={(s) => onChange(def.key, s)} />
            );
            break;
          default:
            control = (
              <input
                id={id}
                type="text"
                className="field-input"
                value={String(v ?? '')}
                placeholder={def.placeholder}
                spellCheck={false}
                disabled={disabled}
                onChange={(e) => onChange(def.key, e.target.value)}
              />
            );
        }

        const mismatch =
          def.key === 'confirm' && vals.password !== undefined && String(v ?? '') !== '' && v !== vals.password;

        return (
          <div key={def.key} className={wide ? 'sm:col-span-2' : undefined}>
            {def.type !== 'checkbox' && (
              <label htmlFor={id} className="field-label">
                {def.label}
                {def.required ? <span aria-hidden="true"> *</span> : null}
              </label>
            )}
            {control}
            {def.help ? <p className="field-help">{def.help}</p> : null}
            {mismatch ? (
              <p role="alert" className="mt-1 text-sm text-red-700">
                Passwords do not match.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

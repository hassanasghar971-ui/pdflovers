"use client";
import type { ToolField } from "@/lib/tools";

export default function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ToolField;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  const base = "w-full rounded-xl border border-current/15 bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-violet-500";

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded" />
        {field.label}
      </label>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-secondary">{field.label}</label>
      {field.type === "select" ? (
        <select className={base} value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          className={`${base} min-h-[160px] font-mono text-xs`}
          placeholder={field.placeholder}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "color" ? (
        <input type="color" value={String(value)} onChange={(e) => onChange(e.target.value)} className="h-10 w-16 rounded-lg border border-current/15 bg-transparent" />
      ) : (
        <input
          className={base}
          type={field.type === "number" ? "number" : field.type === "password" ? "password" : "text"}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          value={String(value)}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
        />
      )}
      {field.help && <p className="mt-1 text-xs text-secondary">{field.help}</p>}
    </div>
  );
}

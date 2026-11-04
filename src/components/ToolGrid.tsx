'use client';

import { useId, useMemo, useState } from 'react';
import ToolCard from './ToolCard';
import type { ToolCardData } from '@/lib/tool-view';

export interface ToolGridProps {
  tools: ToolCardData[];
  categories: Array<{ id: string; label: string }>;
}

export default function ToolGrid({ tools, categories }: ToolGridProps) {
  const uid = useId();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const q = query.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  const filtered = useMemo(
    () =>
      tools.filter((t) => (cat === 'all' || t.category === cat) && terms.every((term) => t.search.includes(term))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tools, cat, q],
  );

  const grouped = cat === 'all' && terms.length === 0;
  const available = categories.filter((c) => tools.some((t) => t.category === c.id));

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div>
          <label htmlFor={`${uid}-search`} className="sr-only">
            Search tools
          </label>
          <input
            id={`${uid}-search`}
            type="search"
            className="field-input"
            placeholder="Search tools, e.g. merge, compress, sign…"
            value={query}
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`btn text-sm ${cat === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            aria-pressed={cat === 'all'}
            onClick={() => setCat('all')}
          >
            All
          </button>
          {available.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`btn text-sm ${cat === c.id ? 'btn-primary' : 'btn-secondary'}`}
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600" role="status" aria-live="polite">
          {filtered.length === tools.length && grouped
            ? `${tools.length} tools`
            : `${filtered.length} ${filtered.length === 1 ? 'tool' : 'tools'} found`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="font-semibold">No tool matches &ldquo;{query}&rdquo;.</p>
          <p className="mt-1 text-sm text-gray-600">Try a shorter word such as &ldquo;pdf to&rdquo;, &ldquo;merge&rdquo; or &ldquo;sign&rdquo;.</p>
          <button
            type="button"
            className="btn btn-secondary mt-3 text-sm"
            onClick={() => {
              setQuery('');
              setCat('all');
            }}
          >
            Show all tools
          </button>
        </div>
      ) : grouped ? (
        <div className="space-y-8">
          {available.map((c) => {
            const list = filtered.filter((t) => t.category === c.id);
            if (list.length === 0) return null;
            return (
              <section key={c.id} aria-labelledby={`${uid}-${c.id}`}>
                <h3 id={`${uid}-${c.id}`} className="mb-3 text-lg font-bold">
                  {c.label}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((t) => (
                    <li key={t.slug}>
                      <ToolCard tool={t} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <li key={t.slug}>
              <ToolCard tool={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

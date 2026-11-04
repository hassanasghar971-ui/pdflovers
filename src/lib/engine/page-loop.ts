// src/lib/engine/page-loop.ts
//
// Page iteration for pdf.js documents: guaranteed page.cleanup(), abort checks,
// monotonic progress and a yield to the main thread between pages.
// (from-pdf.ts keeps an identical private copy; it can be switched to this one later.)

import { throwIfAborted, yieldToMain } from './shared';
import { progress } from './handler-utils';
import type { RunContext } from './types';

export async function eachPage<P extends { cleanup(): unknown }>(
  doc: { getPage(pageNumber: number): Promise<P> },
  indexes: number[],
  ctx: RunContext,
  cb: (page: P, index: number, pos: number) => Promise<void>,
  range: readonly [number, number],
  label: string,
): Promise<void> {
  const [from, to] = range;
  for (let pos = 0; pos < indexes.length; pos++) {
    throwIfAborted(ctx.signal);
    const index = indexes[pos];
    const page = await doc.getPage(index + 1);
    try {
      await cb(page, index, pos);
    } finally {
      page.cleanup();
    }
    progress(
      ctx,
      from + ((to - from) * (pos + 1)) / indexes.length,
      `${label} ${pos + 1} of ${indexes.length}`,
    );
    await yieldToMain();
  }
}

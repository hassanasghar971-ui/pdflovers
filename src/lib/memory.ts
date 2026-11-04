/* =============================================================================
 * PDF Lovers Pro – Client-side memory manager
 *
 * Every tool run gets a MemoryScope. Everything that holds browser memory
 * (object URLs, canvases, ImageBitmaps, workers) is created through it and is
 * released in one call to dispose(), even when the run fails or is cancelled.
 *
 *  - Object URLs   -> URL.revokeObjectURL()
 *  - Canvases      -> width = height = 0 (this is what actually frees the
 *                     backing store, especially on Safari) and removed from DOM
 *  - ImageBitmaps  -> close()
 *  - Custom        -> onDispose(fn), e.g. tesseract worker.terminate()
 * ========================================================================== */

export type Disposer = () => void | Promise<void>;

/** Revoke an object URL. Safe to call twice or with null. */
export function revokeObjectUrl(url: string | null | undefined): void {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    /* already revoked */
  }
}

/** Free a canvas's backing store immediately. */
export function purgeCanvas(canvas: HTMLCanvasElement | OffscreenCanvas | null | undefined): void {
  if (!canvas) return;
  try {
    canvas.width = 0;
    canvas.height = 0;
  } catch {
    /* ignore */
  }
  if (typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement) {
    canvas.remove();
  }
}

/** Overwrite sensitive buffers (passwords, signatures) with zeros. */
export function wipeBytes(...buffers: Array<Uint8Array | null | undefined>): void {
  for (const b of buffers) {
    if (b) b.fill(0);
  }
}

export class MemoryScope {
  readonly label: string;
  private urls = new Set<string>();
  private canvases = new Set<HTMLCanvasElement>();
  private bitmaps = new Set<ImageBitmap>();
  private disposers: Disposer[] = [];

  constructor(label = 'scope') {
    this.label = label;
  }

  /** Create a tracked object URL. */
  url(source: Blob | MediaSource): string {
    const u = URL.createObjectURL(source);
    this.urls.add(u);
    return u;
  }

  /** Revoke one tracked URL now. */
  revoke(url: string): void {
    this.urls.delete(url);
    revokeObjectUrl(url);
  }

  /** Create a tracked canvas. */
  canvas(width: number, height: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.floor(width));
    c.height = Math.max(1, Math.floor(height));
    this.canvases.add(c);
    return c;
  }

  /** Purge one canvas now (call this as soon as you are done with it). */
  release(canvas: HTMLCanvasElement | null | undefined): void {
    if (!canvas) return;
    purgeCanvas(canvas);
    this.canvases.delete(canvas);
  }

  /** Track an ImageBitmap so it is closed on dispose. */
  bitmap(bmp: ImageBitmap): ImageBitmap {
    this.bitmaps.add(bmp);
    return bmp;
  }

  releaseBitmap(bmp: ImageBitmap | null | undefined): void {
    if (!bmp) return;
    try {
      bmp.close();
    } catch {
      /* ignore */
    }
    this.bitmaps.delete(bmp);
  }

  /** Register cleanup such as worker.terminate() or pdfDoc.destroy(). Runs LIFO. */
  onDispose(fn: Disposer): void {
    this.disposers.push(fn);
  }

  get stats(): { urls: number; canvases: number; bitmaps: number; disposers: number } {
    return {
      urls: this.urls.size,
      canvases: this.canvases.size,
      bitmaps: this.bitmaps.size,
      disposers: this.disposers.length,
    };
  }

  /** Release everything. The scope can be reused afterwards. */
  async dispose(): Promise<void> {
    const urls = [...this.urls];
    const canvases = [...this.canvases];
    const bitmaps = [...this.bitmaps];
    const disposers = this.disposers.splice(0).reverse();
    this.urls.clear();
    this.canvases.clear();
    this.bitmaps.clear();

    for (const u of urls) revokeObjectUrl(u);
    for (const c of canvases) purgeCanvas(c);
    for (const b of bitmaps) {
      try {
        b.close();
      } catch {
        /* ignore */
      }
    }
    for (const d of disposers) {
      try {
        await d();
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[memory:${this.label}] disposer failed`, err);
        }
      }
    }
  }
}

/* -------------------- App-level scope for UI components ------------------- */

/** Use for UI-owned resources such as result download previews. Dispose on reset/unmount. */
export const appMemory = new MemoryScope('app');

export const trackObjectUrl = (source: Blob | MediaSource): string => appMemory.url(source);
export const revokeAllObjectUrls = (): Promise<void> => appMemory.dispose();

let pageHideInstalled = false;

/** Release everything when the tab is hidden/closed. Idempotent; call once from the workspace. */
export function registerPageHideCleanup(): void {
  if (pageHideInstalled || typeof window === 'undefined') return;
  pageHideInstalled = true;
  window.addEventListener('pagehide', () => {
    void appMemory.dispose();
  });
}

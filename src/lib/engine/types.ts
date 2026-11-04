import type { MemoryScope } from '../memory';

export type OptionValues = Record<string, string | number | boolean>;

export type ProgressFn = (percent: number, message?: string) => void;

export interface RunContext {
  files: File[];
  options: OptionValues;
  onProgress: ProgressFn;
  signal?: AbortSignal;
}

export interface ResultFile {
  name: string;
  blob: Blob;
  mime: string;
}

export interface ToolResult {
  files: ResultFile[];
  report?: string;
  note?: string;
}

/**
 * Every tool handler receives the validated + defaulted RunContext and a
 * MemoryScope. It must create canvases, object URLs and workers through the
 * scope. runTool() disposes the scope in a `finally`, so cleanup also happens
 * on errors and cancellation.
 */
export type ToolHandler = (ctx: RunContext, mem: MemoryScope) => Promise<ToolResult>;

/** Each engine module exports `handlers: HandlerMap`. */
export type HandlerMap = Record<string, ToolHandler>;

export type ToolErrorCode =
  | 'invalid-input'
  | 'password-required'
  | 'wrong-password'
  | 'invalid-pdf'
  | 'out-of-memory'
  | 'aborted'
  | 'unsupported'
  | 'internal';

/** An error whose message is safe and useful to show directly to the user. */
export class ToolError extends Error {
  readonly code: ToolErrorCode;

  constructor(message: string, code: ToolErrorCode = 'invalid-input') {
    super(message);
    this.name = 'ToolError';
    this.code = code;
  }
}

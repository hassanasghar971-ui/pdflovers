import type { OptionValue } from '../tools-registry';

export type OptionValues = Record<string, OptionValue>;
export type ProgressFn = (pct: number, label?: string) => void;

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

/** The second argument is the per-run memory scope. Handlers may ignore it. */
export type ToolHandler = (ctx: RunContext, mem: unknown) => Promise<ToolResult>;
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

export class ToolError extends Error {
  readonly code: ToolErrorCode;
  constructor(message: string, code: ToolErrorCode = 'invalid-input') {
    super(message);
    this.name = 'ToolError';
    this.code = code;
  }
}

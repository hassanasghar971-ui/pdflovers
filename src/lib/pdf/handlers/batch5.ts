import type { PdfHandler } from "./shared";
import { editHandlers } from "./edit";
import { securityHandlers } from "./security";
import { analyzeHandlers } from "./analyze";

export const batch5Handlers: Record<string, PdfHandler> = {
  ...editHandlers,
  ...securityHandlers,
  ...analyzeHandlers,
};

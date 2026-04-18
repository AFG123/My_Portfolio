import { createHttpError } from "../utils/http-error.js";

export function validateResumePayload(payload) {
  const source =
    typeof payload?.source === "string" && payload.source.trim()
      ? payload.source.trim()
      : "hero";

  const metadata =
    payload?.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)
      ? payload.metadata
      : {};

  if (source.length > 100) {
    throw createHttpError(400, "Source is too long.");
  }

  return { source, metadata };
}

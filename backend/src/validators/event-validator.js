import { createHttpError } from "../utils/http-error.js";

const allowedEventTypes = new Set([
  "page_view",
  "project_github_click",
  "project_live_click",
]);

export function validateEventPayload(payload) {
  const eventType = typeof payload?.eventType === "string" ? payload.eventType.trim() : "";
  const path = typeof payload?.path === "string" ? payload.path.trim() : "/";
  const projectSlug =
    typeof payload?.projectSlug === "string" && payload.projectSlug.trim()
      ? payload.projectSlug.trim()
      : null;
  const metadata =
    payload?.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)
      ? payload.metadata
      : {};

  if (!allowedEventTypes.has(eventType)) {
    throw createHttpError(400, "Unsupported event type.");
  }

  if (path.length > 255) {
    throw createHttpError(400, "Path is too long.");
  }

  if (projectSlug && projectSlug.length > 100) {
    throw createHttpError(400, "Project slug is too long.");
  }

  return { eventType, path, projectSlug, metadata };
}

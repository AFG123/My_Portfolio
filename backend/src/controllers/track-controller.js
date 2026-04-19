import { trackEvent } from "../services/track-event-service.js";
import { createHttpError } from "../utils/http-error.js";

function getPath(payload) {
  const path = typeof payload?.path === "string" ? payload.path.trim() : "/";

  if (!path || path.length > 255) {
    throw createHttpError(400, "Path must be between 1 and 255 characters.");
  }

  return path;
}

function getMetadata(payload) {
  if (payload?.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)) {
    return payload.metadata;
  }

  return {};
}

function getProjectSlug(payload) {
  const projectSlug =
    typeof payload?.projectSlug === "string" && payload.projectSlug.trim()
      ? payload.projectSlug.trim()
      : null;

  if (projectSlug && projectSlug.length > 100) {
    throw createHttpError(400, "Project slug is too long.");
  }

  return projectSlug;
}

export async function trackPageView(req, res) {
  const result = await trackEvent({
    eventType: "page_view",
    path: getPath(req.body),
    metadata: getMetadata(req.body),
    req,
  });

  res.status(200).json({
    ok: true,
    ...result,
  });
}

export async function trackProjectClick(req, res) {
  const result = await trackEvent({
    eventType: "project_click",
    projectSlug: getProjectSlug(req.body),
    path: getPath(req.body),
    metadata: getMetadata(req.body),
    req,
  });

  res.status(200).json({
    ok: true,
    ...result,
  });
}

export async function trackResumeDownload(req, res) {
  const result = await trackEvent({
    eventType: "resume_download",
    path: getPath(req.body),
    metadata: getMetadata(req.body),
    req,
  });

  res.status(200).json({
    ok: true,
    ...result,
  });
}

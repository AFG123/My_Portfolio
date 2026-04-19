import {
  findRecentMatchingEvent,
  insertTrackedEvent,
} from "../db/track-event-queries.js";

function extractIpAddress(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

function extractUserAgent(req) {
  return req.headers["user-agent"] || "unknown";
}

export async function trackEvent({
  eventType,
  projectSlug = null,
  path,
  metadata = {},
  req,
}) {
  const ipAddress = extractIpAddress(req);
  const userAgent = extractUserAgent(req);

  const existingEvent = await findRecentMatchingEvent({
    eventType,
    ipAddress,
    projectSlug,
  });

  if (existingEvent) {
    return {
      inserted: false,
      deduplicated: true,
      id: existingEvent.id,
    };
  }

  const savedEvent = await insertTrackedEvent({
    eventType,
    projectSlug,
    path,
    metadata,
    ipAddress,
    userAgent,
  });

  return {
    inserted: true,
    deduplicated: false,
    id: savedEvent.id,
    createdAt: savedEvent.created_at,
  };
}

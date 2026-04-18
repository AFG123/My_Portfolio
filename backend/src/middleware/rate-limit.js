import { env } from "../config/env.js";

const requestLog = new Map();

export function contactRateLimit(req, res, next) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const clientKey =
    (typeof forwardedFor === "string" && forwardedFor.split(",")[0]?.trim()) ||
    req.ip ||
    "unknown";

  const now = Date.now();
  const windowStart = now - env.rateLimit.windowMs;
  const existingRequests = requestLog.get(clientKey) ?? [];
  const recentRequests = existingRequests.filter((timestamp) => timestamp > windowStart);

  if (recentRequests.length >= env.rateLimit.maxRequests) {
    res.status(429).json({
      ok: false,
      error: "Too many requests. Please try again in a minute.",
    });
    return;
  }

  recentRequests.push(now);
  requestLog.set(clientKey, recentRequests);
  next();
}

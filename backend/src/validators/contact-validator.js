import { createHttpError } from "../utils/http-error.js";

export function validateContactPayload(payload) {
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";
  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";

  if (!name || name.length < 2 || name.length > 100) {
    throw createHttpError(400, "Name must be between 2 and 100 characters.");
  }

  if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createHttpError(400, "Please enter a valid email address.");
  }

  if (!message || message.length < 10 || message.length > 2000) {
    throw createHttpError(400, "Message must be between 10 and 2000 characters.");
  }

  return { name, email, message };
}

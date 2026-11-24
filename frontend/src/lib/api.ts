import { fetchWithRetry } from "./fetchWithRetry";
import { apiBaseUrl, contactDisabledMessage, writesEnabled } from "./runtimeConfig";

export class ContactSubmissionError extends Error {}

const contactFailure = "Unable to send your message right now. Please use the email link instead.";

export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
}

interface ApiResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export interface PortfolioEventPayload {
  eventType: "page_view" | "project_click";
  path: string;
  projectSlug?: string;
  metadata?: Record<string, unknown>;
}

export interface PortfolioStats {
  portfolioViews: number;
  projectClicks: number;
  messagesReceived: number;
  resumeDownloads: number;
  apiStatus: string;
}

export async function submitContactForm(payload: ContactFormPayload) {
  if (!writesEnabled || !apiBaseUrl) throw new ContactSubmissionError(contactDisabledMessage);

  try {
    const response = await fetchWithRetry(`${apiBaseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) throw new ContactSubmissionError("Too many messages right now. Please try again in a minute.");
    if (response.status === 400) throw new ContactSubmissionError("Please check your name, email, and message, then try again.");
    if (!response.ok) throw new ContactSubmissionError(contactFailure);

    const data = (await response.json()) as ApiResponse;
    if (data.ok !== true) throw new ContactSubmissionError(contactFailure);
    return { ok: true, message: "Message sent successfully." };
  } catch (error) {
    if (error instanceof ContactSubmissionError) throw error;
    throw new ContactSubmissionError(contactFailure);
  }
}

export async function trackPortfolioEvent(payload: PortfolioEventPayload) {
  if (!writesEnabled || !apiBaseUrl) return;
  try {
    const route =
      payload.eventType === "page_view"
        ? "/track/page-view"
        : "/track/project-click";

    await fetchWithRetry(`${apiBaseUrl}${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Fire-and-forget tracking should never interrupt the user flow.
  }
}

export async function fetchPortfolioStats() {
  if (!apiBaseUrl) throw new Error("Portfolio API is not configured.");
  const response = await fetchWithRetry(`${apiBaseUrl}/api/stats`);
  const data = (await response.json()) as { ok: boolean; data?: PortfolioStats; error?: string };

  if (!response.ok || !data.data) {
    throw new Error(data.error || "Unable to load portfolio stats.");
  }

  return data.data;
}

export async function trackResumeDownload(source: string) {
  if (!writesEnabled || !apiBaseUrl) return;
  try {
    await fetchWithRetry(`${apiBaseUrl}/track/resume-download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source,
        metadata: {
          path: window.location.pathname,
        },
      }),
    });
  } catch {
    // Tracking should never block the actual resume download.
  }
}

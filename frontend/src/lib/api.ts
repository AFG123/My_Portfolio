import { fetchWithRetry } from "./fetchWithRetry";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

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
  const response = await fetchWithRetry(`${API_BASE_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ApiResponse;

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong while sending your message.");
  }

  return data;
}

export async function trackPortfolioEvent(payload: PortfolioEventPayload) {
  try {
    const route =
      payload.eventType === "page_view"
        ? "/track/page-view"
        : "/track/project-click";

    await fetchWithRetry(`${API_BASE_URL}${route}`, {
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
  const response = await fetchWithRetry(`${API_BASE_URL}/api/stats`);
  const data = (await response.json()) as { ok: boolean; data?: PortfolioStats; error?: string };

  if (!response.ok || !data.data) {
    throw new Error(data.error || "Unable to load portfolio stats.");
  }

  return data.data;
}

export async function trackResumeDownload(source: string) {
  try {
    await fetchWithRetry(`${API_BASE_URL}/track/resume-download`, {
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

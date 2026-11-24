export type PortfolioEnvironment = "development" | "preview" | "production";

const requestedEnvironment = import.meta.env.VITE_PORTFOLIO_ENV;

// A deployed build is read-only unless production is selected explicitly.
export const portfolioEnvironment: PortfolioEnvironment =
  requestedEnvironment === "production"
    ? "production"
    : requestedEnvironment === "preview"
      ? "preview"
      : import.meta.env.DEV
        ? "development"
        : "preview";

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const candidateApiUrl = configuredApiUrl || (import.meta.env.DEV ? "http://localhost:4000" : "");

function resolveApiBaseUrl(): string | null {
  if (!candidateApiUrl) return null;

  try {
    const url = new URL(candidateApiUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const isLocalhost = url.hostname === "localhost" || url.hostname.endsWith(".localhost") || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
    if (import.meta.env.PROD && isLocalhost) return null;
    return url.href.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export const apiBaseUrl = resolveApiBaseUrl();

// Local development can write only to a local API. Preview builds never write.
const localDevelopmentApi = apiBaseUrl !== null && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(apiBaseUrl);
export const writesEnabled = apiBaseUrl !== null && (
  portfolioEnvironment === "production" ||
  (portfolioEnvironment === "development" && localDevelopmentApi)
);

export const contactDisabledMessage = requestedEnvironment === "preview"
  ? "Contact submissions are disabled in this preview. Please use the email link instead."
  : "The contact form is temporarily unavailable. Please use the email link instead.";

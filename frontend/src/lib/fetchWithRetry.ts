function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 1
) {
  // Repeating a POST can duplicate a contact message or analytics event.
  const canRetry = (options.method ?? "GET").toUpperCase() === "GET";
  try {
    const response = await fetch(url, options);

    if (!response.ok && canRetry && retries > 0 && (response.status === 429 || response.status >= 500)) {
      await delay(500);
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (error) {
    if (canRetry && retries > 0) {
      await delay(500);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw error;
  }
}

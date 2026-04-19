function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 1
) {
  try {
    const response = await fetch(url, options);

    if (!response.ok && retries > 0) {
      await delay(500);
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await delay(500);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw error;
  }
}

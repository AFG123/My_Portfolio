import { fetchPortfolioStats } from "../db/stats-queries.js";

export async function getPortfolioStats() {
  return fetchPortfolioStats();
}

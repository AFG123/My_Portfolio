import { getPortfolioStats } from "../services/stats-service.js";

export async function getPublicStats(_req, res) {
  const stats = await getPortfolioStats();

  res.json({
    ok: true,
    data: stats,
  });
}

import { pool } from "../config/db.js";

async function getCount(query, values = []) {
  const result = await pool.query(query, values);
  return Number(result.rows[0]?.count ?? 0);
}

export async function fetchPortfolioStats() {
  const [portfolioViews, projectClicks, messagesReceived, resumeDownloads] = await Promise.all([
    getCount("SELECT COUNT(*) FROM portfolio_events WHERE event_type = $1", ["page_view"]),
    getCount(
      "SELECT COUNT(*) FROM portfolio_events WHERE event_type IN ($1, $2)",
      ["project_github_click", "project_live_click"]
    ),
    getCount("SELECT COUNT(*) FROM contact_messages"),
    getCount("SELECT COUNT(*) FROM resume_downloads"),
  ]);

  return {
    portfolioViews,
    projectClicks,
    messagesReceived,
    resumeDownloads,
    apiStatus: "healthy",
  };
}

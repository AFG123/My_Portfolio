import { pool } from "../config/db.js";

export async function createPortfolioEvent({ eventType, path, projectSlug, metadata }) {
  const query = `
    INSERT INTO portfolio_events (event_type, path, project_slug, metadata)
    VALUES ($1, $2, $3, $4::jsonb)
    RETURNING id, created_at
  `;

  const result = await pool.query(query, [
    eventType,
    path,
    projectSlug,
    JSON.stringify(metadata ?? {}),
  ]);

  return result.rows[0];
}

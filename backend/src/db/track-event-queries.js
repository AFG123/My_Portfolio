import { pool } from "../config/db.js";

export async function findRecentMatchingEvent({
  eventType,
  ipAddress,
  projectSlug,
}) {
  const query = `
    SELECT id
    FROM portfolio_events
    WHERE event_type = $1
      AND ip_address = $2
      AND (
        ($3::varchar IS NULL AND project_slug IS NULL)
        OR project_slug = $3
      )
      AND created_at >= NOW() - INTERVAL '10 minutes'
    LIMIT 1
  `;

  const result = await pool.query(query, [eventType, ipAddress, projectSlug]);
  return result.rows[0] ?? null;
}

export async function insertTrackedEvent({
  eventType,
  projectSlug,
  path,
  metadata,
  ipAddress,
  userAgent,
}) {
  const query = `
    INSERT INTO portfolio_events (
      event_type,
      project_slug,
      path,
      metadata,
      ip_address,
      user_agent
    )
    VALUES ($1, $2, $3, $4::jsonb, $5, $6)
    RETURNING id, created_at
  `;

  const result = await pool.query(query, [
    eventType,
    projectSlug,
    path,
    JSON.stringify(metadata ?? {}),
    ipAddress,
    userAgent,
  ]);

  return result.rows[0];
}

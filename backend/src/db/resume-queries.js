import { pool } from "../config/db.js";

export async function createResumeDownload({ source, metadata }) {
  const query = `
    INSERT INTO resume_downloads (source, metadata)
    VALUES ($1, $2::jsonb)
    RETURNING id, created_at
  `;

  const result = await pool.query(query, [
    source,
    JSON.stringify(metadata ?? {}),
  ]);

  return result.rows[0];
}

import { pool } from "../config/db.js";

export async function createContactMessage({ name, email, message }) {
  const query = `
    INSERT INTO contact_messages (name, email, message)
    VALUES ($1, $2, $3)
    RETURNING id, created_at
  `;

  const result = await pool.query(query, [name, email, message]);
  return result.rows[0];
}

import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
});

export async function testDatabaseConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT NOW() AS current_time");
    return {
      ok: true,
      currentTime: result.rows[0]?.current_time ?? null,
      database: env.db.name,
      host: env.db.host,
      port: env.db.port,
    };
  } finally {
    client.release();
  }
}

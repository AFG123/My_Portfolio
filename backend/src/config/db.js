import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

const poolConfig = env.db.url
  ? {
      connectionString: env.db.url,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      user: env.db.user,
      password: env.db.password,
    };

export const pool = new Pool(poolConfig);

export async function testDatabaseConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT NOW() AS current_time");
    return {
      ok: true,
      currentTime: result.rows[0]?.current_time ?? null,
      database: env.db.url ? "DATABASE_URL" : env.db.name,
      host: env.db.url ? "remote" : env.db.host,
      port: env.db.url ? "remote" : env.db.port,
    };
  } finally {
    client.release();
  }
}

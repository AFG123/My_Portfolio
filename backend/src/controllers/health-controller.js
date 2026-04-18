import { testDatabaseConnection } from "../config/db.js";
import { env } from "../config/env.js";

export async function getHealth(_req, res) {
  try {
    const dbStatus = await testDatabaseConnection();

    res.json({
      ok: true,
      service: "portfolio-backend",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      database: {
        ok: true,
        name: dbStatus.database,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      service: "portfolio-backend",
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
      database: {
        ok: false,
        error: error.message,
      },
    });
  }
}

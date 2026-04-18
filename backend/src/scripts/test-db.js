import { pool, testDatabaseConnection } from "../config/db.js";

try {
  const result = await testDatabaseConnection();
  console.log("Database connection successful.");
  console.log(`Database: ${result.database}`);
  console.log(`Host: ${result.host}:${result.port}`);
  console.log(`Server time: ${result.currentTime}`);
  await pool.end();
} catch (error) {
  console.error("Database connection failed.");
  console.error(error.message);
  await pool.end();
  process.exit(1);
}

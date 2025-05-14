import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema.js"; // your sessions table file
import { env } from "src/env.js";
import { logger } from "src/logger/logger.js";

const client = new Client({
  host: env.database.host, // or 'postgres' if inside Docker
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.database,
});

try {
  await client.connect();
} catch (error) {
  logger.error("Error connecting to PostgreSQL database:", error);
  throw error;
}

export const db = drizzle(client, { schema });

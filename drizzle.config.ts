// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema.ts",
  dbCredentials: {
    host: "localhost",
    port: 5433,
    user: "admin",
    password: "secretpassword",
    database: "postgresdb",
    ssl: false,
  },
});

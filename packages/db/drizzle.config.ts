import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load env vars from the root .env file
dotenv.config({ path: "../../.env" });

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://suba:suba_password@localhost:5432/suba_app",
  },
});

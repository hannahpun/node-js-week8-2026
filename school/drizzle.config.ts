import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import assert from "node:assert";

assert(process.env.DB_URL, "DB_URL is required");

export default defineConfig({
  schema: "./entities/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL,
  },
  verbose: true,
  strict: true,
});

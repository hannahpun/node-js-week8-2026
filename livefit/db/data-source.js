import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../entities/index.ts";

// ============================================================
// TODO：把你設計的 entity require 進來，然後加進下方的 entities 陣列
//（沒註冊的 entity，migration:generate 看不到它，所以這張資料表就不會被建出來）
// ============================================================
const createPool = () => {
  return new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5434),
    user: process.env.DB_USERNAME || "student",
    password: process.env.DB_PASSWORD || "student666",
    database: process.env.DB_DATABASE || "livefit_demo",
  });
};

export const pool = createPool();
export const db = drizzle(pool, { schema, logger: true });

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../entities/index.ts";

// ============================================================
// TODO：把你設計的 entity 放進 entities/，再從 entities/index.js export 出來
//（沒 export 的 entity，db:generate 看不到它，所以這張資料表就不會被建出來）
// ⚠️ 鐵律：結構一律走 Migration（db:generate → db:migrate），不要用 db:push 直接同步正式資料庫
// ============================================================
const createPool = () => {
  return new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5433),
    user: process.env.DB_USERNAME || "student",
    password: process.env.DB_PASSWORD || "student666",
    database: process.env.DB_DATABASE || "school",
  });
};

export const pool = createPool();
export const db = drizzle(pool, { schema, logger: true });

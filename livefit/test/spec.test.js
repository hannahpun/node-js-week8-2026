/**
 * W8 驗收 —— 全部走 information_schema 黑箱檢查（不在乎你的 entity 怎麼寫，只看資料庫長出來的樣子）
 * 注意：USER 是 PostgreSQL 保留字，raw SQL 一律寫 "USER"
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { Client } from "pg";

let db;
beforeAll(async () => {
  db = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME || "student",
    password: process.env.DB_PASSWORD || "student666",
    database: process.env.DB_DATABASE || "livefit",
  });
  await db.connect();
});
afterAll(async () => {
  await db.end();
});

const col = async (table, column) =>
  (
    await db.query(
      `SELECT data_type, character_maximum_length AS len, is_nullable
     FROM information_schema.columns WHERE table_name=$1 AND column_name=$2`,
      [table, column],
    )
  ).rows[0];

describe("任務 1｜USER 表", () => {
  test("表存在（大寫 USER）", async () => {
    const r = await db.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='USER'`,
    );
    expect(r.rows.length).toBe(1);
  });
  test("欄位規格：name varchar(50) 必填", async () => {
    const c = await col("USER", "name");
    expect(c).toMatchObject({
      data_type: "character varying",
      len: 50,
      is_nullable: "NO",
    });
  });
  test("欄位規格：email varchar(320) 必填且唯一", async () => {
    const c = await col("USER", "email");
    expect(c).toMatchObject({
      data_type: "character varying",
      len: 320,
      is_nullable: "NO",
    });
    const u = await db.query(`
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage k USING (constraint_name)
      WHERE tc.table_name='USER' AND tc.constraint_type='UNIQUE' AND k.column_name='email'`);
    expect(u.rows.length).toBe(1);
  });
  test("欄位規格：role varchar(20) 必填、created_at / updated_at 都在", async () => {
    expect(await col("USER", "role")).toMatchObject({
      data_type: "character varying",
      len: 20,
      is_nullable: "NO",
    });
    expect(await col("USER", "created_at")).toBeDefined();
    expect(await col("USER", "updated_at")).toBeDefined();
  });
});

describe("任務 2｜SKILL 與 COURSE 表（含關聯）", () => {
  test("SKILL 表存在且 name varchar(50) 必填且唯一", async () => {
    expect(await col("SKILL", "name")).toMatchObject({
      data_type: "character varying",
      len: 50,
      is_nullable: "NO",
    });
    const u = await db.query(`
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage k USING (constraint_name)
      WHERE tc.table_name='SKILL' AND tc.constraint_type='UNIQUE' AND k.column_name='name'`);
    expect(u.rows.length).toBe(1);
  });
  test("COURSE 欄位規格：name varchar(100) 必填、description text 必填、start_at / end_at 都在、max_participants integer 必填、created_at / updated_at 都在", async () => {
    expect(await col("COURSE", "name")).toMatchObject({
      data_type: "character varying",
      len: 100,
      is_nullable: "NO",
    });
    expect(await col("COURSE", "description")).toMatchObject({
      data_type: "text",
      is_nullable: "NO",
    });
    expect(await col("COURSE", "start_at")).toBeDefined();
    expect(await col("COURSE", "end_at")).toBeDefined();
    expect(await col("COURSE", "max_participants")).toMatchObject({
      data_type: "integer",
      is_nullable: "NO",
    });
    expect(await col("COURSE", "created_at")).toBeDefined();
    expect(await col("COURSE", "updated_at")).toBeDefined();
  });
  test("關聯：COURSE.user_id → USER.id、COURSE.skill_id → SKILL.id 兩條 FK（不看名字，看關係）", async () => {
    const fks = await db.query(`
      SELECT k.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_col
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage k USING (constraint_name)
      JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
      WHERE tc.table_name='COURSE' AND tc.constraint_type='FOREIGN KEY'`);
    const pairs = fks.rows
      .map((r) => `${r.column_name}->${r.ref_table}.${r.ref_col}`)
      .sort();
    expect(pairs).toEqual(["skill_id->SKILL.id", "user_id->USER.id"]);
  });
});

describe("任務 4｜種子資料", () => {
  test("SKILL 三筆：重訓、瑜珈、飛輪", async () => {
    const r = await db.query(`SELECT name FROM "SKILL" ORDER BY name`);
    expect(r.rows.map((x) => x.name).sort()).toEqual(
      ["重訓", "飛輪", "瑜珈"].sort(),
    );
  });
  test("兩位教練：coach1@livefit.tw、coach2@livefit.tw，role 是 COACH", async () => {
    const r = await db.query(`SELECT email, role FROM "USER" ORDER BY email`);
    expect(r.rows).toEqual([
      { email: "coach1@livefit.tw", role: "COACH" },
      { email: "coach2@livefit.tw", role: "COACH" },
    ]);
  });
  test("四堂課都接上了教練與技能（FK 不可為空、JOIN 得回來）", async () => {
    const r = await db.query(`
      SELECT c.name, u.email, s.name AS skill
      FROM "COURSE" c JOIN "USER" u ON u.id = c.user_id JOIN "SKILL" s ON s.id = c.skill_id`);
    expect(r.rows.length).toBe(4);
    const names = r.rows.map((x) => x.name);
    expect(names).toEqual(expect.arrayContaining(["肌力入門班", "週末飛輪"]));
  });
  test("seed 可以重跑：再執行一次，筆數不翻倍", async () => {
    execSync("npx tsx db/seed.js", { stdio: "pipe" });
    const r = await db.query(`
      SELECT (SELECT count(*)::int FROM "SKILL") AS s,
             (SELECT count(*)::int FROM "USER") AS u,
             (SELECT count(*)::int FROM "COURSE") AS c`);
    expect(r.rows[0]).toEqual({ s: 3, u: 2, c: 4 });
  });
});

/**
 * W8 考場驗收 —— 全部走 information_schema 結構檢查。
 * 不管你的 entity 怎麼寫、用什麼 ORM，只看「資料庫實際長出來的表對不對」。
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { Client } from "pg";

let db;
beforeAll(async () => {
  db = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5433),
    user: process.env.DB_USERNAME || "student",
    password: process.env.DB_PASSWORD || "student666",
    database: process.env.DB_DATABASE || "school",
  });
  await db.connect();
});
afterAll(async () => {
  await db.end();
});

const tableExists = async (t) =>
  (
    await db.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
      [t],
    )
  ).rows.length === 1;

const col = async (table, column) =>
  (
    await db.query(
      `SELECT data_type, character_maximum_length AS len, is_nullable
     FROM information_schema.columns WHERE table_name=$1 AND column_name=$2`,
      [table, column],
    )
  ).rows[0];

const fkPairs = async (table) => {
  const r = await db.query(
    `SELECT k.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_col
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage k USING (constraint_name)
     JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
     WHERE tc.table_name=$1 AND tc.constraint_type='FOREIGN KEY'`,
    [table],
  );
  return r.rows
    .map((x) => `${x.column_name}->${x.ref_table}.${x.ref_col}`)
    .sort();
};

describe("任務 1｜CLASS 與 SUBJECT 表", () => {
  test("CLASS 表存在，name varchar(50) 必填", async () => {
    expect(await tableExists("CLASS")).toBe(true);
    expect(await col("CLASS", "name")).toMatchObject({
      data_type: "character varying",
      len: 50,
      is_nullable: "NO",
    });
  });
  test("SUBJECT 表存在，name varchar(50) 必填", async () => {
    expect(await tableExists("SUBJECT")).toBe(true);
    expect(await col("SUBJECT", "name")).toMatchObject({
      data_type: "character varying",
      len: 50,
      is_nullable: "NO",
    });
  });
});

describe("任務 2｜STUDENT 表（含班級關聯）", () => {
  test("STUDENT.name varchar(50) 必填", async () => {
    expect(await col("STUDENT", "name")).toMatchObject({
      data_type: "character varying",
      len: 50,
      is_nullable: "NO",
    });
  });
  test("STUDENT.class_id → CLASS.id 一條 FK，且 class_id 必填", async () => {
    expect(await fkPairs("STUDENT")).toEqual(["class_id->CLASS.id"]);
    expect(await col("STUDENT", "class_id")).toMatchObject({
      is_nullable: "NO",
    });
  });
});

describe("任務 3｜GRADE 表（學生 × 科目的多對多接法）", () => {
  test("GRADE.score integer 必填", async () => {
    expect(await col("GRADE", "score")).toMatchObject({
      data_type: "integer",
      is_nullable: "NO",
    });
  });
  test("GRADE 兩條 FK：student_id → STUDENT.id、subject_id → SUBJECT.id，且皆必填", async () => {
    expect(await fkPairs("GRADE")).toEqual([
      "student_id->STUDENT.id",
      "subject_id->SUBJECT.id",
    ]);
    expect(await col("GRADE", "student_id")).toMatchObject({
      is_nullable: "NO",
    });
    expect(await col("GRADE", "subject_id")).toMatchObject({
      is_nullable: "NO",
    });
  });
});

describe("任務 5｜種一點資料，證明表真的能用", () => {
  test("CLASS、SUBJECT 至少各 2 筆", async () => {
    const c = (await db.query(`SELECT count(*)::int AS n FROM "CLASS"`)).rows[0]
      .n;
    const s = (await db.query(`SELECT count(*)::int AS n FROM "SUBJECT"`))
      .rows[0].n;
    expect(c).toBeGreaterThanOrEqual(2);
    expect(s).toBeGreaterThanOrEqual(2);
  });
  test("成績接得起來：GRADE JOIN STUDENT、SUBJECT 查得回來", async () => {
    const r = await db.query(
      `SELECT g.score, st.name AS student, sub.name AS subject
       FROM "GRADE" g
       JOIN "STUDENT" st ON st.id = g.student_id
       JOIN "SUBJECT" sub ON sub.id = g.subject_id`,
    );
    expect(r.rows.length).toBeGreaterThanOrEqual(1);
  });
  test("seed 可以重跑：再執行一次，筆數不翻倍", async () => {
    const before = (await db.query(`SELECT count(*)::int AS n FROM "STUDENT"`))
      .rows[0].n;
    execSync("tsx db/seed.js", { stdio: "pipe" });
    const after = (await db.query(`SELECT count(*)::int AS n FROM "STUDENT"`))
      .rows[0].n;
    expect(after).toBe(before);
  });
});

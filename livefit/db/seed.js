/**
 * 任務 4：Seeder，種一些資料，證明你建立的資料表真的能使用。
 * 規則：可重複執行（先清空、再種入資料），即使執行多次也不會有資料疊加的狀況。
 * 執行順序：一定要先 npm run migration:run（沒有資料表，就無法種資料）
 */
import { course, skill, user } from "../entities/index.ts";
import { db, pool } from "./data-source.js";

/** 清空：被 FK 指著的表最後刪（先刪 COURSE，再 USER / SKILL）。
 *  不用 TRUNCATE（會被 FK 擋）；db.delete(table) 不帶 where 就是清空整張表。 */
async function clearAll() {
  for (const table of [course, user, skill]) {
    await db.delete(table);
  }
}

async function main() {
  await clearAll();

  // ======================================================================
  // TODO：依照任務內容的規格寫入資料
  //   1. SKILL 三筆：重訓、瑜珈、飛輪
  //   2. USER 兩位教練，role 都為 'COACH'：
  //      海格教練（coach1@livefit.tw）、小美教練（coach2@livefit.tw）
  //   3. COURSE 四堂課：肌力入門班、週末飛輪、晨間瑜珈、核心特訓
  //      每堂課記得接上教練跟技能
  //      關聯的接法：user / skill 直接放前面存好的教練、技能物件
  //     （TypeORM 會自動取出它的 id 填進外鍵），寫法範例：
  //      courseRepo.save({ name: '...', user: 教練物件, skill: 技能物件 })
  // ======================================================================

  const [workout, yoga, cycling] = await db
    .insert(skill)
    .values([{ name: "重訓" }, { name: "瑜珈" }, { name: "飛輪" }])
    .returning();

  const [hagrid, mei] = await db
    .insert(user)
    .values([
      { name: "海格教練", email: "coach1@livefit.tw", role: "COACH" },
      { name: "小美教練", email: "coach2@livefit.tw", role: "COACH" },
    ])
    .returning();

  await db.insert(course).values([
    {
      name: "肌力入門班",
      description: "躺著也很累",
      startAt: new Date("2026-08-03T19:00:00+08:00"),
      endAt: new Date("2026-08-03T20:00:00+08:00"),
      maxParticipants: 16,
      userId: hagrid.id,
      skillId: workout.id,
    },
    {
      name: "週末飛輪",
      description: "週末飛輪",
      startAt: new Date("2026-08-05T07:00:00+08:00"),
      endAt: new Date("2026-08-05T08:00:00+08:00"),
      maxParticipants: 8,
      userId: hagrid.id,
      skillId: cycling.id,
    },
    {
      name: "晨間瑜珈",
      description: "",
      startAt: new Date("2026-08-06T19:00:00+08:00"),
      endAt: new Date("2026-08-06T20:00:00+08:00"),
      maxParticipants: 12,
      userId: mei.id,
      skillId: yoga.id,
    },
    {
      name: "核心特訓",
      description: "練出水蛇腰",
      startAt: new Date("2026-08-08T10:00:00+08:00"),
      endAt: new Date("2026-08-08T11:00:00+08:00"),
      maxParticipants: 10,
      userId: mei.id,
      skillId: workout.id,
    },
  ]);

  console.log("🌱 seed 完成");
  await pool.end();
}

main().catch((e) => {
  console.error("seed 失敗：", e.message);
  process.exit(1);
});

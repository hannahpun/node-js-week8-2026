/**
 * 任務 5：Seeder，種一些資料，證明你建立的資料表真的能使用。
 * 規則：可重複執行（先清空、再種入資料），即使執行多次也不會有資料疊加的狀況。
 * 執行順序：一定要先 npm run db:migrate（沒有資料表，就無法種資料）
 */
// TODO：把你在 entities/ 設計好的 table import 進來，例如：
import { classes, grades, students, subjects } from "../entities/index.ts";
import { db, pool } from "./data-source.js";

/** 清空：被 FK 指著的表最後刪（GRADE 先刪，CLASS / SUBJECT 最後刪）。
 *  不用 TRUNCATE（會被 FK 擋）；db.delete(table) 不帶 where 就是清空整張表。 */
async function clearAll() {
  const ORDER = [grades, students, classes, subjects];
  for (const table of ORDER) {
    await db.delete(table);
  }
}

async function main() {
  await clearAll();

  // ================================================================================
  // TODO：依照任務內容的規格種資料（至少 2 班、2 科目、幾位學生、幾筆成績）
  //   1. 先種 CLASS / SUBJECT
  //   2. 再種 STUDENT（記得接上 class）
  //   3. 最後種 GRADE（記得接上 student + subject）
  //      關聯的接法：外鍵欄位直接放前面存好的那筆資料的 id
  //     （用 .returning() 把剛寫入的資料撈回來，就拿得到 id），寫法範例：
  //      const [classA] = await db.insert(class_).values({ name: '...' }).returning()
  //      await db.insert(student).values({ name: '...', classId: classA.id })
  //      await db.insert(grade).values({ score: 95, studentId: 學生.id, subjectId: 科目.id })
  // ================================================================================

  console.log("🌱 seed 完成");
  const [classA, classB] = await db
    .insert(classes)
    .values([{ name: "Class A" }, { name: "Class B" }])
    .returning();
  const [subjectMath, subjectEng] = await db
    .insert(subjects)
    .values([{ name: "Math" }, { name: "English" }])
    .returning();
  const [student1, student2] = await db
    .insert(students)
    .values([
      { name: "Alice", classId: classA.id },
      { name: "Bob", classId: classB.id },
    ])
    .returning();
  await db.insert(grades).values([
    { score: 90, studentId: student1.id, subjectId: subjectMath.id },
    { score: 85, studentId: student1.id, subjectId: subjectEng.id },
    { score: 78, studentId: student2.id, subjectId: subjectMath.id },
    { score: 92, studentId: student2.id, subjectId: subjectEng.id },
  ]);
  console.log("🌱 seed 完成");
  await pool.end();
}

main().catch((e) => {
  console.error("seed 失敗：", e.message);
  process.exit(1);
});

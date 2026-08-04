import { integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { students } from "./students";
import { subjects } from "./subjects";

export const grades = pgTable("GRADE", {
  id: uuid("id").primaryKey().defaultRandom(),
  score: integer("score").notNull(),
  studentId: uuid("student_id")
    .references(() => students.id, { onDelete: "cascade" })
    .notNull(),
  subjectId: uuid("subject_id")
    .references(() => subjects.id, { onDelete: "cascade" })
    .notNull(),
});

export const gradesRelations = relations(grades, ({ one }) => ({
  student: one(students, {
    fields: [grades.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [grades.subjectId],
    references: [subjects.id],
  }),
}));

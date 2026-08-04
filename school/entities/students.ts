import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { classes } from "./classes";

export const students = pgTable("STUDENT", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  classId: uuid("class_id")
    .references(() => classes.id, { onDelete: "cascade" })
    .notNull(),
});

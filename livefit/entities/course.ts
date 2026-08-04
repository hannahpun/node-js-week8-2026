import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { skill } from "./skill.ts";
import { user } from "./user.ts";

export const course = pgTable("COURSE", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  maxParticipants: integer("max_participants").notNull(),
  skillId: uuid("skill_id")
    .references(() => skill.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  meetingUrl: varchar("meeting_url", { length: 2048 }),
});

export const courseRelations = relations(course, ({ one }) => ({
  skill: one(skill, {
    fields: [course.skillId],
    references: [skill.id],
  }),
  user: one(user, {
    fields: [course.userId],
    references: [user.id],
  }),
}));

import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const subjects = pgTable("SUBJECT", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

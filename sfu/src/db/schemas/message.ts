import { pgTable, serial, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { meetings } from "./meetings";
import { user } from "./user";
import { memberStatusEnum } from "./enums";

export const message = pgTable("message", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id),
  userId: integer("user_id").notNull().references(() => user.id),
  content: varchar("content", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at"),
  isPinned: boolean("is_pinned").default(false),
  toUser: integer("to_user").references(() => user.id),
  status: memberStatusEnum("status").default("request"),
});

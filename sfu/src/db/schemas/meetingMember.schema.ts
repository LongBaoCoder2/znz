import { pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { meetings } from "./meetings.schema";
import { user } from "./user.schema";
import { meetingMemberRoleEnum } from "./enums";

export const meetingMember = pgTable("meeting_member", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id),
  userId: integer("user_id").references(() => user.id),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  joinedAt: timestamp("joined_at"),
  role: meetingMemberRoleEnum("role").default("participant"),
});

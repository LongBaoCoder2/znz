import { pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { meetingStatusEnum } from "./enums";
import { user } from "./user.schema";

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  displayId: varchar("display_id", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  pwdSalt: varchar("pwd_salt", { length: 255 }),
  uri: varchar("uri", { length: 255 }).notNull().unique(),
  host: integer("host").notNull().references(() => user.id),
  createdAt: timestamp("created_at"),
  status: meetingStatusEnum("status").default("created"),
});

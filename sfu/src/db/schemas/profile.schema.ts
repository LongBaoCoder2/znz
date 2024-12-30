import { pgTable, serial, varchar, timestamp, integer, text } from "drizzle-orm/pg-core";
import { user } from "./user.schema";

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  displayName: varchar("display_name", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  createdAt: timestamp("created_at"),
  lastLoginAt: timestamp("last_login_at"),
  userId: integer("user_id").references(() => user.id),
  avatarBase64: text("avatar_base64"),
});

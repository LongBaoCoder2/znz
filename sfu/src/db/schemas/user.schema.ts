import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 255 }),
  passwordHash: text("password_hash"),
  pwdSalt: text("pwd_salt"),
  emailVerified: timestamp("email_verified", { mode: "date" })
});

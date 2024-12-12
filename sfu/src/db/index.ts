import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Import schema
import { user } from "./schemas/user";
import { profile } from "./schemas/profile";
import { meetings } from "./schemas/meetings";
import { meetingMember } from "./schemas/meetingMember";
import { message } from "./schemas/message";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
export const schemas = { user, profile, meetings, meetingMember, message };

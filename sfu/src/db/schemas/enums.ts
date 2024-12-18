import { pgEnum } from "drizzle-orm/pg-core";

export const meetingStatusEnum = pgEnum("meeting_status", ["created", "scheduled", "active", "completed", "cancelled"]);

export const memberStatusEnum = pgEnum("member_status", ["request", "joined", "leave"]);

export const meetingMemberRoleEnum = pgEnum("meeting_member_role", ["host", "participant"]);

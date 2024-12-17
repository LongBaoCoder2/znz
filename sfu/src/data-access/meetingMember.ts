import { db as database } from "@sfu/db";
import { meetingMember, meetingMemberRoleEnum } from "../db/schemas";
import { and, eq } from "drizzle-orm";

type MeetingMemberRole = (typeof meetingMemberRoleEnum.enumValues)[number];

// Create a new meeting member
export async function createMeetingMember(
  meetingId: number,
  userId: number | null,
  displayName: string,
  role: MeetingMemberRole = "participant"
) {
  const [newMember] = await database
    .insert(meetingMember)
    .values({
      meetingId,
      userId,
      displayName,
      joinedAt: new Date(),
      role
    })
    .returning();

  return newMember;
}

// Get a meeting member by ID
export async function getMeetingMemberById(memberId: number) {
  const member = await database.query.meetingMember.findFirst({
    where: eq(meetingMember.id, memberId)
  });
  return member;
}

// Get all members of a specific meeting
export async function getMeetingMembersByMeetingId(meetingId: number) {
  const members = await database.query.meetingMember.findMany({
    where: eq(meetingMember.meetingId, meetingId)
  });
  return members;
}

// Get all meetings a specific user is part of (Logined Participant)
export async function getMeetingsByUserId(userId: number) {
  const userMeetings = await database.query.meetingMember.findMany({
    where: eq(meetingMember.userId, userId)
  });
  return userMeetings;
}

// Update a meeting member's details
export async function updateMeetingMember(memberId: number, updatedFields: Partial<typeof meetingMember>) {
  await database.update(meetingMember).set(updatedFields).where(eq(meetingMember.id, memberId));
}

// Delete a meeting member by ID
export async function deleteMeetingMember(memberId: number) {
  await database.delete(meetingMember).where(eq(meetingMember.id, memberId));
}

// Remove all members from a specific meeting
export async function removeMeetingMembers(meetingId: number) {
  await database.delete(meetingMember).where(eq(meetingMember.meetingId, meetingId));
}

// Get meeting members by role
export async function getMeetingMembersByRole(meetingId: number, role: MeetingMemberRole) {
  const members = await database.query.meetingMember.findMany({
    where: and(eq(meetingMember.meetingId, meetingId), eq(meetingMember.role, role))
  });
  return members;
}

// Check if a user is a member of a specific meeting
export async function isMemberOfMeeting(userId: number, meetingId: number) {
  const member = await database.query.meetingMember.findFirst({
    where: and(eq(meetingMember.userId, userId), eq(meetingMember.meetingId, meetingId))
  });

  // Convert to boolean
  return !!member;
}

// Update a member's role
export async function updateMemberRole(memberId: number, newRole: MeetingMemberRole) {
  await database.update(meetingMember).set({ role: newRole }).where(eq(meetingMember.id, memberId));
}

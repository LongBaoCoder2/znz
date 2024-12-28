import crypto from "crypto";
import { db as database } from "@sfu/db";
import { meetingMember, meetings, meetingStatusEnum } from "../db/schemas";
import { eq } from "drizzle-orm";
import { hashPassword } from "../utils/crypt";

type MeetingStatus = (typeof meetingStatusEnum.enumValues)[number];

// Create a new meeting
export async function createMeeting(
  title: string,
  displayId: string,
  uri: string,
  hostId: number,
  hostName: string,
  password: string | undefined
) {
  const salt = crypto.randomBytes(128).toString("base64");

  let passwordHash: string | null = null;

  if (!password) {
    password = crypto.randomBytes(8).toString("hex");
  }

  passwordHash = await hashPassword(password, salt);

  const [newMeeting] = await database
    .insert(meetings)
    .values({
      title,
      displayId,
      passwordHash,
      pwdSalt: salt,
      uri,
      host: hostId,
      createdAt: new Date(),
      status: "created"
    })
    .returning();

  await database.insert(meetingMember).values({
    meetingId: newMeeting.id,
    userId: hostId,
    displayName: hostName,
    joinedAt: new Date(),
    role: "host"
  });

  return newMeeting;
}

// Get a meeting by its ID
export async function getMeetingById(meetingId: number) {
  const meeting = await database.query.meetings.findFirst({
    where: eq(meetings.id, meetingId)
  });
  return meeting;
}

// Get a meeting by uri
export async function getMeetingByUrl(uri: string) {
  const meeting = await database.query.meetings.findFirst({
    where: eq(meetings.uri, uri)
  });
  return meeting;
}

// Get a meeting by its display ID
export async function getMeetingByDisplayId(displayId: string) {
  const meeting = await database.query.meetings.findFirst({
    where: eq(meetings.displayId, displayId)
  });
  return meeting;
}

// Get all meetings hosted by a user
export async function getMeetingsByHostId(hostId: number) {
  const meetingsList = await database.query.meetings.findMany({
    where: eq(meetings.host, hostId)
  });
  return meetingsList;
}

// Update a meeting's details
export async function updateMeeting(meetingId: number, updatedFields: Partial<typeof meetings>) {
  await database.update(meetings).set(updatedFields).where(eq(meetings.id, meetingId));
}

// Delete a meeting by its ID
export async function deleteMeeting(meetingId: number) {
  await database.delete(meetings).where(eq(meetings.id, meetingId));
}

// Verify a meeting's password
export async function verifyMeetingPassword(meetingId: number, plainTextPassword: string) {
  const meeting = await getMeetingById(meetingId);

  if (!meeting) {
    return false;
  }

  const { passwordHash, pwdSalt } = meeting;

  if (!passwordHash || !pwdSalt) {
    return false;
  }

  const hash = await hashPassword(plainTextPassword, pwdSalt);
  return passwordHash === hash;
}
// Change the status of a meeting (e.g., from "created" to "in-progress" or "ended")
export async function updateMeetingStatus(meetingId: number, status: MeetingStatus) {
  await database.update(meetings).set({ status }).where(eq(meetings.id, meetingId));
}

// Get a meeting by its URI (useful for joining meetings directly via URI)
export async function getMeetingByUri(uri: string) {
  const meeting = await database.query.meetings.findFirst({
    where: eq(meetings.uri, uri)
  });
  return meeting;
}

// Get a list of meetings based on status (e.g., "created", "in-progress", "ended")
export async function getMeetingsByStatus(status: MeetingStatus) {
  const meetingList = await database.query.meetings.findMany({
    where: eq(meetings.status, status)
  });
  return meetingList;
}

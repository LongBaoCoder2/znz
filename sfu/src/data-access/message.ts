import { db as database } from "@sfu/db";
import { message } from "../db/schemas";
import { eq, and, or } from "drizzle-orm";

// Create a new message
export async function createMessage(
  meetingId: number,
  userId: number,
  content: string,
  toUser?: number,
  isPinned: boolean = false
) {
  const [newMessage] = await database
    .insert(message)
    .values({
      meetingId,
      userId,
      content,
      createdAt: new Date(),
      isPinned,
      toUser
    })
    .returning();

  return newMessage;
}

// Get a message by its ID
export async function getMessageById(messageId: number) {
  const messageItem = await database.query.message.findFirst({
    where: eq(message.id, messageId)
  });
  return messageItem;
}

// Get all messages for a specific meeting
export async function getMeetingMessages(meetingId: number) {
  const messages = await database.query.message.findMany({
    where: eq(message.meetingId, meetingId),
    orderBy: (message, { desc }) => desc(message.createdAt)
  });
  return messages;
}

// Get messages sent by a specific user in a meeting
export async function getUserMessagesInMeeting(meetingId: number, userId: number) {
  const messages = await database.query.message.findMany({
    where: and(eq(message.meetingId, meetingId), eq(message.userId, userId)),
    orderBy: (message, { desc }) => desc(message.createdAt)
  });
  return messages;
}

// Get messages directed to a specific user in a meeting
export async function getMessagesDirectedToUser(meetingId: number, toUserId: number) {
  const messages = await database.query.message.findMany({
    where: and(eq(message.meetingId, meetingId), eq(message.toUser, toUserId)),
    orderBy: (message, { desc }) => desc(message.createdAt)
  });
  return messages;
}

// Update a message
export async function updateMessage(messageId: number, updatedFields: Partial<typeof message>) {
  await database.update(message).set(updatedFields).where(eq(message.id, messageId));
}

// Delete a message
export async function deleteMessage(messageId: number) {
  await database.delete(message).where(eq(message.id, messageId));
}

// Delete all messages for a specific meeting
export async function deleteMeetingMessages(meetingId: number) {
  await database.delete(message).where(eq(message.meetingId, meetingId));
}

// Pin a message
export async function pinMessage(messageId: number) {
  await database.update(message).set({ isPinned: true }).where(eq(message.id, messageId));
}

// Unpin a message
export async function unpinMessage(messageId: number) {
  await database.update(message).set({ isPinned: false }).where(eq(message.id, messageId));
}

// Get pinned messages in a meeting
export async function getPinnedMeetingMessages(meetingId: number) {
  const pinnedMessages = await database.query.message.findMany({
    where: and(eq(message.meetingId, meetingId), eq(message.isPinned, true)),
    orderBy: (message, { desc }) => desc(message.createdAt)
  });
  return pinnedMessages;
}

// Check if a message exists
export async function messageExists(messageId: number) {
  const existingMessage = await database.query.message.findFirst({
    where: eq(message.id, messageId)
  });
  return !!existingMessage;
}

import { db as database } from "@sfu/db";
import { profile } from "../db/schemas";
import { and, eq, gte, lte } from "drizzle-orm";

// Create a new profile
export async function createProfile(userId: number, displayName: string, fullName: string,
                                    email: string, phoneNumber: string, avatarUrl: string) {
  const [newProfile] = await database
    .insert(profile)
    .values({
      userId,
      displayName,
      fullName,
      email,
      phoneNumber,
      avatarUrl,
      createdAt: new Date(),
      lastLoginAt: new Date()
    })
    .returning();

  return newProfile;
}

// Get a profile by its ID
export async function getProfileById(profileId: number) {
  const profileItem = await database.query.profile.findFirst({
    where: eq(profile.id, profileId)
  });
  return profileItem;
}

// Get a profile by user ID
export async function getProfileByUserId(userId: number) {
  const profileItem = await database.query.profile.findFirst({
    where: eq(profile.userId, userId)
  });
  return profileItem;
}

// Update a profile
export async function updateProfile(profileId: number, updatedFields: Partial<typeof profile>) {
  await database.update(profile).set(updatedFields).where(eq(profile.id, profileId));
}

export async function updateLastLogin(profileId: number) {
  await database.update(profile).set({ lastLoginAt: new Date() }).where(eq(profile.id, profileId));
}

export async function updateDisplayName(profileId: number, newDisplayName: string) {
  await database.update(profile).set({ displayName: newDisplayName }).where(eq(profile.id, profileId));
}

export async function updateAvatarUrl(profileId: number, newAvatarUrl: string) {
  await database.update(profile).set({ avatarUrl: newAvatarUrl }).where(eq(profile.id, profileId));
}

export async function updateLastLoginByUserId(userId: number) {
  await database.update(profile).set({ lastLoginAt: new Date() }).where(eq(profile.userId, userId));
}

export async function updateDisplayNameByUserId(userId: number, newDisplayName: string) {
  await database.update(profile).set({ displayName: newDisplayName }).where(eq(profile.userId, userId));
}

export async function updateAvatarUrlByUserId(userId: number, newAvatarUrl: string) {
  await database.update(profile).set({ avatarUrl: newAvatarUrl }).where(eq(profile.userId, userId));
}

// Delete a profile
export async function deleteProfile(profileId: number) {
  await database.delete(profile).where(eq(profile.id, profileId));
}

// Check if a profile exists
export async function profileExists(profileId: number) {
  const existingProfile = await database.query.profile.findFirst({
    where: eq(profile.id, profileId)
  });
  return !!existingProfile;
}

// Check if a user has a profile
export async function userHasProfile(userId: number) {
  const existingProfile = await database.query.profile.findFirst({
    where: eq(profile.userId, userId)
  });
  return !!existingProfile;
}

// Get profiles created within a specific time range
export async function getProfilesCreatedBetween(startDate: Date, endDate: Date) {
  const profiles = await database.query.profile.findMany({
    where: and(gte(profile.createdAt, startDate), lte(profile.createdAt, endDate))
  });
  return profiles;
}

// Get recently active profiles
export async function getRecentlyActiveProfiles(daysSinceLastLogin: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastLogin);

  const profiles = await database.query.profile.findMany({
    where: gte(profile.lastLoginAt, cutoffDate)
  });
  return profiles;
}

import crypto from "crypto";
import { db as database } from "@sfu/db";
import { hashPassword } from "../utils/crypt";
import { user } from "../db/schemas";
import { eq } from "drizzle-orm";

export async function createUser(username: string, plainTextPassword: string) {
  const salt = crypto.randomBytes(128).toString("base64");
  const hash = await hashPassword(plainTextPassword, salt);
  const [newUser] = await database
    .insert(user)
    .values({
      username,
      passwordHash: hash,
      pwdSalt: salt
    })
    .returning();
  return newUser;
}

// Get a user by ID
export async function getUserById(userId: number) {
  const existingUser = await database.query.user.findFirst({
    where: eq(user.id, userId)
  });
  return existingUser;
}

export async function getUserByUsername(username: string) {
  const existingUser = await database.query.user.findFirst({
    where: eq(user.username, username)
  });
  return existingUser;
}

// Delete a user by ID
export async function deleteUserById(userId: number) {
  await database.delete(user).where(eq(user.id, userId));
}

// Update a user's details
export async function updateUserById(userId: number, updatedFields: Partial<typeof user>) {
  await database.update(user).set(updatedFields).where(eq(user.id, userId));
}

// Update a user's password
export async function updateUserPasswordById(userId: number, plainTextPassword: string) {
  const salt = crypto.randomBytes(128).toString("base64");
  const hash = await hashPassword(plainTextPassword, salt);

  const newPassword = {
    passwordHash: hash,
    pwdSalt: salt
  }

  await database.update(user).set(newPassword).where(eq(user.id, userId));
}


// Verify a user's name and password
export async function verifyUserNamePassword(username: string, plainTextPassword: string) {
  const existingUser = await getUserByUsername(username);

  if (!existingUser) {
    return false;
  }

  const { passwordHash, pwdSalt } = existingUser;

  if (!passwordHash || !pwdSalt) {
    return false;
  }

  const hash = await hashPassword(plainTextPassword, pwdSalt);
  return passwordHash === hash;
}

export async function verifyUserPassword(userId: number, plainTextPassword: string) {
  const existingUser = await getUserById(userId);

  if (!existingUser) {
    return false;
  }

  const { passwordHash, pwdSalt } = existingUser;

  if (!passwordHash || !pwdSalt) {
    return false;
  }

  const hash = await hashPassword(plainTextPassword, pwdSalt);
  return passwordHash === hash;
}

// Set email verification status
export async function setEmailVerified(userId: number) {
  await database
    .update(user)
    .set({
      emailVerified: new Date()
    })
    .where(eq(user.id, userId));
}

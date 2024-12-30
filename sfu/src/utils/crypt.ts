import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export const ITERATIONS = 10000;

export function createUUID() {
  return uuidv4();
}

export async function hashPassword(plainTextPassword: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(plainTextPassword, salt, ITERATIONS, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString("hex"));
    });
  });
}



export function generateMeetingID(uriRoom?: string) {
  const uuid = uuidv4();
  const randomString = uuid.replace(/-/g, "").slice(0, 9);
  const meetingID = randomString.replace(/(.{3})/g, "$1-").slice(0, -1);
  if (uriRoom) return `${uriRoom.split('-')[0]}-${meetingID}`;

  return meetingID;
}


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

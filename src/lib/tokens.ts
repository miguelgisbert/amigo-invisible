import { randomBytes, randomUUID } from "node:crypto";

export function createId(): string {
  return randomUUID();
}

export function createToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

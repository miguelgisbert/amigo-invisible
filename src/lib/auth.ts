import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";
import { getSql } from "./db";
import type { Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";

const scryptAsync = promisify(scrypt);
const sessionCookieName = "amigo_session";
const sessionTtlMs = 1000 * 60 * 60 * 24 * 30;

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

type UserRow = {
  id: string;
  email: string;
  password_hash?: string;
  created_at: Date | string;
};

function mapUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(":");

  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  try {
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hash, "hex");

    return (
      derived.length === expected.length && timingSafeEqual(derived, expected)
    );
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionToken(request: NextRequest): string | null {
  return request.cookies.get(sessionCookieName)?.value ?? null;
}

export async function findUserByEmail(
  email: string,
): Promise<{ user: AuthUser; passwordHash: string } | null> {
  const sql = getSql();
  const [row] = await sql<UserRow[]>`
    select id, email, password_hash, created_at
    from users
    where email = ${normalizeEmail(email)}
    limit 1
  `;

  if (!row) {
    return null;
  }

  return {
    user: mapUser(row),
    passwordHash: row.password_hash ?? "",
  };
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<AuthUser> {
  const sql = getSql();
  const id = randomUUID();
  const [row] = await sql<UserRow[]>`
    insert into users (id, email, password_hash)
    values (${id}, ${normalizeEmail(email)}, ${passwordHash})
    returning id, email, created_at
  `;

  return mapUser(row);
}

export async function createSession(
  userId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionTtlMs);
  const sql = getSql();

  await sql`
    insert into sessions (token_hash, user_id, expires_at)
    values (${tokenHash}, ${userId}, ${expiresAt})
  `;

  await sql`delete from sessions where expires_at <= now()`;

  return { token, expiresAt };
}

export function isSecureRequest(request: NextRequest): boolean {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
  secure: boolean,
): void {
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(
  response: NextResponse,
  secure: boolean,
): void {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(
  request: NextRequest,
): Promise<AuthUser | null> {
  const token = getSessionToken(request);

  if (!token) {
    return null;
  }

  const sql = getSql();
  const [row] = await sql<UserRow[]>`
    select u.id, u.email, u.created_at
    from sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${hashSessionToken(token)}
      and s.expires_at > now()
    limit 1
  `;

  return row ? mapUser(row) : null;
}

export async function requireUser(
  request: NextRequest,
  locale: Locale,
): Promise<AuthUser> {
  const user = await getSessionUser(request);

  if (!user) {
    throw new AppError(
      getDictionary(locale).errors.authRequired,
      401,
      "AUTH_REQUIRED",
    );
  }

  return user;
}

export async function deleteSession(request: NextRequest): Promise<void> {
  const token = getSessionToken(request);

  if (!token) {
    return;
  }

  const sql = getSql();
  await sql`delete from sessions where token_hash = ${hashSessionToken(token)}`;
}

import { NextResponse, type NextRequest } from "next/server";
import {
  createSession,
  findUserByEmail,
  isValidEmail,
  isSecureRequest,
  normalizeEmail,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

const dummyHash = "scrypt:00:00";

export async function POST(request: NextRequest) {
  let locale: Locale = "ca";

  try {
    const body = await request.json();
    locale = resolveLocale(body?.locale, request.headers.get("accept-language"));
    const dict = getDictionary(locale);
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isValidEmail(email) || !password) {
      throw new AppError(dict.errors.invalidCredentials, 401);
    }

    const record = await findUserByEmail(email);
    const valid = await verifyPassword(
      password,
      record?.passwordHash ?? dummyHash,
    );

    if (!record || !valid) {
      throw new AppError(dict.errors.invalidCredentials, 401);
    }

    const session = await createSession(record.user.id);
    const response = NextResponse.json(
      { user: record.user },
      { headers: { "Cache-Control": "no-store" } },
    );
    setSessionCookie(
      response,
      session.token,
      session.expiresAt,
      isSecureRequest(request),
    );
    return response;
  } catch (error) {
    return errorResponse(error, locale);
  }
}

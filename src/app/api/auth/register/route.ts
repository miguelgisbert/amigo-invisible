import { NextResponse, type NextRequest } from "next/server";
import {
  createSession,
  createUser,
  findUserByEmail,
  hashPassword,
  isValidEmail,
  isSecureRequest,
  normalizeEmail,
  setSessionCookie,
} from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function POST(request: NextRequest) {
  let locale: Locale = "ca";

  try {
    const body = await request.json();
    locale = resolveLocale(body?.locale, request.headers.get("accept-language"));
    const dict = getDictionary(locale);
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isValidEmail(email)) {
      throw new AppError(dict.errors.emailInvalid, 400);
    }

    if (password.length < 8) {
      throw new AppError(dict.errors.passwordTooShort, 400);
    }

    if (password.length > 200) {
      throw new AppError(dict.errors.passwordTooLong, 400);
    }

    const existing = await findUserByEmail(email);

    if (existing) {
      throw new AppError(dict.errors.emailTaken, 409);
    }

    const passwordHash = await hashPassword(password);
    let user;

    try {
      user = await createUser(email, passwordHash);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new AppError(dict.errors.emailTaken, 409);
      }
      throw error;
    }

    const session = await createSession(user.id);
    const response = NextResponse.json(
      { user },
      { status: 201, headers: { "Cache-Control": "no-store" } },
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

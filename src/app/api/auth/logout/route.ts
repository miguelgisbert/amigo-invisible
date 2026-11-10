import { NextResponse, type NextRequest } from "next/server";
import {
  clearSessionCookie,
  deleteSession,
  isSecureRequest,
} from "@/lib/auth";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";

export async function POST(request: NextRequest) {
  let locale: Locale = "ca";

  try {
    locale = resolveLocale(
      request.nextUrl.searchParams.get("locale"),
      request.headers.get("accept-language"),
    );
    await deleteSession(request);
    const response = NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    clearSessionCookie(response, isSecureRequest(request));
    return response;
  } catch (error) {
    return errorResponse(error, locale);
  }
}

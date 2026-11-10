import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";

export async function GET(request: NextRequest) {
  let locale: Locale = "ca";

  try {
    locale = resolveLocale(
      request.nextUrl.searchParams.get("locale"),
      request.headers.get("accept-language"),
    );
    const user = await getSessionUser(request);

    return Response.json(
      { user },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error, locale);
  }
}

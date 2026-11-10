import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { listDrawsForUser } from "@/lib/draws";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { getBaseUrl } from "@/lib/url";

export async function GET(request: NextRequest) {
  let locale: Locale = "ca";

  try {
    locale = resolveLocale(
      request.nextUrl.searchParams.get("locale"),
      request.headers.get("accept-language"),
    );
    const user = await requireUser(request, locale);
    const draws = await listDrawsForUser(user.id, getBaseUrl(request), locale);

    return Response.json(
      { draws },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error, locale);
  }
}

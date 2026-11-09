import type { NextRequest } from "next/server";
import { getAdminDraw, getAdminView } from "@/lib/draws";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { getBaseUrl } from "@/lib/url";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ adminToken: string }> },
) {
  let locale: Locale = "ca";

  try {
    const { adminToken } = await context.params;
    locale = resolveLocale(
      request.nextUrl.searchParams.get("locale"),
      request.headers.get("accept-language"),
    );
    const draw = await getAdminDraw(adminToken, locale);
    const baseUrl = getBaseUrl(request);

    return Response.json(getAdminView(draw, baseUrl, locale), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error, locale);
  }
}

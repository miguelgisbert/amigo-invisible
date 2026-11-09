import type { NextRequest } from "next/server";
import { getRevealView } from "@/lib/draws";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getBaseUrl } from "@/lib/url";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  let locale: Locale = "ca";

  try {
    const { token } = await context.params;
    locale = resolveLocale(
      request.nextUrl.searchParams.get("locale"),
      request.headers.get("accept-language"),
    );
    const view = await getRevealView(token, getBaseUrl(request));

    if (!view) {
      return Response.json(
        { error: getDictionary(locale).errors.revealNotFound },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(view, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error, locale);
  }
}

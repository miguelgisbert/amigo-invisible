import type { NextRequest } from "next/server";
import { redraw } from "@/lib/draws";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";

export async function POST(
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
    const draw = await redraw(adminToken, locale);

    return Response.json({ ok: true, drawnAt: draw.drawnAt });
  } catch (error) {
    return errorResponse(error, locale);
  }
}

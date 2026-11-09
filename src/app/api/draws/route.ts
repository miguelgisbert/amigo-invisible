import type { NextRequest } from "next/server";
import { createDraw } from "@/lib/draws";
import { errorResponse } from "@/lib/http";
import { defaultLocale, resolveLocale, type Locale } from "@/lib/i18n/config";
import { getBaseUrl } from "@/lib/url";
import { createDrawSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let locale: Locale = defaultLocale;

  try {
    const body = await request.json();
    locale = resolveLocale(body.locale, request.headers.get("accept-language"));
    const input = createDrawSchema(locale).parse(body);
    const baseUrl = getBaseUrl(request);
    const draw = await createDraw(input, locale);

    return Response.json(
      {
        id: draw.id,
        adminToken: draw.adminToken,
        adminUrl: `${baseUrl}/${locale}/admin/${draw.adminToken}`,
        participantCount: draw.participants.length,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, locale);
  }
}

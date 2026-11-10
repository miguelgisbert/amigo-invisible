import type { NextRequest } from "next/server";
import { createFeedback } from "@/lib/feedback";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { feedbackSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let locale: Locale = "ca";

  try {
    const body = await request.json();
    locale = resolveLocale(body?.locale, request.headers.get("accept-language"));
    const input = feedbackSchema(locale).parse(body);

    if (input.website) {
      return Response.json(
        { ok: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    await createFeedback({
      kind: input.kind,
      message: input.message,
      email: input.email,
      page: input.page,
      locale: input.locale,
    });

    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error, locale);
  }
}

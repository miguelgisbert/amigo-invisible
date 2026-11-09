import type { NextRequest } from "next/server";
import { resendParticipant } from "@/lib/draws";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { getBaseUrl } from "@/lib/url";
import { resendSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ adminToken: string }> },
) {
  let locale: Locale = "ca";

  try {
    const { adminToken } = await context.params;
    const body = await request.json();
    locale = resolveLocale(body?.locale, request.headers.get("accept-language"));
    const input = resendSchema.parse(body);
    const result = await resendParticipant({
      adminToken,
      participantId: input.participantId,
      channel: input.channel,
      baseUrl: getBaseUrl(request),
      locale,
    });

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, locale);
  }
}

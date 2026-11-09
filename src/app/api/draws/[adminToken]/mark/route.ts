import type { NextRequest } from "next/server";
import { markParticipantSent } from "@/lib/draws";
import { errorResponse } from "@/lib/http";
import { resolveLocale, type Locale } from "@/lib/i18n/config";
import { markSentSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ adminToken: string }> },
) {
  let locale: Locale = "ca";

  try {
    const { adminToken } = await context.params;
    const body = await request.json();
    locale = resolveLocale(body?.locale, request.headers.get("accept-language"));
    const input = markSentSchema.parse(body);
    const result = await markParticipantSent({
      adminToken,
      participantId: input.participantId,
      sent: input.sent,
      channel: input.channel,
      locale,
    });

    return Response.json(result);
  } catch (error) {
    return errorResponse(error, locale);
  }
}

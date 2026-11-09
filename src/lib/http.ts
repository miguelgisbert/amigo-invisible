import { ZodError } from "zod";
import { AppError } from "./errors";
import type { Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";

export function errorResponse(error: unknown, locale: Locale): Response {
  const dict = getDictionary(locale);
  if (error instanceof AppError) {
    return Response.json(
      { error: error.message, code: error.code ?? null },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return Response.json(
      { error: error.issues[0]?.message ?? dict.errors.invalidRequest },
      { status: 400 },
    );
  }

  if (error instanceof SyntaxError) {
    return Response.json({ error: dict.errors.invalidRequest }, { status: 400 });
  }

  console.error(error);

  return Response.json({ error: dict.errors.unexpected }, { status: 500 });
}

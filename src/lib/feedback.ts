import { getSql } from "./db";
import { getEmailStatus, sendEmail } from "./email";
import type { Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";
import { createId } from "./tokens";

export type FeedbackRecordInput = {
  kind: "error" | "suggestion" | "other";
  message: string;
  email: string | null;
  page: string | null;
  locale: Locale;
};

export async function createFeedback(
  input: FeedbackRecordInput,
): Promise<string> {
  const sql = getSql();
  const id = createId();

  await sql`
    insert into feedback (id, source, kind, message, email, page, locale)
    values (
      ${id},
      'amigo-invisible',
      ${input.kind},
      ${input.message},
      ${input.email},
      ${input.page},
      ${input.locale}
    )
  `;

  const recipient = process.env.FEEDBACK_EMAIL?.trim();

  if (recipient && getEmailStatus().configured) {
    const dict = getDictionary(input.locale);
    const kindLabel = dict.feedback.kinds[input.kind];
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://amigoinvisible.miguelgisbert.dev";
    const pageUrl = input.page ? `${appUrl}${input.page}` : appUrl;
    const text = [
      "Origen: amigo-invisible.miguelgisbert.dev",
      `Tipus: ${kindLabel}`,
      `Pàgina: ${input.page ?? "desconeguda"}`,
      `Idioma: ${input.locale}`,
      `Contacte: ${input.email ?? "no indicat"}`,
      "",
      input.message,
    ].join("\n");

    const result = await sendEmail({
      to: recipient,
      subject: `[amigo-invisible] ${kindLabel}`,
      text,
      link: pageUrl,
      locale: input.locale,
      heading:
        input.locale === "es"
          ? "Nuevo comentario en amigo-invisible"
          : "Nou comentari a amigo-invisible",
      buttonLabel: input.locale === "es" ? "Abrir la app" : "Obrir l'app",
      footer:
        input.locale === "es"
          ? "Mensaje enviado desde el formulario de feedback de amigo-invisible."
          : "Missatge enviat des del formulari de feedback d'amigo-invisible.",
    });

    if (!result.ok) {
      console.error("Feedback email failed:", result.error);
    }
  }

  return id;
}

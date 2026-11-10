import { getSql } from "./db";
import type { Locale } from "./i18n/config";
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

  return id;
}

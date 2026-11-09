import { z } from "zod";
import type { Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";

function emptyToNull(value: unknown): unknown {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return value;
}

export function createDrawSchema(locale: Locale) {
  const dict = getDictionary(locale);
  const v = dict.wizard.validation;
  const server = v.serverFields;

  const optionalText = (max: number, message: string) =>
    z.preprocess(emptyToNull, z.string().max(max, message).nullable());

  const optionalPhone = z.preprocess(
    emptyToNull,
    z
      .string()
      .max(30, server.phoneTooLong)
      .regex(/^[+()0-9.\s-]{6,30}$/, server.phoneInvalid)
      .refine(
        (value) => value.replace(/\D/g, "").length >= 6,
        server.phoneDigits,
      )
      .nullable(),
  );

  const optionalEmail = z.preprocess(
    emptyToNull,
    z
      .string()
      .max(160, server.emailTooLong)
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, server.emailInvalid)
      .nullable(),
  );

  const optionalDate = z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, server.dateInvalid)
      .refine(
        (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
        server.dateInvalid,
      )
      .nullable(),
  );

  const optionalTime = z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, server.timeInvalid)
      .nullable(),
  );

  const optionalBudget = z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) {
      return null;
    }

    if (typeof value === "string") {
      return Number(value.replace(",", "."));
    }

    return value;
  }, z.number().finite(server.budgetInvalid).min(0, server.budgetNegative).max(1_000_000, server.budgetTooHigh).nullable());

  const participantSchema = z
    .object({
      name: z.string().trim().min(1, v.participantName).max(80, server.participantNameTooLong),
      phone: optionalPhone,
      email: optionalEmail,
    })
    .superRefine((participant, context) => {
      if (!participant.phone && !participant.email) {
        context.addIssue({
          code: "custom",
          message: v.contactFor(participant.name),
          path: ["phone"],
        });
      }
    });

  return z
    .object({
      name: z.string().trim().min(1, v.nameRequired).max(80, server.nameTooLong),
      budget: optionalBudget,
      date: optionalDate,
      time: optionalTime,
      location: optionalText(120, server.locationTooLong),
      template: z.string().trim().min(10, server.messageTooShort).max(4000, server.messageTooLong),
      participants: z
        .array(participantSchema)
        .min(2, v.minParticipants)
        .max(200, server.maxParticipants),
      exclusions: z
        .array(
          z.object({
            a: z.number().int().min(0),
            b: z.number().int().min(0),
          }),
        )
        .max(2000)
        .default([]),
    })
    .superRefine((data, context) => {
      const seenNames = new Map<string, number>();

      data.participants.forEach((participant, index) => {
        const key = participant.name.toLocaleLowerCase(locale);
        const existingIndex = seenNames.get(key);

        if (existingIndex !== undefined) {
          context.addIssue({
            code: "custom",
            message: v.duplicateName(participant.name),
            path: ["participants", index, "name"],
          });
        } else {
          seenNames.set(key, index);
        }
      });

      const seenRules = new Set<string>();

      data.exclusions.forEach((rule, index) => {
        if (
          rule.a >= data.participants.length ||
          rule.b >= data.participants.length
        ) {
          context.addIssue({
            code: "custom",
            message: server.exclusionInvalid,
            path: ["exclusions", index],
          });
          return;
        }

        if (rule.a === rule.b) {
          context.addIssue({
            code: "custom",
            message: v.selfExclusion,
            path: ["exclusions", index],
          });
          return;
        }

        const pair = [rule.a, rule.b].sort((left, right) => left - right).join(":");
        if (seenRules.has(pair)) {
          context.addIssue({
            code: "custom",
            message: v.duplicateRule,
            path: ["exclusions", index],
          });
        }
        seenRules.add(pair);
      });
    });
}

export const resendSchema = z.object({
  participantId: z.string().min(1),
  channel: z.enum(["whatsapp", "email"]),
  locale: z.enum(["ca", "es"]).optional(),
});

export const markSentSchema = z.object({
  participantId: z.string().min(1),
  sent: z.boolean(),
  channel: z.enum(["whatsapp", "email"]).optional(),
  locale: z.enum(["ca", "es"]).optional(),
});

export type CreateDrawInput = z.infer<ReturnType<typeof createDrawSchema>>;
export type ResendInput = z.infer<typeof resendSchema>;
export type MarkSentInput = z.infer<typeof markSentSchema>;

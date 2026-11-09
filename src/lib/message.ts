import { formatBudget, formatEventDate, formatEventTime, formatLocation } from "./format";
import type { Locale } from "./i18n/config";
import { getDictionary, getDefaultTemplate } from "./i18n/dictionaries";

export const TEMPLATE_EMOJIS = ["🎁", "✨", "🤫", "🎉", "🥂", "🫶", "🎈", "💌"];

export type MessageContext = {
  locale: Locale;
  giverName: string;
  receiverName: string;
  drawName: string;
  budget: number | null;
  eventDate: string | null;
  eventTime: string | null;
  location: string | null;
  link: string;
};

export function defaultTemplate(locale: Locale): string {
  return getDefaultTemplate(locale);
}

export function templateTokens(locale: Locale) {
  return getDictionary(locale).templates.tokens;
}

export function buildMessage(template: string, context: MessageContext): string {
  const replacements: Record<string, string> = {
    "{{giver}}": context.giverName,
    "{{receiver}}": context.receiverName,
    "{{draw}}": context.drawName,
    "{{budget}}": formatBudget(context.budget, context.locale),
    "{{date}}": formatEventDate(context.eventDate, context.locale),
    "{{time}}": formatEventTime(context.eventTime, context.locale),
    "{{location}}": formatLocation(context.location, context.locale),
    "{{link}}": context.link,
  };

  let message = template;

  for (const [placeholder, value] of Object.entries(replacements)) {
    message = message.replaceAll(placeholder, value);
  }

  if (!message.includes(context.link)) {
    message = `${message.trimEnd()}\n\n👉 ${context.link}`;
  }

  return message.trim();
}

export function emailSubject(drawName: string, locale: Locale): string {
  const safeName = drawName.replace(/[\r\n]+/g, " ").trim();
  return getDictionary(locale).email.subject(safeName);
}

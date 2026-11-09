import { intlLocale, type Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";

export function formatBudget(value: number | null, locale: Locale): string {
  if (value === null) {
    return getDictionary(locale).common.budgetPending;
  }

  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatEventDate(value: string | null, locale: Locale): string {
  const dict = getDictionary(locale);

  if (!value) {
    return dict.common.datePending;
  }

  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return dict.common.datePending;
  }

  const formatter = new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return capitalize(formatter.format(date));
}

export function formatShortDate(value: string | null, locale: Locale): string {
  const dict = getDictionary(locale);

  if (!value) {
    return dict.common.shortDatePending;
  }

  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return dict.common.shortDatePending;
  }

  const formatter = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

  return capitalize(formatter.format(date));
}

export function formatEventTime(value: string | null, locale: Locale): string {
  return value ? `${value} h` : getDictionary(locale).common.timePending;
}

export function formatLocation(value: string | null, locale: Locale): string {
  return value || getDictionary(locale).common.locationPending;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "?";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function normalizePhone(raw: string | null): string | null {
  if (!raw) {
    return null;
  }

  let digits = raw.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.length === 9) {
    digits = `34${digits}`;
  }

  return digits;
}

export function buildCalendarUrl(
  input: {
    name: string;
    date: string | null;
    time: string | null;
    location: string | null;
    budget: number | null;
  },
  locale: Locale,
): string | null {
  if (!input.date) {
    return null;
  }

  const dict = getDictionary(locale);
  const startDate = input.date.replaceAll("-", "");
  let dates: string;

  if (input.time) {
    const start = new Date(`${input.date}T${input.time}:00`);
    if (Number.isNaN(start.getTime())) {
      return null;
    }

    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const startStamp = `${startDate}T${input.time.replace(":", "")}00`;
    const endStamp = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, "0")}${String(
      end.getDate(),
    ).padStart(2, "0")}T${String(end.getHours()).padStart(2, "0")}${String(
      end.getMinutes(),
    ).padStart(2, "0")}00`;

    dates = `${startStamp}/${endStamp}`;
  } else {
    const start = new Date(`${input.date}T00:00:00Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const endStamp = `${end.getUTCFullYear()}${String(end.getUTCMonth() + 1).padStart(
      2,
      "0",
    )}${String(end.getUTCDate()).padStart(2, "0")}`;
    dates = `${startDate}/${endStamp}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: dict.calendar.title(input.name),
    dates,
    details:
      input.budget !== null
        ? dict.calendar.details(formatBudget(input.budget, locale))
        : dict.calendar.fallbackDetails,
  });

  if (input.location) {
    params.set("location", input.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

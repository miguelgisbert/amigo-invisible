export const locales = ["ca", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ca";

export const localeCookieName = "NEXT_LOCALE";

export function hasLocale(value: string | null | undefined): value is Locale {
  return value === "ca" || value === "es";
}

export function normalizeLocale(value: string | null | undefined): Locale {
  if (!value) {
    return defaultLocale;
  }

  return value.toLowerCase().startsWith("es") ? "es" : "ca";
}

export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) {
    return defaultLocale;
  }

  const ranked = header
    .split(",")
    .map((chunk) => {
      const [tag, ...parameters] = chunk.trim().split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.split("=")[1] ?? "1")
        : 1;

      return {
        tag: tag.trim().toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .sort((left, right) => right.quality - left.quality);

  for (const { tag } of ranked) {
    if (tag === "ca" || tag.startsWith("ca-")) {
      return "ca";
    }

    if (tag === "es" || tag.startsWith("es-")) {
      return "es";
    }
  }

  return defaultLocale;
}

export function resolveLocale(
  explicit: string | null | undefined,
  acceptLanguage?: string | null,
): Locale {
  if (hasLocale(explicit)) {
    return explicit;
  }

  return localeFromAcceptLanguage(acceptLanguage ?? null);
}

export function intlLocale(locale: Locale): string {
  return locale === "es" ? "es-ES" : "ca-ES";
}

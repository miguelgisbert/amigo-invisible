import { describe, expect, it } from "vitest";
import {
  hasLocale,
  intlLocale,
  localeFromAcceptLanguage,
  normalizeLocale,
  resolveLocale,
} from "./config";
import { getDictionary } from "./dictionaries";

describe("locale detection", () => {
  it("respects weighted Accept-Language headers", () => {
    expect(localeFromAcceptLanguage("ca-ES,ca;q=0.9,es;q=0.8")).toBe("ca");
    expect(localeFromAcceptLanguage("es-ES,es;q=0.9,en;q=0.8")).toBe("es");
    expect(localeFromAcceptLanguage("fr-FR,fr;q=0.9")).toBe("ca");
    expect(localeFromAcceptLanguage("fr,es;q=0.8,ca;q=0.7")).toBe("es");
    expect(localeFromAcceptLanguage(null)).toBe("ca");
  });

  it("normalizes explicit locales", () => {
    expect(normalizeLocale("es-ES")).toBe("es");
    expect(normalizeLocale("ca")).toBe("ca");
    expect(normalizeLocale("en-US")).toBe("ca");
    expect(normalizeLocale(undefined)).toBe("ca");
  });

  it("resolves explicit and header locales", () => {
    expect(resolveLocale("es", "ca-ES")).toBe("es");
    expect(resolveLocale("invalid", "es-ES")).toBe("es");
    expect(resolveLocale(null, null)).toBe("ca");
    expect(hasLocale("ca")).toBe(true);
    expect(hasLocale("en")).toBe(false);
    expect(intlLocale("ca")).toBe("ca-ES");
    expect(intlLocale("es")).toBe("es-ES");
  });
});

describe("dictionaries", () => {
  it("has Catalan and Spanish dictionaries", () => {
    expect(getDictionary("ca").common.appName).toBe("Amic invisible");
    expect(getDictionary("es").common.appName).toBe("Amigo invisible");
    expect(getDictionary("ca").landing.plainTitle).not.toContain("Nadal");
    expect(getDictionary("es").landing.plainTitle).not.toContain("Navidad");
  });
});

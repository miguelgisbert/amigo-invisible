import { describe, expect, it } from "vitest";
import { createDrawSchema, feedbackSchema } from "./validation";

const validPayload = {
  name: "Amic invisible feina",
  budget: 25,
  date: "2026-12-24",
  time: "20:30",
  location: "Barcelona",
  template: "Hola {{giver}}, regales a {{receiver}}. {{link}}",
  participants: [
    { name: "Marta", phone: "600111222", email: "marta@example.com" },
    { name: "Pau", phone: "600333444", email: null },
    { name: "Laia", phone: null, email: "laia@example.com" },
  ],
  exclusions: [{ a: 0, b: 1 }],
};

function firstError(locale: "ca" | "es", payload: unknown): string {
  const result = createDrawSchema(locale).safeParse(payload);
  expect(result.success).toBe(false);
  if (result.success) {
    return "";
  }
  return result.error.issues[0]?.message ?? "";
}

describe("createDrawSchema", () => {
  it("accepts a valid payload", () => {
    const result = createDrawSchema("ca").safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("normalizes comma budgets and empty optionals", () => {
    const result = createDrawSchema("ca").safeParse({
      ...validPayload,
      budget: "25,50",
      date: "",
      time: "",
      location: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.budget).toBe(25.5);
      expect(result.data.date).toBeNull();
      expect(result.data.location).toBeNull();
    }
  });

  it("requires a draw name", () => {
    expect(
      firstError("ca", {
        ...validPayload,
        name: "",
      }),
    ).toContain("Posa un nom");
  });

  it("requires a contact for each participant", () => {
    expect(
      firstError("ca", {
        ...validPayload,
        participants: [
          { name: "Marta", phone: null, email: null },
          { name: "Pau", phone: "600333444", email: null },
        ],
        exclusions: [],
      }),
    ).toContain("Afegeix un telèfon o un correu");
  });

  it("rejects duplicate names", () => {
    expect(
      firstError("es", {
        ...validPayload,
        participants: [
          { name: "Marta", phone: "600111222", email: null },
          { name: "Marta", phone: "600333444", email: null },
        ],
        exclusions: [],
      }),
    ).toContain("dos participantes");
  });

  it("rejects invalid budgets", () => {
    expect(
      firstError("ca", {
        ...validPayload,
        budget: "abc",
      }),
    ).toContain("pressupost");
  });

  it("rejects invalid emails", () => {
    expect(
      firstError("ca", {
        ...validPayload,
        participants: [
          { name: "Marta", phone: null, email: "no-email" },
          { name: "Pau", phone: "600333444", email: null },
        ],
        exclusions: [],
      }),
    ).toContain("correu");
  });

  it("rejects self exclusions", () => {
    expect(
      firstError("ca", {
        ...validPayload,
        exclusions: [{ a: 0, b: 0 }],
      }),
    ).toContain("no es pot excloure d'ella mateixa");
  });

  it("rejects out-of-range exclusions", () => {
    expect(
      firstError("ca", {
        ...validPayload,
        exclusions: [{ a: 0, b: 99 }],
      }),
    ).toContain("no és vàlida");
  });

  it("rejects duplicate exclusions", () => {
    expect(
      firstError("ca", {
        ...validPayload,
        exclusions: [
          { a: 0, b: 1 },
          { a: 1, b: 0 },
        ],
      }),
    ).toContain("regla duplicada");
  });

  it("localizes messages in Spanish", () => {
    expect(
      firstError("es", {
        ...validPayload,
        name: "",
      }),
    ).toBe("Pon un nombre al sorteo.");
  });
});


describe("feedbackSchema", () => {
  it("accepts a complete feedback message", () => {
    const result = feedbackSchema("ca").safeParse({
      kind: "suggestion",
      message: "M'agradaria poder eliminar un sorteig.",
      email: "miguel@example.com",
      page: "/ca/sortejos",
      locale: "ca",
      website: "",
    });

    expect(result.success).toBe(true);
  });

  it("defaults kind and locale", () => {
    const result = feedbackSchema("ca").safeParse({
      message: "Una suggerència de prova",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.kind).toBe("suggestion");
      expect(result.data.locale).toBe("ca");
    }
  });

  it("rejects short messages with the active locale", () => {
    const result = feedbackSchema("es").safeParse({
      message: "abc",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("algo más");
    }
  });

  it("rejects invalid feedback emails and pages", () => {
    const emailResult = feedbackSchema("ca").safeParse({
      message: "Missatge de prova",
      email: "no-email",
    });
    expect(emailResult.success).toBe(false);

    const pageResult = feedbackSchema("ca").safeParse({
      message: "Missatge de prova",
      page: "https://evil.example.com",
    });
    expect(pageResult.success).toBe(false);
  });
});

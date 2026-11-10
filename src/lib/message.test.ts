import { describe, expect, it } from "vitest";
import {
  buildMessage,
  defaultTemplate,
  emailSubject,
  templateTokens,
} from "./message";

const context = {
  locale: "ca" as const,
  giverName: "Marta",
  receiverName: "Pau",
  drawName: "Amic invisible feina",
  budget: 25,
  eventDate: "2026-12-24",
  eventTime: "20:30",
  location: "Barcelona",
  link: "https://example.com/r/token",
};

describe("buildMessage", () => {
  it("replaces every placeholder", () => {
    const message = buildMessage(
      "Hola {{giver}}, regales a {{receiver}}. {{draw}} · {{budget}} · {{date}} · {{time}} · {{location}} · {{link}}",
      context,
    );

    expect(message).toContain("Hola Marta");
    expect(message).toContain("regales a Pau");
    expect(message).toContain("Amic invisible feina");
    expect(message).toContain("25");
    expect(message).toContain("desembre");
    expect(message).toContain("20:30 h");
    expect(message).toContain("Barcelona");
    expect(message).toContain("https://example.com/r/token");
  });

  it("appends the private link when the template omits it", () => {
    const message = buildMessage("Hola {{giver}}!", context);
    expect(message).toContain("https://example.com/r/token");
  });

  it("uses localized fallbacks", () => {
    const message = buildMessage("{{budget}} · {{date}} · {{time}} · {{location}}", {
      ...context,
      locale: "es",
      budget: null,
      eventDate: null,
      eventTime: null,
      location: null,
    });

    expect(message).toContain("Por concretar");
    expect(message).toContain("Fecha por confirmar");
    expect(message).toContain("Hora por confirmar");
    expect(message).toContain("Lugar por confirmar");
  });
});

describe("templates", () => {
  it("provides localized default templates", () => {
    const ca = defaultTemplate("ca");
    const es = defaultTemplate("es");

    expect(ca).toContain("amic invisible");
    expect(es).toContain("amigo invisible");
    expect(ca).not.toContain("Nadal");
    expect(es).not.toContain("Navidad");
    expect(ca).toContain("{{link}}");
    expect(es).toContain("{{link}}");
  });

  it("provides tokens for the editor", () => {
    expect(templateTokens("ca").length).toBe(8);
    expect(templateTokens("es").map((token) => token.token)).toContain(
      "{{receiver}}",
    );
  });
});

describe("emailSubject", () => {
  it("sanitizes newlines and localizes", () => {
    expect(emailSubject("Line\nBreak", "ca")).toBe(
      "🎁 El teu amic invisible: Line Break",
    );
    expect(emailSubject("Sorteo", "es")).toBe(
      "🎁 Tu amigo invisible: Sorteo",
    );
  });
});

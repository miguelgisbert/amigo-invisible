import { describe, expect, it } from "vitest";
import {
  buildCalendarUrl,
  formatBudget,
  formatEventDate,
  formatEventTime,
  formatLocation,
  formatShortDate,
  initials,
  normalizePhone,
} from "./format";

describe("formatBudget", () => {
  it("formats euros for both locales", () => {
    const ca = formatBudget(25, "ca");
    const es = formatBudget(25.5, "es");

    expect(ca).toContain("25");
    expect(ca).toContain("€");
    expect(es).toContain("25,50");
    expect(es).toContain("€");
  });

  it("uses localized fallbacks", () => {
    expect(formatBudget(null, "ca")).toBe("A concretar");
    expect(formatBudget(null, "es")).toBe("Por concretar");
  });
});

describe("formatEventDate", () => {
  it("formats and capitalizes dates", () => {
    const ca = formatEventDate("2026-12-24", "ca");
    const es = formatEventDate("2026-12-24", "es");

    expect(ca).toContain("24");
    expect(ca).toContain("desembre");
    expect(ca).toContain("2026");
    expect(ca.charAt(0)).toBe(ca.charAt(0).toUpperCase());
    expect(es).toContain("diciembre");
  });

  it("uses localized fallbacks", () => {
    expect(formatEventDate(null, "ca")).toBe("Data per confirmar");
    expect(formatEventDate("not-a-date", "es")).toBe("Fecha por confirmar");
    expect(formatShortDate(null, "ca")).toBe("Per confirmar");
  });
});

describe("formatEventTime and formatLocation", () => {
  it("formats times and fallbacks", () => {
    expect(formatEventTime("20:30", "ca")).toBe("20:30 h");
    expect(formatEventTime(null, "ca")).toBe("Hora per confirmar");
    expect(formatEventTime(null, "es")).toBe("Hora por confirmar");
    expect(formatLocation("Barcelona", "ca")).toBe("Barcelona");
    expect(formatLocation(null, "ca")).toBe("Lloc per confirmar");
    expect(formatLocation(null, "es")).toBe("Lugar por confirmar");
  });
});

describe("normalizePhone", () => {
  it("normalizes Spanish numbers", () => {
    expect(normalizePhone("600 11 22 33")).toBe("34600112233");
    expect(normalizePhone("+34 600 11 22 33")).toBe("34600112233");
    expect(normalizePhone("0034 600 11 22 33")).toBe("34600112233");
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone("abc")).toBeNull();
  });
});

describe("initials", () => {
  it("returns up to two initials", () => {
    expect(initials("Marta Soler")).toBe("MS");
    expect(initials("Pau")).toBe("P");
    expect(initials("  ")).toBe("?");
  });
});

describe("buildCalendarUrl", () => {
  it("builds a localized Google Calendar URL", () => {
    const url = buildCalendarUrl(
      {
        name: "Amic invisible feina",
        date: "2026-12-24",
        time: "20:30",
        location: "Barcelona",
        budget: 25,
      },
      "ca",
    );

    expect(url).not.toBeNull();
    const parsed = new URL(url as string);
    expect(parsed.origin).toBe("https://calendar.google.com");
    expect(parsed.searchParams.get("text")).toBe(
      "Amic invisible: Amic invisible feina",
    );
    expect(parsed.searchParams.get("location")).toBe("Barcelona");
    expect(parsed.searchParams.get("details")).toContain("Pressupost");
    expect(parsed.searchParams.get("dates")).toContain("20261224");
  });

  it("returns null without a date", () => {
    expect(
      buildCalendarUrl(
        {
          name: "Test",
          date: null,
          time: null,
          location: null,
          budget: null,
        },
        "ca",
      ),
    ).toBeNull();
  });
});

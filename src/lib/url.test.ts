import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { getBaseUrl } from "./url";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const originalAppUrlAlt = process.env.APP_URL;

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_APP_URL;
  delete process.env.APP_URL;
});

afterAll(() => {
  if (originalAppUrl !== undefined) {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
  if (originalAppUrlAlt !== undefined) {
    process.env.APP_URL = originalAppUrlAlt;
  }
});

describe("getBaseUrl", () => {
  it("uses the configured URL and strips trailing slashes", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com///";
    expect(getBaseUrl(new NextRequest("http://localhost:3000"))).toBe(
      "https://example.com",
    );
  });

  it("uses forwarded proxy headers", () => {
    const request = new NextRequest("http://localhost:3000", {
      headers: {
        "x-forwarded-proto": "https, http",
        "x-forwarded-host": "amigo.example.com, internal",
      },
    });

    expect(getBaseUrl(request)).toBe("https://amigo.example.com");
  });

  it("falls back to the request origin", () => {
    const request = new NextRequest("http://localhost:3000/api/test");
    expect(getBaseUrl(request)).toBe("http://localhost:3000");
  });
});

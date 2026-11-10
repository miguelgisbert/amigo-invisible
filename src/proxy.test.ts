import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("locale proxy", () => {
  it("redirects / to the detected locale", () => {
    const response = proxy(
      new NextRequest("http://localhost/", {
        headers: { "accept-language": "es-ES,es;q=0.9" },
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/es");
  });

  it("redirects unprefixed paths preserving them", () => {
    const response = proxy(
      new NextRequest("http://localhost/crear", {
        headers: { "accept-language": "ca-ES" },
      }),
    );

    expect(response.headers.get("location")).toBe("http://localhost/ca/crear");
  });

  it("respects the locale cookie over Accept-Language", () => {
    const response = proxy(
      new NextRequest("http://localhost/", {
        headers: {
          "accept-language": "es-ES",
          cookie: "NEXT_LOCALE=ca",
        },
      }),
    );

    expect(response.headers.get("location")).toBe("http://localhost/ca");
  });

  it("passes through paths that already have a supported locale", () => {
    const response = proxy(new NextRequest("http://localhost/ca/crear"));
    expect(response.status).toBe(200);
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("ca");
  });

  it("does not redirect APIs, assets or paths with dots", () => {
    for (const path of ["/api/draws", "/_next/static/chunk.js", "/sw.js"]) {
      const response = proxy(new NextRequest(`http://localhost${path}`));
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  });
});

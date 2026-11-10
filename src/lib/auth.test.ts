import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  isSecureRequest,
  isValidEmail,
  normalizeEmail,
  verifyPassword,
} from "./auth";

describe("password hashing", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash).toMatch(/^scrypt:[a-f0-9]+:[a-f0-9]+$/);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(
      true,
    );
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("uses a salt per password", async () => {
    const first = await hashPassword("same-password");
    const second = await hashPassword("same-password");
    expect(first).not.toBe(second);
    expect(await verifyPassword("same-password", first)).toBe(true);
    expect(await verifyPassword("same-password", second)).toBe(true);
  });

  it("rejects malformed hashes", async () => {
    expect(await verifyPassword("password", "not-a-hash")).toBe(false);
    expect(await verifyPassword("password", "scrypt:00:00")).toBe(false);
  });
});

describe("session tokens", () => {
  it("creates url-safe random tokens", () => {
    const first = createSessionToken();
    const second = createSessionToken();

    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(first.length).toBeGreaterThan(30);
  });

  it("hashes deterministically", () => {
    const token = "a-test-token";
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSessionToken(token)).not.toBe(
      hashSessionToken("another-token"),
    );
  });
});

describe("email helpers", () => {
  it("normalizes and validates emails", () => {
    expect(normalizeEmail("  MIGUEL@Example.COM ")).toBe(
      "miguel@example.com",
    );
    expect(isValidEmail("miguel@example.com")).toBe(true);
    expect(isValidEmail("no-email")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
});

describe("request security", () => {
  it("detects HTTPS requests", () => {
    expect(isSecureRequest(new NextRequest("https://example.com"))).toBe(true);
    expect(isSecureRequest(new NextRequest("http://localhost:3000"))).toBe(
      false,
    );
    expect(
      isSecureRequest(
        new NextRequest("http://localhost:3000", {
          headers: { "x-forwarded-proto": "https" },
        }),
      ),
    ).toBe(true);
  });
});

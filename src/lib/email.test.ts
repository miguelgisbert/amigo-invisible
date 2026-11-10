import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createTransportMock, sendMailMock } = vi.hoisted(() => ({
  createTransportMock: vi.fn(),
  sendMailMock: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

import { getEmailStatus, sendEmail } from "./email";

const originalEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
};

function resetEmailEnv() {
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
}

function payload() {
  return {
    to: "marta@example.com",
    subject: "Hola",
    text: "Missatge de prova https://example.com/r/token",
    link: "https://example.com/r/token",
    locale: "ca" as const,
  };
}

beforeEach(() => {
  resetEmailEnv();
  vi.unstubAllGlobals();
  createTransportMock.mockReset();
  sendMailMock.mockReset();
  createTransportMock.mockReturnValue({ sendMail: sendMailMock });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

afterAll(() => {
  resetEmailEnv();
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
});

describe("getEmailStatus", () => {
  it("detects none, Resend and SMTP", () => {
    expect(getEmailStatus()).toEqual({
      configured: false,
      provider: "none",
    });

    process.env.RESEND_API_KEY = "re_test";
    expect(getEmailStatus()).toEqual({
      configured: false,
      provider: "resend",
    });

    process.env.EMAIL_FROM = "Test <test@example.com>";
    expect(getEmailStatus()).toEqual({
      configured: true,
      provider: "resend",
    });

    delete process.env.RESEND_API_KEY;
    process.env.SMTP_HOST = "smtp.example.com";
    expect(getEmailStatus()).toEqual({
      configured: true,
      provider: "smtp",
    });
  });
});

describe("sendEmail with Resend", () => {
  it("posts the localized email to Resend", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Test <test@example.com>";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendEmail(payload());

    expect(result).toEqual({ ok: true, provider: "resend" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.method).toBe("POST");
    const body = JSON.parse(String(options.body)) as {
      to: string[];
      text: string;
      html: string;
      subject: string;
    };
    expect(body.to).toEqual(["marta@example.com"]);
    expect(body.text).toBe(payload().text);
    expect(body.subject).toBe("Hola");
    expect(body.html).toContain("https://example.com/r/token");
  });

  it("returns the Resend error response", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Test <test@example.com>";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("bad request", { status: 400 })),
    );

    const result = await sendEmail(payload());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.provider).toBe("resend");
      expect(result.error).toContain("Resend");
    }
  });

  it("handles Resend network errors", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Test <test@example.com>";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await sendEmail(payload());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("connectar");
    }
  });
});

describe("sendEmail with SMTP", () => {
  it("uses nodemailer for SMTP", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASSWORD = "pass";
    process.env.EMAIL_FROM = "Test <test@example.com>";
    sendMailMock.mockResolvedValue(undefined);

    const result = await sendEmail(payload());

    expect(result).toEqual({ ok: true, provider: "smtp" });
    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.example.com",
        port: 587,
        secure: false,
      }),
    );
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "marta@example.com",
        subject: "Hola",
        text: payload().text,
      }),
    );
  });

  it("handles SMTP failures", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.EMAIL_FROM = "Test <test@example.com>";
    sendMailMock.mockRejectedValue(new Error("smtp down"));

    const result = await sendEmail(payload());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.provider).toBe("smtp");
      expect(result.error).toContain("SMTP");
      expect(result.error).toContain("smtp down");
    }
  });
});

describe("sendEmail without configuration", () => {
  it("returns a localized configuration error", async () => {
    const result = await sendEmail(payload());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.provider).toBe("none");
      expect(result.error).toContain("no està configurat");
    }
  });
});

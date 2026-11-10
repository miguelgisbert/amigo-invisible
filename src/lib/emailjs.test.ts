import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  feedbackContactEmail,
  isEmailJsConfigured,
  sendFeedbackWithEmailJs,
} from "./emailjs";

const originalPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const originalFeedbackEmail = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL;

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  delete process.env.NEXT_PUBLIC_FEEDBACK_EMAIL;
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

afterAll(() => {
  if (originalPublicKey !== undefined) {
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = originalPublicKey;
  }
  if (originalFeedbackEmail !== undefined) {
    process.env.NEXT_PUBLIC_FEEDBACK_EMAIL = originalFeedbackEmail;
  }
});

const input = {
  kindLabel: "Suggeriment",
  message: "M'agradaria poder eliminar un sorteig.",
  email: "marta@example.com",
  page: "/ca/sortejos",
  locale: "ca" as const,
  userName: "marta@example.com",
};

describe("EmailJS feedback", () => {
  it("is not configured without a public key", () => {
    expect(isEmailJsConfigured()).toBe(false);
    expect(feedbackContactEmail()).toBe("info@miguelgisbert.dev");
  });

  it("sends the feedback payload to EmailJS", async () => {
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = "public_test";
    process.env.NEXT_PUBLIC_FEEDBACK_EMAIL = "info@miguelgisbert.dev";
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("OK", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendFeedbackWithEmailJs(input);

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.emailjs.com/api/v1.0/email/send");
    const body = JSON.parse(String(options.body)) as {
      service_id: string;
      template_id: string;
      user_id: string;
      template_params: Record<string, string>;
    };
    expect(body.service_id).toBe("service_7514287");
    expect(body.template_id).toBe("template_beig3l2");
    expect(body.user_id).toBe("public_test");
    expect(body.template_params.source).toBe("amigo-invisible");
    expect(body.template_params.message).toBe(input.message);
    expect(body.template_params.page).toBe("/ca/sortejos");
    expect(body.template_params.to_email).toBe(
      "info@miguelgisbert.dev",
    );
    expect(body.template_params.reply_to).toBe("marta@example.com");
    expect(body.template_params.subject).toContain("[amigo-invisible]");
  });

  it("returns an error when EmailJS rejects the message", async () => {
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = "public_test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("rate limit", { status: 429 })),
    );

    const result = await sendFeedbackWithEmailJs(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("EmailJS");
    }
  });

  it("handles network errors", async () => {
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = "public_test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await sendFeedbackWithEmailJs(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("connectar");
    }
  });
});

import nodemailer from "nodemailer";
import type { Locale } from "./i18n/config";
import { getDictionary } from "./i18n/dictionaries";

export type EmailProvider = "resend" | "smtp" | "none";

export type EmailResult =
  | { ok: true; provider: Exclude<EmailProvider, "none"> }
  | { ok: false; provider: EmailProvider; error: string };

export type EmailStatus = {
  configured: boolean;
  provider: EmailProvider;
};

function fromAddress(): string | undefined {
  const value = process.env.EMAIL_FROM?.trim();
  return value ? value : undefined;
}

function resendKey(): string | undefined {
  const value = process.env.RESEND_API_KEY?.trim();
  return value ? value : undefined;
}

function smtpHost(): string | undefined {
  const value = process.env.SMTP_HOST?.trim();
  return value ? value : undefined;
}

export function getEmailStatus(): EmailStatus {
  const from = fromAddress();

  if (resendKey() && from) {
    return { configured: true, provider: "resend" };
  }

  if (smtpHost() && from) {
    return { configured: true, provider: "smtp" };
  }

  if (resendKey()) {
    return { configured: false, provider: "resend" };
  }

  if (smtpHost()) {
    return { configured: false, provider: "smtp" };
  }

  return { configured: false, provider: "none" };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtml(message: string, link: string, locale: Locale): string {
  const dict = getDictionary(locale);
  const escapedLink = escapeHtml(link);
  const textWithLinks = escapeHtml(message)
    .split(escapedLink)
    .join(
      `<a href="${escapedLink}" style="color:#16513f;text-decoration:underline;text-underline-offset:3px;">${escapedLink}</a>`,
    )
    .replaceAll("\n", "<br />");

  return `<!doctype html>
<html lang="${locale}">
  <body style="margin:0;padding:0;background:#f2efe4;">
    <div style="padding:28px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:560px;margin:0 auto;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#0b2a21;margin:0 0 18px 4px;">
          ${escapeHtml(dict.email.senderName)}
        </div>
        <div style="background:#fffdf7;border:1px solid #e2dccb;border-radius:24px;padding:28px 24px;">
          <div style="font-size:16px;line-height:1.75;color:#0b2a21;">${textWithLinks}</div>
          <a href="${escapedLink}" style="display:inline-block;margin-top:26px;background:#e63b2e;color:#fffdf7;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;border-radius:999px;">
            ${escapeHtml(dict.email.openLink)}
          </a>
        </div>
        <p style="margin:16px 6px 0;font-size:12px;line-height:1.6;color:#5d6b62;">
          Aquest correu és privat. L'enllaç mostra el teu emparellament i no l'hauries de compartir.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  link: string;
  locale: Locale;
}): Promise<EmailResult> {
  const dict = getDictionary(input.locale);
  const status = getEmailStatus();
  const from = fromAddress();

  if (!status.configured || !from) {
    return {
      ok: false,
      provider: status.provider,
      error: dict.email.errors.notConfigured,
    };
  }

  const html = buildHtml(input.text, input.link, input.locale);

  if (status.provider === "resend") {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          text: input.text,
          html,
        }),
      });

      if (!response.ok) {
        const details = (await response.text()).slice(0, 300);
        return {
          ok: false,
          provider: "resend",
          error: dict.email.errors.resendRejected(details),
        };
      }

      return { ok: true, provider: "resend" };
    } catch {
      return {
        ok: false,
        provider: "resend",
        error: dict.email.errors.resendConnection,
      };
    }
  }

  if (status.provider === "smtp") {
    try {
      const port = Number(process.env.SMTP_PORT ?? 587);
      const transporter = nodemailer.createTransport({
        host: smtpHost(),
        port,
        secure: port === 465,
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD ?? "",
            }
          : undefined,
      });

      await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html,
      });

      return { ok: true, provider: "smtp" };
    } catch (error) {
      return {
        ok: false,
        provider: "smtp",
        error:
          error instanceof Error
            ? dict.email.errors.smtpFailed(error.message)
            : dict.email.errors.smtpFailed(""),
      };
    }
  }

  return {
    ok: false,
    provider: "none",
    error: dict.email.errors.noProvider,
  };
}

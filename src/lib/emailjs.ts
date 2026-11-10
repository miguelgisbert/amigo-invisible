export type FeedbackEmailInput = {
  kindLabel: string;
  message: string;
  email: string | null;
  page: string;
  locale: "ca" | "es";
  userName: string | null;
};

const serviceId =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "service_7514287";
const templateId =
  process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "template_beig3l2";

export function feedbackContactEmail(): string {
  return (
    process.env.NEXT_PUBLIC_FEEDBACK_EMAIL ?? "info@miguelgisbert.dev"
  );
}

export function isEmailJsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
}

export async function sendFeedbackWithEmailJs(
  input: FeedbackEmailInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!publicKey) {
    return { ok: false, error: "EmailJS public key is not configured" };
  }

  const contact = input.email?.trim() || "No indicat";
  const sender = input.userName?.trim() || contact;
  const subject = `[amigo-invisible] ${input.kindLabel}`;

  const templateParams = {
    source: "amigo-invisible",
    page: input.page,
    locale: input.locale,
    kind: input.kindLabel,
    subject,
    message: input.message,
    name: sender,
    from_name: sender,
    email: contact,
    from_email: contact,
    reply_to: input.email?.trim() || "",
    to_email: feedbackContactEmail(),
    user_name: sender,
    user_email: contact,
    user_message: input.message,
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const details = (await response.text()).slice(0, 300);
      return {
        ok: false,
        error: `EmailJS rejected the message. ${details}`,
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "No s'ha pogut connectar amb EmailJS.",
    };
  }
}

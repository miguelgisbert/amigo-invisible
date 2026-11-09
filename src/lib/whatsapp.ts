import { normalizePhone } from "./format";

export function buildWhatsAppUrl(
  phone: string | null,
  message: string,
): string | null {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return null;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

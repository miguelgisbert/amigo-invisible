import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;
  return { title: getDictionary(locale).auth.loginMetaTitle };
}

export default function LoginPage() {
  return <AuthPage mode="login" />;
}

import type { Metadata } from "next";
import { MyDrawsPage } from "@/components/auth/my-draws-page";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;
  return {
    title: getDictionary(locale).auth.dashboardMetaTitle,
    robots: { index: false, follow: false },
  };
}

export default function DrawsPage() {
  return <MyDrawsPage />;
}

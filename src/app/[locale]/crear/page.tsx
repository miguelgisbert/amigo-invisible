import type { Metadata } from "next";
import { CreateWizard } from "@/components/create/create-wizard";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = getDictionary(locale);

  return {
    title: dict.wizard.metaTitle,
    description: dict.wizard.metaDescription,
  };
}

export default function CreatePage() {
  return <CreateWizard />;
}

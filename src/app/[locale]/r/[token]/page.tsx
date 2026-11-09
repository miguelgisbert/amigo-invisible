import type { Metadata } from "next";
import { Suspense } from "react";
import { RevealScreen } from "@/components/reveal/reveal-screen";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = {
  locale: string;
  token: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;

  return {
    title: getDictionary(locale).reveal.metaTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

async function RevealPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;

  return <RevealScreen token={token} />;
}

export default function Page({ params }: { params: Promise<Params> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-ink">
          <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6">
            <div className="h-96 animate-pulse rounded-[2rem] bg-paper/5" />
          </div>
        </div>
      }
    >
      <RevealPage params={params} />
    </Suspense>
  );
}

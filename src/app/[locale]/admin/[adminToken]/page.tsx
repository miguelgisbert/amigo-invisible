import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { defaultLocale, hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = {
  locale: string;
  adminToken: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;

  return {
    title: getDictionary(locale).admin.metaTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

async function AdminPage({ params }: { params: Promise<Params> }) {
  const { adminToken } = await params;

  return <AdminDashboard adminToken={adminToken} />;
}

export default function Page({ params }: { params: Promise<Params> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-paper">
          <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-8">
            <div className="h-72 animate-pulse rounded-[2rem] bg-ink/10" />
            <div className="mt-8 h-40 animate-pulse rounded-3xl bg-ink/5" />
          </div>
        </div>
      }
    >
      <AdminPage params={params} />
    </Suspense>
  );
}

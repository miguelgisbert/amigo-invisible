import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { SessionProvider } from "@/components/auth/session-provider";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { defaultLocale, hasLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = hasLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    ),
    title: {
      default: dict.meta.title,
      template: dict.meta.titleTemplate,
    },
    description: dict.meta.description,
    applicationName: dict.common.appName,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: "/icon.svg",
      apple: "/icons/apple-touch-icon.png",
    },
    appleWebApp: {
      capable: true,
      title: dict.common.appName,
      statusBarStyle: "default",
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.socialDescription,
      type: "website",
      locale: locale === "es" ? "es_ES" : "ca_ES",
      siteName: dict.common.appName,
      images: [
        {
          url: locale === "es" ? "/og-es.png" : "/og.png",
          width: 1200,
          height: 630,
          alt: dict.meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.socialDescription,
      images: [locale === "es" ? "/og-es.png" : "/og.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2efe4",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!hasLocale(rawLocale)) {
    notFound();
  }

  return (
    <html
      lang={rawLocale}
      className={`${instrumentSans.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-dvh font-sans antialiased" suppressHydrationWarning>
        <LocaleProvider key={rawLocale} initialLocale={rawLocale}>
          <SessionProvider>
            <PwaRegister />
            {children}
          </SessionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

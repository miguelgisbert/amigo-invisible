import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { ArrowRightIcon } from "@/components/icons";
import {
  localeCookieName,
  resolveLocale,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import "./globals.css";

export const instant = false;

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

export const metadata: Metadata = {
  title: "404 · Amic invisible",
  description: "Aquesta pàgina no existeix.",
};

export default async function GlobalNotFound() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const locale = resolveLocale(
    cookieStore.get(localeCookieName)?.value,
    headerList.get("accept-language"),
  );
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${instrumentSans.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-dvh bg-paper font-sans antialiased text-ink">
        <div className="flex min-h-dvh flex-col">
          <header className="border-b border-ink/10">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
              <Link
                href="/"
                aria-label={dict.common.appName}
                className="inline-flex items-center gap-2.5"
              >
                <svg
                  viewBox="0 0 40 40"
                  className="h-9 w-9 shrink-0"
                  aria-hidden="true"
                >
                  <rect width="40" height="40" rx="13" fill="#f0c060" />
                  <path
                    d="M20 10.5v19M10.5 20h19"
                    stroke="#0b2a21"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    opacity=".92"
                  />
                  <path
                    d="M20 10.5c-1.6-3.8-6.6-3.6-6.6.2 0 2.8 6.6 3.6 6.6 3.6s6.6-.8 6.6-3.6c0-3.8-5-4-6.6-.2Z"
                    fill="#e23a2e"
                  />
                </svg>
                <span className="font-display text-[1.35rem] leading-none tracking-[-0.01em]">
                  {dict.common.appName}
                </span>
              </Link>

              <div
                role="group"
                aria-label={dict.common.language}
                className="inline-flex items-center gap-0.5 rounded-full border border-ink/15 bg-cream/80 p-0.5"
              >
                {(["ca", "es"] as Locale[]).map((option) => (
                  <Link
                    key={option}
                    href={`/${option}`}
                    aria-current={locale === option ? "true" : undefined}
                    className={
                      locale === option
                        ? "grid min-h-8 min-w-9 place-items-center rounded-full bg-ink px-2 text-[0.65rem] font-semibold text-paper"
                        : "grid min-h-8 min-w-9 place-items-center rounded-full px-2 text-[0.65rem] font-semibold text-ink/60 hover:bg-ink/5 hover:text-ink"
                    }
                  >
                    {option.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
            <p className="text-xs font-medium text-ink/50">404</p>
            <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-[-0.02em]">
              {dict.notFound.title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-ink/60">
              {dict.notFound.body}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/" className="btn btn-primary">
                {dict.notFound.home}
              </Link>
              <Link href="/crear" className="btn btn-outline">
                {dict.notFound.create}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </main>

          <footer className="border-t border-ink/10 px-5 py-6 sm:px-8">
            <div className="mx-auto flex max-w-3xl items-center">
              <p className="text-xs leading-5 text-ink/55">
                {dict.footer.copyright} · {dict.footer.madeBy}{" "}
                <a
                  href="https://miguelgisbert.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink/70 underline decoration-1 underline-offset-4 transition hover:text-pine"
                >
                  {dict.footer.linkLabel}
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

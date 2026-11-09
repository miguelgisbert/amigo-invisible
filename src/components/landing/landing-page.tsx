"use client";

import Link from "next/link";
import { Brand } from "@/components/brand";
import { RecentPanel } from "@/components/landing/recent-panel";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { PwaInstall } from "@/components/pwa/pwa-install";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRightIcon } from "@/components/icons";

export function LandingPage() {
  const { dict, href } = useI18n();
  const copy = dict.landing;

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-ink/50 sm:inline">
              {copy.toolLabel}
            </span>
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
        <div className="max-w-xl">
          <h1 className="text-3xl leading-[1.08] font-semibold tracking-[-0.02em] sm:text-4xl">
            {copy.plainTitle}
          </h1>
          <p className="mt-3 text-pretty text-base leading-7 text-ink/60">
            {copy.plainBody}
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-ink/10 bg-cream p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">{copy.startTitle}</h2>
              <p className="mt-1 text-sm leading-6 text-ink/55">
                {copy.startBody}
              </p>
            </div>
            <Link
              href={href("/crear")}
              className="btn btn-primary shrink-0"
            >
              {copy.startCta}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-ink/10 pt-4 text-xs text-ink/55">
            {copy.facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>

          <PwaInstall tone="ink" />
          <RecentPanel tone="ink" />
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-ink/70">
            {copy.howPlainTitle}
          </h2>
          <ol className="mt-3 space-y-2.5">
            {copy.howPlainSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-3 text-sm leading-6 text-ink/60"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-[0.65rem] font-semibold text-pine">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-ink/55">{copy.existingLink}</p>
        </section>

        <p className="mt-10 border-t border-ink/10 pt-5 text-xs leading-5 text-ink/50">
          {copy.privacy}
        </p>
      </main>

      <SiteFooter tone="light" note={false} width="narrow" />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  EuroIcon,
  GiftIcon,
  LinkIcon,
  LockIcon,
  MapPinIcon,
} from "@/components/icons";
import {
  buildCalendarUrl,
  formatBudget,
  formatEventDate,
  formatEventTime,
  formatLocation,
} from "@/lib/format";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { RevealView } from "@/lib/types";

type Status = "loading" | "ready" | "error";

function fallbackCopy(text: string): boolean {
  try {
    const element = document.createElement("textarea");
    element.value = text;
    element.setAttribute("readonly", "");
    element.style.position = "fixed";
    element.style.opacity = "0";
    document.body.appendChild(element);
    element.select();
    const copied = document.execCommand("copy");
    element.remove();
    return copied;
  } catch {
    return false;
  }
}

export function RevealScreen({ token }: { token: string }) {
  const { locale, dict, href } = useI18n();
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<RevealView | null>(null);
  const [error, setError] = useState(dict.reveal.invalidBody);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const localDict = getDictionary(locale);

    async function load() {
      try {
        const response = await fetch(
          `/api/reveal/${encodeURIComponent(token)}?locale=${locale}`,
          { cache: "no-store", signal: controller.signal },
        );
        const payload = (await response.json().catch(() => null)) as
          | RevealView
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            payload && "error" in payload && payload.error
              ? payload.error
              : localDict.reveal.invalidBody,
          );
        }

        setData(payload as RevealView);
        setStatus("ready");
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : localDict.reveal.invalidBody,
        );
        setStatus("error");
      }
    }

    void load();

    return () => controller.abort();
  }, [token, locale]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyLink() {
    const link = window.location.href;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      if (fallbackCopy(link)) {
        setCopied(true);
      }
    }
  }

  const calendarUrl = data
    ? buildCalendarUrl(
        {
          name: data.draw.name,
          date: data.draw.eventDate,
          time: data.draw.eventTime,
          location: data.draw.location,
          budget: data.draw.budget,
        },
        locale,
      )
    : null;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-ink text-paper">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(240,192,96,0.2),transparent_60%)]" />
        <div className="absolute -bottom-44 -left-32 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(226,58,46,0.16),transparent_65%)]" />
        <div className="absolute inset-0 bg-speckle opacity-25" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-5 py-5 sm:px-8">
        <Brand tone="paper" />
        <div className="flex items-center gap-2">
          <LocaleSwitcher tone="paper" />
          <span className="hidden items-center gap-1.5 rounded-full border border-paper/15 px-3 py-1.5 text-[0.65rem] font-medium text-paper/55 sm:inline-flex">
            <LockIcon className="h-3 w-3" />
            {dict.reveal.private}
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-4 pb-10 sm:px-6">
        {status === "loading" ? <LoadingCard /> : null}
        {status === "error" ? <ErrorCard message={error} /> : null}
        {status === "ready" && data ? (
          <article className="animate-rise relative mt-4 rounded-[2rem] bg-cream text-ink shadow-[0_50px_110px_-40px_rgba(0,0,0,0.7)]">
            <div className="animate-seal absolute -top-5 right-5 sm:-top-6 sm:right-8">
              <div className="grid h-16 w-16 rotate-6 place-items-center rounded-full bg-berry text-cream shadow-[0_18px_34px_-14px_rgba(0,0,0,0.8)] ring-4 ring-berry/25 sm:h-20 sm:w-20">
                <GiftIcon className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
            </div>

            <div className="p-6 pt-9 sm:p-9 sm:pt-11">
              <p className="text-[0.68rem] font-semibold tracking-[0.14em] break-words text-ink/55 uppercase">
                {data.draw.name}
              </p>
              <p className="mt-4 text-sm text-ink/60">
                {dict.reveal.greeting(data.participant.name)}
              </p>

              <p className="mt-7 text-[0.7rem] font-semibold tracking-[0.12em] text-berry uppercase">
                {dict.reveal.toGive}
              </p>
              <h1 className="mt-2 font-display text-[clamp(2.9rem,12vw,5.6rem)] leading-[0.88] tracking-[-0.025em] break-words">
                {data.receiver.name}
              </h1>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold/35 px-3.5 py-2 text-xs font-semibold text-ink/70">
                <EuroIcon className="h-4 w-4" />
                {dict.reveal.budget}: {formatBudget(data.draw.budget, locale)}
              </div>
            </div>

            <div className="mx-6 border-t border-dashed border-ink/20 sm:mx-9" />

            <div className="p-6 sm:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-pine">
                    <CalendarIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-ink/55 uppercase">
                      {dict.reveal.when}
                    </p>
                    <p className="mt-1 text-sm leading-5 font-semibold">
                      {formatEventDate(data.draw.eventDate, locale)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/55">
                      {formatEventTime(data.draw.eventTime, locale)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-pine">
                    <MapPinIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-ink/55 uppercase">
                      {dict.reveal.where}
                    </p>
                    <p className="mt-1 text-sm leading-5 font-semibold">
                      {formatLocation(data.draw.location, locale)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-mint/70 p-5">
                <p className="text-[0.65rem] font-semibold tracking-[0.1em] text-pine uppercase">
                  {dict.reveal.messageTitle}
                </p>
                <p className="mt-2.5 text-pretty text-sm leading-6 break-words whitespace-pre-wrap text-ink/70">
                  {data.message}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="btn btn-sm btn-dark"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  {copied ? dict.reveal.copied : dict.reveal.saveLink}
                </button>

                {calendarUrl ? (
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {dict.reveal.addCalendar}
                  </a>
                ) : null}
              </div>

              <p className="mt-5 flex gap-2 text-[0.7rem] leading-5 text-ink/55">
                <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {dict.reveal.privacy}
              </p>
            </div>
          </article>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-[0.7rem] text-paper/55">
          <span>{dict.reveal.lostLink}</span>
          <Link
            href={href("/")}
            className="inline-flex items-center gap-1.5 font-medium text-paper/65 hover:text-paper"
          >
            {dict.common.appName}
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>
      </main>

      <SiteFooter tone="dark" note={false} width="narrow" className="relative z-10" />
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="mt-4 rounded-[2rem] border border-paper/10 bg-paper/5 p-6 sm:p-9">
      <div className="h-3 w-28 animate-pulse rounded-full bg-paper/10" />
      <div className="mt-6 h-3 w-36 animate-pulse rounded-full bg-paper/10" />
      <div className="mt-4 h-16 w-3/4 animate-pulse rounded-2xl bg-paper/10" />
      <div className="mt-8 h-20 animate-pulse rounded-2xl bg-paper/5" />
      <div className="mt-4 h-28 animate-pulse rounded-2xl bg-paper/5" />
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  const { dict, href } = useI18n();

  return (
    <div className="animate-rise mt-6 rounded-[2rem] bg-cream p-8 text-center text-ink sm:p-12">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-berry/10 text-berry">
        <LockIcon className="h-6 w-6" />
      </span>
      <h1 className="mt-5 font-display text-4xl leading-none tracking-[-0.02em]">
        {dict.reveal.invalidTitle}
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink/60">
        {message}
      </p>
      <Link href={href("/")} className="btn btn-primary mt-6">
        {dict.notFound.home}
      </Link>
    </div>
  );
}

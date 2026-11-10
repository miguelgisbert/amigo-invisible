"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { useSession } from "@/components/auth/session-provider";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import {
  ArrowRightIcon,
  CalendarIcon,
  InfoIcon,
  MapPinIcon,
  PlusIcon,
  UsersIcon,
} from "@/components/icons";
import {
  formatEventDate,
  formatEventTime,
  formatLocation,
} from "@/lib/format";
import type { UserDrawSummary } from "@/lib/types";

export function MyDrawsPage() {
  const { user, loading } = useSession();
  const { locale, dict, href } = useI18n();
  const copy = dict.auth;
  const [draws, setDraws] = useState<UserDrawSummary[] | null>(null);
  const [loadingDraws, setLoadingDraws] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const response = await fetch(`/api/draws/mine?locale=${locale}`, {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | { draws: UserDrawSummary[] }
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            payload && "error" in payload && payload.error
              ? payload.error
              : copy.loadError,
          );
        }

        if (active) {
          setDraws((payload as { draws: UserDrawSummary[] }).draws);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : copy.loadError,
          );
        }
      } finally {
        if (active) {
          setLoadingDraws(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [user, locale, reload, copy.loadError]);

  function retry() {
    setLoadingDraws(true);
    setError(null);
    setReload((previous) => previous + 1);
  }

  async function logout() {
    setLoggingOut(true);

    try {
      await fetch(`/api/auth/logout?locale=${locale}`, { method: "POST" });
      window.location.assign(href("/"));
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-5 py-4 sm:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            {user ? (
              <button
                type="button"
                onClick={() => void logout()}
                disabled={loggingOut}
                className="btn btn-sm btn-ghost px-2.5 text-xs whitespace-nowrap"
              >
                <span className="sm:hidden">{copy.logoutShort}</span>
                <span className="hidden sm:inline">{copy.logout}</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        {loading ? (
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded-full bg-ink/5" />
            <div className="h-28 animate-pulse rounded-2xl bg-ink/5" />
          </div>
        ) : null}

        {!loading && !user ? (
          <div className="mx-auto max-w-sm rounded-2xl border border-ink/10 bg-cream p-6 text-center">
            <h1 className="text-xl font-semibold">
              {copy.dashboardGateTitle}
            </h1>
            <p className="mt-2 text-sm leading-6 text-ink/60">
              {copy.dashboardGateBody}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link href={href("/entrar")} className="btn btn-primary">
                {copy.loginCta}
              </Link>
              <Link href={href("/registre")} className="btn btn-outline">
                {copy.registerGate}
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && user ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.02em]">
                  {copy.dashboardTitle}
                </h1>
                <p className="mt-1 text-sm leading-6 text-ink/60">
                  {copy.dashboardBody}
                </p>
              </div>
              <Link href={href("/crear")} className="btn btn-primary shrink-0">
                <PlusIcon className="h-4 w-4" />
                {copy.newDraw}
              </Link>
            </div>

            <p className="mt-3 text-xs text-ink/45">{user.email}</p>

            {error ? (
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-berry/20 bg-berry/8 p-4 text-sm text-berry-deep sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2">
                  <InfoIcon className="h-4 w-4 shrink-0" />
                  {error}
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className="btn btn-sm btn-outline shrink-0"
                >
                  {dict.common.retry}
                </button>
              </div>
            ) : null}

            {loadingDraws && !error ? (
              <div className="mt-6 space-y-3">
                <div className="h-28 animate-pulse rounded-2xl bg-ink/5" />
                <div className="h-28 animate-pulse rounded-2xl bg-ink/5" />
              </div>
            ) : null}

            {!loadingDraws && !error && draws?.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-ink/20 px-6 py-12 text-center">
                <h2 className="text-base font-semibold">{copy.emptyTitle}</h2>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-ink/55">
                  {copy.emptyBody}
                </p>
                <Link href={href("/crear")} className="btn btn-primary mt-5">
                  {copy.newDraw}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            ) : null}

            {!loadingDraws && !error && draws && draws.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {draws.map((draw) => (
                  <li
                    key={draw.id}
                    className="rounded-2xl border border-ink/10 bg-cream p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-lg leading-tight font-semibold break-words">
                          {draw.name}
                        </h2>
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink/55">
                          <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                          {formatEventDate(draw.eventDate, locale)}
                          <span className="text-ink/30">·</span>
                          {formatEventTime(draw.eventTime, locale)}
                        </p>
                        {draw.location ? (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/55">
                            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                            {formatLocation(draw.location, locale)}
                          </p>
                        ) : null}
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/55">
                          <UsersIcon className="h-3.5 w-3.5 shrink-0" />
                          {dict.common.participantCount(draw.participantCount)}
                        </p>
                      </div>
                      <a
                        href={draw.adminUrl}
                        className="btn btn-sm btn-primary shrink-0"
                      >
                        {copy.openPanel}
                        <ArrowRightIcon className="h-4 w-4" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </main>

      <SiteFooter tone="light" note={false} width="narrow" />
    </div>
  );
}

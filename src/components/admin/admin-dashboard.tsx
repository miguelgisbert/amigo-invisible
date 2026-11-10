"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import { Avatar } from "@/components/ui/avatar";
import {
  CalendarIcon,
  ChatIcon,
  CheckCircleIcon,
  CopyIcon,
  EuroIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshIcon,
  UsersIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  formatBudget,
  formatEventTime,
  formatLocation,
  formatShortDate,
} from "@/lib/format";
import type { AdminDrawView, AdminParticipantView, SendChannel } from "@/lib/types";

type ToastState = {
  message: string;
  tone: "ok" | "error";
};

type LoadError = {
  message: string;
  status: number;
};

type ApiError = Error & { status?: number };

function errorStatus(error: unknown): number {
  if (error instanceof Error && "status" in error) {
    const value = (error as ApiError).status;
    return typeof value === "number" ? value : 0;
  }

  return 0;
}

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

export function AdminDashboard({ adminToken }: { adminToken: string }) {
  const searchParams = useSearchParams();
  const created = searchParams.get("created") === "1";
  const { locale, dict, href } = useI18n();
  const [data, setData] = useState<AdminDrawView | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [showAssignments, setShowAssignments] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [redrawing, setRedrawing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [confirmation, setConfirmation] = useState<{
    id: string;
    channel: SendChannel;
  } | null>(null);

  const notify = useCallback(
    (message: string, tone: ToastState["tone"] = "ok") => {
      setToast({ message, tone });
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function fetchDraw() {
      try {
        const response = await fetch(
          `/api/draws/${adminToken}?locale=${locale}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const payload = (await response.json().catch(() => null)) as
          | AdminDrawView
          | { error?: string }
          | null;

        if (!response.ok) {
          const error = new Error(
            payload && "error" in payload && payload.error
              ? payload.error
              : dict.errors.loadFailed,
          ) as ApiError;
          error.status = response.status;
          throw error;
        }

        if (!active) {
          return;
        }

        setData(payload as AdminDrawView);
        setLoadError(null);
      } catch (error) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setLoadError({
          message:
            error instanceof Error ? error.message : dict.errors.loadFailed,
          status: errorStatus(error),
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchDraw();

    return () => {
      active = false;
      controller.abort();
    };
  }, [adminToken, locale, reloadToken, dict.errors.loadFailed]);

  function retry() {
    setLoading(true);
    setLoadError(null);
    setReloadToken((previous) => previous + 1);
  }

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function currentAdminUrl(): string {
    if (typeof window === "undefined") {
      return data?.draw.adminUrl ?? "";
    }

    return `${window.location.origin}${href(`/admin/${adminToken}`)}`;
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify(dict.admin.toastCopied(label));
    } catch {
      if (fallbackCopy(text)) {
        notify(dict.admin.toastCopied(label));
      } else {
        notify(dict.admin.toastCopyError, "error");
      }
    }
  }

  function markLocal(participantId: string, sent: boolean, channel?: SendChannel) {
    setData((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        participants: previous.participants.map((participant) =>
          participant.id === participantId
            ? {
                ...participant,
                lastSentAt: sent ? new Date().toISOString() : null,
                lastSentChannel: sent
                  ? channel ?? participant.lastSentChannel ?? "whatsapp"
                  : null,
              }
            : participant,
        ),
      };
    });
  }

  async function markStatus(
    participant: AdminParticipantView,
    sent: boolean,
    channel?: SendChannel,
  ) {
    setBusy((previous) => ({ ...previous, [participant.id]: true }));

    try {
      const response = await fetch(`/api/draws/${adminToken}/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: participant.id,
          sent,
          channel,
          locale,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? dict.errors.markFailed);
      }

      markLocal(participant.id, sent, channel);
      notify(
        sent
          ? dict.admin.toastMarkedSent(participant.name)
          : dict.admin.toastMarkedPending(participant.name),
      );
      setConfirmation(null);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : dict.errors.markFailed,
        "error",
      );
    } finally {
      setBusy((previous) => {
        const next = { ...previous };
        delete next[participant.id];
        return next;
      });
    }
  }

  function openWhatsApp(participant: AdminParticipantView) {
    if (!participant.whatsappUrl) {
      return;
    }

    window.open(participant.whatsappUrl, "_blank", "noopener,noreferrer");
    setConfirmation({ id: participant.id, channel: "whatsapp" });
    notify(dict.admin.toastWhatsAppOpened(participant.name));
  }

  async function sendEmail(participant: AdminParticipantView) {
    setBusy((previous) => ({ ...previous, [participant.id]: true }));

    try {
      const response = await fetch(`/api/draws/${adminToken}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: participant.id,
          channel: "email",
          locale,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? dict.errors.unexpected);
      }

      markLocal(participant.id, true, "email");
      notify(dict.admin.toastEmailSent(participant.name));
    } catch (error) {
      notify(
        error instanceof Error ? error.message : dict.errors.unexpected,
        "error",
      );
    } finally {
      setBusy((previous) => {
        const next = { ...previous };
        delete next[participant.id];
        return next;
      });
    }
  }

  function openMailClient(participant: AdminParticipantView) {
    if (!participant.email || !data) {
      return;
    }

    const subject = encodeURIComponent(
      getDictionary(data.draw.locale).email.subject(data.draw.name),
    );
    const body = encodeURIComponent(participant.message);
    window.location.href = `mailto:${participant.email}?subject=${subject}&body=${body}`;
    setConfirmation({ id: participant.id, channel: "email" });
    notify(dict.admin.toastMailOpened(participant.name));
  }

  async function handleRedraw() {
    if (!window.confirm(dict.admin.redrawConfirm)) {
      return;
    }

    setRedrawing(true);

    try {
      const response = await fetch(
        `/api/draws/${adminToken}/redraw?locale=${locale}`,
        { method: "POST" },
      );
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? dict.admin.redrawError);
      }

      setShowAssignments(true);
      setReloadToken((previous) => previous + 1);
      notify(dict.admin.redrawSuccess);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : dict.admin.redrawError,
        "error",
      );
    } finally {
      setRedrawing(false);
    }
  }

  function statusLabel(participant: AdminParticipantView): string {
    if (!participant.lastSentAt) {
      return dict.common.pending;
    }

    if (participant.lastSentChannel === "email") {
      return dict.common.sentEmail;
    }

    if (participant.lastSentChannel === "whatsapp") {
      return dict.common.sentWhatsApp;
    }

    return dict.common.sent;
  }

  if (loading) {
    return (
      <AdminState>
        <div className="mx-auto mt-10 max-w-5xl px-5 sm:px-8">
          <div className="h-72 animate-pulse rounded-[2rem] bg-ink/10" />
          <div className="mt-8 h-40 animate-pulse rounded-3xl bg-ink/5" />
        </div>
      </AdminState>
    );
  }

  if (loadError || !data) {
    return (
      <AdminState>
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-berry/10 text-berry">
            <LockIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">
            {loadError?.status === 404
              ? dict.admin.notFoundTitle
              : dict.admin.loadErrorTitle}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink/60">
            {loadError?.message ?? dict.admin.notFoundBody}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link href={href("/")} className="btn btn-primary">
              {dict.notFound.home}
            </Link>
            {loadError?.status !== 404 ? (
              <button type="button" onClick={retry} className="btn btn-outline">
                {dict.common.retry}
              </button>
            ) : null}
          </div>
        </div>
      </AdminState>
    );
  }

  const { draw, participants, email } = data;

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-5 py-3.5 sm:px-8">
          <Brand />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <LocaleSwitcher />
            <span className="hidden items-center gap-1.5 text-xs font-medium text-ink/55 lg:inline-flex">
              <LockIcon className="h-3.5 w-3.5" />
              {dict.admin.private}
            </span>
            <button
              type="button"
              onClick={() => copyText(currentAdminUrl(), dict.admin.panelLink)}
              className="btn btn-sm btn-outline"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{dict.admin.copyAdmin}</span>
              <span className="sm:hidden">{dict.admin.copyAdminShort}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-6 sm:px-8">
        <section className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-cream">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 p-5 sm:p-6">
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink/50">
                {dict.admin.summaryLabel}
              </p>
              <h1 className="mt-1 text-2xl leading-tight font-semibold tracking-[-0.02em] break-words sm:text-3xl">
                {draw.name}
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-[0.7rem] font-semibold text-pine">
              <CheckCircleIcon className="h-3.5 w-3.5" />
              {dict.admin.sorted}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-px bg-ink/10 sm:grid-cols-4">
            <SummaryCell
              icon={<CalendarIcon className="h-3.5 w-3.5" />}
              label={dict.admin.when}
              value={formatShortDate(draw.eventDate, locale)}
              note={formatEventTime(draw.eventTime, locale)}
            />
            <SummaryCell
              icon={<MapPinIcon className="h-3.5 w-3.5" />}
              label={dict.admin.where}
              value={formatLocation(draw.location, locale)}
            />
            <SummaryCell
              icon={<EuroIcon className="h-3.5 w-3.5" />}
              label={dict.admin.budget}
              value={formatBudget(draw.budget, locale)}
            />
            <SummaryCell
              icon={<UsersIcon className="h-3.5 w-3.5" />}
              label={dict.admin.people}
              value={`${draw.participantCount}`}
              note={
                draw.exclusionCount > 0
                  ? dict.common.exclusionCount(draw.exclusionCount)
                  : dict.common.noExclusions
              }
            />
          </dl>

          <div className="flex flex-col gap-3 border-t border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink/50">
                {dict.admin.panelLink}
              </p>
              <p className="mt-1 truncate font-mono text-[0.7rem] text-ink/55">
                {draw.adminUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyText(currentAdminUrl(), dict.admin.panelLink)}
              className="btn btn-sm btn-outline"
            >
              <CopyIcon className="h-4 w-4" />
              {dict.common.copy}
            </button>
          </div>
        </section>

        {created ? (
          <div className="animate-rise mt-6 flex flex-col gap-4 rounded-2xl border border-pine/20 bg-mint/65 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex gap-3">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-pine" />
              <div>
                <p className="text-sm font-semibold">
                  {dict.admin.createdTitle}
                </p>
                <p className="mt-1 text-xs leading-5 text-ink/60">
                  {dict.admin.createdBody}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#participants" className="btn btn-sm btn-dark shrink-0">
                <ChatIcon className="h-4 w-4" />
                {dict.admin.createdAction}
              </a>
              <Link
                href={href("/sortejos")}
                className="btn btn-sm btn-ghost shrink-0"
              >
                {dict.admin.createdSecondary}
              </Link>
            </div>
          </div>
        ) : null}

        <section id="participants" className="mt-12 scroll-mt-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.01em] sm:text-2xl">
                {dict.admin.sectionSendTitle}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
                {dict.admin.sectionSendBody}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAssignments((previous) => !previous)}
              className="btn btn-sm btn-outline shrink-0"
            >
              {showAssignments ? (
                <>
                  <EyeOffIcon className="h-4 w-4" />
                  {dict.admin.hideAssignments}
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" />
                  {dict.admin.showAssignments}
                </>
              )}
            </button>
          </div>

          {!showAssignments ? (
            <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-ink/55">
              <LockIcon className="h-3.5 w-3.5 shrink-0" />
              {dict.admin.hiddenNote}
            </p>
          ) : null}

          {!email.configured ? (
            <div className="mt-4 flex gap-3 rounded-2xl border border-gold/45 bg-gold/15 p-4 text-xs leading-5 text-ink/65">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
              <div>
                <p className="font-semibold text-ink/75">
                  {dict.admin.emailNotConfiguredTitle}
                </p>
                <p className="mt-0.5">{dict.admin.emailNotConfiguredBody}</p>
              </div>
            </div>
          ) : null}

          <ul className="mt-5 space-y-3">
            {participants.map((participant, index) => {
              const pending = busy[participant.id];
              const showConfirmation = confirmation?.id === participant.id;

              return (
                <li
                  key={participant.id}
                  className="rounded-3xl border border-ink/10 bg-cream p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={participant.name} index={index} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {participant.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink/55">
                          {participant.phone ? (
                            <span className="inline-flex items-center gap-1">
                              <PhoneIcon className="h-3 w-3" />
                              {participant.phone}
                            </span>
                          ) : null}
                          {participant.email ? (
                            <span className="inline-flex min-w-0 items-center gap-1">
                              <MailIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{participant.email}</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold",
                        participant.lastSentAt
                          ? "bg-mint text-pine"
                          : "bg-ink/5 text-ink/60",
                      )}
                    >
                      {participant.lastSentAt ? (
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                      ) : null}
                      {statusLabel(participant)}
                    </span>
                  </div>

                  <div className="mt-3 rounded-2xl bg-paper/70 px-3.5 py-2.5 text-xs leading-5">
                    {showAssignments && participant.assignment ? (
                      <p className="flex items-center gap-1.5 font-medium text-pine">
                        <EyeIcon className="h-3.5 w-3.5 shrink-0" />
                        {dict.admin.assignment(participant.assignment.name)}
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 text-ink/55">
                        <LockIcon className="h-3.5 w-3.5 shrink-0" />
                        {dict.admin.hiddenPerParticipant}
                      </p>
                    )}
                  </div>

                  <div className="mt-3.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openWhatsApp(participant)}
                      disabled={!participant.phone || pending}
                      title={
                        participant.phone
                          ? dict.admin.sendWhatsApp
                          : dict.errors.noPhone
                      }
                      className="btn btn-sm btn-dark"
                    >
                      <ChatIcon className="h-4 w-4" />
                      {dict.admin.sendWhatsApp}
                    </button>

                    {email.configured ? (
                      <button
                        type="button"
                        onClick={() => void sendEmail(participant)}
                        disabled={!participant.email || Boolean(pending)}
                        title={
                          participant.email
                            ? dict.admin.sendEmail
                            : dict.errors.noEmail
                        }
                        className="btn btn-sm btn-outline"
                      >
                        {pending ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-ink/70" />
                        ) : (
                          <MailIcon className="h-4 w-4" />
                        )}
                        {dict.admin.sendEmail}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openMailClient(participant)}
                        disabled={!participant.email}
                        title={
                          participant.email
                            ? dict.common.openEmail
                            : dict.errors.noEmail
                        }
                        className="btn btn-sm btn-outline"
                      >
                        <MailIcon className="h-4 w-4" />
                        {dict.common.openEmail}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        copyText(participant.revealUrl, dict.common.copyLink)
                      }
                      className="btn btn-sm btn-ghost"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {dict.common.copyLink}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(participant.message, dict.common.copyMessage)
                      }
                      className="btn btn-sm btn-ghost"
                    >
                      <CopyIcon className="h-4 w-4" />
                      {dict.common.copyMessage}
                    </button>
                  </div>

                  {showConfirmation ? (
                    <div className="mt-3 rounded-2xl border border-pine/20 bg-mint/60 p-4">
                      <p className="text-sm font-semibold">
                        {dict.admin.sentConfirmTitle}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink/60">
                        {dict.admin.sentConfirmBody}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void markStatus(
                              participant,
                              true,
                              confirmation?.channel ?? "whatsapp",
                            )
                          }
                          disabled={pending}
                          className="btn btn-sm btn-dark"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          {dict.admin.sentConfirmYes}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmation(null)}
                          className="btn btn-sm btn-ghost"
                        >
                          {dict.admin.sentConfirmNo}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink/10 pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        void markStatus(
                          participant,
                          !participant.lastSentAt,
                          participant.lastSentChannel ?? "whatsapp",
                        )
                      }
                      disabled={pending}
                      className="text-[0.7rem] font-medium text-ink/55 transition hover:text-ink disabled:opacity-40"
                    >
                      {participant.lastSentAt
                        ? dict.admin.markPending
                        : dict.admin.markSent}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-12 rounded-3xl border border-berry/20 bg-berry/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-berry-deep">
                {dict.admin.redrawTitle}
              </h2>
              <p className="mt-1 max-w-lg text-xs leading-5 text-ink/60">
                {dict.admin.redrawBody}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleRedraw()}
              disabled={redrawing}
              className="btn btn-sm shrink-0 border border-berry/25 bg-transparent text-berry-deep hover:bg-berry/10"
            >
              {redrawing ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-berry/25 border-t-berry" />
              ) : (
                <RefreshIcon className="h-4 w-4" />
              )}
              {dict.admin.redrawButton}
            </button>
          </div>
        </section>

        <div className="mt-10 border-t border-ink/10 pt-6 text-xs leading-5 text-ink/55 sm:flex sm:items-center sm:justify-between">
          <p>{dict.admin.footerNote}</p>
          <Link href={href("/")} className="font-medium text-ink/60 hover:text-ink">
            {dict.common.home}
          </Link>
        </div>
      </main>

      <SiteFooter tone="light" note={false} />

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "animate-rise fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-sm items-center gap-2 rounded-full px-4 py-3 text-sm shadow-[0_20px_50px_-20px_rgba(11,42,33,0.6)]",
            toast.tone === "ok" ? "bg-ink text-paper" : "bg-berry text-cream",
          )}
        >
          {toast.tone === "ok" ? (
            <CheckCircleIcon className="h-4 w-4 shrink-0 text-gold" />
          ) : (
            <InfoIcon className="h-4 w-4 shrink-0" />
          )}
          <span className="min-w-0">{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCell({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="min-w-0 bg-cream p-4 sm:p-5">
      <dt className="flex items-center gap-1.5 text-[0.68rem] font-medium text-ink/50">
        {icon}
        {label}
      </dt>
      <dd className="mt-1.5 text-sm leading-5 font-semibold break-words">
        {value}
      </dd>
      {note ? (
        <dd className="mt-0.5 text-xs leading-5 text-ink/50">{note}</dd>
      ) : null}
    </div>
  );
}

function AdminState({ children }: { children: ReactNode }) {
  const { dict } = useI18n();

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <span className="hidden items-center gap-1.5 text-xs font-medium text-ink/55 sm:inline-flex">
              <LockIcon className="h-3.5 w-3.5" />
              {dict.admin.private}
            </span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

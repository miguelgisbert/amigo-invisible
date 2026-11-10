"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSession } from "@/components/auth/session-provider";
import { useI18n } from "@/components/i18n/locale-provider";
import {
  CheckCircleIcon,
  InfoIcon,
  SendIcon,
  XIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  feedbackContactEmail,
  sendFeedbackWithEmailJs,
} from "@/lib/emailjs";

type FeedbackKind = "error" | "suggestion" | "other";

export function FeedbackDialog({ tone = "light" }: { tone?: "dark" | "light" }) {
  const { user } = useSession();
  const { locale, dict } = useI18n();
  const copy = dict.feedback;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    }

    if (!open && dialog.open) {
      dialog.close();
      document.documentElement.style.overflow = "";
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function openDialog() {
    setSent(false);
    setError(null);
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (message.trim().length < 5) {
      setError(copy.messageShort);
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message,
          email: email ?? user?.email ?? null,
          page: window.location.pathname,
          locale,
          website,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? copy.error);
      }

      const emailResult = await sendFeedbackWithEmailJs({
        kindLabel: copy.kinds[kind],
        message,
        email: email ?? user?.email ?? null,
        page: window.location.pathname,
        locale,
        userName: user?.email ?? null,
      });

      if (!emailResult.ok) {
        console.error("Feedback EmailJS failed:", emailResult.error);
        setError(copy.notSent(feedbackContactEmail()));
        return;
      }

      setSent(true);
      setMessage("");
      setError(null);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : copy.error,
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-haspopup="dialog"
        className={cn(
          "mx-auto block max-w-3xl text-center text-lg leading-7 font-medium underline decoration-1 underline-offset-4 transition sm:text-xl",
          tone === "dark"
            ? "text-paper/85 hover:text-paper"
            : "text-ink/80 hover:text-ink",
        )}
      >
        {copy.inviteA}{" "}
        <strong>{copy.inviteError}</strong>
        {copy.inviteJoin}
        <strong>{copy.inviteSuggestion}</strong>
        {copy.inviteEnd}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={copy.title}
        className="date-dialog"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closeDialog();
          }
        }}
      >
        <div className="max-h-[90dvh] overflow-y-auto rounded-t-[2rem] border border-ink/10 bg-cream p-5 text-ink shadow-[0_-20px_60px_-30px_rgba(11,42,33,0.55)] sm:rounded-[2rem] sm:p-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15 sm:hidden" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl leading-none tracking-[-0.01em]">
                {copy.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/55">{copy.body}</p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              aria-label={copy.close}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {sent ? (
            <div className="mt-6 rounded-2xl bg-mint/65 p-5 text-center">
              <CheckCircleIcon className="mx-auto h-8 w-8 text-pine" />
              <p className="mt-2 text-sm font-semibold text-pine">
                {copy.thanks}
              </p>
              <button
                type="button"
                onClick={closeDialog}
                className="btn btn-sm btn-outline mt-4"
              >
                {copy.close}
              </button>
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
              {error ? (
                <div
                  role="alert"
                  className="flex gap-2 rounded-xl border border-berry/20 bg-berry/8 px-3 py-2.5 text-xs leading-5 text-berry-deep"
                >
                  <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : null}

              <div>
                <label htmlFor="feedback-kind" className="label">
                  {copy.kindLabel}
                </label>
                <select
                  id="feedback-kind"
                  className="input"
                  value={kind}
                  onChange={(event) =>
                    setKind(event.target.value as FeedbackKind)
                  }
                >
                  {(["error", "suggestion", "other"] as const).map((option) => (
                    <option key={option} value={option}>
                      {copy.kinds[option]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="feedback-message" className="label">
                  {copy.messageLabel}
                </label>
                <textarea
                  ref={textareaRef}
                  id="feedback-message"
                  className="input scrollbar-festive min-h-28 resize-none py-3 leading-6"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={copy.messagePlaceholder}
                  maxLength={2000}
                  required
                />
                <p className="mt-1.5 text-right text-[0.7rem] text-ink/40">
                  {message.length}/2000
                </p>
              </div>

              <div>
                <label htmlFor="feedback-email" className="label">
                  {copy.emailLabel}
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  className="input"
                  value={email ?? user?.email ?? ""}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>

              <div className="hidden" aria-hidden="true">
                <label htmlFor="feedback-website">Website</label>
                <input
                  id="feedback-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn btn-primary w-full"
              >
                {sending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />
                    {copy.sending}
                  </>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4" />
                    {copy.submit}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}

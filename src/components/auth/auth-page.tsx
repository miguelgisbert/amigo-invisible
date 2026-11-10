"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import { InfoIcon } from "@/components/icons";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { locale, dict, href } = useI18n();
  const copy = dict.auth;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const registering = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, locale }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? dict.errors.authFailed);
      }

      const requested = new URLSearchParams(window.location.search).get("next");
      const target =
        requested === "/crear"
          ? "/crear"
          : registering
            ? "/crear"
            : "/sortejos";

      window.location.assign(href(target));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : dict.errors.authFailed,
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand />
          <LocaleSwitcher />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            {registering ? copy.registerTitle : copy.loginTitle}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            {registering ? copy.registerBody : copy.loginBody}
          </p>

          <form
            onSubmit={(event) => void submit(event)}
            className="mt-6 space-y-4 rounded-2xl border border-ink/10 bg-cream p-5 sm:p-6"
          >
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
              <label htmlFor="auth-email" className="label">
                {copy.email}
              </label>
              <input
                id="auth-email"
                type="email"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="label">
                {copy.password}
              </label>
              <input
                id="auth-password"
                type="password"
                className="input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={registering ? "new-password" : "current-password"}
                minLength={registering ? 8 : undefined}
                required
              />
              {registering ? (
                <p className="mt-1.5 text-xs text-ink/50">
                  {copy.passwordHint}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting
                ? copy.working
                : registering
                  ? copy.registerCta
                  : copy.loginCta}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink/55">
            {registering ? copy.hasAccount : copy.noAccount}{" "}
            <Link
              href={href(registering ? "/entrar" : "/registre")}
              className="font-semibold text-pine hover:text-ink"
            >
              {registering ? copy.goLogin : copy.goRegister}
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter tone="light" note={false} width="narrow" />
    </div>
  );
}

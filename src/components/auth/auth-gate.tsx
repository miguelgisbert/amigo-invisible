"use client";

import Link from "next/link";
import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/site-footer";

export function AuthGate() {
  const { dict, href } = useI18n();
  const copy = dict.auth;
  const loginHref = href("/entrar?next=%2Fcrear");
  const registerHref = href("/registre?next=%2Fcrear");

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand />
          <LocaleSwitcher />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-sm rounded-2xl border border-ink/10 bg-cream p-6 text-center">
          <h1 className="text-xl font-semibold">{copy.gateTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-ink/60">{copy.gateBody}</p>
          <div className="mt-5 flex flex-col gap-2">
            <Link href={loginHref} className="btn btn-primary">
              {copy.loginCta}
            </Link>
            <Link href={registerHref} className="btn btn-outline">
              {copy.registerGate}
            </Link>
            <Link href={href("/")} className="btn btn-ghost">
              {copy.backHome}
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter tone="light" note={false} width="narrow" />
    </div>
  );
}

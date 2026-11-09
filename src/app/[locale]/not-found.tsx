"use client";

import Link from "next/link";
import { Brand } from "@/components/brand";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRightIcon } from "@/components/icons";

export default function NotFound() {
  const { dict, href } = useI18n();

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand />
          <LocaleSwitcher />
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
          <Link href={href("/")} className="btn btn-primary">
            {dict.notFound.home}
          </Link>
          <Link href={href("/crear")} className="btn btn-outline">
            {dict.notFound.create}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <SiteFooter tone="light" note={false} width="narrow" />
    </div>
  );
}

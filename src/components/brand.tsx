"use client";

import Link from "next/link";
import { useLocaleHref, useI18n } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9 shrink-0", className)}
      aria-hidden="true"
      focusable="false"
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
  );
}

export function Brand({
  href,
  tone = "ink",
  className,
}: {
  href?: string;
  tone?: "ink" | "paper";
  className?: string;
}) {
  const { dict } = useI18n();
  const localeHref = useLocaleHref();

  return (
    <Link
      href={href ?? localeHref("/")}
      aria-label={`${dict.common.appName}, ${dict.common.home}`}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <BrandMark />
      <span
        className={cn(
          "font-display text-[1.35rem] leading-none tracking-[-0.01em] sm:text-[1.4rem]",
          tone === "paper" ? "text-paper" : "text-ink",
        )}
      >
        {dict.common.appName}
      </span>
    </Link>
  );
}

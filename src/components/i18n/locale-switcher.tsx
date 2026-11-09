"use client";

import { useI18n } from "./locale-provider";
import { locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

export function LocaleSwitcher({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const { locale, setLocale, dict } = useI18n();

  return (
    <div
      role="group"
      aria-label={dict.common.language}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5",
        tone === "paper"
          ? "border-paper/20 bg-paper/10"
          : "border-ink/15 bg-cream/80",
      )}
    >
      {locales.map((option) => {
        const active = option === locale;
        const label =
          option === "ca" ? dict.common.catalan : dict.common.spanish;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option as Locale)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={cn(
              "grid min-h-8 min-w-9 place-items-center rounded-full px-2 text-[0.65rem] font-semibold tracking-[0.02em] transition",
              active
                ? tone === "paper"
                  ? "bg-cream text-ink"
                  : "bg-ink text-paper"
                : tone === "paper"
                  ? "text-paper/70 hover:bg-paper/10 hover:text-paper"
                  : "text-ink/60 hover:bg-ink/5 hover:text-ink",
            )}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

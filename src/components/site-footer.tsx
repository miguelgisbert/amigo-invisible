"use client";

import { FeedbackDialog } from "@/components/feedback/feedback-dialog";
import { useI18n } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";

export function SiteFooter({
  tone = "dark",
  note = true,
  width = "wide",
  className,
}: {
  tone?: "dark" | "light";
  note?: boolean;
  width?: "narrow" | "wide";
  className?: string;
}) {
  const { dict } = useI18n();
  const dark = tone === "dark";

  return (
    <div className={className}>
      <section
        className={cn(
          "border-y px-5 py-8 sm:px-8 sm:py-10",
          dark
            ? "border-paper/10 bg-paper/5"
            : "border-ink/10 bg-mint/45",
        )}
      >
        <div
          className={cn(
            "mx-auto",
            width === "narrow" ? "max-w-3xl" : "max-w-5xl",
          )}
        >
          <FeedbackDialog tone={tone} />
        </div>
      </section>

      <footer
        className={cn(
          "px-5 pt-6 pb-8 sm:px-8",
          dark ? "bg-ink text-paper/65" : "bg-paper text-ink/55",
        )}
      >
        <div
          className={cn(
            "mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
            width === "narrow" ? "max-w-3xl" : "max-w-5xl",
          )}
        >
          <p className="text-xs leading-5">
            {dict.footer.copyright} · {dict.footer.madeBy}{" "}
            <a
              href="https://miguelgisbert.dev"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "font-semibold underline decoration-1 underline-offset-4 transition",
                dark
                  ? "text-paper/85 hover:text-gold"
                  : "text-ink/75 hover:text-pine",
              )}
            >
              {dict.footer.linkLabel}
            </a>
          </p>

          {note ? (
            <p className="max-w-sm text-xs leading-5">
              {dict.footer.serverNote}
            </p>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
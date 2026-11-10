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
    <footer
      className={cn(
        "px-5 py-8 sm:px-8",
        dark
          ? "bg-ink text-paper/65"
          : "border-t border-ink/10 bg-paper text-ink/55",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
          width === "narrow" ? "max-w-3xl" : "max-w-5xl",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
          <FeedbackDialog tone={tone} />
        </div>

        {note ? (
          <p className="max-w-sm text-xs leading-5">
            {dict.footer.serverNote}
          </p>
        ) : null}
      </div>
    </footer>
  );
}

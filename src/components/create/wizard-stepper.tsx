"use client";

import { useI18n } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/cn";

export function WizardStepper({ current }: { current: number }) {
  const { dict } = useI18n();

  return (
    <ol className="mt-7 grid grid-cols-4 gap-1.5" aria-label={dict.wizard.header}>
      {dict.wizard.steps.map((label, index) => {
        const isCurrent = index === current;
        const isDone = index < current;

        return (
          <li key={label} aria-current={isCurrent ? "step" : undefined}>
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors duration-300",
                isDone ? "bg-berry" : isCurrent ? "bg-ink" : "bg-ink/10",
              )}
            />
            <span
              className={cn(
                "mt-2 hidden text-[0.7rem] font-medium sm:block",
                isCurrent ? "text-ink" : "text-ink/55",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

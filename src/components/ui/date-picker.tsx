"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { intlLocale } from "@/lib/i18n/config";

type CalendarView = {
  year: number;
  month: number;
};

type CalendarDay = {
  key: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIsoDate(value: string): CalendarView & { day: number } {
  const [year, month, day] = value.split("-").map(Number);

  return {
    year,
    month: month - 1,
    day,
  };
}

function todayIso(): string {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

function buildDays(view: CalendarView, today: string): CalendarDay[] {
  const firstOfMonth = new Date(view.year, view.month, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(view.year, view.month, 1 - mondayOffset);
  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const key = toIsoDate(year, month, day);

    days.push({
      key,
      day,
      inMonth: month === view.month,
      isToday: key === today,
    });
  }

  return days;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function DatePicker({
  value,
  onChange,
  id,
  labelId,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  labelId?: string;
  className?: string;
}) {
  const { locale, dict } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState("");
  const [view, setView] = useState<CalendarView>(() => {
    const parsed = value ? parseIsoDate(value) : null;
    return parsed
      ? { year: parsed.year, month: parsed.month }
      : { year: 2026, month: 11 };
  });

  const days = buildDays(view, today);
  const formatter = new Intl.DateTimeFormat(intlLocale(locale), {
    month: "long",
    year: "numeric",
  });
  const monthLabel = capitalize(
    formatter.format(new Date(view.year, view.month, 1)),
  );
  const triggerFormatter = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const triggerLabel = value
    ? triggerFormatter.format(new Date(`${value}T12:00:00`))
    : dict.datePicker.placeholder;
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(2024, 0, index + 1);
    return new Intl.DateTimeFormat(intlLocale(locale), {
      weekday: "short",
    }).format(day);
  });

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
      const selected =
        gridRef.current?.querySelector<HTMLButtonElement>(
          '[data-selected="true"]',
        );
      const todayButton =
        gridRef.current?.querySelector<HTMLButtonElement>('[data-today="true"]');
      (selected ?? todayButton ?? gridRef.current)?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function openPicker() {
    const parsed = value ? parseIsoDate(value) : null;
    const now = new Date();
    setToday(todayIso());
    setView(
      parsed
        ? { year: parsed.year, month: parsed.month }
        : { year: now.getFullYear(), month: now.getMonth() },
    );
    setOpen(true);
  }

  function closePicker() {
    setOpen(false);
  }

  function choose(date: string) {
    onChange(date);
    setOpen(false);
  }

  function moveMonth(offset: number) {
    setView((previous) => {
      const date = new Date(previous.year, previous.month + offset, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function handleGridKeys(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const index = Number(target.dataset.index);

    if (Number.isNaN(index)) {
      return;
    }

    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const offset = offsets[event.key];

    if (!offset) {
      return;
    }

    event.preventDefault();
    const next = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-index="${index + offset}"]`,
    );
    next?.focus();
  }

  return (
    <>
      <button
        type="button"
        id={id}
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        className={cn(
          "input flex items-center justify-between gap-3 text-left",
          !value && "text-ink/48",
          className,
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <span className="flex shrink-0 items-center gap-1 text-ink/55">
          <CalendarIcon className="h-4 w-4" />
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={dict.datePicker.dialogLabel}
        className="date-dialog"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            closePicker();
          }
        }}
      >
        <div className="rounded-t-[2rem] border border-ink/10 bg-cream p-5 shadow-[0_-20px_60px_-30px_rgba(11,42,33,0.55)] sm:rounded-[2rem] sm:p-6">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15 sm:hidden" />

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              aria-label={dict.datePicker.previousMonth}
              className="grid h-10 w-10 place-items-center rounded-full text-ink/65 transition hover:bg-ink/5 hover:text-ink"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <p className="font-display text-xl leading-none tracking-[-0.01em]">
              {monthLabel}
            </p>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              aria-label={dict.datePicker.nextMonth}
              className="grid h-10 w-10 place-items-center rounded-full text-ink/65 transition hover:bg-ink/5 hover:text-ink"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {weekdays.map((weekday) => (
              <span
                key={weekday}
                className="grid h-8 place-items-center text-[0.65rem] font-semibold text-ink/45"
              >
                {weekday.replace(".", "")}
              </span>
            ))}
          </div>

          <div
            ref={gridRef}
            role="grid"
            aria-label={dict.datePicker.dialogLabel}
            tabIndex={-1}
            onKeyDown={handleGridKeys}
            className="mt-1 grid grid-cols-7 gap-1"
          >
            {days.map((day, index) => {
              const selected = day.key === value;
              return (
                <button
                  key={day.key}
                  type="button"
                  data-index={index}
                  data-selected={selected}
                  data-today={day.isToday}
                  onClick={() => choose(day.key)}
                  aria-label={dict.datePicker.selectDay(
                    triggerFormatter.format(new Date(`${day.key}T12:00:00`)),
                  )}
                  aria-pressed={selected}
                  className={cn(
                    "grid aspect-square place-items-center rounded-full text-sm transition",
                    selected
                      ? "bg-berry font-semibold text-cream shadow-[0_10px_24px_-14px_rgba(226,58,46,0.9)]"
                      : day.inMonth
                        ? "text-ink hover:bg-mint"
                        : "text-ink/30 hover:bg-ink/5",
                    !selected && day.isToday && "ring-1 ring-ink/25",
                  )}
                >
                  {day.day}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-dashed border-ink/15 pt-4">
            <button
              type="button"
              onClick={() => choose(today)}
              className="text-xs font-semibold text-pine hover:text-ink"
            >
              {dict.datePicker.today}
            </button>
            <div className="flex items-center gap-4">
              {value ? (
                <button
                  type="button"
                  onClick={() => choose("")}
                  className="text-xs font-medium text-ink/55 hover:text-berry-deep"
                >
                  {dict.datePicker.clear}
                </button>
              ) : null}
              <button
                type="button"
                onClick={closePicker}
                className="text-xs font-semibold text-ink/60 hover:text-ink"
              >
                {dict.common.close}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

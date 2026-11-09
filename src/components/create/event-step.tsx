"use client";

import { useI18n } from "@/components/i18n/locale-provider";
import { EuroIcon } from "@/components/icons";
import { DatePicker } from "@/components/ui/date-picker";
import type { EventDraft } from "./types";

export function EventStep({
  value,
  onChange,
}: {
  value: EventDraft;
  onChange: (patch: Partial<EventDraft>) => void;
}) {
  const { dict } = useI18n();
  const copy = dict.wizard.event;

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="draw-name" className="label">
          {copy.nameLabel}
        </label>
        <input
          id="draw-name"
          className="input"
          value={value.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder={copy.namePlaceholder}
          maxLength={80}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="draw-budget" className="label">
            {copy.budgetLabel}
          </label>
          <div className="relative">
            <EuroIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink/55" />
            <input
              id="draw-budget"
              className="input pl-10"
              value={value.budget}
              onChange={(event) => onChange({ budget: event.target.value })}
              placeholder={copy.budgetPlaceholder}
              inputMode="decimal"
              autoComplete="off"
            />
          </div>
          <p className="mt-1.5 text-xs text-ink/55">{dict.common.optional}</p>
        </div>

        <div>
          <label htmlFor="draw-location" className="label">
            {copy.locationLabel}
          </label>
          <input
            id="draw-location"
            className="input"
            value={value.location}
            onChange={(event) => onChange({ location: event.target.value })}
            placeholder={copy.locationPlaceholder}
            maxLength={120}
            autoComplete="off"
          />
          <p className="mt-1.5 text-xs text-ink/55">{dict.common.optional}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="draw-date" className="label">
            {copy.dateLabel}
          </label>
          <DatePicker
            id="draw-date"
            value={value.date}
            onChange={(date) => onChange({ date })}
          />
        </div>

        <div>
          <label htmlFor="draw-time" className="label">
            {copy.timeLabel}
          </label>
          <input
            id="draw-time"
            type="time"
            className="input"
            value={value.time}
            onChange={(event) => onChange({ time: event.target.value })}
          />
        </div>
      </div>

      <p className="rounded-2xl bg-mint/55 px-4 py-3 text-xs leading-5 text-ink/60">
        {copy.hint}
      </p>
    </div>
  );
}

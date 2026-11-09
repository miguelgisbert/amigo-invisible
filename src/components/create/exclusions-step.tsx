"use client";

import { useI18n } from "@/components/i18n/locale-provider";
import { InfoIcon, PlusIcon, XIcon } from "@/components/icons";
import type { ExclusionDraft, ParticipantDraft } from "./types";

export function ExclusionsStep({
  participants,
  exclusions,
  onChange,
  onAdd,
  onRemove,
}: {
  participants: ParticipantDraft[];
  exclusions: ExclusionDraft[];
  onChange: (key: string, patch: Partial<ExclusionDraft>) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
}) {
  const { dict } = useI18n();
  const copy = dict.wizard.exclusions;

  function labelFor(key: string): string {
    const index = participants.findIndex((participant) => participant.key === key);

    if (index === -1) {
      return copy.fallbackName(index + 1);
    }

    return participants[index].name.trim() || copy.fallbackName(index + 1);
  }

  if (participants.length < 2) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 px-5 py-10 text-center">
        <p className="text-sm font-medium text-ink/60">{copy.tooFew}</p>
      </div>
    );
  }

  const canExclude = participants.length >= 3;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-3xl bg-mint/60 p-4 text-xs leading-5 text-ink/65">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-pine" />
        <p>{copy.info}</p>
      </div>

      {exclusions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/20 px-5 py-9 text-center">
          <p className="text-sm font-medium text-ink/60">{copy.emptyTitle}</p>
          <p className="mt-1 text-xs text-ink/55">{copy.emptyBody}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exclusions.map((rule, index) => (
            <div
              key={rule.key}
              className="rounded-3xl border border-ink/10 bg-cream p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink/60">
                  {copy.rule(index + 1)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(rule.key)}
                  aria-label={copy.remove(index + 1)}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink/50 transition hover:bg-berry/10 hover:text-berry"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
                <select
                  className="input"
                  value={rule.a}
                  onChange={(event) =>
                    onChange(rule.key, { a: event.target.value })
                  }
                  aria-label={copy.rule(index + 1)}
                >
                  {participants.map((participant, participantIndex) => (
                    <option key={participant.key} value={participant.key}>
                      {participant.name.trim() ||
                        copy.fallbackName(participantIndex + 1)}
                    </option>
                  ))}
                </select>

                <span className="px-1 text-center text-xs font-medium text-ink/55">
                  {copy.cannotGift}
                </span>

                <select
                  className="input"
                  value={rule.b}
                  onChange={(event) =>
                    onChange(rule.key, { b: event.target.value })
                  }
                  aria-label={copy.rule(index + 1)}
                >
                  {participants.map((participant, participantIndex) => (
                    <option key={participant.key} value={participant.key}>
                      {participant.name.trim() ||
                        copy.fallbackName(participantIndex + 1)}
                    </option>
                  ))}
                </select>
              </div>

              <p className="mt-2.5 text-[0.7rem] text-ink/55">
                {copy.summary(labelFor(rule.a), labelFor(rule.b))}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAdd}
        disabled={!canExclude}
        className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-ink/20 px-4 py-4 text-sm font-semibold text-pine transition hover:border-pine/40 hover:bg-pine/5 disabled:pointer-events-none disabled:opacity-40"
      >
        <PlusIcon className="h-4 w-4" />
        {copy.add}
      </button>

      {!canExclude ? (
        <p className="rounded-2xl bg-gold/15 px-4 py-3 text-xs leading-5 text-ink/60">
          {copy.onlyTwo}
        </p>
      ) : null}
    </div>
  );
}

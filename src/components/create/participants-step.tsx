"use client";

import { useState, useSyncExternalStore } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { PlusIcon, TrashIcon, UsersIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { ParticipantDraft } from "./types";

type ImportedContact = {
  name: string;
  phone: string;
  email: string;
};

type Notice = {
  tone: "ok" | "error";
  text: string;
};

function subscribeContactsSupport(): () => void {
  return () => undefined;
}

function getContactsSupport(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "contacts" in navigator &&
    typeof navigator.contacts?.select === "function"
  );
}

function getServerContactsSupport(): boolean {
  return false;
}

export function ParticipantsStep({
  participants,
  onChange,
  onAdd,
  onRemove,
  onImport,
}: {
  participants: ParticipantDraft[];
  onChange: (key: string, patch: Partial<ParticipantDraft>) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onImport: (contacts: ImportedContact[]) => void;
}) {
  const { dict } = useI18n();
  const copy = dict.wizard.participants;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [importing, setImporting] = useState(false);
  const contactsSupported = useSyncExternalStore(
    subscribeContactsSupport,
    getContactsSupport,
    getServerContactsSupport,
  );
  const activeCount = participants.filter(
    (participant) =>
      participant.name.trim() ||
      participant.phone.trim() ||
      participant.email.trim(),
  ).length;

  async function importContacts() {
    if (!contactsSupported || !navigator.contacts) {
      return;
    }

    setImporting(true);
    setNotice(null);

    try {
      const contacts = await navigator.contacts.select(
        ["name", "tel", "email"],
        { multiple: true },
      );

      const imported: ImportedContact[] = contacts.flatMap((contact) => {
        const name = contact.name?.[0]?.trim() || copy.importNoName;
        const phone = contact.tel?.[0]?.trim() ?? "";
        const email = contact.email?.[0]?.trim().toLowerCase() ?? "";

        if (!phone && !email) {
          return [];
        }

        return [{ name, phone, email }];
      });

      if (imported.length === 0) {
        setNotice({ tone: "error", text: copy.importEmpty });
        return;
      }

      onImport(imported);
      setNotice({
        tone: "ok",
        text: copy.importSuccess(imported.length),
      });
    } catch {
      setNotice({ tone: "error", text: copy.importError });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex min-h-10 items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-[0.08em] text-ink/55 uppercase">
          {dict.common.participantCount(activeCount)}
        </p>

        {contactsSupported ? (
          <button
            type="button"
            onClick={() => void importContacts()}
            disabled={importing}
            className="btn btn-sm btn-outline"
          >
            {importing ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-ink/70" />
            ) : (
              <UsersIcon className="h-4 w-4" />
            )}
            {copy.importContacts}
          </button>
        ) : null}
      </div>

      {!contactsSupported ? (
        <p className="text-[0.7rem] leading-5 text-ink/55 sm:hidden">
          {copy.importUnsupported}
        </p>
      ) : null}

      {notice ? (
        <p
          role="status"
          className={cn(
            "rounded-2xl px-4 py-3 text-xs leading-5",
            notice.tone === "ok"
              ? "bg-mint/70 text-pine"
              : "bg-berry/8 text-berry-deep",
          )}
        >
          {notice.text}
        </p>
      ) : null}

      {participants.map((participant, index) => (
        <div
          key={participant.key}
          className="rounded-3xl border border-ink/10 bg-cream p-4 sm:p-5"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-ink/55">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-mint text-[0.68rem] text-pine">
                {index + 1}
              </span>
              {copy.participantLabel}
            </span>
            <button
              type="button"
              onClick={() => onRemove(participant.key)}
              aria-label={copy.remove(
                participant.name.trim() || `${copy.participantLabel} ${index + 1}`,
              )}
              className="grid h-9 w-9 place-items-center rounded-full text-ink/50 transition hover:bg-berry/10 hover:text-berry"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <label
                className="label"
                htmlFor={`participant-name-${participant.key}`}
              >
                {copy.nameLabel}
              </label>
              <input
                id={`participant-name-${participant.key}`}
                className="input"
                value={participant.name}
                onChange={(event) =>
                  onChange(participant.key, { name: event.target.value })
                }
                placeholder={copy.namePlaceholder}
                maxLength={80}
                autoComplete="off"
                autoCapitalize="words"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="label"
                  htmlFor={`participant-phone-${participant.key}`}
                >
                  {copy.phoneLabel}
                </label>
                <input
                  id={`participant-phone-${participant.key}`}
                  type="tel"
                  inputMode="tel"
                  className="input"
                  value={participant.phone}
                  onChange={(event) =>
                    onChange(participant.key, { phone: event.target.value })
                  }
                  placeholder={copy.phonePlaceholder}
                  maxLength={30}
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  className="label"
                  htmlFor={`participant-email-${participant.key}`}
                >
                  {copy.emailLabel}
                </label>
                <input
                  id={`participant-email-${participant.key}`}
                  type="email"
                  inputMode="email"
                  className="input"
                  value={participant.email}
                  onChange={(event) =>
                    onChange(participant.key, { email: event.target.value })
                  }
                  placeholder={copy.emailPlaceholder}
                  maxLength={160}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        disabled={participants.length >= 200}
        className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-ink/20 px-4 py-4 text-sm font-semibold text-pine transition hover:border-pine/40 hover:bg-pine/5 disabled:opacity-40"
      >
        <PlusIcon className="h-4 w-4" />
        {copy.add}
      </button>

      <p className="px-1 text-xs leading-5 text-ink/55">{copy.hint}</p>
    </div>
  );
}

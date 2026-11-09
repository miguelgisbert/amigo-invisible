"use client";

import { useRef } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { ChatIcon, RefreshIcon, SparklesIcon } from "@/components/icons";
import { TEMPLATE_EMOJIS, buildMessage, templateTokens } from "@/lib/message";
import type { EventDraft } from "./types";

const PREVIEW_LINK = "https://exemple.cat/r/el-teu-enllac";

export function TemplateStep({
  template,
  onChange,
  onRestore,
  event,
  sampleGiver,
  sampleReceiver,
}: {
  template: string;
  onChange: (value: string) => void;
  onRestore: () => void;
  event: EventDraft;
  sampleGiver: string;
  sampleReceiver: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { locale, dict } = useI18n();
  const copy = dict.wizard.template;
  const tokens = templateTokens(locale);

  const preview = buildMessage(template, {
    locale,
    giverName: sampleGiver,
    receiverName: sampleReceiver,
    drawName: event.name.trim() || dict.common.appName,
    budget: event.budget.trim()
      ? Number(event.budget.replace(",", "."))
      : null,
    eventDate: event.date || null,
    eventTime: event.time || null,
    location: event.location.trim() || null,
    link: PREVIEW_LINK,
  });

  function insert(text: string) {
    const element = textareaRef.current;

    if (!element) {
      onChange(`${template}${text}`);
      return;
    }

    const start = element.selectionStart ?? template.length;
    const end = element.selectionEnd ?? start;
    const next = `${template.slice(0, start)}${text}${template.slice(end)}`;
    onChange(next);

    requestAnimationFrame(() => {
      element.focus();
      const cursor = start + text.length;
      element.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1.05fr_0.95fr] md:items-start lg:gap-6">
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-end justify-between gap-3">
            <label htmlFor="draw-template" className="label mb-0">
              {copy.label}
            </label>
            <button
              type="button"
              onClick={onRestore}
              className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold text-pine hover:text-ink"
            >
              <RefreshIcon className="h-3.5 w-3.5" />
              {copy.restore}
            </button>
          </div>
          <textarea
            ref={textareaRef}
            id="draw-template"
            className="input scrollbar-festive min-h-72 resize-none py-3 leading-6"
            value={template}
            onChange={(event) => onChange(event.target.value)}
            maxLength={4000}
          />
          <div className="mt-1.5 flex justify-between text-[0.7rem] text-ink/55">
            <span>{copy.helper}</span>
            <span>{template.length}/4000</span>
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[0.72rem] font-semibold text-ink/60">
            <SparklesIcon className="h-3.5 w-3.5 text-pine" />
            {copy.insertTitle}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((item) => (
              <button
                key={item.token}
                type="button"
                onClick={() => insert(item.token)}
                title={item.token}
                className="rounded-full bg-ink/5 px-2.5 py-1.5 text-[0.7rem] font-medium text-ink/60 transition hover:bg-ink/10 hover:text-ink"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[0.72rem] font-semibold text-ink/60">
            {copy.emojis}
          </p>
          <div className="flex flex-wrap gap-1">
            {TEMPLATE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insert(` ${emoji}`)}
                className="grid h-9 w-9 place-items-center rounded-xl text-lg transition hover:bg-ink/5"
                aria-label={`${copy.emojis}: ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="md:sticky md:top-24">
        <p className="mb-2 flex items-center gap-2 text-[0.72rem] font-semibold text-ink/60">
          <ChatIcon className="h-4 w-4 text-pine" />
          {copy.previewTitle}
        </p>
        <div className="rounded-[1.75rem] border border-ink/10 bg-mint/70 p-3 sm:p-4">
          <div className="rounded-2xl rounded-tl-md bg-cream p-4 shadow-[0_10px_30px_-18px_rgba(11,42,33,0.6)]">
            <p className="text-pretty text-sm leading-6 break-words whitespace-pre-wrap text-ink/85">
              {preview}
            </p>
            <p className="mt-2 text-right text-[0.62rem] text-ink/25">
              10:24 ✓✓
            </p>
          </div>
        </div>
        <p className="mt-2 px-1 text-[0.7rem] leading-5 text-ink/55">
          {copy.previewNote}
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { AuthGate } from "@/components/auth/auth-gate";
import { useSession } from "@/components/auth/session-provider";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useI18n } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/site-footer";
import { ArrowLeftIcon, ArrowRightIcon, InfoIcon } from "@/components/icons";
import { defaultTemplate } from "@/lib/message";
import { cn } from "@/lib/cn";
import { WizardStepper } from "./wizard-stepper";
import { EventStep } from "./event-step";
import { ParticipantsStep } from "./participants-step";
import { ExclusionsStep } from "./exclusions-step";
import { TemplateStep } from "./template-step";
import type { EventDraft, ExclusionDraft, ParticipantDraft } from "./types";

function createParticipant(key: string): ParticipantDraft {
  return { key, name: "", phone: "", email: "" };
}

function nextKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasAnyData(participant: ParticipantDraft): boolean {
  return Boolean(
    participant.name.trim() ||
      participant.phone.trim() ||
      participant.email.trim(),
  );
}

export function CreateWizard() {
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const { locale, dict, href } = useI18n();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<EventDraft>({
    name: "",
    budget: "",
    date: "",
    time: "",
    location: "",
  });
  const [participants, setParticipants] = useState<ParticipantDraft[]>([
    createParticipant("p1"),
    createParticipant("p2"),
    createParticipant("p3"),
  ]);
  const [exclusions, setExclusions] = useState<ExclusionDraft[]>([]);
  const [template, setTemplate] = useState(() => defaultTemplate(locale));
  const [templateTouched, setTemplateTouched] = useState(false);

  const activeTemplate = templateTouched ? template : defaultTemplate(locale);
  const activeParticipants = participants.filter(hasAnyData);
  const activeKeys = new Set(
    activeParticipants.map((participant) => participant.key),
  );
  const visibleExclusions = exclusions.filter(
    (rule) => activeKeys.has(rule.a) && activeKeys.has(rule.b),
  );
  const namedParticipants = activeParticipants
    .map((participant) => participant.name.trim())
    .filter(Boolean);
  const sampleGiver = namedParticipants[0] ?? "Marta";
  const sampleReceiver = namedParticipants[1] ?? "Pau";
  const validation = dict.wizard.validation;

  function updateEvent(patch: Partial<EventDraft>) {
    setEvent((previous) => ({ ...previous, ...patch }));
  }

  function updateParticipant(
    key: string,
    patch: Partial<ParticipantDraft>,
  ) {
    setParticipants((previous) =>
      previous.map((participant) =>
        participant.key === key ? { ...participant, ...patch } : participant,
      ),
    );
  }

  function addParticipant() {
    if (participants.length >= 200) {
      return;
    }

    setParticipants((previous) => [
      ...previous,
      createParticipant(nextKey("p")),
    ]);
  }

  function addImportedParticipants(
    imported: Array<{ name: string; phone: string; email: string }>,
  ) {
    if (imported.length === 0) {
      return;
    }

    setParticipants((previous) => {
      const next = [...previous];
      const pending = [...imported];

      for (let index = 0; index < next.length && pending.length > 0; index += 1) {
        if (hasAnyData(next[index])) {
          continue;
        }

        const contact = pending.shift();

        if (contact) {
          next[index] = {
            ...next[index],
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
          };
        }
      }

      for (const contact of pending) {
        if (next.length >= 200) {
          break;
        }

        next.push({
          key: nextKey("p"),
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
        });
      }

      return next;
    });
  }

  function removeParticipant(key: string) {
    setParticipants((previous) =>
      previous.filter((participant) => participant.key !== key),
    );
    setExclusions((previous) =>
      previous.filter((rule) => rule.a !== key && rule.b !== key),
    );
  }

  function addExclusion() {
    const candidates = participants.filter(hasAnyData);

    if (candidates.length < 2) {
      setError(validation.minParticipants);
      return;
    }

    setExclusions((previous) => [
      ...previous,
      {
        key: nextKey("r"),
        a: candidates[0].key,
        b: candidates[1].key,
      },
    ]);
  }

  function updateExclusion(key: string, patch: Partial<ExclusionDraft>) {
    setExclusions((previous) =>
      previous.map((rule) => (rule.key === key ? { ...rule, ...patch } : rule)),
    );
  }

  function removeExclusion(key: string) {
    setExclusions((previous) => previous.filter((rule) => rule.key !== key));
  }

  function validateStep(currentStep: number): string | null {
    if (currentStep === 0) {
      if (!event.name.trim()) {
        return validation.nameRequired;
      }

      if (event.budget.trim()) {
        const budget = Number(event.budget.replace(",", "."));
        if (!Number.isFinite(budget) || budget < 0) {
          return validation.budgetInvalid;
        }
      }

      return null;
    }

    if (currentStep === 1) {
      const candidates = participants.filter(hasAnyData);

      if (candidates.length < 2) {
        return validation.minParticipants;
      }

      const names = new Set<string>();

      for (const participant of candidates) {
        const name = participant.name.trim();
        const phone = participant.phone.trim();
        const email = participant.email.trim();

        if (!name) {
          return validation.participantName;
        }

        if (!phone && !email) {
          return validation.contactFor(name);
        }

        if (phone && phone.replace(/\D/g, "").length < 6) {
          return validation.phoneFor(name);
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return validation.emailFor(name);
        }

        const normalized = name.toLocaleLowerCase(locale);
        if (names.has(normalized)) {
          return validation.duplicateName(name);
        }
        names.add(normalized);
      }

      return null;
    }

    if (currentStep === 2) {
      const seen = new Set<string>();

      for (const rule of visibleExclusions) {
        if (!rule.a || !rule.b) {
          return validation.ruleNeedsTwo;
        }

        if (rule.a === rule.b) {
          return validation.selfExclusion;
        }

        const pair = [rule.a, rule.b].sort().join(":");
        if (seen.has(pair)) {
          return validation.duplicateRule;
        }
        seen.add(pair);
      }

      return null;
    }

    if (activeTemplate.trim().length < 10) {
      return validation.messageShort;
    }

    return null;
  }

  function goNext() {
    const message = validateStep(step);

    if (message) {
      setError(message);
      return;
    }

    setError(null);

    if (step < dict.wizard.steps.length - 1) {
      setStep((previous) => previous + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    void submit();
  }

  function goBack() {
    setError(null);
    setStep((previous) => Math.max(0, previous - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const candidates = participants.filter(hasAnyData);
    const indexByKey = new Map(
      candidates.map((participant, index) => [participant.key, index]),
    );

    const payloadExclusions = exclusions.flatMap((rule) => {
      const a = indexByKey.get(rule.a);
      const b = indexByKey.get(rule.b);

      if (a === undefined || b === undefined || a === b) {
        return [];
      }

      return [{ a, b }];
    });

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          name: event.name.trim(),
          budget: event.budget.trim()
            ? Number(event.budget.replace(",", "."))
            : null,
          date: event.date || null,
          time: event.time || null,
          location: event.location.trim() || null,
          template: activeTemplate,
          participants: candidates.map((participant) => ({
            name: participant.name.trim(),
            phone: participant.phone.trim() || null,
            email: participant.email.trim().toLowerCase() || null,
          })),
          exclusions: payloadExclusions,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { adminToken?: string; error?: string; code?: string }
        | null;

      if (!response.ok || !data?.adminToken) {
        if (data?.code === "IMPOSSIBLE_DRAW") {
          setStep(2);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        throw new Error(data?.error ?? validation.createFailed);
      }

      try {
        window.localStorage.setItem(
          "amigo-invisible:last-admin",
          JSON.stringify({
            token: data.adminToken,
            name: event.name.trim(),
          }),
        );
      } catch {
        // The panel link is also shown on the next screen.
      }

      router.push(href(`/admin/${data.adminToken}?created=1`));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : validation.createFailed,
      );
      setSubmitting(false);
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-dvh bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
          <div className="h-8 w-40 animate-pulse rounded-full bg-ink/5" />
          <div className="mt-6 h-72 animate-pulse rounded-2xl bg-ink/5" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <Link href={href("/")} className="btn btn-sm btn-ghost">
              {dict.common.home}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-8 pb-36 sm:px-8 sm:pt-12">
        <div className={cn("mx-auto", step === 3 ? "max-w-4xl" : "max-w-2xl")}>
          <div className="flex items-center justify-between text-xs font-medium text-ink/50">
            <span>{dict.wizard.header}</span>
            <span>{dict.wizard.stepOf(step + 1, dict.wizard.steps.length)}</span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            {dict.wizard.titles[step]}
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-6 text-ink/60">
            {dict.wizard.descriptions[step]}
          </p>

          <WizardStepper current={step} />

          {error ? (
            <div
              role="alert"
              aria-live="polite"
              className="mt-6 flex gap-3 rounded-2xl border border-berry/20 bg-berry/8 px-4 py-3 text-sm leading-5 text-berry-deep"
            >
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          <div key={step} className="animate-fade mt-8">
            {step === 0 ? (
              <EventStep value={event} onChange={updateEvent} />
            ) : null}

            {step === 1 ? (
              <ParticipantsStep
                participants={participants}
                onChange={updateParticipant}
                onAdd={addParticipant}
                onRemove={removeParticipant}
                onImport={addImportedParticipants}
              />
            ) : null}

            {step === 2 ? (
              <ExclusionsStep
                participants={activeParticipants}
                exclusions={visibleExclusions}
                onChange={updateExclusion}
                onAdd={addExclusion}
                onRemove={removeExclusion}
              />
            ) : null}

            {step === 3 ? (
              <TemplateStep
                template={activeTemplate}
                onChange={(value) => {
                  setTemplateTouched(true);
                  setTemplate(value);
                }}
                onRestore={() => {
                  setTemplateTouched(false);
                  setTemplate(defaultTemplate(locale));
                }}
                event={event}
                sampleGiver={sampleGiver}
                sampleReceiver={sampleReceiver}
              />
            ) : null}
          </div>

          <SiteFooter
            tone="light"
            note={false}
            width="narrow"
            className="mt-16"
          />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/92 backdrop-blur">
        <div className="safe-bottom mx-auto flex max-w-3xl items-center gap-3 px-5 pt-3 sm:px-8">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="btn btn-outline"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {dict.common.back}
            </button>
          ) : (
            <Link href={href("/")} className="btn btn-outline">
              {dict.common.cancel}
            </Link>
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={submitting}
            aria-busy={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" />
                {dict.wizard.creating}
              </>
            ) : (
              <>
                {step === dict.wizard.steps.length - 1
                  ? dict.wizard.create
                  : dict.wizard.continue}
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

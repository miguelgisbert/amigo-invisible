"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { DownloadIcon } from "@/components/icons";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstall({ tone = "paper" }: { tone?: "paper" | "ink" }) {
  const { dict } = useI18n();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt) {
    return null;
  }

  async function install() {
    if (!prompt) {
      return;
    }

    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  return (
    <button
      type="button"
      onClick={() => void install()}
      className={
        tone === "paper"
          ? "mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-paper/15 px-3.5 text-[0.72rem] font-semibold text-paper/65 transition hover:border-paper/30 hover:bg-paper/10 hover:text-paper"
          : "mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/15 px-3.5 text-[0.72rem] font-semibold text-ink/60 transition hover:border-ink/30 hover:bg-ink/5 hover:text-ink"
      }
    >
      <DownloadIcon className="h-4 w-4" />
      {dict.common.install}
    </button>
  );
}

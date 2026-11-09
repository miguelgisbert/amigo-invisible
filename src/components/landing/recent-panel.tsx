"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useI18n } from "@/components/i18n/locale-provider";
import { ArrowRightIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "amigo-invisible:last-admin";

type SavedPanel = {
  token: string;
  name: string;
};

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function parseSaved(raw: string | null): SavedPanel | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SavedPanel>;

    if (
      typeof parsed.token === "string" &&
      parsed.token.length > 10 &&
      typeof parsed.name === "string"
    ) {
      return { token: parsed.token, name: parsed.name };
    }
  } catch {
    return null;
  }

  return null;
}

export function RecentPanel({ tone = "paper" }: { tone?: "paper" | "ink" }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const saved = parseSaved(raw);
  const { dict, href } = useI18n();

  if (!saved) {
    return null;
  }

  return (
    <Link
      href={href(`/admin/${saved.token}`)}
      className={cn(
        "mt-7 inline-flex max-w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
        tone === "paper"
          ? "border-paper/15 bg-paper/5 text-paper/65 hover:border-paper/30 hover:bg-paper/10 hover:text-paper"
          : "border-ink/12 bg-cream text-ink/65 hover:border-ink/25 hover:text-ink",
      )}
    >
      <span className="min-w-0">
        <span className="block text-[0.68rem] font-semibold tracking-[0.08em] uppercase opacity-70">
          {dict.landing.recent}
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold">
          {saved.name}
        </span>
      </span>
      <ArrowRightIcon className="h-4 w-4 shrink-0" />
    </Link>
  );
}

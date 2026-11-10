"use client";

import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";
import { useI18n } from "@/components/i18n/locale-provider";

export function SessionNav() {
  const { user, loading } = useSession();
  const { dict, href } = useI18n();

  if (loading) {
    return (
      <span
        aria-hidden="true"
        className="h-8 w-14 animate-pulse rounded-full bg-ink/5"
      />
    );
  }

  if (user) {
    return (
      <Link
        href={href("/sortejos")}
        className="btn btn-sm btn-ghost px-2.5 text-xs whitespace-nowrap"
      >
        <span className="sm:hidden">{dict.auth.myDrawsShort}</span>
        <span className="hidden sm:inline">{dict.auth.myDraws}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href("/entrar")}
      className="btn btn-sm btn-ghost px-2.5 text-xs whitespace-nowrap"
    >
      <span className="sm:hidden">{dict.auth.loginShort}</span>
      <span className="hidden sm:inline">{dict.auth.loginLink}</span>
    </Link>
  );
}

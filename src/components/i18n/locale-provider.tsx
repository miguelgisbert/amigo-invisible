"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  hasLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  href: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);

    try {
      document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // Cookies can be unavailable in hardened browsers.
    }

    const segments = window.location.pathname.split("/").filter(Boolean);

    if (hasLocale(segments[0])) {
      segments[0] = next;
    } else {
      segments.unshift(next);
    }

    const pathname = `/${segments.join("/")}`;

    window.history.replaceState(
      window.history.state,
      "",
      `${pathname}${window.location.search}${window.location.hash}`,
    );

    document.documentElement.lang = next;

    const dict = dictionaries[next];
    const currentPath = window.location.pathname;
    let title = dict.meta.title;

    if (currentPath.includes("/admin/")) {
      title = `${dict.admin.metaTitle} · ${dict.common.appName}`;
    } else if (currentPath.includes("/r/")) {
      title = `${dict.reveal.metaTitle} · ${dict.common.appName}`;
    } else if (currentPath.includes("/crear")) {
      title = `${dict.wizard.metaTitle} · ${dict.common.appName}`;
    }

    document.title = title;
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];

    return {
      locale,
      dict,
      setLocale,
      href: (path: string) => {
        if (/^https?:\/\//.test(path) || path.startsWith("#")) {
          return path;
        }

        const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
        return `/${locale}${clean}`;
      },
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside LocaleProvider");
  }

  return context;
}

export function useLocaleHref(): (path: string) => string {
  return useI18n().href;
}

import { NextResponse, type NextRequest } from "next/server";
import {
  hasLocale,
  localeCookieName,
  localeFromAcceptLanguage,
} from "@/lib/i18n/config";

const cookieOptions = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";

  if (hasLocale(firstSegment)) {
    const response = NextResponse.next();
    response.cookies.set(localeCookieName, firstSegment, cookieOptions);
    return response;
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  const locale = hasLocale(cookieLocale)
    ? cookieLocale
    : localeFromAcceptLanguage(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(localeCookieName, locale, cookieOptions);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};

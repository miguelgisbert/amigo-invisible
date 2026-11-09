import type { NextRequest } from "next/server";

export function getBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (
    forwardedHost?.split(",")[0] ??
    request.headers.get("host") ??
    request.nextUrl.host
  ).trim();
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const protocol = (
    forwardedProtocol?.split(",")[0] ??
    request.nextUrl.protocol.replace(":", "")
  )
    .trim()
    .replace(/:$/, "");

  return `${protocol || "http"}://${host}`;
}

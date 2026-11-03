import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

import { auth, isAuthRuntimeConfigured } from "@/app/lib/auth/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unavailable = () =>
  NextResponse.json(
    {
      error: {
        code: "AUTH_UNAVAILABLE",
        message: "Authentication is temporarily unavailable.",
      },
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );

const handlers = toNextJsHandler(auth);

export async function GET(request) {
  if (!isAuthRuntimeConfigured()) return unavailable();
  return handlers.GET(request);
}

export async function POST(request) {
  if (!isAuthRuntimeConfigured()) return unavailable();

  /*
   * Email sign-up is intentionally exposed only through /api/labs/register.
   * That endpoint validates consent, writes server-controlled legal versions,
   * rate-limits attempts, and returns the same generic response for all
   * account-specific outcomes.
   */
  const pathname = new URL(request.url).pathname.replace(/\\/+$/, "");
  if (pathname.endsWith("/sign-up/email")) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Not found." } },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return handlers.POST(request);
}

import { NextResponse } from "next/server";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getLabsOwnerAnalytics } from "@/app/lib/labs/owner-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Vary: "Cookie, Authorization",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request) {
  let session;
  try {
    session = await getCurrentAuthSession();
  } catch (error) {
    console.error("[labs-owner-analytics] session lookup failed:", error?.code || "SESSION_LOOKUP_ERROR");
    return json({ error: { code: "UNAVAILABLE", message: "Analytics are temporarily unavailable." } }, 503);
  }

  if (!session?.user?.id) {
    return json({ error: { code: "UNAUTHENTICATED", message: "Sign in is required." } }, 401);
  }

  try {
    const days = Number(new URL(request.url).searchParams.get("days") || 30);
    const data = await getLabsOwnerAnalytics({ user: session.user, days });
    return json({ data });
  } catch (error) {
    if (error?.code === "OWNER_ACCESS_DENIED") {
      return json({ error: { code: "FORBIDDEN", message: "Owner access is required." } }, 403);
    }

    console.error("[labs-owner-analytics] query failed:", error?.code || "ANALYTICS_ERROR");
    return json({ error: { code: "UNAVAILABLE", message: "Analytics are temporarily unavailable." } }, 503);
  }
}

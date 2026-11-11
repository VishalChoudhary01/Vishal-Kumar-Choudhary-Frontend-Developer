import { NextResponse } from "next/server";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import {
  getLabsOwnerExperimentAnalytics,
  hideLabsOwnerExperimentFromAnalytics,
  restoreLabsOwnerExperimentAnalytics,
} from "@/app/lib/labs/owner-analytics";
import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";

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

export async function GET(request, { params }) {
  let session;
  try {
    session = await getCurrentAuthSession();
  } catch (error) {
    console.error("[labs-owner-experiment-analytics] session lookup failed:", error?.code || "SESSION_LOOKUP_ERROR");
    return json({ error: { code: "UNAVAILABLE", message: "Experiment analytics are temporarily unavailable." } }, 503);
  }

  if (!session?.user?.id) {
    return json({ error: { code: "UNAUTHENTICATED", message: "Sign in is required." } }, 401);
  }

  const { slug } = await params;

  try {
    const days = Number(new URL(request.url).searchParams.get("days") || 30);
    const data = await getLabsOwnerExperimentAnalytics({
      user: session.user,
      slug,
      days,
    });
    return json({ data });
  } catch (error) {
    if (error?.code === "OWNER_ACCESS_DENIED") {
      return json({ error: { code: "FORBIDDEN", message: "Owner access is required." } }, 403);
    }

    if (error?.code === "NOT_FOUND") {
      return json({ error: { code: "NOT_FOUND", message: "Published experiment analytics were not found." } }, 404);
    }

    console.error("[labs-owner-experiment-analytics] query failed:", error?.code || "ANALYTICS_ERROR");
    return json({ error: { code: "UNAVAILABLE", message: "Experiment analytics are temporarily unavailable." } }, 503);
  }
}


export async function DELETE(request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson({
      error: { code: "INVALID_ORIGIN", message: "This request is not allowed." },
    }, 403);
  }

  const { slug } = await params;
  try {
    const data = await hideLabsOwnerExperimentFromAnalytics({ user, slug });
    return adminJson({ data });
  } catch (error) {
    return adminError(error);
  }
}

export async function POST(request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson({
      error: { code: "INVALID_ORIGIN", message: "This request is not allowed." },
    }, 403);
  }

  const { slug } = await params;
  try {
    const data = await restoreLabsOwnerExperimentAnalytics({ user, slug });
    return adminJson({ data });
  } catch (error) {
    return adminError(error);
  }
}

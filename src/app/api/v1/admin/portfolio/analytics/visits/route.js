import { NextResponse } from "next/server";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { isLabsOwner } from "@/app/lib/labs/owner-access";
import {
  isSameOriginPortfolioRequest,
  readPortfolioAnalyticsJson,
} from "@/app/lib/portfolio-analytics/request-utils.mjs";
import { parsePortfolioVisitDeletionPayload } from "@/app/lib/portfolio-analytics/deletion-utils.mjs";
import { deletePortfolioVisitRecords } from "@/app/lib/portfolio-analytics/deletion-service";

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
      "Cross-Origin-Resource-Policy": "same-origin",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function DELETE(request) {
  if (!isSameOriginPortfolioRequest(request)) {
    return json({
      error: {
        code: "INVALID_ORIGIN",
        message: "This deletion request is not allowed.",
      },
    }, 403);
  }

  let session;
  try {
    session = await getCurrentAuthSession();
  } catch (error) {
    console.error(
      "[portfolio-analytics-delete] session lookup failed:",
      error?.code || "SESSION_LOOKUP_ERROR",
    );
    return json({
      error: {
        code: "ANALYTICS_UNAVAILABLE",
        message: "Portfolio analytics are temporarily unavailable.",
      },
    }, 503);
  }

  if (!session?.user?.id) {
    return json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Sign in is required.",
      },
    }, 401);
  }

  if (!isLabsOwner(session.user)) {
    return json({
      error: {
        code: "NOT_FOUND",
        message: "Not found.",
      },
    }, 404);
  }

  let payload;
  try {
    payload = await readPortfolioAnalyticsJson(request);
  } catch (error) {
    return json({
      error: {
        code: error?.code || "INVALID_REQUEST",
        message: error?.message || "A valid deletion request is required.",
      },
    }, Number(error?.status) || 400);
  }

  let parsedScope;
  try {
    parsedScope = parsePortfolioVisitDeletionPayload(payload);
  } catch (error) {
    return json({
      error: {
        code: error?.code || "INVALID_PORTFOLIO_DELETE",
        message: error?.message || "The deletion scope is invalid.",
      },
    }, 400);
  }

  try {
    const data = await deletePortfolioVisitRecords(parsedScope);
    return json({ data });
  } catch (error) {
    console.error(
      "[portfolio-analytics-delete] visit deletion failed:",
      error?.code || "DELETE_VISITS_FAILED",
    );
    return json({
      error: {
        code: "ANALYTICS_UNAVAILABLE",
        message: "The selected visit data could not be deleted.",
      },
    }, 503);
  }
}

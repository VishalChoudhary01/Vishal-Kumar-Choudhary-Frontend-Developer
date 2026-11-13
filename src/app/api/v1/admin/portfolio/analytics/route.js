import { NextResponse } from "next/server";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { isLabsOwner } from "@/app/lib/labs/owner-access";
import {
  getPortfolioAnalyticsReport,
  getPortfolioRecentVisits,
} from "@/app/lib/portfolio-analytics/report-service";
import { parsePortfolioAnalyticsReadQuery } from "@/app/lib/portfolio-analytics/read-query.mjs";

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

export async function GET(request) {
  let session;

  try {
    session = await getCurrentAuthSession();
  } catch (error) {
    console.error(
      "[portfolio-analytics-read] session lookup failed:",
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

  let query;
  try {
    query = parsePortfolioAnalyticsReadQuery(new URL(request.url).searchParams);
  } catch (error) {
    return json({
      error: {
        code: error?.code || "INVALID_ANALYTICS_QUERY",
        message: error?.message || "Analytics query is invalid.",
      },
    }, 400);
  }

  try {
    if (query.view === "summary") {
      const data = await getPortfolioAnalyticsReport({ days: query.days, excludedOwnerUser: session.user });
      return json({ data });
    }

    const data = await getPortfolioRecentVisits({
      days: query.days,
      limit: 25,
      cursor: query.cursor,
      excludedOwnerUser: session.user,
    });
    return json({ data });
  } catch (error) {
    console.error(
      "[portfolio-analytics-read] report query failed:",
      error?.code || "REPORT_QUERY_ERROR",
    );
    return json({
      error: {
        code: "ANALYTICS_UNAVAILABLE",
        message: "Portfolio analytics are temporarily unavailable.",
      },
    }, 503);
  }
}

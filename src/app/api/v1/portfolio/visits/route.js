import { NextResponse } from "next/server";

import {
  getPortfolioAnalyticsConfig,
  isPortfolioAnalyticsHostAllowed,
} from "@/app/lib/portfolio-analytics/config.mjs";
import {
  isSameOriginPortfolioRequest,
  readPortfolioAnalyticsJson,
} from "@/app/lib/portfolio-analytics/request-utils.mjs";
import {
  parsePortfolioVisitLifecyclePayload,
  parsePortfolioVisitStartPayload,
} from "@/app/lib/portfolio-analytics/visit-utils.mjs";
import { consumePortfolioVisitRateLimit } from "@/app/lib/portfolio-analytics/rate-limit";
import {
  endPortfolioVisit,
  heartbeatPortfolioVisit,
  pausePortfolioVisit,
  resumePortfolioVisit,
  startPortfolioVisit,
} from "@/app/lib/portfolio-analytics/visit-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function json(body, status = 200, extraHeaders = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      ...extraHeaders,
    },
  });
}

function unavailable() {
  return json(
    {
      error: {
        code: "VISIT_TRACKING_UNAVAILABLE",
        message: "Visit tracking is temporarily unavailable.",
      },
    },
    503,
  );
}

function getRequestHost(request) {
  try {
    return new URL(request.url).hostname;
  } catch {
    return null;
  }
}

function getSafeErrorMessage(error) {
  if (typeof error?.message !== "string") return null;

  return error.message
    .replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "[redacted-mongodb-uri]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted-ip]")
    .replace(/([\w.+-]+)@([\w.-]+)/g, "[redacted-email]")
    .replace(/(password|token|secret)\s*[=:]\s*[^,\s]+/gi, "$1=[redacted]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, 180);
}

export async function POST(request) {
  let config;
  try {
    config = getPortfolioAnalyticsConfig();
  } catch (error) {
    console.error(
      "[portfolio-analytics] configuration error:",
      error?.code || "CONFIGURATION_ERROR",
    );
    return unavailable();
  }

  if (!config.enabled) {
    return json({ error: { code: "NOT_FOUND", message: "Not found." } }, 404);
  }

  if (!isPortfolioAnalyticsHostAllowed({ host: getRequestHost(request) })) {
    return json({ error: { code: "NOT_FOUND", message: "Not found." } }, 404);
  }

  if (!isSameOriginPortfolioRequest(request)) {
    return json(
      {
        error: {
          code: "INVALID_ORIGIN",
          message: "This request is not allowed.",
        },
      },
      403,
    );
  }

  let body;
  try {
    body = await readPortfolioAnalyticsJson(request);
  } catch (error) {
    const status = Number(error?.status) || 400;
    return json(
      {
        error: {
          code: error?.code || "INVALID_REQUEST",
          message: error?.message || "A valid request is required.",
        },
      },
      status,
    );
  }

  let parsed;
  try {
    if (body.action === "start") {
      parsed = parsePortfolioVisitStartPayload(body);
    } else {
      parsed = parsePortfolioVisitLifecyclePayload(body);
    }
  } catch (error) {
    return json(
      {
        error: {
          code: error?.code || "INVALID_PORTFOLIO_VISIT",
          message: error?.message || "Invalid visit event.",
        },
      },
      400,
    );
  }

  let operationStage = "rate-limit";
  try {
    const rateLimit = await consumePortfolioVisitRateLimit({
      request,
      action: parsed.action,
      tabSessionId: parsed.tabSessionId,
      secret: config.hmacSecret,
    });

    if (!rateLimit.allowed) {
      const retryAfter = Math.max(1, rateLimit.retryAfterSeconds || 1);
      return json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many visit events. Please wait before trying again.",
            retryAfterSeconds: retryAfter,
          },
        },
        429,
        { "Retry-After": String(retryAfter) },
      );
    }

    let data = null;
    operationStage = "visit:" + parsed.action;

    switch (parsed.action) {
      case "start":
        data = await startPortfolioVisit(body, request);
        break;
      case "heartbeat":
        data = await heartbeatPortfolioVisit(body, request);
        break;
      case "pause":
        data = await pausePortfolioVisit(body, request);
        break;
      case "resume":
        data = await resumePortfolioVisit(body, request);
        break;
      case "end":
        data = await endPortfolioVisit(body, request);
        break;
      default:
        return json(
          {
            error: {
              code: "INVALID_LIFECYCLE_ACTION",
              message: "Unsupported visit event.",
            },
          },
          400,
        );
    }

    if (parsed.action === "start") {
      return json({ data });
    }

    // A visit/session mismatch intentionally looks like an unaccepted event;
    // callers cannot use the endpoint to discover somebody else's visit IDs.
    return json({ data: { accepted: Boolean(data) } }, 202);
  } catch (error) {
    if (
      error?.code === "PORTFOLIO_ANALYTICS_DISABLED" ||
      error?.code === "PORTFOLIO_ANALYTICS_HOST_NOT_ALLOWED"
    ) {
      return json({ error: { code: "NOT_FOUND", message: "Not found." } }, 404);
    }

    const validationPaths = error?.errors && typeof error.errors === "object"
      ? Object.keys(error.errors).slice(0, 12)
      : [];
    console.error(
      "[portfolio-analytics] visit event failed:",
      JSON.stringify({
        stage: operationStage,
        action: parsed.action,
        name: typeof error?.name === "string" ? error.name.slice(0, 80) : "Error",
        message: getSafeErrorMessage(error),
        code: typeof error?.code === "string" || typeof error?.code === "number"
          ? String(error.code).slice(0, 80)
          : null,
        causeName: typeof error?.cause?.name === "string"
          ? error.cause.name.slice(0, 80)
          : null,
        validationPaths,
      }),
    );
    return unavailable();
  }
}

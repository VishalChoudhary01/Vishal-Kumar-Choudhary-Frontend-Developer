import { NextResponse } from "next/server";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabSource from "@/app/lib/labs/models/LabSource";
import LabSourceVersion from "@/app/lib/labs/models/LabSourceVersion";
import { recordVerifiedSourceEvent } from "@/app/lib/labs/engagement";
import { getPublishedLabExperimentBySlug } from "@/app/data/labsExperiments";
import { isPublishedCustomLabSlug } from "@/app/lib/labs/public-experiments";
import { isExcludedLabsAnalyticsOwner } from "@/app/lib/labs/analytics-owner.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;

function json(body, status = 200, extraHeaders = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Vary: "Cookie, Authorization",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

export async function POST(request, { params }) {
  const { slug } = await params;

  if (!SLUG_PATTERN.test(slug || "")) {
    return json({ error: { code: "NOT_FOUND", message: "Experiment not found." } }, 404);
  }

  // Code-owned experiments are resolved from the static catalogue. Owner-
  // created experiments must have a published source and a ready artifact
  // whose sourceVersionId still matches the published source pointer.
  let isPublishedExperiment = Boolean(getPublishedLabExperimentBySlug(slug));
  if (!isPublishedExperiment) {
    try {
      isPublishedExperiment = await isPublishedCustomLabSlug(slug);
    } catch (error) {
      console.error("[labs-source-event] experiment lookup failed:", error?.code || "EXPERIMENT_LOOKUP_ERROR");
      return json({ error: { code: "EVENT_UNAVAILABLE", message: "This action is temporarily unavailable." } }, 503);
    }
  }

  if (!isPublishedExperiment) {
    return json({ error: { code: "NOT_FOUND", message: "Experiment not found." } }, 404);
  }

  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return json({ error: { code: "INVALID_ORIGIN", message: "This request is not allowed." } }, 403);
  }

  let session;
  try {
    session = await getCurrentAuthSession();
  } catch (error) {
    console.error("[labs-source-event] session lookup failed:", error?.code || "SESSION_LOOKUP_ERROR");
    return json({ error: { code: "EVENT_UNAVAILABLE", message: "This action is temporarily unavailable." } }, 503);
  }

  if (!session?.user?.id) {
    return json({ error: { code: "UNAUTHENTICATED", message: "Sign in to use protected source." } }, 401);
  }

  // Owner source opens and copies are intentionally not analytics activity.
  // Identity is read from the trusted server session, never the request body.
  if (isExcludedLabsAnalyticsOwner(session.user)) {
    return json({ data: { recorded: false, excluded: true } });
  }

  if (session.user.emailVerified !== true) {
    return json({ error: { code: "EMAIL_VERIFICATION_REQUIRED", message: "Verify your email before using protected source." } }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "INVALID_REQUEST", message: "A valid request body is required." } }, 400);
  }

  const eventType = body?.eventType;
  if (!["source_open", "code_copy"].includes(eventType)) {
    return json({ error: { code: "INVALID_EVENT", message: "Unsupported source event." } }, 400);
  }

  const eventId =
    typeof body?.eventId === "string" && EVENT_ID_PATTERN.test(body.eventId)
      ? body.eventId
      : null;

  if (!eventId) {
    return json({ error: { code: "INVALID_EVENT_ID", message: "A valid event ID is required." } }, 400);
  }

  try {
    await connectToDatabase();

    const source = await LabSource.findOne({ slug })
      .select("version files published publishedVersionId")
      .lean();

    if (!source || source.published !== true) {
      return json({ error: { code: "NOT_FOUND", message: "Source is not available." } }, 404);
    }

    let snapshot = source;
    if (source.publishedVersionId) {
      snapshot = await LabSourceVersion.findOne({
        versionId: source.publishedVersionId,
        experimentSlug: slug,
      })
        .select("version files")
        .lean();
    }

    if (!snapshot || !Array.isArray(snapshot.files)) {
      return json({ error: { code: "NOT_FOUND", message: "Source is not available." } }, 404);
    }

    let filePath = null;
    if (eventType === "code_copy") {
      if (typeof body?.filePath !== "string" || body.filePath.length > 180) {
        return json({ error: { code: "INVALID_FILE", message: "A valid source file is required." } }, 400);
      }

      const exists = snapshot.files.some(
        (file) => file?.path === body.filePath && typeof file.content === "string",
      );

      if (!exists) {
        return json({ error: { code: "INVALID_FILE", message: "The requested source file is not available." } }, 404);
      }

      filePath = body.filePath;
    }

    if (
      typeof body?.sourceVersion !== "string" ||
      body.sourceVersion !== snapshot.version
    ) {
      return json({ error: { code: "SOURCE_VERSION_CHANGED", message: "The published source has changed. Refresh and try again." } }, 409);
    }

    const result = await recordVerifiedSourceEvent({
      eventType,
      slug,
      userId: session.user.id,
      sourceVersion: snapshot.version,
      sourceVersionId: String(source.publishedVersionId || source._id),
      filePath,
      eventId,
    });

    if (result.rateLimited) {
      const retryAfterSeconds = Math.max(1, Number(result.retryAfterSeconds) || 1);
      return json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many source events. Please wait before trying again.",
            retryAfterSeconds,
          },
        },
        429,
        { "Retry-After": String(retryAfterSeconds) },
      );
    }

    return json({ data: result });
  } catch (error) {
    console.error("[labs-source-event] event write failed:", error?.code || "SOURCE_EVENT_ERROR");
    return json({ error: { code: "EVENT_UNAVAILABLE", message: "This action is temporarily unavailable." } }, 503);
  }
}

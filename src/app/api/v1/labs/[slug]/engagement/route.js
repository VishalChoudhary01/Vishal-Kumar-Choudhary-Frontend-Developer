import { NextResponse } from "next/server";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import {
  getLabEngagement,
  LABS_GUEST_LIKE_COOKIE,
  clearGuestIdentityCookie,
  mergeGuestLikesIntoVerifiedAccount,
  resolveGuestIdentity,
  setGuestIdentityCookie,
  setLabLike,
} from "@/app/lib/labs/engagement";
import { getPublishedLabExperimentBySlug } from "@/app/data/labsExperiments";
import { isPublishedCustomLabSlug } from "@/app/lib/labs/public-experiments";
import { isExcludedLabsAnalyticsOwner } from "@/app/lib/labs/analytics-owner.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

function actorFor(session, guestIdentity) {
  if (session?.user?.id && session.user.emailVerified === true) {
    return { type: "verified", userId: session.user.id };
  }

  if (session?.user?.id) return null;

  return guestIdentity
    ? { type: "guest", guestKeyHash: guestIdentity.guestKeyHash }
    : null;
}

function publicEngagement(data, extra = {}) {
  return {
    totalLikes: Math.max(0, Number(data?.totalLikes) || 0),
    liked: data?.liked === true,
    ...extra,
  };
}

function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  return Boolean(origin) && origin === request.nextUrl.origin;
}

async function readSession() {
  return getCurrentAuthSession();
}

async function isPublicExperiment(slug) {
  return Boolean(
    getPublishedLabExperimentBySlug(slug) ||
    await isPublishedCustomLabSlug(slug)
  );
}

export async function GET(request, { params }) {
  const { slug } = await params;

  if (!SLUG_PATTERN.test(slug || "") || !(await isPublicExperiment(slug))) {
    return json({ error: { code: "NOT_FOUND", message: "Experiment not found." } }, 404);
  }

  try {
    const session = await readSession();
    if (isExcludedLabsAnalyticsOwner(session?.user)) {
      const engagement = await getLabEngagement({ slug, actor: null });
      const response = json({
        data: publicEngagement(engagement, {
          likeAllowed: false,
          actorType: "owner_excluded",
        }),
      });
      clearGuestIdentityCookie(response);
      return response;
    }

    const hasGuestCookie = Boolean(
      request.cookies?.get?.(LABS_GUEST_LIKE_COOKIE)?.value,
    );
    const identity =
      session?.user?.id || !hasGuestCookie
        ? null
        : resolveGuestIdentity(request);

    if (session?.user?.id && session.user.emailVerified === true && hasGuestCookie) {
      const claimedIdentity = resolveGuestIdentity(request);
      await mergeGuestLikesIntoVerifiedAccount({
        guestKeyHash: claimedIdentity.guestKeyHash,
        userId: session.user.id,
      });
    }

    const actor = actorFor(session, identity);
    const engagement = await getLabEngagement({ slug, actor });
    const canLikeAsGuest = !session?.user?.id;

    const response = json({
      data: publicEngagement(engagement, {
        likeAllowed: Boolean(actor) || canLikeAsGuest,
        actorType: actor?.type || (canLikeAsGuest ? "guest" : "unverified"),
      }),
    });

    if (session?.user?.id && session.user.emailVerified === true && hasGuestCookie) {
      clearGuestIdentityCookie(response);
    } else if (identity?.token) {
      setGuestIdentityCookie(response, identity.token);
    }

    return response;
  } catch (error) {
    console.error("[labs-engagement] read failed:", error?.code || "ENGAGEMENT_READ_ERROR");
    return json(
      { error: { code: "ENGAGEMENT_UNAVAILABLE", message: "Engagement is temporarily unavailable." } },
      503,
    );
  }
}

export async function POST(request, { params }) {
  const { slug } = await params;

  if (!SLUG_PATTERN.test(slug || "") || !(await isPublicExperiment(slug))) {
    return json({ error: { code: "NOT_FOUND", message: "Experiment not found." } }, 404);
  }

  if (!isSameOrigin(request)) {
    return json({ error: { code: "INVALID_ORIGIN", message: "This request is not allowed." } }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: { code: "INVALID_REQUEST", message: "A valid request body is required." } }, 400);
  }

  if (typeof body?.liked !== "boolean") {
    return json({ error: { code: "INVALID_REQUEST", message: "Like state must be true or false." } }, 400);
  }

  try {
    const session = await readSession();
    if (isExcludedLabsAnalyticsOwner(session?.user)) {
      const engagement = await getLabEngagement({ slug, actor: null });
      const response = json({
        data: publicEngagement(engagement, {
          actorType: "owner_excluded",
          likeAllowed: false,
        }),
      });
      clearGuestIdentityCookie(response);
      return response;
    }

    const hasGuestCookie = Boolean(
      request.cookies?.get?.(LABS_GUEST_LIKE_COOKIE)?.value,
    );
    const identity =
      session?.user?.id ? null : resolveGuestIdentity(request);

    if (session?.user?.id && session.user.emailVerified === true && hasGuestCookie) {
      const claimedIdentity = resolveGuestIdentity(request);
      await mergeGuestLikesIntoVerifiedAccount({
        guestKeyHash: claimedIdentity.guestKeyHash,
        userId: session.user.id,
      });
    }

    const actor = actorFor(session, identity);

    if (!actor) {
      return json(
        { error: { code: "EMAIL_VERIFICATION_REQUIRED", message: "Verify your email before liking." } },
        403,
      );
    }

    const data = await setLabLike({ slug, actor, liked: body.liked });
    if (data.rateLimited) {
      return json(
        { error: { code: "RATE_LIMITED", message: "Please wait a moment before changing your like again." } },
        429,
      );
    }

    const response = json({
      data: publicEngagement(data, {
        actorType: actor.type === "verified" ? "verified_user" : "guest",
        likeAllowed: true,
      }),
    });

    if (session?.user?.id && session.user.emailVerified === true && hasGuestCookie) {
      clearGuestIdentityCookie(response);
    } else if (identity?.token) {
      setGuestIdentityCookie(response, identity.token);
    }

    return response;
  } catch (error) {
    console.error("[labs-engagement] update failed:", error?.code || "ENGAGEMENT_UPDATE_ERROR");
    return json(
      { error: { code: "ENGAGEMENT_UNAVAILABLE", message: "Your like could not be saved right now." } },
      503,
    );
  }
}

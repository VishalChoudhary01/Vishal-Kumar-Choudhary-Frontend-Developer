import { NextResponse } from "next/server";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { getAuthorizedLabSource } from "@/app/lib/labs/source-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function response(body, status) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      Vary: "Cookie, Authorization",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(_request, { params }) {
  const { slug } = await params;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "")) {
    return response(
      { error: { code: "NOT_FOUND", message: "Source is not available." } },
      404,
    );
  }

  let session;
  try {
    session = await getCurrentAuthSession();
  } catch (error) {
    console.error("[labs-source] session lookup failed:", error?.code || "SESSION_LOOKUP_ERROR");
    return response(
      { error: { code: "SOURCE_UNAVAILABLE", message: "Source is temporarily unavailable." } },
      503,
    );
  }

  if (!session?.user?.id) {
    return response(
      {
        error: {
          code: "UNAUTHENTICATED",
          message: "Sign in to view this experiment's source.",
        },
      },
      401,
    );
  }

  if (session.user.emailVerified !== true) {
    return response(
      {
        error: {
          code: "EMAIL_VERIFICATION_REQUIRED",
          message: "Verify your email before viewing protected source.",
        },
      },
      403,
    );
  }

  try {
    const result = await getAuthorizedLabSource({
      user: session.user,
      slug,
    });

    if (result.status === "forbidden") {
      return response(
        {
          error: {
            code: "SOURCE_ACCESS_DENIED",
            message:
              "Your account doesn't currently have permission to view this experiment's source code.",
          },
        },
        403,
      );
    }

    if (result.status === "not-found") {
      return response(
        { error: { code: "NOT_FOUND", message: "Source is not available." } },
        404,
      );
    }

    if (result.status !== "ok") {
      return response(
        {
          error: {
            code: "SOURCE_UNAVAILABLE",
            message: "Source is temporarily unavailable.",
          },
        },
        503,
      );
    }

    return response({ data: result.data }, 200);
  } catch (error) {
    console.error(
      "[labs-source] protected source request failed:",
      error?.code || "SOURCE_ERROR",
    );

    return response(
      {
        error: {
          code: "SOURCE_UNAVAILABLE",
          message: "Source is temporarily unavailable.",
        },
      },
      503,
    );
  }
}

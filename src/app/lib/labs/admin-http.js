import "server-only";

import { NextResponse } from "next/server";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { isLabsOwner } from "./owner-access";

export function adminJson(body, status = 200) {
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

export function isSameOriginMutation(request) {
  return Boolean(request.headers.get("origin")) &&
    request.headers.get("origin") === request.nextUrl.origin;
}

export async function getLabsOwnerUser() {
  let session;
  try {
    session = await getCurrentAuthSession();
  } catch (error) {
    console.error("[labs-owner] session lookup failed:", error?.code || "SESSION_LOOKUP_ERROR");
    return { response: adminJson({ error: { code: "UNAVAILABLE", message: "Owner services are temporarily unavailable." } }, 503) };
  }

  if (!session?.user?.id) {
    return { response: adminJson({ error: { code: "UNAUTHENTICATED", message: "Sign in is required." } }, 401) };
  }

  if (!isLabsOwner(session.user)) {
    return { response: adminJson({ error: { code: "FORBIDDEN", message: "Owner access is required." } }, 403) };
  }

  return { user: session.user };
}

export function adminError(error) {
  const statusByCode = {
    OWNER_ACCESS_DENIED: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 400,
  };
  const status = statusByCode[error?.code] || 503;
  const message =
    status === 503
      ? "The requested owner operation is temporarily unavailable."
      : error.message;

  if (status === 503) {
    console.error("[labs-owner] operation failed:", error?.code || "OWNER_OPERATION_ERROR");
  }

  return adminJson(
    { error: { code: error?.code || "UNAVAILABLE", message } },
    status,
  );
}

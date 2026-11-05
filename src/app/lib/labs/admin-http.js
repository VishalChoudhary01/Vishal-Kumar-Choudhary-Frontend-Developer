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
    PREVIEW_REQUIRED: 409,
    MEDIA_INVALID: 400,
    MEDIA_UPLOAD_EXPIRED: 409,
    MEDIA_NOT_READY: 409,
    MEDIA_CONFIG_MISSING: 503,
    MEDIA_PROVIDER_ERROR: 503,
    COMPILER_NOT_CONFIGURED: 503,
    ARTIFACT_STORAGE_NOT_CONFIGURED: 503,
    PREVIEW_START_FAILED: 503,
    REQUEST_TOO_LARGE: 413,
    FILE_TOO_LARGE: 400,
    SNAPSHOT_TOO_LARGE: 400,
    BUILD_OUTPUT_TOO_LARGE: 422,
    BUILD_FAILED: 422,
    BUILD_ENTRY_MISSING: 422,
    BUILD_OUTPUT_INVALID: 422,
    BUILD_RESULT_INVALID: 422,
    INVALID_FILE_COUNT: 400,
    INVALID_PATH: 400,
    UNSUPPORTED_FILE: 400,
    MISSING_ENTRY: 400,
    INVALID_HTML_ENTRY: 400,
    INVALID_REACT_ENTRY: 400,
    INVALID_TAILWIND_ENTRY: 400,
    UNRESOLVED_IMPORT: 422,
    SOURCE_HASH_MISMATCH: 409,
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

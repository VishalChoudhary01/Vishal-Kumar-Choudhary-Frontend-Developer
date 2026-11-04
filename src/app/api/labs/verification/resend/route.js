import { NextResponse } from "next/server";

import {
  auth,
  isAuthDeliveryConfigured,
  isAuthRuntimeConfigured,
} from "@/app/lib/auth/auth";
import { createVerificationFlow } from "@/app/lib/auth/registration-consent";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";
import { getAuthBaseURL } from "@/app/lib/auth/base-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body, status) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Vary: "Cookie",
    },
  });
}

export async function POST(request) {
  if (!isAuthRuntimeConfigured() || !isAuthDeliveryConfigured()) {
    return json(
      {
        error: {
          code: "AUTH_DELIVERY_UNAVAILABLE",
          message: "Email verification is temporarily unavailable.",
        },
      },
      503,
    );
  }

  try {
    const payload = await request.json();
    const email =
      typeof payload?.email === "string"
        ? payload.email.trim().toLowerCase()
        : "";

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Enter a valid email address.",
          },
        },
        422,
      );
    }

    const flowId = await createVerificationFlow(email);
    const siteUrl = getAuthBaseURL(new URL(request.url).origin);
    const callbackURL = new URL("/labs/verify-email", siteUrl);
    callbackURL.searchParams.set("flow", flowId);
    callbackURL.searchParams.set(
      "returnTo",
      getSafeReturnTo(payload?.returnTo),
    );

    try {
      await auth.api.sendVerificationEmail({
        headers: request.headers,
        body: {
          email,
          callbackURL: callbackURL.toString(),
        },
      });
    } catch (error) {
      // Keep the same client-visible result for existing and unknown emails.
      // The configured mail service may be temporarily unavailable.
      console.error(
        "[labs-verification] resend failed:",
        error?.code || "VERIFICATION_SEND_ERROR",
      );
    }

    return json(
      {
        ok: true,
        message:
          "If an account can be verified with this address, a verification message will be sent.",
      },
      202,
    );
  } catch (error) {
    console.error(
      "[labs-verification] request failed:",
      error?.code || "VERIFICATION_REQUEST_ERROR",
    );

    return json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Unable to process this request right now. Please try again.",
        },
      },
      503,
    );
  }
}

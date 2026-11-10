import { NextResponse } from "next/server";

import {
  auth,
  isAuthDeliveryConfigured,
  isAuthRuntimeConfigured,
} from "@/app/lib/auth/auth";
import { createVerificationFlow } from "@/app/lib/auth/verification-flows";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";
import { getAuthBaseURL } from "@/app/lib/auth/base-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

    const sendResult = await auth.api.sendVerificationEmail({
      headers: request.headers,
      body: {
        email,
        callbackURL: callbackURL.toString(),
      },
    });

    const sendError = sendResult?.error;
    const sendErrorStatus = Number(
      sendError?.status ?? sendError?.statusCode ?? sendError?.status_code ?? 0,
    );
    const deliveryFailed =
      sendError &&
      (
        sendErrorStatus >= 500 ||
        sendError?.code === "AUTH_EMAIL_DELIVERY_FAILED" ||
        /AUTH_EMAIL_DELIVERY_FAILED|email delivery failed/i.test(String(sendError?.message || ""))
      );

    if (deliveryFailed) {
      const error = new Error("AUTH_EMAIL_DELIVERY_FAILED");
      error.code = "AUTH_EMAIL_DELIVERY_FAILED";
      throw error;
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
          code: error?.code === "AUTH_EMAIL_DELIVERY_FAILED"
            ? "AUTH_EMAIL_DELIVERY_FAILED"
            : "SERVICE_UNAVAILABLE",
          message: "Email delivery is temporarily unavailable. Please try again shortly.",
        },
      },
      503,
    );
  }
}

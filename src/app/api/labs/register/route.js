import { NextResponse } from "next/server";

import {
  auth,
  isAuthDeliveryConfigured,
} from "@/app/lib/auth/auth";
import { consumeRegistrationAttempt } from "@/app/lib/auth/registration-rate-limit";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";
import { getAuthBaseURL } from "@/app/lib/auth/base-url";
import {
  createVerificationFlow,
  discardPendingVerificationFlow,
} from "@/app/lib/auth/verification-flows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const GENERIC_RESPONSE = {
  ok: true,
  message:
    "If an account can be created with this address, you'll receive an email with the next steps.",
};

function json(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private", Vary: "Cookie" },
  });
}

function isValidEmail(value) {
  return typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

export async function POST(request) {
  if (!isAuthDeliveryConfigured()) {
    return json(
      {
        error: {
          code: "AUTH_SETUP_REQUIRED",
          message: "Email/password registration is not available yet.",
        },
      },
      503,
    );
  }

  const startedAt = Date.now();
  let flowId = null;

  try {
    const payload = await request.json();
    const email = typeof payload?.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";
    const password = payload?.password;

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Enter a valid email address and password.",
          },
        },
        422,
      );
    }

    const rate = await consumeRegistrationAttempt(request);
    if (!rate.allowed) {
      return json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many attempts. Please try again shortly.",
          },
        },
        429,
      );
    }

    const siteUrl = getAuthBaseURL(new URL(request.url).origin);
    const returnTo = getSafeReturnTo(payload?.returnTo);
    const verificationCallback = new URL("/labs/verify-email", siteUrl);
    verificationCallback.searchParams.set("returnTo", returnTo);

    flowId = await createVerificationFlow(email);
    verificationCallback.searchParams.set("flow", flowId);

    const result = await auth.api.signUpEmail({
      headers: request.headers,
      body: {
        name: "Labs member",
        email,
        password,
        callbackURL: verificationCallback.toString(),
      },
    });

    if (result?.error) {
      await discardPendingVerificationFlow(flowId).catch(() => {});

      const resultError = result.error;
      const resultErrorStatus = Number(
        resultError?.status ?? resultError?.statusCode ?? resultError?.status_code ?? 0,
      );
      const deliveryFailed =
        resultErrorStatus >= 500 ||
        resultError?.code === "AUTH_EMAIL_DELIVERY_FAILED" ||
        /AUTH_EMAIL_DELIVERY_FAILED|email delivery failed/i.test(String(resultError?.message || ""));

      if (deliveryFailed) {
        const error = new Error("AUTH_EMAIL_DELIVERY_FAILED");
        error.code = "AUTH_EMAIL_DELIVERY_FAILED";
        throw error;
      }
    }

    const remaining = 700 - (Date.now() - startedAt);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    return json(GENERIC_RESPONSE, 202);
  } catch (error) {
    if (flowId) {
      await discardPendingVerificationFlow(flowId).catch(() => {});
    }

    console.error(
      "[labs-register] registration request failed:",
      error?.code || "REGISTRATION_ERROR",
    );
    return json(
      {
        error: {
          code: error?.code === "AUTH_EMAIL_DELIVERY_FAILED"
            ? "AUTH_EMAIL_DELIVERY_FAILED"
            : "SERVICE_UNAVAILABLE",
          message: error?.code === "AUTH_EMAIL_DELIVERY_FAILED"
            ? "Email delivery is temporarily unavailable. Please try again shortly."
            : "Unable to create your account right now. Please try again.",
        },
      },
      503,
    );
  }
}

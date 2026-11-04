import { NextResponse } from "next/server";

import {
  auth,
  isAuthDeliveryConfigured,
  isAuthRuntimeConfigured,
  isLegalConsentConfigured,
} from "@/app/lib/auth/auth";
import { consumeRegistrationAttempt } from "@/app/lib/auth/registration-rate-limit";
import { getSafeReturnTo } from "@/app/lib/auth/return-to";
import { getLegalDocumentConfig } from "@/app/lib/legal/policies";
import {
  discardUnlinkedRegistrationConsent,
  recordRegistrationConsent,
} from "@/app/lib/auth/registration-consent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  return typeof value === "string" && value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}

export async function POST(request) {
  if (!isAuthRuntimeConfigured() || !isAuthDeliveryConfigured() || !isLegalConsentConfigured()) {
    return json(
      { error: { code: "AUTH_SETUP_REQUIRED", message: "Account registration is not available yet." } },
      503,
    );
  }

  const startedAt = Date.now();

  try {
    const payload = await request.json();
    const email = typeof payload?.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";
    const password = payload?.password;
    const acceptedTerms = payload?.acceptedTerms === true;

    if (!isValidEmail(email) || !isValidPassword(password) || !acceptedTerms) {
      return json(
        { error: { code: "VALIDATION_ERROR", message: "Check the form fields and accept both legal documents." } },
        422,
      );
    }

    const legalDocuments = getLegalDocumentConfig();
    const termsVersion = legalDocuments.terms.version;
    const privacyVersion = legalDocuments.privacy.version;

    const rate = await consumeRegistrationAttempt(request);
    if (!rate.allowed) {
      return json(
        { error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again shortly." } },
        429,
      );
    }

    const siteUrl =
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const returnTo = getSafeReturnTo(payload?.returnTo);
    const verificationCallback = new URL("/labs/verify-email", siteUrl);
    verificationCallback.searchParams.set("returnTo", returnTo);

    const receiptId = await recordRegistrationConsent({
      email,
      termsVersion,
      privacyVersion,
    });
    verificationCallback.searchParams.set("flow", receiptId);

    try {
      await auth.api.signUpEmail({
        headers: request.headers,
        body: {
          name: "Labs member",
          email,
          password,
          callbackURL: verificationCallback.toString(),
        },
      });
    } catch {
      // A failed/duplicate registration must not leave an unused consent row.
      await discardUnlinkedRegistrationConsent(receiptId).catch(() => {});
      // Duplicate or other account-specific outcomes remain generic.
    }

    const remaining = 700 - (Date.now() - startedAt);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    return json(GENERIC_RESPONSE, 202);
  } catch (error) {
    console.error("[labs-register] registration request failed:", error?.code || "REGISTRATION_ERROR");
    return json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "Unable to create your account right now. Please try again." } },
      503,
    );
  }
}

"use client";

import { useState } from "react";

import { authClient } from "@/app/lib/auth/client";
import AuthField from "./AuthField";
import AuthSubmit from "./AuthSubmit";
import AuthMessage from "./AuthMessage";
import AuthLink from "./AuthLink";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm({ returnTo, emailDeliveryEnabled }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(email.trim() ? "Enter a valid email address." : "This field is required.");
      document.getElementById("email")?.focus();
      return;
    }

    if (!emailDeliveryEnabled) {
      setGlobalError("Password recovery is not configured yet.");
      return;
    }

    setError("");
    setGlobalError("");
    setLoading(true);

    try {
      const origin = window.location.origin;
      const resetUrl = new URL("/labs/reset-password", origin);
      resetUrl.searchParams.set("returnTo", returnTo);
      const redirectTo = resetUrl.toString();

      const result = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo,
      });

      if (result?.error) {
        setGlobalError("Unable to send a reset link right now. Please try again.");
        return;
      }

      setComplete(true);
    } catch {
      setGlobalError("Unable to send a reset link right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <div className="py-3 text-center">
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          Check your email
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          If an account exists for this email address, you&apos;ll receive instructions to reset your password.
        </p>
        <div className="mt-6">
          <AuthLink href={"/labs/login?returnTo=" + encodeURIComponent(returnTo)}>
            Back to sign in
          </AuthLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {globalError ? <AuthMessage>{globalError}</AuthMessage> : null}

      <form onSubmit={submit} noValidate className="space-y-4">
        <AuthField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => {
            if (email && !EMAIL_PATTERN.test(email.trim())) setError("Enter a valid email address.");
          }}
          autoComplete="email"
          inputMode="email"
          error={error}
          disabled={loading}
        />
        <AuthSubmit loading={loading ? "Sending reset link…" : ""} disabled={loading}>
          Send reset link
        </AuthSubmit>
      </form>

      <div className="mt-5 text-center">
        <AuthLink href={"/labs/login?returnTo=" + encodeURIComponent(returnTo)}>
          Back to sign in
        </AuthLink>
      </div>
    </>
  );
}

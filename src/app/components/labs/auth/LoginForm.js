"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth/client";
import { publishAuthEvent } from "@/app/lib/auth/session-events";
import AuthField from "./AuthField";
import AuthSubmit from "./AuthSubmit";
import AuthMessage from "./AuthMessage";
import AuthLink from "./AuthLink";
import SocialAuthButtons from "./SocialAuthButtons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({
  returnTo,
  initialError,
  googleEnabled,
  githubEnabled,
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(initialError || "");
  const [verificationRequired, setVerificationRequired] = useState(false);

  const validate = (name, value) => {
    if (name === "email") {
      if (!value.trim()) return "This field is required.";
      if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
    }

    if (name === "password" && !value) return "This field is required.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = {
      email: validate("email", email),
      password: validate("password", password),
    };

    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors).find((key) => nextErrors[key]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setLoading(true);
    setGlobalError("");
    setVerificationRequired(false);

    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        const requiresVerification = result.error.status === 403;
        setVerificationRequired(requiresVerification);
        setGlobalError(
          requiresVerification
            ? "Your email address is not verified yet. Verify it before signing in."
            : "Check your email and password, then try again.",
        );
        return;
      }

      publishAuthEvent("sign-in");
      router.replace(returnTo);
      router.refresh();
    } catch {
      setGlobalError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Sign in to access your Labs account.
        </p>
      </div>

      {globalError ? (
        <AuthMessage title="Unable to sign in">
          {globalError}
          {verificationRequired ? (
            <span className="mt-2 block">
              <AuthLink href={"/labs/verify-email?returnTo=" + encodeURIComponent(returnTo)}>
                Verify your email
              </AuthLink>
            </span>
          ) : null}
        </AuthMessage>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => {
            const value = event.target.value;
            setEmail(value);
            if (submitted) setErrors((current) => ({ ...current, email: validate("email", value) }));
          }}
          onBlur={() => setErrors((current) => ({ ...current, email: validate("email", email) }))}
          autoComplete="email"
          inputMode="email"
          disabled={loading}
          error={errors.email}
        />

        <div>
          <AuthField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => {
              const value = event.target.value;
              setPassword(value);
              if (submitted) setErrors((current) => ({ ...current, password: validate("password", value) }));
            }}
            onBlur={() => setErrors((current) => ({ ...current, password: validate("password", password) }))}
            autoComplete="current-password"
            disabled={loading}
            error={errors.password}
          />
          <div className="mt-1 flex justify-end">
            <AuthLink href={"/labs/forgot-password?returnTo=" + encodeURIComponent(returnTo)}>
              Forgot password?
            </AuthLink>
          </div>
        </div>

        <AuthSubmit loading={loading ? "Signing in…" : ""} disabled={loading}>
          Sign in
        </AuthSubmit>
      </form>

      <SocialAuthButtons
        intent="sign-in"
        returnTo={returnTo}
        googleEnabled={googleEnabled}
        githubEnabled={githubEnabled}
        disabled={loading}
        onPendingChange={setLoading}
      />

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <AuthLink href={"/labs/signup?returnTo=" + encodeURIComponent(returnTo)}>
          Create an account
        </AuthLink>
      </p>
    </>
  );
}

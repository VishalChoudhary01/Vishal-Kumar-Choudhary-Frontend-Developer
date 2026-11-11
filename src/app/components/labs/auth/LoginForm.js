"use client";

import { useRef, useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(initialError || "");
  const [verificationRequired, setVerificationRequired] = useState(false);
  const submitLockRef = useRef(false);

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

    // React state updates are asynchronous. Lock synchronously so repeated
    // clicks/Enter presses cannot start concurrent sign-in requests.
    if (submitLockRef.current) return;

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

    submitLockRef.current = true;
    setLoading(true);
    setGlobalError("");
    setVerificationRequired(false);

    let navigationStarted = false;

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
      navigationStarted = true;

      // The auth cookie is set by Better Auth before this resolves. A full
      // same-origin navigation makes the destination read the fresh server
      // session and keeps the submit button locked until this form unmounts.
      window.location.replace(returnTo);
    } catch {
      navigationStarted = false;
      setGlobalError("Unable to sign in right now. Please try again.");
    } finally {
      if (!navigationStarted) {
        submitLockRef.current = false;
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="mb-3 text-center sm:mb-4">
        <h1 className="font-display text-[1.55rem] leading-tight tracking-[-0.025em] sm:text-[1.7rem]">
          Welcome back
        </h1>
        <p className="mt-1 text-xs leading-5 text-text-secondary sm:mt-1.5 sm:text-sm">
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

      <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-2.5 sm:space-y-3">
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

      <p className="mt-3 text-center text-xs text-text-secondary sm:mt-4 sm:text-sm">
        Don&apos;t have an account?{" "}
        <AuthLink href={"/labs/signup?returnTo=" + encodeURIComponent(returnTo)}>
          Create an account
        </AuthLink>
      </p>
    </>
  );
}

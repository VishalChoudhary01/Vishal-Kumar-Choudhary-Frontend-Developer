"use client";

import { useState } from "react";
import AuthField from "./AuthField";
import AuthSubmit from "./AuthSubmit";
import AuthMessage from "./AuthMessage";
import AuthLink from "./AuthLink";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupForm({
  returnTo,
  legal,
  registrationEnabled,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [complete, setComplete] = useState(false);

  const validate = (name, value) => {
    if (name === "email") {
      if (!value.trim()) return "This field is required.";
      if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
    }

    if (name === "password") {
      if (!value) return "This field is required.";
      if (value.length < 8) return "Use at least 8 characters.";
      if (value.length > 128) return "Password must be 128 characters or fewer.";
    }

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
    setConsentError(accepted ? "" : "Please accept the Terms of Service and Privacy Policy to continue.");

    const firstInvalid = Object.keys(nextErrors).find((key) => nextErrors[key]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    if (!accepted) {
      document.getElementById("legal-consent")?.focus();
      return;
    }

    if (!registrationEnabled) {
      setGlobalError("Account registration is not configured yet.");
      return;
    }

    setLoading(true);
    setGlobalError("");

    try {
      const response = await fetch("/api/labs/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          acceptedTerms: accepted,
          returnTo,
        }),
      });

      const result = await response.json();

      if (response.status === 202 && result?.ok) {
        setComplete(true);
        return;
      }

      if (response.status === 422) {
        setGlobalError("Check the form fields and accept both legal documents.");
        return;
      }

      setGlobalError(
        result?.error?.message ||
          "Unable to create your account right now. Please try again.",
      );
    } catch {
      setGlobalError("Unable to create your account right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <div className="py-3 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3.5 6.5h17v11h-17z" />
            <path d="m4 7 8 6 8-6" />
            <path d="m8.5 12.5 2.2 2.2 4.8-5" />
          </svg>
        </div>
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          Check your email
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          If an account can be created with this address, you&apos;ll receive an email with the next steps.
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
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Start using your Labs account.
        </p>
      </div>

      {globalError ? <AuthMessage title="Unable to create account">{globalError}</AuthMessage> : null}

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
          error={errors.email}
          disabled={loading}
        />

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
          autoComplete="new-password"
          helper="Use at least 8 characters."
          error={errors.password}
          disabled={loading}
        />

        <div className="pt-1">
          <div className="flex items-start gap-2.5">
            <input
              id="legal-consent"
              type="checkbox"
              aria-label="I agree to the Terms of Service and Privacy Policy."
              checked={accepted}
              disabled={loading || !registrationEnabled}
              onChange={(event) => {
                setAccepted(event.target.checked);
                if (event.target.checked) setConsentError("");
              }}
              aria-invalid={Boolean(consentError)}
              aria-describedby={consentError ? "legal-consent-error" : undefined}
              className="mt-1 h-4 w-4 shrink-0 rounded-sm border-border accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
            <div className="text-sm leading-6 text-text-secondary">
              <label htmlFor="legal-consent">
                I agree to the{" "}
              </label>
              <a
                href={legal.termsUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Terms of Service
              </a>
              {" "}and{" "}
              <a
                href={legal.privacyUrl || undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Privacy Policy
              </a>
              .
            </div>
          </div>
          {consentError ? (
            <p id="legal-consent-error" className="mt-1.5 text-xs leading-5 text-error">
              {consentError}
            </p>
          ) : null}
        </div>

        {!registrationEnabled ? (
          <AuthMessage>
            Account registration will be available after email delivery and both legal documents are configured.
          </AuthMessage>
        ) : null}

        <AuthSubmit
          loading={loading ? "Creating account…" : ""}
          disabled={loading || !registrationEnabled}
        >
          Create account
        </AuthSubmit>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <AuthLink href={"/labs/login?returnTo=" + encodeURIComponent(returnTo)}>
          Sign in
        </AuthLink>
      </p>
    </>
  );
}

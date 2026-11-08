"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/app/lib/auth/client";
import { publishAuthEvent } from "@/app/lib/auth/session-events";
import AuthField from "./AuthField";
import AuthSubmit from "./AuthSubmit";
import AuthMessage from "./AuthMessage";
import AuthLink from "./AuthLink";

export default function ResetPasswordForm({ token, returnTo }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [complete, setComplete] = useState(false);
  const [invalidToken, setInvalidToken] = useState(!token);

  const validate = () => ({
    password: !password
      ? "This field is required."
      : password.length < 8
        ? "Use at least 8 characters."
        : password.length > 128
          ? "Password must be 128 characters or fewer."
          : "",
    confirmPassword: !confirmPassword
      ? "This field is required."
      : confirmPassword !== password
        ? "Passwords do not match."
        : "",
  });

  const submit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validate();
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors).find((key) => nextErrors[key]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setLoading(true);
    setGlobalError("");

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result?.error) {
        setInvalidToken(true);
        return;
      }

      publishAuthEvent("password-reset");
      setComplete(true);
    } catch {
      setInvalidToken(true);
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="py-3 text-center">
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          This link is no longer valid
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          This password-reset link may have expired or already been used. Request a new link to continue.
        </p>
        <div className="mt-6">
          <AuthLink href={"/labs/forgot-password?returnTo=" + encodeURIComponent(returnTo)}>
            Request a new link
          </AuthLink>
        </div>
        <div className="mt-3">
          <AuthLink href={"/labs/login?returnTo=" + encodeURIComponent(returnTo)}>
            Back to sign in
          </AuthLink>
        </div>
      </div>
    );
  }

  if (complete) {
    return (
      <div className="py-3 text-center">
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          Password updated
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        <button
          type="button"
          onClick={() => router.replace("/labs/login?returnTo=" + encodeURIComponent(returnTo))}
          className="mt-6 h-[46px] w-full rounded-sm bg-brand px-4 text-sm font-semibold text-brand-contrast transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Continue to sign in
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          Create a new password
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Choose a new password for your Labs account.
        </p>
      </div>

      {globalError ? <AuthMessage>{globalError}</AuthMessage> : null}

      <form onSubmit={submit} noValidate className="space-y-4">
        <AuthField
          id="password"
          label="New Password"
          type="password"
          value={password}
          onChange={(event) => {
            const value = event.target.value;
            setPassword(value);
            if (submitted) {
              setErrors((current) => ({
                ...current,
                password: !value ? "This field is required." : value.length < 8 ? "Use at least 8 characters." : value.length > 128 ? "Password must be 128 characters or fewer." : "",
                confirmPassword: confirmPassword && confirmPassword !== value ? "Passwords do not match." : "",
              }));
            }
          }}
          onBlur={() => {
            setErrors((current) => ({
              ...current,
              password: !password ? "This field is required." : password.length < 8 ? "Use at least 8 characters." : password.length > 128 ? "Password must be 128 characters or fewer." : "",
            }));
          }}
          autoComplete="new-password"
          helper="Use at least 8 characters."
          error={errors.password}
          disabled={loading}
        />

        <AuthField
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            const value = event.target.value;
            setConfirmPassword(value);
            if (submitted) {
              setErrors((current) => ({
                ...current,
                confirmPassword: !value ? "This field is required." : value !== password ? "Passwords do not match." : "",
              }));
            }
          }}
          onBlur={() => setErrors((current) => ({
            ...current,
            confirmPassword: !confirmPassword ? "This field is required." : confirmPassword !== password ? "Passwords do not match." : "",
          }))}
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={loading}
        />

        <AuthSubmit loading={loading ? "Updating password…" : ""} disabled={loading}>
          Update password
        </AuthSubmit>
      </form>
    </>
  );
}

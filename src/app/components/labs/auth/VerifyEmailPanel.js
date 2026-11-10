"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import AuthField from "./AuthField";
import AuthSubmit from "./AuthSubmit";
import AuthMessage from "./AuthMessage";
import AuthLink from "./AuthLink";

function maskEmail(value) {
  if (typeof value !== "string" || !value.includes("@")) return "";

  const [local, domain] = value.split("@");
  if (!local || !domain) return "";

  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return visible + "••••@" + domain;
}

export default function VerifyEmailPanel({ verified, invalid, emailDeliveryEnabled, returnTo }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maskedAddress, setMaskedAddress] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const resend = async (event) => {
    event.preventDefault();

    if (!emailDeliveryEnabled || loading || countdown > 0) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setResent(false);

    try {
      const response = await fetch("/api/labs/verification/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim().toLowerCase(), returnTo }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result?.ok) {
        setError(result?.error?.message || "Unable to process this request right now. Please try again shortly.");
        return;
      }
      setMaskedAddress(maskEmail(email.trim().toLowerCase()));
      setCountdown(30);
      setResent(true);
    } catch {
      setError("Unable to resend the verification email. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="py-3 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="m5 12.5 4.2 4.2L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          Email verified
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Your email address has been successfully verified. You can now sign in to your Labs account.
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
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center text-brand" aria-hidden="true">
          <LoaderCircle size={24} className="animate-spin motion-reduce:animate-none" />
        </div>
        <h1 className="font-display text-[2rem] leading-tight tracking-[-0.025em]">
          {invalid ? "This link is no longer valid" : "Verify your email"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {invalid
            ? "This verification link may have expired or already been used. Request a new verification email to continue."
            : "Check your inbox and follow the verification link to activate your Labs account."}
        </p>
      </div>

      {resent ? (
        <AuthMessage tone="success">
          {maskedAddress ? "If an account can be verified with " + maskedAddress + ", a verification message will be sent." : "If an account can be verified with this address, a verification message will be sent."}
        </AuthMessage>
      ) : null}
      {error ? <AuthMessage>{error}</AuthMessage> : null}

      <form onSubmit={resend} className="space-y-4">
        <AuthField
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          inputMode="email"
          disabled={loading || countdown > 0}
        />

        <button
          type="submit"
          disabled={!emailDeliveryEnabled || loading || countdown > 0}
          className="flex min-h-10 w-full items-center justify-center rounded-sm px-3 text-sm font-medium text-brand transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:text-text-tertiary"
        >
          {loading
            ? "Sending…"
            : countdown > 0
              ? "Resend available in 00:" + String(countdown).padStart(2, "0")
              : "Resend verification email"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <AuthLink href={"/labs/login?returnTo=" + encodeURIComponent(returnTo)}>Back to sign in</AuthLink>
      </div>
    </>
  );
}

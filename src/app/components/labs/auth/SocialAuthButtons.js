"use client";

import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { GrGoogle } from "react-icons/gr";

import { authClient } from "@/app/lib/auth/client";
import AuthMessage from "./AuthMessage";

const PROVIDERS = {
  google: {
    label: "Continue with Google",
    Icon: GrGoogle,
  },
  github: {
    label: "Continue with GitHub",
    Icon: FaGithub,
  },
};

export default function SocialAuthButtons({
  intent = "sign-in",
  returnTo,
  googleEnabled = false,
  githubEnabled = false,
  disabled = false,
  onPendingChange,
}) {
  const [pendingProvider, setPendingProvider] = useState("");
  const [error, setError] = useState("");

  const providers = [
    ...(googleEnabled ? ["google"] : []),
    ...(githubEnabled ? ["github"] : []),
  ];

  if (providers.length === 0) return null;

  const isSignup = intent === "sign-up";
  const authPath = isSignup ? "/labs/signup" : "/labs/login";

  const handleProvider = async (provider) => {
    if (disabled || pendingProvider) return;

    setPendingProvider(provider);
    setError("");
    onPendingChange?.(true);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: returnTo,
        errorCallbackURL:
          authPath +
          "?error=" +
          provider +
          "&returnTo=" +
          encodeURIComponent(returnTo),
        requestSignUp: isSignup,
      });

      if (result?.error) {
        throw new Error(result.error.message || "Provider authentication failed.");
      }
    } catch {
      setError(
        provider === "github"
          ? "GitHub sign-in could not be completed. Make sure your GitHub account has a verified email address, then try again."
          : "Google sign-in could not be completed. Please try again.",
      );
      setPendingProvider("");
      onPendingChange?.(false);
    }
  };

  return (
    <div className="mt-3 sm:mt-4">
      <div className="mb-2.5 flex items-center gap-2.5 text-[10px] text-text-tertiary sm:mb-3 sm:gap-3 sm:text-xs">
        <span className="h-px flex-1 bg-border" />
        <span>OR CONTINUE WITH</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {error ? <AuthMessage title="Social sign-in unavailable">{error}</AuthMessage> : null}

      <div className="grid gap-2">
        {providers.map((provider) => {
          const { label, Icon } = PROVIDERS[provider];
          const isPending = pendingProvider === provider;

          return (
            <button
              key={provider}
              type="button"
              onClick={() => handleProvider(provider)}
              disabled={disabled || Boolean(pendingProvider)}
              aria-busy={isPending}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-sm border border-border px-3 text-xs font-medium text-text-primary transition-colors hover:border-border-strong hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-55 sm:h-10 sm:px-4 sm:text-sm"
            >
              <Icon size={16} aria-hidden="true" />
              {isPending ? "Connecting…" : label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

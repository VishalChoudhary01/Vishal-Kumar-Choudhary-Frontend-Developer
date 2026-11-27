"use client";

import { useEffect, useRef } from "react";
import { MailCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import AuthLink from "./AuthLink";

export default function SignupConfirmation({ returnTo, onUseAnotherEmail }) {
  const headingRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const loginHref = "/labs/login?returnTo=" + encodeURIComponent(returnTo);
  const resetHref = "/labs/forgot-password?returnTo=" + encodeURIComponent(returnTo);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <motion.section
      aria-labelledby="signup-confirmation-title"
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
      className="py-2 text-center sm:py-3"
    >
      <div
        className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand"
        aria-hidden="true"
      >
        <MailCheck className="h-5 w-5" strokeWidth={1.7} />
      </div>

      <h1
        id="signup-confirmation-title"
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[1.55rem] leading-tight tracking-[-0.025em] outline-none sm:text-[1.7rem]"
      >
        Check your email
      </h1>

      <p className="mx-auto mt-2 max-w-[30rem] text-xs leading-5 text-text-secondary sm:mt-3 sm:text-sm sm:leading-6">
        If this email address can be used to create a Labs account, we&apos;ll send a message with the next steps. Check your inbox and spam folder.
      </p>

      <div className="mt-5 rounded-sm bg-surface-2 px-3 py-3 text-left">
        <p className="text-xs leading-5 text-text-secondary sm:text-sm">
          Already use Labs? Sign in with your existing method or reset your password.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <AuthLink href={loginHref} className="font-semibold">
            Continue to sign in
          </AuthLink>
          <AuthLink href={resetHref}>Forgot password?</AuthLink>
        </div>
      </div>

      <button
        type="button"
        onClick={onUseAnotherEmail}
        className="mt-4 rounded-sm px-2 py-1 text-xs font-medium text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-sm"
      >
        Use another email
      </button>
    </motion.section>
  );
}

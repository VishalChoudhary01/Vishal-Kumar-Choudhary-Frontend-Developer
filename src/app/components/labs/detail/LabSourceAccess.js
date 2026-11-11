"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import { CopyIcon as AnimatedCopy } from "@animateicons/react/lucide/copy-icon";
import { LogInIcon } from "@animateicons/react/lucide/log-in-icon";
import { UserRoundPlusIcon } from "@animateicons/react/lucide/user-round-plus-icon";
import { MailCheckIcon } from "@animateicons/react/lucide/mail-check-icon";
import { EyeIcon } from "@animateicons/react/lucide/eye-icon";
import { LockIcon } from "@animateicons/react/lucide/lock-icon";
import {
  AlertTriangle,
  Check,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { subscribeAuthEvents } from "@/app/lib/auth/session-events";
import { authClient } from "@/app/lib/auth/client";
import LabCodeEditor from "@/app/components/labs/code/LabCodeEditor";

function AnimatedSourceAction({ href, label, Icon, primary = false, isAnimated = true }) {
  const iconRef = useRef(null);

  const startIconAnimation = () => iconRef.current?.startAnimation?.();
  const stopIconAnimation = () => iconRef.current?.stopAnimation?.();

  return (
    <Link
      href={href}
      onMouseEnter={startIconAnimation}
      onMouseLeave={stopIconAnimation}
      onFocus={startIconAnimation}
      onBlur={stopIconAnimation}
      className={[
        "inline-flex h-10 items-center gap-2 border px-4 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none",
        primary
          ? "border-brand bg-brand text-brand-contrast hover:-translate-y-px hover:bg-brand-hover"
          : "border-brand text-brand hover:-translate-y-px hover:bg-brand-soft",
      ].join(" ")}
    >
      <Icon
        ref={iconRef}
        size={14}
        duration={0.68}
        isAnimated={isAnimated}
        aria-hidden="true"
      />
      {label}
    </Link>
  );
}

function getInitialSource(source, slug, userId) {
  if (!source || !userId || !Array.isArray(source.files)) return null;
  return { ...source, slug, userId };
}

function getInitialState(authState, source) {
  if (source) return "loaded";
  if (authState === "verification") return "verification";
  if (authState === "unpublished") return "unpublished";
  if (authState === "error") return "error";
  if (authState === "verified") return "loading";
  return "unauthenticated";
}

export default function LabSourceAccess({
  slug,
  initialUserId = null,
  initialAuthState = "guest",
  initialSource = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const returnTo = pathname + "?source=1";
  const { resolvedTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const firstSource = getInitialSource(initialSource, slug, initialUserId);
  const [loading, setLoading] = useState(initialAuthState === "verified" && !firstSource);
  const [source, setSource] = useState(firstSource);
  const [selectedFile, setSelectedFile] = useState(0);
  const [state, setState] = useState(getInitialState(initialAuthState, firstSource));
  const [error, setError] = useState(
    initialAuthState === "error" ? "We could not load the published source. Please try again." : "",
  );
  const [copied, setCopied] = useState(false);
  const copyIconRef = useRef(null);

  const startCopyIconAnimation = () => copyIconRef.current?.startAnimation?.();
  const stopCopyIconAnimation = () => copyIconRef.current?.stopAnimation?.();
  const selectedSourceFile = source?.files?.[selectedFile] || null;
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const sourceRef = useRef(firstSource);
  const sourceRequestRef = useRef(0);
  const autoLoadKeyRef = useRef(firstSource ? pathname + ":" + slug + ":" + initialUserId : null);
  const autoOpenKeyRef = useRef(null);

  const signInHref = "/labs/login?returnTo=" + encodeURIComponent(returnTo);
  const signUpHref = "/labs/signup?returnTo=" + encodeURIComponent(returnTo);
  const verifyHref = "/labs/verify-email?returnTo=" + encodeURIComponent(returnTo);

  const recordSourceOpen = useCallback((requestedSlug, version) => {
    fetch("/api/v1/labs/" + encodeURIComponent(requestedSlug) + "/source/events", {
      method: "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "source_open",
        sourceVersion: version,
        eventId: globalThis.crypto?.randomUUID?.() || "open_" + Date.now() + "_" + Math.random().toString(36).slice(2),
      }),
    }).catch(() => {});
  }, []);

  // Initial source is fetched and authorized in the Server Component. Record
  // its open event after hydration without putting source content in analytics.
  const initialOpenRecordedRef = useRef(false);
  useEffect(() => {
    if (
      !initialOpenRecordedRef.current &&
      firstSource &&
      !sessionPending &&
      session?.user?.id === firstSource.userId &&
      session.user.emailVerified === true
    ) {
      initialOpenRecordedRef.current = true;
      recordSourceOpen(slug, firstSource.version);
    }
  }, [firstSource, recordSourceOpen, session?.user?.emailVerified, session?.user?.id, sessionPending, slug]);

  const loadSource = useCallback(async () => {
    if (sessionPending || loading) return;

    if (!session?.user?.id) {
      sourceRequestRef.current += 1;
      sourceRef.current = null;
      setSource(null);
      setState(initialUserId ? "session-mismatch" : "unauthenticated");
      setError(initialUserId
        ? "The verified session used to render this page is no longer available. Sign in again to continue."
        : "");
      setLoading(false);
      return;
    }

    if (session.user.emailVerified !== true) {
      sourceRequestRef.current += 1;
      sourceRef.current = null;
      setSource(null);
      setState("verification");
      setError("");
      setLoading(false);
      return;
    }

    const requestId = sourceRequestRef.current + 1;
    sourceRequestRef.current = requestId;
    const requestedSlug = slug;
    const requestedUserId = session.user.id;

    setLoading(true);
    setState("loading");
    setError("");

    try {
      const response = await fetch(
        "/api/v1/labs/" + encodeURIComponent(requestedSlug) + "/source",
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        },
      );
      const payload = await response.json().catch(() => ({}));
      if (sourceRequestRef.current !== requestId) return;

      if (response.status === 401) {
        sourceRef.current = null;
        setSource(null);
        setState("session-mismatch");
        setError("Your sign-in session could not be confirmed by this Labs deployment. Sign in again on this address to continue.");
        return;
      }

      if (response.status === 403) {
        sourceRef.current = null;
        setSource(null);
        setState(payload?.error?.code === "SOURCE_ACCESS_DENIED" ? "denied" : "verification");
        setError(payload?.error?.message || "");
        return;
      }

      if (response.status === 404) {
        sourceRef.current = null;
        setSource(null);
        setError("This experiment does not have a published source snapshot yet.");
        setState("unpublished");
        return;
      }

      if (!response.ok || !payload?.data?.files?.length) {
        sourceRef.current = null;
        setSource(null);
        setError(payload?.error?.message || "Source is temporarily unavailable.");
        setState("error");
        return;
      }

      const nextSource = {
        ...payload.data,
        slug: requestedSlug,
        userId: requestedUserId,
      };
      sourceRef.current = nextSource;
      setSource(nextSource);
      setSelectedFile(0);
      setState("loaded");
      recordSourceOpen(requestedSlug, payload.data.version);
    } catch {
      if (sourceRequestRef.current === requestId) {
        setError("Unable to load source right now. Please try again.");
        setState("error");
      }
    } finally {
      if (sourceRequestRef.current === requestId) setLoading(false);
    }
  }, [initialUserId, loading, recordSourceOpen, session, sessionPending, slug]);

  // The server-rendered session is authoritative for the first paint. After
  // hydration, reconcile it with the current client session and auto-fetch if
  // the session became verified after the page was opened.
  useEffect(() => {
    if (sessionPending) return undefined;

    let active = true;

    const clearSourceForSessionState = (nextState, nextError) => {
      sourceRequestRef.current += 1;
      const requestId = sourceRequestRef.current;
      sourceRef.current = null;
      autoLoadKeyRef.current = null;

      // Defer the UI reset out of the effect body. The source ref and request
      // generation are invalidated immediately, so stale code cannot be copied
      // while React applies the corresponding visual state on the next task.
      queueMicrotask(() => {
        if (!active || sourceRequestRef.current !== requestId) return;
        setSource(null);
        setLoading(false);
        setState(nextState);
        setError(nextError);
      });
    };

    if (!session?.user?.id) {
      clearSourceForSessionState(
        initialUserId ? "session-mismatch" : "unauthenticated",
        initialUserId
          ? "The verified session used to render this page is no longer available. Sign in again to continue."
          : "",
      );
      return () => {
        active = false;
      };
    }

    if (session.user.emailVerified !== true) {
      clearSourceForSessionState("verification", "");
      return () => {
        active = false;
      };
    }

    const userKey = pathname + ":" + slug + ":" + session.user.id;
    if (
      sourceRef.current?.slug === slug &&
      sourceRef.current?.userId === session.user.id
    ) {
      autoLoadKeyRef.current = userKey;
      return () => {
        active = false;
      };
    }
    if (autoLoadKeyRef.current === userKey) {
      return () => {
        active = false;
      };
    }

    autoLoadKeyRef.current = userKey;
    loadSource();

    return () => {
      active = false;
    };
  }, [
    initialUserId,
    loadSource,
    pathname,
    session,
    sessionPending,
    slug,
  ]);

  // Restore the source section after login/signup without adding another
  // access-check click. The server/client session has already loaded the code.
  useEffect(() => {
    if (sessionPending) return;
    const shouldOpen = new URLSearchParams(window.location.search).get("source") === "1";
    const userId = session?.user?.id || "guest";
    const autoOpenKey = pathname + ":" + slug + ":" + userId;
    if (!shouldOpen || autoOpenKeyRef.current === autoOpenKey) return;

    autoOpenKeyRef.current = autoOpenKey;
    const timer = window.setTimeout(() => {
      document.getElementById("lab-source-content")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [pathname, session?.user?.id, sessionPending, slug]);

  useEffect(() => {
    let checking = false;

    const clearExpiredSource = (event) => {
      sourceRequestRef.current += 1;
      sourceRef.current = null;
      setSource(null);
      setState("unauthenticated");
      setLoading(false);
      if (event?.type === "sign-out" && event.isLocalTab) return;
      router.replace("/labs/login?error=session-expired&returnTo=" + encodeURIComponent(returnTo));
    };

    const revalidateSourceSession = async () => {
      if (!sourceRef.current || checking) return;
      checking = true;

      try {
        const response = await fetch("/api/auth/get-session", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        const current = await response.json().catch(() => null);

        if (
          !response.ok ||
          !current?.user?.id ||
          current.user.emailVerified !== true ||
          current.user.id !== sourceRef.current?.userId
        ) {
          clearExpiredSource();
        }
      } catch {
        clearExpiredSource();
      } finally {
        checking = false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") revalidateSourceSession();
    };
    const timer = window.setInterval(revalidateSourceSession, 60_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const unsubscribe = subscribeAuthEvents((event) => {
      if (
        sourceRef.current &&
        (
          event.type === "sign-out" ||
          event.type === "password-reset" ||
          event.type === "session-invalidated"
        )
      ) {
        clearExpiredSource(event);
      }
    });

    return () => {
      sourceRequestRef.current += 1;
      sourceRef.current = null;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      unsubscribe();
    };
  }, [returnTo, router]);

  const copyCurrentFile = async () => {
    if (source?.slug !== slug || source?.userId !== session?.user?.id) return;
    const file = source?.files?.[selectedFile];
    if (!file) return;

    try {
      await navigator.clipboard.writeText(file.content);
      fetch("/api/v1/labs/" + encodeURIComponent(slug) + "/source/events", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "code_copy",
          sourceVersion: source.version,
          filePath: file.path,
          eventId: globalThis.crypto?.randomUUID?.() || "copy_" + Date.now() + "_" + Math.random().toString(36).slice(2),
        }),
      }).catch(() => {});
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
      setState("error");
    }
  };

  return (
    <section
      id="lab-source-content"
      aria-label="Protected experiment source"
      className="mx-auto mt-12 w-full max-w-[1440px] scroll-mt-28 px-6 sm:px-8 lg:px-20"
    >
      <div className="border border-border bg-surface-1 p-5 sm:p-6">
        {sessionPending && !firstSource || (state === "loading" && !source) ? (
          <div className="flex min-h-24 items-center gap-3" role="status" aria-live="polite">
            <LoaderCircle size={18} className="animate-spin text-brand motion-reduce:animate-none" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold">Loading published source</h2>
              <p className="mt-1 text-sm text-text-secondary">Confirming your verified Labs session…</p>
            </div>
          </div>
        ) : state === "loaded" && source ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-brand">
                  <EyeIcon size={15} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                  PROTECTED SOURCE
                </div>
                <h2 className="mt-2 text-lg font-semibold">Source code</h2>
                <p className="mt-1 text-xs text-text-tertiary">Version {source.version}</p>
              </div>
              <button
                type="button"
                onClick={copyCurrentFile}
                onMouseEnter={startCopyIconAnimation}
                onMouseLeave={stopCopyIconAnimation}
                onFocus={startCopyIconAnimation}
                onBlur={stopCopyIconAnimation}
                disabled={sessionPending || session?.user?.id !== source.userId}
                className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check size={14} aria-hidden="true" /> : <AnimatedCopy ref={copyIconRef} size={14} duration={0.62} isAnimated={!prefersReducedMotion} aria-hidden="true" />}
                {copied ? "Copied" : "Copy file"}
              </button>
            </div>
            {source.files.length > 1 ? (
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Source files">
                {source.files.map((file, index) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedFile(index)}
                    aria-pressed={selectedFile === index}
                    className={[
                      "min-h-8 border px-3 text-xs transition-colors",
                      selectedFile === index
                        ? "border-brand bg-brand-soft text-text-primary"
                        : "border-border text-text-secondary hover:bg-surface-2",
                    ].join(" ")}
                  >
                    {file.path}
                  </button>
                ))}
              </div>
            ) : null}
            {selectedSourceFile ? (
              <div className="mt-4 overflow-hidden border border-border bg-surface-inset">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
                  <p className="min-w-0 truncate font-mono text-xs text-text-secondary">
                    {selectedSourceFile.path}
                  </p>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-text-tertiary">
                    {selectedSourceFile.language}
                  </span>
                </div>
                <LabCodeEditor
                  value={selectedSourceFile.content}
                  language={selectedSourceFile.language}
                  readOnly
                  scope="reader"
                  experimentSlug={slug}
                  versionId={String(source.version)}
                  filePath={selectedSourceFile.path}
                  theme={resolvedTheme === "light" ? "labs-light" : "labs-dark"}
                  wordWrap="off"
                  minimap={false}
                  keepCurrentModel={false}
                  ariaLabel={"Read-only source code: " + selectedSourceFile.path}
                  className="h-[min(620px,70svh)] min-h-[320px] w-full border-0"
                />
              </div>
            ) : (
              <p className="mt-4 border border-border bg-surface-inset px-4 py-6 text-sm text-text-secondary" role="status">
                This source file is unavailable. Choose another file or reload the published source.
              </p>
            )}
          </>
        ) : !session?.user?.id && !initialUserId ? (
          <div className="flex items-start gap-3">
            <EyeIcon size={19} duration={0.68} isAnimated={!prefersReducedMotion} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold">View the source</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Published source is available to every Labs account with a verified email.
                Sign in or create an account to explore the files.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <AnimatedSourceAction
                  href={signInHref}
                  label="Sign in"
                  Icon={LogInIcon}
                  primary
                  isAnimated={!prefersReducedMotion}
                />
                <AnimatedSourceAction
                  href={signUpHref}
                  label="Create account"
                  Icon={UserRoundPlusIcon}
                  isAnimated={!prefersReducedMotion}
                />
              </div>
            </div>
          </div>
        ) : session?.user?.emailVerified !== true && state !== "session-mismatch" ? (
          <div className="flex items-start gap-3">
            <LockIcon size={19} duration={0.68} isAnimated={!prefersReducedMotion} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold">Verify your email to view source</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Your account is signed in, but source access becomes available after email verification.
              </p>
              <div className="mt-4">
                <AnimatedSourceAction
                  href={verifyHref}
                  label="Verify email"
                  Icon={MailCheckIcon}
                  primary
                  isAnimated={!prefersReducedMotion}
                />
              </div>
            </div>
          </div>
        ) : state === "unpublished" ? (
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-text-tertiary" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold">Source not published yet</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold">{state === "session-mismatch" ? "Sign in again on this address" : "Source temporarily unavailable"}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">{error || "We could not load this published source. Your account remains signed in."}</p>
              {state === "session-mismatch" ? (
                <div className="mt-4">
                  <AnimatedSourceAction href={signInHref} label="Sign in again" Icon={LogInIcon} primary isAnimated={!prefersReducedMotion} />
                </div>
              ) : (
                <button type="button" onClick={() => { autoLoadKeyRef.current = null; loadSource(); }} disabled={loading} className="mt-4 inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-semibold transition-colors hover:border-brand disabled:opacity-50">
                  <RefreshCw size={13} aria-hidden="true" /> Try again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

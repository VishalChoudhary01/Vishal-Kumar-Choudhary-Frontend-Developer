"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";

import { subscribeAuthEvents } from "@/app/lib/auth/session-events";
import AuthMessage from "@/app/components/labs/auth/AuthMessage";
import { authClient } from "@/app/lib/auth/client";

export default function LabSourceAccess({ slug }) {
  const router = useRouter();
  const pathname = usePathname();
  const returnTo = pathname + "?source=1";

  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null);
  const [selectedFile, setSelectedFile] = useState(0);
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const sourceRef = useRef(null);
  const sourceRequestRef = useRef(0);
  const autoOpenKeyRef = useRef(null);
  const autoLoadKeyRef = useRef(null);

  const signInHref = "/labs/login?returnTo=" + encodeURIComponent(returnTo);
  const signUpHref = "/labs/signup?returnTo=" + encodeURIComponent(returnTo);
  const verifyHref = "/labs/verify-email?returnTo=" + encodeURIComponent(returnTo);

  const loadSource = useCallback(async () => {
    if (sessionPending || loading) return;

    if (!session?.user?.id) {
      sourceRef.current = null;
      setSource(null);
      setState("unauthenticated");
      setError("");
      return;
    }

    if (session.user.emailVerified !== true) {
      sourceRef.current = null;
      setSource(null);
      setState("verification");
      setError("");
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

      if (response.status === 403 && payload?.error?.code === "SOURCE_ACCESS_DENIED") {
        sourceRef.current = null;
        setSource(null);
        setState("denied");
        setError("This published source is not available for the current account.");
        return;
      }

      if (response.status === 403) {
        sourceRef.current = null;
        setSource(null);
        setState("verification");
        setError("");
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
          sourceVersion: payload.data.version,
          eventId: globalThis.crypto?.randomUUID?.() || "open_" + Date.now() + "_" + Math.random().toString(36).slice(2),
        }),
      }).catch(() => {});
    } catch {
      if (sourceRequestRef.current === requestId) {
        setError("Unable to load source right now. Please try again.");
        setState("error");
      }
    } finally {
      if (sourceRequestRef.current === requestId) setLoading(false);
    }
  }, [loading, session?.user?.emailVerified, session?.user?.id, sessionPending, slug]);

  // Verified sessions load the published source automatically. Guests are
  // shown authentication links; unverified accounts are shown verification.
  useEffect(() => {
    if (sessionPending) return;

    if (!session?.user?.id) {
      sourceRequestRef.current += 1;
      sourceRef.current = null;
      setSource(null);
      setLoading(false);
      setState("unauthenticated");
      setError("");
      autoLoadKeyRef.current = null;
      return;
    }

    if (session.user.emailVerified !== true) {
      sourceRequestRef.current += 1;
      sourceRef.current = null;
      setSource(null);
      setLoading(false);
      setState("verification");
      setError("");
      autoLoadKeyRef.current = null;
      return;
    }

    const userKey = pathname + ":" + slug + ":" + session.user.id;
    if (
      sourceRef.current?.slug === slug &&
      sourceRef.current?.userId === session.user.id &&
      state === "loaded"
    ) {
      return;
    }
    if (autoLoadKeyRef.current === userKey) return;

    autoLoadKeyRef.current = userKey;
    loadSource();
  }, [
    loadSource,
    pathname,
    session?.user?.emailVerified,
    session?.user?.id,
    sessionPending,
    slug,
    state,
  ]);

  // A returnTo URL containing ?source=1 opens the source section after login.
  // Verified users are already auto-loaded; the query is only a scroll hint.
  useEffect(() => {
    if (sessionPending) return;

    const shouldOpen = new URLSearchParams(window.location.search).get("source") === "1";
    const autoOpenKey = pathname + ":" + slug + ":" + (session?.user?.id || "guest");
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
        {sessionPending || (session?.user?.emailVerified === true && state === "loading") ? (
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
                  <Code2 size={15} aria-hidden="true" />
                  PROTECTED SOURCE
                </div>
                <h2 className="mt-2 text-lg font-semibold">Source code</h2>
                <p className="mt-1 text-xs text-text-tertiary">Version {source.version}</p>
              </div>
              <button
                type="button"
                onClick={copyCurrentFile}
                className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
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

            <div className="mt-4 overflow-hidden border border-border bg-surface-inset">
              <div className="border-b border-border px-4 py-2 text-xs text-text-tertiary">
                {source.files[selectedFile]?.path}
              </div>
              <pre className="max-h-[620px] overflow-auto p-4 text-xs leading-6 text-text-primary">
                <code>{source.files[selectedFile]?.content}</code>
              </pre>
            </div>
          </>
        ) : !session?.user?.id ? (
          <div className="flex items-start gap-3">
            <LockKeyhole size={19} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold">View the source</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Published source is available to every Labs account with a verified email.
                Sign in or create an account to explore the files.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={signInHref}
                  className="inline-flex h-10 items-center gap-2 bg-brand px-4 text-sm font-semibold text-brand-contrast transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Sign in
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
                <Link
                  href={signUpHref}
                  className="inline-flex h-10 items-center border border-brand px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        ) : session.user.emailVerified !== true || state === "verification" ? (
          <div className="flex items-start gap-3">
            <LockKeyhole size={19} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold">Verify your email to view source</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                Your account is signed in, but source access becomes available after email verification.
              </p>
              <Link
                href={verifyHref}
                className="mt-4 inline-flex h-10 items-center gap-2 bg-brand px-4 text-sm font-semibold text-brand-contrast transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Verify email
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
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
        ) : state === "session-mismatch" ? (
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold">Sign in again on this address</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">{error}</p>
              <Link href={signInHref} className="mt-4 inline-flex h-10 items-center bg-brand px-4 text-sm font-semibold text-brand-contrast">
                Sign in again
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold">Source temporarily unavailable</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                {error || "We could not load this published source. Your account remains signed in."}
              </p>
              <button
                type="button"
                onClick={() => {
                  autoLoadKeyRef.current = null;
                  loadSource();
                }}
                disabled={loading}
                className="mt-4 inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-semibold transition-colors hover:border-brand disabled:opacity-50"
              >
                <RefreshCw size={13} aria-hidden="true" />
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

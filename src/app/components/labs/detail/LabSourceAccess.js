"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpRight, Check, Code2, Copy, LockKeyhole } from "lucide-react";

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

  const signInHref = "/labs/login?returnTo=" + encodeURIComponent(returnTo);
  const signUpHref = "/labs/signup?returnTo=" + encodeURIComponent(returnTo);

  async function loadSource() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/v1/labs/" + encodeURIComponent(slug) + "/source",
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.replace(signInHref);
        return;
      }

      if (response.status === 403 && payload?.error?.code === "SOURCE_ACCESS_DENIED") {
        sourceRef.current = null;
        setSource(null);
        setState("denied");
        return;
      }

      if (response.status === 403) {
        sourceRef.current = null;
        setSource(null);
        setState("verification");
        return;
      }

      if (!response.ok || !payload?.data?.files?.length) {
        sourceRef.current = null;
        setSource(null);
        setError(payload?.error?.message || "Source is temporarily unavailable.");
        setState("error");
        return;
      }

      sourceRef.current = payload.data;
      setSource(payload.data);
      setSelectedFile(0);
      setState("loaded");
    } catch {
      setError("Unable to load source right now. Please try again.");
      setState("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const shouldOpen = new URLSearchParams(window.location.search).get("source") === "1";
    const autoLoadTimer = shouldOpen
      ? window.setTimeout(() => loadSource(), 0)
      : null;

    let checking = false;

    const clearExpiredSource = (event) => {
      sourceRef.current = null;
      setSource(null);
      setState("idle");
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
          current.user.emailVerified !== true
        ) {
          clearExpiredSource();
        }
      } catch {
        // If the source session cannot be verified, fail closed and clear it.
        clearExpiredSource();
      } finally {
        checking = false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        revalidateSourceSession();
      }
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
      if (autoLoadTimer) window.clearTimeout(autoLoadTimer);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      unsubscribe();
    };
    // The source request should only auto-run once per page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyCurrentFile = async () => {
    const file = source?.files?.[selectedFile];
    if (!file) return;

    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard access is unavailable in this browser.");
      setState("error");
    }
  };

  const accessHeading =
    state === "denied"
      ? "Access not available"
      : "Source code";

  return (
    <section
      aria-label="Protected experiment source"
      className="mx-auto mt-12 w-full max-w-[1440px] px-6 sm:px-8 lg:px-20"
    >
      <div className="rounded-[var(--radius-md)] border border-border bg-surface-1 p-5 sm:p-6">
        {state === "denied" ? (
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <h2 className="text-base font-semibold">{accessHeading}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Your account doesn&apos;t currently have permission to view this experiment&apos;s source code.
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                You&apos;re signed in, but this source is not available to your account.
              </p>
              <Link
                href={"/labs/" + slug}
                className="mt-4 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Back to experiment
              </Link>
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
                <p className="mt-1 text-xs text-text-tertiary">
                  Version {source.version}
                </p>
              </div>
              <button
                type="button"
                onClick={copyCurrentFile}
                className="inline-flex h-9 items-center gap-2 rounded-sm border border-border px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
                      "min-h-8 rounded-sm border px-3 text-xs transition-colors",
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

            <div className="mt-4 overflow-hidden rounded-sm border border-border bg-surface-inset">
              <div className="border-b border-border px-4 py-2 text-xs text-text-tertiary">
                {source.files[selectedFile]?.path}
              </div>
              <pre className="max-h-[620px] overflow-auto p-4 text-xs leading-6 text-text-primary">
                <code>{source.files[selectedFile]?.content}</code>
              </pre>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <LockKeyhole size={19} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold">View the source</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                  Protected source snapshots are stored separately from the public demo runtime and are available only to accounts that have been granted access.
                </p>
                {state === "verification" ? (
                  <AuthMessage title="Verify your email">
                    Verify your email address before requesting protected source.
                  </AuthMessage>
                ) : null}
                {state === "error" ? (
                  <AuthMessage>{error}</AuthMessage>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="button"
                    onClick={loadSource}
                    disabled={loading}
                    className="inline-flex h-10 items-center gap-2 rounded-sm bg-brand px-4 text-sm font-semibold text-brand-contrast transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
                  >
                    {loading
                      ? "Checking access…"
                      : sessionPending
                        ? "Checking session…"
                        : session?.user
                          ? "Check source access"
                          : "Sign in to view source"}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </button>
                  <Link
                    href={signUpHref}
                    className="text-sm font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

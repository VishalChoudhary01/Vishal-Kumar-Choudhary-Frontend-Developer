"use client";

import { useEffect, useState } from "react";
import { Heart, LoaderCircle } from "lucide-react";

import { authClient } from "@/app/lib/auth/client";

export default function LabEngagement({ slug }) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const actorScope = session?.user?.id
    ? session.user.id + ":" + String(session.user.emailVerified === true)
    : "guest";
  const scopeKey = slug + ":" + actorScope;
  const [result, setResult] = useState(null);
  const [savingScopeKey, setSavingScopeKey] = useState(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let active = true;

    async function load() {
      try {
        const response = await fetch(
          "/api/v1/labs/" + encodeURIComponent(slug) + "/engagement",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
          },
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok || !payload?.data) {
          throw new Error(payload?.error?.message || "Likes are temporarily unavailable.");
        }

        if (active && requestIdRef.current === requestId) {
          setResult({ scopeKey, data: payload.data, error: "" });
        }
      } catch (error) {
        if (active && requestIdRef.current === requestId) {
          setResult({
            scopeKey,
            data: null,
            error: error.message || "Likes are temporarily unavailable.",
          });
        }
      }
    }

    load();
    return () => {
      active = false;
      if (requestIdRef.current === requestId) requestIdRef.current += 1;
    };
  }, [slug, scopeKey, session?.user?.id, session?.user?.emailVerified]);

  const currentResult = result?.scopeKey === scopeKey ? result : null;
  const currentEngagement = currentResult?.data || null;
  const isLoading = !currentResult;
  const isSaving = savingScopeKey === scopeKey;
  const message = currentResult?.error || "";

  async function toggleLike() {
    if (!currentEngagement?.likeAllowed || isSaving) return;

    const requestId = requestIdRef.current;
    const requestedSlug = slug;
    const requestedScopeKey = scopeKey;
    const nextLiked = !currentEngagement.liked;
    setSavingScopeKey(requestedScopeKey);

    try {
      const response = await fetch(
        "/api/v1/labs/" + encodeURIComponent(requestedSlug) + "/engagement",
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ liked: nextLiked }),
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error?.message || "Your like could not be saved.");
      }

      if (requestIdRef.current === requestId) {
        setResult({ scopeKey: requestedScopeKey, data: payload.data, error: "" });
      }
    } catch (error) {
      if (requestIdRef.current === requestId) {
        setResult({
          scopeKey: requestedScopeKey,
          data: currentEngagement,
          error: error.message || "Your like could not be saved.",
        });
      }
    } finally {
      if (requestIdRef.current === requestId) setSavingScopeKey(null);
    }
  }

  const isUnverified =
    Boolean(session?.user?.id) && session.user.emailVerified !== true;

  return (
    <section
      aria-label="Source appreciation"
      className="mx-auto mt-10 w-full max-w-[1440px] px-6 sm:px-8 lg:px-20"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div>
          <p className="text-sm font-medium text-text-primary">Found this source useful?</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Your like helps highlight source code worth exploring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="min-w-8 text-right text-sm tabular-nums text-text-secondary"
            aria-live="polite"
            aria-label={currentEngagement ? currentEngagement.totalLikes + " likes" : "Like count loading"}
          >
            {isLoading || !currentEngagement ? "—" : (currentEngagement.totalLikes ?? 0).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={toggleLike}
            disabled={
              isLoading ||
              isSaving ||
              !currentEngagement?.likeAllowed ||
              sessionPending
            }
            aria-pressed={currentEngagement?.liked === true}
            aria-label={currentEngagement?.liked ? "Unlike this experiment" : "Like this experiment"}
            className={[
              "inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-xs font-semibold transition-colors",
              currentEngagement?.liked
                ? "border-brand bg-brand-soft text-brand"
                : "border-border text-text-secondary hover:border-brand hover:text-brand",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50",
            ].join(" ")}
          >
            {isSaving ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <Heart
                size={14}
                fill={currentEngagement?.liked ? "currentColor" : "none"}
                aria-hidden="true"
              />
            )}
            {currentEngagement?.liked ? "Liked" : "Like"}
          </button>
        </div>
      </div>

      {message ? (
        <p role="status" className="mt-2 text-xs text-text-tertiary">{message}</p>
      ) : null}
      {!isLoading && !currentEngagement?.likeAllowed ? (
        <p className="mt-2 text-xs text-text-tertiary">
          {isUnverified
            ? "Verify your email to like this experiment."
            : "You can like this experiment as a guest or with a verified account."}
        </p>
      ) : null}
    </section>
  );
}

"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Heart, LoaderCircle } from "lucide-react";

function normalizeEngagement(value) {
  if (!value || typeof value !== "object") return null;

  const verifiedLikes = Math.max(0, Number(value.verifiedLikes) || 0);
  const anonymousLikes = Math.max(0, Number(value.anonymousLikes) || 0);

  return {
    verifiedLikes,
    anonymousLikes,
    totalLikes: Math.max(0, Number(value.totalLikes) || verifiedLikes + anonymousLikes),
    liked: value.liked === true,
    likeAllowed: value.likeAllowed === true,
    actorType: value.actorType || "guest",
  };
}

function applyLikeTransition(current, nextLiked) {
  if (!current || current.liked === nextLiked) return current;

  const delta = nextLiked ? 1 : -1;
  const verified = current.actorType === "verified_user";
  return {
    ...current,
    liked: nextLiked,
    totalLikes: Math.max(0, current.totalLikes + delta),
    verifiedLikes: verified
      ? Math.max(0, current.verifiedLikes + delta)
      : current.verifiedLikes,
    anonymousLikes: verified
      ? current.anonymousLikes
      : Math.max(0, current.anonymousLikes + delta),
  };
}

export default function LabLikeButton({
  slug,
  initialData = null,
  compact = false,
}) {
  const [confirmed, setConfirmed] = useState(() => normalizeEngagement(initialData));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    confirmed,
    (current, next) => next,
  );

  useEffect(() => {
    if (initialData) {
      setConfirmed(normalizeEngagement(initialData));
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          "/api/v1/labs/" + encodeURIComponent(slug) + "/engagement",
          {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.data) {
          throw new Error(payload?.error?.message || "Likes are temporarily unavailable.");
        }
        if (active) {
          setConfirmed(normalizeEngagement(payload.data));
          setMessage("");
        }
      } catch (error) {
        if (active && error?.name !== "AbortError") {
          setMessage(error?.message || "Likes are temporarily unavailable.");
        }
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [initialData, slug]);

  async function toggleLike() {
    if (!optimistic?.likeAllowed || isPending || !optimistic) return;

    const nextLiked = !optimistic.liked;
    const previousConfirmed = confirmed;
    setMessage("");

    startTransition(async () => {
      setOptimistic(applyLikeTransition(optimistic, nextLiked));

      try {
        const response = await fetch(
          "/api/v1/labs/" + encodeURIComponent(slug) + "/engagement",
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

        // The server response is authoritative. useOptimistic keeps the
        // immediate visual state until this confirmed state is committed.
        setConfirmed(normalizeEngagement({
          ...payload.data,
          likeAllowed: previousConfirmed?.likeAllowed ?? true,
          actorType: previousConfirmed?.actorType || "guest",
        }));
        setMessage("");
      } catch (error) {
        // No confirmed state is changed on rejection. When the transition
        // completes, React automatically rolls the optimistic state back.
        setMessage(error?.message || "Your like could not be saved.");
      }
    });
  }

  const data = optimistic || confirmed;
  const isDisabled = !data || !data.likeAllowed || isPending;
  const count = data ? data.totalLikes.toLocaleString() : "—";

  return (
    <div className={compact ? "inline-flex min-w-0 items-center gap-2" : "flex flex-wrap items-center gap-3"}>
      <button
        type="button"
        onClick={toggleLike}
        disabled={isDisabled}
        aria-pressed={data?.liked === true}
        aria-label={data?.liked ? "Unlike this experiment" : "Like this experiment"}
        title={message || (data?.likeAllowed ? "Like this experiment" : data?.actorType === "unverified" ? "Verify your email to like" : "Like unavailable")}
        className={[
          "inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-xs font-semibold transition-colors",
          data?.liked
            ? "border-brand bg-brand-soft text-brand"
            : "border-border text-text-secondary hover:border-brand hover:text-brand",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50",
          compact ? "h-8 px-2.5" : "",
        ].join(" ")}
      >
        {isPending ? (
          <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <Heart
            size={14}
            fill={data?.liked ? "currentColor" : "none"}
            aria-hidden="true"
          />
        )}
        <span>{data?.liked ? "Liked" : "Like"}</span>
        <span className="tabular-nums text-text-tertiary" aria-live="polite">{count}</span>
      </button>
      {message ? (
        <span role="status" className="max-w-52 text-[10px] leading-4 text-warning">
          {message}
        </span>
      ) : null}
      {!message && data && !data.likeAllowed ? (
        <span className="text-[10px] leading-4 text-text-tertiary">
          {data.actorType === "unverified" ? "Verify your email to like." : "Likes unavailable."}
        </span>
      ) : null}
    </div>
  );
}

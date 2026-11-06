"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Heart, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";

import MotionNumber from "@/app/components/motion/MotionNumber/MotionNumber";
import useReducedMotion from "@/app/hooks/useReducedMotion";

function normalizeEngagement(value) {
  if (!value || typeof value !== "object") return null;

  return {
    totalLikes: Math.max(0, Number(value.totalLikes) || 0),
    liked: value.liked === true,
    likeAllowed: value.likeAllowed === true,
    available: value.available !== false,
    actorType: value.actorType || "guest",
  };
}

function applyLikeTransition(current, nextLiked) {
  if (!current || current.liked === nextLiked) return current;

  return {
    ...current,
    liked: nextLiked,
    totalLikes: Math.max(0, current.totalLikes + (nextLiked ? 1 : -1)),
  };
}

export default function LabLikeButton({
  slug,
  initialData = null,
  compact = false,
  loadOnMount = true,
}) {
  const reducedMotion = useReducedMotion();
  const [confirmed, setConfirmed] = useState(() => normalizeEngagement(initialData));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(confirmed, (current, next) => next);

  useEffect(() => {
    if (initialData || !loadOnMount) return undefined;

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
  }, [initialData, loadOnMount, slug]);

  function toggleLike() {
    if (!optimistic?.likeAllowed || isPending || !optimistic?.available) return;

    const nextLiked = !optimistic.liked;
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

        setConfirmed(normalizeEngagement(payload.data));
        setMessage("");
      } catch (error) {
        // useOptimistic restores the last server-confirmed snapshot when the
        // action fails or its transition completes.
        setMessage(error?.message || "Your like could not be saved.");
      }
    });
  }

  const data = optimistic || confirmed;
  const isDisabled = !data || !data.available || !data.likeAllowed || isPending;
  const count = data?.available ? data.totalLikes : null;

  return (
    <div className={compact ? "inline-flex min-w-0 items-center gap-2" : "flex flex-wrap items-center gap-3"}>
      <motion.button
        type="button"
        onClick={toggleLike}
        whileTap={!reducedMotion && data?.likeAllowed && !isPending ? { scale: 0.96 } : undefined}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 28 }}
        disabled={isDisabled}
        aria-pressed={data?.liked === true}
        aria-label={data?.liked ? "Unlike this experiment" : "Like this experiment"}
        title={message || (data?.likeAllowed ? "Like this experiment" : data?.actorType === "unverified" ? "Verify your email to like" : "Like unavailable")}
        className={[
          "inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-xs font-semibold transition-colors motion-reduce:transition-none",
          data?.liked
            ? "border-brand bg-brand-soft text-brand"
            : "border-border text-text-secondary hover:border-brand hover:text-brand",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50",
          compact ? "h-8 px-2.5" : "",
        ].join(" ")}
      >
        {isPending ? (
          <LoaderCircle size={14} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : (
          <motion.span
            key={data?.liked ? "liked" : "unliked"}
            initial={reducedMotion ? false : { scale: 0.72, rotate: data?.liked ? -10 : 8, opacity: 0.65 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 20 }}
            className="inline-flex"
          >
            <Heart
              size={14}
              fill={data?.liked ? "currentColor" : "none"}
              aria-hidden="true"
            />
          </motion.span>
        )}
        <span>{data?.liked ? "Liked" : "Like"}</span>
        <span className="tabular-nums text-text-tertiary" aria-live="polite" aria-atomic="true">
          {count === null ? "—" : (
            <MotionNumber
              value={count}
              locale="en-IN"
              duration={reducedMotion ? 0 : 0.34}
              className="inline-flex"
              digitClassName="min-w-[0.58em]"
            />
          )}
        </span>
      </motion.button>
      {message ? (
        <span role="status" className="max-w-52 text-[10px] leading-4 text-warning">
          {message}
        </span>
      ) : null}
      {!message && (!data || !data.available) ? (
        <span className="text-[10px] leading-4 text-text-tertiary">Likes unavailable.</span>
      ) : null}
      {!message && data?.available && !data.likeAllowed ? (
        <span className="text-[10px] leading-4 text-text-tertiary">
          {data.actorType === "unverified" ? "Verify your email to like." : "Likes unavailable."}
        </span>
      ) : null}
    </div>
  );
}

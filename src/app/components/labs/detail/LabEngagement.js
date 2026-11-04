"use client";

import { useEffect, useState } from "react";
import { Heart, LoaderCircle } from "lucide-react";

import { authClient } from "@/app/lib/auth/client";

export default function LabEngagement({ slug }) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage("");

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

        if (active) setEngagement(payload.data);
      } catch (error) {
        if (active) setMessage(error.message || "Likes are temporarily unavailable.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [slug, session?.user?.id, session?.user?.emailVerified]);

  async function toggleLike() {
    if (!engagement?.likeAllowed || saving) return;

    const nextLiked = !engagement.liked;
    setSaving(true);
    setMessage("");

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

      setEngagement(payload.data);
    } catch (error) {
      setMessage(error.message || "Your like could not be saved.");
    } finally {
      setSaving(false);
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
            aria-label={engagement ? engagement.totalLikes + " likes" : "Like count loading"}
          >
            {loading ? "—" : (engagement?.totalLikes ?? 0).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={toggleLike}
            disabled={
              loading ||
              saving ||
              !engagement?.likeAllowed ||
              sessionPending
            }
            aria-pressed={engagement?.liked === true}
            aria-label={engagement?.liked ? "Unlike this experiment" : "Like this experiment"}
            className={[
              "inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-xs font-semibold transition-colors",
              engagement?.liked
                ? "border-brand bg-brand-soft text-brand"
                : "border-border text-text-secondary hover:border-brand hover:text-brand",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50",
            ].join(" ")}
          >
            {saving ? (
              <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <Heart
                size={14}
                fill={engagement?.liked ? "currentColor" : "none"}
                aria-hidden="true"
              />
            )}
            {engagement?.liked ? "Liked" : "Like"}
          </button>
        </div>
      </div>

      {message ? (
        <p role="status" className="mt-2 text-xs text-text-tertiary">{message}</p>
      ) : null}
      {!loading && !engagement?.likeAllowed ? (
        <p className="mt-2 text-xs text-text-tertiary">
          {isUnverified
            ? "Verify your email to like this experiment."
            : "You can like this experiment as a guest or with a verified account."}
        </p>
      ) : null}
    </section>
  );
}

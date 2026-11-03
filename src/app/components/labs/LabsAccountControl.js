"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";

import { authClient } from "@/app/lib/auth/client";
import { publishAuthEvent, subscribeAuthEvents } from "@/app/lib/auth/session-events";

export default function LabsAccountControl() {
  const router = useRouter();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let mounted = true;

    const refreshSession = async () => {
      try {
        const response = await fetch("/api/auth/get-session", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        const result = await response.json().catch(() => null);

        if (mounted) {
          setSession(response.ok && result?.user?.id ? result : null);
        }
      } catch {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setIsPending(false);
      }
    };

    refreshSession();
    const unsubscribe = subscribeAuthEvents(() => refreshSession());
    const onFocus = () => refreshSession();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const signOut = async () => {
    setLoading(true);
    setOpen(false);
    setLogoutError("");

    try {
      const result = await authClient.signOut();

      if (result?.error) {
        setLogoutError("Unable to sign out right now. Please try again.");
        setOpen(true);
        return;
      }

      publishAuthEvent("sign-out");
      router.replace("/labs");
      router.refresh();
    } catch {
      setLogoutError("Unable to sign out right now. Please try again.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || !session?.user) return null;

  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <UserRound size={17} aria-hidden="true" />
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-[70] mt-2 w-[232px] rounded-sm border border-border bg-surface-elevated p-2 text-text-primary shadow-[var(--shadow-md)]"
        >
          <p className="truncate px-3 py-2 text-xs text-text-secondary" title={session.user.email}>
            {session.user.email}
          </p>
          <div className="my-1 h-px bg-border" />
          {logoutError ? (
            <p role="alert" className="px-3 py-2 text-xs leading-5 text-error">
              {logoutError}
            </p>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={loading}
            className="flex min-h-10 w-full items-center gap-2 rounded-sm px-3 text-left text-sm transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand disabled:opacity-50"
          >
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

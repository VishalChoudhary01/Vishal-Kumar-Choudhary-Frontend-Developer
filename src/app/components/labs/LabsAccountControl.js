"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, ChartNoAxesCombined, Code2, LogOut, MailCheck } from "lucide-react";
import Image from "next/image";

import { getLabsAccountDisplayName, getLabsAccountInitials } from "@/app/lib/labs/auth-user-presentation.mjs";
import { authClient } from "@/app/lib/auth/client";
import { publishAuthEvent, subscribeAuthEvents } from "@/app/lib/auth/session-events";

export default function LabsAccountControl({
  initialUser = null,
  initialSessionResolved = false,
  initialIsOwner = false,
  scrolled = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(() =>
    initialSessionResolved && initialUser ? { user: initialUser } : null
  );
  const [isPending, setIsPending] = useState(!initialSessionResolved);
  const initialSessionKnownRef = useRef(initialSessionResolved);
  const [ownerStatus, setOwnerStatus] = useState(() => ({
    userId: initialIsOwner && initialUser?.id ? initialUser.id : null,
    isOwner: initialIsOwner && Boolean(initialUser?.id),
  }));
  const [logoutError, setLogoutError] = useState("");

  const returnTo = pathname?.startsWith("/labs") ? pathname : "/labs";
  const signInHref = "/labs/login?returnTo=" + encodeURIComponent(returnTo);
  const signUpHref = "/labs/signup?returnTo=" + encodeURIComponent(returnTo);
  const verifyHref = "/labs/verify-email?returnTo=" + encodeURIComponent(returnTo);

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
          if (response.ok) {
            setSession(result?.user?.id ? result : null);
          } else if (!initialSessionKnownRef.current) {
            setSession(null);
          }
        }
      } catch {
        if (mounted && !initialSessionKnownRef.current) {
          setSession(null);
        }
      } finally {
        initialSessionKnownRef.current = false;
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
    const userId = session?.user?.id;
    if (!userId || session?.user?.emailVerified !== true) {
      return undefined;
    }

    let active = true;

    fetch("/api/v1/admin/labs/owner-status", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json().catch(() => null);
      })
      .then((payload) => {
        if (active) {
          setOwnerStatus({
            userId,
            isOwner: payload?.data?.isOwner === true,
          });
        }
      })
      .catch(() => {
        if (active) setOwnerStatus({ userId, isOwner: false });
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id, session?.user?.emailVerified]);

  const isOwner =
    session?.user?.emailVerified === true &&
    ownerStatus.userId === session.user.id &&
    ownerStatus.isOwner;

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
      setSession(null);
      router.replace("/labs");
      router.refresh();
    } catch {
      setLogoutError("Unable to sign out right now. Please try again.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div
        aria-hidden="true"
        className={[
          "hidden h-8 w-[112px] animate-pulse bg-surface-2/70 motion-reduce:animate-none lg:block",
          scrolled ? "rounded-full" : "rounded-sm",
        ].join(" ")}
      />
    );
  }

  if (!session?.user) {
    const isLoginPage = pathname === "/labs/login";
    const isSignupPage = pathname === "/labs/signup";

    return (
      <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
        {!isLoginPage ? (
          <Link
            href={signInHref}
            className={[
              "inline-flex h-8 items-center px-2 text-[11px] font-medium text-text-secondary transition-[color,background-color,border-radius] duration-300 hover:bg-surface-2/70 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-2.5 sm:text-xs",
              scrolled ? "rounded-full" : "rounded-sm",
            ].join(" ")}
          >
            Sign in
          </Link>
        ) : null}
        {!isSignupPage ? (
          <Link
            href={signUpHref}
            className={[
              "inline-flex h-8 items-center justify-center border border-brand bg-brand px-2.5 text-[11px] font-semibold text-brand-contrast transition-[background-color,border-radius,transform] duration-300 hover:-translate-y-px hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:px-3 sm:text-xs",
              scrolled ? "rounded-full" : "rounded-sm",
            ].join(" ")}
          >
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Create account</span>
          </Link>
        ) : null}
      </div>
    );
  }

  const isVerified = session.user.emailVerified === true;
  const displayName = getLabsAccountDisplayName(session.user);
  const accountInitials = getLabsAccountInitials(displayName);
  const avatarUrl = typeof session.user.image === "string" && session.user.image.startsWith("https://")
    ? session.user.image
    : "";

  return (
    <div className="relative flex h-10 shrink-0 items-center justify-center">
      <button
        ref={triggerRef}
        type="button"
        aria-label={displayName + " account menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        title={displayName}
        className="flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full border border-border px-1.5 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:w-auto lg:max-w-[190px] lg:justify-start lg:pr-3"
      >
        {avatarUrl ? (
          <span className="relative isolate size-7 min-w-7 shrink-0 overflow-hidden rounded-full border border-border [clip-path:circle(50%)]">
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="28px"
              unoptimized
              referrerPolicy="no-referrer"
              className="!absolute inset-0 !h-full !w-full max-w-none rounded-full object-cover object-center"
            />
          </span>
        ) : (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-[10px] font-semibold text-text-secondary" aria-hidden="true">
            {accountInitials}
          </span>
        )}
        <span className="hidden max-w-[118px] truncate text-xs font-semibold lg:inline">{displayName}</span>
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-[70] mt-2 w-[248px] rounded-sm border border-border bg-surface-elevated p-2 text-text-primary shadow-[var(--shadow-md)]"
        >
          <div className="flex items-center gap-3 border-b border-border px-3 py-3">
            {avatarUrl ? (
              <span className="relative isolate size-9 min-w-9 shrink-0 overflow-hidden rounded-full border border-border [clip-path:circle(50%)]">
                <Image
                  src={avatarUrl}
                  alt=""
                  fill
                  sizes="36px"
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="!absolute inset-0 !h-full !w-full max-w-none rounded-full object-cover object-center"
                />
              </span>
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-text-secondary" aria-hidden="true">
                {accountInitials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
              <p className="truncate text-xs text-text-tertiary" title={session.user.email}>{session.user.email}</p>
            </div>
          </div>
          {!isVerified ? (
            <Link
              href={verifyHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm text-warning transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
            >
              <MailCheck size={15} aria-hidden="true" />
              Verify email
            </Link>
          ) : null}
          {isOwner ? (
            <>
              <Link
                href="/admin/labs/analytics"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
              >
                <ChartNoAxesCombined size={15} aria-hidden="true" />
                Labs analytics
              </Link>
              <Link
                href="/admin/portfolio/analytics"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
              >
                <BarChart3 size={15} aria-hidden="true" />
                Portfolio analytics
              </Link>
              <Link
                href="/admin/labs/sources"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
              >
                <Code2 size={15} aria-hidden="true" />
                Source library
              </Link>
            </>
          ) : null}
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
            className="flex min-h-10 w-full items-center gap-2 px-3 text-left text-sm transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand disabled:opacity-50"
          >
            <LogOut size={15} aria-hidden="true" />
            {loading ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

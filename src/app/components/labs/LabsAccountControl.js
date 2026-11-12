"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, MailCheck } from "lucide-react";

import { getLabsAccountDisplayName } from "@/app/lib/labs/auth-user-presentation.mjs";
import { authClient } from "@/app/lib/auth/client";
import { publishAuthEvent, subscribeAuthEvents } from "@/app/lib/auth/session-events";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import LabsWorkspaceDropdown, { LabsWorkspaceAvatar, LabsWorkspaceMenuItem } from "./LabsWorkspaceDropdown";
import { LABS_WORKSPACE_DESTINATIONS } from "./LabsWorkspaceDestinations";

export default function LabsAccountControl({
  initialUser = null,
  initialSessionResolved = false,
  initialIsOwner = false,
  scrolled = false,
}) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
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
  const activeWorkspaceId = pathname?.startsWith("/admin/labs/analytics")
    ? "analytics"
    : pathname?.startsWith("/admin/portfolio/analytics")
      ? "portfolio-analytics"
      : pathname?.startsWith("/admin/labs/sources/snapshots")
        ? "snapshots"
        : pathname?.startsWith("/admin/labs/sources")
          ? "sources"
          : null;

  return (
    <div className="relative flex h-10 shrink-0 items-center">
      <button
        ref={triggerRef}
        type="button"
        aria-label={displayName + " account menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="labs-account-menu"
        onClick={() => setOpen((current) => !current)}
        title={displayName}
        className="group inline-flex min-h-10 max-w-[min(196px,calc(100vw-5.5rem))] items-center gap-2 rounded-[3px] border border-border/80 bg-surface-1 px-2 py-1.5 text-left text-text-secondary shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-brand/45 hover:bg-surface-2 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none lg:max-w-[210px] lg:gap-2.5 lg:px-2.5"
      >
        <LabsWorkspaceAvatar user={session.user} name={displayName} size={34} />
        <span className="min-w-0 flex-1">
          <span className="block max-w-[104px] truncate text-[11px] font-semibold text-text-primary sm:max-w-[132px] lg:text-xs">
            {displayName}
          </span>
          <span className="mt-0.5 hidden text-[8px] font-medium uppercase tracking-[0.12em] text-text-tertiary min-[380px]:block">
            {isOwner ? "Owner workspace" : "Labs account"}
          </span>
        </span>
        <span className="grid size-6 shrink-0 place-items-center rounded-full border border-border/70 bg-surface-2/70 text-text-tertiary transition-colors group-hover:border-brand/25 group-hover:text-brand">
          <ChevronDown
            size={13}
            aria-hidden="true"
            className={["transition-transform duration-200 motion-reduce:transition-none", open ? "rotate-180" : ""].join(" ")}
          />
        </span>
      </button>

      <LabsWorkspaceDropdown
        open={open}
        id="labs-account-menu"
        menuRef={menuRef}
        ariaLabel="Account"
        user={session.user}
        displayName={displayName}
        badgeLabel={isOwner ? "Owner" : undefined}
        sectionLabel={isOwner ? "Switch workspace" : null}
        itemCount={isOwner ? LABS_WORKSPACE_DESTINATIONS.length : undefined}
        prefersReducedMotion={prefersReducedMotion}
        footer={
          <>
            {logoutError ? (
              <p role="alert" className="px-2.5 py-2 text-xs leading-5 text-error sm:px-3">
                {logoutError}
              </p>
            ) : null}
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              disabled={loading}
              className="flex min-h-10 w-full items-center gap-2 rounded-[2px] border border-transparent px-2.5 text-left text-xs font-medium text-text-secondary transition-[color,background-color,border-color] duration-200 hover:border-border hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand disabled:opacity-50 motion-reduce:transition-none sm:px-3 sm:text-sm"
            >
              <LogOut size={15} aria-hidden="true" />
              {loading ? "Signing out…" : "Sign out"}
            </button>
          </>
        }
      >
        {!isVerified ? (
          <Link
            href={verifyHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex min-h-10 w-full items-center gap-2 rounded-[2px] border border-transparent px-2.5 text-left text-xs font-medium text-warning transition-[color,background-color,border-color] duration-200 hover:border-warning/25 hover:bg-warning/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand motion-reduce:transition-none sm:px-3 sm:text-sm"
          >
            <MailCheck size={15} aria-hidden="true" />
            <span className="min-w-0 flex-1">Verify email</span>
          </Link>
        ) : null}
        {isOwner ? (
          LABS_WORKSPACE_DESTINATIONS.map((destination) => (
            <LabsWorkspaceMenuItem
              key={destination.id}
              href={destination.href}
              label={destination.label}
              description={destination.description}
              Icon={destination.icon}
              isActive={activeWorkspaceId === destination.id}
              isAnimated={!prefersReducedMotion}
              onClick={() => setOpen(false)}
            />
          ))
        ) : null}
      </LabsWorkspaceDropdown>
    </div>
  );
}

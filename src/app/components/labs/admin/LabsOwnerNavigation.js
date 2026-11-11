"use client";

import { useEffect, useRef, useState } from "react";
import { ChartSplineIcon } from "@animateicons/react/lucide/chart-spline-icon";
import { FolderOpenIcon } from "@animateicons/react/lucide/folder-open-icon";
import { HardDriveIcon } from "@animateicons/react/lucide/hard-drive-icon";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, ChevronDown } from "lucide-react";
import useReducedMotion from "@/app/hooks/useReducedMotion";

import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import {
  getLabsAccountDisplayName,
  getLabsAccountInitials,
} from "@/app/lib/labs/auth-user-presentation.mjs";

const DESTINATIONS = [
  {
    href: "/admin/labs/analytics",
    id: "analytics",
    label: "Labs analytics",
    description: "Experiment engagement and activity",
    icon: ChartSplineIcon,
  },
  {
    href: "/admin/portfolio/analytics",
    id: "portfolio-analytics",
    label: "Portfolio analytics",
    description: "Public portfolio visits and traffic",
    icon: BarChart3,
  },
  {
    href: "/admin/labs/sources",
    id: "sources",
    label: "Source Library",
    description: "Manage source files and published versions",
    icon: FolderOpenIcon,
  },
  {
    href: "/admin/labs/sources/snapshots",
    id: "snapshots",
    label: "Snapshot storage",
    description: "Monitor and clean up Vercel Sandbox snapshots",
    icon: HardDriveIcon,
  },
];

function SafeAvatar({ user, name, size = 36 }) {
  const image = typeof user?.image === "string" && user.image.startsWith("https://")
    ? user.image
    : "";

  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-2 font-semibold text-text-secondary"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {image ? (
        <Image
          src={image}
          alt=""
          width={size}
          height={size}
          unoptimized
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[11px]">{getLabsAccountInitials(name)}</span>
      )}
    </span>
  );
}

export default function LabsOwnerNavigation({ active, user = null }) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const displayName = getLabsAccountDisplayName(user);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const activeDestination = DESTINATIONS.find((item) => item.id === active) || DESTINATIONS[0];

  return (
    <div className="mt-7 flex flex-wrap items-center justify-end gap-3 border-b border-border pb-4">
      <div className="ml-auto flex min-w-0 max-w-full items-center gap-2 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center">
          <ThemeToggle />
        </div>

        <div ref={rootRef} className="relative min-w-0 max-w-full">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="labs-owner-workspace-menu"
            aria-label={"Owner workspace menu, current section: " + activeDestination.label}
            onClick={() => setOpen((current) => !current)}
            className="group inline-flex min-h-11 max-w-[calc(100vw-4.5rem)] items-center gap-2 rounded-xl border border-border/80 bg-surface-1 px-2.5 py-2 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-brand/45 hover:bg-surface-2 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none sm:min-h-14 sm:max-w-full sm:gap-3 sm:rounded-2xl sm:px-3.5 sm:py-2.5"
          >
            <SafeAvatar user={user} name={displayName} size={34} />
            <span className="min-w-0">
              <span className="block max-w-[min(42vw,160px)] truncate text-[11px] font-semibold text-text-primary sm:max-w-[240px] sm:text-xs">
                {displayName}
              </span>
              <span className="mt-0.5 hidden text-[8px] font-medium uppercase tracking-[0.12em] text-text-tertiary min-[360px]:block sm:text-[9px] sm:tracking-[0.14em]">
                Owner workspace
              </span>
            </span>
            <span className="ml-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-border/70 bg-surface-2/70 text-text-tertiary transition-colors group-hover:border-brand/25 group-hover:text-brand sm:ml-1 sm:size-7">
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={["transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
              />
            </span>
          </button>

          {open ? (
            <div
              id="labs-owner-workspace-menu"
              role="menu"
              aria-label="Owner workspace"
              className="absolute right-0 top-full z-[80] mt-2 max-h-[min(66dvh,440px)] w-[min(320px,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain rounded-xl border border-border/80 bg-surface-elevated p-1.5 text-text-primary shadow-[0_16px_44px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:mt-3 sm:max-h-[min(70vh,520px)] sm:w-[min(360px,calc(100vw-2rem))] sm:rounded-2xl sm:p-2"
            >
              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border/60 bg-surface-2/55 px-2.5 py-2.5 sm:gap-3 sm:rounded-xl sm:px-3 sm:py-3">
                <SafeAvatar user={user} name={displayName} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-text-primary sm:text-sm">{displayName}</p>
                  {user?.email ? (
                    <p className="mt-0.5 max-w-full truncate text-[10px] text-text-tertiary sm:text-xs">{user.email}</p>
                  ) : (
                    <p className="mt-0.5 text-[10px] text-text-tertiary sm:text-xs">Private owner area</p>
                  )}
                </div>
                <span className="ml-auto shrink-0 rounded-full border border-brand/20 bg-brand-soft/45 px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-brand sm:px-2 sm:text-[8px] sm:tracking-[0.12em]">
                  Owner
                </span>
              </div>

              <div className="flex items-center justify-between px-2.5 pb-2 pt-3 sm:px-3 sm:pt-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  Switch workspace
                </p>
                <span className="text-[9px] tabular-nums text-text-muted">
                  {DESTINATIONS.length} areas
                </span>
              </div>
              <nav aria-label="Owner workspace destinations" className="space-y-0.5 sm:space-y-1">
                {DESTINATIONS.map((destination) => {
                  const isActive = active === destination.id;
                  const Icon = destination.icon;
                  return (
                    <Link
                      key={destination.id}
                      href={destination.href}
                      role="menuitem"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={[
                        "group flex min-h-12 items-center gap-2 rounded-lg px-2.5 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand sm:min-h-14 sm:gap-3 sm:rounded-xl sm:px-3 sm:py-2.5",
                        isActive
                          ? "bg-brand-soft/60 text-brand ring-1 ring-inset ring-brand/15"
                          : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "grid size-8 shrink-0 place-items-center rounded-lg border transition-colors sm:size-9 sm:rounded-xl",
                          isActive
                            ? "border-brand/20 bg-surface-1/80 text-brand"
                            : "border-border/70 bg-surface-1/70 text-text-tertiary group-hover:border-brand/20 group-hover:text-brand",
                        ].join(" ")}
                      >
                        <Icon size={16} duration={0.68} isAnimated={!prefersReducedMotion} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold sm:text-xs">{destination.label}</span>
                        <span className="mt-0.5 hidden truncate text-[10px] text-text-tertiary min-[360px]:block">{destination.description}</span>
                      </span>
                      {isActive ? (
                        <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-label="Current section" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

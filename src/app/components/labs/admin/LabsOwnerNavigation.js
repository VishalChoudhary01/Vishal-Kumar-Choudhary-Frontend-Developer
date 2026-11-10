"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, ChevronDown, Code2, Database, FlaskConical } from "lucide-react";

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
    icon: FlaskConical,
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
    icon: Code2,
  },
  {
    href: "/admin/labs/sources/snapshots",
    id: "snapshots",
    label: "Snapshot storage",
    description: "Monitor and clean up Vercel Sandbox snapshots",
    icon: Database,
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
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
      <div ref={rootRef} className="relative min-w-0">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={"Owner workspace menu, current section: " + activeDestination.label}
          onClick={() => setOpen((current) => !current)}
          className="group inline-flex min-h-12 max-w-full items-center gap-3 border border-border bg-surface-1 px-3 py-2 text-left transition-colors hover:border-brand/50 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <SafeAvatar user={user} name={displayName} />
          <span className="min-w-0">
            <span className="block max-w-[min(54vw,220px)] truncate text-xs font-semibold text-text-primary sm:max-w-[240px]">
              {displayName}
            </span>
            <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.14em] text-text-tertiary">
              Owner workspace
            </span>
          </span>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={["ml-1 shrink-0 text-text-tertiary transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
          />
        </button>

        {open ? (
          <div
            role="menu"
            aria-label="Owner workspace"
            className="absolute left-0 top-full z-[80] mt-2 w-[min(330px,calc(100vw-2.5rem))] border border-border bg-surface-elevated p-2 text-text-primary shadow-[var(--shadow-md)]"
          >
            <div className="flex min-w-0 items-center gap-3 border-b border-border px-3 py-3">
              <SafeAvatar user={user} name={displayName} size={42} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
                {user?.email ? (
                  <p className="mt-0.5 truncate text-xs text-text-tertiary">{user.email}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-text-tertiary">Private owner area</p>
                )}
              </div>
            </div>

            <p className="px-3 pb-2 pt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
              Switch workspace
            </p>
            <nav aria-label="Owner workspace destinations">
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
                      "flex min-h-12 items-center gap-3 px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand",
                      isActive ? "bg-brand-soft/60 text-brand" : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                    ].join(" ")}
                  >
                    <span className="grid size-8 shrink-0 place-items-center border border-current/15">
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold">{destination.label}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-text-tertiary">{destination.description}</span>
                    </span>
                    {isActive ? <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-label="Current section" /> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        <ThemeToggle />
      </div>
    </div>
  );
}

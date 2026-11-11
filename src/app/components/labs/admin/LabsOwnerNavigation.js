"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import useReducedMotion from "@/app/hooks/useReducedMotion";

import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import LabsWorkspaceDropdown, { LabsWorkspaceAvatar, LabsWorkspaceMenuItem } from "@/app/components/labs/LabsWorkspaceDropdown";
import { LABS_WORKSPACE_DESTINATIONS } from "@/app/components/labs/LabsWorkspaceDestinations";
import { getLabsAccountDisplayName } from "@/app/lib/labs/auth-user-presentation.mjs";

export default function LabsOwnerNavigation({ active, user = null }) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const displayName = getLabsAccountDisplayName(user);
  const menuRef = useRef(null);

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

  const activeDestination = LABS_WORKSPACE_DESTINATIONS.find((item) => item.id === active) || LABS_WORKSPACE_DESTINATIONS[0];

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
            className="group inline-flex min-h-11 max-w-[calc(100vw-4.5rem)] items-center gap-2 rounded-[3px] border border-border/80 bg-surface-1 px-2.5 py-2 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-brand/45 hover:bg-surface-2 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transform-none motion-reduce:transition-none sm:min-h-14 sm:max-w-full sm:gap-3 sm:rounded-[4px] sm:px-3.5 sm:py-2.5"
          >
            <LabsWorkspaceAvatar user={user} name={displayName} size={34} />
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
                className={["transition-transform duration-200 motion-reduce:transition-none", open ? "rotate-180" : ""].join(" ")}
              />
            </span>
          </button>

          <LabsWorkspaceDropdown
            open={open}
            id="labs-owner-workspace-menu"
            menuRef={menuRef}
            ariaLabel="Owner workspace"
            user={user}
            displayName={displayName}
            badgeLabel="Owner"
            sectionLabel="Switch workspace"
            itemCount={LABS_WORKSPACE_DESTINATIONS.length}
            prefersReducedMotion={prefersReducedMotion}
          >
            {LABS_WORKSPACE_DESTINATIONS.map((destination) => (
              <LabsWorkspaceMenuItem
                key={destination.id}
                href={destination.href}
                label={destination.label}
                description={destination.description}
                Icon={destination.icon}
                isActive={active === destination.id}
                isAnimated={!prefersReducedMotion}
                onClick={() => setOpen(false)}
              />
            ))}
          </LabsWorkspaceDropdown>
        </div>
      </div>
    </div>
  );
}

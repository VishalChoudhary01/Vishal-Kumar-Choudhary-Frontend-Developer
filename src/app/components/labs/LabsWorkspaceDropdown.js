"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

import { getLabsAccountInitials } from "@/app/lib/labs/auth-user-presentation.mjs";

export function LabsWorkspaceAvatar({ user, name, size = 36 }) {
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

export function LabsWorkspaceMenuItem({
  href,
  label,
  description,
  Icon,
  isActive = false,
  isAnimated = true,
  onClick,
  tone = "default",
}) {
  const iconRef = useRef(null);

  useEffect(() => {
    if (!isAnimated || !isActive) {
      iconRef.current?.stopAnimation?.();
      return undefined;
    }

    // Keep the selected workspace icon visibly alive after the initial
    // entrance animation. The replay interval is longer than each icon's
    // animation duration, so motion remains calm rather than jittery.
    iconRef.current?.startAnimation?.();
    const replayId = window.setInterval(() => {
      iconRef.current?.startAnimation?.();
    }, 1400);

    return () => {
      window.clearInterval(replayId);
      iconRef.current?.stopAnimation?.();
    };
  }, [isActive, isAnimated]);

  const itemTone = tone === "warning"
    ? "text-warning hover:border-warning/25 hover:bg-warning/5 hover:text-warning"
    : isActive
      ? "border-brand/30 bg-brand-soft/35 text-brand shadow-sm ring-1 ring-inset ring-brand/10"
      : "border-transparent text-text-secondary hover:border-border hover:bg-surface-2 hover:text-text-primary";

  const iconTone = tone === "warning"
    ? "border-warning/20 bg-warning/5 text-warning group-hover:border-warning/30"
    : isActive
      ? "border-brand/20 bg-surface-1/80 text-brand"
      : "border-border/70 bg-surface-1/70 text-text-tertiary group-hover:border-brand/20 group-hover:text-brand";

  return (
    <Link
      href={href}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      onMouseEnter={() => iconRef.current?.startAnimation?.()}
      onMouseLeave={() => {
        if (!isActive) iconRef.current?.stopAnimation?.();
      }}
      onFocus={() => iconRef.current?.startAnimation?.()}
      onBlur={() => {
        if (!isActive) iconRef.current?.stopAnimation?.();
      }}
      className={[
        "group flex min-h-11 w-full min-w-0 items-center gap-2 rounded-[2px] border px-2 py-2 text-left transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand motion-reduce:transition-none sm:min-h-12 sm:gap-3 sm:px-2.5",
        itemTone,
      ].join(" ")}
    >
      <span
        className={[
          "grid size-8 shrink-0 place-items-center rounded-[2px] border transition-colors duration-200 sm:size-9 motion-reduce:transition-none",
          iconTone,
        ].join(" ")}
      >
        <Icon
          ref={iconRef}
          size={16}
          duration={0.68}
          isAnimated={isAnimated}
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold sm:text-xs">{label}</span>
        {description ? (
          <span className="mt-0.5 hidden truncate text-[10px] text-text-tertiary min-[360px]:block">
            {description}
          </span>
        ) : null}
      </span>
      {isActive ? (
        <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
      ) : null}
    </Link>
  );
}

export default function LabsWorkspaceDropdown({
  open,
  id,
  menuRef,
  ariaLabel = "Workspace",
  user,
  displayName,
  badgeLabel,
  sectionLabel = "Switch workspace",
  itemCount,
  prefersReducedMotion = false,
  mobileTop = 68,
  children,
  footer,
}) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          ref={menuRef}
          id={id}
          role="menu"
          aria-label={ariaLabel}
          initial={prefersReducedMotion
            ? false
            : {
                height: 0,
                opacity: 0,
                y: -9,
                scaleX: 0.985,
                scaleY: 0.94,
                rotateX: -7,
              }}
          animate={{
            height: "auto",
            opacity: 1,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            rotateX: 0,
          }}
          exit={prefersReducedMotion
            ? { height: 0, opacity: 0 }
            : {
                height: 0,
                opacity: 0,
                y: -6,
                scaleX: 0.985,
                scaleY: 0.96,
                rotateX: -4,
                transition: {
                  height: { type: "spring", stiffness: 460, damping: 38, mass: 0.72 },
                  opacity: { duration: 0.14, ease: "easeOut" },
                  default: { type: "spring", stiffness: 430, damping: 34, mass: 0.72 },
                },
              }}
          transition={prefersReducedMotion
            ? { duration: 0.01 }
            : {
                height: { type: "spring", stiffness: 420, damping: 34, mass: 0.78 },
                opacity: { duration: 0.2, ease: "easeOut" },
                default: { type: "spring", stiffness: 420, damping: 32, mass: 0.72 },
              }}
          style={{
            transformOrigin: "top right",
            transformPerspective: 900,
            "--mobile-menu-top": `${mobileTop}px`,
          }}
          className="absolute right-0 top-full z-[80] mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden drop-shadow-[0_16px_30px_rgba(0,0,0,0.2)] sm:mt-3 max-lg:fixed max-lg:left-auto max-lg:right-4 max-lg:top-[var(--mobile-menu-top)] max-lg:mt-0 max-lg:w-[min(300px,calc(100vw-2rem))]"
        >
          <div className="max-h-[min(70dvh,520px)] overflow-y-auto overscroll-contain rounded-[4px] border border-border/80 bg-surface-elevated p-1.5 text-text-primary backdrop-blur-2xl sm:max-h-[min(72vh,560px)] sm:p-2">
            <div className="flex min-w-0 items-center gap-2 rounded-[3px] border border-border/60 bg-surface-2/55 px-2.5 py-2.5 sm:gap-3 sm:px-3 sm:py-3">
              <LabsWorkspaceAvatar user={user} name={displayName} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-text-primary sm:text-sm">{displayName}</p>
                {user?.email ? (
                  <p className="mt-0.5 max-w-full truncate text-[10px] text-text-tertiary sm:text-xs" title={user.email}>
                    {user.email}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[10px] text-text-tertiary sm:text-xs">Private owner area</p>
                )}
              </div>
              {badgeLabel ? (
                <span className="ml-auto shrink-0 rounded-[2px] border border-brand/20 bg-brand-soft/45 px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-brand sm:px-2 sm:text-[8px] sm:tracking-[0.12em]">
                  {badgeLabel}
                </span>
              ) : null}
            </div>

            {sectionLabel ? (
              <div className="flex items-center justify-between px-2.5 pb-1.5 pt-3 sm:px-3 sm:pb-2 sm:pt-3.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                  {sectionLabel}
                </p>
                {typeof itemCount === "number" ? (
                  <span className="text-[9px] tabular-nums text-text-muted">{itemCount} areas</span>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-0.5 sm:space-y-1">{children}</div>

            {footer ? (
              <div className="mt-1 border-t border-border pt-1">{footer}</div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

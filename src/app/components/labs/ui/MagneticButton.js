"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

import {
  calculateMagneticOffset,
  DEFAULT_MAGNETIC_RADIUS,
  DEFAULT_MAGNETIC_STRENGTH,
  MAGNETIC_SPRING,
  normalizeMagneticRadius,
  normalizeMagneticStrength,
} from "./magnetic-physics.mjs";

/**
 * A reusable magnetic button.
 *
 * `strength` and `radius` are deliberately ordinary numeric props. A future
 * source-managed settings manifest can map stable setting IDs directly to
 * these props without changing the component API. Decorative field visibility
 * belongs to the experiment composition, not to this button primitive.
 *
 * Pass `fieldRef` to measure pointer distance from a larger experiment
 * canvas. Without it, the component uses its own button wrapper as the field.
 */
export default function MagneticButton({
  children = "Magnetic button",
  fieldRef = null,
  strength = DEFAULT_MAGNETIC_STRENGTH,
  radius = DEFAULT_MAGNETIC_RADIUS,
  onClick,
  onEngagementChange,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
}) {
  const localFieldRef = useRef(null);
  const isEngagedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, MAGNETIC_SPRING);
  const y = useSpring(rawY, MAGNETIC_SPRING);

  const safeStrength = normalizeMagneticStrength(strength);
  const safeRadius = normalizeMagneticRadius(radius);
  const targetRef = fieldRef || localFieldRef;

  useEffect(() => {
    const target = targetRef?.current;
    if (!target) return undefined;

    const updateEngagedState = (nextValue) => {
      if (isEngagedRef.current === nextValue) return;

      isEngagedRef.current = nextValue;
      onEngagementChange?.(nextValue);
    };

    const resetMagnet = () => {
      rawX.set(0);
      rawY.set(0);
      updateEngagedState(false);
    };

    const handlePointerMove = (event) => {
      if (
        disabled ||
        prefersReducedMotion ||
        event.pointerType === "touch" ||
        safeStrength <= 0
      ) {
        resetMagnet();
        return;
      }

      const bounds = target.getBoundingClientRect();
      if (!bounds) return;

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const displacement = calculateMagneticOffset({
        offsetX: event.clientX - centerX,
        offsetY: event.clientY - centerY,
        strength: safeStrength,
        radius: safeRadius,
      });

      rawX.set(displacement.x);
      rawY.set(displacement.y);
      updateEngagedState(displacement.engaged);
    };

    target.addEventListener("pointermove", handlePointerMove);
    target.addEventListener("pointerleave", resetMagnet);

    if (prefersReducedMotion || disabled || safeStrength <= 0) {
      resetMagnet();
    }

    return () => {
      target.removeEventListener("pointermove", handlePointerMove);
      target.removeEventListener("pointerleave", resetMagnet);
      rawX.set(0);
      rawY.set(0);
    };
  }, [
    disabled,
    onEngagementChange,
    prefersReducedMotion,
    rawX,
    rawY,
    safeRadius,
    safeStrength,
    targetRef,
  ]);

  return (
      <motion.button
        ref={!fieldRef ? localFieldRef : undefined}
        type="button"
        style={{ x, y }}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={[
          "group relative z-10 inline-flex min-h-14 items-center gap-3 rounded-[var(--radius-md)] border border-brand/30 bg-brand px-6 py-4 text-sm font-semibold text-brand-contrast shadow-[0_12px_36px_-18px_var(--brand)] transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background active:bg-brand-pressed motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 sm:px-8",
          className,
        ].filter(Boolean).join(" ")}
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-brand-contrast/25 bg-brand-contrast/10"
        >
          <span className="h-2 w-2 rounded-full bg-brand-contrast" />
        </span>
        <span>{children}</span>
        <span aria-hidden="true" className="text-base opacity-75">
          ↗
        </span>
      </motion.button>
  );
}

export {
  DEFAULT_MAGNETIC_RADIUS,
  DEFAULT_MAGNETIC_STRENGTH,
  MAX_MAGNETIC_RADIUS,
  MAX_MAGNETIC_STRENGTH,
  MIN_MAGNETIC_RADIUS,
} from "./magnetic-physics.mjs";

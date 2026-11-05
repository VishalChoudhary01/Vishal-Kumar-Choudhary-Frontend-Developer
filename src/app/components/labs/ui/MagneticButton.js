"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

const MAGNETIC_SPRING = Object.freeze({
  stiffness: 280,
  damping: 24,
  mass: 0.55,
});

const DEFAULT_STRENGTH = 28;
const DEFAULT_RADIUS = 180;
const MAX_STRENGTH = 42;
const MIN_RADIUS = 80;
const MAX_RADIUS = 300;
const POINTER_MULTIPLIER = 0.24;
const PROXIMITY_EXPONENT = 1.25;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeStrength(value) {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_STRENGTH;
  }

  const numeric = Number(value);
  return clamp(Number.isFinite(numeric) ? numeric : DEFAULT_STRENGTH, 0, MAX_STRENGTH);
}

function normalizeRadius(value) {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_RADIUS;
  }

  const numeric = Number(value);
  return clamp(
    Number.isFinite(numeric) && numeric !== 0 ? numeric : DEFAULT_RADIUS,
    MIN_RADIUS,
    MAX_RADIUS,
  );
}

/**
 * A reusable magnetic button.
 *
 * `strength`, `radius`, and `showField`-adjacent composition state are
 * deliberately ordinary props. A future source-managed settings manifest can
 * map stable setting IDs directly to these props without changing this API.
 *
 * Pass `fieldRef` to measure pointer distance from a larger experiment
 * canvas. Without it, the component uses its own button wrapper as the field.
 */
export default function MagneticButton({
  children = "Magnetic button",
  fieldRef = null,
  strength = DEFAULT_STRENGTH,
  radius = DEFAULT_RADIUS,
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

  const safeStrength = normalizeStrength(strength);
  const safeRadius = normalizeRadius(radius);
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
      const offsetX = event.clientX - centerX;
      const offsetY = event.clientY - centerY;
      const distance = Math.hypot(offsetX, offsetY);

      if (distance >= safeRadius) {
        resetMagnet();
        return;
      }

      const proximity = 1 - distance / safeRadius;
      const influence = Math.pow(proximity, PROXIMITY_EXPONENT);

      rawX.set(
        clamp(offsetX * POINTER_MULTIPLIER * influence, -safeStrength, safeStrength),
      );
      rawY.set(
        clamp(offsetY * POINTER_MULTIPLIER * influence, -safeStrength, safeStrength),
      );
      updateEngagedState(true);
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
    <div ref={localFieldRef} className="inline-flex">
      <motion.button
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
    </div>
  );
}

export {
  DEFAULT_RADIUS,
  DEFAULT_STRENGTH,
  MAX_RADIUS,
  MAX_STRENGTH,
  MIN_RADIUS,
};

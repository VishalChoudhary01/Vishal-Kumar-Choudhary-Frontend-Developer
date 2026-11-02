"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const SPRING = {
  stiffness: 280,
  damping: 24,
  mass: 0.55,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function MagneticInteraction({ settings = {} }) {
  const fieldRef = useRef(null);
  const isEngagedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  const [isEngaged, setIsEngaged] = useState(false);
  const [activationCount, setActivationCount] = useState(0);

  const strength = clamp(Number(settings.strength) || 0, 0, 42);
  const radius = clamp(Number(settings.radius) || 180, 80, 300);
  const showField = settings.showField !== false;

  const updateEngagedState = (nextValue) => {
    if (isEngagedRef.current === nextValue) return;

    isEngagedRef.current = nextValue;
    setIsEngaged(nextValue);
  };

  const resetMagnet = () => {
    rawX.set(0);
    rawY.set(0);
    updateEngagedState(false);
  };

  const handlePointerMove = (event) => {
    if (
      prefersReducedMotion ||
      event.pointerType === "touch" ||
      strength <= 0
    ) {
      resetMagnet();
      return;
    }

    const bounds = fieldRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const offsetX = event.clientX - centerX;
    const offsetY = event.clientY - centerY;
    const distance = Math.hypot(offsetX, offsetY);

    if (distance >= radius) {
      resetMagnet();
      return;
    }

    const proximity = 1 - distance / radius;
    const influence = Math.pow(proximity, 1.25);

    rawX.set(clamp(offsetX * 0.24 * influence, -strength, strength));
    rawY.set(clamp(offsetY * 0.24 * influence, -strength, strength));
    updateEngagedState(true);
  };

  return (
    <div
      ref={fieldRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetMagnet}
      className="relative flex h-full w-full select-none items-center justify-center overflow-hidden bg-background"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--brand-soft),transparent_68%)] opacity-70"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(var(--border-strong) 0.75px, transparent 0.75px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted sm:left-7 sm:top-7">
        <span
          className={[
            "h-1.5 w-1.5 rounded-full transition-colors duration-200 motion-reduce:transition-none",
            isEngaged ? "bg-success" : "bg-brand",
          ].join(" ")}
        />
        {isEngaged ? "Field engaged" : "Interactive field"}
      </div>

      {showField ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border border-dashed border-brand/30 transition-[width,height,opacity] duration-300 motion-reduce:transition-none"
          style={{
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            opacity: isEngaged ? 0.9 : 0.55,
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : null}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/10 sm:h-40 sm:w-40" />

      <motion.button
        type="button"
        style={{ x, y }}
        onClick={() => setActivationCount((count) => count + 1)}
        className="group relative z-10 inline-flex min-h-14 items-center gap-3 rounded-[var(--radius-md)] border border-brand/30 bg-brand px-6 py-4 text-sm font-semibold text-brand-contrast shadow-[0_12px_36px_-18px_var(--brand)] transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background active:bg-brand-pressed motion-reduce:transition-none sm:px-8"
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-brand-contrast/25 bg-brand-contrast/10"
        >
          <span className="h-2 w-2 rounded-full bg-brand-contrast" />
        </span>
        <span>Magnetic button</span>
        <span aria-hidden="true" className="text-base opacity-75">
          ↗
        </span>
      </motion.button>

      <div className="pointer-events-none absolute bottom-5 left-1/2 flex w-full -translate-x-1/2 flex-col items-center gap-1 px-4 text-center sm:bottom-7">
        <p className="text-xs font-medium text-text-secondary">
          {prefersReducedMotion
            ? "Reduced motion is enabled"
            : isEngaged
              ? "The button is following your pointer"
              : "Move your pointer around the center"}
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
          {activationCount === 0
            ? "Click the button to test its response"
            : `Activated ${activationCount} ${activationCount === 1 ? "time" : "times"}`}
        </p>
      </div>
    </div>
  );
}

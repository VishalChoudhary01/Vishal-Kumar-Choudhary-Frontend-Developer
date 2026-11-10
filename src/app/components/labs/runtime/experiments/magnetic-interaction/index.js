"use client";

import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import MagneticButton from "../../../ui/MagneticButton";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function MagneticInteraction({ settings = {} }) {
  const fieldRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const [isEngaged, setIsEngaged] = useState(false);
  const [activationCount, setActivationCount] = useState(0);

  const strength = clamp(Number(settings.strength) || 0, 0, 42);
  const radius = clamp(Number(settings.radius) || 180, 80, 300);
  const showField = settings.showField !== false;

  const handleEngagementChange = useCallback((nextValue) => {
    setIsEngaged(nextValue);
  }, []);

  const handleActivate = useCallback(() => {
    setActivationCount((count) => count + 1);
  }, []);

  return (
    <div
      ref={fieldRef}
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

      <MagneticButton
        fieldRef={fieldRef}
        strength={strength}
        radius={radius}
        onClick={handleActivate}
        onEngagementChange={handleEngagementChange}
      />

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

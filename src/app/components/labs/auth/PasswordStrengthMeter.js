"use client";

import { AnimatePresence, motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { assessPasswordStrength } from "@/app/lib/auth/password-strength.mjs";

const TONE_CLASSES = {
  weak: "bg-error",
  fair: "bg-warning",
  good: "bg-brand",
  strong: "bg-success",
};

function getTone(score) {
  if (score <= 1) return "weak";
  if (score <= 3) return "fair";
  if (score === 4) return "good";
  return "strong";
}

export default function PasswordStrengthMeter({
  password = "",
  visible = false,
}) {
  const reducedMotion = useReducedMotion();
  const { score, maximum, label, checks } = assessPasswordStrength(password);
  const toneClass = TONE_CLASSES[getTone(score)];
  const displayLabel = password ? label : "At least 8 characters";
  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="password-strength"
          initial={reducedMotion ? false : { opacity: 0, y: -5, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.99 }}
          transition={transition}
          className="pointer-events-none absolute inset-x-0 top-full z-30 mt-1.5"
        >
          <div className="rounded-sm border border-border bg-surface-elevated/95 px-2.5 py-2 shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-medium tracking-wide text-text-secondary">
                Password strength
              </span>
              <motion.span
                key={displayLabel}
                initial={reducedMotion ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="text-[10px] font-semibold text-text-primary"
                aria-live="polite"
              >
                {displayLabel}
              </motion.span>
            </div>

            <div
              id="password-strength-meter"
              role="meter"
              aria-label={"Password strength: " + displayLabel}
              aria-valuemin={0}
              aria-valuemax={maximum}
              aria-valuenow={score}
              className="mt-1.5 grid grid-cols-5 gap-1"
            >
              {checks.map((check, index) => (
                <span
                  key={check.id}
                  className="h-1 overflow-hidden rounded-full bg-surface-3"
                >
                  <motion.span
                    className={"block h-full origin-left rounded-full " + toneClass}
                    initial={false}
                    animate={{
                      scaleX: index < score ? 1 : 0,
                      opacity: index < score ? 1 : 0.18,
                    }}
                    transition={{
                      ...transition,
                      delay: reducedMotion ? 0 : index * 0.025,
                    }}
                  />
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Circle } from "lucide-react";

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

export default function PasswordStrengthMeter({ password = "" }) {
  const reducedMotion = useReducedMotion();
  const { score, maximum, label, checks } = assessPasswordStrength(password);
  const tone = getTone(score);
  const toneClass = TONE_CLASSES[tone];
  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence initial={false}>
      {password ? (
        <motion.section
          key="password-strength"
          initial={reducedMotion ? false : { opacity: 0, height: 0, y: -6 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={transition}
          className="overflow-hidden"
          aria-label="Password strength"
        >
          <div className="space-y-2 border border-border-subtle bg-surface-1/70 px-2.5 py-2.5 sm:space-y-3 sm:px-3.5 sm:py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium tracking-wide text-text-secondary">
                Password strength
              </span>
              <motion.span
                key={label}
                initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="text-[11px] font-semibold text-text-primary"
                aria-live="polite"
              >
                {label}
              </motion.span>
            </div>

            <div
              role="meter"
              aria-label={"Password strength: " + label}
              aria-valuemin={0}
              aria-valuemax={maximum}
              aria-valuenow={score}
              className="grid grid-cols-5 gap-1.5"
            >
              {checks.map((check, index) => (
                <div
                  key={check.id}
                  className="h-1.5 overflow-hidden rounded-full bg-surface-3"
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
                      delay: reducedMotion ? 0 : index * 0.035,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-2">
              {checks.map((check) => (
                <motion.div
                  key={check.id}
                  layout
                  className="flex min-w-0 items-center gap-1.5"
                  transition={transition}
                >
                  {check.passed ? (
                    <Check size={12} className="shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <Circle size={10} className="shrink-0 text-text-tertiary" aria-hidden="true" />
                  )}
                  <span className={
                    "truncate text-[10px] " +
                    (check.passed ? "text-text-secondary" : "text-text-tertiary")
                  }>
                    {check.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

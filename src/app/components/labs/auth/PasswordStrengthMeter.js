"use client";

import { AnimatePresence, motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { assessPasswordStrength } from "@/app/lib/auth/password-strength.mjs";

const TONE_CLASSES = {
  weak: "bg-error",
  fair: "bg-warning",
  good: "bg-brand",
  strong: "bg-success",
  neutral: "bg-text-tertiary",
};

const TONE_TEXT_CLASSES = {
  weak: "text-error",
  fair: "text-warning",
  good: "text-brand",
  strong: "text-success",
  neutral: "text-text-tertiary",
};

export default function PasswordStrengthMeter({
  password = "",
  visible = false,
}) {
  const reducedMotion = useReducedMotion();
  const { score, maximum, label, checks } = assessPasswordStrength(password);
  const tone = !password
    ? "neutral"
    : score <= 1
      ? "weak"
      : score <= 3
        ? "fair"
        : score === 4
          ? "good"
          : "strong";
  const toneClass = TONE_CLASSES[tone];
  const toneTextClass = TONE_TEXT_CLASSES[tone];
  const displayLabel = password ? label : "8+ chars";
  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.18, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="password-strength"
          initial={reducedMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 2 }}
          transition={transition}
          className="inline-flex items-center gap-1.5"
        >
          <span className={"text-[10px] font-semibold leading-none " + toneTextClass}>
            {displayLabel}
          </span>
          <div
            id="password-strength-meter"
            role="meter"
            aria-label={"Password strength: " + displayLabel}
            aria-valuemin={0}
            aria-valuemax={maximum}
            aria-valuenow={score}
            className="flex items-center gap-0.5"
          >
            {checks.map((check, index) => (
              <span
                key={check.id}
                className="h-1 w-2 overflow-hidden rounded-full bg-surface-3"
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
                    delay: reducedMotion ? 0 : index * 0.02,
                  }}
                />
              </span>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

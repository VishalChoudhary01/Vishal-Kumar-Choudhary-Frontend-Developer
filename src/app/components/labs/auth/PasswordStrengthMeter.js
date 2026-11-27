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
  const {
    score,
    maximum,
    label,
    tone,
    checks,
    guidance,
    nextRequirementIsRequired,
  } = assessPasswordStrength(password);
  const toneClass = TONE_CLASSES[tone];
  const toneTextClass = TONE_TEXT_CLASSES[tone];
  const transition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="password-strength"
          initial={reducedMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 2 }}
          transition={transition}
          className="inline-flex min-w-0 items-center gap-1.5"
        >
          <AnimatePresence mode="wait" initial={false}>
            {password ? <motion.span
              key={guidance}
              initial={reducedMotion ? false : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
              transition={transition}
              aria-live="polite"
              aria-atomic="true"
              className={
                "max-w-[170px] truncate text-[10px] font-semibold leading-none " +
                toneTextClass
              }
              title={guidance}
            >
              {guidance}
            </motion.span> : null}
          </AnimatePresence>
          <div
            id="password-strength-meter"
            role="meter"
            aria-label="Password strength"
            aria-valuetext={guidance ? label + ". " + guidance : label}
            aria-valuemin={0}
            aria-valuemax={maximum}
            aria-valuenow={score}
            data-next-requirement-required={nextRequirementIsRequired}
            className="flex shrink-0 items-center gap-0.5"
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
                    scaleX: check.passed ? 1 : 0,
                    opacity: check.passed ? 1 : 0.18,
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

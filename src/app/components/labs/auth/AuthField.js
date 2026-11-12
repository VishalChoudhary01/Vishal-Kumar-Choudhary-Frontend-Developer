"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EyeClosedIcon } from "@animateicons/react/lucide/eye-closed-icon";
import { EyeIcon } from "@animateicons/react/lucide/eye-icon";
import useReducedMotion from "@/app/hooks/useReducedMotion";

export default function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  error,
  helper,
  disabled = false,
  inputMode,
}) {
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const inputType = isPassword && visible ? "text" : type;
  const errorId = error ? id + "-error" : undefined;
  const helperId = helper && !error ? id + "-helper" : undefined;

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-0.5 block text-xs font-medium text-text-primary sm:mb-1 sm:text-sm"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId || helperId}
          className={[
            "h-9 w-full rounded-sm border bg-transparent px-2.5 text-[13px] text-text-primary outline-none transition-colors sm:h-10 sm:px-3 sm:text-sm",
            "placeholder:text-text-tertiary hover:border-border-strong",
            "focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
            error ? "border-error" : "border-border",
            disabled ? "cursor-not-allowed opacity-60" : "",
            isPassword ? "pr-10" : "",
          ].join(" ")}
        />

        {isPassword ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-1 flex w-9 items-center justify-center rounded-sm text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={visible ? "password-visible" : "password-hidden"}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.72, rotate: visible ? -18 : 18 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.72, rotate: visible ? 18 : -18 }}
                transition={reducedMotion ? { duration: 0.01 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center justify-center"
              >
                {visible ? (
                  <EyeClosedIcon size={16} duration={0.62} isAnimated={!reducedMotion} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} duration={0.62} isAnimated={!reducedMotion} aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="mt-0.5 text-[11px] leading-4 text-error sm:mt-1 sm:text-xs sm:leading-5">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="mt-0.5 text-[11px] leading-4 text-text-tertiary sm:mt-1 sm:text-xs sm:leading-5">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

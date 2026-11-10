"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
  const inputType = isPassword && visible ? "text" : type;
  const errorId = error ? id + "-error" : undefined;
  const helperId = helper && !error ? id + "-helper" : undefined;

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-text-primary"
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
            "h-10 w-full rounded-sm border bg-transparent px-3 text-sm text-text-primary outline-none transition-colors",
            "placeholder:text-text-tertiary hover:border-border-strong",
            "focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/30",
            error ? "border-error" : "border-border",
            disabled ? "cursor-not-allowed opacity-60" : "",
            isPassword ? "pr-11" : "",
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
            {visible ? (
              <EyeOff aria-hidden="true" size={16} />
            ) : (
              <Eye aria-hidden="true" size={16} />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs leading-5 text-error">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="mt-1.5 text-xs leading-5 text-text-tertiary">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

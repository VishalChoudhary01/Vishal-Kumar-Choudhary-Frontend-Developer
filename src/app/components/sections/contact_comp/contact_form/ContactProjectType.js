"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { CONTACT_MOTION } from "../contact.motion";
import { cn } from "@/app/lib/utils";

const OPTIONS = [
    {
        value: "landing-page",
        label: "Landing Page",
    },
    {
        value: "web-app",
        label: "Web App",
    },
    {
        value: "product",
        label: "Product",
    },
    {
        value: "experiment",
        label: "Experiment",
    },
    {
        value: "other",
        label: "Other",
    },
];

const LABEL_CLASSES = "font-mono text-[0.72rem] font-medium tracking-[0.02em] text-text-secondary";

const EASE = [0.22, 1, 0.36, 1];

function OptionIndicator({ selected, reduced }) {
    if (selected) {
        const icon = <Check size={14} strokeWidth={2.2} aria-hidden="true" />;

        if (reduced) {
            return (
                <span className="flex size-5 items-center justify-center rounded-full bg-brand text-brand-contrast">
                    {icon}
                </span>
            );
        }

        return (
            <motion.span
                className="flex size-5 items-center justify-center rounded-full bg-brand text-brand-contrast"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22, ease: EASE }}
                aria-hidden="true"
            >
                {icon}
            </motion.span>
        );
    }

    return (
        <span
            className="size-5 shrink-0 rounded-full border border-border-strong transition-colors duration-200 group-hover:border-brand group-focus-visible:border-brand"
            aria-hidden="true"
        />
    );
}

function OptionUnderline({ selected }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "absolute bottom-[-3px] left-0 h-px origin-left bg-brand transition-transform duration-300",
                selected ? "w-full scale-x-100" : "w-full scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
            )}
        />
    );
}

export default function ContactProjectType({
    value = "",
    onChange,
    disabled = false,
    required = false,
    name = "projectType",
    id = "projectType",
    label = "What are you building?",
    error = "",
    className = "",
}) {
    const reduced = useReducedMotion();
    const listRef = useRef(null);

    const hintId = `${id}-hint`;
    const errorId = error ? `contact-field-error-${name}` : undefined;

    const handleKeyDown = (event) => {
        const buttons = Array.from(
            listRef.current?.querySelectorAll('[role="radio"]') || [],
        );

        const currentIndex = buttons.indexOf(event.currentTarget);

        if (currentIndex === -1 || buttons.length === 0) {
            return;
        }

        let nextIndex = currentIndex;

        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            event.preventDefault();
            nextIndex = (currentIndex + 1) % buttons.length;
        }

        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            event.preventDefault();
            nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        }

        if (event.key === "Home") {
            event.preventDefault();
            nextIndex = 0;
        }

        if (event.key === "End") {
            event.preventDefault();
            nextIndex = buttons.length - 1;
        }

        if (nextIndex !== currentIndex) {
            buttons[nextIndex]?.focus();
        }
    };

    const handleOptionClick = (option) => {
        if (disabled) {
            return;
        }

        onChange?.(option.value);
    };

    return (
        <fieldset
            id={id}
            disabled={disabled}
            className={cn("mt-1 w-full", className)}

            aria-describedby={errorId || hintId}
        >
            <legend className={LABEL_CLASSES}>
                {label}
                {required && (
                    <span className="ml-1 text-[0.85em] font-normal text-brand" aria-hidden="true">
                        *
                    </span>
                )}
            </legend>

            <p id={hintId} className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.04em] text-text-tertiary">
                Choose one
            </p>

            <div
                ref={listRef}
                role="radiogroup"
                aria-label={label}
                className="mt-4 grid grid-cols-1 gap-y-1 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3"
            >
                {OPTIONS.map((option) => {
                    const selected = value === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            tabIndex={selected || (!value && option === OPTIONS[0]) ? 0 : -1}
                            onClick={() => handleOptionClick(option)}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            className={cn(
                                "group relative flex min-h-12 w-full items-center gap-3 px-0 text-left",
                                "font-body text-[15px] leading-none",
                                "transition-colors duration-200",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                disabled ? "pointer-events-none opacity-40" : "cursor-pointer",
                            )}
                        >
                            <OptionIndicator
                                selected={selected}
                                reduced={reduced}
                            />

                            <span
                                className={cn(
                                    "relative inline-block pb-[3px] transition-colors duration-200",
                                    disabled
                                        ? "text-text-muted"
                                        : selected
                                            ? "font-medium text-brand"
                                            : "font-medium text-text-secondary group-hover:text-text-primary",
                                )}
                            >
                                {option.label}
                                <OptionUnderline selected={selected} />
                            </span>
                        </button>
                    );
                })}
            </div>

            {error && (
                <motion.p
                    id={errorId}
                    role="alert"
                    className="mt-3 max-w-[44ch] font-body text-xs text-error"
                    initial={reduced ? false : { opacity: 0, y: CONTACT_MOTION.error.y }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: CONTACT_MOTION.error.duration, ease: CONTACT_MOTION.error.ease }}
                >
                    {error}
                </motion.p>
            )}
        </fieldset>
    );
}
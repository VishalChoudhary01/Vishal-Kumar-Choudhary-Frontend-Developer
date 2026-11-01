"use client";

import { useState } from "react";
import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";
import { CONTACT_MOTION } from "../contact.motion";

const LABEL_CLASSES = "font-mono text-[0.72rem] font-medium tracking-[0.02em] text-text-secondary";
const RULE_REST = "bg-border-strong";
const RULE_STRONG = "bg-text-secondary";

function FieldLabel({ label, required, htmlFor, disabled }) {
    if (!label) {
        return null;
    }

    return (
        <label
            htmlFor={htmlFor}
            className={cn("block", LABEL_CLASSES, disabled && "opacity-60")}
        >
            {label}

            {required && (
                <span
                    className="ml-1 text-[0.85em] font-normal text-brand"
                    aria-hidden="true"
                >
                    *
                </span>
            )}
        </label>
    );
}

function getErrorId(name) {
    return `contact-field-error-${name}`;
}

function getHelperId(name) {
    return `contact-field-helper-${name}`;
}

function ErrorText({ error, name, reduced }) {
    if (!error) {
        return null;
    }

    return (
        <motion.p
            id={getErrorId(name)}
            role="alert"
            className="mt-2 font-body text-xs leading-relaxed text-error"
            initial={reduced ? false : { opacity: 0, y: CONTACT_MOTION.error.y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: CONTACT_MOTION.error.duration, ease: CONTACT_MOTION.error.ease }}
        >
            {error}
        </motion.p>
    );
}

function HelperText({ helper, name }) {
    if (!helper) {
        return null;
    }

    return (
        <p
            id={getHelperId(name)}
            className="mt-1.5 font-body text-xs leading-relaxed text-text-tertiary"
        >
            {helper}
        </p>
    );
}

function FieldRule({ isHovered, isFocused, isFilled, error, reduced }) {
    const showAccent = isFocused;
    const accentColor = error ? "bg-error" : "bg-brand";

    const baseColor = error && !isFocused
        ? "bg-error"
        : isFocused
            ? "bg-brand"
            : isHovered || isFilled
                ? RULE_STRONG
                : RULE_REST;

    return (
        <div
            className="relative h-[2px] w-full"
            aria-hidden="true"
        >
            <div
                className={cn(
                    "absolute inset-x-0 bottom-0 h-px transition-colors duration-200",
                    baseColor,
                )}
            />

            {showAccent && (
                reduced ? (
                    <div
                        className={cn(
                            "absolute inset-0",
                            accentColor,
                        )}
                    />
                ) : (
                    <motion.div
                        className={cn(
                            "absolute inset-0 origin-left",
                            accentColor,
                        )}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                            duration: CONTACT_MOTION.focus.duration,
                            ease: CONTACT_MOTION.focus.ease,
                        }}
                    />
                )
            )}
        </div>
    );
}

const ContactField = function ContactField(
    {
        id,
        name,
        label,
        type = "text",
        value = "",
        placeholder,
        onChange,
        onBlur,
        error = "",
        required = false,
        disabled = false,
        autoComplete,
        maxLength,
        description,
        as: Tag = "input",
        rows,
        minHeight,
    },
) {
    const reduced = useReducedMotion();

    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isFilled = String(value).trim().length > 0;

    const describedBy = error
        ? getErrorId(name)
        : description
            ? getHelperId(name)
            : undefined;

    const sharedProps = {
        id,
        name,
        type: Tag === "input" ? type || "text" : undefined,
        value,
        placeholder,
        required,
        disabled,
        autoComplete,
        maxLength,
        onChange,
        onBlur: (event) => {
            setIsFocused(false);
            onBlur?.(event);
        },
        onFocus: (event) => {
            setIsFocused(true);
            event.target.select?.();
        },
        className: cn(
            "w-full border-0 bg-transparent p-0 outline-none",
            "font-body text-[16px] leading-relaxed text-text-primary",
            "placeholder:text-text-tertiary caret-brand",
            "selection:bg-brand/20",
            Tag === "textarea" && "resize-y",
        ),
        style: Tag === "textarea"
            ? { minHeight: minHeight || "190px" }
            : undefined,
        "aria-invalid": error ? "true" : undefined,
        "aria-describedby": describedBy,
    };

    if (Tag === "textarea") {
        sharedProps.rows = rows;
    }

    return (
        <div
            className="relative w-full"
            aria-disabled={disabled}
        >
            <FieldLabel
                label={label}
                required={required}
                htmlFor={id}
                disabled={disabled}
            />

            <div
                className={cn(
                    "mt-2 rounded-[4px] bg-surface-1/30",
                    "transition-colors duration-200",
                    isHovered && !disabled && "bg-surface-1/45",
                    isFocused && !disabled && "bg-surface-1/60",
                    disabled && "pointer-events-none opacity-60",
                )}
                onMouseEnter={() => {
                    if (!disabled) {
                        setIsHovered(true);
                    }
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                }}
            >
                <div
                    className={cn(
                        "px-3 py-2.5",
                        Tag === "textarea" && "px-3 py-3",
                    )}
                >
                    <Tag
                        {...sharedProps}
                    />
                </div>

                <FieldRule
                    isHovered={isHovered}
                    isFocused={isFocused}
                    isFilled={isFilled}
                    error={error}
                    reduced={reduced}
                />
            </div>

            {error ? (
                <ErrorText
                    error={error}
                    name={name}
                    reduced={reduced}
                />
            ) : (
                <HelperText
                    helper={description}
                    name={name}
                />
            )}
        </div>
    );
};

export default ContactField;
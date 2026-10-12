"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";
import MotionDigit from "./MotionDigit";
import { MOTION_NUMBER_DEFAULTS } from "./motionNumber.constants";

function normalizeNumber(value) {
    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatNumber(value, minDigits) {
    return String(Math.trunc(value)).padStart(minDigits, "0");
}

export default function MotionNumber({
    value = 0,
    minDigits = MOTION_NUMBER_DEFAULTS.minDigits,
    prefix = "",
    suffix = "",
    className = "",
    digitClassName = "",
    duration = MOTION_NUMBER_DEFAULTS.duration,
    ariaLabel,
}) {
    const reduced = useReducedMotion();
    const previousValueRef = useRef(normalizeNumber(value));

    const numericValue = normalizeNumber(value);
    const previousValue = previousValueRef.current;

    const direction = numericValue >= previousValue ? 1 : -1;

    useEffect(() => {
        previousValueRef.current = numericValue;
    }, [numericValue]);

    const formattedValue = formatNumber(numericValue, minDigits);

    return (
        <span
            className={cn(
                "pointer-events-none inline-flex items-center font-mono tabular-nums",
                className,
            )}
            /*
             * The animated digits below are all aria-hidden, so this
             * counter exposes its value solely through aria-label. A bare
             * <span> may not carry aria-label (axe: aria-prohibited-attr),
             * so an explicit role is what makes the label legal and puts
             * the live value into the accessibility tree.
             */
            role="img"
            aria-label={ariaLabel || `${prefix}${numericValue}${suffix}`}
        >
            {prefix && (
                <span aria-hidden="true">
                    {prefix}
                </span>
            )}

            <span
                className="pointer-events-none inline-flex"
                aria-hidden="true"
            >
                {formattedValue.split("").map((digit, index) => (
                    <span
                        key={index}
                        className={cn(
                            "relative inline-block h-[1em] min-w-[0.62em] overflow-hidden",
                            digitClassName,
                        )}
                    >
                        <AnimatePresence
                            initial={false}
                            custom={direction}
                        >
                            <MotionDigit
                                key={`${index}-${digit}`}
                                digit={digit}
                                direction={direction}
                                reduced={reduced}
                                duration={duration}
                            />
                        </AnimatePresence>
                    </span>
                ))}
            </span>

            {suffix && (
                <span aria-hidden="true">
                    {suffix}
                </span>
            )}
        </span>
    );
}
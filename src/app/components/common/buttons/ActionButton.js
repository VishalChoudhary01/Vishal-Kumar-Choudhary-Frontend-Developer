"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";

import ActionButtonIcon from "./action_button_comp/ActionButtonIcon";
import ActionButtonSubmitting from "./action_button_comp/ActionButtonSubmitting";
import ActionButtonSuccess from "./action_button_comp/ActionButtonSuccess";

import {
    DEFAULT_ICON_ANIMATION,
    DEFAULT_LABEL_ANIMATION,
    DEFAULT_RIPPLE_ANIMATION,
} from "./action_button_comp/actionButton.constants";

/*
 * Glass action button — ProjectResumeButton's visual language (glass capsule
 * + traveling circular icon) combined with ActionButton's controlled
 * submission lifecycle (idle → submitting → success).
 *
 * The ripple layer was intentionally retired: the traveling circle is the
 * single hover/focus effect, and a foreground ripple conflicted with it.
 * `ripple`, `rippleClassName`, and `rippleAnimation` are still accepted for
 * API compatibility but no longer render anything.
 *
 * `labelAnimation` / `iconAnimation` are likewise still accepted; the
 * separate label-nudge and icon-pop layers they used to drive were superseded
 * by the circle travel, which is the signature motion of this design.
 */

const EASE = [0.22, 1, 0.36, 1];
const EDGE_OFFSET = 4;

export default function ActionButton({
    label = "Send Message",
    submittingLabel = "Sending…",
    successLabel = "Message sent ✓",

    status = "idle",
    disabled = false,
    type = "submit",

    icon = null,
    iconSize = 16,
    iconPosition = "right",
    iconClassName = "",

    labelAnimation = DEFAULT_LABEL_ANIMATION,
    iconAnimation = DEFAULT_ICON_ANIMATION,

    ripple = true,
    rippleClassName = "bg-foreground",
    rippleAnimation = DEFAULT_RIPPLE_ANIMATION,

    width = "md:w-[160px]",
    height = "h-[46px]",

    className = "",

    reduced: forceReduced = false,

    onClick,
    onPointerEnter,
    onPointerLeave,
}) {
    const buttonRef = useRef(null);
    const circleRef = useRef(null);

    const prefersReduced = useReducedMotion();
    const reduced = forceReduced || prefersReduced;

    const [travel, setTravel] = useState(0);

    const isSubmitting = status === "submitting";
    const isSuccess = status === "success";

    const buttonDisabled = disabled || isSubmitting;

    const currentLabel = isSuccess
        ? successLabel
        : isSubmitting
            ? submittingLabel
            : label;

    // The circle rests on the caller's icon side and travels to the opposite
    // edge on hover/focus (iconPosition "right" mirrors the default layout).
    const circleOnRight = iconPosition !== "left";

    // Calculate the circle's travel from the actual layout dimensions, so
    // label changes and resizes never make it overflow or stop short.
    useLayoutEffect(() => {
        const button = buttonRef.current;
        const circle = circleRef.current;

        if (!button || !circle) {
            return;
        }

        const updateTravel = () => {
            const nextTravel =
                button.offsetWidth -
                circle.offsetWidth -
                EDGE_OFFSET * 2;

            setTravel(Math.max(0, nextTravel));
        };

        updateTravel();

        const resizeObserver = new ResizeObserver(updateTravel);

        resizeObserver.observe(button);
        resizeObserver.observe(circle);

        window.addEventListener("resize", updateTravel);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateTravel);
        };
    }, []);

    // No travel while disabled (submitting) or under reduced motion.
    const activeX = reduced || buttonDisabled
        ? 0
        : (circleOnRight ? -travel : travel);

    const circleVariants = {
        rest: {
            x: 0,
            scale: 1,
        },
        hover: {
            x: activeX,
            scale: 1,
        },
        focus: {
            x: activeX,
            scale: 1,
        },
        tap: {
            x: activeX,
            scale: reduced ? 1 : 0.96,
            transition: {
                duration: 0.28,
                ease: EASE,
            },
        },
    };

    const buttonVariants = {
        rest: {
            scale: 1,
        },
        hover: {
            scale: 1,
        },
        focus: {
            scale: 1,
        },
        tap: reduced
            ? {
                scale: 1,
            }
            : {
                scale: 0.98,
                transition: {
                    duration: 0.28,
                    ease: EASE,
                },
            },
    };

    const handlePointerEnter = (event) => {
        if (buttonDisabled) {
            return;
        }

        onPointerEnter?.(event);
    };

    const handlePointerLeave = (event) => {
        if (buttonDisabled) {
            return;
        }

        onPointerLeave?.(event);
    };

    return (
        <motion.button
            ref={buttonRef}
            type={type}
            disabled={buttonDisabled}
            aria-busy={isSubmitting}
            onClick={onClick}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            variants={buttonVariants}
            whileHover={buttonDisabled ? undefined : "hover"}
            whileFocus="focus"
            whileTap={buttonDisabled ? undefined : "tap"}
            transition={{
                duration: 0.28,
                ease: EASE,
            }}
            className={cn(
                "group/action",
                "relative isolate inline-flex",
                "w-fit max-w-full",
                "items-center justify-center",
                "select-none overflow-hidden",
                "rounded-full",

                /*
                 * Asymmetric padding reserves the resting zone for the
                 * circle on its side, so the label centers in the remaining
                 * space and never sits under the circle (the capsule grows
                 * symmetrically for long labels via w-fit callers).
                 */
                circleOnRight
                    ? "pl-6 pr-12 sm:pl-8 sm:pr-14"
                    : "pl-12 pr-6 sm:pl-14 sm:pr-8",

                // Light mode.
                "border border-black/10",
                "bg-white/55",
                "shadow-[0_2px_10px_rgba(0,0,0,0.08)]",

                // Dark mode.
                "dark:border-white/15",
                "dark:bg-black/40",
                "dark:shadow-[0_2px_10px_rgba(0,0,0,0.18)]",

                // Glass.
                "backdrop-blur-xl",

                // Hover and active surface.
                "transition-[background-color,border-color,box-shadow]",
                "duration-300",
                "ease-out",
                "hover:border-black/15",
                "hover:bg-white/65",
                "active:border-black/20",
                "active:bg-white/70",
                "hover:shadow-[0_3px_12px_rgba(0,0,0,0.10)]",
                "dark:hover:border-white/20",
                "dark:hover:bg-black/48",
                "dark:active:border-white/25",
                "dark:active:bg-black/55",
                "dark:hover:shadow-[0_3px_12px_rgba(0,0,0,0.22)]",

                // Accessibility.
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-brand",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background",

                buttonDisabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer",

                width,
                height,
                className,
            )}
        >
            {/* Glass highlight */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/action:opacity-100 dark:bg-white/8"
            />

            {/* Top glass reflection */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/75 opacity-70 dark:bg-white/40"
            />

            {/* Label */}
            <span
                className={cn(
                    "relative z-10",
                    "flex items-center justify-center gap-2",
                    "whitespace-nowrap",
                    "text-center",
                    "font-normal leading-none tracking-[-0.35px]",
                    "text-text-primary",
                    "text-[14px] sm:text-[15px]",
                )}
            >
                {currentLabel}
            </span>

            {/* Moving circular action — hosts the state icon. */}
            <motion.span
                ref={circleRef}
                aria-hidden="true"
                variants={circleVariants}
                transition={{
                    duration: 0.42,
                    ease: EASE,
                }}
                className={cn(
                    "pointer-events-none",
                    "absolute top-1/2 z-20",
                    "-translate-y-1/2",
                    "flex shrink-0 items-center justify-center",
                    "rounded-full",

                    // Light mode.
                    "border border-black/10",
                    "bg-white/80",
                    "text-black",
                    "shadow-[0_1px_5px_rgba(0,0,0,0.08)]",

                    // Dark mode.
                    "dark:border-white/15",
                    "dark:bg-white/75",
                    "dark:text-black",
                    "dark:shadow-[0_1px_5px_rgba(0,0,0,0.18)]",

                    "backdrop-blur-md",

                    "size-9 sm:size-10",

                    circleOnRight ? "right-1" : "left-1",

                    iconClassName,
                )}
            >
                {isSubmitting ? (
                    <ActionButtonSubmitting reduced={reduced} />
                ) : isSuccess ? (
                    <ActionButtonSuccess reduced={reduced} />
                ) : (
                    <ActionButtonIcon
                        icon={icon}
                        size={iconSize}
                    />
                )}
            </motion.span>
        </motion.button>
    );
}

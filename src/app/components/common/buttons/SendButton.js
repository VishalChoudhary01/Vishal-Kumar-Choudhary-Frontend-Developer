"use client";

import { createElement, isValidElement, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
    useReducedMotion as useAppReducedMotion,
} from "@/app/components/motion/MotionProvider";

const EASE = [0.22, 1, 0.36, 1];

/* ============================================================================
   ICON
============================================================================ */

function renderIcon(icon, size) {
    if (!icon) return null;

    if (isValidElement(icon)) {
        return icon;
    }

    return createElement(icon, {
        size,
    });
}

/* ============================================================================
   SEND BUTTON
============================================================================ */

export default function SendButton({
    // =========================================================================
    // LABEL
    // =========================================================================

    label = "Send Message",

    submittingLabel = "Sending…",

    successLabel = "Message sent",

    // =========================================================================
    // STATUS
    // =========================================================================

    status = "idle",

    disabled = false,

    type = "submit",

    // =========================================================================
    // ICON
    // =========================================================================

    icon = null,

    iconSize = 18,

    /*
     * "left"
     * "right"
     */
    iconPosition = "right",

    iconClassName = "",

    // =========================================================================
    // ICON HOVER ANIMATION
    // =========================================================================

    /*
     * Default is designed for an up-right/send icon.
     *
     * The icon is INVISIBLE at rest.
     *
     * On hover:
     *     rises upward
     *     moves right
     *     scales slightly
     */

    iconAnimation = {
        from: {
            x: -4,
            y: 7,
            scale: 0.65,
            opacity: 0,
            rotate: -10,
        },

        to: {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            rotate: 0,
        },

        duration: 0.32,

        ease: EASE,
    },

    // =========================================================================
    // POINTER REVEAL
    // =========================================================================

    cover = true,

    coverClassName = "bg-foreground",

    coverAnimation = {
        duration: 0.55,
        opacityDuration: 0.28,
        ease: EASE,
    },

    // =========================================================================
    // SUCCESS ICON
    // =========================================================================

    successIcon = CheckIcon,

    // =========================================================================
    // SIZE
    // =========================================================================

    width =
    "w-[min(210px,calc(100vw-40px))]",

    height = "h-[50px]",

    // =========================================================================
    // STYLE
    // =========================================================================

    className = "",

    // =========================================================================
    // MOTION
    // =========================================================================

    reduced: forceReduced = false,

    // =========================================================================
    // EVENTS
    // =========================================================================

    onClick,

    onPointerEnter,

    onPointerLeave,
}) {
    const buttonRef = useRef(null);

    const prefersReduced = useReducedMotion();
    const appReduced = useAppReducedMotion();

    const reduced =
        forceReduced ||
        prefersReduced ||
        appReduced;

    const [hovered, setHovered] = useState(false);

    const [origin, setOrigin] = useState({
        x: 0,
        y: 0,
    });

    const [coverSize, setCoverSize] = useState(0);

    // =========================================================================
    // STATUS
    // =========================================================================

    const isSubmitting =
        status === "submitting";

    const isSuccess =
        status === "success";

    const buttonDisabled =
        disabled || isSubmitting;

    const currentLabel = isSuccess
        ? successLabel
        : isSubmitting
            ? submittingLabel
            : label;

    // =========================================================================
    // POINTER REVEAL
    // =========================================================================

    const calculateCover = (event) => {
        const button = buttonRef.current;

        if (!button) return;

        const rect = button.getBoundingClientRect();

        const x =
            event.clientX -
            rect.left;

        const y =
            event.clientY -
            rect.top;

        const distances = [
            Math.hypot(x, y),

            Math.hypot(
                rect.width - x,
                y,
            ),

            Math.hypot(
                x,
                rect.height - y,
            ),

            Math.hypot(
                rect.width - x,
                rect.height - y,
            ),
        ];

        const radius =
            Math.max(...distances);

        setOrigin({
            x,
            y,
        });

        setCoverSize(
            radius * 2,
        );
    };

    // =========================================================================
    // HOVER
    // =========================================================================

    const handlePointerEnter = (event) => {
        if (buttonDisabled) return;

        if (!reduced) {
            calculateCover(event);
            setHovered(true);
        }

        onPointerEnter?.(event);
    };

    const handlePointerLeave = (event) => {
        if (buttonDisabled) return;

        if (!reduced) {
            setHovered(false);
        }

        onPointerLeave?.(event);
    };

    // =========================================================================
    // ICON POSITION
    // =========================================================================

    const iconPositionClass =
        iconPosition === "left"
            ? "left-[18px]"
            : "right-[18px]";

    // =========================================================================
    // ICON
    // =========================================================================

    const iconFrom = reduced
        ? iconAnimation.to
        : iconAnimation.from;

    const iconTo = reduced
        ? iconAnimation.to
        : hovered
            ? iconAnimation.to
            : iconAnimation.from;

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <>
            {/* =================================================================
                LOADING DOTS
            ================================================================= */}

            <style>{`
                @keyframes send-button-dot-pulse {
                    0%, 80%, 100% {
                        transform: scale(0.6);
                        opacity: 0.3;
                    }

                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>

            <motion.button
                ref={buttonRef}
                type={type}
                disabled={buttonDisabled}
                aria-busy={isSubmitting}
                onClick={onClick}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                whileTap={
                    reduced ||
                        buttonDisabled
                        ? undefined
                        : {
                            scale: 0.985,
                        }
                }
                className={[
                    "group",
                    "relative",
                    "inline-flex",
                    height,
                    width,
                    "cursor-pointer",
                    "appearance-none",
                    "items-center",
                    "justify-center",
                    "overflow-hidden",
                    "rounded-full",
                    "border",
                    "border-transparent",
                    "bg-brand",
                    "p-0",
                    "font-body",
                    "text-brand-contrast",
                    "isolate",
                    "select-none",
                    "transition-[background-color,border-color]",
                    "duration-300",
                    "hover:bg-brand-hover",
                    "hover:border-brand-hover",
                    "focus-visible:outline",
                    "focus-visible:outline-2",
                    "focus-visible:outline-offset-[5px]",
                    "focus-visible:outline-brand",
                    buttonDisabled
                        ? "cursor-not-allowed opacity-60"
                        : "",
                    className,
                ].join(" ")}
            >
                {/* =============================================================
                    POINTER-ORIGIN COVER
                ============================================================= */}

                {cover && (
                    <motion.span
                        aria-hidden="true"
                        className={[
                            "pointer-events-none",
                            "absolute",
                            "z-10",
                            "rounded-full",
                            coverClassName,
                        ].join(" ")}
                        style={{
                            left: origin.x,
                            top: origin.y,
                            width: coverSize,
                            height: coverSize,
                            translateX: "-50%",
                            translateY: "-50%",
                        }}
                        initial={false}
                        animate={
                            reduced
                                ? {
                                    scale: 0,
                                    opacity: 0,
                                }
                                : {
                                    scale:
                                        hovered
                                            ? 1
                                            : 0,

                                    opacity:
                                        hovered
                                            ? 1
                                            : 0,
                                }
                        }
                        transition={{
                            scale: {
                                duration:
                                    coverAnimation.duration,
                                ease:
                                    coverAnimation.ease,
                            },

                            opacity: {
                                duration:
                                    coverAnimation.opacityDuration,
                                ease:
                                    coverAnimation.ease,
                            },
                        }}
                    />
                )}

                {/* =============================================================
                    CONTENT

                    The label is mathematically centered.
                    The icon is absolutely positioned so it never moves it.
                ============================================================= */}

                <span
                    className="
                        relative
                        z-20
                        flex
                        w-full
                        items-center
                        justify-center
                    "
                >
                    {/* =========================================================
                        LABEL
                    ========================================================= */}

                    <span
                        className="
                            whitespace-nowrap
                            text-[16px]
                            font-normal
                            leading-none
                            tracking-[-.4px]
                        "
                    >
                        {currentLabel}
                    </span>

                    {/* =========================================================
                        IDLE ICON
                    ========================================================= */}

                    {!isSubmitting &&
                        !isSuccess &&
                        icon &&
                        iconPosition !== "none" && (
                            <motion.span
                                aria-hidden="true"
                                className={[
                                    "pointer-events-none",
                                    "absolute",
                                    "z-30",
                                    iconPositionClass,
                                    "grid",
                                    "size-5",
                                    "place-items-center",
                                    iconClassName,
                                ].join(" ")}
                                initial={iconFrom}
                                animate={iconTo}
                                transition={{
                                    duration:
                                        iconAnimation.duration,
                                    ease:
                                        iconAnimation.ease,
                                }}
                            >
                                {renderIcon(
                                    icon,
                                    iconSize,
                                )}
                            </motion.span>
                        )}

                    {/* =========================================================
                        SUBMITTING
                    ========================================================= */}

                    {isSubmitting && (
                        <span
                            className="
                                absolute
                                z-30
                                inline-flex
                                items-center
                                gap-[3px]
                            "
                            aria-hidden="true"
                        >
                            <span
                                className="
                                    h-[3px]
                                    w-[3px]
                                    rounded-full
                                    bg-current
                                "
                                style={{
                                    animation:
                                        reduced
                                            ? "none"
                                            : "send-button-dot-pulse 1.1s ease-in-out infinite",
                                }}
                            />

                            <span
                                className="
                                    h-[3px]
                                    w-[3px]
                                    rounded-full
                                    bg-current
                                "
                                style={{
                                    animation:
                                        reduced
                                            ? "none"
                                            : "send-button-dot-pulse 1.1s ease-in-out 0.18s infinite",
                                }}
                            />

                            <span
                                className="
                                    h-[3px]
                                    w-[3px]
                                    rounded-full
                                    bg-current
                                "
                                style={{
                                    animation:
                                        reduced
                                            ? "none"
                                            : "send-button-dot-pulse 1.1s ease-in-out 0.36s infinite",
                                }}
                            />
                        </span>
                    )}

                    {/* =========================================================
                        SUCCESS
                    ========================================================= */}

                    {isSuccess && (
                        <motion.span
                            aria-hidden="true"
                            initial={
                                reduced
                                    ? false
                                    : {
                                        scale: 0.5,
                                        opacity: 0,
                                        rotate: -12,
                                    }
                            }
                            animate={{
                                scale: 1,
                                opacity: 1,
                                rotate: 0,
                            }}
                            transition={{
                                duration: 0.3,
                                ease: EASE,
                            }}
                            className="
                                absolute
                                z-30
                                grid
                                size-5
                                place-items-center
                                text-[var(--success)]
                            "
                        >
                            {renderIcon(
                                successIcon,
                                18,
                            )}
                        </motion.span>
                    )}
                </span>
            </motion.button>
        </>
    );
}

/* ============================================================================
   DEFAULT SUCCESS ICON
============================================================================ */

function CheckIcon() {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-full"
        >
            <polyline points="13.5 4.5 6.5 11.5 2.5 7.5" />
        </svg>
    );
}
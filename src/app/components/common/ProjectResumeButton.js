
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import useUiSound from "@/app/hooks/useUiSound";
import { cn } from "@/app/lib/utils";

const EASE = [0.22, 1, 0.36, 1];
const EDGE_OFFSET = 4;

const SIZES = {
    sm: {
        shell: `
            min-h-10
            min-w-[140px]
            pl-11
            pr-11
            sm:min-h-11
            sm:min-w-[150px]
            sm:pl-12
            sm:pr-12
            lg:min-h-12
            lg:min-w-[160px]
            lg:pl-14
            lg:pr-14
        `,
        label: "text-[0.68rem] sm:text-[0.72rem] lg:text-[0.76rem]",
        circle: "size-8 sm:size-9 lg:size-10",
        icon: 15,
    },

    default: {
        shell: `
            min-h-12
            min-w-[140px]
            pl-14
            pr-14
            sm:min-h-11
            sm:min-w-[158px]
            sm:pl-12
            sm:pr-12
            lg:min-h-12
            lg:min-w-[166px]
            lg:pl-14
            lg:pr-14
        `,
        label: "text-[0.78rem] sm:text-[0.72rem] lg:text-[0.76rem]",
        circle: "size-10 sm:size-9 lg:size-10",
        icon: 18,
    },

    nav: {
        shell: `
            w-full
            min-h-14
            pl-14
            pr-14
            sm:min-h-16
            sm:pl-15
            sm:pr-15
        `,
        label: "text-[0.85rem] font-semibold sm:text-[0.92rem]",
        circle: "size-11 sm:size-12",
        icon: 18,
    },
};

// Use motion.create() to avoid the deprecated motion(Component) API.
const MotionLink = motion.create(Link);

export default function ProjectResumeButton({
    href,
    label,
    external = false,
    icon: Icon = ArrowUpRight,
    iconSize,
    className,
    size = "default",
    variant = "default",
    disabled = false,
    ariaLabel,
    download = false,
}) {
    const reducedMotion = useReducedMotion();

    // Shared hover-tick sound.
    const { play: playHoverSound } = useUiSound(
        "/mp3/hover-tick.mp3",
        {
            volume: 0.2,
            interrupt: false,
        },
    );

    const linkRef = useRef(null);
    const circleRef = useRef(null);

    const [travel, setTravel] = useState(0);

    const tone =
        variant === "nav"
            ? SIZES.nav
            : SIZES[size] ?? SIZES.default;

    const leftIconSize = iconSize ?? tone.icon;

    // Calculate the circle's travel from the actual layout dimensions.
    useLayoutEffect(() => {
        const link = linkRef.current;
        const circle = circleRef.current;

        if (!link || !circle) {
            return;
        }

        const updateTravel = () => {
            const buttonWidth = link.offsetWidth;
            const circleWidth = circle.offsetWidth;

            const nextTravel =
                buttonWidth -
                circleWidth -
                EDGE_OFFSET * 2;

            setTravel(Math.max(0, nextTravel));
        };

        updateTravel();

        const resizeObserver = new ResizeObserver(updateTravel);

        resizeObserver.observe(link);
        resizeObserver.observe(circle);

        window.addEventListener("resize", updateTravel);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateTravel);
        };
    }, [label, size, variant]);

    // Keep the original invalid-action protection.
    if (!href || disabled) {
        return null;
    }

    // Circle movement respects the reduced-motion preference.
    const circleVariants = reducedMotion
        ? {
            rest: {
                x: 0,
                scale: 1,
            },
            hover: {
                x: 0,
                scale: 1,
            },
            focus: {
                x: 0,
                scale: 1,
            },
            tap: {
                x: 0,
                scale: 1,
            },
        }
        : {
            rest: {
                x: 0,
                scale: 1,
            },
            hover: {
                x: travel,
                scale: 1,
            },
            focus: {
                x: travel,
                scale: 1,
            },
            tap: {
                x: travel,
                scale: 0.96,
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
        tap: reducedMotion
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

    // Preserve the original button surface styling.
    const sharedClassName = cn(
        "group/action",
        "relative isolate inline-flex",
        "w-fit max-w-full",
        "items-center justify-center",
        "overflow-hidden",
        "rounded-full",

        // Light mode.
        "border border-black/10",
        "bg-white/55",
        "text-black",
        "shadow-[0_2px_10px_rgba(0,0,0,0.08)]",

        // Dark mode.
        "dark:border-white/15",
        "dark:bg-black/40",
        "dark:text-white",
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

        tone.shell,
    );

    const motionProps = {
        className: sharedClassName,
        variants: buttonVariants,
        whileHover: "hover",
        whileFocus: "focus",
        whileTap: "tap",

        // Play the sound once when the pointer enters the button.
        onMouseEnter: playHoverSound,

        transition: {
            duration: 0.28,
            ease: EASE,
        },
    };

    // Button content.
    const content = (
        <>
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
                    "whitespace-nowrap",
                    "leading-none",
                    "text-center",
                    "text-text-primary",
                    tone.label,
                )}
            >
                {label}
            </span>

            {/* Moving circular action */}
            <motion.span
                ref={circleRef}
                aria-hidden="true"
                variants={circleVariants}
                transition={{
                    duration: 0.42,
                    ease: EASE,
                }}
                className={cn(
                    "absolute",
                    "left-[3px]",
                    "top-1/2",
                    "-translate-y-1/2",
                    "z-20",
                    "flex",
                    "shrink-0",
                    "items-center",
                    "justify-center",
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

                    tone.circle,
                )}
            >
                <Icon
                    size={leftIconSize}
                    strokeWidth={1.8}
                />
            </motion.span>
        </>
    );

    return (
        <div
            className={cn(
                "inline-flex max-w-full",
                className,
            )}
        >
            {external ? (
                <motion.a
                    ref={linkRef}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={ariaLabel || label}
                    {...motionProps}
                >
                    {content}
                </motion.a>
            ) : download ? (
                <motion.a
                    ref={linkRef}
                    href={href}
                    download={typeof download === "string" ? download : true}
                    aria-label={ariaLabel || label}
                    {...motionProps}
                >
                    {content}
                </motion.a>
            ) : (
                <MotionLink
                    ref={linkRef}
                    href={href}
                    aria-label={ariaLabel || label}
                    {...motionProps}
                >
                    {content}
                </MotionLink>
            )}
        </div>
    );
}

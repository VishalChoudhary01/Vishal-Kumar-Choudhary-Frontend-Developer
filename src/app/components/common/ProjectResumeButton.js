"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import {
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";

const EASE = [0.22, 1, 0.36, 1];

/*
 * -------------------------------------------------------------
 * BUTTON GEOMETRY
 * -------------------------------------------------------------
 *
 * The circular action sits 4px from either edge.
 *
 * Rest:
 *
 * ┌──────────────────────────────┐
 * │  ↗          Resume           │
 * └──────────────────────────────┘
 *
 * Hover:
 *
 * ┌──────────────────────────────┐
 * │          Resume           ↗  │
 * └──────────────────────────────┘
 *
 * The travel distance is calculated from the actual
 * rendered button and circle dimensions.
 */

const EDGE_OFFSET = 4;

const SIZES = {
    sm: {
        shell: `
            min-h-10
            min-w-[148px]
            pl-14
            pr-12
        `,
        label: "text-[0.68rem] sm:text-[0.72rem]",
        circle: "size-8 sm:size-9",
        icon: 15,
    },

    default: {
        shell: `
            min-h-12
            min-w-[166px]
            pl-14
            pr-14
        `,
        label: "text-[0.72rem] sm:text-[0.76rem]",
        circle: "size-9 sm:size-10",
        icon: 17,
    },
};

const MotionLink = motion(Link);

export default function ProjectResumeButton({
    href,
    label,
    external = false,
    icon: Icon = ArrowUpRight,
    iconSize,
    className,
    size = "default",
    disabled = false,
    ariaLabel,
}) {
    const reducedMotion = useReducedMotion();

    const linkRef = useRef(null);
    const circleRef = useRef(null);

    const [travel, setTravel] = useState(0);

    /*
     * ---------------------------------------------------------
     * INVALID ACTION PROTECTION
     * ---------------------------------------------------------
     */

    if (!href || disabled) {
        return null;
    }

    const tone = SIZES[size] ?? SIZES.default;

    const leftIconSize =
        iconSize ?? tone.icon;

    /*
     * ---------------------------------------------------------
     * EXACT CIRCLE TRAVEL
     * ---------------------------------------------------------
     *
     * Circle starts:
     *
     *     4px from left
     *
     * Circle finishes:
     *
     *     4px from right
     *
     * Therefore:
     *
     * travel =
     *
     *     button width
     *     - circle width
     *     - left offset
     *     - right offset
     *
     * This prevents hard-coded values such as:
     *
     *     x: 108
     *     x: 130
     *
     * which would fail for labels with different widths.
     */

    useLayoutEffect(() => {
        const link = linkRef.current;
        const circle = circleRef.current;

        if (!link || !circle) {
            return;
        }

        const updateTravel = () => {
            const buttonWidth =
                link.getBoundingClientRect().width;

            const circleWidth =
                circle.getBoundingClientRect().width;

            const nextTravel =
                buttonWidth -
                circleWidth -
                EDGE_OFFSET * 2;

            setTravel(
                Math.max(0, nextTravel)
            );
        };

        updateTravel();

        /*
         * ResizeObserver keeps the calculation correct when:
         *
         * - viewport changes
         * - label changes
         * - font size changes
         * - responsive sizing changes
         * - circle size changes
         */

        const resizeObserver =
            new ResizeObserver(updateTravel);

        resizeObserver.observe(link);
        resizeObserver.observe(circle);

        window.addEventListener(
            "resize",
            updateTravel
        );

        return () => {
            resizeObserver.disconnect();

            window.removeEventListener(
                "resize",
                updateTravel
            );
        };
    }, [label, size]);

    /*
     * ---------------------------------------------------------
     * CIRCLE MOTION
     * ---------------------------------------------------------
     *
     * Reduced motion:
     *     circle remains stationary.
     *
     * Normal:
     *     circle moves from left edge to right edge.
     */

    const circleVariants = reducedMotion
        ? {
            rest: {
                x: 0,
            },

            hover: {
                x: 0,
            },
        }
        : {
            rest: {
                x: 0,
            },

            hover: {
                x: travel,
            },
        };

    /*
     * ---------------------------------------------------------
     * BUTTON SHELL
     * ---------------------------------------------------------
     */

    const sharedClassName = cn(
        "group/action",
        "relative isolate inline-flex",
        "w-fit max-w-full",
        "items-center justify-center",
        "overflow-hidden",
        "rounded-full",

        /*
         * -----------------------------------------------------
         * LIGHT MODE
         * -----------------------------------------------------
         */

        "border border-black/10",
        "bg-white/55",
        "text-black",

        /*
         * Subtle shadow only.
         */
        "shadow-[0_2px_10px_rgba(0,0,0,0.08)]",

        /*
         * -----------------------------------------------------
         * DARK MODE
         * -----------------------------------------------------
         */

        "dark:border-white/15",
        "dark:bg-black/40",
        "dark:text-white",

        /*
         * Subtle dark-mode shadow.
         */
        "dark:shadow-[0_2px_10px_rgba(0,0,0,0.18)]",

        /*
         * -----------------------------------------------------
         * GLASS
         * -----------------------------------------------------
         */

        "backdrop-blur-xl",

        /*
         * -----------------------------------------------------
         * HOVER
         * -----------------------------------------------------
         */

        "transition-[background-color,border-color,box-shadow]",
        "duration-300",
        "ease-out",

        "hover:border-black/15",
        "hover:bg-white/65",

        /*
         * Keep hover shadow very subtle.
         */
        "hover:shadow-[0_3px_12px_rgba(0,0,0,0.10)]",

        "dark:hover:border-white/20",
        "dark:hover:bg-black/48",
        "dark:hover:shadow-[0_3px_12px_rgba(0,0,0,0.22)]",

        /*
         * -----------------------------------------------------
         * ACCESSIBILITY
         * -----------------------------------------------------
         */

        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-brand",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",

        tone.shell
    );

    const motionProps = {
        className: sharedClassName,
        whileHover: "hover",
        whileFocus: "hover",
    };

    /*
     * ---------------------------------------------------------
     * BUTTON CONTENT
     * ---------------------------------------------------------
     */

    const content = (
        <>
            {/* =================================================
                GLASS HIGHLIGHT
            ================================================= */}

            <span
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-white/20
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover/action:opacity-100

                    dark:bg-white/8
                "
            />

            {/* =================================================
                TOP GLASS REFLECTION
            ================================================= */}

            <span
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-x-5
                    top-0
                    h-px
                    bg-white/75
                    opacity-70

                    dark:bg-white/40
                "
            />

            {/* =================================================
                LABEL
            =================================================
            
            The horizontal padding reserves space for the
            circular action so the moving circle never covers
            the text.
            */}

            <span
                className={cn(
                    "relative z-10",
                    "whitespace-nowrap",
                    "leading-none",
                    "text-center",
                    "text-text-primary",
                    tone.label
                )}
            >
                {label}
            </span>

            {/* =================================================
                CIRCULAR ACTION
            =================================================
            
            Initial:
                4px from left edge.

            Hover:
                4px from right edge.
            */}

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
                    "left-[4px]",
                    "top-1/2",
                    "-translate-y-1/2",

                    "z-20",

                    "flex",
                    "shrink-0",
                    "items-center",
                    "justify-center",

                    "rounded-full",

                    /*
                     * -------------------------------------------------
                     * LIGHT MODE
                     * -------------------------------------------------
                     */

                    "border border-black/10",
                    "bg-white/80",
                    "text-black",

                    /*
                     * Very subtle circle shadow.
                     */
                    "shadow-[0_1px_5px_rgba(0,0,0,0.08)]",

                    /*
                     * -------------------------------------------------
                     * DARK MODE
                     * -------------------------------------------------
                     */

                    "dark:border-white/15",
                    "dark:bg-white/75",
                    "dark:text-black",

                    /*
                     * Very subtle dark circle shadow.
                     */
                    "dark:shadow-[0_1px_5px_rgba(0,0,0,0.18)]",

                    "backdrop-blur-md",

                    tone.circle
                )}
            >
                <Icon
                    size={leftIconSize}
                    strokeWidth={1.8}
                />
            </motion.span>
        </>
    );

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     *
     * href is passed through unchanged.
     *
     * Supported examples:
     *
     *     "#projects"
     *     "/projects/system-canvas"
     *     "https://github.com/..."
     *     "https://figma.com/..."
     */

    return (
        <div
            className={cn(
                "inline-flex max-w-full",
                className
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
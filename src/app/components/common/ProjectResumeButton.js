"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react"

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";

const EASE = [0.22, 1, 0.36, 1];

/*
 * -------------------------------------------------------------
 * BUTTON GEOMETRY
 * -------------------------------------------------------------
 *
 * The circular action sits 4px from either edge of the button's
 * OUTER border box. The shell carries a 1px border, and absolute
 * positioning resolves against the padding box, so the CSS offset
 * is 3px + 1px border = 4px visual.
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

/*
 * -------------------------------------------------------------
 * RESPONSIVE SIZE SYSTEM
 * -------------------------------------------------------------
 *
 * One component, three breakpoints — never a scaled-down copy
 * of the desktop button.
 *
 *   mobile   (< 640px)  height 40  circle 32  label 0.68rem
 *   tablet   (640-1023) height 44  circle 36  label 0.72rem
 *   desktop  (1024+)    height 48  circle 40  label 0.76rem
 *
 * Horizontal padding always keeps a safe gap between the
 * travelling circle and the label:
 *
 *   circle right edge at rest = EDGE_OFFSET + circle
 *   label starts at pl        >= circle right edge + gap
 */

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

    /*
     * -------------------------------------------------------------
     * NAV VARIANT (variant="nav")
     * -------------------------------------------------------------
     *
     * A deliberate, larger CTA for the mobile navigation menu only.
     * It does NOT change the default / sm sizing used by the hero,
     * project cards, project detail or navbar.
     *
     *   mobile  (< 640px)  height 56  circle 44  label 0.85rem semibold
     *   tablet  (640+)     height 64  circle 48  label 0.92rem semibold
     *
     * `w-full` lives ONLY here — the caller constrains the outer
     * wrapper (e.g. w-full max-w-sm mx-auto) so the button fills
     * the menu width without touching the screen edges.
     */

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

/* motion.create() — supported API for the installed Motion version.
   motion(Component) emits the "motion() is deprecated" console warning. */
const MotionLink = motion.create(Link);

export default function ProjectResumeButton({
    href,
    label,
    external = false,
    icon: Icon = ArrowUpRight,
    iconSize,
    className,
    size = "default",
    /*
     * Contextual variant.
     *
     *   "default" — every portfolio CTA (hero, cards, detail, navbar)
     *   "nav"     — the larger mobile-navigation Resume CTA only
     *
     * Never inferred from the label; callers opt in explicitly.
     */
    variant = "default",
    disabled = false,
    ariaLabel,
    /*
     * Direct file download (e.g. the resume PDF).
     * Renders a native anchor with the `download` attribute
     * instead of a Next.js navigation.
     */
    download = false,
}) {
    const reducedMotion = useReducedMotion();

    const linkRef = useRef(null);
    const circleRef = useRef(null);

    const [travel, setTravel] = useState(0);

    /*
     * ---------------------------------------------------------
     * INVALID ACTION PROTECTION
     * ---------------------------------------------------------
     *
     * The guard itself lives AFTER useLayoutEffect (see below),
     * so every hook always runs in the same order even when
     * href/disabled toggle between renders.
     */

    const tone =
        variant === "nav"
            ? SIZES.nav
            : SIZES[size] ?? SIZES.default;

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
            /*
             * offsetWidth, NOT getBoundingClientRect().width.
             *
             * The button can sit inside scaled ancestors (the
             * project card's 0.94 entrance and the media's
             * scroll-linked 0.82 → 1 grow-in), and a rect width
             * includes those transforms. Measuring it made the
             * travel short — the circle stopped on top of the
             * label instead of at the right edge. offsetWidth is
             * the untransformed layout size, so the travel is
             * correct regardless of where the card is on screen.
             */
            const buttonWidth = link.offsetWidth;

            const circleWidth = circle.offsetWidth;

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
    }, [label, size, variant]);

    if (!href || disabled) {
        return null;
    }

    /*
     * ---------------------------------------------------------
     * CIRCLE MOTION
     * ---------------------------------------------------------
     *
     * States:
     *
     *   rest   → circle left
     *   hover  → circle right   (desktop pointer, 0.42s)
     *   focus  → circle right   (keyboard focus)
     *   tap    → circle right   (touch / press, 0.28s)
     *
     * Reduced motion:
     *     circle remains stationary, no press scaling.
     *
     * Normal:
     *     circle moves from left edge to right edge.
     */

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

            /*
             * TAP / PRESS
             *
             * Touch devices have no reliable hover, so the press
             * state travels the full distance (quick tactile
             * confirmation) and compresses the circle slightly.
             */

            tap: {
                x: travel,
                scale: 0.96,
                transition: {
                    duration: 0.28,
                    ease: EASE,
                },
            },
        };

    /*
     * ---------------------------------------------------------
     * BUTTON SURFACE PRESS
     * ---------------------------------------------------------
     *
     * The shell only ever compresses very slightly on press.
     * It never stays active after navigation — these are
     * actions, not navigation tabs.
     */

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
         * Subtle press surface — slightly stronger border and
         * background while the finger/button is held down.
         * No glow, no large shadow.
         */
        "active:border-black/20",
        "active:bg-white/70",

        /*
         * Keep hover shadow very subtle.
         */
        "hover:shadow-[0_3px_12px_rgba(0,0,0,0.10)]",

        "dark:hover:border-white/20",
        "dark:hover:bg-black/48",

        "dark:active:border-white/25",
        "dark:active:bg-black/55",
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
        variants: buttonVariants,
        whileHover: "hover",
        whileFocus: "focus",
        whileTap: "tap",
        transition: {
            duration: 0.28,
            ease: EASE,
        },
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
                className="pointer-events-none absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover/action:opacity-100 dark:bg-white/8"
            />

            {/* =================================================
                TOP GLASS REFLECTION
            ================================================= */}

            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/75 opacity-70 dark:bg-white/40"
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
                4px from left edge (3px + 1px border).

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
                    "left-[3px]",
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